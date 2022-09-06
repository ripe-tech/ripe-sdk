if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("../../base");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
}

ripe.CsrUtils = {};

/**
 * Returns a value with a specific precision. Default is precision 6.
 *
 * @param {Number} value Number to be formatted.
 * @param {Number} precision Decimal places number.
 * @returns {Number} The value formatted to the specified precision.
 */
ripe.CsrUtils.toPrecision = function(value, precision = 6) {
    return parseFloat(parseFloat(value).toFixed(precision));
};

/**
 * Calculates the shortest path in radians needed to rotate between two
 * points in a unit circle.
 *
 * @param {Number} start The start angle in radians.
 * @param {Number} end The end angle in radians.
 * @returns {Number} The shortest path in radians.
 */
ripe.CsrUtils.shortestRotationRad = function(start, end) {
    const shortestPath =
        ((((end - start) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    return this.toPrecision(shortestPath);
};
