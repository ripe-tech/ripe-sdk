if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./observable");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @augments Observable
 * @classdesc Represents a customizable model.
 *
 * @param {String} brand The brand of the model.
 * @param {String} model The name of the model.
 * @param {Object} options An object with the options to configure the Ripe instance.
 */
ripe.Ripe = function(brand, model, options) {
    ripe.Observable.call(this);
    ripe.Ripe.prototype.init.call(this, brand, model, options);
};

ripe.Ripe.prototype = ripe.build(ripe.Observable.prototype);

/**
 * @ignore
 */
ripe.RipeBase = function(brand, model, options) {
    return new ripe.Ripe(brand, model, options);
};

/**
 * The initializer of the class, to be called whenever the instance
 * is going to become active.
 *
 * Sets the various values for the Ripe instance taking into account
 * the provided configuration and defaulting values policy.
 */
ripe.Ripe.prototype.init = async function(brand, model, options) {
    // runs the defaulting operation so that it's possible to
    // provide only the first parameters as the options
    if (
        typeof brand === "object" &&
        typeof model === "undefined" &&
        typeof options === "undefined"
    ) {
        options = brand;
        brand = options.brand || null;
        model = options.model || null;
    }

    // sets the various values in the instance taking into
    // account the default values
    this.initials = "";
    this.engraving = null;
    this.children = this.children || [];
    this.plugins = this.plugins || [];
    this.history = [];
    this.historyPointer = -1;
    this.loadedConfig = null;
    this.ready = false;

    // extends the default options with the ones provided by the
    // developer upon this initializer call
    options = ripe.assign(
        {
            options: false
        },
        options
    );
    this.setOptions(options);

    // iterates over all the plugins present in the options (meant
    // to be registered) and adds them to the current instance
    for (const plugin of options.plugins || []) {
        this.addPlugin(plugin);
    }

    // if diagnotisc headers have not been disabled then
    // registers the diag plugin to automatically add
    // diagnostic headers to every remote request
    if (this.useDiag) {
        var diagPlugin = new ripe.Ripe.plugins.DiagPlugin();
        this.addPlugin(diagPlugin);
    }

    // runs the connfiguration operation on the current instance, using
    // the requested parameters and options, multiple configuration
    // operations may be executed over the object life-time
    this.config(brand, model, options);

    // registers for the part (set) operation so that the execution may
    // be able to notify the server side logic anc change the current state
    // if that's required by the server side
    this.bind("part", async function(name, value) {
        let result = null;
        if (!this.remoteOnPart) return;
        try {
            result = await this.onPartP({
                name: name,
                value: value
            });
        } catch (err) {
            if (err instanceof ripe.RemoteError) return;
            else throw err;
        }
        if (result === undefined || result === null) return;
        if (result.parts === undefined || result.parts === null) return;
        for (const [name, value] of Object.entries(result.parts)) {
            this.parts[name] = value;
        }
    });

    // listens for the post parts event and saves the current configuration
    // for the undo operations (history control)
    this.bind("post_parts", function(parts, options) {
        // in case the current opertion was an undo and redo one there's
        // nothing to be done (no history stack change)
        if (options && ["undo", "redo"].indexOf(options.action) !== -1) {
            return;
        }

        // pushes the current state of the configuration (parts) into
        // the history stack allowing undo and redo
        this._pushHistory();
    });
};

/**
 * The deinitializer to be called when it should stop responding
 * to updates so that any necessary cleanup operations can be executed.
 */
ripe.Ripe.prototype.deinit = async function() {
    var index = null;

    for (index = this.children.length - 1; index >= 0; index--) {
        var child = this.children[index];
        this.unbindInteractable(child);
    }

    for (index = this.plugins.length - 1; index >= 0; index--) {
        var plugin = this.plugins[index];
        this.removePlugin(plugin);
    }

    ripe.Observable.prototype.deinit.call(this);
};

/**
 * Explicit entry point to the initial update.
 */
ripe.Ripe.prototype.load = function() {
    this.update();
};

/**
 * @ignore
 */
ripe.Ripe.prototype.unload = function() {};

/**
 * Sets the model to be customised.
 *
 * @param {String} brand The brand of the model.
 * @param {String} model The name of the model.
 * @param {Object} options An object with the options to configure the Ripe instance, such as:
 *  - 'parts' - The initial parts of the model.
 *  - 'country' - The country where the model will be sold.
 *  - 'currency' - The currency that should be used to calculate the price.
 *  - 'locale' - The locale to be used by default when localizing values.
 *  - 'flag' - A specific attribute of the model.
 *  - 'useDefaults' - If the default parts of the model should be used when no initials parts are set.
 *  - 'usePrice' - If the price should be automatically retrieved whenever there is a customization change.
 */
ripe.Ripe.prototype.config = async function(brand, model, options) {
    // triggers the 'pre_config' event so that
    // the listeners can cleanup if needed
    await this.trigger("pre_config");

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
    options = ripe.assign(
        {
            update: true
        },
        this.options,
        options
    );
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
    }

    // determines if a valid model is currently defined for the ripe
    // instance, as this is going to change some logic behaviour
    var hasModel = Boolean(this.brand && this.model);

    // retrieves the configuration for the currently loaded model so
    // that others may use it freely (cache mechanism)
    this.loadedConfig = hasModel ? await this.getConfigP() : null;

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && this.useDefaults && hasModel;

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    // for cases where this is the first configuration (not an update)
    var update = this.options.update || false;
    this.ready = update ? this.ready : hasParts;

    // triggers the config event notifying any listener that the (base)
    // configuration for this main RIPE instance has changed and waits
    // for the listeners to conclude their operations
    await this.trigger("config", this.loadedConfig);

    // determines the proper initial parts for the model taking into account
    // if the defaults should be loaded
    const parts = loadDefaults ? this.loadedConfig.defaults : this.parts;
    if (this.ready === false) {
        this.ready = true;
        this.trigger("ready");
    }

    // in case there's no model defined in the current instance then there's
    // nothing more possible to be done, reeturns the control flow
    if (hasModel === false) {
        await this.trigger("post_config", this.loadedConfig);
        return;
    }

    // updates the parts of the current instance so that the internals of it
    // reflect the newly loaded configuration
    await this.setParts(parts, false, { noPartEvents: true });

    // notifies that the config has changed and waits for listeners before
    // concluding the config operation
    await this.trigger("post_config", this.loadedConfig);

    // triggers the remove and local update operations, that should be executed
    // only after the complete set of post confirm promises are met
    this.remote();
    this.update();
};

/**
 * @ignore
 */
ripe.Ripe.prototype.remote = function() {
    // makes sure that both the brand and the model values are defined
    // for the current instance as they are needed for the remove operation
    // that are going to be performed
    if (!this.brand || !this.model) {
        return;
    }

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = this.useCombinations;
    loadCombinations &&
        this.getCombinations(
            function(result) {
                this.combinations = result;
                this.trigger("combinations", this.combinations);
            }.bind(this)
        );
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
 *  - 'useDefaults' - If the default parts of the model should be used when no initials parts are set.
 *  - 'usePrice' - If the price should be automatically retrieved whenever there is a customization change.
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
    this.format = this.options.format || "jpeg";
    this.backgroundColor = this.options.backgroundColor || "";
    this.remoteCalls = this.options.remoteCalls === undefined ? true : this.options.remoteCalls;
    this.remoteOnPart =
        this.options.remoteOnPart === undefined ? this.remoteCalls : this.options.remoteOnPart;
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

    // runs the background color normalization process that removes
    // the typical cardinal character from the definition
    this.backgroundColor = this.backgroundColor.replace("#", "");
};

/**
 * Changes the customization of a part.
 *
 * @param {String} part The part to be changed.
 * @param {String} material The material to change to.
 * @param {String} color The color to change to.
 * @param {Boolean} noEvents If the parts events shouldn't be triggered (defaults to 'false').
 */
ripe.Ripe.prototype.setPart = async function(part, material, color, noEvents, options) {
    if (noEvents) {
        await this._setPart(part, material, color);
    }

    await this.trigger("pre_parts", this.parts, options);
    await this._setPart(part, material, color);
    this.update();
    await this.trigger("parts", this.parts, options);
    await this.trigger("post_parts", this.parts, options);
};

/**
 * Allows changing the customization of a set of parts in bulk.
 *
 * @param {Object} parts An Object or array with part, material, color triplets to be set.
 * @param {Boolean} noEvents If the parts events shouldn't be triggered (defaults to 'false').
 * @param {Object} options An object with options to configure the operation (for internal use).
 */
ripe.Ripe.prototype.setParts = async function(update, noEvents, options) {
    if (typeof update === "object" && !Array.isArray(update)) {
        update = this._partsList(update);
    }

    if (noEvents) {
        await this._setParts(update, options && options.noPartEvents);
    }

    await this.trigger("pre_parts", this.parts, options);
    await this._setParts(update, options && options.noPartEvents);
    this.update();
    await this.trigger("parts", this.parts, options);
    await this.trigger("post_parts", this.parts, options);
};

/**
 * Changes the personalization of the model.
 *
 * @param {String} initials The initials to be set.
 * @param {String} engraving The engraving to be set.
 * @param {Boolean} noUpdate If the update operation shouldn't be triggered (defaults to 'false').
 */
ripe.Ripe.prototype.setInitials = function(initials, engraving, noEvents) {
    this.initials = initials;
    this.engraving = engraving;

    if (noEvents) {
        return;
    }
    this.update();
};

/**
 * Returns the model's configuration loaded from the Platforme's system.
 *
 * @returns {Object} The model's configuration.
 */
ripe.Ripe.prototype.getLoadedConfig = function() {
    return this.loadedConfig;
};

/**
 * Returns the model's available frames.
 *
 * @returns {Promise} The model's available frames.
 */
ripe.Ripe.prototype.getFrames = async function(callback) {
    if (this.options.frames) {
        callback(this.options.frames);
        return;
    }

    const config = this.loadedConfig ? this.loadedConfig : await this.getConfigP();
    var frames = {};
    var faces = config["faces"];
    for (var index = 0; index < faces.length; index++) {
        var face = faces[index];
        frames[face] = 1;
    }

    var sideFrames = config["frames"];
    frames["side"] = sideFrames;
    callback && callback(frames);
};

/**
 * Binds an Image to this Ripe instance.
 *
 * @param {Image} element The Image to be used by the Ripe instance.
 * @param {Object} options An Object with options to configure the Image instance.
 * @returns {Image} The Image instance created.
 */
ripe.Ripe.prototype.bindImage = function(element, options) {
    var image = new ripe.Image(this, element, options);
    return this.bindInteractable(image);
};

/**
 * Binds an Configurator to this Ripe instance.
 *
 * @param {Configurator} element The Configurator to be used by the Ripe instance.
 * @param {Object} options An Object with options to configure the Configurator instance.
 * @returns {Configurator} The Configurator instance created.
 */
ripe.Ripe.prototype.bindConfigurator = function(element, options) {
    var config = new ripe.Configurator(this, element, options);
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
ripe.Ripe.prototype.selectPart = function(part, options) {
    this.trigger("selected_part", part);
};

/**
 * Deselects a part of the model.
 * Triggers a 'deselected_part' event with the part.
 *
 * @param {String} part The name of the part to be deselected.
 * @param {Object} options An Object with options to configure the operation.
 */
ripe.Ripe.prototype.deselectPart = function(part, options) {
    this.trigger("deselected_part", part);
};

/**
 * Triggers the update of the children so that they represent the current state of the model.
 *
 * @param {Object} state An Object with the current customization and personalization.
 */
ripe.Ripe.prototype.update = function(state) {
    state = state || this._getState();

    for (var index = 0; index < this.children.length; index++) {
        var child = this.children[index];
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
    var parts = this.history[this.historyPointer];
    if (parts) await this.setParts(parts, false, { action: "undo" });
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
    var parts = this.history[this.historyPointer];
    if (parts) await this.setParts(parts, false, { action: "redo" });
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
 * @ignore
 */
ripe.Ripe.prototype._getState = function() {
    return {
        parts: this.parts,
        initials: this.initials,
        engraving: this.engraving
    };
};

/**
 * @ignore
 */
ripe.Ripe.prototype._setPart = async function(part, material, color, noEvents) {
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

    const value = this.parts[part] || {};
    value.material = remove ? null : material;
    value.color = remove ? null : color;

    if (noEvents) {
        if (remove) {
            delete this.parts[part];
        } else {
            this.parts[part] = value;
        }
        return;
    }

    await this.trigger("pre_part", part, value);
    if (remove) {
        delete this.parts[part];
    } else {
        this.parts[part] = value;
    }
    await this.trigger("part", part, value);
    await this.trigger("post_part", part, value);
};

/**
 * @ignore
 */
ripe.Ripe.prototype._setParts = async function(update, noEvents) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        await this._setPart(part[0], part[1], part[2], noEvents);
    }
};

/**
 * @ignore
 */
ripe.Ripe.prototype._partsList = function(parts) {
    parts = parts || this.parts;
    var partsList = [];
    for (var part in parts) {
        var value = parts[part];
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

    var _parts = ripe.clone(this.parts);
    this.history = this.history.slice(0, this.historyPointer + 1);
    this.history.push(_parts);
    this.historyPointer = this.history.length - 1;
};

// eslint-disable-next-line no-unused-vars
var Ripe = ripe.Ripe;
