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

/**
 * This class encapsulates all logic related to the CSR initials. It provides tools to process and get
 * CSR initials related resources such as textures, materials and 3D objects that can be used to
 * show initials in CSR.
 *
 * @param {Canvas} canvas Canvas uses to process the initials texture.
 * @param {Canvas} canvasDisplacement Canvas uses to process the initials displacement texture.
 * @param {Number} width Width of the canvas. It dictates the resolution on the x axis.
 * @param {Number} height Height of the canvas. It dictates the resolution on the x axis.
 */
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
    this.height = width;

    this.mesh = null;

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasDisplacement.width = width;
    this.canvasDisplacement.height = height;
    // TODO general options
    // TODO mesh options
};
ripe.CsrInitialsRenderer.prototype.constructor = ripe.CsrInitialsRenderer;

/**
 * Cleanups the `CsrInitialsRenderer` instance thus avoiding memory leak issues.
 */
ripe.CsrInitialsRenderer.prototype.destroy = function() {
    // TODO complete this

    this._destroyMesh();
};

/**
 * Gets the initials 3D object.
 *
 * @returns {THREE.Object3D} Mesh that will have the initials text.
 */
ripe.CsrInitialsRenderer.prototype.getMesh = function() {
    // ensure mesh exists
    if (!this.mesh) this._buildInitialsMesh();

    // TODO improve updates
    // rebuilds the text texture
    const texture = this._textToTexture("mesh test"); // TODO merge pattern with texture
    this.mesh.material.map = texture;

    // rebuilds the text displacement texture
    const displacementTexture = this._textToDisplacementTexture("mesh test"); // TODO merge pattern with texture
    this.mesh.material.displacementMap = displacementTexture;

    // TODO remove this from here
    // sets materials options
    this.mesh.material.displacementScale = 1;

    // marks material to do a internal update
    this.mesh.material.needsUpdate = true;

    // returns the initials mesh
    return this.mesh;
};

/**
 * Cleanups everything related with the initials mesh.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._destroyMesh = function() {
    if (!this.mesh) return;

    if (this.mesh.geometry) this.mesh.geometry.dispose();
    if (this.mesh.material) this.mesh.material.dispose();
    this.mesh = null;
};

/**
 * Builds the initials mesh 3D object. If a mesh already exists, it will
 * rebuild it.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._buildInitialsMesh = function() {
    // TODO save geometry and material reference

    // cleans current mesh
    if (this.mesh) this._destroyInitialsMesh();

    const geometry = new window.THREE.PlaneBufferGeometry(
        this.width,
        this.height,
        500, // TODO width segments
        500 // TODO height segments
    );

    const material = new window.THREE.MeshStandardMaterial({
        transparent: false // TODO set to true
    });
    this.mesh = new window.THREE.Mesh(geometry, material);
};

/**
 * Transforms a string into a texture.
 *
 * @param {String} text Text to be transformed into a texture.
 * @returns {THREE.Texture} Texture with the initials text.
 */
ripe.CsrInitialsRenderer.prototype._textToTexture = function(text) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const ctx = this.canvas.getContext("2d");

    // cleans canvas
    ctx.clearRect(0, 0, width, height);

    ctx.font = `${200}px Arial`; // TODO set font and font size
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

/**
 * Transforms a string into a displacement texture.
 *
 * @param {String} text Text to be transformed into a texture.
 * @returns {THREE.Texture} Texture with the initials text.
 */
 ripe.CsrInitialsRenderer.prototype._textToDisplacementTexture = function(text) {
    const ctx = this.canvasDisplacement.getContext("2d");

    // cleans canvas with black color
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.font = `${200}px Arial`; // TODO set font and font size
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // adds blur filter to attenuate the displacement
    // more blur equals less displacement which means more rounded edges
    ctx.filter = "blur(1.5px)";

    // TODO offsets as options
    const xOffset = 0;
    const yOffset = 0;

    // writes text to the center of the canvas
    const posX = this.width / 2;
    const posY = this.height / 2;
    ctx.fillText(text, posX + xOffset, posY + yOffset);

    // creates texture from canvas
    const texture = new window.THREE.CanvasTexture(this.canvasDisplacement);

    return texture;
};
