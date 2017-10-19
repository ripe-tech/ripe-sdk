Ripe.Image = function(owner, element, frame, options) {
    Ripe.Visual.call(this, owner, element, options);

    this.frame = frame;
    this.init();
};

Ripe.Image.prototype = Object.create(Ripe.Visual.prototype);

Ripe.Image.prototype.init = function() {
    this.element.addEventListener("load", function() {
        this._runCallbacks("loaded");
    }.bind(this));
};

Ripe.Image.prototype.update = function(state) {
    var url = this.owner._getImageURL({
        frame: this.frame
    });
    if (this.element.src === url) {
        return;
    }
    this.element.src = url;
};

Ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();    
};
