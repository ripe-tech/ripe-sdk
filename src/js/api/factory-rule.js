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
 * Gets the existing factory rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getFactoryRules = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}factory_rules`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing factory rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The factory rules result list.
 */
ripe.Ripe.prototype.getFactoryRulesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getFactoryRules(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a factory rule on RIPE Core.
 *
 * @param {Object} factoryRule An object with information needed to create a factory rule.
 * @param {Object} options An object with options.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createFactoryRule = function(factoryRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}factory_rules`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: factoryRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a factory rule on RIPE Core.
 *
 * @param {Object} factoryRule An object with information needed to create a factory rule.
 * @param {Object} options An object with options.
 * @returns {Promise} The factory rule's data.
 */
ripe.Ripe.prototype.createFactoryRuleP = function(factoryRule, options) {
    return new Promise((resolve, reject) => {
        this.createFactoryRule(factoryRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing factory rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The factory rule's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getFactoryRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}factory_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an existing factory rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The factory rule's ID.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The factory rule requested by ID.
 */
ripe.Ripe.prototype.getFactoryRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getFactoryRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a factory rule on RIPE Core.
 *
 * @param {Object} factoryRule An object with information needed to update a factory rule.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.updateFactoryRule = function(factoryRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}factory_rules/${factoryRule.id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: factoryRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a factory rule on RIPE Core.
 *
 * @param {Object} factoryRule An object with information needed to update a factory rule.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The factory rule's data.
 */
ripe.Ripe.prototype.updateFactoryRuleP = function(factoryRule, options) {
    return new Promise((resolve, reject) => {
        this.updateFactoryRule(factoryRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing factory rule.
 *
 * @param {Number} id The factory rule's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteFactoryRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}factory_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes an existing factory rule.
 *
 * @param {Number} id The factory rule's ID.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The result of the factory rule's deletion.
 */
ripe.Ripe.prototype.deleteFactoryRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteFactoryRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
