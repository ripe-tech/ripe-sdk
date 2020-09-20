if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Returns the configuration information of a specific brand and model.
 * If no model is provided then returns the information of the owner's current model.
 *
 * @param {Object} options A map with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'version' - The version of the build, defaults to latest
 *  - 'country' - The country where the model will be provided, some materials/colors might not be available.
 *  - 'flag' - A specific flag that may change the provided materials/colors available.
 *  - 'filter' - If the configuration should be filtered by the country and/or flag (defaults to 'true')
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
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'version' - The version of the build, defaults to latest
 *  - 'country' - The country where the model will be provided, some materials/colors might not be available.
 *  - 'flag' - A specific flag that may change the provided materials/colors available.
 *  - 'filter' - If the configuration should be filtered by the country and/or flag (defaults to 'true')
 * @returns {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.getConfigP = function(options) {
    return new Promise((resolve, reject) => {
        this.getConfig(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the default customization of a specific brand or model. If no model is provided
 * then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'version' - The version of the build, defaults to latest
 * @returns {XMLHttpRequest} The model's default options.
 */
ripe.Ripe.prototype.getDefaults = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getDefaultsOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result, isValid, request) {
        if (callback) callback(isValid ? result.parts : result, isValid, request);
    });
};

/**
 * Returns the default customization of a specific brand or model.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'version' - The version of the build, defaults to latest
 * @returns {Object} The model's optional parts.
 */
ripe.Ripe.prototype.getOptionals = function(options, callback) {
    return this.getDefaults(options, function(defaults, isValid, request) {
        const optionals = [];
        for (const name in defaults) {
            const part = defaults[name];
            part.optional && optionals.push(name);
        }
        if (callback) callback(optionals, isValid, request);
    });
};

/**
 * Returns the possible customization combinations of a specific brand or model.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'version' - The version of the build, defaults to latest
 * @returns {XMLHttpRequest} The model's total set of combinations.
 */
ripe.Ripe.prototype.getCombinations = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getCombinationsOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result, isValid, request) {
        if (callback) callback(isValid ? result.combinations : result, isValid, request);
    });
};

/**
 * Returns the possible customization combinations of a specific brand or model.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'version' - The version of the build, defaults to latest
 * @returns {Promise} The model's total set of combinations.
 */
ripe.Ripe.prototype.getCombinationsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getCombinations(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the factory information where a model is made,
 * specifically its name and the estimated production time in days.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The factory information for the provided model.
 */
ripe.Ripe.prototype.getFactory = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getFactoryOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the factory information where a model is made,
 * specifically its name and the estimated production time in days.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The factory information for the provided model.
 */
ripe.Ripe.prototype.getFactoryP = function(options, callback) {
    return new Promise((resolve, reject) => {
        this.getFactory(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the result of the execution of the given method for the
 * logic script of a model.
 * Does this by running the provided method on the server side under
 * a proper "sandboxed" environment.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'version' - The version of the build, defaults to latest
 *  - 'method' - The method of the logic module of the model
 *  - 'data' - The arguments to pass to the method
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The result of the logic function of the provided model.
 */
ripe.Ripe.prototype.runLogic = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._runLogicOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the result of the execution of the given method for the
 * logic script of a model.
 * Does this by running the provided method on the server side under
 * a proper "sandboxed" environment.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 *  - 'version' - The version of the build, defaults to latest
 *  - 'method' - The method of the logic module of the model
 *  - 'data' - The arguments to pass to the method
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The result of the logic function of the provided model.
 */
ripe.Ripe.prototype.runLogicP = function(options, callback) {
    return new Promise((resolve, reject) => {
        this.runLogic(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Server side callback method to be called for situations where a customization
 * for a model has been started.
 * This method allows the change of the current context of execution based on
 * a server side implementation of the 3DB's business logic.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onConfig = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._onConfigOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Server side callback method to be called for situations where a customization
 * for a model has been started.
 * This method allows the change of the current context of execution based on
 * a server side implementation of the 3DB's business logic.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model
 *  - 'model' - The name of the model
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onConfigP = function(options, callback) {
    return new Promise((resolve, reject) => {
        this.onConfig(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Server side callback method to be called for situations where a customization
 * change was made on a part.
 * This method allows the change of the current context of execution based on
 * a server side implementation of the 3DB's business logic.
 *
 * @param {Object} options An object with options, such as:
 *  - 'name' - The name of the part to be changed
 *  - 'value' - The value (material and color) of the part to be changed
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onPart = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._onPartOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Server side callback method to be called for situations where a customization
 * change was made on a part.
 * This method allows the change of the current context of execution based on
 * a server side implementation of the 3DB's business logic.
 *
 * @param {Object} options An object with options, such as:
 *  - 'name' - The name of the part to be changed
 *  - 'value' - The value (material and color) of the part to be changed
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onPartP = function(options, callback) {
    return new Promise((resolve, reject) => {
        this.onPart(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Server side callback method to be called for situations where the initials
 * or engraving values were changed.
 * This method allows the change of the current context of execution based on
 * a server side implementation of the 3DB's business logic.
 *
 * @param {Object} options An object with options, such as:
 *  - 'group' - The name of the group that is going to be changed
 *  - 'value' - The initials value to be changed
 *  - 'engraving' - The engraving value to be changed
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onInitials = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._onInitialsOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Server side callback method to be called for situations where the initials
 * or engraving values were changed.
 * This method allows the change of the current context of execution based on
 * a server side implementation of the 3DB's business logic.
 *
 * @param {Object} options An object with options, such as:
 *  - 'group' - The name of the group that is going to be changed
 *  - 'value' - The initials value to be changed
 *  - 'engraving' - The engraving value to be changed
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onInitialsP = function(options, callback) {
    return new Promise((resolve, reject) => {
        this.onInitials(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @see {link https://docs.platforme.com/#product-endpoints-config}
 * @ignore
 */
ripe.Ripe.prototype._getConfigOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const country = options.country === undefined ? this.country : options.country;
    const flag = options.flag === undefined ? this.flag : options.flag;
    const url = `${this.url}brands/${brand}/models/${model}/config`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
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
 * @see {link https://docs.platforme.com/#product-endpoints-defaults}
 * @ignore
 */
ripe.Ripe.prototype._getDefaultsOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const url = `${this.url}brands/${brand}/models/${model}/defaults`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
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
ripe.Ripe.prototype._getCombinationsOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const useName =
        options.useName !== undefined && options.useName !== null ? options.useName : false;
    const country = options.country === undefined ? this.country : options.country;
    const flag = options.flag === undefined ? this.flag : options.flag;
    const url = `${this.url}brands/${brand}/models/${model}/combinations`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
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
 * @see {link http://docs.platforme.com/#product-endpoints-factory}
 */
ripe.Ripe.prototype._getFactoryOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const url = `${this.url}brands/${brand}/models/${model}/factory`;
    return Object.assign(options, {
        url: url,
        method: "GET"
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._runLogicOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const method = options.method === undefined ? null : options.method;
    const data = options.data === undefined ? null : options.data;
    const url = `${this.url}brands/${brand}/models/${model}/logic/${method}`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    return Object.assign(options, {
        url: url,
        method: "POST",
        params: params,
        dataJ: data
    });
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#product-endpoints-on_config}
 */
ripe.Ripe.prototype._onConfigOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.model : options.version;
    const initials = options.initials === undefined ? this.initialsExtra : options.initials;
    const parts = options.parts === undefined ? this.parts : options.parts;
    const choices = options.choices === undefined ? this.choices : options.choices;
    const brandI = options.brand === undefined ? null : options.brand;
    const modelI = options.model === undefined ? null : options.model;
    const url = `${this.url}brands/${brand}/models/${model}/on_config`;
    const ctx = Object.assign({}, this.ctx || {}, {
        brand: brand,
        model: model,
        version: version,
        initials: initials,
        parts: parts,
        choices: choices
    });
    return Object.assign(options, {
        url: url,
        method: "POST",
        dataJ: {
            brand: brandI,
            model: modelI,
            ctx: ctx
        }
    });
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#product-endpoints-on_part}
 */
ripe.Ripe.prototype._onPartOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const initials = options.initials === undefined ? this.initialsExtra : options.initials;
    const parts = options.parts === undefined ? this.parts : options.parts;
    const choices = options.choices === undefined ? this.choices : options.choices;
    const name = options.name === undefined ? null : options.name;
    const value = options.value === undefined ? null : options.value;
    const url = `${this.url}brands/${brand}/models/${model}/on_part`;
    const ctx = Object.assign({}, this.ctx || {}, {
        brand: brand,
        model: model,
        initials: initials,
        parts: parts,
        choices: choices
    });
    return Object.assign(options, {
        url: url,
        method: "POST",
        dataJ: {
            name: name,
            value: value,
            ctx: ctx
        }
    });
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#product-endpoints-on_initials}
 */
ripe.Ripe.prototype._onInitialsOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const initials = options.initials === undefined ? this.initialsExtra : options.initials;
    const parts = options.parts === undefined ? this.parts : options.parts;
    const choices = options.choices === undefined ? this.choices : options.choices;
    const group = options.group === undefined ? null : options.group;
    const value = options.value === undefined ? null : options.value;
    const engraving = options.engraving === undefined ? null : options.engraving;
    const url = `${this.url}brands/${brand}/models/${model}/on_initials`;
    const ctx = Object.assign({}, this.ctx || {}, {
        brand: brand,
        model: model,
        initials: initials,
        parts: parts,
        choices: choices
    });
    return Object.assign(options, {
        url: url,
        method: "POST",
        dataJ: {
            group: group,
            initials: value,
            engraving: engraving,
            ctx: ctx
        }
    });
};
