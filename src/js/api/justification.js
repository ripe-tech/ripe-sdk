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
    return this._getJustifications(options, callback);
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

ripe.Ripe.prototype._getJustifications = function(options, callback, other = "other;") {
    // resolve context, code and full code based on available
    // information, using smarter filters
    const filters = this._resolveJustificationFilters(options);

    // exits if the 'other' context is used which works
    // as an escape hatch and does not need to be looked up
    if (filters.codeFull && filters.codeFull.includes(other)) {
        const index = filters.codeFull.indexOf(other);
        return {
            context: "other",
            code_full: filters.codeFull,
            text: filters.codeFull.slice(index + other.length)
        };
    }

    // builds the appropriate filters for context, code
    // and full code, used to fetch the justification
    options.params = options.params !== undefined ? options.params : {};
    options.params.filters = options.params.filters !== undefined ? options.params.filters : [];
    if (filters.context) options.params.filters.push(`context:likei:${filters.context}`);
    if (filters.code) options.params.filters.push(`code:likei:${filters.code}`);
    if (filters.codeFull) options.params.filters.push(`code_full:likei:${filters.codeFull}`);

    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype._resolveJustificationFilters = function(options) {
    const params = {};
    if (options.codeFull) {
        const [context, code] = options.codeFull.split(":");
        params.codeFull = options.codeFull;
        params.context = context;
        params.code = code;
    } else if (options.context && options.code) {
        const codeFull = `${options.context}:${options.code}`;
        params.codeFull = codeFull;
        params.context = options.context;
        params.code = options.code;
    }
    return params;
};
