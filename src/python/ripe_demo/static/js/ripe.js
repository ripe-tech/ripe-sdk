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

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length != 0;
    var loadDefaults = !hasParts && !options.noDefaults;
    loadDefaults && this.getDefaults(function(result) {
        this.parts = result;
    });
};

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

Ripe.prototype.render = function(target, frame, options) {
    var target = target || this.options.target;
    var element = target;
    element.src = this._getImageURL(frame, null, null, options);
};

Ripe.prototype.update = function() {
    for (var frame in this.binds) {
        var bind = this.binds[frame];
        for (var index = 0; index < bind.length; index++) {
            var target = bind[index];
            this.render(target, frame);
        }
    }
};

Ripe.prototype.getPrice = function(callback) {
    var context = this;
    var priceURL = this._getPriceURL();
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var result = JSON.parse(this.responseText);
        callback.call(context, result);
    });
    request.open("GET", priceURL);
    request.send();
};

Ripe.prototype.getDefaults = function(callback) {
    var context = this;
    var defaultsURL = this._getDefaultsURL();
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var result = JSON.parse(this.responseText);
        callback.call(context, result.parts);
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
