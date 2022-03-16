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
 * Gets the existing transport rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getTransportRules = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}transport_rules`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing transport rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The transport rules list.
 */
ripe.Ripe.prototype.getTransportRulesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getTransportRules(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a transport rule on RIPE Core.
 *
 * @param {Object} transportRule An object with information needed to create a transport rule.
 * @param {Object} options An object with options.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createTransportRule = function(transportRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}transport_rules`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: transportRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a transport rule on RIPE Core.
 *
 * @param {Object} transportRule An object with information needed to create a transport rule.
 * @param {Object} options An object with options.
 * @returns {Promise} The transport rule's data.
 */
ripe.Ripe.prototype.createTransportRuleP = function(transportRule, options) {
    return new Promise((resolve, reject) => {
        this.createTransportRule(transportRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing transport rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The transport rule's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getTransportRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}transport_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an existing transport rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The transport rule's ID.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The transport rule requested by ID.
 */
ripe.Ripe.prototype.getTransportRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getTransportRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a transport rule on RIPE Core.
 *
 * @param {Object} transportRule An object with information needed to update a transport rule.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.updateTransportRule = function(transportRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}transport_rules/${transportRule.id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: transportRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a transport rule on RIPE Core.
 *
 * @param {Object} transportRule An object with information needed to update a transport rule.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The transport rule's data.
 */
ripe.Ripe.prototype.updateTransportRuleP = function(transportRule, options) {
    return new Promise((resolve, reject) => {
        this.updateTransportRule(transportRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing transport rule.
 *
 * @param {Number} id The transport rule's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteTransportRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}transport_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes an existing transport rule.
 *
 * @param {Number} id The transport rule's ID.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The result of the transport rule's deletion.
 */
ripe.Ripe.prototype.deleteTransportRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteTransportRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing transport rule filtered by brand, model and country.
 *
 * @param {String} brand The transport rule's brand.
 * @param {String} model The transport rule's model.
 * @param {String} country The transport rule's country.
 * @param {String} factory The transport rule's factory.
 * @param {Number} size The transport rule's size.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.resolveTransportRule = function(
    brand,
    model,
    country,
    factory,
    size,
    options,
    callback
) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}transport_rules/resolve`;
    const params = {};
    if (brand !== undefined && brand !== null) {
        params.brand = brand;
    }
    if (model !== undefined && model !== null) {
        params.model = model;
    }
    if (country !== undefined && country !== null) {
        params.country = country;
    }
    if (factory !== undefined && factory !== null) {
        params.factory = factory;
    }
    if (size !== undefined && size !== null) {
        params.size = size;
    }
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: params,
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an existing transport rule filtered by brand, model, country, factory and size.
 *
 * @param {String} brand The transport rule's brand.
 * @param {String} model The transport rule's model.
 * @param {String} country The transport rule's country.
 * @param {String} factory The transport rule's factory.
 * @param {Number} size The transport rule's size.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The transport rule requested by brand, model and country.
 */
ripe.Ripe.prototype.resolveTransportRuleP = function(
    brand,
    model,
    country,
    factory,
    size,
    options
) {
    return new Promise((resolve, reject) => {
        this.resolveTransportRule(
            brand,
            model,
            country,
            factory,
            size,
            options,
            (result, isValid, request) => {
                isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
            }
        );
    });
};
