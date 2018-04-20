if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

/**
 * Class that defines an entity that can be used to interact
 * with the customizer (abstract).
 *
 * @constructor
 * @param {Object} owner The owner (customizer instance) for
 * this insteractable.
 * @param {Object} options The options to be used to configure the
 * interactable instance to be created.
 */
ripe.Interactable = function(owner, options) {
    this.owner = owner;
    this.options = options || {};

    ripe.Interactable.prototype.init.call(this);
};

/**
 * The initializer of the class, called whenever this interactable
 * is going to become active.
 */
ripe.Interactable.prototype.init = function() {};

/**
 * Callback function to be called when the owner configurator has
 * been changed and some kind of visual update should take place.
 *
 * @param {Object} state The new configuration state.
 */
ripe.Interactable.prototype.update = function(state) {};
