if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

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
ripe.ConfiguratorCSR = function(owner, element, options) {
    this.type = this.type || "ConfiguratorCSR";

    ripe.Visual.call(this, owner, element, options);
};

ripe.ConfiguratorCSR.prototype = ripe.build(ripe.Visual.prototype);
ripe.ConfiguratorCSR.prototype.constructor = ripe.ConfiguratorCSR;

/**
 * The Configurator initializer, which is called whenever
 * the Configurator is going to become active.
 *
 * Sets the various values for the Configurator taking into
 * owner's default values.
 */
ripe.ConfiguratorCSR.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    this.width = this.options.width || 1000;
    this.height = this.options.height || 1000;
    this.format = this.options.format || null;
    this.size = this.options.size || null;
    this.maxSize = this.options.maxSize || 1000;
    this.pixelRatio =
        this.options.pixelRatio || (typeof window !== "undefined" && window.devicePixelRatio) || 2;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.clickThreshold = this.options.clickThreshold || 0.015;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;
    this.duration = this.options.duration || 500;
    this.configAnimate =
        this.options.configAnimate === undefined ? "cross" : this.options.configAnimate;
    this.ready = false;
    this._finalize = null;
    this._observer = null;
    this._ownerBinds = {};
    this.viewAnimate =
        this.options.viewAnimate === undefined ? "crossfade" : this.options.viewAnimate;
    this.positionAnimate =
        this.options.positionAnimate === undefined ? "rotate" : this.options.positionAnimate;

    // registers for the selected part event on the owner
    // so that we can highlight the associated part
    this._ownerBinds.selected_part = this.owner.bind("selected_part", part =>
        this.renderer.highlight(part)
    );

    // registers for the deselected part event on the owner
    // so that we can remove the highlight of the associated part
    this._ownerBinds.deselected_part = this.owner.bind("deselected_part", part =>
        this.renderer.lowlight()
    );

    // creates the necessary DOM elements and runs
    // the initial layout update operation if the
    // owner has a model and brand set (is ready)
    this._initLayout();

    if (this.owner.brand && this.owner.model) {
        this._updateConfig();
    }

    // registers for the pre config to be able to set the configurator
    // into a not ready state (update operations blocked)
    this._ownerBinds.pre_config = this.owner.bind("pre_config", () => {
        this.ready = false;
    });

    // registers for the post config change request event to
    // be able to properly update the internal structures
    this._ownerBinds.post_config = this.owner.bind("post_config", config => {
        if (config) this._updateConfig();
    });

    this.options.library.Cache.enabled = false;
    this.options.library.Cache.clear();

    this.renderer = new ripe.CSRenderer(this.owner, this.element, this.options);
    this.controls = new ripe.OrbitalControls(this, this.element, this.options);
    this.initials = new ripe.CSRInitials(this.owner, this.options);

    // wait until configurator finished initializing to create the controls and
    // renderer
    this.assetManager = new ripe.CSRAssetManager(this, this.owner, this.options);
    this.crossfadeQueue = [];
};

/**
 * Called only after the GLTF is finished loading by the asset manager, begins
 * initialization of the renderer and initials assistant.
 */
ripe.ConfiguratorCSR.prototype.initializeLoading = function() {
    this.initials.initialize(this.assetManager);
    this.renderer.initialize(this.assetManager);
};

/**
 * The Configurator deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.ConfiguratorCSR.prototype.deinit = async function() {
    await this.cancel();

    await this.disposeResources();

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
 * Called when deinitializing the Configurator, begins the disposal of
 * all the stored resources.
 */
ripe.ConfiguratorCSR.prototype.disposeResources = async function() {
    await this.renderer.disposeResources();
    await this.initials.disposeResources();
    await this.assetManager.disposeResources();
};

/**
 * Updates configurator current options with the ones provided.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator, such as:
 * - 'sensitivity' - Rotation sensitivity to the user mouse drag action.
 * - 'duration' - The duration in milliseconds that the transition should take.
 * - 'useMasks' - Usage of masks in the current model, necessary for the part highlighting action.
 * - 'viewAnimate' - Type of transition when changing views, can be "rotate", "crossfade" or "none"
 * - 'positionAnimate' - Similar to 'viewAnimate', but applied when the changeFrame only alters
 * the position
 * @param {Boolean} update If an update operation should be executed after
 * the options updated operation has been performed.
 */
ripe.ConfiguratorCSR.prototype.updateOptions = async function(options, update = true) {
    ripe.Visual.prototype.updateOptions.call(this, options);

    console.log("Updating options?");

    this.renderer.updateOptions(options);
    this.controls.updateOptions(options);
    this.assetManager.updateOptions(options);
    this.initials.updateOptions(options);

    this.width = options.width === undefined ? this.width : options.width;
    this.height = options.height === undefined ? this.height : options.height;
    this.format = options.format === undefined ? this.format : options.format;
    this.size = options.size === undefined ? this.size : options.size;
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
    this.configAnimate =
        options.configAnimate === undefined ? this.configAnimate : options.configAnimate;
    this.viewAnimate = options.viewAnimate === undefined ? this.viewAnimate : options.viewAnimate;
    this.positionAnimate =
        options.positionAnimate === undefined ? this.positionAnimation : options.positionAnimation;

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
 * - 'reason' - The motive that prompted the update.
 * - 'duration' - The duration in milliseconds that the transition should take.
 */
ripe.ConfiguratorCSR.prototype.update = async function(state, options = {}) {
    // in case the configurator is currently not ready for an
    // update none is performed and the control flow is returned
    // with the false value (indicating a no-op, nothing was done)
    if (this.ready === false) {
        this.trigger("not_loaded");
        return false;
    }

    const duration = options.duration || 500;

    if (!this.renderer) return;

    // crossfade when changing materials
    if (options.reason && options.reason.includes("set part")) {
        await this.renderer.crossfade({ duration: duration, parts: this.owner.parts }, "material");
    }

    if (this.element.classList.contains("crossfading")) return;

    // removes the current text meshes from the scene, and adds the newly
    // generated meshes
    if (options.reason && options.reason === "set initials") {
        this.renderer.updateInitials("remove", this.initials.textMeshes);
        await this.initials.update();
        this.renderer.updateInitials("add", this.initials.textMeshes);
        this.renderer.render();
    }

    // removes the highlight support from the matched object as a new
    // frame is going to be "calculated" and rendered (not same mask)
    this.renderer.lowlight();

    // returns the resulting value indicating if the loading operation
    // as been triggered with success (effective operation)
    return true;
};

/**
 * Updates the elements dataset position and view when rotating or changing views.
 */
ripe.ConfiguratorCSR.prototype.updateViewPosition = function(newPos, newView) {
    this.position = newPos;
    this.view = newView;

    this.element.dataset.position = newPos;
    this.element.dataset.view = newView;
};

/**
 * Function to perform a rotation, triggered by the controls. Assesses whether a transition
 * is necessary, and if so, calls the correct function to handle the transition depending
 * on the Configurator's settings.
 * @param {*} options Set of parameters that guide the rotation such as:
 * - 'rotationX' - The new horizontal rotation for the camera.
 * - 'rotationY' - The new vertical rotation for the camera.
 * - 'distance' - The new camera distance.
 * @param {*} isAnimated Decides whether it is a simple rotation (such as when dragging), and
 * if so, no animation transition is triggered.
 */
ripe.ConfiguratorCSR.prototype.rotate = async function(options, isAnimated = true) {
    const newPos = this.controls._rotationToPosition(options.rotationX);
    const newView = this.controls._rotationToView(options.rotationY);

    // simple rotate, without applying any transitions
    if (!isAnimated) {
        this.renderer.rotate(options);
        this.renderer.render();
        this.updateViewPosition(newPos, newView);
        return;
    }

    // checks to see if transition is required, and delegates
    // the transition to the controls in case of rotation, and
    // the renderer in case of a crossfade
    if (this.view !== newView) {
        if (this.viewAnimate === "crossfade") {
            await this.renderer.crossfade(options, "rotation");
            // updates the internal angles of the controls after
            // the crossfade finishes
            this.controls._updateAngles(options);
        } else if (this.viewAnimate === "rotate") {
            this.controls.rotationTransition(options);
        } else if (this.viewAnimate === "none") {
            this.renderer.rotate(options);
        }
    } else if (this.position !== newPos) {
        if (this.positionAnimate === "crossfade") {
            await this.renderer.crossfade(options, "rotation");
            this.controls._updateAngles(options);
        } else if (this.positionAnimate === "rotate") {
            this.controls.rotationTransition(options);
        } else if (this.positionAnimate === "none") {
            this.renderer.rotate(options);
        }
    }

    // update configurator view and position variables
    this.updateViewPosition(newPos, newView);
};

/**
 * This function is called (by the owner) whenever the current operation
 * in the child should be canceled this way a Configurator is not updated.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator.
 */
ripe.ConfiguratorCSR.prototype.cancel = async function(options = {}) {
    if (this._finalize) this._finalize({ canceled: true });
    return true;
};

/**
 * Resizes the configurator's DOM element to 'size' pixels.
 * This action is performed by setting both the attributes from
 * the HTML elements and the style.
 *
 * @param {Number} size The number of pixels to resize to.
 */
ripe.ConfiguratorCSR.prototype.resize = async function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.clientWidth;
    if (this.currentSize === size) {
        return;
    }

    const area = this.element.querySelector(".area");

    area.width = size;
    area.height = size;
    area.style.width = size + "px";
    area.style.height = size + "px";
    this.currentSize = size;

    // on the resize of the configurator, the renderer needs to update
    // the bounding box to maintain correct raycasts
    if (this.renderer) {
        this.renderer.updateSize();
    }

    await this.update({});
};

/**
 * Resizes the Configurator to the defined maximum size.
 */
ripe.ConfiguratorCSR.prototype.enterFullscreen = async function() {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    const maxSize = this.element.dataset.max_size || this.maxSize;
    await this.resize(maxSize);
};

/**
 * Resizes the Configurator to the prior defined size.
 */
ripe.ConfiguratorCSR.prototype.leaveFullscreen = async function() {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    await this.resize();
};

/**
 * Turns on (enables) the masks on selection/highlight.
 */
ripe.ConfiguratorCSR.prototype.enableMasks = function() {
    if (this.renderer) this.renderer.useMasks = true;
};

/**
 * Turns off (disables) the masks on selection/highlight.
 */
ripe.ConfiguratorCSR.prototype.disableMasks = function() {
    if (this.renderer) this.renderer.useMasks = false;
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
ripe.ConfiguratorCSR.prototype._initLayout = function() {
    // clears the elements children
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    // creates the area canvas and adds it to the element
    const area = ripe.createElement("div", "area");
    this.element.appendChild(area);

    // set the size of area, frontMask, back and mask
    this.resize();

    // sets the initial view and position
    this.element.dataset.view = this.view;
    this.element.dataset.position = this.position;

    // set the size of area, frontMask, back and mask
    this.resize();
};

/**
 * Displays a new frame, with an animation from the starting frame
 * proper animation should be performed.
 *
 * This function is meant to be executed using a recursive approach
 * and each run represents a "tick" of the animation operation.
 *
 * @param {Object} frame The new frame to display using the extended and canonical
 * format for the frame description (eg: side-3).
 * @param {Object} options Set of optional parameters to adjust the change frame, such as:
 * - 'type' - The animation style: 'simple' (fade in), 'cross' (crossfade) or 'null'
 * (without any style).
 * - 'duration' - The duration of the animation in milliseconds (defaults to 'null').
 * - 'stepDuration' - If defined the total duration of the animation is
 * calculated using the amount of steps times the number of steps, instead of
 * using the 'duration' field (defaults to 'null').
 * - 'revolutionDuration' - If defined the step duration is calculated by dividing
 * the revolution duration by the number of frames in the view (defaults to 'null').
 * - 'preventDrag' - If drag actions during an animated change of frames should be
 * ignored (defaults to 'true').
 * - 'safe' - If requested then the operation is only performed in case the configurator
 * is not in the an equivalent state (default to 'true').
 */
ripe.ConfiguratorCSR.prototype.changeFrame = async function(frame, options = {}) {
    if (this.element.classList.contains("animating")) return;

    this.controls.updateRotation(frame, options);

    await this.update();
};

/**
 * @ignore
 */
ripe.ConfiguratorCSR.prototype._updateConfig = async function(animate) {
    // sets ready to false to temporarily block
    // update requests while the new config
    // is being loaded
    this.ready = false;

    if (this.renderer) {
        // removes the highlight from any part
        this.renderer.lowlight();
    }

    // retrieves the new product frame object and sets it
    // under the current state, adapting then the internal
    // structures to accommodate the possible changes in the
    // frame structure
    this.frames = await this.owner.getFrames();

    // tries to keep the current view and position
    // if the new model supports it otherwise
    // changes to a supported frame
    let view = this.element.dataset.view;
    let position = parseInt(this.element.dataset.position);
    const maxPosition = this.frames[view];
    if (!maxPosition) {
        view = Object.keys(this.frames)[0];
        position = 0;
    } else if (position >= maxPosition) {
        position = 0;
    }

    // updates the instance values for the configurator view
    // and position so that they reflect the current visuals
    this.view = view;
    this.position = position;

    // updates the number of frames in the initial view
    // taking into account the requested frames data
    const viewFrames = this.frames[view];
    this.element.dataset.frames = viewFrames;

    // updates the attributes related with both the view
    // and the position for the current model
    this.element.dataset.view = view;
    this.element.dataset.position = position;

    // marks the current configurator as ready and triggers
    // the associated ready event to any event listener
    this.ready = true;
    this.trigger("ready");

    // adds the config visual class indicating that
    // a configuration already exists for the current
    // interactive configurator (meta-data)
    this.element.classList.add("ready");

    // shows the new product with a crossfade effect
    // and starts responding to updates again
    this.update({});
};
