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
 * Retrieves the build artifact information by brand name and version.
 *
 * @param {String} name The name of the brand of the build artifact.
 * @param {Number} version The number of the version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBuildArtifactAdmin = function(name, version, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.webUrl}admin/builds/${name}/artifacts/${version}`;
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
ripe.Ripe.prototype.getBuildArtifactAdminP = function(name, version, options) {
    return new Promise((resolve, reject) => {
        this.getBuild(name, version, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
