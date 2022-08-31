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

    // TODO init common stuff in another method shared between configurators
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.format = this.options.format || null;
    this.size = this.options.size || null;
    this.mutations = this.options.mutations || false;
    this.maxSize = this.options.maxSize || 1000;
    this.pixelRatio =
        this.options.pixelRatio || (typeof window !== "undefined" && window.devicePixelRatio) || 2;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.clickThreshold = this.options.clickThreshold || 0.015;
    this.duration = this.options.duration || 500;
    this.preloadDelay = this.options.preloadDelay || 150;
    this.maskOpacity = this.options.maskOpacity || 0.4;
    this.maskDuration = this.options.maskDuration || 150;
    this.noMasks = this.options.noMasks === undefined ? undefined : this.options.noMasks;
    this.useMasks =
        this.options.useMasks === undefined
            ? this.noMasks === undefined
                ? undefined
                : !this.noMasks
            : this.options.useMasks;
    this.useDefaultSize = this.options.useDefaultSize || true;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;
    this.configAnimate =
        this.options.configAnimate === undefined ? "cross" : this.options.configAnimate;
    this.viewAnimate = this.options.viewAnimate === undefined ? "cross" : this.options.viewAnimate;
    this.ready = false;
    this._finalize = null;
    this._observer = null;
    this._ownerBinds = {};
    this._pending = [];
    this.frameSize = null;

    // TODO CSR specific variables
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.environmentTexture = null;
    this.mesh = null;

    // TODO handlers specific variables
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
    await this.cancel();

    this._unregisterHandlers();
    this._deinitCsr();

    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    for (const bind in this._ownerBinds) {
        this.owner.unbind(bind, this._ownerBinds[bind]);
    }

    this._removeElementHandlers();

    if (this._observer) this._observer.disconnect();

    this._finalize = null;
    this._observer = null;

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Updates configurator current options with the ones provided.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator, such as:
 * - 'sensitivity' - Rotation sensitivity to the user mouse drag action.
 * - 'duration' - The duration in milliseconds that the transition should take.
 * - 'useMasks' - Usage of masks in the current model, necessary for the part highlighting action.
 * - 'configAnimate' - The configurator animation style: 'simple' (fade in), 'cross' (crossfade) or 'null'.
 * @param {Boolean} update If an update operation should be executed after
 * the options updated operation has been performed.
 */
ripe.ConfiguratorCsr.prototype.updateOptions = async function(options, update = true) {
    ripe.Visual.prototype.updateOptions.call(this, options);

    this.width = options.width === undefined ? this.width : options.width;
    this.height = options.height === undefined ? this.height : options.height;
    this.format = options.format === undefined ? this.format : options.format;
    this.size = options.size === undefined ? this.size : options.size;
    this.mutations = options.mutations === undefined ? this.mutations : options.mutations;
    this.maxSize = options.maxSize === undefined ? this.maxSize : this.maxSize;
    this.pixelRatio = options.pixelRatio === undefined ? this.pixelRatio : options.pixelRatio;
    this.sensitivity = options.sensitivity === undefined ? this.sensitivity : options.sensitivity;
    this.verticalThreshold =
        options.verticalThreshold === undefined
            ? this.verticalThreshold
            : options.verticalThreshold;
    this.clickThreshold =
        options.clickThreshold === undefined ? this.clickThreshold : options.clickThreshold;
    this.duration = options.duration === undefined ? this.duration : options.duration;
    this.preloadDelay =
        options.preloadDelay === undefined ? this.preloadDelay : options.preloadDelay;
    this.maskOpacity = options.maskOpacity === undefined ? this.maskOpacity : options.maskOpacity;
    this.maskDuration =
        options.maskDuration === undefined ? this.maskDuration : options.maskDuration;
    this.noMasks = options.noMasks === undefined ? this.noMasks : options.noMasks;
    this.useMasks =
        this.options.useMasks === undefined
            ? this.noMasks === undefined
                ? this.noMasks
                : !this.noMasks
            : this.options.useMasks;
    this.useDefaultSize =
        options.useDefaultSize === undefined ? this.useDefaultSize : options.useDefaultSize;
    this.configAnimate =
        options.configAnimate === undefined ? this.configAnimate : options.configAnimate;
    this.viewAnimate = options.viewAnimate === undefined ? this.viewAnimate : options.viewAnimate;

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
 * @param {Object} options Set of optional parameters to adjust the Configurator update, such as:
 * - 'animate' - If it's to animate the update (defaults to 'false').
 * - 'duration' - The duration in milliseconds that the transition should take.
 * - 'callback' - The callback to be called at the end of the update.
 * - 'preload' - If it's to execute the pre-loading process.
 * - 'force' - If the updating operation should be forced (ignores signature).
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

    // TODO
    const result = true;

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
    // TODO
};

/**
 * Resizes the configurator's DOM element to 'size' pixels.
 * This action is performed by setting both the attributes from
 * the HTML elements and the style.
 *
 * @param {Number} size The number of pixels to resize to.
 */
ripe.ConfiguratorCsr.prototype.resize = async function(size, width, height) {
    if (this.element === undefined) {
        return;
    }

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

ripe.ConfiguratorCsr.prototype._loadMeshGLTF = async function(path) {
    const dracoLoader = new window.THREE.DRACOLoader();
    try {
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
        dracoLoader.preload();
    } catch (error) {
        // loader fallback
        const fallbackURL =
            "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/";
        dracoLoader.setDecoderPath(fallbackURL);
        dracoLoader.preload();
    }

    const loader = new window.THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    return new Promise((resolve, reject) => {
        loader.load(path, gltf => resolve(gltf.scene));
    });
};

ripe.ConfiguratorCsr.prototype._loadMesh = async function(path, format = "gltf") {
    switch (format) {
        case "gltf":
            return await this._loadMeshGLTF(path);
        default:
            throw new Error(`Can't load 3D model, format "${format}" is not supported`);
    }
};

ripe.ConfiguratorCsr.prototype._loadEnvironment = function(path) {
    const rgbeLoader = new window.THREE.RGBELoader();
    return new Promise((resolve, reject) => {
        rgbeLoader.load(path, texture => resolve(texture));
    });
};

ripe.ConfiguratorCsr.prototype._loadScene = async function() {
    // TODO don't use hardcoded path
    const envPath = "https://www.dl.dropboxusercontent.com/s/o0v07nn5egjrjl5/studio2.hdr";
    this.environmentTexture = await this._loadEnvironment(envPath);
    this.environmentTexture.mapping = window.THREE.EquirectangularReflectionMapping;
    this.scene.environment = this.environmentTexture;

    const meshPath = this.owner.getMeshUrl();
    this.mesh = await this._loadMesh(meshPath);
    this.scene.add(this.mesh);
};

ripe.ConfiguratorCsr.prototype._initCamera = function(width, height) {
    this.camera = new window.THREE.PerspectiveCamera(45, width / height, 0.15, 50);
    this.camera.position.set(0, 0, 5);
};

/**
 * Initializes and loads everything needed to run the CSR.
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

    // resizes camera
    this._initCamera(width, height);
};

ripe.ConfiguratorCsr.prototype._onMouseDown = function(self, event) {
    self.isMouseDown = true;
    self.referenceX = event.pageX;
    self.referenceY = event.pageY;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
    console.log("mousedown:", self.referenceX, self.referenceY);
};

ripe.ConfiguratorCsr.prototype._onMouseUp = function(self, event) {
    self.isMouseDown = false;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
    console.log("mouseup:", event);
};

ripe.ConfiguratorCsr.prototype._onMouseLeave = function(self, event) {
    self.isMouseDown = false;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
    console.log("mouseleave:", event);
};

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
