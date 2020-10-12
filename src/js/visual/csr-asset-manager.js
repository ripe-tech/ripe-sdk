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

ripe.CSRAssetManager = function (configurator, owner, options) {
    this.owner = owner;
    this.configurator = configurator;
    this.assetsPath = options.assetsPath;
    this.meshPath = this.assetsPath + "models/" + this.owner.brand.toLowerCase() + "/" + this.owner.model.toLowerCase() + "23.glb";
    this.texturesPath =
        this.assetsPath +
        "textures/" +
        this.owner.brand.toLowerCase() +
        "/" +
        this.owner.model.toLowerCase() +
        ".glb";
    this.library = options.library;
    this.owner = owner;

    this.assetsPath = options.assetsPath || "";
    this.loadedTextures = {};
    this.environment = options.environment;
    this.environmentTexture = null;
    this.textureLoader = new this.library.TextureLoader();

    this.textSize = options.textSize || 1;
    this.textHeight = options.textHeight || 0.1;
    this.modelConfig = options.modelConfig;

    this.meshes = {};

    this.loadedGltf = undefined;

    let tmpRenderer = new this.library.WebGLRenderer({ antialias: true, alpha: true });

    this.pmremGenerator = new this.library.PMREMGenerator(tmpRenderer);
    this.maxAnisotropy = tmpRenderer.capabilities.getMaxAnisotropy();

    tmpRenderer.dispose();

    this._loadMesh();
};

ripe.CSRAssetManager.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRAssetManager.prototype.constructor = ripe.CSRAssetManager;

ripe.CSRAssetManager.prototype.updateOptions = function (options) {
    if (options.meshPath && this.meshPath !== options.meshPath) {
        this.meshPath = options.meshPath;
        this._loadMesh();
    }

    // materials
    this.assetsPath = options.assetsPath === undefined ? this.assetsPath : options.assetsPath;
    this.partsMap = options.partsMap === undefined ? this.partsMap : options.partsMap;
};

ripe.CSRAssetManager.prototype._loadMesh = async function () {
    if (this.loadedGltf) return;

    if (this.meshPath.includes(".gltf") || this.meshPath.includes(".glb"))
        await this._loadGLTFMesh();
    else if (this.meshPath.includes(".fbx")) await this._loadFBXMesh();

    await this.setMaterials(this.owner.parts);

    this.configurator.initializeLoading();
};

ripe.CSRAssetManager.prototype._loadFBXMesh = async function () {
    var fbxLoader = new this.library.FBXLoader();
    const fbx = await new Promise((resolve, reject) => {
        fbxLoader.load(this.meshPath, fbx => {
            resolve(fbx);
        });
    });
};

ripe.CSRAssetManager.prototype._loadGLTFMesh = async function () {
    const gltfLoader = new this.library.GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(this.meshPath, gltf => {
            resolve(gltf);
        });
    });

    this.loadedGltf = gltf;

    await this._loadSubMeshes();
};

ripe.CSRAssetManager.prototype._loadSubMeshes = function () {
    const floorGeometry = new this.library.PlaneBufferGeometry(10, 10);
    floorGeometry.rotateX(-Math.PI / 2);
    floorGeometry.center();
    const floorMaterial = new this.library.ShadowMaterial();
    floorMaterial.opacity = 0.5;

    var box = new this.library.Box3().setFromObject(this.loadedGltf.scene);

    this.floorMesh = new this.library.Mesh(floorGeometry, floorMaterial);

    this.floorMesh.receiveShadow = true;
    this.floorMesh.position.y = box.min.y;

    const centerX = box.min.x + (box.max.x - box.min.x) / 2.0;
    const centerZ = box.min.z + (box.max.z - box.min.z) / 2.0;

    const traverseScene = child => {
        /*
        child.position.set(
            child.position.x - centerX,
            child.position.y,
            child.position.z - centerZ
        );
        */

        if (!child.isMesh)
            return;

        child.castShadow = true;
        child.receiveShadow = true;
        child.material.dispose();

        this.meshes[child.name] = child;
    };

    this.loadedGltf.scene.traverse(traverseScene);
};

/**
 * Disposes all the stored resources to avoid memory leaks. Includes meshes,
 * geometries and materials.
 */
ripe.CSRAssetManager.prototype.disposeResources = async function (scene) {
    console.log("Disposing Resources");
    this.pmremGenerator.dispose();

    var count = 0;

    if (this.meshes) {
        for (var mesh in this.meshes) {
            this.meshes[mesh].geometry.dispose();
            this.meshes[mesh].material.dispose();
            scene.remove(this.meshes[mesh]);
            count++;
        }
    }

    this.meshes = {}
    console.log("Finished disposing " + count + " meshes.");

    count = 0;

    if (this.loadedTextures) {
        for (var texture in this.loadedTextures) {
            this.loadedTextures[texture].dispose();
            count++;
        }
    }

    console.log("Finished disposing " + count + " textures.");
    this.loadedTextures = {};
};

ripe.CSRAssetManager.prototype.setMaterials = async function (parts) {
    for (var part in parts) {
        if (part === "shadow") continue;

        var material = parts[part].material;
        var color = parts[part].color;
        var newMaterial = await this._loadMaterial(part, material, color);

        for (var mesh in this.meshes) {
            if (mesh.includes(part)) {
                this.meshes[mesh].material.dispose();
                this.meshes[mesh].material = newMaterial.clone();
                newMaterial.dispose();
                break;
            }
        }

        console.log("\n\nChanging material for part " + part + " to " + color + " " + material)
    }
}

ripe.CSRAssetManager.prototype._loadMaterial = async function (part, material, color) {
    var materialConfig;

    // If specific model doesn't exist, fallback to general parameters
    if (!this.modelConfig[part][material])
        materialConfig = this.modelConfig["general"][material][color];
    else materialConfig = this.modelConfig[part][material][color];

    var newMaterial;

    // follows specular-glossiness workflow
    if (materialConfig["specularMap"]) {
        newMaterial = new this.library.MeshPhongMaterial();
    } else {
        // follows PBR workflow
        newMaterial = new this.library.MeshStandardMaterial();
    }

    const basePath =
        this.assetsPath +
        "textures/" +
        this.owner.brand.toLowerCase() +
        "/" +
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
                texture.encoding = THREE.sRGBEncoding;
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

ripe.CSRAssetManager.prototype.setupEnvironment = async function (renderer, scene) {
    this.pmremGenerator = new this.library.PMREMGenerator(renderer);
    var environmentMapPath = this.assetsPath + "environments/" + this.environment + ".hdr";

    console.log(environmentMapPath)

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

