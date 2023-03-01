const base = require("./base");
const ripe = base.ripe;

/**
 * @ignore
 */
ripe.touchHandler = function(element, options = {}) {
    // eslint-disable-next-line no-undef
    if (typeof Mobile !== "undefined" && Mobile.touchHandler) {
        return;
    }

    const safe = options.safe === undefined ? true : options.safe;
    const valid = options.valid || ["DIV", "IMG", "SPAN", "CANVAS"];

    const eventHandler = function(event) {
        // retrieves the complete set of touches and uses
        // only the first one for type reference
        const touches = event.changedTouches;
        const first = touches[0];
        let type = "";

        // switches over the type of touch event associating
        // the proper equivalent mouse event to each of them
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
        const isValid = valid.indexOf(first.target.tagName) === -1;
        if (safe && isValid) {
            return;
        }

        // creates the new mouse event that will emulate the
        // touch event that has just been raised, it should
        // be completely equivalent to the original touch
        const mouseEvent = document.createEvent("MouseEvent");
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
