const base = require("../../base");
const ripe = base.ripe;

ripe.CsrAnimation = function(type, object3D, duration) {
    this.type = type || "CsrAnimation";
    this.signature = null;
    this.object3D = object3D;
    this.duration = duration;
    this.run = true;
    this.finished = false;
    this.onFinished = () => {};
};
ripe.CsrAnimation.prototype.constructor = ripe.CsrAnimation;

ripe.CsrAnimation.prototype.isFinished = function() {
    return this.finished;
};

ripe.CsrAnimation.prototype.sign = function(signature) {
    this.signature = `${this.type}-${signature}`;
};

ripe.CsrAnimation.prototype.tick = function(delta) {
    throw new Error("Not implemented");
};

ripe.CsrAnimation.prototype.tickMultiplier = function(delta) {
    return delta * (1 / this.duration);
};

ripe.CsrAnimation.prototype.start = function() {
    this.run = true;
};

ripe.CsrAnimation.prototype.pause = function() {
    this.run = false;
};

ripe.CsrAnimation.prototype.finish = function() {
    this.run = false;
    this.finished = true;
    this.onFinished();
};
