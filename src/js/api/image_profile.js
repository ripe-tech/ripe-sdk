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
 * Gets the image profiles list, optionally filtered by a set of options.
 *
 * @param {Object} options An object of options to configure the query
//  * @TODO check if this filters do work
//  * @param {Object} options An object of options to configure the query and
//  * its results, such as:
//  * - 'filters[]' - List of filters that the query will use to, operators such as
//  * ('in', 'not_in', 'like', 'likei', 'llike', 'llikei', 'rlike', 'rlikei', 'contains'),
//  * (eg: 'number:eq:42') would filter by the 'number' that equals to '42'.
//  * - 'sort' - List of arguments to sort the results by and which direction
//  * to sort them in (eg: 'id:ascending') would sort by the id attribute in ascending order,
//  * while (eg: 'id:descending')] would do it in descending order.
//  * - 'skip' - The number of the first record to retrieve from the results.
//  * - 'limit' - The number of results to retrieve.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */

ripe.Ripe.prototype.getImageProfiles = function(options, callback) {
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

ripe.Ripe.prototype.getImageProfilesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getImageProfiles(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Gets an Image Profile by number.
 *
 * @param {Number} number The number of the image profile to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getImageProfile = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}profiles/${number}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an Image Profile by number.
 *
 * @param {Number} number The number of the image profile to find by.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The image profile requested by number.
 */
ripe.Ripe.prototype.getImageProfileP = function(number, options) {
    return new Promise((resolve, reject) => {
        this.getImageProfile(number, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Creates a Image Profile on RIPE Core.
 *
 * @param {Object} imageProfile The Image Profile object
 * @param {Object} options An object with options
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createImageProfile = function(imageProfile, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}profiles`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: imageProfile
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a Image Profile on RIPE Core.
 *
 * @param {Object} imageProfile The Image Profile object
 * @param {Object} options An object with options
 * @returns {Promise} The image profile data.
 */
ripe.Ripe.prototype.createImageProfileP = function(imageProfile, options) {
    return new Promise((resolve, reject) => {
        this.createImageProfile(imageProfile, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Updates a Image Profile on RIPE Core.
 *
 * @param {Object} imageProfile The Image Profile object
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.updateImageProfile = function(imageProfile, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}profiles/${imageProfile.id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: imageProfile
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a Image Profile on RIPE Core.
 *
 * @param {Object} imageProfile The Image Profile object
 * @param {Object} options An object with options
 * @returns {Promise} The image profile data.
 */
ripe.Ripe.prototype.updateImageProfileP = function(imageProfile, options) {
    return new Promise((resolve, reject) => {
        this.updateImageProfile(imageProfile, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Delete a Image Profile on RIPE Core.
 * @TODO validate this method to delete a image profile
 * @param {Object} imageProfile The Image Profile object
 * @param {Object} options An object with options
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.deleteImageProfile = function(imageProfile, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}profiles/${imageProfile.id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes a Image Profile on RIPE Core.
 *
 * @param {Object} imageProfile The Image Profile object
 * @param {Object} options An object with options
 * @returns {Promise} The image profile data.
 */
ripe.Ripe.prototype.deleteImageProfileP = function(imageProfile, options) {
    return new Promise((resolve, reject) => {
        this.deleteImageProfile(imageProfile, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
