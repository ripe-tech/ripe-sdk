var Ripe = function(url, model, parts, options) {
    this.init(url, model, parts, options);
};

Ripe.prototype.init = function(url, model, parts, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.url = url;
    this.model = model;
    this.parts = parts || {};
    this.options = options || {};
    this.binds = {};
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
    });

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = !options.noCombinations;
    loadCombinations && this.getCombinations(function(result) {
        this.combinations = result;
        this._runCallbacks("combinations", this.combinations);
    });

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

Ripe.prototype.bind = function(target, frame) {
    // validates that the provided target element is a
    // valid one and if that's not the case returns the
    // control flow immediately to the caller
    if (!target) {
        return;
    }

    // tries to retrieve the set of binds to the target
    // frame, then adds the target to that list and re-sets
    // the list in the binds map
    var bind = this.binds[frame] || [];
    bind.push(target);
    this.binds[frame] = bind;
};

Ripe.prototype.addUpdateCallback = function(callback) {
    this._addCallback("update", callback);
};

Ripe.prototype.removeUpdateCallback = function(callback) {
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

Ripe.prototype.render = function(target, frame, options) {
    target = target || this.options.target;
    var element = target;
    element.src = this._getImageURL(frame, null, null, options);
};

Ripe.prototype.update = function(price) {
    for (var frame in this.binds) {
        var bind = this.binds[frame];
        for (var index = 0; index < bind.length; index++) {
            var target = bind[index];
            this.render(target, frame);
        }
    }

    this.ready && this._runCallbacks("update");

    this.ready && this.getPrice(function(value) {
        this._runCallbacks("price", value);
    });
};

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

Ripe.prototype._getImageURL = function(frame, parts, model, engraving, options) {
    frame = frame || "0";
    parts = parts || this.parts;
    model = model || this.model;
    options = options || this.options || {};
    var query = this._getQuery(model, frame, parts, engraving, options);
    return this.url + "compose?" + query;
};

Ripe.prototype._getPriceURL = function(parts, model, engraving, options) {
    parts = parts || this.parts;
    model = model || this.model;
    engraving = engraving || this.options.engraving;
    options = options || this.options || {};
    var query = this._getQuery(model, null, parts, engraving, options);
    return this.url + "api/config/price" + "?" + query;
};

Ripe.prototype._getDefaultsURL = function(model) {
    model = model || this.model;
    return this.url + "api/models/" + model + "/defaults";
};

Ripe.prototype._getCombinationsURL = function(model, useName) {
    model = model || this.model;
    var useNameS = useName ? "1" : "0";
    return this.url + "api/models/" + model + "/combinations?" + "use_name=" + useNameS;
};

Ripe.prototype._getQuery = function(model, frame, parts, engraving, options) {
    var buffer = [];

    model && buffer.push("model=" + model);
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
