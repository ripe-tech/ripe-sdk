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
 * Retrieve the list of profiles according to the provided options.
 *
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getProfiles = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}profiles`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieve the list of profiles according to the provided options.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The sequence of profiles for the options.
 */
ripe.Ripe.prototype.getProfilesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getProfiles(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves a profile using the name of it as filter reference.
 *
 * @param {String} name The name of the profile to be retrieved.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getProfile = function(name, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}profiles/${name}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves a profile using the name of it as filter reference.
 *
 * @param {String} name The name of the profile to be retrieved.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The profile requested by name.
 */
ripe.Ripe.prototype.getProfileP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.getProfile(name, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
