if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins.ConfigSyncPlugin = function(options) {
    this.options = options || {};
};

ripe.Ripe.plugins.ConfigSyncPlugin.prototype = ripe.build(ripe.Ripe.plugins.Plugin.prototype);
ripe.Ripe.plugins.ConfigSyncPlugin.prototype.constructor = ripe.Ripe.plugins.ConfigSyncPlugin;

ripe.Ripe.plugins.ConfigSyncPlugin.prototype.register = async function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    this.configBind = this.owner.bind(
        "config",
        function() {
            this.syncPlugin.unregister(this.owner);
            this._createSyncPlugin();
        }.bind(this)
    );

    await this._createSyncPlugin();
};

ripe.Ripe.plugins.ConfigSyncPlugin.prototype.unregister = function(owner) {
    this.owner.unbind("config", this.configBind);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

ripe.Ripe.plugins.ConfigSyncPlugin.prototype._createSyncPlugin = async function() {
    let config = await this.owner.getConfigP();
    let rules = config.result.sync;
    this.syncPlugin = new ripe.Ripe.plugins.SyncPlugin(rules, this.options);
    this.syncPlugin.register(this.owner);
};
