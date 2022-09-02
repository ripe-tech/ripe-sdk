if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
}

/**
 * Binds an PRC Configurator to this Ripe instance.
 *
 * @param {Configurator} element The PRC Configurator to be used by the Ripe instance.
 * @param {Object} options An Object with options to configure the Configurator instance.
 * @returns {Configurator} The Configurator instance created.
 */
ripe.Ripe.prototype.bindConfiguratorCsr = function(element, options = {}) {
    const config = new ripe.ConfiguratorCsr(this, element, options);
    return this.bindInteractable(config);
};

/**
 * @class
 * @classdesc Class that defines an interactive Configurator instance to be
 * used in connection with the main Ripe owner to provide an
 * interactive configuration experience inside a DOM.
 *
 * @param {Object} owner The owner (customizer instance) for
 * this configurator.
 * @param {Object} element The DOM element that is considered to
 * be the target for the configurator, it's going to have its own
 * inner HTML changed.
 * @param {Object} options The options to be used to configure the
 * configurator instance to be created.
 */
ripe.ConfiguratorCsr = function(owner, element, options) {
    this.type = this.type || "ConfiguratorCsr";

    ripe.Visual.call(this, owner, element, options);
};

ripe.ConfiguratorCsr.prototype = ripe.build(ripe.Visual.prototype);
ripe.ConfiguratorCsr.prototype.constructor = ripe.ConfiguratorCsr;

/**
 * The Configurator initializer, which is called whenever
 * the Configurator is going to become active.
 *
 * Sets the various values for the Configurator taking into
 * owner's default values.
 */
ripe.ConfiguratorCsr.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    // options variables
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.format = this.options.format || null;
    this.size = this.options.size || null;
    this.pixelRatio =
        this.options.pixelRatio || (typeof window !== "undefined" && window.devicePixelRatio) || 2;
    this.sensitivity = this.options.sensitivity || 40;
    this.useDracoLoader =
        this.options.useDracoLoader !== undefined ? this.options.useDracoLoader : true;
    this.dracoLoaderDecoderPath =
        this.options.dracoLoaderDecoderPath || "https://www.gstatic.com/draco/v1/decoders/";
    this.dracoLoaderDecoderFallbackPath =
        this.options.dracoLoaderDecoderFallbackPath ||
        "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/";
    this.sceneEnvironmentPath =
        this.options.sceneEnvironmentPath ||
        "https://www.dl.dropboxusercontent.com/s/o0v07nn5egjrjl5/studio2.hdr";
    const cameraOpts = this.options.cameraOptions || {};
    this.cameraOptions = {
        fov: cameraOpts.fov !== undefined ? cameraOpts.fov : 45,
        aspect: cameraOpts.aspect !== undefined ? cameraOpts.aspect : null,
        updateAspectOnResize:
            cameraOpts.updateAspectOnResize !== undefined ? cameraOpts.updateAspectOnResize : true,
        near: cameraOpts.near !== undefined ? cameraOpts.near : 0.1,
        far: cameraOpts.far !== undefined ? cameraOpts.far : 10000,
        posX: cameraOpts.posX !== undefined ? cameraOpts.posX : 0,
        posY: cameraOpts.posY !== undefined ? cameraOpts.posY : 0,
        posZ: cameraOpts.posZ !== undefined ? cameraOpts.posZ : 6
    };

    // general state variables
    this.loading = true;
    this.currentSize = 0;
    this.currentWidth = 0;
    this.currentHeight = 0;
    this.clock = null;
    this.animations = [];

    // CSR variables
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.environmentTexture = null;
    this.modelGroup = null;
    this.mesh = null;

    // handlers variables
    this.isMouseDown = false;
    this.referenceX = null;
    this.referenceY = null;
    this.prevPercentX = 0;
    this.prevPercentY = 0;

    // creates the necessary DOM elements and runs the
    // CSR initializer
    this._initLayout();
    this._initCsr().then(() => {
        this.loading = false;
    });
};

/**
 * The Configurator deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.ConfiguratorCsr.prototype.deinit = async function() {
    this._deinitCsr();

    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    this._removeElementHandlers();

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Updates configurator current options with the ones provided.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator.
 * @param {Boolean} update If an update operation should be executed after
 * the options updated operation has been performed.
 */
ripe.ConfiguratorCsr.prototype.updateOptions = async function(options, update = true) {
    ripe.Visual.prototype.updateOptions.call(this, options);

    this.width = options.width === undefined ? this.width : options.width;
    this.height = options.height === undefined ? this.height : options.height;
    this.format = options.format === undefined ? this.format : options.format;
    this.size = options.size === undefined ? this.size : options.size;
    this.pixelRatio = options.pixelRatio === undefined ? this.pixelRatio : options.pixelRatio;
    this.sensitivity = options.sensitivity === undefined ? this.sensitivity : options.sensitivity;
    this.useDracoLoader =
        options.useDracoLoader === undefined ? this.useDracoLoader : options.useDracoLoader;
    this.dracoLoaderDecoderPath =
        options.dracoLoaderDecoderPath === undefined
            ? this.dracoLoaderDecoderPath
            : options.dracoLoaderDecoderPath;
    this.dracoLoaderDecoderFallbackPath =
        options.dracoLoaderDecoderFallbackPath === undefined
            ? this.dracoLoaderDecoderFallbackPath
            : options.dracoLoaderDecoderFallbackPath;
    this.sceneEnvironmentPath =
        options.sceneEnvironmentPath === undefined
            ? this.sceneEnvironmentPath
            : options.sceneEnvironmentPath;
    const cameraOpts = options.cameraOptions || {};
    this.cameraOptions = { ...this.cameraOptions, ...cameraOpts };

    if (update) await this.update();
};

/**
 * This function is called (by the owner) whenever its state changes
 * so that the Configurator can update itself for the new state.
 *
 * This method is "protected" by unique signature validation in order
 * to avoid extra render and frame loading operations. Operations are
 * available to force the update operation even if the signature is the
 * same as the one previously set.
 *
 * @param {Object} state An object containing the new state of the owner.
 * @param {Object} options Set of optional parameters to adjust the Configurator update.
 * @returns {Boolean} If an effective operation has been performed by the
 * update operation.
 */
ripe.ConfiguratorCsr.prototype.update = async function(state, options = {}) {
    const result = true;
    this.trigger("loaded");

    // returns the final result of the underlying update execution
    // to the caller method (may contain the canceled field)
    return result;
};

/**
 * This function is called (by the owner) whenever the current operation
 * in the child should be canceled this way a Configurator is not updated.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator.
 * @returns {Boolean} If an effective operation has been performed or if
 * instead no cancel logic was executed.
 */
ripe.ConfiguratorCsr.prototype.cancel = async function(options = {}) {
    return true;
};

/**
 * Resizes the configurator's DOM element to 'size' pixels. You can also specify the
 * width and height, the size applied is the more specific one.
 *
 * @param {Number} size The number of pixels to resize to.
 */
ripe.ConfiguratorCsr.prototype.resize = async function(size, width, height) {
    if (!this.element) return;

    const sizeValues = this._configuratorSize(size, width, height);

    // in case the current size of the configurator ignores the
    // request to avoid usage of unneeded resources
    if (
        this.currentSize === sizeValues.size &&
        this.currentWidth === sizeValues.width &&
        this.currentHeight === sizeValues.height
    ) {
        return;
    }

    this._resizeCsr(width, height);
    this.currentSize = sizeValues.size;
    this.currentWidth = sizeValues.width;
    this.currentHeight = sizeValues.height;
    await this.update(
        {},
        {
            force: true
        }
    );
};

/**
 * Rotates the model to match the PRC frame.
 *
 * @param {Object} frame The new PRC frame to display using the extended and canonical
 * format for the frame description (eg: side-3).
 * @param {Object} options Set of optional parameters to adjust the change frame, such as:
 * - 'duration' - The duration of the animation in milliseconds (defaults to 'null').
 * - 'preventDrag' - If drag actions during an animated change of frames should be
 * ignored (defaults to 'true').
 * - 'safe' - If requested then the operation is only performed in case the configurator
 * is not in the an equivalent state (default to 'true').
 */
ripe.ConfiguratorCsr.prototype.changeFrame = async function(frame, options = {}) {
    // in case the scene group is not loaded then it's not possible to change the frame
    if (!this.modelGroup) throw new Error("Model group not loaded");

    // parses the requested frame value according to the pre-defined
    // standard (eg: side-3) and then unpacks it as view and position
    const _frame = ripe.parseFrameKey(frame);
    const nextView = _frame[0];
    const nextPosition = parseInt(_frame[1]);

    console.log("changeFrame:", _frame, nextView, nextPosition);

    // in case the next position value was not properly parsed (probably undefined)
    // then it's not possible to change frame (throws exception)
    if (isNaN(nextPosition)) {
        throw new RangeError("Frame position is not defined");
    }

    // unpacks the other options to the frame change defaulting their values
    // in case undefined values are found
    const duration = options.duration !== undefined ? options.duration : null;
    const preventDrag = options.preventDrag !== undefined ? options.preventDrag : true;
    const safe = options.safe !== undefined ? options.safe : true;

    // retrieves the model frame object
    const frames = await this.owner.getFrames();

    // tries to retrieve the amount of frames for the target view and
    // validates that the target view exists and that the target position
    // (frame) does not overflow the amount of frames in for the view
    const viewFramesNum = frames[nextView];
    console.log("viewFrames", viewFramesNum);
    if (!viewFramesNum || nextPosition >= viewFramesNum) {
        throw new RangeError("Frame " + frame + " is not supported");
    }

    // // normalizes both the (current) view and position values
    // const view = this.element.dataset.view;
    // const position = parseInt(this.element.dataset.position);

    // TODO support pending
    // TODO support safe mode
    // TODO support preventDrag

    class Animation {
        constructor(object3D, duration) {
            this.object3D = object3D;
            this.duration = duration;
            this.progress = 0;
            this.run = true;
            this.finished = false;
        }

        isFinished() {
            return this.finished;
        }

        tick(delta) {
            throw new Error("Not implemented");
        }

        tickMultiplier(delta) {
            return delta * (1 / this.duration);
        }

        start() {
            this.run = true;
        }

        pause() {
            this.run = false;
        }

        finish() {
            this.run = false;
            this.finished = true;
        }
    }

    class ChangeFrameAnimation extends Animation {
        constructor(object3D, duration, view, position) {
            super(object3D, duration);

            // TODO support other views
            if (view !== "side") {
                throw new Error(
                    "Only 'side' view is supported in 'ChangeFrameAnimation' (for now)"
                );
            }

            const radPerSide = (Math.PI * 2) / viewFramesNum;
            const rotYStart = parseFloat(parseFloat(this.object3D.rotation.y).toPrecision(12));
            const rotYEnd = parseFloat(parseFloat(position * radPerSide).toPrecision(12));
            const rotYQty = rotYEnd - rotYStart;

            // don't perform the animation as it's already in the wanted frame
            if (rotYQty === 0) {
                super.finish();
                return;
            }

            this.rotYQty = rotYQty;
            this.rotYEnd = rotYEnd;
            this.currentRotYQty = 0;
        }

        finishAnimation() {
            this.object3D.rotation.y = this.rotYEnd;
            this.finish();
        }

        tick(delta) {
            if (!this.run) return;

            // no animation duration specified so it completes the animation immediately
            if (!this.duration) {
                this.finishAnimation();
                return;
            }

            // calculates the tick rotation and adds it to the rotation axis
            const tickRotYQty = this.rotYQty * this.tickMultiplier(delta);
            this.object3D.rotation.y += tickRotYQty;

            // updates animation progress
            this.currentRotYQty += Math.abs(tickRotYQty);
            if (this.currentRotYQty >= this.rotYQty) this.finishAnimation();
        }
    }
    // TODO ver se já existe animacao deste tipo, se sim remover e criar uma nova

    // TODO, neste momento a animaçao so esta a rotar x rad, tenho de mudar para que ele automaticamente
    // calcule qual é o resultado final que o modelo tem de estar e ajustar o que tem de rodar e quanto

    const animation = new ChangeFrameAnimation(this.modelGroup, 1, nextView, nextPosition);
    this.animations.push(animation);
};

/**
 * Tries to obtain the best possible size for the configurator
 * defaulting to the client with of the element as fallback.
 *
 * @param {Number} size The number of pixels for the viewport both width and height.
 * @param {Number} width The number of pixels for the viewport width.
 * @param {Number} height The number of pixels for the viewport height.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._configuratorSize = function(size, width, height) {
    size = size || this.element.dataset.size || this.size || this.element.clientWidth;
    width = width || this.element.dataset.width || this.width || size;
    height = height || this.element.dataset.height || this.height || size;

    return {
        size: size,
        width: width,
        height: height
    };
};

/**
 * Loads a GLTF file.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @returns {THREE.Mesh} The loaded model.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._loadMeshGLTF = async function(path) {
    const loader = new window.THREE.GLTFLoader();

    if (this.useDracoLoader) {
        const dracoLoader = new window.THREE.DRACOLoader();
        try {
            dracoLoader.setDecoderPath(this.dracoLoaderDecoderPath);
            dracoLoader.preload();
        } catch (error) {
            // loader fallback
            dracoLoader.setDecoderPath(this.dracoLoaderDecoderFallbackPath);
            dracoLoader.preload();
        }
        loader.setDRACOLoader(dracoLoader);
    }

    return new Promise((resolve, reject) => {
        loader.load(path, gltf => resolve(gltf.scene));
    });
};

/**
 * Loads a mesh.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @param {String} format Mesh file format.
 * @returns {THREE.Mesh} The loaded model.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._loadMesh = async function(path, format = "gltf") {
    switch (format) {
        case "gltf":
            return await this._loadMeshGLTF(path);
        default:
            throw new Error(`Can't load 3D model, format "${format}" is not supported`);
    }
};

/**
 * Loads a environment file, which are normally hdr files.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @returns {THREE.Texture} The environment texture.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._loadEnvironment = async function(path) {
    const rgbeLoader = new window.THREE.RGBELoader();
    return new Promise((resolve, reject) => {
        rgbeLoader.load(path, texture => resolve(texture));
    });
};

/**
 * Loads the build scene by setting it's environment and adding it's model to
 * the renderer scene.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._loadScene = async function() {
    // inits the scene clock
    this.clock = new window.THREE.Clock();

    // loads and sets scene environment
    this.environmentTexture = await this._loadEnvironment(this.sceneEnvironmentPath);
    this.environmentTexture.mapping = window.THREE.EquirectangularReflectionMapping;
    this.scene.environment = this.environmentTexture;

    // inits the scene model group
    this.modelGroup = new window.THREE.Group();

    // loads and sets the model mesh
    const meshPath = this.owner.getMeshUrl();
    this.mesh = await this._loadMesh(meshPath);
    this.modelGroup.add(this.mesh);

    this.scene.add(this.modelGroup);
};

/**
 * Renders frame.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._render = function() {
    if (!this.scene) throw new Error("Scene not initiated");
    if (!this.camera) throw new Error("Camera not initiated");
    this.renderer.render(this.scene, this.camera);
};

/**
 * Initializes the layout for the configurator element by
 * constructing all te child elements required for the proper
 * configurator functionality to work.
 *
 * From a DOM perspective this is a synchronous operation,
 * meaning that after its execution the configurator is ready
 * to be manipulated.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initLayout = function() {
    // in case the element is no longer available (possible due to async
    // nature of execution) returns the control flow immediately
    if (!this.element) return;

    // clears the elements children by iterating over them
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    // creates the renderer canvas and adds it to the element
    const renderer = ripe.createElement("div", "renderer");
    this.element.appendChild(renderer);

    // register for all the necessary DOM events
    this._registerHandlers();
};

/**
 * Creates and initiates the renderer scene camera.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initCamera = function() {
    this.camera = new window.THREE.PerspectiveCamera(
        this.cameraOptions.fov,
        this.cameraOptions.aspect,
        this.cameraOptions.near,
        this.cameraOptions.far
    );
    this.camera.position.set(
        this.cameraOptions.posX,
        this.cameraOptions.posY,
        this.cameraOptions.posZ
    );
};

/**
 * Initializes and loads everything needed to run the CSR. This means
 * initializing the renderer, it's camera and it's scene.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initCsr = async function() {
    if (!this.element) throw new Error("CSR layout elements are not initiated");

    // gets configurator size information
    const size = this._configuratorSize();

    // init renderer
    this.renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(size.width, size.height);
    this.renderer.setAnimationLoop(() => this._onAnimationLoop(this));

    const renderer = this.element.querySelector(".renderer");
    renderer.appendChild(this.renderer.domElement);

    // calculates the camera aspect ratio
    if (this.cameraOptions.aspect === null) {
        this.cameraOptions.aspect = size.width / size.height;
    }

    // init camera
    this._initCamera();

    // init scene
    this.scene = new window.THREE.Scene();
    await this._loadScene();

    this._render();
};

/**
 * Cleanups everything related to CSR.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._deinitCsr = function() {
    if (this.environmentTexture) {
        this.environmentTexture.dispose();
        this.environmentTexture = null;
    }

    if (this.modelGroup) {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
            this.modelGroup.remove(this.mesh);
            this.mesh = null;
        }
        this.modelGroup = null;
    }

    if (this.scene) this.scene = null;

    if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
    }

    if (this.camera) this.camera = null;
};

/**
 * Do the resize operation for every CSR element.
 *
 * @param {Number} width The number of pixels to resize to.
 * @param {Number} height The number of pixels to resize to.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._resizeCsr = function(width, height) {
    // resizes renderer
    this.renderer.setSize(width, height);

    // updates the camera aspect ratio
    if (this.cameraOptions.updateAspectOnResize || this.cameraOptions.aspect === null) {
        this.cameraOptions.aspect = width / height;
    }

    // creates a new camera respecting the new renderer size
    this._initCamera();
};

/**
 * Normalizes a THREE.Object3D rotation setting it's axis only with positive
 * values ranging from 0 to 2 PI.
 *
 * @param {THREE.Object3D} object3D An instance of a THREE.Object3D.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._normalizeRotations = function(object3D) {
    if (!object3D) return;

    const range = Math.PI * 2;
    let x = object3D.rotation.x % range;
    let y = object3D.rotation.y % range;
    let z = object3D.rotation.z % range;
    x = x < 0 ? x + range : x;
    y = y < 0 ? y + range : y;
    z = z < 0 ? z + range : z;
    object3D.rotation.x = x;
    object3D.rotation.y = y;
    object3D.rotation.z = z;
};

/**
 * Animation loop tick.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._onAnimationLoop = function(self) {
    // processes the animation loop tick delta
    const delta = this.clock.getDelta();

    if (!self.modelGroup) return;

    if (self.animations.length > 0) {
        // ticks animations
        for (let i = self.animations.length - 1; i >= 0; i--) {
            const animation = self.animations[i];
            animation.tick(delta);

            if (animation.isFinished()) self.animations.splice(i, 1);
        }

        // normalizes the model group rotation
        // this._normalizeRotations(self.modelGroup);
    }

    // renders a frame
    self._render();
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onMouseDown = function(self, event) {
    self.isMouseDown = true;
    self.referenceX = event.pageX;
    self.referenceY = event.pageY;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onMouseUp = function(self, event) {
    self.isMouseDown = false;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onMouseLeave = function(self, event) {
    self.isMouseDown = false;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onMouseMove = function(self, event) {
    if (!self.isMouseDown) return;
    if (!self.modelGroup) return;

    const mousePosX = event.pageX;
    const mousePosY = event.pageY;
    const deltaX = self.referenceX - mousePosX;
    const deltaY = self.referenceY - mousePosY;
    const elementWidth = self.element.clientWidth;
    const elementHeight = self.element.clientHeight;
    const percentX = deltaX / elementWidth;
    const percentY = deltaY / elementHeight;
    const sensitivity = self.sensitivity * 0.1;

    const dragValueX = (percentX - self.prevPercentX) * sensitivity;
    self.modelGroup.rotation.y -= dragValueX;

    const dragValueY = (percentY - self.prevPercentY) * sensitivity;
    self.modelGroup.rotation.x -= dragValueY;

    self.prevPercentX = percentX;
    self.prevPercentY = percentY;
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._registerHandlers = function() {
    this._addElementHandler("mousedown", event => this._onMouseDown(this, event));
    this._addElementHandler("mouseup", event => this._onMouseUp(this, event));
    this._addElementHandler("mouseleave", event => this._onMouseLeave(this, event));
    this._addElementHandler("mousemove", event => this._onMouseMove(this, event));
};
