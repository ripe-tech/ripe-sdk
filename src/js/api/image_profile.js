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
 * Gets the image profiles list
 *
 * @param {Object} options An object of options to configure the request
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

/**
 * Gets an Image Profile list.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The image profile list.
 */
ripe.Ripe.prototype.getImageProfilesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getImageProfiles(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Gets an Image Profile by name.
 *
 * @param {String} name The name of the image profile to find by.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getImageProfile = function(name, options, callback) {
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
 * Gets an Image Profile by name.
 *
 * @param {String} name The name of the image profile to find by.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The image profile requested by number.
 */
ripe.Ripe.prototype.getImageProfileP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.getImageProfile(name, options, (result, isValid, request) => {
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
    const url = `${this.url}profiles/${imageProfile.name}`;
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
 * @param {Object} imageProfile The Image Profile object
 * @param {Object} options An object with options
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.deleteImageProfile = function(imageProfile, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}profiles/${imageProfile.name}`;
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
