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
 * @classdesc Class that defines the client side renderer that supports
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
ripe.CSR = function(owner, element, options) {
    this.owner = owner;
    this.type = this.type || "CSR";
    this.element = element;

    this.library = options.library;

    // sets the default configurations
    this.cameraFOV = 20;
    this.cameraHeight = 0;
    this.cameraTarget = new this.library.Vector3(0, 0, 0);
    this.initialDistance = 100;

    this._setCameraOptions(options);

    // sets the default render options
    this.easing = this.materialEasing = this.crossfadeEasing = this.highlightEasing =
        "easeInOutQuad";
    this.environment = "";
    this.noMasks = false;
    this.useMasks = true;
    this.maskOpacity = 0.4;
    this.maskDuration = 150;
    this.introAnimation = "";
    this._setRenderOptions(options);

    this.shadowBias = 0;
    this.exposure = 1.5;
    this.radius = 1;
    this.usesPostProcessing =
        options.usesPostProcessing === undefined ? true : options.usesPostProcessing;

    this.postProcessLib = options.postProcessingLibrary;
    this._setPostProcessOptions(options);

    this.partsMap = options.partsMap || {};

    // starts the raycasting related values
    this.intersectedPart = null;
    this.raycastingMeshes = [];

    this.debug = options.debug || false;

    this.guiLibrary = options.dat === undefined ? null : options.dat;

    this.boundingBox = undefined;

    this._wireframe = false;
};

ripe.CSR.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSR.prototype.constructor = ripe.CSR;

/**
 * Updates configurator current options with the ones provided, called from the Configurator
 * instance.
 *
 * @param {Object} options Set of optional parameters to adjust the renderer.
 */
ripe.CSR.prototype.updateOptions = async function(options) {
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
};

/**
 * Called from the Configurator instance to initialize all aspects related to rendering,
 * such as creating the scene, adding the loaded meshes, etc.
 *
 * @param {CSRAssetManager} assetManager
 */
ripe.CSR.prototype.initialize = async function(assetManager) {
    this.assetManager = assetManager;
    this.scene = new this.library.Scene();
    this.raycaster = new this.library.Raycaster();

    this._initializeLights();
    this._initializeCameras();
    this._initializeRenderer();
    this._registerHandlers();
    this._initializeShaders();

    // triggers the loading of the remote assets that are going
    // to be used in scene initialization
    await this._loadAssets();

    if (this.usesPostProcessing) this._setupPostProcessing();

    if (this.debug) this.createGui();

    const hasAnimation = this._getAnimationByName(this.introAnimation) !== undefined;

    // in case were meant to execute an animation bt there's none
    // available raises an exception
    if (!hasAnimation && this.introAnimation) {
        throw new Error(
            `There is no animation present in the file with the given name '${this.introAnimation}'`
        );
    }

    // in case an intro animation is required then performs it
    // otherwise runs the "typical" render operation
    const executeAnimation = hasAnimation && this.introAnimation;
    if (executeAnimation) this._performAnimation(this.introAnimation);
    else this.render();
};

/**
 * Function to dispose all resources created by the renderer,
 * including all the elements belonging to the scene.
 */
ripe.CSR.prototype.disposeResources = async function() {
    this.renderer.renderLists.dispose();

    for (const program of this.renderer.info.programs) {
        program.destroy();
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

    for (const raycastingMesh of this.raycastingMeshes) {
        await this.assetManager.disposeMesh(raycastingMesh);
    }

    await this.assetManager.disposeScene(this.scene);
};

/**
 * Creates the debug GUI for the post processing pipeline, with support
 * for dynamic change of the render pass parameters.
 */
ripe.CSR.prototype.createGui = function() {
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
        .onChange(function(value) {
            updateRenderer("toneMappingExposure", value);
        });
    folder
        .add(this.keyLight.shadow, "bias", -0.005, 0.005)
        .step(0.0001)
        .name("Shadow Bias")
        .onChange(function(value) {
            updateShadows("bias", value);
        });
    folder
        .add(this.keyLight.shadow, "radius", 1, 10)
        .step(1)
        .name("Shadow Radius")
        .onChange(function(value) {
            updateShadows("radius", value);
        });
    folder.open();

    if (!this.usesPostProcessing) return;

    if (this.aoOptions) {
        // TODO
    }

    if (this.aaOptions) {
        // TODO
    }

    if (this.bloomOptions) {
        const self = this;

        const folderBloom = this.gui.addFolder("Bloom Pass");

        folderBloom
            .add(this.bloomPass.luminanceMaterial, "threshold", 0.0, 1.0)
            .step(0.01)
            .name("Threshold")
            .onChange(function(value) {
                self.bloomPass.luminanceMaterial.threshold = value;
                self.render();
            });
        folderBloom
            .add(this.bloomPass, "intensity", 0.0, 3.0)
            .step(0.01)
            .name("Intensity")
            .onChange(function(value) {
                self.bloomPass.intensity = value;
                self.render();
            });
        folderBloom
            .add(this.bloomPass.blendMode.opacity, "value", 0.0, 1.0)
            .step(0.01)
            .step(0.01)
            .name("Opacity")
            .onChange(function(value) {
                self.bloomPass.blendMode.opacity.value = value;
                self.render();
            });

        folderBloom.open();
    }
};

/**
 * Responsible for updating the initials meshes in the scene.
 *
 * @param {String} operation Can be "remove" or "add", to either destroy the meshes from the scene,
 * or add them.
 * @param {Array} meshes The target meshes that will be modified.
 */
ripe.CSR.prototype.updateInitials = function(operation, meshes) {
    for (let i = 0; i < meshes.length; i++) {
        if (operation === "remove") {
            this.scene.remove(meshes[i]);
        }

        if (operation === "add") {
            this.scene.add(meshes[i]);
        }
    }
};

/**
 * Chooses the correct renderer depending on whether post processing is used.
 */
ripe.CSR.prototype.render = function() {
    if (this.usesPostProcessing) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
};

/**
 * @ignore
 */
ripe.CSR.prototype.updateSize = function() {
    if (this.renderer) this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
    if (this.composer) this.composer.setSize(this.element.clientWidth, this.element.clientHeight);
};

/**
 * The highlight operation for a part.
 *
 * @param {String} part The name of the part that is the target
 * for the highlight.
 */
ripe.CSR.prototype.highlight = function(part) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks && this.noMasks) {
        return;
    }

    // changes the highlight (opacity) value for the part that is going
    // to be highlighted (uses animation for such operation)
    this.changeHighlight(part, 1 - this.maskOpacity);

    // triggers an event indicating that a highlight operation has been
    // performed on the current configurator
    this.trigger("highlighted");
};

/**
 * The lowlight operation. Uses the current intersected part, and removes it.
 */
ripe.CSR.prototype.lowlight = function() {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks && this.noMasks) {
        return;
    }

    // in case there's no intersected part selected then
    // returns the control flow immediately (nothing to be done)
    if (this.intersectedPart === null) {
        return;
    }

    // adds the no-raycast flag to improve performance
    this.element.classList.add("no-raycast");
    this.changeHighlight(this.intersectedPart, 1.0);

    // unsets the intersected part value
    this.intersectedPart = null;

    // triggers an event indicating that a lowlight operation has been
    // performed on the current configurator
    this.trigger("lowlighted");
};

/**
 * Changes the highlight value for a certain part's mesh.
 *
 * The changing itself will be animated using a cross-fade animation.
 *
 * @param {String} part The name of the affected part.
 * @param {Number} endValue The end value for the material color, determined by the
 * caller.
 */
ripe.CSR.prototype.changeHighlight = function(part, endValue) {
    // retrieve the mesh associated with the provided part
    // in case none is found ignore the operation
    const mesh = this.assetManager.meshes[part];
    if (!mesh) return;

    const startingValue = mesh.material.color.r;

    let currentValue = startingValue;
    let pos = 0;
    let startTime = 0;

    const changeHighlightTransition = time => {
        startTime = startTime === 0 ? time : startTime;

        mesh.material.color.r = currentValue;
        mesh.material.color.g = currentValue;
        mesh.material.color.b = currentValue;

        pos = (time - startTime) / this.maskDuration;
        currentValue = ripe.easing[this.highlightEasing](pos, startingValue, endValue);

        this.render();

        if (pos < 1) requestAnimationFrame(changeHighlightTransition);
        else if (this.element.classList.contains("no-raycast")) {
            this.element.classList.remove("no-raycast");
        }
    };

    requestAnimationFrame(changeHighlightTransition);
};

/**
 * The crossfade function, that handles rendering the first image, then the image after the change
 * and seamlessly transitions between the two images.
 *
 * @param {Object} options Specific options for the transition, such as duration and the new materials.
 * @param {String} type The type of transition, can be "rotation" for changing views or positions,
 * or "material" when the "setParts" function is called.
 */
ripe.CSR.prototype.crossfade = async function(options = {}, type) {
    const parts = options.parts === undefined ? this.owner.parts : options.parts;

    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;

    const isCrossfading = this.element.classList.contains("crossfading");

    let mixRatio = 0.0;

    // creates the quad from buffer mesh for the viewport and then a quad
    // associated with the crossfade shader, setting the quad in the range
    // the crossfade camera can render
    const quadGeometry = new this.library.PlaneBufferGeometry(width, height);
    const quad = new this.library.Mesh(quadGeometry, this.crossfadeShader);
    quad.position.set(0, 0, 999);
    this.scene.add(quad);

    if (isCrossfading) {
        // since it is already in crossfade, only begin the transition to the next frame
        // after the materials are loaded
        if (type === "material") await this.assetManager.setMaterials(parts, false);
    }

    // renders current state
    this.renderer.setRenderTarget(this.previousSceneFBO);
    this.renderer.clear();

    if (!isCrossfading || type === "rotation") this.renderer.render(this.scene, this.camera);

    // performs the change
    if (type === "material") {
        if (!isCrossfading) await this.assetManager.setMaterials(parts);
        else {
            // now that the textures are loaded, render the current scene, and only then send the
            // stop-crossfade message and render
            this.renderer.render(this.scene, this.camera);
            this.element.classList.add("stop-crossfade");

            // setting materials is now much faster since textures have already been loaded,
            // resulting in less visible stutter for the user
            await this.assetManager.setMaterials(parts, true);
        }
    } else if (type === "rotation") {
        this.rotate(options);
    }

    // renders the scene after the change
    this.renderer.setRenderTarget(this.nextSceneFBO);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    // resets renderer
    this.renderer.setRenderTarget(null);
    this.renderer.clear();

    this.crossfadeShader.uniforms.tDiffuse1.value = this.previousSceneFBO.texture;
    this.crossfadeShader.uniforms.tDiffuse2.value = this.nextSceneFBO.texture;

    this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

    const duration = options.duration || 500;

    let pos = 0;
    let startTime = 0;
    let continueCrossfade = true;

    const crossfadeFunction = time => {
        startTime = startTime === 0 ? time : startTime;

        continueCrossfade = pos < 1 && !this.element.classList.contains("stop-crossfade");

        if (!continueCrossfade) {
            this.assetManager.disposeMesh(quad);
            this.scene.remove(quad);
            this.element.classList.remove("animating");
            this.element.classList.remove("no-drag");
            this.element.classList.remove("crossfading");

            this.previousSceneFBO.texture.dispose();
            this.nextSceneFBO.texture.dispose();

            if (this.element.classList.contains("stop-crossfade")) {
                this.element.classList.remove("stop-crossfade");
            }

            quadGeometry.dispose();

            this.assetManager.disposeMesh(quad);
            return;
        }

        pos = (time - startTime) / duration;
        mixRatio = ripe.easing[this.crossfadeEasing](pos, 0.0, 1.0);

        this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

        this.renderer.render(this.scene, this.crossfadeCamera);

        requestAnimationFrame(crossfadeFunction);
    };

    this.element.classList.add("animating");
    this.element.classList.add("no-drag");
    this.element.classList.add("crossfading");

    requestAnimationFrame(crossfadeFunction);
};

/**
 * Applies the rotation to the scene camera, as the rotation values are controlled by the
 * Orbital Controls.
 *
 * @param {Object} options The struct containing the new values for rotation and camera distance.
 */
ripe.CSR.prototype.rotate = function(options) {
    const maxHeight = options.distance - this.cameraHeight;

    const distance = options.distance * Math.cos((Math.PI / 180) * options.rotationY);
    this.camera.position.x = distance * Math.sin((Math.PI / 180) * options.rotationX * -1);
    this.camera.position.y =
        this.cameraHeight + maxHeight * Math.sin((Math.PI / 180) * options.rotationY);
    this.camera.position.z = distance * Math.cos((Math.PI / 180) * options.rotationX);

    this.camera.lookAt(this.cameraTarget);
};

ripe.CSR.prototype._setCameraOptions = function(options = {}) {
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

ripe.CSR.prototype._setRenderOptions = function(options = {}) {
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

    this.introAnimation =
        renderOptions.introAnimation === undefined
            ? this.introAnimation
            : renderOptions.introAnimation;
};

ripe.CSR.prototype._setPostProcessOptions = function(options = {}) {
    if (!options.postProcess) return;

    const postProcOptions = options.postProcess;

    this.exposure =
        postProcOptions.exposure === undefined ? this.exposure : postProcOptions.exposure;
    this.shadowBias =
        postProcOptions.shadowBias === undefined ? this.shadowBias : postProcOptions.shadowBias;
    this.radius = postProcOptions.radius === undefined ? this.radius : postProcOptions.radius;

    if (postProcOptions.bloom) this.bloomOptions = postProcOptions.bloom;
    if (postProcOptions.antialiasing) this.aaOptions = postProcOptions.antialiasing;
    if (postProcOptions.ambientOcclusion) this.aoOptions = postProcOptions.ambientOcclusion;
};

/**
 * @ignore
 */
ripe.CSR.prototype._registerHandlers = function() {
    const self = this;
    const area = this.element.querySelector(".area");

    area.addEventListener("mousemove", function(event) {
        // fixes the event, by applying a extra level of
        // compatibility on top of the base event structure
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

    area.addEventListener("click", function(event) {
        event = ripe.fixEvent(event);

        if (!self.element.classList.contains("drag")) self._attemptRaycast(event, "click");
    });

    window.onresize = () => {
        this.boundingBox = this.element.getBoundingClientRect();
    };
};

/**
 * After the Asset Manager finished loading the glTF file, begin loading the necessary assets
 * that pertain to rendering, such as loading the environment and the animations.
 */
ripe.CSR.prototype._loadAssets = async function() {
    for (const mesh in this.assetManager.meshes) {
        this.raycastingMeshes.push(this.assetManager.meshes[mesh]);
    }

    this.scene.add(this.assetManager.loadedScene);

    this.mixer = new this.library.AnimationMixer(this.assetManager.loadedScene);

    if (this.environment) {
        await this.assetManager.setupEnvironment(this.scene, this.renderer, this.environment);
    }
};

/**
 * Initialize shaders that the renderer will use, such as
 * the crossfade shader for the transition.
 *
 * This shaders are defined in GLSL.
 *
 * @see https://en.wikipedia.org/wiki/OpenGL_Shading_Language
 */
ripe.CSR.prototype._initializeShaders = function() {
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
ripe.CSR.prototype._initializeLights = function() {
    const ambientLight = new this.library.HemisphereLight(0xffeeb1, 0x080820, 0.0);

    // lights should be further away based on the camera distance, useful for dealing
    // with scenes of varying sizes.
    const mult = this.initialDistance;

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
ripe.CSR.prototype._initializeRenderer = function() {
    // creates the renderer using the "default" WebGL approach
    // notice that the shadow map is enabled
    this.renderer = new this.library.WebGLRenderer({
        alpha: true,
        logarithmicDepthBuffer: true,
        antialias: true
    });

    this.renderer.info.autoReset = false;

    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;

    this.renderer.setSize(width, height);

    // sets renderer params
    this.renderer.toneMappingExposure = this.exposure;
    this.renderer.toneMapping = this.library.CineonToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.library.PCFSoftShadowMap;

    const area = this.element.querySelector(".area");
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(0xffffff);

    area.appendChild(this.renderer.domElement);

    const renderTargetParams = {
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
 * Creates the render passes and adds them to the effect composer.
 */
ripe.CSR.prototype._setupPostProcessing = function() {
    if (this.bloomOptions) this._setupBloomPass();
    if (this.aaOptions) this._setupAAPass();
    if (this.aoOptions) this._setupAOPass();
};

/**
 * @ignore
 */
ripe.CSR.prototype._setupBloomPass = function() {
    const blendFunction = this.postProcessLib.BlendFunction.SCREEN;
    const kernelSize = this.postProcessLib.KernelSize.MEDIUM;
    const luminanceSmoothing = 0.075;
    const bloomHeight = 480;

    const bloomOptions = {
        blendFunction: blendFunction,
        kernelSize: kernelSize,
        luminanceSmoothing: luminanceSmoothing,
        height: bloomHeight
    };

    this.bloomPass = new this.postProcessLib.BloomEffect(bloomOptions);

    this.bloomPass.luminanceMaterial.threshold =
        this.bloomOptions.threshold === undefined ? 0.9 : this.bloomOptions.threshold;
    this.bloomPass.intensity =
        this.bloomOptions.intensity === undefined ? 0.5 : this.bloomOptions.intensity;
    this.bloomPass.blendMode.opacity.value =
        this.bloomOptions.opacity === undefined ? 0.7 : this.bloomOptions.opacity;

    this.composer.addPass(new this.postProcessLib.EffectPass(this.camera, this.bloomPass));
};

/**
 * @ignore
 */
ripe.CSR.prototype._setupAAPass = function() {
    // TODO
};

/**
 * @ignore
 */
ripe.CSR.prototype._setupAOPass = function() {
    // TODO
};

/**
 * Creates the default camera as well as the camera that will be responsible
 * for handling the crossfading.
 */
ripe.CSR.prototype._initializeCameras = function() {
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

    this.camera.animations = [];
    // load camera specific animations
    for (const animation in this.assetManager.animations) {
        if (animation.includes("camera_")) {
            this.camera.animations.push(this.assetManager.animations[animation]);
        }
    }
};

/**
 * Retrieves a mesh animation by it's name.
 *
 * @param {String} name The name of the animation to be retrieved.
 * @returns {Animation} The animation for the given name.
 */
ripe.CSR.prototype._getAnimationByName = function(name) {
    for (const [key, value] of Object.entries(this.assetManager.animations)) {
        if (key !== name) continue;
        return value;
    }
    return undefined;
};

/**
 * Handles everything that is necessary to running an animation from the loaded scene.
 *
 * @param {String} animationName The name of the animation to be executed.
 */
ripe.CSR.prototype._performAnimation = function(animationName) {
    const animation = this._getAnimationByName(animationName);

    if (!animation) return;

    animation.optimize();

    const action = this.mixer.clipAction(animation);
    action.clampWhenFinished = true;
    action.loop = this.library.LoopOnce;
    action.setEffectiveTimeScale(1);

    const clock = new this.library.Clock();
    clock.autoStart = false;

    // initialize variables
    clock.start();
    clock.stop();
    action.play().stop();

    let delta = -1;

    const doAnimation = () => {
        if (delta === -1) {
            // first render takes longer, done before the clock begins,
            // renders to frame buffer object to prevent from rendering
            // to screen
            this.renderer.setRenderTarget(this.previousSceneFBO);
            this.renderer.clear();
            this.renderer.render(this.scene, this.camera);

            // resets the renderer
            this.renderer.setRenderTarget(null);
            this.renderer.clear();

            clock.start();
            action.play();
        }

        delta = clock.getDelta();
        this.mixer.update(delta);

        this.render();

        if (!action.paused) requestAnimationFrame(doAnimation);
        else clock.stop();
    };

    requestAnimationFrame(doAnimation);
};

/**
 * Performs a raycast from the current mouse position to check what
 * objects have been intersected, and handles the highlight and
 * lowlight operation automatically.
 *
 * @param {Event} event The mouse event that is going to be used
 * as the basis for the casting of the ray.
 */
ripe.CSR.prototype._attemptRaycast = function(event) {
    // gathers the status for a series of class value of the
    // configurator main DOM element
    const animating = this.element.classList.contains("animating");
    const dragging = this.element.classList.contains("drag");
    const noRaycasting = this.element.classList.contains("no-raycast");

    // prevents raycasting can be used to improve performance, as this operation
    // can be done every frame
    if (animating || dragging || noRaycasting) return;

    // runs a series of pre-validation for the execution of the raycasting
    // if any of them fails returns immediately (not possible to ray cast)
    if (!this.raycaster) return;
    if (!this.scene) return;
    if (!this.assetManager) return;

    // starts the casting operation by attributing a new cast identifier that
    // is latter going to be used to check if the cast is up-to-date (to avoid
    // async related issues)
    const castId = this.castId ? this.castId + 1 : 1;
    this._castId = castId;

    // in case there's no available bounding box set, tries to retrieve a new
    // bounding box from the configurator's DOM element
    if (!this.boundingBox) this.boundingBox = this.element.getBoundingClientRect();

    // converts the mouse coordinates into normalized (1 based) coordinates
    // that can be used by the raycaster
    const coordinates = this._convertRaycast(event);

    // runs the raycasting operation trying to "see" if there's at least one match
    // with a "valid" sub meshes representative of a model's part
    this.raycaster.setFromCamera(coordinates, this.camera);
    const intersects = this.raycaster.intersectObjects(this.raycastingMeshes);

    // in case the cast unique identifier is no longer the same it means
    // that we should ignore it's result (as this is casting is outdated)
    if (castId !== this._castId) return;

    // in case no intersection occurs then a lowlight is performed (click outside scope)
    // and the control flow is immediately returned to caller method
    if (intersects.length === 0) {
        this.lowlight();
        return;
    }

    // captures the name of the intersected part/sub-mesh and
    // verifies if it's not the same as the currently highlighted
    // one, if that's the case no action is taken
    const intersectedPart = intersects[0].object.name;
    const isSame = intersectedPart === this.intersectedPart;
    if (isSame) return;

    // "lowlights" all of the parts and highlights the one that
    // has been selected
    this.lowlight();
    this.highlight(intersectedPart);

    // "saves" the currently selected part so that it can be
    // latter used to detect duplicated highlighting (performance)
    this.intersectedPart = intersectedPart;
};

/**
 * Maps a mouse event to a coordinate that goes from -1 to 1 in both the X and Y
 * axis. This value will allows us to work on a normalized "world".
 *
 * This method makes use of the bounding box for the normalization process.
 *
 * @param {Object} coordinates An object with the x and y non normalized values.
 * @returns {Object} An object with both the x and the y normalized values.
 */
ripe.CSR.prototype._convertRaycast = function(coordinates) {
    // the origin of the coordinate system is the center of the element,
    // coordinates range from -1,-1 (bottom left) to 1,1 (top right)
    const newX = ((coordinates.x - this.boundingBox.x) / this.boundingBox.width) * 2 - 1;
    const newY =
        ((coordinates.y - this.boundingBox.y + window.scrollY) / this.boundingBox.height) * -2 + 1;
    return { x: newX, y: newY };
};

Object.defineProperty(ripe.CSR.prototype, "wireframe", {
    get: function() {
        return this._wireframe;
    },
    set: function(value) {
        Object.values(this.assetManager?.meshes || {}).forEach(mesh => {
            mesh.material.wireframe = value;
        });
        this._wireframe = value;
    }
});
