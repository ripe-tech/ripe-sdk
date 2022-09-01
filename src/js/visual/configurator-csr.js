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
ripe.ConfiguratorCsr.prototype.init = async function() {
    ripe.Visual.prototype.init.call(this);

    // options variables
    this.dracoLoaderDecoderPath =
        this.options.dracoLoaderDecoderPath || "https://www.gstatic.com/draco/v1/decoders/";
    this.dracoLoaderDecoderFallbackPath =
        this.options.dracoLoaderDecoderFallbackPath ||
        "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/";
    this.sceneEnvironmentPath =
        this.options.sceneEnvironmentPath ||
        "https://www.dl.dropboxusercontent.com/s/o0v07nn5egjrjl5/studio2.hdr";

    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.format = this.options.format || null;
    this.size = this.options.size || null;
    this.pixelRatio =
        this.options.pixelRatio || (typeof window !== "undefined" && window.devicePixelRatio) || 2;
    this.sensitivity = this.options.sensitivity || 40;

    // general state variables
    this.ready = false;
    this.currentSize = 0;
    this.currentWidth = 0;
    this.currentHeight = 0;

    // CSR variables
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.environmentTexture = null;
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
    await this._initCsr();
};

/**
 * The Configurator deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.ConfiguratorCsr.prototype.deinit = async function() {
    this._unregisterHandlers();
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
    // in case the configurator is currently nor ready for an
    // update none is performed and the control flow is returned
    // with the false value (indicating a no-op, nothing was done)
    if (this.ready === false) {
        this.trigger("not_loaded");
        return false;
    }

    const result = true;
    this.trigger("loaded");

    // returns the final result of the underlying update execution
    // to the caller method (may contain the canceled field)
    return result;
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
 * Tries to obtain the best possible size for the configurator
 * defaulting to the client with of the element as fallback.
 *
 * @param {Number} size The number of pixels.
 * @param {Number} width The number of pixels.
 * @param {Number} height The number of pixels.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._configuratorSize = function(size, width, height) {
    size = size || this.size || this.element.clientWidth;
    width = width || this.element.dataset.width || this.width || size;
    height = height || this.element.dataset.height || this.height || size;

    return {
        size: size,
        width: width,
        height: height
    };
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
 * Loads a GLTF file.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @returns {THREE.Mesh} The loaded model.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._loadMeshGLTF = async function(path) {
    const dracoLoader = new window.THREE.DRACOLoader();
    try {
        dracoLoader.setDecoderPath(this.dracoLoaderDecoderPath);
        dracoLoader.preload();
    } catch (error) {
        // loader fallback
        dracoLoader.setDecoderPath(this.dracoLoaderDecoderFallbackPath);
        dracoLoader.preload();
    }

    const loader = new window.THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
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
ripe.ConfiguratorCsr.prototype._loadEnvironment = function(path) {
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
    // loads and sets scene environment
    this.environmentTexture = await this._loadEnvironment(this.sceneEnvironmentPath);
    this.environmentTexture.mapping = window.THREE.EquirectangularReflectionMapping;
    this.scene.environment = this.environmentTexture;

    // loads and sets the model mesh
    const meshPath = this.owner.getMeshUrl();
    this.mesh = await this._loadMesh(meshPath);
    this.scene.add(this.mesh);
};

/**
 * Creates and initiates the renderer scene camera.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initCamera = function(width, height) {
    // TODO configurable camera
    this.camera = new window.THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    this.camera.position.set(0, 0, 50);
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

    // init camera
    this._initCamera(size.width, size.height);

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

    if (this.mesh) {
        if (this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh.material) this.mesh.material.dispose();
        if (this.scene) this.scene.remove(this.mesh);
        this.mesh = null;
    }

    if (this.scene) this.scene = null;

    if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
    }

    if (this.camera) this.camera = null;
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
 * Animation loop tick.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._onAnimationLoop = function(self) {
    self._render();
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

    // creates a new camera respecting the new renderer size
    this._initCamera(width, height);
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
    if (!this.isMouseDown) return;
    if (!this.mesh) return;

    // TODO add other no drag checks

    const mousePosX = event.pageX;
    const mousePosY = event.pageY;
    const deltaX = self.referenceX - mousePosX;
    const deltaY = self.referenceY - mousePosY;
    const elementWidth = self.element.clientWidth;
    const elementHeight = self.element.clientHeight;
    const percentX = deltaX / elementWidth;
    const percentY = deltaY / elementHeight;
    const sensitivity = this.sensitivity * 0.1;

    const dragValueX = (percentX - this.prevPercentX) * sensitivity;
    self.mesh.rotation.y -= dragValueX;

    const dragValueY = (percentY - this.prevPercentY) * sensitivity;
    self.mesh.rotation.x -= dragValueY;

    this.prevPercentX = percentX;
    this.prevPercentY = percentY;
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

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._unregisterHandlers = function() {
    // TODO
};
