ripe.Ripe.plugins = ripe.Ripe.plugins || {};

ripe.Ripe.plugins.Plugin = function() {}

ripe.Ripe.plugins.Plugin.prototype.setOwner = function(owner) {
    this.owner = owner;
}
