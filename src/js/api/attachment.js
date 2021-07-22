if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("../base");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
}


/**
 * Returns the URL that redirects to where an attachment is hosted.
 *
 * @param {Object} options A map with options, such as:
 *  - 'key' - The key of the attachment.
 * @returns {String} The URL that can be used to view an attachment.
 */
 ripe.Ripe.prototype.getAttachmentOrderUrl = function(options = {}) {
    options = this._getAttachmentOptions(options);
    return options.url;
};

/**
 * @ignore
 */
 ripe.Ripe.prototype._getAttachmentOptions = function(options = {}) {
    const key = options.key;
    const url = `${this.webUrl}attachments/${key}/data`;
    const params = options.params || {};
    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};
