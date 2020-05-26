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
 * Adds a device identifier to the current user deivce list
 *
 * @param {String} deviceId The device identifier
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.registerDevice = function(deviceId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "notify_info";
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "PUT",
        dataJ: { device_id: deviceId }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Adds a device identifier to the current user deivce list
 *
 * @param {String} deviceId The device identifier
 * @returns {Promise} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.registerDeviceP = function(deviceId, options) {
    return new Promise((resolve, reject) => {
        this.registerDevice(deviceId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Removes a device identifier from current user deivce list
 *
 * @param {String} deviceId The device identifier
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.unregisterDevice = function(deviceId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "notify_info";
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "DELETE",
        dataJ: { device_id: deviceId }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Adds a device identifier to the current user deivce list
 *
 * @param {String} deviceId The device identifier
 * @returns {Promise} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.unregisterDeviceP = function(deviceId, options) {
    return new Promise((resolve, reject) => {
        this.registerDevice(deviceId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
