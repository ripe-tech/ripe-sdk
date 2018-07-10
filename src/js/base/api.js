if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var compat = require("./compat");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
    // eslint-disable-next-line no-redeclare
    var XMLHttpRequest = compat.XMLHttpRequest;
}

ripe.RipeAPI = function(options) {
    return new ripe.Ripe(null, null, options);
};

ripe.Ripe.prototype.signin = function(username, password, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "signin";
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            username: username,
            password: password
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.oauthAccessToken = function(code, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "admin/oauth/access_token";
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            code: code,
            client_id: options.clientId || this.clientId,
            client_secret: options.clientSecret || this.clientSecret,
            redirect_uri: options.redirectUri || this.redirectUri,
            grant_type: options.grantType || this.grantType || "authorization_code"
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.oauthLogin = function(accessToken, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "admin/oauth/login";
    options = Object.assign(options, {
        url: url,
        method: "POST",
        params: {
            access_token: accessToken
        }
    });
    return this._cacheURL(options.url, options, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getOrders = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "orders";
    options = Object.assign(options, {
        url: url,
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "orders/" + String(number);
    options = Object.assign(options, {
        url: url,
        auth: true
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, function(result) {
        callback && callback(result);
    });
};

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

ripe.Ripe.prototype.sizeToNative = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var url = this.url + "sizes/size_to_native?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getSizes = function(callback) {
    var url = this.url + "sizes";
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.sizeToNativeB = function(scales, values, genders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

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

    var url = this.url + "sizes/size_to_native_b?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSize = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var url = this.url + "sizes/native_to_size?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSizeB = function(scales, values, genders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

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

    var url = this.url + "sizes/native_to_size_b?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype._cacheURL = function(url, options, callback) {
    // runs the defaulting operatin on the provided options
    // optional parameter (ensures valid object there)
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    // builds the (base) key value fro the provided value
    // from options or used the default one
    var key = options.key || "default";

    // creates the full key by adding the base key to the
    // URL value (including query string), this is unique
    // assuming no request payload
    var fullKey = key + ":" + url;

    // determines if the current request should be cached, obeys
    // some of the basic rules for that behaviour
    var cached = !options.force && ["GET"].indexOf(options.method || "GET") !== -1;

    // initializes the cache object in the current instance
    // in case it does not exists already
    this._cache = this._cache === undefined ? {} : this._cache;

    // in case there's already a valid value in cache,
    // retrieves it and calls the callback with the value
    if (this._cache[fullKey] !== undefined && cached) {
        callback && callback(this._cache[fullKey]);
        return null;
    }

    // otherwise runs the "normal" request URL call and
    // sets the result cache key on return
    return this._requestURL(
        url,
        options,
        function(result, isValid, request) {
            if (isValid && cached) {
                this._cache[fullKey] = result;
            }
            callback && callback(result, isValid, request);
        }.bind(this)
    );
};

ripe.Ripe.prototype._requestURL = function(url, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    var context = this;
    var method = options.method || "GET";
    var params = options.params || {};
    var headers = options.headers || {};
    var data = options.data || null;
    var contentType = options.contentType || null;

    var query = this._buildQuery(params);
    var isEmpty = ["GET", "DELETE"].indexOf(method) !== -1;
    var hasQuery = url.indexOf("?") !== -1;
    var separator = hasQuery ? "&" : "?";

    if (isEmpty || data) {
        url += separator + query;
    } else {
        data = query;
        contentType = "application/x-www-form-urlencoded";
    }

    var request = new XMLHttpRequest();

    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback && callback.call(context, isValid ? result : null, isValid, this);
    });

    request.open(method, url);
    for (var key in headers) {
        var value = headers[key];
        request.setRequestHeader(key, value);
    }
    if (contentType) {
        request.setRequestHeader("Content-Type", contentType);
    }
    if (data) {
        request.send(data);
    } else {
        request.send();
    }
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
    var url = this.url + "brands/" + brand + "/models/" + model + "/config";
    if (variant) {
        url += "?variant=" + variant;
    }
    return url;
};

ripe.Ripe.prototype._getPriceURL = function(options) {
    var query = this._getQuery(options);
    return this.url + "config/price" + "?" + query;
};

ripe.Ripe.prototype._getDefaultsURL = function(brand, model, variant) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var url = this.url + "brands/" + brand + "/models/" + model + "/defaults";
    url += variant ? "?variant=" + variant : "";
    return url;
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
    query += initials ? "&initials=" + encodeURIComponent(initials) : "";

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

ripe.Ripe.prototype._build = function(options) {
    var url = options.url || "";
    var method = options.method || "GET";
    var params = options.params || {};
    var auth = options.auth || false;
    if (auth) {
        params.sid = this.sid;
    }
    options.url = url;
    options.method = method;
    options.params = params;
    options.auth = auth;
    return options;
};

ripe.Ripe.prototype._buildQuery = function(params) {
    var key;
    var value;
    var buffer = [];

    if (Array.isArray(params)) {
        for (var index = 0; index < params.length; index++) {
            var tuple = params[index];
            key = tuple[0];
            value = tuple.length > 1 ? tuple[1] : "";
            key = encodeURIComponent(key);
            value = encodeURIComponent(value);
            buffer.push(key + "=" + value);
        }
    } else {
        for (key in params) {
            value = params[key];
            key = encodeURIComponent(key);
            value = encodeURIComponent(value);
            buffer.push(key + "=" + value);
        }
    }

    return buffer.join("&");
};

ripe.Ripe.prototype._unpackQuery = function(query) {
    query = query[0] === "?" ? query.slice(1) : query;

    var parts = query.split("&");
    var options = {};

    for (var index = 0; index < parts.length; index++) {
        var part = parts[index];

        if (part.indexOf("=") === -1) {
            options[decodeURIComponent(part).trim()] = true;
        } else {
            var tuple = part.split("=");
            var key = decodeURIComponent(tuple[0]).trim();
            var value = decodeURIComponent(tuple[1]).trim();
            options[key] = value;
        }
    }

    return options;
};
