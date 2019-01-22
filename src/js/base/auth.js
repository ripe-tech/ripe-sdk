if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.isAuth = function() {
    return Boolean(this.sid);
};

ripe.Ripe.prototype.isOAuth = function() {
    if (!window.localStorage) {
        return false;
    }

    if (!localStorage.getItem("oauth_token")) {
        return false;
    }

    return true;
};

ripe.Ripe.prototype.isOAuthCode = function() {
    const query = window.location.search || "";
    const unpacked = this._unpackQuery(query);
    const code = unpacked.code;
    return Boolean(code);
};

ripe.Ripe.prototype.isOAuthError = function() {
    const query = window.location.search || "";
    const unpacked = this._unpackQuery(query);
    const error = unpacked.error;
    const errorDescription = unpacked.error_description;
    return Boolean(error) && Boolean(errorDescription);
};

ripe.Ripe.prototype.isOAuthPending = function() {
    if (this.isAuth()) {
        return false;
    }
    return this.isOAuth() || this.isOAuthCode() || this.isOAuthError();
};

ripe.Ripe.prototype.auth = function(username, password, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    this.signin(
        username,
        password,
        options,
        function(result) {
            this.sid = result.sid;
            this.trigger("auth");
            callback && callback(result);
        }.bind(this)
    );
};

ripe.Ripe.prototype.unauth = function(options, callback) {
    this.sid = null;

    localStorage.removeItem("oauth_token");
    localStorage.removeItem("oauth_scope");
    localStorage.removeItem("oauth_client_id");
    localStorage.removeItem("oauth_client_secret");
    localStorage.removeItem("oauth_redirect_uri");

    this.trigger("unauth");
    callback && callback();
};

/**
 * Responsible for the begining of the OAuth based authentication process
 * may either start the redirection process (in case no valid token is found)
 * or try to revalidate the session with the currently existing tokens or session ID.
 *
 * @param {Object} options The set of options used for the OAuth process, should
 * include client identifier and secret.
 * @param {Function} callback The callback to be called once the loging or the access
 * token retrieval functions are finished.
 * @returns {Object} Either an invalid/unset value or the result of the login operation.
 */
ripe.Ripe.prototype.oauth = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
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

    const clientId = options.clientId || localStorage.getItem("oauth_client_id");
    const clientSecret = options.clientSecret || localStorage.getItem("oauth_client_secret");
    const redirectUri = options.redirectUri || localStorage.getItem("oauth_redirect_uri");
    const scope = options.scope || (localStorage.getItem("oauth_scope") || "").split(",") || [];
    const oauthToken = options.oauthToken || localStorage.getItem("oauth_token");

    scope && localStorage.setItem("oauth_scope", scope.join(","));

    if (oauthToken && clientId && clientSecret && redirectUri) {
        return this.oauthLogin(
            oauthToken,
            options,
            function(result, isValid) {
                if (isValid && result) {
                    this.sid = result.sid;
                    this.trigger("auth");
                    callback && callback(result);
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
            }.bind(this)
        );
    }

    if (code && clientId && clientSecret && redirectUri) {
        return this.oauthAccessToken(
            code,
            {
                clientId: clientId,
                clientSecret: clientSecret,
                redirectUri: redirectUri
            },
            function(result, isValid) {
                if (isValid && result) {
                    localStorage.setItem("oauth_token", result.access_token);
                    result.scope && localStorage.setItem("oauth_scope", result.scope.join(","));
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
            }.bind(this)
        );
    }

    return this.oauthRedirect(options, callback);
};

ripe.Ripe.prototype.oauthRedirect = function(options, callback) {
    const location = window.location;
    const currentUrl =
        location.protocol + "//" + location.host + "/" + location.pathname.split("/")[1];

    const clientId = options.clientId || this.clientId;
    const clientSecret = options.clientSecret || this.clientSecret;
    const redirectUri = options.redirectUri || currentUrl;

    localStorage.setItem("oauth_client_id", clientId);
    localStorage.setItem("oauth_client_secret", clientSecret);
    localStorage.setItem("oauth_redirect_uri", redirectUri);

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
