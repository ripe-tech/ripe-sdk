if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Localizes a value to the provided locale.
 *
 * @param value The value to be localized.
 * @param locale The locale to localize the value to.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.locale = function(value, locale, options, callback) {
    return this.localeMultiple(value, locale, options, callback);
};

/**
 * Localizes a list of values to the provided locale.
 *
 * @param values The values to be localized.
 * @param locale The locale to localize the value to.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.localeMultiple = function(values, locale, options, callback) {
    values = typeof values === "string" ? [values] : values;
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "locale";
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            values: values,
            locale: locale
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};
