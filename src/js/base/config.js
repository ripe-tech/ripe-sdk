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

/**
 * Retrieves the initials config with the specified profiles in the config. If the
 * `profiles` argument is provided those profiles will be also used to compute the
 * initials config.
 *
 * This method implements the same logic as `initials_config` in the composition
 * engine and should be kept in sync with that implementation.
 *
 * @param {Object} config The model's config.
 * @param {Array} profiles The list of profiles to use.
 * @returns {Object} The computed initials config based on the config profiles and
 * specified profiles.
 */
ripe.Ripe.prototype.initialsConfig = function(config, profiles = []) {
    let initials = config.initials || {};
    const baseProfiles =
        config.initials && config.initials.profiles ? config.initials.profiles : [];

    const baseProfile = initials.profile || null;
    if (baseProfile && !baseProfiles.includes(baseProfile)) {
        baseProfiles.push(baseProfile);
    }
    profiles = profiles.concat(baseProfiles);

    const $profiles = initials.$profiles || {};
    const $alias = initials.$alias || {};

    const finalProfiles = [];
    profiles.reverse().forEach(profile => {
        const aliasProfiles = $alias[profile] || [];
        aliasProfiles.push(profile);
        aliasProfiles.forEach(aliasProfile => {
            const values = $profiles[aliasProfile];
            if (!values) return;

            initials = this._initialsMerge(initials, values);
            finalProfiles.push(aliasProfile);
        });
    });

    const initialsRoot = initials.$root || {};
    initials = this._initialsMerge(initials, initialsRoot);

    initials.profiles = finalProfiles;

    return initials;
};

/**
 * Retrieves the updated initials config by merging the initials config values
 * with other initials config values.
 *
 * @param {Object} initials The base initials config values.
 * @param {Object} values The initials config values to be applied.
 * @returns {Object} The update initials config.
 *
 * @private
 */
ripe.Ripe.prototype._initialsMerge = function(initials, values) {
    initials = {...initials};
    values = {...values};
    Object.keys(values).forEach(key => {
        const value = values[key];
        if (ripe.typeof(value) === "object") {
            let existingValue = initials[key] || {};
            existingValue = ripe.typeof(existingValue) === "object" ? existingValue : {};
            const valueUpdated = this._initialsMerge(existingValue, value);
            initials[key] = valueUpdated; 
        } else {
            initials[key] = value;
        }
    });

    return initials;
};
