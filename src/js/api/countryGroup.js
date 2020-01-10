if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" || typeof __webpack_require__ !== "undefined") // eslint-disable-line camelcase
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}
// TODO rest of endpoints???
ripe.Ripe.prototype.getCountryGroups = function(options, callback) {
    console.log("Called");
    // TODO
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}country_groups`;
    console.log(url);
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.getCountryGroupsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getCountryGroups(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

ripe.Ripe.prototype.createCountryGroup = function(options, callback) {
    // TODO
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "TODO/";
    options = Object.assign(options, {
        url: url,
        auth: true,
        method: "POST"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.createCountryGroup = function(options) {
    // TODO
    return new Promise((resolve, reject) => {
        this.createCountryGroup(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};
