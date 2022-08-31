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

/**
 * Verifies if the provided tag exists in the sequence of
 * tags that are part of the currently loaded configuration.
 *
 * @param {String} tag The tag to be tested for presence in the
 * currently loaded configuration.
 * @returns {Boolean} If the tag exists in the tags section of the
 * current configuration.
 */
ripe.Ripe.prototype.hasTag = function(tag) {
    const tags = (this.loadedConfig && this.loadedConfig.tags) || [];
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

ripe.Ripe.prototype.hasStrategy = function(strategy) {
    const strategies = (this.loadedConfig && this.loadedConfig.strategies) || ["prc"];
    return strategies.includes(strategy);
};
