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
 * This class encapsulates all logic related to the CSR initials. It provides tools to
 * process and get CSR initials related resources such as textures, materials and 3D
 * objects that can be used to show initials in CSR.
 *
 * @param {Canvas} canvas Canvas uses to process the initials texture.
 * @param {Canvas} canvasDisplacement Canvas uses to process the initials displacement
 * texture.
 * @param {Number} width Width of the canvas. It dictates the resolution on the x axis.
 * @param {Number} height Height of the canvas. It dictates the resolution on the x axis.
 */
ripe.CsrRenderedInitials = function(
    canvas = null,
    canvasDisplacement = null,
    width = null,
    height = null,
    pixelRatio = null,
    options = {}
) {
    if (canvas === null) throw new Error("Canvas is required");
    if (canvasDisplacement === null) throw new Error("CanvasDisplacement is required");
    if (width === null) throw new Error("Width is required");
    if (height === null) throw new Error("Height is required");
    if (pixelRatio === null) throw new Error("PixelRatio is required");

    this.canvas = canvas;
    this.canvasDisplacement = canvasDisplacement;
    this.width = width;
    this.height = height;
    this.pixelRatio = pixelRatio;
    this.textureRenderer = null;
    this.material = null;
    this.currentBaseTexturePath = null;
    this.baseTexture = null;
    this.currentDisplacementTexturePath = null;
    this.displacementTexture = null;
    this.mapTexture = null;
    this.displacementMapTexture = null;
    this.displacementNormalMapTexture = null;
    this.points = [];
    this.geometry = null;
    this.mesh = null;
    this.currentText = "";

    const DEFAULT_TEXTURE_SETTINGS = {
        wrapS: window.THREE.RepeatWrapping,
        wrapT: window.THREE.RepeatWrapping,
        offset: new window.THREE.Vector2(0, 0),
        repeat: new window.THREE.Vector2(1, 1),
        rotation: 0,
        center: new window.THREE.Vector2(0, 0),
        encoding: window.THREE.sRGBEncoding
    };

    // unpacks the CSR Initials Renderer options
    const textOpts = options.textOptions || {};
    this.textOptions = {
        font: textOpts.font !== undefined ? textOpts.font : "Arial",
        fontSize: textOpts.fontSize !== undefined ? textOpts.fontSize : 200,
        xOffset: textOpts.xOffset !== undefined ? textOpts.xOffset : 0,
        yOffset: textOpts.yOffset !== undefined ? textOpts.yOffset : 0,
        lineWidth: textOpts.lineWidth !== undefined ? textOpts.lineWidth : 5,
        displacementMapTextBlur:
            textOpts.displacementMapTextBlur !== undefined ? textOpts.displacementMapTextBlur : 1.5,
        normalMapBlurIntensity:
            textOpts.normalMapBlurIntensity !== undefined ? textOpts.normalMapBlurIntensity : 1
    };
    const materialOpts = options.materialOptions || {};
    this.materialOptions = {
        color:
            materialOpts.color !== undefined
                ? new window.THREE.Color(materialOpts.color)
                : new window.THREE.Color("#ffffff"),
        displacementScale:
            materialOpts.displacementScale !== undefined ? materialOpts.displacementScale : 50,
        displacementBias:
            materialOpts.displacementBias !== undefined ? materialOpts.displacementBias : 0,
        emissive:
            materialOpts.emissive !== undefined
                ? new window.THREE.Color(materialOpts.emissive)
                : new window.THREE.Color("#000000"),
        emissiveIntensity:
            materialOpts.emissiveIntensity !== undefined ? materialOpts.emissiveIntensity : 1,
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
    const baseTextureOpts = options.baseTextureOptions || {};
    this.baseTextureOptions = { ...DEFAULT_TEXTURE_SETTINGS, ...baseTextureOpts };
    const displacementTextureOpts = options.displacementTextureOptions || {};
    this.displacementTextureOptions = { ...DEFAULT_TEXTURE_SETTINGS, ...displacementTextureOpts };

    // sets the CSR Initials Renderer size
    this.setSize(width, height);

    // inits the CSR Initials Renderer material
    this.material = new window.THREE.MeshStandardMaterial({
        transparent: true,
        ...this.materialOptions
    });
};
ripe.CsrRenderedInitials.prototype.constructor = ripe.CsrRenderedInitials;

/**
 * Sets the initials text.
 *
 * @param {String} text Initials text.
 */
ripe.CsrRenderedInitials.prototype.setInitials = function(text) {
    this.currentText = text;

    // cleans up textures that are going to be replaced
    this._destroyMaterialTextures();

    // generates the necessary text textures
    const textTexture = this._textToTexture(text);
    const displacementTexture = this._textToDisplacementTexture(text);

    // generates a normal map for the text displacement map texture
    this.displacementNormalMapTexture = ripe.CsrUtils.normalMapFromCanvas(this.canvasDisplacement);

    // blurs normal map texture to avoid normal map color banding
    const blurIntensity = this.textOptions.normalMapBlurIntensity;
    if (blurIntensity > 0) {
        this.displacementNormalMapTexture = this._blurTexture(
            this.displacementNormalMapTexture,
            blurIntensity
        );
    }

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
 * Sets the reference points that are used when generating the curve that bends the initials mesh.
 *
 * @param {Array} points Array with THREE.Vector3 reference points for the curve used to bend
 * the mesh.
 */
ripe.CsrRenderedInitials.prototype.setPoints = function(points) {
    this.points = points;

    // updates the existing mesh geometry if the mesh already exists
    if (this.mesh) this._morphPlaneGeometry(this.geometry, this.points);
};

/**
 * Gets the initials material. This material can be applied to a mesh in order to obtain
 * the 3D text effect.
 *
 * @returns {THREE.Material} Material that makes the 3D text effect.
 */
ripe.CsrRenderedInitials.prototype.getMaterial = async function() {
    if (!this.material) throw new Error("The material doesn't exist");
    return this.material;
};

/**
 * Gets the initials 3D object.
 *
 * @returns {THREE.Object3D} Mesh that will have the initials text.
 */
ripe.CsrRenderedInitials.prototype.getMesh = async function() {
    // ensures mesh exists
    if (!this.mesh) this._buildInitialsMesh();

    return this.mesh;
};

/**
 * Sets the diffuse texture. This texture is the diffuse pattern that is applied to
 * the initials characters.
 *
 * @param {String} path Path to the texture.
 * @param {Object} options Options to apply to the texture.
 */
ripe.CsrRenderedInitials.prototype.setBaseTexture = async function(path, options = {}) {
    if (!path) throw new Error("Invalid texture path");

    this.currentBaseTexturePath = path;
    this.baseTextureOptions = { ...this.baseTextureOptions, ...options };

    // loads the initials pattern texture
    let patternTexture = await ripe.CsrUtils.loadTexture(path);

    // applies texture options by precooking the texture
    patternTexture = this._preCookTexture(patternTexture, this.baseTextureOptions);

    // assigns the base texture
    this.baseTexture = patternTexture;
};

/**
 * Sets the diffuse texture attributes.
 *
 * @param {Object} options Options to apply to the texture.
 */
ripe.CsrRenderedInitials.prototype.setBaseTextureOptions = async function(options = {}) {
    await this.setBaseTexture(this.currentBaseTexturePath, options);
};

/**
 * Sets the height map texture. This texture is the height map pattern that is applied to
 * the height map texture of the initials characters.
 *
 * @param {String} path Path to the texture.
 * @param {Object} options Options to apply to the texture.
 */
ripe.CsrRenderedInitials.prototype.setDisplacementTexture = async function(path, options = {}) {
    if (!path) throw new Error("Invalid texture path");

    this.currentDisplacementTexturePath = path;
    this.displacementTextureOptions = { ...this.displacementTextureOptions, ...options };

    // loads the initials height map pattern texture
    let patternTexture = await ripe.CsrUtils.loadTexture(path);

    // applies texture options by precooking the texture
    patternTexture = this._preCookTexture(patternTexture, this.displacementTextureOptions);

    // assigns the height map texture
    this.displacementTexture = patternTexture;
};

/**
 * Sets the height map texture attributes.
 *
 * @param {Object} options Options to apply to the texture.
 */
ripe.CsrRenderedInitials.prototype.setDisplacementTextureOptions = async function(options = {}) {
    await this.setDisplacementTexture(this.currentDisplacementTexturePath, options);
};

/**
 * Sets the initials renderer width and height. It also updates the texture renderer used
 * by this instance.
 *
 * @param {Number} width Number for the width in pixels.
 * @param {Number} height Number for the height in pixels.
 */
ripe.CsrRenderedInitials.prototype.setSize = function(width = null, height = null) {
    if (width === null) throw new Error("Width is required");
    if (height === null) throw new Error("Height is required");

    this.width = width;
    this.height = height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvasDisplacement.width = this.width;
    this.canvasDisplacement.height = this.height;

    // rebuilds texture renderer with the new size
    if (this.textureRenderer) this.textureRenderer.destroy();
    this.textureRenderer = new ripe.CsrTextureRenderer(width, height, this.pixelRatio);
};

/**
 * Updates initials renderer state by updating it's options.
 *
 * @param {Object} options Set of optional parameters to adjust the initials renderer.
 */
ripe.CsrRenderedInitials.prototype.updateOptions = async function(options = {}) {
    let updateInitials = false;
    let updateMaterial = false;
    let updateMesh = false;
    let updateBaseTexture = false;
    let updateDisplacementTexture = false;

    if (options.textOptions) {
        this.textOptions = { ...this.textOptions, ...options.textOptions };
        updateInitials = true;
    }
    if (options.materialOptions) {
        this.materialOptions = { ...this.materialOptions, ...options.materialOptions };
        updateMaterial = true;
        updateInitials = true;
    }
    if (options.meshOptions) {
        this.meshOptions = { ...this.meshOptions, ...options.meshOptions };
        updateMesh = true;
    }
    if (options.baseTextureOptions) {
        this.baseTextureOptions = { ...this.baseTextureOptions, ...options.baseTextureOptions };
        updateBaseTexture = true;
        updateInitials = true;
    }
    if (options.displacementTextureOptions) {
        this.displacementTextureOptions = {
            ...this.displacementTextureOptions,
            ...options.displacementTextureOptions
        };
        updateDisplacementTexture = true;
        updateInitials = true;
    }

    // performs update operations. The order is important
    if (updateBaseTexture) await this.setBaseTextureOptions(this.baseTextureOptions);
    if (updateDisplacementTexture) {
        await this.setDisplacementTextureOptions(this.displacementTextureOptions);
    }
    if (updateMaterial) {
        ripe.CsrUtils.applyOptions(this.materialOptions);
        this.material.needsUpdate = true;
    }
    if (updateInitials) this.setInitials(this.currentText);
    if (updateMesh) this._buildInitialsMesh();
};

/**
 * Cleanups the `CsrRenderedInitials` instance thus avoiding memory leak issues.
 */
ripe.CsrRenderedInitials.prototype.destroy = function() {
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
 * Cleanups everything used only by the initials mesh.
 *
 * @private
 */
ripe.CsrRenderedInitials.prototype._destroyMesh = function() {
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
ripe.CsrRenderedInitials.prototype._destroyMaterialTextures = function() {
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
 * Builds the initials mesh 3D object. If a mesh already exists, it will rebuild it.
 *
 * @private
 */
ripe.CsrRenderedInitials.prototype._buildInitialsMesh = function() {
    // cleans current mesh
    if (this.mesh) this._destroyMesh();

    // generates the initials plane geometry
    this.geometry = this._buildGeometry();

    // creates the initials mesh
    this.mesh = new window.THREE.Mesh(this.geometry, this.material);
};

/**
 * Builds the mesh geometry. If points were set, it will bend the geometry accordingly.
 *
 * @returns {THREE.BufferGeometry} Returns a BufferGeometry instance.
 */
ripe.CsrRenderedInitials.prototype._buildGeometry = function() {
    const geometry = new window.THREE.PlaneBufferGeometry(
        this.width,
        this.height,
        this.meshOptions.widthSegments,
        this.meshOptions.heightSegments
    );

    // no points to generate a curve so returns the flat geometry
    if (this.points.length < 2) return geometry;

    // morphs the plane geometry using the points as reference
    this._morphPlaneGeometry(geometry, this.points);

    return geometry;
};

/**
 * Morhps a plane geometry by following a curve as reference.
 *
 * @param {BufferGeometry} geometry The plane geometry to be morphed.
 * @param {Array} points Array with THREE.Vector3 reference points for the morphing curve.
 * @returns {THREE.BufferGeometry} The morphed geometry.
 */
ripe.CsrRenderedInitials.prototype._morphPlaneGeometry = function(geometry, points) {
    // creates a curve based on the reference points
    const curve = new window.THREE.CatmullRomCurve3(points, false, "centripetal");

    // calculates the curve width
    const curveWidth = Math.round(curve.getLength());

    // get the curve discrete points
    const curvePoints = curve.getSpacedPoints(curveWidth);

    // calculate offsets needed to iterate the geometry vertexes
    const segments = curveWidth >= this.width ? this.width : curveWidth;
    const curvePointStep = segments / this.meshOptions.widthSegments;
    const curvePointOffset =
        curveWidth > this.width ? Math.floor(curveWidth / 2 - this.width / 2) : 0;

    // iterates the geometry vertexes and updates their position to follow the curve
    const geoPos = geometry.attributes.position;
    for (let i = 0; i <= this.meshOptions.heightSegments; i++) {
        for (
            let j = 0, curvePointIdx = curvePointOffset;
            j <= this.meshOptions.widthSegments;
            j++, curvePointIdx += curvePointStep
        ) {
            const vertexIdx = j + i + this.meshOptions.widthSegments * i;
            const curvePoint = curvePoints[Math.round(curvePointIdx)];
            geoPos.setXYZ(
                vertexIdx,
                curvePoint.x,
                geoPos.getY(vertexIdx) + curvePoint.y,
                curvePoint.z
            );
        }
    }

    // recalculates normals and tangents
    geometry.computeVertexNormals();
    geometry.computeTangents();

    // marks geometry to do a internal update
    geometry.attributes.position.needsUpdate = true;

    return geometry;
};

/**
 * Transforms a string into a texture.
 *
 * @param {String} text Text to be transformed into a texture.
 * @returns {THREE.Texture} Texture with the initials text.
 *
 * @private
 */
ripe.CsrRenderedInitials.prototype._textToTexture = function(text) {
    const width = this.width;
    const height = this.height;
    const font = this.textOptions.font;
    const fontSize = this.textOptions.fontSize;
    const xOffset = this.textOptions.xOffset;
    const yOffset = this.textOptions.yOffset;
    const lineWidth = this.textOptions.lineWidth;

    const ctx = this.canvas.getContext("2d");

    // cleans canvas
    ctx.clearRect(0, 0, width, height);

    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // adds a little thickness so that when the displacement is applied,
    // the color expands to the edges of the text
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "#ffffff";

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
ripe.CsrRenderedInitials.prototype._textToDisplacementTexture = function(text) {
    const width = this.width;
    const height = this.height;
    const font = this.textOptions.font;
    const fontSize = this.textOptions.fontSize;
    const xOffset = this.textOptions.xOffset;
    const yOffset = this.textOptions.yOffset;
    const blur = this.textOptions.displacementMapTextBlur;

    const ctx = this.canvasDisplacement.getContext("2d");

    // cleans canvas with black color
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // adds blur filter to attenuate the displacement
    // more blur equals less displacement which means more rounded edges
    ctx.filter = `blur(${blur}px)`;

    // writes text to the center of the canvas
    const posX = width / 2;
    const posY = height / 2;
    ctx.fillText(text, posX + xOffset, posY + yOffset);

    // creates texture from canvas
    const texture = new window.THREE.CanvasTexture(this.canvasDisplacement);

    return texture;
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
ripe.CsrRenderedInitials.prototype._preCookTexture = function(texture, options) {
    texture = ripe.CsrUtils.applyOptions(texture, options);

    // generates a texture with the updated options
    const material = new window.THREE.MeshBasicMaterial({ transparent: true, map: texture });
    const updatedTexture = this.textureRenderer.textureFromMaterial(material);

    // cleans up the temporary material
    material.dispose();

    return updatedTexture;
};

/**
 * Blurs a texture by doing a Gaussian blur pass.
 *
 * @param {THREE.Texture} texture Texture to blur.
 * @param {Number} blurIntensity Intensity of blur filter that is going to be applied.
 * @returns {THREE.Texture} The blurred texture.
 */
ripe.CsrRenderedInitials.prototype._blurTexture = function(texture, blurIntensity = 1) {
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
        vertexShader: ripe.CsrUtils.BlurShader.vertexShader,
        fragmentShader: ripe.CsrUtils.BlurShader.fragmentShader
    });

    // generates a blurred texture
    const blurredTexture = this.textureRenderer.textureFromMaterial(material);

    // cleans up the temporary material
    material.dispose();

    return blurredTexture;
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
ripe.CsrRenderedInitials.prototype._mixPatternWithTexture = function(texture, patternTexture) {
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
        vertexShader: ripe.CsrUtils.PatternMixerShader.vertexShader,
        fragmentShader: ripe.CsrUtils.PatternMixerShader.fragmentShader
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
ripe.CsrRenderedInitials.prototype._mixPatternWithDisplacementTexture = function(
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
        vertexShader: ripe.CsrUtils.HeightmapPatternMixerShader.vertexShader,
        fragmentShader: ripe.CsrUtils.HeightmapPatternMixerShader.fragmentShader
    });

    // generates a texture with the textures mixed
    const mixedTexture = this.textureRenderer.textureFromMaterial(material);

    // cleans up the temporary material
    material.dispose();

    return mixedTexture;
};
