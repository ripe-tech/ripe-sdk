if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * @class
 * @classdesc Class that handles the load and dispose operations of all assets,
 * including meshes, textures, animations and materials.
 *
 * @param {ConfiguratorCSR} configurator The base configurator.
 * @param {Object} owner The owner (customizer instance) for
 * this configurator.
 * @param {Object} options The options to be used to configure the
 * asset manager.
 */
ripe.CSRAssetManager = function (configurator, owner, options) {
    this.owner = owner;
    this.configurator = configurator;
    this.assetsPath = options.assets.path;
    this.texturesPath =
        this.assetsPath +
        this.owner.brand.toLowerCase() +
        "/textures/" +
        this.owner.model.toLowerCase() +
        ".glb";

    this.library = options.library;
    this.owner = owner;

    this.assetsPath = options.assets.path || "";
    this.format = options.assets.format || "gltf";
    this.textureLoader = new this.library.TextureLoader();

    // there must be a model configuration, otherwise an error will occur
    if (!(options.assets && options.assets.config)) {
        throw new Error("No configuration for the model was given.");
    }
    this.modelConfig = options.assets.config;

    this.meshes = {};
    this.loadedTextures = {};
    this.environmentTexture = null;
    this.loadedScene = undefined;

    const tmpRenderer = new this.library.WebGLRenderer({ antialias: true, alpha: true });

    this.maxAnisotropy = tmpRenderer.capabilities.getMaxAnisotropy();

    tmpRenderer.dispose();

    this.animations = {};

    this._loadAssets();
};

ripe.CSRAssetManager.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRAssetManager.prototype.constructor = ripe.CSRAssetManager;

/**
 * @ignore
 */
ripe.CSRAssetManager.prototype.updateOptions = async function (options) {
    // materials
    this.assetsPath = options.assets.path === undefined ? this.assetsPath : options.assets.path;
    this.modelConfig =
        options.assets.config === undefined ? this.modelConfig : options.assets.config;
};

/**
 * Chooses the correct file loader based on the given format.
 */
ripe.CSRAssetManager.prototype._loadAssets = async function () {
    var meshPath = this.owner.model.toLowerCase();

    if (this.format.includes("gltf")) {
        meshPath += ".glb";
    }
    else if (this.format.includes("fbx")) {
        meshPath += ".fbx";
    }

    await this._loadAsset(meshPath)

    this._loadSubMeshes();

    // set the materials for the first time
    await this.setMaterials(this.owner.parts);

    for (let i = 0; i < this.modelConfig.animations.length; i++) {
        await this._loadAsset(this.modelConfig.animations[i], true)
    }

    await this.configurator.initializeLoading();
};

/**
 * @ignore
 */
ripe.CSRAssetManager.prototype._loadAsset = async function (filename, isAnimation = false) {
    var path = this.assetsPath + this.owner.brand.toLowerCase()

    if (isAnimation) path += "/animations/" + this.owner.model.toLowerCase() + "/" + filename;
    else path += "/models/" + filename;

    var type = "gltf"
    var loader = null

    if (filename.includes(".fbx")) type = "fbx"

    if (type == "gltf") loader = new this.library.GLTFLoader();
    else loader = new this.library.FBXLoader();

    var mesh = this.owner.getMeshP({
        'brand': this.owner.brand,
        'model': this.owner.model,
        'variant': "base"
    });    

    var asset = await new Promise((resolve) => {
        loader.load(mesh, function (asset) {
            resolve(asset)
        });
    });

    if (isAnimation) {
        this.animations[filename] = asset.animations[0];
        // if it is a mesh operation
        if (filename.includes("mesh_")) {
            this.loadedScene.animations.push(asset.animations[0])
        }
    } else {
        if (type == "gltf") this.loadedScene = asset.scene;
        else this.loadedScene = asset;
        this.loadedScene.animations = []
    }
};

/**
 * Stores the submeshes in a key-value pair, where the key is the name of the mesh and the value is the
 * mesh itself.
 */
ripe.CSRAssetManager.prototype._loadSubMeshes = function () {
    var box = new this.library.Box3().setFromObject(this.loadedScene);

    const centerX = box.min.x + (box.max.x - box.min.x) / 2.0;
    const centerZ = box.min.z + (box.max.z - box.min.z) / 2.0;

    const self = this;
    this.loadedScene.traverse(function (child) {
        if (!child.isMesh) return;

        // place the meshes in the center of the image.
        child.position.set(
            child.position.x - centerX,
            child.position.y,
            child.position.z - centerZ
        );

        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
            self.disposeMaterial(child.material);
        }

        self.meshes[child.name] = child;
    });
};

/**
 * Disposes a material, by first removing all associated maps.
 *
 * @param {Material} material The material to be disposed.
 */
ripe.CSRAssetManager.prototype.disposeMaterial = async function (material) {
    if (material.map) material.map.dispose();
    if (material.aoMap) material.aoMap.dispose();
    if (material.roughnessMap) material.roughnessMap.dispose();
    if (material.specularMap) material.specularMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.envMap) material.envMap.dispose();
    if (material.metalnessMap) material.metalnessMap.dispose();
    if (material.emissiveMap) material.emissiveMap.dispose();
    if (material.aoMap) material.aoMap.dispose();

    material.dispose();
    material = null;
};

/**
 * Disposes not only the mesh, but all the attributes, geometries and materials associated
 * with it.
 * @param {*} mesh The mesh to be disposed.
 */
ripe.CSRAssetManager.prototype.disposeMesh = async function (mesh) {
    if (mesh.material) await this.disposeMaterial(mesh.material);
    if (!mesh.geometry) return;
    for (const key in mesh.geometry.attributes) {
        mesh.geometry.deleteAttribute(key);
    }
    mesh.geometry.setIndex([]);
    mesh.geometry.dispose();
    mesh.geometry = null;
};

/**
 * Disposes a scene by destroying all the meshes, removing them from the scene, and then
 * destroying the scene itself.
 *
 * @param {Scene} scene The scene to be disposed.
 */
ripe.CSRAssetManager.prototype.disposeScene = async function (scene) {
    if (scene.environment) scene.environment.dispose();

    const self = this;

    await scene.traverse(async function (child) {
        if (child.type.includes("Light")) child = null;
        if (child !== null && child.isMesh) await self.disposeMesh(child);
        scene.remove(child);
    });

    scene = null;
};

/**
 * Disposes all the stored resources to avoid memory leaks. Includes meshes,
 * geometries and materials.
 */
ripe.CSRAssetManager.prototype.disposeResources = async function () {
    console.log("Disposing Asset Manager Resources.");
    this.pmremGenerator.dispose();
    this.pmremGenerator = null;

    if (this.environmentTexture) {
        this.environmentTexture.dispose();
        this.environmentTexture = null;
    }

    var count = 0;

    if (this.meshes) {
        for (var mesh in this.meshes) {
            await this.disposeMesh(this.meshes[mesh]);
            count++;
        }
    }

    this.meshes = {};
    console.log("Finished disposing " + count + " meshes.");

    count = 0;

    if (this.loadedTextures) {
        for (var texture in this.loadedTextures) {
            this.loadedTextures[texture].dispose();
            this.loadedTextures[texture] = null;
            count++;
        }
    }

    this.meshes = {};
    this.loadedTextures = {};
    this.loadedScene = null;
    this.library = null;

    console.log("Finished disposing " + count + " textures.");
};

/**
 * Responsible for loading and, if specified, applying the materials to the correct meshes.
 *
 * @param {*} parts The parts configuration, that maps the part to a material.
 * @param {*} autoApplies Decides if applies the materials or just loads all the textures.
 */
ripe.CSRAssetManager.prototype.setMaterials = async function (parts, autoApplies = true) {
    for (var part in parts) {
        if (part === "shadow") continue;

        var material = parts[part].material;
        var color = parts[part].color;
        var newMaterial = await this._loadMaterial(part, material, color);

        if (!autoApplies) {
            // only dispose the materials, not the textures, they need to be loaded
            newMaterial.dispose();
            continue;
        }

        for (var mesh in this.meshes) {
            if (mesh.includes(part)) {
                if (this.meshes[mesh].material) {
                    this.meshes[mesh].material.dispose();
                    this.meshes[mesh].material = null;
                }
                this.meshes[mesh].material = newMaterial.clone();
                this.disposeMaterial(newMaterial);
                break;
            }
        }
    }
};

/**
 * Returns a material, containing all the maps specified in the config. Stores the textures in memory to
 * allow for faster material change.
 *
 * @param {*} part The part that will receive the new material
 * @param {*} type The type of material, such as "python" or "nappa".
 * @param {*} color The color of the material.
 */
ripe.CSRAssetManager.prototype._loadMaterial = async function (part, type, color) {
    var materialConfig;

    // If specific texture doesn't exist, fallback to general textures
    if (!this.modelConfig[part][type]) {
        materialConfig = this.modelConfig.general[type][color];
    } else materialConfig = this.modelConfig[part][type][color];

    var newMaterial;

    // follows specular-glossiness workflow
    if (materialConfig.specularMap) {
        newMaterial = new this.library.MeshPhongMaterial();
    } else {
        // follows PBR workflow
        newMaterial = new this.library.MeshStandardMaterial();
    }

    const basePath =
        this.assetsPath +
        this.owner.brand.toLowerCase() +
        "/textures/" +
        this.owner.model.toLowerCase() +
        "/";

    for (var prop in materialConfig) {
        // if it's a map, load and apply the texture
        if (prop.includes("map") || prop.includes("Map")) {
            var mapPath = basePath + materialConfig[prop];

            if (!this.loadedTextures[mapPath]) {
                var texture = await new Promise((resolve, reject) => {
                    this.textureLoader.load(mapPath, function (texture) {
                        resolve(texture);
                    });
                });
                // If texture is used for color information, set colorspace.
                texture.encoding = this.library.sRGBEncoding;
                texture.anisotropy = this.maxAnisotropy;

                // UVs use the convention that (0, 0) corresponds to the upper left corner of a texture.
                texture.flipY = false;
                this.loadedTextures[mapPath] = texture;
            }

            newMaterial[prop] = this.loadedTextures[mapPath];
        } else {
            // if it's not a map, it's a property, apply it
            newMaterial[prop] = materialConfig[prop];
        }
    }

    newMaterial.perPixel = true;
    return newMaterial;
};

/**
 * Loads an HDR environment and applies it to the scene.
 *
 * @param {*} scene The scene that will have the new environment.
 * @param {*} renderer The renderer that will generate the equirectangular maps.
 * @param {*} environment The name of the environment to be loaded.
 */
ripe.CSRAssetManager.prototype.setupEnvironment = async function (scene, renderer, environment) {
    this.pmremGenerator = new this.library.PMREMGenerator(renderer);
    var environmentMapPath = this.assetsPath + this.owner.brand + "/environments/" + environment + ".hdr";

    const rgbeLoader = new this.library.RGBELoader();
    const texture = await new Promise((resolve, reject) => {
        rgbeLoader.setDataType(this.library.UnsignedByteType).load(environmentMapPath, texture => {
            resolve(texture);
        });
    });

    this.pmremGenerator.compileEquirectangularShader();
    this.environmentTexture = this.pmremGenerator.fromEquirectangular(texture).texture;

    scene.environment = this.environmentTexture;
};
