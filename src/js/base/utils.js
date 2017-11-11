if (typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.createElement = function(tagName, className) {
    var element = tagName && document.createElement(tagName);
    element.className = className ? className : "";

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
