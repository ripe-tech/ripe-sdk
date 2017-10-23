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

ripe.Config.prototype._initDOM = function() {
    // sets defaults for the optional parameters
    var size = this.element.dataset.size || this.options.size || 1000;
    var maxSize = this.element.dataset.maxSize || this.options.maxSize || 1000;
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

ripe.Config.prototype.update = function(state) {
    var parts = state.parts || this.parts;
    if (!parts) {
        return;
    }
    this.parts = parts;
    var position = this.element.dataset.position
};

ripe.Config.prototype.changeFrame = function(frame, options) {};

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
    var maxSize = options.maxSize || this.element.dataset.maxSize || this.options.maxSize;
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
    this.element.addEventListener("mousemove", function(event) {
        var _element = this;

        if (_element.classList.contains("noDrag")) {
            return;
        }
        var down = _element.dataset.down;
        _element.dataset.mousePosX = event.pageX;
        _element.dataset.mousePosY = event.pageY;
        down === "true" && this._parseDrag();
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
    var percentX = deltaX / this.elementWidth;
    var percentY = deltaY / this.elementHeight;
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
    if (view !== nextView && this.owner.frames[nextView]) {
        this.element.dataset.referenceY = mousePosY;
        view = nextView;
        animate = "cross";
        this.element.classList.add("noDrag");
    }
    this.element.dataset.view = view;

    // if the frame changes then updates the product's position
    // if not then keeps using the current frame
    if (!isNaN(next)) {
        this.element.dataset.position = next;
    } else {
        var pos = this.element.dataset.position;
        next = parseInt(pos);
    }

    // if the new view doesn't have multiple frames
    // then ignores the index of the new frame
    viewFrames = this.owner.frames[view];
    next = viewFrames === 1 ? view : next;

    this.update();
    // updates the image of the drag element
    //self._updateDrag(element, next, animate, false, function() {
    // if a crossfade animation finishes
    // then stops ignoring drag movements
    //  if (animate === "cross") {
    //    this.element.classList.remove("noDrag");
    //}
    //}, options);

};
