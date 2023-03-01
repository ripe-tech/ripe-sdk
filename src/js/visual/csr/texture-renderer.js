import * as THREE from "three";

const base = require("../../base");
const ripe = base.ripe;

ripe.CsrTextureRenderer = function(
    width = null,
    height = null,
    pixelRatio = null,
    rendererOptions = {}
) {
    if (width === null) throw new Error("Width is required");
    if (height === null) throw new Error("Height is required");
    if (pixelRatio === null) throw new Error("PixelRatio is required");

    this.width = width;
    this.height = height;
    this.renderer = null;
    this.rendererTarget = null;
    this.scene = null;
    this.camera = null;
    this.plane = null;

    // creates the renderer that is used to extract pixels data
    this.renderer = new THREE.WebGLRenderer({ antialias: true, ...rendererOptions });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(this.width, this.height);

    // creates the scene that fills the renderer viewport
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
        this.width / -2,
        this.width / 2,
        this.height / 2,
        this.height / -2,
        -10,
        10
    );
    const geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
    this.plane = new THREE.Mesh(geometry);
    this.scene.add(this.plane);

    // creates and sets the renderer target
    this.rendererTarget = new THREE.WebGLRenderTarget(this.width, this.height);
    this.renderer.setRenderTarget(this.rendererTarget);
};
ripe.CsrTextureRenderer.prototype.constructor = ripe.CsrTextureRenderer;

/**
 * Cleanups the `CsrTextureRenderer` instance thus avoiding memory leak issues.
 */
ripe.CsrTextureRenderer.prototype.destroy = function() {
    if (this.plane) {
        if (this.plane.geometry) this.plane.geometry.dispose();
        this.scene.remove(this.plane);
        this.plane = null;
    }

    if (this.camera) this.camera = null;

    if (this.scene) this.scene = null;

    if (this.rendererTarget) {
        this.rendererTarget.dispose();
        this.rendererTarget = null;
    }

    if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
    }
};

/**
 * Renders a plane with the given material and returns the rendered frame as a texture.
 *
 * @param {THREE.Material} material Material that is used in the render pass.
 * @returns {THREE.Texture} Texture with the rendered result.
 */
ripe.CsrTextureRenderer.prototype.textureFromMaterial = function(material) {
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
    const texture = new THREE.DataTexture(pixels, this.width, this.height);
    texture.needsUpdate = true;

    return texture;
};
