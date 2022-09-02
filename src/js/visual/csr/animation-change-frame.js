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
    ripe.CsrAnimation.call(this, object3D, duration);

    // TODO support other views
    if (view !== "side") {
        throw new Error("Only 'side' view is supported in 'ChangeFrameAnimation' (for now)");
    }

    const radPerSide = (Math.PI * 2) / framesNumber;
    const rotYStart = parseFloat(parseFloat(this.object3D.rotation.y).toPrecision(12));
    const rotYEnd = parseFloat(parseFloat(position * radPerSide).toPrecision(12));
    const rotYQty = rotYEnd - rotYStart;

    // don't perform the animation as it's already in the correct position
    if (rotYQty === 0) {
        this.finish();
        return;
    }

    this.rotYEnd = rotYEnd;
    this.rotYQty = rotYQty;
    this.rotYQtyDone = 0;
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

    // calculates the tick rotation and adds it to the rotation axis
    const tickRotYQty = this.rotYQty * this.tickMultiplier(delta);
    this.object3D.rotation.y += tickRotYQty;

    // updates animation progress
    this.rotYQtyDone += Math.abs(tickRotYQty);
    if (this.rotYQtyDone >= Math.abs(this.rotYQty)) this._finishAnimation();
};

ripe.CsrChangeFrameAnimation.prototype._finishAnimation = function() {
    this.object3D.rotation.y = this.rotYEnd;
    this.finish();
};
