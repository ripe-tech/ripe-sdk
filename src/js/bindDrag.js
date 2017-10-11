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

    // adds the front mask element to the target,
    // this will be used to highlight parts
    var frontMask = document.createElement("img");
    frontMask.className = "front-mask";
    frontMask.style.display = "none";
    frontMask.style.width = size + "px";
    frontMask.style.position = "relative";
    frontMask.style.pointerEvents = "none";
    frontMask.style.zIndex = 2;
    frontMask.style.opacity = 0.4;
    frontMask.width = size;
    frontMask.height = size;
    frontMask.style.marginLeft = "-" + String(size) + "px";
    target.appendChild(frontMask);

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
    mask.width = size;
    mask.height = size;
    mask.style.display = "none";
    target.appendChild(mask);

    var masks = document.createElement("div");
    masks.className = "masks";
    masks.style.display = "none";

    for (var i = 0, length = sideFrames.length; i < length; i++) {
        var maskImg = document.createElement("img");
        maskImg.setAttribute("data-frame", i);
        masks.appendChild(maskImg);
    }

    var topImg = document.createElement("img");
    topImg.setAttribute("data-frame", "top");
    masks.appendChild(topImg);
    var bottomImg = document.createElement("img");
    bottomImg.setAttribute("data-frame", "bottom");
    masks.appendChild(bottomImg);
    target.appendChild(masks);

    // adds the target to the drag binds array so
    // that it can be updated when changes occur
    this.dragBinds.push(target);
    target.setAttribute("data-position", 0);

    target.addEventListener("mousedown", function(event) {
        var position = target.getAttribute("data-position") || 0;
        var view = target.getAttribute("data-view") || "side";
        target.setAttribute("data-view", view);
        target.setAttribute("data-base", position);
        target.setAttribute("data-down", true);
        target.setAttribute("data-reference-x", event.pageX);
        target.setAttribute("data-reference-y", event.pageY);
        target.setAttribute("data-percent", 0);
        target.setAttribute("data-accumulated-totation", 0);
        target.classList.add("drag");
    });

    target.addEventListener("mouseup", function(event) {
        var percent = target.getAttribute("data-percent");
        target.setAttribute("data-down", false);
        target.setAttribute("data-percent", 0);
        target.setAttribute("data-previous", percent);
        target.classList.remove("drag");
    });

    target.addEventListener("mouseleave", function(event) {
        var percent = target.getAttribute("data-percent");
        target.setAttribute("data-down", false);
        target.setAttribute("data-percent", 0);
        target.setAttribute("data-previous", percent);
        target.classList.remove("drag");
    });

    target.addEventListener("mousemove", function(event) {
        var down = target.getAttribute("data-down");
        target.setAttribute("data-mouse-pos-x", event.pageX);
        target.setAttribute("data-mouse-pos-y", event.pageY);
        down === "true" && updatePosition(target);
    });

    var self = this;
    var updatePosition = function(element) {
        var child = element.querySelector("*:first-child");
        var referenceX = element.getAttribute("data-reference-x");
        var referenceY = element.getAttribute("data-reference-y");
        var mousePosX = element.getAttribute("data-mouse-pos-x");
        var mousePosY = element.getAttribute("data-mouse-pos-y");
        var base = element.getAttribute("data-base");
        var rate = rate || 40;
        var deltaX = referenceX - mousePosX;
        var deltaY = referenceY - mousePosY;
        var elementWidth = element.clientWidth;
        var elementHeight = element.clientHeight || child.clientHeight;
        var percentX = deltaX / elementWidth;
        var percentY = deltaY / elementHeight;
        var view = element.getAttribute("data-view");
        var viewFrames = frames[view];
        var next = parseInt(base - (rate * percentX)) % viewFrames.length;
        next = next >= 0 ? next : viewFrames.length + next;
        Math.abs(percentX) > 0.02 && element.classList.add("move");
        Math.abs(percentY) > 0.02 && element.classList.add("move");
        element.setAttribute("data-percent", percentX);

        var nextView = view;
        if (rate * percentY > 15) {
            nextView = view === "top" ? "side" : "bottom";
        } else if (rate * percentY < -15) {
            nextView = view === "bottom" ? "side" : "top";
        }

        var animate = false;
        if (view !== nextView && frames[nextView]) {
            element.setAttribute("data-reference-y", mousePosY);
            view = nextView;
            animate = "cross";
            element.style.pointerEvents = "none";
        }

        element.setAttribute("data-view", view);
        if (!isNaN(next)) {
            element.setAttribute("data-position", next);
        } else {
            var pos = element.getAttribute("data-position");
            next = parseInt(pos);
        }
        viewFrames = frames[view];
        next = viewFrames.length === 0 ? view : next;
        self._updateDrag(element, next, animate, false, function() {
            if (animate === "cross") {
                element.style.pointerEvents = "all";
            }
        });
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
        var ratio = mask.width / canvasRealWidth; //TODO: canvas.width
        x = parseInt(x * ratio);
        y = parseInt(y * ratio);

        var maskContext = mask.getContext("2d");
        var maskData = maskContext.getImageData(x, y, 1, 1);
        var r = maskData.data[0];
        var index = parseInt(r);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        if (index === 0) {
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
        //TODO: format = format || (isMobile ? defaultFormat : baseFormat);
        //TODO: color = color || (hasColor(format) ? backgroundColor : null);
        format = format || "webp";
        color = color || self.options.background;

        // constructs the full url of the mask image that is going to be
        // set for the current highlight operation (to be determined)
        //TODO: data-mask
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
            var event = self._createEvent("highlighted_part", {
                part: part
            });
            target.dispatchEvent(event);
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
        var event = self._createEvent("selected_part", {
            part: part
        });
        target.dispatchEvent(event);
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
        //TODO: isFront, color, format, ismobile, touch, isFront, _url (data-mask), query()
        position = position || target.getAttribute("data-position") || 0;
        drawFrame = drawFrame === undefined || drawFrame ? true : false;
        var backs = target.querySelector(".backs");
        var area = target.querySelector(".area");
        var masks = target.querySelector(".masks");
        var url = self._getImageURL(position);
        var image = backs.querySelector("img[data-frame='" + String(position) + "']")
        var front = area.querySelector("img[data-frame='" + String(position) + "']")
        var maskImage = masks.querySelector("img[data-frame='" + String(position) + "']");
        image = image || front;
        var isFront = true; //TODO:

        // constructs the url for the mask and then at the end of the
        // mask loading process runs the final update of the mask canvas
        // operation that will allow new highlight and selection operation
        // to be performed according to the new frame value
        var src = maskImage.getAttribute("src");
        if (src) {
            isFront && setTimeout(function() {
                updateMask(maskImage, position);
            }, 150);
        } else {
            var format = "webp";
            var color = null;
            var isMobile = false;
            var size = area.getAttribute("height");
            size = isMobile ? parseInt(size) : null;
            var touch = "0";
            touch = parseInt(touch);
            var _url = self.url + "mask";
            var _query = "?model=" + self.model + "&frame=" + position;
            var _fullUrl = _url + _query + "&format=" + format;
            _fullUrl += color ? "&background=" + color : "";
            _fullUrl += size ? "&size=" + String(size) : "";
            _fullUrl += touch ? "&t=" + String(touch) : "";
            var maskImageLoad = function() {
                var self = this;
                isFront && setTimeout(function() {
                    updateMask(self, position);
                }, 150);
            }
            maskImage.removeEventListener("load", maskImageLoad);
            maskImage.addEventListener("load", maskImageLoad);
            maskImage.addEventListener("error", function() {
                this.setAttribute("src", null);
            });
            maskImage.setAttribute("src", _fullUrl);
            maskImage.crossOrigin = "Anonymous"; //TODO: ?
        }

        var drawCallback = function(callback) {
            var event = self._createEvent("changed_frame", {
                frame: position
            });
            target.dispatchEvent(event);
            callback && callback();
        }

        var isRedundant = image.getAttribute("data-src") === url;
        if (isRedundant) {
            if (!drawFrame) {
                callback && callback();
                return;
            }

            var isReady = image.getAttribute("data-loaded");
            isReady && drawDrag(target, image, animate, drawCallback);
            return;
        }

        var imageLoad = function() {
            image.setAttribute("data-loaded", true);
            image.setAttribute("data-src", url);
            callback && callback();
            if (!drawFrame) {
                return;
            }
            drawDrag(target, image, animate, drawCallback);
        }
        image.removeEventListener("load", imageLoad);
        image.addEventListener('load', imageLoad);

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
            var _index = target.getAttribute("data-index");
            _index = parseInt(_index);
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
            var _index = target.getAttribute("data-index");
            _index = parseInt(_index);

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

    var previous = target.getAttribute("data-signature") || "";
    var signature = self._getQuery(null, null, null, null, self.parts);
    var changed = signature !== previous;
    var animate = animate || (changed && "simple");
    target.setAttribute("data-signature", signature);
    var previous = target.getAttribute("data-unique");
    var unique = signature + "&position=" + String(position) + "&single=" + String(single);
    if (previous === unique) {
        return false;
    }

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

    target.setAttribute("data-unique", unique);

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

Ripe.prototype.addHighlightedPartCallback = function(target, callback) {
    target.addEventListener("highlighted_part", function(event) {
        var part = event.detail["part"];
        callback(part);
    });
};

Ripe.prototype.addSelectedPartCallback = function(target, callback) {
    target.addEventListener("selected_part", function(event) {
        var part = event.detail["part"];
        callback(part);
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
