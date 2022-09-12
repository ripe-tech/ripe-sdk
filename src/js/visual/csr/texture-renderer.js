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

ripe.CsrTextureRenderer = function() {
    const rendererOptions = {}; // TODO
    this.width = 100; // TODO
    this.height = 100; // TODO
    this.renderer = null;
    this.rendererTarget = null;
    this.scene = null;
    this.camera = null;
    this.material = null;
    this.plane = null;

    const pixelRatio = window.devicePixelRatio; // TODO

    // creates the renderer that is used to extract pixels data
    this.renderer = new window.THREE.WebGLRenderer({ antialias: true, ...rendererOptions });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(this.width, this.height);

    // creates the scene that fills the renderer viewport
    this.scene = new window.THREE.Scene();
    this.camera = new window.THREE.OrthographicCamera(
        this.width / -2,
        this.width / 2,
        this.height / 2,
        this.height / -2,
        -10,
        10
    );
    const geometry = new window.THREE.PlaneBufferGeometry(this.width, this.height);
    this.material = new window.THREE.MeshBasicMaterial({ color: 0xff00ff });
    this.plane = new window.THREE.Mesh(geometry, this.material);
    this.scene.add(this.plane);

    // creates and sets the renderer target
    this.rendererTarget = new window.THREE.WebGLRenderTarget(this.width, this.height);
    this.renderer.setRenderTarget(this.rendererTarget);
};
ripe.CsrTextureRenderer.prototype.constructor = ripe.CsrTextureRenderer;

ripe.CsrTextureRenderer.prototype.destroy = function() {
    // TODO
};

/**
 * Renders a plane with the given material and returns the rendered frame as a texture.
 *
 * @param {THREE.Material} material Material that is used in the render pass.
 * @returns {THREE.Texture} Texture with the rendered result.
 */
ripe.CsrTextureRenderer.prototype.textureFromMaterial = function(material) {
    console.log("yyy", this.renderer);

    // render the material to the scene plane
    this.plane.material = material;
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    // gets the render target pixels data
    const pixels = new Uint8Array(this.width * this.height * 4);
    this.renderer.readRenderTargetPixels(
        this.rendererTarget,
        0,
        0,
        this.width,
        this.height,
        pixels
    );

    // creates a texture from the pixels data
    const texture = new window.THREE.DataTexture(pixels, this.width, this.height);
    texture.needsUpdate = true;

    return texture;
};
