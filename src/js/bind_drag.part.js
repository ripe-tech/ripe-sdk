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
        var down = target.dataset.down;
        target.dataset.mousePosX = event.pageX;
        target.dataset.mousePosY = event.pageY;
        down === "true" && updatePosition(target);
    });

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

    // draws the drag element for the first time
    self._updateDrag(target);
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
        var image = backs.querySelector("img[data-frame='" + String(position) + "']");
        var front = area.querySelector("img[data-frame='" + String(position) + "']");
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
            var isReady = image.dataset.loaded === "true";
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
