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
 * Create a shipment.
 *
 * @param {Object} options An object with options, such as:
 *  - 'status' - The shipment status.
 *  - 'order_number' - The order or bulk number associated with this shipment.
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 *  - 'tracking_number' - The tracking number associated with this shipment.
 *  - 'tracking_url' - The tracking url associated with this shipment.
 *  - 'origin' - The 'ISO 3166-2' country code where the shipment begins.
 *  - 'destination' - The 'ISO 3166-2' country code where the shipment ends.
 *  - 'delivery_date' - The date the shipment began.
 *  - 'shipping_date' - The date the shipment ended.
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
 * Create a shipment.
 *
 * @param {Object} options An object with options, such as:
 *  - 'status' - The shipment status.
 *  - 'order_number' - The order or bulk number associated with this shipment.
 *  - 'attachments' - A list of RIPE Core attachment IDs.
 *  - 'tracking_number' - The tracking number associated with this shipment.
 *  - 'tracking_url' - The tracking url associated with this shipment.
 *  - 'origin' - The 'ISO 3166-2' country code where the shipment begins.
 *  - 'destination' - The 'ISO 3166-2' country code where the shipment ends.
 *  - 'delivery_date' - The date the shipment began.
 *  - 'shipping_date' - The date the shipment ended.
 * @returns {Promise} The shipment's data.
 */
ripe.Ripe.prototype.createShipmentP = function(options, callback) {
    return new Promise((resolve, reject) => {
        this.createShipment(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
