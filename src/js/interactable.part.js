Ripe.Interactable = function(owner, options) {
    this.owner = owner;
    this.options = options || {};
    this.init();
};

Ripe.Interactable.prototype.init = function() { };

Ripe.Interactable.prototype.update = function(state) {};
