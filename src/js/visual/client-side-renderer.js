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
    this.library = options.library || null;
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
    this.highlightDuration = options.maskDuration || 150;
    this.partsMap = options.partsMap || {};

    this.shadowBias = options.shadowBias || 0.01;

    // raycast
    this.raycaster = new this.library.Raycaster();
    this.raycastingMeshes = [];
    this.intersectedPart = "";

    // initials
    this.initialsPlacement = options.initialsPlacement || "center";
    this.initialsType = options.initialsType || "emboss";
    this.initialsText = options.initialsText || "";
    this.engraving = options.engraving === undefined ? "metal_gold" : options.engraving;

    this.cameraDistance = options.cameraDistance || 0;
    this.cameraHeight = options.cameraHeight || 0;
    this.exposure = options.exposure || 3.0;

    this.environment = options.environment;

    // animations
    this.introAnimation = options.introAnimation;

    this.useMasks = options.useMasks || true;

    this.scene = new this.library.Scene();

    // initialize all ThreeJS components
    this._initializeLights();
    this._initializeCamera();
    this._initializeRenderer();
    //this._setupPostProcessing();
    this._registerHandlers();
    this._initializeShaders();

    this.assetManager = new ripe.CSRAssetManager(this.owner, options, this.renderer);
    this._loadAssets();

    this.gui = new dat.GUI();
    const folder = this.gui.addFolder("Settings");
    folder.add(this, "exposure", 0.0, 4.0).name("Exposure").onChange(this.render);
    folder.add(this, "shadowBias", -1.0, 1.0).name("Shadow Bias").onChange(this.render);
    folder.open();

    // coordinates for raycaster requires the exact positioning
    // of the element in the window, needs to be updated on
    // every resize
    window.onresize = () => {
        this.updateSize();
    };
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

    this.highlightDuration =
        options.maskDuration === undefined ? this.highlightDuration : options.maskDuration;

    this.cameraDistance =
        options.cameraDistance === undefined ? this.cameraDistance : options.cameraDistance;
    this.cameraHeight =
        options.cameraHeight === undefined ? this.cameraHeight : options.cameraHeight;
    this.exposure = options.exposure === undefined ? this.exposure : options.exposure;

    this.useMasks = options.useMasks === undefined ? this.useMasks : options.useMasks;
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
        self._performAnimation(self.introAnimation)

        if (!self.element.classList.contains("drag")) self._attemptRaycast(event, "click");
    });
};

ripe.CSRenderer.prototype.disposeResources = async function () {
    this.raycastingMeshes = [];
    await this.assetManager._disposeResources(this.scene);
}

ripe.CSRenderer.prototype.loadMaterials = async function () {
    this.assetManager.loadMaterials();
};

ripe.CSRenderer.prototype._loadAssets = async function () {
    await this.assetManager._loadMesh();

    for (var mesh in this.assetManager.meshes) {
        this.raycastingMeshes.push(this.assetManager.meshes[mesh])
    }

    this.scene.add(this.assetManager.loadedGltf.scene);

    this.mixer = new this.library.AnimationMixer(this.assetManager.loadedGltf.scene);
    this.animations = this.assetManager.loadedGltf.animations;

    if (this.environment) await this.assetManager.setupEnvironment(this.scene);

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

    var mult = this.cameraDistance;

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

    /*
    if (!this.environment) {
        this.scene.add(keyLight)
        this.scene.add(fillLight)
        this.scene.add(rimLight)
    }
    */
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
};

ripe.CSRenderer.prototype._setupPostProcessing = function () {
    this.composer = new this.library.EffectComposer(this.renderer);

    var renderPass = new this.library.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    var saoPass = new this.library.SAOPass(this.scene, this.camera, true, true);

    saoPass.resolution.set(8192, 8192);

    saoPass.params.saoBias = 0.01;
    saoPass.params.saoIntensity = 1;
    saoPass.params.saoScale = 5;
    saoPass.params.saoKernelRadius = 20;
    saoPass.params.saoMinResolution = 0;

    this.composer.addPass(saoPass);

    var bloomPass = new this.library.BloomPass(1, 25, 4, 256);
    this.composer.addPass(bloomPass);

    var ssaoPass = new this.library.SSAOPass(this.scene, this.camera, 620, 620);
    ssaoPass.kernelRadius = 32;
    ssaoPass.renderToScreen = true;

    this.composer.addPass(ssaoPass);
};

ripe.CSRenderer.prototype._initializeCamera = function () {
    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;

    this.camera = new this.library.PerspectiveCamera(this.cameraFOV, width / height, 1, 20000);
    this.camera.position.set(0, this.cameraHeight, this.cameraDistance);
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
    console.log("Attempting to perform animation " + animationName)

    var animation = this.library.AnimationClip.findByName(this.animations, animationName);
    if (!animation) return;

    var action;
    this.animations.forEach((clip) => {
        if (clip.name == animationName) {
            action = this.mixer.clipAction(clip);
            action.clampWhenFinished = true;
            action.loop = this.library.LoopOnce;
        }
    });
    
    var previousTime = 0;

    const doAnimation = (time) => {
        previousTime = previousTime == 0 ? time : previousTime;
    
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

ripe.CSRenderer.prototype.render = function (useRenderer = false, camera = undefined) {
    //console.log("Rendering!")
    const cam = camera === undefined ? this.camera : camera;
    //const renderer = useRenderer ? this.renderer : this.composer;
    const renderer = this.renderer;

    renderer.render(this.scene, cam);
};

ripe.CSRenderer.prototype.updateSize = function () {
    this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
    //this.composer.setSize(this.element.clientWidth, this.element.clientHeight);
    this.updateElementBoundingBox();
};

ripe.CSRenderer.prototype._attemptRaycast = function (mouseEvent) {
    const animating = this.element.classList.contains("animating");
    const dragging = this.element.classList.contains("drag");

    if (!this.elementBoundingBox || animating || dragging) return;

    const mouse = this._getNormalizedCoordinatesRaycast(mouseEvent);

    if (this.raycaster && this.scene) {
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

    const duration = this.element.dataset.mask_duration || this.highlightDuration;

    this.changeHighlight(part, 0.2, duration);

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

    const duration = this.element.dataset.mask_duration || this.highlightDuration;

    this.changeHighlight(this.intersectedPart, 1.0, duration);

    this.intersectedPart = "";

    // triggers an event indicating that a lowlight operation has been
    // performed on the current configurator
    this.trigger("lowlighted");
};

ripe.CSRenderer.prototype.changeHighlight = function (part, endValue, duration) {
    var meshTarget = this.assetManager.meshes[part];
    var startingValue = meshTarget.material.color.r;

    //console.log("Changing highlight of " + part + " from " + startingValue + " to " + endValue + " in " + duration);

    if (!meshTarget) return;

    var currentValue = startingValue;
    var pos = 0;

    var startTime = 0;
    const changeHighlightTransition = (time) => {
        startTime = startTime === 0 ? time : startTime;

        meshTarget.material.color.r = currentValue;
        meshTarget.material.color.g = currentValue;
        meshTarget.material.color.b = currentValue;

        pos = (time - startTime) / duration;
        currentValue = ripe.easing[this.highlightEasing](pos, startingValue, endValue);

        this.render();

        if (pos < 1) requestAnimationFrame(changeHighlightTransition);
    };

    requestAnimationFrame(changeHighlightTransition);
};

ripe.CSRenderer.prototype.updateInitials = async function (initials) {
    // hides or unhides logo part
    if (
        (initials === "" && this.initialsText !== "") ||
        (initials !== "" && this.initialsText === "")
    ) {
        var isLogoVisible = initials === "" && this.initialsText !== "";
        for (var mesh in this.assetManager.meshes) {
            if (mesh.includes("logo_part")) {
                this.assetManager.meshes[mesh].visible = isLogoVisible;
            }
        }
    }

    if (!this.assetManager.initialsPositions) return;

    if (initials === this.initialsText && this.owner.engraving === this.engraving) {
        return;
    }

    if (this.initialsType === "emboss") await this.embossLetters(initials);
    else if (this.initialsType === "engrave") await this.engraveLetters(initials);

    this.initialsText = initials;

    this.render();
};

ripe.CSRenderer.prototype.embossLetters = async function (initials) {
    // avoid creating new materials
    this.letterMaterial =
        this.letterMaterial === null || this.owner.engraving !== this.engraving
            ? await this.assetManager._getLetterMaterial()
            : this.letterMaterial;
    const maxLength = Object.keys(this.assetManager.initialsPositions).length;

    if (initials.length < this.initialsText.length) {
        var diff = this.initialsText.length - initials.length;
        while (diff > 0) {
            this.scene.remove(this.textMeshes[this.textMeshes.length - 1]);
            this.assetManager.disposeLastLetter();
            diff--;
        }
    }

    // Starts at 1 to line up with initials mesh position
    for (var i = 1; i <= Math.min(initials.length, maxLength); i++) {
        const posRot = this.getPosRotLetter(i, initials);
        const letter = initials.charAt(i - 1);

        if (i - 1 < this.textMeshes.length) {
            this.scene.remove(this.textMeshes[i - 1]);
            this.assetManager.disposeLastLetter();
        }

        const isNewLetter =
            i > this.initialsText.length || letter !== this.initialsText.charAt(i - 1);

        var mesh;
        if (isNewLetter) mesh = this.assetManager.createLetter(letter);
        else mesh = this.assetManager.textMeshes[i - 1];

        mesh.position.set(posRot.position.x, posRot.position.y, posRot.position.z);
        mesh.rotation.set(posRot.rotation.x, posRot.rotation.y, posRot.rotation.z);
    }
};

ripe.CSRenderer.prototype.getPosRotLetter = function (letterNumber, initials) {
    // Check if placement is interpolated or in the precise spot
    var transform = {};
    const size = Object.keys(this.assetManager.initialsPositions).length;
    const center = (size + 1) / 2;

    const posInInitials = center + letterNumber - (initials.length + 1) / 2;
    console.log(posInInitials, initials, this.assetManager.initialsPositions);

    if (initials.length % 2 === size % 2) {
        // TODO Check for placement
        transform.position = this.assetManager.initialsPositions[posInInitials].position;
        transform.rotation = this.assetManager.initialsPositions[posInInitials].rotation;
    } else {
        // Interpolate between the two closest positions
        const previous = this.assetManager.initialsPosition[Math.floor(posInInitials)];
        const next = this.assetManager.initialsPosition[Math.ceil(posInInitials)];

        var position = new this.library.Vector3(0, 0, 0);
        var rotation = new this.library.Vector3(0, 0, 0);

        position.x = (previous.position.x + next.position.x) / 2;
        position.y = (previous.position.y + next.position.y) / 2;
        position.z = (previous.position.z + next.position.z) / 2;

        rotation.x = (previous.rotation.x + next.rotation.x) / 2;
        rotation.y = (previous.rotation.y + next.rotation.y) / 2;
        rotation.z = (previous.rotation.z + next.rotation.z) / 2;

        transform.position = position;
        transform.rotation = rotation;
    }

    return transform;
};

ripe.CSRenderer.prototype.engraveLetters = function () { };

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

ripe.CSRenderer.prototype.transition = function (options) {
    if (options.method === "cross") this.crossfade(options);
};

ripe.CSRenderer.prototype.crossfade = async function (options = {}) {
    console.log("Beginning crossfade")
    var renderTargetParameters = {
        minFilter: this.library.LinearFilter,
        magFilter: this.library.LinearFilter,
        format: this.library.RGBAFormat
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

    var previousSceneFBO = new this.library.WebGLRenderTarget(width, height, renderTargetParameters);
    var currentSceneFBO = new this.library.WebGLRenderTarget(width, height, renderTargetParameters);

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
    this.render(true)

    var parts = options.parts === undefined ? this.owner.parts : options.parts;
    console.log(parts)

    if (options.type === "material") {
        await this.assetManager.setMaterials(parts);
    } else if (options.type === "rotation") {
        this._applyRotations(options.rotationX, options.rotationY);
    }

    // Render next image
    this.renderer.setRenderTarget(currentSceneFBO);
    this.renderer.clear();
    //if (this.composer) this.composer.clear();
    this.render(true)

    // Reset renderer
    this.renderer.setRenderTarget(null);
    this.renderer.clear();

    var pos = 0;
    var duration = options.duration || 500;

    var startTime = 0;
    const crossfadeFunction = (time) => {
        startTime = startTime === 0 ? time : startTime;
        this.render(true, transitionCamera);

        pos = (time - startTime) / duration;
        mixRatio = ripe.easing[this.crossfadeEasing](pos, 0.0, 1.0);

        //mixRatio += 1.0 / duration;
        this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

        if (pos < 1) requestAnimationFrame(crossfadeFunction);
        else {
            this.scene.remove(quad);
            this.element.classList.remove("animating");
            this.element.classList.remove("no-drag");
            quad.geometry.dispose();
            quad.material.dispose();
            quadGeometry.dispose();
            previousSceneFBO.dispose();
            currentSceneFBO.dispose();
            this.render();
        }
    };

    // Prevents transition from being initiated multiple times
    this.element.classList.add("animating");
    this.element.classList.add("no-drag");

    requestAnimationFrame(crossfadeFunction);
};

ripe.CSRenderer.prototype._applyRotations = function (cameraRotationX, cameraRotationY) {
    var maxHeight = this.cameraDistance - this.cameraHeight;

    var distance = this.cameraDistance * Math.cos((Math.PI / 180) * cameraRotationY);
    this.camera.position.x = distance * Math.sin((Math.PI / 180) * -cameraRotationX);
    this.camera.position.y =
        this.cameraHeight + maxHeight * Math.sin((Math.PI / 180) * cameraRotationY);
    this.camera.position.z = distance * Math.cos((Math.PI / 180) * cameraRotationX);

    this.camera.lookAt(this.cameraTarget);
};
