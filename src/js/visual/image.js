if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
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
    this.type = this.type || "Image";

    ripe.Visual.call(this, owner, element, options);
};

ripe.Image.prototype = ripe.build(ripe.Visual.prototype);
ripe.Image.prototype.constructor = ripe.Image;

/**
 * The Image initializer, which is called (by the owner)
 * whenever the Image is going to become active.
 *
 * Sets the various values for the Image taking into
 * owner's default values.
 */
ripe.Image.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    this.frame = this.options.frame || null;
    this.format = this.options.format || null;
    this.size = this.options.size || null;
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.crop = this.options.crop || null;
    this.mutations = this.options.mutations || false;
    this.showInitials = this.options.showInitials || false;
    this.initialsGroup = this.options.initialsGroup || null;
    this.initialsBuilder =
        this.options.initialsBuilder ||
        function(initials, engraving, element) {
            return {
                initials: initials || "$empty",
                profile: [engraving]
            };
        };
    this._observer = null;
    this._url = null;
    this._previousUrl = null;

    this._registerHandlers();
};

/**
 * The Image deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.Image.prototype.deinit = async function() {
    await this.cancel();

    this._unregisterHandlers();

    this._observer = null;
    this.initialsBuilder = null;

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Updates the Image's current options with the ones provided.
 *
 * @param {Object} options Set of optional parameters to adjust the Image, such as:
 * - 'format' - The format of the image, (eg: png, jpg, svg, etc.).
 * - 'crop' - A Boolean indicating if it is to crop the image composition.
 * - 'initialsGroup' - The group in which the image initials belongs to.
 * @param {Boolean} update If an update operation should be executed after
 * the options updated operation has been performed.
 */
ripe.Image.prototype.updateOptions = async function(options, update = true) {
    ripe.Visual.prototype.updateOptions.call(this, options);

    this.frame = options.frame === undefined ? this.frame : options.frame;
    this.format = options.format === undefined ? this.format : options.format;
    this.size = options.size === undefined ? this.size : options.size;
    this.width = options.width === undefined ? this.width : options.width;
    this.height = options.height === undefined ? this.height : options.height;
    this.crop = options.crop === undefined ? this.crop : options.crop;
    this.initialsGroup =
        options.initialsGroup === undefined ? this.initialsGroup : options.initialsGroup;

    if (update) await this.update();
};

/**
 * This function is called (by the owner) whenever its state changes
 * so that the Image can update itself for the new state.
 *
 * @param {Object} state An object containing the new state of the owner.
 * @param {Object} options Set of optional parameters to adjust the Image.
 */
ripe.Image.prototype.update = async function(state, options = {}) {
    // gathers the complete set of data values from the element if existent
    // defaulting to the instance one in case their are not defined
    const frame = this.element.dataset.frame || this.frame;
    const format = this.element.dataset.format || this.format;
    const size = this.element.dataset.size || this.size;
    const width = this.element.dataset.width || this.width;
    const height = this.element.dataset.height || this.height;
    const crop = this.element.dataset.crop || this.crop;
    const initialsGroup = this.element.dataset.initialsGroup || this.initialsGroup;

    // in case the state is defined tries to gather the appropriate
    // sate options for both initials and engraving taking into
    // consideration that groups may exist
    if (state !== undefined) {
        const base = initialsGroup ? state.initialsExtra[initialsGroup] || {} : state;
        this.initials = base.initials || "";
        this.engraving = base.engraving || null;
    }

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
        frame: frame,
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
    if (url === this._url) {
        this.trigger("not_loaded");
        return false;
    }

    // saves the previous URL value and then updates the new URL
    // according to the newly requested one
    this._previousUrl = this._url;
    this._url = url;

    // updates the image DOM element with the values of the image
    // including requested size and URL
    if (width) this.element.width = width;
    if (height) this.element.height = height;
    this.element.src = this._url || "";

    // saves the space for the result of the loaded callback that
    // should be a boolean indicating if there's was a visual impact
    // resulting from the loading operation
    let result = true;

    try {
        // create a promise waiting for the current image for either load
        // or receive an error, for both situation there should be a proper
        // waiting process in motion
        result = await new Promise((resolve, reject) => {
            this._loadedCallback = resolve;
            this._errorCallback = reject;
        });
    } finally {
        // unsets both of the callbacks as they are no longer required by
        // the promise's underlying logic
        this._loadedCallback = null;
        this._errorCallback = null;
    }

    // in case there's no value returned by the loaded callback then
    // the result is considered valid (proper update)
    if (result === undefined) result = true;

    // returns a value indicating that if the loading operation
    // as been triggered with success (effective operation)
    return result;
};

/**
 * This function is called (by the owner) whenever the current operation
 * in the child should be canceled this way an Image is not updated.
 *
 * @param {Object} options Set of optional parameters to adjust the Image.
 */
ripe.Image.prototype.cancel = async function(options = {}) {
    if (!this._loadedCallback) return false;

    // restores the internal URL state of the image back to
    // the previous one (and updates the element accordingly)
    this._url = this._previousUrl;
    this._previousUrl = null;
    this.element.src = this._url || "";

    this._loadedCallback({ canceled: true });

    return true;
};

/**
 * Resizes the Image's DOM element to 'size' pixels, both the
 * width and the height of the image will reflect this value.
 *
 * @param {String} size The number of pixels to resize to.
 */
ripe.Image.prototype.resize = function(size) {
    this.size = size;
    this.update();
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
 * Updates the Image's 'showInitials' flag that indicates
 * if the initials should be display in the image.
 *
 * @param {String} showInitials If the image should display initials.
 */
ripe.Image.prototype.setShowInitials = function(showInitials) {
    this.showInitials = showInitials;
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

    // verifies if mutation should be "observed" for this visual
    // and in such case registers for the observation of any DOM
    // mutation (eg: attributes) for the image element, triggering
    // a new update operation in case that happens
    if (this.mutations) {
        const Observer =
            (typeof MutationObserver !== "undefined" && MutationObserver) ||
            (typeof WebKitMutationObserver !== "undefined" && WebKitMutationObserver) || // eslint-disable-line no-undef
            null;
        this._observer = Observer
            ? new Observer(mutations => {
                  this.update();
              })
            : null;
        if (this._observer) {
            this._observer.observe(this.element, {
                attributes: true,
                subtree: false
            });
        }
    }
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
