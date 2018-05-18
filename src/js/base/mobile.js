if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base"); // eslint-disable-line no-redeclare
    var ripe = base.ripe; // eslint-disable-line no-redeclare
}

ripe.touchHandler = function(element, options) {
    if (typeof Mobile !== "undefined" && Mobile.touchHandler) { // eslint-disable-line no-undef
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
