if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Parses the provided normalized engraving string according to the
 * standard `<name>:<type>` format, using the loaded configurations.
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
        const type = property["type"];
        const name = property["name"];
        propertyNamesM[name] = type;
        propertyTypes.push(type);
    }

    propertyTypes = Array.from(new Set(propertyTypes)).sort(
        (a, b) => propertyTypes.indexOf(a) - propertyTypes.indexOf(b)
    );

    let values = [];
    const valuesM = {};
    const parts = engraving.length ? engraving.split(".") : [];

    for (const index in parts) {
        const part = parts[index];
        const slice = part.split(":", 2);
        const name = slice[0];
        let type = propertyTypes.length > Number(index) ? propertyTypes[Number(index)] : null;
        type = propertyNamesM[type] || type;
        type = slice.length === 2 ? slice[1] : type;
        values.push({ name: name, type: type });
        valuesM[type] = name;
    }

    values = values.sort((a, b) => {
        const typeAIndex = propertyTypes.includes(a["type"])
            ? propertyTypes.indexOf(a["type"])
            : propertyTypes.length;

        const typeBIndex = propertyTypes.includes(b["type"])
            ? propertyTypes.indexOf(b["type"])
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
 * @returns {string} The normalized engraving value.
 */
ripe.Ripe.prototype.normalizeEngraving = function(engraving) {
    const { values } = this.parseEngraving(engraving);
    return values.map(v => `${v["name"]}:${v["type"]}`).join(".");
};
