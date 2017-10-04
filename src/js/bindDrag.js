Ripe.prototype.bindDrag = function(target, size, maxSize, views, rate) {
    // validates that the provided target element is a
    // valid one and if that's not the case returns the
    // control flow immediately to the caller
    if (!target) {
        return;
    }

    size = size || 1000;
    maxSize = maxSize || 1000;

    target.classList.add("product-drag");
    target.style.fontSize = "0px";
    target.style.whiteSpace = "nowrap";

    var area = document.createElement("canvas");
    area.className = "area";
    area.width = size;
    area.height = size;
    area.style.display = "inline-block";
    var context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    target.appendChild(area);

    var back = document.createElement("canvas");
    back.className = "back";
    back.width = size;
    back.height = size;
    back.style.display = "inline-block";
    back.style.marginLeft = "-" + String(size) + "px";
    var backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    target.appendChild(back);

    var backs = document.createElement("div");
    backs.className = "backs";
    backs.style.display = "none";

    var frames = frames || this.frames;
    for (var index = 0; index < 24; index++) {
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

    var frontMask = document.createElement("img");
    frontMask.className = "front-mask";
    frontMask.style.display = "none";
    target.appendChild(frontMask);

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

    this.dragBinds.push(target);

    var mousePostSamples = [];
    target.addEventListener("mousedown", function(event) {
        var position = target.dataset.position || 0;
        var view = target.dataset.view || "side";
        target.dataset.down = true;
        target.dataset.referenceX = event.pageX;
        target.dataset.referenceY = event.pageY;
        target.dataset.percent = 0;
        target.dataset.base = position;
        target.dataset.view = view;
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
        self._updateDrag(element, next, false, animate, function() {
            if (animate === "cross") {
                element.style.pointerEvents = "all";
            }
        });
    };
};

Ripe.prototype._updateDrag = function(target, position, single, animate, callback) {
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

        var isRedundant = image.dataset.src === url;
        if (isRedundant) {
            if (!drawFrame) {
                callback && callback();
                return;
            }

            var isReady = image.dataset.loaded;
            isReady && self._drawDrag(target, image, animate, callback);
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
            self._drawDrag(target, image, animate);
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
            } else {
                target.classList.remove("preloading");
                target.style.pointerEvents = "all";
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
    target.dataset.unique = unique;

    load(position, true, animate, callback);

    var preloaded = target.classList.contains("preload");
    var mustPreload = !single && (changed || !preloaded);
    single && target.classList.remove("preload");
    mustPreload && preload(this.options.useChain);
};

Ripe.prototype._drawDrag = function(target, image, animate, callback) {
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

    var currentId = current.dataset.id || 0;
    var targetId = target.dataset.id || 0;
    cancelAnimationFrame(parseInt(currentId));
    cancelAnimationFrame(parseInt(targetId));

    var timeout = animate === "immediate" ? 0 : 500;
    if (animate === "cross") {
        this._fadeAnimation(current, "opacity", 1, 0, timeout);
    }

    this._fadeAnimation(target, "opacity", 0, 1, timeout, function() {
        current.style.opacity = 0;
        current.style.zIndex = 1;
        target.style.zIndex = 1;
        callback && callback();
    });
    target.dataset.visible = true;
    current.dataset.visible = false;
};
