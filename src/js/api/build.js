if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.getLocaleModel = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    options = this._getLocaleModelOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.getLocaleModelP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLocaleModel(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new Error());
        });
    });
};

ripe.Ripe.prototype._getLocaleModelOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const locale =
        options.locale !== undefined && options.locale !== null ? options.locale : this.locale;
    const url = this.url + "builds/" + brand + "/locale/" + locale;
    const params = {};
    if (model !== undefined && model !== null) {
        params.model = model;
    }
    if (options.compatibility !== undefined && options.compatibility !== null) {
        params.compatibility = options.compatibility ? "1" : "0";
    }
    if (options.prefix !== undefined && options.prefix !== null) {
        params.prefix = options.prefix;
    }
    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};
