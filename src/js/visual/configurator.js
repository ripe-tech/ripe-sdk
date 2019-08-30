if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" || typeof __webpack_require__ !== "undefined") // eslint-disable-line camelcase
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
ripe.Configurator = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
};

ripe.Configurator.prototype = ripe.build(ripe.Visual.prototype);

/**
 * The Configurator initializer, which is called whenever
 * the Configurator is going to become active.
 *
 * Sets the various values for the Configurator taking into
 * owner's default values.
 */
ripe.Configurator.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    this.width = this.options.width || 1000;
    this.height = this.options.height || 1000;
    this.size = this.options.size || null;
    this.maxSize = this.options.maxSize || 1000;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.interval = this.options.interval || 0;
    this.maskOpacity = this.options.maskOpacity || 0.4;
    this.maskDuration = this.options.maskDuration || 150;
    this.noMasks = this.options.noMasks === undefined ? true : this.options.noMasks;
    this.useMasks = this.options.useMasks === undefined ? !this.noMasks : this.options.useMasks;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;
    this.ready = false;
    this.drawCount = 0;
    this._observer = null;
    this._ownerBinds = {};

    this._ownerBinds["parts"] = this.owner.bind("parts", function(parts) {
        this.parts = parts;
    });

    // registers for the selected part event on the owner
    // so that we can highlight the associated part
    this._ownerBinds["selected_part"] = this.owner.bind(
        "selected_part",
        function(part) {
            this.highlight(part);
        }.bind(this)
    );

    // registers for the deselected part event on the owner
    // so that we can remove the highlight of the associated part
    this._ownerBinds["deselected_part"] = this.owner.bind(
        "deselected_part",
        function(part) {
            this.lowlight();
        }.bind(this)
    );

    // creates a structure the store the last presented
    // position of each view, to be used when returning
    // to a view for better user experience
    this._lastFrame = {};

    // creates the necessary DOM elements and runs
    // the initial layout update operation if the
    // owner has a model set
    this._initLayout();
    this.owner.brand && this.owner.model && this._updateConfig();

    // registers for the config change request event to
    // be able to properly update the internal structures
    this._ownerBinds["config"] = this.owner.bind("config", config => {
        config && this._updateConfig();
    });
};

/**
 * Resizes the configurator's DOM element to 'size' pixels.
 *
 * @param {Number} size The number of pixels to resize to.
 */
ripe.Configurator.prototype.resize = function(size) {
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
    area.width = size;
    area.height = size;
    frontMask.width = size;
    frontMask.height = size;
    frontMask.style.width = size + "px";
    frontMask.style.marginLeft = "-" + String(size) + "px";
    back.width = size;
    back.height = size;
    back.style.marginLeft = "-" + String(size) + "px";
    mask.width = size;
    mask.height = size;
    this.currentSize = size;
    this.update(
        {},
        {
            force: true
        }
    );
};

/**
 * This function is called (by the owner) whenever its state changes
 * so that the Configurator can update itself for the new state.
 *
 * @param {Object} state An object containing the new state of the owner.
 * @param {Object} options Set of optional parameters to adjust the Configurator update, such as:
 * - 'animate' - If it's to animate the update (defaults to 'false').
 * - 'duration' - The duration in milliseconds that the transition should take.
 * - 'callback' - The callback to be called at the end of the update.
 * - 'preload' - If it's to execute the pre-loading process.
 */
ripe.Configurator.prototype.update = function(state, options = {}) {
    if (this.ready === false) {
        return;
    }

    const view = this.element.dataset.view;
    const position = this.element.dataset.position;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;

    let animate = options.animate || false;
    const force = options.force || false;
    const duration = options.duration;
    const callback = options.callback;
    const preload = options.preload;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    let previous = this.signature || "";
    const signature =
        this.owner._getQuery() + "&width=" + String(width) + "&height=" + String(height);
    const changed = signature !== previous;
    animate = animate || (changed && "simple");
    this.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    previous = this.unique;
    const unique = signature + "&view=" + String(view) + "&position=" + String(position);
    if (previous === unique && !force) {
        callback && callback();
        return false;
    }
    this.unique = unique;

    // removes the highlight support from the matched object as a new
    // frame is going to be "calculated" and rendered (not same mask)
    this.lowlight();

    // runs the load operation for the current frame, taking into
    // account the multiple requirements for such execution
    this._loadFrame(
        view,
        position,
        {
            draw: true,
            animate: animate,
            duration: duration
        },
        callback
    );

    // runs the pre-loading process so that the remaining frames are
    // loaded for a smother experience when dragging the element,
    // note that this is only performed in case this is not a single
    // based update (not just the loading of the current position)
    // and the current signature has changed
    const preloaded = this.element.classList.contains("preload");
    const mustPreload = preload !== undefined ? preload : changed || !preloaded;
    mustPreload && this._preload(this.options.useChain);
};

/**
 * The Configurator deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.Configurator.prototype.deinit = function() {
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    for (const bind in this._ownerBinds) {
        this.owner.unbind(bind, this._ownerBinds[bind]);
    }

    this._removeElementHandlers();
    this._observer && this._observer.disconnect();
    this._observer = null;

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Displays a new frame, with an animation from the starting frame
 * proper animation should be performed.
 *
 * @param {Object} frame The new frame to display.
 * @param {Object} options Set of optional parameters to adjust the change frame, such as:
 * - 'type' - The animation style: 'simple' (fade in), 'cross' (crossfade) or 'null' (without any style).
 * - 'duration' - The duration of the animation in milliseconds (defaults to '500').
 * - 'stepDuration' - If defined the total duration of the animation is calculated using the amount of steps
 * times the number of steps, instead of using the 'duration' field (defaults to 'null').
 * - 'revolutionDuration' - If defined the step duration is calculated by dividing the revolution duration
 * by the number of frames in the view (defaults to 'null')
 * - 'preventDrag' - If drag actions during an animated change of frames should be ignored (defaults to 'true').
 * - 'safe' - If requested then the operation is only performed in case the configurator is not in the
 * an equivalent state (default to 'true').
 */
ripe.Configurator.prototype.changeFrame = function(frame, options = {}) {
    // parses the requested frame value according to the pre-defined
    // standard (eg: side-3) and then unpacks it as view and position
    const _frame = ripe.parseFrameKey(frame);
    const nextView = _frame[0];
    const nextPosition = parseInt(_frame[1]);

    // retrieves the animation duration from the options falling back
    // to the pre-defined duration in case it's not defined
    let duration = options.duration || this.duration;

    // unpacks the other options to the frame change defaulting their values
    // in case undefined values are found
    let stepDurationRef = options.stepDuration === undefined ? null : options.stepDuration;
    const revolutionDuration =
        options.revolutionDuration === undefined ? null : options.revolutionDuration;
    const type = options.type === undefined ? null : options.type;
    let preventDrag = options.preventDrag === undefined ? true : options.preventDrag;
    const safe = options.safe === undefined ? true : options.safe;
    const first = options.first === undefined ? true : options.first;

    // normalizes both the (current) view and position values
    const view = this.element.dataset.view;
    const position = parseInt(this.element.dataset.position);

    // tries to retrieve the amount of frames for the target view and
    // validates that the target view exists and that the target position
    // (frame) does not overflow the amount of frames in for the view
    const viewFrames = this.frames[nextView];
    if (!viewFrames || nextPosition >= viewFrames) {
        throw new RangeError("Frame " + frame + " is not supported.");
    }

    // in case the safe mode is enabled and there's an animation running
    // then this request is going to be ignored
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
    this.element.dataset.position = nextPosition;

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    let animate = false;
    if (view !== nextView && viewFrames !== undefined) {
        this.element.dataset.view = nextView;
        animate = type || "cross";
    }

    // runs the defaulting values for the current step duration
    // and the next position that is going to be rendered
    let stepDuration = null;
    let stepPosition = nextPosition;

    // in case any kind of duration was provided a timed animation
    // should be performed and as such a proper calculus should be
    // performed to determine the current step duration an the position
    // associated with the current step operation
    if (view === nextView && (duration || stepDuration || revolutionDuration)) {
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

        // determines the duration (in seconds) for each step taking
        // into account the complete duration and the number of steps
        stepDuration = duration / Math.abs(stepCount);
        options.duration = duration - stepDuration;

        // checks if it should rotate in the positive or negative direction
        // according to the current view definition and then calculates the
        // next position taking into account that definition
        const goPositive = (position + stepCount) % viewFrames === nextPosition;
        stepPosition = stepCount !== 0 ? (goPositive ? position + 1 : position - 1) : position;

        // wrap around as needed (avoiding index overflow)
        stepPosition = stepPosition < 0 ? viewFrames - 1 : stepPosition;
        stepPosition = stepPosition % viewFrames;

        // updates the position according to the calculated one on
        // the dataset, the next update operation should trigger
        // the appropriate update on the visual resources
        this.element.dataset.position = stepPosition;
    }

    // sets the initial values for the start of the animation, allows
    // control of the current animation (and exclusive lock)
    this.element.classList.add("animating");

    // if the prevent drag is set and there's an animation then
    // ignores drag movements until the animation is finished
    preventDrag = preventDrag && (animate || duration);
    preventDrag && this.element.classList.add("no-drag");

    // computes the frame key (normalized) and then triggers an event
    // notifying any listener about the new frame that was set
    const newFrame = ripe.getFrameKey(this.element.dataset.view, this.element.dataset.position);
    this.trigger("changed_frame", newFrame);

    // runs the update operation that should sync the visuals of the
    // configurator according to the current internal state (in data)
    this.update(
        {},
        {
            animate: animate,
            duration: animate ? duration : 0,
            callback: () => {
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

                // schedules the new change frame operation according to
                // the requested step duration (if animation required)
                // this is going to be the next step in the animation
                setTimeout(() => this.changeFrame(frame, options), animate ? 0 : stepDuration);
            }
        }
    );
};

/**
 * Highlights a model's part, showing a dark mask on top of the such referred
 * part identifying its borders.
 *
 * @param {String} part The part of the model that should be highlighted.
 * @param {Object} options Set of optional parameters to adjust the highlighting, such as:
 * - 'backgroundColor' - The color to use during the highlighting.
 */
ripe.Configurator.prototype.highlight = function(part, options = {}) {
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
    const backgroundColor = options.backgroundColor || this.backgroundColor;
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
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        color: backgroundColor,
        part: part
    });

    const frontMask = this.element.querySelector(".front-mask");
    const src = frontMask.getAttribute("src");
    if (src === url) {
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
        self.setAttribute("src", "");
    };
    frontMask.addEventListener("load", this.frontMaskLoad);
    frontMask.addEventListener("error", this.frontMaskError);
    frontMask.setAttribute("src", url);

    const animationId = frontMask.dataset.animation_id;
    cancelAnimationFrame(animationId);
    ripe.animateProperty(frontMask, "opacity", 0, maskOpacity, maskDuration);
};

/**
 * Removes the a highlighting of a model's part, meaning that no masks
 * are going to be presented on screen.
 *
 * @param {String} part The part to lowlight.
 * @param {Object} options Set of optional parameters to adjust the lowlighting.
 */
ripe.Configurator.prototype.lowlight = function(options) {
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
};

/**
 * Resizes the Configurator to the defined maximum size.
 *
 * @param {Object} options Set of optional parameters to adjust the resizing.
 */
ripe.Configurator.prototype.enterFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    const maxSize = this.element.dataset.max_size || this.maxSize;
    this.resize(maxSize);
};

/**
 * Resizes the Configurator to the prior defined size.
 *
 * @param {Object} options Set of optional parameters to adjust the resizing.
 */
ripe.Configurator.prototype.leaveFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    this.resize();
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
ripe.Configurator.prototype._initLayout = function() {
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
ripe.Configurator.prototype._initPartsList = async function() {
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
ripe.Configurator.prototype._populateBuffers = function() {
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
ripe.Configurator.prototype._populateBuffer = function(buffer) {
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
ripe.Configurator.prototype._updateConfig = function() {
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
    this.owner.getFrames(
        function(frames) {
            // updates the internal reference to the frames
            // model (to be used from now on)
            this.frames = frames;

            // populates the buffers taking into account
            // the frames of the model
            this._populateBuffers();

            // tries to keep the current view and position
            // if the new model supports it otherwise
            // changes to a supported frame
            let view = this.element.dataset.position;
            let position = this.element.dataset.position;
            let maxPosition = this.frames[view];
            if (!maxPosition) {
                view = Object.keys(this.frames)[0];
                position = 0;
            } else if (position >= maxPosition) {
                position = 0;
            }

            // checks the last viewed frames of each view
            // and deletes the ones not supported
            const lastFrameViews = Object.keys(this._lastFrame);
            for (view in lastFrameViews) {
                position = this._lastFrame[view];
                maxPosition = this.frames[view];
                if (!maxPosition || position >= maxPosition) {
                    delete this._lastFrame[view];
                }
            }

            // shows the new product with a crossfade effect
            // and starts responding to updates again
            this.ready = true;
            this.trigger("ready");
            this.update(
                {},
                {
                    preload: true,
                    animate: "cross",
                    force: true
                }
            );
        }.bind(this)
    );
};

/**
 * @ignore
 */
ripe.Configurator.prototype._loadFrame = function(view, position, options = {}, callback) {
    // runs the defaulting operation on all of the parameters
    // sent to the load frame operation (defaulting)
    view = view || this.element.dataset.view || "side";
    position = position || this.element.dataset.position || 0;

    const frame = ripe.getFrameKey(view, position);

    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;

    const draw = options.draw === undefined || options.draw;
    const animate = options.animate;
    const duration = options.duration;
    const framesBuffer = this.element.querySelector(".frames-buffer");
    const masksBuffer = this.element.querySelector(".masks-buffer");
    const area = this.element.querySelector(".area");
    let image = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    const front = area.querySelector("img[data-frame='" + String(frame) + "']");
    const maskImage = masksBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    image = image || front;

    // in case there's no images for the frames that are meant
    // to be loaded calls the callback immediately and returns
    // the control flow (not possible to load them)
    if (image === null || maskImage === null) {
        throw new RangeError("Frame " + frame + " is not supported.");
    }

    // triggers the async loading of the "master" mask for the current
    // frame, this should imply some level of cache usage
    this._loadMask(maskImage, view, position, options);

    // builds the URL that will be set on the image, notice that both
    // the full URL mode is avoided so that no extra parameters are
    // added to the image composition (not required)
    const url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        full: false
    });

    // creates a callback to be called when the frame
    // is drawn to trigger the callback passed to this
    // function if it's set
    const drawCallback = function() {
        callback && callback();
    };

    // verifies if the loading of the current image
    // is considered redundant (already loaded or
    // loading) and avoids for performance reasons
    const isRedundant = image.dataset.src === url;
    if (isRedundant) {
        if (!draw) {
            callback && callback();
            return;
        }
        const isReady = image.dataset.loaded === "true";
        isReady && this._drawFrame(image, animate, duration, drawCallback);
        return;
    }

    // adds load callback to the image to draw the frame
    // when it is available from the "remote" source
    image.onload = function() {
        image.dataset.loaded = true;
        image.dataset.src = url;
        if (!draw) {
            callback && callback();
            return;
        }
        this._drawFrame(image, animate, duration, drawCallback);
    }.bind(this);

    // sets the src of the image to trigger the request
    // and sets loaded to false to indicate that the
    // image is not yet loading
    image.src = url;
    image.dataset.src = url;
    image.dataset.loaded = false;
};

/**
 * @ignore
 */
ripe.Configurator.prototype._loadMask = function(maskImage, view, position, options) {
    // constructs the URL for the mask and then at the end of the
    // mask loading process runs the final update of the mask canvas
    // operation that will allow new highlight and selection operation
    // to be performed according to the new frame value
    const draw = options.draw === undefined || options.draw;
    const backgroundColor = options.backgroundColor || this.backgroundColor;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const frame = ripe.getFrameKey(view, position);
    const url = this.owner._getMaskURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        color: backgroundColor
    });
    const self = this;
    if (draw && maskImage.dataset.src === url) {
        setTimeout(function() {
            self._drawMask(maskImage);
        }, 150);
    } else {
        maskImage.onload = draw
            ? function() {
                  setTimeout(function() {
                      self._drawMask(maskImage);
                  }, 150);
              }
            : null;
        maskImage.onerror = function() {
            self.removeAttribute("src");
        };
        maskImage.crossOrigin = "Anonymous";
        maskImage.dataset.src = url;
        maskImage.setAttribute("src", url);
    }
};

/**
 * @ignore
 */
ripe.Configurator.prototype._drawMask = function(maskImage) {
    const mask = this.element.querySelector(".mask");
    const maskContext = mask.getContext("2d");
    maskContext.clearRect(0, 0, mask.width, mask.height);
    maskContext.drawImage(maskImage, 0, 0, mask.width, mask.height);
};

/**
 * @ignore
 */
ripe.Configurator.prototype._drawFrame = function(image, animate, duration, callback) {
    this.drawCount++;

    const drawId = this.drawCount;
    const area = this.element.querySelector(".area");
    const back = this.element.querySelector(".back");

    const visible = area.dataset.visible === "true";
    const current = visible ? area : back;
    const target = visible ? back : area;
    const context = target.getContext("2d");
    context.clearRect(0, 0, target.clientWidth, target.clientHeight);
    context.drawImage(image, 0, 0, target.clientWidth, target.clientHeight);

    target.dataset.visible = true;
    current.dataset.visible = false;

    if (!animate) {
        current.style.zIndex = 1;
        current.style.opacity = 0;
        target.style.zIndex = 1;
        target.style.opacity = 1;
        callback && callback();
        return;
    }

    const currentId = current.dataset.animation_id;
    const targetId = target.dataset.animation_id;
    currentId && cancelAnimationFrame(parseInt(currentId));
    targetId && cancelAnimationFrame(parseInt(targetId));

    duration = duration || (animate === "immediate" ? 0 : 500);
    if (animate === "cross") {
        ripe.animateProperty(
            current,
            "opacity",
            1,
            0,
            duration,
            () => { },
            // whenever a newer draw call is request, abort the animation
            () => drawId !== this.drawCount
        );
    }

    ripe.animateProperty(
        target,
        "opacity",
        0,
        1,
        duration,
        () => {
            current.style.opacity = 0;
            current.style.zIndex = 1;
            target.style.zIndex = 1;
            callback && callback();
        },
        // whenever a newer draw call is request, abort the animation
        () => drawId !== this.drawCount
    );
};

/**
 * @ignore
 */
ripe.Configurator.prototype._preload = function(useChain) {
    const position = parseInt(this.element.dataset.position) || 0;
    let index = this.index || 0;
    index++;
    this.index = index;
    this.element.classList.add("preload");

    // adds all the frames to the work pile
    const work = [];
    for (const view in this.frames) {
        const viewFrames = this.frames[view];
        for (let _index = 0; _index < viewFrames; _index++) {
            if (_index === position) {
                continue;
            }
            const frame = ripe.getFrameKey(view, _index);
            work.push(frame);
        }
    }
    work.reverse();

    const self = this;
    const mark = function(element) {
        const _index = self.index;
        if (index !== _index) {
            return;
        }

        // removes the preloading class from the image element
        // and retrieves all the images still preloading,
        element.classList.remove("preloading");
        const framesBuffer = self.element.querySelector(".frames-buffer");
        const pending = framesBuffer.querySelectorAll("img.preloading") || [];

        // if there are images preloading then adds the
        // preloading class to the target element and
        // prevents drag movements to avoid flickering
        // else and if there are no images preloading and no
        // frames yet to be preloaded then the preload
        // is considered finished so drag movements are
        // allowed again and the loaded event is triggered
        if (pending.length > 0) {
            self.element.classList.add("preloading");
            self.element.classList.add("no-drag");
        } else if (work.length === 0) {
            self.element.classList.remove("preloading");
            self.element.classList.remove("no-drag");
            self.trigger("loaded");
        }
    };

    const render = function() {
        const _index = self.index;
        if (index !== _index) {
            return;
        }
        if (work.length === 0) {
            return;
        }

        // retrieves the next frame to be loaded
        // and its corresponding image element
        // and adds the preloading class to it
        const frame = work.pop();
        const framesBuffer = self.element.querySelector(".frames-buffer");
        const reference = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
        reference.classList.add("preloading");

        // if a chain base loaded is used then
        // marks the current frame as pre-loaded
        // and proceeds to the next frame
        const callbackChain = function() {
            mark(reference);
            render();
        };

        // if all the images are pre-loaded at the
        // time then just marks the current one as
        // pre-loaded
        const callbackMark = function() {
            mark(reference);
        };

        // determines if a chain based loading should be used for the
        // pre-loading process of the constious image resources to be loaded
        const _frame = ripe.parseFrameKey(frame);
        const view = _frame[0];
        const position = _frame[1];
        self._loadFrame(
            view,
            position,
            {
                draw: false
            },
            useChain ? callbackChain : callbackMark
        );
        !useChain && render();
    };

    // if there are frames to be loaded then adds the
    // preloading class, prevents drag movements and
    // starts the render process after a timeout
    work.length > 0 && this.element.classList.add("preloading");
    if (work.length > 0) {
        this.element.classList.add("no-drag");
        setTimeout(function() {
            render();
        }, 250);
    }
};

/**
 * @ignore
 */
ripe.Configurator.prototype._registerHandlers = function() {
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
        self.base = _element.dataset.position || 0;
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
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    this._addElementHandler("mouseleave", function(event) {
        const _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    this._addElementHandler("mousemove", function(event) {
        if (this.classList.contains("no-drag")) {
            return;
        }
        const down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;
        down && self._parseDrag();
    });

    area.addEventListener("click", function(event) {
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
        self.hiddenParts.indexOf(part) === -1 && self.owner.selectPart(part);
        event.stopPropagation();
    });

    area.addEventListener("mousemove", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
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
        self.hiddenParts.indexOf(part) === -1 && self.highlight(part);
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    back.addEventListener("click", function(event) {
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
        self.hiddenParts.indexOf(part) === -1 && self.owner.selectPart(part);
        event.stopPropagation();
    });

    back.addEventListener("mousemove", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
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
        self.hiddenParts.indexOf(part) === -1 && self.highlight(part);
    });

    back.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    // listens for attribute changes to redraw the configurator
    // if needed, this makes use of the mutation observer
    // eslint-disable-next-line no-undef
    const Observer = MutationObserver || WebKitMutationObserver;
    this._observer = Observer
        ? new Observer(function(mutations) {
              for (let index = 0; index < mutations.length; index++) {
                  const mutation = mutations[index];
                  mutation.type === "style" && self.resize();
                  mutation.type === "attributes" && self.update();
              }
          })
        : null;
    this._observer &&
        this._observer.observe(this.element, {
            attributes: true,
            subtree: false,
            characterData: true
        });

    // adds handlers for the touch events so that they get
    // parsed to mouse events for the configurator element,
    // taking into account that there may be a touch handler
    // already defined
    ripe.touchHandler(this.element);
};

/**
 * @ignore
 */
ripe.Configurator.prototype._parseDrag = function() {
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
    let nextPosition = parseInt(base - (sensitivity * percentX * viewFrames) / 24) % viewFrames;
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
 * @ignore
 */
ripe.Configurator.prototype._getCanvasIndex = function(canvas, x, y) {
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
