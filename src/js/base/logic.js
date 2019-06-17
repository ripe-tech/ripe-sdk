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
 * @returns {Object} Returns an object with values and valuesM.
 * valuesM is a map with (key = type, value = name) entries for each
 * property defined in the engraving, where "type" is the type of
 * the property (e.g. style) and "name" is the value for that property
 * (e.g. gold) as defined in the engraving parameter. values is a
 * list of (type, name) that respects the order of the properties.
 */
ripe.Ripe.prototype.parseEngraving = function(engraving) {
    // This is based on RIPE Core's AdapterController#parse_engraving_g
    const configProperties = this.loadedConfig.initials.properties;

    let propertyTypes = [];
    const propertyNamesM = {};

    for (const index in configProperties) {
        const property = configProperties[index];
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
 * @param engraving The engraving to be normalized.
 * @returns {string} The normalized engraving value.
 */
ripe.Ripe.prototype.normalizeEngraving = function(engraving) {
    const { values } = this.parseEngraving(engraving);
    return values.map(v => `${v["name"]}:${v["type"]}`).join(".");
};
