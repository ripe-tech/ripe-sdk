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
    this.profile = this.options.profile || null;
    this.updateInitials = this.options.updateInitials || false;

    this._registerHandlers();
};

ripe.Image.prototype.update = function(state) {
    var frame = this.element.dataset.frame || this.frame;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    this.initials = this.updateInitials && state ? state.initials : this.initials;
    this.profile = this.updateInitials && state ? state.profile : this.profile;

    this.initials = this.element.dataset.initials || this.initials;
    this.profile = this.element.dataset.profile || this.profile;

    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        initials: this.initials,
        profile: this.profile
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

ripe.Image.prototype.setProfile = function(profile, options) {
    this.profile = profile;
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
