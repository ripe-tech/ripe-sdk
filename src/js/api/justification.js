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

/**
 * Gets the existing justifications, according to the provided filtering
 * strategy as normalized values.
 *
 * Attempts to resolve context, code and full code and adds those
 * parameters to the filters provided.
 *
 * If the 'other' keyword is contained in the provided `codeFull`, it means
 * that no RIPE Core justification was used and the custom text provided is
 * the text that is returned.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @param {String} other The 'other' prefix code.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype._getJustifications = function(options, callback, other = "other;") {
    // resolve context, code and full code based on available
    // information, using smarter filters
    const params = this._resolveJustificationParams(options);

    // exits if the 'other' context is used which works
    // as an escape hatch and does not need to be looked up
    if (params.codeFull && params.codeFull.includes(other)) {
        const index = params.codeFull.indexOf(other);
        const justification = {
            context: "other",
            code_full: params.codeFull,
            text: params.codeFull.slice(index + other.length)
        };
        return callback([justification], true, null);
    }

    // builds the appropriate filters for context, code
    // and full code, used to fetch the justification
    options.params = options.params !== undefined ? options.params : {};
    options.params.filters = options.params.filters !== undefined ? options.params.filters : [];
    if (params.context) options.params.filters.push(`context:likei:${params.context}`);
    if (params.code) options.params.filters.push(`code:likei:${params.code}`);
    if (params.codeFull) options.params.filters.push(`code_full:likei:${params.codeFull}`);

    return this._cacheURL(options.url, options, callback);
};

/**
 * Attempts to resolve context, code and full code based on what is given.
 * A full code is equivalent to 'context:code'.
 *
 * @param {Object} options An object of options that may include context, code or a full code.
 * @returns {Object} The params to be added as filters like context, code and full code.
 */
ripe.Ripe.prototype._resolveJustificationParams = function(options) {
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
