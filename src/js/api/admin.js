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
 * Retrieves the build information by brand name and version.
 *
 * @param {String} name The name of the brand of the build.
 * @param {Number} version The number of the version of the build.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBuildAdmin = function(name, version, options, callback) {
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
 * Retrieves the build information by brand name and version.
 *
 * @param {String} name The name of the brand of the build.
 * @param {Number} version The number of the version of the build.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build result (as a promise).
 */
ripe.Ripe.prototype.getBuildAdminP = function(name, version, options) {
    return new Promise((resolve, reject) => {
        this.getBuild(name, version, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
