if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("../base"); // eslint-disable-line no-redeclare
    require("./visual");
    var ripe = base.ripe; // eslint-disable-line no-redeclare
}

ripe.Image = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Image.prototype.init.call(this);
};

ripe.Image.prototype = Object.create(ripe.Visual.prototype);

ripe.Image.prototype.init = function() {
    this.frame = this.options.frame || 0;
    this.size = this.options.size || 1000;
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.crop = this.options.crop || false;
    this.showInitials = this.options.showInitials || false;
    this.initialsBuilder = this.options.initialsBuilder || function(initials, engraving, element) {
        return {
            initials: initials,
            profile: [engraving]
        };
    };

    this._registerHandlers();
};

ripe.Image.prototype.update = function(state) {
    var frame = this.element.dataset.frame || this.frame;
    var size = this.element.dataset.size || this.size;
    var width = this.element.dataset.width || this.width;
    var height = this.element.dataset.height || this.height;
    var crop = this.element.dataset.crop || this.crop;

    this.initials = state !== undefined ? state.initials : this.initials;
    this.engraving = state !== undefined ? state.engraving : this.engraving;

    var initialsSpec = this.showInitials ? this.initialsBuilder(this.initials, this.engraving, this.element) : {};

    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        crop: crop,
        initials: initialsSpec.initials,
        profile: initialsSpec.profile
    });

    // verifies if the target image URL for the update is already
    // set and if that's the case returns (end of loop)
    if (this.element.src === url) {
        return;
    }

    // updates the image DOM element with the values of the image
    // including requested size and URL
    this.element.width = width;
    this.element.height = height;
    this.element.src = url;
};

ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();
};

ripe.Image.prototype.setInitialsBuilder = function(builder, options) {
    this.initialsBuilder = builder;
    this.update();
};

ripe.Image.prototype._registerHandlers = function() {
    this.element.addEventListener("load", function() {
        this.trigger("loaded");
    }.bind(this));
    var Observer = MutationObserver || WebKitMutationObserver; // eslint-disable-line no-undef
    var observer = Observer ? new Observer(function(mutations) {
        this.update();
    }.bind(this)) : null;
    observer && observer.observe(this.element, {
        attributes: true,
        subtree: false
    });
};
