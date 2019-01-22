if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins.DiagPlugin = function(options) {
    ripe.Ripe.plugins.Plugin.call(this);
    this.options = options || {};
    this.preRequestCallback = this._setHeaders.bind(this);
};

ripe.Ripe.plugins.DiagPlugin.prototype = ripe.build(ripe.Ripe.plugins.Plugin.prototype);
ripe.Ripe.plugins.DiagPlugin.prototype.constructor = ripe.Ripe.plugins.DiagPlugin;

ripe.Ripe.plugins.DiagPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    this.owner.bind("build_request", this.preRequestCallback);
};

ripe.Ripe.plugins.DiagPlugin.prototype.unregister = function(owner) {
    this.options = null;
    this.owner.unbind("build_request", this.preRequestCallback);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

ripe.Ripe.plugins.DiagPlugin.prototype._setHeaders = function(request) {
    request.setRequestHeader("X-Ripe-Sdk-Version", "__VERSION__");

    // creates the array that is going to hold the complete set of
    // plugins registered in the owner
    const plugins = [];

    // iterates over the complete set of plugins registered in the
    // owner to add their names to the plugins list
    for (let index = 0; index < this.owner.plugins.length; index++) {
        const plugin = this.owner.plugins[index];
        const pluginName = this._getPluginName(plugin);
        pluginName && plugins.push(pluginName);
    }

    // creates the list of plugins (as a string) to be sent to the
    // server side (single element only)
    const pluginsS = plugins.join(", ");
    pluginsS && request.setRequestHeader("X-Ripe-Sdk-Plugins", pluginsS);

    // in case the brand value is defined in the owner it is also added
    // to the list of headers in the request
    this.owner.brand && request.setRequestHeader("X-Ripe-Sdk-Vendor", this.owner.brand);
};

ripe.Ripe.plugins.DiagPlugin.prototype._getPluginName = function(plugin) {
    for (let key in ripe.Ripe.plugins) {
        if (plugin.constructor === ripe.Ripe.plugins[key]) {
            return key;
        }
    }
    return null;
};
