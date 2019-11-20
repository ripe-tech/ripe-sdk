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
 */
ripe.Ripe.prototype.getJustifications = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    //  TODO use delete testing url
    //  const url = this.url + "justifications";
    const url = "http://localhost:8000/api/justifications";
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
 *
 * returns promise
 */
ripe.Ripe.prototype.getJustificationsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getJustifications(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/** TODO getjustification by context */
