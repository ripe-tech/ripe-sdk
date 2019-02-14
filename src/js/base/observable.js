if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Observable = function() {
    this.callbacks = {};
};

ripe.Observable.prototype.init = function() {};

ripe.Observable.prototype.addCallback = function(event, callback) {
    const callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
    return callback;
};

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

ripe.Observable.prototype.runCallbacks = function(event) {
    const callbacks = this.callbacks[event] || [];
    const results = [];
    for (let index = 0; index < callbacks.length; index++) {
        const callback = callbacks[index];
        let result = callback.apply(this, Array.prototype.slice.call(arguments, 1));
        result !== undefined && result !== null && results.push(result);
    }
    return results;
};

ripe.Observable.prototype.deinit = function() {
    this.callbacks = null;
};

ripe.Observable.prototype.bind = ripe.Observable.prototype.addCallback;
ripe.Observable.prototype.unbind = ripe.Observable.prototype.removeCallback;
ripe.Observable.prototype.trigger = ripe.Observable.prototype.runCallbacks;
