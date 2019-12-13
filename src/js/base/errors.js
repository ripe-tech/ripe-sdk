if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" || typeof __webpack_require__ !== "undefined") // eslint-disable-line camelcase
) {
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
    this.responseText = request.responseText;
    this.message =
        message ||
        `Problem in remote operation (${
            this.code
                ? this.code
                : request.error
                ? request.error.message
                : this.responseText
                ? this.responseText
                : "unknown"
        })`;
    return this;
};
