if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.getLocale = function(values, locale, options, callback) {
    values = typeof options === "string" ? [values] : values;
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "locale";
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            values: values,
            locale: locale
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};
