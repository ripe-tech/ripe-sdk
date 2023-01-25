if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("./base");
    // eslint-disable-next-line no-redeclare,no-var
    var compat = require("./compat");
    require("./ripe");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
    // eslint-disable-next-line no-redeclare,no-var
    var fetch = compat.fetch;
    // eslint-disable-next-line no-redeclare,no-var
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
    options.noBundles = typeof options.noBundles === "undefined" ? true : options.noBundles;
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
 * Retrieves summary information about the Core server-side
 * (such as version, description and others).
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.info = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}info`;
    options = Object.assign(options, {
        url: url,
        method: "GET"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Retrieves summary information about the Core server-side
 * (such as version, description and others).
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} Summary information of the RIPE server.
 */
ripe.Ripe.prototype.infoP = function(options) {
    return new Promise((resolve, reject) => {
        this.info(options, (result, isValid, request) => {
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
    this.username = username;
    this.password = password;
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
    this.pid = token;
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
        this.signinPid(token, options, (result, isValid, request) => {
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
 * Retrieves the price for a set of customizations.
 *
 * @param {Object} options An Object containing customization information that
 * can be used not only to override the current customization, allowing to set
 * the brand', 'model', but also to provide the config list to fetch the price
 * for.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getPrices = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getPricesOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.getPricesP = function(options) {
    return new Promise((resolve, reject) => {
        this.getPrices(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the video of a model's customization.
 *
 * @param {Object} options An object containing the information required
 * to get a video for a model, more specifically `brand`, `model`, `name`
 * of the video and `p` containing the model's customization.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getVideo = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getVideoOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the video of a model's customization.
 *
 * @param {Object} options An object containing the information required
 * to get a video for a model, more specifically `brand`, `model`, `name`
 * of the video and `p` containing the model's customization.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The URL path to the video.
 */
ripe.Ripe.prototype.getVideoP = function(options) {
    return new Promise((resolve, reject) => {
        this.getVideo(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Returns the video thumbnail image of a model's customization.
 *
 * @param {Object} options An object containing the information required
 * to get the thumbnail of a video for a model, more specifically `brand`,
 * `model`, `name` of the video and `p` containing the model's customization.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getVideoThumbnail = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getVideoThumbnailOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Returns the video thumbnail image of a model's customization.
 *
 * @param {Object} options An object containing the information required
 * to get a video for a model, more specifically `brand`, `model`, `name`
 * of the video and `p` containing the model's customization.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The URL path to the video thumbnail image.
 */
ripe.Ripe.prototype.getVideoThumbnailP = function(options) {
    return new Promise((resolve, reject) => {
        this.getVideoThumbnail(options, (result, isValid, request) => {
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

    // determines the number of retries left for the request operation
    // this is going to be used in case there's an auth related error
    let retries = options.retries;
    retries = typeof retries === "undefined" ? 1 : retries;

    // determines if the current request should be cached, obeys
    // some of the basic rules for that behaviour
    let cached = options.cached;
    cached = typeof cached === "undefined" ? this.options.cached : cached;
    cached = typeof cached === "undefined" ? true : cached;
    cached = cached && !options.force && ["GET"].indexOf(options.method || "GET") !== -1;

    // determines the correct callback to be called once an auth
    // related problem occurs, defaulting to the base one in case
    // none is passed via options object
    const authCallback = options.authCallback || this.authCallback || this._authCallback;

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
    return this._requestURL(url, options, (result, request, flags = {}) => {
        // unpacks the flags parameters into the components that
        // are going to be used for processing
        const { isValid, isAuthError } = flags;

        // in case the error found in the request qualifies as an
        // authentication one and there are retries left then tries
        // the authentication callback and retries the request
        if (isAuthError && retries > 0) {
            return authCallback(extraParams => {
                options.retries = retries - 1;
                options.params = { ...options.params, ...extraParams };
                return this._cacheURL(url, options, callback);
            });
        }

        // in case the result of the request is valid and caching
        // has been request set the cache value for the full key
        // with the result of the request
        if (isValid && cached) this._cache[fullKey] = result;

        // in case a callback is set then calls it with the expected
        // set of parameters (should include the original request object)
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
    const dataM = options.dataM || null;
    let contentType = options.contentType || null;
    const validCodes = options.validCodes || [200];
    const authErrorCodes = options.authErrorCodes || [401, 403, 440, 499];
    const credentials = options.credentials || "omit";
    const keepAlive = options.keepAlive === undefined ? true : options.keepAlive;

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
    } else if (dataM !== null) {
        url += separator + query;
        [contentType, data] = this._encodeMultipart(dataM, contentType, true);
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
        credentials: credentials,
        keepAlive: keepAlive
    });

    response
        .then(async response => {
            let result = null;
            const isValid = validCodes.includes(response.status);
            const isAuthError = authErrorCodes.includes(response.status);
            const contentType = response.headers.get("content-type").toLowerCase();
            try {
                if (contentType.startsWith("application/json")) {
                    result = await response.json();
                } else if (contentType.startsWith("text/")) {
                    result = await response.text();
                } else {
                    result = await response.blob();
                }
            } catch (error) {
                response.error = response.error || error;
                callback.call(context, result, response, {
                    isValid: isValid,
                    isAuthError: isAuthError
                });
                return;
            }
            if (callback) {
                callback.call(context, result, response, {
                    isValid: isValid,
                    isAuthError: isAuthError
                });
            }
        })
        .catch(error => {
            response.error = response.error || error;
            if (callback) {
                callback.call(context, null, response, {
                    isValid: false,
                    isAuthError: false
                });
            }
        });

    return response;
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
    const dataM = options.dataM || null;
    let contentType = options.contentType || null;
    const timeout = options.timeout || 10000;
    const timeoutConnect = options.timeoutConnect || parseInt(timeout / 2);
    const validCodes = options.validCodes || [200];
    const authErrorCodes = options.authErrorCodes || [401, 403, 440, 499];
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
    } else if (dataM !== null) {
        throw new Error("Multipart is not supported using legacy");
    } else {
        data = query;
        contentType = "application/x-www-form-urlencoded";
    }

    const request = new XMLHttpRequest();
    request.timeout = timeoutConnect;
    request.callback = callback;
    request.validCodes = validCodes;
    request.authErrorCodes = authErrorCodes;
    request.withCredentials = withCredentials;

    request.addEventListener("load", function() {
        let result = null;
        const isValid = this.validCodes.includes(this.status);
        const isAuthError = this.authErrorCodes.includes(this.status);
        try {
            result = JSON.parse(this.responseText);
        } catch (error) {
            result = this.responseText;
        }
        if (this.callback) {
            this.callback.call(context, result, this, {
                isValid: isValid,
                isAuthError: isAuthError
            });
        }
        if (this.timeoutHandler) {
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    });

    request.addEventListener("error", function(error) {
        request.error = request.error || error;
        if (this.callback) {
            this.callback.call(context, null, this, {
                isValid: false,
                isAuthError: false
            });
        }
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
ripe.Ripe.prototype._authCallback = function(callback) {
    if (this.username && this.password) {
        this.signin(this.username, this.password, undefined, () => {
            if (callback) callback();
        });
        return;
    }
    if (this.pid) {
        this.signinPid(this.pid, undefined, () => {
            if (callback) callback();
        });
        return;
    }
    if (callback) callback();
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
    const version = options.version === undefined ? this.version : options.version;
    const variant = options.variant === undefined ? this.variant : options.variant;
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

    if (version !== undefined && version !== null) {
        params.version = version;
    }

    if (variant !== undefined && variant !== null) {
        params.variant = variant;
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

    if (parts !== undefined && parts !== null && Object.keys(parts).length > 0) {
        params.p = this._partsMToTriplets(parts);
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

    if (initials !== undefined && initials !== null && initials !== "") {
        params.initials = initials;
    }

    if (engraving !== undefined && engraving !== null) {
        params.engraving = engraving;
    }

    if (
        initialsExtra !== undefined &&
        initialsExtra !== null &&
        Object.keys(initialsExtra).length > 0
    ) {
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
 */
ripe.Ripe.prototype._getPricesOptions = function(options = {}) {
    options = this._getQueryOptions(options);

    const params = options.params || {};
    options.params = params;

    // delete the engraving and the part list from the params,
    // since they have to be specified for each item in the
    // config list
    delete options.params.engraving;
    delete options.params.p;

    let index = 0;
    options.configs.forEach(config => {
        let parts = config.parts;
        let initials = config.initials;
        let engraving = config.engraving;
        parts = parts === undefined ? this.parts : parts;
        initials = initials === undefined ? this.initials : initials;
        initials = initials === "" ? "$empty" : initials;
        engraving = engraving === undefined ? this.engraving : engraving;

        if (parts !== undefined && parts !== null && Object.keys(parts).length > 0) {
            options.params[`p${index}`] = this._partsMToTriplets(parts);
        }
        if (engraving !== undefined && engraving !== null) {
            options.params[`engraving${index}`] = engraving;
        }

        if (initials !== undefined && initials !== null) {
            options.params[`initials${index}`] = initials;
        }

        index++;
    });

    const url = `${this.url}config/prices`;
    options = Object.assign(options, {
        url: url,
        method: "GET"
    });

    return options;
};

/**
 * Returns the required options for requesting a video of a model's
 * customization.
 *
 * @param {Object} options An object containing the information required
 * to get a video for a model, more specifically `brand`, `model`, `name`
 * of the video and `p` containing the model's customization.
 * @returns {Object} The options for requesting a video.
 */
ripe.Ripe.prototype._getVideoOptions = function(options = {}) {
    options = this._getQueryOptions(options);

    const params = options.params || {};
    options.params = params;

    const name = options.name === undefined ? undefined : options.name;
    if (name !== undefined && name !== null) {
        options.params.name = name;
    }

    const url = `${this.url}video`;
    options = Object.assign(options, {
        url: url,
        method: "GET"
    });

    return options;
};

/**
 * Returns the required options for requesting a thumbnail image of a
 * model's customization.
 *
 * @param {Object} options An object containing the information required
 * to get the thumbnail of a video for a model, more specifically `brand`,
 * `model`, `name` of the video and `p` containing the model's customization.
 * @returns {Object} The options for requesting a thumbnail image of a video.
 */
ripe.Ripe.prototype._getVideoThumbnailOptions = function(options = {}) {
    options = this._getQueryOptions(options);

    const params = options.params || {};
    options.params = params;

    const name = options.name === undefined ? undefined : options.name;
    if (name !== undefined && name !== null) {
        options.params.name = name;
    }

    const url = `${this.url}video/thumbnail`;
    options = Object.assign(options, {
        url: url,
        method: "GET"
    });

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
    options.full = options.full === undefined ? false : options.full;

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

    if (options.rotation !== undefined && options.rotation !== null) {
        params.rotation = options.rotation;
    }

    if (options.flip !== undefined && options.flip !== null) {
        params.flip = options.flip;
    }

    if (options.mirror !== undefined && options.mirror !== null) {
        params.mirror = options.mirror;
    }

    if (options.boundingBox !== undefined && options.boundingBox !== null) {
        params.bounding_box = options.boundingBox;
    }

    if (options.algorithm !== undefined && options.algorithm !== null) {
        params.algorithm = options.algorithm;
    }

    if (options.background !== undefined && options.background !== null) {
        params.background = options.background;
    }

    if (options.engine !== undefined && options.engine !== null) {
        params.engine = options.engine;
    }

    if (options.initialsX !== undefined && options.initialsX !== null) {
        params.initials_x = options.initialsX;
    }

    if (options.initialsY !== undefined && options.initialsY !== null) {
        params.initials_y = options.initialsY;
    }

    if (options.initialsWidth !== undefined && options.initialsWidth !== null) {
        params.initials_width = options.initialsWidth;
    }

    if (options.initialsHeight !== undefined && options.initialsHeight !== null) {
        params.initials_height = options.initialsHeight;
    }

    if (options.initialsViewport !== undefined && options.initialsViewport !== null) {
        params.initials_viewport = options.initialsViewport;
    }

    if (options.initialsColor !== undefined && options.initialsColor !== null) {
        params.initials_color = options.initialsColor;
    }

    if (options.initialsOpacity !== undefined && options.initialsOpacity !== null) {
        params.initials_opacity = options.initialsOpacity;
    }

    if (options.initialsAlign !== undefined && options.initialsAlign !== null) {
        params.initials_align = options.initialsAlign;
    }

    if (options.initialsVertical !== undefined && options.initialsVertical !== null) {
        params.initials_vertical = options.initialsVertical;
    }

    if (options.initialsEmbossing !== undefined && options.initialsEmbossing !== null) {
        params.initials_embossing = options.initialsEmbossing;
    }

    if (options.initialsRotation !== undefined && options.initialsRotation !== null) {
        params.initials_rotation = options.initialsRotation;
    }

    if (options.initialsZindex !== undefined && options.initialsZindex !== null) {
        params.initials_z_index = options.initialsZindex;
    }

    if (options.initialsAlgorithm !== undefined && options.initialsAlgorithm !== null) {
        params.initials_algorithm = options.initialsAlgorithm;
    }

    if (options.initialsBlendColor !== undefined && options.initialsBlendColor !== null) {
        params.initials_blend_color = options.initialsBlendColor;
    }

    if (options.initialsPattern !== undefined && options.initialsPattern !== null) {
        params.initials_pattern = options.initialsPattern;
    }

    if (options.initialsTexture !== undefined && options.initialsTexture !== null) {
        params.initials_texture = options.initialsTexture;
    }

    if (options.initialsExclusion !== undefined && options.initialsExclusion !== null) {
        params.initials_exclusion = options.initialsExclusion;
    }

    if (options.initialsInclusion !== undefined && options.initialsInclusion !== null) {
        params.initials_inclusion = options.initialsInclusion;
    }

    if (options.initialsImageRotation !== undefined && options.initialsImageRotation !== null) {
        params.initials_image_rotation = options.initialsImageRotation;
    }

    if (options.initialsImageFlip !== undefined && options.initialsImageFlip !== null) {
        params.initials_image_flip = options.initialsImageFlip;
    }

    if (options.initialsImageMirror !== undefined && options.initialsImageMirror !== null) {
        params.initials_image_mirror = options.initialsImageMirror;
    }

    if (options.debug !== undefined && options.debug !== null) {
        params.debug = options.debug;
    }

    if (options.fontFamily !== undefined && options.fontFamily !== null) {
        params.font_family = options.fontFamily;
    }

    if (options.fontWeight !== undefined && options.fontWeight !== null) {
        params.font_weight = options.fontWeight;
    }

    if (options.fontSize !== undefined && options.fontSize !== null) {
        params.font_size = options.fontSize;
    }

    if (options.fontSpacing !== undefined && options.fontSpacing !== null) {
        params.font_spacing = options.fontSpacing;
    }

    if (options.fontTrim !== undefined && options.fontTrim !== null) {
        params.font_trim = options.fontTrim;
    }

    if (options.fontMask !== undefined && options.fontMask !== null) {
        params.font_mask = options.fontMask;
    }

    if (options.fontMode !== undefined && options.fontMode !== null) {
        params.font_mode = options.fontMode;
    }

    if (options.lineHeight !== undefined && options.lineHeight !== null) {
        params.line_height = options.lineHeight;
    }

    if (options.lineBreaking !== undefined && options.lineBreaking !== null) {
        params.line_breaking = options.lineBreaking;
    }

    if (options.initialsOverflow !== undefined && options.initialsOverflow !== null) {
        params.initials_overflow = options.initialsOverflow;
    }

    if (options.shadow !== undefined && options.shadow !== null) {
        params.shadow = options.shadow;
    }

    if (options.shadowColor !== undefined && options.shadowColor !== null) {
        params.shadow_color = options.shadowColor;
    }

    if (options.shadowOffset !== undefined && options.shadowOffset !== null) {
        params.shadow_offset = options.shadowOffset;
    }

    if (options.offsets !== undefined && options.offsets !== null) {
        params.offsets = JSON.stringify(options.offsets);
    }

    if (options.curve !== undefined && options.curve !== null) {
        params.curve = JSON.stringify(options.curve);
    }

    if (options.curves !== undefined && options.curves !== null) {
        params.curves = JSON.stringify(options.curves);
    }

    if (options.logic !== undefined && options.logic !== null) {
        params.logic = options.logic;
    }

    if (options.options !== undefined && options.options !== null) {
        params.options = options.options;
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
    options.full = options.full === undefined ? false : options.full;

    options = this._getQueryOptions(options);

    const params = options.params || {};
    options.params = params;

    if (options.part !== undefined && options.part !== null) {
        params.part = options.part;
    }
    if (options.size !== undefined && options.size !== null) {
        params.size = options.size;
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

    if (options.retina !== undefined && options.retina !== null) {
        params.retina = options.retina ? "1" : "0";
    }

    if (options.variant !== undefined && options.variant !== null) {
        params.variant = options.variant;
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
 * Returns the URL for a video based on the given name and the provided
 * customization.
 *
 * @param {Object} options An object containing the information required
 * to get a video for a model, more specifically `brand`, `model`, `name`
 * of the video and `p` containing the model's customization.
 * @returns {String} The URL to the video.
 */
ripe.Ripe.prototype._getVideoURL = function(options) {
    options = this._getVideoOptions(options);
    return options.url + "?" + this._buildQuery(options.params);
};

/**
 * Returns the URL for the thumbnail image of a video based on the given
 * name and the provided customization.
 *
 * @param {Object} options An object containing the information required
 * to get a video for a model, more specifically `brand`, `model`, `name`
 * of the video and `p` containing the model's customization.
 * @returns {String} The URL to the video thumbnail image.
 */
ripe.Ripe.prototype._getVideoThumbnailURL = function(options) {
    options = this._getVideoThumbnailOptions(options);
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
        const authCallback = options.authCallback || this.authCallback;
        if (authCallback) authCallback();
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

    params = typeof params === "undefined" ? {} : params;

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
    let tuples = options.p || [];
    initialsExtra = Array.isArray(initialsExtra) ? initialsExtra : [initialsExtra];
    initialsExtra = this._parseExtraS(initialsExtra);
    tuples = Array.isArray(tuples) ? tuples : [tuples];
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

ripe.Ripe.prototype._queryToImageUrl = function(query, options) {
    const spec = this._queryToSpec(query);
    return this._getImageURL({ ...spec, ...options });
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
    const queryL = this._partsMToTriplets(partsM, sort).map(triplet => `p=${triplet}`);
    return queryL.join("&");
};

ripe.Ripe.prototype._partsMToTriplets = function(partsM, sort = true) {
    const triplets = [];
    const names = Object.keys(partsM);
    if (sort) names.sort();
    for (const name of names) {
        const part = partsM[name];
        const [nameE, initialsE, engravingE] = [
            ripe.escape(name, ":"),
            ripe.escape(part.material, ":"),
            ripe.escape(part.color, ":")
        ];
        triplets.push(`${nameE}:${initialsE}:${engravingE}`);
    }
    return triplets;
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

ripe.Ripe.prototype._generateExtraS = function(extra, sort = true, minimize = true) {
    const extraS = [];
    const names = Object.keys(extra);
    if (sort) names.sort();
    for (const name of names) {
        const values = extra[name];
        const [initials, engraving] = [values.initials, values.engraving];
        if (!initials && minimize) continue;
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

ripe.Ripe.prototype._encodeMultipart = function(fields, mime = null, doseq = false) {
    mime = mime || "multipart/form-data";

    const boundary = this._createBoundary(fields, undefined, doseq);

    const encoder = new TextEncoder("utf-8");

    const buffer = [];

    for (let [key, values] of Object.entries(fields)) {
        const isList = doseq && Array.isArray(values);
        values = isList ? values : [values];

        for (let value of values) {
            if (value === null) continue;

            let header;

            if (
                typeof value === "object" &&
                !(value instanceof Array) &&
                value.constructor !== Uint8Array
            ) {
                const headerL = [];
                let data = null;
                for (const [key, item] of Object.entries(value)) {
                    if (key === "data") data = item;
                    else headerL.push(`${key}: ${item}`);
                }
                value = data;
                header = headerL.join("\r\n");
            } else if (value instanceof Array) {
                let name = null;
                let contents = null;
                let contentTypeD = null;
                if (value.length === 2) [name, contents] = value;
                else [name, contentTypeD, contents] = value;
                header = `Content-Disposition: form-data; name="${key}"; filename="${name}"`;
                if (contentTypeD) header += `\r\nContent-Type: ${contentTypeD}`;
                value = contents;
            } else {
                header = `Content-Disposition: form-data; name="${key}"`;
                value = value.constructor === Uint8Array ? value : encoder.encode(value);
            }

            buffer.push(encoder.encode("--" + boundary + "\r\n"));
            buffer.push(encoder.encode(header + "\r\n"));
            buffer.push(encoder.encode("\r\n"));
            buffer.push(value);
            buffer.push(encoder.encode("\r\n"));
        }
    }

    buffer.push(encoder.encode("--" + boundary + "--\r\n"));
    buffer.push(encoder.encode("\r\n"));
    const body = this._joinBuffer(buffer);
    const contentType = `${mime}; boundary=${boundary}`;

    return [contentType, body];
};

ripe.Ripe.prototype._createBoundary = function(fields, size = 32, doseq = false) {
    return "Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs";
};

ripe.Ripe.prototype._joinBuffer = function(bufferArray) {
    const bufferSize = bufferArray.map(item => item.byteLength).reduce((a, v) => a + v, 0);
    const buffer = new Uint8Array(bufferSize);
    let offset = 0;
    for (const item of bufferArray) {
        buffer.set(item, offset);
        offset += item.byteLength;
    }
    return buffer;
};
