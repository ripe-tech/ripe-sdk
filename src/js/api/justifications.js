if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" || typeof __webpack_require__ !== "undefined") // eslint-disable-line camelcase
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Provides a list of all the available justifications. Optionally filtered by a set of options.
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
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getJustifications = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "justifications";
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the justifications list of all the available justifications. Optionally filtered by a set of options.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The orders result list.
 */
ripe.Ripe.prototype.getJustificationsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getJustifications(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Provides a list of all the available justifications filtered by context.
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
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getJustificationsByContext = function(context, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "justifications/" + context;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the justifications list of all the available justifications filtered by context.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The orders result list.
 */
ripe.Ripe.prototype.getJustificationsByContextP = function(context, options) {
    return new Promise((resolve, reject) => {
        this.getJustificationsByContext(context, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
