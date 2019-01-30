if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Visual = function(owner, element, options) {
    this.element = element;
    this.elementEvents = {};

    ripe.Interactable.call(this, owner, options);
};

ripe.Visual.prototype = ripe.build(ripe.Interactable.prototype);
ripe.Visual.constructor = ripe.Visual;

ripe.Visual.prototype.init = function() {
    ripe.Interactable.prototype.init.call(this);
};

ripe.Visual.prototype.deinit = function() {
    this._removeElementHandlers();
    this.element = null;
    this.elementEvents = null;

    ripe.Interactable.prototype.deinit.call(this);
};

/**
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
