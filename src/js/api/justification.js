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
 * Gets the Justifications list
 * Can be filtered by context
 */
ripe.Ripe.prototype.getJustifications = function(context = null, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;

    let url = this.url + "justifications";
    if (context) url += "/" + context;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the Justifications list
 * Can be filtered by context
 * returns promise
 */
ripe.Ripe.prototype.getJustificationsP = function(context = null, options) {
    return new Promise((resolve, reject) => {
        this.getJustifications(context, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
