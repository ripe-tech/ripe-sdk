if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.locale = function(value, locale, options, callback) {
    return this.localeMultiple(value, locale, options, callback);
};

ripe.Ripe.prototype.localeMultiple = function(values, locale, options, callback) {
    values = typeof values === "string" ? [values] : values;
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "locale";
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            values: values,
            locale: locale
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};
