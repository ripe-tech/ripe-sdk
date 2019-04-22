if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Returns the configuration information of a specific brand and model.
 * If no model is provided then returns the information of the owner's current model.

 * @param {Object} options A map with options, such as:
 *  - 'brand' - the brand of the model
 *  - 'model' - the name of the model
 *  - 'country' - the country where the model will be provided, some materials/colors might not be available.
 *  - 'flag' - a specific flag that may change the provided materials/colors available.
 *  - 'filter' - if the configuration should be filtered by the country and/or flag (defaults to 'true')
 * @returns {XMLHttpRequest} The model's configuration data.
 */
ripe.Ripe.prototype.getConfig = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getConfigOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the configuration information of a specific brand and model.
 * If no model is provided then returns the information of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - the brand of the model
 *  - 'model' - the name of the model
 *  - 'country' - the country where the model will be provided, some materials/colors might not be available.
 *  - 'flag' - a specific flag that may change the provided materials/colors available.
 *  - 'filter** - if the configuration should be filtered by the country and/or flag (defaults to 'true')
 * @returns {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.getConfigP = function(options) {
    return new Promise((resolve, reject) => {
        this.getConfig(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new Error());
        });
    });
};

/**
 * Returns the default customization of a specific brand or model. If no model is provided
 * then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - the brand of the model
 *  - 'model' - the name of the model
 * @returns {XMLHttpRequest} The model's default options.
 */
ripe.Ripe.prototype.getDefaults = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getDefaultsOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result, isValid, request) {
        callback && callback(isValid ? result.parts : result, isValid, request);
    });
};

/**
 * Returns the default customization of a specific brand or model.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - the brand of the model
 *  - 'model' - the name of the model
 * @returns {Object} The model's optional parts.
 */
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

/**
 * Returns the possible customization combinations of a specific brand or model.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - the brand of the model
 *  - 'model' - the name of the model
 * @returns {XMLHttpRequest} The model's optional parts.
 */
ripe.Ripe.prototype.getCombinations = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getCombinationsOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result, isValid, request) {
        callback && callback(isValid ? result.combinations : result, isValid, request);
    });
};

/**
 * Returns the possible customization combinations of a specific brand or model.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - the brand of the model
 *  - 'model' - the name of the model
 * @returns {Promise} The model's optional parts.
 */
ripe.Ripe.prototype.getCombinationsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getCombinations(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new Error());
        });
    });
};

/**
 * Returns the factory information where a model is made,
 * specifically its name and the estimated production time in days.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - the brand of the model
 *  - 'model' - the name of the model
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getFactory = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getFactoryOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * @ignore
 */
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

/**
 * @ignore
 */
ripe.Ripe.prototype._getDefaultsOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const url = this.url + "brands/" + brand + "/models/" + model + "/defaults";
    return Object.assign(options, {
        url: url,
        method: "GET"
    });
};

/**
 * @ignore
 */
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

/**
 * @ignore
 */
ripe.Ripe.prototype._getFactoryOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const url = this.url + "brands/" + brand + "/models/" + model + "/factory";
    return Object.assign(options, {
        url: url,
        method: "GET"
    });
};
