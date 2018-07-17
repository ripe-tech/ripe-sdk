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
    var query = window.location.search || "";
    var unpacked = this._unpackQuery(query);
    var code = unpacked.code;
    return Boolean(code);
};

ripe.Ripe.prototype.isOAuthPending = function() {
    if (this.isAuth()) {
        return false;
    }
    return this.isOAuth() || this.isOAuthCode();
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

    var query = window.location.search || "";
    var unpacked = this._unpackQuery(query);
    var code = typeof options.code === "undefined" ? unpacked.code : options.code;

    var clientId = options.clientId || localStorage.getItem("oauth_client_id");
    var clientSecret = options.clientSecret || localStorage.getItem("oauth_client_secret");
    var redirectUri = options.redirectUri || localStorage.getItem("oauth_redirect_uri");
    var scope = options.scope || (localStorage.getItem("oauth_scope") || "").split(",") || [];
    var oauthToken = options.oauthToken || localStorage.getItem("oauth_token");

    scope && localStorage.setItem("oauth_scope", scope.join(","));

    if (oauthToken && clientId && clientSecret && redirectUri) {
        return this.oauthLogin(
            oauthToken,
            options,
            function(result) {
                if (result) {
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
            function(result) {
                if (result) {
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
    var location = window.location;
    var currentUrl =
        location.protocol + "//" + location.host + "/" + location.pathname.split("/")[1];

    var clientId = options.clientId || this.clientId;
    var clientSecret = options.clientSecret || this.clientSecret;
    var redirectUri = options.redirectUri || currentUrl;

    localStorage.setItem("oauth_client_id", clientId);
    localStorage.setItem("oauth_client_secret", clientSecret);
    localStorage.setItem("oauth_redirect_uri", redirectUri);

    var url = this.webUrl + "admin/oauth/authorize";

    var params = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: options.responseType || "code",
        scope: (options.scope || []).join(" ")
    };

    var data = this._buildQuery(params);
    url = url + "?" + data;

    document.location = url;
};
