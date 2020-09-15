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
    this.mutations = this.options.mutations || false;
    this.maxSize = this.options.maxSize || 1000;
    this.pixelRatio =
        this.options.pixelRatio || (typeof window !== "undefined" && window.devicePixelRatio) || 2;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.clickThreshold = this.options.clickThreshold || 0.015;
    this.interval = this.options.interval || 0;
    this.duration = this.options.duration || 500;
    this.preloadDelay = this.options.preloadDelay || 150;
    this.maskOpacity = this.options.maskOpacity || 0.4;
    this.maskDuration = this.options.maskDuration || 150;
    this.noMasks = this.options.noMasks === undefined ? true : this.options.noMasks;
    this.useMasks = this.options.useMasks === undefined ? !this.noMasks : this.options.useMasks;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;
    this.cameraDistance = this.options.cameraDistance || 0;
    this.cameraHeight = this.options.cameraHeight || 0;
    this.exposure = this.options.exposure || 3.0;
    this.configAnimate =
        this.options.configAnimate === undefined ? "cross" : this.options.configAnimate;
    this.viewAnimate = this.options.viewAnimate === undefined ? "cross" : this.options.viewAnimate;
    this.ready = false;
    this._finalize = null;
    this._observer = null;
    this._ownerBinds = {};
    this._enabled = true;

    this.maximumHorizontalRot = this.options.maximumHorizontalRot || 180;
    this.minimumHorizontalRot = this.options.minimumHorizontalRot || -180;

    this.maximumVerticalRot = this.options.maximumVerticalRot || 90;
    this.minimumVerticalRot = this.options.minimumVerticalRot || 0;

    this.horizontalRot = this._positionToRotation(this.position);
    this._currentHorizontalRot = this.horizontalRot;
    this.verticalRot = 0;
    this._currentVerticalRot = this.verticalRot;

    this.meshPath = this.options.meshPath || undefined;
    this.library = this.options.library || null;
    this.cameraTarget = new this.library.Vector3(
        this.options.cameraTarget.x,
        this.options.cameraTarget.y,
        this.options.cameraTarget.z
    );
    this.cameraFOV = this.options.cameraFOV;

    // materials
    this.texturesPath = this.options.texturesPath || "";
    this.partsMap = this.options.partsMap || {};
    this.loadedMaterials = {};

    this.raycaster = new this.library.Raycaster();
    this.intersectedPart = "";

    // registers for the selected part event on the owner
    // so that we can highlight the associated part
    this._ownerBinds.selected_part = this.owner.bind("selected_part", part => this.highlight(part));

    // registers for the deselected part event on the owner
    // so that we can remove the highlight of the associated part
    this._ownerBinds.deselected_part = this.owner.bind("deselected_part", part => this.lowlight());

    // creates a structure the store the last presented rotation
    // of the meshes as well as the camera rotation to be used
    // when returning to a view for better user experience
    this._lastFrame = {};

    // creates the necessary DOM elements and runs
    // the initial layout update operation if the
    // owner has a model and brand set (is ready)
    this._initLayout();
    // register for all the necessary DOM events
    this._registerHandlers();

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

    // initialize all ThreeJS components
    this._initializeLights();
    this._initializeCamera();
    this._initializeRenderer();
    this._initializeMesh();
};

/**
 * Converts the position of the element to a rotation that can be applied to
 * the model or the camera;
 */
ripe.ConfiguratorCSR.prototype._positionToRotation = function(position) {
    return (position / 24) * 360;
};

/**
 * The Configurator deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.ConfiguratorCSR.prototype.deinit = async function() {
    await this.cancel();

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

    this._disposeResources();

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Disposes all the stored resources to avoid memory leaks. Includes meshes,
 * geometries and materials.
 */
ripe.ConfiguratorCSR.prototype._disposeResources = function() {
    if (this.meshes) {
        for (var mesh in this.meshes) {
            this.scene.remove(this.meshes[mesh]);
            this.meshes[mesh].geometry.dispose();
            this.meshes[mesh].material.dispose();
        }
    }
    if (this.loadedMaterials) {
        for (var material in this.loadedMaterials) {
            this.loadedMaterials[material].dispose();
        }
    }
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
ripe.ConfiguratorCSR.prototype.updateOptions = async function(options, update = true) {
    ripe.Visual.prototype.updateOptions.call(this, options);

    if (options.meshPath && this.meshPath !== options.meshPath) {
        this.meshPath = this.options.meshPath;
        this._initializeMesh();
    }
    // this.library = options.library === undefined ? this.library : options.library;
    this.width = options.width === undefined ? this.width : options.width;
    this.height = options.height === undefined ? this.height : options.height;
    this.format = options.format === undefined ? this.format : options.format;
    this.size = options.size === undefined ? this.size : options.size;
    this.mutations = options.mutations === undefined ? this.mutations : options.mutations;
    this.maxSize = options.maxSize === undefined ? this.maxSize : this.maxSize;
    this.pixelRatio = options.pixelRation === undefined ? this.pixelRatio : options.pixelRatio;
    this.sensitivity = options.sensitivity === undefined ? this.sensitivity : options.sensitivity;
    this.verticalThreshold =
        options.verticalThreshold === undefined
            ? this.verticalThreshold
            : options.verticalThreshold;
    this.clickThreshold =
        options.clickThreshold === undefined ? this.clickThreshold : options.clickThreshold;
    this.interval = options.interval === undefined ? this.interval : options.interval;
    this.duration = options.duration === undefined ? this.duration : options.duration;
    this.preloadDelay =
        options.preloadDelay === undefined ? this.preloadDelay : options.preloadDelay;
    this.maskOpacity = options.maskOpacity === undefined ? this.maskOpacity : options.maskOpacity;
    this.maskDuration =
        options.maskDuration === undefined ? this.maskDuration : options.maskDuration;
    this.noMasks = options.noMasks === undefined ? this.noMasks : options.noMasks;
    this.useMasks = options.useMasks === undefined ? this.useMasks : options.useMasks;
    this.configAnimate =
        options.configAnimate === undefined ? this.configAnimate : options.configAnimate;
    this.viewAnimate = options.viewAnimate === undefined ? this.viewAnimate : options.viewAnimate;

    // TODO Update this here with newer structures
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
 */
ripe.ConfiguratorCSR.prototype.update = async function(state, options = {}) {
    // in case the configurator is currently nor ready for an
    // update none is performed and the control flow is returned
    // with the false value (indicating a no-op, nothing was done)

    if (this.ready === false) {
        this.trigger("not_loaded");
        return false;
    }

    if (!this._enabled) {
        return;
    }

    var needsUpdate = false;

    const animating = this.element.classList.contains("animating");
    const dragging = this.element.classList.contains("drag");

    // If the user is dragging
    if (dragging) {
        needsUpdate = this._setContinuousRotations();
    }

    if (options.reason === "set parts" || options.reason === "set part") {
        await this._assignMaterials();
        await this.crossfade({ type: "material" });
    }

    // removes the highlight support from the matched object as a new
    // frame is going to be "calculated" and rendered (not same mask)
    this.lowlight();

    if (needsUpdate || animating) this.render();

    // returns the resulting value indicating if the loading operation
    // as been triggered with success (effective operation)
    return true;
};

/**
 * Sets the rotation of the camera and meshes based on their current
 * continuous rotation.
 */
ripe.ConfiguratorCSR.prototype._setContinuousRotations = function() {
    var needsUpdate = false;

    // horizontal rotation is done by rotating the meshes, vertical
    // is done to the camera, easier to avoid any problems with rotation
    if (this.meshes && this.horizontalRot - this.mouseDeltaX !== this._currentHorizontalRot) {
        this._currentHorizontalRot = this.horizontalRot - this.mouseDeltaX;

        needsUpdate = true;

        this._rotateMeshes();
    }

    var diff;
    if (this.camera && this.verticalRot + this.mouseDeltaY !== this._currentVerticalRot) {
        if (this.mouseDeltaY >= this.maximumVerticalRot - this.verticalRot) {
            diff = this.mouseDeltaY - (this.maximumVerticalRot - this.verticalRot);

            this.referenceY -= diff;
            this.mouseDeltaY += diff;
        } else if (this.mouseDeltaY <= this.minimumVerticalRot - this.verticalRot) {
            diff = this.mouseDeltaY + (this.minimumVerticalRot + this.verticalRot);

            this.referenceY -= diff;
            this.mouseDeltaY += diff;
        } else {
            // only rotate the camera when the input doesn't exceed the maximum allower rotation
            this._currentVerticalRot = this.verticalRot + this.mouseDeltaY;

            this._rotateCamera();

            needsUpdate = true;
        }
    }

    return needsUpdate;
};

ripe.ConfiguratorCSR.prototype._rotateMeshes = function() {
    var allowedRotation = this.maximumHorizontalRot - this.minimumHorizontalRot;

    for (var mesh in this.meshes) {
        this.meshes[mesh].rotation.y = ripe.deg2rad(
            (this._currentHorizontalRot / allowedRotation) * 360
        );
    }
};

ripe.ConfiguratorCSR.prototype._rotateCamera = function() {
    var maxHeight = this.cameraDistance - this.cameraHeight;

    this.camera.position.y =
        this.cameraHeight + maxHeight * Math.sin((Math.PI / 2 / 90) * this._currentVerticalRot);
    this.camera.position.z =
        this.cameraDistance * Math.cos((Math.PI / 2 / 90) * this._currentVerticalRot);

    this.camera.lookAt(this.cameraTarget);

    // this.meshes[mesh].rotation.y = this._currentHorizontalRot / 360 * Math.PI * 2;
};

ripe.ConfiguratorCSR.prototype.disable = function() {
    this._enabled = false;
};

ripe.ConfiguratorCSR.prototype.enable = function() {
    this._enabled = true;
};

/**
 * This function is called (by the owner) whenever the current operation
 * in the child should be canceled this way a Configurator is not updated.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator.
 */
ripe.ConfiguratorCSR.prototype.cancel = async function(options = {}) {
    if (this._buildSignature() === this.signature || "") return false;
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

    if (!this._enabled) {
        return;
    }

    // Raycaster needs accurate positions of the element, needs to be
    // updated on every window resize event
    this.elementBoundingBox = this.element.getBoundingClientRect();

    size = size || this.element.clientWidth;
    if (this.currentSize === size) {
        return;
    }

    const area = this.element.querySelector(".area");

    area.width = size * this.pixelRatio;
    area.height = size * this.pixelRatio;
    area.style.width = size + "px";
    area.style.height = size + "px";
    this.currentSize = size;

    if (this.renderer) {
        this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);
    }

    await this.update(
        {},
        {
            force: true
        }
    );
};

ripe.ConfiguratorCSR.prototype.changeFrame = async function(frame, options = {}) {
    // Disabled Configurator, changing frame will lead to errors
    if (!this._enabled) return;

    // parses the requested frame value according to the pre-defined
    // standard (eg: side-3) and then unpacks it as view and position
    const _frame = ripe.parseFrameKey(frame);
    const nextView = _frame[0];
    const nextPosition = parseInt(_frame[1]);
    const position = this.element.dataset.position;
    const view = this.element.dataset.view;

    // unpacks the other options to the frame change defaulting their values
    // in case undefined values are found
    /*
    const duration = options.duration === undefined ? null : options.duration;
    const stepDurationRef = options.stepDuration === this.stepDuration ? null : options.stepDuration;
    const revolutionDuration =
        options.revolutionDuration === undefined
            ? this.revolutionDuration
            : options.revolutionDuration;
    const type = options.type === undefined ? null : options.type;
    */
    const dragging = this.element.classList.contains("drag");

    // TODO Use time here
    var currentTransition = 0;
    var currentRotation;
    var finalRotation;
    var step;
    var direction = "horizontal";

    const rotationTransition = () => {
        if (direction === "horizontal") {
            this._currentHorizontalRot += step;
            this._rotateMeshes();
        }
        if (direction === "vertical") {
            this._currentVerticalRot += step;
            this._rotateCamera();
        }

        if (currentTransition < 24) {
            currentTransition++;

            this.render();
            requestAnimationFrame(rotationTransition);
        } else {
            this.horizontalRot = this._currentHorizontalRot;
            this.verticalRot = this._currentVerticalRot;
            this.element.classList.remove("animating");
            this.element.classList.remove("no-drag");
        }
    };

    if (view !== nextView) {
        finalRotation = this.maximumVerticalRot;
        step = (finalRotation - this._currentVerticalRot) / 24;

        if (nextView === "bottom") {
            finalRotation = this.minimumVerticalRot;
            step = (this._currentVerticalRot - finalRotation) / 24;
        }

        direction = "vertical";

        // only rotate if not dragging
        if (!dragging) {
            requestAnimationFrame(rotationTransition);
            this.element.classList.add("animating");
            this.element.classList.add("no-drag");
        }
    } else if (position !== nextPosition) {
        currentRotation = this._currentHorizontalRot;
        finalRotation = this._positionToRotation(nextPosition);

        if (currentRotation + 180 > finalRotation) {
            step = (finalRotation - currentRotation) / 24;
        } else {
            step = (currentRotation - finalRotation) / 24;
        }

        // only rotate if not dragging
        if (!dragging) {
            requestAnimationFrame(rotationTransition);
            this.element.classList.add("animating");
            this.element.classList.add("no-drag");
        }
    }

    await this.update();

    this.element.dataset.position = nextPosition;
};

/**
 * Highlights a model's part, showing a dark mask on top of the such referred
 * part identifying its borders.
 *
 * @param {String} part The part of the model that should be highlighted.
 * @param {Object} options Set of optional parameters to adjust the highlighting.
 */
ripe.ConfiguratorCSR.prototype.highlight = async function(part, options = {}) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    if (!this.meshes) {
        return;
    }

    // TODO Use time here
    var duration = 100;

    await this.changeHighlight(part, 1.0, 0.5, duration);

    // triggers an event indicating that a highlight operation has been
    // performed on the current configurator
    this.trigger("highlighted");
};

/**
 * Removes the a highlighting of a model's part, meaning that no masks
 * are going to be presented on screen.
 *
 * @param {String} part The part to lowlight.
 * @param {Object} options Set of optional parameters to adjust the lowlighting.
 */
ripe.ConfiguratorCSR.prototype.lowlight = async function(options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately

    // const test = new TimelineMax({paused: true});
    if (!this.useMasks) {
        return;
    }

    if (!this.meshes) {
        return;
    }

    // There's no intersection
    if (this.intersectedPart === "") {
        return;
    }

    var duration = 100;

    await this.changeHighlight(this.intersectedPart, 0.5, 1.0, duration);

    this.intersectedPart = "";

    // triggers an event indicating that a lowlight operation has been
    // performed on the current configurator
    this.trigger("lowlighted");

    this.render();
};

ripe.ConfiguratorCSR.prototype.changeHighlight = async function(
    part,
    startValue,
    endValue,
    duration
) {
    var startingValue = startValue;
    var meshTarget = null;

    var startTime = Date.now();
    var currentTime = 0;

    for (var mesh in this.meshes) {
        if (this.meshes[mesh].name === part) {
            meshTarget = this.meshes[mesh];
            startingValue = meshTarget.material.color.r;
        }
    }

    var currentValue = startingValue;

    const changeHighlightTransition = () => {
        meshTarget.material.color.r = currentValue;
        meshTarget.material.color.g = currentValue;
        meshTarget.material.color.b = currentValue;

        currentTime = Date.now() - startTime;
        currentValue = this.linearTween(currentTime, startingValue, endValue, duration);

        this.renderer.render(this.scene, this.camera);

        if (currentTime < duration) requestAnimationFrame(changeHighlightTransition);
    };

    requestAnimationFrame(changeHighlightTransition);
};

ripe.ConfiguratorCSR.prototype.linearTween = function(
    currentTime,
    startValue,
    endValue,
    duration
) {
    var change = endValue - startValue;
    return (change * currentTime) / duration + startValue;
};

/**
 * Resizes the Configurator to the defined maximum size.
 *
 * @param {Object} options Set of optional parameters to adjust the resizing.
 */
ripe.ConfiguratorCSR.prototype.enterFullscreen = async function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    const maxSize = this.element.dataset.max_size || this.maxSize;
    await this.resize(maxSize);
};

/**
 * Resizes the Configurator to the prior defined size.
 *
 * @param {Object} options Set of optional parameters to adjust the resizing.
 */
ripe.ConfiguratorCSR.prototype.leaveFullscreen = async function(options) {
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
    this.useMasks = true;
};

/**
 * Turns off (disables) the masks on selection/highlight.
 */
ripe.ConfiguratorCSR.prototype.disableMasks = function() {
    this.useMasks = false;
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

    // coordinates for raycaster requires the exact positioning
    // of the element in the window, needs to be updated on
    // every resize
    window.onresize = () => {
        this.resize();
    };
};

/**
 * @ignore
 */
ripe.ConfiguratorCSR.prototype._updateConfig = async function(animate) {
    // sets ready to false to temporarily block
    // update requests while the new config
    // is being loaded
    this.ready = false;

    // removes the highlight from any part
    this.lowlight();

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
    this.update(
        {},
        {
            preload: true,
            animate: animate || this.configAnimate,
            force: true
        }
    );
};

/**
 * @ignore
 */
ripe.ConfiguratorCSR.prototype._registerHandlers = function() {
    // captures the current context to be used inside clojures
    const self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    const area = this.element.querySelector(".area");

    // binds the mousedown event on the element to prepare
    // it for drag movements
    this._addElementHandler("mousedown", function(event) {
        const _element = this;
        _element.dataset.view = _element.dataset.view || "side";
        self.base = parseInt(_element.dataset.position) || 0;
        self.down = true;
        self.referenceX = event.pageX;
        self.referenceY = event.pageY;
        self.percent = 0;
        _element.classList.add("drag");
    });

    // listens for mouseup events and if it occurs then
    // stops reacting to mouse move events has drag movements
    this._addElementHandler("mouseup", function(event) {
        const _element = this;
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");

        event = ripe.fixEvent(event);

        // Apply rotation to model
        self.horizontalRot = self._currentHorizontalRot;
        self._currentHorizontalRot = self.horizontalRot;
        self.mouseDeltaX = 0;

        // Apply rotation to camera
        self.verticalRot = self._currentVerticalRot;
        self._currentVerticalRot = self.verticalRot;
        self.mouseDeltaY = 0;

        self._attemptRaycast(event);
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    this._addElementHandler("mouseleave", function(event) {
        const _element = this;
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    this._addElementHandler("mousemove", function(event) {
        if (!this.classList.contains("ready") || this.classList.contains("no-drag")) {
            return;
        }

        const down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;
        if (down) self._parseDrag();
    });

    area.addEventListener("click", function(event) {
        // verifies if the previous drag operation (if any) has exceed
        // the minimum threshold to be considered drag (click avoided)
        if (Math.abs(self.previous) > self.clickThreshold) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
        }

        event = ripe.fixEvent(event);

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        // const part = self.partsList[index - 1];
        // const isVisible = self.hiddenParts.indexOf(part) === -1;
        // if (part && isVisible) self.owner.selectPart(part);
        event.stopPropagation();
    });

    area.addEventListener("mousemove", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (self.down === true) {
            self.lowlight();
            return;
        }

        self._attemptRaycast(event);
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    area.addEventListener("dragend", function(event) {
        event.preventDefault();
    });

    // verifies if mutation should be "observed" for this visual
    // and in such case registers for the observation of any DOM
    // mutation (eg: attributes) for the configurator element, triggering
    // a new update operation in case that happens
    if (this.mutations) {
        // listens for attribute changes to redraw the configurator
        // if needed, this makes use of the mutation observer, the
        // redraw should be done for width and height style and attributes
        const Observer =
            (typeof MutationObserver !== "undefined" && MutationObserver) ||
            (typeof WebKitMutationObserver !== "undefined" && WebKitMutationObserver) || // eslint-disable-line no-undef
            null;
        this._observer = Observer
            ? new Observer(mutations => {
                  for (let index = 0; index < mutations.length; index++) {
                      const mutation = mutations[index];
                      if (mutation.type === "style") self.resize();
                      if (mutation.type === "attributes") self.update();
                  }
              })
            : null;
        if (this._observer) {
            this._observer.observe(this.element, {
                attributes: true,
                subtree: false,
                characterData: true,
                attributeFilter: ["style", "data-format", "data-size", "data-width", "data-height"]
            });
        }
    }

    // adds handlers for the touch events so that they get
    // parsed to mouse events for the configurator element,
    // taking into account that there may be a touch handler
    // already defined
    ripe.touchHandler(this.element);
};

ripe.ConfiguratorCSR.prototype._attemptRaycast = function(mouseEvent) {
    const animating = this.element.classList.contains("animating");
    const dragging = this.element.classList.contains("drag");

    if (!this.elementBoundingBox || animating || dragging) return;

    const mouse = this._getNormalizedCoordinatesRaycast(mouseEvent);

    if (this.raycaster && this.scene) {
        this.raycaster.setFromCamera(mouse, this.camera);

        var intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            if (this.intersectedPart !== intersects[0].object.name) {
                if (this.intersectedPart !== "") {
                    this.lowlight();
                }
                this.intersectedPart = intersects[0].object.name;
                this.highlight(this.intersectedPart);
            }
        } else {
            if (this.intersectedPart !== "") {
                this.lowlight();
            }
        }
    }
};

ripe.ConfiguratorCSR.prototype._getNormalizedCoordinatesRaycast = function(mouseEvent) {
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

/**
 * @ignore
 */
ripe.ConfiguratorCSR.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    const child = this.element.querySelector("*:first-child");
    const referenceX = this.referenceX;
    const referenceY = this.referenceY;
    const mousePosX = this.mousePosX;
    const mousePosY = this.mousePosY;

    const base = this.base;
    this.mouseDeltaX = referenceX - mousePosX;
    this.mouseDeltaY = referenceY - mousePosY;
    const elementWidth = this.element.clientWidth;
    const elementHeight = this.element.clientHeight || child.clientHeight;
    const percentX = this.mouseDeltaX / elementWidth;
    const percentY = this.mouseDeltaY / elementHeight;
    this.percent = percentX;
    const sensitivity = this.element.dataset.sensitivity || this.sensitivity;
    const verticalThreshold = this.element.dataset.verticalThreshold || this.verticalThreshold;

    // if the drag was vertical then alters the
    // view if it is supported by the product
    const view = this.element.dataset.view;
    let nextView = view;
    if (sensitivity * percentY > verticalThreshold) {
        nextView = view === "top" ? "side" : "bottom";
        this.referenceY = mousePosY;
    } else if (sensitivity * percentY < verticalThreshold * -1) {
        nextView = view === "bottom" ? "side" : "top";
        this.referenceY = mousePosY;
    }

    // retrieves the current view and its frames
    // and determines which one is the next frame
    const viewFrames = 24;
    const offset = Math.round((sensitivity * percentX * viewFrames) / 24);
    let nextPosition = (base - offset) % viewFrames;
    nextPosition = nextPosition >= 0 ? nextPosition : viewFrames + nextPosition;

    // if the view changes then uses the last
    // position presented in that view, if not
    // then shows the next position according
    // to the drag
    nextPosition = view === nextView ? nextPosition : this._lastFrame[nextView] || 0;

    const nextFrame = ripe.getFrameKey(nextView, nextPosition);
    this.changeFrame(nextFrame);
};

/**
 * Builds the signature string for the current internal state
 * allowing a single unique representation of the current frame.
 *
 * This signature should allow dirty control for the configurator.
 *
 * @returns {String} The unique signature for the configurator state.
 */
ripe.ConfiguratorCSR.prototype._buildSignature = function() {
    const format = this.element.dataset.format || this.format;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const backgroundColor = this.element.dataset.background_color || this.backgroundColor;
    return `${this.owner._getQuery()}&width=${String(width)}&height=${String(
        height
    )}&format=${String(format)}&background=${String(backgroundColor)}`;
};

ripe.ConfiguratorCSR.prototype._initializeLights = function() {
    const keyLight = new this.library.PointLight(0xffffff, 2.2, 18);
    keyLight.position.set(2, 2, 2);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.000001;
    keyLight.shadow.camera.far = 10;
    // keyLight.shadow.radius = 8;

    const fillLight = new this.library.PointLight(0xffffff, 1.1, 18);
    fillLight.position.set(-2, 1, 2);
    fillLight.castShadow = true;
    fillLight.shadow.camera.near = 0.000001;
    fillLight.shadow.camera.far = 10;
    // fillLight.shadow.radius = 8;

    const rimLight = new this.library.PointLight(0xffffff, 3.1, 18);
    rimLight.position.set(-1, 1.5, -3);
    rimLight.castShadow = true;
    rimLight.shadow.camera.near = 0.000001;
    rimLight.shadow.camera.far = 10;
    // rimLight.shadow.radius = 8;

    const ambientLight = new this.library.AmbientLight(0xffffff, 0.1);

    this.lights = [keyLight, fillLight, rimLight, ambientLight];
};

ripe.ConfiguratorCSR.prototype._initializeRenderer = function() {
    // creates the renderer using the "default" WebGL approach
    // notice that the shadow map is enabled
    this.renderer = new this.library.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);

    this.renderer.toneMappingExposure = this.exposure;
    this.renderer.toneMapping = this.library.CineonToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.library.BasicShadowMap;

    const area = this.element.querySelector(".area");

    area.appendChild(this.renderer.domElement);
};

ripe.ConfiguratorCSR.prototype._initializeCamera = function() {
    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;

    this.camera = new this.library.PerspectiveCamera(this.cameraFOV, width / height, 1, 20000);
    this.camera.position.set(0, this.cameraHeight, this.cameraDistance);

    if (this.element.dataset.view === "side") {
        // TODO Use previous position
        this._currentVerticalRot = 0;
        this.verticalRot = 0;
    } else if (this.element.dataset.view === "top") {
        this._currentVerticalRot = Math.PI / 2;
        this.verticalRot = Math.PI / 2;
    }
};

ripe.ConfiguratorCSR.prototype.populateScene = function(scene) {
    for (let i = 0; i < this.lights.length; i++) {
        scene.add(this.lights[i]);
    }
    for (var mesh in this.meshes) {
        scene.add(this.meshes[mesh]);
    }
    // scene.add(this.floorMesh);
};

ripe.ConfiguratorCSR.prototype._initializeTexturesAndMaterials = async function() {
    this.loadedMaterials.default = new this.library.MeshPhongMaterial({ color: "#ffffff" });

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

ripe.ConfiguratorCSR.prototype._loadMaterial = async function(material, color) {
    // Loadedmaterials store threejs materials in the format
    if (this.loadedMaterials[material + "_" + color]) {
        return;
    }

    const textureLoader = new this.library.TextureLoader();

    var diffuseMapPath = this.getTexturePath(material, color, "diffuse");
    var roughnessMapPath = this.getTexturePath(material, color, "roughness");
    var normalMapPath = this.getTexturePath(material, color, "normal");
    var aoMapPath = this.getTexturePath(material, color, "ao");

    const diffuseTexture = await new Promise((resolve, reject) => {
        textureLoader.load(diffuseMapPath, function(texture) {
            resolve(texture);
        });
    });

    const roughnessTexture = await new Promise((resolve, reject) => {
        textureLoader.load(roughnessMapPath, function(texture) {
            resolve(texture);
        });
    });

    const normalTexture = await new Promise((resolve, reject) => {
        textureLoader.load(normalMapPath, function(texture) {
            resolve(texture);
        });
    });

    const aoTexture = await new Promise((resolve, reject) => {
        textureLoader.load(aoMapPath, function(texture) {
            resolve(texture);
        });
    });

    diffuseTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    roughnessTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    normalTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    aoTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    diffuseTexture.minFilter = this.library.NearestMipmapNearestFilter;
    roughnessTexture.minFilter = this.library.NearestMipmapNearestFilter;
    normalTexture.minFilter = this.library.NearestMipmapNearestFilter;
    aoTexture.minFilter = this.library.NearestMipmapNearestFilter;

    const defaultMaterial = new this.library.MeshStandardMaterial({
        map: diffuseTexture,
        roughnessMap: roughnessTexture,
        normalMap: normalTexture,
        aoMap: aoTexture
    });

    // Dispose of textures, as they are already stored
    diffuseTexture.dispose();
    roughnessTexture.dispose();
    normalTexture.dispose();
    aoTexture.dispose();

    this.loadedMaterials[material + "_" + color] = defaultMaterial;
};

ripe.ConfiguratorCSR.prototype.getTexturePath = function(materialName, color, type) {
    return this.texturesPath + materialName + "/" + color + "/" + type + ".jpg";
};

ripe.ConfiguratorCSR.prototype._initializeMesh = async function() {
    const gltfLoader = new this.library.GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(this.meshPath, gltf => {
            resolve(gltf);
        });
    });

    const model = gltf.scene;

    const box = new this.library.Box3().setFromObject(model);

    const floorGeometry = new this.library.PlaneGeometry(100, 100);
    const floorMaterial = new this.library.ShadowMaterial();
    floorMaterial.opacity = 0.5;

    this.floorMesh = new this.library.Mesh(floorGeometry, floorMaterial);
    this.floorMesh.rotation.x = Math.PI / 2;
    this.floorMesh.receiveShadow = true;
    this.floorMesh.position.y = box.min.y;

    model.castShadow = true;

    const centerX = box.min.x + (box.max.x - box.min.x) / 2.0;
    const centerZ = box.min.z + (box.max.z - box.min.z) / 2.0;

    this.camera.lookAt(this.cameraTarget);

    this.meshes = {};
    for (let i = 0; i < model.children.length; i++) {
        if (model.children[i].isMesh) {
            model.children[i].geometry.translate(-centerX, 0, -centerZ);
            model.children[i].castShadow = true;
            model.children[i].receiveShadow = true;

            // remove "_part" from string
            this.meshes[model.children[i].name.split("_")[0]] = model.children[i];
        }
    }

    // Load default material
    await this._initializeTexturesAndMaterials();
    this.applyDefaults();
    // Only now can we populate the scene safely
    this.scene = new this.library.Scene();
    this.populateScene(this.scene);

    // TODO set initial camera positions
    // this._setPositionalRotations();

    this.render();
};

ripe.ConfiguratorCSR.prototype.applyDefaults = function() {
    for (var mesh in this.meshes) {
        this.meshes[mesh].material.dispose();
        this.meshes[mesh].material = this.loadedMaterials.default.clone();
    }
};

ripe.ConfiguratorCSR.prototype._assignMaterials = async function() {
    for (var part in this.owner.parts) {
        if (part === "shadow") continue;

        var material = this.owner.parts[part].material;
        var color = this.owner.parts[part].color;
        await this._loadMaterial(material, color);
    }
};

ripe.ConfiguratorCSR.prototype.crossfade = async function(options = {}) {
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

    // transitionCamera = new this.library.PerspectiveCamera(this.cameraFOV, width / height, 1, 20000);

    transitionCamera.position.x = this.camera.position.x;
    transitionCamera.position.y = this.camera.position.y;
    transitionCamera.position.z = this.camera.position.z;
    // transitionCamera.lookAt(this.cameraTarget);

    var previousSceneFBO = new this.library.WebGLRenderTarget(
        width,
        height,
        renderTargetParameters
    );

    var currentSceneFBO = new this.library.WebGLRenderTarget(width, height, renderTargetParameters);

    var duration = 24;
    var currentTime = 0;
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
    this.renderer.render(this.scene, this.camera);

    if (options.type === "material") {
        // Update scene's materials
        for (var part in this.owner.parts) {
            if (part === "shadow") continue;

            var material = this.owner.parts[part].material;
            var color = this.owner.parts[part].color;
            this._applyMaterial(part, this.loadedMaterials[material + "_" + color]);
        }
    }

    // Render next image
    this.renderer.setRenderTarget(currentSceneFBO);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    // Reset renderer
    this.renderer.setRenderTarget(null);
    this.renderer.clear();

    const crossfadeFunction = () => {
        this.renderer.render(this.scene, transitionCamera);

        mixRatio += 1.0 / duration;
        currentTime++;
        this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

        if (currentTime < duration) requestAnimationFrame(crossfadeFunction);
        else {
            this.scene.remove(quad);
            this.element.classList.remove("animating");
            this.element.classList.remove("no-drag");
            quad.geometry.dispose();
            quad.material.dispose();
            quadGeometry.dispose();
            previousSceneFBO.dispose();
            currentSceneFBO.dispose();
        }
    };

    // Prevents transition from being initiated multiple times
    this.element.classList.add("animating");
    this.element.classList.add("no-drag");

    requestAnimationFrame(crossfadeFunction);
};

ripe.ConfiguratorCSR.prototype._applyMaterial = function(part, material) {
    for (var mesh in this.meshes) {
        if (mesh === part) {
            this.meshes[mesh].material.dispose();
            this.meshes[mesh].material = material.clone();
        }
    }
};

ripe.ConfiguratorCSR.prototype.render = function() {
    if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
    }
};
