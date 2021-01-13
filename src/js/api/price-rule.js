if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("../base");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
}

/**
 * Gets the existing price rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
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
 * Gets an existing price rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The price rule's ID.
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
 * Gets an existing price rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The price rule's ID.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The price rule requested by ID.
 */
ripe.Ripe.prototype.getPriceRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getPriceRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a price rule on RIPE Core.
 *
 * @param {Object} priceRule An object with information needed to create a price rule.
 * @param {Object} options An object with options.
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
 * Creates a price rule on RIPE Core.
 *
 * @param {Object} priceRule An object with information needed to create a price rule.
 * @param {Object} options An object with options.
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
 * Updates a price rule on RIPE Core.
 *
 * @param {Object} priceRule An object with information needed to update a price rule.
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
 * Updates a price rule on RIPE Core.
 *
 * @param {Object} priceRule An object with information needed to update a price rule.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The price rule's data.
 */
ripe.Ripe.prototype.updatePriceRuleP = function(priceRule, options) {
    return new Promise((resolve, reject) => {
        this.updatePriceRule(priceRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing price rule.
 *
 * @param {Number} id The price rule's ID.
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
 * Deletes an existing price rule.
 *
 * @param {Number} id The price rule's ID.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The result of the price rule's deletion.
 */
ripe.Ripe.prototype.deletePriceRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deletePriceRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
