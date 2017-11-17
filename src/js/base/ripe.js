if (typeof require !== "undefined") {
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
    this.country = this.options.country || null;
    this.currency = this.options.currency || null;
    this.format = this.options.format || "jpeg";
    this.backgroundColor = this.options.backgroundColor || "";
    this.noPrice = this.options.noPrice === undefined ? false : this.options.noPrice;
    this.usePrice = this.options.usePrice === undefined ? !this.noPrice : this.options.usePrice;
    this.children = [];
    this.ready = false;

    // runs the background color normalization process that removes
    // the typical cardinal character from the definition
    this.backgroundColor = this.backgroundColor.replace("#", "");

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && !this.options.noDefaults;
    var loadParts = loadDefaults ? this.getDefaults : setTimeout;
    loadParts.call(this, function(result) {
        result = result || this.parts;
        this.parts = result;
        this.ready = true;
        this.update();
        this.trigger("parts", this.parts);
    }.bind(this));

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = !this.options.noCombinations;
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
    var parts = this.parts || {};
    var value = parts[part];
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    if (noUpdate) {
        return;
    }
    this.update();
    this.trigger("parts", this.parts);
};

ripe.Ripe.prototype.setParts = function(update, noUpdate) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this.setPart(part[0], part[1], part[2], true);
    }

    if (noUpdate) {
        return;
    }

    this.update();
    this.trigger("parts", this.parts);
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

ripe.Ripe.prototype.select = function(part) {
    this.trigger("selected_part", part);
};

ripe.Ripe.prototype.deselect = function(part) {
    this.trigger("deselected_part", part);
};

ripe.Ripe.prototype._getState = function() {
    return {
        parts: this.parts
    };
};

ripe.Ripe.prototype.update = function(state) {
    state = state || this._getState();

    for (var index = 0; index < this.children.length; index++) {
        var child = this.children[index];
        child.update(state);
    }

    this.ready && this.trigger("update");

    this.ready && !this.usePrice && this.getPrice(function(value) {
        this.trigger("price", value);
    }.bind(this));
};

var Ripe = ripe.Ripe;
