if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base"); // eslint-disable-line no-redeclare
    var compat = require("./compat"); // eslint-disable-line no-redeclare
    require("./ripe");
    var ripe = base.ripe; // eslint-disable-line no-redeclare
    var XMLHttpRequest = compat.XMLHttpRequest; // eslint-disable-line no-redeclare
}

ripe.Ripe.prototype.getConfig = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var configURL = this._getConfigURL();
    return this._cacheURL(configURL, callback);
};

ripe.Ripe.prototype.getPrice = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var priceURL = this._getPriceURL();
    return this._cacheURL(priceURL, callback);
};

ripe.Ripe.prototype.getDefaults = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var defaultsURL = this._getDefaultsURL();
    return this._cacheURL(defaultsURL, function(result) {
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
    return this._cacheURL(combinationsURL, function(result) {
        callback && callback(result.combinations);
    });
};

ripe.Ripe.prototype.sizeToNative = function(scale, value, gender, callback) {
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var fullUrl = this.url + "sizes/size_to_native?" + query;
    return this._cacheURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getSizes = function(callback) {
    var fullUrl = this.url + "sizes";
    return this._cacheURL(fullUrl, function(result) {
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
    return this._cacheURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSize = function(scale, value, gender, callback) {
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var fullUrl = this.url + "sizes/native_to_size?" + query;
    return this._cacheURL(fullUrl, function(result) {
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
    return this._cacheURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype._cacheURL = function(url, callback, options) {
    // runs the defaulting operatin on the provided options
    // optional parameter (ensures valid object there)
    options = options || {};

    // builds the (base) key value fro the provided value
    // from options or used the default one
    var key = options.key || "default";

    // creates the full key by adding the base key to the
    // URL value (including query string), this is unique
    // assuming no request payload
    var fullKey = key + ":" + url;

    // initializes the cache object in the current instance
    // in case it does not exists already
    this._cache = this._cache === undefined ? {} : this._cache;

    // in case there's already a valid value in cache,
    // retrieves it and calls the callback with the value
    if (this._cache[fullKey] !== undefined && !options.force) {
        callback && callback(this._cache[fullKey]);
        return;
    }

    // otherwise runs the "normal" request URL call and
    // sets the result cache key on return
    this._requestURL(url, function(result) {
        this._cache[fullKey] = result;
        callback && callback(result);
    }.bind(this));
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
    var brand = options.brand === undefined ? this.brand : options.brand;
    var model = options.model === undefined ? this.model : options.model;
    var variant = options.variant === undefined ? this.variant : options.variant;
    var frame = options.frame === undefined ? this.frame : options.frame;
    var parts = options.parts === undefined ? this.parts : options.parts;
    var engraving = options.engraving === undefined ? this.engraving : options.engraving;
    var country = options.country === undefined ? this.country : options.country;
    var currency = options.currency === undefined ? this.currency : options.currency;

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
    // ensures that some of the extra query options are not
    // sent unless they are explictly defined (exception)
    options = options || {};
    options.country = options.country || null;
    options.currency = options.currency || null;

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
    options.country = options.country || null;
    options.currency = options.currency || null;

    var query = this._getQuery(options);

    if (options.part) {
        query += "&part=" + options.part;
    }

    return this.url + "mask?" + query;
};
