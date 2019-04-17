if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *
 * @class
 * @augments Interactable
 * @classdesc Lorem ipsum dolor sit amet, consectetur adipiscing elit.

 * @param {Object} owner Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * @param {Object} element Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * @param {Object} options Lorem ipsum dolor sit amet, consectetur adipiscing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 */
ripe.Visual = function(owner, element, options) {
    this.element = element;
    this.elementEvents = {};

    ripe.Interactable.call(this, owner, options);
};

ripe.Visual.prototype = ripe.build(ripe.Interactable.prototype);
ripe.Visual.constructor = ripe.Visual;

/**
 * @ignore
 */
ripe.Visual.prototype.init = function() {
    ripe.Interactable.prototype.init.call(this);
};

/**
 * @ignore
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
