var Ripe = function(url, brand, model, variant, parts, frames, options) {
    this.init(url, brand, model, variant, parts, frames, options);
};

Ripe.prototype.init = function(url, brand, model, variant, parts, frames, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.url = url;
    this.brand = brand;
    this.model = model;
    this.variant = variant;
    this.parts = parts || {};
    this.frames = frames || {};
    this.options = options || {};
    this.frameBinds = {};
    this.dragBinds = [];
    this.callbacks = {};
    this.ready = false;

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && !this.options.noDefaults;
    loadDefaults && this.getDefaults(function(result) {
        this.parts = result;
        this.ready = true;
        this.update();
        this._runCallbacks("parts", this.parts);
    });

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start
    // the loading process for them, setting then the result in
    // the instance and builds a combinations map for easier use
    var loadCombinations = !options.noCombinations;
    loadCombinations && this.getCombinations(function(result) {
        this.combinations = result;
        this.combinationsMap = {};
        for (var index = 0; index < this.combinations.length; index++) {
            var combination = this.combinations[index];
            var part = combination[0];
            var material = combination[1];
            var color = combination[2];
            var partMaterials = this.combinationsMap[part] || {};
            var materialColors = partMaterials[material] || [];
            color && materialColors.push(color);
            partMaterials[material] = materialColors;
            this.combinationsMap[part] = partMaterials;
        }

        this.update();
        this._runCallbacks("combinations", this.combinations);
    });

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    this.ready = hasParts;
};

Ripe.prototype.load = function() {
    this.update();
};

Ripe.prototype.unload = function() {};

Ripe.prototype.setPart = function(part, material, color, noUpdate) {
    var parts = this.parts || {};
    var value = parts[part];
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    !noUpdate && this.update();
};

Ripe.prototype.setParts = function(update, noUpdate) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this.setPart(part[0], part[1], part[2], true);
    }!noUpdate && this.update();
};

Ripe.prototype.bindFrame = function(target, frame) {
    // validates that the provided target element is a
    // valid one and if that's not the case returns the
    // control flow immediately to the caller
    if (!target) {
        return;
    }

    // tries to retrieve the set of binds to the target
    // frame, then adds the target to that list and re-sets
    // the list in the binds map
    var bind = this.frameBinds[frame] || [];
    bind.push(target);
    this.frameBinds[frame] = bind;
};

Ripe.prototype.addUpdateCallback = function(callback) {
    this._addCallback("update", callback);
};

Ripe.prototype.removeUpdateCallback = function(callback) {
    this._removeCallback("update", callback);
};

Ripe.prototype.addPriceCallback = function(callback) {
    this._addCallback("price", callback);
};

Ripe.prototype.removePriceCallback = function(callback) {
    this._removeCallback("price", callback);
};

Ripe.prototype.addPartsCallback = function(callback) {
    this._addCallback("parts", callback);
};

Ripe.prototype.removePartsCallback = function(callback) {
    this._removeCallback("parts", callback);
};

Ripe.prototype.addCombinationsCallback = function(callback) {
    this._addCallback("combinations", callback);
};

Ripe.prototype.removeCombinationsCallback = function(callback) {
    this._removeCallback("combinations", callback);
};

Ripe.prototype.render = function(target, frame, options) {
    target = target || this.options.target;
    var element = target;
    element.src = this._getImageURL(frame, null, null, null, null, null, options);
};

Ripe.prototype.update = function(price) {
    for (var frame in this.frameBinds) {
        var bind = this.frameBinds[frame];
        for (var index = 0; index < bind.length; index++) {
            var target = bind[index];
            this.render(target, frame);
        }
    }


    for (var index = 0; index < this.dragBinds.length; index++) {
        var bind = this.dragBinds[index];
        this._updateDrag(bind);
    }

    this.ready && this._runCallbacks("update");

    this.ready && this.getPrice(function(value) {
        this._runCallbacks("price", value);
    });
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

Ripe.prototype._addCallback = function(name, callback) {
    var callbacks = this.callbacks[name] || [];
    callbacks.push(callback);
    this.callbacks[name] = callbacks;
};

Ripe.prototype._removeCallback = function(name, callback) {
    var callbacks = this.callbacks[name] || [];
    var index = array.indexOf(callback);
    if (index === -1) {
        return;
    }
    callbacks.splice(index, 1);
    this.callbacks[name] = callbacks;
};

Ripe.prototype._runCallbacks = function(name) {
    var callbacks = this.callbacks[name] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

Ripe.prototype._applyStyles = function(element, styles) {
    for (var key in styles) {
        if (styles.hasOwnProperty(key)) {
            var style = styles[key];
            element.style[key] = style;
        }
    }
};

Ripe.prototype._animateProperty = function(element, property, initial, final, duration, callback) {
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
            element.dataset.animationId = id;
        } else {
            callback && callback();
        }
    };

    // starts the animation
    frame();
};

Ripe.prototype._createEvent = function(name, detail, bubbles, cancelable) {
    bubbles = bubbles || false;
    cancelable = cancelable || false;
    var params = {
        detail: detail,
        bubbles: bubbles,
        cancelable: cancelable
    };

    if (typeof window.CustomEvent === "function") {
        return new CustomEvent(name, params);
    }

    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(name, bubbles, cancelable, detail);
    return event;
};

var exports = typeof exports === "undefined" ? {} : exports;
exports.Ripe = Ripe;

Ripe.prototype.bindDrag = function(target, frames, size, maxSize, rate) {
    // validates that the provided target element is a
    // valid one and if that's not the case returns the
    // control flow immediately to the caller
    if (!target) {
        return;
    }

    // sets sane defaults for the optional parameters
    size = size || 1000;
    maxSize = maxSize || 1000;
    rate = rate || 40;
    frames = frames || this.frames;

    // sets the target element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    target.classList.add("product-drag");
    target.style.fontSize = "0px";
    target.style.whiteSpace = "nowrap";

    // creates the area canvas and adds it to the target
    var area = document.createElement("canvas");
    area.className = "area";
    area.width = size;
    area.height = size;
    area.style.display = "inline-block";
    var context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    target.appendChild(area);

    // creates the back canvas and adds it to the target,
    // placing it on top of the area canvas
    var back = document.createElement("canvas");
    back.className = "back";
    back.width = size;
    back.height = size;
    back.style.display = "inline-block";
    back.style.marginLeft = "-" + String(size) + "px";
    var backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    target.appendChild(back);

    // adds the backs placeholder element that will be used to
    // temporarily store the images of the product's frames
    var sideFrames = frames["side"];
    var backs = document.createElement("div");
    backs.className = "backs";
    backs.style.display = "none";
    for (var index = 0; index < sideFrames.length; index++) {
        var backImg = document.createElement("img");
        backImg.dataset.frame = index;
        backs.appendChild(backImg);
    }
    var topImg = document.createElement("img");
    topImg.dataset.frame = "top";
    backs.appendChild(topImg);
    var bottomImg = document.createElement("img");
    bottomImg.dataset.frame = "bottom";
    backs.appendChild(bottomImg);
    target.appendChild(backs);

    // adds the front mask element to the target,
    // this will be used to highlight parts
    var frontMask = document.createElement("img");
    frontMask.className = "front-mask";
    frontMask.style.display = "none";
    target.appendChild(frontMask);

    // creates a masks element that will be used to store the various
    // mask images to be used during highlight and select operation
    var mask = document.createElement("canvas");
    mask.className = "mask";
    mask.width = size;
    mask.height = size;
    mask.style.display = "none";
    for (var index = 0; index < frames; index++) {
        var maskImg = document.createElement("img");
        maskImg.dataset.frame = index;
        mask.appendChild(maskkImg);
    }
    var topImg = document.createElement("img");
    topImg.dataset.frame = "top";
    mask.appendChild(topImg);
    var bottomImg = document.createElement("img");
    bottomImg.dataset.frame = "bottom";
    mask.appendChild(bottomImg);
    target.appendChild(mask);

    // adds the target to the drag binds array so
    // that it can be updated when changes occur
    this.dragBinds.push(target);

    target.addEventListener("mousedown", function(event) {
        var position = target.dataset.position || 0;
        var view = target.dataset.view || "side";
        target.dataset.view = view;
        target.dataset.base = position;
        target.dataset.down = true;
        target.dataset.referenceX = event.pageX;
        target.dataset.referenceY = event.pageY;
        target.dataset.percent = 0;
        target.dataset.accumulatedRotation = 0;
        target.classList.add("drag");
    });

    target.addEventListener("mouseup", function(event) {
        var percent = target.dataset.percent;
        target.dataset.down = false;
        target.dataset.percent = 0;
        target.dataset.previous = percent;
        target.classList.remove("drag");
    });

    target.addEventListener("mouseleave", function(event) {
        var percent = target.dataset.percent;
        target.dataset.down = false;
        target.dataset.percent = 0;
        target.dataset.previous = percent;
        target.classList.remove("drag");
    });

    target.addEventListener("mousemove", function(event) {
        var down = target.dataset.down
        target.dataset.mousePosX = event.pageX;
        target.dataset.mousePosY = event.pageY;
        down === "true" && updatePosition(target);
    });

    var self = this;
    var updatePosition = function(element) {
        var child = element.querySelector("*:first-child");
        var referenceX = element.dataset.referenceX;
        var referenceY = element.dataset.referenceY;
        var mousePosX = element.dataset.mousePosX;
        var mousePosY = element.dataset.mousePosY;
        var base = element.dataset.base;
        var rate = rate || 40;
        var deltaX = referenceX - mousePosX;
        var deltaY = referenceY - mousePosY;
        var elementWidth = element.clientWidth;
        var elementHeight = element.clientHeight || child.clientHeight;
        var percentX = deltaX / elementWidth;
        var percentY = deltaY / elementHeight;
        var view = element.dataset.view;
        var viewFrames = frames[view];
        var next = parseInt(base - (rate * percentX)) % viewFrames.length;
        next = next >= 0 ? next : viewFrames.length + next;
        Math.abs(percentX) > 0.02 && element.classList.add("move");
        Math.abs(percentY) > 0.02 && element.classList.add("move");
        element.dataset.percent = percentX;

        var nextView = view;
        if (rate * percentY > 15) {
            nextView = view === "top" ? "side" : "bottom";
        } else if (rate * percentY < -15) {
            nextView = view === "bottom" ? "side" : "top";
        }

        var animate = false;
        if (view !== nextView && frames[nextView]) {
            element.dataset.referenceY = mousePosY;
            view = nextView;
            animate = "cross";
            element.style.pointerEvents = "none";
        }

        element.dataset.view = view;
        if (!isNaN(next)) {
            element.dataset.position = next;
        } else {
            next = parseInt(element.dataset.position);
        }
        viewFrames = frames[view];
        next = viewFrames.length === 0 ? view : next;
        self._updateDrag(element, next, animate, false, function() {
            if (animate === "cross") {
                element.style.pointerEvents = "all";
            }
        });
    };
};

Ripe.prototype._updateDrag = function(target, position, animate, single, callback) {
    var hasCombinations = this.combinations && Object.keys(this.combinations).length !== 0;
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    if (!hasParts || !hasCombinations) {
        return;
    }

    var self = this;
    var load = function(position, drawFrame, animate, callback) {
        position = position || target.dataset.position || 0;
        drawFrame = drawFrame === undefined || drawFrame ? true : false;
        var backs = target.querySelector(".backs");
        var area = target.querySelector(".area");
        var url = self._getImageURL(position);
        var image = backs.querySelector("img[data-frame='" + String(position) + "']")
        var front = area.querySelector("img[data-frame='" + String(position) + "']")
        image = image || front;

        var drawCallback = function(callback) {
            var event = self._createEvent("changed_frame", {
                frame: position
            });
            target.dispatchEvent(event);
            callback && callback();
        }

        var isRedundant = image.dataset.src === url;
        if (isRedundant) {
            if (!drawFrame) {
                callback && callback();
                return;
            }

            var isReady = image.dataset.loaded;
            isReady && drawDrag(target, image, animate, drawCallback);
            return;
        }

        for (var loadBind in image.load) {
            var events = getEventListeners(loadBind.listener)
            image.removeEventListener("load", events);
        }

        image.addEventListener('load', function() {
            image.dataset.loaded = true;
            image.dataset.src = url;
            callback && callback();
            if (!drawFrame) {
                return;
            }
            drawDrag(target, image, animate, drawCallback);
        });

        image.src = url;
        image.dataset.src = url;
        image.dataset.loaded = false;
    };

    var preload = function(useChain) {
        var index = target.dataset.index || 0;
        index++;
        target.dataset.index = index;
        target.classList.add("preload");
        var work = [];
        var sideFrames = self.frames["side"];
        for (var _index = 0; _index < sideFrames.length; _index++) {
            if (_index === position) {
                continue;
            }
            work.push(_index);
        }

        for (var view in self.frames) {
            view !== "side" && work.push(view);
        }
        work.reverse();

        var mark = function(element) {
            var _index = parseInt(target.dataset.index);
            if (index !== _index) {
                return;
            }
            element.classList.remove("preloading");
            var backs = target.querySelector(".backs");
            var pending = backs.querySelectorAll("img.preloading") || [];
            if (pending.length > 0) {
                target.classList.add("preloading")
                target.style.pointerEvents = "none";
            } else if (work.length === 0) {
                target.classList.remove("preloading");
                target.style.pointerEvents = "all";
                var event = self._createEvent("loaded");
                target.dispatchEvent(event);
            }
        };

        var render = function() {
            var _index = parseInt(target.dataset.index);

            if (index !== _index) {
                return;
            }
            if (work.length === 0) {

                return;
            }
            var element = work.pop();
            var backs = target.querySelector(".backs");
            var reference = backs.querySelector("img[data-frame='" + String(element) + "']");
            reference.classList.add("preloading");
            var callbackChain = function() {
                mark(reference);
                render();
            };
            var callbackMark = function() {
                mark(reference);
            };

            // determines if a chain based loading should be used for the pre-loading
            // process of the various image resources to be loaded
            load(element, false, false, useChain ? callbackChain : callbackMark);
            !useChain && render();
        };
        work.length > 0 && target.classList.add("preloading");
        if (work.length > 0) {
            target.style.pointerEvents = "none";
        }
        work.length > 0 && setTimeout(function() {
            render();
        }, 250);
    };

    var previous = target.dataset.signature || "";
    var signature = self._getQuery(null, null, null, null, self.parts);
    var changed = signature !== previous;
    var animate = animate || (changed && "simple");
    target.dataset.signature = signature;

    var previous = target.dataset.unique;
    var unique = signature + "&position=" + String(position) + "&single=" + String(single);
    if (previous === unique) {
        return false;
    }

    var drawDrag = function(target, image, animate, callback) {
        var area = target.querySelector(".area");
        var back = target.querySelector(".back");
        var context = area.getContext("2d");
        var backContext = back.getContext("2d");

        var visible = area.dataset.visible === "true";
        var current = visible ? area : back
        var target = visible ? back : area;
        var context = target.getContext("2d");
        context.clearRect(0, 0, target.clientWidth, target.clientHeight);
        context.drawImage(image, 0, 0, target.clientWidth, target.clientHeight);

        if (!animate) {
            current.style.zIndex = 1;
            current.style.opacity = 0;
            target.style.zIndex = 1;
            target.style.opacity = 1;
            callback && callback();
            return;
        }

        var currentId = current.dataset.animationId;
        var targetId = target.dataset.animationId;
        currentId && cancelAnimationFrame(parseInt(currentId));
        targetId && cancelAnimationFrame(parseInt(targetId));

        var timeout = animate === "immediate" ? 0 : 500;
        if (animate === "cross") {
            self._animateProperty(current, "opacity", 1, 0, timeout);
        }

        self._animateProperty(target, "opacity", 0, 1, timeout, function() {
            current.style.opacity = 0;
            current.style.zIndex = 1;
            target.style.zIndex = 1;
            callback && callback();
        });
        target.dataset.visible = true;
        current.dataset.visible = false;
    };

    target.dataset.unique = unique;

    load(position, true, animate, callback);

    var preloaded = target.classList.contains("preload");
    var mustPreload = !single && (changed || !preloaded);
    single && target.classList.remove("preload");
    mustPreload && preload(this.options.useChain);
};

Ripe.prototype.addDragLoadedCallback = function(target, callback) {
    target.addEventListener("loaded", callback);
};

Ripe.prototype.addDragFrameCallback = function(target, callback) {
    target.addEventListener("changed_frame", function(event) {
        var frame = event.detail["frame"];
        callback(frame);
    });
};

Ripe.prototype.changeDragFrame = function(target, frame, animate, step) {
    if (Array.isArray(frame) === false) {
        return this._updateDrag(target, frame, animate);
    };

    var self = this;
    step = step || 100;
    var id = setInterval(function() {
        var nextFrame = frame.pop();
        nextFrame !== undefined ? self._updateDrag(target, nextFrame, animate) : clearInterval(id);
    }, step);
};
