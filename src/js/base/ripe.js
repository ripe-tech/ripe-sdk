if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" || typeof __webpack_require__ !== "undefined") // eslint-disable-line camelcase
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./observable");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Object that contains global (static) information to be used by
 * the RIPE infrastructure (eg global identifier counter).
 */
ripe.ripeGlobals = {
    id: 0
};

/**
 * @class
 * @augments Observable
 * @classdesc Represents a customizable model.
 *
 * @param {String} brand The brand of the model.
 * @param {String} model The name of the model.
 * @param {Object} options An object with the options to configure the Ripe instance.
 */
ripe.Ripe = function(brand, model, options = {}) {
    ripe.Observable.call(this);
    ripe.Ripe.prototype.init.call(this, brand, model, options);
};

ripe.Ripe.prototype = ripe.build(ripe.Observable.prototype);

/**
 * @ignore
 */
ripe.RipeBase = function(brand, model, options = {}) {
    return new ripe.Ripe(brand, model, options);
};

/**
 * The initializer of the class, to be called whenever the instance
 * is going to become active.
 *
 * Sets the various values for the Ripe instance taking into account
 * the provided configuration and defaulting values policy.
 */
ripe.Ripe.prototype.init = async function(brand = null, model = null, options = {}) {
    // generates a new global identifier and adds the current
    // instance to the list og globally managed ones
    ripe.ripeGlobals.id++;
    this.id = ripe.ripeGlobals.id;

    // runs the defaulting operation so that it's possible to
    // provide only the first parameters as the options
    if (typeof brand === "object" && brand !== null) {
        options = brand;
        brand = options.brand || null;
        model = options.model || null;
    }

    // determines if the init operation should be avoided (eg: for static usage)
    // if so the control flow is returned immediately (init prevented)
    const init = options.init === undefined ? true : options.init;
    if (!init) return;

    // sets the various values in the instance taking into
    // account the default values
    this.initials = "";
    this.engraving = null;
    this.initialsExtra = {};
    this.ctx = {};
    this.children = this.children || [];
    this.plugins = this.plugins || [];
    this.history = [];
    this.historyPointer = -1;
    this.loadedConfig = null;
    this.choices = null;
    this.ready = false;
    this.bundles = false;
    this.partCounter = 0;
    this.error = null;

    // extends the default options with the ones provided by the
    // developer upon this initializer call
    options = ripe.assign(
        {
            options: false
        },
        options
    );
    this.setOptions(options);

    // in case the guess URL mode is active then a remote call should be
    // performed in order to take decisions on the proper production URL
    if (this.guessUrl) await this._guessUrl();

    // iterates over all the plugins present in the options (meant
    // to be registered) and adds them to the current instance
    for (const plugin of options.plugins || []) {
        this.addPlugin(plugin);
    }

    // if diagnostic headers have not been disabled then
    // registers the diag plugin to automatically add
    // diagnostic headers to every remote request
    if (this.useDiag) {
        const diagPlugin = new ripe.Ripe.plugins.DiagPlugin();
        this.addPlugin(diagPlugin);
    }

    // registers for the config (finished) event so that the execution may
    // be able to notify the server side logic and change the current state
    // if that's required by the server side
    this.bind("config", async function() {
        let result = null;
        if (!this.remoteOnConfig) return;
        const ctxRequest = (this.ctxRequest = (this.ctxRequest || 0) + 1);
        try {
            result = await this.onConfigP({
                brand: this.brand,
                model: this.model
            });
        } catch (err) {
            if (err instanceof ripe.RemoteError) return;
            else throw err;
        }
        if (ctxRequest !== this.ctxRequest) return;
        this._handleCtx(result);
    });

    // registers for the part (set) operation so that the execution may
    // be able to notify the server side logic and change the current state
    // if that's required by the server side
    this.bind("part", async function(name, value) {
        let result = null;
        if (!this.remoteOnPart) return;
        const ctxRequest = (this.ctxRequest = (this.ctxRequest || 0) + 1);
        try {
            result = await this.onPartP({
                name: name,
                value: value
            });
        } catch (err) {
            if (err instanceof ripe.RemoteError) return;
            else throw err;
        }
        if (ctxRequest !== this.ctxRequest) return;
        this._handleCtx(result);
    });

    // registers for the initials (set) operation so that the execution may
    // be able to notify the server side logic and change the current state
    // if that's required by the server side
    this.bind("initials", async function(initials, engraving, params) {
        let result = null;
        if (!this.remoteOnInitials) return;
        if (params.noRemote) return;
        const ctxRequest = (this.ctxRequest = (this.ctxRequest || 0) + 1);
        try {
            result = await this.onInitialsP({
                group: "main",
                value: initials,
                engraving: engraving
            });
        } catch (err) {
            if (err instanceof ripe.RemoteError) return;
            else throw err;
        }
        if (ctxRequest !== this.ctxRequest) return;
        this._handleCtx(result);
    });

    // registers for the initials_extra (set) operation so that the execution may
    // be able to notify the server side logic and change the current state
    // if that's required by the server side
    this.bind("initials_extra", async function(initialsExtra, params) {
        let result = null;
        if (!this.remoteOnInitials) return;
        if (params.noRemote) return;
        const ctxRequest = (this.ctxRequest = (this.ctxRequest || 0) + 1);
        for (const [key, value] of Object.entries(initialsExtra)) {
            try {
                result = await this.onInitialsP({
                    group: key,
                    value: value.initials,
                    engraving: value.engraving
                });
            } catch (err) {
                if (err instanceof ripe.RemoteError) return;
                else throw err;
            }
            if (ctxRequest !== this.ctxRequest) return;
            this._handleCtx(result);
        }
    });

    // listens for the post parts event and saves the current configuration
    // for the undo operations (history control)
    this.bind("post_parts", function(parts, options) {
        // in case the current operation was an undo and redo one there's
        // nothing to be done (no history stack change)
        if (options && ["undo", "redo"].indexOf(options.action) !== -1) {
            return;
        }

        // pushes the current state of the configuration (parts) into
        // the history stack allowing undo and redo
        this._pushHistory();
    });

    try {
        // runs the configuration operation on the current instance, using
        // the requested parameters and options, multiple configuration
        // operations may be executed over the object life-time
        await this.config(brand, model, options);
    } catch (error) {
        // calls the error handler for the current handler to update the
        // internal items of the RIPE instance
        this._errorHandler(error);

        // returns the control flow immediately as the exception has been
        // properly handled for the current context
        return;
    }

    // runs the initialization of the locale bundles, provided by the
    // remote handle, this is required for proper initialization
    if (this.useBundles) this._initBundles().catch(err => this._errorHandler(err));
};

/**
 * The deinitializer to be called when it should stop responding
 * to updates so that any necessary cleanup operations can be executed.
 */
ripe.Ripe.prototype.deinit = async function() {
    let index = null;

    for (index = this.children.length - 1; index >= 0; index--) {
        const child = this.children[index];
        this.unbindInteractable(child);
    }

    for (index = this.plugins.length - 1; index >= 0; index--) {
        const plugin = this.plugins[index];
        this.removePlugin(plugin);
    }

    ripe.Observable.prototype.deinit.call(this);
};

/**
 * Explicit entry point to the initial update.
 *
 * This method should be called before any significant RIPE operation
 * can be performed on the instance.
 *
 * @returns {Object} The current RIPE instance (for pipelining).
 */
ripe.Ripe.prototype.load = function() {
    this.update();
    return this;
};

/**
 * Explicit entry point for the unloading of the RIPE instance.
 *
 * Should be called for a clean exit of the instance.
 *
 * @returns {Object} The current RIPE instance (for pipelining).
 */
ripe.Ripe.prototype.unload = function() {
    return this;
};

/**
 * Sets the model to be customised by providing both the brand
 * and the model for the update.
 *
 * @param {String} brand The brand of the model.
 * @param {String} model The name of the model.
 * @param {Object} options An object with the options to configure the Ripe instance, such as:
 *  - 'parts' - The initial parts of the model.
 *  - 'initials' - The initial value for the initials of the model.
 *  - 'engraving' - The initial engraving value of the model.
 *  - 'initialsExtra' - The initial value for the initials extra.
 *  - 'country' - The country where the model will be sold.
 *  - 'currency' - The currency that should be used to calculate the price.
 *  - 'locale' - The locale to be used by default when localizing values.
 *  - 'flag' - A specific attribute of the model.
 *  - 'remoteCalls' - If the remote calls (eg: 'on_config') should be called in the middle of configuration.
 *  - 'useBundles' - If the bundles should be loaded during initial loading.
 *  - 'useDefaults' - If the default parts of the model should be used when no initials parts are set.
 *  - 'useCombinations' - If the combinations should be loaded as part of the initial RIPE loading.
 *  - 'usePrice' - If the price should be automatically retrieved whenever there is a customization change.
 *  - 'useDiag' - If the diagnostics module should be used.
 */
ripe.Ripe.prototype.config = async function(brand, model, options = {}) {
    // sets the most structural values of this entity
    // that represent the configuration to be used
    this.brand = brand;
    this.model = model;

    // resets the history related values as the current
    // model has changed and no previous history is possible
    this.history = [];
    this.historyPointer = -1;

    // sets the new options using the current options
    // as default values and sets the update flag to
    // true if it is not set
    options = ripe.assign({}, this.options, options);
    this.setOptions(options);

    // in case there's a DKU defined for the current config then
    // an extra resolution step must occur, to be able to obtain
    // the configuration of the current customization
    if (this.dku) {
        const config = await this.configDkuP(this.dku);
        this.brand = config.brand;
        this.model = config.model;
        this.parts = config.parts === undefined ? this.parts : config.parts;
        this.initials = config.initials === undefined ? this.initials : config.initials;
        this.engraving = config.engraving === undefined ? this.engraving : config.engraving;
        this.initialsExtra =
            config.initials_extra === undefined && config.initialsExtra === undefined
                ? this.initialsExtra
                : config.initialsExtra || config.initials_extra;
    }

    // determines if a valid model is currently defined for the ripe
    // instance, as this is going to change some logic behaviour
    const hasModel = Boolean(this.brand && this.model);

    // in case no model is currently loaded it's time to return the
    // control flow as all of the structures are currently loaded
    if (hasModel === false) {
        this.loadedConfig = null;
        if (this.ready === false) {
            this.ready = true;
            this.trigger("ready");
        }
        return;
    }

    // triggers the 'pre_config' event so that the listeners
    // can cleanup if needed, from the previous configuration
    await this.trigger("pre_config", brand, model, options);

    // retrieves the configuration for the currently loaded model so
    // that others may use it freely (cache mechanism)
    this.loadedConfig = await this.getConfigP();

    // creates a "new" choices from the provided configuration for the
    // model that has just been "loaded" and sets it as the new set of
    // choices for the configuration context
    this.setChoices(this._toChoices(this.loadedConfig));

    // triggers the config event notifying any listener that the (base)
    // configuration for this main RIPE instance has changed and waits
    // for the listeners to conclude their operations
    await this.trigger("config", this.loadedConfig, options);

    // determines if the ready flag is already set for the current instance
    // and if that's not the case updates it and triggers the ready event
    if (this.ready === false) {
        this.ready = true;
        this.trigger("ready");
    }

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    const hasParts = this.parts && Object.keys(this.parts).length !== 0;
    const loadDefaults = !hasParts && this.useDefaults && hasModel;

    // determines the proper initial parts for the model taking into account
    // if the defaults should be loaded
    const parts = loadDefaults ? this.loadedConfig.defaults : this.parts;

    // updates the parts of the current instance so that the internals of it
    // reflect the newly loaded configuration
    await this.setParts(parts, true, { partEvents: false });

    // in case both the initials and the engraving value are set in the options
    // runs the updating of the internal state to update the initials
    if (options.initials && options.engraving) {
        this.setInitials(options.initials, options.engraving, false);
    }

    // in case the initials extra are defined then runs the setting of the initials
    // extra on the current instance (without update events)
    if (options.initialsExtra) {
        this.setInitialsExtra(options.initialsExtra, false);
    }

    // notifies that the config has changed and waits for listeners before
    // concluding the config operation
    await this.trigger("post_config", this.loadedConfig, options);

    // triggers the remote operations, that should be executed
    // only after the complete set of post confirm promises are met
    this.remote();

    // runs the initial update operation, so that all the visuals and children
    // objects are properly updated according to the new configuration
    this.update();
};

/**
 * @ignore
 */
ripe.Ripe.prototype.remote = async function() {
    // makes sure that both the brand and the model values are defined
    // for the current instance as they are needed for the remove operation
    // that are going to be performed
    if (!this.brand || !this.model) {
        return;
    }

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    const loadCombinations = this.useCombinations;
    if (loadCombinations) {
        this.combinations = await this.getCombinationsP();
        this.trigger("combinations", this.combinations);
    }
};

/**
 * Sets Ripe instance options according to the defaulting policy.
 *
 * @param {Object} options An object with the options to configure the Ripe instance, such as:
 *  - 'parts' - The initial parts of the model.
 *  - 'country' - The country where the model will be sold.
 *  - 'currency' - The currency that should be used to calculate the price.
 *  - 'locale' - The locale to be used by default when localizing values.
 *  - 'flag' - A specific attribute of the model.
 *  - 'format' - The format of the image that is going to be retrieved in case of image visual and interactive.
 *  - 'backgroundColor' - The background color in RGB format to be used for images.
 *  - 'guess' - If the optimistic guess mode should be used for config resolution (internal).
 *  - 'guessUrl' - If base production URL should be guessed using GeoIP information.
 *  - 'remoteCalls' - If the remote calls (eg: 'on_config') should be called in the middle of configuration.
 *  - 'useBundles' - If the bundles should be loaded during initial loading.
 *  - 'useDefaults' - If the default parts of the model should be used when no initials parts are set.
 *  - 'useCombinations' - If the combinations should be loaded as part of the initial RIPE loading.
 *  - 'usePrice' - If the price should be automatically retrieved whenever there is a customization change.
 *  - 'useDiag' - If the diagnostics module should be used.
 */
ripe.Ripe.prototype.setOptions = function(options = {}) {
    this.options = options;
    this.variant = this.options.variant || null;
    this.dku = this.options.dku || null;
    this.url = this.options.url || "https://sandbox.platforme.com/api/";
    this.webUrl = this.options.webUrl || "https://sandbox.platforme.com/";
    this.parts = this.options.parts || {};
    this.country = this.options.country || null;
    this.currency = this.options.currency || null;
    this.locale = this.options.locale || null;
    this.flag = this.options.flag || null;
    this.format = this.options.format || null;
    this.backgroundColor = this.options.backgroundColor || "";
    this.guess = this.options.guess === undefined ? undefined : this.options.guess;
    this.guessUrl = this.options.guessUrl === undefined ? undefined : this.options.guessUrl;
    this.remoteCalls = this.options.remoteCalls === undefined ? true : this.options.remoteCalls;
    this.remoteOnConfig =
        this.options.remoteOnConfig === undefined ? this.remoteCalls : this.options.remoteOnConfig;
    this.remoteOnPart =
        this.options.remoteOnPart === undefined ? this.remoteCalls : this.options.remoteOnPart;
    this.remoteOnInitials =
        this.options.remoteOnInitials === undefined
            ? this.remoteCalls
            : this.options.remoteOnInitials;
    this.noBundles = this.options.noBundles === undefined ? false : this.options.noBundles;
    this.useBundles =
        this.options.useBundles === undefined ? !this.noBundles : this.options.useBundles;
    this.noDefaults = this.options.noDefaults === undefined ? false : this.options.noDefaults;
    this.useDefaults =
        this.options.useDefaults === undefined ? !this.noDefaults : this.options.useDefaults;
    this.noCombinations =
        this.options.noCombinations === undefined ? false : this.options.noCombinations;
    this.useCombinations =
        this.options.useCombinations === undefined
            ? !this.noCombinations
            : this.options.useCombinations;
    this.noPrice = this.options.noPrice === undefined ? false : this.options.noPrice;
    this.usePrice = this.options.usePrice === undefined ? !this.noPrice : this.options.usePrice;
    this.noDiag = this.options.noDiag === undefined ? false : this.options.noDiag;
    this.useDiag = this.options.useDiag === undefined ? !this.noDiag : this.options.useDiag;

    // in case the requested format is the "dynamic" lossless one
    // tries to find the best lossless image format taking into account
    // the current browser environment
    if (this.format === "lossless") {
        this.format = this._supportsWebp() ? "webp" : "png";
    }

    // in case the lossful meta-format is defined defines the best possible
    // lossful format taking into account the environment
    if (this.format === "lossful") {
        this.format = "jpeg";
    }

    // runs the background color normalization process that removes
    // the typical cardinal character from the definition
    this.backgroundColor = this.backgroundColor.replace("#", "");
};

/**
 * Changes the material and color of the provided part.
 *
 * This operations is an expensive one and should be used carefully
 * to avoid unwanted resource usage.
 *
 * If many operations are meant to be used at the same time the `setParts`
 * parts method should be used instead, as it is better suited for bulk
 * based operations.
 *
 * @param {String} part The name of the part to be changed.
 * @param {String} material The material to change to.
 * @param {String} color The color to change to.
 * @param {Boolean} events If the parts events should be triggered (defaults to 'true').
 */
ripe.Ripe.prototype.setPart = async function(part, material, color, events = true, options = null) {
    if (!events) {
        await this._setPart(part, material, color);
    }

    await this.trigger("pre_parts", this.parts, options);
    await this._setPart(part, material, color);

    // propagates the state change in the internal structures to the
    // children elements of this RIPE instance
    this.update();

    await this.trigger("parts", this.parts, options);
    await this.trigger("post_parts", this.parts, options);
};

/**
 * Allows changing the customization of a set of parts in bulk.
 *
 * @param {Object} parts An Object or array with part, material, color triplets to be set.
 * @param {Boolean} events If the parts events should be triggered (defaults to 'true').
 * @param {Object} options An object with options to configure the operation (for internal use).
 */
ripe.Ripe.prototype.setParts = async function(update, events = true, options = {}) {
    const partEvents = options.partEvents === undefined ? true : options.partEvents;

    if (typeof update === "object" && !Array.isArray(update)) {
        update = this._partsList(update);
    }

    if (!events) {
        await this._setParts(update, partEvents);
        return;
    }

    await this.trigger("pre_parts", this.parts, options);
    await this._setParts(update, partEvents);
    this.update();
    await this.trigger("parts", this.parts, options);
    await this.trigger("post_parts", this.parts, options);
};

/**
 * Changes the initials of the model, this is considered a simple
 * legacy oriented strategy as the `setInitialsExtra` method should
 * be used for more complex scenarios with multiple groups.
 *
 * @param {String} initials The initials value to be set.
 * @param {String} engraving The type of engraving to be set.
 * @param {Boolean} events If the events associated with the initials
 * change should be triggered.
 */
ripe.Ripe.prototype.setInitials = async function(initials, engraving, events = true, params = {}) {
    if (typeof initials === "object") {
        events = engraving === undefined ? true : engraving;
        const result = await this.setInitialsExtra(initials, events);
        return result;
    }

    this.initials = initials || "";
    this.engraving = engraving || null;
    this.initialsExtra = {
        main: {
            initials: initials || "",
            engraving: engraving || null
        }
    };

    if (!this.initials && this.engraving) {
        throw new Error("Engraving set without initials");
    }

    // in case the events should not be triggered then returns
    // the control flow immediately, nothing remaining to be done
    if (!events) return this;

    // triggers the initials event notifying any listening
    // object about the changes
    await this.trigger("initials", initials, engraving, params);

    // runs the update operation so that all the listening
    // components can properly update their visuals
    this.update();

    // returns the current instance (good for pipelining)
    return this;
};

/**
 * Changes the initials of the model using an object as the input which
 * allows setting the initials for multiple groups at the same time.
 *
 * @param {Object} initialsExtra Object that contains the values of the
 * initials and engraving for all the initial groups.
 * @param {Boolean} events If the events associated with the changing of
 * the initials (extra) should be triggered.
 */
ripe.Ripe.prototype.setInitialsExtra = async function(initialsExtra, events = true, params = {}) {
    const groups = Object.keys(initialsExtra);
    const isEmpty = groups.length === 0;
    const mainGroup = groups.includes("main") ? "main" : groups[0];
    const mainInitials = initialsExtra[mainGroup];

    if (isEmpty) {
        this.initials = "";
        this.engraving = null;
        this.initialsExtra = {};
    } else {
        this.initials = mainInitials.initials || "";
        this.engraving = mainInitials.engraving || null;
        this.initialsExtra = initialsExtra;
    }

    for (const [key, value] of Object.entries(this.initialsExtra)) {
        if (value.initials && !value.engraving) {
            value.engraving = null;
        }

        if (!value.initials && value.engraving) {
            throw new Error(`Engraving set without initials for group ${key}`);
        }
    }

    if (!events) return this;

    // triggers the initials extra event notifying any
    // listening object about the changes
    await this.trigger("initials_extra", initialsExtra, params);

    // runs the update operation so that all the listening
    // components can properly update their visuals
    this.update();

    // returns the current instance (good for pipelining)
    return this;
};

/**
 * Retrieves the value of the current base context defined in
 * the instance.
 *
 * @returns {Object} The base context currently set.
 */
ripe.Ripe.prototype.getCtx = function(ctx) {
    return this.ctx;
};

/**
 * Changes the current base context object (ctx) that is
 * going to be sent for (3D) build logic on crucial workflow
 * state changes.
 *
 * @param {Object} ctx The new base context to be used.
 */
ripe.Ripe.prototype.setCtx = function(ctx) {
    this.ctx = ctx;
};

/**
 * Returns the model's configuration loaded from the Platforme's system.
 * The config version loaded by this method is the one "cached" in the
 * instance, if there's any.
 *
 * @returns {Object} The model's configuration.
 */
ripe.Ripe.prototype.getLoadedConfig = function() {
    return this.loadedConfig;
};

/**
 * Returns the current state (eg: availability) for the parts materials
 * and colors associated with the current customization session.
 *
 * @returns {Object} The object that contains the state for every single
 * part, material, and color.
 */
ripe.Ripe.prototype.getChoices = function() {
    return this.choices;
};

/**
 * Updates the current internal state for parts material and colors, properly
 * notifying any "listener" about these changes.
 *
 * @param {Object} choices The object that contains the state for every single
 * part, material, and color.
 * @param {Boolean} events If the choices events should be triggered (defaults
 * to 'true').
 */
ripe.Ripe.prototype.setChoices = function(choices, events = true) {
    // updates the internal object with the choices that are now
    // going to be set
    this.choices = choices;

    // in case no event triggering is required no the control flow
    // must return immediately
    if (!events) return;

    // triggers the choices event that should change the available
    // set of choices in the visual/UI assets
    this.trigger("choices", this.choices);
};

/**
 * Returns the model's available frames, in an object structure
 * that maps a certain face with the number of available frames
 * for such face.
 *
 * This function makes use of the loaded config in case there's
 * one, otherwise triggers the loading of the config.
 *
 * @returns {Promise} The model's available frames.
 */
ripe.Ripe.prototype.getFrames = async function(callback) {
    if (this.options.frames) {
        callback && callback(this.options.frames);
        return this.options.frames;
    }

    const config = this.loadedConfig ? this.loadedConfig : await this.getConfigP();

    const frames = {};

    for (let index = 0; index < config.faces.length; index++) {
        const face = config.faces[index];
        frames[face] = 1;
    }

    // ensures that the "legacy" side face has the a value
    // populated with the "legacy" frames field in case there's
    // none populated by the standard processing loop (above)
    frames.side = config.frames;

    // iterates over the complete set of faces to populate the frames
    // structure with the most up-to-date strategy using the faces map
    // that contains all the information about each face
    for (const [face, faceM] of Object.entries(config.faces_m)) {
        frames[face] = faceM.frames;
    }

    // calls the callback with the resolved frame (unsafe) and returns
    // the frames map to the caller method
    callback && callback(frames);
    return frames;
};

/**
 * Binds an Image to this Ripe instance.
 *
 * @param {Image} element The Image to be used by the Ripe instance.
 * @param {Object} options An Object with options to configure the Image instance.
 * @returns {Image} The Image instance created.
 */
ripe.Ripe.prototype.bindImage = function(element, options = {}) {
    const image = new ripe.Image(this, element, options);
    return this.bindInteractable(image);
};

/**
 * Binds an Configurator to this Ripe instance.
 *
 * @param {Configurator} element The Configurator to be used by the Ripe instance.
 * @param {Object} options An Object with options to configure the Configurator instance.
 * @returns {Configurator} The Configurator instance created.
 */
ripe.Ripe.prototype.bindConfigurator = function(element, options = {}) {
    options = Object.assign({}, { format: this.format }, options);
    const config = new ripe.Configurator(this, element, options);
    return this.bindInteractable(config);
};

/**
 * Binds an Interactable to this Ripe instance.
 *
 * @param {Interactable} element The Interactable to be used by the Ripe instance.
 * @param {Object} options An Object with options to configure the Interactable instance.
 * @returns {Interactable} The Interactable instance created.
 */
ripe.Ripe.prototype.bindInteractable = function(element) {
    this.children.push(element);
    return element;
};

/**
 * Unbinds ab Interactable from this Ripe instance.
 *
 * @param {Interactable} element The Interactable instance to be unbound.
 * @returns {Interactable} Returns the unbounded Interactable.
 */
ripe.Ripe.prototype.unbindInteractable = function(element) {
    element.deinit();
    this.children.splice(this.children.indexOf(element), 1);
};

/**
 * Unbinds ab Image from this Ripe instance.
 *
 * @param {Image} element The Image instance to be unbound.
 * @returns {Image} Returns the unbounded Image.
 */
ripe.Ripe.prototype.unbindImage = ripe.Ripe.prototype.unbindInteractable;

/**
 * Unbinds ab Configurator from this Ripe instance.
 *
 * @param {Configurator} element The Image instance to be unbound.
 * @returns {Configurator} Returns the unbounded Configurator.
 */
ripe.Ripe.prototype.unbindConfigurator = ripe.Ripe.prototype.unbindInteractable;

/**
 * Selects a part of the model.
 * Triggers a 'selected_part' event with the part.
 *
 * @param {String} part The name of the part to be selected.
 * @param {Object} options An Object with options to configure the operation.
 */
ripe.Ripe.prototype.selectPart = function(part, options = {}) {
    this.trigger("selected_part", part);
};

/**
 * Deselects a part of the model.
 * Triggers a 'deselected_part' event with the part.
 *
 * @param {String} part The name of the part to be deselected.
 * @param {Object} options An Object with options to configure the operation.
 */
ripe.Ripe.prototype.deselectPart = function(part, options = {}) {
    this.trigger("deselected_part", part);
};

/**
 * Triggers the update of the children so that they represent the
 * current state of the model.
 *
 * This is considered the many state change operation and should be
 * called whenever a relevant internal state value is changed so that
 * the visuals are updated in accordance.
 *
 * @param {Object} state An Object with the current customization and
 * personalization.
 */
ripe.Ripe.prototype.update = function(state) {
    state = state || this._getState();

    for (let index = 0; index < this.children.length; index++) {
        const child = this.children[index];
        child.update(state);
    }

    this.ready && this.trigger("update");

    this.ready && this.usePrice && this.getPrice(value => this.trigger("price", value));
};

/**
 * Reverses the last change to the parts. It is possible
 * to undo all the changes done from the initial state.
 */
ripe.Ripe.prototype.undo = async function() {
    if (!this.canUndo()) {
        return;
    }

    this.historyPointer -= 1;
    const parts = this.history[this.historyPointer];
    if (parts) await this.setParts(parts, true, { action: "undo", partEvents: false });
};

/**
 * Executes the same operation as `undo` but goes all the way
 * to the bottom of the stack that controls the history.
 */
ripe.Ripe.prototype.undoAll = async function() {
    if (!this.canUndo()) {
        return;
    }

    this.historyPointer = 0;
    const parts = this.history[this.historyPointer];
    if (parts) await this.setParts(parts, true, { action: "undo", partEvents: false });
};

/**
 * Reapplies the last change to the parts that was undone.
 * Notice that if there's a change when the history pointer
 * is in the middle of the stack the complete stack forward
 * is removed (history re-written).
 */
ripe.Ripe.prototype.redo = async function() {
    if (!this.canRedo()) {
        return;
    }

    this.historyPointer += 1;
    const parts = this.history[this.historyPointer];
    if (parts) await this.setParts(parts, true, { action: "redo", partEvents: false });
};

/**
 * Executes the same operation as `redo` but goes all the way
 * to the top of the stack that controls the history.
 */
ripe.Ripe.prototype.redoAll = async function() {
    if (!this.canRedo()) {
        return;
    }

    this.historyPointer = this.history.length - 1;
    const parts = this.history[this.historyPointer];
    if (parts) await this.setParts(parts, true, { action: "redo", partEvents: false });
};

/**
 * Indicates if there are part changes to undo.
 *
 * @returns {Boolean} If there are changes to reverse in the
 * current parts history stack.
 */
ripe.Ripe.prototype.canUndo = function() {
    return this.historyPointer > 0;
};

/**
 * Indicates if there are part changes to redo.
 *
 * @returns {Boolean} If there are changes to reapply pending
 * in the history stack.
 */
ripe.Ripe.prototype.canRedo = function() {
    return this.history.length - 1 > this.historyPointer;
};

/**
 * Returns a promise that is fulfilled once the RIPE instance
 * is ready to be used.
 *
 * This can be used to actively wait for the initialization of
 * the RIPE instance under an async environment.
 *
 * @returns {Promise} The promise to be fulfilled once the instance
 * is ready to be used.
 */
ripe.Ripe.prototype.isReady = async function() {
    await new Promise((resolve, reject) => {
        if (this.ready) {
            resolve();
        } else if (this.error) {
            reject(this.error);
        } else {
            this.bind("ready", resolve);
            this.bind("error", reject);
        }
    });
};

/**
 * Returns a promise that is resolved once the remote locale bundles
 * are retrieved from their remote locations.
 *
 * This is relevant for situations where proper location is required
 * for a certain scenario (eg: sizes).
 *
 * @returns {Promise} The promise to be fulfilled on the base locale
 * bundles are loaded.
 */
ripe.Ripe.prototype.hasBundles = async function() {
    await new Promise((resolve, reject) => {
        if (this.bundles) resolve();
        else this.bind("bundles", resolve);
    });
};

/**
 * Registers a plugin to this Ripe instance.
 *
 * @param {Plugin} plugin The plugin to be registered.
 */
ripe.Ripe.prototype.addPlugin = function(plugin) {
    plugin.register(this);
    this.plugins.push(plugin);
};

/**
 * Unregisters a plugin to this Ripe instance.
 *
 * @param {Plugin} plugin The plugin to be unregistered.
 */
ripe.Ripe.prototype.removePlugin = function(plugin) {
    plugin.unregister(this);
    this.plugins.splice(this.plugins.indexOf(plugin), 1);
};

/**
 * Normalizes the parts dictionary by taking into account optional parts
 * that should be set even for empty situations.
 *
 * @param {Object} parts The parts object that should be cloned and then
 * ensured to have the optional parts set.
 * @returns {Object} A copy of the provided parts with the optional parts
 * set even if not defined.
 */
ripe.Ripe.prototype.normalizeParts = function(parts) {
    if (!parts) return parts;

    const defaults = this.loadedConfig.defaults;
    const _parts = ripe.clone(parts);

    for (const part in defaults) {
        if (!defaults[part].optional) continue;
        if (_parts[part] !== undefined) continue;
        _parts[part] = {
            material: undefined,
            color: undefined
        };
    }

    return _parts;
};

/**
 * @ignore
 */
ripe.Ripe.prototype._guessUrl = async function() {
    const result = await this.geoResolveP();
    const country = result.country ? result.country.iso_code : null;
    switch (country) {
        case "CN":
            this.url = "https://app.cn.platforme.com:8444/api/";
            this.webUrl = "https://app.cn.platforme.com:8444/";
            this.options.url = this.url;
            this.options.webUrl = this.webUrl;
            break;
        default:
            this.url = "https://app.platforme.com/api/";
            this.webUrl = "https://app.platforme.com/";
            this.options.url = this.url;
            this.options.webUrl = this.webUrl;
            break;
    }
};

/**
 * @ignore
 */
ripe.Ripe.prototype._initBundles = async function(defaultLocale = "en_us") {
    const locale = this.locale || defaultLocale;
    const globalBundleP = this.localeBundleP(locale, "scales");
    const sizesBundleP = this.localeBundleP(locale, "sizes");
    const [globalBundle, sizesBundle] = await Promise.all([globalBundleP, sizesBundleP]);
    this.addBundle(globalBundle, locale);
    this.addBundle(sizesBundle, locale);
    this.bundles = true;
    this.trigger("bundles");
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getState = function() {
    return {
        parts: this.parts,
        initials: this.initials,
        engraving: this.engraving,
        initialsExtra: this.initialsExtra
    };
};

/**
 * @ignore
 */
ripe.Ripe.prototype._setPart = async function(part, material, color, events = true, force = false) {
    // ensures that there's one valid configuration loaded
    // in the current instance, required for part setting
    if (!this.loadedConfig) {
        throw Error("Model config is not loaded");
    }

    // if the material or color are not set then this
    // is considered a removal operation and the part
    // is removed from the parts structure if it's
    // optional or an error is thrown if it's required
    const partInfo = this.loadedConfig.defaults[part];
    const isRequired = partInfo.optional !== true;
    const remove = Boolean(material && color) === false;
    if (isRequired && remove) {
        throw Error(`Part '${part}' can't be removed`);
    }

    // retrieves the current value structure for the part
    // that is going to be changed and determines if its value
    // is already the same as the new one to be set, this is
    // going to influence the triggering of events
    const current = this.parts[part] || {};
    const isSame = remove
        ? current.material === undefined && current.color === undefined
        : current.material === material && current.color === color;

    // in case the current value for the part is already the same
    // as the requested new one and the force flag is not set returns
    // immediately with the false flag indicating that no operation
    // has been performed
    if (!force && isSame) {
        return false;
    }

    // increments the part "change" counter, so that it's possible
    // o track unique part change operations
    this.partCounter++;

    // updates the value object with the newly requested values, notice
    // than in case this is a removal a null value is set for both the
    // material and color keys
    const value = {
        material: remove ? null : material,
        color: remove ? null : color
    };

    // "builds" the inline closure function that handles the
    // changing of the parts structure according to the new
    // requested state (material and color)
    const updatePart = () => {
        if (remove) {
            delete this.parts[part];
        } else {
            this.parts[part] = value;
        }
    };

    // in case no events should be raised for the part change
    // operation then just updates the parts structure and then
    // returns the control flow immediately
    if (!events) {
        updatePart();
        return true;
    }

    await this.trigger("pre_part", part, value);
    updatePart();
    await this.trigger("part", part, value);
    await this.trigger("post_part", part, value);

    // returns a valid value indicating that a concrete operation
    // of part changing has been performed
    return true;
};

/**
 * @ignore
 */
ripe.Ripe.prototype._setParts = async function(update, events = true) {
    for (let index = 0; index < update.length; index++) {
        const part = update[index];
        await this._setPart(part[0], part[1], part[2], events);
    }
};

/**
 * @ignore
 */
ripe.Ripe.prototype._partsList = function(parts) {
    parts = parts || this.parts;
    const partsList = [];
    for (const part in parts) {
        const value = parts[part];
        partsList.push([part, value.material, value.color]);
    }
    return partsList;
};

/**
 * @ignore
 */
ripe.Ripe.prototype._pushHistory = function() {
    if (!this.parts || !Object.keys(this.parts).length) {
        return;
    }

    if (ripe.equal(this.parts, this.history[this.historyPointer])) {
        return;
    }

    const _parts = this.normalizeParts(this.parts);
    this.history = this.history.slice(0, this.historyPointer + 1);
    this.history.push(_parts);
    this.historyPointer = this.history.length - 1;
};

/**
 * The default fallback error handler to be used for
 * every single detached async context.
 *
 * @param {Error} error The error that is going to be
 * handled.
 */
ripe.Ripe.prototype._errorHandler = function(error) {
    // sets the error in the current instance and then triggers the
    // error event on the current instance (notification)
    this.ready = this.ready || false;
    this.error = error;
    this.trigger("error", error);
    console.error(error.message || error);
};

/**
 * Handles the changes in the provided resulting context (ctx)
 * changing the internal state and triggering relevant events.
 *
 * @param {Object} result The resulting ctx object that is going to
 * be used in the changing of the internal state.
 */
ripe.Ripe.prototype._handleCtx = function(result) {
    if (result === undefined || result === null) return;
    if (result.parts === undefined || result.parts === null) return;
    result.parts = result.parts === undefined ? {} : result.parts;
    result.messages = result.messages === undefined ? [] : result.messages;
    for (const [name, value] of Object.entries(result.parts)) {
        this.parts[name] = value;
    }
    if (result.initials && !ripe.equal(result.initials, this.initialsExtra)) {
        this.setInitialsExtra(result.initials, true, { noRemote: true });
    }
    if (result.choices && !ripe.equal(result.choices, this.choices)) {
        this.setChoices(result.choices);
    }
    for (const [name, value] of result.messages) {
        this.trigger("message", name, value);
    }
};

/**
 * Builds the choices structure that is going to control
 * the state for parts materials and colors under the current
 * customization session.
 *
 * @param {Object} loadedConfig The configuration structure that
 * has just been loaded.
 * @returns {Object} The state object that can be used to control
 * the state of parts, materials and colors;
 */
ripe.Ripe.prototype._toChoices = function(loadedConfig) {
    const choices = {};
    for (const part of loadedConfig.parts) {
        if (loadedConfig.defaults[part.name].hidden) continue;
        if (loadedConfig.hidden.includes(part.name)) continue;
        const materialsState = {};
        choices[part.name] = {
            available: true,
            materials: materialsState
        };
        for (const material of part.materials) {
            const colorsState = {};
            materialsState[material.name] = {
                available: true,
                colors: colorsState
            };
            for (const color of material.colors) {
                colorsState[color] = {
                    available: true
                };
            }
        }
    }
    return choices;
};

ripe.Ripe.prototype._supportsWebp = function() {
    const element = document.createElement("canvas");
    if (!(element.getContext && element.getContext("2d"))) return false;
    return element.toDataURL("image/webp").indexOf("data:image/webp") === 0;
};

// eslint-disable-next-line no-unused-vars
var Ripe = ripe.Ripe;
