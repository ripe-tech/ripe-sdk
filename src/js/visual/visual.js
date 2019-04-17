if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @augments Interactable
 * @classdesc The superclass for visual representations of a Ripe instance.
 *
 * @param {Ripe} owner The Ripe instance to be represented.
 * @param {Object} element The DOM element that should be updated.
 * @param {Object} options The options to be used to configure the Visual representation.
 */
ripe.Visual = function(owner, element, options) {
    this.element = element;
    this.elementEvents = {};

    ripe.Interactable.call(this, owner, options);
};

ripe.Visual.prototype = ripe.build(ripe.Interactable.prototype);
ripe.Visual.constructor = ripe.Visual;

/**
 * The initializer which is called (by the owner)
 * whenever the Visual is going to become active.
 */
ripe.Visual.prototype.init = function() {
    ripe.Interactable.prototype.init.call(this);
};

/**
 * The deinitializer to be called (by the owner) when
 * it should stop responding to updates so that any necessary 
 * cleanup operations can be executed.
 */
ripe.Visual.prototype.deinit = function() {
    this._removeElementHandlers();
    this.element = null;
    this.elementEvents = null;

    ripe.Interactable.prototype.deinit.call(this);
};

/**
 * @private
 *
 * Utility function that binds an event to the interactable
 * DOM element and keeps a reference to it to unbind it
 * when no longer needed.
 *
 * @param {String} event The name of the event for which an event
 * handler is going to be registered.
 * @param {Function} callback The callback function to called once
 * the event is triggered.
 */
ripe.Visual.prototype._addElementHandler = function(event, callback) {
    this.element.addEventListener(event, callback);

    const callbacks = this.elementEvents[event] || [];
    callbacks.push(callback);
    this.elementEvents[event] = callbacks;
};

/**
 * @private
 *
 * Unbinds all the events from the DOM element.
 */
ripe.Visual.prototype._removeElementHandlers = function() {
    for (const event in this.elementEvents) {
        const callbacks = this.elementEvents[event];
        for (let index = 0; index < callbacks.length; index++) {
            const callback = callbacks[index];
            this.element.removeEventListener(event, callback);
        }
    }

    this.elementEvents = {};
};
