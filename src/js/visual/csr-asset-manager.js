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

ripe.CSRAssetManager = function(configurator, owner, options) {
    // console.log("Before")
    /// /console.log(renderer.info)
    // renderer.info.reset();
    /// /console.log(renderer.info)
    this.owner = owner;
    this.configurator = configurator;
    this.assetsPath = options.assetsPath;
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
    this.environment = options.environment;

    this.textureLoader = new this.library.TextureLoader();

    this.textSize = options.textSize || 1;
    this.textHeight = options.textHeight || 0.1;
    this.modelConfig = options.modelConfig;

    this.meshes = {};
    this.loadedTextures = {};
    this.environmentTexture = null;
    this.loadedGltf = undefined;
    this.library = options.library;

    const tmpRenderer = new this.library.WebGLRenderer({ antialias: true, alpha: true });

    this.maxAnisotropy = tmpRenderer.capabilities.getMaxAnisotropy();

    tmpRenderer.dispose();

    this._loadMesh();
};

ripe.CSRAssetManager.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRAssetManager.prototype.constructor = ripe.CSRAssetManager;

ripe.CSRAssetManager.prototype.updateOptions = function(options) {
    // materials
    this.assetsPath = options.assetsPath === undefined ? this.assetsPath : options.assetsPath;
    this.partsMap = options.partsMap === undefined ? this.partsMap : options.partsMap;
};

ripe.CSRAssetManager.prototype._loadMesh = async function() {
    if (this.loadedGltf) return;

    var meshPath = this.assetsPath + "models/" + this.owner.brand.toLowerCase() + "/";
    var meshModelPath = this.owner.model.toLowerCase() + ".glb";

    const gltfLoader = new this.library.GLTFLoader();
    gltfLoader.setPath(meshPath);

    const self = this;
    gltfLoader.load(meshModelPath, async function(gltf) {
        self.loadedGltf = gltf;

        await self._loadSubMeshes();

        await self.setMaterials(self.owner.parts);

        self.configurator.initializeLoading();
    });
};

ripe.CSRAssetManager.prototype._loadSubMeshes = async function() {
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

    const self = this;
    await this.loadedGltf.scene.traverse(async function(child) {
        if (!child.isMesh) return;

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

    material = null;
};

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

ripe.CSRAssetManager.prototype.disposeScene = async function(scene) {
    if (scene.environment) scene.environment.dispose();

    const self = this;

    await scene.traverse(async function(child) {
        if (child.type.includes("Light")) child = null;
        if (child !== null && child.isMesh) await self.disposeMesh(child);
        scene.remove(child);
    });
};

/**
 * Disposes all the stored resources to avoid memory leaks. Includes meshes,
 * geometries and materials.
 */
ripe.CSRAssetManager.prototype.disposeResources = async function(scene) {
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
    this.loadedGltf = null;
    this.library = null;

    console.log("Finished disposing " + count + " textures.");
};

ripe.CSRAssetManager.prototype.setMaterials = async function(parts) {
    for (var part in parts) {
        if (part === "shadow") continue;

        var material = parts[part].material;
        var color = parts[part].color;
        var newMaterial = await this._loadMaterial(part, material, color);

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

        // console.log("\nChanging material for part " + part + " to " + color + " " + material)
    }
};

ripe.CSRAssetManager.prototype._loadMaterial = async function(part, material, color) {
    var materialConfig;

    // If specific model doesn't exist, fallback to general parameters
    if (!this.modelConfig[part][material]) {
        materialConfig = this.modelConfig.general[material][color];
    } else materialConfig = this.modelConfig[part][material][color];

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
                    this.textureLoader.load(mapPath, function(texture) {
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

ripe.CSRAssetManager.prototype.setupEnvironment = async function(scene, renderer) {
    this.pmremGenerator = new this.library.PMREMGenerator(renderer);
    var environmentMapPath = this.assetsPath + "environments/" + this.environment + ".hdr";

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