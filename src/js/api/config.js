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
 * Gets the global configuration object from the RIPE server (admin endpoint).
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configGlobal = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}config`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the global configuration object from the RIPE server (admin endpoint).
 *
 * @param {Object} options An object of options to configure the request.
 */
ripe.Ripe.prototype.configGlobalP = function(options) {
    return new Promise((resolve, reject) => {
        this.configGlobal(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Resolves the RIPE configuration options (includes DKU) from the provided set
 * of options or in alternative the current RIPE instance state.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configInfo = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getConfigInfoOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Resolves the RIPE configuration options (includes DKU)  from the provided set
 * of options or in alternative the current RIPE instance state.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * s {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configInfoP = function(options) {
    return new Promise((resolve, reject) => {
        this.configInfo(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Resolves the provided DKU value into a more structured set of model, brand,
 * parts, etc. so that it can be used under RIPE.
 *
 * @param {String} dku The DKU identifier to be used in the resolution.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configDku = function(dku, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = Object.assign({ dku: dku, queryOptions: false, initialsOptions: false }, options);
    options = this._getConfigInfoOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Resolves the provided DKU value into a more structured set of mode, brand,
 * parts, etc. so that it can be used under RIPE.
 *
 * @param {String} dku The DKU identifier to be used in the resolution.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * s {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configDkuP = function(dku, options) {
    return new Promise((resolve, reject) => {
        this.configDku(dku, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Resolves the provided SKU value into a more structured set of model, brand,
 * parts, etc. so that it can be used under RIPE.
 *
 * @param {String} sku The SKU identifier to be used in the resolution.
 * @param {String} domain The domain to be used in the resolution.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configSku = function(sku, domain, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = Object.assign(
        {
            sku: sku,
            domain: domain,
            queryOptions: false,
            initialsOptions: false
        },
        options
    );
    options = this._getConfigInfoOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Resolves the provided SKU value into a more structured set of mode, brand,
 * parts, etc. so that it can be used under RIPE.
 *
 * @param {String} sku The SKU identifier to be used in the resolution.
 * @param {String} domain The domain to be used in the resolution.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * s {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configSkuP = function(sku, domain, options) {
    return new Promise((resolve, reject) => {
        this.configSku(sku, domain, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Resolves a customization to a mapped SKU.
 *
 * @param {String} domain The SKU domain (falls back to brand value).
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'variant' - The variant of the model.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 *  - 'productId' - The product's unique identification.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configResolveSku = function(domain, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getConfigSkuOptions(domain, options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Resolves a customization to a mapped SKU.
 *
 * @param {String} domain The SKU domain (falls back to brand value).
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'variant' - The variant of the model.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 *  - 'productId' - The product's unique identification.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configResolveSkuP = function(domain, options) {
    return new Promise((resolve, reject) => {
        this.configResolveSku(domain, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets the configuration of a product identified by its unique product ID.
 *
 * @param {String} productId The identifier of the product to be resolved.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configResolve = function(productId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}config/resolve/${productId}`;
    options = Object.assign({ url: url }, options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the configuration of a product identified by its unique product ID.
 *
 * @param {String} productId The identifier of the product to be resolved.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * s {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configResolveP = function(productId, options) {
    return new Promise((resolve, reject) => {
        this.configResolve(productId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getConfigInfoOptions = function(options = {}) {
    const sku = options.sku === undefined ? null : options.sku;
    const domain = options.domain === undefined ? null : options.domain;
    const dku = options.dku === undefined ? null : options.dku;
    const guess = options.guess === undefined ? this.guess : options.guess;
    const queryOptions = options.queryOptions === undefined ? true : options.queryOptions;
    const initialsOptions = options.initialsOptions === undefined ? true : options.initialsOptions;

    if (queryOptions) options = this._getQueryOptions(options);
    if (initialsOptions) options = this._getInitialsOptions(options);

    const params = options.params || {};
    options.params = params;

    if (sku !== undefined && sku !== null) {
        params.sku = sku;
    }
    if (domain !== undefined && domain !== null) {
        params.domain = domain;
    }
    if (dku !== undefined && dku !== null) {
        params.dku = dku;
    }
    if (guess !== undefined && guess !== null) {
        params.guess = guess ? "1" : "0";
    }

    const url = `${this.url}config/info`;

    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getConfigSkuOptions = function(domain, options = {}) {
    const queryOptions = options.queryOptions === undefined ? true : options.queryOptions;
    const initialsOptions = options.initialsOptions === undefined ? true : options.initialsOptions;

    if (queryOptions) options = this._getQueryOptions(options);
    if (initialsOptions) options = this._getInitialsOptions(options);

    const params = options.params || {};

    if (domain) params.domain = domain;

    options.params = params;

    const url = `${this.url}config/sku`;

    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};
