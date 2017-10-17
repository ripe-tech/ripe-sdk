var Ripe = function(url, brand, model, variant, options) {
    this.init(url, brand, model, variant, options);
};

Ripe.prototype.init = function(url, brand, model, variant, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.url = url;
    this.brand = brand;
    this.model = model;
    this.variant = variant;
    this.options = options || {};
    this.options.backgroundColor = options.backgroundColor ? options.backgroundColor.replace("#", "") : "";
    this.parts = options.parts || {};
    this.frames = options.frames;
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
            element.setAttribute("data-animation-id", id);
        } else {
            callback && callback();
        }
    };

    // starts the animation
    frame();
};

var exports = typeof exports === "undefined" ? {} : exports;
exports.Ripe = Ripe;

Ripe.prototype.bindDrag = function(target, size, maxSize, options) {
    // validates that the provided target element is a
    // valid one and if that's not the case returns the
    // control flow immediately to the caller
    if (!target) {
        return;
    }

    // saves a reference to this object so that it
    // can be accessed inside private functions
    var self = this;


    if (this.frames === undefined) {
        this.getFrames(function() {
            self.bindDrag(target, size, maxSize, options);
        });
        return;
    }

    // sets sane defaults for the optional parameters
    size = size || this.options.size;
    maxSize = maxSize || this.options.maxSize;
    options = options || this.options;
    var sensitivity = options.sensitivity || this.options.sensitivity;

    // sets the target element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    target.classList.add("product-drag");
    target.style.fontSize = "0px";
    target.style.whiteSpace = "nowrap";

    // creates the area canvas and adds it to the target
    var area = document.createElement("canvas");
    area.className = "area";
    area.style.display = "inline-block";
    var context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    target.appendChild(area);

    // adds the front mask element to the target,
    // this will be used to highlight parts
    var frontMask = document.createElement("img");
    frontMask.className = "front-mask";
    frontMask.style.display = "none";
    frontMask.style.position = "relative";
    frontMask.style.pointerEvents = "none";
    frontMask.style.zIndex = 2;
    frontMask.style.opacity = 0.4;
    target.appendChild(frontMask);

    // creates the back canvas and adds it to the target,
    // placing it on top of the area canvas
    var back = document.createElement("canvas");
    back.className = "back";
    back.style.display = "inline-block";
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
        backImg.setAttribute("data-frame", index);
        backs.appendChild(backImg);
    }
    var topImg = document.createElement("img");
    topImg.setAttribute("data-frame", "top");
    backs.appendChild(topImg);
    var bottomImg = document.createElement("img");
    bottomImg.setAttribute("data-frame", "bottom");
    backs.appendChild(bottomImg);
    target.appendChild(backs);

    // creates a masks element that will be used to store the various
    // mask images to be used during highlight and select operation
    var mask = document.createElement("canvas");
    mask.className = "mask";
    mask.style.display = "none";
    target.appendChild(mask);
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
    target.appendChild(masks);

    // sets the target as the drag bind so that
    // it can be updated when changes occur
    this.dragBind = target;
    target.setAttribute("data-position", 0);

    // after set the dragBind,
    // the size of area, frontMask, back and mask is set too
    this.resize(size);

    // binds the mousedown event on the target element
    // to prepare the element for drag movements
    target.addEventListener("mousedown", function(event) {
        var position = target.getAttribute("data-position") || 0;
        var view = target.getAttribute("data-view") || "side";
        target.setAttribute("data-view", view);
        target.setAttribute("data-base", position);
        target.setAttribute("data-down", true);
        target.setAttribute("data-reference-x", event.pageX);
        target.setAttribute("data-reference-y", event.pageY);
        target.setAttribute("data-percent", 0);
        target.classList.add("drag");
    });

    // listens for mouseup events and if it
    // occurs then stops reacting to mousemove
    // events has drag movements
    target.addEventListener("mouseup", function(event) {
        var percent = target.getAttribute("data-percent");
        target.setAttribute("data-down", false);
        target.setAttribute("data-percent", 0);
        target.setAttribute("data-previous", percent);
        target.classList.remove("drag");
    });

    // listens for mouseleave events and if it
    // occurs then stops reacting to mousemove
    // events has drag movements
    target.addEventListener("mouseleave", function(event) {
        var percent = target.getAttribute("data-percent");
        target.setAttribute("data-down", false);
        target.setAttribute("data-percent", 0);
        target.setAttribute("data-previous", percent);
        target.classList.remove("drag");
    });

    // if a mousemove event is triggered while
    // the mouse is pressed down then updates
    // the position of the drag element
    target.addEventListener("mousemove", function(event) {
        var preventDrag = target.getAttribute("data-prevent-drag");
        if (preventDrag === "true") {
            return;
        }
        var down = target.getAttribute("data-down");
        target.setAttribute("data-mouse-pos-x", event.pageX);
        target.setAttribute("data-mouse-pos-y", event.pageY);
        down === "true" && updatePosition(target);
    });

    // updates the position of the element
    // according to the current drag movement
    var updatePosition = function(element) {
        // retrieves the last recorded mouse position
        // and the current one and calculates the
        // drag movement made by the user
        var child = element.querySelector("*:first-child");
        var referenceX = element.getAttribute("data-reference-x");
        var referenceY = element.getAttribute("data-reference-y");
        var mousePosX = element.getAttribute("data-mouse-pos-x");
        var mousePosY = element.getAttribute("data-mouse-pos-y");
        var base = element.getAttribute("data-base");
        var deltaX = referenceX - mousePosX;
        var deltaY = referenceY - mousePosY;
        var elementWidth = element.clientWidth;
        var elementHeight = element.clientHeight || child.clientHeight;
        var percentX = deltaX / elementWidth;
        var percentY = deltaY / elementHeight;
        element.setAttribute("data-percent", percentX);

        // retrieves the current view and its frames
        // and determines which one is the next frame
        var view = element.getAttribute("data-view");
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
            element.setAttribute("data-reference-y", mousePosY);
            view = nextView;
            animate = "cross";
            element.setAttribute("data-prevent-drag", true);
        }
        element.setAttribute("data-view", view);

        // if the frame changes then updates the product's position
        // if not then keeps using the current frame
        if (!isNaN(next)) {
            element.setAttribute("data-position", next);
        } else {
            var pos = element.getAttribute("data-position");
            next = parseInt(pos);
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

    var _fixEvent = function(event) {
        if (event.hasOwnProperty("offsetX") && event.offsetX !== undefined) {
            return event;
        }

        var _target = event.target || event.srcElement;
        var rect = _target.getBoundingClientRect();
        event.offsetX = event.clientX - rect.left;
        event.offsetY = event.clientY - rect.top;
        return event;
    };

    var canvasClick = function(element) {
        var move = element.classList.contains("move");
        if (move) {
            return;
        }
        event = _fixEvent(event);
        var x = event.offsetX;
        var y = event.offsetY;
        var result = select(element, x, y);
        result && event.stopPropagation();
    };

    var highlight = function(canvas, x, y, format, color) {
        var canvasRealWidth = canvas.getBoundingClientRect().width;
        var mask = target.querySelector(".mask");
        var ratio = mask.width / canvasRealWidth;
        x = parseInt(x * ratio);
        y = parseInt(y * ratio);

        var maskContext = mask.getContext("2d");
        var maskData = maskContext.getImageData(x, y, 1, 1);
        var r = maskData.data[0];
        var index = parseInt(r);

        var down = target.getAttribute("data-down");
        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || down === "true") {
            lowlightPart(target);
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        if (part === undefined) {
            return;
        }

        // runs the highlight part operation with the provided format and
        // color values, this will run the proper operation
        highlightPart(target, part, format, color);
    };

    var lowlightPart = function(element) {
        var frontMask = element.querySelector(".front-mask");
        frontMask.style.display = "none";
        element && element.classList.remove("highlight");
    };

    var highlightPart = function(target, part, format, color) {
        // adds the highlight class to the current target configurator meaning
        // that the front mask is currently active and showing info
        target.classList.add("highlight");

        // determines the current position of the configurator so that
        // the proper mask url may be created and properly loaded
        var view = target.getAttribute("data-view");
        var position = target.getAttribute("data-position");
        position = (view && view !== "side") ? view : position;

        // runs the default operation in the various elements that are
        // going to be used in the retrieval of the image
        format = format || self.options.format;
        color = color || self.options.backgroundColor;

        // constructs the full url of the mask image that is going to be
        // set for the current highlight operation (to be determined)
        var url = self.url + "mask";
        var query = "?model=" + self.model + "&frame=" + position + "&part=" + part;
        var fullUrl = url + query + "&format=" + format;
        fullUrl += color ? "&background=" + color : "";
        fullUrl += size ? "&size=" + String(size) : "";

        var frontMask = target.querySelector(".front-mask");
        var src = frontMask.getAttribute("src");
        if (src === fullUrl) {
            return;
        }

        var frontMaskLoad = function() {
            this.classList.add("loaded");
            this.style.display = "inline-block";
            self._runCallbacks("highlighted_part", part);
        };
        frontMask.removeEventListener("load", frontMaskLoad);
        frontMask.addEventListener("load", frontMaskLoad);
        frontMask.addEventListener("error", function() {
            this.setAttribute("src", "");
        });
        frontMask.setAttribute("src", fullUrl);

        var animationId = frontMask.getAttribute("data-animation-id");
        cancelAnimationFrame(animationId);
        self._animateProperty(frontMask, "opacity", 0, 0.4, 250);
    };

    var select = function(canvas, x, y) {
        var canvasRealWidth = canvas.clientWidth;
        var target = canvas.parentElement;
        var mask = target.querySelector(".mask");
        var ratio = mask.width / canvasRealWidth;
        var maskContext = mask.getContext("2d");
        x = parseInt(x * ratio);
        y = parseInt(y * ratio);
        var maskData = maskContext.getImageData(x, y, 1, 1);
        var r = maskData.data[0];
        var index = parseInt(r);

        if (index === 0) {
            return false;
        }

        var part = self.partsList[index - 1];
        self._runCallbacks("selected_part", part);
        return true;
    };

    area.addEventListener("click", function(event) {
        canvasClick(this, event);
    });

    area.addEventListener("mousemove", function() {
        var element = this;
        var drag = element.classList.contains("drag");
        if (drag) {
            return;
        }
        event = _fixEvent(event);
        var x = event.offsetX;
        var y = event.offsetY;
        highlight(element, x, y);
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    back.addEventListener("click", function(event) {
        canvasClick(this, event);
    });

    back.addEventListener("mousemove", function() {
        var element = this;
        var drag = element.classList.contains("drag");
        if (drag) {
            return;
        }
        event = _fixEvent(event);
        var x = event.offsetX;
        var y = event.offsetY;
        highlight(element, x, y);
    });

    back.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });
};

Ripe.prototype._updateDrag = function(target, position, animate, single, callback) {
    // if product's combinations and parts haven't
    // been loaded yet then returns immediately
    var hasCombinations = this.combinations && Object.keys(this.combinations).length !== 0;
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    if (!hasParts || !hasCombinations) {
        return;
    }

    // iterates over the complete set of parts in the current structure
    // to process them and create the list of parts as names, sorted by
    // the internal (and reference) name value
    this.partsList = [];
    for (var part in this.parts) {
        var partValue = this.parts[part];
        var material = partValue["material"];
        material !== undefined && this.partsList.push(part)
    }
    this.partsList.sort();

    var self = this;
    var load = function(position, drawFrame, animate, callback) {
        // retrieves the image that will be used to store the frame
        position = position || target.getAttribute("data-position") || 0;
        drawFrame = drawFrame === undefined || drawFrame ? true : false;
        var backs = target.querySelector(".backs");
        var masks = target.querySelector(".masks");
        var area = target.querySelector(".area");
        var image = backs.querySelector("img[data-frame='" + String(position) + "']")
        var front = area.querySelector("img[data-frame='" + String(position) + "']")
        var maskImage = masks.querySelector("img[data-frame='" + String(position) + "']");
        image = image || front;

        // constructs the url for the mask and then at the end of the
        // mask loading process runs the final update of the mask canvas
        // operation that will allow new highlight and selection operation
        // to be performed according to the new frame value
        var maskSrc = maskImage.getAttribute("src");
        if (maskSrc) {
            setTimeout(function() {
                updateMask(maskImage, position);
            }, 150);
        } else {
            var format = format || self.options.format;
            var color = color || self.options.backgroundColor;
            var size = area.height;
            var _url = self.url + "mask";
            var _query = "?model=" + self.model + "&frame=" + position;
            var _fullUrl = _url + _query + "&format=" + format;
            _fullUrl += color ? "&background=" + color : "";
            _fullUrl += size ? "&size=" + String(size) : "";
            var maskImageLoad = function() {
                var self = this;
                setTimeout(function() {
                    updateMask(self, position);
                }, 150);
            }
            maskImage.removeEventListener("load", maskImageLoad);
            maskImage.addEventListener("load", maskImageLoad);
            maskImage.addEventListener("error", function() {
                this.setAttribute("src", null);
            });
            maskImage.crossOrigin = "Anonymous";
            maskImage.setAttribute("src", _fullUrl);
        }

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
        var isRedundant = image.getAttribute("data-src") === url;
        if (isRedundant) {
            if (!drawFrame) {
                callback && callback();
                return;
            }
            var isReady = image.getAttribute("data-loaded") == "true";
            isReady && drawDrag(target, image, animate, drawCallback);
            return;
        }

        // creates a load callback to be called when
        // the image is loaded to draw the frame on
        // the canvas, note that this can't be an
        // anonymous function so that it can be used
        // with removeEventListener to avoid conflicts
        var loadCallback = function() {
            image.setAttribute("data-loaded", true);
            image.setAttribute("data-src", url);
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
        image.setAttribute("data-src", url);
        image.setAttribute("data-loaded", false);

    };

    var updateMask = function(image, position) {
        var _position = target.getAttribute("data-position");
        var view = target.getAttribute("data-view");
        position = position !== undefined && position.toString();
        if (position !== _position && position !== view) {
            return;
        }

        var mask = target.querySelector(".mask");
        maskContext = mask.getContext("2d");
        mask.setAttribute("data-position", position);
        maskContext.clearRect(0, 0, mask.width, mask.height);
        maskContext.drawImage(image, 0, 0, mask.width, mask.height);
    };

    var preload = function(useChain) {
        var index = target.getAttribute("data-index") || 0;
        index++;
        target.setAttribute("data-index", index);
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
            var _index = target.getAttribute("data-index");
            _index = parseInt(_index);
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
                target.classList.add("preloading");
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
            var _index = target.getAttribute("data-index");
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

        var visible = area.getAttribute("data-visible") === "true";
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

        var currentId = current.getAttribute("data-animation-id");
        var targetId = target.getAttribute("data-animation-id");
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

        target.setAttribute("data-visible", true);
        current.setAttribute("data-visible", false);
    };

    // checks if the parts drawed on the target have
    // changed and animates the transition it they did
    var previous = target.getAttribute("data-signature") || "";
    var signature = self._getQuery(null, null, null, null, self.parts);
    var changed = signature !== previous;
    var animate = animate || (changed && "simple");
    target.setAttribute("data-signature", signature);

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    position = position === undefined || position === null ? target.getAttribute("data-position") : position;
    var currentSize = target.getAttribute("data-current-size");
    var previous = target.getAttribute("data-unique");
    var unique = signature + "&position=" + String(position) + "&single=" + String(single) + "&size=" + String(
        currentSize);
    if (previous === unique) {
        callback && callback();
        return false;
    }
    target.setAttribute("data-unique", unique);

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
    for (var face in faces) {
        frames[face] = 1;
    };

    var sideFrames = this.config["frames"];
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

Ripe.prototype.addHighlightedPartCallback = function(callback) {
    this._addCallback("highlighted_part", callback);
};

Ripe.prototype.removeHighlightedPartCallback = function(callback) {
    this._removeCallback("highlighted_part", callback);
};

Ripe.prototype.addSelectedPartCallback = function(callback) {
    this._addCallback("selected_part", callback);
};

Ripe.prototype.removeSelectedPartCallback = function(callback) {
    this._removeCallback("selected_part", callback);
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

Ripe.prototype.resize = function(size) {
    if (this.dragBind === undefined) {
        return;
    }
    size = size || this.options.size;
    var area = this.dragBind.querySelector(".area");
    var frontMask = this.dragBind.querySelector(".front-mask");
    var back = this.dragBind.querySelector(".back");
    var mask = this.dragBind.querySelector(".mask");
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
    this.dragBind.setAttribute("data-current-size", size);
    this._updateDrag(this.dragBind, null, false, true);
};

Ripe.prototype.fullscreen = function() {
    if (this.dragBind === undefined) {
        return;
    }
    this.dragBind.style.position = "fixed";
    this.dragBind.style.top = "0px";
    this.dragBind.style.bottom = "0px";
    this.dragBind.style.left = "0px";
    this.dragBind.style.right = "0px";
    this.resize(this.options.maxSize);
};

Ripe.prototype.exitFullscreen = function() {
    if (this.dragBind === undefined) {
        return;
    }
    this.dragBind.style.position = null;
    this.dragBind.style.top = null;
    this.dragBind.style.bottom = null;
    this.dragBind.style.left = null;
    this.dragBind.style.right = null;
    this.resize();
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
