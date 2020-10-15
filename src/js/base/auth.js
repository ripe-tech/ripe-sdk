if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @ignore
 */
ripe.Ripe.prototype.isAuth = function() {
    return Boolean(this.sid);
};

/**
 * @ignore
 */
ripe.Ripe.prototype.isOAuth = function() {
    if (!window.localStorage) {
        return false;
    }

    if (!localStorage.getItem("oauth_token")) {
        return false;
    }

    return true;
};

/**
 * @ignore
 */
ripe.Ripe.prototype.isOAuthCode = function() {
    const query = window.location.search || "";
    const unpacked = this._unpackQuery(query);
    const code = unpacked.code;
    return Boolean(code);
};

/**
 * @ignore
 */
ripe.Ripe.prototype.isOAuthError = function() {
    const query = window.location.search || "";
    const unpacked = this._unpackQuery(query);
    const error = unpacked.error;
    const errorDescription = unpacked.error_description;
    return Boolean(error) && Boolean(errorDescription);
};

/**
 * Checks if a successfully OAuth process has been fulfilled.
 *
 * @returns {Boolean} Boolean representing if an OAuth process has been fulfilled.
 */
ripe.Ripe.prototype.isOAuthPending = function() {
    if (this.isAuth()) {
        return false;
    }
    return this.isOAuth() || this.isOAuthCode() || this.isOAuthError();
};

/**
 * Responsible for the beginning of the (username, password)
 * based authentication process.
 *
 * @param {String} username The username to be authenticated.
 * @param {String} password The username's password.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.auth = function(username, password, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;

    this.signin(username, password, options, (result, isValid, request) => {
        this.sid = result.sid;
        this.username = result.username;
        this.tokens = result.tokens;
        this.trigger("auth");
        if (callback) callback(result, isValid, request);
    });
};

/**
 * Responsible for the beginning of the (username, password)
 * based authentication process.
 *
 * @param {String} username The username to be authenticated.
 * @param {String} password The username's password.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The authentication data.
 */
ripe.Ripe.prototype.authP = function(username, password, options) {
    return new Promise((resolve, reject) => {
        this.auth(username, password, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Responsible for the beginning of the (username, password)
 * based authentication process.
 *
 * This method uses the admin back-end instead of the RIPE
 * Core simple authentication system.
 *
 * @param {String} username The username to be authenticated.
 * @param {String} password The username's password.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.authAdmin = function(username, password, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;

    this.signinAdmin(username, password, options, (result, isValid, request) => {
        if (isValid) {
            this.sid = result.sid;
            this.username = result.username;
            this.tokens = result.tokens;
            this.trigger("auth");
        }
        if (callback) callback(result, isValid, request);
    });
};

/**
 * Responsible for the beginning of the (username, password)
 * based authentication process.
 *
 * This method uses the admin back-end instead of the RIPE
 * Core simple authentication system.
 *
 * @param {String} username The username to be authenticated.
 * @param {String} password The username's password.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The authentication data.
 */
ripe.Ripe.prototype.authAdminP = function(username, password, options) {
    return new Promise((resolve, reject) => {
        this.authAdmin(username, password, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Responsible for the beginning of the token based authentication process.
 *
 * @param {String} token The authentication token.
 * @param {Object} options An object of options to configure the authentication.
 * @param {Function} callback Function with the result of the authentication.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.authPid = function(token, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;

    this.signinPid(token, options, (result, isValid, request) => {
        if (isValid) {
            this.sid = result.sid;
            this.username = result.username;
            this.tokens = result.tokens;
            this.trigger("auth");
        }
        if (callback) callback(result, isValid, request);
    });
};

/**
 * Responsible for the beginning of the token based authentication process.
 *
 * @param {String} token The authentication token.
 * @param {Object} options An object of options to configure the authentication.
 * @returns {Promise} The authentication data.
 */
ripe.Ripe.prototype.authPidP = function(token, options) {
    return new Promise((resolve, reject) => {
        this.authPid(token, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Responsible for the beginning of the key based authentication process.
 *
 * This method uses the admin back-end instead of the RIPE
 * Core simple authentication system.
 *
 * @param {String} key The key to authenticate with.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.authKey = function(key, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;

    this.key = key;
    this.accountMe(options, (result, isValid, request) => {
        if (isValid) this.trigger("auth");
        if (callback) callback(result, isValid, request);
    });
};

/**
 * Responsible for the beginning of the key based authentication process.
 *
 * This method uses the admin back-end instead of the RIPE
 * Core simple authentication system.
 *
 * @param {String} key The key to authenticate with.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {Promise} The authenticated account data.
 */
ripe.Ripe.prototype.authKeyP = function(key, options) {
    return new Promise((resolve, reject) => {
        this.authKey(key, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Responsible for the beginning of the unauth process, triggering the 'unauth' event.
 *
 * @param {Object} options The set of options used for unauth process.
 * @param {Function} callback The callback to be called once session is unauth'ed.
 */
ripe.Ripe.prototype.unauth = function(options, callback) {
    this.sid = null;
    this.username = null;
    this.tokens = null;

    if (window.localStorage) {
        localStorage.removeItem("oauth_token");
        localStorage.removeItem("oauth_scope");
        localStorage.removeItem("oauth_client_id");
        localStorage.removeItem("oauth_client_secret");
        localStorage.removeItem("oauth_redirect_uri");
    }

    this.trigger("unauth");
    if (callback) callback();
};

/**
 * Responsible for the beginning of the OAuth based authentication process
 * may either start the redirection process (in case no valid token is found)
 * or try to revalidate the session with the currently existing tokens or session ID.
 *
 * @param {Object} options The set of options used for the OAuth process, should
 * include client identifier and secret.
 * @param {Function} callback The callback to be called once the logging or the access
 * token retrieval functions are finished.
 * @returns {oauthAccessToken} Either an invalid/unset value or the result of the login operation.
 */
ripe.Ripe.prototype.oauth = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = options || {};

    if (!window.localStorage) {
        throw new Error("No support for local storage available");
    }

    if (options.force) {
        this.unauth();
    }

    const query = window.location.search || "";
    const unpacked = this._unpackQuery(query);
    const code = typeof options.code === "undefined" ? unpacked.code : options.code;
    const error = typeof options.error === "undefined" ? unpacked.error : options.error;
    const errorDescription =
        typeof options.error_description === "undefined"
            ? unpacked.error_description
            : options.error_description;

    if (error || errorDescription) {
        throw new Error(`OAuth error ${error} '${errorDescription}'`);
    }

    const clientId =
        options.clientId || (window.localStorage && localStorage.getItem("oauth_client_id"));
    const clientSecret =
        options.clientSecret ||
        (window.localStorage && localStorage.getItem("oauth_client_secret"));
    const redirectUri =
        options.redirectUri || (window.localStorage && localStorage.getItem("oauth_redirect_uri"));
    const scope =
        options.scope ||
        ((window.localStorage && localStorage.getItem("oauth_scope")) || "").split(",") ||
        [];
    const oauthToken =
        options.oauthToken || (window.localStorage && localStorage.getItem("oauth_token"));

    scope && window.localStorage && localStorage.setItem("oauth_scope", scope.join(","));

    if (oauthToken && clientId && clientSecret && redirectUri) {
        return this.oauthLogin(oauthToken, options, (result, isValid, request) => {
            if (isValid && result) {
                this.sid = result.sid;
                this.username = result.username;
                this.tokens = result.tokens;
                this.trigger("auth");
                if (callback) callback(result, isValid, request);
            } else {
                this.oauth(
                    {
                        clientId: clientId,
                        clientSecret: clientSecret,
                        redirectUri: redirectUri,
                        scope: scope,
                        code: null,
                        force: true
                    },
                    callback
                );
            }
        });
    }

    if (code && clientId && clientSecret && redirectUri) {
        return this.oauthAccessToken(
            code,
            {
                clientId: clientId,
                clientSecret: clientSecret,
                redirectUri: redirectUri
            },
            (result, isValid) => {
                if (isValid && result) {
                    window.localStorage && localStorage.setItem("oauth_token", result.access_token);
                    result.scope &&
                        window.localStorage &&
                        localStorage.setItem("oauth_scope", result.scope.join(","));
                    this.oauth(callback);
                } else {
                    this.oauth(
                        {
                            clientId: clientId,
                            clientSecret: clientSecret,
                            redirectUri: redirectUri,
                            scope: scope,
                            code: null,
                            force: true
                        },
                        callback
                    );
                }
            }
        );
    }

    return this.oauthRedirect(options, callback);
};

/**
 * @ignore
 */
ripe.Ripe.prototype.oauthRedirect = function(options, callback) {
    const location = window.location;
    const currentUrl =
        location.protocol + "//" + location.host + "/" + location.pathname.split("/")[1];

    const clientId = options.clientId || this.clientId;
    const clientSecret = options.clientSecret || this.clientSecret;
    const redirectUri = options.redirectUri || currentUrl;

    if (window.localStorage) {
        localStorage.setItem("oauth_client_id", clientId);
        localStorage.setItem("oauth_client_secret", clientSecret);
        localStorage.setItem("oauth_redirect_uri", redirectUri);
    }

    let url = this.webUrl + "admin/oauth/authorize";

    const params = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: options.responseType || "code",
        scope: (options.scope || []).join(" ")
    };

    const data = this._buildQuery(params);
    url = url + "?" + data;

    document.location = url;
};
