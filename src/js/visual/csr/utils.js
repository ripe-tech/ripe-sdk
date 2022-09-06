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
 * Normalizes a THREE.Object3D rotation by setting its axis only with positive
 * values ranging from 0 to 2*PI.
 *
 * @param {THREE.Object3D} object3D An instance of a THREE.Object3D.
 */
ripe.CsrUtils.normalizeRotations = function(object3D) {
    if (!object3D) return;

    const range = 2 * Math.PI;
    let x = object3D.rotation.x % range;
    let y = object3D.rotation.y % range;
    let z = object3D.rotation.z % range;
    x = x < 0 ? x + range : x;
    y = y < 0 ? y + range : y;
    z = z < 0 ? z + range : z;
    object3D.rotation.x = this.toPrecision(x, 7);
    object3D.rotation.y = this.toPrecision(y, 7);
    object3D.rotation.z = this.toPrecision(z, 7);
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
