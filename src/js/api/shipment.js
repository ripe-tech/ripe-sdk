const base = require("../base");
const ripe = base.ripe;

/**
 * Gets the shipments list, optionally filtered by a set of options.
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
ripe.Ripe.prototype.getShipments = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the shipments list, optionally filtered by a set of options.
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
 * @returns {Promise} The shipments result list.
 */
ripe.Ripe.prototype.getShipmentsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getShipments(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets a shipment by number.
 *
 * @param {Number} number The number of the shipment to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getShipment = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets a shipment by number.
 *
 * @param {Number} number The number of the shipment to find by.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The shipment requested by number.
 */
ripe.Ripe.prototype.getShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.getShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a shipment on RIPE Core.
 *
 * @param {Object} shipment The shipment object, with options such as:
 *  - 'status' - The shipment status.
 *  - 'description' - A brief description of this shipment.
 *  - 'weight' - Weight of the package being shipped.
 *  - 'weight_units' - Weight units (e.g. "kilograms" or "pounds").
 *  - 'courier' - The courier for this shipment.
 *  - 'service' - The transportation service used.
 *  - 'package' - The package used.
 *  - 'tracking_number' - The tracking number associated with this shipment.
 *  - 'tracking_url' - The tracking URL associated with this shipment.
 *  - 'carbon_neutral' - If this shipment should be carbon neutral.
 *  - 'access_point_delivery' - If this shipment should be sent to an access point (e.g. "no", "optional" or "mandatory").
 *  - 'pickup' - Pickup information.
 *    - 'offset' - Time offset for pickup scheduling relative to shipment creation (milliseconds).
 *    - 'ready_time' - Opening hours for shipper facility (milliseconds).
 *    - 'close_time' - Closing hours for shipper facility (milliseconds).
 *  - 'shipping_date' - The date the shipment ended.
 *  - 'delivery_date' - The date the shipment began.
 *  - 'shipper' - Shipper's information.
 *    - 'name' - Shipper's contact name.
 *    - 'phone' - Shipper's contact phone.
 *    - 'address' - Shipper's address.
 *  - 'customer' - Customer's information.
 *    - 'name' - Customer's contact name.
 *    - 'phone' - Customer's contact phone.
 *    - 'address' - Customer's address.
 *  - 'orders' - A list of RIPE Core order numbers.
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createShipment = function(shipment, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: shipment
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a shipment on RIPE Core.
 *
 * @param {Object} shipment The shipment object, with options such as:
 *  - 'status' - The shipment status.
 *  - 'description' - A brief description of this shipment.
 *  - 'weight' - Weight of the package being shipped.
 *  - 'weight_units' - Weight units (e.g. "kilograms" or "pounds").
 *  - 'courier' - The courier for this shipment.
 *  - 'service' - The transportation service used.
 *  - 'package' - The package used.
 *  - 'tracking_number' - The tracking number associated with this shipment.
 *  - 'tracking_url' - The tracking URL associated with this shipment.
 *  - 'carbon_neutral' - If this shipment should be carbon neutral.
 *  - 'access_point_delivery' - If this shipment should be sent to an access point (e.g. "no", "optional" or "mandatory").
 *  - 'pickup' - Pickup information.
 *    - 'offset' - Time offset for pickup scheduling relative to shipment creation (milliseconds).
 *    - 'ready_time' - Opening hours for shipper facility (milliseconds).
 *    - 'close_time' - Closing hours for shipper facility (milliseconds).
 *  - 'shipping_date' - The date the shipment ended.
 *  - 'delivery_date' - The date the shipment began.
 *  - 'shipper' - Shipper's information.
 *    - 'name' - Shipper's contact name.
 *    - 'phone' - Shipper's contact phone.
 *    - 'address' - Shipper's address.
 *  - 'customer' - Customer's information.
 *    - 'name' - Customer's contact name.
 *    - 'phone' - Customer's contact phone.
 *    - 'address' - Customer's address.
 *  - 'orders' - A list of RIPE Core order numbers.
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The shipment's data.
 */
ripe.Ripe.prototype.createShipmentP = function(shipment, options) {
    return new Promise((resolve, reject) => {
        this.createShipment(shipment, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a shipment on RIPE Core.
 *
 * @param {Object} shipment The shipment to update, with options such as:
 *  - 'number' - The existing shipment number.
 *  - 'status' - The shipment status.
 *  - 'description' - A brief description of this shipment.
 *  - 'weight' - Weight of the package being shipped.
 *  - 'weight_units' - Weight units (e.g. "kilograms" or "pounds").
 *  - 'courier' - The courier for this shipment.
 *  - 'service' - The transportation service used.
 *  - 'package' - The package used.
 *  - 'tracking_number' - The tracking number associated with this shipment.
 *  - 'tracking_url' - The tracking URL associated with this shipment.
 *  - 'carbon_neutral' - If this shipment should be carbon neutral.
 *  - 'access_point_delivery' - If this shipment should be sent to an access point (e.g. "no", "optional" or "mandatory").
 *  - 'pickup' - Pickup information.
 *    - 'offset' - Time offset for pickup scheduling relative to shipment creation (milliseconds).
 *    - 'ready_time' - Opening hours for shipper facility (milliseconds).
 *    - 'close_time' - Closing hours for shipper facility (milliseconds).
 *  - 'shipping_date' - The date the shipment ended.
 *  - 'delivery_date' - The date the shipment began.
 *  - 'shipper' - Shipper's information.
 *    - 'name' - Shipper's contact name.
 *    - 'phone' - Shipper's contact phone.
 *    - 'address' - Shipper's address.
 *  - 'customer' - Customer's information.
 *    - 'name' - Customer's contact name.
 *    - 'phone' - Customer's contact phone.
 *    - 'address' - Customer's address.
 *  - 'orders' - A list of RIPE Core order numbers.
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.updateShipment = function(shipment, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${shipment.number}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: shipment
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a shipment on RIPE Core.
 *
 * @param {Object} shipment The shipment to update, with options such as:
 *  - 'number' - The existing shipment number.
 *  - 'status' - The shipment status.
 *  - 'description' - A brief description of this shipment.
 *  - 'weight' - Weight of the package being shipped.
 *  - 'weight_units' - Weight units (e.g. "kilograms" or "pounds").
 *  - 'courier' - The courier for this shipment.
 *  - 'service' - The transportation service used.
 *  - 'package' - The package used.
 *  - 'tracking_number' - The tracking number associated with this shipment.
 *  - 'tracking_url' - The tracking URL associated with this shipment.
 *  - 'carbon_neutral' - If this shipment should be carbon neutral.
 *  - 'access_point_delivery' - If this shipment should be sent to an access point (e.g. "no", "optional" or "mandatory").
 *  - 'pickup' - Pickup information.
 *    - 'offset' - Time offset for pickup scheduling relative to shipment creation (milliseconds).
 *    - 'ready_time' - Opening hours for shipper facility (milliseconds).
 *    - 'close_time' - Closing hours for shipper facility (milliseconds).
 *  - 'shipping_date' - The date the shipment ended.
 *  - 'delivery_date' - The date the shipment began.
 *  - 'shipper' - Shipper's information.
 *    - 'name' - Shipper's contact name.
 *    - 'phone' - Shipper's contact phone.
 *    - 'address' - Shipper's address.
 *  - 'customer' - Customer's information.
 *    - 'name' - Customer's contact name.
 *    - 'phone' - Customer's contact phone.
 *    - 'address' - Customer's address.
 *  - 'orders' - A list of RIPE Core order numbers.
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The shipment's data.
 */
ripe.Ripe.prototype.updateShipmentP = function(shipment, options) {
    return new Promise((resolve, reject) => {
        this.updateShipment(shipment, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes a shipment by number.
 *
 * @param {Number} number The number of the shipment to delete.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteShipment = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes a shipment by number.
 *
 * @param {Number} number The number of the shipment to delete.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The result of the shipment deletion.
 */
ripe.Ripe.prototype.deleteShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.deleteShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the shipment status to 'created'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createdShipment = function(number, options, callback) {
    return this.setShipmentStatus(number, "create", options, callback);
};

/**
 * Sets the shipment status to 'created'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The shipment with the updated status.
 */
ripe.Ripe.prototype.createdShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.createdShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the shipment status to 'ready'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.readyShipment = function(number, options, callback) {
    return this.setShipmentStatus(number, "ready", options, callback);
};

/**
 * Sets the shipment status to 'ready'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The shipment with the updated status.
 */
ripe.Ripe.prototype.readyShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.readyShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the shipment status to 'sent'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.sendShipment = function(number, options, callback) {
    return this.setShipmentStatus(number, "send", options, callback);
};

/**
 * Sets the shipment status to 'sent'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The shipment with the updated status.
 */
ripe.Ripe.prototype.sendShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.sendShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the shipment status to 'blocked'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.blockShipment = function(number, options, callback) {
    return this.setShipmentStatus(number, "block", options, callback);
};

/**
 * Sets the shipment status to 'blocked'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The shipment with the updated status.
 */
ripe.Ripe.prototype.blockShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.blockShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the shipment status to 'access_point'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.accessPointShipment = function(number, options, callback) {
    return this.setShipmentStatus(number, "access_point", options, callback);
};

/**
 * Sets the shipment status to 'access_point'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The shipment with the updated status.
 */
ripe.Ripe.prototype.accessPointShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.accessPointShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the shipment status to 'delivered'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deliverShipment = function(number, options, callback) {
    return this.setShipmentStatus(number, "deliver", options, callback);
};

/**
 * Sets the shipment status to 'delivered'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The shipment with the updated status.
 */
ripe.Ripe.prototype.deliverShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.deliverShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the shipment status to 'returned'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.returnShipment = function(number, options, callback) {
    return this.setShipmentStatus(number, "return", options, callback);
};

/**
 * Sets the shipment status to 'returned'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The shipment with the updated status.
 */
ripe.Ripe.prototype.returnShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.returnShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Sets the shipment status to 'canceled'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.cancelShipment = function(number, options, callback) {
    return this.setShipmentStatus(number, "cancel", options, callback);
};

/**
 * Sets the shipment status to 'canceled'.
 *
 * @param {Number} number The number of the shipment to update.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The shipment with the updated status.
 */
ripe.Ripe.prototype.cancelShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.cancelShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns all the attachments of a shipment.
 *
 * @param {Number} number The number of the shipment to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.attachmentsShipment = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/attachments`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns all the attachments of a shipment.
 *
 * @param {Number} number The number of the shipment to find by.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} An object containing all the attachments of a shipment.
 */
ripe.Ripe.prototype.attachmentsShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.attachmentsShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Adds an attachment to a shipment.
 *
 * @param {Number} number The number of the shipment where the attachment will be added.
 * @param {Object} file The attachment file to be added to the shipment.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createAttachmentShipment = function(number, file, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/attachments`;
    const dataM = { file: file };
    if (options.name !== undefined) dataM.name = options.name;
    if (options.meta !== undefined) dataM.meta = JSON.stringify(options.meta);
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
 * Adds an attachment to a shipment.
 *
 * @param {Number} number The number of the shipment where the attachment will be added.
 * @param {Object} file The attachment file to be added to the shipment.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The attachment added to the shipment.
 */
ripe.Ripe.prototype.createAttachmentShipmentP = function(number, file, options) {
    return new Promise((resolve, reject) => {
        this.createAttachmentShipment(number, file, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the attachment of a shipment requested by ID.
 *
 * @param {Number} number The number of the shipment to find by.
 * @param {Number} attachmentId The ID of the attachment of the shipment to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.attachmentShipment = function(number, attachmentId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/attachments/${attachmentId}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        cached: false
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the attachment of a shipment requested by ID.
 *
 * @param {Number} number The number of the shipment to find by.
 * @param {Number} attachmentId The ID of the attachment of the shipment to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The attachment file of an shipment requested by ID.
 */
ripe.Ripe.prototype.attachmentShipmentP = function(number, attachmentId, options) {
    return new Promise((resolve, reject) => {
        this.attachmentShipment(number, attachmentId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a note with the provided text and associates it
 * with the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to associate a note.
 * @param {String} text The note text, containing the context of the note.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createNoteShipment = function(number, text, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/notes`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true
    });
    options.params = options.params || {};
    options.params.text = text;
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a note with the provided text and associates it
 * with the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to associate a note.
 * @param {String} text The note text, containing the context of the note.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The contents of the note instance that was created.
 */
ripe.Ripe.prototype.createNoteShipmentP = function(number, text, options) {
    return new Promise((resolve, reject) => {
        this.createNoteShipment(number, text, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a shipment issue with the provided description, error log and severity
 * and associates it with the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to associate an issue.
 * @param {String} issue The issue name, containing the context of issue.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createIssueShipment = function(number, issue, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/issues`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true
    });
    options.params = options.params || {};
    options.params.issue = issue;
    if (options.description !== undefined) options.params.description = options.description;
    if (options.severity !== undefined) options.params.severity = options.severity;
    if (options.log !== undefined) options.params.log = options.log;
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a shipment issue with the provided description, error log and severity
 * and associates it with the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to associate an issue.
 * @param {String} issue The issue name, containing the context of issue.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The contents of the issue instance that was created.
 */
ripe.Ripe.prototype.createIssueShipmentP = function(number, issue, options) {
    return new Promise((resolve, reject) => {
        this.createIssueShipment(number, issue, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates mandatory shipping documents for the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to create the documents for.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createDocumentsShipment = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/documents`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates mandatory shipping documents for the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to create the documents for.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The contents of the note instance that was created.
 */
ripe.Ripe.prototype.createDocumentsShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.createDocumentsShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a shipping waybill for the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to create the waybill for.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createWaybillShipment = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/waybill`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a shipping waybill for the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to create the waybill for.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The contents of the note instance that was created.
 */
ripe.Ripe.prototype.createWaybillShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.createWaybillShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates an invoice for the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to create the invoice for.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createInvoiceShipment = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/invoice`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates an invoice for the shipment with the provided number.
 *
 * @param {Number} number The number of the shipment to create the invoice for.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The contents of the note instance that was created.
 */
ripe.Ripe.prototype.createInvoiceShipmentP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.createInvoiceShipment(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype.setShipmentStatus = function(number, status, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}/${status}`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "PUT"
    });
    options.params = options.params || {};
    if (options.justification !== undefined) options.params.justification = options.justification;
    if (options.strict !== undefined) options.params.strict = options.strict;
    if (options.notify !== undefined) options.params.notify = options.notify ? "1" : "0";
    if (options.transitions !== undefined) options.params.transitions = options.transitions;
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};
