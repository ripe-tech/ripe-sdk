if (typeof require !== "undefined") {
    var base = require("./base");
    var compat = require("./compat");
    require("./ripe");
    var ripe = base.ripe;
    var XMLHttpRequest = compat.XMLHttpRequest;
}

ripe.Ripe.prototype.getConfig = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var configURL = this._getConfigURL();
    return this._requestURL(configURL, callback);
};

ripe.Ripe.prototype.getPrice = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var priceURL = this._getPriceURL();
    return this._requestURL(priceURL, callback);
};

ripe.Ripe.prototype.getDefaults = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var defaultsURL = this._getDefaultsURL();
    return this._requestURL(defaultsURL, function(result) {
        callback(result ? result.parts : null);
    });
};

ripe.Ripe.prototype.getOptionals = function(options, callback) {
    return this.getDefaults(options, function(defaults) {
        var optionals = [];
        for (var name in defaults) {
            var part = defaults[name];
            part.optional && optionals.push(name);
        }
        callback(optionals);
    });
};

ripe.Ripe.prototype.getCombinations = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var combinationsURL = this._getCombinationsURL();
    return this._requestURL(combinationsURL, function(result) {
        callback && callback(result.combinations);
    });
};

ripe.Ripe.prototype.sizeToNative = function(scale, value, gender, callback) {
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var fullUrl = this.url + "sizes/size_to_native?" + query;
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getSizes = function(callback) {
    var fullUrl = this.url + "sizes";
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.sizeToNativeB = function(scales, values, genders, callback) {
    var query = "";
    var scale = null;
    var value = null;
    var gender = null;
    for (var index = 0; index < scales.length; index++) {
        scale = scales[index];
        value = values[index];
        gender = genders[index];
        var prefix = index === 0 ? "" : "&";
        query += prefix + "scales=" + scale + "&values=" + value + "&genders=" + gender;
    }

    var fullUrl = this.url + "sizes/size_to_native_b?" + query;
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSize = function(scale, value, gender, callback) {
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var fullUrl = this.url + "sizes/native_to_size?" + query;
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSizeB = function(scales, values, genders, callback) {
    var query = "";
    var scale = null;
    var value = null;
    var gender = null;
    for (var index = 0; index < scales.length; index++) {
        scale = scales[index];
        value = values[index];
        gender = genders[index];
        var prefix = index === 0 ? "" : "&";
        query += prefix + "scales=" + scale + "&values=" + value + "&genders=" + gender;
    }

    var fullUrl = this.url + "sizes/native_to_size_b?" + query;
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype._requestURL = function(url, callback) {
    var context = this;
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback && callback.call(context, isValid ? result : null);
    });
    request.open("GET", url);
    request.send();
    return request;
};

ripe.Ripe.prototype._getQuery = function(options) {
    options = options || {};

    var buffer = [];
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
    country && buffer.push("country=" + country);
    currency && buffer.push("currency=" + currency);
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
    fullUrl += variant ? "?variant=" + variant : "";
    return fullUrl;
};

ripe.Ripe.prototype._getCombinationsURL = function(brand, model, variant, useName) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var useNameS = useName ? "1" : "0";
    var query = "use_name=" + useNameS;
    query += variant ? "&variant=" + variant : "";
    return this.url + "brands/" + brand + "/models/" + model + "/combinations" + "?" + query;
};

ripe.Ripe.prototype._getImageURL = function(options) {
    var query = this._getQuery(options);
    query += options.format ? "&format=" + options.format : "";
    query += options.width ? "&width=" + options.width : "";
    query += options.height ? "&height=" + options.height : "";
    query += options.size ? "&size=" + options.size : "";
    query += options.background ? "&background=" + options.background : "";
    query += options.crop ? "&crop=" + (options.crop ? 1 : 0) : "";
    query += options.profile ? "&initials_profile=" + options.profile.join(",") : "";

    var initials = options.initials === "" ? "$empty" : options.initials;
    query += initials ? "&initials=" + initials : "";

    return this.url + "compose?" + query;
};

ripe.Ripe.prototype._getMaskURL = function(options) {
    options = options || {};
    options.parts = options.parts || {};
    var query = this._getQuery(options);
    if (options.part) {
        query += "&part=" + options.part;
    }
    return this.url + "mask?" + query;
};
