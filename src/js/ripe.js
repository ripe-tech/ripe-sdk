var Ripe = function(url, brand, model, variant, parts, options) {
    this.init(url, brand, model, variant, parts, options);
};

Ripe.prototype.init = function(url, brand, model, variant, parts, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.url = url;
    this.brand = brand;
    this.model = model;
    this.variant = variant;
    this.parts = parts || {};
    this.options = options || {};
    this.interactables = [];
    this.callbacks = {};
    this.ready = false;

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && !options.noDefaults;
    loadDefaults && this.getDefaults(function(result) {
        this.parts = result;
        this.ready = true;
        this.update();
        this._runCallbacks("parts", this.parts);
    }.bind(this));

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = !options.noCombinations;
    loadCombinations && this.getCombinations(function(result) {
        this.combinations = result;
        this._runCallbacks("combinations", this.combinations);
    }.bind(this));

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    this.ready = hasParts;
};

Ripe.prototype.load = function() {
    this.update();
};

Ripe.prototype.unload = function() {};

Ripe.prototype.setPart = function(part, material, color, noUpdate) {
    var parts = this.parts || {};
    var value = parts[part];
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    !noUpdate && this.update();
};

Ripe.prototype.setParts = function(update, noUpdate) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this.setPart(part[0], part[1], part[2], true);
    }!noUpdate && this.update();
};

Ripe.prototype.bindFrame = function(element, frame, options) {
    // validates that the provided target element is a
    // valid one and if that's not the case returns the
    // control flow immediately to the caller
    if (!element) {
        return;
    }

    // tries to retrieve the set of binds to the target
    // frame, then adds the target to that list and re-sets
    // the list in the binds map
    var interactableFrame = new Ripe.InteractableFrame(this, element, frame, options);
    this.interactables.push(interactableFrame);
    return interactableFrame;
};

Ripe.prototype.selectPart = function(part) {
    this._runCallbacks("selected_part", part);
};

Ripe.prototype.addSelectedPartCallback = function(callback) {
    this._addCallback("selected_part", callback);
};

Ripe.prototype.removeSelectedPartCallback = function(callback) {
    this._removeCallback("update", callback);
};

Ripe.prototype.addPriceCallback = function(callback) {
    this._addCallback("price", callback);
};

Ripe.prototype.removePriceCallback = function(callback) {
    this._removeCallback("price", callback);
};

Ripe.prototype.addPartsCallback = function(callback) {
    this._addCallback("parts", callback);
};

Ripe.prototype.removePartsCallback = function(callback) {
    this._removeCallback("parts", callback);
};

Ripe.prototype.addCombinationsCallback = function(callback) {
    this._addCallback("combinations", callback);
};

Ripe.prototype.removeCombinationsCallback = function(callback) {
    this._removeCallback("combinations", callback);
};

Ripe.prototype.update = function(price) {
    for (var index = 0; index < this.interactables.length; index++) {
        var interactable = this.interactables[index];
        interactable.update();
    }

    this.ready && this._runCallbacks("update");

    this.ready && this.getPrice(function(value) {
        this._runCallbacks("price", value);
    }.bind(this));
};

Ripe.prototype._addCallback = function(name, callback) {
    var callbacks = this.callbacks[name] || [];
    callbacks.push(callback);
    this.callbacks[name] = callbacks;
};

Ripe.prototype._removeCallback = function(name, callback) {
    var callbacks = this.callbacks[name] || [];
    var index = array.indexOf(callback);
    if (index === -1) {
        return;
    }
    callbacks.splice(index, 1);
    this.callbacks[name] = callbacks;
};

Ripe.prototype._runCallbacks = function(name) {
    var callbacks = this.callbacks[name] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

Ripe.Interactable = function(ripe, element, options) {
    if (!element) {
        return;
    }

    this.ripe = ripe;
    this.element = element;
    this.options = options || {};

    this.init();
};

Ripe.Interactable.prototype.init = function() {
    this.callbacks = {};
    this.size = this.element.getAttribute("data-size") || options.size || 1000;
};

Ripe.Interactable.prototype.update = function() {};

Ripe.Interactable.prototype.mergeOptions = function(baseOptions, options) {};

Ripe.Interactable.prototype.changeFrame = function(frame, options) {};

Ripe.Interactable.prototype._addCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
};

Ripe.Interactable.prototype._runCallbacks = function(event) {
    var callbacks = this.callbacks[event] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

Ripe.Interactable.prototype.addLoadedCallback = function(callback) {
    this._addCallback("loaded", callback);
};

Ripe.Interactable.prototype.addUpdatedCallback = function(callback) {};

Ripe.Interactable.prototype.addChangedFrameCallback = function(callback) {};

Ripe.InteractableConfig = function(ripe, element, options) {
    Ripe.Interactable.call(this, ripe, element, options);
    Ripe.Interactable.prototype.init.call(this);

    this.init();
};

Ripe.InteractableConfig.prototype = Object.create(Ripe.Interactable.prototype);

Ripe.InteractableConfig.prototype.init = function() {
    this.ripe.addSelectedPartCallback(function(part) {
        this.highlightPart(part);
    });
};

Ripe.InteractableConfig.prototype.highlightPart = function(part, options) {};

Ripe.InteractableConfig.prototype.lowlight = function(options) {};

Ripe.InteractableConfig.prototype.enterFullscreen = function(options) {};

Ripe.InteractableConfig.prototype.exitFullscreen = function(options) {};

Ripe.InteractableFrame = function(ripe, element, frame, options) {
    Ripe.Interactable.call(this, ripe, element, options);
    Ripe.Interactable.prototype.init.call(this);

    this.frame = frame;
    this.init();
};

Ripe.InteractableFrame.prototype = Object.create(Ripe.Interactable.prototype);

Ripe.InteractableFrame.prototype.init = function() {
    this.element.addEventListener("load", function() {
        this._runCallbacks("loaded");
    }.bind(this));
};

Ripe.InteractableFrame.prototype.update = function() {
    var url = this.ripe._getImageURL(this.frame, null, null, null, null, null, this.options);
    if (this.element.src === url) {
        return;
    }
    this.element.src = url;
};

var exports = typeof exports === "undefined" ? {} : exports;
exports.Ripe = Ripe;

Ripe.prototype.getPrice = function(callback) {
    var context = this;
    var priceURL = this._getPriceURL();
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback.call(context, isValid ? result : null);
    });
    request.open("GET", priceURL);
    request.send();
};

Ripe.prototype.getDefaults = function(callback) {
    var context = this;
    var defaultsURL = this._getDefaultsURL();
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback.call(context, isValid ? result.parts : null);
    });
    request.open("GET", defaultsURL);
    request.send();
};

Ripe.prototype.getCombinations = function(callback) {
    var context = this;
    var combinationsURL = this._getCombinationsURL();
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback.call(context, isValid ? result.combinations : null);
    });
    request.open("GET", combinationsURL);
    request.send();
};

Ripe.prototype._getQuery = function(brand, model, variant, frame, parts, engraving, options) {
    var buffer = [];

    brand && buffer.push("brand=" + brand);
    model && buffer.push("model=" + model);
    variant && buffer.push("variant=" + variant);
    frame && buffer.push("frame=" + frame);

    for (var part in parts) {
        var value = parts[part];
        var material = value.material;
        var color = value.color;
        if (!material) {
            continue;
        }
        if (!color) {
            continue;
        }
        buffer.push("p=" + part + ":" + material + ":" + color);
    }

    engraving && buffer.push("engraving=" + engraving);

    options.currency && buffer.push("currency=" + options.currency);
    options.country && buffer.push("country=" + options.country);

    options.format && buffer.push("format=" + options.format);
    options.size && buffer.push("size=" + options.size);
    options.background && buffer.push("background=" + options.background);

    return buffer.join("&");
};

Ripe.prototype._getPriceURL = function(parts, brand, model, variant, engraving, options) {
    parts = parts || this.parts;
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    engraving = engraving || this.engraving;
    options = options || this.options || {};
    engraving = engraving || this.options.engraving;
    var query = this._getQuery(brand, model, variant, null, parts, engraving, options);
    return this.url + "api/config/price" + "?" + query;
};

Ripe.prototype._getDefaultsURL = function(brand, model, variant) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    return this.url + "api/brands/" + brand + "/models/" + model + "/defaults?variant=" + variant;
};

Ripe.prototype._getCombinationsURL = function(brand, model, variant, useName) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var useNameS = useName ? "1" : "0";
    var query = "variant=" + variant + "&use_name=" + useNameS;
    return this.url + "api/brands/" + brand + "/models/" + model + "/combinations" + "?" + query;
};

Ripe.prototype._getImageURL = function(frame, parts, brand, model, variant, engraving, options) {
    frame = frame || "0";
    parts = parts || this.parts;
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    engraving = engraving || this.engraving;
    options = options || this.options || {};
    engraving = engraving || this.options.engraving;
    var query = this._getQuery(brand, model, variant, frame, parts, engraving, options);
    return this.url + "compose?" + query;
};
