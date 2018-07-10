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

ripe.Ripe.prototype.oauth = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    if (!window.localStorage) {
        throw new Error("No support for localStorage available");
    }

    var oauthToken = localStorage.getItem("oauth_token");

    if (oauthToken) {
        // @todo support the call to the oauth auth endpoint
    } else {
        var url = this.webUrl + "admin/oauth/authorize";

        var params = {
            client_id: options.clientId || this.clientId,
            redirect_uri: options.redirectUri || document.location,
            response_type: options.responseType || "code",
            scope: ["feature1", "feature2"].join(" ")
        };

        var data = this._buildQuery(params);
        url = url + "?" + data;

        document.location = url;
    }
};
