if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    const base = require("./base");
    // eslint-disable-next-line no-redeclare
    // eslint-disable-next-line no-var
    var ripe = base.ripe;
}

ripe.easing = {};

ripe.easing.linear = function(pos, start, end) {
    const t = pos;
    return (end - start) * t + start;
};

ripe.easing.easeInQuad = function(pos, start, end) {
    const t = pos * (2 - pos);
    return (end - start) * t + start;
};

ripe.easing.easeOutQuad = function(pos, start, end) {
    const t = pos * pos;
    return (end - start) * t + start;
};

ripe.easing.easeInOutQuad = function(pos, start, end) {
    const t = pos < 0.5 ? 2 * pos * pos : -1 + (4 - 2 * pos) * pos;
    return (end - start) * t + start;
};
