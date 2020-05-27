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
 * Creates a device for the current user
 *
 * @param {String} deviceId The device identifier
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createDeviceId = function(deviceId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "notify_infos/device_ids";
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "POST",
        dataJ: { id: deviceId }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a device for the current user
 *
 * @param {String} deviceId The device identifier
 * @returns {Promise} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.createDeviceIdP = function(deviceId, options) {
    return new Promise((resolve, reject) => {
        this.createDeviceId(deviceId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Removes a device from the current user
 *
 * @param {String} deviceId The device identifier
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.removeDeviceId = function(deviceId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "notify_infos/device_ids/" + deviceId;
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
 * Removes a device from the current user
 *
 * @param {String} deviceId The device identifier
 * @returns {Promise} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.removeDeviceIdP = function(deviceId, options) {
    return new Promise((resolve, reject) => {
        this.createDeviceId(deviceId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
