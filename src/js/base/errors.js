if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @classdesc An error object for a runtime problem.
 */
ripe.RuntimeError = function(message = null, error = null) {
    this.name = "RuntimeError";
    this.error = error;
    this.message = message || `Runtime error (${this.error ? this.error.message : "unknown"})`;
    return this;
};

/**
 * @class
 * @classdesc An error object for an operational problem.
 */
ripe.OperationalError = function(message = null, error = null) {
    this.name = "OperationalError";
    this.error = error;
    this.message = message || `Operational error (${this.error ? this.error.message : "unknown"})`;
    return this;
};

/**
 * @class
 * @classdesc An error object for an action exception.
 */
ripe.ActionException = function(message = null, error = null, critical = false) {
    this.name = "ActionException";
    this.error = error;
    this.message = message || `Action exception (${this.error ? this.error.message : "unknown"})`;
    this.critical = critical;
    return this;
};

/**
 * @class
 * @classdesc An error object for remote operations.
 */
ripe.RemoteError = function(request, message = null, result = {}, debug = false) {
    this.name = "RemoteError";
    this.request = request;
    this.code = request.status;
    this.status = request.status;
    this.response = request.response;
    this.responseText = request.responseText;
    this.result = result;
    this.resultMessage = result ? result.message : null;
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
    if (this.resultMessage) {
        this.message += ` - ${this.resultMessage}`;
    }
    if (debug && this.result) {
        this.message += "\n" + JSON.stringify(this.result, null, 2);
    }
    return this;
};
