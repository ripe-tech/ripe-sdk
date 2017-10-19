Ripe.Observable = function() {
    this.callbacks = {};
};

Ripe.Observable.prototype.addCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
};

Ripe.Observable.prototype.removeCallback = function(event) {
    delete this.callbacks[event];
};

Ripe.Observable.prototype._runCallbacks = function(event) {
    var callbacks = this.callbacks[event] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};
