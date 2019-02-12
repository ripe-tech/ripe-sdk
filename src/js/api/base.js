if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.resolveProductId = function(productId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    const url = this.url + "config/resolve/" + productId;
    options = { url: url, ...options };
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.resolveProductIdP = function(options) {
    return new Promise((resolve, reject) => {
        this.resolveProductId(options, (result, isValid, request) => {
            isValid ? resolve({ result: result, request: request }) : reject(new Error());
        });
    });
};
