if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.Interactable = function(owner, options) {
    this.owner = owner;
    this.options = options || {};

    ripe.Interactable.prototype.init.call(this);
};

ripe.Interactable.prototype.init = function() {};

ripe.Interactable.prototype.update = function(state) {};
