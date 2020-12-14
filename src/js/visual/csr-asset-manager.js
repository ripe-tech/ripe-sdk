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
ripe.CSRAssetManager = function(configurator, owner, options) {
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
    this.wireframes = {};
    this.loadedTextures = {};
    this.environmentTexture = null;
    this.loadedScene = undefined;

    // creates a temporary render to be able to obtain a
    // series of properties that will be applicable to an
    // equivalent renderer that is going to be created
    const renderer = new this.library.WebGLRenderer({ antialias: true, alpha: true });
    try {
        this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    } finally {
        renderer.dispose();
    }

    this.animations = {};

    this._loadAssets();
};

ripe.CSRAssetManager.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRAssetManager.prototype.constructor = ripe.CSRAssetManager;

/**
 * @ignore
 */
ripe.CSRAssetManager.prototype.updateOptions = async function(options) {
    // materials
    this.assetsPath = options.assets.path === undefined ? this.assetsPath : options.assets.path;
    this.modelConfig =
        options.assets.config === undefined ? this.modelConfig : options.assets.config;
};

/**
 * Loads the complete base set of assets for the scene.
 *
 * Chooses the correct file loader based on the given format.
 *
 * @param options The options to configure the assets loading.
 */
ripe.CSRAssetManager.prototype._loadAssets = async function({
    subMeshes = true,
    wireframes = false
} = {}) {
    // loads the initial mesh asset to be used as the main mesh
    // of the scene (should use the RIPE SDK for model URL) and
    // then loads its sub-meshes
    const asset = await this._loadAsset();
    if (subMeshes) this._loadSubMeshes(asset);
    if (wireframes) this._loadWireframes(asset);

    // sets the materials for the first time
    await this.setMaterials(this.owner.parts);

    // loads the complete set of animations defined in the
    // model configuration
    for (const animation of this.modelConfig.animations) {
        await this._loadAsset(animation, true);
    }

    await this.configurator.initializeLoading();
};

/**
 * @ignore
 */
ripe.CSRAssetManager.prototype._loadAsset = async function(filename = null, isAnimation = false) {
    const loadersM = {
        gltf: this.library.GLTFLoader,
        fbx: this.library.FBXLoader
    };

    let type = "gltf";
    let path = this.assetsPath + this.owner.brand.toLowerCase();

    if (isAnimation) {
        path += "/animations/" + this.owner.model.toLowerCase() + "/" + filename;
    } else {
        path = this.owner.getMeshUrl({
            variant: "$base"
        });
    }

    // tries to determine the proper type of file that is represented
    // by the file name in question
    if (path.endsWith(".gltf")) type = "gltf";
    else if (path.endsWith(".fbx")) type = "fbx";
    else type = "gltf";

    // gathers the proper loader class and then creates a new instance
    // of the loader that is going to be used
    const loader = new loadersM[type]();

    // encapsulates the loader logic around a promise and waits
    // for it to be finalized in success or in error
    let asset = await new Promise((resolve, reject) => {
        loader.load(
            path,
            asset => resolve(asset),
            null,
            err => reject(err)
        );
    });

    if (isAnimation) {
        // "gathers" the first animation of the asset as the main,
        // the one that is going to be store in memory
        this.animations[filename] = asset.animations[0];

        // if it is a mesh operation it must be added to the set
        // of animations associated with the currently loaded scene
        const isMeshOperation = filename.includes("mesh_");
        if (isMeshOperation) {
            this.loadedScene.animations.push(asset.animations[0]);
        }
    } else {
        // for the glTF assets a small hack is required so
        // the asset in question is the scene, this is required
        // because glTF is a packaging format for multiple assets
        // and we're only concerted with the scene here
        if (type === "gltf") asset = asset.scene;

        // updates the loaded scene variable with the assets
        // that has just been loaded (and resets animations)
        this.loadedScene = asset;
        this.loadedScene.animations = [];
    }

    // returns the asset that has been loaded to the caller
    // method, must be used carefully to avoid memory leaks
    return asset;
};

/**
 * Stores the sub-meshes in a key-value pair, where the key is the name of the
 * mesh and the value is the mesh itself.
 *
 * @param {Mesh} scene The mesh object that is going to be used in the loading
 * of the sub-meshes into memory (key-value pair).
 */
ripe.CSRAssetManager.prototype._loadSubMeshes = function(scene = null) {
    // tests the provided scene to verify if it's valid falling
    // back to the currently loaded scene otherwise
    scene = scene || this.loadedScene;

    // creates a 3D box from the current scene in question to
    // be able to calculate the center of the scene
    const box = new this.library.Box3().setFromObject(scene);
    const centerX = box.min.x + (box.max.x - box.min.x) / 2.0;
    const centerZ = box.min.z + (box.max.z - box.min.z) / 2.0;

    // iterates over the complete set of element from the scene
    // to obtain the sub-meshes contained in it and process them
    scene.traverse(child => {
        // in case the child element is not a mesh ignores it
        if (!child.isMesh) return;

        // places the meshes in the center of the scene bounding
        // box (proper and expected positioning)
        child.position.set(
            child.position.x - centerX,
            child.position.y,
            child.position.z - centerZ
        );

        child.castShadow = true;
        child.receiveShadow = true;
        child.visible = true;

        // in case there's a material set in the child
        // removes it as CSR is going to take care of
        // handling materials "manually"
        if (child.material) {
            this.disposeMaterial(child.material);
        }

        // adds the child mesh to the map that associates
        // the mesh name (part) with the sub-mesh
        this.meshes[child.name] = child;
    });
};

ripe.CSRAssetManager.prototype._loadWireframes = function(scene = null, visible = false) {
    scene = scene || this.loadedScene;
    scene.traverse(child => {
        if (!child.isMesh) return;

        const wireframe = this._buildWireframe(child);
        wireframe.visible = visible;

        scene.add(wireframe);

        this.wireframes[child.name] = wireframe;
    });
};

/**
 * Disposes a material, by first removing all associated maps.
 *
 * @param {Material} material The material to be disposed.
 */
ripe.CSRAssetManager.prototype.disposeMaterial = async function(material) {
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
};

/**
 * Disposes not only the mesh, but all the attributes, geometries and materials associated
 * with it.
 *
 * @param {Mesh} mesh The mesh to be disposed.
 */
ripe.CSRAssetManager.prototype.disposeMesh = async function(mesh) {
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
ripe.CSRAssetManager.prototype.disposeScene = async function(scene) {
    if (scene.environment) scene.environment.dispose();

    const self = this;

    await scene.traverse(async function(child) {
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
ripe.CSRAssetManager.prototype.disposeResources = async function() {
    this.pmremGenerator.dispose();
    this.pmremGenerator = null;

    if (this.environmentTexture) {
        this.environmentTexture.dispose();
        this.environmentTexture = null;
    }

    for (const mesh of Object.values(this.meshes)) {
        await this.disposeMesh(mesh);
    }

    for (const wireframe of Object.values(this.wireframes)) {
        await this.disposeMesh(wireframe);
    }

    for (const [name, value] of Object.entries(this.loadedTextures)) {
        value.dispose();
        this.loadedTextures[name] = null;
    }

    this.meshes = {};
    this.loadedTextures = {};
    this.loadedScene = null;
    this.library = null;
};

/**
 * Iterates through the loaded scene and checks if there is any element of
 * the scene that matches the part's name.
 *
 * @param {string} part Name of the part to be analysed.
 * @returns {Mesh} The mesh for the requested name.
 */
ripe.CSRAssetManager.prototype.getPart = function(part) {
    // considers the scene to be the children of the first
    // child of the loaded scene (convention)
    const scene = this.loadedScene.children[0].children;

    // iterate through the children of the scene, and check if the
    // part is present in the scene structure
    for (const mesh of scene) {
        if (mesh.name === part) return mesh;
    }

    // returns an invalid value as the default return value,
    // meaning that no valid part mesh was found
    return null;
};

/**
 * Propagates material for all children of given part.
 *
 * @param {Object} part The parent node/mesh.
 * @param {Material} material The material that will be set.
 */
ripe.CSRAssetManager.prototype.cascadeMaterial = function(part, material) {
    for (const child of part.children) {
        if (child.type === "Object3D") {
            this.cascadeMaterial(part.children[1]);
        } else {
            // no clone material is used, so that all nodes use the
            // same material, making one change propagate to all
            // the meshes using the same material.
            child.material = material;
        }
    }
};

/**
 * Responsible for loading and, if specified, applying the materials to
 * the correct meshes.
 *
 * @param {Object} parts The parts configuration, that maps the part
 * to a material.
 * @param {Boolean} autoApply Decides if applies the materials or just
 * loads all the textures.
 */
ripe.CSRAssetManager.prototype.setMaterials = async function(parts, autoApply = true) {
    for (const part in parts) {
        const scenePart = this.getPart(part);
        if (scenePart === null) continue;

        const material = parts[part].material;
        const color = parts[part].color;
        const newMaterial = await this._loadMaterial(part, material, color);

        // in case no auto apply is request returns the control flow
        // to the caller function immediately
        if (!autoApply) {
            // only dispose the materials, not the textures, as they
            // need to be loaded
            newMaterial.dispose();
            continue;
        }

        // if it's a mesh, apply material
        if (scenePart.type === "Mesh") {
            if (scenePart.material) {
                scenePart.material.dispose();
                scenePart.material = null;
            }

            scenePart.material = newMaterial.clone();
            this.disposeMaterial(newMaterial);
        }
        // if it is an empty node, cascade the material to the children
        else if (scenePart.type === "Object3D") {
            this.cascadeMaterial(scenePart, newMaterial);
        }
    }

    // Updates the base colors for all the materials currently being used
    this._storePartsColors();
};

/**
 * Stores the base colors for each material, based on their UUID.
 *
 * Used for giving masks their correct values when highlighted or
 * lowlighted.
 */
ripe.CSRAssetManager.prototype._storePartsColors = function() {
    this.partsColors = {};

    for (const mesh in this.meshes) {
        const material = this.meshes[mesh].material;
        // maps the uuid to the base color used
        this.partsColors[material.uuid] = [material.color.r, material.color.g, material.color.b];
    }
};

/**
 * Returns a material, containing all the maps specified in the config.
 * Stores the textures in memory to allow for faster material change.
 *
 * @param {String} part The part that will receive the new material
 * @param {String} type The type of material, such as "python" or "nappa".
 * @param {String} color The color of the material.
 */
ripe.CSRAssetManager.prototype._loadMaterial = async function(part, type, color) {
    let materialConfig;

    // if the specific texture doesn't exist, fallbacks to
    // general textures
    if (!this.modelConfig[part] || !this.modelConfig[part][type]) {
        materialConfig = this.modelConfig.general[type][color];
    } else {
        materialConfig = this.modelConfig[part][type][color];
    }

    let newMaterial;

    // follows specular-glossiness workflow
    if (materialConfig.specularMap || materialConfig.specular) {
        newMaterial = new this.library.MeshPhongMaterial();
    }
    // otherwise follows PBR workflow
    else {
        newMaterial = new this.library.MeshStandardMaterial();
    }

    const basePath =
        this.assetsPath +
        this.owner.brand.toLowerCase() +
        "/textures/" +
        this.owner.model.toLowerCase() +
        "/";

    for (const prop in materialConfig) {
        // if it's a map, loads and applies the texture
        if (prop.includes("map") || prop.includes("Map")) {
            const mapPath = basePath + materialConfig[prop];

            if (!this.loadedTextures[mapPath]) {
                const texture = await new Promise((resolve, reject) => {
                    this.textureLoader.load(mapPath, function(texture) {
                        resolve(texture);
                    });
                });

                // if the texture is used for color information, set colorspace to sRGB
                if (prop === "map" || prop.includes("emissive")) {
                    texture.encoding = this.library.sRGBEncoding;
                } else {
                    texture.encoding = this.library.LinearEncoding;
                }
                texture.anisotropy = this.maxAnisotropy;

                // UVs use the convention that (0, 0) corresponds to the
                // upper left corner of a texture
                texture.flipY = false;
                this.loadedTextures[mapPath] = texture;
            }

            newMaterial[prop] = this.loadedTextures[mapPath];
        }
        // if it's not a map, it's a property, apply it
        else {
            if (prop === "color" || prop === "specular") {
                const color = this.getColorFromProperty(materialConfig[prop]);
                newMaterial[prop] = color;
            } else {
                newMaterial[prop] = materialConfig[prop];
            }
        }
    }

    newMaterial.perPixel = true;
    return newMaterial;
};

ripe.CSRAssetManager.prototype.getColorFromProperty = function(value) {
    // checks if it is hex or simple value and applies the proper
    // color string transformation accordingly
    if (typeof value === "string" && value.includes("#")) {
        return new this.library.Color(value);
    }
    // otherwise it's a simple value and should be applied to all
    // of the different color channels equally
    else {
        return new this.library.Color(value, value, value);
    }
};

/**
 * Loads an HDR environment and applies it to the scene.
 *
 * @param {Mesh} scene The scene that will have the new environment.
 * @param {WebGLRenderer} renderer The renderer that will generate the
 * equirectangular maps.
 * @param {String} environment The name of the environment to be loaded.
 */
ripe.CSRAssetManager.prototype.setupEnvironment = async function(scene, renderer, environment) {
    this.pmremGenerator = new this.library.PMREMGenerator(renderer);
    const environmentMapPath =
        this.assetsPath + this.owner.brand + "/environments/" + environment + ".hdr";

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

/**
 * Builds a wireframe mesh from the provided base mesh.
 *
 * The wireframe mesh is composed by line segments that create the
 * border of the multiple polygons of the original mesh.
 *
 * @param {Mesh} mesh The mesh from which the wireframe version of the
 * mesh is going to be built.
 * @returns {Mesh} The resulting wireframe mesh.
 */
ripe.CSRAssetManager.prototype._buildWireframe = function(mesh) {
    const wireframe = new this.library.WireframeGeometry(mesh.geometry);
    const line = new this.library.LineSegments(wireframe);
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    line.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    line.scale.set(mesh.scale.y, mesh.scale.y, mesh.scale.z);
    line.setRotationFromEuler(mesh.rotation);
    return line;
};
