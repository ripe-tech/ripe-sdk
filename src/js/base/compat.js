ripe.assign = function(target) {
    if (typeof Object.assign === "function") {
        return Object.assign.apply(this, arguments);
    }

    if (target == null) {
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
