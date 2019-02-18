if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./observable");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe = function(brand, model, options) {
    ripe.Observable.call(this);
    ripe.Ripe.prototype.init.call(this, brand, model, options);
};

ripe.Ripe.prototype = ripe.build(ripe.Observable.prototype);

ripe.RipeBase = function(brand, model, options) {
    return new ripe.Ripe(brand, model, options);
};

ripe.Ripe.prototype.init = function(brand, model, options) {
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

ripe.Ripe.prototype.deinit = function() {
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

ripe.Ripe.prototype.load = function() {
    this.update();
};

ripe.Ripe.prototype.unload = function() {};

ripe.Ripe.prototype.config = async function(brand, model, options) {
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
    // configuration for this main RIPE instance has changed
    this.trigger("config", this.loadedConfig);

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
        return;
    }

    // updates the parts of the current instance and triggers the remove and
    // local update operations, as expected
    this.setParts(parts, false, { noPartEvents: true });
    this.remote();
    this.update();
};

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

ripe.Ripe.prototype.setOptions = function(options) {
    this.options = options || {};
    this.variant = this.options.variant || null;
    this.url = this.options.url || "https://sandbox.platforme.com/api/";
    this.webUrl = this.options.webUrl || "https://sandbox.platforme.com/";
    this.parts = this.options.parts || {};
    this.country = this.options.country || null;
    this.currency = this.options.currency || null;
    this.locale = this.options.locale || null;
    this.flag = this.options.flag || null;
    this.format = this.options.format || "jpeg";
    this.backgroundColor = this.options.backgroundColor || "";
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

ripe.Ripe.prototype.setPart = function(part, material, color, noEvents, options) {
    if (noEvents) {
        return this._setPart(part, material, color);
    }

    this.trigger("pre_parts", this.parts, options);
    this._setPart(part, material, color);
    this.update();
    this.trigger("parts", this.parts, options);
    this.trigger("post_parts", this.parts, options);
};

ripe.Ripe.prototype.setParts = function(update, noEvents, options) {
    if (typeof update === "object" && !Array.isArray(update)) {
        update = this._partsList(update);
    }

    if (noEvents) {
        return this._setParts(update, options && options.noPartEvents);
    }

    this.trigger("pre_parts", this.parts, options);
    this._setParts(update, options && options.noPartEvents);
    this.update();
    this.trigger("parts", this.parts, options);
    this.trigger("post_parts", this.parts, options);
};

ripe.Ripe.prototype.setInitials = function(initials, engraving, noEvents) {
    this.initials = initials;
    this.engraving = engraving;

    if (noEvents) {
        return;
    }
    this.update();
};

ripe.Ripe.prototype.getLoadedConfig = function() {
    return this.loadedConfig;
};

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

ripe.Ripe.prototype.bindImage = function(element, options) {
    var image = new ripe.Image(this, element, options);
    return this.bindInteractable(image);
};

ripe.Ripe.prototype.bindConfigurator = function(element, options) {
    var config = new ripe.Configurator(this, element, options);
    return this.bindInteractable(config);
};

ripe.Ripe.prototype.bindInteractable = function(child) {
    this.children.push(child);
    return child;
};

ripe.Ripe.prototype.unbindInteractable = function(child) {
    child.deinit();
    this.children.splice(this.children.indexOf(child), 1);
};

ripe.Ripe.prototype.unbindImage = ripe.Ripe.prototype.unbindInteractable;
ripe.Ripe.prototype.unbindConfigurator = ripe.Ripe.prototype.unbindInteractable;

ripe.Ripe.prototype.selectPart = function(part, options) {
    this.trigger("selected_part", part);
};

ripe.Ripe.prototype.deselectPart = function(part, options) {
    this.trigger("deselected_part", part);
};

ripe.Ripe.prototype.update = function(state) {
    state = state || this._getState();

    for (var index = 0; index < this.children.length; index++) {
        var child = this.children[index];
        child.update(state);
    }

    this.ready && this.trigger("update");

    this.ready &&
        this.usePrice &&
        this.getPrice(
            function(value) {
                this.trigger("price", value);
            }.bind(this)
        );
};

/**
 * Reverses the last change to the parts. It is possible
 * to undo all the changes done from the initial state.
 */
ripe.Ripe.prototype.undo = function() {
    if (!this.canUndo()) {
        return;
    }

    this.historyPointer -= 1;
    var parts = this.history[this.historyPointer];
    parts && this.setParts(parts, false, { action: "undo" });
};

/**
 * Reapplies the last change to the parts that was undone.
 * Notice that if there's a change when the history pointer
 * is in the middle of the stack the complete stack forward
 * is removed (history re-written).
 */
ripe.Ripe.prototype.redo = function() {
    if (!this.canRedo()) {
        return;
    }

    this.historyPointer += 1;
    var parts = this.history[this.historyPointer];
    parts && this.setParts(parts, false, { action: "redo" });
};

/**
 * Indicates if there are part changes to undo.
 *
 * @returns {boolean} If there are changes to reverse in the
 * current parts history stack.
 */
ripe.Ripe.prototype.canUndo = function() {
    return this.historyPointer > 0;
};

/**
 * Indicates if there are part changes to redo.
 *
 * @returns {boolean} If there are changes to reapply pending
 * in the history stack.
 */
ripe.Ripe.prototype.canRedo = function() {
    return this.history.length - 1 > this.historyPointer;
};

ripe.Ripe.prototype.addPlugin = function(plugin) {
    plugin.register(this);
    this.plugins.push(plugin);
};

ripe.Ripe.prototype.removePlugin = function(plugin) {
    plugin.unregister(this);
    this.plugins.splice(this.plugins.indexOf(plugin), 1);
};

ripe.Ripe.prototype._getState = function() {
    return {
        parts: this.parts,
        initials: this.initials,
        engraving: this.engraving
    };
};

ripe.Ripe.prototype._setPart = function(part, material, color, noEvents) {
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
        remove ? delete this.parts[part] : (this.parts[part] = value);
        return;
    }

    this.trigger("pre_part", part, value);
    remove ? delete this.parts[part] : (this.parts[part] = value);
    this.trigger("part", part, value);
    this.trigger("post_part", part, value);
};

ripe.Ripe.prototype._setParts = function(update, noEvents) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this._setPart(part[0], part[1], part[2], noEvents);
    }
};

ripe.Ripe.prototype._partsList = function(parts) {
    parts = parts || this.parts;
    var partsList = [];
    for (var part in parts) {
        var value = parts[part];
        partsList.push([part, value.material, value.color]);
    }
    return partsList;
};

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
