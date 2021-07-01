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
 * Gets the orders list, optionally filtered by a set of options.
 *
 * @param {Object} options An object of options to configure the query and
 * its results, such as:
 * - 'filters[]' - List of filters that the query will use to, operators such as
 * ('in', 'not_in', 'like', 'likei', 'llike', 'llikei', 'rlike', 'rlikei', 'contains'),
 * (eg: 'number:eq:42') would filter by the 'number' that equals to '42'.
 * - 'sort' - List of arguments to sort the results by and which direction
 * to sort them in (eg: 'id:ascending') would sort by the id attribute in ascending order,
 * while (eg: 'id:descending')] would do it in descending order.
 * - 'skip' - The number of the first record to retrieve from the results.
 * - 'limit' - The number of results to retrieve.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getOrders = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the orders list, optionally filtered by a set of options.
 *
 * @param {Object} options An object of options to configure the request.
 * its results, such as:
 * - 'filters[]' - List of filters that the query will use to, operators such as
 * ('in', 'not_in', 'like', 'contains'), for instance (eg: 'id:eq:42') would filter by the id that equals to 42.
 * - 'sort' - List of arguments to sort the results by and which direction
 * to sort them in (eg: 'id:ascending') would sort by the id attribute in ascending order,
 * while (eg: 'id:descending')] would do it in descending order.
 * - 'skip' - The number of the first record to retrieve from the results.
 * - 'limit' - The number of results to retrieve.
 * @returns {Promise} The orders result list.
 */
ripe.Ripe.prototype.getOrdersP = function(options) {
    return new Promise((resolve, reject) => {
        this.getOrders(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an order by number.
 *
 * @param {Number} number The number of the order to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an order by number.
 *
 * @param {Number} number The number of the order to find by.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The order requested by number.
 */
ripe.Ripe.prototype.getOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.getOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an order transport info.
 *
 * @param {Number} number The number of the order to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getTransportOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/transport`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an order transport info.
 *
 * @param {Number} number The number of the order to find by.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The order transport info.
 */
ripe.Ripe.prototype.getTransportOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.getTransportOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an order by number.
 *
 * @param {Number} number The number of the order to delete.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes an order by number.
 *
 * @param {Number} number The number of the order to delete.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The result of the order deletion.
 */
ripe.Ripe.prototype.deleteOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.deleteOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.attachmentsOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/attachments`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.attachmentsOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.attachmentsOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.createAttachmentOrder = function(number, file, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/attachments`;
    const dataM = { file: file };
    if (options.name) dataM.name = options.name;
    if (options.meta) dataM.meta = JSON.stringify(options.meta);
    options = Object.assign(options, {
        url: url,
        method: "POST",
        dataM: dataM,
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.createAttachmentOrderP = function(number, file, options) {
    return new Promise((resolve, reject) => {
        this.createAttachmentOrder(number, file, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.attachmentOrder = function(number, attachmentName, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/attachments/${attachmentName}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        cached: false
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.attachmentOrderP = function(number, attachmentName, options) {
    return new Promise((resolve, reject) => {
        this.attachmentOrder(number, attachmentName, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.logOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/log`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.logOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.logOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.statesOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.statesOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.statesOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.stateOrder = function(number, stateId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateOrderP = function(number, stateId, options) {
    return new Promise((resolve, reject) => {
        this.stateOrder(number, stateId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.stateChatOrder = function(number, stateId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}/chat`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        cached: false
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateChatOrderP = function(number, stateId, options) {
    return new Promise((resolve, reject) => {
        this.stateChatOrder(number, stateId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.stateChatLinesOrder = function(number, stateId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}/chat/lines`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        cached: false
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateChatLinesOrderP = function(number, stateId, options) {
    return new Promise((resolve, reject) => {
        this.stateChatOrder(number, stateId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.stateChatLinesCountOrder = function(number, stateId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}/chat/lines/count`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        cached: false
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateChatLinesCountOrderP = function(number, stateId, options) {
    return new Promise((resolve, reject) => {
        this.stateChatLinesCountOrder(number, stateId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.stateChatCreateLineOrder = function(
    number,
    stateId,
    contents,
    options,
    callback
) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}/chat/lines`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            contents: contents
        },
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateChatCreateLineOrderP = function(number, stateId, contents, options) {
    return new Promise((resolve, reject) => {
        this.stateChatCreateLineOrder(
            number,
            stateId,
            contents,
            options,
            (result, isValid, request) => {
                isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
            }
        );
    });
};

ripe.Ripe.prototype.stateAttachmentsOrder = function(number, stateId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}/attachments`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        cached: false
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateAttachmentsOrderP = function(number, stateId, options) {
    return new Promise((resolve, reject) => {
        this.stateAttachmentsOrder(number, stateId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.stateAttachmentsCountOrder = function(number, stateId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}/attachments/count`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        cached: false
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateAttachmentsCountOrderP = function(number, stateId, options) {
    return new Promise((resolve, reject) => {
        this.stateAttachmentsCountOrder(number, stateId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.stateCreateAttachmentOrder = function(
    number,
    stateId,
    file,
    options,
    callback
) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}/attachments`;
    const dataM = { file: file };
    if (options.name) dataM.name = options.name;
    if (options.meta) dataM.meta = JSON.stringify(options.meta);
    options = Object.assign(options, {
        url: url,
        method: "POST",
        dataM: {
            file: dataM
        },
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateCreateAttachmentOrderP = function(number, stateId, file, options) {
    return new Promise((resolve, reject) => {
        this.stateCreateAttachmentOrder(
            number,
            stateId,
            file,
            options,
            (result, isValid, request) => {
                isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
            }
        );
    });
};

ripe.Ripe.prototype.stateAttachmentOrder = function(
    number,
    stateId,
    attachmentName,
    options,
    callback
) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/states/${stateId}/attachments/${attachmentName}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        cached: false
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.stateAttachmentOrderP = function(number, stateId, attachmentName, options) {
    return new Promise((resolve, reject) => {
        this.stateAttachmentOrder(
            number,
            stateId,
            attachmentName,
            options,
            (result, isValid, request) => {
                isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
            }
        );
    });
};

/**
 * Searches for orders using the filter string and the options that
 * are provided.
 *
 * @param {String} filterString An unstructured string to be used in the
 * orders search operation.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.searchOrders = function(filterString, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/search`;
    const params = {};
    if (filterString !== undefined && filterString !== null) {
        params.filter_string = filterString;
    }
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        params: params
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Searches for orders using the filter string and the options that
 * are provided.
 *
 * @param {String} filterString An unstructured string to be used in the
 * orders search operation.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The result of the order deletion.
 */
ripe.Ripe.prototype.searchOrdersP = function(filterString, options) {
    return new Promise((resolve, reject) => {
        this.searchOrders(filterString, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the order status to 'create'.
 *
 * @param {Number} number The number of the order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createOrder = function(number, options, callback) {
    return this.setOrderStatus(number, "create", options, callback);
};

ripe.Ripe.prototype.createOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.createOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the order status to 'produce'.
 *
 * @param {Number} number The number of the order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.produceOrder = function(number, options, callback) {
    return this.setOrderStatus(number, "produce", options, callback);
};

ripe.Ripe.prototype.produceOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.produceOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the order status to 'quality_assure'.
 *
 * @param {Number} number The number of the order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.qualityAssureOrder = function(number, options, callback) {
    return this.setOrderStatus(number, "quality_assure", options, callback);
};

ripe.Ripe.prototype.qualityAssureOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.qualityAssureOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the order status to 'ready'.
 *
 * @param {Number} number The number of the order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.readyOrder = function(number, options, callback) {
    return this.setOrderStatus(number, "ready", options, callback);
};

ripe.Ripe.prototype.readyOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.readyOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

ripe.Ripe.prototype.sendOrder = function(number, trackingNumber, trackingUrl, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = Object.assign(options, {
        params: {
            tracking_number: trackingNumber,
            tracking_url: trackingUrl
        }
    });
    return this.setOrderStatus(number, "send", options, callback);
};

ripe.Ripe.prototype.sendOrderP = function(number, trackingNumber, trackingUrl, options) {
    return new Promise((resolve, reject) => {
        this.sendOrder(number, trackingNumber, trackingUrl, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the order status to 'receive'.
 *
 * @param {Number} number The number of the order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.receiveOrder = function(number, options, callback) {
    return this.setOrderStatus(number, "receive", options, callback);
};

ripe.Ripe.prototype.receiveOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.receiveOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the order status to 'return'.
 *
 * @param {Number} number The number of the order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.returnOrder = function(number, options, callback) {
    return this.setOrderStatus(number, "return", options, callback);
};

ripe.Ripe.prototype.returnOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.returnOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the order status to 'cancel'.
 *
 * @param {Number} number The number of the order to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.cancelOrder = function(number, options, callback) {
    return this.setOrderStatus(number, "cancel", options, callback);
};

ripe.Ripe.prototype.cancelOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.cancelOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Changes an entry of an order's meta adding the new meta entry
 * according to the provided value or changing an existing one.
 *
 * @param {Number} number The number of the order to change the meta.
 * @param {String} key The key to set.
 * @param {Object} value The value to set, which might be of any type
 * (string, number, object or list), providing a `null` value deletes
 * the key.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.setMeta = function(number, key, value, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/meta`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: {
            key: key,
            value: value
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Changes an entry of an order's meta adding the new meta entry
 * according to the provided value or changing an existing one.
 *
 * @param {Number} number The number of the order to change the meta.
 * @param {String} key The key to set.
 * @param {Object} value The value to set, which might be of any type
 * (string, number, object or list), providing a `null` value deletes
 * the key.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The result of the order meta change.
 */
ripe.Ripe.prototype.setMetaP = function(number, key, value, options) {
    return new Promise((resolve, reject) => {
        this.setMeta(number, key, value, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Changes the priority of an order.
 *
 * @param {Number} number The number of the order to change the priority.
 * @param {Number} priority The new priority.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.setPriority = function(number, priority, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/priority`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        params: {
            priority: priority
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Changes the priority of an order.
 *
 * @param {Number} number The number of the order to change the priority.
 * @param {Number} priority The new priority.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The result of the order priority change.
 */
ripe.Ripe.prototype.setPriorityP = function(number, priority, options) {
    return new Promise((resolve, reject) => {
        this.setPriority(number, priority, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Changes the tracking info of an order.
 *
 * @param {Number} number The number of the order to change the tracking info.
 * @param {String} trackingNumber The new tracking number.
 * @param {String} trackingUrl The new tracking URL.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.setTracking = function(
    number,
    trackingNumber,
    trackingUrl,
    options,
    callback
) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/tracking`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        params: {
            tracking_number: trackingNumber,
            tracking_url: trackingUrl
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Changes the tracking info of an order.
 *
 * @param {Number} number The number of the order to change the tracking info.
 * @param {String} trackingNumber The new tracking number.
 * @param {String} trackingUrl The new tracking URL.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The result of the order tracking info change.
 */
ripe.Ripe.prototype.setTrackingP = function(number, trackingNumber, trackingUrl, options) {
    return new Promise((resolve, reject) => {
        this.setTracking(
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
 * Imports a production order to RIPE Core.
 *
 * @param {Number} ffOrderId The e-commerce order identifier.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 *  - 'gender' - The gender of the customized model.
 *  - 'size' - The native size of the customized model.
 *  - 'pending' - If the production order is to be imported at the pending, so it has to be confirmed.
 *  - 'notify' - Mark order to trigger notification after creation.
 *  - 'productId' - The product's unique identification.
 *  - 'currency' - The 'ISO 4217' currency code in which the order has been sold.
 *  - 'country' - The 'ISO 3166-2' country code where the order has been placed.
 *  - 'meta' - Complementary information to be added, as a key:value list (ie: '['key1:value1', 'key2:value2']).
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.importOrder = function(ffOrderId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._importOrder(ffOrderId, options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Imports a production order to RIPE Core.
 *
 * @param {Number} ffOrderId The e-commerce order identifier.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 *  - 'gender' - The gender of the customized model.
 *  - 'size' - The native size of the customized model.
 *  - 'pending' - If the production order is to be imported at the pending, so it has to be confirmed.
 *  - 'notify' - Mark order to trigger notification after creation.
 *  - 'productId' - The product's unique identification.
 *  - 'currency' - The 'ISO 4217' currency code in which the order has been sold.
 *  - 'country' - The 'ISO 3166-2' country code where the order has been placed.
 *  - 'meta' - Complementary information to be added, as a key:value list (ie: '['key1:value1', 'key2:value2']).
 * @returns {Promise} The production order's data.
 */
ripe.Ripe.prototype.importOrderP = function(ffOrderId, options, callback) {
    return new Promise((resolve, reject) => {
        this.importOrder(ffOrderId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Setups a pre-customization on RIPE Core.
 *
 * @param {Number} ffId The concrete identifier of the pre-customization,
 * may represent just an entry point for a pre-customized product (used for mapping).
 * @param {Object} options An object with options, such as:
 *  - 'brand' - the brand of the model.
 *  - 'model' - the name of the model.
 *  - 'variant' - the variant of the model.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'gender' - The gender of the customized model.
 *  - 'size' - The native size of the customized model.
 *  - 'product_id' - The product identifier of the base product that is used for pre-customization mapping.
 *  - 'notify' - Mark pre-customization to trigger notification after creation.
 *  - 'meta' - Complementary information to be added, as a key:value list (ie: '['key1:value1', 'key2:value2']).
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.precustomizationOrder = function(ffId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._precustomizationOrder(ffId, options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Setups a pre-customization on RIPE Core.
 *
 * @param {Number} ffId The concrete identifier of the pre-customization,
 * may represent just an entry point for a pre-customized product (used for mapping).
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'gender' - The gender of the customized model.
 *  - 'size' - The native size of the customized model.
 *  - 'productId' - The product identifier of the base product that is used for pre-customization mapping.
 *  - 'notify' - Mark pre-customization to trigger notification after creation.
 *  - 'meta' - Complementary information to be added, as a key:value list (ie: '['key1:value1', 'key2:value2']).
 * @returns {Promise} The production order's data.
 */
ripe.Ripe.prototype.precustomizationOrderP = function(ffId, options, callback) {
    return new Promise((resolve, reject) => {
        this.precustomizationOrder(ffId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype.setOrderStatus = function(number, status, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/${status}`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "PUT"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the order subscription status for the session user.
 *
 * @param {Number} number The number of the order to get the subscription status.
 * @returns {XMLHttpRequest} The order subscription status.
 */
ripe.Ripe.prototype.getOrderSubscription = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/subscription`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        cached: false,
        method: "GET"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the order subscription status for the session user.
 *
 * @param {Number} number The number of the order to get the subscription status.
 * @returns {Promise} The order subscription status.
 */
ripe.Ripe.prototype.getOrderSubscriptionP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.getOrderSubscription(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Adds the email of the user in session to subscriber list of an order.
 *
 * @param {Number} number The number of the order to subscribe.
 * @returns {XMLHttpRequest} The order subscription status.
 */
ripe.Ripe.prototype.subscribeOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/subscription`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "PUT"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Adds the email of the user in session to subscriber list of an order.
 *
 * @param {Number} number The number of the order to subscribe.
 * @returns {Promise} The order subscription status.
 */
ripe.Ripe.prototype.subscribeOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.subscribeOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Removes email of the user in session from the subscriber list of an order.
 *
 * @param {Number} number The number of the order to unsubscribe.
 * @returns {XMLHttpRequest} The order subscription status.
 */
ripe.Ripe.prototype.unsubscribeOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/subscription`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "DELETE"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Removes email of the user in session from the subscriber list of an order.
 *
 * @param {Number} number The number of the order to unsubscribe.
 * @returns {Promise} The order subscription status.
 */
ripe.Ripe.prototype.unsubscribeOrderP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.unsubscribeOrder(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getOrderReportURL = function(number, key, options) {
    options = options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/report`;
    options = Object.assign(options, {
        url: url,
        params: { key: key }
    });
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getOrderReportPDFURL = function(number, key, options) {
    options = options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/report.pdf`;
    options = Object.assign(options, {
        url: url,
        params: { key: key }
    });
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getOrderReportPNGURL = function(number, key, options) {
    options = options === undefined ? {} : options;
    const url = `${this.url}orders/${number}/report.png`;
    options = Object.assign(options, {
        url: url,
        params: { key: key }
    });
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * @ignore
 * @see {link https://docs.platforme.com/#order-endpoints-import}
 */
ripe.Ripe.prototype._importOrder = function(ffOrderId, options = {}) {
    const type = options.type === undefined ? null : options.type;
    const brand = options.brand === undefined ? this.brand : options.brand;
    const factory = options.factory === undefined ? null : options.factory;
    const model = options.model === undefined ? this.model : options.model;
    const variant = options.variant === undefined ? this.variant : options.variant;
    const parts = options.parts === undefined ? this.parts : options.parts;
    const initials = options.initials === undefined ? this.initials : options.initials;
    const engraving = options.engraving === undefined ? this.engraving : options.engraving;
    const initialsExtra =
        options.initials_extra === undefined && options.initialsExtra === undefined
            ? this.initialsExtra
            : options.initialsExtra || options.initials_extra;
    const gender = options.gender === undefined ? null : options.gender;
    const size = options.size === undefined ? null : options.size;
    const pending = options.pending === undefined ? null : options.pending;
    const notify = options.notify === undefined ? null : options.notify;
    const productId =
        options.product_id === undefined && options.productId === undefined
            ? null
            : options.product_id || options.productId;
    const country = options.country === undefined ? null : options.country;
    const price = options.price === undefined ? null : options.price;
    const currency = options.currency === undefined ? null : options.currency;
    const deliveryTime = options.deliveryTime === undefined ? null : options.deliveryTime;
    const meta = options.meta === undefined ? null : options.meta;
    const description = options.description === undefined ? null : options.description;
    const shippingInfo = options.shippingInfo === undefined ? null : options.shippingInfo;
    const notes = options.notes === undefined ? null : options.notes;
    const images = options.images === undefined ? null : options.images;

    const url = `${this.url}orders/import`;
    const contents = {
        brand: brand,
        model: model,
        parts: parts,
        size: size
    };

    if (factory) contents.factory = factory;
    if (variant) contents.variant = variant;
    if (productId) contents.product_id = productId;
    if (gender) contents.gender = gender;
    if (Object.keys(initialsExtra).length > 0) {
        contents.initials_extra = initialsExtra;
    } else if (initials && engraving) {
        contents.initials = initials;
        contents.engraving = engraving;
    }
    if (deliveryTime) contents.delivery_time = deliveryTime;
    if (images) contents.images = images;
    if (description) contents.description = description;
    if (shippingInfo) contents.shipping_info = shippingInfo;

    const params = {
        ff_order_id: ffOrderId,
        contents: JSON.stringify(contents)
    };
    if (type) params.type = type;
    if (country) params.country = country;
    if (price) params.price = price;
    if (currency) params.currency = currency;
    if (meta) params.meta = meta;
    if (notes) params.notes = notes;
    if (notify) params.notify = notify;
    if (pending) params.pending = pending;

    return Object.assign(options, {
        url: url,
        method: "POST",
        params: params,
        auth: true
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._precustomizationOrder = function(ffId, options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const variant = options.variant === undefined ? this.variant : options.variant;
    const parts = options.parts === undefined ? this.parts : options.parts;
    const initials = options.initials === undefined ? this.initials : options.initials;
    const engraving = options.engraving === undefined ? this.engraving : options.engraving;
    const initialsExtra =
        options.initials_extra === undefined && options.initialsExtra === undefined
            ? this.initialsExtra
            : options.initialsExtra || options.initials_extra;
    const gender = options.gender === undefined ? null : options.gender;
    const size = options.size === undefined ? null : options.size;
    const productId =
        options.product_id === undefined && options.productId === undefined
            ? null
            : options.product_id || options.productId;
    const meta = options.meta === undefined ? null : options.meta;

    const url = `${this.url}orders/pre_customization`;
    const contents = {
        brand: brand,
        model: model,
        parts: parts,
        size: size,
        product_id: productId
    };
    if (variant) contents.variant = variant;
    if (gender) contents.gender = gender;
    if (Object.keys(initialsExtra).length > 0) {
        contents.initials_extra = initialsExtra;
    } else if (initials && engraving) {
        contents.initials = initials;
        contents.engraving = engraving;
    }

    const params = {
        ff_id: ffId,
        contents: JSON.stringify(contents)
    };
    if (meta) params.meta = meta;

    return Object.assign(options, {
        url: url,
        method: "POST",
        params: params,
        auth: true
    });
};
