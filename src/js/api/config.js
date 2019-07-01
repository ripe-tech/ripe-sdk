if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Resolves the RIPE configuration options (includes DKU) from the provided set
 * of options or in alternative the current RIPE instance state.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base url.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configInfo = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "config/info";
    options = Object.assign({ url: url }, options);
    options = this._getQueryOptions(options);
    options = this._getInitialsOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Resolves the RIPE configuration options (includes DKU)  from the provided set
 * of options or in alternative the current RIPE instance state.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base url.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configInfoP = function(options) {
    return new Promise((resolve, reject) => {
        this.configInfo(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Resolves the provided DKU value into a more structured set of mode, brand,
 * parts, etc. so that it can be used under RIPE.
 *
 * @param {String} dku The DKU identifier to be used in the resolution.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base url.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configDku = function(dku, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "config/info";
    options = Object.assign({ url: url, params: { dku: dku } }, options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Resolves the provided DKU value into a more structured set of mode, brand,
 * parts, etc. so that it can be used under RIPE.
 *
 * @param {String} dku The DKU identifier to be used in the resolution.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base url.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configDkuP = function(options) {
    return new Promise((resolve, reject) => {
        this.configDku(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Gets the configuration of a product identified by its unique product ID.
 *
 * @param {String} productId The identifier of the product to be resolved.
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
 * @param {String} productId The identifier of the product to be resolved.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base url.
 * @returns {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configResolveP = function(productId, options) {
    return new Promise((resolve, reject) => {
        this.configResolve(productId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
