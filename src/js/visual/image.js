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
    this.initials = this.options.initials;
    this.engraving = this.options.engraving || null;
    this.updateInitials = this.options.updateInitials || false;
    this.profileBuilder = this.options.profileBuilder || function() {
        return this.engraving;
    }

    this._registerHandlers();
};

ripe.Image.prototype.update = function(state) {
    var frame = this.element.dataset.frame || this.frame;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    this.initials = this.updateInitials && state ? state.initials : this.initials;
    this.engraving = this.updateInitials && state ? state.engraving : this.engraving;

    this.initials = this.element.dataset.initials || this.initials;
    this.engraving = this.element.dataset.engraving || this.engraving;

    var profile = this.profileBuilder(this.initials, this.engraving, this.element);

    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        initials: this.initials,
        profile: profile
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

ripe.Image.prototype.setInitials = function(initials, options) {
    this.initials = initials;
    this.update();
};

ripe.Image.prototype.setEngraving = function(engraving, options) {
    this.engraving = engraving;
    this.update();
};

ripe.Image.prototype.setProfileBuilder = function(builder, options) {
    this.profileBuilder = builder;
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
