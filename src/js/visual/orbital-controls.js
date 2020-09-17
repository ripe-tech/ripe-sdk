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

// STRUCTURE
// stores internal logic of mouse movement

ripe.OrbitalControls = function(configurator, element, options) {
    this.configurator = configurator;
    this.element = element;
    this.options = options;

    this.maximumHorizontalRot = this.options.maximumHorizontalRot || 180;
    this.minimumHorizontalRot = this.options.minimumHorizontalRot || -180;

    this.maximumVerticalRot = this.options.maximumVerticalRot || 90;
    this.minimumVerticalRot = this.options.minimumVerticalRot || 0;

    var startingPosition = this.options.position || 0;
    this._baseHorizontalRot = this._positionToRotation(startingPosition);
    this.currentHorizontalRot = this._baseHorizontalRot;
    this._baseVerticalRot = 0;
    this.currentVerticalRot = this._baseVerticalRot;
    // Types of transition = "cross" "rotation" "none"
    this.viewAnimate = this.options.viewAnimate === undefined ? "rotate" : this.options.viewAnimate;

    this._registerHandlers();
};

ripe.OrbitalControls.prototype = ripe.build(ripe.Observable.prototype);
ripe.OrbitalControls.prototype.constructor = ripe.OrbitalControls;

ripe.OrbitalControls.prototype._registerHandlers = function() {
    // captures the current context to be used inside clojures
    const self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    const area = this.element.querySelector(".area");

    // binds the mousedown event on the element to prepare
    // it for drag movements
    area.addEventListener("mousedown", function(event) {
        const _element = self.element;
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
    area.addEventListener("mouseup", function(event) {
        const _element = self.element;
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");

        event = ripe.fixEvent(event);

        // Apply rotation to model
        self._baseHorizontalRot = self.currentHorizontalRot;
        self.currentHorizontalRot = self._baseHorizontalRot;
        self.mouseDeltaX = 0;

        // Apply rotation to camera
        self._baseVerticalRot = self.currentVerticalRot;
        self.currentVerticalRot = self._baseVerticalRot;
        self.mouseDeltaY = 0;
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    area.addEventListener("mouseleave", function(event) {
        const _element = this;
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    area.addEventListener("mousemove", function(event) {
        // if (this.classList.contains("no-drag")) {
        //  return;
        // }

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
 * Converts the position of the element to a rotation that can be applied to
 * the model or the camera.
 */
ripe.OrbitalControls.prototype._positionToRotation = function(position) {
    return (position / 24) * 360;
};

ripe.OrbitalControls.prototype.updateOptions = async function(options) {
    // TODO add here options
};

/**
 * @ignore
 */
ripe.OrbitalControls.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    const referenceX = this.referenceX;
    const referenceY = this.referenceY;
    const mousePosX = this.mousePosX;
    const mousePosY = this.mousePosY;

    const base = this.base;
    this.mouseDeltaX = referenceX - mousePosX;
    this.mouseDeltaY = referenceY - mousePosY;
    const elementWidth = this.element.clientWidth;
    const elementHeight = this.element.clientHeight;
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
    this.configurator.changeFrame(nextFrame);
};

ripe.OrbitalControls.prototype.updateRotation = function(frame, options) {
    const dragging = this.element.classList.contains("drag");

    const _frame = ripe.parseFrameKey(frame);

    if (dragging) this._updateDragRotations();
    else this._checkViewPositionRotations(_frame, options);
};

/**
 * Sets the rotation of the camera and meshes based on their current
 * continuous rotation.
 */
ripe.OrbitalControls.prototype._updateDragRotations = function() {
    var needsUpdate = false;

    // if there is no difference to the previous drag rotation in the X axis
    if (this._baseHorizontalRot - this.mouseDeltaX !== this.currentHorizontalRot) {
        this.currentHorizontalRot = (this._baseHorizontalRot - this.mouseDeltaX) % 360;

        needsUpdate = true;
    }

    var diff;
    // if there is no difference to the previous drag rotation in the Y axis
    if (this._baseVerticalRot - this.mouseDeltaY !== this.currentVerticalRot) {
        // If reached bottom
        if (this.mouseDeltaY >= this.minimumVerticalRot + this._baseVerticalRot) {
            diff = this.mouseDeltaY - (this.minimumVerticalRot + this._baseVerticalRot);

            // console.log("reached bottom with diff " + diff + " delta " + this.mouseDeltaY + " base " + this._baseVerticalRot + " minimum " + this.minimumVerticalRot)

            this.referenceY -= diff;
            this.mouseDeltaY += diff;
        } // If reached top
        else if (this.mouseDeltaY <= this._baseVerticalRot - this.maximumVerticalRot) {
            diff = -(this.mouseDeltaY - (this._baseVerticalRot - this.maximumVerticalRot));

            // console.log("reached top with diff " + diff + " delta " + this.mouseDeltaY + " base " + this._baseVerticalRot + " maximum " + this.maximumVerticalRot)

            this.referenceY += diff;
            this.mouseDeltaY -= diff;
        } // Else is valid rotation
        else {
            this.currentVerticalRot = this._baseVerticalRot - this.mouseDeltaY;

            needsUpdate = true;
        }
    }

    if (needsUpdate) this.configurator._applyRotations();
};

ripe.OrbitalControls.prototype._checkViewPositionRotations = function(frame, options) {
    const animating = this.element.classList.contains("animating");

    // parses the requested frame value according to the pre-defined
    // standard (eg: side-3) and then unpacks it as view and position
    const nextView = frame[0];
    const nextPosition = parseInt(frame[1]);
    const position = parseInt(this.element.dataset.position);
    const view = this.element.dataset.view;

    // Nothing has changed, or is performing other transition
    if ((view === nextView && position === nextPosition) || animating) return;

    /*
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
    */
    var duration = 500;

    if (view === nextView || this.viewAnimate === "rotate") {
        this.rotationTransition(nextView, nextPosition, duration);
        this.configurator.updateViewPosition(nextView, nextPosition);
        return;
    }

    this.currentHorizontalRot = this._positionToRotation(nextPosition);
    this.currentVerticalRot = 0;

    if (nextView === "top") this.currentVerticalRot = this.maximumVerticalRot;
    if (nextView === "bottom") this.currentVerticalRot = this.minimumVerticalRot;

    if (this.viewAnimate === "none") {
        this.configurator._applyRotations();
        this.configurator.updateViewPosition(nextView, nextPosition);
        return;
    }

    this.configurator._beginTransition({
        type: "rotation",
        method: this.viewAnimate,
        rotationX: this.currentHorizontalRot,
        rotationY: this.currentVerticalRot
    });
    this.configurator.updateViewPosition(nextView, nextPosition);
};

ripe.OrbitalControls.prototype.rotationTransition = function(nextView, nextPosition, duration) {
    const position = parseInt(this.element.dataset.position);
    const view = this.element.dataset.view;

    var finalXRotation = this.currentHorizontalRot;
    var finalYRotation = this.currentVerticalRot;

    this._baseHorizontalRot = this.currentHorizontalRot;
    this._baseVerticalRot = this.currentVerticalRot;

    var startTime = Date.now();
    var currentTime = startTime;

    const transition = () => {
        currentTime = Date.now() - startTime;
        // console.log(this._baseHorizontalRot, finalXRotation, this._baseVerticalRot, finalYRotation);

        this.currentHorizontalRot = ripe.linearTween(
            currentTime,
            this._baseHorizontalRot,
            finalXRotation,
            duration
        );
        this.currentVerticalRot = ripe.linearTween(
            currentTime,
            this._baseVerticalRot,
            finalYRotation,
            duration
        );

        this.configurator._applyRotations();

        if (currentTime < duration) requestAnimationFrame(transition);
        else {
            this._baseHorizontalRot = this.currentHorizontalRot;
            this._baseVerticalRot = this.currentVerticalRot;

            this.element.classList.remove("animating");
            this.element.classList.remove("no-drag");
        }
    };

    if (view !== nextView) {
        finalYRotation = 0;

        if (nextView === "top") finalYRotation = this.maximumVerticalRot;
        if (nextView === "bottom") finalYRotation = this.minimumVerticalRot;
    }
    if (position !== nextPosition) {
        finalXRotation = this._positionToRotation(nextPosition);
    }

    this.element.classList.add("no-drag");
    this.element.classList.add("animating");
    requestAnimationFrame(transition);
};
