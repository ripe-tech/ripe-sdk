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
ripe.ConfiguratorPrc = function(owner, element, options) {
    this.type = this.type || "ConfiguratorPrc";

    ripe.Visual.call(this, owner, element, options);
};

ripe.ConfiguratorPrc.prototype = ripe.build(ripe.Visual.prototype);
ripe.ConfiguratorPrc.prototype.constructor = ripe.ConfiguratorPrc;

/**
 * The Configurator initializer, which is called whenever
 * the Configurator is going to become active.
 *
 * Sets the various values for the Configurator taking into
 * owner's default values.
 */
ripe.ConfiguratorPrc.prototype.init = function() {
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
    this.duration = this.options.duration || 500;
    this.preloadDelay = this.options.preloadDelay || 150;
    this.maskOpacity = this.options.maskOpacity || 0.4;
    this.maskDuration = this.options.maskDuration || 150;
    this.noMasks = this.options.noMasks === undefined ? true : this.options.noMasks;
    this.useMasks = this.options.useMasks === undefined ? !this.noMasks : this.options.useMasks;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;
    this.configAnimate =
        this.options.configAnimate === undefined ? "cross" : this.options.configAnimate;
    this.viewAnimate = this.options.viewAnimate === undefined ? "cross" : this.options.viewAnimate;
    this.ready = false;
    this._finalize = null;
    this._observer = null;
    this._ownerBinds = {};

    // registers for the selected part event on the owner
    // so that we can highlight the associated part
    this._ownerBinds.selected_part = this.owner.bind("selected_part", part => this.highlight(part));

    // registers for the deselected part event on the owner
    // so that we can remove the highlight of the associated part
    this._ownerBinds.deselected_part = this.owner.bind("deselected_part", part => this.lowlight());

    // creates a structure the store the last presented
    // position of each view, to be used when returning
    // to a view for better user experience
    this._lastFrame = {};

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
};

/**
 * The Configurator deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.ConfiguratorPrc.prototype.deinit = async function() {
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
ripe.ConfiguratorPrc.prototype.updateOptions = async function(options, update = true) {
    ripe.Visual.prototype.updateOptions.call(this, options);

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
ripe.ConfiguratorPrc.prototype.update = async function(state, options = {}) {
    // in case the configurator is currently nor ready for an
    // update none is performed and the control flow is returned
    // with the false value (indicating a no-op, nothing was done)
    if (this.ready === false) {
        this.trigger("not_loaded");
        return false;
    }

    // allocates space for the possible promise that is going
    // to be responsible for the preloading of the frames, populating
    // the cache buffer for the complete set of frames associated with
    // the currently loaded model configuration
    let preloadPromise = null;

    const view = this.element.dataset.view;
    const position = this.element.dataset.position;

    const force = options.force || false;
    const duration = options.duration;
    const preload = options.preload;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    let previous = this.signature || "";
    const signature = this._buildSignature();
    const changed = signature !== previous;
    const animate = options.animate === undefined ? (changed ? "simple" : false) : options.animate;
    this.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    previous = this.unique;
    const unique = `${signature}&view=${String(view)}&position=${String(position)}`;
    if (previous === unique && !force) {
        this.trigger("not_loaded");
        return false;
    }
    this.unique = unique;

    // removes the highlight support from the matched object as a new
    // frame is going to be "calculated" and rendered (not same mask)
    this.lowlight();

    // runs the pre-loading process so that the remaining frames are
    // loaded for a smother experience when dragging the element,
    // note that this is only performed in case this is not a single
    // based update (not just the loading of the current position)
    // and the current signature has changed
    const preloaded = this.element.classList.contains("preload");
    const mustPreload = preload !== undefined ? preload : changed || !preloaded;
    if (mustPreload) preloadPromise = this._preload(this.options.useChain);

    // runs the load operation for the current frame, taking into
    // account the multiple requirements for such execution
    await this._loadFrame(view, position, {
        draw: true,
        animate: animate,
        duration: duration
    });

    // initializes the result value with the default valid value
    // indicating that the operation was a success
    let result = true;

    // in case the preload was requested then waits for the preload
    // operation of the frames to complete (wait on promise), keep
    // in mind that if the preload operation was requested this is
    // a "hard" flush on the underlying images buffer (most of the times
    // representing a change in the configuration)
    if (preloadPromise) {
        // waits for the preload promise as the result of it is
        // going to be considered the result of the operation
        result = await preloadPromise;

        // after the update operation is finished the loaded event
        // should be triggered indicating the end of the visual
        // operations for the current configuration on the configurator
        this.trigger("loaded");
    }

    // returns the resulting value indicating if the loading operation
    // as been triggered with success (effective operation)
    return result;
};

/**
 * This function is called (by the owner) whenever the current operation
 * in the child should be canceled this way a Configurator is not updated.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator.
 */
ripe.ConfiguratorPrc.prototype.cancel = async function(options = {}) {
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
ripe.ConfiguratorPrc.prototype.resize = async function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.clientWidth;
    if (this.currentSize === size) {
        return;
    }

    const area = this.element.querySelector(".area");
    const frontMask = this.element.querySelector(".front-mask");
    const back = this.element.querySelector(".back");
    const mask = this.element.querySelector(".mask");
    area.width = size * this.pixelRatio;
    area.height = size * this.pixelRatio;
    area.style.width = size + "px";
    area.style.height = size + "px";
    frontMask.width = size;
    frontMask.height = size;
    frontMask.style.width = size + "px";
    frontMask.style.height = size + "px";
    frontMask.style.marginLeft = `-${String(size)}px`;
    back.width = size * this.pixelRatio;
    back.height = size * this.pixelRatio;
    back.style.width = size + "px";
    back.style.height = size + "px";
    back.style.marginLeft = `-${String(size)}px`;
    mask.width = size;
    mask.height = size;
    mask.style.width = size + "px";
    mask.style.height = size + "px";
    this.currentSize = size;
    await this.update(
        {},
        {
            force: true
        }
    );
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
ripe.ConfiguratorPrc.prototype.changeFrame = async function(frame, options = {}) {
    // parses the requested frame value according to the pre-defined
    // standard (eg: side-3) and then unpacks it as view and position
    const _frame = ripe.parseFrameKey(frame);
    const nextView = _frame[0];
    const nextPosition = parseInt(_frame[1]);

    // in case the next position value was not properly parsed (probably undefined)
    // then it's not possible to change frame (throws exception)
    if (isNaN(nextPosition)) {
        throw new RangeError("Frame position is not defined");
    }

    // unpacks the other options to the frame change defaulting their values
    // in case undefined values are found
    let duration = options.duration === undefined ? null : options.duration;
    let stepDurationRef = options.stepDuration === this.stepDuration ? null : options.stepDuration;
    const revolutionDuration =
        options.revolutionDuration === undefined
            ? this.revolutionDuration
            : options.revolutionDuration;
    const type = options.type === undefined ? null : options.type;
    let preventDrag = options.preventDrag === undefined ? true : options.preventDrag;
    const safe = options.safe === undefined ? true : options.safe;
    const first = options.first === undefined ? true : options.first;

    // updates the animation start timestamp with the current timestamp in
    // case no start time is currently defined
    options._start = options._start === undefined ? new Date().getTime() : options._start;
    options._step = options._step === undefined ? 0 : options._step;

    // normalizes both the (current) view and position values
    const view = this.element.dataset.view;
    const position = parseInt(this.element.dataset.position);

    // tries to retrieve the amount of frames for the target view and
    // validates that the target view exists and that the target position
    // (frame) does not overflow the amount of frames in for the view
    const viewFrames = this.frames[nextView];
    if (!viewFrames || nextPosition >= viewFrames) {
        throw new RangeError("Frame " + frame + " is not supported");
    }

    // in case the safe mode is enabled and the current configuration is
    // still under the preloading situation the change frame is ignored
    if (safe && this.element.classList.contains("preloading")) {
        return;
    }

    // in case the safe mode is enabled and there's an animation running
    // then this request is going to be ignored (not possible to change
    // frame when another animation is running)
    if (safe && this.element.classList.contains("animating")) {
        return;
    }

    // in case the current view and position are already set then returns
    // the control flow immediately (animation safeguard)
    if (safe && this.element.dataset.view === nextView && position === nextPosition) {
        this.element.classList.remove("no-drag", "animating");
        return;
    }

    // removes any part highlight in case it is set
    // to replicate the behaviour of dragging the product
    this.lowlight();

    // saves the position of the current view
    // so that it returns to the same position
    // when coming back to the same view
    this._lastFrame[view] = position;
    this.position = nextPosition;
    this.element.dataset.position = nextPosition;

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    let animate = false;
    if (view !== nextView && viewFrames !== undefined) {
        this.view = nextView;
        this.element.dataset.view = nextView;
        this.element.dataset.frames = viewFrames;
        animate = type === null ? this.viewAnimate : type;
        duration = duration || this.duration;
    }

    // runs the defaulting values for the current step duration
    // and the next position that is going to be rendered
    let stepDuration = null;
    let stepPosition = nextPosition;

    // sets the initial time reduction to be applied for the frame
    // based animation (rotation), this value should be calculated
    // taking into account the delay in the overall animation
    let reducedTime = 0;

    // in case any kind of duration was provided a timed animation
    // should be performed and as such a proper calculus should be
    // performed to determine the current step duration an the position
    // associated with the current step operation
    if (view === nextView && (duration || stepDurationRef || revolutionDuration)) {
        // ensures that no animation on a pre-frame render exists
        // the animation itself is going to be "managed" by the
        // the change frame tick logic
        animate = null;

        // calculates the number of steps as the shortest path
        // between the current and the next position, this should
        // choose the proper way for the "rotation"
        const stepCount =
            view !== nextView
                ? 1
                : Math.min(
                      Math.abs(position - nextPosition),
                      viewFrames - Math.abs(position - nextPosition)
                  );
        options._stepCount = options._stepCount === undefined ? stepCount : options._stepCount;

        // in case the (total) revolution time for the view is defined a
        // step timing based animation is calculated based on the total
        // number of frames for the view
        if (revolutionDuration && first) {
            // makes sure that we're able to find out the number of frames
            // for the next view from the current loaded model, only then
            // can the step duration be calculated, by dividing the total
            // duration of the revolution by the number of frames of the view
            if (viewFrames) {
                stepDurationRef = parseInt(revolutionDuration / viewFrames);
            }
            // otherwise runs a fallback operation where the total duration
            // of the animation is the revolution time (sub optimal fallback)
            else {
                duration = duration || revolutionDuration;
            }
        }

        // in case the options contain the step duration (reference) field
        // then it's used to calculate the total duration of the animation
        // (step driven animation timing)
        if (stepDurationRef && first) {
            duration = stepDurationRef * stepCount;
        }

        // in case the end (target) timestamp is not yet defined then
        // updates the value with the target duration
        options._end = options._end === undefined ? options._start + duration : options._end;

        // determines the duration (in seconds) for each step taking
        // into account the complete duration and the number of steps
        stepDuration = duration / Math.abs(stepCount);
        options.duration = duration - stepDuration;

        // in case no step duration has been defined defines one as that's relevant
        // to be able to calculate expected time at this point in time and then
        // calculate the amount of time and frames to skip
        options._stepDuration =
            options._stepDuration === undefined ? stepDuration : options._stepDuration;

        // calculates the expected timestamp for the current position in
        // time and then the delay against it (for proper frame dropping)
        const expected = options._start + options._step * options._stepDuration;
        const delay = Math.max(new Date().getTime() - expected, 0);

        // calculates the number of frames that have to be skipped to re-catch
        // the animation back to the expect time-frame
        const frameSkip = Math.floor(delay / stepDuration);
        reducedTime = delay % stepDuration;
        const stepSize = frameSkip + 1;

        // calculates the delta in terms of steps taking into account
        // if any frame should be skipped in the animation
        const nextStep = Math.min(options._stepCount, options._step + stepSize);
        const delta = Math.min(stepSize, nextStep - options._step);
        options._step = nextStep;

        // checks if it should rotate in the positive or negative direction
        // according to the current view definition and then calculates the
        // next position taking into account that definition
        const goPositive = (position + stepCount) % viewFrames === nextPosition;
        stepPosition =
            stepCount !== 0 ? (goPositive ? position + delta : position - delta) : position;

        // wrap around as needed (avoiding index overflow)
        stepPosition = stepPosition < 0 ? viewFrames + stepPosition : stepPosition;
        stepPosition = stepPosition % viewFrames;

        // updates the position according to the calculated one on
        // the dataset, the next update operation should trigger
        // the appropriate update on the visual resources
        this.position = stepPosition;
        this.element.dataset.position = stepPosition;
    }

    // sets the initial values for the start of the animation, allows
    // control of the current animation (and exclusive lock)
    this.element.classList.add("animating");

    // if the prevent drag is set and there's an animation then
    // ignores drag movements until the animation is finished
    preventDrag = preventDrag && (animate || duration);
    if (preventDrag) this.element.classList.add("no-drag");

    // calculates the amount of time that the current operation is
    // going to sleep to able to correctly address the animation sequence
    // (valid only for no animation scenarios, no cross fade) if this
    // sleep time is valid (greater than zero) tuns the async based
    // await operation for the amount of time
    const sleepTime = animate ? 0 : stepDuration - reducedTime;
    if (sleepTime > 0) {
        await new Promise(resolve => setTimeout(() => resolve(), sleepTime));
    }

    // computes the frame key (normalized) and then triggers an event
    // notifying any listener about the new frame that was set
    const newFrame = ripe.getFrameKey(this.element.dataset.view, this.element.dataset.position);
    this.trigger("changed_frame", newFrame);

    try {
        // runs the update operation that should sync the visuals of the
        // configurator according to the current internal state (in data)
        // this operation waits for the proper drawing of the image (takes
        // some time and resources to be completed)
        await this.update(
            {},
            {
                animate: animate,
                duration: animate ? duration : 0
            }
        );
    } catch (err) {
        // removes the locking classes as the current operation has been
        // finished, effectively re-allowing: dragging and animated operations
        // and then re-throws the exception caused by update
        this.element.classList.remove("no-drag", "animating");
        throw err;
    }

    // in case the change frame operation has been completed
    // target view and position has been reached, then it's
    // time collect the garbage and return control flow
    if (view === nextView && stepPosition === nextPosition) {
        this.element.classList.remove("no-drag", "animating");
        return;
    }

    // creates a new options instance that is going to be used in the
    // possible next tick of the operation
    options = Object.assign({}, options, { safe: false, first: false });

    // runs the next tick operation to change the frame of the current
    // configurator to the next one (iteration cycle)
    await this.changeFrame(frame, options);
};

/**
 * Highlights a model's part, showing a dark mask on top of the such referred
 * part identifying its borders.
 *
 * @param {String} part The part of the model that should be highlighted.
 * @param {Object} options Set of optional parameters to adjust the highlighting.
 */
ripe.ConfiguratorPrc.prototype.highlight = function(part, options = {}) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // captures the current context to be used by clojure callbacks
    const self = this;

    // determines the current position of the configurator so that
    // the proper mask URL may be created and properly loaded
    const view = this.element.dataset.view;
    const position = this.element.dataset.position;
    const frame = ripe.getFrameKey(view, position);
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const maskOpacity = this.element.dataset.mask_opacity || this.maskOpacity;
    const maskDuration = this.element.dataset.mask_duration || this.maskDuration;

    // adds the highlight class to the current target configurator meaning
    // that the front mask is currently active and showing info
    this.element.classList.add("highlight");

    // constructs the full URL of the mask image that is going to be
    // set for the current highlight operation (to be determined)
    const url = this.owner._getMaskURL({
        frame: frame,
        size: size,
        width: width,
        height: height,
        part: part
    });

    // gathers the front mask element and the associated source URL
    // and in case it's the same as the one in request returns immediately
    // as the mask is considered to be already loaded
    const frontMask = this.element.querySelector(".front-mask");
    const src = frontMask.getAttribute("src");
    if (src === url) {
        self.trigger("highlighted_part", part);
        return;
    }

    if (this.frontMaskLoad) frontMask.removeEventListener("load", this.frontMaskLoad);
    if (this.frontMaskError) frontMask.removeEventListener("error", this.frontMaskError);
    frontMask.classList.remove("loaded");
    this.frontMaskLoad = function() {
        this.classList.add("loaded");
        self.trigger("highlighted_part", part);
    };
    this.frontMaskError = function() {
        this.setAttribute("src", "");
    };
    frontMask.addEventListener("load", this.frontMaskLoad);
    frontMask.addEventListener("error", this.frontMaskError);
    frontMask.setAttribute("src", url);

    ripe.cancelAnimation(frontMask);
    ripe.animateProperty(frontMask, "opacity", 0, maskOpacity, maskDuration, false);
};

/**
 * Removes the a highlighting of a model's part, meaning that no masks
 * are going to be presented on screen.
 *
 * @param {String} part The part to lowlight.
 * @param {Object} options Set of optional parameters to adjust the lowlighting.
 */
ripe.ConfiguratorPrc.prototype.lowlight = function(options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // retrieves the reference to the current front mask and removes
    // the highlight associated classes from it and the configurator
    const frontMask = this.element.querySelector(".front-mask");
    frontMask.classList.remove("highlight");
    this.element.classList.remove("highlight");

    // triggers an event indicating that a lowlight operation has been
    // performed on the current configurator
    this.trigger("lowlighted");
};

/**
 * Changes the currently displayed frame in the current view to the
 * previous one according to pre-defined direction.
 */
ripe.ConfiguratorPrc.prototype.previousFrame = function() {
    const view = this.element.dataset.view;
    const position = parseInt(this.element.dataset.position || 0);
    const viewFrames = this.frames[view];
    let nextPosition = (position - 1) % viewFrames;
    nextPosition = nextPosition >= 0 ? nextPosition : viewFrames + nextPosition;
    const nextFrame = ripe.getFrameKey(view, nextPosition);
    this.changeFrame(nextFrame);
};

/**
 * Changes the currently displayed frame in the current view to the
 * next one according to pre-defined direction.
 */
ripe.ConfiguratorPrc.prototype.nextFrame = function() {
    const view = this.element.dataset.view;
    const position = parseInt(this.element.dataset.position || 0);
    const viewFrames = this.frames[view];
    let nextPosition = (position + 1) % viewFrames;
    nextPosition = nextPosition >= 0 ? nextPosition : viewFrames + nextPosition;
    const nextFrame = ripe.getFrameKey(view, nextPosition);
    this.changeFrame(nextFrame);
};

/**
 * Resizes the Configurator to the defined maximum size.
 *
 * @param {Object} options Set of optional parameters to adjust the resizing.
 */
ripe.ConfiguratorPrc.prototype.enterFullscreen = async function(options) {
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
ripe.ConfiguratorPrc.prototype.leaveFullscreen = async function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    await this.resize();
};

/**
 * Turns on (enables) the masks on selection/highlight.
 */
ripe.ConfiguratorPrc.prototype.enableMasks = function() {
    this.useMasks = true;
};

/**
 * Turns off (disables) the masks on selection/highlight.
 */
ripe.ConfiguratorPrc.prototype.disableMasks = function() {
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
ripe.ConfiguratorPrc.prototype._initLayout = function() {
    // clears the elements children
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    // sets the element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    this.element.classList.add("configurator");

    // creates the area canvas and adds it to the element
    const area = ripe.createElement("canvas", "area");
    const context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    this.element.appendChild(area);

    // adds the front mask element to the element,
    // this will be used to highlight parts
    const frontMask = ripe.createElement("img", "front-mask");
    this.element.appendChild(frontMask);

    // creates the back canvas and adds it to the element,
    // placing it on top of the area canvas
    const back = ripe.createElement("canvas", "back");
    const backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    this.element.appendChild(back);

    // creates the mask element that will de used to display
    // the mask on top of an highlighted or selected part
    const mask = ripe.createElement("canvas", "mask");
    this.element.appendChild(mask);

    // adds the framesBuffer placeholder element that will be used to
    // temporarily store the images of the product's frames
    const framesBuffer = ripe.createElement("div", "frames-buffer");

    // creates a masksBuffer element that will be used to store the continuous
    // mask images to be used during highlight and select operation
    const masksBuffer = ripe.createElement("div", "masks-buffer");

    // adds both buffer elements (frames and masks) to the base elements
    // they are going to be used as placeholders for the "img" elements
    // that are going to be loaded with the images
    this.element.appendChild(framesBuffer);
    this.element.appendChild(masksBuffer);

    // set the size of area, frontMask, back and mask
    this.resize();

    // sets the initial view and position
    this.element.dataset.view = this.view;
    this.element.dataset.position = this.position;

    // register for all the necessary DOM events
    this._registerHandlers();
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._initPartsList = async function() {
    // creates a set of sorted parts to be used on the
    // highlight operation (considers only the default ones)
    this.partsList = [];
    const config = this.owner.loadedConfig
        ? this.owner.loadedConfig
        : await this.owner.getConfigP();
    const defaults = config.defaults || {};
    this.hiddenParts = config.hidden || [];
    this.partsList = Object.keys(defaults);
    this.partsList.sort();
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._populateBuffers = function() {
    const framesBuffer = this.element.getElementsByClassName("frames-buffer");
    const masksBuffer = this.element.getElementsByClassName("masks-buffer");
    let buffer = null;

    for (let index = 0; index < framesBuffer.length; index++) {
        buffer = framesBuffer[index];
        this._populateBuffer(buffer);
    }

    for (let index = 0; index < masksBuffer.length; index++) {
        buffer = masksBuffer[index];
        this._populateBuffer(buffer);
    }
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._populateBuffer = function(buffer) {
    while (buffer.firstChild) {
        buffer.removeChild(buffer.firstChild);
    }

    // creates two image elements for each frame and
    // appends them to the frames and masks buffers
    for (const view in this.frames) {
        const viewFrames = this.frames[view];
        for (let index = 0; index < viewFrames; index++) {
            const frameBuffer = ripe.createElement("img");
            frameBuffer.dataset.frame = ripe.getFrameKey(view, index);
            buffer.appendChild(frameBuffer);
        }
    }
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._updateConfig = async function(animate) {
    // sets ready to false to temporarily block
    // update requests while the new config
    // is being loaded
    this.ready = false;

    // removes the highlight from any part
    this.lowlight();

    // updates the parts list for the new product
    this._initPartsList();

    // retrieves the new product frame object and sets it
    // under the current state, adapting then the internal
    // structures to accommodate the possible changes in the
    // frame structure
    this.frames = await this.owner.getFrames();

    // populates the buffers taking into account
    // the frames of the model
    this._populateBuffers();

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

    // checks the last viewed frames of each view
    // and deletes the ones not supported
    const lastFrameViews = Object.keys(this._lastFrame);
    for (const _view of lastFrameViews) {
        const _position = this._lastFrame[_view];
        const _maxPosition = this.frames[_view];
        if (!_maxPosition || _position >= _maxPosition) {
            delete this._lastFrame[_view];
        }
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

    // computes the frame key for the current frame to
    // be shown and triggers the changed frame event
    const frame = ripe.getFrameKey(this.element.dataset.view, this.element.dataset.position);
    this.trigger("changed_frame", frame);

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
ripe.ConfiguratorPrc.prototype._loadFrame = async function(view, position, options = {}) {
    // triggers the initial frame event that indicates that a
    // new frame is going to be loaded into the img buffers
    this.trigger("pre_frame", {
        view: view,
        position: position,
        options: options
    });

    // runs the defaulting operation on all of the parameters
    // sent to the load frame operation (defaulting)
    view = view || this.element.dataset.view || "side";
    position = position || this.element.dataset.position || 0;

    const frame = ripe.getFrameKey(view, position);

    const format = this.element.dataset.format || this.format;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const backgroundColor = this.element.dataset.background_color || this.backgroundColor;

    const draw = options.draw === undefined || options.draw;
    const animate = options.animate;
    const duration = options.duration;
    const framesBuffer = this.element.querySelector(".frames-buffer");
    const masksBuffer = this.element.querySelector(".masks-buffer");
    const area = this.element.querySelector(".area");
    let image = framesBuffer.querySelector(`img[data-frame='${String(frame)}']`);
    const front = area.querySelector(`img[data-frame='${String(frame)}']`);
    const maskImage = masksBuffer.querySelector(`img[data-frame='${String(frame)}']`);
    image = image || front;

    // in case there's no images for the frames that are meant
    // to be loaded, then throws an error indicating that it's
    // not possible to load the requested frame
    if (image === null || maskImage === null) {
        throw new RangeError("Frame " + frame + " is not supported");
    }

    // triggers the async loading of the "master" mask for the current
    // frame, this should imply some level of cache usage
    this._loadMask(maskImage, view, position, options);

    // builds the URL that will be set on the image, notice that both
    // the full URL mode is avoided so that no extra parameters are
    // added to the image composition (not required)
    const url = this.owner._getImageURL({
        frame: frame,
        format: format,
        size: size,
        width: width,
        height: height,
        background: backgroundColor,
        full: false
    });

    // verifies if the loading of the current image
    // is considered redundant (already loaded or
    // loading) and avoids for performance reasons
    const isRedundant = image.dataset.src === url;
    if (isRedundant) {
        // in case no draw is required returns the control flow
        // immediately, nothing to be done
        if (!draw) return;

        // check if the image on the buffer is already loaded
        // nad if that's the case draws the frame
        const isReady = image.dataset.loaded === "true";
        if (isReady) await this._drawFrame(image, animate, duration);

        // triggers the post frame event indicating the end
        // of the image preloading under cache match situation
        this.trigger("post_frame", {
            view: view,
            position: position,
            options: options,
            result: false
        });

        // returns immediately there's nothing remaining to
        // be done as the image is already loaded
        return;
    }

    // adds load callback to the image to draw the frame
    // when it is available from the "remote" source
    const imagePromise = new Promise((resolve, reject) => {
        image.onload = async () => {
            image.dataset.loaded = true;
            image.dataset.src = url;
            if (!draw) {
                resolve();
                return;
            }
            try {
                await this._drawFrame(image, animate, duration);
            } catch (err) {
                reject(err);
            }
            resolve();
        };

        image.onerror = () => {
            reject(new Error("Problem loading image"));
        };
    });

    // sets the src of the image to trigger the request
    // and sets loaded to false to indicate that the
    // image is not yet loading
    image.src = url;
    image.dataset.src = url;
    image.dataset.loaded = false;

    // waits until the image promise is resolved so that
    // we're sure everything is currently loaded
    await imagePromise;

    // triggers the post frame event indicating that the
    // frame has been buffered into the img element with
    // no cache operation activated
    this.trigger("post_frame", {
        view: view,
        position: position,
        options: options,
        result: true
    });
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._loadMask = function(maskImage, view, position, options) {
    // constructs the URL for the mask and then at the end of the
    // mask loading process runs the final update of the mask canvas
    // operation that will allow new highlight and selection operation
    // to be performed according to the new frame value
    const draw = options.draw === undefined || options.draw;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const frame = ripe.getFrameKey(view, position);
    const url = this.owner._getMaskURL({
        frame: frame,
        size: size,
        width: width,
        height: height
    });
    if (draw && maskImage.dataset.src === url) {
        setTimeout(() => {
            this._drawMask(maskImage);
        }, 150);
    } else {
        maskImage.onload = draw
            ? () => {
                  setTimeout(() => {
                      this._drawMask(maskImage);
                  }, 150);
              }
            : null;
        maskImage.onerror = () => {
            maskImage.removeAttribute("src");
        };
        maskImage.crossOrigin = "anonymous";
        maskImage.dataset.src = url;
        maskImage.setAttribute("src", url);
    }
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._drawMask = function(maskImage) {
    const mask = this.element.querySelector(".mask");
    const maskContext = mask.getContext("2d");
    maskContext.clearRect(0, 0, mask.width, mask.height);
    maskContext.drawImage(maskImage, 0, 0, mask.width, mask.height);
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._drawFrame = async function(image, animate, duration) {
    const area = this.element.querySelector(".area");
    const back = this.element.querySelector(".back");

    const visible = area.dataset.visible === "true";
    const current = visible ? area : back;
    const target = visible ? back : area;
    const context = target.getContext("2d");

    // retrieves the animation identifiers for both the current
    // canvas and the target one and cancels any previous animation
    // that might exist in such canvas (as a new one is coming)
    ripe.cancelAnimation(current);
    ripe.cancelAnimation(target);

    // clears the canvas context rectangle and then draws the image from
    // the buffer to the target canvas (back buffer operation)
    context.clearRect(0, 0, target.width, target.height);
    context.drawImage(image, 0, 0, target.width, target.height);

    // switches the visibility (meta information )of the target and the
    // current canvas elements (this is just logic information)
    target.dataset.visible = true;
    current.dataset.visible = false;

    // in case no animation is requested the z index and opacity switch
    // is immediate, this is consider a fast double buffer switch
    if (!animate) {
        current.style.zIndex = 1;
        current.style.opacity = 0;
        target.style.zIndex = 1;
        target.style.opacity = 1;
        return;
    }

    // "calculates" the duration for the animate operation taking into
    // account the passed parameter and the "kind" of animation, falling
    // back to the instance default if required
    duration = duration || (animate === "immediate" ? 0 : this.duration);

    // creates an array of promises that are going to be waiting for so that
    // the animation on the draw is considered finished
    const promises = [];
    if (animate === "cross") {
        promises.push(ripe.animateProperty(current, "opacity", 1, 0, duration));
    }
    promises.push(ripe.animateProperty(target, "opacity", 0, 1, duration));

    // waits for both animations to finish so that the final update on
    // the current settings can be performed (changing it's style)
    await Promise.all(promises);

    // updates the style to its final state for both the current and the
    // target canvas elements
    current.style.opacity = 0;
    current.style.zIndex = 1;
    target.style.zIndex = 1;
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._preload = async function(useChain) {
    // retrieves the current position of the configurator from its
    // data defaulting to the zero one (reference) in case no position
    // is currently defined in the configurator
    const view = this.element.dataset.view || "side";
    const position = parseInt(this.element.dataset.position) || 0;

    let index = this.index || 0;
    index++;

    this.index = index;
    this.element.classList.add("preload");

    // adds all the frames available for all the views to the
    // list of work to be performed on pre-loading
    const work = [];
    for (const _view of Object.keys(this.frames)) {
        const viewFrames = this.frames[_view];
        for (let _index = 0; _index < viewFrames; _index++) {
            if (_index === position && view === _view) {
                continue;
            }
            const frame = ripe.getFrameKey(_view, _index);
            work.push(frame);
        }
    }
    work.reverse();

    // waits for the pre loading promise so that at the end of this
    // execution all the work required for loading is processed
    const result = await new Promise((resolve, reject) => {
        this._finalize = (result = true) => {
            // invalidates the work queue by setting its
            // length value to zero (clears array)
            work.length = 0;

            // removes the pending classes that indicate that
            // there's some kind of preloading happening
            this.element.classList.remove("preloading");
            this.element.classList.remove("no-drag");

            // unsets the finalize clojure from the current instance
            // effectively disallowing further usage of it
            this._finalize = null;

            // finalizes the promise by resolving it with
            // the parameter that was just received (final result)
            resolve(result);
        };

        const mark = element => {
            const _index = this.index;
            if (index !== _index) {
                return;
            }

            // removes the preloading class from the image element
            // and retrieves all the images still preloading,
            element.classList.remove("preloading");
            const framesBuffer = this.element.querySelector(".frames-buffer");
            const pending = framesBuffer.querySelectorAll("img.preloading") || [];

            // if there are images preloading then adds the
            // preloading class to the target element and
            // prevents drag movements to avoid flickering
            // else and if there are no images preloading and no
            // frames yet to be preloaded then the preload
            // is considered finished so drag movements are
            // allowed again and the loaded event is triggered
            if (pending.length > 0) {
                this.element.classList.add("preloading");
                this.element.classList.add("no-drag");
            } else if (work.length === 0) {
                if (this._finalize) this._finalize();
            }
        };

        const render = async () => {
            const _index = this.index;
            if (index !== _index) {
                return;
            }

            // in case there's no more work pending returns immediately
            // (nothing is remaining to be done)
            if (work.length === 0) {
                return;
            }

            // retrieves the next frame to be loaded
            // and its corresponding image element
            // and adds the preloading class to it
            const frame = work.pop();
            const framesBuffer = this.element.querySelector(".frames-buffer");
            const reference = framesBuffer.querySelector(`img[data-frame='${String(frame)}']`);
            reference.classList.add("preloading");

            // determines if a chain based loading should be used for the
            // pre-loading process of the continuous image resources to be loaded
            const _frame = ripe.parseFrameKey(frame);
            const view = _frame[0];
            const position = _frame[1];
            const promise = this._loadFrame(view, position, {
                draw: false
            });
            promise.then(() => mark(reference));
            if (useChain) await promise;
            await render();
        };

        // adds the preloading flag and then prevents mouse drag
        // movements by setting proper classes
        this.element.classList.add("preloading");
        this.element.classList.add("no-drag");

        if (work.length > 0) {
            // schedule the timeout operation in order to trigger
            // the pre-loading of the remaining frames, the delay
            // is meant to provide some time buffer to the current
            // frame (higher priority) to be processes in the server
            // effectively allowing selective QoS (Quality of Service)
            setTimeout(async () => {
                try {
                    await render();
                } catch (err) {
                    reject(err);
                }
            }, this.preloadDelay);
        } else {
            if (this._finalize) this._finalize();
        }
    });

    // returns the final result coming from the preload promise
    // that should indicate the status on the preloading operation
    return result;
};

/**
 * @ignore
 */
ripe.ConfiguratorPrc.prototype._registerHandlers = function() {
    // captures the current context to be used inside clojures
    const self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    const area = this.element.querySelector(".area");
    const back = this.element.querySelector(".back");

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

        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        const index = self._getCanvasIndex(this, event.offsetX, event.offsetY);
        if (index === 0) {
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        const part = self.partsList[index - 1];
        const isVisible = self.hiddenParts.indexOf(part) === -1;
        if (part && isVisible) self.owner.selectPart(part);
        event.stopPropagation();
    });

    area.addEventListener("mousemove", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);

        // tries to retrieve the layer/part index associated with current
        // mouse coordinates to better act in the mouse move operation, as
        // this may represent a possible highlight operation
        const index = self._getCanvasIndex(this, event.offsetX, event.offsetY);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || self.down === true) {
            self.lowlight();
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        const part = self.partsList[index - 1];
        const isVisible = self.hiddenParts.indexOf(part) === -1;
        if (part && isVisible) self.highlight(part);
        else self.lowlight();
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    area.addEventListener("dragend", function(event) {
        event.preventDefault();
    });

    back.addEventListener("click", function(event) {
        // verifies if the previous drag operation (if any) has exceed
        // the minimum threshold to be considered drag (click avoided)
        if (Math.abs(self.previous) > self.clickThreshold) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
        }

        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        const index = self._getCanvasIndex(this, event.offsetX, event.offsetY);
        if (index === 0) {
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        const part = self.partsList[index - 1];
        const isVisible = self.hiddenParts.indexOf(part) === -1;
        if (part && isVisible) self.owner.selectPart(part);
        event.stopPropagation();
    });

    back.addEventListener("mousemove", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);

        // tries to retrieve the layer/part index associated with current
        // mouse coordinates to better act in the mouse move operation, as
        // this may represent a possible highlight operation
        const index = self._getCanvasIndex(this, event.offsetX, event.offsetY);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || self.down === true) {
            self.lowlight();
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        const part = self.partsList[index - 1];
        const isVisible = self.hiddenParts.indexOf(part) === -1;
        if (part && isVisible) self.highlight(part);
        else self.lowlight();
    });

    back.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    back.addEventListener("dragend", function(event) {
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
ripe.ConfiguratorPrc.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    const child = this.element.querySelector("*:first-child");
    const referenceX = this.referenceX;
    const referenceY = this.referenceY;
    const mousePosX = this.mousePosX;
    const mousePosY = this.mousePosY;
    const base = this.base;
    const deltaX = referenceX - mousePosX;
    const deltaY = referenceY - mousePosY;
    const elementWidth = this.element.clientWidth;
    const elementHeight = this.element.clientHeight || child.clientHeight;
    const percentX = deltaX / elementWidth;
    const percentY = deltaY / elementHeight;
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
    if (this.frames[nextView] === undefined) {
        nextView = view;
    }

    // retrieves the current view and its frames
    // and determines which one is the next frame
    const viewFrames = this.frames[nextView];
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
 * Obtains the offset index (from red color) for the provided coordinates
 * and taking into account the aspect ration of the canvas.
 *
 * @param canvas {Canvas} The canvas to be used as reference for the
 * calculus of offset red color index.
 * @param x {Number} The x coordinate within the canvas to obtain index.
 * @param y {Number} The y coordinate within the canvas to obtain index.
 * @returns {Number} The offset index using as reference the main mask
 * of the current configurator.
 */
ripe.ConfiguratorPrc.prototype._getCanvasIndex = function(canvas, x, y) {
    const canvasRealWidth = canvas.getBoundingClientRect().width;
    const mask = this.element.querySelector(".mask");
    const ratio = mask.width && canvasRealWidth && mask.width / canvasRealWidth;

    x = parseInt(x * ratio);
    y = parseInt(y * ratio);

    const maskContext = mask.getContext("2d");
    const pixel = maskContext.getImageData(x, y, 1, 1);
    const r = pixel.data[0];
    const index = parseInt(r);

    return index;
};

/**
 * Builds the signature string for the current internal state
 * allowing a single unique representation of the current frame.
 *
 * This signature should allow dirty control for the configurator.
 *
 * @returns {String} The unique signature for the configurator state.
 */
ripe.ConfiguratorPrc.prototype._buildSignature = function() {
    const format = this.element.dataset.format || this.format;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const backgroundColor = this.element.dataset.background_color || this.backgroundColor;
    return `${this.owner._getQuery()}&width=${String(width)}&height=${String(
        height
    )}&format=${String(format)}&background=${String(backgroundColor)}`;
};
