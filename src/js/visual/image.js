if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
    var MutationObserver = typeof MutationObserver === "undefined" ? null : MutationObserver;
    var WebKitMutationObserver =
        typeof WebKitMutationObserver === "undefined" ? null : WebKitMutationObserver;
}

ripe.Image = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
};

ripe.Image.prototype = Object.create(ripe.Visual.prototype);

ripe.Image.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    this.frame = this.options.frame || 0;
    this.size = this.options.size || 1000;
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.crop = this.options.crop || false;
    this.showInitials = this.options.showInitials || false;
    this.initialsBuilder =
        this.options.initialsBuilder ||
        function(initials, engraving, element) {
            return {
                initials: initials,
                profile: [engraving]
            };
        };
    this._observer = null;

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

    var initialsSpec = this.showInitials
        ? this.initialsBuilder(this.initials, this.engraving, this.element)
        : {};

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
    if (width) {
        this.element.width = width;
    }
    if (height) {
        this.element.height = height;
    }
    this.element.src = url;
};

ripe.Image.prototype.deinit = function() {
    this._unregisterHandlers();
    this._observer = null;
    this.initialsBuilder = null;

    ripe.Visual.prototype.deinit.call(this);
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
    this.loadListener = function() {
        this.trigger("loaded");
    }.bind(this);
    this.element.addEventListener("load", this.loadListener);

    // eslint-disable-next-line no-undef
    var Observer = MutationObserver || WebKitMutationObserver;
    this._observer = Observer
        ? new Observer(
              function(mutations) {
                  this.update();
              }.bind(this)
          )
        : null;
    this._observer &&
        this._observer.observe(this.element, {
            attributes: true,
            subtree: false
        });
};

ripe.Image.prototype._unregisterHandlers = function() {
    this.element.removeEventListener("load", this.loadListener);
    this._observer && this._observer.disconnect();
};
