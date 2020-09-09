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
ripe.ConfiguratorCSR = function (owner, element, options) {
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
ripe.ConfiguratorCSR.prototype.init = function () {
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
    
    // Meshes 
    this.meshPath = this.options.meshPath || undefined;

    // ThreeJS
    this.library = this.options.library || null;
    
    // Materials
    this.texturesPath = this.options.texturesPath || "";
    this.materialNames = this.options.materialNames || [];

    // Raycast 
    this.raycaster = new this.library.Raycaster();
    this.bodyPadding = this.options.bodyPadding || 0;
    this.intersectedPart = "";
    
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

    this._initializeLights();
    this._initializeCamera();
    this._initializeRenderer();
    this._initializeMesh();
};

/**
 * The Configurator deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.ConfiguratorCSR.prototype.deinit = async function () {
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


ripe.ConfiguratorCSR.prototype._disposeResources = function () {
    console.log("Disposing resources");
    if (this.meshes) {
        for (let i = 0 ; i < this.meshes.length; i++) {
            this.scene.remove(this.meshes[i]);
            this.meshes[i].geometry.dispose();
            this.meshes[i].material.dispose();
        }
    }
    if (this.materials) {
        for (let i = 0 ; i < this.materialNames.length ; i++) {
            this.materials[this.materialNames[i]].dispose();
        }
    }
}

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
ripe.ConfiguratorCSR.prototype.updateOptions = async function (options, update = true) {
    ripe.Visual.prototype.updateOptions.call(this, options);

    if (options.meshPath && this.meshPath != options.meshPath) {
        this.meshPath = this.options.meshPath;
        this._initializeMesh();
    }
    this.library = options.library === undefined ? this.library : options.library;
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
ripe.ConfiguratorCSR.prototype.update = async function (state, options = {}) {
    // in case the configurator is currently nor ready for an
    // update none is performed and the control flow is returned
    // with the false value (indicating a no-op, nothing was done)
    if (this.ready === false) {
        this.trigger("not_loaded");
        return false;
    }

    const view = this.element.dataset.view;
    const position = this.element.dataset.position;

    const force = options.force || false;

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

    if (this.meshes) {
        for (let i = 0; i < this.meshes.length; i++) {
            this.meshes[i].rotation.y = (position / 24) * Math.PI * 2;
        }
    }

    this.render();

    // removes the highlight support from the matched object as a new
    // frame is going to be "calculated" and rendered (not same mask)
    this.lowlight();

    // returns the resulting value indicating if the loading operation
    // as been triggered with success (effective operation)
    return true;
};

/**
 * This function is called (by the owner) whenever the current operation
 * in the child should be canceled this way a Configurator is not updated.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator.
 */
ripe.ConfiguratorCSR.prototype.cancel = async function (options = {}) {
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
ripe.ConfiguratorCSR.prototype.resize = async function (size) {
    if (this.element === undefined) {
        return;
    }

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
ripe.ConfiguratorCSR.prototype.changeFrame = async function (frame, options = {}) {
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
        var transitionOptions = {
            changeView: true,
            nextView: nextView,
            duration: duration
        };

        this.transition(transitionOptions);
        return;
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
    // in case there's a mesh defined in the current instance then applies
    // a rotation around the Y axis 
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

ripe.ConfiguratorCSR.prototype.transition = function (options = {}) {
    if (options.changeView) {
        this.view = options.nextView;
        this.element.dataset.view = options.nextView;
        this.duration = options.duration;

        const newScene = new this.library.Scene();
        const newCamera = new this.library.PerspectiveCamera(35, 620 / 620, 1, 20000);
        if (options.nextView == "top") {
            newCamera.position.set(0, this.cameraDistance, 0);
            newCamera.lookAt(this.cameraTarget);

            // TODO USE NEW CAMERA 
            this.camera.position.set(0, this.cameraDistance, 0);
            this.camera.lookAt(this.cameraTarget);
        } else if (options.nextView == "side") {
            newCamera.position.set(0, this.cameraHeight, this.cameraDistance);
            newCamera.lookAt(this.cameraTarget);

            // TODO USE NEW CAMERA 
            this.camera.position.set(0, this.cameraHeight, this.cameraDistance);
            this.camera.lookAt(this.cameraTarget);
        }

        //this.populateScene(newScene);
        this.render();
        //this.renderer.render(newScene, newCamera);
    }
};

/**
 * Highlights a model's part, showing a dark mask on top of the such referred
 * part identifying its borders.
 *
 * @param {String} part The part of the model that should be highlighted.
 * @param {Object} options Set of optional parameters to adjust the highlighting.
 */
ripe.ConfiguratorCSR.prototype.highlight = function (part, options = {}) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    if (!this.meshes) {
        return;
    }

    for (let i = 0 ; i < this.meshes.length; i++) {
        if (this.meshes[i].name == part) {
            this.meshes[i].material.color.r = 0.5;
            this.meshes[i].material.color.g = 0.5;
            this.meshes[i].material.color.b = 0.5;
            this.render();
        } 
    }
    //ripe.cancelAnimation(frontMask);
    //ripe.animateProperty(frontMask, "opacity", 0, maskOpacity, maskDuration, false);
};

/**
 * Removes the a highlighting of a model's part, meaning that no masks
 * are going to be presented on screen.
 *
 * @param {String} part The part to lowlight.
 * @param {Object} options Set of optional parameters to adjust the lowlighting.
 */
ripe.ConfiguratorCSR.prototype.lowlight = function (options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    if (!this.meshes) {
        return;
    }

    for (let i = 0 ; i < this.meshes.length; i++) {
        if (this.meshes[i].name == this.intersectedPart) {
            this.meshes[i].material.color.r = 1;
            this.meshes[i].material.color.g = 1;
            this.meshes[i].material.color.b = 1;
            this.render();
        } 
    }

    // triggers an event indicating that a lowlight operation has been
    // performed on the current configurator
    //this.trigger("lowlighted");
    this.render();
};

/**
 * Resizes the Configurator to the defined maximum size.
 *
 * @param {Object} options Set of optional parameters to adjust the resizing.
 */
ripe.ConfiguratorCSR.prototype.enterFullscreen = async function (options) {
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
ripe.ConfiguratorCSR.prototype.leaveFullscreen = async function (options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    await this.resize();
};

/**
 * Turns on (enables) the masks on selection/highlight.
 */
ripe.ConfiguratorCSR.prototype.enableMasks = function () {
    this.useMasks = true;
};

/**
 * Turns off (disables) the masks on selection/highlight.
 */
ripe.ConfiguratorCSR.prototype.disableMasks = function () {
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
ripe.ConfiguratorCSR.prototype._initLayout = function () {
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

    // register for all the necessary DOM events
    this._registerHandlers();


};

/**
 * @ignore
 */
ripe.ConfiguratorCSR.prototype._initPartsList = async function () {
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
ripe.ConfiguratorCSR.prototype._updateConfig = async function (animate) {
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
    
    // Only after the configurator is ready can the bounding box be
    // correctly identified
    this.elementBoundingBox = this.element.getBoundingClientRect();
    
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
ripe.ConfiguratorCSR.prototype._registerHandlers = function () {
    // captures the current context to be used inside clojures
    const self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    const area = this.element.querySelector(".area");

    // binds the mousedown event on the element to prepare
    // it for drag movements
    this._addElementHandler("mousedown", function (event) {
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
    this._addElementHandler("mouseup", function (event) {
        const _element = this;
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    this._addElementHandler("mouseleave", function (event) {
        const _element = this;
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    this._addElementHandler("mousemove", function (event) {
        if (!this.classList.contains("ready") || this.classList.contains("no-drag")) {
            return;
        }

        const down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;
        if (down) self._parseDrag();
    });

    area.addEventListener("click", function (event) {
        // verifies if the previous drag operation (if any) has exceed
        // the minimum threshold to be considered drag (click avoided)
        if (Math.abs(self.previous) > self.clickThreshold) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
        }

        const animating = self.element.classList.contains("animating");
        if (animating) {
            return;
        }
        event = ripe.fixEvent(event);

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        //const part = self.partsList[index - 1];
        //const isVisible = self.hiddenParts.indexOf(part) === -1;
        //if (part && isVisible) self.owner.selectPart(part);
        event.stopPropagation();
    });

    area.addEventListener("mousemove", function (event) {
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
        
        const mouse = self._getNormalizedCoordinatesRaycast(event);
        self._intersectRaycast(mouse);
    });

    area.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });

    area.addEventListener("dragend", function (event) {
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

ripe.ConfiguratorCSR.prototype._intersectRaycast = function (mouse) {
    if (this.raycaster && this.scene) {
        this.raycaster.setFromCamera( mouse, this.camera );

        var intersects = this.raycaster.intersectObjects( this.scene.children);
        
        if (intersects.length > 0) {
            if (this.intersectedPart != intersects[0].object.name) {
                if (this.intersectedPart != "") {
                    console.log("Changing part");
                    this.lowlight();
                }
                this.intersectedPart = intersects[0].object.name;
                console.log("Intersecting " + this.intersectedPart);
                this.highlight(this.intersectedPart);
            } 
        }
        else {
            if (this.intersectedPart != "") {
                console.log("No part selected")
                this.lowlight();
                this.intersectedPart = "";
            }
        }
    }
};

ripe.ConfiguratorCSR.prototype._getNormalizedCoordinatesRaycast = function (mouseEvent) {
    // Origin of the coordinate system is the center of the element
    // Coordinates range from -1,-1 (bottom left) to 1,1 (top right)
    const newX = ((mouseEvent.x - this.elementBoundingBox.x) / this.elementBoundingBox.width) * 2 - 1;
    const newY = - ((mouseEvent.y - this.elementBoundingBox.y - this.bodyPadding) / this.elementBoundingBox.height) * 2 + 1;

    return {
        x: newX,
        y: newY
    }
};

/**
 * @ignore
 */
ripe.ConfiguratorCSR.prototype._parseDrag = function () {
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
ripe.ConfiguratorCSR.prototype._buildSignature = function () {
    const format = this.element.dataset.format || this.format;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const backgroundColor = this.element.dataset.background_color || this.backgroundColor;
    return `${this.owner._getQuery()}&width=${String(width)}&height=${String(
        height
    )}&format=${String(format)}&background=${String(backgroundColor)}`;
};

ripe.ConfiguratorCSR.prototype._initializeLights = function () {
    const keyLight = new this.library.PointLight(0xffffff, 2, 18);
    keyLight.position.set(2, 2, 2);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.000001;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.radius = 8;

    const fillLight = new this.library.PointLight(0xffffff, 1, 18);
    fillLight.position.set(-2, 1, 2);
    fillLight.castShadow = true;
    fillLight.shadow.camera.near = 0.000001;
    fillLight.shadow.camera.far = 10;
    fillLight.shadow.radius = 8;

    const rimLight = new this.library.PointLight(0xffffff, 2.5, 18);
    rimLight.position.set(-1, 1.5, -3);
    rimLight.castShadow = true;
    rimLight.shadow.camera.near = 0.000001;
    rimLight.shadow.camera.far = 10;
    rimLight.shadow.radius = 8;

    const ambientLight = new this.library.AmbientLight(0xffffff, 0.1);

    this.lights = [keyLight, fillLight, rimLight, ambientLight]    
};

ripe.ConfiguratorCSR.prototype._initializeRenderer = function () {
    // creates the renderer using the "default" WebGL approach
    // notice that the shadow map is enabled
    this.renderer = new this.library.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(620, 620);
    this.renderer.toneMappingExposure = this.exposure;
    this.renderer.toneMapping = this.library.CineonToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.library.BasicShadowMap;

    // retrieves the target area element and adds the DOM element
    // of the renderer to it
    const area = this.element.querySelector(".area");

    area.appendChild(this.renderer.domElement);
};

ripe.ConfiguratorCSR.prototype._initializeCamera = function () {
    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;

    this.camera = new this.library.PerspectiveCamera(35, width / height, 1, 20000);
    this.camera.position.set(0, this.cameraHeight, this.cameraDistance);
};

ripe.ConfiguratorCSR.prototype.populateScene = function (scene) {
    for (let i = 0; i < this.lights.length; i++) {
        scene.add(this.lights[i]);
    }
    for (let i = 0; i < this.meshes.length; i++) {
        scene.add(this.meshes[i]);
    }
    scene.add(this.floorMesh);
}

ripe.ConfiguratorCSR.prototype._initializeTexturesAndMaterials = async function () {
    console.log("Initializing Textures");
    const textureLoader = new this.library.TextureLoader();

    this.materials = {};

    for (let i = 0; i < this.materialNames.length; i++) {
        var diffuseMapPath = this.getTexturePath(this.materialNames[i], "diffuse");
        var roughnessMapPath = this.getTexturePath(this.materialNames[i], "roughness");
        var normalMapPath = this.getTexturePath(this.materialNames[i], "normal");
        var aoMapPath = this.getTexturePath(this.materialNames[i], "ao");

        const diffuseTexture = await new Promise((resolve, reject) => {
            textureLoader.load(diffuseMapPath, function (texture) {
                resolve(texture);
            });
        });

        const roughnessTexture = await new Promise((resolve, reject) => {
            textureLoader.load(roughnessMapPath, function (texture) {
                resolve(texture);
            });
        });

        const normalTexture = await new Promise((resolve, reject) => {
            textureLoader.load(normalMapPath, function (texture) {
                resolve(texture);
            });
        });

        const aoTexture = await new Promise((resolve, reject) => {
            textureLoader.load(aoMapPath, function (texture) {
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

        const material = new this.library.MeshStandardMaterial({
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

        this.materials[this.materialNames[i]] = material;
    }

    this.crossFadeMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse1: {
                value: null
            },
            tDiffuse2: {
                value: null
            },
            mixRatio: {
                value: 0.0
            },
            threshold: {
                value: 0.1
            },
            useTexture: {
                value: 1
            }
        },
        vertexShader: [
            "varying vec2 vUv;",

            "void main() {",

            "vUv = vec2( uv.x, uv.y );",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"
        ].join("\n"),
        fragmentShader: [
            "uniform float mixRatio;",

            "uniform sampler2D tDiffuse1;",
            "uniform sampler2D tDiffuse2;",
            "uniform sampler2D tMixTexture;",

            "uniform int useTexture;",
            "uniform float threshold;",

            "varying vec2 vUv;",

            "void main() {",

            "	vec4 texel1 = texture2D( tDiffuse1, vUv );",
            "	vec4 texel2 = texture2D( tDiffuse2, vUv );",

            "	if (useTexture==1) {",

            "		vec4 transitionTexel = texture2D( tMixTexture, vUv );",
            "		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;",
            "		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);",

            "		gl_FragColor = mix( texel1, texel2, mixf );",

            "	} else {",

            "		gl_FragColor = mix( texel2, texel1, mixRatio );",

            "	}",

            "}"
        ].join("\n")

    });

    console.log("Finished loading textures");
};

ripe.ConfiguratorCSR.prototype.getTexturePath = function (materialName, type) {
    return this.texturesPath + materialName + "/" + materialName + "_" + type + ".jpg"
}

ripe.ConfiguratorCSR.prototype._initializeMesh = async function () {
    await this._initializeTexturesAndMaterials();
    console.log("Initializing Mesh");
    const gltfLoader = new this.library.GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(this.meshPath, gltf => {
            resolve(gltf);
        });
    });

    const model = gltf.scene;
    // eslint-disable-next-line no-undef
    const box = new this.library.Box3().setFromObject(model);

    // eslint-disable-next-line no-undef
    const floorGeometry = new this.library.PlaneGeometry(100, 100);
    // eslint-disable-next-line no-undef
    const floorMaterial = new this.library.ShadowMaterial();
    floorMaterial.opacity = 0.5;

    // eslint-disable-next-line no-undef
    this.floorMesh = new this.library.Mesh(floorGeometry, floorMaterial);
    this.floorMesh.rotation.x = Math.PI / 2;
    this.floorMesh.receiveShadow = true;
    this.floorMesh.position.y = box.min.y;
    // floorMesh.position.x = 0;

    model.castShadow = true;

    const centerX = box.min.x + (box.max.x - box.min.x) / 2.0;
    const centerY = box.min.y + (box.max.y - box.min.y) / 2.0;
    // eslint-disable-next-line no-undef
    this.cameraTarget = new this.library.Vector3(centerX, centerY, 0);
    this.camera.lookAt(this.cameraTarget);
    this.camera.position.x = centerX;

    this.meshes = []

    for (let i = 0; i < model.children.length; i++) {
        if (model.children[i].isMesh) {
            model.children[i].castShadow = true;
            model.children[i].receiveShadow = true;
            this.meshes.push(model.children[i])
        }   
    }

    console.log("Finished loading models")

    this.randomize();

    // Only now can we populate the scene safely
    this.scene = new this.library.Scene();
    this.populateScene(this.scene);
    this.render();
};

ripe.ConfiguratorCSR.prototype.randomize = function () {
    for (let i = 0; i < this.meshes.length; i++) {
        let index = Math.floor(Math.random() * this.materialNames.length);
        this.meshes[i].material.dispose();
        this.meshes[i].material = this.materials[this.materialNames[index]].clone();
        this.render();
    }
}

ripe.ConfiguratorCSR.prototype.render = function () {
    if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
    }
};
