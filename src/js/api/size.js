if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.prototype.getSizes = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "sizes";
    options = Object.assign(options, {
        url: url,
        method: "GET"
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.sizeToNative = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "sizes/size_to_native";
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scale: scale,
            value: value,
            gender: gender
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.sizeToNativeB = function(scales, values, genders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    var scalesP = [];
    var valuesP = [];
    var gendersP = [];

    for (var index = 0; index < scales.length; index++) {
        scalesP.push(scales[index]);
        valuesP.push(values[index]);
        gendersP.push(genders[index]);
    }

    var url = this.url + "sizes/size_to_native_b";

    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scales: scalesP,
            values: valuesP,
            genders: gendersP
        }
    });
    options = this._build(options);

    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.nativeToSize = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "sizes/native_to_size";
    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scale: scale,
            value: value,
            gender: gender
        }
    });
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

ripe.Ripe.prototype.nativeToSizeB = function(scales, values, genders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    var scalesP = [];
    var valuesP = [];
    var gendersP = [];

    for (var index = 0; index < scales.length; index++) {
        scalesP.push(scales[index]);
        valuesP.push(values[index]);
        gendersP.push(genders[index]);
    }

    var url = this.url + "sizes/native_to_size_b";

    options = Object.assign(options, {
        url: url,
        method: "GET",
        params: {
            scales: scalesP,
            values: valuesP,
            genders: gendersP
        }
    });
    options = this._build(options);

    return this._cacheURL(options.url, options, callback);
};
