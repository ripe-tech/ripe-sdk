if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var compat = require("./compat");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
    // eslint-disable-next-line no-redeclare
    var fetch = compat.fetch;
    // eslint-disable-next-line no-redeclare
    var XMLHttpRequest = compat.XMLHttpRequest;
}

/**
 * @class
 * @classdesc The API class to be instantiated. Implements all the API interfaces.
 * @param {Object} options The options to be used to configure the API client.
 * @returns {Ripe} The newly created RipeAPI object.
 */
ripe.RipeAPI = function(options = {}) {
    options.cached = typeof options.cached === "undefined" ? false : options.cached;
    return new ripe.Ripe(options);
};

/**
 * Runs a simple "ping" operation to validate the connection with the
 * Core server-side.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.ping = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}ping`;
    options = Object.assign(options, {
        url: url,
        method: "GET"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.pingP = function(options) {
    return new Promise((resolve, reject) => {
        this.ping(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Runs the GeoIP resolution process so that it's possible to uncover
 * more geographical information about the current user.
 *
 * @param {String} address The optional address to be used in case the address
 * of the IP request is not desired.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.geoResolve = function(address, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}geo_resolve`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            address: address
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.geoResolveP = function(address, options) {
    return new Promise((resolve, reject) => {
        this.geoResolve(address, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the complete set of session elements to be used, such as:
 * the 'sid ', 'session_id', 'username ', 'name', 'email' and 'tokens'.
 *
 * @param {String} username The username to authenticate.
 * @param {String} password The username's password.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.signin = function(username, password, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}signin`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            username: username,
            password: password
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.signinP = function(username, password, options) {
    return new Promise((resolve, reject) => {
        this.signin(username, password, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the complete set of session elements to be used, such as:
 * the 'sid ', 'session_id', 'username ', 'name', 'email' and 'tokens'.
 *
 * This strategy uses the admin back-end for authentication.
 *
 * @param {String} username The username to authenticate.
 * @param {String} password The username's password.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.signinAdmin = function(username, password, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}signin_admin`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            username: username,
            password: password
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.signinAdminP = function(username, password, options) {
    return new Promise((resolve, reject) => {
        this.signinAdmin(username, password, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the complete set of session elements to be used, such as:
 * the 'sid ', 'session_id', 'username ', 'name', 'email'.
 *
 * @param {String} token The authentication token.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.signinPid = function(token, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}signin_pid`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            token: token
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.signinPidP = function(token, options) {
    return new Promise((resolve, reject) => {
        this.signinAdmin(token, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Retrieves the price for current customization.
 *
 * @param {Object} options An Object containing customization information that
 * can be used to override the current customization, allowing to set the
 * 'brand', 'model' and 'parts'.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getPrice = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getPriceOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.getPriceP = function(options) {
    return new Promise((resolve, reject) => {
        this.getPrice(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._cacheURL = function(url, options, callback) {
    // runs the defaulting operation on the provided options
    // optional parameter (ensures valid object there)
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;

    // builds the (base) key value for the provided value
    // from options or used the default one
    const key = options.key || "default";

    // creates the full key by adding the base key to the
    // URL value (including query string), this is unique
    // assuming no request payload
    const query = this._buildQuery(options.params || {});
    const fullKey = key + ":" + url + ":" + query;

    // determines if the current request should be cached, obeys
    // some of the basic rules for that behaviour
    let cached = options.cached;
    cached = typeof cached === "undefined" ? this.options.cached : cached;
    cached = typeof cached === "undefined" ? true : cached;
    cached = cached && !options.force && ["GET"].indexOf(options.method || "GET") !== -1;

    // determines if the cache entry should be invalidated before
    // making the request, it should only be invalidate in case the
    // the current request is being done with the cached flag
    let invalidate = options.invalidate;
    invalidate = typeof invalidate === "undefined" ? false : invalidate;
    invalidate = cached && invalidate;

    // initializes the cache object in the current instance
    // in case it does not exists already
    this._cache = this._cache === undefined ? {} : this._cache;

    // in case the invalidate flag is set then the cache for the
    // current key should be removed (invalidated)
    if (invalidate) delete this._cache[fullKey];

    // in case there's already a valid value in cache,
    // retrieves it and calls the callback with the value
    if (this._cache[fullKey] !== undefined && cached) {
        if (callback) callback(this._cache[fullKey], true, null);
        return null;
    }

    // otherwise runs the "normal" request URL call and
    // sets the result cache key on return
    return this._requestURL(url, options, (result, isValid, request) => {
        if (isValid && cached) {
            this._cache[fullKey] = result;
        }
        if (callback) callback(result, isValid, request);
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._requestURL = function(url, options, callback) {
    if (typeof fetch !== "undefined") return this._requestURLFetch(url, options, callback);
    else return this._requestURLLegacy(url, options, callback);
};

/**
 * @ignore
 */
ripe.Ripe.prototype._requestURLFetch = function(url, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;

    const context = this;
    const method = options.method || "GET";
    const params = options.params || {};
    const headers = options.headers || {};
    let data = options.data || null;
    const dataJ = options.dataJ || null;
    let contentType = options.contentType || null;
    const validCodes = options.validCodes || [200];
    const credentials = options.credentials || "omit";

    const query = this._buildQuery(params);
    const isEmpty = ["GET", "DELETE"].indexOf(method) !== -1;
    const hasQuery = url.indexOf("?") !== -1;
    const separator = hasQuery ? "&" : "?";

    if (isEmpty || data) {
        url += separator + query;
    } else if (dataJ !== null) {
        data = JSON.stringify(dataJ);
        url += separator + query;
        contentType = "application/json";
    } else {
        data = query;
        contentType = "application/x-www-form-urlencoded";
    }

    if (contentType) {
        headers["Content-Type"] = headers["Content-Type"] || contentType;
    }

    const response = fetch(url, {
        method: method,
        headers: headers || {},
        body: data,
        credentials: credentials
    });

    response
        .then(async response => {
            let result = null;
            const isValid = validCodes.includes(response.status);
            const contentType = response.headers.get("content-type").toLowerCase();
            try {
                if (contentType.startsWith("application/json")) {
                    result = await response.json();
                } else {
                    result = await response.blob();
                }
            } catch (error) {
                response.error = response.error || error;
                callback.call(context, result, isValid, response);
                return;
            }
            if (callback) callback.call(context, result, isValid, response);
        })
        .catch(error => {
            response.error = response.error || error;
            if (callback) callback.call(context, null, false, response);
        });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._requestURLLegacy = function(url, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;

    const context = this;
    const method = options.method || "GET";
    const params = options.params || {};
    const headers = options.headers || {};
    let data = options.data || null;
    const dataJ = options.dataJ || null;
    let contentType = options.contentType || null;
    const timeout = options.timeout || 10000;
    const timeoutConnect = options.timeoutConnect || parseInt(timeout / 2);
    const validCodes = options.validCodes || [200];
    const withCredentials = options.withCredentials || false;

    const query = this._buildQuery(params);
    const isEmpty = ["GET", "DELETE"].indexOf(method) !== -1;
    const hasQuery = url.indexOf("?") !== -1;
    const separator = hasQuery ? "&" : "?";

    if (isEmpty || data) {
        url += separator + query;
    } else if (dataJ !== null) {
        data = JSON.stringify(dataJ);
        url += separator + query;
        contentType = "application/json";
    } else {
        data = query;
        contentType = "application/x-www-form-urlencoded";
    }

    const request = new XMLHttpRequest();
    request.timeout = timeoutConnect;
    request.callback = callback;
    request.validCodes = validCodes;
    request.withCredentials = withCredentials;

    request.addEventListener("load", function() {
        let result = null;
        const isValid = this.validCodes.includes(this.status);
        try {
            result = JSON.parse(this.responseText);
        } catch (error) {
            result = this.responseText;
        }
        if (this.callback) this.callback.call(context, result, isValid, this);
        if (this.timeoutHandler) {
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    });

    request.addEventListener("error", function(error) {
        request.error = request.error || error;
        if (this.callback) this.callback.call(context, null, false, this);
        if (this.timeoutHandler) {
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    });

    request.addEventListener("loadstart", function() {
        context.trigger("pre_request", request, options);
    });

    request.addEventListener("loadend", function() {
        context.trigger("post_request", request, options);
    });

    request.open(method, url, true);

    request.timeoutHandler = setTimeout(() => {
        if (request.readyState === 4) return;
        request.error = new Error(`Timeout on request ${timeout}ms exceeded`);
        request.abort();
    }, timeout);

    // in case there's a content type to be set, then sets it according
    // to the inferred or requested content type
    if (contentType) {
        request.setRequestHeader("Content-Type", contentType);
    }

    for (const key in headers) {
        const value = headers[key];
        request.setRequestHeader(key, value);
    }

    if (!options.noEvents) this.trigger("build_request", request, options);

    if (data) {
        request.send(data);
    } else {
        request.send();
    }
    return request;
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getQueryOptions = function(options = {}) {
    if (!options.noEvents) this.trigger("pre_query_options", options);

    const params = options.params || {};
    options.params = params;

    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const variant = options.variant === undefined ? this.variant : options.variant;
    const version = options.version === undefined ? this.version : options.version;
    const frame = options.frame === undefined ? this.frame : options.frame;
    const parts = options.parts === undefined ? this.parts : options.parts;
    const engraving = options.engraving === undefined ? this.engraving : options.engraving;
    const country = options.country === undefined ? this.country : options.country;
    const currency = options.currency === undefined ? this.currency : options.currency;
    const flag = options.flag === undefined ? this.flag : options.flag;
    const full = options.full === undefined ? true : options.full;

    if (brand !== undefined && brand !== null) {
        params.brand = brand;
    }

    if (model !== undefined && model !== null) {
        params.model = model;
    }

    if (variant !== undefined && variant !== null) {
        params.variant = variant;
    }

    if (version !== undefined && version !== null) {
        params.version = version;
    }

    if (frame !== undefined && frame !== null) {
        params.frame = frame;
    }

    if (full && engraving !== undefined && engraving !== null) {
        params.engraving = engraving;
    }

    if (full && country !== undefined && country !== null) {
        params.country = country;
    }

    if (full && currency !== undefined && currency !== null) {
        params.currency = currency;
    }

    if (full && flag !== undefined && flag !== null) {
        params.flag = flag;
    }

    params.p = [];

    for (const part in parts) {
        const value = parts[part];
        const material = value.material;
        const color = value.color;
        if (!material) {
            continue;
        }
        if (!color) {
            continue;
        }
        params.p.push(part + ":" + material + ":" + color);
    }

    if (!options.noEvents) this.trigger("post_query_options", options);

    return options;
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getInitialsOptions = function(options = {}) {
    if (!options.noEvents) this.trigger("pre_initials_options", options);

    const params = options.params || {};
    options.params = params;

    const initials = options.initials === undefined ? this.initials : options.initials;
    const engraving = options.engraving === undefined ? this.engraving : options.engraving;
    const initialsExtra =
        options.initialsExtra === undefined ? this.initialsExtra : options.initialsExtra;

    if (initials !== undefined && initials !== null) {
        params.initials = initials;
    }

    if (engraving !== undefined && engraving !== null) {
        params.engraving = engraving;
    }

    if (initialsExtra !== undefined && initialsExtra !== null) {
        params.initials_extra = this._generateExtraS(initialsExtra);
    }

    if (!options.noEvents) this.trigger("post_initials_options", options);

    return options;
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getQuery = function(options = {}) {
    options = this._getQueryOptions(options);
    return this._buildQuery(options.params);
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#config-endpoints-price}
 */
ripe.Ripe.prototype._getPriceOptions = function(options = {}) {
    if (!options.noEvents) this.trigger("pre_price_options", options);

    options = this._getQueryOptions(options);

    const params = options.params || {};
    options.params = params;

    const initials = options.initials === "" ? "$empty" : options.initials;

    if (initials !== undefined && initials !== null) {
        params.initials = initials;
    }

    const url = `${this.url}config/price`;

    options = Object.assign(options, {
        url: url,
        method: "GET"
    });

    if (!options.noEvents) this.trigger("post_price_options", options);

    return options;
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#render-endpoints-compose}
 */
ripe.Ripe.prototype._getImageOptions = function(options = {}) {
    if (!options.noEvents) this.trigger("pre_image_options", options);

    options.country = options.country || null;
    options.currency = options.currency || null;

    options = this._getQueryOptions(options);

    const params = options.params || {};
    options.params = params;

    const initials = options.initials === "" ? "$empty" : options.initials;

    if (options.format !== undefined && options.format !== null) {
        params.format = options.format;
    }

    if (options.width !== undefined && options.width !== null) {
        params.width = options.width;
    }

    if (options.height !== undefined && options.height !== null) {
        params.height = options.height;
    }

    if (options.size !== undefined && options.size !== null) {
        params.size = options.size;
    }

    if (options.background !== undefined && options.background !== null) {
        params.background = options.background;
    }

    if (options.crop !== undefined && options.crop !== null) {
        params.crop = options.crop ? "1" : "0";
    }

    if (options.profile !== undefined && options.profile !== null) {
        params.initials_profile = options.profile.join(",");
    }

    if (initials !== undefined && initials !== null) {
        params.initials = initials;
    }

    const url = `${this.url}compose`;

    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });

    if (!options.noEvents) this.trigger("post_image_options", options);

    return options;
};

/**
 * @ignore
 * @see {link http://docs.platforme.com/#render-endpoints-mask}
 */
ripe.Ripe.prototype._getMaskOptions = function(options = {}) {
    if (!options.noEvents) this.trigger("pre_mask_options", options);

    options.parts = options.parts || {};
    options.country = options.country || null;
    options.currency = options.currency || null;

    options = this._getQueryOptions(options);

    const params = options.params || {};
    options.params = params;

    if (options.part !== undefined && options.part !== null) {
        params.part = options.part;
    }

    const url = `${this.url}mask`;

    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });

    if (!options.noEvents) this.trigger("post_mask_options", options);

    return options;
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getSwatchOptions = function(options = {}) {
    if (!options.noEvents) this.trigger("pre_swatch_options", options);

    const brand = options.brand === undefined ? this.brand : options.brand;
    const model = options.model === undefined ? this.model : options.model;
    const version = options.version === undefined ? this.version : options.version;
    const params = options.params || {};

    options.params = params;

    if (brand !== undefined && brand !== null) {
        params.brand = brand;
    }

    if (model !== undefined && model !== null) {
        params.model = model;
    }

    if (version !== undefined && version !== null) {
        params.version = version;
    }

    if (options.material !== undefined && options.material !== null) {
        params.material = options.material;
    }

    if (options.color !== undefined && options.color !== null) {
        params.color = options.color;
    }

    if (options.format !== undefined && options.format !== null) {
        params.format = options.format;
    }

    const url = `${this.url}swatch`;

    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });

    if (!options.noEvents) this.trigger("post_swatch_options", options);

    return options;
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getImageURL = function(options) {
    options = this._getImageOptions(options);
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getMaskURL = function(options) {
    options = this._getMaskOptions(options);
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getSwatchURL = function(options) {
    options = this._getSwatchOptions(options);
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * Runs the options object building operation meaning that a series
 * of default values are going to be added to the provided options
 * so that it becomes as compatible as possible.
 *
 * If authentication is required the current session identifier is
 * also added to the request.
 *
 * @param {Object} options The HTTP request options object that is
 * going to be completed with default information and session info.
 * @returns {Object} The same options object references that has been
 * provided with the proper default information populated.
 *
 * @ignore
 */
ripe.Ripe.prototype._build = function(options) {
    const url = options.url || "";
    const method = options.method || "GET";
    const params = options.params || {};
    const headers = options.headers || {};
    const auth = options.auth || false;
    if (auth && this.sid !== undefined && this.sid !== null) {
        params.sid = this.sid;
    }
    if (auth && this.key !== undefined && this.key !== null) {
        headers["X-Secret-Key"] = this.key;
    }
    if (
        auth &&
        (this.sid === undefined || this.sid === null) &&
        (this.key === undefined || this.key === null)
    ) {
        throw new Error("Authorization requested but none is available");
    }
    options.url = url;
    options.method = method;
    options.params = Object.assign({}, this.params, params);
    options.headers = Object.assign({}, this.headers, headers);
    options.auth = auth;
    return options;
};

/**
 * Builds a GET query string from the provided Array or Object parameter.
 *
 * If the provided parameter is an Array order of the GET parameters is
 * preserved, otherwise alphabetical order is going to be used.
 *
 * @param {Object} params The object or array that contains the sequence
 * of parameters for the generated GET query.
 * @returns {String} The GET query string that should contain the complete
 * set of passed arguments (serialization).
 *
 * @ignore
 */
ripe.Ripe.prototype._buildQuery = function(params) {
    let key;
    let value;
    let index;
    const buffer = [];

    if (Array.isArray(params)) {
        for (index = 0; index < params.length; index++) {
            const tuple = params[index];
            key = tuple[0];
            value = tuple.length > 1 ? tuple[1] : "";
            if (value === null || value === undefined) continue;
            key = encodeURIComponent(key);
            value = encodeURIComponent(value);
            buffer.push(key + "=" + value);
        }
    } else {
        const keys = Object.keys(params);
        keys.sort();
        for (index = 0; index < keys.length; index++) {
            key = keys[index];
            value = params[key];
            key = encodeURIComponent(key);
            if (Array.isArray(value)) {
                for (let _index = 0; _index < value.length; _index++) {
                    let _value = value[_index];
                    if (_value === null || _value === undefined) continue;
                    _value = encodeURIComponent(_value);
                    buffer.push(key + "=" + _value);
                }
            } else {
                if (value === null || value === undefined) continue;
                value = encodeURIComponent(value);
                buffer.push(key + "=" + value);
            }
        }
    }

    return buffer.join("&");
};

/**
 * Unpacks the provided query string into it's components inside
 * a key, value object for easy usage.
 *
 * This operation is considered to be the opposite of the `_buildQuery`
 * operation.
 *
 * @param {String} The GET query string that is going to be parsed
 * for the creation of the output Object.
 * @returns {Object} The object that contains the key, value information
 * on the query string.
 *
 * @ignore
 */
ripe.Ripe.prototype._unpackQuery = function(query) {
    query = query[0] === "?" ? query.slice(1) : query;

    const parts = query.split("&");
    const options = {};

    for (let index = 0; index < parts.length; index++) {
        const part = parts[index];

        if (part.indexOf("=") === -1) {
            options[decodeURIComponent(part).trim()] = true;
        } else {
            const tuple = part.split("=");
            const key = decodeURIComponent(tuple[0].replace(/\+/g, "%20")).trim();
            const value = decodeURIComponent(tuple[1].replace(/\+/g, "%20")).trim();
            if (options[key] === undefined) {
                options[key] = value;
            } else if (Array.isArray(options[key])) {
                options[key].push(value);
            } else {
                options[key] = [options[key], value];
            }
        }
    }

    return options;
};

ripe.Ripe.prototype._queryToSpec = function(query) {
    const options = this._unpackQuery(query);
    const brand = options.brand || null;
    const model = options.model || null;
    const variant = options.variant || null;
    const version = options.version || null;
    const description = options.description || null;
    const initials = options.initials || null;
    const engraving = options.engraving || null;
    let initialsExtra = options.initials_extra || [];
    const tuples = options.p || [];
    initialsExtra = this._parseExtraS(initialsExtra);
    const parts = this._tuplesToParts(tuples);
    const partsM = this._partsToPartsM(parts);
    const spec = {
        brand: brand,
        model: model,
        parts: partsM,
        initials: initials,
        engraving: engraving,
        initials_extra: initialsExtra
    };
    if (variant) spec.variant = variant;
    if (version) spec.version = version;
    if (description) spec.description = description;
    return spec;
};

ripe.Ripe.prototype._specToQuery = function(spec) {
    const queryL = [];
    const brand = spec.brand || null;
    const model = spec.model || null;
    const variant = spec.variant || null;
    const version = spec.version || null;
    const description = spec.description || null;
    const parts = spec.parts || null;
    const initials = spec.initials || null;
    const engraving = spec.engraving || null;
    const initialsExtra = spec.initials_extra || null;
    if (brand) queryL.push(`brand=${brand}`);
    if (model) queryL.push(`model=${model}`);
    if (variant) queryL.push(`variant=${variant}`);
    if (version) queryL.push(`version=${version}`);
    if (description) queryL.push(`description=${description}`);
    if (parts) queryL.push(this._partsMToQuery(parts));
    if (initials) queryL.push(`initials=${initials}`);
    if (engraving) queryL.push(`engraving=${engraving}`);
    if (initialsExtra) {
        for (const extraS of this._generateExtraS(initialsExtra)) {
            queryL.push(`initials_extra=${extraS}`);
        }
    }
    return queryL.join("&");
};

ripe.Ripe.prototype._tuplesToParts = function(tuples) {
    const parts = [];
    for (const tuple of tuples) {
        const [name, material, color] = ripe.splitUnescape(tuple, ":", 2);
        const part = {
            name: name,
            material: material,
            color: color
        };
        parts.push(part);
    }
    return parts;
};

ripe.Ripe.prototype._partsToPartsM = function(parts) {
    const partsM = {};
    for (const part of parts) {
        const name = part.name;
        const material = part.material;
        const color = part.color;
        partsM[name] = {
            material: material,
            color: color
        };
    }
    return partsM;
};

ripe.Ripe.prototype._partsMToQuery = function(partsM, sort = true) {
    const queryL = [];
    const names = Object.keys(partsM);
    if (sort) names.sort();
    for (const name of names) {
        const part = partsM[name];
        const [nameE, initialsE, engravingE] = [
            ripe.escape(name, ":"),
            ripe.escape(part.material, ":"),
            ripe.escape(part.color, ":")
        ];
        const triplet = `${nameE}:${initialsE}:${engravingE}`;
        queryL.push(`p=${triplet}`);
    }
    return queryL.join("&");
};

ripe.Ripe.prototype._parseExtraS = function(extraS) {
    const extra = {};
    for (const extraI of extraS) {
        const [name, initials, engraving] = ripe.splitUnescape(extraI, ":", 2);
        extra[name] = {
            initials: initials,
            engraving: engraving || null
        };
    }
    return extra;
};

ripe.Ripe.prototype._generateExtraS = function(extra, sort = true) {
    const extraS = [];
    const names = Object.keys(extra);
    if (sort) names.sort();
    for (const name of names) {
        const values = extra[name];
        const [initials, engraving] = [values.initials, values.engraving];
        const [nameE, initialsE, engravingE] = [
            ripe.escape(name, ":"),
            ripe.escape(initials, ":"),
            ripe.escape(engraving || "", ":")
        ];
        const extraI = `${nameE}:${initialsE}:${engravingE}`;
        extraS.push(extraI);
    }
    return extraS;
};
