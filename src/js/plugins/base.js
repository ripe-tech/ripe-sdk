if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins = ripe.Ripe.plugins || {};

/**
 * @class
 * @augments Observable
 * @classdesc Base class of a Ripe Plugin.
 */
ripe.Ripe.plugins.Plugin = function() {
    ripe.Observable.call(this);
};

ripe.Ripe.plugins.Plugin.prototype = ripe.build(ripe.Observable.prototype);
ripe.Ripe.plugins.Plugin.prototype.constructor = ripe.Ripe.plugins.Plugin;

/**
 * Registers this plugin to the provided Ripe instance.
 *
 * @param {Ripe} owner The Ripe instance to register to.
 */
ripe.Ripe.plugins.Plugin.prototype.register = function(owner) {
    this.owner = owner;
    ripe.Observable.prototype.init.call(this);
};

/**
 * Unregisters this plugin from its owner.
 *
 * @param {Ripe} owner The Ripe instance to unregister from.
 */
ripe.Ripe.plugins.Plugin.prototype.unregister = function(owner) {
    this.owner = null;
    ripe.Observable.prototype.deinit.call(this);
};

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}
