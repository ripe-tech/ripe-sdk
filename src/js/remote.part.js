Ripe.prototype.getConfig = function(callback) {
    var context = this;
    var configURL = this._getConfigURL();
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback.call(context, isValid ? result : null);
    });
    request.open("GET", configURL);
    request.send();
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

Ripe.prototype.getFrames = function(callback) {
    var self = this;
    if (this.config === undefined) {
        this.getConfig(function(config) {
            self.config = config;
            self.getFrames(callback);
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
    this.frames = frames;
    callback && callback(frames);
};

Ripe.prototype.getRestrictions = function(callback) {
    var self = this;
    if (this.config === undefined) {
        this.getConfig(function(config) {
            self.config = config;
            self.getRestrictions(callback);
        });
        return;
    }

    // iterates over the complete set of restrictions in the restrictions
    // list to process them and populate the restrictions map with a single
    // key to "restricted keys" association
    var restrictions = {};
    var restrictionsList = this.config["restrictions"];
    for (var index = 0; index < restrictionsList.length; index++) {
        var restriction = restrictionsList[index];

        // in case the restriction is considered to be a single one
        // then this is a special (all cases excluded one) and must
        // be treated as such (true value set in the map value)
        if (restriction.length === 1) {
            var _restriction = restriction[0];
            var key = _getTupleKey(_restriction.part, _restriction.material, _restriction.color);
            restrictions[key] = true;
            return;
        }

        // iterates over all the items in the restriction to correctly
        // populate the restrictions map with the restrictive values
        for (var index = 0; index < restriction.length; index++) {
            var item = restriction[index];

            var material = item.material;
            var color = item.color;
            var materialColorKey = _getTupleKey(null, material, color);

            for (var _index = 0; _index < restriction.length; _index++) {
                var _item = restriction[_index];

                var _material = _item.material;
                var _color = _item.color;
                var _key = _getTupleKey(null, _material, _color);

                if (_key === materialColorKey) {
                    continue;
                }

                var sequence = restrictions[materialColorKey] || [];
                sequence.push(_key);
                restrictions[materialColorKey] = sequence;
            }
        }
    };

    this.restrictions = restrictions;
    callback && callback(restrictions);
};

Ripe.prototype._getTupleKey = function(part, material, color, token) {
    var token = token || ":"
    part = part || "";
    material = material || "";
    color = color || "";
    return part + token + material + token + color;
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

Ripe.prototype._getConfigURL = function(brand, model) {
    brand = brand || this.brand;
    model = model || this.model;
    return this.url + "api/brands/" + brand + "/models/" + model + "/config";
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

    options = options || {};
    options.currency && buffer.push("currency=" + options.currency);
    options.country && buffer.push("country=" + options.country);

    options.format && buffer.push("format=" + options.format);
    options.size && buffer.push("size=" + options.size);
    options.background && buffer.push("background=" + options.background);

    return buffer.join("&");
};
