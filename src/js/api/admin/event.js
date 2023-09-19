const base = require("../../base");
const ripe = base.ripe;

/**
 * Gets the existing events, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getEvents = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}admin/events`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the existing events, according to the provided filtering
 * strategy as normalized values.
 *
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The events list.
 */
ripe.Ripe.prototype.getEventsP = function(options) {
    return new Promise((resolve, reject) => {
        this.getEvents(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Creates an event on RIPE Core.
 *
 * @param {Object} event The event data.
 * @param {Object} options An object with options.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.createEvent = function(event, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}admin/events`;
    options = Object.assign(options, {
        url: url,
        method: "POST",
        auth: true,
        dataJ: event
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Creates an event on RIPE Core.
 *
 * @param {Object} event The event data.
 * @param {Object} options An object with options.
 * @returns {Promise} The event.
 */
ripe.Ripe.prototype.createEventP = function(event, options) {
    return new Promise((resolve, reject) => {
        this.createEvent(event, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Gets an existing event filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The event's ID.
 * @param {Object} options An object of options to configure the request.
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.getEvent = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}admin/events/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "GET",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets an existing event filtered by ID and according to the
 * provided filtering strategy as normalized values.
 *
 * @param {Number} id The event's ID.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The event requested by ID.
 */
ripe.Ripe.prototype.getEventP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.getEvent(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Updates an event on RIPE Core.
 *
 * @param {Object} event The event's data.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} Resulting information for the callback execution.
 */
ripe.Ripe.prototype.updateEvent = function(event, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}admin/events/${event.id}`;
    options = Object.assign(options, {
        url: url,
        method: "PUT",
        auth: true,
        dataJ: event
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Updates an event on RIPE Core.
 *
 * @param {Object} event The event's data.
 * @param {Object} options An object of options to configure the request.
 * @returns {Promise} The event's data.
 */
ripe.Ripe.prototype.updateEventP = function(event, options) {
    return new Promise((resolve, reject) => {
        this.updateEvent(event, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};

/**
 * Deletes an existing event.
 *
 * @param {Number} id The event's ID.
 * @param {Object} options An object of options to configure the request
 * @param {Function} callback Function with the result of the request.
 * @returns {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.deleteEvent = function(id, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = `${this.url}admin/events/${id}`;
    options = Object.assign(options, {
        url: url,
        method: "DELETE",
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Deletes an existing event.
 *
 * @param {Number} id The event's ID.
 * @param {Object} options An object of options to configure the request
 * @returns {Promise} The result of the event's deletion.
 */
ripe.Ripe.prototype.deleteEventP = function(id, options) {
    return new Promise((resolve, reject) => {
        this.deleteEvent(id, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request, null, result));
        });
    });
};
