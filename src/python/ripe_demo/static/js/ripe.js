/** @namespace */
// eslint-disable-next-line no-use-before-define
var ripe = typeof ripe === "undefined" ? {} : ripe;

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Assigns a certain set of values in the provided object to the
 * first parameter of the call (target).
 *
 * @param {String} target The target of the assign operation meaning
 * the object to which the values will be assigned.
 */
ripe.assign = function(target) {
    if (typeof Object.assign === "function") {
        return Object.assign.apply(this, arguments);
    }

    if (target === null) {
        throw new TypeError("Cannot assign undefined or null object");
    }

    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource == null) {
            continue;
        }
        for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }
    return to;
};

// eslint-disable-next-line no-use-before-define
if (typeof require !== "undefined" && typeof XMLHttpRequest === "undefined") {
    var XMLHttpRequest = null;
    // eslint-disable-next-line camelcase
    if (typeof __webpack_require__ === "undefined") {
        XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    } else {
        XMLHttpRequest = window.XMLHttpRequest;
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        XMLHttpRequest: XMLHttpRequest
    };
}

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
    this.owner = owner;
    this.options = options || {};

    this.init();
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

/**
 * The deinitializer of the class, called whenever this
 * interactable should stop responding to updates.
 */
ripe.Interactable.prototype.deinit = function() {
    this.owner = null;
};

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.touchHandler = function(element, options) {
    // eslint-disable-next-line no-undef
    if (typeof Mobile !== "undefined" && Mobile.touchHandler) {
        return;
    }

    options = options || {};
    var SAFE = options.safe === undefined ? true : options.safe;
    var VALID = options.valid || ["DIV", "IMG", "SPAN", "CANVAS"];

    var eventHandler = function(event) {
        // retrieves the complete set of touches and uses
        // only the first one for type reference
        var touches = event.changedTouches;
        var first = touches[0];
        var type = "";

        // switches over the type of touch event associating
        // the proper equivalent mouse enve to each of them
        switch (event.type) {
            case "touchstart":
                type = "mousedown";
                break;

            case "touchmove":
                type = "mousemove";
                break;

            case "touchend":
                type = "mouseup";
                break;

            default:
                return;
        }

        // verifies if the current event is considered to be valid,
        // this occurs if the target of the type of the target is
        // considered to be valid according to the current rules
        var isValid = VALID.indexOf(first.target.tagName) === -1;
        if (SAFE && isValid) {
            return;
        }

        // creates the new mouse event that will emulate the
        // touch event that has just been raised, it should
        // be completly equivalent to the original touch
        var mouseEvent = document.createEvent("MouseEvent");
        mouseEvent.initMouseEvent(
            type,
            true,
            true,
            window,
            1,
            first.screenX,
            first.screenY,
            first.clientX,
            first.clientY,
            false,
            false,
            false,
            false,
            0,
            null
        );

        // dispatches the event to the original target of the
        // touch event (pure emulation)
        first.target.dispatchEvent(mouseEvent);
    };

    element.addEventListener("touchstart", eventHandler, true);
    element.addEventListener("touchmove", eventHandler, true);
    element.addEventListener("touchend", eventHandler, true);
    element.addEventListener("touchcancel", eventHandler, true);
};

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Observable = function() {
    this.callbacks = {};
};

ripe.Observable.prototype.init = function() {};

ripe.Observable.prototype.addCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
};

ripe.Observable.prototype.removeCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    if (!callback) {
        delete this.callbacks[event];
        return;
    }

    var index = callbacks.indexOf(callback);
    if (index === -1) {
        return;
    }
    callbacks.splice(index, 1);
    this.callbacks[event] = callbacks;
};

ripe.Observable.prototype.runCallbacks = function(event) {
    var callbacks = this.callbacks[event] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

ripe.Observable.prototype.deinit = function() {
    this.callbacks = null;
};

ripe.Observable.prototype.bind = ripe.Observable.prototype.addCallback;
ripe.Observable.prototype.unbind = ripe.Observable.prototype.removeCallback;
ripe.Observable.prototype.trigger = ripe.Observable.prototype.runCallbacks;

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./observable");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe = function(brand, model, options) {
    ripe.Observable.call(this);
    ripe.Ripe.prototype.init.call(this, brand, model, options);
};

ripe.Ripe.prototype = Object.create(ripe.Observable.prototype);

ripe.RipeBase = function(brand, model, options) {
    return new ripe.Ripe(brand, model, options);
};

ripe.Ripe.prototype.init = function(brand, model, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.initials = "";
    this.engraving = null;
    this.children = this.children || [];
    this.plugins = this.plugins || [];
    this.history = [];
    this.historyPointer = -1;
    this.ready = false;

    // extends the default options with the ones provided by the
    // developer upon this initializer call
    options = ripe.assign(
        {
            options: false
        },
        options
    );

    // runs the connfiguration operation on the current instance, using
    // the requested parameters and options, multiple configuration
    // operations may be executed over the object life-time
    this.config(brand, model, options);

    // listens for the post parts event and saves the current
    // configuration for the undo operation
    this.bind("post_parts", function(parts, options) {
        if (options && ["undo", "redo"].indexOf(options.action) !== -1) {
            return;
        }

        if (!this.parts || !Object.keys(this.parts).length) {
            return;
        }

        if (ripe.equal(this.parts, this.history[this.historyPointer])) {
            return;
        }

        var _parts = ripe.clone(this.parts);
        this.history = this.history.slice(0, this.historyPointer + 1);
        this.history.push(_parts);
        this.historyPointer = this.history.length - 1;
    });
};

ripe.Ripe.prototype.deinit = function() {
    var index = null;

    for (index = this.children.length - 1; index >= 0; index--) {
        var child = this.children[index];
        this.unbindInteractable(child);
    }

    for (index = this.plugins.length - 1; index >= 0; index--) {
        var plugin = this.plugins[index];
        this.removePlugin(plugin);
    }

    ripe.Observable.prototype.deinit.call(this);
};

ripe.Ripe.prototype.load = function() {
    this.update();
};

ripe.Ripe.prototype.unload = function() {};

ripe.Ripe.prototype.config = function(brand, model, options) {
    // sets the most structural values of this entity
    // that represent the configuration to be used
    this.brand = brand;
    this.model = model;

    // resets the history related values as the current
    // model has changed and no previous history is possible
    this.history = [];
    this.historyPointer = -1;

    // sets the new options using the current options
    // as default values and sets the update flag to
    // true if it is not set
    options = ripe.assign(
        {
            update: true
        },
        this.options,
        options
    );
    this.setOptions(options);

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && this.useDefaults && this.brand && this.model;
    var loadParts = loadDefaults
        ? this.getDefaults
        : function(callback) {
              setTimeout(callback);
          };
    loadParts.call(
        this,
        function(result) {
            result = result || this.parts;
            if (this.ready === false) {
                this.ready = true;
                this.trigger("ready");
            }
            this.setParts(result);
            this.remote();
            this.update();
        }.bind(this)
    );

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    // for cases where this is the first configuration (not an update)
    var update = this.options.update || false;
    this.ready = update ? this.ready : hasParts;

    // triggers the config event notifying any listener that the (base)
    // configuration for this main RIPE instance has changed
    this.trigger("config");
};

ripe.Ripe.prototype.remote = function() {
    // makes sure that both the brand and the model values are defined
    // for the current instance as they are needed for the remove operation
    // that are going to be performed
    if (!this.brand || !this.model) {
        return;
    }

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = this.useCombinations;
    loadCombinations &&
        this.getCombinations(
            function(result) {
                this.combinations = result;
                this.trigger("combinations", this.combinations);
            }.bind(this)
        );
};

ripe.Ripe.prototype.setOptions = function(options) {
    this.options = options || {};
    this.variant = this.options.variant || null;
    this.url = this.options.url || "https://sandbox.platforme.com/api/";
    this.parts = this.options.parts || {};
    this.country = this.options.country || null;
    this.currency = this.options.currency || null;
    this.format = this.options.format || "jpeg";
    this.backgroundColor = this.options.backgroundColor || "";
    this.noDefaults = this.options.noDefaults === undefined ? false : this.options.noDefaults;
    this.useDefaults =
        this.options.useDefaults === undefined ? !this.noDefaults : this.options.useDefaults;
    this.noCombinations =
        this.options.noCombinations === undefined ? false : this.options.noCombinations;
    this.useCombinations =
        this.options.useCombinations === undefined
            ? !this.noCombinations
            : this.options.useCombinations;
    this.noPrice = this.options.noPrice === undefined ? false : this.options.noPrice;
    this.usePrice = this.options.usePrice === undefined ? !this.noPrice : this.options.usePrice;

    // runs the background color normalization process that removes
    // the typical cardinal character from the definition
    this.backgroundColor = this.backgroundColor.replace("#", "");
};

ripe.Ripe.prototype.setPart = function(part, material, color, noUpdate, options) {
    if (noUpdate) {
        return this._setPart(part, material, color);
    }

    this.trigger("pre_parts", this.parts, options);
    this._setPart(part, material, color);
    this.update();
    this.trigger("parts", this.parts, options);
    this.trigger("post_parts", this.parts, options);
};

ripe.Ripe.prototype.setParts = function(update, noUpdate, options) {
    if (typeof update === "object" && !Array.isArray(update)) {
        update = this._partsList(update);
    }

    if (noUpdate) {
        return this._setParts(update);
    }

    this.trigger("pre_parts", this.parts, options);
    this._setParts(update);
    this.update();
    this.trigger("parts", this.parts, options);
    this.trigger("post_parts", this.parts, options);
};

ripe.Ripe.prototype.setInitials = function(initials, engraving, noUpdate) {
    this.initials = initials;
    this.engraving = engraving;

    if (noUpdate) {
        return;
    }
    this.update();
};

ripe.Ripe.prototype.getFrames = function(callback) {
    if (this.options.frames) {
        callback(this.options.frames);
        return;
    }

    this.getConfig(function(config) {
        var frames = {};
        var faces = config["faces"];
        for (var index = 0; index < faces.length; index++) {
            var face = faces[index];
            frames[face] = 1;
        }

        var sideFrames = config["frames"];
        frames["side"] = sideFrames;
        callback && callback(frames);
    });
};

ripe.Ripe.prototype.bindImage = function(element, options) {
    var image = new ripe.Image(this, element, options);
    return this.bindInteractable(image);
};

ripe.Ripe.prototype.bindConfigurator = function(element, options) {
    var config = new ripe.Configurator(this, element, options);
    return this.bindInteractable(config);
};

ripe.Ripe.prototype.bindInteractable = function(child) {
    this.children.push(child);
    return child;
};

ripe.Ripe.prototype.unbindInteractable = function(child) {
    child.deinit();
    this.children.splice(this.children.indexOf(child), 1);
};

ripe.Ripe.prototype.unbindImage = ripe.Ripe.prototype.unbindInteractable;
ripe.Ripe.prototype.unbindConfigurator = ripe.Ripe.prototype.unbindInteractable;

ripe.Ripe.prototype.selectPart = function(part, options) {
    this.trigger("selected_part", part);
};

ripe.Ripe.prototype.deselectPart = function(part, options) {
    this.trigger("deselected_part", part);
};

ripe.Ripe.prototype.update = function(state) {
    state = state || this._getState();

    for (var index = 0; index < this.children.length; index++) {
        var child = this.children[index];
        child.update(state);
    }

    this.ready && this.trigger("update");

    this.ready &&
        this.usePrice &&
        this.getPrice(
            function(value) {
                this.trigger("price", value);
            }.bind(this)
        );
};

/**
 * Reverses the last change to the parts. It is possible
 * to undo all the changes done from the initial state.
 */
ripe.Ripe.prototype.undo = function() {
    if (!this.canUndo()) {
        return;
    }

    this.historyPointer -= 1;
    var parts = this.history[this.historyPointer];
    parts && this.setParts(parts, false, { action: "undo" });
};

/**
 * Reapplies the last change to the parts that was undone.
 * Notice that if there's a change when the history pointer
 * is in the middle of the stack the complete stack forward
 * is removed (history re-written).
 */
ripe.Ripe.prototype.redo = function() {
    if (!this.canRedo()) {
        return;
    }

    this.historyPointer += 1;
    var parts = this.history[this.historyPointer];
    parts && this.setParts(parts, false, { action: "redo" });
};

/**
 * Indicates if there are part changes to undo.
 *
 * @returns {boolean} If there are changes to reverse in the
 * current parts history stack.
 */
ripe.Ripe.prototype.canUndo = function() {
    return this.historyPointer > 0;
};

/**
 * Indicates if there are part changes to redo.
 *
 * @returns {boolean} If there are changes to reapply pending
 * in the history stack.
 */
ripe.Ripe.prototype.canRedo = function() {
    return this.history.length - 1 > this.historyPointer;
};

ripe.Ripe.prototype.addPlugin = function(plugin) {
    plugin.register(this);
    this.plugins.push(plugin);
};

ripe.Ripe.prototype.removePlugin = function(plugin) {
    plugin.unregister(this);
    this.plugins.splice(this.plugins.indexOf(plugin), 1);
};

ripe.Ripe.prototype._getState = function() {
    return {
        parts: this.parts,
        initials: this.initials,
        engraving: this.engraving
    };
};

ripe.Ripe.prototype._setPart = function(part, material, color) {
    var value = this.parts[part] || {};
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    this.trigger("pre_part", part, value);
    this.trigger("part", part, value);
    this.trigger("post_part", part, value);
};

ripe.Ripe.prototype._setParts = function(update) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this._setPart(part[0], part[1], part[2]);
    }
};

ripe.Ripe.prototype._partsList = function(parts) {
    parts = parts || this.parts;
    var partsList = [];
    for (var part in parts) {
        var value = parts[part];
        partsList.push([part, value.material, value.color]);
    }
    return partsList;
};

// eslint-disable-next-line no-unused-vars
var Ripe = ripe.Ripe;

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.createElement = function(tagName, className) {
    var element = tagName && document.createElement(tagName);
    element.className = className || "";
    return element;
};

ripe.animateProperty = function(element, property, initial, final, duration, callback) {
    // sets the initial value for the property
    element.style[property] = initial;
    var last = new Date();

    var frame = function() {
        // checks how much time has passed since the last animation frame
        var current = new Date();
        var timeDelta = current - last;
        var animationDelta = (timeDelta * (final - initial)) / duration;

        // adjusts the value by the correspondent amount
        // making sure it doens't surpass the final value
        var value = parseFloat(element.style[property]);
        value += animationDelta;
        value = final > initial ? Math.min(value, final) : Math.max(value, final);
        element.style[property] = value;
        last = current;

        // checks if the animation has finished and if it is then
        // fires the callback if it's set. Otherwise, requests a
        // new animation frame to proceed with the animation
        var incrementAnimation = final > initial && value < final;
        var decrementAnimation = final < initial && value > final;
        if (incrementAnimation || decrementAnimation) {
            // sets the id of the animation frame on the element
            // so that it can be canceled if necessary
            var id = requestAnimationFrame(frame);
            element.dataset.animation_id = id;
        } else {
            callback && callback();
        }
    };

    // starts the animation process by runnig the initial
    // call to the frame animation function
    frame();
};

ripe.getFrameKey = function(view, position, token) {
    token = token || "-";
    return view + token + position;
};

ripe.parseFrameKey = function(frame, token) {
    token = token || "-";
    return frame.split(token);
};

ripe.frameNameHack = function(frame) {
    if (!frame) {
        return "";
    }
    var _frame = ripe.parseFrameKey(frame);
    var view = _frame[0];
    var position = _frame[1];
    position = view === "side" ? position : view;
    return position;
};

ripe.fixEvent = function(event) {
    if (event.hasOwnProperty("offsetX") && event.offsetX !== undefined) {
        return event;
    }

    var _target = event.target || event.srcElement;
    var rect = _target.getBoundingClientRect();
    event.offsetX = event.clientX - rect.left;
    event.offsetY = event.clientY - rect.top;
    return event;
};

ripe.clone = function(object) {
    if (object === undefined) {
        return object;
    }
    var objectS = JSON.stringify(object);
    return JSON.parse(objectS);
};

ripe.equal = function(first, second) {
    if (first === second) {
        return true;
    }
    var firstS = JSON.stringify(first);
    var secondS = JSON.stringify(second);
    return firstS === secondS;
};

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var compat = require("./compat");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
    // eslint-disable-next-line no-redeclare
    var XMLHttpRequest = compat.XMLHttpRequest;
}

ripe.RipeAPI = function(options) {
    return new ripe.Ripe(null, null, options);
};

ripe.Ripe.prototype.signin = function(username, password, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var url = this.url + "signin";
    options.method = "POST";
    options.params = {
        username: username,
        password: password
    };
    return this._cacheURL(url, options, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getOrders = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var query = "sid=" + this.sid;
    var url = this.url + "orders?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getOrder = function(number, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var query = "sid=" + this.sid;
    var url = this.url + "orders/" + String(number) + "?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getConfig = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var configURL = this._getConfigURL();
    return this._cacheURL(configURL, callback);
};

ripe.Ripe.prototype.getPrice = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var priceURL = this._getPriceURL();
    return this._cacheURL(priceURL, callback);
};

ripe.Ripe.prototype.getDefaults = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var defaultsURL = this._getDefaultsURL();
    return this._cacheURL(defaultsURL, function(result) {
        callback(result ? result.parts : null);
    });
};

ripe.Ripe.prototype.getOptionals = function(options, callback) {
    return this.getDefaults(options, function(defaults) {
        var optionals = [];
        for (var name in defaults) {
            var part = defaults[name];
            part.optional && optionals.push(name);
        }
        callback(optionals);
    });
};

ripe.Ripe.prototype.getCombinations = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var combinationsURL = this._getCombinationsURL();
    return this._cacheURL(combinationsURL, function(result) {
        callback && callback(result.combinations);
    });
};

ripe.Ripe.prototype.sizeToNative = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var url = this.url + "sizes/size_to_native?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.getSizes = function(callback) {
    var url = this.url + "sizes";
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.sizeToNativeB = function(scales, values, genders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    var query = "";
    var scale = null;
    var value = null;
    var gender = null;

    for (var index = 0; index < scales.length; index++) {
        scale = scales[index];
        value = values[index];
        gender = genders[index];
        var prefix = index === 0 ? "" : "&";
        query += prefix + "scales=" + scale + "&values=" + value + "&genders=" + gender;
    }

    var url = this.url + "sizes/size_to_native_b?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSize = function(scale, value, gender, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var url = this.url + "sizes/native_to_size?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSizeB = function(scales, values, genders, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    var query = "";
    var scale = null;
    var value = null;
    var gender = null;

    for (var index = 0; index < scales.length; index++) {
        scale = scales[index];
        value = values[index];
        gender = genders[index];
        var prefix = index === 0 ? "" : "&";
        query += prefix + "scales=" + scale + "&values=" + value + "&genders=" + gender;
    }

    var url = this.url + "sizes/native_to_size_b?" + query;
    return this._cacheURL(url, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype._cacheURL = function(url, options, callback) {
    // runs the defaulting operatin on the provided options
    // optional parameter (ensures valid object there)
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    // builds the (base) key value fro the provided value
    // from options or used the default one
    var key = options.key || "default";

    // creates the full key by adding the base key to the
    // URL value (including query string), this is unique
    // assuming no request payload
    var fullKey = key + ":" + url;

    // initializes the cache object in the current instance
    // in case it does not exists already
    this._cache = this._cache === undefined ? {} : this._cache;

    // in case there's already a valid value in cache,
    // retrieves it and calls the callback with the value
    if (this._cache[fullKey] !== undefined && !options.force) {
        callback && callback(this._cache[fullKey]);
        return null;
    }

    // otherwise runs the "normal" request URL call and
    // sets the result cache key on return
    return this._requestURL(
        url,
        options,
        function(result, isValid, request) {
            if (isValid) {
                this._cache[fullKey] = result;
            }
            callback && callback(result, isValid, request);
        }.bind(this)
    );
};

ripe.Ripe.prototype._requestURL = function(url, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;

    var context = this;
    var method = options.method || "GET";
    var params = options.params || {};
    var headers = options.headers || {};
    var data = options.data || null;
    var contentType = options.contentType || null;

    var query = this._buildQuery(params);
    var isEmpty = ["GET", "DELETE"].indexOf(method) !== -1;
    var hasQuery = url.indexOf("?") !== -1;
    var separator = hasQuery ? "&" : "?";

    if (isEmpty || data) {
        url += separator + query;
    } else {
        data = query;
        contentType = "application/x-www-form-urlencoded";
    }

    var request = new XMLHttpRequest();

    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback && callback.call(context, isValid ? result : null, isValid, this);
    });

    request.open(method, url);
    for (var key in headers) {
        var value = headers[key];
        request.setRequestHeader(key, value);
    }
    if (contentType) {
        request.setRequestHeader("Content-Type", contentType);
    }
    if (data) {
        request.send(data);
    } else {
        request.send();
    }
    return request;
};

ripe.Ripe.prototype._getQuery = function(options) {
    options = options || {};

    var buffer = [];
    var brand = options.brand === undefined ? this.brand : options.brand;
    var model = options.model === undefined ? this.model : options.model;
    var variant = options.variant === undefined ? this.variant : options.variant;
    var frame = options.frame === undefined ? this.frame : options.frame;
    var parts = options.parts === undefined ? this.parts : options.parts;
    var engraving = options.engraving === undefined ? this.engraving : options.engraving;
    var country = options.country === undefined ? this.country : options.country;
    var currency = options.currency === undefined ? this.currency : options.currency;

    brand && buffer.push("brand=" + brand);
    model && buffer.push("model=" + model);
    variant && buffer.push("variant=" + variant);
    frame && buffer.push("frame=" + frame);

    for (var part in parts) {
        var value = parts[part];
        var material = value.material;
        var color = value.color;
        if (!material) {
            continue;
        }
        if (!color) {
            continue;
        }
        buffer.push("p=" + part + ":" + material + ":" + color);
    }

    engraving && buffer.push("engraving=" + engraving);
    country && buffer.push("country=" + country);
    currency && buffer.push("currency=" + currency);

    return buffer.join("&");
};

ripe.Ripe.prototype._getConfigURL = function(brand, model, variant) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var url = this.url + "brands/" + brand + "/models/" + model + "/config";
    if (variant) {
        url += "?variant=" + variant;
    }
    return url;
};

ripe.Ripe.prototype._getPriceURL = function(options) {
    var query = this._getQuery(options);
    return this.url + "config/price" + "?" + query;
};

ripe.Ripe.prototype._getDefaultsURL = function(brand, model, variant) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var url = this.url + "brands/" + brand + "/models/" + model + "/defaults";
    url += variant ? "?variant=" + variant : "";
    return url;
};

ripe.Ripe.prototype._getCombinationsURL = function(brand, model, variant, useName) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var useNameS = useName ? "1" : "0";
    var query = "use_name=" + useNameS;
    query += variant ? "&variant=" + variant : "";
    return this.url + "brands/" + brand + "/models/" + model + "/combinations" + "?" + query;
};

ripe.Ripe.prototype._getImageURL = function(options) {
    // ensures that some of the extra query options are not
    // sent unless they are explictly defined (exception)
    options = options || {};
    options.country = options.country || null;
    options.currency = options.currency || null;

    var query = this._getQuery(options);

    query += options.format ? "&format=" + options.format : "";
    query += options.width ? "&width=" + options.width : "";
    query += options.height ? "&height=" + options.height : "";
    query += options.size ? "&size=" + options.size : "";
    query += options.background ? "&background=" + options.background : "";
    query += options.crop ? "&crop=" + (options.crop ? 1 : 0) : "";
    query += options.profile ? "&initials_profile=" + options.profile.join(",") : "";

    var initials = options.initials === "" ? "$empty" : options.initials;
    query += initials ? "&initials=" + encodeURIComponent(initials) : "";

    return this.url + "compose?" + query;
};

ripe.Ripe.prototype._getMaskURL = function(options) {
    options = options || {};
    options.parts = options.parts || {};
    options.country = options.country || null;
    options.currency = options.currency || null;

    var query = this._getQuery(options);

    if (options.part) {
        query += "&part=" + options.part;
    }

    return this.url + "mask?" + query;
};

ripe.Ripe.prototype._buildQuery = function(params) {
    var key;
    var value;
    var buffer = [];

    if (Array.isArray(params)) {
        for (var index = 0; index < params.length; index++) {
            var tuple = params[index];
            key = tuple[0];
            value = tuple.length > 1 ? tuple[1] : "";
            buffer.push(key + "=" + value);
        }
    } else {
        for (key in params) {
            value = params[key];
            buffer.push(key + "=" + value);
        }
    }

    return buffer.join("&");
};

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins = ripe.Ripe.plugins || {};

ripe.Ripe.plugins.Plugin = function() {
    ripe.Observable.call(this);
};

ripe.assign(ripe.Ripe.plugins.Plugin.prototype, ripe.Observable.prototype);

ripe.Ripe.plugins.Plugin.prototype.register = function(owner) {
    this.owner = owner;
    ripe.Observable.prototype.init.call(this);
};

ripe.Ripe.plugins.Plugin.prototype.unregister = function(owner) {
    this.owner = null;
    ripe.Observable.prototype.deinit.call(this);
};

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins.RestrictionsPlugin = function(restrictions, options) {
    ripe.Ripe.plugins.Plugin.call(this);
    options = options || {};
    this.token = options.token || ":";
    this.restrictions = restrictions;
    this.restrictionsMap = this._buildRestrictionsMap(restrictions);
    this.partCallback = this._applyRestrictions.bind(this);
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype = Object.create(ripe.Ripe.plugins.Plugin.prototype);

ripe.Ripe.plugins.RestrictionsPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    this.owner.getConfig(
        {},
        function(config) {
            this.partsOptions = config.parts;
            var optionals = [];
            for (var name in config.defaults) {
                var part = config.defaults[name];
                part.optional && optionals.push(name);
            }
            this.optionals = optionals;

            // binds to the pre parts event so that the parts can be
            // changed so that they comply with the product's restrictions
            this.owner.bind("part", this.partCallback);

            // resets the current selection to trigger
            // the restrictions operation
            var initialParts = ripe.clone(this.owner.parts);
            this.owner.setParts(initialParts);
        }.bind(this)
    );

    this.owner.bind(
        "config",
        function() {
            this.owner && this.unregister(this.owner);
        }.bind(this)
    );
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype.unregister = function(owner) {
    this.partsOptions = null;
    this.options = null;
    this.owner.unbind("part", this.partCallback);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._applyRestrictions = function(name, value) {
    // creates an array with the customization, by copying the
    // current parts environment into a separate array
    var customization = [];
    var partsOptions = ripe.clone(this.partsOptions);
    for (var partName in this.owner.parts) {
        if (name !== undefined && name === partName) {
            continue;
        }
        var part = this.owner.parts[partName];
        customization.push({
            name: partName,
            material: part.material,
            color: part.color
        });
    }

    // if a new part is set it is added at the end so that it
    // has higher priority when solving the restrictions
    var partSet =
        name !== undefined
            ? {
                  name: name,
                  material: value.material,
                  color: value.color
              }
            : null;
    name !== undefined && customization.push(partSet);

    // obtains the new parts and mutates the original
    // parts map to apply the necessary changes
    var newParts = this._solveRestrictions(partsOptions, this.restrictionsMap, customization);

    var changes = [];

    for (var index = 0; index < newParts.length; index++) {
        var newPart = newParts[index];
        var oldPart = this.owner.parts[newPart.name];

        // if a change was made due to the restrictions
        // then adds it to the changes array
        if (oldPart.material !== newPart.material || oldPart.color !== newPart.color) {
            changes.push({
                from: {
                    part: newPart.name,
                    material: oldPart.material,
                    color: oldPart.color
                },
                to: {
                    part: newPart.name,
                    material: newPart.material,
                    color: newPart.color
                }
            });
        }

        oldPart.material = newPart.material;
        oldPart.color = newPart.color;
    }

    // triggers the restrictions event with the set of changes in the
    // domain and the possible part set that triggered those changes
    this.trigger("restrictions", changes, partSet);
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._solveRestrictions = function(
    availableParts,
    restrictions,
    customization,
    solution
) {
    // if all the parts are set then a solution has been found
    // and it is returned
    solution = solution || [];
    if (customization.length === 0 && this._isComplete(solution)) {
        return solution;
    }

    // retrieves a part from the customization and checks if it is
    // being restricted by any of the validated parts, if there is
    // no restriction then adds the part to the solution array and
    // proceeds to the next part
    var newPart = customization.pop();
    if (this._isRestricted(newPart, restrictions, solution) === false) {
        solution.push(newPart);
        return this._solveRestrictions(availableParts, restrictions, customization, solution);
    }

    // if the part is restricted then tries to retrieve an alternative option,
    // if an alternative is found then adds it to the customization and proceeds
    // with it, otherwise an invalid state was reached and an empty solution
    // is returned, meaning that there is no option for the current customization
    // that would comply with the restrictions
    var newPartOption = this._alternativeFor(newPart, availableParts, true);
    if (newPartOption === null) {
        return [];
    }
    customization.push(newPartOption);
    return this._solveRestrictions(availableParts, restrictions, customization, solution);
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._getRestrictionKey = function(
    part,
    material,
    color,
    token
) {
    token = token || this.token;
    part = part || "";
    material = material || "";
    color = color || "";
    return part + token + material + token + color;
};

/**
 * Maps the restrictions array into a dictionary where restrictions
 * are associated by key with eachother for easier use.
 * For example, '[[{ material: "nappa"}, { material: "suede"}]]'
 * turns into '{ "nappa": ["suede"], "suede": ["nappa"] }'.
 *
 * @param {Array} restrictions The array of restrictions defined by an
 * object of incompatible materials/colors.
 * @return {Object} A map that associates the restricted keys with the
 * array of associated restrictions.
 */
ripe.Ripe.plugins.RestrictionsPlugin.prototype._buildRestrictionsMap = function(restrictions) {
    var restrictionsMap = {};

    // iterates over the complete set of restrictions in the restrictions
    // list to process them and populate the restrictions map with a single
    // key to "restricted keys" association
    for (var index = 0; index < restrictions.length; index++) {
        // in case the restriction is considered to be a single one
        // then this is a special (all cases excluded one) and must
        // be treated as such (true value set in the map value)
        var restriction = restrictions[index];
        if (restriction.length === 1) {
            var _restriction = restriction[0];
            var key = this._getRestrictionKey(
                _restriction.part,
                _restriction.material,
                _restriction.color
            );
            restrictionsMap[key] = true;
            continue;
        }

        // iterates over all the items in the restriction to correctly
        // populate the restrictions map with the restrictive values
        for (var _index = 0; _index < restriction.length; _index++) {
            var item = restriction[_index];

            var material = item.material;
            var color = item.color;
            var materialColorKey = this._getRestrictionKey(null, material, color);

            for (var __index = 0; __index < restriction.length; __index++) {
                var _item = restriction[__index];
                var _material = _item.material;
                var _color = _item.color;
                var _key = this._getRestrictionKey(null, _material, _color);

                if (_key === materialColorKey) {
                    continue;
                }

                var sequence = restrictionsMap[materialColorKey] || [];
                sequence.push(_key);
                restrictionsMap[materialColorKey] = sequence;
            }
        }
    }

    return restrictionsMap;
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._isRestricted = function(
    newPart,
    restrictions,
    parts
) {
    var name = newPart.name;
    var material = newPart.material;
    var color = newPart.color;
    var partKey = this._getRestrictionKey(name);
    var materialKey = this._getRestrictionKey(null, material, null);
    var colorKey = this._getRestrictionKey(null, null, color);
    var materialColorKey = this._getRestrictionKey(null, material, color);
    var materialRestrictions = restrictions[materialKey];
    var colorRestrictions = restrictions[colorKey];
    var keyRestrictions = restrictions[materialColorKey] || [];
    var restricted = restrictions[partKey] !== undefined;
    restricted |= materialRestrictions === true;
    restricted |= colorRestrictions === true;
    restricted |= keyRestrictions === true;
    if (restricted) {
        return true;
    }

    keyRestrictions =
        materialRestrictions instanceof Array
            ? keyRestrictions.concat(materialRestrictions)
            : keyRestrictions;
    keyRestrictions =
        colorRestrictions instanceof Array
            ? keyRestrictions.concat(colorRestrictions)
            : keyRestrictions;

    for (var index = 0; index < keyRestrictions.length; index++) {
        var restriction = keyRestrictions[index];
        for (var _index = 0; _index < parts.length; _index++) {
            var part = parts[_index];
            if (part.name === name) {
                continue;
            }

            var restrictionKeys = [
                this._getRestrictionKey(null, part.material),
                this._getRestrictionKey(null, null, part.color),
                this._getRestrictionKey(null, part.material, part.color)
            ];
            if (restrictionKeys.indexOf(restriction) !== -1) {
                return true;
            }
        }
    }

    return false;
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._isComplete = function(parts) {
    // iterates through the parts array and creates
    // an array with the names of the parts for
    // easier searching
    var part = null;
    var partsS = [];
    for (var index = 0; index < parts.length; index++) {
        part = parts[index];
        partsS.push(part.name);
    }

    // iterates through the part options and checks
    // if all of them are set
    for (index = 0; index < this.partsOptions.length; index++) {
        part = this.partsOptions[index];
        if (partsS.indexOf(part.name) === -1) {
            return false;
        }
    }

    return true;
};

ripe.Ripe.plugins.RestrictionsPlugin.prototype._alternativeFor = function(
    newPart,
    availableParts,
    pop
) {
    pop = pop || false;
    var part = null;
    var color = null;
    var colors = null;
    var materialsIndex = null;

    // finds the index of the part to use it as the starting
    // point of the search for an alternative
    for (var index = 0; index < availableParts.length; index++) {
        var _part = availableParts[index];
        if (_part.name !== newPart.name) {
            continue;
        }
        part = _part;
        var materials = part.materials;
        for (var _index = 0; _index < materials.length; _index++) {
            var material = materials[_index];
            if (material.name !== newPart.material) {
                continue;
            }

            materialsIndex = _index;
            colors = material.colors;
            break;
        }
        break;
    }

    // tries to retrieve an alternative option, giving
    // priority to the colors of its material
    var indexM = null;
    while (indexM !== materialsIndex) {
        indexM = indexM === null ? materialsIndex : indexM;

        material = part.materials[indexM];
        colors = material.colors;
        for (index = 0; index < colors.length; index++) {
            color = colors[index];
            if (indexM === materialsIndex && color === newPart.color) {
                continue;
            }

            // if pop is set to true then removes the alternative
            // from the available parts list so that it is not
            // used again to avoid infinite loops
            if (pop) {
                colors.splice(index, 1);
            }
            var alternative = {
                name: newPart.name,
                material: material.name,
                color: color
            };
            return alternative;
        }
        indexM = (indexM + 1) % part.materials.length;
    }

    // if no alternative is found and this part is
    // optional then the part is removed
    if (this.optionals.indexOf(newPart.name) !== -1) {
        return {
            name: newPart.name,
            material: null,
            color: null
        };
    }

    return null;
};

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Ripe.plugins.SyncPlugin = function(rules, options) {
    options = options || {};
    this.rules = this._normalizeRules(rules);
    this.partCallback = this._applySync.bind(this);
};

ripe.Ripe.plugins.SyncPlugin.prototype = Object.create(ripe.Ripe.plugins.Plugin.prototype);

ripe.Ripe.plugins.SyncPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    // binds to the part event to change the necessary parts
    // so that they comply with the product's sync rules
    this.owner.bind("part", this.partCallback);

    // resets the current selection to trigger the sync operation
    var initialParts = ripe.clone(this.owner.parts);
    this.owner.setParts(initialParts);

    this.owner.bind(
        "config",
        function() {
            this.owner && this.unregister(this.owner);
        }.bind(this)
    );
};

ripe.Ripe.plugins.SyncPlugin.prototype.unregister = function(owner) {
    this.owner.unbind("part", this.partCallback);

    ripe.Ripe.plugins.Plugin.prototype.unregister.call(this, owner);
};

/**
 * Traverses the provided rules and transforms string rules
 * into object rules to keep the internal representation
 * of the rules consistent.
 *
 * @param {Array} rules The rules that will be normalized
 * into object rules.
 */
ripe.Ripe.plugins.SyncPlugin.prototype._normalizeRules = function(rules) {
    var _rules = {};
    for (var ruleName in rules) {
        var rule = rules[ruleName];
        for (var index = 0; index < rule.length; index++) {
            var part = rule[index];
            if (typeof part === "string") {
                part = {
                    part: part
                };
                rule[index] = part;
            }
        }
        _rules[ruleName] = rule;
    }
    return _rules;
};

ripe.Ripe.plugins.SyncPlugin.prototype._applySync = function(name, value) {
    for (var key in this.rules) {
        // if a part was selected and it is part of
        // the rule then its value is used otherwise
        // the first part of the rule is used
        var rule = this.rules[key];
        var firstPart = rule[0];
        name = name || firstPart.part;
        value = value || this.owner.parts[name];

        // checks if the part triggers the sync rule
        // and skips to the next rule if it doesn't
        if (this._shouldSync(rule, name, value) === false) {
            continue;
        }

        // iterates through the parts of the rule and
        // sets their material and color according to
        // the sync rule
        for (var index = 0; index < rule.length; index++) {
            var _part = rule[index];
            if (_part.part === name) {
                continue;
            }
            if (_part.color === undefined) {
                this.owner.parts[_part.part].material = _part.material
                    ? _part.material
                    : value.material;
            }
            this.owner.parts[_part.part].color = _part.color ? _part.color : value.color;
        }
    }
};

/**
 * Checks if the sync rule contains the provided part
 * meaning that the other parts of the rule have to
 * be changed accordingly.
 *
 * @param {Object} rule The sync rule that will be checked.
 * @param {String} name The name of the part that may be
 * affected by the rule.
 * @param {Object} value The material and color of the part.
 */
ripe.Ripe.plugins.SyncPlugin.prototype._shouldSync = function(rule, name, value) {
    for (var index = 0; index < rule.length; index++) {
        var rulePart = rule[index];
        var part = rulePart.part;
        var material = rulePart.material;
        var color = rulePart.color;
        var materialSync = !material || material === value.material;
        var colorSync = !color || color === value.color;
        if (part === name && materialSync && colorSync) {
            return true;
        }
    }
    return false;
};

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.Visual = function(owner, element, options) {
    this.element = element;
    this.elementEvents = {};

    ripe.Observable.call(this);
    ripe.Interactable.call(this, owner, options);
};

ripe.assign(ripe.Visual.prototype, ripe.Observable.prototype);
ripe.assign(ripe.Visual.prototype, ripe.Interactable.prototype);
ripe.Visual.constructor = ripe.Visual;

ripe.Visual.prototype.init = function() {
    ripe.Observable.prototype.init.call(this);
    ripe.Interactable.prototype.init.call(this);
};

ripe.Visual.prototype.deinit = function() {
    this._removeElementHandlers();
    this.element = null;
    this.elementEvents = null;

    ripe.Observable.prototype.deinit.call(this);
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

    var callbacks = this.elementEvents[event] || [];
    callbacks.push(callback);
    this.elementEvents[event] = callbacks;
};

/**
 * Unbinds all the events from the DOM element.
 */
ripe.Visual.prototype._removeElementHandlers = function() {
    for (var event in this.elementEvents) {
        var callbacks = this.elementEvents[event];
        for (var index = 0; index < callbacks.length; index++) {
            var callback = callbacks[index];
            this.element.removeEventListener(event, callback);
        }
    }

    this.elementEvents = {};
};

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Class that defines an interactive configurator instace to be
 * used in connection with the main Ripe owner to provide an
 * interactive configuration experience inside a DOM.
 *
 * @constructor
 * @param {Object} owner The owner (customizer instance) for
 * this configurator.
 * @param {Object} element The DOM element that is considered to
 * be the target for the configurator, it's going to have its own
 * inner HTML changed.
 * @param {Object} options The options to be used to configure the
 * configurator instance to be created.
 */
ripe.Configurator = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
};

ripe.Configurator.prototype = Object.create(ripe.Visual.prototype);

ripe.Configurator.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    this.width = this.options.width || 1000;
    this.height = this.options.height || 1000;
    this.size = this.options.size || null;
    this.maxSize = this.options.maxSize || 1000;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.interval = this.options.interval || 0;
    this.maskOpacity = this.options.maskOpacity || 0.4;
    this.maskDuration = this.options.maskDuration || 150;
    this.noMasks = this.options.noMasks === undefined ? true : this.options.noMasks;
    this.useMasks = this.options.useMasks === undefined ? !this.noMasks : this.options.useMasks;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;
    this.ready = false;
    this._observer = null;

    this.owner.bind("parts", function(parts) {
        this.parts = parts;
    });

    this.owner.bind(
        "selected_part",
        function(part) {
            this.highlight(part);
        }.bind(this)
    );

    this.owner.bind(
        "deselected_part",
        function(part) {
            this.lowlight();
        }.bind(this)
    );

    // creates a structure the store the last presented
    // position of each view, to be used when returning
    // to a view for better user experience
    this._lastFrame = {};

    // ues the owner to retrieve the complete set of frames
    // that are available for the current model and runs
    // the intial layout update operation on result
    this.owner.getFrames(
        function(frames) {
            this.frames = frames;
            this._initLayout();
            this._initPartsList();
            this.ready = true;
            this.trigger("ready");
            this.update();
        }.bind(this)
    );

    this.owner.bind(
        "config",
        function() {
            this._updateConfig();
        }.bind(this)
    );
};

ripe.Configurator.prototype.resize = function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.clientWidth;
    if (this.currentSize === size) {
        return;
    }

    var area = this.element.querySelector(".area");
    var frontMask = this.element.querySelector(".front-mask");
    var back = this.element.querySelector(".back");
    var mask = this.element.querySelector(".mask");
    area.width = size;
    area.height = size;
    frontMask.width = size;
    frontMask.height = size;
    frontMask.style.width = size + "px";
    frontMask.style.marginLeft = "-" + String(size) + "px";
    back.width = size;
    back.height = size;
    back.style.marginLeft = "-" + String(size) + "px";
    mask.width = size;
    mask.height = size;
    this.currentSize = size;
    this.update(
        {},
        {
            force: true
        }
    );
};

ripe.Configurator.prototype.update = function(state, options) {
    options = options || {};

    if (this.ready === false) {
        return;
    }

    var view = this.element.dataset.view;
    var position = this.element.dataset.position;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    var animate = options.animate || false;
    var force = options.force || false;
    var duration = options.duration;
    var callback = options.callback;
    var preload = options.preload;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    var previous = this.signature || "";
    var signature =
        this.owner._getQuery() + "&width=" + String(width) + "&height=" + String(height);
    var changed = signature !== previous;
    animate = animate || (changed && "simple");
    this.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    previous = this.unique;
    var unique = signature + "&view=" + String(view) + "&position=" + String(position);
    if (previous === unique && !force) {
        callback && callback();
        return false;
    }
    this.unique = unique;

    // runs the load operation for the current frame, taking into
    // account the multiple requirements for such execution
    this._loadFrame(
        view,
        position,
        {
            draw: true,
            animate: animate,
            duration: duration
        },
        callback
    );

    // runs the pre-loading process so that the remaining frames are
    // loaded for a smother experience when dragging the element,
    // note that this is only performed in case this is not a single
    // based update (not just the loading of the current position)
    // and the current signature has changed
    var preloaded = this.element.classList.contains("preload");
    var mustPreload = preload !== undefined ? preload : changed || !preloaded;
    mustPreload && this._preload(this.options.useChain);
};

ripe.Configurator.prototype.deinit = function() {
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    this._removeElementHandlers();
    this._observer && this._observer.disconnect();
    this._observer = null;

    ripe.Visual.prototype.deinit.call(this);
};

ripe.Configurator.prototype.changeFrame = function(frame, options) {
    var _frame = ripe.parseFrameKey(frame);
    var nextView = _frame[0];
    var nextPosition = parseInt(_frame[1]);

    options = options || {};
    var duration = options.duration || this.duration;
    var type = options.type;
    var preventDrag = options.preventDrag === undefined ? true : options.preventDrag;

    var view = this.element.dataset.view;
    var position = parseInt(this.element.dataset.position);

    var viewFrames = this.frames[nextView];
    if (!viewFrames || nextPosition >= viewFrames) {
        throw new RangeError("Frame " + frame + " is not supported.");
    }

    // removes any part highlight in case it is set
    // to replicate the behaviour of dragging the product
    this.lowlight();

    // saves the position of the current view
    // so that it returns to the same position
    // when coming back to the same view
    this._lastFrame[view] = position;
    this.element.dataset.position = nextPosition;

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    var animate = false;
    if (view !== nextView && viewFrames !== undefined) {
        this.element.dataset.view = nextView;
        animate = "cross";
    }

    // if an animation duration was provided then changes
    // to the next step instead of the target frame
    var stepDuration = 0;
    if (duration) {
        animate = type || animate;

        // calculates the number of steps of
        // the animation and the step duration
        var stepCount = view !== nextView ? 1 : nextPosition - position;
        stepDuration = duration / Math.abs(stepCount);
        options.duration = duration - stepDuration;

        // determines the next step and sets it
        // as the position
        var stepPosition = stepCount !== 0 ? position + stepCount / stepCount : position;
        stepPosition = stepPosition % viewFrames;
        this.element.dataset.position = stepPosition;
    }

    // determines if the current change frame operation
    // is an animated one or if it's a discrete one
    var animated = Boolean(duration);

    // if the frame change is animated and preventDrag is true
    // then ignores drag movements until the animation is finished
    preventDrag = preventDrag && (animate || duration);
    preventDrag && this.element.classList.add("no-drag", "animating");

    var newFrame = ripe.getFrameKey(this.element.dataset.view, this.element.dataset.position);
    this.trigger("changed_frame", newFrame);
    this.update(
        {},
        {
            animate: animate,
            duration: stepDuration,
            callback: function() {
                // if there is no step transition or the transition
                // has finished, then allows drag movements again,
                // otherwise waits the provided interval and
                // proceeds to the next step
                if (!animated || stepPosition === nextPosition) {
                    preventDrag && this.element.classList.remove("no-drag", "animating");
                } else {
                    var timeout = animate ? 0 : stepDuration;
                    setTimeout(
                        function() {
                            this.changeFrame(frame, options);
                        }.bind(this),
                        timeout
                    );
                }
            }.bind(this)
        }
    );
};

ripe.Configurator.prototype.highlight = function(part, options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // captures the current context to be used by clojure callbacks
    var self = this;

    // runs the default operation for the parameters that this
    // function receives
    options = options || {};

    // determines the current position of the configurator so that
    // the proper mask URL may be created and properly loaded
    var view = this.element.dataset.view;
    var position = this.element.dataset.position;
    var frame = ripe.getFrameKey(view, position);
    var backgroundColor = options.backgroundColor || this.backgroundColor;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;
    var maskOpacity = this.element.dataset.mask_opacity || this.maskOpacity;
    var maskDuration = this.element.dataset.mask_duration || this.maskDuration;

    // adds the highlight class to the current target configurator meaning
    // that the front mask is currently active and showing info
    this.element.classList.add("highlight");

    // constructs the full URL of the mask image that is going to be
    // set for the current highlight operation (to be determined)
    var url = this.owner._getMaskURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        color: backgroundColor,
        part: part
    });

    var frontMask = this.element.querySelector(".front-mask");
    var src = frontMask.getAttribute("src");
    if (src === url) {
        return;
    }
    var frontMaskLoad = function() {
        this.classList.add("loaded");
        this.classList.add("highlight");
        self.trigger("highlighted_part", part);
    };
    frontMask.removeEventListener("load", frontMaskLoad);
    frontMask.addEventListener("load", frontMaskLoad);
    frontMask.addEventListener("error", function() {
        this.setAttribute("src", "");
    });
    frontMask.setAttribute("src", url);

    var animationId = frontMask.dataset.animation_id;
    cancelAnimationFrame(animationId);
    ripe.animateProperty(frontMask, "opacity", 0, maskOpacity, maskDuration);
};

ripe.Configurator.prototype.lowlight = function(options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // retrieves the reference to the current front mask and removes
    // the highlight associated classes from it and the configurator
    var frontMask = this.element.querySelector(".front-mask");
    frontMask.classList.remove("highlight");
    this.element.classList.remove("highlight");
};

ripe.Configurator.prototype.enterFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    var maxSize = this.element.dataset.max_size || this.maxSize;
    this.resize(maxSize);
};

ripe.Configurator.prototype.leaveFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    this.resize();
};

/**
 * Initializes the layout for the configurator element by
 * constructing all te child elements required for the proper
 * configurator functionality to work.
 *
 * From a DOM prespective this is a synchronous operation,
 * meaning that after its execution the configurator is ready
 * to be manipulated.
 */
ripe.Configurator.prototype._initLayout = function() {
    // clears the elements children
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    // sets the element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    this.element.classList.add("configurator");

    // creates the area canvas and adds it to the element
    var area = ripe.createElement("canvas", "area");
    var context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    this.element.appendChild(area);

    // adds the front mask element to the element,
    // this will be used to highlight parts
    var frontMask = ripe.createElement("img", "front-mask");
    this.element.appendChild(frontMask);

    // creates the back canvas and adds it to the element,
    // placing it on top of the area canvas
    var back = ripe.createElement("canvas", "back");
    var backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    this.element.appendChild(back);

    // creates the mask element that will de used to display
    // the mask on top of an highlighted or selected part
    var mask = ripe.createElement("canvas", "mask");
    this.element.appendChild(mask);

    // adds the framesBuffer placeholder element that will be used to
    // temporarily store the images of the product's frames
    var framesBuffer = ripe.createElement("div", "frames-buffer");

    // creates a masksBuffer element that will be used to store the various
    // mask images to be used during highlight and select operation
    var masksBuffer = ripe.createElement("div", "masks-buffer");

    this.element.appendChild(framesBuffer);
    this.element.appendChild(masksBuffer);

    this._populateBuffers();

    // set the size of area, frontMask, back and mask
    this.resize();

    // sets the initial view and position
    this.element.dataset.view = this.view;
    this.element.dataset.position = this.position;

    // register for all the necessary DOM events
    this._registerHandlers();
};

ripe.Configurator.prototype._initPartsList = function() {
    // creates a set of sorted parts to be used on the
    // highlight operation (considers only the default ones)
    this.partsList = [];
    this.owner.getConfig(
        function(config) {
            var defaults = config.defaults || {};
            this.hiddenParts = config.hidden || [];
            this.partsList = Object.keys(defaults);
            this.partsList.sort();
        }.bind(this)
    );
};

ripe.Configurator.prototype._populateBuffers = function() {
    var framesBuffer = this.element.getElementsByClassName("frames-buffer");
    var masksBuffer = this.element.getElementsByClassName("masks-buffer");
    var index = null;
    var buffer = null;

    for (index = 0; index < framesBuffer.length; index++) {
        buffer = framesBuffer[index];
        this._populateBuffer(buffer);
    }

    for (index = 0; index < masksBuffer.length; index++) {
        buffer = masksBuffer[index];
        this._populateBuffer(buffer);
    }
};

ripe.Configurator.prototype._populateBuffer = function(buffer) {
    while (buffer.firstChild) {
        buffer.removeChild(buffer.firstChild);
    }

    // creates two image elements for each frame and
    // appends them to the frames and masks buffers
    for (var view in this.frames) {
        var viewFrames = this.frames[view];
        for (var index = 0; index < viewFrames; index++) {
            var frameBuffer = ripe.createElement("img");
            frameBuffer.dataset.frame = ripe.getFrameKey(view, index);
            buffer.appendChild(frameBuffer);
        }
    }
};

ripe.Configurator.prototype._updateConfig = function() {
    // sets ready to false to temporarily block
    // update requests while the new config
    // is being loaded
    this.ready = false;

    // updates the parts list for the new product
    this._initPartsList();

    // retrieves the new product frames and sets them
    this.owner.getFrames(
        function(frames) {
            this.frames = frames;

            // tries to keep the current view and position
            // if the new model supports it otherwise
            // changes to a supported frame
            var view = this.element.dataset.position;
            var position = this.element.dataset.position;
            var maxPosition = this.frames[view];
            if (!maxPosition) {
                view = Object.keys(this.frames)[0];
                position = 0;
            } else if (position >= maxPosition) {
                position = 0;
            }

            // checks the last viewed frames of each view
            // and deletes the ones not supported
            var lastFrameViews = Object.keys(this._lastFrame);
            for (view in lastFrameViews) {
                position = this._lastFrame[view];
                maxPosition = this.frames[view];
                if (!maxPosition || position >= maxPosition) {
                    delete this._lastFrame[view];
                }
            }

            // shows the new product with a crossfade effect
            // and starts responding to updates again
            this.ready = true;
            this.update(
                {},
                {
                    preload: true,
                    animate: "cross",
                    force: true
                }
            );
        }.bind(this)
    );
};

ripe.Configurator.prototype._loadFrame = function(view, position, options, callback) {
    // runs the defaulting operation on all of the parameters
    // sent to the load frame operation (defaulting)
    view = view || this.element.dataset.view || "side";
    position = position || this.element.dataset.position || 0;
    options = options || {};

    var frame = ripe.getFrameKey(view, position);

    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    var draw = options.draw === undefined || options.draw;
    var animate = options.animate;
    var duration = options.duration;
    var framesBuffer = this.element.querySelector(".frames-buffer");
    var masksBuffer = this.element.querySelector(".masks-buffer");
    var area = this.element.querySelector(".area");
    var image = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    var front = area.querySelector("img[data-frame='" + String(frame) + "']");
    var maskImage = masksBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    image = image || front;

    // in case there's no images for the frames that are meant
    // to be loaded calls the callback immediately and returns
    // the control flow (not possible to load them)
    if (image === null || maskImage === null) {
        throw new RangeError("Frame " + frame + " is not supported.");
    }

    // constructs the URL for the mask and updates it
    this._loadMask(maskImage, view, position, options);

    // builds the URL that will be set on the image
    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height
    });

    // creates a callback to be called when the frame
    // is drawn to trigger the callback passed to this
    // function if it's set
    var drawCallback = function() {
        callback && callback();
    };

    // verifies if the loading of the current image
    // is considered redundant (already loaded or
    // loading) and avoids for performance reasons
    var isRedundant = image.dataset.src === url;
    if (isRedundant) {
        if (!draw) {
            callback && callback();
            return;
        }
        var isReady = image.dataset.loaded === "true";
        isReady && this._drawFrame(image, animate, duration, drawCallback);
        return;
    }

    // adds load callback to the image to
    // draw the frame when it is available
    image.onload = function() {
        image.dataset.loaded = true;
        image.dataset.src = url;
        if (!draw) {
            callback && callback();
            return;
        }
        this._drawFrame(image, animate, duration, drawCallback);
    }.bind(this);

    // sets the src of the image to trigger the request
    // and sets loaded to false to indicate that the
    // image is not yet loading
    image.src = url;
    image.dataset.src = url;
    image.dataset.loaded = false;
};

ripe.Configurator.prototype._loadMask = function(maskImage, view, position, options) {
    // constructs the URL for the mask and then at the end of the
    // mask loading process runs the final update of the mask canvas
    // operation that will allow new highlight and selection operation
    // to be performed according to the new frame value
    var draw = options.draw === undefined || options.draw;
    var backgroundColor = options.backgroundColor || this.backgroundColor;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;
    var frame = ripe.getFrameKey(view, position);
    var url = this.owner._getMaskURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        color: backgroundColor
    });
    var self = this;
    if (draw && maskImage.dataset.src === url) {
        setTimeout(function() {
            self._drawMask(maskImage);
        }, 150);
    } else {
        maskImage.onload = draw
            ? function() {
                  setTimeout(function() {
                      self._drawMask(maskImage);
                  }, 150);
              }
            : null;
        maskImage.addEventListener("error", function() {
            this.removeAttribute("src");
        });
        maskImage.crossOrigin = "Anonymous";
        maskImage.dataset.src = url;
        maskImage.setAttribute("src", url);
    }
};

ripe.Configurator.prototype._drawMask = function(maskImage) {
    var mask = this.element.querySelector(".mask");
    var maskContext = mask.getContext("2d");
    maskContext.clearRect(0, 0, mask.width, mask.height);
    maskContext.drawImage(maskImage, 0, 0, mask.width, mask.height);
};

ripe.Configurator.prototype._drawFrame = function(image, animate, duration, callback) {
    var area = this.element.querySelector(".area");
    var back = this.element.querySelector(".back");

    var visible = area.dataset.visible === "true";
    var current = visible ? area : back;
    var target = visible ? back : area;
    var context = target.getContext("2d");
    context.clearRect(0, 0, target.clientWidth, target.clientHeight);
    context.drawImage(image, 0, 0, target.clientWidth, target.clientHeight);

    target.dataset.visible = true;
    current.dataset.visible = false;

    if (!animate) {
        current.style.zIndex = 1;
        current.style.opacity = 0;
        target.style.zIndex = 1;
        target.style.opacity = 1;
        callback && callback();
        return;
    }

    var currentId = current.dataset.animation_id;
    var targetId = target.dataset.animation_id;
    currentId && cancelAnimationFrame(parseInt(currentId));
    targetId && cancelAnimationFrame(parseInt(targetId));

    duration = duration || (animate === "immediate" ? 0 : 500);
    if (animate === "cross") {
        ripe.animateProperty(current, "opacity", 1, 0, duration);
    }

    ripe.animateProperty(target, "opacity", 0, 1, duration, function() {
        current.style.opacity = 0;
        current.style.zIndex = 1;
        target.style.zIndex = 1;
        callback && callback();
    });
};

ripe.Configurator.prototype._preload = function(useChain) {
    var position = this.element.dataset.position || 0;
    var index = this.index || 0;
    index++;
    this.index = index;
    this.element.classList.add("preload");

    // adds all the frames to the work pile
    var work = [];
    for (var view in this.frames) {
        var viewFrames = this.frames[view];
        for (var _index = 0; _index < viewFrames; _index++) {
            if (_index === position) {
                continue;
            }
            var frame = ripe.getFrameKey(view, _index);
            work.push(frame);
        }
    }
    work.reverse();

    var self = this;
    var mark = function(element) {
        var _index = self.index;
        if (index !== _index) {
            return;
        }

        // removes the preloading class from the image element
        // and retrieves all the images still preloading,
        element.classList.remove("preloading");
        var framesBuffer = self.element.querySelector(".frames-buffer");
        var pending = framesBuffer.querySelectorAll("img.preloading") || [];

        // if there are images preloading then adds the
        // preloading class to the target element and
        // prevents drag movements to avoid flickering
        // else and if there are no images preloading and no
        // frames yet to be preloaded then the preload
        // is considered finished so drag movements are
        // allowed again and the loaded event is triggered
        if (pending.length > 0) {
            self.element.classList.add("preloading");
            self.element.classList.add("no-drag");
        } else if (work.length === 0) {
            self.element.classList.remove("preloading");
            self.element.classList.remove("no-drag");
            self.trigger("loaded");
        }
    };

    var render = function() {
        var _index = self.index;
        if (index !== _index) {
            return;
        }
        if (work.length === 0) {
            return;
        }

        // retrieves the next frame to be loaded
        // and its corresponding image element
        // and adds the preloading class to it
        var frame = work.pop();
        var framesBuffer = self.element.querySelector(".frames-buffer");
        var reference = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
        reference.classList.add("preloading");

        // if a chain base loaded is used then
        // marks the current frame as pre-loaded
        // and proceeds to the next frame
        var callbackChain = function() {
            mark(reference);
            render();
        };

        // if all the images are pre-loaded at the
        // time then just marks the current one as
        // pre-loaded
        var callbackMark = function() {
            mark(reference);
        };

        // determines if a chain based loading should be used for the
        // pre-loading process of the various image resources to be loaded
        var _frame = ripe.parseFrameKey(frame);
        var view = _frame[0];
        var position = _frame[1];
        self._loadFrame(
            view,
            position,
            {
                draw: false
            },
            useChain ? callbackChain : callbackMark
        );
        !useChain && render();
    };

    // if there are frames to be loaded then adds the
    // preloading class, prevents drag movements and
    // starts the render process after a timeout
    work.length > 0 && this.element.classList.add("preloading");
    if (work.length > 0) {
        this.element.classList.add("no-drag");
        setTimeout(function() {
            render();
        }, 250);
    }
};

ripe.Configurator.prototype._registerHandlers = function() {
    // captures the current context to be used inside clojures
    var self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    var area = this.element.querySelector(".area");
    var back = this.element.querySelector(".back");

    // registes for the selected part event on the owner
    // so that we can highlight the associated part
    this.owner.bind(
        "selected_part",
        function(part) {
            this.highlight(part);
        }.bind(this)
    );

    // binds the mousedown event on the element to prepare
    // it for drag movements
    this._addElementHandler("mousedown", function(event) {
        var _element = this;
        _element.dataset.view = _element.dataset.view || "side";
        self.base = _element.dataset.position || 0;
        self.down = true;
        self.referenceX = event.pageX;
        self.referenceY = event.pageY;
        self.percent = 0;
        _element.classList.add("drag");
    });

    // listens for mouseup events and if it occurs then
    // stops reacting to mouse move events has drag movements
    this._addElementHandler("mouseup", function(event) {
        var _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    this._addElementHandler("mouseleave", function(event) {
        var _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    this._addElementHandler("mousemove", function(event) {
        if (this.classList.contains("no-drag")) {
            return;
        }
        var down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;
        down && self._parseDrag();
    });

    area.addEventListener("click", function(event) {
        var preloading = self.element.classList.contains("preloading");
        var animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        var index = self._getCanvasIndex(this, event.offsetX, event.offsetY);
        if (index === 0) {
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.owner.selectPart(part);
        event.stopPropagation();
    });

    area.addEventListener("mousemove", function(event) {
        var preloading = self.element.classList.contains("preloading");
        var animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        var index = self._getCanvasIndex(this, event.offsetX, event.offsetY);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || self.down === true) {
            self.lowlight();
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.highlight(part);
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    back.addEventListener("click", function(event) {
        var preloading = self.element.classList.contains("preloading");
        var animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        var index = self._getCanvasIndex(this, event.offsetX, event.offsetY);
        if (index === 0) {
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.owner.selectPart(part);
        event.stopPropagation();
    });

    back.addEventListener("mousemove", function(event) {
        var preloading = self.element.classList.contains("preloading");
        var animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        var index = self._getCanvasIndex(this, event.offsetX, event.offsetY);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || self.down === true) {
            self.lowlight();
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.highlight(part);
    });

    back.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    // listens for attribute changes to redraw the configurator
    // if needed, this makes use of the mutation observer
    // eslint-disable-next-line no-undef
    var Observer = MutationObserver || WebKitMutationObserver;
    this._observer = Observer
        ? new Observer(function(mutations) {
              for (var index = 0; index < mutations.length; index++) {
                  var mutation = mutations[index];
                  mutation.type === "style" && self.resize();
                  mutation.type === "attributes" && self.update();
              }
          })
        : null;
    this._observer &&
        this._observer.observe(this.element, {
            attributes: true,
            subtree: false,
            characterData: true
        });

    // adds handlers for the touch events so that they get
    // parsed to mouse events for the configurator element,
    // taking into account that there may be a touch handler
    // already defined
    ripe.touchHandler(this.element);
};

ripe.Configurator.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    var child = this.element.querySelector("*:first-child");
    var referenceX = this.referenceX;
    var referenceY = this.referenceY;
    var mousePosX = this.mousePosX;
    var mousePosY = this.mousePosY;
    var base = this.base;
    var deltaX = referenceX - mousePosX;
    var deltaY = referenceY - mousePosY;
    var elementWidth = this.element.clientWidth;
    var elementHeight = this.element.clientHeight || child.clientHeight;
    var percentX = deltaX / elementWidth;
    var percentY = deltaY / elementHeight;
    this.percent = percentX;
    var sensitivity = this.element.dataset.sensitivity || this.sensitivity;
    var verticalThreshold = this.element.dataset.verticalThreshold || this.verticalThreshold;

    // if the drag was vertical then alters the
    // view if it is supported by the product
    var view = this.element.dataset.view;
    var nextView = view;
    if (sensitivity * percentY > verticalThreshold) {
        nextView = view === "top" ? "side" : "bottom";
        this.referenceY = mousePosY;
    } else if (sensitivity * percentY < -verticalThreshold) {
        nextView = view === "bottom" ? "side" : "top";
        this.referenceY = mousePosY;
    }
    if (this.frames[nextView] === undefined) {
        nextView = view;
    }

    // retrieves the current view and its frames
    // and determines which one is the next frame
    var viewFrames = this.frames[nextView];
    var nextPosition = parseInt(base - sensitivity * percentX) % viewFrames;
    nextPosition = nextPosition >= 0 ? nextPosition : viewFrames + nextPosition;

    // if the view changes then uses the last
    // position presented in that view, if not
    // then shows the next position according
    // to the drag
    nextPosition = view === nextView ? nextPosition : this._lastFrame[nextView] || 0;

    var nextFrame = ripe.getFrameKey(nextView, nextPosition);
    this.changeFrame(nextFrame);
};

ripe.Configurator.prototype._getCanvasIndex = function(canvas, x, y) {
    var canvasRealWidth = canvas.getBoundingClientRect().width;
    var mask = this.element.querySelector(".mask");
    var ratio = mask.width && canvasRealWidth && mask.width / canvasRealWidth;
    x = parseInt(x * ratio);
    y = parseInt(y * ratio);

    var maskContext = mask.getContext("2d");
    var pixel = maskContext.getImageData(x, y, 1, 1);
    var r = pixel.data[0];
    var index = parseInt(r);

    return index;
};

if (typeof require !== "undefined") {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
    var MutationObserver = typeof MutationObserver === "undefined" ? null : MutationObserver;
    var WebKitMutationObserver =
        typeof WebKitMutationObserver === "undefined" ? null : WebKitMutationObserver;
}

ripe.Image = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
};

ripe.Image.prototype = Object.create(ripe.Visual.prototype);

ripe.Image.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    this.frame = this.options.frame || 0;
    this.size = this.options.size || 1000;
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.crop = this.options.crop || false;
    this.showInitials = this.options.showInitials || false;
    this.initialsBuilder =
        this.options.initialsBuilder ||
        function(initials, engraving, element) {
            return {
                initials: initials,
                profile: [engraving]
            };
        };
    this._observer = null;

    this._registerHandlers();
};

ripe.Image.prototype.update = function(state) {
    var frame = this.element.dataset.frame || this.frame;
    var size = this.element.dataset.size || this.size;
    var width = this.element.dataset.width || this.width;
    var height = this.element.dataset.height || this.height;
    var crop = this.element.dataset.crop || this.crop;

    this.initials = state !== undefined ? state.initials : this.initials;
    this.engraving = state !== undefined ? state.engraving : this.engraving;

    var initialsSpec = this.showInitials
        ? this.initialsBuilder(this.initials, this.engraving, this.element)
        : {};

    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        crop: crop,
        initials: initialsSpec.initials,
        profile: initialsSpec.profile
    });

    // verifies if the target image URL for the update is already
    // set and if that's the case returns (end of loop)
    if (this.element.src === url) {
        return;
    }

    // updates the image DOM element with the values of the image
    // including requested size and URL
    this.element.width = width;
    this.element.height = height;
    this.element.src = url;
};

ripe.Image.prototype.deinit = function() {
    this._unregisterHandlers();
    this._observer = null;
    this.initialsBuilder = null;

    ripe.Visual.prototype.deinit.call(this);
};

ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();
};

ripe.Image.prototype.setInitialsBuilder = function(builder, options) {
    this.initialsBuilder = builder;
    this.update();
};

ripe.Image.prototype._registerHandlers = function() {
    this.loadListener = function() {
        this.trigger("loaded");
    }.bind(this);
    this.element.addEventListener("load", this.loadListener);

    // eslint-disable-next-line no-undef
    var Observer = MutationObserver || WebKitMutationObserver;
    this._observer = Observer
        ? new Observer(
              function(mutations) {
                  this.update();
              }.bind(this)
          )
        : null;
    this._observer &&
        this._observer.observe(this.element, {
            attributes: true,
            subtree: false
        });
};

ripe.Image.prototype._unregisterHandlers = function() {
    this.element.removeEventListener("load", this.loadListener);
    this._observer && this._observer.disconnect();
};
