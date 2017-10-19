Ripe.InteractableConfig = function(ripe, element, options) {
    Ripe.Interactable.call(this, ripe, element, options);
    Ripe.Interactable.prototype.init.call(this);

    this.init();
};

Ripe.InteractableConfig.prototype = Object.create(Ripe.Interactable.prototype);

Ripe.InteractableConfig.prototype.init = function() {
    this.ripe.addSelectedPartCallback(function(part) {
        this.highlightPart(part);
    });
};

Ripe.InteractableConfig.prototype.highlightPart = function(part, options) {};

Ripe.InteractableConfig.prototype.lowlight = function(options) {};

Ripe.InteractableConfig.prototype.enterFullscreen = function(options) {};

Ripe.InteractableConfig.prototype.exitFullscreen = function(options) {};
