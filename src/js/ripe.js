var Ripe = function(url, model, parts, options) {
    this.init(url, model, parts, options);
};

Ripe.prototype.init = function(url, model, parts, options) {
    // sets the various value in the instance taking into
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
    var hasParts = this.parts && Object.keys(this.parts).length != 0;
    var loadDefaults = !hasParts && !options.noDefaults;
    loadDefaults && this.getDefaults(function(result) {
        this.parts = result;
        this.ready = true;
        this.update();
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

Ripe.prototype.bind = function(target, frame) {
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

Ripe.prototype.render = function(target, frame, options) {
    var target = target || this.options.target;
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
        var isValid = this.status == 200;
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
        var isValid = this.status == 200;
        var result = JSON.parse(this.responseText);
        callback.call(context, isValid ? result.parts : null);
    });
    request.open("GET", defaultsURL);
    request.send();
};

Ripe.prototype._getImageURL = function(frame, parts, model, engraving, options) {
    var frame = frame || "0";
    var parts = parts || this.parts;
    var model = model || this.model;
    var options = options || this.options || {};
    var query = this._getQuery(model, frame, parts, engraving, options);
    return this.url + "compose?" + query;
};

Ripe.prototype._getPriceURL = function(parts, model, engraving) {
    var parts = parts || this.parts;
    var model = model || this.model;
    var engraving = engraving || this.options.engraving;
    var options = options || this.options || {};
    var query = this._getQuery(model, null, parts, engraving, options);
    return this.url + "api/config/price" + "?" + query;
};

Ripe.prototype._getDefaultsURL = function(model) {
    var model = model || this.model;
    return this.url + "api/config/get_defaults/" + model;
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
    if (index == -1) {
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
