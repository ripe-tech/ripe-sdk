if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    require("./observable");
    var ripe = base.ripe;
}

ripe.Ripe = function(brand, model, options) {
    ripe.Observable.call(this);
    ripe.Ripe.prototype.init.call(this, brand, model, options);
};

ripe.Ripe.prototype = Object.create(ripe.Observable.prototype);

ripe.Ripe.prototype.init = function(brand, model, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.brand = brand;
    this.model = model;
    this.options = options || {};
    this.variant = this.options.variant || null;
    this.url = this.options.url || "https://sandbox.platforme.com/api/";
    this.parts = this.options.parts || {};
    this.initials = "";
    this.engraving = null;
    this.country = this.options.country || null;
    this.currency = this.options.currency || null;
    this.format = this.options.format || "jpeg";
    this.backgroundColor = this.options.backgroundColor || "";
    this.noDefaults = this.options.noDefaults === undefined ? false : this.options.noDefaults;
    this.useDefaults = this.options.useDefaults === undefined ? !this.noDefaults : this.options.useDefaults;
    this.noCombinations = this.options.noCombinations === undefined ? false : this.options.noCombinations;
    this.useCombinations = this.options.useCombinations === undefined ? !this.noCombinations : this.options.useCombinations;
    this.noPrice = this.options.noPrice === undefined ? false : this.options.noPrice;
    this.usePrice = this.options.usePrice === undefined ? !this.noPrice : this.options.usePrice;
    this.children = [];
    this.plugins = [];
    this.ready = false;

    // runs the background color normalization process that removes
    // the typical cardinal character from the definition
    this.backgroundColor = this.backgroundColor.replace("#", "");

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && this.useDefaults;
    var loadParts = loadDefaults ? this.getDefaults : function(callback) {
        setTimeout(callback);
    };
    loadParts.call(this, function(result) {
        result = result || this.parts;
        this.parts = result;
        this.ready = true;
        this.trigger("ready");
        this.update();
        this.setParts(result);
    }.bind(this));

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = this.useCombinations;
    loadCombinations && this.getCombinations(function(result) {
        this.combinations = result;
        this.trigger("combinations", this.combinations);
    }.bind(this));

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    this.ready = hasParts;
};

ripe.Ripe.prototype.load = function() {
    this.update();
};

ripe.Ripe.prototype.unload = function() {};

ripe.Ripe.prototype.setPart = function(part, material, color, noUpdate) {
    this._setPart(part, material, color, true);
    if (noUpdate) {
        return;
    }
    this.update();
    this.trigger("parts", this.parts);
};

ripe.Ripe.prototype.setParts = function(update, noUpdate) {
    if (typeof update === "object" && Array.isArray(update) === false) {
        update = this._partsList(update);
    }

    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this._setPart(part[0], part[1], part[2], true);
    }

    if (noUpdate) {
        return;
    }

    this.update();
    this.trigger("parts", this.parts);
};

ripe.Ripe.prototype.setInitials = function(initials, engraving, noUpdate) {
    this.initials = initials;
    this.engraving = engraving;

    if (noUpdate) {
        return;
    }
    this.update();
};

ripe.Ripe.prototype.getFrames = function(callback) {
    if (this.options.frames) {
        callback(this.options.frames);
        return;
    }

    this.getConfig(function(config) {
        var frames = {};
        var faces = config["faces"];
        for (var index = 0; index < faces.length; index++) {
            var face = faces[index];
            frames[face] = 1;
        }

        var sideFrames = config["frames"];
        frames["side"] = sideFrames;
        callback && callback(frames);
    });
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

    this.ready && this.usePrice && this.getPrice(function(value) {
        this.trigger("price", value);
    }.bind(this));
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

ripe.Ripe.prototype._setPart = function(part, material, color) {
    var value = this.parts[part];
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    this.trigger("part", part, value);
};

ripe.Ripe.prototype._partsList = function(parts) {
    parts = parts || this.parts;
    var partsList = [];
    for (var part in parts) {
        var value = parts[part];
        partsList.push([
            part,
            value.material,
            value.color
        ]);
    }
    return partsList;
};

var Ripe = ripe.Ripe;
