var ripe = ripe || {};

ripe._assign = function(target) {
    if (typeof Object.assign === "function") {
        return Object.assign.apply(this, arguments);
    }

    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource == null) {
            continue;
        }
        for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }
    return to;
};

ripe.Interactable = function(owner, options) {
    this.owner = owner;
    this.options = options || {};

    ripe.Interactable.prototype.init.call(this);
};

ripe.Interactable.prototype.init = function() {};

ripe.Interactable.prototype.update = function(state) {};

ripe.Observable = function() {
    this.callbacks = {};
};

ripe.Observable.prototype.addCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
};

ripe.Observable.prototype.removeCallback = function(event) {
    var callbacks = this.callbacks[event] || [];
    var index = array.indexOf(callback);
    if (index === -1) {
        return;
    }
    callbacks.splice(index, 1);
    this.callbacks[name] = callbacks;
};

ripe.Observable.prototype._runCallbacks = function(event) {
    var callbacks = this.callbacks[event] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

ripe.Observable.prototype.bind = ripe.Observable.prototype.addCallback;
ripe.Observable.prototype.unbind = ripe.Observable.prototype.removeCallback;

ripe.Ripe = function(brand, model, options) {
    ripe.Observable.call(this);
    ripe.Ripe.prototype.init.call(this, brand, model, options);
};

ripe.Ripe.prototype = Object.create(ripe.Observable.prototype);

ripe.Ripe.prototype.init = function(brand, model, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.brand = brand;
    this.model = model;
    this.options = options || {};
    this.variant = this.options.variant || null;
    this.url = this.options.url || "https://demo.platforme.com/api";
    this.parts = this.options.parts || {};
    this.country = this.options.country || null;
    this.currency = this.options.currency || null;
    this.children = [];
    this.ready = false;

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && !this.options.noDefaults;
    loadDefaults && this.getDefaults({}, function(result) {
        this.parts = result;
        this.ready = true;
        this.update();
        this._runCallbacks("parts", this.parts);
    }.bind(this));

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = !this.options.noCombinations;
    loadCombinations && this.getCombinations({}, function(result) {
        this.combinations = result;
        this._runCallbacks("combinations", this.combinations);
    }.bind(this));

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    this.ready = hasParts;
};

ripe.Ripe.prototype.load = function() {
    this.update();
};

ripe.Ripe.prototype.unload = function() {};

ripe.Ripe.prototype.setPart = function(part, material, color, noUpdate) {
    var parts = this.parts || {};
    var value = parts[part];
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    !noUpdate && this.update();
};

ripe.Ripe.prototype.setParts = function(update, noUpdate) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this.setPart(part[0], part[1], part[2], true);
    }!noUpdate && this.update();
};

ripe.Ripe.prototype.bindImage = function(element, options) {
    var image = new ripe.Image(this, element, options);
    return this.bindBase(image);
};

ripe.Ripe.prototype.bindConfig = function(element, options) {
    var config = new ripe.Config(this, element, options);
    return this.bindBase(config);
};

ripe.Ripe.prototype.bindBase = function(child) {
    this.children.push(child);
    return child;
};

ripe.Ripe.prototype.selectPart = function(part) {
    this._runCallbacks("selected_part", part);
};

ripe.Ripe.prototype.update = function(state) {
    state = state || {};
    state.parts = state.parts || this.parts;

    for (var index = 0; index < this.children.length; index++) {
        var child = this.children[index];
        child.update(state);
    }

    this.ready && this._runCallbacks("update");

    this.ready && this.getPrice({}, function(value) {
        this._runCallbacks("price", value);
    }.bind(this));
};

ripe.Ripe.prototype._removeCallback = function(name, callback) {
    var callbacks = this.callbacks[name] || [];
    var index = array.indexOf(callback);
    if (index === -1) {
        return;
    }
    callbacks.splice(index, 1);
    this.callbacks[name] = callbacks;
};

var Ripe = ripe.Ripe;

ripe.Ripe.prototype.getConfig = function(callback) {
    var configURL = this._getConfigURL();
    return this._requestUrl(configURL, callback);
};

ripe.Ripe.prototype.getPrice = function(options, callback) {
    var priceURL = this._getPriceURL();
    return this._requestUrl(priceURL, callback);
};

ripe.Ripe.prototype.getDefaults = function(options, callback) {
    var defaultsURL = this._getDefaultsURL();
    return this._requestUrl(defaultsURL, function(result) {
        callback(result ? result.parts : null);
    });
};

ripe.Ripe.prototype.getCombinations = function(options, callback) {
    var combinationsURL = this._getCombinationsURL();
    return this._requestUrl(combinationsURL, callback);
};

ripe.Ripe.prototype.loadFrames = function(callback) {
    if (this.config === undefined) {
        this.getConfig(function(config) {
            this.config = config;
            this.loadFrames(callback);
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

ripe.Ripe.prototype._requestUrl = function(url, callback) {
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

    // TODO: move this to another place
    options.format && buffer.push("format=" + format);
    options.size && buffer.push("size=" + size);
    options.background && buffer.push("background=" + background);

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

ripe.Visual = function(owner, element, options) {
    ripe.Observable.call(this);
    ripe.Interactable.call(this, owner, options);

    this.element = element;
    ripe.Visual.prototype.init.call(this);
};

ripe.Visual.prototype = Object.create(ripe.Observable.prototype);
ripe._assign(ripe.Visual.prototype, ripe.Interactable.prototype);
ripe.Visual.constructor = ripe.Visual;

ripe.Visual.prototype.init = function() {};

ripe.Config = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Config.prototype.init.call(this);
};

ripe.Config.prototype = Object.create(ripe.Visual.prototype);

ripe.Config.prototype.init = function() {
    this.owner.bind("selected_part", function(part) {
        this.highlightPart(part);
    }.bind(this));

    this.owner.loadFrames(function() {
        this._initDOM();
    }.bind(this));
};

ripe.Config.prototype._initDOM = function() {
    // sets defaults for the optional parameters
    var size = this.element.dataset.size || this.options.size || 1000;
    var maxSize = this.element.dataset.maxSize || this.options.maxSize || 1000;
    var sensitivity = this.element.dataset.sensitivity || this.options.sensitivity || 40;

    // sets the element element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    this.element.classList.add("configurator");
    this.element.fontSize = "0px";
    this.element.whiteSpace = "nowrap";

    // creates the area canvas and adds it to the element
    var area = document.createElement("canvas");
    area.className = "area";
    area.style.display = "inline-block";
    var context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    this.element.appendChild(area);

    // adds the front mask element to the element,
    // this will be used to highlight parts
    var frontMask = document.createElement("img");
    frontMask.className = "front-mask";
    frontMask.style.display = "none";
    frontMask.style.position = "relative";
    frontMask.style.pointerEvents = "none";
    frontMask.style.zIndex = 2;
    frontMask.style.opacity = 0.4;
    this.element.appendChild(frontMask);

    // creates the back canvas and adds it to the element,
    // placing it on top of the area canvas
    var back = document.createElement("canvas");
    back.className = "back";
    back.style.display = "inline-block";
    var backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    this.element.appendChild(back);

    // adds the backs placeholder element that will be used to
    // temporarily store the images of the product's frames
    var sideFrames = this.owner.frames["side"];
    var backs = document.createElement("div");
    backs.className = "backs";
    backs.style.display = "none";
    for (var index = 0; index < sideFrames; index++) {
        var backImg = document.createElement("img");
        backImg.setAttribute("data-frame", index);
        backs.appendChild(backImg);
    }
    var topImg = document.createElement("img");
    topImg.setAttribute("data-frame", "top");
    backs.appendChild(topImg);
    var bottomImg = document.createElement("img");
    bottomImg.setAttribute("data-frame", "bottom");
    backs.appendChild(bottomImg);
    this.element.appendChild(backs);

    // creates a masks element that will be used to store the various
    // mask images to be used during highlight and select operation
    var mask = document.createElement("canvas");
    mask.className = "mask";
    mask.style.display = "none";
    this.element.appendChild(mask);
    var masks = document.createElement("div");
    masks.className = "masks";
    masks.style.display = "none";
    for (var index = 0; index < sideFrames; index++) {
        var maskImg = document.createElement("img");
        maskImg.setAttribute("data-frame", index);
        masks.appendChild(maskImg);
    }

    var topImg = document.createElement("img");
    topImg.setAttribute("data-frame", "top");
    masks.appendChild(topImg);
    var bottomImg = document.createElement("img");
    bottomImg.setAttribute("data-frame", "bottom");
    masks.appendChild(bottomImg);
    this.element.appendChild(masks);

    this.element.dataset.position = 0;

    // set the size of area, frontMask, back and mask
    this.resize(size);

    this._registerHandlers();
};

ripe.Config.prototype.resize = function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.dataset.size || this.options.size;
    var area = this.element.querySelector(".area");
    var frontMask = this.element.querySelector(".front-mask");
    var back = this.element.querySelector(".back");
    var mask = this.element.querySelector(".mask");
    area.width = size;
    area.height = size;
    frontMask.width = size;
    frontMask.height = size;
    frontMask.style.width = size + "px";
    frontMask.style.marginLeft = "-" + String(size) + "px";
    back.width = size;
    back.height = size;
    back.style.marginLeft = "-" + String(size) + "px";
    mask.width = size;
    mask.height = size;
    this.element.setAttribute("data-current-size", size);
    this.update();
};

ripe.Config.prototype.update = function(state) {
    var parts = state.parts || this.parts;
    if (!parts) {
        return;
    }
    this.parts = parts;
    var position = this.element.dataset.position
};

ripe.Config.prototype.changeFrame = function(frame, options) {};

ripe.Config.prototype.highlight = function(part, options) {};

ripe.Config.prototype.lowlight = function(options) {};

ripe.Config.prototype.enterFullscreen = function(options) {};

ripe.Config.prototype.exitFullscreen = function(options) {};

ripe.Config.prototype._registerHandlers = function() {
    // binds the mousedown event on the element
    // to prepare it for drag movements
    this.element.addEventListener("mousedown", function(event) {
        var _element = this;
        _element.dataset.view = _element.dataset.view || "side";
        _element.dataset.base = _element.dataset.position || 0;
        _element.dataset.down = true;
        _element.dataset.referenceX = event.pageX;
        _element.dataset.referenceY = event.pageY;
        _element.dataset.percent = 0;
        _element.classList.add("drag");
    });

    // listens for mouseup events and if it
    // occurs then stops reacting to mousemove
    // events has drag movements
    this.element.addEventListener("mouseup", function(event) {
        var _element = this;
        _element.dataset.down = false;
        _element.dataset.percent = 0;
        _element.dataset.previous = _element.dataset.percent;
        _element.classList.remove("drag");
    });

    // listens for mouseleave events and if it
    // occurs then stops reacting to mousemove
    // events has drag movements
    this.element.addEventListener("mouseleave", function(event) {
        var _element = this;
        _element.dataset.down = false;
        _element.dataset.percent = 0;
        _element.dataset.previous = _element.dataset.percent;
        _element.classList.remove("drag");
    });

    // if a mousemove event is triggered while
    // the mouse is pressed down then updates
    // the position of the drag element
    this.element.addEventListener("mousemove", function(event) {
        var _element = this;

        if (_element.classList.contains("noDrag")) {
            return;
        }
        var down = _element.dataset.down;
        _element.dataset.mousePosX = event.pageX;
        _element.dataset.mousePosY = event.pageY;
        down === "true" && this._parseDrag();
    });
};

ripe.Config.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    var child = this.element.querySelector("*:first-child");
    var referenceX = this.element.dataset.referenceX;
    var referenceY = this.element.dataset.referenceY;
    var mousePosX = this.element.dataset.mousePosX;
    var mousePosY = this.element.dataset.mousePosY;
    var base = this.element.dataset.base;
    var deltaX = referenceX - mousePosX;
    var deltaY = referenceY - mousePosY;
    var elementWidth = this.element.clientWidth;
    var elementHeight = this.element.clientHeight || child.clientHeight;
    var percentX = deltaX / this.elementWidth;
    var percentY = deltaY / this.elementHeight;
    this.element.dataset.percent = percentX;
    var sensitivity = this.element.dataset.sensitivity || this.sensitivity;

    // retrieves the current view and its frames
    // and determines which one is the next frame
    var view = this.element.dataset.view;
    var viewFrames = this.owner.frames[view];
    var next = parseInt(base - (sensitivity * percentX)) % viewFrames;
    next = next >= 0 ? next : viewFrames + next;

    // if the movement was big enough then
    // adds the move class to the element
    Math.abs(percentX) > 0.02 && this.element.classList.add("move");
    Math.abs(percentY) > 0.02 && this.element.classList.add("move");

    // if the drag was vertical then alters the view
    var animate = false;
    var nextView = view;
    if (sensitivity * percentY > 15) {
        nextView = view === "top" ? "side" : "bottom";
    } else if (sensitivity * percentY < -15) {
        nextView = view === "bottom" ? "side" : "top";
    }

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    if (view !== nextView && this.owner.frames[nextView]) {
        this.element.dataset.referenceY = mousePosY;
        view = nextView;
        animate = "cross";
        this.element.classList.add("noDrag");
    }
    this.element.dataset.view = view;

    // if the frame changes then updates the product's position
    // if not then keeps using the current frame
    if (!isNaN(next)) {
        this.element.dataset.position = next;
    } else {
        var pos = this.element.dataset.position;
        next = parseInt(pos);
    }

    // if the new view doesn't have multiple frames
    // then ignores the index of the new frame
    viewFrames = this.owner.frames[view];
    next = viewFrames === 1 ? view : next;

    this.update();
    // updates the image of the drag element
    //self._updateDrag(element, next, animate, false, function() {
    // if a crossfade animation finishes
    // then stops ignoring drag movements
    //  if (animate === "cross") {
    //    this.element.classList.remove("noDrag");
    //}
    //}, options);

};

ripe.Image = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Image.prototype.init.call(this);
};

ripe.Image.prototype = Object.create(ripe.Visual.prototype);

ripe.Image.prototype.init = function() {
    this.frame = this.options.frame || 0;

    this.element.addEventListener("load", function() {
        this._runCallbacks("loaded");
    }.bind(this));
};

ripe.Image.prototype.update = function(state) {
    var url = this.owner._getImageURL({
        frame: this.frame
    });
    if (this.element.src === url) {
        return;
    }
    this.element.src = url;
};

ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();
};

var exports = typeof exports === "undefined" ? {} : exports;
exports.Ripe = Ripe;
