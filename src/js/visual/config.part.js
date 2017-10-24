ripe.Config = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Config.prototype.init.call(this);
};

ripe.Config.prototype = Object.create(ripe.Visual.prototype);

ripe.Config.prototype.init = function() {
    this.owner.bind("selected_part", function(part) {
        this.highlightPart(part);
    }.bind(this));

    this.ready = false;
    this.owner.loadFrames(function() {
        this._initDOM();
        this.ready = true;
        this.update();
    }.bind(this));
};

ripe.Config.prototype._initDOM = function() {
    // sets defaults for the optional parameters
    var size = this.element.dataset.size || this.options.size || 1000;
    var maxSize = this.element.dataset.max_size || this.options.maxSize || 1000;
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

    var view = this.element.dataset.view;
    var position = this.element.dataset.position; // TODO save last view position

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    var animate = false;
    var viewFrames = this.owner.frames[nextView];
    if (view !== nextView && viewFrames !== undefined) {
        view = nextView;
        animate = "cross";
        this.element.classList.add("noDrag");
    }

    this.element.dataset.view = view;
    this.element.dataset.position = nextPosition;

    this.update({}, {
        animate: animate,
        callback: function() {
            animate === "cross" && this.element.classList.remove("noDrag");
        }.bind(this)
    });
};

ripe.Config.prototype._loadFrame = function(view, position, options, callback) {
    // retrieves the image that will be used to store the frame
    position = position || this.element.dataset.position || 0;
    options = options || {};
    var draw = options.draw === undefined || options.draw;
    var animate = options.animate;
    var backs = this.element.querySelector(".backs");
    var area = this.element.querySelector(".area");
    var image = backs.querySelector("img[data-frame='" + String(position) + "']");
    var front = area.querySelector("img[data-frame='" + String(position) + "']");
    image = image || front;

    // builds the url that will be set on the image
    var frame = view === "side" ? position : view; // TODO view-position
    var url = this.owner._getImageURL({
        frame: frame
    });

    // creates a callback to be called when the frame
    // is drawn to trigger the changed_frame event and
    // the callback passed to this function if it's set
    var drawCallback = function() {
        this._runCallbacks("changed_frame", position);
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

    // creates a load callback to be called when
    // the image is loaded to draw the frame on
    // the canvas, note that this can't be an
    // anonymous function so that it can be used
    // with removeEventListener to avoid conflicts
    var loadCallback = function() {
        image.dataset.loaded = true;
        image.dataset.src = url;
        callback && callback();
        if (!draw) {
            return;
        }
        this._drawFrame(image, animate, drawCallback);
    }.bind(this);

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

ripe.Config.prototype._drawFrame = function(image, animate, callback) {
    var area = this.element.querySelector(".area");
    var back = this.element.querySelector(".back");

    var visible = area.dataset.visible === "true";
    var current = visible ? area : back;
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

    var currentId = current.dataset.animation_id;
    var targetId = target.dataset.animation_id;
    currentId && cancelAnimationFrame(parseInt(currentId));
    targetId && cancelAnimationFrame(parseInt(targetId));

    var timeout = animate === "immediate" ? 0 : 500;
    if (animate === "cross") {
        this._animateProperty(current, "opacity", 1, 0, timeout);
    }

    this._animateProperty(target, "opacity", 0, 1, timeout, function() {
        current.style.opacity = 0;
        current.style.zIndex = 1;
        target.style.zIndex = 1;
        callback && callback();
    });

    target.setAttribute("data-visible", true);
    current.setAttribute("data-visible", false);
};

ripe.Config.prototype._preload = function(useChain) {
    var index = this.element.dataset.index || 0;
    index++;
    this.element.dataset.index = index;
    this.element.classList.add("preload");

    // adds all the frames to the work pile
    var work = [];
    for (var view in this.frames) {
        var viewFrames = this.frames[view];
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

    var mark = function(element) {
        var _index = this.element.dataset.index;
        _index = parseInt(_index);
        if (index !== _index) {
            return;
        }

        // removes the preloading class from the image element
        // and retrieves all the images still preloading,
        element.classList.remove("preloading");
        var backs = this.element.querySelector(".backs");
        var pending = backs.querySelectorAll("img.preloading") || [];

        // if there are images preloading then adds the
        // preloading class to the target element and
        // prevents drag movements to avoid flickering
        if (pending.length > 0) {
            this.element.classList.add("preloading")
            this.classList.add("noDrag");
        }

        // if there are no images preloading and no
        // frames yet to be preloaded then the preload
        // is considered finished so drag movements are
        // allowed again and the loaded event is triggered
        else if (work.length === 0) {
            this.element.classList.remove("preloading");
            this.classList.remove("noDrag");
            this._runCallbacks("loaded");
        }
    };

    var render = function() {
        var _index = this.element.getAttribute("data-index");
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
        var backs = this.element.querySelector(".backs");
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
    work.length > 0 && this.element.classList.add("preloading");
    if (work.length > 0) {
        this.classList.add("noDrag");
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
    this.element.style.position = "fixed";
    this.element.style.top = "0px";
    this.element.style.bottom = "0px";
    this.element.style.left = "0px";
    this.element.style.right = "0px";
    var maxSize = options.maxSize || this.element.dataset.max_size || this.options.maxSize;
    this.resize(maxSize);
};

ripe.Config.prototype.exitFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.style.position = null;
    this.element.style.top = null;
    this.element.style.bottom = null;
    this.element.style.left = null;
    this.element.style.right = null;
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
    var nextView = view;
    if (sensitivity * percentY > 15) {
        nextView = view === "top" ? "side" : "bottom";
        this.element.dataset.referenceY = mousePosY;
    } else if (sensitivity * percentY < -15) {
        nextView = view === "bottom" ? "side" : "top";
        this.element.dataset.referenceY = mousePosY;
    }
    var nextFrame = nextView + "-" + next;
    this.changeFrame(nextFrame);
};
