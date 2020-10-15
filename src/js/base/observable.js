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
 * @classdesc An object that emits events.
 * Listeners can bind to specific events and be notified when the event is triggered.
 */
ripe.Observable = function() {
    this.callbacks = {};
};

/**
 * The initializer of the class, called whenever this
 * observable starts its activity.
 */
ripe.Observable.prototype.init = function() {};

/**
 * The deinitializer of the class, called whenever this
 * observable ceases its activity.
 */
ripe.Observable.prototype.deinit = async function() {
    this.callbacks = null;
};

/**
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
 * @param {Boolean} wait If the callback execution should wait for every single
 * execution before running the next one.
 * @returns {Promise} Returns a Promise of all results that will be completed
 * when all of the callbacks have finished processing the triggered event.
 */
ripe.Observable.prototype.runCallbacks = async function(event, wait = true, ...args) {
    if (!this.callbacks) {
        const result = await Promise.all([null]);
        return result;
    }
    const callbacks = this.callbacks[event] || [];
    const results = [];
    for (let index = 0; index < callbacks.length; index++) {
        const callback = callbacks[index];
        const result = callback.apply(this, args);
        if (result === undefined || result === null) continue;
        if (wait) await result;
        else results.push(result);
    }
    const result = await Promise.all(results);
    return result;
};

ripe.Observable.prototype.runCallbacksWait = async function(event, ...args) {
    const result = await this.runCallbacks(event, true, ...args);
    return result;
};

ripe.Observable.prototype.runCallbackNoWait = async function(event, ...args) {
    const result = await this.runCallbacks(event, false, ...args);
    return result;
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
 * Alias to runCallbackNoWait.
 */
ripe.Observable.prototype.trigger = ripe.Observable.prototype.runCallbackNoWait;

/**
 * Alias to runCallbacksWait.
 */
ripe.Observable.prototype.triggerWait = ripe.Observable.prototype.runCallbacksWait;
