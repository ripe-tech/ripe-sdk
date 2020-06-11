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
 * Retrieves the complete set of OAuth elements to be used, such as:
 * the access_token, token_type, expires_in, refresh_token, scope and
 * tokens. Notice that both the scope and the tokens are retrieved providing
 * the ability to modify experience taking that into account.
 *
 * @param {String} code The OAuth code.
 * @param {Object} options An object of options to configure the request, such as
 * 'code', 'clientId', 'clientSecret', 'redirectUri' and the 'grantType'.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.oauthAccessToken = function(code, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}admin/oauth/access_token`;
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

/**
 * Retrieves the session identifier (SID) for the currently
 * active session, this is going to be used on all requests
 * to refer to the proper session.
 *
 * @param {String} accessToken The access token to be used.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.oauthLogin = function(accessToken, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}admin/oauth/login`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            access_token: accessToken
        }
    });
    return this._cacheURL(options.url, options, callback);
};
