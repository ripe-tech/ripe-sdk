if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins = ripe.Ripe.plugins || {};

ripe.Ripe.plugins.Plugin = function() {
    ripe.Observable.call(this);
};

ripe.Ripe.plugins.Plugin.prototype = ripe.build(ripe.Observable.prototype);
ripe.Ripe.plugins.Plugin.prototype.constructor = ripe.Ripe.plugins.Plugin;

ripe.Ripe.plugins.Plugin.prototype.register = async function(owner) {
    this.owner = owner;
    ripe.Observable.prototype.init.call(this);
};

ripe.Ripe.plugins.Plugin.prototype.unregister = async function(owner) {
    this.owner = null;
    ripe.Observable.prototype.deinit.call(this);
};

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}
