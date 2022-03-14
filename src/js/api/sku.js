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
 * Gets the existing SKUs, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'filters[]' - List of filters that the query will use to, operators such as
 * ('in', 'not_in', 'like', 'contains'), for instance (eg: 'id:eq:42') would filter by the id that equals to 42.
 * - 'sort' - List of arguments to sort the results by and which direction
 * to sort them in (eg: 'id:ascending') would sort by the id attribute in ascending order,
 * while (eg: 'id:descending')] would do it in descending order.
 * - 'skip' - The number of the first record to retrieve from the results.
 * - 'limit' - The number of results to retrieve.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getSkus = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing SKUs, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The SKUs result list.
 */
ripe.Ripe.prototype.getSkusP = function(options) {
    return new Promise((resolve, reject) => {
        this.getSkus(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets the existing SKUs in a CSV file, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'filters[]' - List of filters that the query will use.
 * - 'sort' - List of arguments to sort the results by and which direction
 * to sort them in (eg: 'id:ascending') would sort by the id attribute in ascending order,
 * while (eg: 'id:descending')] would do it in descending order.
 * - 'skip' - The number of the first record to retrieve from the results.
 * - 'limit' - The number of results to retrieve.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getSkusCsv = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus.csv`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing SKUs in a CSV file, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} A CSV file containing the SKUs result list.
 */
ripe.Ripe.prototype.getSkusCsvP = function(options) {
    return new Promise((resolve, reject) => {
        this.getSkusCsv(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a SKU on RIPE Core under the defined domain.
 *
 * @param {String} identifier The SKU identifier as a plain string.
 * @param {Object} domain The SKU's domain, within the SKU is going to be defined.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'version' - The version of the build.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createSku = function(identifier, domain, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: {
            identifier: identifier,
            domain: domain,
            spec: Object.assign({}, options)
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a SKU on RIPE Core under the defined domain.
 *
 * @param {String} identifier The SKU identifier as a plain string.
 * @param {Object} domain The SKU's domain, within the SKU is going to be defined.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'version' - The version of the build.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 * @returns {Promise} The SKU's data.
 */
ripe.Ripe.prototype.createSkuP = function(identifier, domain, options) {
    return new Promise((resolve, reject) => {
        this.createSku(identifier, domain, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets a SKU by its ID (not by its identifier).
 *
 * @param {Object} id ID of the intended SKU (not the identifier).
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getSku = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets a SKU by its ID (not by its identifier).
 *
 * @param {Object} id ID of the intended SKU (not the identifier).
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The SKU request by ID.
 */
ripe.Ripe.prototype.getSkuP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getSku(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates an existing SKU, according to the provided options.
 *
 * @param {Object} id ID of the SKU to be updated.
 * @param {String} identifier The SKU identifier as a plain string.
 * @param {Object} domain The SKU's domain, within the SKU is going to be defined.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'version' - The version of the build.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.updateSku = function(id, identifier, domain, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: {
            identifier: identifier,
            domain: domain,
            spec: Object.assign({}, options)
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates an existing SKU, according to the provided options.
 *
 * @param {Object} id ID of the SKU to be updated.
 * @param {String} identifier The SKU identifier as a plain string.
 * @param {Object} domain The SKU's domain, within the SKU is going to be defined.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'version' - The version of the build.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 * @returns {Promise} The SKU's data.
 */
ripe.Ripe.prototype.updateSkuP = function(id, identifier, domain, options) {
    return new Promise((resolve, reject) => {
        this.updateSku(id, identifier, domain, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing SKU entity.
 *
 * @param {Object} id ID of the SKU to be deleted.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteSku = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes an existing SKU entity.
 *
 * @param {Object} id ID of the SKU to be deleted.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The result of the SKU's deletion.
 */
ripe.Ripe.prototype.deleteSkuP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteSku(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Validates a given SKU according to spec and model rules.
 *
 * @param {Object} id ID of the SKU to be validated.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.validateSku = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus/${id}/validate`;
    options = Object.assign(options, {
        url: url,
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Validates a given SKU according to spec and model rules.
 *
 * @param {Object} id ID of the SKU to be validated.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The result of the SKU's validation.
 */
ripe.Ripe.prototype.validateSkuP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.validateSku(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Counts the existing SKUs, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'filters[]' - List of filters that the query will use.
 * - 'sort' - List of arguments to sort the results by and which direction
 * to sort them in (eg: 'id:ascending') would sort by the id attribute in ascending order,
 * while (eg: 'id:descending')] would do it in descending order.
 * - 'skip' - The number of the first record to retrieve from the results.
 * - 'limit' - The number of results to retrieve.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.countSkus = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus/count`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Counts the existing SKUs, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The SKUs result count.
 */
ripe.Ripe.prototype.countSkusP = function(options) {
    return new Promise((resolve, reject) => {
        this.countSkus(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
