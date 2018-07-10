if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.auth = function(username, password, callback) {
    this.signin(
        username,
        password,
        function(result) {
            this.sid = result.sid;
            this.trigger("auth");
            callback && callback(result);
        }.bind(this)
    );
};

ripe.Ripe.prototype.oauth = function(callback) {
    if (!window.localStorage) {
        throw new Error("No support for localStorage available");
    }

    var oauthToken = localStorage.getItem("oauth_token");

    if (oauthToken) {
        // @todo tentar chamar o oauth login para obter o sid
        // como deve de ser
    } else {
        var url = this.webUrl + "admin/oauth/authorize";

        var params = {
            client_id: this.clientId,
            redirect_uri: document.location,
            response_type: "code",
            scope: ["feature1", "feature2"].join(" ")
        };

        var data = this._buildQuery(params);
        url = url + "?" + data;

        document.location = url;
    }
};
