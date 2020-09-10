if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Localizes a value to the provided locale.
 *
 * @param {String} value The value to be localized.
 * @param {String} locale The locale to localize the value to.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.locale = function(value, locale, options, callback) {
    return this.localeMultiple(value, locale, options, callback);
};

ripe.Ripe.prototype.localeP = function(value, locale, options) {
    return new Promise((resolve, reject) => {
        this.locale(value, locale, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Localizes a list of values to the provided locale.
 *
 * @param {String} values The values to be localized.
 * @param {String} locale The locale to localize the value to.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.localeMultiple = function(values, locale, options, callback) {
    values = typeof values === "string" ? [values] : values;
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}locale`;
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

ripe.Ripe.prototype.localeMultipleP = function(values, locale, options) {
    return new Promise((resolve, reject) => {
        this.localeMultiple(values, locale, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves a bundle of locales for the provided locale value.
 *
 * @param {String} locale The locale string to retrieve the bundle.
 * @param {String} context The inner context for the locale bundle.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.localeBundle = function(locale, context, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}locale/bundle`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            locale: locale,
            context: context
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.localeBundleP = function(locale, context, options) {
    return new Promise((resolve, reject) => {
        this.localeBundle(locale, context, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
