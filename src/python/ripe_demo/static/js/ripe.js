var ripe = ripe || {};

ripe.assign = function(target) {
    if (typeof Object.assign === "function") {
        return Object.assign.apply(this, arguments);
    }

    if (target == null) {
        throw new TypeError("Cannot assign undefined or null object");
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

ripe.Observable.prototype.removeCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    var index = callbacks.indexOf(callback);
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

    // if no frames were provided then requests them from the
    // server. In any case the frames callback is triggered
    var loadFrames = !this.options.frames;
    if (loadFrames) {
        this.getFrames(function(frames) {
            this.frames = frames;
            this._runCallbacks("frames", this.frames);
        }.bind(this));
    } else {
        this.frames = this.options.frames;
        setTimeout(function() {
            this._runCallbacks("frames", this.frames);
        }.bind(this));
    }

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

var Ripe = ripe.Ripe;

ripe.createElement = function(tagName, className) {
    var element = tagName && document.createElement(tagName);
    element.className = className ? className : "";

    return element;
};

ripe.animateProperty = function(element, property, initial, final, duration, callback) {
    // sets the initial value for the property
    element.style[property] = initial;
    var last = new Date();
    var frame = function() {
        // checks how much time has passed
        // since the last animation frame
        var current = new Date();
        var timeDelta = current - last;
        var animationDelta = timeDelta * (final - initial) / duration;

        // adjusts the value by the correspondent amount
        // making sure it doens't surpass the final value
        var value = parseFloat(element.style[property]);
        value += animationDelta;
        value = final > initial ? Math.min(value, final) : Math.max(value, final);
        element.style[property] = value;
        last = current;

        // checks if the animation has finished and if it is then
        // fires the callback if it's set. Otherwise, requests a
        // new animation frame to proceed with the animation
        var incrementAnimation = final > initial && value < final;
        var decrementAnimation = final < initial && value > final;
        if (incrementAnimation || decrementAnimation) {
            // sets the id of the animation frame on the element
            // so that it can be canceled if necessary
            var id = requestAnimationFrame(frame);
            element.dataset.animation_id = id;
        } else {
            callback && callback();
        }
    };

    // starts the animation
    frame();
};

ripe.Ripe.prototype.getConfig = function(callback) {
    var configURL = this._getConfigURL();
    return this._requestURL(configURL, callback);
};

ripe.Ripe.prototype.getPrice = function(options, callback) {
    var priceURL = this._getPriceURL();
    return this._requestURL(priceURL, callback);
};

ripe.Ripe.prototype.getDefaults = function(options, callback) {
    var defaultsURL = this._getDefaultsURL();
    return this._requestURL(defaultsURL, function(result) {
        callback(result ? result.parts : null);
    });
};

ripe.Ripe.prototype.getCombinations = function(options, callback) {
    var combinationsURL = this._getCombinationsURL();
    return this._requestURL(combinationsURL, callback);
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
ripe.assign(ripe.Visual.prototype, ripe.Interactable.prototype);
ripe.Visual.constructor = ripe.Visual;

ripe.Visual.prototype.init = function() {};

ripe.Config = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Config.prototype.init.call(this, options);
};

ripe.Config.prototype = Object.create(ripe.Visual.prototype);

ripe.Config.prototype.init = function() {
    this.maxSize = this.element.dataset.max_size || this.options.maxSize || 1000;
    this.sensitivity = this.element.dataset.sensitivity || this.options.sensitivity || 40;

    this.owner.bind("selected_part", function(part) {
        this.highlightPart(part);
    }.bind(this));

    this.ready = false;

    // creates a structure the store the last presented
    // position of each view, to be used when returning
    // to a view for better user experience
    this._lastFrame = {};

    this.owner.bind("frames", function(frames) {
        this.frames = frames;
        this._initLayout();
        this.ready = true;
        this.update();
    }.bind(this));
};

ripe.Config.prototype._initLayout = function() {
    // clears the elements children
    while (this.element.firstChild) {
        this.element.firstChild.remove();
    }

    // sets the element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    this.element.classList.add("configurator");

    // creates the area canvas and adds it to the element
    var area = ripe.createElement("canvas", "area");
    var context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    this.element.appendChild(area);

    // adds the front mask element to the element,
    // this will be used to highlight parts
    var frontMask = ripe.createElement("img", "front-mask");

    this.element.appendChild(frontMask);

    // creates the back canvas and adds it to the element,
    // placing it on top of the area canvas
    var back = ripe.createElement("canvas", "back");

    var backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    this.element.appendChild(back);

    // adds the backs placeholder element that will be used to
    // temporarily store the images of the product's frames
    var sideFrames = this.owner.frames["side"];
    var backs = ripe.createElement("div", "backs");

    for (var index = 0; index < sideFrames; index++) {
        var backImg = ripe.createElement("img");
        backImg.dataset.frame = index;
        backs.appendChild(backImg);
    }
    var topImg = ripe.createElement("img");
    topImg.dataset.frame = "top";
    backs.appendChild(topImg);
    var bottomImg = ripe.createElement("img");
    bottomImg.dataset.frame = "bottom";
    backs.appendChild(bottomImg);
    this.element.appendChild(backs);

    // creates a masks element that will be used to store the various
    // mask images to be used during highlight and select operation
    var mask = ripe.createElement("canvas", "mask");
    this.element.appendChild(mask);
    var masks = ripe.createElement("div", "masks");
    for (var index = 0; index < sideFrames; index++) {
        var maskImg = ripe.createElement("img");
        maskImg.dataset.frame = index;
        masks.appendChild(maskImg);
    }

    var topImg = ripe.createElement("img");
    topImg.dataset.frame = "top";
    masks.appendChild(topImg);
    var bottomImg = ripe.createElement("img");
    bottomImg.dataset.frame = "bottom";
    masks.appendChild(bottomImg);
    this.element.appendChild(masks);

    this.element.dataset.position = 0;

    // set the size of area, frontMask, back and mask
    this.resize();

    this._registerHandlers();
};

ripe.Config.prototype.resize = function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.clientWidth || this.options.size;
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
    this.element.dataset.current_size = size;
    this.update();
};

ripe.Config.prototype.update = function(state, options) {
    if (this.ready === false) {
        return;
    }

    var view = this.element.dataset.view;
    var position = this.element.dataset.position;
    options = options || {};
    var animate = options.animate || false;
    var callback = options.callback;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    var previous = this.element.dataset.signature || "";
    var signature = this.owner._getQuery();
    var changed = signature !== previous;
    animate = animate || (changed && "simple");
    this.element.dataset.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    var size = this.element.getAttribute("data-current-size");
    previous = this.element.dataset.unique;
    var unique = signature + "&view=" + String(view) + "&position=" + String(position) + "&size=" + String(size);
    if (previous === unique) {
        callback && callback();
        return false;
    }
    this.element.dataset.unique = unique;

    // runs the load operation for the current frame
    this._loadFrame(view, position, {
            draw: true,
            animate: animate
        },
        callback
    );

    // runs the pre-loading process so that the remaining frames are
    // loaded for a smother experience when dragging the element,
    // note that this is only performed in case this is not a single
    // based update (not just the loading of the current position)
    // and the current signature has changed
    var preloaded = this.element.classList.contains("preload");
    var mustPreload = changed || !preloaded;
    mustPreload && this._preload(this.options.useChain);
};

ripe.Config.prototype.changeFrame = function(frame, options) {
    var _frame = frame.split("-");
    var nextView = _frame[0];
    var nextPosition = _frame[1];

    options = options || {};
    var step = options.step;
    var interval = options.interval || this.options.interval || 0;
    var preventDrag = options.preventDrag === undefined ? true : options.preventDrag;

    var view = this.element.dataset.view;
    var position = this.element.dataset.position;

    // saves the position of the current view
    // so that it returns to the same position
    // when coming back to the same view
    this._lastFrame[view] = position;

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    var animate = false;
    var viewFrames = this.owner.frames[nextView];
    if (view !== nextView && viewFrames !== undefined) {
        view = nextView;
        animate = "cross";
    }

    this.element.dataset.view = view;
    this.element.dataset.position = nextPosition;

    // if an animation step was provided then changes
    // to the next step instead of the target frame
    if (step) {
        var stepPosition = (parseInt(position) + step) % viewFrames;
        stepPosition = stepPosition < 0 ? viewFrames + stepPosition : stepPosition;
        if (step > 0 && stepPosition > nextPosition) {
            stepPosition = nextPosition;
        } else if (step < 0 && stepPosition < nextPosition) {
            stepPosition = nextPosition;
        }
        this.element.dataset.position = stepPosition;
    }

    // determines if the current change frame operation is an
    // animated one or if it's a discrete one
    var animated = Boolean(step);

    // if the frame change is animated and preventDrag is true
    // then ignores drag movements until the animation is finished
    preventDrag = preventDrag && (animate || step);
    preventDrag && this.element.classList.add("noDrag");

    this.update({}, {
        animate: animate,
        callback: function() {
            this._runCallbacks("changed_frame", nextPosition);

            // if there is no step transition or the
            // transition has finished then calls the
            // changed frame callback and allows drag
            // movements again
            if (!animated || stepPosition == nextPosition) {
                preventDrag && this.element.classList.remove("noDrag");
            }

            // otherwise waits the provided interval
            // and proceeds to the next step
            else {
                setTimeout(function() {
                    this.changeFrame(frame, options);
                }.bind(this), interval);
            }
        }.bind(this)
    });
};

ripe.Config.prototype._loadFrame = function(view, position, options, callback) {
    // retrieves the image that will be used to store the frame
    view = view || this.element.dataset.view || "side";
    position = position || this.element.dataset.position || 0;
    var frame = view === "side" ? position : view;

    options = options || {};
    var draw = options.draw === undefined || options.draw;
    var animate = options.animate;
    var backs = this.element.querySelector(".backs");
    var area = this.element.querySelector(".area");
    var image = backs.querySelector("img[data-frame='" + String(frame) + "']");
    var front = area.querySelector("img[data-frame='" + String(frame) + "']");
    image = image || front;

    // builds the url that will be set on the image
    var url = this.owner._getImageURL({
        frame: frame
    });

    // creates a callback to be called when the frame
    // is drawn to trigger the callback passed to this
    // function if it's set
    var drawCallback = function() {
        callback && callback();
    }.bind(this);

    // verifies if the loading of the current image
    // is considered redundant (already loaded or
    // loading) and avoids for performance reasons
    var isRedundant = image.dataset.src === url;
    if (isRedundant) {
        if (!draw) {
            callback && callback();
            return;
        }
        var isReady = image.dataset.loaded === "true";
        isReady && this._drawFrame(image, animate, drawCallback);
        return;
    }

    // adds load callback to the image to
    // draw the frame when it is available
    image.onload = function() {
        image.dataset.loaded = true;
        image.dataset.src = url;
        if (!draw) {
            callback && callback();
            return;
        }
        this._drawFrame(image, animate, drawCallback);
    }.bind(this);

    // sets the src of the image to trigger the request
    // and sets loaded to false to indicate that the
    // image is not yet loading
    image.src = url;
    image.dataset.src = url;
    image.dataset.loaded = false;
};

ripe.Config.prototype._drawFrame = function(image, animate, callback) {
    var area = this.element.querySelector(".area");
    var back = this.element.querySelector(".back");

    var visible = area.dataset.visible === "true";
    var current = visible ? area : back;
    var target = visible ? back : area;
    var context = target.getContext("2d");
    context.clearRect(0, 0, target.clientWidth, target.clientHeight);
    context.drawImage(image, 0, 0, target.clientWidth, target.clientHeight);

    target.dataset.visible = true;
    current.dataset.visible = false;

    if (!animate) {
        current.style.zIndex = 1;
        current.style.opacity = 0;
        target.style.zIndex = 1;
        target.style.opacity = 1;
        callback && callback();
        return;
    }

    var currentId = current.dataset.animation_id;
    var targetId = target.dataset.animation_id;
    currentId && cancelAnimationFrame(parseInt(currentId));
    targetId && cancelAnimationFrame(parseInt(targetId));

    var timeout = animate === "immediate" ? 0 : 500;
    if (animate === "cross") {
        ripe.animateProperty(current, "opacity", 1, 0, timeout);
    }

    ripe.animateProperty(target, "opacity", 0, 1, timeout, function() {
        current.style.opacity = 0;
        current.style.zIndex = 1;
        target.style.zIndex = 1;
        callback && callback();
    });
};

ripe.Config.prototype._preload = function(useChain) {
    var position = this.element.dataset.position || 0;
    var index = this.element.dataset.index || 0;
    index++;
    this.element.dataset.index = index;
    this.element.classList.add("preload");

    // adds all the frames to the work pile
    var work = [];
    for (var view in this.owner.frames) {
        var viewFrames = this.owner.frames[view];
        for (var _index = 0; _index < viewFrames; _index++) {
            if (_index === position) {
                continue;
            }
            var frame = view + "-" + _index;
            work.push(frame);
        }
    }
    work.reverse();

    var self = this;
    var mark = function(element) {
        var _index = self.element.dataset.index;
        _index = parseInt(_index);
        if (index !== _index) {
            return;
        }

        // removes the preloading class from the image element
        // and retrieves all the images still preloading,
        element.classList.remove("preloading");
        var backs = self.element.querySelector(".backs");
        var pending = backs.querySelectorAll("img.preloading") || [];

        // if there are images preloading then adds the
        // preloading class to the target element and
        // prevents drag movements to avoid flickering
        if (pending.length > 0) {
            self.element.classList.add("preloading")
            self.element.classList.add("noDrag");
        }

        // if there are no images preloading and no
        // frames yet to be preloaded then the preload
        // is considered finished so drag movements are
        // allowed again and the loaded event is triggered
        else if (work.length === 0) {
            self.element.classList.remove("preloading");
            self.element.classList.remove("noDrag");
            self._runCallbacks("loaded");
        }
    };

    var render = function() {
        var _index = self.element.getAttribute("data-index");
        _index = parseInt(_index);

        if (index !== _index) {
            return;
        }
        if (work.length === 0) {
            return;
        }

        // retrieves the next frame to be loaded
        // and its corresponding image element
        // and adds the preloading class to it
        var frame = work.pop();
        var _frame = frame.split("-");
        var view = _frame[0];
        var position = _frame[1];
        frame = view === "side" ? position : view;
        var backs = self.element.querySelector(".backs");
        var reference = backs.querySelector("img[data-frame='" + String(frame) + "']");
        reference.classList.add("preloading");

        // if a chain base loaded is used then
        // marks the current frame as pre-loaded
        // and proceeds to the next frame
        var callbackChain = function() {
            mark(reference);
            render();
        };

        // if all the images are pre-loaded at the
        // time then just marks the current one as
        // pre-loaded
        var callbackMark = function() {
            mark(reference);
        };

        // determines if a chain based loading should be used for the
        // pre-loading process of the various image resources to be loaded
        self._loadFrame(view, position, {
            draw: false
        }, useChain ? callbackChain : callbackMark);
        !useChain && render();
    };

    // if there are frames to be loaded then adds the
    // preloading class, prevents drag movements and
    // starts the render process after a timeout
    work.length > 0 && this.element.classList.add("preloading");
    if (work.length > 0) {
        this.element.classList.add("noDrag");
        setTimeout(function() {
            render();
        }, 250);
    }
};

ripe.Config.prototype.highlight = function(part, options) {};

ripe.Config.prototype.lowlight = function(options) {};

ripe.Config.prototype.enterFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    var maxSize = options.maxSize || this.element.dataset.max_size || this.options.maxSize;
    this.resize(maxSize);
};

ripe.Config.prototype.exitFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    this.resize();
};

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
    var self = this;
    this.element.addEventListener("mousemove", function(event) {
        var _element = this;

        if (_element.classList.contains("noDrag")) {
            return;
        }
        var down = _element.dataset.down;
        _element.dataset.mousePosX = event.pageX;
        _element.dataset.mousePosY = event.pageY;
        down === "true" && self._parseDrag();
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
    var percentX = deltaX / elementWidth;
    var percentY = deltaY / elementHeight;
    this.element.dataset.percent = percentX;
    var sensitivity = this.element.dataset.sensitivity || this.sensitivity;

    // if the movement was big enough then
    // adds the move class to the element
    Math.abs(percentX) > 0.02 && this.element.classList.add("move");
    Math.abs(percentY) > 0.02 && this.element.classList.add("move");

    // if the drag was vertical then alters the
    // view if it is supported by the product
    var view = this.element.dataset.view;
    var nextView = view;
    if (sensitivity * percentY > 15) {
        nextView = view === "top" ? "side" : "bottom";
        this.element.dataset.referenceY = mousePosY;
    } else if (sensitivity * percentY < -15) {
        nextView = view === "bottom" ? "side" : "top";
        this.element.dataset.referenceY = mousePosY;
    }
    if (this.owner.frames[nextView] === undefined) {
        nextView = view;
    }

    // retrieves the current view and its frames
    // and determines which one is the next frame
    var viewFrames = this.owner.frames[nextView];
    var next = parseInt(base - (sensitivity * percentX)) % viewFrames;
    next = next >= 0 ? next : viewFrames + next;

    // if the view changes then uses the last
    // position presented in that view, if not
    // then shows the next position according
    // to the drag
    next = view === nextView ? next : (this._lastFrame[nextView] || 0);

    var nextFrame = nextView + "-" + next;
    this.changeFrame(nextFrame);
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
    var size = this.element.clientWidth || this.options.size || 1000;
    var url = this.owner._getImageURL({
        frame: this.frame
    });
    if (this.element.src === url) {
        return;
    }
    this.element.width = size;
    this.element.height = size;
    this.element.src = url;
};

ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();
};

var exports = typeof exports === "undefined" ? {} : exports;
exports.Ripe = Ripe;
