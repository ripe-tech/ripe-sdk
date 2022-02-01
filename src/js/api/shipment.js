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
 * Gets an shipment by number.
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
 * @param {Object} options An object with options, such as:
 *  - 'status' - The shipment status.
 *  - 'orders' - A list of RIPE Core order number.
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
 *    - 'offset' - Time offset for pickup scheduling relative to shipment creation (millis).
 *    - 'ready_time' - Opening hours for shipper facility (millis).
 *    - 'close_time' - Closing hours for shipper facility (millis).
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
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createShipment = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: options,
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a shipment on RIPE Core.
 *
 * @param {Object} options An object with options, such as:
 *  - 'status' - The shipment status.
 *  - 'orders' - A list of RIPE Core order number.
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
 *    - 'offset' - Time offset for pickup scheduling relative to shipment creation (millis).
 *    - 'ready_time' - Opening hours for shipper facility (millis).
 *    - 'close_time' - Closing hours for shipper facility (millis).
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
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 * @returns {Promise} The shipment's data.
 */
ripe.Ripe.prototype.createShipmentP = function(options, callback) {
    return new Promise((resolve, reject) => {
        this.createShipment(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a shipment on Ripe Core.
 *
 * @param {Number} number The number of the shipment to find by.
 * @param {Object} options An object with options, such as:
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
 *    - 'offset' - Time offset for pickup scheduling relative to shipment creation (millis).
 *    - 'ready_time' - Opening hours for shipper facility (millis).
 *    - 'close_time' - Closing hours for shipper facility (millis).
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
 *  - 'orders' - A list of RIPE Core order IDs.
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.updateShipment = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${number}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        params: options,
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a shipment on Ripe Core.
 *
 * @param {Number} number The number of the shipment to find by.
 * @param {Object} options An object with options, such as:
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
 *    - 'offset' - Time offset for pickup scheduling relative to shipment creation (millis).
 *    - 'ready_time' - Opening hours for shipper facility (millis).
 *    - 'close_time' - Closing hours for shipper facility (millis).
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
 *  - 'orders' - A list of RIPE Core order IDs.
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 * @returns {Promise} The shipment's data.
 */
ripe.Ripe.prototype.updateShipmentP = function(number, options, callback) {
    return new Promise((resolve, reject) => {
        this.updateShipment(number, options, (result, isValid, request) => {
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
ripe.Ripe.prototype.deleteShipment = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}shipments/${id}`;
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
ripe.Ripe.prototype.deleteShipmentP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteShipment(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
