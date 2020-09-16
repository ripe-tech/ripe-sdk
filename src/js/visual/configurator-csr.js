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
    this.preloadDelay = this.options.preloadDelay || 150;
    this.maskOpacity = this.options.maskOpacity || 0.4;
    this.maskDuration = this.options.maskDuration || 150;
    this.noMasks = this.options.noMasks === undefined ? true : this.options.noMasks;
    this.useMasks = this.options.useMasks === undefined ? !this.noMasks : this.options.useMasks;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;

    this.duration = this.options.duration || 500;

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

    this.renderer = new ripe.CSRenderer(this.owner, this.element, this.options);
    this.renderer.updateElementBoundingBox();
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

    this.renderer._disposeResources();

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Converts the position of the element to a rotation that can be applied to
 * the model or the camera.
 */
ripe.ConfiguratorCSR.prototype._positionToRotation = function(position) {
    return (position / 24) * 360;
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

    this.renderer.updateOptions(options);

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
        // needsUpdate = true;
    }

    if (options.reason === "set parts" || options.reason === "set part") {
        await this.renderer._assignMaterials();
        await this.renderer.crossfade({ type: "material" });
    }

    // removes the highlight support from the matched object as a new
    // frame is going to be "calculated" and rendered (not same mask)
    this.renderer.lowlight();

    if (needsUpdate || animating) this.renderer.render();

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
    if (this.horizontalRot - this.mouseDeltaX !== this._currentHorizontalRot) {
        this._currentHorizontalRot = this.horizontalRot - this.mouseDeltaX;

        needsUpdate = true;

        this.renderer._rotateMeshes(this._currentHorizontalRot);
    }

    var diff;
    if (this.verticalRot + this.mouseDeltaY !== this._currentVerticalRot) {
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

            this.renderer._rotateCamera(this._currentVerticalRot);

            needsUpdate = true;
        }
    }

    return needsUpdate;
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

    size = size || this.element.clientWidth;
    if (this.currentSize === size) {
        return;
    }

    if (this.renderer) this.renderer.updateElementBoundingBox();

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
    const position = parseInt(this.element.dataset.position);
    const view = this.element.dataset.view;
    const animating = this.element.classList.contains("animating");

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
    var stepX = 0;
    var stepY = 0;
    var duration = 24;

    const rotationTransition = () => {
        console.log("Rendering rotation");
        this._currentHorizontalRot += stepX;
        this._currentVerticalRot += stepY;

        this.renderer._rotateMeshes(this._currentHorizontalRot);
        this.renderer._rotateCamera(this._currentVerticalRot);

        if (currentTransition < duration) {
            currentTransition++;

            this.renderer.render();
            requestAnimationFrame(rotationTransition);
        } else {
            this.horizontalRot = this._currentHorizontalRot;
            this.verticalRot = this._currentVerticalRot;

            this.element.classList.remove("animating");
            this.element.classList.remove("no-drag");
        }
    };

    var requiresTransition = false;

    if (view !== nextView) {
        finalRotation = 0;

        if (nextView === "top") finalRotation = this.maximumVerticalRot;
        if (nextView === "bottom") finalRotation = this.minimumVerticalRot;

        stepY = (finalRotation - this.verticalRot) / duration;

        requiresTransition = true;
    }
    if (position !== nextPosition) {
        finalRotation = this._positionToRotation(nextPosition);

        if (this.horizontalRot + 180 > finalRotation) {
            stepX = (finalRotation - this.horizontalRot) / duration;
        } else {
            stepX = (currentRotation - this.horizontalRot) / duration;
        }

        requiresTransition = true;
    }

    this.element.dataset.position = nextPosition;
    this.element.dataset.view = nextView;

    if (requiresTransition && !dragging && !animating) {
        requestAnimationFrame(rotationTransition);
        this.element.classList.add("animating");
        this.element.classList.add("no-drag");
    }

    await this.update();
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
        // this.resize();
        this.renderer.updateElementBoundingBox();
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

        // self.renderer._attemptRaycast(event);
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
