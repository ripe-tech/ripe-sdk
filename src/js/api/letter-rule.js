const base = require("../base");
const ripe = base.ripe;

/**
 * Gets the existing letter rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getLetterRules = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}letter_rules`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing letter rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The letter rules result list.
 */
ripe.Ripe.prototype.getLetterRulesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLetterRules(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a letter rule on RIPE Core.
 *
 * @param {Object} letterRule An object with information needed to create a letter rule.
 * @param {Object} options An object with options.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createLetterRule = function(letterRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}letter_rules`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: letterRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a letter rule on RIPE Core.
 *
 * @param {Object} letterRule An object with information needed to create a letter rule.
 * @param {Object} options An object with options.
 * @returns {Promise} The letter rule's data.
 */
ripe.Ripe.prototype.createLetterRuleP = function(letterRule, options) {
    return new Promise((resolve, reject) => {
        this.createLetterRule(letterRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing letter rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The letter rule's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getLetterRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}letter_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an existing letter rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The letter rule's ID.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The letter rule requested by ID.
 */
ripe.Ripe.prototype.getLetterRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getLetterRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a letter rule on RIPE Core.
 *
 * @param {Object} letterRule An object with information needed to update a letter rule.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.updateLetterRule = function(letterRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}letter_rules/${letterRule.id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: letterRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a letter rule on RIPE Core.
 *
 * @param {Object} letterRule An object with information needed to update a letter rule.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The letter rule's data.
 */
ripe.Ripe.prototype.updateLetterRuleP = function(letterRule, options) {
    return new Promise((resolve, reject) => {
        this.updateLetterRule(letterRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing letter rule.
 *
 * @param {Number} id The letter rule's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteLetterRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}letter_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes an existing letter rule.
 *
 * @param {Number} id The letter rule's ID.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The result of the letter rule's deletion.
 */
ripe.Ripe.prototype.deleteLetterRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteLetterRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
