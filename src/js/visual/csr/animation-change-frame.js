const base = require("../../base");
require("./animation-base");
const ripe = base.ripe;

ripe.CsrChangeFrameAnimation = function(object3D, duration, view, position, framesNumber) {
    ripe.CsrAnimation.call(this, "CsrChangeFrameAnimation", object3D, duration);

    // sings the CSR animation
    this.sign(`${object3D.uuid}${duration}${view}${position}${framesNumber}`);

    // calculates how much it should rotate per side position
    const radPerSide = (2 * Math.PI) / framesNumber;

    // sets the end rotations
    let rotXEnd = 0;
    let rotYEnd = 0;
    switch (view) {
        case "side":
            rotYEnd = ripe.CsrUtils.toPrecision(position * radPerSide);
            break;
        case "top":
            rotXEnd = 0.5 * Math.PI;
            break;
        case "bottom":
            rotXEnd = 1.5 * Math.PI;
            break;
        default:
            throw new Error(`View '${view}' is not supported by 'ChangeFrameAnimation`);
    }

    // gets the initial rotations
    const rotXStart = ripe.CsrUtils.toPrecision(this.object3D.rotation.x);
    const rotYStart = ripe.CsrUtils.toPrecision(this.object3D.rotation.y);

    // calculates how much it should rotate for each axis
    const rotXQty = ripe.CsrUtils.shortestRotationRad(rotXStart, rotXEnd);
    const rotYQty = ripe.CsrUtils.shortestRotationRad(rotYStart, rotYEnd);

    // checks if axis is already in the finish state
    const isRotXFinished = rotXStart === rotXEnd;
    const isRotYFinished = rotYQty === 0;

    // initializes the animation state variables
    this.isRotXFinished = isRotXFinished;
    this.isRotYFinished = isRotYFinished;
    this.rotXEnd = rotXEnd;
    this.rotXQty = rotXQty;
    this.rotXQtyDone = 0;
    this.rotYEnd = rotYEnd;
    this.rotYQty = rotYQty;
    this.rotYQtyDone = 0;
};

ripe.CsrChangeFrameAnimation.prototype = ripe.build(ripe.CsrAnimation.prototype);
ripe.CsrChangeFrameAnimation.prototype.constructor = ripe.CsrChangeFrameAnimation;

ripe.CsrChangeFrameAnimation.prototype.tick = function(delta) {
    // checks if the animation finished
    if (this.isRotXFinished && this.isRotYFinished) {
        this._finishAnimation();
        return;
    }

    if (!this.run) return;

    // no animation duration specified so it completes the animation immediately
    if (!this.duration) {
        this._finishAnimation();
        return;
    }

    // calculates the tick rotation
    const tickRotXQty = this.rotXQty * this.tickMultiplier(delta);
    const tickRotYQty = this.rotYQty * this.tickMultiplier(delta);

    // adds the tick rotation and updates its state
    if (!this.isRotXFinished) {
        this.object3D.rotation.x += tickRotXQty;
        this.rotXQtyDone += Math.abs(tickRotXQty);
        this.isRotXFinished = this.rotXQtyDone >= Math.abs(this.rotXQty);
    }
    if (!this.isRotYFinished) {
        this.object3D.rotation.y += tickRotYQty;
        this.rotYQtyDone += Math.abs(tickRotYQty);
        this.isRotYFinished = this.rotYQtyDone >= Math.abs(this.rotYQty);
    }
};

ripe.CsrChangeFrameAnimation.prototype._finishAnimation = function() {
    this.object3D.rotation.x = this.rotXEnd;
    this.object3D.rotation.y = this.rotYEnd;
    this.finish();
};
