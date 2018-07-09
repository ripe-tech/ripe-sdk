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
