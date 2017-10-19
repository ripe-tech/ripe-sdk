Ripe.InteractableFrame = function(ripe, element, frame, options) {
    Ripe.Interactable.call(this, ripe, element, options);
    Ripe.Interactable.prototype.init.call(this);

    this.frame = frame;
    this.init();
};

Ripe.InteractableFrame.prototype = Object.create(Ripe.Interactable.prototype);

Ripe.InteractableFrame.prototype.init = function() {
    this.element.addEventListener("load", function() {
        this._runCallbacks("loaded");
    }.bind(this));
};

Ripe.InteractableFrame.prototype.update = function() {
    var url = this.ripe._getImageURL(this.frame, null, null, null, null, null, this.options);
    if (this.element.src === url) {
        return;
    }
    this.element.src = url;
};
