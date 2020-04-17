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
 * Retrieves the complete list of builds available from the server.
 *
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
 * Retrieves the complete list of builds available from the server.
 *
 * @returns {Promise} The builds result list (as a promise).
 */
ripe.Ripe.prototype.getBuildsP = function() {
    return new Promise((resolve, reject) => {
        this.getBuilds((result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Retrieves the build artifacts by brand name and version and for
 * the requested branch.
 *
 * @param {String} name The name of the brand of the build artifacts.
 * @param {Number} version The number of the version of the build artifacts.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBuildArtifacts = function(name, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const branch = options.branch === undefined ? "master" : options.branch;
    const url = `${this.url}builds/${name}/artifacts`;
    const params = {};
    if (branch !== undefined && branch !== null) {
        params.branch = branch;
    }
    options = {
        url: url,
        method: "GET",
        auth: true,
        params: params
    };
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the build artifacts by brand name and version and for
 * the requested branch.
 *
 * @param {String} name The name of the brand of the build artifacts.
 * @param {Number} version The number of the version of the build artifacts.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build result (as a promise).
 */
ripe.Ripe.prototype.getBuildArtifactsP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.getBuildArtifacts(name, options, (result, isValid, request) => {
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
