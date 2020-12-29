if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    const base = require("../../base");
    // eslint-disable-next-line no-redeclare
    // eslint-disable-next-line no-var
    var ripe = base.ripe;
}

/**
 * @class
 * @classdesc Class that handles controlling the scene based on input.
 *
 * @param {ConfiguratorCSR} configurator The base configurator.
 * @param {Object} element The HTML element that contains the configurator.
 * @param {Object} options The options to be used to configure the controls.
 */
ripe.CSRControls = function(configurator, element, options) {
    this.configurator = configurator;
    this.element = element;

    this.maximumHorizontalRot = 180;
    this.minimumHorizontalRot = -180;
    this.maximumVerticalRot = 89;
    this.minimumVerticalRot = 0;

    const startingPosition = options.position || 0;
    this._baseHorizontalRot = this._positionToRotation(startingPosition);
    this.currentHorizontalRot = this._baseHorizontalRot;

    this._baseVerticalRot = 0;
    this.currentVerticalRot = this._baseVerticalRot;

    this.rotationEasing = "easeInOutQuad";

    this.cameraDistance = 100;
    this._baseCameraDistance = 100;
    this.maxDistance = 1000;
    this.minDistance = 0;

    this.lockRotation = "";

    this.mouseDrift = true;
    this.canDrift = false;
    this.driftDuration = 200;

    this._previousEvent = null;
    this.canZoom = true;

    this._setControlsOptions(options);

    this._registerHandlers();
};

ripe.CSRControls.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRControls.prototype.constructor = ripe.CSRControls;

/**
 * Sets the controls parameters based on options struct.
 *
 * @param {Object} options The struct containing the parameters that will dictate the
 * controls' behaviour.
 */
ripe.CSRControls.prototype._setControlsOptions = function(options) {
    if (options.camera) {
        this.cameraDistance =
            options.camera.distance === undefined ? this.cameraDistance : options.camera.distance;
        this._baseCameraDistance = this.cameraDistance;
        this.maxDistance =
            options.camera.maxDistance === undefined
                ? this.maxDistance
                : options.camera.maxDistance;
        this.minDistance =
            options.camera.minDistance === undefined
                ? this.minDistance
                : options.camera.minDistance;
    }

    if (!options.controls) return;

    const controlOptions = options.controls;

    this.maximumHorizontalRot =
        controlOptions.maximumHorizontalRot === undefined
            ? this.maximumHorizontalRot
            : controlOptions.maximumHorizontalRot;
    this.minimumHorizontalRot =
        controlOptions.minimumHorizontalRot === undefined
            ? this.minimumHorizontalRot
            : controlOptions.minimumHorizontalRot;

    this.maximumVerticalRot =
        controlOptions.maximumVerticalRot === undefined
            ? this.maximumVerticalRot
            : controlOptions.maximumVerticalRot;
    this.minimumVerticalRot =
        controlOptions.minimumVerticalRot === undefined
            ? this.minimumVerticalRot
            : controlOptions.minimumVerticalRot;

    // types of transition can be "cross", "rotation" or "none"
    this.rotationEasing =
        controlOptions.rotationEasing === undefined
            ? this.rotationEasing
            : controlOptions.rotationEasing;

    this.lockRotation =
        controlOptions.lockRotation === undefined ? this.lockRotation : controlOptions.lockRotation;

    this.canZoom = controlOptions.canZoom === undefined ? this.canZoom : controlOptions.canZoom;

    this.mouseDrift =
        controlOptions.mouseDrift === undefined ? this.mouseDrift : controlOptions.mouseDrift;

    this.driftDuration =
        controlOptions.driftDuration === undefined
            ? this.driftDuration
            : controlOptions.driftDuration;
};

/**
 * @ignore
 */
ripe.CSRControls.prototype.updateOptions = async function(options) {
    this.element = options.element === undefined ? this.element : options.element;

    const startingPosition =
        options.position === undefined ? this.element.position : options.position;
    this._baseHorizontalRot = this._positionToRotation(startingPosition);
    this._setControlsOptions(options);
};

/**
 * Registers the handlers that will listen to events happening inside the configurator element.
 */
ripe.CSRControls.prototype._registerHandlers = function() {
    // captures the current context to be used inside clojures
    const self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    const area = this.element.querySelector(".area");

    // binds the mousedown event on the element to prepare
    // it for drag movements
    area.addEventListener("mousedown", function(event) {
        const _element = self.element;
        const animating = self.element.classList.contains("animating");

        if (animating) return;

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

        self._previousEvent = undefined;
        self._updateAngles();
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    area.addEventListener("mouseout", function(event) {
        const _element = this;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");

        const animating = self.element.classList.contains("animating");

        if (animating) return;

        self._updateAngles();
        if (self._previousEvent && self.down) self._drift(self._previousEvent);

        self.down = false;
    });

    // listens for mouse enter events and if it occurs then
    // resets the current parameters
    area.addEventListener("mouseenter", function(event) {
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;

        self.canDrift = false;
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    area.addEventListener("mousemove", function(event) {
        const down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;

        if (down) {
            self._previousEvent = event;
            self.canDrift = true;
            self.isDrifting = false;
            self._parseDrag();
        } else if (self.canDrift && !self.isDrifting) {
            self.canDrift = false;
            self._drift(event);
        }
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

        event.stopPropagation();
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    area.addEventListener("dragend", function(event) {
        event.preventDefault();
    });

    // adds handlers for the touch events so that they get
    // parsed to mouse events for the configurator element,
    // taking into account that there may be a touch handler
    // already defined
    ripe.touchHandler(this.element);

    if (!this.canZoom) return;

    // listens to the mouse wheel event to zoom in or out
    area.addEventListener(
        "wheel",
        function(event) {
            event.preventDefault();

            const animating = self.element.classList.contains("animating");

            if (animating) return;

            self.cameraDistance = Math.max(
                Math.min(self.cameraDistance + event.deltaY, self.maxDistance),
                self.minDistance
            );
            self.configurator.rotate(
                {
                    rotationX: self.currentHorizontalRot,
                    rotationY: self.currentVerticalRot,
                    distance: self.cameraDistance
                },
                false
            );
        },
        { passive: false }
    );
};

/**
 * Updates the base angles based on either the current angles, or the parameters in the options
 * structure.
 *
 * @param {Object} options If specified, update the base and current angles based on the options.
 */
ripe.CSRControls.prototype._updateAngles = function(options = {}) {
    const newX = options.rotationX === undefined ? this.currentHorizontalRot : options.rotationX;
    const newY = options.rotationY === undefined ? this.currentVerticalRot : options.rotationY;

    this._baseHorizontalRot = this._validatedAngle(newX);
    this.currentHorizontalRot = this._validatedAngle(newX);
    this.mouseDeltaX = 0;

    this._baseVerticalRot = newY;
    this.currentVerticalRot = newY;
    this.mouseDeltaY = 0;
};

/**
 * * Converts a position of the element to a rotation that can be applied to
 * the model or the camera.
 *
 * @param {Number} position The position that is used for the conversion.
 * @returns {Number} The normalized rotation (degrees) for the given position.
 */
ripe.CSRControls.prototype._positionToRotation = function(position) {
    return (position / 24) * 360;
};

/**
 * Converts a rotation to a position.
 *
 * @param {Number} rotationX The rotation that is used for the conversion.
 * @returns {Number} The normalized position for the provided rotation (degrees).
 */
ripe.CSRControls.prototype._rotationToPosition = function(rotationX) {
    return (this._validatedAngle(parseInt(rotationX)) / 360) * 24;
};

/**
 * Maps a vertical rotation to a view.
 *
 * @param {Number} rotationY The rotation to be converted into a view.
 * @returns {String} The normalized view value for the given Y rotation.
 */
ripe.CSRControls.prototype._rotationToView = function(rotationY) {
    if (rotationY > 85) return "top";
    if (rotationY < -85) return "bottom";
    return "side";
};

/**
 * @ignore
 */
ripe.CSRControls.prototype._parseDrag = function() {
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

/**
 * Called from the configurator, calls the correct function to update the rotations.
 */
ripe.CSRControls.prototype.updateRotation = function(frame, options) {
    const dragging = this.element.classList.contains("drag");

    const _frame = ripe.parseFrameKey(frame);

    if (dragging) this._updateDragRotations();
    else this._updateRotations(_frame, options);
};

/**
 * Sets the rotation of the camera and meshes based on their current
 * continuous rotation.
 */
ripe.CSRControls.prototype._updateDragRotations = function() {
    let needsUpdate = false;

    // if there is no difference to the previous drag rotation in the X axis
    if (
        this._baseHorizontalRot - this.mouseDeltaX !== this.currentHorizontalRot &&
        this.lockRotation !== "vertical"
    ) {
        this.currentHorizontalRot = this._baseHorizontalRot - this.mouseDeltaX;

        needsUpdate = true;
    }

    let diff;

    // if there is no difference to the previous drag rotation in the Y axis
    if (
        this._baseVerticalRot - this.mouseDeltaY !== this.currentVerticalRot &&
        this.lockRotation !== "horizontal"
    ) {
        // in case the bottom is reached, deltaY is inverted
        if (this.mouseDeltaY * -1 + this._baseVerticalRot <= this.minimumVerticalRot) {
            diff = this.minimumVerticalRot - (this.mouseDeltaY * -1 + this._baseVerticalRot);
            this.currentVerticalRot = this.minimumVerticalRot;

            this.referenceY -= diff;
            needsUpdate = true;
        }
        // in case the top is reached
        else if (this.mouseDeltaY * -1 + this._baseVerticalRot >= this.maximumVerticalRot) {
            diff = this.maximumVerticalRot - (this.mouseDeltaY * -1 + this._baseVerticalRot);
            this.currentVerticalRot = this.maximumVerticalRot;

            this.referenceY -= diff;
            needsUpdate = true;
        } // Else is valid rotation
        else {
            this.currentVerticalRot = this._baseVerticalRot - this.mouseDeltaY;

            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        this.configurator.rotate(
            {
                rotationX: this.currentHorizontalRot,
                rotationY: this.currentVerticalRot,
                distance: this.cameraDistance
            },
            false
        );
    }
};

/**
 * Called when a changeFrame event is registered, and updates the angles based on the
 * new frame.
 *
 * @param {String} frame The new frame.
 * @param {Object} options Options to be used for the change.
 */
ripe.CSRControls.prototype._updateRotations = async function(frame, options) {
    const animating = this.element.classList.contains("animating");

    // parses the requested frame value according to the pre-defined
    // standard (eg: side-3) and then unpacks it as view and position
    const nextView = frame[0];
    const nextPosition = parseInt(frame[1]);
    const position = parseInt(this.element.dataset.position);
    const view = this.element.dataset.view;

    // Nothing has changed, or is performing other transition
    if ((view === nextView && position === nextPosition) || animating) return false;

    // unpacks the other options to the frame change defaulting their values
    // in case undefined values are found
    let duration = options.duration === undefined ? null : options.duration;
    duration = duration || this.duration;
    const revolutionDuration = options.revolutionDuration;

    const nextHorizontalRot = this._positionToRotation(nextPosition);

    if (revolutionDuration) {
        duration = revolutionDuration;

        const current = this._validatedAngle(this._baseHorizontalRot);
        const next = this._validatedAngle(nextHorizontalRot);
        const diff = Math.abs(next - current);

        duration = (diff * revolutionDuration) / 360;
        duration = 500;
    }

    // new rotation values
    let nextVerticalRot = 0;

    if (nextView === "top") nextVerticalRot = this.maximumVerticalRot;
    if (nextView === "bottom") nextVerticalRot = this.minimumVerticalRot;

    if (view !== nextView) this.cameraDistance = this._baseCameraDistance;

    await this.configurator.rotate({
        rotationX: this._validatedAngle(nextHorizontalRot),
        rotationY: nextVerticalRot,
        distance: this.cameraDistance,
        duration: duration
    });
};

/**
 * Function to allow drifting if the mouse has acceleration to prevent
 * immediately stopping.
 *
 * @param {Event} event The mouse event that is used for the drift.
 */
ripe.CSRControls.prototype._drift = function(event) {
    // if specified that can't drift, return immediately
    if (!this.mouseDrift) return;

    let currentValueX = event.movementX;
    let currentValueY = event.movementY;

    let pos = 0;
    let startTime = 0;
    const driftAnimation = time => {
        if (!this.isDrifting) return;

        startTime = startTime === 0 ? time : startTime;

        pos = (time - startTime) / this.driftDuration;

        currentValueX = ripe.easing.easeInQuad(
            pos,
            this._baseHorizontalRot,
            this._baseHorizontalRot + event.movementX,
            this.driftDuration
        );
        currentValueY = ripe.easing.easeInQuad(
            pos,
            this._baseVerticalRot,
            this._baseVerticalRot + event.movementY,
            this.driftDuration
        );

        if (this.lockRotation !== "vertical") {
            this.currentHorizontalRot = this._validatedAngle(currentValueX);
        }
        if (this.lockRotation !== "horizontal") {
            this.currentVerticalRot = Math.min(
                Math.max(currentValueY, this.minimumVerticalRot),
                this.maximumVerticalRot
            );
        }

        this.configurator.rotate(
            {
                rotationX: this.currentHorizontalRot,
                rotationY: this.currentVerticalRot,
                distance: this.cameraDistance
            },
            false
        );

        if (pos < 1.0) requestAnimationFrame(driftAnimation);
        else this._updateAngles();
    };

    this.isDrifting = true;
    requestAnimationFrame(driftAnimation);
};

/**
 * The function to handle a rotation transition between views and/or positions.
 *
 * @param {Object} options Options used for the transition.
 */
ripe.CSRControls.prototype.rotationTransition = async function(options) {
    const position = parseInt(this.element.dataset.position);
    const view = this.element.dataset.view;

    let finalXRotation = parseInt(options.rotationX);
    let finalYRotation = parseInt(options.rotationY);

    const nextView = this._rotationToView(finalYRotation);
    const nextPosition = this._rotationToPosition(finalXRotation);

    this._baseHorizontalRot = this.currentHorizontalRot;
    this._baseVerticalRot = this.currentVerticalRot;

    const startingCameraDistance = this.cameraDistance;

    let pos = 0;
    let startTime = 0;

    const transition = time => {
        startTime = startTime === 0 ? time : startTime;
        pos = (time - startTime) / options.duration;

        this.currentHorizontalRot = ripe.easing[this.rotationEasing](
            pos,
            this._baseHorizontalRot,
            finalXRotation
        );
        this.currentVerticalRot = ripe.easing[this.rotationEasing](
            pos,
            this._baseVerticalRot,
            finalYRotation
        );

        this.cameraDistance = ripe.easing[this.rotationEasing](
            pos,
            startingCameraDistance,
            this._baseCameraDistance
        );

        this.configurator.rotate(
            {
                rotationX: this.currentHorizontalRot,
                rotationY: this.currentVerticalRot,
                distance: this.cameraDistance
            },
            false
        );

        if (pos < 1) {
            requestAnimationFrame(transition);
        } else {
            this.currentHorizontalRot = finalXRotation;
            this.currentVerticalRot = finalYRotation;

            this._updateAngles();

            // performs final rotation to make sure it is perfectly aligned
            this.configurator.rotate(
                {
                    rotationX: this.currentHorizontalRot,
                    rotationY: this.currentVerticalRot,
                    distance: this.cameraDistance
                },
                false
            );

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

        // figures out the best final rotation to avoid going through longest path
        const diff = finalXRotation - this._baseHorizontalRot;
        if (diff < -180) finalXRotation += 360;
        if (diff > 180) finalXRotation -= 360;
    }

    this.element.classList.add("no-drag");
    this.element.classList.add("animating");
    requestAnimationFrame(transition);
};

/**
 * Returns a valid angle to prevent going over 360 or under 0 degrees.
 *
 * @param {Number} angle The new angle.
 */
ripe.CSRControls.prototype._validatedAngle = function(angle) {
    if (angle > 360) return angle - 360;
    if (angle < 0) return angle + 360;
    return angle;
};
