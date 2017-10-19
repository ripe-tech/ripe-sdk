Ripe.RipeAPI = function(ripe, url) {
    this.ripe = ripe;
    this.url = url;
};

Ripe.RipeAPI.prototype.getPrice = function(callback) {
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

Ripe.RipeAPI.prototype.getDefaults = function(callback) {
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

Ripe.RipeAPI.prototype.getCombinations = function(callback) {
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

Ripe.RipeAPI.prototype._getQuery = function(brand, model, variant, frame, parts, engraving, options) {
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

Ripe.RipeAPI.prototype._getPriceURL = function(parts, brand, model, variant, engraving, options) {
    parts = parts || this.ripe.parts;
    brand = brand || this.ripe.brand;
    model = model || this.ripe.model;
    variant = variant || this.ripe.variant;
    engraving = engraving || this.ripe.engraving;
    options = options || this.ripe.options || {};
    engraving = engraving || this.ripe.options.engraving;
    var query = this._getQuery(brand, model, variant, null, parts, engraving, options);
    return this.url + "api/config/price" + "?" + query;
};

Ripe.RipeAPI.prototype._getDefaultsURL = function(brand, model, variant) {
    brand = brand || this.ripe.brand;
    model = model || this.ripe.model;
    variant = variant || this.ripe.variant;
    return this.url + "api/brands/" + brand + "/models/" + model + "/defaults?variant=" + variant;
};

Ripe.RipeAPI.prototype._getCombinationsURL = function(brand, model, variant, useName) {
    brand = brand || this.ripe.brand;
    model = model || this.ripe.model;
    variant = variant || this.ripe.variant;
    var useNameS = useName ? "1" : "0";
    var query = "variant=" + variant + "&use_name=" + useNameS;
    return this.url + "api/brands/" + brand + "/models/" + model + "/combinations" + "?" + query;
};

Ripe.RipeAPI.prototype._getImageURL = function(frame, parts, brand, model, variant, engraving, options) {
    frame = frame || "0";
    parts = parts || this.ripe.parts;
    brand = brand || this.ripe.brand;
    model = model || this.ripe.model;
    variant = variant || this.ripe.variant;
    engraving = engraving || this.ripe.engraving;
    options = options || this.ripe.options || {};
    engraving = engraving || this.ripe.options.engraving;
    var query = this._getQuery(brand, model, variant, frame, parts, engraving, options);
    return this.url + "compose?" + query;
};
