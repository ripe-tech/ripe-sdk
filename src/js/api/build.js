if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (navigator !== undefined && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Gets the existing builds
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
ripe.Ripe.prototype.getBuilds = function(callback) {
    const url = this.url + "builds";
    const options = this._build({
        url: url,
        method: "GET",
        auth: true
    });
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing builds, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The orders result list.
 */
ripe.Ripe.prototype.getBuildsP = function() {
    return new Promise((resolve, reject) => {
        this.getBuilds((result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Retrieves the build artifact information by brand name and version.
 *
 * @param {String} name The name of the brand of the build artifact.
 * @param {Number} version The number of the version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBuildArtifact = function(name, version, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds/${name}/artifacts/${version}`;
    options = {
        url: url,
        method: "GET",
        auth: true
    };
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the build artifact information by brand name and version.
 *
 * @param {String} name The name of the brand of the build artifact.
 * @param {Number} version The number of the version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build result (as a promise).
 */
ripe.Ripe.prototype.getBuildArtifactP = function(name, version, options) {
    return new Promise((resolve, reject) => {
        this.getBuildArtifact(name, version, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Retrieves the bundle of part, materials and colors translations of a specific brand and model
 * If no model is defined the retrieves the bundle of the owner's current model.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'brand' - The brand of the model.
 * - 'model' - The name of the model.
 * - 'locale' - The locale of the translations.
 * - 'compatibility' - If compatibility mode should be enabled.
 * - 'prefix' - A prefix to prepend to the locale keys (defaults to 'builds').
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getLocaleModel = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getLocaleModelOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the bundle of part, materials and colors translations of a specific brand and model
 * If no model is defined the retrieves the bundle of the owner's current model.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'brand' - The brand of the model.
 * - 'model' - The name of the model.
 * - 'locale' - The locale of the translations.
 * - 'compatibility' - If compatibility mode should be enabled.
 * - 'prefix' - A prefix to prepend to the locale keys (defaults to 'builds').
 * @returns {Promise} The resolved locale data.
 */
ripe.Ripe.prototype.getLocaleModelP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLocaleModel(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#build-endpoints-locale}
 */
ripe.Ripe.prototype._getLocaleModelOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const locale =
        options.locale === undefined || options.locale === null ? this.locale : options.locale;
    const url = this.url + "builds/" + brand + "/locale/" + locale;
    const params = {};
    if (model !== undefined && model !== null) {
        params.model = model;
    }
    if (options.compatibility !== undefined && options.compatibility !== null) {
        params.compatibility = options.compatibility ? "1" : "0";
    }
    if (options.prefix !== undefined && options.prefix !== null) {
        params.prefix = options.prefix;
    }
    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};
