if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (navigator !== undefined && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
    var MutationObserver = typeof MutationObserver === "undefined" ? null : MutationObserver;
    var WebKitMutationObserver =
        typeof WebKitMutationObserver === "undefined" ? null : WebKitMutationObserver;
}

/**
 * @class
 * @classdesc Class that reactively updates the image of an img element whenever
 * the state of its owner changes.
 *
 * @param {Ripe} owner The Ripe instance to be shown.
 * @param {Object} element The img element that should be updated.
 * @param {Object} options An object with options to configure the image, such as:
 * - 'showInitials' - A Boolean indicating if the owner's personalization should be shown (defaults to 'true¨).
 * - 'initialsBuilder' - A function that receives the initials and engraving as Strings and the img element that
 * will be used and returns a map with the initials and a profile list.
 * - 'frame' - The Ripe instance frame to display (defaults to '0').
 * - 'size' - The image size in pixels (defaults to '1000').
 * - 'width' - The image width in pixels (defaults to 'null', meaning it will fallback to 'size').
 * - 'height' - The image height in pixels (defaults to 'null', meaning it will fallback to 'size').
 * - 'crop' - A Boolean indicating if it is to crop the image composition.
 */
ripe.Image = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
};

ripe.Image.prototype = ripe.build(ripe.Visual.prototype);

/**
 * The Image initializer, which is called (by the owner)
 * whenever the Image is going to become active.
 *
 * Sets the various values for the Image taking into
 * owner's default values.
 */
ripe.Image.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    this.frame = this.options.frame || 0;
    this.format = this.options.format || null;
    this.size = this.options.size || 1000;
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.crop = this.options.crop || false;
    this.showInitials = this.options.showInitials || false;
    this.initialsBuilder =
        this.options.initialsBuilder ||
        function(initials, engraving, element) {
            return {
                initials: initials || "$empty",
                profile: [engraving]
            };
        };
    this._observer = null;

    this._registerHandlers();
};

/**
 * This function is called (by the owner) whenever its state changes
 * so that the Image can update itself for the new state.
 *
 * @param {Object} state An object containing the new state of the owner.
 * @param {Object} options Set of optional parameters to adjust the Image.
 */
ripe.Image.prototype.update = async function(state, options = {}) {
    const frame = this.element.dataset.frame || this.frame;
    const format = this.element.dataset.format || this.format;
    const size = this.element.dataset.size || this.size;
    const width = this.element.dataset.width || this.width;
    const height = this.element.dataset.height || this.height;
    const crop = this.element.dataset.crop || this.crop;

    this.initials = state !== undefined ? state.initials : this.initials;
    this.engraving = state !== undefined ? state.engraving : this.engraving;

    const initialsSpec = this.showInitials
        ? this.initialsBuilder(this.initials, this.engraving, this.element)
        : {};

    // verifies if the model currently loaded in the RIPE instance can
    // render the frame to be display and if that's not the case "ignores"
    // the current request for update
    if (frame && !this.owner.hasFrame(frame)) {
        this.trigger("not_loaded");
        return false;
    }

    // builds the URL of the image using the frame hacking approach
    // this should provide us with the new values
    const url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        format: format,
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
        this.trigger("not_loaded");
        return false;
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

    try {
        // create a promise waiting for the current image for either load
        // or receive an error, for both situation there should be a proper
        // waiting process in motion
        await new Promise((resolve, reject) => {
            this._loadedCallback = resolve;
            this._errorCallback = reject;
        });
    } finally {
        // unsets both of the callbacks as they are no longer required by
        // the promise's underlying logic
        this._loadedCallback = null;
        this._errorCallback = null;
    }

    // returns a valid value indicating that the loading operation
    // as been triggered with success (effective operation)
    return true;
};

/**
 * The Image deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.Image.prototype.deinit = function() {
    this._unregisterHandlers();
    this._observer = null;
    this.initialsBuilder = null;

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Updates the frame that the Image is referring to.
 *
 * @param {String} frame The Ripe instance frame to display.
 * @param {Object} options An object with options to configure
 * the setting of the frame.
 */
ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();
};

/**
 * Updates the Image's 'initialsBuilder' function.
 *
 * @param {Function} builder The new 'initialsBuilder' function
 * to be used by the Image.
 * @param {Object} options An object with options to configure
 * the setting of the 'initialsBuilder'.
 */
ripe.Image.prototype.setInitialsBuilder = function(builder, options) {
    this.initialsBuilder = builder;
    this.update();
};

/**
 * @ignore
 */
ripe.Image.prototype._registerHandlers = function() {
    // creates and add both the load and the error listeners
    // for the underlying image element to propagate those events
    // into the current observable context (event normalization)
    this.loadListener = () => this.trigger("loaded");
    this.errorListener = () => this.trigger("error");
    this.element.addEventListener("load", this.loadListener);
    this.element.addEventListener("error", this.errorListener);

    // registers for both the loaded and error handlers to cast
    // the handlers to the "simpler" callback attributes
    this.loadedHandler = this.bind("loaded", () => {
        if (this._loadedCallback) this._loadedCallback();
    });
    this.errorHandler = this.bind("error", () => {
        if (this._errorCallback) this._errorCallback();
    });

    // eslint-disable-next-line no-undef
    const Observer = MutationObserver || WebKitMutationObserver;
    this._observer = Observer
        ? new Observer(mutations => {
              this.update();
          })
        : null;
    this._observer &&
        this._observer.observe(this.element, {
            attributes: true,
            subtree: false
        });
};

/**
 * @ignore
 */
ripe.Image.prototype._unregisterHandlers = function() {
    if (this.loadListener) this.element.removeEventListener("load", this.loadListener);
    if (this.errorListener) this.element.removeEventListener("error", this.errorListener);
    if (this.loadedHandler) this.unbind("loaded", this.loadedHandler);
    if (this.errorHandler) this.unbind("error", this.errorHandler);
    if (this._observer) this._observer.disconnect();
};
