if (typeof require !== "undefined") {
    const base = require("../base");
    const ripe = base.ripe;
}

ripe.Visual = function(owner, element, options) {
    ripe.Observable.call(this);
    ripe.Interactable.call(this, owner, options);

    this.element = element;
    ripe.Visual.prototype.init.call(this);
};

ripe.assign(ripe.Visual.prototype, ripe.Observable.prototype);
ripe.assign(ripe.Visual.prototype, ripe.Interactable.prototype);
ripe.Visual.constructor = ripe.Visual;

ripe.Visual.prototype.init = function() {};
