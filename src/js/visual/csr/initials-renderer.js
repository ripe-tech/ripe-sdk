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

// TODO support curve points

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
    height = null,
    pixelRatio = null,
    options = {}
) {
    if (canvas === null) throw new Error("canvas is required");
    if (canvasDisplacement === null) throw new Error("canvasDisplacement is required");
    if (width === null) throw new Error("width is required");
    if (height === null) throw new Error("height is required");
    if (pixelRatio === null) throw new Error("pixelRatio is required");

    // variables
    this.canvas = canvas;
    this.canvasDisplacement = canvasDisplacement;
    this.width = width;
    this.height = height;
    this.pixelRatio = pixelRatio;
    this.textureRenderer = null;
    this.material = null;
    this.baseTexture = null;
    this.displacementTexture = null;
    this.mapTexture = null;
    this.displacementMapTexture = null;
    this.displacementNormalMapTexture = null;
    this.geometry = null;
    this.mesh = null;

    // unpacks the CSR Initials Renderer option
    // TODO text options
    const materialOpts = options.materialOptions || {};
    this.materialOptions = {
        color: materialOpts.color !== undefined ? new window.THREE.Color(materialOpts.color) : new window.THREE.Color("#ffffff"),
        displacementScale: materialOpts.displacementScale !== undefined ? materialOpts.displacementScale : 50,
        displacementBias: materialOpts.displacementBias !== undefined ? materialOpts.displacementBias : 0,
        emissive: materialOpts.emissive !== undefined ? new window.THREE.Color(materialOpts.emissive) : new window.THREE.Color("#000000"),
        emissiveIntensity: materialOpts.emissiveIntensity !== undefined ? materialOpts.emissiveIntensity : 1,
        flatShading: materialOpts.flatShading !== undefined ? materialOpts.flatShading : false,
        metalness: materialOpts.metalness !== undefined ? materialOpts.metalness : 0,
        roughness: materialOpts.roughness !== undefined ? materialOpts.roughness : 1,
        wireframe: materialOpts.wireframe !== undefined ? materialOpts.wireframe : false
    };
    const meshOpts = options.meshOptions || {};
    this.meshOptions = {
        widthSegments: meshOpts.widthSegments !== undefined ? meshOpts.widthSegments : 500,
        heightSegments: meshOpts.heightSegments !== undefined ? meshOpts.heightSegments : 500
    };
    this.baseTextureOptions = { ...DEFAULT_TEXTURE_SETTINGS, ...options.baseTextureOptions };
    this.displacementTextureOptions = {
        ...DEFAULT_TEXTURE_SETTINGS,
        ...options.displacementTextureOptions
    };

    // sets the CSR Initials Renderer size
    this.setSize(width, height);

    // inits the CSR Initials Renderer material
    this.material = new window.THREE.MeshStandardMaterial({ transparent: true, ...this.materialOptions });
};
ripe.CsrInitialsRenderer.prototype.constructor = ripe.CsrInitialsRenderer;

/**
 * Sets the initials text.
 *
 * @param {String} text Initials text.
 */
ripe.CsrInitialsRenderer.prototype.setInitials = function(text) {
    // cleans up textures that are going to be replaced
    this._destroyMaterialTextures();

    // generates the necessary text textures
    const textTexture = this._textToTexture(text);
    const displacementTexture = this._textToDisplacementTexture(text);

    // generates a normal map for the text displacement map texture
    const ctx = this.canvasDisplacement.getContext("2d");
    const displacementTextureData = ctx.getImageData(0, 0, this.width, this.height);
    this.displacementNormalMapTexture = ripe.CsrUtils.heightMapToNormalMap(displacementTextureData);

    // applies the patterns to the text textures
    this.mapTexture = this._mixPatternWithTexture(textTexture, this.baseTexture);
    this.displacementMapTexture = this._mixPatternWithDisplacementTexture(
        displacementTexture,
        this.displacementTexture
    );

    // cleans up temporary textures
    textTexture.dispose();
    displacementTexture.dispose();

    // updates the initials material
    this.material.map = this.mapTexture;
    this.material.displacementMap = this.displacementMapTexture;
    this.material.normalMap = this.displacementNormalMapTexture;

    // marks material to do a internal update
    this.material.needsUpdate = true;
};

/**
 * Gets the initials material. This material can be applied to a mesh in order to obtain the
 * 3D text effect.
 *
 * @returns {THREE.Material} Material that makes the 3D text effect.
 */
ripe.CsrInitialsRenderer.prototype.getMaterial = async function() {
    if (!this.material) throw new Error("The material doesn't exist");
    return this.material;
};

/**
 * Gets the initials 3D object.
 *
 * @returns {THREE.Object3D} Mesh that will have the initials text.
 */
ripe.CsrInitialsRenderer.prototype.getMesh = async function() {
    // ensures mesh exists
    if (!this.mesh) this._buildInitialsMesh();

    return this.mesh;
};

/**
 * Sets the diffuse texture. This texture is the diffuse pattern that is applied to the
 * initials characters.
 *
 * @param {String} path Path to the texture.
 * @param {Object} options Options to apply to the texture.
 */
ripe.CsrInitialsRenderer.prototype.setBaseTexture = async function(path, options = {}) {
    this.baseTextureOptions = { ...this.baseTextureOptions, ...options };

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
    this.displacementTextureOptions = { ...this.displacementTextureOptions, ...options };

    // loads the initials height map pattern texture
    let patternTexture = await ripe.CsrUtils.loadTexture(path);

    // applies texture options by precooking the texture
    patternTexture = this._preCookTexture(patternTexture, this.displacementTextureOptions);

    // assigns the height map texture
    this.displacementTexture = patternTexture;
};

/**
 * Cleanups the `CsrInitialsRenderer` instance thus avoiding memory leak issues.
 */
ripe.CsrInitialsRenderer.prototype.destroy = function() {
    // cleans up the texture renderer
    this.textureRenderer.destroy();

    // cleans up textures
    if (this.baseTexture) this.baseTexture.dispose();
    if (this.displacementTexture) this.displacementTexture.dispose();
    this._destroyMaterialTextures();

    // cleans up the material
    if (this.material) this.material.dispose();

    // cleans up the initials mesh
    this._destroyMesh();
};

/**
 * Sets the initials renderer width and height. It also updates the texture renderer used by
 * this instance.
 *
 * @param {Number} width Number for the width in pixels.
 * @param {Number} height Number for the height in pixels.
 */
ripe.CsrInitialsRenderer.prototype.setSize = function(width = null, height = null) {
    if (width === null) throw new Error("width is required");
    if (height === null) throw new Error("height is required");

    this.width = width;
    this.height = width;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvasDisplacement.width = this.width;
    this.canvasDisplacement.height = this.height;

    // rebuilds texture renderer with the new size
    if (this.textureRenderer) this.textureRenderer.destroy();
    this.textureRenderer = new ripe.CsrTextureRenderer(width, height, this.pixelRatio);
};

/**
 * Cleanups everything used only by the initials mesh.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._destroyMesh = function() {
    if (!this.mesh) return;

    if (this.geometry) this.geometry.dispose();
    if (this.mesh.geometry) this.mesh.geometry.dispose();
    this.mesh = null;
};

/**
 * Cleanups textures mapped to the material.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._destroyMaterialTextures = function() {
    if (this.mapTexture) {
        this.mapTexture.dispose();
        this.mapTexture = null;
    }

    if (this.displacementMapTexture) {
        this.displacementMapTexture.dispose();
        this.displacementMapTexture = null;
    }

    if (this.displacementNormalMapTexture) {
        this.displacementNormalMapTexture.dispose();
        this.displacementNormalMapTexture = null;
    }
};

/**
 * Builds the initials mesh 3D object. If a mesh already exists, it will
 * rebuild it.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._buildInitialsMesh = function() {
    // cleans current mesh
    if (this.mesh) this._destroyMesh();

    // generates the initials plane geometry
    this.geometry = new window.THREE.PlaneBufferGeometry(
        this.width,
        this.height,
        this.meshOptions.widthSegments,
        this.meshOptions.heightSegments
    );

    // creates the initials mesh
    this.mesh = new window.THREE.Mesh(this.geometry, this.material);
};

/**
 * This method is used to go around the Three.js limitation of not respecting all
 * THREE.Texture properties when mapping some textures such as displacement maps,
 * normal maps, etc.
 *
 * @param {THREE.Texture} texture Texture that is going to be pre cook.
 * @param {Object} options Options to apply to the texture.
 * @returns {THREE.Texture} Texture with the result of the applied options.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._preCookTexture = function(texture, options) {
    texture = ripe.CsrUtils.applyOptions(texture, options);

    // generates a texture with the updated options
    const material = new window.THREE.MeshBasicMaterial({ transparent: true, map: texture });
    const updatedTexture = this.textureRenderer.textureFromMaterial(material);

    // cleans up the temporary material
    material.dispose();

    return updatedTexture;
};

/**
 * Mixes a pattern with a texture. It's used to apply a pattern to the initials text.
 *
 * @param {THREE.Texture} texture Texture with the initials text.
 * @param {THREE.Texture} patternTexture Texture with the pattern to apply.
 * @returns {THREE.Texture} Texture with the pattern applied to the initials text.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._mixPatternWithTexture = function(texture, patternTexture) {
    // returns the original texture if no pattern texture is provided
    if (!patternTexture) return texture;

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

    // generates a texture with the textures mixed
    const mixedTexture = this.textureRenderer.textureFromMaterial(material);

    // cleans up the temporary material
    material.dispose();

    return mixedTexture;
};

/**
 * Mixes a pattern with a displacement texture. It's used to apply a pattern to the
 * height map texture of the initials text.
 *
 * @param {THREE.Texture} texture Texture with the initials height map texture.
 * @param {THREE.Texture} patternTexture Texture with the pattern to apply.
 * @param {Number} patternIntensity The intensity of on which the pattern will be applied. It
 * ranges from 0 to 1 being that the higher the number the more intensely the pattern will be
 * applied to the height map texture.
 * @returns {THREE.Texture} Texture with the pattern applied to the initials text.
 *
 * @private
 */
ripe.CsrInitialsRenderer.prototype._mixPatternWithDisplacementTexture = function(
    texture,
    patternTexture,
    patternIntensity = 1
) {
    // returns the original texture if no pattern texture is provided
    if (!patternTexture) return texture;

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
                patternIntensity: {
                    type: "f",
                    value: patternIntensity
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
                uniform float patternIntensity;
                varying vec2 vUv;
                float grayScale;

                void main() {
                    vec4 t1 = texture2D(patternTexture, vUv);
                    vec4 t2 = texture2D(baseTexture, vUv);
                    grayScale = t2.r * patternIntensity;
                    gl_FragColor = vec4(mix(t2.rgb, t1.rgb, grayScale), grayScale);
                }
            `
    });

    // generates a texture with the textures mixed
    const mixedTexture = this.textureRenderer.textureFromMaterial(material);

    // cleans up the temporary material
    material.dispose();

    return mixedTexture;
};

/**
 * Blurs a texture by doing a Gaussian blur pass.
 *
 * @param {THREE.Texture} texture Texture to blur.
 * @param {Number} blurIntensity Intensity of blur filter that is going to be applied.
 * @returns {THREE.Texture} The blurred texture.
 */
ripe.CsrInitialsRenderer.prototype._blurTexture = function(texture, blurIntensity = 1) {
    // creates a material to run a shader that blurs the texture
    const material = new window.THREE.ShaderMaterial({
        uniforms: window.THREE.UniformsUtils.merge([
            {
                baseTexture: {
                    type: "t",
                    value: texture
                },
                h: {
                    type: "f",
                    value: 1 / (this.width * blurIntensity)
                },
                v: {
                    type: "f",
                    value: 1 / (this.height * blurIntensity)
                }
            }
        ]),
        vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
        fragmentShader: `
            uniform sampler2D baseTexture;
            uniform float h;
            uniform float v;
            varying vec2 vUv;

            void main() {
                vec4 sum = vec4(0.0);
                
                sum += texture2D(baseTexture, vec2(vUv.x - 4.0 * h,  vUv.y - 4.0 * v)) * 0.051;
                sum += texture2D(baseTexture, vec2(vUv.x - 3.0 * h,  vUv.y - 3.0 * v)) * 0.0918;
                sum += texture2D(baseTexture, vec2(vUv.x - 2.0 * h,  vUv.y - 2.0 * v)) * 0.12245;
                sum += texture2D(baseTexture, vec2(vUv.x - 1.0 * h,  vUv.y - 1.0 * v)) * 0.1531;
                sum += texture2D(baseTexture, vec2(vUv.x, vUv.y)) * 0.1633;
                sum += texture2D(baseTexture, vec2(vUv.x + 1.0 * h, vUv.y + 1.0 * v)) * 0.1531;
                sum += texture2D(baseTexture, vec2(vUv.x + 2.0 * h, vUv.y + 2.0 * v)) * 0.12245;
                sum += texture2D(baseTexture, vec2(vUv.x + 3.0 * h, vUv.y + 3.0 * v)) * 0.0918;
                sum += texture2D(baseTexture, vec2(vUv.x + 4.0 * h, vUv.y + 4.0 * v)) * 0.051;

                gl_FragColor = sum;
            }
        `
    });

    // generates a blurred texture
    const blurredTexture = this.textureRenderer.textureFromMaterial(material);

    // cleans up the temporary material
    material.dispose();

    return blurredTexture;
};

/**
 * Transforms a string into a texture.
 *
 * @param {String} text Text to be transformed into a texture.
 * @returns {THREE.Texture} Texture with the initials text.
 *
 * @private
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
 *
 * @private
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
