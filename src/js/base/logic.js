if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

const LOCALES = {
    "scales.std:clothing": "",
    "scales.uk:male": "IT",
    "scales.it:clothing": "IT",
    "sizes.std:clothing:kids.17": "2 Yrs",
    "sizes.std:clothing:kids.18": "3 Yrs",
    "sizes.std:clothing:kids.19": "4 Yrs",
    "sizes.std:clothing:kids.20": "5 Yrs",
    "sizes.std:clothing:kids.21": "6 Yrs",
    "sizes.std:clothing:kids.22": "7 Yrs",
    "sizes.std:clothing:kids.23": "8 Yrs",
    "sizes.std:clothing:kids.24": "9 Yrs",
    "sizes.std:clothing:kids.25": "10 Yrs",
    "sizes.std:clothing:kids.26": "11 Yrs",
    "sizes.std:clothing:kids.27": "12 Yrs",
    "sizes.std:clothing:kids.28": "13 Yrs",
    "sizes.std:clothing:kids.29": "14 Yrs",
    "sizes.us:clothing:male.17": "000",
    "sizes.us:clothing:male.18": "00",
    "sizes.us:clothing:male.19": "0",
    "sizes.us:clothing:male.20": "1",
    "sizes.us:clothing:male.21": "2",
    "sizes.us:clothing:male.22": "3",
    "sizes.us:clothing:male.23": "4",
    "sizes.us:clothing:male.24": "5",
    "sizes.us:clothing:male.25": "6",
    "sizes.it:male.25": "40",
    "sizes.it:male.26": "40.5",
    "sizes.it:male.27": "41",
    "sizes.it:male.28": "41.5",
    "sizes.it:male.29": "42",
    "sizes.it:male.30": "42.5",
    "sizes.it:male.31": "43",
    "sizes.it:male.32": "43.5",
    "sizes.it:male.33": "44",
    "sizes.it:male.34": "44.5",
    "sizes.it:male.35": "45",
    "sizes.it:male.36": "45.5",
    "sizes.it:male.37": "46",
    "sizes.it:male.38": "46.5",
    "sizes.it:male.39": "47",
    "sizes.it:male.40": "47.5",
    "sizes.it:male.41": "48",
    "sizes.it:male.42": "48.5",
    "sizes.it:male.43": "49",
    "sizes.it:male.44": "49.5",
    "sizes.it:male.45": "50",
    "sizes.uk:male.17": "2",
    "sizes.uk:male.18": "2.5",
    "sizes.uk:male.19": "3",
    "sizes.uk:male.20": "3.5",
    "sizes.uk:male.21": "4",
    "sizes.uk:male.22": "4.5",
    "sizes.uk:male.23": "5",
    "sizes.uk:male.24": "5.5",
    "sizes.uk:male.25": "6",
    "sizes.uk:male.26": "6.5",
    "sizes.uk:male.27": "7",
    "sizes.uk:male.28": "7.5",
    "sizes.uk:male.29": "8",
    "sizes.uk:male.30": "8.5",
    "sizes.uk:male.31": "9",
    "sizes.uk:male.32": "9.5",
    "sizes.uk:male.33": "10",
    "sizes.uk:male.34": "10.5",
    "sizes.uk:male.35": "11",
    "sizes.uk:male.36": "11.5",
    "sizes.uk:male.37": "12",
    "sizes.uk:male.38": "12.5",
    "sizes.uk:male.39": "13",
    "sizes.uk:male.40": "13.5",
    "sizes.uk:male.41": "14",
    "sizes.uk:male.42": "14.5",
    "sizes.uk:male.43": "15",
    "sizes.fr:female.17": "35",
    "sizes.fr:female.18": "35.5",
    "sizes.fr:female.19": "36",
    "sizes.fr:female.20": "36.5",
    "sizes.fr:female.21": "37",
    "sizes.fr:female.22": "37.5",
    "sizes.fr:female.23": "38",
    "sizes.fr:female.24": "38.5",
    "sizes.fr:female.25": "39",
    "sizes.fr:female.26": "39.5",
    "sizes.fr:female.27": "40",
    "sizes.fr:female.28": "40.5",
    "sizes.fr:female.29": "41",
    "sizes.fr:female.30": "41.5",
    "sizes.fr:female.31": "42",
    "sizes.fr:female.32": "42.5",
    "sizes.fr:female.33": "43",
    "sizes.ch:female.17": "34",
    "sizes.ch:female.18": "34.5",
    "sizes.ch:female.19": "35",
    "sizes.ch:female.20": "35.5",
    "sizes.ch:female.21": "36",
    "sizes.ch:female.22": "36.5",
    "sizes.ch:female.23": "37",
    "sizes.ch:female.24": "37.5",
    "sizes.ch:female.25": "38",
    "sizes.ch:female.26": "38.5",
    "sizes.ch:female.27": "39",
    "sizes.ch:female.28": "39.5",
    "sizes.ch:female.29": "40",
    "sizes.ch:female.30": "40.5",
    "sizes.ch:female.31": "41",
    "sizes.ch:female.32": "41.5",
    "sizes.ch:female.33": "42",
    "sizes.uk:female.17": "1",
    "sizes.uk:female.18": "1.5",
    "sizes.uk:female.19": "2",
    "sizes.uk:female.20": "2.5",
    "sizes.uk:female.21": "3",
    "sizes.uk:female.22": "3.5",
    "sizes.uk:female.23": "4",
    "sizes.uk:female.24": "4.5",
    "sizes.uk:female.25": "5",
    "sizes.uk:female.26": "5.5",
    "sizes.uk:female.27": "6",
    "sizes.uk:female.28": "6.5",
    "sizes.uk:female.29": "7",
    "sizes.uk:female.30": "7.5",
    "sizes.uk:female.31": "8",
    "sizes.uk:female.32": "8.5",
    "sizes.uk:female.33": "9",
    "sizes.jp:female.17": "21",
    "sizes.jp:female.18": "21.5",
    "sizes.jp:female.19": "22",
    "sizes.jp:female.20": "22.5",
    "sizes.jp:female.21": "23",
    "sizes.jp:female.22": "23.5",
    "sizes.jp:female.23": "24",
    "sizes.jp:female.24": "24.5",
    "sizes.jp:female.25": "25",
    "sizes.jp:female.26": "25.5",
    "sizes.jp:female.27": "26",
    "sizes.jp:female.28": "26.5",
    "sizes.jp:female.29": "27",
    "sizes.jp:female.30": "27.5",
    "sizes.jp:female.31": "28",
    "sizes.jp:female.32": "28.5",
    "sizes.jp:female.33": "29",
    "sizes.it:clothing:female.-1": "36",
    "sizes.it:clothing:female.0": "42",
    "sizes.it:clothing:female.1": "46",
    "sizes.it:clothing:female.2": "50",
    "sizes.it:clothing:female.3": "52",
    "sizes.std:clothing:female.17": "XXXS",
    "sizes.std:clothing:female.18": "XXS",
    "sizes.std:clothing:female.19": "XS",
    "sizes.std:clothing:female.20": "S",
    "sizes.std:clothing:female.21": "M",
    "sizes.std:clothing:female.22": "L",
    "sizes.std:clothing:female.23": "XL",
    "sizes.std:clothing:female.24": "XXL",
    "sizes.std:clothing:female.25": "XXXL",
    "sizes.std:clothing:male.17": "XXXS",
    "sizes.std:clothing:male.18": "XXS",
    "sizes.std:clothing:male.19": "XS",
    "sizes.std:clothing:male.20": "S",
    "sizes.std:clothing:male.21": "M",
    "sizes.std:clothing:male.22": "L",
    "sizes.std:clothing:male.23": "XL",
    "sizes.std:clothing:male.24": "XXL",
    "sizes.std:clothing:male.25": "XXXL",
    "sizes.std:clothing:male.26": "XXXXL",
    "sizes.it:female.17": "34",
    "sizes.it:female.18": "34.5",
    "sizes.it:female.19": "35",
    "sizes.it:female.20": "35.5",
    "sizes.it:female.21": "36",
    "sizes.it:female.22": "36.5",
    "sizes.it:female.23": "37",
    "sizes.it:female.24": "37.5",
    "sizes.it:female.25": "38",
    "sizes.it:female.26": "38.5",
    "sizes.it:female.27": "39",
    "sizes.it:female.28": "39.5",
    "sizes.it:female.29": "40",
    "sizes.it:female.30": "40.5",
    "sizes.it:female.31": "41",
    "sizes.it:female.32": "41.5",
    "sizes.it:female.33": "42",
    "sizes.bag:female.17": "One Size",
    "sizes.one_size:female.17": "One Size",
    "sizes.us:female.17": "4",
    "sizes.us:female.18": "4.5",
    "sizes.us:female.19": "5",
    "sizes.us:female.20": "5.5",
    "sizes.us:female.21": "6",
    "sizes.us:female.22": "6.5",
    "sizes.us:female.23": "7",
    "sizes.us:female.24": "7.5",
    "sizes.us:female.25": "8",
    "sizes.us:female.26": "8.5",
    "sizes.us:female.27": "9",
    "sizes.us:female.28": "9.5",
    "sizes.us:female.29": "10",
    "sizes.us:female.30": "10.5",
    "sizes.us:female.31": "11",
    "sizes.us:female.32": "11.5",
    "sizes.us:female.33": "12",
    "sizes.fr:clothing:female.17": "32",
    "sizes.fr:clothing:female.18": "34",
    "sizes.fr:clothing:female.19": "36",
    "sizes.fr:clothing:female.20": "38",
    "sizes.fr:clothing:female.21": "40",
    "sizes.fr:clothing:female.22": "42",
    "sizes.fr:clothing:female.23": "44",
    "sizes.fr:clothing:female.24": "46",
    "sizes.fr:clothing:female.25": "48"
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
ripe.Ripe.prototype.localeLocal = function(value, fallback = null) {
    fallback = fallback === null ? value : fallback;
    if (LOCALES[value] === undefined) {
        return fallback;
    }
    return LOCALES[value];
};

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
    return values.map(v => `${v["name"]}:${v["type"]}`).join(".");
};
