if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("./base");
    require("./ripe");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
}

ripe.Ripe.prototype.hasTag = function(tag) {
    const tags = this.loadedConfig.tags || [];
    return tags.includes(tag);
};

ripe.Ripe.prototype.hasCustomization = function() {
    return !this.hasTag("no_customization");
};

ripe.Ripe.prototype.hasPersonalization = function() {
    return !this.hasTag("no_initials") && !this.hasTag("no_personalization");
};

ripe.Ripe.prototype.hasSize = function() {
    return !this.hasTag("no_size");
};

ripe.Ripe.prototype.hasInitialsRadius = function() {
    return !this.hasTag("initials_no_radius");
};
