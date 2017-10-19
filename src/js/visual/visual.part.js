Ripe.Visual = function(owner, element, options) {
    Ripe.Interactable.call(this, owner, options);
    Ripe.Observable.call(this);

    this.element = element;
    this.init();
};

Ripe.Visual.prototype.init = function() { };

Ripe.Visual.prototype = Object.create(Ripe.Interactable.prototype);
Ripe.Visual.prototype = Object.create(Ripe.Observable.prototype);
