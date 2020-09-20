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
 * Provides a list of all the available size scales.
 * To be used to know what scales are available for size conversions.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getSizes = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}sizes`;
    options = Object.assign(options, {
        url: url,
        method: "GET"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.getSizesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getSizes(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Converts a size value from the native scale to the corresponding value
 * in the specified scale.
 * The available scales, genders and sizes can be obtained with the getSizes.
 *
 * @param {String} scale The scale which one wants to convert to.
 * @param {Number} value The value which one wants to convert.
 * @param {String} gender The gender of the scale and value to be converted.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.sizeToNative = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}sizes/size_to_native`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scale: scale,
            value: value,
            gender: gender
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.sizeToNativeP = function(scale, value, gender, options) {
    return new Promise((resolve, reject) => {
        this.sizeToNative(scale, value, gender, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Converts multiple size values from the native scale to the corresponding
 * values in the specified scales.
 * The available scales, genders and sizes can be obtained with the method getSizes.
 *
 * @param {Array} scales A list of scales to convert to.
 * @param {Array} values A list of values to convert.
 * @param {Array} genders A list of genders corresponding to the values.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.sizeToNativeB = function(scales, values, genders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const scalesP = [];
    const valuesP = [];
    const gendersP = [];
    for (let index = 0; index < scales.length; index++) {
        scalesP.push(scales[index]);
        valuesP.push(values[index]);
        gendersP.push(genders[index]);
    }
    const url = `${this.url}sizes/size_to_native_b`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scales: scalesP,
            values: valuesP,
            genders: gendersP
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.sizeToNativeBP = function(scales, values, genders, options) {
    return new Promise((resolve, reject) => {
        this.sizeToNativeB(scales, values, genders, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Converts a size value in the specified scale to the corresponding native size.
 * The available scales, genders and sizes can be obtained with the method getSizes.
 *
 * @param {String} scale The scale which one wants to convert from.
 * @param {Number} value The value which one wants to convert.
 * @param {String} gender The gender of the scale and value to be converted.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.nativeToSize = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}sizes/native_to_size`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scale: scale,
            value: value,
            gender: gender
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.nativeToSizeP = function(scale, value, gender, options) {
    return new Promise((resolve, reject) => {
        this.nativeToSize(scale, value, gender, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Converts multiple size values to the corresponding native size.
 * The available scales, genders and sizes can be obtained with the method getSizes.
 *
 * @param {Array} scales A list of scales to convert from.
 * @param {Array} values A list of values to convert.
 * @param {Array} genders A list of genders corresponding to the values.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.nativeToSizeB = function(scales, values, genders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const scalesP = [];
    const valuesP = [];
    const gendersP = [];
    for (let index = 0; index < scales.length; index++) {
        scalesP.push(scales[index]);
        valuesP.push(values[index]);
        gendersP.push(genders[index]);
    }
    const url = `${this.url}sizes/native_to_size_b`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scales: scalesP,
            values: valuesP,
            genders: gendersP
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.nativeToSizeBP = function(scales, values, genders, options) {
    return new Promise((resolve, reject) => {
        this.nativeToSizeB(scales, values, genders, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Converts a size value in the specified scale to the corresponding localized size.
 * The available scales, genders and sizes can be obtained with the method getSizes.
 *
 * @param {String} scale The scale which one wants to convert from.
 * @param {Number} value The value which one wants to convert.
 * @param {String} gender The gender of the scale and value to be converted.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.sizeToLocale = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}sizes/size_to_locale`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scale: scale,
            value: value,
            gender: gender
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.sizeToLocaleP = function(scale, value, gender, options) {
    return new Promise((resolve, reject) => {
        this.sizeToLocale(scale, value, gender, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Converts multiple size values to the corresponding localized size.
 * The available scales, genders and sizes can be obtained with the method getSizes.
 *
 * @param {Array} scales A list of scales to convert from.
 * @param {Array} values A list of values to convert.
 * @param {Array} genders A list of genders corresponding to the values.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.sizeToLocaleB = function(scales, values, genders, options, callback) {
    scales = typeof scales === "string" ? [scales] : scales;
    values = typeof values === "string" ? [values] : values;
    genders = typeof genders === "string" ? [genders] : genders;
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}sizes/size_to_locale_b`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scales: scales,
            values: values,
            genders: genders
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.sizeToLocaleBP = function(scales, values, genders, options) {
    return new Promise((resolve, reject) => {
        this.sizeToLocaleB(scales, values, genders, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Converts a native size value in the specified scale to the corresponding localized size.
 * The available scales, genders and sizes can be obtained with the method getSizes.
 *
 * @param {String} scale The scale which one wants to convert from.
 * @param {Number} value The value which one wants to convert.
 * @param {String} gender The gender of the scale and value to be converted.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.nativeToLocale = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}sizes/native_to_locale`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scale: scale,
            value: value,
            gender: gender
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.nativeToLocaleP = function(scale, value, gender, options) {
    return new Promise((resolve, reject) => {
        this.nativeToLocale(scale, value, gender, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Converts multiple native size values to the corresponding localized size.
 * The available scales, genders and sizes can be obtained with the method getSizes.
 *
 * @param {Array} scales A list of scales to convert from.
 * @param {Array} values A list of values to convert.
 * @param {Array} genders A list of genders corresponding to the values.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.nativeToLocaleB = function(scales, values, genders, options, callback) {
    scales = typeof scales === "string" ? [scales] : scales;
    values = typeof values === "string" ? [values] : values;
    genders = typeof genders === "string" ? [genders] : genders;
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}sizes/native_to_locale_b`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scales: scales,
            values: values,
            genders: genders
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.nativeToLocaleBP = function(scales, values, genders, options) {
    return new Promise((resolve, reject) => {
        this.nativeToLocaleB(scales, values, genders, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
