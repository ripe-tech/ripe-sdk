if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("../base");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
}

/**
 * Returns the logo of a brand.
 *
 * @param {Object} options A map with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'variant' - The variant of the logo, that controls semantics of the logo.
 *  - 'format' - The format of the logo image to be retrieved (defaults to 'png').
 *  - 'size' - The size of the logo image.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The brand's logo.
 */
ripe.Ripe.prototype.getLogo = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getLogoOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the logo of a brand.
 *
 * @param {Object} options A map with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'variant' - The variant of the logo, that controls semantics of the logo.
 *  - 'format' - The format of the logo image to be retrieved (defaults to 'png').
 *  - 'size' - The size of the logo image.
 * @returns {Promise} The brand's logo.
 */
ripe.Ripe.prototype.getLogoP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLogo(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the URL where the logo of a brand can be retrieved.
 *
 * Can be used to allow interactive user agents (browser) to load the
 * image user their own loading infrastructure.
 *
 * @param {Object} options A map with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'variant' - The variant of the logo, that controls semantics of the logo.
 *  - 'format' - The format of the logo image to be retrieved (defaults to 'png').
 * @returns {String} The URL that can be used to retrieve a brand logo.
 */
ripe.Ripe.prototype.getLogoUrl = function(options) {
    options = this._getLogoOptions(options);
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * Returns the mesh contents for a model.
 *
 * @param {Object} options A map with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'variant' - The variant of the mesh, as defined in the model spec.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The model's mesh.
 */
ripe.Ripe.prototype.getMesh = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getMeshOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the mesh contents for a model.
 *
 * @param {Object} options A map with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'variant' - The variant of the mesh, as defined in the model spec.
 * @returns {XMLHttpRequest} The model's mesh.
 */
ripe.Ripe.prototype.getMeshP = function(options) {
    return new Promise((resolve, reject) => {
        this.getMesh(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the URL where the mesh can be retrieved.
 *
 * This method is useful to allow external mesh loaders to
 * take control of the URL based mesh loading process.
 *
 * @param {Object} options A map with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'variant' - The variant of the mesh, as defined in the model spec.
 * @returns {String} The URL that can be used to retrieve the mesh.
 */
ripe.Ripe.prototype.getMeshUrl = function(options) {
    options = this._getMeshOptions(options);
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * Returns the configuration information of a specific brand and model.
 * If no model is provided then returns the information of the owner's current model.
 *
 * @param {Object} options A map with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'country' - The country where the model will be provided, some materials/colors might not be available.
 *  - 'flag' - A specific flag that may change the provided materials/colors available.
 *  - 'filter' - If the configuration should be filtered by the country and/or flag (defaults to 'true').
 * @param {Function} callback Function with the result of the request.
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'country' - The country where the model will be provided, some materials/colors might not be available.
 *  - 'flag' - A specific flag that may change the provided materials/colors available.
 *  - 'filter' - If the configuration should be filtered by the country and/or flag (defaults to 'true').
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 * @param {Function} callback Function with the result of the request.
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
 * Returns the default customization of a specific brand or model. If no model is provided
 * then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 * @returns {Promise} The model's default options.
 */
ripe.Ripe.prototype.getDefaultsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getDefaults(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the default customization of a specific brand or model.
 * If no model is provided then returns the defaults of the owner's current model.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 * @param {Function} callback Function with the result of the request.
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 * @param {Function} callback Function with the result of the request.
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The factory information for the provided model.
 */
ripe.Ripe.prototype.getFactoryP = function(options) {
    return new Promise((resolve, reject) => {
        this.getFactory(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the result of the server side validation of model configurations
 * considering a given build's brand, model and version.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The name of the brand to be considered when validating.
 *  - 'model' - The name of the model to be considered when validating.
 *  - 'version' - The target build version to be considered when validating.
 *  - 'parts' - The parts to be validated.
 *  - 'engraving' - The engraving value to be validated.
 *  - 'size' - The size to be validated.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.validateModel = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._validateModelOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the result of the server side validation of model configurations
 * considering a given build's brand, model and version.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The name of the brand to be considered when validating.
 *  - 'model' - The name of the model to be considered when validating.
 *  - 'version' - The target build version to be considered when validating.
 *  - 'parts' - The parts to be validated.
 *  - 'engraving' - The engraving value to be validated.
 *  - 'size' - The size to be validated.
 * @returns {Promise} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.validateModelP = function(options) {
    return new Promise((resolve, reject) => {
        this.validateModel(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the length in pixels of text drawn using the profiles
 * of the model of a brand.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The name of the brand to be considered when validating.
 *  - 'model' - The name of the model to be considered when validating.
 *  - 'value' - The text from which the length in pixels will be returned.
 *  - 'profiles' - The profiles to be used when drawing the text.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.textLength = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getTextLengthOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the length in pixels of text drawn using the profiles
 * of the model of a brand.
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The name of the brand to be considered when validating.
 *  - 'model' - The name of the model to be considered when validating.
 *  - 'value' - The text from which the length in pixels will be returned.
 *  - 'profiles' - The profiles to be used when drawing the text.
 * @returns {Promise} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.textLengthP = function(options) {
    return new Promise((resolve, reject) => {
        this.textLength(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the logic script of a model in the requested format (javascript or python).
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'format' - The format of the logic script ("js" or "py").
 *  - 'method' - The method of the logic module of the model.
 *  - 'args' - The arguments to pass to the method, as an object.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The logic script of the provided model.
 */
ripe.Ripe.prototype.getLogic = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getLogicOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the logic script of a model in the requested format (javascript or python).
 *
 * @param {Object} options An object with options, such as:
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'format' - The format of the logic script ("js" or "py").
 *  - 'method' - The method of the logic module of the model.
 *  - 'args' - The arguments to pass to the method, as an object.
 * @returns {Promise} The logic script of the provided model.
 */
ripe.Ripe.prototype.getLogicP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLogic(options, (result, isValid, request) => {
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'method' - The method of the logic module of the model.
 *  - 'data' - The arguments to pass to the method.
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 *  - 'version' - The version of the build, defaults to latest.
 *  - 'method' - The method of the logic module of the model.
 *  - 'data' - The arguments to pass to the method.
 * @returns {Promise} The result of the logic function of the provided model.
 */
ripe.Ripe.prototype.runLogicP = function(options) {
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
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
 *  - 'brand' - The brand of the model.
 *  - 'model' - The name of the model.
 * @returns {Promise} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onConfigP = function(options) {
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
 *  - 'name' - The name of the part to be changed.
 *  - 'value' - The value (material and color) of the part to be changed.
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
 *  - 'name' - The name of the part to be changed.
 *  - 'value' - The value (material and color) of the part to be changed.
 * @returns {Promise} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onPartP = function(options) {
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
 *  - 'group' - The name of the group that is going to be changed.
 *  - 'value' - The initials value to be changed.
 *  - 'engraving' - The engraving value to be changed.
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
 *  - 'group' - The name of the group that is going to be changed.
 *  - 'value' - The initials value to be changed.
 *  - 'engraving' - The engraving value to be changed.
 * @returns {Promise} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.onInitialsP = function(options) {
    return new Promise((resolve, reject) => {
        this.onInitials(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getLogoOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const version = options.version === undefined ? this.version : options.version;
    const variant = options.variant === undefined ? this.variant : options.variant;
    const format = options.format === undefined ? "png" : options.format;
    const url = `${this.url}brands/${brand}/logo.${format}`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    if (variant !== undefined && variant !== null) {
        params.variant = variant;
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
ripe.Ripe.prototype._getMeshOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const variant = options.variant === undefined ? this.variant : options.variant;
    const url = `${this.url}brands/${brand}/models/${model}/mesh`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    if (variant !== undefined && variant !== null) {
        params.variant = variant;
    }
    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};

/**
 * @see {link https://docs.platforme.com/#brand-endpoints-config-and-spec}
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
 * @see {link https://docs.platforme.com/#brand-endpoints-defaults}
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
ripe.Ripe.prototype._validateModelOptions = function(options = {}) {
    const gender = options.gender === undefined ? null : options.gender;
    const size = options.size === undefined ? null : options.size;
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const queryOptions = options.queryOptions === undefined ? true : options.queryOptions;
    const initialsOptions = options.initialsOptions === undefined ? true : options.initialsOptions;

    if (queryOptions) {
        // obtains the query options taking into account that the brand
        // and the model are not to be included in the parameters as they
        // already part of the base URL structure
        options = this._getQueryOptions(Object.assign(options, { brand: null, model: null }));
    }
    if (initialsOptions) options = this._getInitialsOptions(options);

    const url = `${this.url}brands/${brand}/models/${model}/validate`;

    // "extracts" the parameters from the options, note that these values
    // may have been "manipulated" by the partial get options operations
    const params = options.params || {};

    if (gender !== undefined && gender !== null) {
        params.gender = gender;
    }
    if (size !== undefined && size !== null) {
        params.size = size;
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
ripe.Ripe.prototype._getTextLengthOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const value = options.value === undefined ? "" : options.value;
    const url = `${this.url}brands/${brand}/models/${model}/text_length`;
    const params = {
        value: value
    };
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    if (options.profiles !== undefined && options.profiles !== null) {
        params.profiles = options.profiles;
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
ripe.Ripe.prototype._getLogicOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const format = options.format === undefined ? this.format : options.format;
    const method = options.method === undefined ? this.method : options.method;
    const args = options.args === undefined ? null : options.args;
    const url = `${this.url}brands/${brand}/models/${model}/logic`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    if (format !== undefined && format !== null) {
        params.format = format;
    }
    if (method !== undefined && method !== null) {
        params.method = method;
    }
    if (args !== undefined && args !== null) {
        Object.assign(params, args);
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
ripe.Ripe.prototype._runLogicOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const method = options.method === undefined ? null : options.method;
    const dataJ = options.dataJ === undefined ? null : options.dataJ;
    const url = `${this.url}brands/${brand}/models/${model}/logic/${method}`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    return Object.assign(options, {
        url: url,
        method: "POST",
        params: params,
        dataJ: dataJ
    });
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#product-endpoints-on_config}
 */
ripe.Ripe.prototype._onConfigOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
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
    const version = options.version === undefined ? this.version : options.version;
    const initials = options.initials === undefined ? this.initialsExtra : options.initials;
    const parts = options.parts === undefined ? this.parts : options.parts;
    const choices = options.choices === undefined ? this.choices : options.choices;
    const name = options.name === undefined ? null : options.name;
    const value = options.value === undefined ? null : options.value;
    const url = `${this.url}brands/${brand}/models/${model}/on_part`;
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
    const version = options.version === undefined ? this.version : options.version;
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
        version: version,
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
