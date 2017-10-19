Ripe.Config = function(owner, element, options) {
    Ripe.Visual.call(this, owner, element, options);
    this.init();
};

Ripe.Config.prototype = Object.create(Ripe.Visual.prototype);

Ripe.Config.prototype.init = function() {
    this.owner.addSelectedPartCallback(function(part) {
        this.highlightPart(part);
    });
};

Ripe.Config.prototype.changeFrame = function(frame, options) {};

Ripe.Config.prototype.highlight = function(part, options) {};

Ripe.Config.prototype.lowlight = function(options) {};

Ripe.Config.prototype.enterFullscreen = function(options) {};

Ripe.Config.prototype.exitFullscreen = function(options) {};
