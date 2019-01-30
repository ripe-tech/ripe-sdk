if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Class that defines an entity that can be used to interact
 * with the customizer (abstract).
 *
 * @constructor
 * @param {Object} owner The owner (customizer instance) for
 * this interactable.
 * @param {Object} options The options to be used to configure the
 * interactable instance to be created.
 */
ripe.Interactable = function(owner, options) {
    ripe.Observable.call(this);

    this.owner = owner;
    this.options = options || {};

    this.init();
};

ripe.Interactable.prototype = ripe.build(ripe.Observable.prototype);

/**
 * The initializer of the class, called whenever this interactable
 * is going to become active.
 */
ripe.Interactable.prototype.init = function() {
    ripe.Observable.prototype.init.call(this);
};

/**
 * Callback function to be called when the owner configurator has
 * been changed and some kind of visual update should take place.
 *
 * @param {Object} state The new configuration state.
 */
ripe.Interactable.prototype.update = function(state) { };

/**
 * The deinitializer of the class, called whenever this
 * interactable should stop responding to updates.
 */
ripe.Interactable.prototype.deinit = function() {
    this.owner = null;

    ripe.Observable.prototype.deinit.call(this);
};
