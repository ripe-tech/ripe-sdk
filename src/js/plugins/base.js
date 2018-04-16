var ripe = ripe || {};
ripe.Ripe = ripe.Ripe || {};
ripe.Ripe.plugins = ripe.Ripe.plugins || {};

ripe.Ripe.plugins.Plugin = function() {}

ripe.Ripe.plugins.Plugin.prototype.register = function(owner) {
    this.owner = owner;
}

ripe.Ripe.plugins.Plugin.prototype.unregister = function(owner) {
    this.owner = null;
}

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}
