ripe.Image = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Image.prototype.init.call(this);
};

ripe.Image.prototype = Object.create(ripe.Visual.prototype);

ripe.Image.prototype.init = function() {
    this.frame = this.options.frame || 0;
    this.size = this.options.size || 1000;
    this.element.addEventListener("load", function() {
        this._runCallbacks("loaded");
    }.bind(this));
};

ripe.Image.prototype.update = function(state) {
    var size = this.element.dataset.size || this.size;
    var url = this.owner._getImageURL({
        frame: this.frame,
        size: size
    });
    if (this.element.src === url) {
        return;
    }
    this.element.width = size;
    this.element.height = size;
    this.element.src = url;
};

ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();
};
