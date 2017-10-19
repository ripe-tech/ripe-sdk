Ripe.Interactive = function(ripe, element, options) {
    if (!element) {
        return;
    }

    this.ripe = ripe;
    this.element = element;
    this.options = options || {};

    this.init();
};

Ripe.Interactive.prototype.init = function() {
    this.callbacks = {};
    this.size = this.element.getAttribute("data-size") || options.size || 1000;
};

Ripe.Interactive.prototype.update = function() {};

Ripe.Interactive.prototype.mergeOptions = function(baseOptions, options) {};

Ripe.Interactive.prototype.changeFrame = function(frame, options) {};

Ripe.Interactive.prototype._addCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
};

Ripe.Interactive.prototype._runCallbacks = function(event) {
    var callbacks = this.callbacks[event] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

Ripe.Interactive.prototype.addLoadedCallback = function(callback) {
    this._addCallback("loaded", callback);
};

Ripe.Interactive.prototype.addUpdatedCallback = function(callback) {};

Ripe.Interactive.prototype.addChangedFrameCallback = function(callback) {};
