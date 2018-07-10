if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

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

ripe.Ripe.prototype.oauth = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    options = options || {};

    if (!window.localStorage) {
        throw new Error("No support for localStorage available");
    }

    if (options.force) {
        localStorage.removeItem("oauth_token");
    }

    var clientId;
    var clientSecret;
    var redirectUri;

    var query = window.location.search || "";
    var unpacked = this._unpackQuery(query);

    var oauthToken = localStorage.getItem("oauth_token");

    if (oauthToken) {
        return this.oauthLogin(
            oauthToken,
            options,
            function(result) {
                this.sid = result.sid;
                this.trigger("auth");
                callback && callback(result);
            }.bind(this)
        );
    }

    if (unpacked.code) {
        clientId = options.clientId || localStorage.getItem("oauth_client_id");
        clientSecret = options.clientSecret || localStorage.getItem("oauth_client_secret");
        redirectUri = options.redirectUri || localStorage.getItem("oauth_redirect_uri");
        return this.oauthAccessToken(
            unpacked.code,
            {
                clientId: clientId,
                clientSecret: clientSecret,
                redirectUri: redirectUri
            },
            function(result) {
                localStorage.setItem("oauth_token", result.access_token);
                this.oauth(callback);
            }.bind(this)
        );
    }

    var location = window.location;
    var currentUrl =
        location.protocol + "//" + location.host + "/" + location.pathname.split("/")[1];

    clientId = options.clientId || this.clientId;
    clientSecret = options.clientSecret || this.clientSecret;
    redirectUri = options.redirectUri || currentUrl;

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
