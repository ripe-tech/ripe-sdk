if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

// STRUCTURE
// stores internal logic of mouse movement

ripe.OrbitalControls = function(owner, element, options) {
    this.owner = owner;
    this.element = element;
    this.options = options;
};

ripe.OrbitalControls.prototype = ripe.build(ripe.Observable.prototype);
ripe.OrbitalControls.prototype.constructor = ripe.OrbitalControls;
