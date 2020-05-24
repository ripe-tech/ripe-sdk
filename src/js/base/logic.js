if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    var locales = require("../locales");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
    var LOCALES_BASE = locales.LOCALES_BASE;
}

/**
 * Adds a new bundle object to the currently set of registered
 * bundles for the the given locale.
 *
 * This registration operation is global and will affect any user
 * of the RIPE SDK package on the current VM.
 *
 * @param {Object} bundle The locale strings bundle that is going to be
 * globally registered.
 * @param {String} locale The ISO 639-1 based locale identifier in the
 * underscore based form to be used in registration
 */
ripe.Ripe.prototype.addBundle = function(bundle, locale = null) {
    locale = locale === null ? this.locale : locale;
    const _bundle = LOCALES_BASE[locale] || {};
    LOCALES_BASE[locale] = _bundle;
    for (const [key, value] of Object.entries(bundle)) {
        _bundle[key] = value;
    }
};

/**
 * Removes the given set of locale strings from the globally defined
 * locale registry.
 *
 * @param {Object} bundle The locale strings bundle that is going to be
 * globally removed.
 * @param {String} locale The ISO 639-1 based locale identifier in the
 * underscore based form to be used in removal
 */
ripe.Ripe.prototype.removeBundle = function(bundle, locale = null) {
    locale = locale === null ? this.locale : locale;
    if (LOCALES_BASE[locale] === undefined) return;
    const _bundle = LOCALES_BASE[locale];
    for (const [key, value] of Object.entries(bundle)) {
        _bundle[key] = value;
    }
};

/**
 * Runs a local based localization, meaning that the data source
 * for the locale strings should be already loaded in memory.
 *
 * This means that the process should be immediate and not async.
 *
 * @param {String} value The base value string that is going to be
 * used for the localization process.
 * @param {String} fallback The fallback string (default) to be used
 * in case no localization is possible.
 * @returns {String} The final localized string or the fallback in
 * case localization is not possible.
 */
ripe.Ripe.prototype.localeLocal = function(
    value,
    fallback = null,
    locale = null,
    fallbackLocale = "en_us"
) {
    fallback = fallback === null ? value : fallback;
    locale = locale === null ? this.locale : locale;
    if (locale && LOCALES_BASE[locale] !== undefined && LOCALES_BASE[locale][value] !== undefined) {
        return LOCALES_BASE[locale][value];
    }
    if (
        fallbackLocale &&
        LOCALES_BASE[fallbackLocale] !== undefined &&
        LOCALES_BASE[fallbackLocale][value] !== undefined
    ) {
        return LOCALES_BASE[fallbackLocale][value];
    }
    return fallback;
};

/**
 * Parses the provided normalized engraving string according to the
 * standard `<name>:<type>` format, using the loaded configurations.
 *
 * The provided string may not be normalized but for that situation
 * typical guessing heuristics are going to be applied.
 *
 * @param {String} engraving The engraving string to be parsed.
 * @param {Array} properties If provided overrides the default loaded
 * config initials strategy for the retrieval of properties definition.
 * @returns {Object} Returns an object with values and valuesM.
 * valuesM is a map with (key = type, value = name) entries for each
 * property defined in the engraving, where "type" is the type of
 * the property (e.g. style) and "name" is the value for that property
 * (e.g. gold) as defined in the engraving parameter. values is a
 * list of (type, name) that respects the order of the properties.
 */
ripe.Ripe.prototype.parseEngraving = function(engraving, properties = null) {
    // gathers teh complete set of properties for the initials
    // definitions, to be used in the unpack
    properties = properties || this.loadedConfig.initials.properties;

    let propertyTypes = [];
    const propertyNamesM = {};

    for (const property of properties) {
        const type = property.type;
        const name = property.name;
        propertyNamesM[name] = type;
        propertyTypes.push(type);
    }

    propertyTypes = Array.from(new Set(propertyTypes)).sort(
        (a, b) => propertyTypes.indexOf(a) - propertyTypes.indexOf(b)
    );

    let values = [];
    const valuesM = {};
    const parts = engraving.length ? engraving.split(".") : [];

    for (let index = 0; index < parts.length; index++) {
        const part = parts[index];
        const slice = part.split(":", 2);
        const name = slice[0];
        let type = propertyTypes.length > index ? propertyTypes[index] : null;
        type = propertyNamesM[name] || type;
        type = slice.length === 2 ? slice[1] : type;
        values.push({ name: name, type: type });
        valuesM[type] = name;
    }

    values = values.sort((a, b) => {
        const typeAIndex = propertyTypes.includes(a.type)
            ? propertyTypes.indexOf(a.type)
            : propertyTypes.length;

        const typeBIndex = propertyTypes.includes(b.type)
            ? propertyTypes.indexOf(b.type)
            : propertyTypes.length;

        return typeAIndex - typeBIndex;
    });

    return {
        values: values,
        valuesM: valuesM
    };
};

/**
 * Normalizes the provided engraving (material) value according to the
 * expected standard, producing a sequence of dictionaries containing
 * the resulting property values.
 *
 * @param {String} engraving The engraving to be normalized.
 * @param {Array} properties If provided overrides the default loaded
 * config initials strategy for the retrieval of properties definition.
 * @returns {string} The normalized engraving value.
 */
ripe.Ripe.prototype.normalizeEngraving = function(engraving, properties = null) {
    const { values } = this.parseEngraving(engraving, properties);
    return values.map(v => `${v.name}:${v.type}`).join(".");
};

/**
 * Determines if the model currently loaded (in case there's one)
 * has the provided frame available in spec.
 *
 * Notice that this call does not assure that a render is possible
 * it only determines that according to model's spec it should be
 * possible to render such a frame.
 *
 * @param {String} frame The name of the frame to determine "renderability"
 * according to the {face}-{index} format.
 * @returns {Boolean} If it's possible to render such frame for the
 * currently loaded model.
 */
ripe.Ripe.prototype.hasFrame = function(frame) {
    if (!this.loadedConfig) return true;
    if (!frame) return true;

    const frameP = frame.split("-", 2);
    let [face, index] = frameP.length > 1 ? frameP : [frameP, "0"];
    index = parseInt(index);

    if (!this.loadedConfig.faces_m) return false;
    if (!this.loadedConfig.faces_m[face]) return false;
    if (this.loadedConfig.faces_m[face].frames - 1 < index) return false;

    return true;
};
