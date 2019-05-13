if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @classdesc An error object for remote operations.
 */
ripe.RemoteError = function(request, message) {
    this.name = "RemoteError";
    this.request = request;
    this.code = request.status;
    this.status = request.status;
    this.response = request.response;
    this.message = message || `Problem in remote operation (${this.code ? this.code : "unknown"})`;
    return this;
};
