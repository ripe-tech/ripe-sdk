Ripe.InteractiveConfig = function(ripe, element, options) {
    Ripe.Interactive.call(this, ripe, element, options);
    Ripe.Interactive.prototype.init.call(this);

    this.init();
};

Ripe.InteractiveConfig.prototype = Object.create(Ripe.Interactive.prototype);

Ripe.InteractiveConfig.prototype.init = function() {
    this.ripe.addSelectedPartCallback(function(part) {
        this.highlightPart(part);
    });
};

Ripe.InteractiveConfig.prototype.highlightPart = function(part, options) {};

Ripe.InteractiveConfig.prototype.lowlight = function(options) {};

Ripe.InteractiveConfig.prototype.enterFullscreen = function(options) {};

Ripe.InteractiveConfig.prototype.exitFullscreen = function(options) {};
