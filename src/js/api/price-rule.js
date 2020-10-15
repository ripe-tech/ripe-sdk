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
 * Gets the existing price rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getPriceRules = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}price_rules`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing price rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The price rules list.
 */
ripe.Ripe.prototype.getPriceRulesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getPriceRules(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing price rule filtered by id and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The Price Rule's Id.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getPriceRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}price_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an existing price rule filtered by id and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The Price Rule's Id.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The price rules list.
 */
ripe.Ripe.prototype.getPriceRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getPriceRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a Price Rule on RIPE Core.
 *
 * @param {Object} priceRule The Price Rule object
 * @param {Object} options An object with options
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createPriceRule = function(priceRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}price_rules`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: priceRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a Price Rule on RIPE Core.
 *
 * @param {Object} priceRule The Price Rule object
 * @param {Object} options An object with options
 * @returns {Promise} The price rule's data.
 */
ripe.Ripe.prototype.createPriceRuleP = function(priceRule, options) {
    return new Promise((resolve, reject) => {
        this.createPriceRule(priceRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a Price Rule on RIPE Core.
 *
 * @param {Object} priceRule The Price Rule object
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.updatePriceRule = function(priceRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}price_rules/${priceRule.id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: priceRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a Price Rule on RIPE Core.
 *
 * @param {Object} priceRule The Price Rule object
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The Price Rule's data.
 */
ripe.Ripe.prototype.updatePriceRuleP = function(priceRule, options) {
    return new Promise((resolve, reject) => {
        this.updatePriceRule(priceRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes the existing price rules filtered by id, according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The Price Rule's Id.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deletePriceRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}price_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes the existing price rules filtered by id, according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The Price Rule's Id.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The price rules list.
 */
ripe.Ripe.prototype.deletePriceRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deletePriceRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
