if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @classdesc An object that emits events.
 * Listeners can bind to specific events and
 * be notified when the event is triggered.
 */
ripe.Observable = function() {
    this.callbacks = {};
};

/**
 * @ignore
 */
ripe.Observable.prototype.init = function() {};

/**
 *
 * Binds to an event by providing a block that will receive the event payload as a
 * parameter and return a Deferred that will be completed asynchronously.
 *
 * @param {String} event Name of the event to bind to.
 * @param {Function} callback Function to be executed when the event is triggered.
 * @returns {Function} Returns the provided callback, to be used when unbinding from the event.
 */
ripe.Observable.prototype.addCallback = function(event, callback) {
    const callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
    return callback;
};

/**
 * Unbinds the provided callback from an event.
 *
 * @param {String} event The name of the event.
 * @param {Function} callback The callback that was returned when the bind method was called.
 */
ripe.Observable.prototype.removeCallback = function(event, callback) {
    const callbacks = this.callbacks[event] || [];
    if (!callback) {
        delete this.callbacks[event];
        return;
    }

    const index = callbacks.indexOf(callback);
    if (index === -1) {
        return;
    }
    callbacks.splice(index, 1);
    this.callbacks[event] = callbacks;
};

/**
 * Triggers the event by calling all its bound callbacks with args as parameters.
 *
 * @param {String} event The name of the event to be triggered.
 * @returns {Promise} Returns a Promise of all results that will be completed
 * when all of the callbacks have finished processing the triggered event.
 */
ripe.Observable.prototype.runCallbacks = function(event) {
    if (!this.callbacks) {
        return Promise.all([null]);
    }
    const callbacks = this.callbacks[event] || [];
    const results = [];
    for (let index = 0; index < callbacks.length; index++) {
        const callback = callbacks[index];
        let result = callback.apply(this, Array.prototype.slice.call(arguments, 1));
        result !== undefined && result !== null && results.push(result);
    }
    return Promise.all(results);
};

/**
 * The deinitializer of the class, called whenever this
 * observable ceases its activity.
 */
ripe.Observable.prototype.deinit = function() {
    this.callbacks = null;
};

/**
 * Alias to addCallback.
 */
ripe.Observable.prototype.bind = ripe.Observable.prototype.addCallback;

/**
 * Alias to removeCallback.
 */
ripe.Observable.prototype.unbind = ripe.Observable.prototype.removeCallback;

/**
 * Alias to runCallbacks.
 */
ripe.Observable.prototype.trigger = ripe.Observable.prototype.runCallbacks;
