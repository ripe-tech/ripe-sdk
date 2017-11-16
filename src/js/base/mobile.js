if (typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.Mobile = ripe.Mobile || {};

ripe.Mobile.SAFE = true;
ripe.Mobile.VALID = ["DIV", "IMG", "SPAN", "CANVAS"];

ripe.Mobile.touchHandler = function(element, options) {
    options = options || {};
    var SAFE = options.safe === undefined ? true : ripe.Mobile.SAFE;
    var VALID = options.valid || ripe.Mobile.VALID;

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
