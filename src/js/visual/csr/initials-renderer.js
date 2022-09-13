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

ripe.CsrInitialsRenderer = function(
    canvas = null,
    canvasDisplacement = null,
    width = null,
    height = null
) {
    if (canvas === null) throw new Error("canvas is required");
    if (canvasDisplacement === null) throw new Error("canvasDisplacement is required");
    if (width === null) throw new Error("width is required");
    if (height === null) throw new Error("height is required");

    this.canvas = canvas;
    this.canvasDisplacement = canvasDisplacement;
    this.width = width;
    this.height = height;
};
ripe.CsrInitialsRenderer.prototype.constructor = ripe.CsrInitialsRenderer;

/**
 * Cleanups the `CsrInitialsRenderer` instance thus avoiding memory leak issues.
 */
ripe.CsrInitialsRenderer.prototype.destroy = function() {
    // TODO
};

ripe.CsrInitialsRenderer.prototype._textToTexture = function(text) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const ctx = this.canvas.getContext("2d");

    // cleans canvas
    ctx.clearRect(0, 0, width, height);

    // ctx.font = `${fontSize}px DINCondensed-Ripple`; // TODO set font and font size
    // ctx.fillStyle = "#ff0000";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // adds a little thickness so that when the displacement is applied,
    // the color expands to the edges of the text
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#ffffff";

    // TODO offsets as options
    const xOffset = 0;
    const yOffset = 0;

    // writes text to the center of the canvas
    const posX = width / 2;
    const posY = height / 2;
    ctx.fillText(text, posX + xOffset, posY + yOffset);
    ctx.strokeText(text, posX + xOffset, posY + yOffset);

    // creates texture from canvas
    const texture = new window.THREE.CanvasTexture(this.canvas);

    return texture;
};
