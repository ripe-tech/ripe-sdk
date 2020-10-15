if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @augments Observable
 * @classdesc Class that defines an entity that can be used to interact
 * with the customizer (abstract).
 *
 * @param {Object} owner The owner (customizer instance) for
 * this interactable.
 * @param {Object} options The options to be used to configure the
 * interactable instance to be created.
 */
ripe.Interactable = function(owner, options = {}) {
    ripe.Observable.call(this);

    this.owner = owner;
    this.options = options;
    this.type = this.type || "Interactable";

    this.init();
};

ripe.Interactable.prototype = ripe.build(ripe.Observable.prototype);
ripe.Interactable.prototype.constructor = ripe.Interactable;

/**
 * The initializer of the class, to be called (by the owner)
 * whenever this interactable is going to become active.
 */
ripe.Interactable.prototype.init = function() {
    ripe.Observable.prototype.init.call(this);
};

/**
 * The deinitializer to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.Interactable.prototype.deinit = async function() {
    this.owner = null;

    ripe.Observable.prototype.deinit.call(this);
};

/**
 * Updates the current set of options (object) with the partial
 * options object provided as argument.
 *
 * The merge operation between both objects may override the current
 * set of configurations.
 *
 * @param {Object} options Map with the partial set of values to update
 * the currently set options
 */
ripe.Interactable.prototype.updateOptions = async function(options) {
    this.options = Object.assign(this.options, options);
};

/**
 * Callback function to be called when the owner configurator has
 * been changed and some kind of visual update should take place.
 *
 * @param {Object} state The new configuration state.
 * @param {Object} options Set of update options that change the way
 * the update operation is going to be performed.
 */
ripe.Interactable.prototype.update = async function(state, options = {}) {};
