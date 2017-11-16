if (typeof require !== "undefined") {
    var base = require("./base");
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
        var animationDelta = timeDelta * (final - initial) / duration;

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

ripe.touchHandler = function(element, options) {
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
        mouseEvent.initMouseEvent(type, true, true, window, 1, first.screenX,
            first.screenY, first.clientX, first.clientY, false, false, false,
            false, 0, null);

        // dispatches the event to the original target of the
        // touch event (pure emulation)
        first.target.dispatchEvent(mouseEvent);
    };

    element.addEventListener("touchstart", eventHandler, true);
    element.addEventListener("touchmove", eventHandler, true);
    element.addEventListener("touchend", eventHandler, true);
    element.addEventListener("touchcancel", eventHandler, true);
};
