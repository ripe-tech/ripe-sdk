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

    this.library = options.library;

    // Set default configurations
    this.cameraFOV = 20;
    this.cameraHeight = 0;
    this.cameraTarget = new this.library.Vector3(0, 0, 0);
    this.initialDistance = 100;

    this._setCameraOptions(options);

    // set default render options
    this.easing = this.materialEasing = this.crossfadeEasing = this.highlightEasing =
        "easeInOutQuad";
    this.environment = "";
    this.noMasks = false;
    this.useMasks = true;
    this.maskOpacity = 0.4;
    this.maskDuration = 150;
    this.introAnimation = "Idle";
    this._setRenderOptions(options);

    this.shadowBias = 0;
    this.exposure = 1.5;
    this.usesPostProcessing =
        options.usesPostProcessing === undefined ? true : options.usesPostProcessing;

    if (this.usesPostProcessing) {
        this.postProcessLib = options.postProcessingLibrary;
        this._setPostProcessOptions(options);
    }

    this.partsMap = options.partsMap || {};
    this.shadowBias = options.shadowBias || -0.0001;
    this.radius = options.radius || 1;

    // raycast
    this.intersectedPart = "";
    this.raycastingMeshes = [];

    this.debug = options.debug || false;

    // update to match best view from bindConfigurator options
    this.previousRotation = new this.library.Vector2(0, 0);
    this.guiLibrary = options.dat === undefined ? null : options.dat;

    this.boundingBox = undefined;
};

ripe.CSRenderer.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRenderer.prototype.constructor = ripe.CSRenderer;

ripe.CSRenderer.prototype._setCameraOptions = function (options = {}) {
    if (!options.camera) return;

    const camOptions = options.camera;

    this.cameraFOV = camOptions.fov === undefined ? this.cameraFOV : camOptions.fov;
    this.cameraHeight = camOptions.height === undefined ? this.cameraHeight : camOptions.height;
    this.cameraTarget =
        camOptions.target === undefined
            ? this.cameraTarget
            : new this.library.Vector3(
                camOptions.target.x,
                camOptions.target.y,
                camOptions.target.z
            );

    this.initialDistance = camOptions.distance;
};

ripe.CSRenderer.prototype._setRenderOptions = function (options = {}) {
    if (!options.renderer) return;

    const renderOptions = options.renderer;

    this.easing = renderOptions.easing === undefined ? this.easing : renderOptions.easing;
    this.materialEasing =
        renderOptions.materialEasing === undefined
            ? this.materialEasing
            : renderOptions.materialEasing;
    this.crossfadeEasing =
        renderOptions.crossfadeEasing === undefined
            ? this.crossfadeEasing
            : renderOptions.crossfadeEasing;
    this.highlightEasing =
        renderOptions.highlightEasing === undefined
            ? this.highlightEasing
            : renderOptions.highlightEasing;

    this.environment =
        renderOptions.environment === undefined ? this.environment : renderOptions.environment;
    this.noMasks = renderOptions.noMasks === undefined ? this.noMasks : renderOptions.noMasks;
    this.useMasks = renderOptions.useMasks === undefined ? this.useMasks : renderOptions.useMasks;
    this.maskOpacity =
        renderOptions.maskOpacity === undefined ? this.maskOpacity : renderOptions.maskOpacity;
    this.maskDuration =
        renderOptions.maskDuration === undefined ? this.maskDuration : renderOptions.maskDuration;

    // animations
    this.introAnimation =
        renderOptions.introAnimation === undefined
            ? this.introAnimation
            : renderOptions.introAnimation;
};

ripe.CSRenderer.prototype._setPostProcessOptions = function (options = {}) {
    if (!options.postProcess) return;

    const postProcOptions = options.postProcess;

    this.exposure =
        postProcOptions.exposure === undefined ? this.exposure : postProcOptions.exposure;
    this.shadowBias =
        postProcOptions.shadowBias === undefined ? this.shadowBias : postProcOptions.shadowBias;

    if (postProcOptions.bloom) this.bloomOptions = postProcOptions.bloom;
    if (postProcOptions.antialising) this.aaOptions = postProcOptions.antialiasing;
    if (postProcOptions.ao) this.aoOptions = postProcOptions.ao;
};

/**
 * Updates configurator current options with the ones provided, called from the Configurator
 * instance.
 *
 * @param {Object} options Set of optional parameters to adjust the renderer.
 */
ripe.CSRenderer.prototype.updateOptions = async function (options) {
    this.assetManager.updateOptions(options);

    this._setCameraOptions(options);
    this._setRenderOptions(options);

    this.width = options.width === undefined ? this.width : options.width;
    this.element = options.element === undefined ? this.element : options.element;
    this.library = options.library === undefined ? this.library : options.library;
    this.postProcessLib =
        options.postProcessingLibrary === undefined
            ? this.postProcessLib
            : options.postProcessingLibrary;
    this.usesPostProcessing =
        options.usesPostProcessing === undefined
            ? this.usesPostProcessing
            : options.usesPostProcessing;

    if (this.usesPostProcessing) {
        this._setPostProcessOptions(options);
        if (this.composer) this._setupPostProcessing();
    }
};

/**
 * Called from the Configurator instance to initialize all aspects related to rendering,
 * such as creating the scene, adding the loaded meshes, etc.
 *
 * @param {CSRAssetManager} assetManager
 */
ripe.CSRenderer.prototype.initialize = function (assetManager) {
    this.assetManager = assetManager;
    this.scene = new this.library.Scene();
    this.raycaster = new this.library.Raycaster();

    this._initializeLights();
    this._initializeCameras();
    this._initializeRenderer();
    this._registerHandlers();
    this._initializeShaders();
    this._loadAssets();

    if (this.usesPostProcessing) this._setupPostProcessing();

    if (this.debug) this.createGUI();

    // finished loading everything, begin the rendering processs.
    var hasIdle = this.library.AnimationClip.findByName(this.animations, "Idle");

    if (this.introAnimation) this._performAnimation(this.introAnimation);
    else if (hasIdle) this._performAnimation("Idle");
    else this.render();
};

/**
 * @ignore
 */
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

/**
 * Funtion to dispose all resources created by the renderer, including all the elements
 * belonging to the scene.
 */
ripe.CSRenderer.prototype.disposeResources = async function () {
    console.log("Disposing Renderer resources.");

    this.renderer.renderLists.dispose();
    this.composer.renderTarget1.dispose();
    this.composer.renderTarget2.dispose();

    for (let i = 0; i < this.renderer.info.programs.length; i++) {
        this.renderer.info.programs[i].destroy();
    }

    this.renderer.info.reset();

    this.renderer.dispose();

    this.renderer = null;
    this.composer = null;

    if (this.keyLight.shadow && this.keyLight.shadow.map) this.keyLight.shadow.map.dispose();
    if (this.fillLight.shadow && this.fillLight.shadow.map) this.fillLight.shadow.map.dispose();
    if (this.rimLight.shadow && this.rimLight.shadow.map) this.rimLight.shadow.map.dispose();

    this.previousSceneFBO.texture.dispose();
    this.previousSceneFBO.dispose();
    this.nextSceneFBO.texture.dispose();
    this.nextSceneFBO.dispose();

    for (let i = 0; i < this.raycastingMeshes.length; i++) {
        await this.assetManager.disposeMesh(this.raycastingMeshes[i]);
    }

    await this.assetManager.disposeScene(this.scene);

    console.log("Finished Disposing Renderer Resources.");
};

/**
 * After the Asset Manager finished loading the glTF file, begin loading the necessary assets
 * that pertain to rendering, such as loading the environment and the animations.
 */
ripe.CSRenderer.prototype._loadAssets = async function () {
    for (var mesh in this.assetManager.meshes) {
        this.raycastingMeshes.push(this.assetManager.meshes[mesh]);
    }

    this.scene.add(this.assetManager.loadedGltf.scene);

    this.mixer = new this.library.AnimationMixer(this.assetManager.loadedGltf.scene);
    this.animations = this.assetManager.loadedGltf.animations;

    if (this.environment) {
        await this.assetManager.setupEnvironment(this.scene, this.renderer, this.environment);
    }
};

/**
 * Initialize shaders that the renderer will use, such as the crossfade shader for the transition.
 */
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

/**
 * Initializes the lights, taking into account the possible shadow bias and radius settings
 * passed to the Configurator.
 */
ripe.CSRenderer.prototype._initializeLights = function () {
    const ambientLight = new this.library.HemisphereLight(0xffeeb1, 0x080820, 0.0);

    // Lights should be forther away based on the camera distance, useful for dealing
    // with scenes of varying sizes.
    var mult = this.initialDistance;

    this.keyLight = new this.library.PointLight(0xffffff, 2.2, 9 * mult);
    this.keyLight.position.set(1 * mult, 1 * mult, 1 * mult);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.radius = this.radius;
    this.keyLight.shadow.bias = this.shadowBias;

    this.fillLight = new this.library.PointLight(0xffffff, 1.1, 9 * mult);
    this.fillLight.position.set(-1 * mult, 0.5 * mult, 1 * mult);
    this.fillLight.castShadow = true;
    this.fillLight.shadow.mapSize.width = 1024;
    this.fillLight.shadow.mapSize.height = 1024;
    this.fillLight.shadow.radius = this.radius;
    this.fillLight.shadow.bias = this.shadowBias;

    this.rimLight = new this.library.PointLight(0xffffff, 3.1, 9 * mult);
    this.rimLight.position.set(-0.5 * mult, 0.75 * mult, -1.5 * mult);
    this.rimLight.castShadow = true;
    this.rimLight.shadow.mapSize.width = 1024;
    this.rimLight.shadow.mapSize.height = 1024;
    this.rimLight.shadow.radius = this.radius;
    this.rimLight.shadow.bias = this.shadowBias;

    this.scene.add(ambientLight);

    this.scene.add(this.keyLight);
    this.scene.add(this.fillLight);
    this.scene.add(this.rimLight);
};

/**
 * Initializes both the WebGL Renderer as well as the Effect Composer if it uses post-processing.
 */
ripe.CSRenderer.prototype._initializeRenderer = function () {
    // creates the renderer using the "default" WebGL approach
    // notice that the shadow map is enabled
    this.renderer = new this.library.WebGLRenderer({
        antialias: true,
        alpha: true,
        logarithmicDepthBuffer: true
    });
    this.renderer.info.autoReset = false;

    var width = this.element.getBoundingClientRect().width;
    var height = this.element.getBoundingClientRect().height;

    this.renderer.setSize(width, height);

    // Set renderer params
    this.renderer.toneMappingExposure = this.exposure;
    this.renderer.toneMapping = this.library.CineonToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.library.PCFSoftShadowMap;

    const area = this.element.querySelector(".area");
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(0xffffff);

    area.appendChild(this.renderer.domElement);

    var renderTargetParams = {
        minFilter: this.library.LinearFilter,
        magFilter: this.library.LinearFilter,
        format: this.library.RGBAFormat
    };

    this.previousSceneFBO = new this.library.WebGLRenderTarget(width, height, renderTargetParams);
    this.nextSceneFBO = new this.library.WebGLRenderTarget(width, height, renderTargetParams);

    this.composer = new this.postProcessLib.EffectComposer(this.renderer);
    this.composer.addPass(new this.postProcessLib.RenderPass(this.scene, this.camera));
};

/**
 * Creates the debug GUI for the post processing pipeline, with support for dynamic change of the render pass
 *  parameters.
 */
ripe.CSRenderer.prototype.createGUI = function () {
    if (this.guiLibrary === null) return;

    this.gui = new this.guiLibrary.GUI({ width: 300 });

    this.gui.domElement.id = "gui";

    const updateShadows = (param, value) => {
        this.keyLight.shadow[param] = value;
        this.rimLight.shadow[param] = value;
        this.fillLight.shadow[param] = value;
        this.render();
    };

    const updateRenderer = (param, value) => {
        this.renderer[param] = value;
        this.render();
    };

    const folder = this.gui.addFolder("Render Settings");
    folder
        .add(this.renderer, "toneMappingExposure", 0.0, 4.0)
        .name("Exposure")
        .onChange(function (value) {
            updateRenderer("toneMappingExposure", value);
        });
    folder
        .add(this.keyLight.shadow, "bias", -0.005, 0.005)
        .step(0.0001)
        .name("Shadow Bias")
        .onChange(function (value) {
            updateShadows("bias", value);
        });
    folder
        .add(this.keyLight.shadow, "radius", 1, 10)
        .step(1)
        .name("Shadow Radius")
        .onChange(function (value) {
            updateShadows("radius", value);
        });
    folder.open();

    if (!this.usesPostProcessing) return;

    if (this.saoPass) {
        const updateSAO = (param, value) => {
            const pass = this.composer.passes.indexOfObject(this.saoPass);
            this.composer.passes[pass][param] = value;
            this.render();
        };

        const folderSAO = this.gui.addFolder("Scalable Ambient Occlusion Pass");
        folderSAO
            .add(this.saoPass.params, "saoBias", -1.0, 1.0)
            .step(0.001)
            .name("Bias")
            .onChange(function (value) {
                updateSAO("saoIntensity", value);
            });
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
    }

    if (this.ssaoPass) {
        const updateSSAO = (param, value) => {
            const pass = this.composer.passes.indexOfObject(this.ssaoPass);
            this.composer.passes[pass][param] = value;
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
    }

    if (this.bloomPass) {
        const self = this;

        const folderBloom = this.gui.addFolder("Bloom Pass");

        folderBloom
            .add(this.bloomPass.luminanceMaterial, "threshold", 0.0, 1.0)
            .step(0.01)
            .name("Threshold")
            .onChange(function (value) {
                self.bloomPass.luminanceMaterial.threshold = value;
                self.render();
            });
        folderBloom
            .add(this.bloomPass, "intensity", 0.0, 3.0)
            .step(0.01)
            .name("Intensity")
            .onChange(function (value) {
                self.bloomPass.intensity = value;
                self.render();
            });
        folderBloom
            .add(this.bloomPass.blendMode.opacity, "value", 0.0, 1.0)
            .step(0.01)
            .step(0.01)
            .name("Opacity")
            .onChange(function (value) {
                self.bloomPass.blendMode.opacity.value = value;
                self.render();
            });

        folderBloom.open();
    }
};

/**
 * Creates the render passes and adds them to the effect composer.
 */
ripe.CSRenderer.prototype._setupPostProcessing = function () {
    console.log("Setting up Post Processing");

    // const size = this.element.clientWidth;

    // setup bloom pass
    if (this.bloomOptions) this._setupBloomPass();

    if (this.aaOptions) this._setupAAPass();

    if (this.aoOptions) this._setupAOPass();
};

ripe.CSRenderer.prototype._setupBloomPass = function () {
    const blendFunction = this.postProcessLib.BlendFunction.SCREEN;
    const kernelSize = this.postProcessLib.KernelSize.MEDIUM;
    const luminanceSmoothing = 0.075;
    const bloomHeight = 480;

    const bloomOptions = {
        blendFunction: blendFunction,
        kernelSize: kernelSize,
        luminanceSmoothing: luminanceSmoothing,
        height: bloomHeight,
    };

    this.bloomPass = new this.postProcessLib.BloomEffect(bloomOptions);

    this.bloomPass.luminanceMaterial.threshold = this.bloomOptions.threshold === undefined ? 0.9 : this.bloomOptions.threshold;
    this.bloomPass.intensity = this.bloomOptions.intensity === undefined ? 0.5 : this.bloomOptions.intensity;
    this.bloomPass.blendMode.opacity.value = this.bloomOptions.opacity === undefined ? 0.7 : this.bloomOptions.opacity;

    this.composer.addPass(new this.postProcessLib.EffectPass(this.camera, this.bloomPass));
};

ripe.CSRenderer.prototype._setupAAPass = function () { };

ripe.CSRenderer.prototype._setupAOPass = function () { };

ripe.CSRenderer.prototype._initializeCameras = function () {
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

    // Values of far and near camera are so high and so narrow
    // to place the quad outside of the scene, and only render
    // the quad
    this.crossfadeCamera = new this.library.OrthographicCamera(
        -width / 2,
        width / 2,
        height / 2,
        -height / 2,
        -1000,
        -998
    );
};

ripe.CSRenderer.prototype._performAnimation = function (animationName) {
    var animation = this.library.AnimationClip.findByName(this.animations, animationName);
    if (!animation) return;

    animation.optimize();

    var action;
    this.animations.forEach(clip => {
        if (clip.name === animationName) {
            action = this.mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = this.library.LoopOnce;
            action.setEffectiveTimeScale(1);
        }
    });

    const clock = new this.library.Clock();
    clock.autoStart = false;
    var delta = -1;

    const doAnimation = () => {
        if (delta === -1) {
            // Begin action
            action.play();

            // First render takes longer, done before the clock begins
            this.render();

            clock.start();
        }

        delta = clock.getDelta();
        this.mixer.update(delta);

        this.render();

        if (!action.paused) requestAnimationFrame(doAnimation);
        else clock.stop();
    };

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

ripe.CSRenderer.prototype.render = function () {
    // console.log(this.composer);
    if (this.usesPostProcessing) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
};

ripe.CSRenderer.prototype.updateSize = function () {
    if (this.renderer) this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
    if (this.composer) this.composer.setSize(this.element.clientWidth, this.element.clientHeight);
};

ripe.CSRenderer.prototype._attemptRaycast = function (mouseEvent) {
    const animating = this.element.classList.contains("animating");
    const dragging = this.element.classList.contains("drag");
    const preventRaycasting = this.element.classList.contains("no-raycast");

    if (animating || dragging || preventRaycasting) return;

    if (!this.boundingBox) this.boundingBox = this.element.getBoundingClientRect();

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
    if (!this.useMasks && this.noMasks) {
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
    if (!this.useMasks && this.noMasks) {
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
        else this.element.classList.remove("no-raycast");
    };

    this.element.classList.add("no-raycast");
    requestAnimationFrame(changeHighlightTransition);
};

ripe.CSRenderer.prototype._getNormalizedCoordinatesRaycast = function (mouseEvent) {
    // Origin of the coordinate system is the center of the element
    // Coordinates range from -1,-1 (bottom left) to 1,1 (top right)
    const newX = ((mouseEvent.x - this.boundingBox.x) / this.boundingBox.width) * 2 - 1;
    const newY =
        -((mouseEvent.y - this.boundingBox.y + window.scrollY) / this.boundingBox.height) * 2 + 1;

    return {
        x: newX,
        y: newY
    };
};

ripe.CSRenderer.prototype.crossfade = async function (options = {}, type) {
    var width = this.element.getBoundingClientRect().width;
    var height = this.element.getBoundingClientRect().height;

    // TODO Instead of using a crossfade-lock, interpolate between the current crossfade
    // and the next

    let mixRatio = 0.0;

    this.crossfadeShader.uniforms.tDiffuse1.value = this.previousSceneFBO.texture;
    this.crossfadeShader.uniforms.tDiffuse2.value = this.nextSceneFBO.texture;

    this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

    var quadGeometry = new this.library.PlaneBufferGeometry(width, height);
    var quad = new this.library.Mesh(quadGeometry, this.crossfadeShader);
    // set the quad in the range the transition camera can read
    quad.position.set(0, 0, 999);
    this.scene.add(quad);

    // Store current image
    this.renderer.setRenderTarget(this.previousSceneFBO);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    var parts = options.parts === undefined ? this.owner.parts : options.parts;

    if (type === "material") {
        await this.assetManager.setMaterials(parts);
    } else if (type === "rotation") {
        this.rotate(options);
    }
    // Render next image
    this.renderer.setRenderTarget(this.nextSceneFBO);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    // Reset renderer
    // this.renderer.setRenderTarget(null);
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    var pos = 0;
    var duration = options.duration || 500;

    var startTime = 0;
    const crossfadeFunction = time => {
        startTime = startTime === 0 ? time : startTime;
        this.renderer.render(this.scene, this.crossfadeCamera);

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
