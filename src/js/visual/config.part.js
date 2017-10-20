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

ripe.Config.prototype.update = function(state) {
    var view = this.element.dataset.view;
    var position = this.element.dataset.position;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    var previous = this.element.dataset.signature || "";
    var signature = this.owner._getQuery();
    var changed = signature !== previous;
    var animate = animate || (changed && "simple"); // TODO animate
    this.element.dataset.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    var previous = this.element.dataset.unique;
    var unique = signature + "&position=" + String(position) //+ "&single=" + String(single); TODO single
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
    var mustPreload = !single && (changed || !preloaded);
    single && this.element.classList.remove("preload");
    mustPreload && this._preload(this.options.useChain);
};

ripe.Config.prototype._initDOM = function() {};

ripe.Config.prototype.changeFrame = function(frame, options) {
    var _frame = frame.split("-");
    var view = _frame[0];
    var position = _frame[1];

    this.element.dataset.view = view;
    this.element.dataset.position = position;

    this.oldFrame = this.currentFrame;
    this.currentFrame = {
        view: view,
        position: position,
        loaded: false
    };
    this.update();
};

ripe.Config.prototype._loadFrame = function(view, position, options, callback) {
    // retrieves the image that will be used to store the frame
    position = position || this.element.dataset.position || 0;
    var options = options || {};
    var draw = options.draw === undefined || draw;
    var animate = options.animate;
    var backs = this.element.querySelector(".backs");
    var area = this.element.querySelector(".area");
    var image = backs.querySelector("img[data-frame='" + String(position) + "']");
    var front = area.querySelector("img[data-frame='" + String(position) + "']");
    image = image || front;

    // builds the url that will be set on the image
    var url = this.owner._getImageURL({
        frame: this.frame
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
        isReady && this.drawDrag(this.element, image, animate, drawCallback);
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
        this.drawDrag(this.element, image, animate, drawCallback);
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

ripe.Config.prototype.enterFullscreen = function(options) {};

ripe.Config.prototype.exitFullscreen = function(options) {};
