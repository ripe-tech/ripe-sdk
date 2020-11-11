if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

ripe.easing = {};

ripe.easing.linear = function(pos, startValue, endValue) {
    const t = pos;
    return (endValue - startValue) * t + startValue;
};

ripe.easing.easeInQuad = function(pos, startValue, endValue) {
    const t = pos * (2 - pos);
    return (endValue - startValue) * t + startValue;
};

ripe.easing.easeOutQuad = function(pos, startValue, endValue) {
    const t = pos * pos;
    return (endValue - startValue) * t + startValue;
};

ripe.easing.easeInOutQuad = function(pos, startValue, endValue) {
    const t = pos < 0.5 ? 2 * pos * pos : -1 + (4 - 2 * pos) * pos;
    return (endValue - startValue) * t + startValue;
};
