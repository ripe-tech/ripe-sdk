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
 * Creates a SKU on RIPE Core.
 *
 * @param {Number} identifier The SKU identifier.
 * @param {Object} domain The SKU's domain, within the SKU is going to be defined.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'version' - The version of the build.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createSku = function(identifier, domain, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}skus`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: {
            identifier: identifier,
            domain: domain,
            spec: Object.assign({}, options)
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates a SKU on RIPE Core.
 *
 * @param {Number} identifier The SKU identifier.
 * @param {Object} domain The SKU's domain, within the SKU is going to be defined.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
 *  - 'version' - The version of the build.
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 * @returns {Promise} The SKU's data.
 */
ripe.Ripe.prototype.createSkuP = function(identifier, domain, options) {
    return new Promise((resolve, reject) => {
        this.createSku(identifier, domain, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
