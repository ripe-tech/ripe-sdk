if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("../base"); // eslint-disable-line no-redeclare
    var ripe = base.ripe; // eslint-disable-line no-redeclare
}

ripe.Ripe.plugins = ripe.Ripe.plugins || {};

ripe.Ripe.plugins.Plugin = function() {};

ripe.Ripe.plugins.Plugin.prototype.register = function(owner) {
    this.owner = owner;
};

ripe.Ripe.plugins.Plugin.prototype.unregister = function(owner) {
    this.owner = null;
};

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}
