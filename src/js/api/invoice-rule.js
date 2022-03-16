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
 * Gets the existing invoice rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getInvoiceRules = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}invoice_rules`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing invoice rules, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The invoice rules list.
 */
ripe.Ripe.prototype.getInvoiceRulesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getInvoiceRules(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a invoice rule on RIPE Core.
 *
 * @param {Object} invoiceRule An object with information needed to create a invoice rule.
 * @param {Object} options An object with options.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createInvoiceRule = function(invoiceRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}invoice_rules`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: invoiceRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a invoice rule on RIPE Core.
 *
 * @param {Object} invoiceRule An object with information needed to create a invoice rule.
 * @param {Object} options An object with options.
 * @returns {Promise} The invoice rule's data.
 */
ripe.Ripe.prototype.createInvoiceRuleP = function(invoiceRule, options) {
    return new Promise((resolve, reject) => {
        this.createInvoiceRule(invoiceRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing invoice rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The invoice rule's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getInvoiceRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}invoice_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an existing invoice rule filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The invoice rule's ID.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The invoice rule requested by ID.
 */
ripe.Ripe.prototype.getInvoiceRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getInvoiceRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a invoice rule on RIPE Core.
 *
 * @param {Object} invoiceRule An object with information needed to update a invoice rule.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.updateInvoiceRule = function(invoiceRule, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}invoice_rules/${invoiceRule.id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: invoiceRule
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a invoice rule on RIPE Core.
 *
 * @param {Object} invoiceRule An object with information needed to update a invoice rule.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The invoice rule's data.
 */
ripe.Ripe.prototype.updateInvoiceRuleP = function(invoiceRule, options) {
    return new Promise((resolve, reject) => {
        this.updateInvoiceRule(invoiceRule, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing invoice rule.
 *
 * @param {Number} id The invoice rule's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteInvoiceRule = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}invoice_rules/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes an existing invoice rule.
 *
 * @param {Number} id The invoice rule's ID.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The result of the invoice rule's deletion.
 */
ripe.Ripe.prototype.deleteInvoiceRuleP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteInvoiceRule(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing invoice rule filtered by brand, model, country and size.
 *
 * @param {String} brand The invoice rule's brand.
 * @param {String} model The invoice rule's model.
 * @param {String} country The invoice rule's country.
 * @param {Number} size The invoice rule's size.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.resolveInvoiceRule = function(brand, model, country, size, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}invoice_rules/resolve`;
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
 * Gets an existing invoice rule filtered by brand, model and country.
 *
 * @param {String} brand The invoice rule's brand.
 * @param {String} model The invoice rule's model.
 * @param {String} country The invoice rule's country.
 * @param {Number} size The invoice rule's size.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The invoice rule requested by brand, model and country.
 */
ripe.Ripe.prototype.resolveInvoiceRuleP = function(brand, model, country, size, options) {
    return new Promise((resolve, reject) => {
        this.resolveInvoiceRule(
            brand,
            model,
            country,
            size,
            options,
            (result, isValid, request) => {
                isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
            }
        );
    });
};
