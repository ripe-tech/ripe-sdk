Ripe.InteractiveFrame = function(ripe, element, frame, options) {
    Ripe.Interactive.call(this, ripe, element, options);
    Ripe.Interactive.prototype.init.call(this);

    this.frame = frame;
    this.init();
};

Ripe.InteractiveFrame.prototype = Object.create(Ripe.Interactive.prototype);

Ripe.InteractiveFrame.prototype.init = function() {
    this.element.addEventListener("load", function() {
        this._runCallbacks("loaded");
    }.bind(this));
};

Ripe.InteractiveFrame.prototype.update = function() {
    var url = this.ripe._getImageURL(this.frame, null, null, null, null, null, this.options);
    if (this.element.src === url) {
        return;
    }
    this.element.src = url;
};
