if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.getConfig = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    options = this._getConfigOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.getConfigP = function(options) {
    return new Promise((resolve, reject) => {
        this.getConfig(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new Error());
        });
    });
};

ripe.Ripe.prototype.getDefaults = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    options = this._getDefaultsOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result, isValid, request) {
        callback && callback(isValid ? result.parts : result, isValid, request);
    });
};

ripe.Ripe.prototype.getOptionals = function(options, callback) {
    return this.getDefaults(options, function(defaults, isValid, request) {
        const optionals = [];
        for (const name in defaults) {
            const part = defaults[name];
            part.optional && optionals.push(name);
        }
        callback && callback(optionals, isValid, request);
    });
};

ripe.Ripe.prototype.getCombinations = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    options = this._getCombinationsOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result, isValid, request) {
        callback && callback(isValid ? result.combinations : result, isValid, request);
    });
};

ripe.Ripe.prototype.getCombinationsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getCombinations(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new Error());
        });
    });
};

ripe.Ripe.prototype.getFactory = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    options = this._getFactoryOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype._getConfigOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const country = options.country === undefined ? this.country : options.country;
    const flag = options.flag === undefined ? this.flag : options.flag;
    const url = this.url + "brands/" + brand + "/models/" + model + "/config";
    const params = {};
    if (country !== undefined && country !== null) {
        params.country = country;
    }
    if (flag !== undefined && flag !== null) {
        params.flag = flag;
    }
    if (options.filter !== undefined && options.filter !== null) {
        params.filter = options.filter ? "1" : "0";
    }
    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};

ripe.Ripe.prototype._getDefaultsOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const url = this.url + "brands/" + brand + "/models/" + model + "/defaults";
    return Object.assign(options, {
        url: url,
        method: "GET"
    });
};

ripe.Ripe.prototype._getCombinationsOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const useName =
        options.useName !== undefined && options.useName !== null ? options.useName : false;
    const country = options.country === undefined ? this.country : options.country;
    const flag = options.flag === undefined ? this.flag : options.flag;
    const url = this.url + "brands/" + brand + "/models/" + model + "/combinations";
    const params = {};
    if (useName !== undefined && useName !== null) {
        params.use_name = useName ? "1" : "0";
    }
    if (country !== undefined && country !== null) {
        params.country = country;
    }
    if (flag !== undefined && flag !== null) {
        params.flag = flag;
    }
    if (options.resolve !== undefined && options.resolve !== null) {
        params.resolve = options.resolve ? "1" : "0";
    }
    if (options.sort !== undefined && options.sort !== null) {
        params.sort = options.sort ? "1" : "0";
    }
    if (options.filter !== undefined && options.filter !== null) {
        params.filter = options.filter ? "1" : "0";
    }
    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};

ripe.Ripe.prototype._getFactoryOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const url = this.url + "brands/" + brand + "/models/" + model + "/factory";
    return Object.assign(options, {
        url: url,
        method: "GET"
    });
};
