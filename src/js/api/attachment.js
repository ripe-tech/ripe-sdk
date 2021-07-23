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
 * Returns the URL that redirects to where an attachment is hosted,
 * using the provided secret key as reference.
 *
 * @param {String} key The secret key to be used in attachment retrieval.
 * @param {Object} options A map with options for the URL building.
 * @returns {String} The URL that can be used to view an attachment.
 */
ripe.Ripe.prototype.getAttachmentOrderUrl = function(key, options) {
    options = options === undefined ? {} : options;
    const url = `${this.webUrl}attachments/${key}/data`;
    options = Object.assign(options, { url: url });
    return options.url + "?" + this._buildQuery(options.params);
};
