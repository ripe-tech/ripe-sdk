if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare,no-var
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
    this.mutations = this.options.mutations || false;
    this.rotation = this.options.rotation || null;
    this.crop = this.options.crop || null;
    this.flip = this.options.flip || null;
    this.mirror = this.options.mirror || null;
    this.boundingBox = this.options.boundingBox || null;
    this.algorithm = this.options.algorithm || null;
    this.background = this.options.background || null;
    this.engine = this.options.engine || null;
    this.initialsX = this.options.initialsX || null;
    this.initialsY = this.options.initialsY || null;
    this.initialsWidth = this.options.initialsWidth || null;
    this.initialsHeight = this.options.initialsHeight || null;
    this.initialsViewport = this.options.initialsViewport || null;
    this.initialsColor = this.options.initialsColor || null;
    this.initialsOpacity = this.options.initialsOpacity || null;
    this.initialsAlign = this.options.initialsAlign || null;
    this.initialsVertical = this.options.initialsVertical || null;
    this.initialsEmbossing = this.options.initialsEmbossing || null;
    this.initialsRotation = this.options.initialsRotation || null;
    this.initialsZindex = this.options.initialsZindex || null;
    this.initialsAlgorithm = this.options.initialsAlgorithm || null;
    this.initialsBlendColor = this.options.initialsBlendColor || null;
    this.initialsPattern = this.options.initialsPattern || null;
    this.initialsTexture = this.options.initialsTexture || null;
    this.initialsExclusion = this.options.initialsExclusion || null;
    this.initialsInclusion = this.options.initialsInclusion || null;
    this.initialsImageRotation = this.options.initialsImageRotation || null;
    this.initialsImageFlip = this.options.initialsImageFlip || null;
    this.initialsImageMirror = this.options.initialsImageMirror || null;
    this.debug = this.options.debug || null;
    this.fontFamily = this.options.fontFamily || null;
    this.fontWeight = this.options.fontWeight || null;
    this.fontSize = this.options.fontSize || null;
    this.fontSpacing = this.options.fontSpacing || null;
    this.fontTrim = this.options.fontTrim || null;
    this.fontMask = this.options.fontMask || null;
    this.fontMode = this.options.fontMode || null;
    this.lineHeight = this.options.lineHeight || null;
    this.lineBreaking = this.options.lineBreaking || null;
    this.shadow = this.options.shadow || null;
    this.shadowColor = this.options.shadowColor || null;
    this.shadowOffset = this.options.shadowOffset || null;
    this.offsets = this.options.offsets || null;
    this.curve = this.options.curve || null;
    this.showInitials = this.options.showInitials || false;
    this.initialsGroup = this.options.initialsGroup || null;
    this.initialsContext = this.options.initialsContext || null;
    this.getInitialsContext = this.options.getInitialsContext || null;
    this.initialsBuilder =
        this.options.initialsBuilder || this.owner.initialsBuilder;
    this.doubleBuffering =
        this.options.doubleBuffering === undefined ? true : this.options.doubleBuffering;
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
 * - 'crop' - A Boolean indicating if the resulting image should be cropped.
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
    this.rotation = options.rotation === undefined ? this.rotation : options.rotation;
    this.crop = options.crop === undefined ? this.crop : options.crop;
    this.flip = options.flip === undefined ? this.flip : options.flip;
    this.mirror = options.mirror === undefined ? this.mirror : options.mirror;
    this.boundingBox = options.boundingBox === undefined ? this.boundingBox : options.boundingBox;
    this.algorithm = options.algorithm === undefined ? this.algorithm : options.algorithm;
    this.background = options.background === undefined ? this.background : options.background;
    this.engine = options.engine === undefined ? this.engine : options.engine;
    this.initialsX = options.initialsX === undefined ? this.initialsX : options.initialsX;
    this.initialsY = options.initialsY === undefined ? this.initialsY : options.initialsY;
    this.initialsWidth =
        options.initialsWidth === undefined ? this.initialsWidth : options.initialsWidth;
    this.initialsHeight =
        options.initialsHeight === undefined ? this.initialsHeight : options.initialsHeight;
    this.initialsViewport =
        options.initialsViewport === undefined ? this.initialsViewport : options.initialsViewport;
    this.initialsColor =
        options.initialsColor === undefined ? this.initialsColor : options.initialsColor;
    this.initialsOpacity =
        options.initialsOpacity === undefined ? this.initialsOpacity : options.initialsOpacity;
    this.initialsAlign =
        options.initialsAlign === undefined ? this.initialsAlign : options.initialsAlign;
    this.initialsVertical =
        options.initialsVertical === undefined ? this.initialsVertical : options.initialsVertical;
    this.initialsEmbossing =
        options.initialsEmbossing === undefined
            ? this.initialsEmbossing
            : options.initialsEmbossing;
    this.initialsRotation =
        options.initialsRotation === undefined ? this.initialsRotation : options.initialsRotation;
    this.initialsZindex =
        options.initialsZindex === undefined ? this.initialsZindex : options.initialsZindex;
    this.initialsAlgorithm =
        options.initialsAlgorithm === undefined
            ? this.initialsAlgorithm
            : options.initialsAlgorithm;
    this.initialsBlendColor =
        options.initialsBlendColor === undefined
            ? this.initialsBlendColor
            : options.initialsBlendColor;
    this.initialsPattern =
        options.initialsPattern === undefined ? this.initialsPattern : options.initialsPattern;
    this.initialsTexture =
        options.initialsTexture === undefined ? this.initialsTexture : options.initialsTexture;
    this.initialsExclusion =
        options.initialsExclusion === undefined
            ? this.initialsExclusion
            : options.initialsExclusion;
    this.initialsInclusion =
        options.initialsInclusion === undefined
            ? this.initialsInclusion
            : options.initialsInclusion;
    this.initialsImageRotation =
        options.initialsImageRotation === undefined
            ? this.initialsImageRotation
            : options.initialsImageRotation;
    this.initialsImageFlip =
        options.initialsImageFlip === undefined
            ? this.initialsImageFlip
            : options.initialsImageFlip;
    this.initialsImageMirror =
        options.initialsImageMirror === undefined
            ? this.initialsImageMirror
            : options.initialsImageMirror;
    this.debug = options.debug === undefined ? this.debug : options.debug;
    this.fontFamily = options.fontFamily === undefined ? this.fontFamily : options.fontFamily;
    this.fontWeight = options.fontWeight === undefined ? this.fontWeight : options.fontWeight;
    this.fontSize = options.fontSize === undefined ? this.fontSize : options.fontSize;
    this.fontSpacing = options.fontSpacing === undefined ? this.fontSpacing : options.fontSpacing;
    this.fontTrim = options.fontTrim === undefined ? this.fontTrim : options.fontTrim;
    this.fontMask = options.fontMask === undefined ? this.fontMask : options.fontMask;
    this.fontMode = options.fontMode === undefined ? this.fontMode : options.fontMode;
    this.lineHeight = options.lineHeight === undefined ? this.lineHeight : options.lineHeight;
    this.lineBreaking =
        options.lineBreaking === undefined ? this.lineBreaking : options.lineBreaking;
    this.shadow = options.shadow === undefined ? this.shadow : options.shadow;
    this.shadowColor = options.shadowColor === undefined ? this.shadowColor : options.shadowColor;
    this.shadowOffset =
        options.shadowOffset === undefined ? this.shadowOffset : options.shadowOffset;
    this.offsets = options.offsets === undefined ? this.offsets : options.offsets;
    this.curve = options.curve === undefined ? this.curve : options.curve;
    this.initialsGroup =
        options.initialsGroup === undefined ? this.initialsGroup : options.initialsGroup;
    this.initialsContext =
        options.initialsContext === undefined ? this.initialsContext : options.initialsContext;
    this.getInitialsContext =
        options.getInitialsContext === undefined
            ? this.getInitialsContext
            : options.getInitialsContext;
    this.doubleBuffering =
        options.doubleBuffering === undefined ? this.doubleBuffering : options.doubleBuffering;

    if (update) await this.update();
};

/**
 * This function is called (by the owner) whenever its state changes
 * so that the Image can update itself for the new state.
 *
 * @param {Object} state An object containing the new state of the owner.
 * @param {Object} options Set of optional parameters to adjust the Image.
 * @returns {Boolean} If an effective operation has been performed by the
 * update operation.
 */
ripe.Image.prototype.update = async function(state, options = {}) {
    // in case the element is no longer available (possible due to async
    // nature of execution) returns the control flow immediately
    if (!this.element) return;

    // gathers the complete set of data values from the element if existent
    // defaulting to the instance one in case their are not defined
    const frame = this.element.dataset.frame || this.frame;
    const format = this.element.dataset.format || this.format;
    const size = this.element.dataset.size || this.size;
    const width = this.element.dataset.width || this.width;
    const height = this.element.dataset.height || this.height;
    const rotation = this.element.dataset.rotation || this.rotation;
    const crop = this.element.dataset.crop || this.crop;
    const initialsGroup = this.element.dataset.initialsGroup || this.initialsGroup;
    const initialsContext = this.element.dataset.initialsContext || this.initialsContext;
    const getInitialsContext = this.element.dataset.getInitialsContext || this.getInitialsContext;
    const flip = this.element.dataset.flip || this.flip;
    const mirror = this.element.dataset.mirror || this.mirror;
    const boundingBox = this.element.dataset.boundingBox || this.boundingBox;
    const algorithm = this.element.dataset.algorithm || this.algorithm;
    const background = this.element.dataset.background || this.background;
    const engine = this.element.dataset.engine || this.engine;
    const initialsX = this.element.dataset.initialsX || this.initialsX;
    const initialsY = this.element.dataset.initialsY || this.initialsY;
    const initialsWidth = this.element.dataset.initialsWidth || this.initialsWidth;
    const initialsHeight = this.element.dataset.initialsHeight || this.initialsHeight;
    const initialsViewport = this.element.dataset.initialsViewport || this.initialsViewport;
    const initialsColor = this.element.dataset.initialsColor || this.initialsColor;
    const initialsOpacity = this.element.dataset.initialsOpacity || this.initialsOpacity;
    const initialsAlign = this.element.dataset.initialsAlign || this.initialsAlign;
    const initialsVertical = this.element.dataset.initialsVertical || this.initialsVertical;
    const initialsEmbossing = this.element.dataset.initialsEmbossing || this.initialsEmbossing;
    const initialsRotation = this.element.dataset.initialsRotation || this.initialsRotation;
    const initialsZindex = this.element.dataset.initialsZindex || this.initialsZindex;
    const initialsAlgorithm = this.element.dataset.initialsAlgorithm || this.initialsAlgorithm;
    const initialsBlendColor = this.element.dataset.initialsBlendColor || this.initialsBlendColor;
    const initialsPattern = this.element.dataset.initialsPattern || this.initialsPattern;
    const initialsTexture = this.element.dataset.initialsTexture || this.initialsTexture;
    const initialsExclusion = this.element.dataset.initialsExclusion || this.initialsExclusion;
    const initialsInclusion = this.element.dataset.initialsInclusion || this.initialsInclusion;
    const initialsImageRotation =
        this.element.dataset.initialsImageRotation || this.initialsImageRotation;
    const initialsImageFlip = this.element.dataset.initialsImageFlip || this.initialsImageFlip;
    const initialsImageMirror =
        this.element.dataset.initialsImageMirror || this.initialsImageMirror;
    const debug = this.element.dataset.debug || this.debug;
    const fontFamily = this.element.dataset.fontFamily || this.fontFamily;
    const fontWeight = this.element.dataset.fontWeight || this.fontWeight;
    const fontSize = this.element.dataset.fontSize || this.fontSize;
    const fontSpacing = this.element.dataset.fontSpacing || this.fontSpacing;
    const fontTrim = this.element.dataset.fontTrim || this.fontTrim;
    const fontMask = this.element.dataset.fontMask || this.fontMask;
    const fontMode = this.element.dataset.fontMode || this.fontMode;
    const lineHeight = this.element.dataset.lineHeight || this.lineHeight;
    const lineBreaking = this.element.dataset.lineBreaking || this.lineBreaking;
    const shadow = this.element.dataset.shadow || this.shadow;
    const shadowColor = this.element.dataset.shadowColor || this.shadowColor;
    const shadowOffset = this.element.dataset.shadowOffset || this.shadowOffset;
    const offsets = this.element.dataset.offsets || this.offsets;
    const curve = this.element.dataset.curve || this.curve;
    const doubleBuffering = this.element.dataset.doubleBuffering || this.doubleBuffering;

    // in case the state is defined tries to gather the appropriate
    // sate options for both initials and engraving taking into
    // consideration that groups may exist
    if (state !== undefined) {
        const base = initialsGroup ? state.initialsExtra[initialsGroup] || {} : state;
        this.initials = base.initials || "";
        this.engraving = base.engraving || null;
    }

    // in case the context changes with the group, gets the
    // context and calls the initials builder
    const context = getInitialsContext ? getInitialsContext(initialsGroup) : initialsContext;
    const initialsSpec = this.showInitials
        ? this.initialsBuilder(
              this.initials,
              this.engraving,
              initialsGroup,
              initialsViewport,
              context
          )
        : {};

    // verifies if the model currently loaded in the Ripe Instance can
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
        rotation: rotation,
        crop: crop,
        initials: initialsSpec.initials,
        profile: initialsSpec.profile,
        flip: flip,
        mirror: mirror,
        boundingBox: boundingBox,
        algorithm: algorithm,
        background: background,
        engine: engine,
        initialsX: initialsX,
        initialsY: initialsY,
        initialsWidth: initialsWidth,
        initialsHeight: initialsHeight,
        initialsViewport: initialsViewport,
        initialsColor: initialsColor,
        initialsOpacity: initialsOpacity,
        initialsAlign: initialsAlign,
        initialsVertical: initialsVertical,
        initialsEmbossing: initialsEmbossing,
        initialsRotation: initialsRotation,
        initialsZindex: initialsZindex,
        initialsAlgorithm: initialsAlgorithm,
        initialsBlendColor: initialsBlendColor,
        initialsPattern: initialsPattern,
        initialsTexture: initialsTexture,
        initialsExclusion: initialsExclusion,
        initialsInclusion: initialsInclusion,
        initialsImageRotation: initialsImageRotation,
        initialsImageFlip: initialsImageFlip,
        initialsImageMirror: initialsImageMirror,
        debug: debug,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontSize: fontSize,
        fontSpacing: fontSpacing,
        fontTrim: fontTrim,
        fontMask: fontMask,
        fontMode: fontMode,
        lineHeight: lineHeight,
        lineBreaking: lineBreaking,
        shadow: shadow,
        shadowColor: shadowColor,
        shadowOffset: shadowOffset,
        offsets: offsets,
        curve: curve
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

    // in case the double buffering mode is active an off-screen
    // image element is created to "cache" the image that is going
    // to be displayed for the current update, this way the typical
    // flickering visual artifact can be avoided
    if (doubleBuffering && this._url) await this._doubleBuffer(this._url);

    // in case the element is no longer available (possible due to async
    // nature of execution) returns the control flow immediately
    if (!this.element) return;

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
 * @returns {Boolean} If an effective operation has been performed or if
 * instead no cancel logic was executed.
 */
ripe.Image.prototype.cancel = async function(options = {}) {
    // in case the image is not under a loading process then
    // returns the control flow immediately as it's no longer
    // possible to cancel it
    if (!this._loadedCallback) return false;

    // restores the internal URL state of the image back to
    // the previous one (and updates the element accordingly)
    this._url = this._previousUrl;
    this._previousUrl = null;
    this.element.src = this._url || "";

    // calls the loaded callback with the indication that there
    // was a cancel operation for its load
    this._loadedCallback({ canceled: true });

    return true;
};

/**
 * Resizes the Image's DOM element to `size` pixels, both the
 * width and the height of the image will reflect this value.
 *
 * @param {String} size The number of pixels to resize to.
 */
ripe.Image.prototype.resize = async function(size) {
    this.size = size;
    await this.update();
};

/**
 * Updates the frame that the Image is referring to.
 *
 * @param {String} frame The Ripe instance frame to display.
 * @param {Object} options An object with options to configure
 * the setting of the frame.
 */
ripe.Image.prototype.setFrame = async function(frame, options) {
    this.frame = frame;
    await this.update();
};

/**
 * Updates the Image's `showInitials` flag that indicates
 * if the initials should be display in the image.
 *
 * @param {String} showInitials If the image should display initials.
 */
ripe.Image.prototype.setShowInitials = async function(showInitials) {
    this.showInitials = showInitials;
    await this.update();
};

/**
 * Updates the Image's `initialsBuilder` function.
 *
 * @param {Function} builder The new `initialsBuilder` function
 * to be used by the Image.
 * @param {Object} options An object with options to configure
 * the setting of the `initialsBuilder`.
 */
ripe.Image.prototype.setInitialsBuilder = async function(builder, options) {
    this.initialsBuilder = builder;
    await this.update();
};

/**
 * @ignore
 */
ripe.Image.prototype._doubleBuffer = async function(url) {
    if (typeof window === "undefined" || !window.document) return;
    const image = document.createElement("img");
    try {
        await new Promise((resolve, reject) => {
            image.addEventListener("load", resolve);
            image.addEventListener("error", reject);
            image.src = url;
        });
    } finally {
        image.remove();
    }
};

/**
 * @ignore
 */
ripe.Image.prototype._registerHandlers = function() {
    if (!this.element) return;

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
    if (this.loadListener && this.element) {
        this.element.removeEventListener("load", this.loadListener);
    }
    if (this.errorListener && this.element) {
        this.element.removeEventListener("error", this.errorListener);
    }
    if (this.loadedHandler) this.unbind("loaded", this.loadedHandler);
    if (this.errorHandler) this.unbind("error", this.errorHandler);
    if (this._observer) this._observer.disconnect();
};
