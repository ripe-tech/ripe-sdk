if (typeof require !== "undefined") {
    var base = require("../base");
    require("./visual");
    var ripe = base.ripe;
}

ripe.Configurator = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Configurator.prototype.init.call(this, options);
};

ripe.Configurator.prototype = Object.create(ripe.Visual.prototype);

ripe.Configurator.prototype.init = function() {
    this.width = this.options.width || 1000;
    this.height = this.options.height || 1000;
    this.size = this.options.size;
    this.maxSize = this.options.maxSize || 1000;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.ready = false;

    // creates a structure the store the last presented
    // position of each view, to be used when returning
    // to a view for better user experience
    this._lastFrame = {};

    this.owner.getFrames(function(frames) {
        this.frames = frames;
        this._initLayout();
        this.ready = true;
        this.update();
    }.bind(this));
};

ripe.Configurator.prototype.resize = function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.clientWidth;
    if (this.currentSize === size) {
        return;
    }

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
    this.currentSize = size;
    this.update({}, {
        force: true
    });
};

ripe.Configurator.prototype.update = function(state, options) {
    options = options || {};

    if (this.ready === false) {
        return;
    }

    var view = this.element.dataset.view;
    var position = this.element.dataset.position;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    var animate = options.animate || false;
    var force = options.force || false;
    var duration = options.duration;
    var callback = options.callback;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    var previous = this.signature || "";
    var signature = this.owner._getQuery() + "&width=" + String(width) + "&height=" + String(height);
    var changed = signature !== previous;
    animate = animate || (changed && "simple");
    this.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    previous = this.unique;
    var unique = signature + "&view=" + String(view) + "&position=" + String(position);
    if (previous === unique && !force) {
        callback && callback();
        return false;
    }
    this.unique = unique;

    // runs the load operation for the current frame
    this._loadFrame(view, position, {
            draw: true,
            animate: animate,
            duration: duration
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

ripe.Configurator.prototype.changeFrame = function(frame, options) {
    var _frame = ripe.parseFrameKey(frame);
    var nextView = _frame[0];
    var nextPosition = parseInt(_frame[1]);

    options = options || {};
    var duration = options.duration || this.duration;
    var type = options.type;
    var preventDrag = options.preventDrag === undefined ? true : options.preventDrag;

    var view = this.element.dataset.view;
    var position = parseInt(this.element.dataset.position);

    var viewFrames = this.frames[nextView];
    if (!viewFrames || nextPosition >= viewFrames) {
        throw new RangeError("Frame " + frame + " is not supported.");
    }

    // saves the position of the current view
    // so that it returns to the same position
    // when coming back to the same view
    this._lastFrame[view] = position;
    this.element.dataset.position = nextPosition;

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    var animate = false;
    if (view !== nextView && viewFrames !== undefined) {
        this.element.dataset.view = nextView;
        animate = "cross";
    }

    // if an animation duration was provided then changes
    // to the next step instead of the target frame
    var stepDuration = 0;
    if (duration) {
        animate = type || animate;

        // calculates the number of steps of
        // the animation and the step duration
        var stepCount = view !== nextView ? 1 : nextPosition - position;
        stepDuration = duration / Math.abs(stepCount);
        options.duration = duration - stepDuration;

        // determines the next step and sets it
        // as the position
        var stepPosition = stepCount !== 0 ? position + stepCount / stepCount : position;
        stepPosition = stepPosition % viewFrames;
        this.element.dataset.position = stepPosition;
    }

    // determines if the current change frame operation
    // is an animated one or if it's a discrete one
    var animated = Boolean(duration);

    // if the frame change is animated and preventDrag is true
    // then ignores drag movements until the animation is finished
    preventDrag = preventDrag && (animate || duration);
    preventDrag && this.element.classList.add("noDrag");

    var newFrame = ripe.getFrameKey(
        this.element.dataset.view,
        this.element.dataset.position
    );
    this.trigger("changed_frame", newFrame);
    this.update({}, {
        animate: animate,
        duration: stepDuration,
        callback: function() {
            // if there is no step transition or the transition
            // has finished, then allows drag movements again
            if (!animated || stepPosition == nextPosition) {
                preventDrag && this.element.classList.remove("noDrag");
            }

            // otherwise waits the provided interval and
            // proceeds to the next step
            else {
                var timeout = animate ? 0 : stepDuration;
                setTimeout(function() {
                    this.changeFrame(frame, options);
                }.bind(this), timeout);
            }
        }.bind(this)
    });
};

ripe.Configurator.prototype.highlight = function(part, options) {};

ripe.Configurator.prototype.lowlight = function(options) {};

ripe.Configurator.prototype.enterFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    var maxSize = this.element.dataset.max_size || this.maxSize;
    this.resize(maxSize);
};

ripe.Configurator.prototype.leaveFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    this.resize();
};

ripe.Configurator.prototype._initLayout = function() {
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

    // creates the mask element that will de used to display
    // the mask on top of an highlighted or selected part
    var mask = ripe.createElement("canvas", "mask");
    this.element.appendChild(mask);

    // adds the framesBuffer placeholder element that will be used to
    // temporarily store the images of the product's frames
    var framesBuffer = ripe.createElement("div", "frames-buffer");

    // creates a masksBuffer element that will be used to store the various
    // mask images to be used during highlight and select operation
    var masksBuffer = ripe.createElement("div", "masks-buffer");

    // creates two image elements for each frame and
    // appends them to the frames and masks buffers
    for (var view in this.frames) {
        var viewFrames = this.frames[view];
        for (var index = 0; index < viewFrames; index++) {
            var frameBuffer = ripe.createElement("img");
            frameBuffer.dataset.frame = ripe.getFrameKey(view, index);
            framesBuffer.appendChild(frameBuffer);
            var maskBuffer = frameBuffer.cloneNode(true);
            masksBuffer.appendChild(maskBuffer);
        }
    }
    this.element.appendChild(framesBuffer);
    this.element.appendChild(masksBuffer);

    // set the size of area, frontMask, back and mask
    this.resize();

    // register for all the necessary DOM events
    this._registerHandlers();
};

ripe.Configurator.prototype._loadFrame = function(view, position, options, callback) {
    // runs the defaulting operation on all of the parameters
    // sent to the load frame operation (defaulting)
    view = view || this.element.dataset.view || "side";
    position = position || this.element.dataset.position || 0;
    options = options || {};

    var frame = ripe.getFrameKey(view, position);

    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    var draw = options.draw === undefined || options.draw;
    var animate = options.animate;
    var duration = options.duration;
    var framesBuffer = this.element.querySelector(".frames-buffer");
    var area = this.element.querySelector(".area");
    var image = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    var front = area.querySelector("img[data-frame='" + String(frame) + "']");
    image = image || front;

    // builds the url that will be set on the image
    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        width: width,
        height: height
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
        isReady && this._drawFrame(image, animate, duration, drawCallback);
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
        this._drawFrame(image, animate, duration, drawCallback);
    }.bind(this);

    // sets the src of the image to trigger the request
    // and sets loaded to false to indicate that the
    // image is not yet loading
    image.src = url;
    image.dataset.src = url;
    image.dataset.loaded = false;
};

ripe.Configurator.prototype._drawFrame = function(image, animate, duration, callback) {
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

    duration = duration || (animate === "immediate" ? 0 : 500);
    if (animate === "cross") {
        ripe.animateProperty(current, "opacity", 1, 0, duration);
    }

    ripe.animateProperty(target, "opacity", 0, 1, duration, function() {
        current.style.opacity = 0;
        current.style.zIndex = 1;
        target.style.zIndex = 1;
        callback && callback();
    });
};

ripe.Configurator.prototype._preload = function(useChain) {
    var position = this.element.dataset.position || 0;
    var index = this.index || 0;
    index++;
    this.index = index;
    this.element.classList.add("preload");

    // adds all the frames to the work pile
    var work = [];
    for (var view in this.frames) {
        var viewFrames = this.frames[view];
        for (var _index = 0; _index < viewFrames; _index++) {
            if (_index === position) {
                continue;
            }
            var frame = ripe.getFrameKey(view, _index);
            work.push(frame);
        }
    }
    work.reverse();

    var self = this;
    var mark = function(element) {
        var _index = self.index;
        if (index !== _index) {
            return;
        }

        // removes the preloading class from the image element
        // and retrieves all the images still preloading,
        element.classList.remove("preloading");
        var framesBuffer = self.element.querySelector(".frames-buffer");
        var pending = framesBuffer.querySelectorAll("img.preloading") || [];

        // if there are images preloading then adds the
        // preloading class to the target element and
        // prevents drag movements to avoid flickering
        if (pending.length > 0) {
            self.element.classList.add("preloading");
            self.element.classList.add("noDrag");
        }
        // if there are no images preloading and no
        // frames yet to be preloaded then the preload
        // is considered finished so drag movements are
        // allowed again and the loaded event is triggered
        else if (work.length === 0) {
            self.element.classList.remove("preloading");
            self.element.classList.remove("noDrag");
            self.trigger("loaded");
        }
    };

    var render = function() {
        var _index = self.index;
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
        var framesBuffer = self.element.querySelector(".frames-buffer");
        var reference = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
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
        var _frame = ripe.parseFrameKey(frame);
        var view = _frame[0];
        var position = _frame[1];
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

ripe.Configurator.prototype._registerHandlers = function() {
    // registes for the selected part event on the owner
    // so that we can highlight the associated part
    this.owner.bind("selected_part", function(part) {
        this.highlightPart(part);
    }.bind(this));

    // binds the mousedown event on the element to prepare
    // it for drag movements
    var self = this;
    this.element.addEventListener("mousedown", function(event) {
        var _element = this;
        _element.dataset.view = _element.dataset.view || "side";
        self.base = _element.dataset.position || 0;
        self.down = true;
        self.referenceX = event.pageX;
        self.referenceY = event.pageY;
        self.percent = 0;
        _element.classList.add("drag");
    });

    // listens for mouseup events and if it occurs then
    // stops reacting to mouse move events has drag movements
    this.element.addEventListener("mouseup", function(event) {
        var _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    this.element.addEventListener("mouseleave", function(event) {
        var _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    this.element.addEventListener("mousemove", function(event) {
        var _element = this;

        if (_element.classList.contains("noDrag")) {
            return;
        }
        var down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;
        down && self._parseDrag();
    });

    // listens for attribute changes to redraw the configurator
    // if needed, this makes use of the mutation observer
    var Observer = MutationObserver || WebKitMutationObserver;
    var observer = Observer ? new Observer(function(mutations) {
        for (var index = 0; index < mutations.length; index++) {
            var mutation = mutations[index];
            mutation.type === "style" && self.resize();
            mutation.type === "attributes" && self.update();
        }
    }.bind(this)) : null;
    observer && observer.observe(this.element, {
        attributes: true,
        subtree: false,
        characterData: true
    });
};

ripe.Configurator.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    var child = this.element.querySelector("*:first-child");
    var referenceX = this.referenceX;
    var referenceY = this.referenceY;
    var mousePosX = this.mousePosX;
    var mousePosY = this.mousePosY;
    var base = this.base;
    var deltaX = referenceX - mousePosX;
    var deltaY = referenceY - mousePosY;
    var elementWidth = this.element.clientWidth;
    var elementHeight = this.element.clientHeight || child.clientHeight;
    var percentX = deltaX / elementWidth;
    var percentY = deltaY / elementHeight;
    this.percent = percentX;
    var sensitivity = this.element.dataset.sensitivity || this.sensitivity;
    var verticalThreshold = this.element.dataset.verticalThreshold || this.verticalThreshold;

    // if the drag was vertical then alters the
    // view if it is supported by the product
    var view = this.element.dataset.view;
    var nextView = view;
    if (sensitivity * percentY > verticalThreshold) {
        nextView = view === "top" ? "side" : "bottom";
        this.referenceY = mousePosY;
    } else if (sensitivity * percentY < -verticalThreshold) {
        nextView = view === "bottom" ? "side" : "top";
        this.referenceY = mousePosY;
    }
    if (this.frames[nextView] === undefined) {
        nextView = view;
    }

    // retrieves the current view and its frames
    // and determines which one is the next frame
    var viewFrames = this.frames[nextView];
    var nextPosition = parseInt(base - (sensitivity * percentX)) % viewFrames;
    nextPosition = nextPosition >= 0 ? nextPosition : viewFrames + nextPosition;

    // if the view changes then uses the last
    // position presented in that view, if not
    // then shows the next position according
    // to the drag
    nextPosition = view === nextView ? nextPosition : (this._lastFrame[nextView] || 0);

    var nextFrame = ripe.getFrameKey(nextView, nextPosition);
    this.changeFrame(nextFrame);
};
