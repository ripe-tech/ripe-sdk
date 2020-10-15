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
 * Creates a notify info (if required) for the current user, and adds
 * the provided device id to the list of device ids in the notify info.
 *
 * @param {String} deviceId The device identifier as a plain string
 * to be used in registration.
 * @returns {XMLHttpRequest} The current user's notify info instance.
 */
ripe.Ripe.prototype.createDeviceId = function(deviceId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}notify_infos/device_ids`;
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
 * Creates a notify info (if required) for the current user, and adds
 * the provided device id to the list of device ids in the notify info.
 *
 * @param {String} deviceId The device identifier as a plain string
 * to be used in registration.
 * @returns {Promise} The current user's notify info instance.
 */
ripe.Ripe.prototype.createDeviceIdP = function(deviceId, options) {
    return new Promise((resolve, reject) => {
        this.createDeviceId(deviceId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Removes a device id from the the notify info instance associated
 * with the user in session.
 *
 * @param {String} deviceId The device identifier to be removed.
 * @returns {XMLHttpRequest} The current user's notify info instance.
 */
ripe.Ripe.prototype.removeDeviceId = function(deviceId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}notify_infos/device_ids/${deviceId}`;
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
 * Removes a device id from the the notify info instance associated
 * with the user in session.
 *
 * @param {String} deviceId The device identifier to be removed.
 * @returns {Promise} The current user's notify info instance.
 */
ripe.Ripe.prototype.removeDeviceIdP = function(deviceId, options) {
    return new Promise((resolve, reject) => {
        this.removeDeviceId(deviceId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
