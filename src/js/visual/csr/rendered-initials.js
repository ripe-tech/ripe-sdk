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
 * The list of supported texture types.
 */
const SUPPORTED_TEXTURE_TYPES = ["base", "displacement", "metallic", "normal", "roughness"];

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
    this.points = [];
    this.geometry = null;
    this.mesh = null;
    this.currentText = "";

    this.materialTexturesRefs = {
        map: null,
        displacementMap: null,
        normalMap: null
    };

    this.rawTexturesRefs = {
        base: null,
        displacement: null,
        metallic: null,
        normal: null,
        roughness: null
    };

    this.cookedTexturesRefs = {
        base: null,
        displacement: null,
        metallic: null,
        normal: null,
        roughness: null
    };

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
    const curveOpts = options.curveOptions || {};
    this.curveOptions = {
        type: curveOpts.type !== undefined ? curveOpts.type : "centripetal",
        tension: curveOpts.tension !== undefined ? curveOpts.tension : 0.5
    };
    const textOpts = options.textOptions || {};
    this.textOptions = {
        font: textOpts.font !== undefined ? textOpts.font : "Arial",
        fontSize: textOpts.fontSize !== undefined ? textOpts.fontSize : 280,
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
            materialOpts.displacementScale !== undefined ? materialOpts.displacementScale : 25,
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
        widthSegments: meshOpts.widthSegments !== undefined ? meshOpts.widthSegments : 1000,
        heightSegments: meshOpts.heightSegments !== undefined ? meshOpts.heightSegments : 100
    };
    SUPPORTED_TEXTURE_TYPES.forEach(type => {
        const key = this._textureOptionsKey(type);
        const textureTypeOptions = options[key] || {};
        this[key] = { ...DEFAULT_TEXTURE_SETTINGS, ...textureTypeOptions };
    });

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
    this.materialTexturesRefs.normalMap = ripe.CsrUtils.normalMapFromCanvas(
        this.canvasDisplacement
    );

    // blurs normal map texture to avoid normal map color banding
    const blurIntensity = this.textOptions.normalMapBlurIntensity;
    if (blurIntensity > 0) {
        const tempRef = this._blurTexture(this.materialTexturesRefs.normalMap, blurIntensity);
        this.materialTexturesRefs.normalMap.dispose();
        this.materialTexturesRefs.normalMap = tempRef;
    }

    // applies the patterns to the text textures
    this.materialTexturesRefs.map = this._mixPatternWithTexture(
        textTexture,
        this.cookedTexturesRefs.base
    );
    this.materialTexturesRefs.displacementMap = this._mixPatternWithDisplacementTexture(
        displacementTexture,
        this.cookedTexturesRefs.displacement
    );

    // cleans up temporary textures
    textTexture.dispose();
    displacementTexture.dispose();

    // updates the initials material
    this.material.map = this.materialTexturesRefs.map;
    this.material.displacementMap = this.materialTexturesRefs.displacementMap;
    this.material.normalMap = this.materialTexturesRefs.normalMap;

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
ripe.CsrRenderedInitials.prototype.getMaterial = function() {
    if (!this.material) throw new Error("The material doesn't exist");
    return this.material;
};

/**
 * Gets the initials 3D object.
 *
 * @returns {THREE.Object3D} Mesh that will have the initials text.
 */
ripe.CsrRenderedInitials.prototype.getMesh = function() {
    // ensures mesh exists
    if (!this.mesh) this._buildInitialsMesh();

    return this.mesh;
};

/**
 * Sets the texture specified by it's type. The supported types are the following:
 * - base: This texture is the diffuse pattern that is applied to the initials characters.
 * - displacement: This texture is the height map pattern that is applied to the initials
 * characters.
 * - metallic: This texture is the metallic texture that is applied to the initials characters.
 * - normal: This texture is the normal map pattern that is applied to the initials characters.
 * - roughness: This texture is the roughness texture that is applied to the initials characters.
 *
 * @param {String} type The texture type name.
 * @param {THREE.Texture} texture The texture to set for the specified type.
 * @param {Object} options Options to apply to the texture.
 */
ripe.CsrRenderedInitials.prototype.setTexture = function(type, texture, options = {}) {
    this._verifyTextureType(type);

    this[this._textureOptionsKey(type)] = { ...this[this._textureOptionsKey(type)], ...options };

    // cleanups resources
    if (this.rawTexturesRefs[type]) this.rawTexturesRefs[type].dispose();
    if (this.cookedTexturesRefs[type]) this.cookedTexturesRefs[type].dispose();

    // saves raw texture clone so it can be reused
    this.rawTexturesRefs[type] = texture.clone();
    this.rawTexturesRefs[type].needsUpdate = true;

    // applies texture options by precooking the texture
    this.cookedTexturesRefs[type] = this._preCookTexture(
        this.rawTexturesRefs[type],
        this[this._textureOptionsKey(type)]
    );
};

/**
 * Sets the texture attributes.
 *
 * @param {Object} options Options to apply to the texture.
 * @param {String} type The texture type name.
 */
ripe.CsrRenderedInitials.prototype.setTextureOptions = function(type, options = {}) {
    this._verifyTextureType(type);
    if (!this.rawTexturesRefs[type]) {
        throw new Error(`Can't apply ${type} texture options, the texture is not set`);
    }

    // update texture options
    this[this._textureOptionsKey(type)] = { ...this[this._textureOptionsKey(type)], ...options };

    // cleanups resources then applies the texture options by precooking the texture
    if (this.cookedTexturesRefs[type]) this.cookedTexturesRefs[type].dispose();
    this.cookedTexturesRefs[type] = this._preCookTexture(
        this.rawTexturesRefs[type],
        this[this._textureOptionsKey(type)]
    );
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
ripe.CsrRenderedInitials.prototype.updateOptions = function(options = {}) {
    let updateInitials = false;
    let updateMaterial = false;
    let updateMesh = false;
    const updateTextures = [];

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
    SUPPORTED_TEXTURE_TYPES.forEach(type => {
        const key = this._textureOptionsKey(type);
        if (options[key]) {
            this[key] = { ...this[key], ...options[key] };
            updateTextures.push(key);
            updateInitials = true;
        }
    });

    // performs update operations. The order is important
    updateTextures.forEach(type => {
        this.setTextureOptions(type, this[this._textureOptionsKey(type)]);
    });
    if (updateMaterial) {
        ripe.CsrUtils.applyOptions(this.materialOptions);
        this.material.needsUpdate = true;
    }
    if (updateInitials) this.rerenderInitials();
    if (updateMesh) this._buildInitialsMesh();
};

ripe.CsrRenderedInitials.prototype.rerenderInitials = function() {
    this.setInitials(this.currentText);
};

/**
 * Cleanups the `CsrRenderedInitials` instance thus avoiding memory leak issues.
 */
ripe.CsrRenderedInitials.prototype.destroy = function() {
    // cleans up the texture renderer
    this.textureRenderer.destroy();

    // cleans up textures
    this._destroyRawTextures();
    this._destroyCookedTextures();
    this._destroyMaterialTextures();

    // cleans up the material
    if (this.material) this.material.dispose();

    // cleans up the initials mesh
    this._destroyMesh();
};

/**
 * Verifies if the type of texture is supported.
 *
 * @param {String} type The type of texture.
 */
ripe.CsrRenderedInitials.prototype._verifyTextureType = function(type) {
    const isValid = SUPPORTED_TEXTURE_TYPES.includes(type);
    if (!isValid) throw new Error(`The texture type "${type}" is not supported`);
};

/**
 * Builds the texture options key for the provided texture type.
 */
ripe.CsrRenderedInitials.prototype._textureOptionsKey = function(type) {
    this._verifyTextureType(type);
    return `${type}TextureOptions`;
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
 * Cleanups raw textured.
 *
 * @private
 */
ripe.CsrRenderedInitials.prototype._destroyRawTextures = function() {
    if (this.rawTexturesRefs.base) this.rawTexturesRefs.base.dispose();
    if (this.rawTexturesRefs.displacement) this.rawTexturesRefs.displacement.dispose();
    this.rawTexturesRefs = {
        base: null,
        displacement: null
    };
};

/**
 * Cleanups cooked textures.
 *
 * @private
 */
ripe.CsrRenderedInitials.prototype._destroyCookedTextures = function() {
    if (this.cookedTexturesRefs.base) this.cookedTexturesRefs.base.dispose();
    if (this.cookedTexturesRefs.displacement) this.cookedTexturesRefs.displacement.dispose();
    this.cookedTexturesRefs = {
        base: null,
        displacement: null
    };
};

/**
 * Cleanups textures mapped to the material.
 *
 * @private
 */
ripe.CsrRenderedInitials.prototype._destroyMaterialTextures = function() {
    if (this.materialTexturesRefs.map) this.materialTexturesRefs.map.dispose();
    if (this.materialTexturesRefs.displacementMap) {
        this.materialTexturesRefs.displacementMap.dispose();
    }
    if (this.materialTexturesRefs.normalMap) this.materialTexturesRefs.normalMap.dispose();
    this.materialTexturesRefs = {
        map: null,
        displacementMap: null,
        normalMap: null
    };
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
    const curve = new window.THREE.CatmullRomCurve3(
        points,
        false,
        this.curveOptions.type,
        this.curveOptions.tension
    );

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
