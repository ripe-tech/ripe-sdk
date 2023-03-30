const base = require("../base");
const ripe = base.ripe;

/**
 * Gets the existing availability rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
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
 * Creates an availability rule on RIPE Core.
 *
 * @param {Object} availabilityRule The availability rule data.
 * @param {Object} options An object with options.
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
 * Creates an availability rule on RIPE Core.
 *
 * @param {Object} availabilityRule The availability rule's data.
 * @param {Object} options An object with options.
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
 * Gets an existing availability rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The availability rule's ID.
 * @param {Object} options An object of options to configure the request.
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
 * Gets an existing availability rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The availability rule's ID.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The availability rule requested by ID.
 */
ripe.Ripe.prototype.getAvailabilityRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getAvailabilityRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates an availability rule on RIPE Core.
 *
 * @param {Object} availabilityRule The availability rule's data.
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
 * Updates an availability rule on RIPE Core.
 *
 * @param {Object} availabilityRule The Availability Rule's data.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The availability rule's data.
 */
ripe.Ripe.prototype.updateAvailabilityRuleP = function(availabilityRule, options) {
    return new Promise((resolve, reject) => {
        this.updateAvailabilityRule(availabilityRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing availability rule.
 *
 * @param {Number} id The availability rule's ID.
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
 * Deletes an existing availability rule.
 *
 * @param {Number} id The availability rule's ID.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The result of the availability rule's deletion.
 */
ripe.Ripe.prototype.deleteAvailabilityRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteAvailabilityRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
