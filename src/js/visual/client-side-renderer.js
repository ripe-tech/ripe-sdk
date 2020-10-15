if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @classdesc Class that defines the client sider renderer that supports
 * the ConfiguratorCSR class. Stores and executes all logic for the
 * rendering, including loading meshes and materials, as well as setting
 * up the scene to be used.
 *
 * @param {Object} owner The owner (customizer instance) for
 * this configurator.
 * @param {Object} element The DOM element in which the renderer will
 * render to.
 * @param {Object} options The options to be used to configure the
 * renderer instance to be created.
 */
ripe.CSRenderer = function (owner, element, options) {
    this.owner = owner;
    this.type = this.type || "CSRenderer";
    this.element = element;
    this.updateElementBoundingBox();

    this.library = options.library;
    this.cameraTarget = new this.library.Vector3(
        options.cameraTarget.x,
        options.cameraTarget.y,
        options.cameraTarget.z
    );
    this.cameraFOV = options.cameraFOV;
    this.easing = options.easing || "easeInOutQuad";
    this.materialEasing = options.materialEasing || this.easing;
    this.crossfadeEasing = options.crossfadeEasing || this.easing;
    this.highlightEasing = options.highlightEasing || this.easing;
    this.partsMap = options.partsMap || {};

    this.shadowBias = options.shadowBias || 0.01;

    // Initial distance to set camera position
    this.initialDistance = options.cameraDistance;

    // raycast
    this.intersectedPart = "";
    this.raycastingMeshes = [];

    this.cameraHeight = options.cameraHeight || 0;
    this.exposure = options.exposure || 3.0;

    this.maskOpacity = options.maskOpacity || 0.4;
    this.maskDuration = options.maskDuration || 150;
    this.noMasks = options.noMasks === undefined ? true : options.noMasks;
    this.useMasks = options.useMasks === undefined ? true : options.useMasks;

    this.environment = options.environment;

    // animations
    this.introAnimation = options.introAnimation;

    this.usesPostProcessing =
        options.usesPostProcessing === undefined ? true : options.usesPostProcessing;

    this.debug = options.debug || false;

    this.canZoom = options.canZoom === undefined ? true : options.canZoom;

    // coordinates for raycaster requires the exact positioning
    // of the element in the window, needs to be updated on
    // every resize
    window.onresize = () => {
        this.updateSize();
    };

    this.previousRotation = new this.library.Vector2(0, 0);
    this.guiLibrary = options.dat === undefined ? null : options.dat;
};

ripe.CSRenderer.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRenderer.prototype.constructor = ripe.CSRenderer;

ripe.CSRenderer.prototype.updateOptions = async function (options) {
    this.assetManager.updateOptions(options);

    this.introAnimation =
        options.introAnimation === undefined ? this.introAnimation : options.introAnimation;

    this.width = options.width === undefined ? this.width : options.width;

    this.element = options.element === undefined ? this.element : options.element;
    this.library = options.library === undefined ? this.library : options.library;
    this.cameraTarget =
        options.cameraTarget === undefined
            ? this.cameraTarget
            : new this.library.Vector3(
                options.cameraTarget.x,
                options.cameraTarget.y,
                options.cameraTarget.z
            );
    this.cameraFOV = options.cameraFOV === undefined ? this.cameraFOV : options.cameraFOV;

    this.materialEasing = options.materialEasing || this.easing || "linear";
    this.crossfadeEasing = options.crossfadeEasing || this.easing || "linear";
    this.highlightEasing = options.highlightEasing || this.easing || "linear";

    this.cameraHeight =
        options.cameraHeight === undefined ? this.cameraHeight : options.cameraHeight;
    this.exposure = options.exposure === undefined ? this.exposure : options.exposure;
    this.usesPostProcessing =
        options.usesPostProcessing === undefined ? this.usesPostProcessing : options.usesPostProcessing;

    this.useMasks = options.useMasks === undefined ? this.useMasks : options.useMasks;
    this.maskOpacity = options.maskOpacity === undefined ? this.maskOpacity : options.maskOpacity;
    this.maskDuration =
        options.maskDuration === undefined ? this.maskDuration : options.maskDuration;
    this.noMasks = options.noMasks === undefined ? this.noMasks : this.options.noMasks;
};

ripe.CSRenderer.prototype.initialize = function (assetManager) {
    this.assetManager = assetManager;
    this.scene = new this.library.Scene();
    this.raycaster = new this.library.Raycaster();

    // initialize all ThreeJS components
    this._initializeLights();
    this._initializeCamera();
    this._initializeRenderer();
    this._registerHandlers();
    this._initializeShaders();
    this._loadAssets();

    if (this.usesPostProcessing) this._setupPostProcessing();

    if (this.debug) this.createGUI();
};

ripe.CSRenderer.prototype._registerHandlers = function () {
    const self = this;
    const area = this.element.querySelector(".area");

    area.addEventListener("mousemove", function (event) {
        event = ripe.fixEvent(event);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed

        if (self.down === true) {
            self.lowlight();
            return;
        }

        self._attemptRaycast(event, "move");
    });

    area.addEventListener("click", function (event) {
        event = ripe.fixEvent(event);

        if (!self.element.classList.contains("drag")) self._attemptRaycast(event, "click");
    });
};

ripe.CSRenderer.prototype.disposeResources = async function () {
    console.log("Disposing Renderer resources.");
    this.renderer.renderLists.dispose();
    if (this.composer) this.composer.renderlists.dispose();
    this.renderer.dispose();
    this.renderer = null;

    for (let i = 0; i < this.raycastingMeshes.length; i++) {
        await this.assetManager.disposeMesh(this.raycastingMeshes[i]);
    }

    await this.assetManager.disposeScene(this.scene);
    console.log("Finished Disposing Renderer Resources.");
};

ripe.CSRenderer.prototype._loadAssets = async function () {
    for (var mesh in this.assetManager.meshes) {
        this.raycastingMeshes.push(this.assetManager.meshes[mesh]);
    }

    this.scene.add(this.assetManager.loadedGltf.scene);

    this.mixer = new this.library.AnimationMixer(this.assetManager.loadedGltf.scene);
    this.animations = this.assetManager.loadedGltf.animations;

    if (this.environment) await this.assetManager.setupEnvironment(this.scene, this.renderer);

    this.render();

    if (this.introAnimation) this._performAnimation(this.introAnimation);
    else if (this.animations.length > 0) this._performAnimation("Idle");
};

ripe.CSRenderer.prototype._initializeShaders = function () {
    this.crossfadeShader = new this.library.ShaderMaterial({
        uniforms: {
            tDiffuse1: {
                type: "t",
                value: null
            },
            tDiffuse2: {
                type: "t",
                value: null
            },
            mixRatio: {
                type: "f",
                value: 0.0
            }
        },
        vertexShader: [
            "varying vec2 vUv;",

            "void main() {",

            "     vUv = vec2( uv.x, uv.y );",
            "     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"
        ].join("\n"),
        fragmentShader: [
            "uniform float mixRatio;",

            "uniform sampler2D tDiffuse1;",
            "uniform sampler2D tDiffuse2;",

            "varying vec2 vUv;",

            "void main() {",

            "    vec4 texel1 = texture2D( tDiffuse1, vUv );",
            "    vec4 texel2 = texture2D( tDiffuse2, vUv );",

            "    gl_FragColor = mix( texel1, texel2, mixRatio );",

            "}"
        ].join("\n")
    });
};

ripe.CSRenderer.prototype._initializeLights = function () {
    const ambientLight = new this.library.HemisphereLight(0xffeeb1, 0x080820, 0.0);
    // hemilight.castShadow = true;

    var mult = this.initialDistance;

    const keyLight = new this.library.PointLight(0xffffff, 2.2, 9 * mult);
    keyLight.position.set(1 * mult, 1 * mult, 1 * mult);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.000001;
    keyLight.shadow.camera.far = 200;
    keyLight.shadow.radius = 2;
    keyLight.shadow.bias = this.shadowBias;

    const fillLight = new this.library.PointLight(0xffffff, 1.1, 9 * mult);
    fillLight.position.set(-1 * mult, 0.5 * mult, 1 * mult);
    fillLight.castShadow = true;
    fillLight.shadow.camera.near = 0.000001;
    fillLight.shadow.camera.far = 200;
    fillLight.shadow.radius = 2;
    fillLight.shadow.bias = this.shadowBias;

    const rimLight = new this.library.PointLight(0xffffff, 3.1, 9 * mult);
    rimLight.position.set(-0.5 * mult, 0.75 * mult, -1.5 * mult);
    rimLight.castShadow = true;
    rimLight.shadow.camera.near = 0.000001;
    rimLight.shadow.camera.far = 200;
    rimLight.shadow.radius = 2;
    rimLight.shadow.bias = this.shadowBias;

    this.scene.add(ambientLight);

    this.scene.add(keyLight);
    this.scene.add(fillLight);
    this.scene.add(rimLight);
};

ripe.CSRenderer.prototype._initializeRenderer = function () {
    // creates the renderer using the "default" WebGL approach
    // notice that the shadow map is enabled
    this.renderer = new this.library.WebGLRenderer({ antialias: true, alpha: true });
    
    this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);

    this.renderer.toneMappingExposure = this.exposure;
    this.renderer.toneMapping = this.library.CineonToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.library.PCFSoftShadowMap;

    const area = this.element.querySelector(".area");
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(0xffffff);

    area.appendChild(this.renderer.domElement);

    this.composer = new this.library.EffectComposer(this.renderer);

    var renderPass = new this.library.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
};

ripe.CSRenderer.prototype.createGUI = function () {
    if (this.guiLibrary === null) return;

    this.gui = new this.guiLibrary.GUI({ autoPlace: false });
    const area = this.element.querySelector(".area");

    area.appendChild(this.gui.domElement);

    this.gui.domElement.id = "gui";

    const folder = this.gui.addFolder("Render Settings");
    folder.add(this, "exposure", 0.0, 4.0).name("Exposure").onChange(this.render);
    folder.add(this, "shadowBias", -1.0, 1.0).name("Shadow Bias").onChange(this.render);
    folder.open();

    if (this.usesPostProcessing) {
        const updateSAO = (param, value) => {
            this.saoPass[param] = value;
            this.render();
        };

        const folderSAO = this.gui.addFolder("Scalable Ambient Occlusion Pass");
        folderSAO
            .add(this.saoPass.params, "saoIntensity", 0.0, 1.0)
            .name("Intensity")
            .onChange(function (value) {
                updateSAO("saoIntensity", value);
            });
        folderSAO
            .add(this.saoPass.params, "saoScale", 0.0, 10.0)
            .name("Scale")
            .onChange(function (value) {
                updateSAO("saoScale", value);
            });
        folderSAO
            .add(this.saoPass.params, "saoKernelRadius", 0.0, 100.0)
            .name("KernelRadius")
            .onChange(function (value) {
                updateSAO("saoKernelRadius", value);
            });
        folderSAO
            .add(this.saoPass.params, "saoBlur")
            .name("Blur")
            .onChange(function (value) {
                updateSAO("saoBlur", value);
            });
        folderSAO
            .add(this.saoPass.params, "saoBlurRadius", 0.0, 200.0)
            .name("Blur Radius")
            .onChange(function (value) {
                updateSAO("saoIntensity", value);
            });
        folderSAO
            .add(this.saoPass.params, "saoBlurStdDev", 0.0, 150.0)
            .name("Blur StdDev")
            .onChange(function (value) {
                updateSAO("saoBlurStdDev", value);
            });

        folderSAO.open();

        const updateSSAO = (param, value) => {
            this.ssaoPass[param] = value;
            this.render();
        };

        const folderSSAO = this.gui.addFolder("Screen Space Ambient Occlusion Pass");

        folderSSAO
            .add(this.ssaoPass, "kernelRadius", 0.0, 32.0)
            .name("Kernel Radius")
            .onChange(function (value) {
                updateSSAO("kernelRadius", value);
            });
        folderSSAO
            .add(this.ssaoPass, "minDistance", 0.001, 0.02)
            .name("Min Distance")
            .onChange(function (value) {
                updateSSAO("minDistance", value);
            });
        folderSSAO
            .add(this.ssaoPass, "maxDistance", 0.01, 0.3)
            .name("Max Distance")
            .onChange(function (value) {
                updateSSAO("maxDistance", value);
            });

        folderSSAO.open();

        const updateBloom = (param, value) => {
            this.bloomPass[param] = value;
            this.render();
        };

        const folderBloom = this.gui.addFolder("Bloom Pass");

        folderBloom
            .add(this.bloomPass, "threshold", 0.0, 1.0)
            .name("Threshold")
            .onChange(function (value) {
                updateBloom("threshold", value);
            });
        folderBloom
            .add(this.bloomPass, "strength", 0.0, 3.0)
            .name("Strength")
            .onChange(function (value) {
                updateBloom("strength", value);
            });

        folderBloom.open();
    }
};

ripe.CSRenderer.prototype._setupPostProcessing = function () {
    this.saoPass = new this.library.SAOPass(this.scene, this.camera, true, true);

    this.saoPass.resolution.set(1024, 1024);
    this.saoPass.params.saoBias = 0.01;
    this.saoPass.params.saoIntensity = 1;
    this.saoPass.params.saoScale = 5;
    this.saoPass.params.saoKernelRadius = 20;
    this.saoPass.params.saoMinResolution = 0;

    this.composer.addPass(this.saoPass);

    this.bloomPass = new this.library.UnrealBloomPass(1, 25, 4, 256);
    this.composer.addPass(this.bloomPass);

    this.ssaoPass = new this.library.SSAOPass(this.scene, this.camera, 620, 620);
    this.ssaoPass.kernelRadius = 32;
    this.ssaoPass.renderToScreen = true;

    this.composer.addPass(this.ssaoPass);
};

ripe.CSRenderer.prototype._initializeCamera = function () {
    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;

    this.camera = new this.library.PerspectiveCamera(this.cameraFOV, width / height, 1, 20000);
    this.camera.position.set(0, this.cameraHeight, this.initialDistance);
    this.camera.far = 500;

    if (this.element.dataset.view === "side") {
        this._currentVerticalRot = 0;
        this.verticalRot = 0;
    } else if (this.element.dataset.view === "top") {
        this._currentVerticalRot = Math.PI / 2;
        this.verticalRot = Math.PI / 2;
    }

    this.camera.lookAt(this.cameraTarget);
};

ripe.CSRenderer.prototype._performAnimation = function (animationName) {
    var animation = this.library.AnimationClip.findByName(this.animations, animationName);
    if (!animation) return;

    var action;
    this.animations.forEach(clip => {
        if (clip.name === animationName) {
            action = this.mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = this.library.LoopOnce;
        }
    });

    var previousTime = 0;

    const doAnimation = time => {
        previousTime = previousTime === 0 ? time : previousTime;

        const dt = (time - previousTime) / 1000;
        this.mixer && this.mixer.update(dt);

        this.mixer.update(dt);

        previousTime = time;

        this.render();

        if (!action.paused) requestAnimationFrame(doAnimation);
    };

    action.play();
    requestAnimationFrame(doAnimation);
};

ripe.CSRenderer.prototype.updateInitials = function (operation, meshes) {
    for (let i = 0; i < meshes.length; i++) {
        if (operation === "remove") {
            this.scene.remove(meshes[i]);
            meshes[i].geometry.dispose();

            if (meshes[i].material) meshes[i].material.dispose();
        }

        if (operation === "add") {
            this.scene.add(meshes[i]);
        }
    }
};

ripe.CSRenderer.prototype.render = function (useRenderer = false, camera = undefined) {
    // console.log("Rendering!")
    const cam = camera === undefined ? this.camera : camera;
    
    if (useRenderer)
        this.renderer.render(this.scene, cam);
    else
        this.composer.render(this.renderer, this.scene, cam) 
};

ripe.CSRenderer.prototype.updateSize = function () {
    if (this.renderer) this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
    if (this.composer) this.composer.setSize(this.element.clientWidth, this.element.clientHeight);

    this.updateElementBoundingBox();
};

ripe.CSRenderer.prototype._attemptRaycast = function (mouseEvent) {
    const animating = this.element.classList.contains("animating");
    const dragging = this.element.classList.contains("drag");

    if (!this.elementBoundingBox || animating || dragging) return;

    const mouse = this._getNormalizedCoordinatesRaycast(mouseEvent);

    if (this.raycaster && this.scene && this.assetManager) {
        this.raycaster.setFromCamera(mouse, this.camera);

        var intersects = this.raycaster.intersectObjects(this.raycastingMeshes);

        if (intersects.length > 0) {
            if (this.intersectedPart !== intersects[0].object.name) {
                this.lowlight();

                this.intersectedPart = intersects[0].object.name;
                this.highlight(this.intersectedPart);
            }
        } else {
            this.lowlight();
        }
    }
};

ripe.CSRenderer.prototype.highlight = function (part, options = {}) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    this.changeHighlight(part, 1 - this.maskOpacity);

    // triggers an event indicating that a highlight operation has been
    // performed on the current configurator
    this.trigger("highlighted");
};

ripe.CSRenderer.prototype.lowlight = function (options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // There's no intersection
    if (this.intersectedPart === "") {
        return;
    }

    this.changeHighlight(this.intersectedPart, 1.0);

    this.intersectedPart = "";

    // triggers an event indicating that a lowlight operation has been
    // performed on the current configurator
    this.trigger("lowlighted");
};

ripe.CSRenderer.prototype.changeHighlight = function (part, endValue) {
    // console.log("Changing highlight of " + part + " from " + startingValue + " to " + endValue + " in " + duration);

    var meshTarget = this.assetManager.meshes[part];
    var startingValue = meshTarget.material.color.r;

    if (!meshTarget) return;

    var currentValue = startingValue;
    var pos = 0;

    var startTime = 0;
    const changeHighlightTransition = time => {
        startTime = startTime === 0 ? time : startTime;

        meshTarget.material.color.r = currentValue;
        meshTarget.material.color.g = currentValue;
        meshTarget.material.color.b = currentValue;

        pos = (time - startTime) / this.maskDuration;
        currentValue = ripe.easing[this.highlightEasing](pos, startingValue, endValue);

        this.render();

        if (pos < 1) requestAnimationFrame(changeHighlightTransition);
    };

    requestAnimationFrame(changeHighlightTransition);
};

ripe.CSRenderer.prototype._getNormalizedCoordinatesRaycast = function (mouseEvent) {
    // Origin of the coordinate system is the center of the element
    // Coordinates range from -1,-1 (bottom left) to 1,1 (top right)
    const newX =
        ((mouseEvent.x - this.elementBoundingBox.x) / this.elementBoundingBox.width) * 2 - 1;
    const newY =
        -(
            (mouseEvent.y - this.elementBoundingBox.y + window.scrollY) /
            this.elementBoundingBox.height
        ) *
        2 +
        1;

    return {
        x: newX,
        y: newY
    };
};

ripe.CSRenderer.prototype.updateElementBoundingBox = function () {
    // Raycaster needs accurate positions of the element, needs to be
    // updated on every window resize event
    if (this.element) {
        this.elementBoundingBox = this.element.getBoundingClientRect();
    }
};

ripe.CSRenderer.prototype.crossfade = async function (options = {}, type) {
    var renderTargetParameters = {
        minFilter: this.library.LinearFilter,
        magFilter: this.library.LinearFilter,
        format: this.library.RGBFormat
    };

    var width = this.elementBoundingBox.width;
    var height = this.elementBoundingBox.height;

    var transitionCamera = new this.library.OrthographicCamera(
        -width / 2,
        width / 2,
        height / 2,
        -height / 2,
        -100,
        100
    );

    var previousSceneFBO = new this.library.WebGLRenderTarget(
        width,
        height,
        renderTargetParameters
    );
    var currentSceneFBO = new this.library.WebGLRenderTarget(width, height, renderTargetParameters);

    /*
    if (this.usesPostProcessing) {
        console.log(this.renderer)
        console.log(this.composer)
    }
    */

    this.composer.renderTarget1 = previousSceneFBO;
    this.composer.renderTarget2 = currentSceneFBO;

    var mixRatio = 0.0;

    this.crossfadeShader.uniforms.tDiffuse1.value = previousSceneFBO.texture;
    this.crossfadeShader.uniforms.tDiffuse2.value = currentSceneFBO.texture;
    this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

    var quadGeometry = new this.library.PlaneBufferGeometry(width, height);
    var quad = new this.library.Mesh(quadGeometry, this.crossfadeShader);
    quad.position.z = 1;
    this.scene.add(quad);

    // Store current image
    this.renderer.setRenderTarget(previousSceneFBO);
    this.renderer.clear();
    //this.composer.render(this.renderer, previousSceneFBO)
    this.render(true);


    var parts = options.parts === undefined ? this.owner.parts : options.parts;

    if (type === "material") {
        await this.assetManager.setMaterials(parts);
    } else if (type === "rotation") {
        this.rotate(options);
    }    
    // Render next image
    this.renderer.setRenderTarget(currentSceneFBO);
    this.renderer.clear();
    //this.composer.render(this.renderer, currentSceneFBO)
    this.render(true);


    // Reset renderer
    this.renderer.setRenderTarget(null);
    this.renderer.clear();

    var pos = 0;
    var duration = options.duration || 500;

    var startTime = 0;
    const crossfadeFunction = time => {
        startTime = startTime === 0 ? time : startTime;
        this.render(true, transitionCamera);

        pos = (time - startTime) / duration;
        mixRatio = ripe.easing[this.crossfadeEasing](pos, 0.0, 1.0);

        // mixRatio += 1.0 / duration;
        this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

        if (pos < 1) requestAnimationFrame(crossfadeFunction);
        else {
            this.scene.remove(quad);
            this.element.classList.remove("animating");
            this.element.classList.remove("no-drag");
            quadGeometry.dispose();
            this.assetManager.disposeMesh(quad);
            previousSceneFBO.texture.dispose();
            previousSceneFBO.dispose();
            currentSceneFBO.texture.dispose();
            currentSceneFBO.dispose();
            this.render();
        }
    };

    // Prevents transition from being initiated multiple times
    this.element.classList.add("animating");
    this.element.classList.add("no-drag");

    requestAnimationFrame(crossfadeFunction);
};

ripe.CSRenderer.prototype.rotate = function (options) {
    var maxHeight = options.distance - this.cameraHeight;

    var distance = options.distance * Math.cos((Math.PI / 180) * options.rotationY);
    this.camera.position.x = distance * Math.sin((Math.PI / 180) * -options.rotationX);
    this.camera.position.y =
        this.cameraHeight + maxHeight * Math.sin((Math.PI / 180) * options.rotationY);
    this.camera.position.z = distance * Math.cos((Math.PI / 180) * options.rotationX);

    this.camera.lookAt(this.cameraTarget);

    this.previousRotation.x = options.rotationX;
    this.previousRotation.y = options.rotationY;
};
