if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("../../base");
    require("./animation-base");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
}

ripe.CsrChangeFrameAnimation = function(object3D, duration, view, position, framesNumber) {
    ripe.CsrAnimation.call(this, "CsrChangeFrameAnimation", object3D, duration);

    // sings the CSR animation
    this.sign(`${object3D.uuid}${duration}${view}${position}${framesNumber}`);

    // calculates how much it should rotate per side position
    const radPerSide = (Math.PI * 2) / framesNumber;

    // sets the end rotations
    let rotXEnd = 0;
    let rotYEnd = 0;
    const rotZEnd = 0;
    switch (view) {
        case "side":
            rotYEnd = parseFloat(parseFloat(position * radPerSide).toFixed(6));
            break;
        case "top":
            rotXEnd = Math.PI / 2;
            break;
        case "bottom":
            rotXEnd = Math.PI;
            break;
        default:
            throw new Error(`View '${view}' is not supported by 'ChangeFrameAnimation`);
    }

    console.log("end:", rotXEnd, rotYEnd, rotZEnd);

    // gets the initial rotations
    const rotXStart = parseFloat(parseFloat(this.object3D.rotation.x).toFixed(6));
    const rotYStart = parseFloat(parseFloat(this.object3D.rotation.y).toFixed(6));
    const rotZStart = parseFloat(parseFloat(this.object3D.rotation.z).toFixed(6));

    // calculates how much it should rotate for each axis
    const rotXQty = rotXEnd - rotXStart;
    const rotYQty = rotYEnd - rotYStart;
    const rotZQty = rotZEnd - rotZStart;
    const isRotXFinished = rotXQty === 0;
    const isRotYFinished = rotYQty === 0;
    const isRotZFinished = rotZQty === 0;
    console.log("qty:", rotXQty, rotYQty, rotZQty);

    // don't perform the animation as it's already in the correct position
    if (isRotXFinished && isRotYFinished && isRotZFinished) {
        this.finish();
        return;
    }

    // initializes the animation state variables
    this.isRotXFinished = isRotXFinished;
    this.isRotYFinished = isRotYFinished;
    this.isRotZFinished = isRotZFinished;
    this.rotXEnd = rotXEnd;
    this.rotXQty = rotXQty;
    this.rotXQtyDone = 0;
    this.rotYEnd = rotYEnd;
    this.rotYQty = rotYQty;
    this.rotYQtyDone = 0;
    this.rotZEnd = rotZEnd;
    this.rotZQty = rotZQty;
    this.rotZQtyDone = 0;
};

ripe.CsrChangeFrameAnimation.prototype = ripe.build(ripe.CsrAnimation.prototype);
ripe.CsrChangeFrameAnimation.prototype.constructor = ripe.CsrChangeFrameAnimation;

ripe.CsrChangeFrameAnimation.prototype.tick = function(delta) {
    if (!this.run) return;

    // no animation duration specified so it completes the animation immediately
    if (!this.duration) {
        this._finishAnimation();
        return;
    }

    // calculates the tick rotation
    const tickRotXQty = this.rotXQty * this.tickMultiplier(delta);
    const tickRotYQty = this.rotYQty * this.tickMultiplier(delta);
    const tickRotZQty = this.rotZQty * this.tickMultiplier(delta);

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
    if (!this.isRotZFinished) {
        this.object3D.rotation.z += tickRotZQty;
        this.rotZQtyDone += Math.abs(tickRotZQty);
        this.isRotZFinished = this.rotZQtyDone >= Math.abs(this.rotZQty);
    }

    // checks if the animation finished
    if (this.isRotXFinished && this.isRotYFinished && this.isRotZFinished) this._finishAnimation();
};

ripe.CsrChangeFrameAnimation.prototype._finishAnimation = function() {
    this.object3D.rotation.x = this.rotXEnd;
    this.object3D.rotation.y = this.rotYEnd;
    this.object3D.rotation.z = this.rotZEnd;
    console.log(
        "finished with",
        this.object3D.rotation.x,
        this.object3D.rotation.y,
        this.object3D.rotation.z
    );
    this.finish();
};
