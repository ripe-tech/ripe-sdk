if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("../base");
    require("./visual");
    var ripe = base.ripe;
}

ripe.Image = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Image.prototype.init.call(this);
};

ripe.Image.prototype = Object.create(ripe.Visual.prototype);

ripe.Image.prototype.init = function() {
    this.frame = this.options.frame || 0;
    this.size = this.options.size || 1000;
    this._registerHandlers();
};

ripe.Image.prototype.update = function(state) {
    var frame = this.element.dataset.frame || this.frame;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height
    });
    if (this.element.src === url) {
        return;
    }
    this.element.width = width;
    this.element.height = height;
    this.element.src = url;
};

ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();
};

ripe.Image.prototype._registerHandlers = function() {
    this.element.addEventListener("load", function() {
        this.trigger("loaded");
    }.bind(this));
    var Observer = MutationObserver || WebKitMutationObserver;
    var observer = Observer ? new Observer(function(mutations) {
        this.update();
    }.bind(this)) : null;
    observer && observer.observe(this.element, {
        attributes: true,
        subtree: false
    });
};
