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
 * Gets the existing bulk orders, according to the provided filtering
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
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBulkOrders = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}bulk_orders`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing bulk orders, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The bulk orders result list.
 */
ripe.Ripe.prototype.getBulkOrdersP = function(options) {
    return new Promise((resolve, reject) => {
        this.getBulkOrders(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets a bulk order by number.
 *
 * @param {Number} number The number of the bulk order to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBulkOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}bulk_orders/${number}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets a bulk order by number.
 *
 * @param {Number} number The number of the bulk order to find by.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The bulk order requested by number.
 */
ripe.Ripe.prototype.getBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.getBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to the one given.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {String} status The new status of the bulk order.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.setBulkOrderStatus = function(number, status, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}bulk_orders/${number}/${status}`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "PUT"
    });
    options.params = options.params || {};
    if (options.justification !== undefined) options.params.justification = options.justification;
    if (options.notify !== undefined) options.params.notify = options.notify ? "1" : "0";
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Sets the bulk order status to 'create'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "create", options, callback);
};

/**
 * Sets the bulk order status to 'create'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.createBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.createBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to 'produce'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.produceBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "produce", options, callback);
};

/**
 * Sets the bulk order status to 'produce'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.produceBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.produceBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to 'quality_assure'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.qualityAssureBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "quality_assure", options, callback);
};

/**
 * Sets the bulk order status to 'quality_assure'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.qualityAssureBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.qualityAssureBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to 'reject'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.rejectBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "reject", options, callback);
};

/**
 * Sets the bulk order status to 'reject'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.rejectBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.rejectBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to 'ready'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.readyBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "ready", options, callback);
};

/**
 * Sets the bulk order status to 'ready'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.readyBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.readyBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to 'sent'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.sendBulkOrder = function(
    number,
    trackingNumber,
    trackingUrl,
    options,
    callback
) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = Object.assign(options, {
        params: {
            tracking_number: trackingNumber,
            tracking_url: trackingUrl
        }
    });
    return this.setBulkOrderStatus(number, "send", options, callback);
};

/**
 * Sets the bulk order status to 'sent'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.sendBulkOrderP = function(number, trackingNumber, trackingUrl, options) {
    return new Promise((resolve, reject) => {
        this.sendBulkOrder(
            number,
            trackingNumber,
            trackingUrl,
            options,
            (result, isValid, request) => {
                isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
            }
        );
    });
};

/**
 * Sets the bulk order status to 'blocked'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.blockBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "block", options, callback);
};

/**
 * Sets the bulk order status to 'blocked'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.blockBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.blockBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to 'receive'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.receiveBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "receive", options, callback);
};

/**
 * Sets the bulk order status to 'receive'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.receiveBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.receiveBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to 'return'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.returnBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "return", options, callback);
};

/**
 * Sets the bulk order status to 'return'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.returnBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.returnBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the bulk order status to 'cancel'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.cancelBulkOrder = function(number, options, callback) {
    return this.setBulkOrderStatus(number, "cancel", options, callback);
};

/**
 * Sets the bulk order status to 'cancel'.
 *
 * @param {Number} number The number of the bulk order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The update bulk order.
 */
ripe.Ripe.prototype.cancelBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.cancelBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a bulk order on RIPE Core.
 *
 * @param {String} name The name for the bulk order.
 * @param {Array} orders The list of the order IDs for the bulk order.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.importBulkOrder = function(name, orders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._importBulkOrder(name, orders, options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a bulk order on RIPE Core.
 *
 * @param {String} name The name for the bulk order.
 * @param {Object} options An object of options to configure the request.
 * @param {Array} orders The list of the order IDs for the bulk order.
 * @returns {Promise} The bulk order's data.
 */
ripe.Ripe.prototype.importBulkOrderP = function(name, orders, options) {
    return new Promise((resolve, reject) => {
        this.importBulkOrder(name, orders, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns all the attachments of a bulk order.
 *
 * @param {Number} number The number of the bulk order.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.attachmentsBulkOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}bulk_orders/${number}/attachments`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns all the attachments of a bulk order.
 *
 * @param {Number} number The number of the bulk order.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The attachments of the bulk order.
 */
ripe.Ripe.prototype.attachmentsBulkOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.attachmentsBulkOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Adds attachment files to a bulk order.
 *
 * @param {Number} number The number of the bulk order.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createAttachmentBulkOrder = function(number, files, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}bulk_orders/${number}/attachments`;
    const dataM = { files: files };
    options = Object.assign(options, {
        url: url,
        method: "POST",
        dataM: dataM,
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Adds attachment files to a bulk order.
 *
 * @param {Number} number The number of the bulk order.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The bulk order with the added attachments.
 */
ripe.Ripe.prototype.createAttachmentBulkOrderP = function(number, files, options) {
    return new Promise((resolve, reject) => {
        this.createAttachmentBulkOrder(number, files, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @ignore
 * @see {link https://docs.platforme.com/#order-endpoints-import}
 */
ripe.Ripe.prototype._importBulkOrder = function(name, orders, options = {}) {
    const url = `${this.url}bulk_orders`;
    const brand = options.brand === undefined ? null : options.brand;
    const description = options.description === undefined ? null : options.description;
    const dataJ = {
        name: name,
        brand: brand,
        orders: orders
    };
    if (brand) dataJ.brand = brand;
    if (description) dataJ.description = description;
    return Object.assign(options, {
        url: url,
        method: "POST",
        dataJ: dataJ,
        auth: true
    });
};
