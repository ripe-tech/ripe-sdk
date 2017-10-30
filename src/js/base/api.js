ripe.Ripe.prototype.getConfig = function(callback) {
    var configURL = this._getConfigURL();
    return this._requestURL(configURL, callback);
};

ripe.Ripe.prototype.getPrice = function(callback) {
    var priceURL = this._getPriceURL();
    return this._requestURL(priceURL, callback);
};

ripe.Ripe.prototype.getDefaults = function(callback) {
    var defaultsURL = this._getDefaultsURL();
    return this._requestURL(defaultsURL, function(result) {
        callback(result ? result.parts : null);
    });
};

ripe.Ripe.prototype.getCombinations = function(callback) {
    var combinationsURL = this._getCombinationsURL();
    return this._requestURL(combinationsURL, function(result) {
        callback && callback(result.combinations);
    });
};

ripe.Ripe.prototype.getFrames = function(callback) {
    if (this.config === undefined) {
        this.getConfig(function(config) {
            this.config = config;
            this.getFrames(callback);
        });
        return;
    }

    var frames = {};
    var faces = this.config["faces"];
    for (var index = 0; index < faces.length; index++) {
        var face = faces[index];
        frames[face] = 1;
    };

    var sideFrames = this.config["frames"];
    frames["side"] = sideFrames;
    callback && callback(frames);
};

ripe.Ripe.prototype._requestURL = function(url, callback) {
    var context = this;
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback.call(context, isValid ? result : null);
    });
    request.open("GET", url);
    request.send();
    return request;
};

ripe.Ripe.prototype._getQuery = function(options) {
    var buffer = [];

    var options = options || {};
    var brand = options.brand || this.brand;
    var model = options.model || this.model;
    var variant = options.variant || this.variant;
    var frame = options.frame || this.frame;
    var parts = options.parts || this.parts;
    var engraving = options.engraving || this.engraving;
    var country = options.country || this.country;
    var currency = options.currency || this.currency;

    brand && buffer.push("brand=" + brand);
    model && buffer.push("model=" + model);
    variant && buffer.push("variant=" + variant);
    if (frame) {
        var _frame = ripe.parseFrameKey(frame);
        var view = _frame[0];
        var position = _frame[1];
        position = view === "side" ? position : view;
        buffer.push("frame=" + position);
    }

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
    country && buffer.push("country=" + country);
    currency && buffer.push("currency=" + currency);

    // TODO: move this to another place
    options.format && buffer.push("format=" + options.format);
    options.size && buffer.push("size=" + options.size);
    options.background && buffer.push("background=" + options.background);

    return buffer.join("&");
};

ripe.Ripe.prototype._getConfigURL = function(brand, model, variant) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var fullUrl = this.url + "brands/" + brand + "/models/" + model + "/config";
    if (variant) {
        fullUrl += "?variant=" + variant;
    }
    return fullUrl;
};

ripe.Ripe.prototype._getPriceURL = function(options) {
    var query = this._getQuery(options);
    return this.url + "config/price" + "?" + query;
};

ripe.Ripe.prototype._getDefaultsURL = function(brand, model, variant) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var fullUrl = this.url + "brands/" + brand + "/models/" + model + "/defaults";
    if (variant) {
        fullUrl += "?variant=" + variant;
    }
    return fullUrl;
};

ripe.Ripe.prototype._getCombinationsURL = function(brand, model, variant, useName) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var useNameS = useName ? "1" : "0";
    var query = "use_name=" + useNameS;
    if (variant) {
        query += "&variant=" + variant;
    }
    return this.url + "brands/" + brand + "/models/" + model + "/combinations" + "?" + query;
};

ripe.Ripe.prototype._getImageURL = function(options) {
    var query = this._getQuery(options);
    return this.url + "compose?" + query;
};
