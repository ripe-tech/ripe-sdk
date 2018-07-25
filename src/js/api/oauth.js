if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.oauthAccessToken = function(code, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "admin/oauth/access_token";
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            code: code,
            client_id: options.clientId || this.clientId,
            client_secret: options.clientSecret || this.clientSecret,
            redirect_uri: options.redirectUri || this.redirectUri,
            grant_type: options.grantType || this.grantType || "authorization_code"
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.oauthLogin = function(accessToken, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "admin/oauth/login";
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            access_token: accessToken
        }
    });
    return this._cacheURL(options.url, options, callback);
};
