if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Retrieves the bundle of part, materials and colors translations of a specific brand and model
 * If no model is defined the retrieves the bundle of the owner's current model.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'brand' - The brand of the model.
 * - 'model' - The name of the model.
 * - 'locale' - The locale of the translations.
 * - 'compatibility' - If compatibility mode should be enabled.
 * - 'prefix' - A prefix to prepend to the locale keys (defaults to 'builds').
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getLocaleModel = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getLocaleModelOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the bundle of part, materials and colors translations of a specific brand and model
 * If no model is defined the retrieves the bundle of the owner's current model.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'brand' - The brand of the model.
 * - 'model' - The name of the model.
 * - 'locale' - The locale of the translations.
 * - 'compatibility' - If compatibility mode should be enabled.
 * - 'prefix' - A prefix to prepend to the locale keys (defaults to 'builds').
 * @returns {Promise} The resolved locale data.
 */
ripe.Ripe.prototype.getLocaleModelP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLocaleModel(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new Error());
        });
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getLocaleModelOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const locale =
        options.locale !== undefined && options.locale !== null ? options.locale : this.locale;
    const url = this.url + "builds/" + brand + "/locale/" + locale;
    const params = {};
    if (model !== undefined && model !== null) {
        params.model = model;
    }
    if (options.compatibility !== undefined && options.compatibility !== null) {
        params.compatibility = options.compatibility ? "1" : "0";
    }
    if (options.prefix !== undefined && options.prefix !== null) {
        params.prefix = options.prefix;
    }
    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};
