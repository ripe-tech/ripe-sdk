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
 * Retrieves the complete list of builds available from the server.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBuilds = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the complete list of builds available from the server.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The builds list (as a promise).
 */
ripe.Ripe.prototype.getBuildsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getBuilds(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the complete list of builds installed and available.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getLocalBuilds = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds/local`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the complete list of builds installed and available.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The builds list (as a promise).
 */
ripe.Ripe.prototype.getLocalBuildsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLocalBuilds(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves a build's information from the server side by name.
 *
 * @param {String} name The name of the of the build.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBuild = function(name, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds/${name}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves a build's information from the server side by name.
 *
 * @param {String} name The name of the build.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build's information (as a promise).
 */
ripe.Ripe.prototype.getBuildP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.getBuild(name, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Installs a build on the server from remote repos for the given name.
 *
 * @param {String} name The build's name to be installed.
 * @param {Object} options An object with options, such as:
 *  - 'version' - The version of the build to install, if no version is given,
 * installs the latest one.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.installBuild = function(name, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const version = options.version === undefined ? null : options.version;
    const url = `${this.url}builds/${name}/install`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        params: params
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Installs a build on the server from remote repos for the given name.
 *
 * @param {String} name The build's name to be installed.
 * @param {Object} options An object with options, such as:
 *  - 'version' - The version of the build to install, if no version is given,
 * installs the latest one.
 * @returns {Promise} The build install (as a promise).
 */
ripe.Ripe.prototype.installBuildP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.installBuild(name, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Uninstalls a build from the server according to provided values.
 *
 * @param {String} name The name of the build to be uninstalled.
 * @param {Object} options An object with options, such as:
 *  - 'version' - The version of the build to uninstall, if no version is given,
 * uninstalls all builds for the name.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.uninstallBuild = function(name, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const version = options.version === undefined ? null : options.version;
    const url = `${this.url}builds/${name}/uninstall`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        params: params
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Uninstalls a build from the server according to provided values.
 *
 * @param {String} name The name of the build to be uninstalled.
 * @param {Object} options An object with options, such as:
 *  - 'version' - The version of the build to uninstall, if no version is given,
 * uninstalls all builds for the name.
 * @returns {Promise} The build uninstall (as a promise).
 */
ripe.Ripe.prototype.uninstallBuildP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.uninstallBuild(name, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates a build to the latest version, maintaining the installation of
 * the previous versions.
 *
 * @param {String} name The build's name of the build to update name.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.updateBuild = function(name, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds/${name}/update`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates a build to the latest version, maintaining the installation of
 * the previous versions.
 *
 * @param {String} name The build's name of the build to update name.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build update (as a promise).
 */
ripe.Ripe.prototype.updateBuildP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.updateBuild(name, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Switches the active version of a build, moving internal references to
 * the newly selected build version.
 *
 * @param {String} name The name of the build to be switched.
 * @param {Object} options An object with options, such as:
 *  - 'version' - The version of the build to activate.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.switchBuild = function(name, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const version = options.version === undefined ? null : options.version;
    const url = `${this.url}builds/${name}/switch`;
    const params = {};
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        params: params
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Switches the active version of a build, moving internal references to
 * the newly selected build version.
 *
 * @param {String} name The name of the build to be switched.
 * @param {Object} options An object with options, such as:
 *  - 'version' - The version of the build to activate.
 * @returns {Promise} The build switch (as a promise).
 */
ripe.Ripe.prototype.switchBuildP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.switchBuild(name, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the build artifacts by name and version and for
 * the requested branch.
 *
 * @param {String} name The name of the build artifacts.
 * @param {String} version The version of the build artifacts.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBuildArtifacts = function(name, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const branch = options.branch === undefined ? "master" : options.branch;
    const url = `${this.url}builds/${name}/artifacts`;
    const params = {};
    if (branch !== undefined && branch !== null) {
        params.branch = branch;
    }
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        params: params
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the build artifacts by brand name and version and for
 * the requested branch.
 *
 * @param {String} name The name of the brand of the build artifacts.
 * @param {String} version The version of the build artifacts.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build artifacts (as a promise).
 */
ripe.Ripe.prototype.getBuildArtifactsP = function(name, options) {
    return new Promise((resolve, reject) => {
        this.getBuildArtifacts(name, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the build artifact information by brand name and version.
 *
 * @param {String} name The name of the brand of the build artifact.
 * @param {String} version The version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getBuildArtifact = function(name, version, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds/${name}/artifacts/${version}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the build artifact information by name and version.
 *
 * @param {String} name The name of the build artifact.
 * @param {String} version The version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build artifact (as a promise).
 */
ripe.Ripe.prototype.getBuildArtifactP = function(name, version, options) {
    return new Promise((resolve, reject) => {
        this.getBuildArtifact(name, version, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Installs a build artifact by build name and artifact version.
 *
 * @param {String} name The name of the build associated with the artifact.
 * @param {String} version The version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.installArtifact = function(name, version, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds/${name}/artifacts/${version}/install`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Installs a build artifact by build name and artifact version.
 *
 * @param {String} name The name of the build associated with the artifact.
 * @param {String} version The version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build install (as a promise).
 */
ripe.Ripe.prototype.installArtifactP = function(name, version, options) {
    return new Promise((resolve, reject) => {
        this.installArtifact(name, version, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Uninstalls a build artifact by build name and artifact version.
 *
 * @param {String} name The name of the build associated with the artifact.
 * @param {String} version The version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.uninstallArtifact = function(name, version, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds/${name}/artifacts/${version}/uninstall`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Uninstalls a build artifact by build name and artifact version.
 *
 * @param {String} name The name of the build associated with the artifact.
 * @param {String} version The version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The artifact uninstall (as a promise).
 */
ripe.Ripe.prototype.uninstallArtifactP = function(name, version, options) {
    return new Promise((resolve, reject) => {
        this.uninstallArtifact(name, version, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Switches the active version of a build, changing the active version of
 * the build to the version defined in the request.
 *
 * @param {String} name The name of the build to be switched.
 * @param {String} version The version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.switchArtifact = function(name, version, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}builds/${name}/artifacts/${version}/switch`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Switches the active version of a build, changing the active version of
 * the build to the version defined in the request.
 *
 * @param {String} name The name of the build to be switched.
 * @param {String} version The version of the build artifact.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The build switch (as a promise).
 */
ripe.Ripe.prototype.switchArtifactP = function(name, version, options) {
    return new Promise((resolve, reject) => {
        this.switchArtifact(name, version, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the bundle of part, materials and colors translations of a specific brand and model
 * If no model is defined the retrieves the bundle of the owner's current model.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'brand' - The brand of the model.
 * - 'model' - The name of the model.
 * - 'locale' - The locale of the translations.
 * - 'compatibility' - If compatibility mode should be enabled.
 * - 'prefix' - A prefix to prepend to the locale keys (defaults to 'builds').
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getLocaleModel = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getLocaleModelOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the bundle of part, materials and colors translations of a specific brand and model
 * If no model is defined the retrieves the bundle of the owner's current model.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'brand' - The brand of the model.
 * - 'model' - The name of the model.
 * - 'locale' - The locale of the translations.
 * - 'compatibility' - If compatibility mode should be enabled.
 * - 'prefix' - A prefix to prepend to the locale keys (defaults to 'builds').
 * @returns {Promise} The resolved locale data (as a promise).
 */
ripe.Ripe.prototype.getLocaleModelP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLocaleModel(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the default locale keys of a specific brand and model.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'brand' - The brand of the model. If no brand is defined it retrieves the keys of the owner's current brand.
 * - 'model' - The name of the model. If no model is defined it retrieves the keys of the owner's current model.
 * - 'version' - The version of the build. If no version is defined it retrieves the keys of the owner's current version.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getLocaleModelKeys = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getLocaleModelKeysOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves the default locale keys of a specific brand and model.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'brand' - The brand of the model. If no brand is defined it retrieves the keys of the owner's current brand.
 * - 'model' - The name of the model. If no model is defined it retrieves the keys of the owner's current model.
 * - 'version' - The version of the build. If no version is defined it retrieves the keys of the owner's current version.
 * @returns {Promise} The resolved locale data (as a promise).
 */
ripe.Ripe.prototype.getLocaleModelKeysP = function(options) {
    return new Promise((resolve, reject) => {
        this.getLocaleModelKeys(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#build-endpoints-locale}
 */
ripe.Ripe.prototype._getLocaleModelOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const locale =
        options.locale === undefined || options.locale === null ? this.locale : options.locale;
    const url = `${this.url}builds/${brand}/locale/${locale}`;
    const params = {};
    if (model !== undefined && model !== null) {
        params.model = model;
    }
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    if (options.compatibility !== undefined && options.compatibility !== null) {
        params.compatibility = options.compatibility ? "1" : "0";
    }
    if (options.prefix !== undefined && options.prefix !== null) {
        params.prefix = options.prefix;
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
ripe.Ripe.prototype._getLocaleModelKeysOptions = function(options = {}) {
    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const url = `${this.url}builds/${brand}/locale/keys`;
    const params = {};
    if (model !== undefined && model !== null) {
        params.model = model;
    }
    if (version !== undefined && version !== null) {
        params.version = version;
    }
    return Object.assign(options, {
        url: url,
        method: "GET",
        auth: true,
        params: params
    });
};
