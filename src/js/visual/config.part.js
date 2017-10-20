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
        this.initDOM();
    }.bind(this));
};

ripe.Config.prototype.initDOM = function() {

    // sets defaults for the optional parameters
    var size = this.element.dataset.size || this.options.size || 1000;
    var maxSize = this.element.dataset.maxSize || this.options.maxSize || 1000;
    var sensitivity = this.element.dataset.sensitivity || this.options.sensitivity || 40;

    // sets the target element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    this.element.classList.add("configurator");
    this.element.style.fontSize = "0px";
    this.element.style.whiteSpace = "nowrap";

    // creates the area canvas and adds it to the target element
    var area = document.createElement("canvas");
    area.className = "area";
    area.width = size;
    area.height = size;
    area.style.display = "inline-block";
    var context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    this.element.appendChild(area);

    // creates the back canvas and adds it to the target element,
    // placing it on top of the area canvas
    var back = document.createElement("canvas");
    back.className = "back";
    back.width = size;
    back.height = size;
    back.style.display = "inline-block";
    back.style.marginLeft = "-" + String(size) + "px";
    var backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    this.element.appendChild(back);

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
    this.element.appendChild(backs);


};

ripe.Config.prototype.changeFrame = function(frame, options) {};

ripe.Config.prototype.highlight = function(part, options) {};

ripe.Config.prototype.lowlight = function(options) {};

ripe.Config.prototype.enterFullscreen = function(options) {};

ripe.Config.prototype.exitFullscreen = function(options) {};
