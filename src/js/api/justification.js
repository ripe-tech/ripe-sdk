const base = require("../base");
const ripe = base.ripe;

/**
 * Gets the existing justifications, according to the provided filtering
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
ripe.Ripe.prototype.getJustifications = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}justifications`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing justifications, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The justifications result list.
 */
ripe.Ripe.prototype.getJustificationsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getJustifications(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets the matching justification based on context and code or on
 * a full code, if it exists.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.resolveJustification = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}justifications/resolve`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the matching justification based on context and code or on
 * a full code, if it exists.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The justification that better matches the provided parameters.
 */
ripe.Ripe.prototype.resolveJustificationP = function(options) {
    return new Promise((resolve, reject) => {
        this.resolveJustification(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets the existing justifications filtered by context, according to the
 * provided filtering strategy as normalized values.
 *
 * @param {String} context The justification context to filter for.
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
ripe.Ripe.prototype.getJustificationsByContext = function(context, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}justifications/${context}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing justifications filtered by context, according to the
 * provided filtering strategy as normalized values.
 *
 * @param {String} context The justification context to filter for.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'filters[]' - List of filters that the query will use to, operators such as
 * ('in', 'not_in', 'like', 'contains'), for instance (eg: 'id:eq:42') would filter by the id that equals to 42.
 * - 'sort' - List of arguments to sort the results by and which direction
 * to sort them in (eg: 'id:ascending') would sort by the id attribute in ascending order,
 * while (eg: 'id:descending')] would do it in descending order.
 * - 'skip' - The number of the first record to retrieve from the results.
 * - 'limit' - The number of results to retrieve.
 * @returns {Promise} The justifications result list.
 */
ripe.Ripe.prototype.getJustificationsByContextP = function(context, options) {
    return new Promise((resolve, reject) => {
        this.getJustificationsByContext(context, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
