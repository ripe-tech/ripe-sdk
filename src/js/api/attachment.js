const base = require("../base");
const ripe = base.ripe;

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
