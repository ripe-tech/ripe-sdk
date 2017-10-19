ripe.Config = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Config.prototype.init.call(this);
};

ripe.Config.prototype = Object.create(ripe.Visual.prototype);

ripe.Config.prototype.init = function() {
    this.owner.addSelectedPartCallback(function(part) {
        this.highlightPart(part);
    });
};

ripe.Config.prototype.changeFrame = function(frame, options) {};

ripe.Config.prototype.highlight = function(part, options) {};

ripe.Config.prototype.lowlight = function(options) {};

ripe.Config.prototype.enterFullscreen = function(options) {};

ripe.Config.prototype.exitFullscreen = function(options) {};
