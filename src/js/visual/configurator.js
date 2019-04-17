if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Class that defines an interactive configurator instace to be
 * used in connection with the main Ripe owner to provide an
 * interactive configuration experience inside a DOM.
 *
 * @class
 * @classdesc Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * @param {Object} owner The owner (customizer instance) for
 * this configurator.
 * @param {Object} element The DOM element that is considered to
 * be the target for the configurator, it's going to have its own
 * inner HTML changed.
 * @param {Object} options The options to be used to configure the
 * configurator instance to be created.
 */
ripe.Configurator = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
};

ripe.Configurator.prototype = ripe.build(ripe.Visual.prototype);

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    this.width = this.options.width || 1000;
    this.height = this.options.height || 1000;
    this.size = this.options.size || null;
    this.maxSize = this.options.maxSize || 1000;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.interval = this.options.interval || 0;
    this.maskOpacity = this.options.maskOpacity || 0.4;
    this.maskDuration = this.options.maskDuration || 150;
    this.noMasks = this.options.noMasks === undefined ? true : this.options.noMasks;
    this.useMasks = this.options.useMasks === undefined ? !this.noMasks : this.options.useMasks;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;
    this.ready = false;
    this._observer = null;
    this._ownerBinds = {};

    this._ownerBinds["parts"] = this.owner.bind("parts", function(parts) {
        this.parts = parts;
    });

    // registers for the selected part event on the owner
    // so that we can highlight the associated part
    this._ownerBinds["selected_part"] = this.owner.bind(
        "selected_part",
        function(part) {
            this.highlight(part);
        }.bind(this)
    );

    // registers for the deselected part event on the owner
    // so that we can remove the highligt of the associated part
    this._ownerBinds["deselected_part"] = this.owner.bind(
        "deselected_part",
        function(part) {
            this.lowlight();
        }.bind(this)
    );

    // creates a structure the store the last presented
    // position of each view, to be used when returning
    // to a view for better user experience
    this._lastFrame = {};

    // creates the necessary DOM elemnts and runs
    // the intial layout update operation if the
    // owner has a model set
    this._initLayout();
    this.owner.brand && this.owner.model && this._updateConfig();

    // registers for the config change request event to
    // be able to properly update the internal structures
    this._ownerBinds["config"] = this.owner.bind("config", config => {
        config && this._updateConfig();
    });
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @param {Object} size Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.resize = function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.clientWidth;
    if (this.currentSize === size) {
        return;
    }

    const area = this.element.querySelector(".area");
    const frontMask = this.element.querySelector(".front-mask");
    const back = this.element.querySelector(".back");
    const mask = this.element.querySelector(".mask");
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
    this.update(
        {},
        {
            force: true
        }
    );
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @param {Object} options Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.update = function(state, options = {}) {
    if (this.ready === false) {
        return;
    }

    const view = this.element.dataset.view;
    const position = this.element.dataset.position;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;

    let animate = options.animate || false;
    const force = options.force || false;
    const duration = options.duration;
    const callback = options.callback;
    const preload = options.preload;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    let previous = this.signature || "";
    const signature =
        this.owner._getQuery() + "&width=" + String(width) + "&height=" + String(height);
    const changed = signature !== previous;
    animate = animate || (changed && "simple");
    this.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    previous = this.unique;
    const unique = signature + "&view=" + String(view) + "&position=" + String(position);
    if (previous === unique && !force) {
        callback && callback();
        return false;
    }
    this.unique = unique;

    // runs the load operation for the current frame, taking into
    // account the multiple requirements for such execution
    this._loadFrame(
        view,
        position,
        {
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
    const preloaded = this.element.classList.contains("preload");
    const mustPreload = preload !== undefined ? preload : changed || !preloaded;
    mustPreload && this._preload(this.options.useChain);
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.deinit = function() {
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    for (var bind in this._ownerBinds) {
        this.owner.unbind(bind, this._ownerBinds[bind]);
    }

    this._removeElementHandlers();
    this._observer && this._observer.disconnect();
    this._observer = null;

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @param {Object} frame Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * @param {Object} options Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.changeFrame = function(frame, options = {}) {
    const _frame = ripe.parseFrameKey(frame);
    const nextView = _frame[0];
    const nextPosition = parseInt(_frame[1]);

    const duration = options.duration || this.duration;
    const type = options.type;
    let preventDrag = options.preventDrag === undefined ? true : options.preventDrag;

    const view = this.element.dataset.view;
    const position = parseInt(this.element.dataset.position);

    // tries to retrieve the ammount of frames for the target view and
    // validates that the arget view exists and that the target position
    // (frame) does not overflow the ammount of frames in for the view
    const viewFrames = this.frames[nextView];
    if (!viewFrames || nextPosition >= viewFrames) {
        throw new RangeError("Frame " + frame + " is not supported.");
    }

    // removes any part highlight in case it is set
    // to replicate the behaviour of dragging the product
    this.lowlight();

    // saves the position of the current view
    // so that it returns to the same position
    // when coming back to the same view
    this._lastFrame[view] = position;
    this.element.dataset.position = nextPosition;

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    let animate = false;
    if (view !== nextView && viewFrames !== undefined) {
        this.element.dataset.view = nextView;
        animate = "cross";
    }

    // if an animation duration was provided then changes
    // to the next step instead of the target frame
    let stepDuration = 0;
    let stepPosition = position;
    if (duration) {
        // determines the kind of animation that is going to
        // be used for the current change frame operation
        animate = type || animate;

        // calculates the number of steps of
        // the animation and the step duration
        const stepCount = view !== nextView ? 1 : nextPosition - position;
        stepDuration = duration / Math.abs(stepCount);
        options.duration = duration - stepDuration;

        // determines the next step and sets it
        // as the position
        stepPosition = stepCount !== 0 ? position + stepCount / stepCount : position;
        stepPosition = stepPosition % viewFrames;
        this.element.dataset.position = stepPosition;
    }

    // determines if the current change frame operation
    // is an animated one or if it's a discrete one
    const animated = Boolean(duration);

    // if the frame change is animated and preventDrag is true
    // then ignores drag movements until the animation is finished
    preventDrag = preventDrag && (animate || duration);
    preventDrag && this.element.classList.add("no-drag", "animating");

    const newFrame = ripe.getFrameKey(this.element.dataset.view, this.element.dataset.position);
    this.trigger("changed_frame", newFrame);
    this.update(
        {},
        {
            animate: animate,
            duration: stepDuration,
            callback: function() {
                // if there is no step transition or the transition
                // has finished, then allows drag movements again,
                // otherwise waits the provided interval and
                // proceeds to the next step
                if (!animated || stepPosition === nextPosition) {
                    preventDrag && this.element.classList.remove("no-drag", "animating");
                } else {
                    const timeout = animate ? 0 : stepDuration;
                    setTimeout(
                        function() {
                            this.changeFrame(frame, options);
                        }.bind(this),
                        timeout
                    );
                }
            }.bind(this)
        }
    );
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @param {Object} part Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * @param {Object} options Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.highlight = function(part, options = {}) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // captures the current context to be used by clojure callbacks
    const self = this;

    // determines the current position of the configurator so that
    // the proper mask URL may be created and properly loaded
    const view = this.element.dataset.view;
    const position = this.element.dataset.position;
    const frame = ripe.getFrameKey(view, position);
    const backgroundColor = options.backgroundColor || this.backgroundColor;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const maskOpacity = this.element.dataset.mask_opacity || this.maskOpacity;
    const maskDuration = this.element.dataset.mask_duration || this.maskDuration;

    // adds the highlight class to the current target configurator meaning
    // that the front mask is currently active and showing info
    this.element.classList.add("highlight");

    // constructs the full URL of the mask image that is going to be
    // set for the current highlight operation (to be determined)
    const url = this.owner._getMaskURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        color: backgroundColor,
        part: part
    });

    const frontMask = this.element.querySelector(".front-mask");
    const src = frontMask.getAttribute("src");
    if (src === url) {
        return;
    }
    const frontMaskLoad = function() {
        this.classList.add("loaded");
        this.classList.add("highlight");
        self.trigger("highlighted_part", part);
    };
    frontMask.removeEventListener("load", frontMaskLoad);
    frontMask.addEventListener("load", frontMaskLoad);
    frontMask.addEventListener("error", function() {
        this.setAttribute("src", "");
    });
    frontMask.setAttribute("src", url);

    const animationId = frontMask.dataset.animation_id;
    cancelAnimationFrame(animationId);
    ripe.animateProperty(frontMask, "opacity", 0, maskOpacity, maskDuration);
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.lowlight = function(options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // retrieves the reference to the current front mask and removes
    // the highlight associated classes from it and the configurator
    const frontMask = this.element.querySelector(".front-mask");
    frontMask.classList.remove("highlight");
    this.element.classList.remove("highlight");
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.enterFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    const maxSize = this.element.dataset.max_size || this.maxSize;
    this.resize(maxSize);
};

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Configurator.prototype.leaveFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    this.resize();
};

/**
 * @private
 *
 * Initializes the layout for the configurator element by
 * constructing all te child elements required for the proper
 * configurator functionality to work.
 *
 * From a DOM prespective this is a synchronous operation,
 * meaning that after its execution the configurator is ready
 * to be manipulated.
 */
ripe.Configurator.prototype._initLayout = function() {
    // clears the elements children
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    // sets the element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    this.element.classList.add("configurator");

    // creates the area canvas and adds it to the element
    const area = ripe.createElement("canvas", "area");
    const context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    this.element.appendChild(area);

    // adds the front mask element to the element,
    // this will be used to highlight parts
    const frontMask = ripe.createElement("img", "front-mask");
    this.element.appendChild(frontMask);

    // creates the back canvas and adds it to the element,
    // placing it on top of the area canvas
    const back = ripe.createElement("canvas", "back");
    const backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    this.element.appendChild(back);

    // creates the mask element that will de used to display
    // the mask on top of an highlighted or selected part
    const mask = ripe.createElement("canvas", "mask");
    this.element.appendChild(mask);

    // adds the framesBuffer placeholder element that will be used to
    // temporarily store the images of the product's frames
    const framesBuffer = ripe.createElement("div", "frames-buffer");

    // creates a masksBuffer element that will be used to store the constious
    // mask images to be used during highlight and select operation
    const masksBuffer = ripe.createElement("div", "masks-buffer");

    this.element.appendChild(framesBuffer);
    this.element.appendChild(masksBuffer);

    // set the size of area, frontMask, back and mask
    this.resize();

    // sets the initial view and position
    this.element.dataset.view = this.view;
    this.element.dataset.position = this.position;

    // register for all the necessary DOM events
    this._registerHandlers();
};

ripe.Configurator.prototype._initPartsList = async function() {
    // creates a set of sorted parts to be used on the
    // highlight operation (considers only the default ones)
    this.partsList = [];
    const config = this.owner.loadedConfig
        ? this.owner.loadedConfig
        : await this.owner.getConfigP();
    const defaults = config.defaults || {};
    this.hiddenParts = config.hidden || [];
    this.partsList = Object.keys(defaults);
    this.partsList.sort();
};

ripe.Configurator.prototype._populateBuffers = function() {
    const framesBuffer = this.element.getElementsByClassName("frames-buffer");
    const masksBuffer = this.element.getElementsByClassName("masks-buffer");
    let buffer = null;

    for (let index = 0; index < framesBuffer.length; index++) {
        buffer = framesBuffer[index];
        this._populateBuffer(buffer);
    }

    for (let index = 0; index < masksBuffer.length; index++) {
        buffer = masksBuffer[index];
        this._populateBuffer(buffer);
    }
};

ripe.Configurator.prototype._populateBuffer = function(buffer) {
    while (buffer.firstChild) {
        buffer.removeChild(buffer.firstChild);
    }

    // creates two image elements for each frame and
    // appends them to the frames and masks buffers
    for (const view in this.frames) {
        const viewFrames = this.frames[view];
        for (let index = 0; index < viewFrames; index++) {
            const frameBuffer = ripe.createElement("img");
            frameBuffer.dataset.frame = ripe.getFrameKey(view, index);
            buffer.appendChild(frameBuffer);
        }
    }
};

ripe.Configurator.prototype._updateConfig = function() {
    // sets ready to false to temporarily block
    // update requests while the new config
    // is being loaded
    this.ready = false;

    // removes the highlight from any part
    this.lowlight();

    // updates the parts list for the new product
    this._initPartsList();

    // retrieves the new product frame object and sets it
    // under the current state, adapting then the internal
    // structures to accomodate the possible changes in the
    // frame structure
    this.owner.getFrames(
        function(frames) {
            // updates the internal reference to the frames
            // model (to be used from now on)
            this.frames = frames;

            // populates the buffers taking into account
            // the frames of the model
            this._populateBuffers();

            // tries to keep the current view and position
            // if the new model supports it otherwise
            // changes to a supported frame
            let view = this.element.dataset.position;
            let position = this.element.dataset.position;
            let maxPosition = this.frames[view];
            if (!maxPosition) {
                view = Object.keys(this.frames)[0];
                position = 0;
            } else if (position >= maxPosition) {
                position = 0;
            }

            // checks the last viewed frames of each view
            // and deletes the ones not supported
            const lastFrameViews = Object.keys(this._lastFrame);
            for (view in lastFrameViews) {
                position = this._lastFrame[view];
                maxPosition = this.frames[view];
                if (!maxPosition || position >= maxPosition) {
                    delete this._lastFrame[view];
                }
            }

            // shows the new product with a crossfade effect
            // and starts responding to updates again
            this.ready = true;
            this.trigger("ready");
            this.update(
                {},
                {
                    preload: true,
                    animate: "cross",
                    force: true
                }
            );
        }.bind(this)
    );
};

ripe.Configurator.prototype._loadFrame = function(view, position, options = {}, callback) {
    // runs the defaulting operation on all of the parameters
    // sent to the load frame operation (defaulting)
    view = view || this.element.dataset.view || "side";
    position = position || this.element.dataset.position || 0;

    const frame = ripe.getFrameKey(view, position);

    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;

    const draw = options.draw === undefined || options.draw;
    const animate = options.animate;
    const duration = options.duration;
    const framesBuffer = this.element.querySelector(".frames-buffer");
    const masksBuffer = this.element.querySelector(".masks-buffer");
    const area = this.element.querySelector(".area");
    let image = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    const front = area.querySelector("img[data-frame='" + String(frame) + "']");
    const maskImage = masksBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    image = image || front;

    // in case there's no images for the frames that are meant
    // to be loaded calls the callback immediately and returns
    // the control flow (not possible to load them)
    if (image === null || maskImage === null) {
        throw new RangeError("Frame " + frame + " is not supported.");
    }

    // constructs the URL for the mask and updates it
    this._loadMask(maskImage, view, position, options);

    // builds the URL that will be set on the image, notice that both
    // the full URL mode is avoided so that no extra parameters are
    // added to the image composition (not required)
    const url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        full: false
    });

    // creates a callback to be called when the frame
    // is drawn to trigger the callback passed to this
    // function if it's set
    const drawCallback = function() {
        callback && callback();
    };

    // verifies if the loading of the current image
    // is considered redundant (already loaded or
    // loading) and avoids for performance reasons
    const isRedundant = image.dataset.src === url;
    if (isRedundant) {
        if (!draw) {
            callback && callback();
            return;
        }
        const isReady = image.dataset.loaded === "true";
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

ripe.Configurator.prototype._loadMask = function(maskImage, view, position, options) {
    // constructs the URL for the mask and then at the end of the
    // mask loading process runs the final update of the mask canvas
    // operation that will allow new highlight and selection operation
    // to be performed according to the new frame value
    const draw = options.draw === undefined || options.draw;
    const backgroundColor = options.backgroundColor || this.backgroundColor;
    const size = this.element.dataset.size || this.size;
    const width = size || this.element.dataset.width || this.width;
    const height = size || this.element.dataset.height || this.height;
    const frame = ripe.getFrameKey(view, position);
    const url = this.owner._getMaskURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        color: backgroundColor
    });
    const self = this;
    if (draw && maskImage.dataset.src === url) {
        setTimeout(function() {
            self._drawMask(maskImage);
        }, 150);
    } else {
        maskImage.onload = draw
            ? function() {
                  setTimeout(function() {
                      self._drawMask(maskImage);
                  }, 150);
              }
            : null;
        maskImage.addEventListener("error", function() {
            this.removeAttribute("src");
        });
        maskImage.crossOrigin = "Anonymous";
        maskImage.dataset.src = url;
        maskImage.setAttribute("src", url);
    }
};

ripe.Configurator.prototype._drawMask = function(maskImage) {
    const mask = this.element.querySelector(".mask");
    const maskContext = mask.getContext("2d");
    maskContext.clearRect(0, 0, mask.width, mask.height);
    maskContext.drawImage(maskImage, 0, 0, mask.width, mask.height);
};

ripe.Configurator.prototype._drawFrame = function(image, animate, duration, callback) {
    const area = this.element.querySelector(".area");
    const back = this.element.querySelector(".back");

    const visible = area.dataset.visible === "true";
    const current = visible ? area : back;
    const target = visible ? back : area;
    const context = target.getContext("2d");
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

    const currentId = current.dataset.animation_id;
    const targetId = target.dataset.animation_id;
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
    const position = this.element.dataset.position || 0;
    let index = this.index || 0;
    index++;
    this.index = index;
    this.element.classList.add("preload");

    // adds all the frames to the work pile
    const work = [];
    for (const view in this.frames) {
        const viewFrames = this.frames[view];
        for (let _index = 0; _index < viewFrames; _index++) {
            if (_index === position) {
                continue;
            }
            const frame = ripe.getFrameKey(view, _index);
            work.push(frame);
        }
    }
    work.reverse();

    const self = this;
    const mark = function(element) {
        const _index = self.index;
        if (index !== _index) {
            return;
        }

        // removes the preloading class from the image element
        // and retrieves all the images still preloading,
        element.classList.remove("preloading");
        const framesBuffer = self.element.querySelector(".frames-buffer");
        const pending = framesBuffer.querySelectorAll("img.preloading") || [];

        // if there are images preloading then adds the
        // preloading class to the target element and
        // prevents drag movements to avoid flickering
        // else and if there are no images preloading and no
        // frames yet to be preloaded then the preload
        // is considered finished so drag movements are
        // allowed again and the loaded event is triggered
        if (pending.length > 0) {
            self.element.classList.add("preloading");
            self.element.classList.add("no-drag");
        } else if (work.length === 0) {
            self.element.classList.remove("preloading");
            self.element.classList.remove("no-drag");
            self.trigger("loaded");
        }
    };

    const render = function() {
        const _index = self.index;
        if (index !== _index) {
            return;
        }
        if (work.length === 0) {
            return;
        }

        // retrieves the next frame to be loaded
        // and its corresponding image element
        // and adds the preloading class to it
        const frame = work.pop();
        const framesBuffer = self.element.querySelector(".frames-buffer");
        const reference = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
        reference.classList.add("preloading");

        // if a chain base loaded is used then
        // marks the current frame as pre-loaded
        // and proceeds to the next frame
        const callbackChain = function() {
            mark(reference);
            render();
        };

        // if all the images are pre-loaded at the
        // time then just marks the current one as
        // pre-loaded
        const callbackMark = function() {
            mark(reference);
        };

        // determines if a chain based loading should be used for the
        // pre-loading process of the constious image resources to be loaded
        const _frame = ripe.parseFrameKey(frame);
        const view = _frame[0];
        const position = _frame[1];
        self._loadFrame(
            view,
            position,
            {
                draw: false
            },
            useChain ? callbackChain : callbackMark
        );
        !useChain && render();
    };

    // if there are frames to be loaded then adds the
    // preloading class, prevents drag movements and
    // starts the render process after a timeout
    work.length > 0 && this.element.classList.add("preloading");
    if (work.length > 0) {
        this.element.classList.add("no-drag");
        setTimeout(function() {
            render();
        }, 250);
    }
};

ripe.Configurator.prototype._registerHandlers = function() {
    // captures the current context to be used inside clojures
    const self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    const area = this.element.querySelector(".area");
    const back = this.element.querySelector(".back");

    // binds the mousedown event on the element to prepare
    // it for drag movements
    this._addElementHandler("mousedown", function(event) {
        const _element = this;
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
    this._addElementHandler("mouseup", function(event) {
        const _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    this._addElementHandler("mouseleave", function(event) {
        const _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    this._addElementHandler("mousemove", function(event) {
        if (this.classList.contains("no-drag")) {
            return;
        }
        const down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;
        down && self._parseDrag();
    });

    area.addEventListener("click", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        const index = self._getCanvasIndex(this, event.offsetX, event.offsetY);
        if (index === 0) {
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        const part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.owner.selectPart(part);
        event.stopPropagation();
    });

    area.addEventListener("mousemove", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        const index = self._getCanvasIndex(this, event.offsetX, event.offsetY);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || self.down === true) {
            self.lowlight();
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        const part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.highlight(part);
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    back.addEventListener("click", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        const index = self._getCanvasIndex(this, event.offsetX, event.offsetY);
        if (index === 0) {
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        const part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.owner.selectPart(part);
        event.stopPropagation();
    });

    back.addEventListener("mousemove", function(event) {
        const preloading = self.element.classList.contains("preloading");
        const animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        const index = self._getCanvasIndex(this, event.offsetX, event.offsetY);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || self.down === true) {
            self.lowlight();
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        const part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.highlight(part);
    });

    back.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    // listens for attribute changes to redraw the configurator
    // if needed, this makes use of the mutation observer
    // eslint-disable-next-line no-undef
    const Observer = MutationObserver || WebKitMutationObserver;
    this._observer = Observer
        ? new Observer(function(mutations) {
              for (let index = 0; index < mutations.length; index++) {
                  const mutation = mutations[index];
                  mutation.type === "style" && self.resize();
                  mutation.type === "attributes" && self.update();
              }
          })
        : null;
    this._observer &&
        this._observer.observe(this.element, {
            attributes: true,
            subtree: false,
            characterData: true
        });

    // adds handlers for the touch events so that they get
    // parsed to mouse events for the configurator element,
    // taking into account that there may be a touch handler
    // already defined
    ripe.touchHandler(this.element);
};

ripe.Configurator.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    const child = this.element.querySelector("*:first-child");
    const referenceX = this.referenceX;
    const referenceY = this.referenceY;
    const mousePosX = this.mousePosX;
    const mousePosY = this.mousePosY;
    const base = this.base;
    const deltaX = referenceX - mousePosX;
    const deltaY = referenceY - mousePosY;
    const elementWidth = this.element.clientWidth;
    const elementHeight = this.element.clientHeight || child.clientHeight;
    const percentX = deltaX / elementWidth;
    const percentY = deltaY / elementHeight;
    this.percent = percentX;
    const sensitivity = this.element.dataset.sensitivity || this.sensitivity;
    const verticalThreshold = this.element.dataset.verticalThreshold || this.verticalThreshold;

    // if the drag was vertical then alters the
    // view if it is supported by the product
    const view = this.element.dataset.view;
    let nextView = view;
    if (sensitivity * percentY > verticalThreshold) {
        nextView = view === "top" ? "side" : "bottom";
        this.referenceY = mousePosY;
    } else if (sensitivity * percentY < verticalThreshold * -1) {
        nextView = view === "bottom" ? "side" : "top";
        this.referenceY = mousePosY;
    }
    if (this.frames[nextView] === undefined) {
        nextView = view;
    }

    // retrieves the current view and its frames
    // and determines which one is the next frame
    const viewFrames = this.frames[nextView];
    let nextPosition = parseInt(base - (sensitivity * percentX * viewFrames) / 24) % viewFrames;
    nextPosition = nextPosition >= 0 ? nextPosition : viewFrames + nextPosition;

    // if the view changes then uses the last
    // position presented in that view, if not
    // then shows the next position according
    // to the drag
    nextPosition = view === nextView ? nextPosition : this._lastFrame[nextView] || 0;

    const nextFrame = ripe.getFrameKey(nextView, nextPosition);
    this.changeFrame(nextFrame);
};

ripe.Configurator.prototype._getCanvasIndex = function(canvas, x, y) {
    const canvasRealWidth = canvas.getBoundingClientRect().width;
    const mask = this.element.querySelector(".mask");
    const ratio = mask.width && canvasRealWidth && mask.width / canvasRealWidth;
    x = parseInt(x * ratio);
    y = parseInt(y * ratio);

    const maskContext = mask.getContext("2d");
    const pixel = maskContext.getImageData(x, y, 1, 1);
    const r = pixel.data[0];
    const index = parseInt(r);

    return index;
};
