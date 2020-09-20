if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Gets the existing country groups, according to the provided filtering
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
ripe.Ripe.prototype.getCountryGroups = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}country_groups`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing country groups, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The country group result list.
 */
ripe.Ripe.prototype.getCountryGroupsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getCountryGroups(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets a country group by its id.
 *
 * @param {Object} id Id of the intended country group.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getCountryGroup = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}country_groups/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets a country group by its id.
 *
 * @param {Object} id Id of the intended country group.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The country group result list.
 */
ripe.Ripe.prototype.getCountryGroupP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getCountryGroup(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates a new country group.
 *
 * @param {Object} countryGroup An object with information needed to create a country group ex: {name: "Europe 1", currency: "EUR", countries: ["Portugal, Spain, France"]}.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createCountryGroup = function(countryGroup, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}country_groups`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "POST",
        dataJ: countryGroup
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a new country group.
 *
 * @param {Object} countryGroup An object with information needed to create a country group ex: {name: "Europe 1", currency: "EUR", countries: ["Portugal, Spain, France"]}.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The country group result list.
 */
ripe.Ripe.prototype.createCountryGroupP = function(countryGroup, options) {
    return new Promise((resolve, reject) => {
        this.createCountryGroup(countryGroup, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates an existing country group.
 *
 * @param {Object} id Id of the country group to be updated.
 * @param {Object} countryGroup An object with the updated information of the country group.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.updateCountryGroup = function(id, countryGroup, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}country_groups/${id}`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "PUT",
        dataJ: countryGroup
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates an existing country group.
 *
 * @param {Object} id Id of the country group to be updated.
 * @param {Object} countryGroup An object with the updated information of the country group.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The country group result list.
 */
ripe.Ripe.prototype.updateCountryGroupP = function(id, countryGroup, options) {
    return new Promise((resolve, reject) => {
        this.updateCountryGroup(id, countryGroup, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing country group.
 *
 * @param {Object} id Id of the country group to be deleted.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteCountryGroup = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}country_groups/${id}`;
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "DELETE"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes an existing country group.
 *
 * @param {Object} id Id of the country group to be deleted.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The country group result list.
 */
ripe.Ripe.prototype.deleteCountryGroupP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteCountryGroup(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
