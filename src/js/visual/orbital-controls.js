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

ripe.OrbitalControls = function (configurator, element, options) {
    this.configurator = configurator;
    this.element = element;

    this.maximumHorizontalRot = options.maximumHorizontalRot || 180;
    this.minimumHorizontalRot = options.minimumHorizontalRot || -180;

    this.maximumVerticalRot = options.maximumVerticalRot || 89;
    this.minimumVerticalRot = options.minimumVerticalRot || 0;

    var startingPosition = options.position || 0;
    this._baseHorizontalRot = this._positionToRotation(startingPosition);
    this.currentHorizontalRot = this._baseHorizontalRot;
    this._baseVerticalRot = 0;
    this.currentVerticalRot = this._baseVerticalRot;
    // Types of transition = "cross", "rotation" or "none"
    this.viewAnimate = options.viewAnimate === undefined ? "rotate" : options.viewAnimate;
    this.rotationEasing = options.rotationEasing || "easeInOutQuad";

    this.cameraDistance = options.cameraDistance || 20;
    this._baseCameraDistance = this.cameraDistance;
    this.maxDistance = options.maxDistance === undefined ? 100000 : options.maxDistance;
    this.minDistance = options.minDistance === undefined ? 0 : options.minDistance;

    this.lockRotation = options.lockRotation || "";

    this.mouseDrift = options.mouseDrift || true;
    this.canDrift = false;
    this.driftDuration = options.driftDuration || 0.5;

    this._previousEvent = null;
    this.canZoom = options.canZoom === undefined ? true : options.canZoom;

    this._registerHandlers();
};

ripe.OrbitalControls.prototype = ripe.build(ripe.Observable.prototype);
ripe.OrbitalControls.prototype.constructor = ripe.OrbitalControls;

ripe.OrbitalControls.prototype.updateOptions = async function (options) {
    this.element = options.element === undefined ? this.element : options.element;

    this.maximumHorizontalRot =
        options.maximumHorizontalRot === undefined
            ? this.maximumHorizontalRot
            : options.maximumHorizontalRot;
    this.minimumHorizontalRot =
        options.minimumHorizontalRot === undefined
            ? this.minimumHorizontalRot
            : options.minimumHorizontalRot;

    this.maximumVerticalRot =
        options.maximumVerticalRot === undefined
            ? this.maximumVerticalRot
            : options.maximumVerticalRot;
    this.minimumVerticalRot =
        options.minimumVerticalRot === undefined
            ? this.minimumVerticalRot
            : options.minimumVerticalRot;

    this.cameraDistance =
        options.cameraDistance === undefined ? this.cameraDistance : options.cameraDistance;
    this._baseCameraDistance = this.cameraDistance;
    this.maxDistance = options.maxDistance === undefined ? this.maxDistance : options.maxDistance;
    this.minDistance = options.minDistance === undefined ? this.minDistance : options.minDistance;

    var startingPosition =
        options.position === undefined ? this.element.position : options.position;
    this._baseHorizontalRot = this._positionToRotation(startingPosition);
    this.currentHorizontalRot = this._baseHorizontalRot;
    this._baseVerticalRot = 0;
    this.currentVerticalRot = this._baseVerticalRot;
    // Types of transition = "cross", "rotation" or "none"
    this.viewAnimate = options.viewAnimate === undefined ? this.viewAnimate : options.viewAnimate;
    this.rotationEasing =
        options.rotationEasing === undefined ? this.rotationEasing : options.rotationEasing;

    this.lockRotation =
        options.lockRotation === undefined ? this.lockRotation : options.lockRotation;

    this.canZoom = options.canZoom === undefined ? this.canZoom : options.canZoom;
};

ripe.OrbitalControls.prototype._registerHandlers = function () {
    // captures the current context to be used inside clojures
    const self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    const area = this.element.querySelector(".area");

    // binds the mousedown event on the element to prepare
    // it for drag movements
    area.addEventListener("mousedown", function (event) {
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
    area.addEventListener("mouseup", function (event) {
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
    area.addEventListener("mouseout", function (event) {
        const _element = this;
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");

        const animating = self.element.classList.contains("animating");

        if (animating) return;

        if (self._previousEvent) self._drift(self._previousEvent);
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    area.addEventListener("mouseenter", function (event) {
        const _element = this;
        self.down = false;
        self.previous = self.percent;
        self.percent = 0;
        _element.classList.remove("drag");

        self._updateAngles();
        self.canDrift = false;
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    area.addEventListener("mousemove", function (event) {
        const down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;

        //const animating = self.element.classList.contains("animating");

        //if (animating) return;

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

    area.addEventListener("click", function (event) {
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

    area.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });

    area.addEventListener("dragend", function (event) {
        event.preventDefault();
    });

    // adds handlers for the touch events so that they get
    // parsed to mouse events for the configurator element,
    // taking into account that there may be a touch handler
    // already defined
    ripe.touchHandler(this.element);

    if (!this.canZoom) return;

    area.addEventListener(
        "wheel",
        function (event) {
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

ripe.OrbitalControls.prototype.resetCameraDistance = function () {
    this.cameraDistance = this._baseCameraDistance;
};

ripe.OrbitalControls.prototype._updateAngles = function (options = {}) {
    const newX =
        options.rotationX === undefined ? this.currentHorizontalRot : options.rotationX;
    const newY = options.rotationY === undefined ? this.currentVerticalRot : options.rotationY;

    // Apply rotation to model
    this._baseHorizontalRot = this._validatedAngle(newX);
    this.currentHorizontalRot = this._validatedAngle(newX);
    this.mouseDeltaX = 0;

    // Apply rotation to camera
    this._baseVerticalRot = newY;
    this.currentVerticalRot = newY;
    this.mouseDeltaY = 0;
};

/**
 * Converts the position of the element to a rotation that can be applied to
 * the model or the camera.
 */
ripe.OrbitalControls.prototype._positionToRotation = function (position) {
    return (position / 24) * 360;
};

ripe.OrbitalControls.prototype._rotationToPosition = function (rotationX) {
    return (this._validatedAngle(parseInt(rotationX)) / 360) * 24;
};

ripe.OrbitalControls.prototype._rotationToView = function (rotationY) {
    if (rotationY > 85) return "top";
    if (rotationY < -85) return "bottom";

    return "side";
};

/**
 * @ignore
 */
ripe.OrbitalControls.prototype._parseDrag = function () {
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

ripe.OrbitalControls.prototype.updateRotation = function (frame, options) {
    const dragging = this.element.classList.contains("drag");

    const _frame = ripe.parseFrameKey(frame);

    if (dragging) this._updateDragRotations();
    else this._updateRotations(_frame, options);
};

/**
 * Sets the rotation of the camera and meshes based on their current
 * continuous rotation.
 */
ripe.OrbitalControls.prototype._updateDragRotations = function () {
    var needsUpdate = false;

    // if there is no difference to the previous drag rotation in the X axis
    if (
        this._baseHorizontalRot - this.mouseDeltaX !== this.currentHorizontalRot &&
        this.lockRotation !== "vertical"
    ) {
        this.currentHorizontalRot = this._baseHorizontalRot - this.mouseDeltaX;

        needsUpdate = true;
    }

    var diff;
    // if there is no difference to the previous drag rotation in the Y axis
    if (
        this._baseVerticalRot - this.mouseDeltaY !== this.currentVerticalRot &&
        this.lockRotation !== "horizontal"
    ) {
        // If reached bottom
        if (this.mouseDeltaY >= this.minimumVerticalRot + this._baseVerticalRot) {
            diff = this.mouseDeltaY - (this.minimumVerticalRot + this._baseVerticalRot);

            this.referenceY -= diff;
            this.mouseDeltaY += diff;
        } // If reached top
        else if (this.mouseDeltaY <= this._baseVerticalRot - this.maximumVerticalRot) {
            diff = -(this.mouseDeltaY - (this._baseVerticalRot - this.maximumVerticalRot));

            this.referenceY += diff;
            this.mouseDeltaY -= diff;
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

ripe.OrbitalControls.prototype._updateRotations = async function (frame, options) {
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
    
        let current = this._validatedAngle(this._baseHorizontalRot)
        let next = this._validatedAngle(nextHorizontalRot)
        let diff = Math.abs(next - current);
    
        // TODO Uncomment this        
        duration = diff * revolutionDuration / 360;
        duration = 500;
        //duration = diff * 60 / revolutionDuration;
    }

    // New rotation values
    let nextVerticalRot = 0;

    if (nextView === "top") nextVerticalRot = this.maximumVerticalRot;
    if (nextView === "bottom") nextVerticalRot = this.minimumVerticalRot;

    if (view !== nextView) this.cameraDistance = this._baseCameraDistance;

    // Apply rotations with transition
    await this.configurator.rotate({
        rotationX: this._validatedAngle(nextHorizontalRot),
        rotationY: nextVerticalRot,
        distance: this.cameraDistance,
        duration: duration
    });
};

ripe.OrbitalControls.prototype._drift = function (event) {
    var currentValueX = event.movementX;
    var currentValueY = event.movementY;

    var pos = 0;
    var startTime = 0;
    const driftAnimation = time => {
        if (!this.isDrifting) return;

        startTime = startTime === 0 ? time : startTime;

        pos = (time - startTime) / this.driftDuration;

        currentValueX = ripe.easing.easeOutQuad(pos, event.movementX, 0, this.driftDuration);
        currentValueY = ripe.easing.easeOutQuad(pos, event.movementY, 0, this.driftDuration);

        if (this.lockRotation !== "vertical") {
            this.currentHorizontalRot = this._validatedAngle(
                currentValueX + this.currentHorizontalRot
            );
        }
        if (this.lockRotation !== "horizontal") {
            this.currentVerticalRot = Math.min(
                Math.max(this.currentVerticalRot + currentValueY, this.minimumVerticalRot),
                this.maximumVerticalRot
            );
        }
        this._updateAngles();

        this.configurator.rotate(
            {
                rotationX: this.currentHorizontalRot,
                rotationY: this.currentVerticalRot,
                distance: this.cameraDistance
            },
            false
        );

        if (pos < 1.0) requestAnimationFrame(driftAnimation);
        else this.isDrifting = false;
    };

    this.isDrifting = true;
    requestAnimationFrame(driftAnimation);
};

ripe.OrbitalControls.prototype.rotationTransition = async function (options) {
    const position = parseInt(this.element.dataset.position);
    const view = this.element.dataset.view;

    let finalXRotation = parseInt(options.rotationX);
    let finalYRotation = parseInt(options.rotationY);

    const nextView = this._rotationToView(finalYRotation);
    const nextPosition = this._rotationToPosition(finalXRotation);

    this._baseHorizontalRot = this.currentHorizontalRot;
    this._baseVerticalRot = this.currentVerticalRot;

    const startingCameraDistance = this.cameraDistance;

    var pos = 0;

    var startTime = 0;
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

        if (pos < 1) requestAnimationFrame(transition);
        else {
            this.currentHorizontalRot = finalXRotation;
            this.currentVerticalRot = finalYRotation;

            this._updateAngles();

            // Perform final Rotation to make sure it is perfectly aligned
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

ripe.OrbitalControls.prototype._validatedAngle = function (angle) {
    if (angle > 360) return angle - 360;
    if (angle < 0) return angle + 360;
    return angle;
};
