var Ripe = function(url, brand, model, variant, frames, options) {
    this.init(url, brand, model, variant, frames, options);
};

Ripe.prototype.init = function(url, brand, model, variant, frames, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.url = url;
    this.brand = brand;
    this.model = model;
    this.variant = variant;
    this.frames = frames || {};
    this.options = options || {};
    this.parts = options.parts || {};
    this.options.size = this.options.size || 1000;
    this.options.maxSize = this.options.maxSize || 1000;
    this.options.sensitivity = this.options.sensitivity || 40;
    this.frameBinds = {};
    this.callbacks = {};
    this.ready = false;

    // retrieves the configuration information for this product
    this.getConfig(function(config) {
        this.config = config;
    });

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

    this.dragBind && this._updateDrag(this.dragBind);

    this.ready && this._runCallbacks("update");

    this.ready && this.getPrice(function(value) {
        this._runCallbacks("price", value);
    });
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

var exports = typeof exports === "undefined" ? {} : exports;
exports.Ripe = Ripe;

Ripe.prototype.bindDrag = function(target) {
    // validates that the provided target element is a
    // valid one and if that's not the case returns the
    // control flow immediately to the caller
    if (!target) {
        return;
    }

    if (this.frames === undefined) {
        this.getFrames(function() {
            this.bindDrag(target, size, maxSize, options);
        });
        return;
    }

    // retrieves the the parameters that will be used to
    // set up the drag element from the options object
    var size = this.options.size;
    var sensitivity = this.options.sensitivity;

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
    var sideFrames = this.frames["side"];
    var backs = document.createElement("div");
    backs.className = "backs";
    backs.style.display = "none";
    for (var index = 0; index < sideFrames; index++) {
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
    for (var index = 0; index < this.frames; index++) {
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

    // sets the target as the drag bind so that
    // it can be updated when changes occur
    this.dragBind = target;
    target.setAttribute("data-position", 0);

    // binds the mousedown event on the target element
    // to prepare the element for drag movements
    target.addEventListener("mousedown", function(event) {
        var position = target.getAttribute("data-position") || 0;
        var view = target.dataset.view || "side";
        target.dataset.view = view;
        target.dataset.base = position;
        target.dataset.down = true;
        target.dataset.referenceX = event.pageX;
        target.dataset.referenceY = event.pageY;
        target.dataset.percent = 0;
        target.classList.add("drag");
    });

    // listens for mouseup events and if it
    // occurs then stops reacting to mousemove
    // events has drag movements
    target.addEventListener("mouseup", function(event) {
        var percent = target.dataset.percent;
        target.dataset.down = false;
        target.dataset.percent = 0;
        target.dataset.previous = percent;
        target.classList.remove("drag");
    });

    // listens for mouseleave events and if it
    // occurs then stops reacting to mousemove
    // events has drag movements
    target.addEventListener("mouseleave", function(event) {
        var percent = target.dataset.percent;
        target.dataset.down = false;
        target.dataset.percent = 0;
        target.dataset.previous = percent;
        target.classList.remove("drag");
    });

    // if a mousemove event is triggered while
    // the mouse is pressed down then updates
    // the position of the drag element
    target.addEventListener("mousemove", function(event) {
        var preventDrag = target.dataset.preventDrag;
        if (preventDrag === "true") {
            return;
        }
        var down = target.dataset.down
        target.dataset.mousePosX = event.pageX;
        target.dataset.mousePosY = event.pageY;
        down === "true" && updatePosition(target);
    });

    // saves a reference to this object so that it
    // can be accessed inside private functions
    var self = this;

    // updates the position of the element
    // according to the current drag movement
    var updatePosition = function(element) {
        // retrieves the last recorded mouse position
        // and the current one and calculates the
        // drag movement made by the user
        var child = element.querySelector("*:first-child");
        var referenceX = element.dataset.referenceX;
        var referenceY = element.dataset.referenceY;
        var mousePosX = element.dataset.mousePosX;
        var mousePosY = element.dataset.mousePosY;
        var base = element.dataset.base;
        var deltaX = referenceX - mousePosX;
        var deltaY = referenceY - mousePosY;
        var elementWidth = element.clientWidth;
        var elementHeight = element.clientHeight || child.clientHeight;
        var percentX = deltaX / elementWidth;
        var percentY = deltaY / elementHeight;
        element.dataset.percent = percentX;

        // retrieves the current view and its frames
        // and determines which one is the next frame
        var view = element.dataset.view;
        var viewFrames = self.frames[view];
        var next = parseInt(base - (sensitivity * percentX)) % viewFrames;
        next = next >= 0 ? next : viewFrames + next;

        // if the movement was big enough then
        // adds the move class to the element
        Math.abs(percentX) > 0.02 && element.classList.add("move");
        Math.abs(percentY) > 0.02 && element.classList.add("move");

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
        if (view !== nextView && self.frames[nextView]) {
            element.dataset.referenceY = mousePosY;
            view = nextView;
            animate = "cross";
            target.dataset.preventDrag = true;
        }
        element.dataset.view = view;

        // if the frame changes then updates the product's position
        // if not then keeps using the current frame
        if (!isNaN(next)) {
            element.dataset.position = next;
        } else {
            next = parseInt(element.dataset.position);
        }

        // if the new view doens't have multiple frames
        // then ignores the index of the new frame
        viewFrames = self.frames[view];
        next = viewFrames === 1 ? view : next;

        // updates the image of the drag element
        self._updateDrag(element, next, animate, false, function() {
            // if a crossfade animation finishes
            // then stops ignoring drag movements
            if (animate === "cross") {
                target.dataset.preventDrag = false;
            }
        }, options);
    };
};

Ripe.prototype._updateDrag = function(target, position, animate, single, callback, options) {
    // if product's combinations and parts haven't
    // been loaded yet then returns immediately
    var hasCombinations = this.combinations && Object.keys(this.combinations).length !== 0;
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    if (!hasParts || !hasCombinations) {
        return;
    }

    var self = this;
    var load = function(position, drawFrame, animate, callback) {
        // retrieves the image that will be used to store the frame
        position = position || target.dataset.position || 0;
        drawFrame = drawFrame === undefined || drawFrame ? true : false;
        var backs = target.querySelector(".backs");
        var area = target.querySelector(".area");
        var image = backs.querySelector("img[data-frame='" + String(position) + "']")
        var front = area.querySelector("img[data-frame='" + String(position) + "']")
        image = image || front;

        // builds the url that will be set on the image
        var url = self._getImageURL(position, null, null, null, null, null, options);

        // creates a callback to be called when the frame
        // is drawn to trigger the changed_frame event and
        // the callback passed to this function if it's set
        var drawCallback = function() {
            self._runCallbacks("changed_frame", position);
            callback && callback();
        };

        // verifies if the loading of the current image
        // is considered redundant (already loaded or
        // loading) and avoids for performance reasons
        var isRedundant = image.dataset.src === url;
        if (isRedundant) {
            if (!drawFrame) {
                callback && callback();
                return;
            }
            var isReady = image.dataset.loaded == "true";
            isReady && drawDrag(target, image, animate, drawCallback);
            return;
        }

        // creates a load callback to be called when
        // the image is loaded to draw the frame on
        // the canvas, note that this can't be an
        // anonymous function so that it can be used
        // with removeEventListener to avoid conflicts
        var loadCallback = function() {
            image.dataset.loaded = true;
            image.dataset.src = url;
            callback && callback();
            if (!drawFrame) {
                return;
            }
            drawDrag(target, image, animate, drawCallback);
        };
        // removes previous load callbacks and
        // adds one for the current frame
        image.removeEventListener("load", loadCallback);
        image.addEventListener("load", loadCallback);

        // sets the src of the image to trigger the request
        // and sets loaded to false to indicate that the
        // image is not yet loading
        image.src = url;
        image.dataset.src = url;
        image.dataset.loaded = false;
    };

    var preload = function(useChain) {
        var index = target.dataset.index || 0;
        index++;
        target.dataset.index = index;
        target.classList.add("preload");

        // adds all the frames to the work pile
        var work = [];
        for (var view in self.frames) {
            var viewFrames = self.frames[view];
            if (viewFrames === 0) {
                work.push(view);
                continue;
            }
            for (var _index = 0; _index < viewFrames; _index++) {
                if (_index === position) {
                    continue;
                }
                work.push(_index);
            }
        }
        work.reverse();

        // marks
        var mark = function(element) {
            var _index = parseInt(target.dataset.index);
            if (index !== _index) {
                return;
            }

            // removes the preloading class from the image element
            // and retrieves all the images still preloading,
            element.classList.remove("preloading");
            var backs = target.querySelector(".backs");
            var pending = backs.querySelectorAll("img.preloading") || [];

            // if there are images preloading then adds the
            // preloading class to the target element and
            // prevents drag movements to avoid flickering
            if (pending.length > 0) {
                target.classList.add("preloading")
                target.dataset.preventDrag = true;
            }

            // if there are no images preloading and no
            // frames yet to be preloaded then the preload
            // is considered finished so drag movements are
            // allowed again and the loaded event is triggered
            else if (work.length === 0) {
                target.classList.remove("preloading");
                target.dataset.preventDrag = false;
                self._runCallbacks("loaded");
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

            // retrieves the next frame to be loaded
            // and its corresponding image element
            // and adds the preloading class to it
            var element = work.pop();
            var backs = target.querySelector(".backs");
            var reference = backs.querySelector("img[data-frame='" + String(element) + "']");
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
            load(element, false, false, useChain ? callbackChain : callbackMark);
            !useChain && render();
        };

        // if there are frames to be loaded then adds the
        // preloading class, prevents drag movements and
        // starts the render process after a timeout
        work.length > 0 && target.classList.add("preloading");
        if (work.length > 0) {
            target.dataset.preventDrag = true;
            setTimeout(function() {
                render();
            }, 250);
        }
    };

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

    // checks if the parts drawed on the target have
    // changed and animates the transition it they did
    var previous = target.dataset.signature || "";
    var signature = self._getQuery(null, null, null, null, self.parts);
    var changed = signature !== previous;
    var animate = animate || (changed && "simple");
    target.dataset.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    var previous = target.dataset.unique;
    var unique = signature + "&position=" + String(position) + "&single=" + String(single);
    if (previous === unique) {
        callback && callback();
        return false;
    }
    target.dataset.unique = unique;

    // runs the load operation for the current frame
    load(position, true, animate, callback);

    // runs the pre-loading process so that the remaining frames are
    // loaded for a smother experience when dragging the element,
    // note that this is only performed in case this is not a single
    // based update (not just the loading of the current position)
    // and the current signature has changed
    var preloaded = target.classList.contains("preload");
    var mustPreload = !single && (changed || !preloaded);
    single && target.classList.remove("preload");
    mustPreload && preload(this.options.useChain);
};

Ripe.prototype.getFrames = function(callback) {
    if (this.config === undefined) {
        this.getConfig(function(config) {
            this.config = config;
            this.getFrames(callback);
        });
    }

    var frames = {};
    var faces = config["faces"];
    for (var face in faces) {
        frames[face] = 1;
    };

    var sideFrames = config["frames"];
    frames["side"] = sideFrames;
    this.frames = frames;
    callback && callback(frames);
};

Ripe.prototype.addLoadedCallback = function(callback) {
    this._addCallback("loaded", callback);
};

Ripe.prototype.removeLoadedCallback = function(callback) {
    this._removeCallback("loaded", callback);
};

Ripe.prototype.addChangedFrameCallback = function(callback) {
    this._addCallback("changed_frame", callback);
};

Ripe.prototype.removeChangedFrameCallback = function(callback) {
    this._removeCallback("changed_frame", callback);
};

Ripe.prototype.changeFrame = function(frame, animate, step, interval, preventDrag, callback) {
    if (this.dragBind === undefined) {
        return;
    }
    if (animate === false) {
        return this._updateDrag(this.dragBind, frame, false, false, callback);
    };

    var self = this;
    step = step || 1;
    interval = interval || 100;
    var current = this.dragBind.getAttribute("data-position") || 0;
    current = parseInt(current);
    var steps = [];
    var sideFrames = this.frames["side"];
    for (var index = current; index <= frame; index += step) {
        var stepFrame = index % sideFrames;
        steps.push(stepFrame);
    }
    steps.includes(frame) === false && steps.push(frame);

    preventDrag = preventDrag === false ? false : true;
    this.dragBind.setAttribute("data-prevent-drag", preventDrag);

    var nextFrame = function(frames, callback) {
        var next = frames.shift();
        if (next === undefined) {
            callback && callback();
            return;
        }
        self._updateDrag(self.dragBind, next, animate, false, function() {
            setTimeout(function() {
                nextFrame(frames, callback);
            }, interval);
        });
    };

    nextFrame(steps, function() {
        self.dragBind.setAttribute("data-prevent-drag", false);
        self.dragBind.setAttribute("data-position", frame);
        callback && callback();
    });
};

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
