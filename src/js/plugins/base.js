if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
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
