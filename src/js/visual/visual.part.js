ripe.Visual = function(owner, element, options) {
    ripe.Interactable.call(this, owner, options);
    ripe.Observable.call(this);

    this.element = element;
    ripe.Visual.prototype.init.call(this);
};

ripe.Visual.prototype = Object.create(ripe.Interactable.prototype);
ripe.Visual.prototype = Object.create(ripe.Observable.prototype);

ripe.Visual.prototype.init = function() {};
