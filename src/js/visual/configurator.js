if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./configurator-prc");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Configurator = ripe.ConfiguratorPrc;

ripe.Configurator.prototype = ripe.ConfiguratorPrc.prototype;
ripe.Configurator.prototype.constructor = ripe.Configurator;
