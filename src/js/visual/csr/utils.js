/* global THREE, DRACOLoader, RGBELoader, FBXLoader, GLTFLoader */

const base = require("../../base");
const ripe = base.ripe;

ripe.CsrUtils = {};

/**
 * Shader that blurs a texture by doing a Gaussian blur pass.
 */
ripe.CsrUtils.BlurShader = {
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
};

/**
 * Shader that mixes a texture with another texture. Useful to apply a pattern to a
 * mask texture.
 */
ripe.CsrUtils.PatternMixerShader = {
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
};

/**
 * Shader that mixes two height map textures. Useful to apply a height map pattern
 * to a normal height map.
 */
ripe.CsrUtils.HeightmapPatternMixerShader = {
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
};

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
 * Returns the array provided coordinates to an {x, y, z} object.
 *
 * @param {Array} array Array with the point coordinates.
 * @returns {Object} The converted object in the {x, y, z} format.
 */
ripe.CsrUtils.toXYZObject = function(array) {
    const coordinates = {};
    if (!array) return coordinates;
    if (array[0] !== undefined) coordinates.x = array[0];
    if (array[1] !== undefined) coordinates.y = array[1];
    if (array[2] !== undefined) coordinates.z = array[2];
    return coordinates;
};

/**
 * Converts an {x, y, z} object or [x, y, z] array to a THREE.Vector3 vector.
 *
 * @param {Object|Array} value The coordinates to be converted.
 * @returns {THREE.Vector3} The converted THREE.Vector3 coordinate.
 */
ripe.CsrUtils.toVector3 = function(value) {
    const coordinates = Array.isArray(value) ? this.toXYZObject(value) : value;
    return new THREE.Vector3(coordinates.x, coordinates.y, coordinates.z);
};

/**
 * Converts a tone mapping key to the respective tone mapping value.
 *
 * @param {String} key Key that will match a tone mapping value.
 * @returns {Number} The THREE Tone Mapping value for the specified tone mapping type.
 */
ripe.CsrUtils.toToneMappingValue = function(key) {
    switch (key) {
        case "none":
            return THREE.NoToneMapping;
        case "aces_filmic":
            return THREE.ACESFilmicToneMapping;
        case "linear":
            return THREE.LinearToneMapping;
        case "reinhard":
            return THREE.ReinhardToneMapping;
        case "cineon":
            return THREE.CineonToneMapping;
        default:
            throw new Error(`Invalid tone mapping key: "${key}"`);
    }
};

/**
 * Converts a texture wrapping mode key to the respective texture wrapping mode value.
 *
 * @param {String} key Key that will match a wrapping mode value.
 * @returns {Number} The THREE Wrapping Mode value for the specified wrapping mode type.
 */
ripe.CsrUtils.toWrappingModeValue = function(key) {
    switch (key) {
        case "repeat":
            return THREE.RepeatWrapping;
        case "clamp_to_edge":
            return THREE.ClampToEdgeWrapping;
        case "mirrored_repeat":
            return THREE.MirroredRepeatWrapping;
        default:
            throw new Error(`Invalid wrapping mode key: "${key}"`);
    }
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

/**
 * Loads a Draco Loader instance.
 *
 * @returns {THREE.DRACOLoader} The loaded instance of a Draco Loader.
 */
ripe.CsrUtils.loadDracoLoader = function() {
    const dracoLoader = new DRACOLoader();
    try {
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
        dracoLoader.preload();
    } catch (error) {
        // loader fallback
        dracoLoader.setDecoderPath(
            "https://raw.githubusercontent.com/google/draco/master/javascript/"
        );
        dracoLoader.preload();
    }

    return dracoLoader;
};

/**
 * Loads a texture from a file.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @returns {THREE.Texture} The loaded texture.
 */
ripe.CsrUtils.loadTexture = async function(path) {
    const loader = new THREE.TextureLoader();
    return new Promise((resolve, reject) => {
        loader.load(path, texture => resolve(texture));
    });
};

/**
 * Loads a environment map from a file.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @param {String} format File format for the environment map file.
 * @returns {THREE.Texture} The loaded environment map texture.
 */
ripe.CsrUtils.loadEnvironment = async function(path, format = "hdr") {
    switch (format) {
        case "hdr": {
            const rgbeLoader = new RGBELoader();
            return new Promise((resolve, reject) => {
                rgbeLoader.load(path, texture => resolve(texture));
            });
        }
        default:
            throw new Error(`Can't load environment map, format "${format}" is not supported`);
    }
};

/**
 * Loads a FBX file.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @returns {THREE.Object3D} The loaded fbx.
 */
ripe.CsrUtils.loadFBX = async function(path) {
    const loader = new FBXLoader();
    return new Promise((resolve, reject) => {
        loader.load(path, fbx => resolve(fbx));
    });
};

/**
 * Loads a GLTF/GLB file.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @param {THREE.DRACOLoader} dracoLoader A Draco loader instance.
 * @returns {THREE.Object3D} The loaded GLTF/GLB file.
 */
ripe.CsrUtils.loadGLTF = async function(path, dracoLoader = null) {
    const loader = new GLTFLoader();
    if (dracoLoader) loader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {
        loader.load(path, gltf => resolve(gltf.scene));
    });
};

/**
 * Applies properties to any type of Three.js object instance.
 *
 * @param {THREE.Any} object Any type of Three.js instance that support properties.
 * @param {Object} options Properties to be applied.
 * @returns {THREE.Any} The same instance but with the applied options.
 */
ripe.CsrUtils.applyOptions = function(object, options = {}) {
    Object.keys(options).forEach(key => (object[key] = options[key]));
    return object;
};

/**
 * Converts height map image data to a normal map texture.
 *
 * @param {ImageData} imageData The height map ImageData object.
 * @returns {THREE.Texture} A normal map texture.
 */
ripe.CsrUtils.heightMapToNormalMap = function(imageData) {
    const width = imageData.width;
    const height = imageData.height;

    const size = width * height * 4;
    const pixels = new Uint8Array(size);

    for (let i = 0; i < size; i += 4) {
        let x1, x2, y1, y2;

        if (i % (width * 4) === 0) {
            x1 = imageData.data[i];
            x2 = imageData.data[i + 4];
        } else if (i % (width * 4) === (width - 1) * 4) {
            x1 = imageData.data[i - 4];
            x2 = imageData.data[i];
        } else {
            x1 = imageData.data[i - 4];
            x2 = imageData.data[i + 4];
        }

        if (i < width * 4) {
            y1 = imageData.data[i];
            y2 = imageData.data[i + width * 4];
        } else if (i > width * (height - 1) * 4) {
            y1 = imageData.data[i - width * 4];
            y2 = imageData.data[i];
        } else {
            y1 = imageData.data[i - width * 4];
            y2 = imageData.data[i + width * 4];
        }

        pixels[i] = x1 - x2 + 127;
        pixels[i + 1] = y1 - y2 + 127;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
    }

    const texture = new THREE.DataTexture(pixels, width, height);
    texture.flipY = true;
    texture.needsUpdate = true;

    return texture;
};

/**
 * Generates a normal map texture from a HTML Canvas.
 *
 * @param {Canvas} canvas The canvas we want to generate the normal map texture from.
 * @returns {THREE.Texture} A normal map texture.
 */
ripe.CsrUtils.normalMapFromCanvas = function(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");

    const displacementTextureData = ctx.getImageData(0, 0, width, height);
    return this.heightMapToNormalMap(displacementTextureData);
};

/**
 * Applies position, rotation and scale to a THREE.Object3D object instance.
 *
 * @param {THREE.Object3D} object An instance of a THREE.Object3D.
 */
ripe.CsrUtils.applyTransform = function(object, position = {}, rotation = {}, scale = {}) {
    const positionX = position.x || object.position.x;
    const positionY = position.y || object.position.y;
    const positionZ = position.z || object.position.z;

    const rotationX = THREE.MathUtils.degToRad(rotation.x) || object.rotation.x;
    const rotationY = THREE.MathUtils.degToRad(rotation.y) || object.rotation.y;
    const rotationZ = THREE.MathUtils.degToRad(rotation.z) || object.rotation.z;

    const scaleX = scale.x || object.scale.x;
    const scaleY = scale.y || object.scale.y;
    const scaleZ = scale.z || object.scale.z;

    object.position.set(positionX, positionY, positionZ);
    object.scale.set(scaleX, scaleY, scaleZ);
    object.rotation.x = rotationX;
    object.rotation.y = rotationY;
    object.rotation.z = rotationZ;
};
