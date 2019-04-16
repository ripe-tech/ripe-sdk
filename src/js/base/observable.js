if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @class
 * @classdesc Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 */
ripe.Observable = function() {
    this.callbacks = {};
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Observable.prototype.init = function() {};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @param {Object} event Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * @param {Function} callback Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Observable.prototype.addCallback = function(event, callback) {
    const callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
    return callback;
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @param {Object} event Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * @param {Function} callback Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @param {Object} event Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * @param {Function} callback Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Observable.prototype.deinit = function() {
    this.callbacks = null;
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Observable.prototype.bind = ripe.Observable.prototype.addCallback;

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Observable.prototype.unbind = ripe.Observable.prototype.removeCallback;

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Observable.prototype.trigger = ripe.Observable.prototype.runCallbacks;
