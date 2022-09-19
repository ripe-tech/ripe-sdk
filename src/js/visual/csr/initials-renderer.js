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

const DEFAULT_TEXTURE_SETTINGS = {
    wrapS: window.THREE.RepeatWrapping,
    wrapT: window.THREE.RepeatWrapping,
    offset: new window.THREE.Vector2(0, 0),
    repeat: new window.THREE.Vector2(1, 1),
    rotation: 0,
    center: new window.THREE.Vector2(0, 0),
    encoding: window.THREE.sRGBEncoding
};

const DEFAULT_MESH_SETTINGS = {
    widthSegments: 500,
    heightSegments: 500
};

const PATTERN_URL = "https://www.dl.dropboxusercontent.com/s/ycrvwenyfqyo2j9/pattern.jpg";
const DISPLACEMENT_PATTERN_URL =
    "https://www.dl.dropboxusercontent.com/s/8mj4l97veu9urmc/height_map_pattern.jpg";

const TEXT = "example";

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

    // TODO pixel ratio
    this.textureRenderer = new ripe.CsrTextureRenderer(width, height, 1);

    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.meshOptions = DEFAULT_MESH_SETTINGS;
    this.baseTexture = null;
    this.baseTextureOptions = DEFAULT_TEXTURE_SETTINGS;
    this.displacementTexture = null;
    this.displacementTextureOptions = DEFAULT_TEXTURE_SETTINGS;

    // TODO set size method
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
    this.textureRenderer.destroy();
    // TODO complete this

    this._destroyMesh();
};

/**
 * Sets the diffuse texture. This texture is the diffuse pattern that is applied to the
 * initials characters.
 *
 * @param {String} path Path to the texture.
 * @param {Object} options Options to apply to the texture.
 */
ripe.CsrInitialsRenderer.prototype.setBaseTexture = async function(path, options = {}) {
    this.baseTextureOptions = { ...options };

    // loads the initials pattern texture
    let patternTexture = await ripe.CsrUtils.loadTexture(path);

    // applies texture options by precooking the texture
    patternTexture = this._preCookTexture(patternTexture, this.baseTextureOptions);

    // assigns the base texture
    this.baseTexture = patternTexture;
};

/**
 * Sets the height map texture. This texture is the height map pattern that is applied to the
 * height map texture of the initials characters.
 *
 * @param {String} path Path to the texture.
 * @param {Object} options Options to apply to the texture.
 */
ripe.CsrInitialsRenderer.prototype.setDisplacementTexture = async function(path, options = {}) {
    this.displacementTextureOptions = { ...options };

    // loads the initials height map pattern texture
    let patternTexture = await ripe.CsrUtils.loadTexture(path);

    // applies texture options by precooking the texture
    patternTexture = this._preCookTexture(patternTexture, this.displacementTextureOptions);

    // assigns the height map texture
    this.displacementTexture = patternTexture;
};

/**
 * Gets the initials 3D object.
 *
 * @returns {THREE.Object3D} Mesh that will have the initials text.
 */
ripe.CsrInitialsRenderer.prototype.getMesh = async function() {
    // ensure mesh exists
    if (!this.mesh) this._buildInitialsMesh();

    // rebuilds the base and displacement textures
    await Promise.all([
        this.setBaseTexture(PATTERN_URL),
        this.setDisplacementTexture(DISPLACEMENT_PATTERN_URL)
    ]);

    this.setInitials(TEXT);

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

    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    this.mesh = null;
};

/**
 * Builds the initials mesh 3D object. If a mesh already exists, it will
 * rebuild it.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._buildInitialsMesh = function() {
    // cleans current mesh
    if (this.mesh) this._destroyInitialsMesh();

    // generates the initials plane geometry
    this.geometry = new window.THREE.PlaneBufferGeometry(
        this.width,
        this.height,
        this.meshOptions.widthSegments,
        this.meshOptions.heightSegments
    );

    // generates the initials material
    this.material = new window.THREE.MeshStandardMaterial({ transparent: true });

    // creates the initials mesh
    this.mesh = new window.THREE.Mesh(this.geometry, this.material);
};

/**
 * This method is used to go around the Three.js limitation of not respecting all
 * THREE.Texture when mapping some textures such as displacement maps, normal
 * maps, etc.
 *
 * @param {THREE.Texture} texture That we are going to pre cook.
 * @param {Object} options Options to apply to the texture.
 * @param {Boolean} transparent Dictates if the material should be transparent.
 * @returns {THREE.Texture} Texture with the result of the applied options.
 */
ripe.CsrInitialsRenderer.prototype._preCookTexture = function(
    texture,
    options,
    transparent = true
) {
    texture = ripe.CsrUtils.applyOptions(texture, options);

    // generates a texture with the updated options
    const material = new window.THREE.MeshBasicMaterial({ transparent: transparent, map: texture });
    const updatedTexture = this.textureRenderer.textureFromMaterial(material);

    // disposes of the temporary material
    material.dispose();

    return updatedTexture;
};

ripe.CsrInitialsRenderer.prototype._mixPatternWithTexture = function(texture, patternTexture) {
    // creates a material to run a shader that applies a pattern to a texture
    const material = new window.THREE.ShaderMaterial({
        uniforms: window.THREE.UniformsUtils.merge([
            {
                baseTexture: {
                    type: "t",
                    value: texture
                },
                patternTexture: {
                    type: "t",
                    value: patternTexture
                }
            }
        ]),
        vertexShader: `
                    precision highp float;
                    precision highp int;

                    varying vec2 vUv;

                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
        fragmentShader: `
                    precision mediump float;
                    uniform sampler2D baseTexture;
                    uniform sampler2D patternTexture;
                    varying vec2 vUv;

                    void main() {
                        vec4 t1 = texture2D(patternTexture, vUv);
                        vec4 t2 = texture2D(baseTexture, vUv);
                        gl_FragColor = vec4(mix(t2.rgb, t1.rgb, t2.a), t2.a);
                    }
                `
    });

    const mixedTexture = this.textureRenderer.textureFromMaterial(material);

    // disposes of the temporary material
    material.dispose();

    return mixedTexture;
};

ripe.CsrInitialsRenderer.prototype._mixPatternWithDisplacementTexture = function(
    texture,
    patternTexture,
    patternStrength = 1
) {
    // creates a material to run a shader that applies a pattern to a height map texture
    const material = new window.THREE.ShaderMaterial({
        uniforms: window.THREE.UniformsUtils.merge([
            {
                baseTexture: {
                    type: "t",
                    value: texture
                },
                patternTexture: {
                    type: "t",
                    value: patternTexture
                },
                patternStrength: {
                    type: "f",
                    value: patternStrength
                }
            }
        ]),
        vertexShader: `
                precision highp float;
                precision highp int;

                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
        fragmentShader: `
                precision mediump float;
                uniform sampler2D baseTexture;
                uniform sampler2D patternTexture;
                uniform float patternStrength;
                varying vec2 vUv;
                float grayScale;

                void main() {
                    vec4 t1 = texture2D(patternTexture, vUv);
                    vec4 t2 = texture2D(baseTexture, vUv);
                    grayScale = t2.r * patternStrength;
                    gl_FragColor = vec4(mix(t2.rgb, t1.rgb, grayScale), grayScale);
                }
            `
    });

    const mixedTexture = this.textureRenderer.textureFromMaterial(material);

    // disposes of the temporary material
    material.dispose();

    return mixedTexture;
};

ripe.CsrInitialsRenderer.prototype.setInitials = function(text) {
    // TODO cleanup textures

    // generates a texture with the text
    const textTexture = this._textToTexture(text);

    // generates a height map for the text
    const displacementTexture = this._textToDisplacementTexture(text);

    // applies the pattern to the text
    const textTextureWithPattern = this._mixPatternWithTexture(textTexture, this.baseTexture);

    // applies the pattern to the height map texture
    const displacementTextureWithPattern = this._mixPatternWithDisplacementTexture(
        displacementTexture,
        this.displacementTexture
    );

    // updates the initials material
    this.material.map = textTextureWithPattern;
    this.material.displacementMap = displacementTextureWithPattern;
    this.material.displacementScale = 50; // TODO update with options

    // marks material to do a internal update
    this.mesh.material.needsUpdate = true;
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
