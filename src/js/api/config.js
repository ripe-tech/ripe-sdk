if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Gets the configuration of a product identified by its unique product ID.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base url.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configResolve = function(productId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "config/resolve/" + productId;
    options = Object.assign({ url: url }, options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the configuration of a product identified by its unique product ID.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base url.
 * @returns {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configResolveP = function(options) {
    return new Promise((resolve, reject) => {
        this.configResolve(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new Error());
        });
    });
};
