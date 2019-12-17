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
 * Creates a SKU on RIPE Core.
 *
 * @param {Number} identifier The SKU identifier.
 * @param {Object} domain The SKU's domain, within the SKU is going to be defined.
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'variant' - The variant of the model.
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
    options = this._createSku(identifier, domain, options);
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
 *  - 'parts' - The parts of the customized model.
 *  - 'initials' - The value for the initials of the personalized model.
 *  - 'engraving' - The value for the engraving value of the personalized model.
 *  - 'initialsExtra' - The value for the initials extra of the personalized model.
 * @returns {Promise} The SKU's data.
 */
ripe.Ripe.prototype.createSkuP = function(identifier, domain, options) {
    return new Promise((resolve, reject) => {
        this.createSku(identifier, domain, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

ripe.Ripe.prototype._createSku = function(identifier, domain, options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const variant = options.variant === undefined ? this.variant : options.variant;
    const parts = options.parts === undefined ? this.parts : options.parts;
    const initials = options.initials === undefined ? this.initials : options.initials;
    const engraving = options.engraving === undefined ? this.engraving : options.engraving;
    const initialsExtra =
        options.initials_extra === undefined && options.initialsExtra === undefined
            ? this.initialsExtra
            : options.initialsExtra || options.initials_extra;

    const url = this.url + "skus";

    const spec = {
        brand: brand,
        model: model,
        variant: variant,
        parts: parts
    };

    if (Object.keys(initialsExtra).length > 0) {
        spec.initials_extra = initialsExtra;
    } else if (initials && engraving) {
        spec.initials = initials;
        spec.engraving = engraving;
    }

    const dataJ = {
        identifier: identifier,
        domain: domain,
        spec: spec
    };

    return Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: dataJ
    });
};
