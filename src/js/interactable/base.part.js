Ripe.Interactable = function(owner, options) {
    if (!element) {
        return;
    }

    this.owner = owner;
    this.options = options || {};

    this.init();
};

Ripe.Interactable.prototype.init = function() { };

Ripe.Interactable.prototype.update = function(state) {};



/* move this to the observable things */
Ripe.Interactable.prototype._addCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
};

Ripe.Interactable.prototype._runCallbacks = function(event) {
    var callbacks = this.callbacks[event] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

Ripe.Interactable.prototype.addLoadedCallback = function(callback) {
    this._addCallback("loaded", callback);
};

Ripe.Interactable.prototype.addUpdatedCallback = function(callback) {};

Ripe.Interactable.prototype.addChangedFrameCallback = function(callback) {};
