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
 * Gets the existing availability rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getAvailabilityRules = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}availability_rules`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing availability rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The availability rules list.
 */
ripe.Ripe.prototype.getAvailabilityRulesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getAvailabilityRules(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing availability rule filtered by id and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The Availability Rule's Id.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getAvailabilityRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}availability_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an existing availability rule filtered by id and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The Availability Rule's Id.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The availability rules list.
 */
ripe.Ripe.prototype.getAvailabilityRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getAvailabilityRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a Availability Rule on RIPE Core.
 *
 * @param {Object} availabilityRule The Availability Rule object
 * @param {Object} options An object with options
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createAvailabilityRule = function(availabilityRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}availability_rules`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: availabilityRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a Availability Rule on RIPE Core.
 *
 * @param {Object} availabilityRule The Availability Rule object
 * @param {Object} options An object with options
 * @returns {Promise} The availability rule's data.
 */
ripe.Ripe.prototype.createAvailabilityRuleP = function(availabilityRule, options) {
    return new Promise((resolve, reject) => {
        this.createAvailabilityRule(availabilityRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a Availability Rule on RIPE Core.
 *
 * @param {Object} availabilityRule The Availability Rule object
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.updateAvailabilityRule = function(availabilityRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}availability_rules/${availabilityRule.id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: availabilityRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a Availability Rule on RIPE Core.
 *
 * @param {Object} availabilityRule The Availability Rule object
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The Availability Rule's data.
 */
ripe.Ripe.prototype.updateAvailabilityRuleP = function(availabilityRule, options) {
    return new Promise((resolve, reject) => {
        this.updateAvailabilityRule(availabilityRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes the existing availability rules filtered by id, according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The Availability Rule's Id.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteAvailabilityRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}availability_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes the existing availability rules filtered by id, according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The Availability Rule's Id.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The availability rules list.
 */
ripe.Ripe.prototype.deleteAvailabilityRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteAvailabilityRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
