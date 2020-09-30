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

ripe.CSRAssetManager = function (options, renderer, scene) {
    this.assetsPath = options.assetsPath;
    this.library = options.library;

    this.assetsPath = options.assetsPath || "";
    this.loadedTextures = {};
    this.environment = options.environment;
    this.environmentTexture = null;
    this.textureLoader = new this.library.TextureLoader();

    this.fontsPath = options.fontsPath || "";
    this.fontType = options.fontType || "";
    this.fontWeight = options.fontWeight || "";
    this.loadedFonts = {};
    this.letterMaterial = null;
    this.loadedLetterMaterials = {};
    this.textSize = options.textSize || 1;
    this.textHeight = options.textHeight || 0.1;
    this.initialsPositions = {};
        
    this.meshes = {};
    this.meshPath = options.meshPath;
    this.textMeshes = [];
    
    this.loadedGltf = undefined;

    this._initializeFonts(this.fontType, this.fontWeight);
    this.pmremGenerator = new this.library.PMREMGenerator(renderer);
    this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
}

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
    this.meshPath = options.meshPath === undefined ? this.meshPath : options.meshPath;
}

ripe.CSRAssetManager.prototype.createLetter = function (letter) {
    var textGeometry = new this.library.TextGeometry(letter, {
        font: this.loadedFonts[this.fontType + "_" + this.fontWeight],

        size: size,
        height: height,
        curveSegments: 10
    });

    textGeometry = new this.library.BufferGeometry().fromGeometry(textGeometry);

    letterMesh = new this.library.Mesh(textGeometry, this.letterMaterial);

    // rotates geometry to negate default text rotation
    letterMesh.geometry.rotateX(-Math.PI / 2);
    letterMesh.geometry.rotateY(Math.PI / 2);

    letterMesh.geometry.center();

    this.textMeshes.push(letterMesh);

    return letterMesh;
}

ripe.CSRAssetManager.prototype.disposeLastLetter = function () {
    this.textMeshes[this.textMeshes.length - 1].geometry.dispose();
    this.textMeshes.pop();
}

ripe.CSRAssetManager.prototype._applyDefaults = function () {
    const defaultMaterial = new this.library.MeshStandardMaterial({ color: "#ffffff" });
    defaultMaterial.perPixel = true;

    for (var mesh in this.meshes) {
        if (!this.meshes[mesh].name.includes("initials")) {
            if (this.meshes[mesh].material) this.meshes[mesh].material.dispose();

            this.meshes[mesh].material = defaultMaterial;
        }
    }
};


ripe.CSRAssetManager.prototype._loadMesh = async function () {
    const gltfLoader = new this.library.GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(this.meshPath, gltf => {
            resolve(gltf);
        });
    });

    this.loadedGltf = gltf;
    
    const model = gltf.scene.children[0];
    
    await this._loadSubMeshes(model);
};


ripe.CSRAssetManager.prototype._loadSubMeshes = function (model) {
    const floorGeometry = new this.library.PlaneBufferGeometry(10, 10);
    floorGeometry.rotateX(-Math.PI / 2);
    floorGeometry.center();
    const floorMaterial = new this.library.ShadowMaterial();
    floorMaterial.opacity = 0.5;

    var box = new this.library.Box3().setFromObject(model);
    
    this.floorMesh = new this.library.Mesh(floorGeometry, floorMaterial);
    // this.floorMesh.rotation.x = Math.PI / 2;
    this.floorMesh.receiveShadow = true;
    this.floorMesh.position.y = box.min.y;

    const centerX = box.min.x + (box.max.x - box.min.x) / 2.0;
    const centerZ = box.min.z + (box.max.z - box.min.z) / 2.0;
    //var centerX = 0;
    //var centerZ = 0;

    for (let i = 0; i < model.children.length; i++) {
        const child = model.children[i];
        //console.log(child);
        //var box = new this.library.Box3().setFromObject(child);
        //console.log(box)
        if (!child.isMesh) continue;

        child.matrixAutoUpdate = false;

        if (child.name.includes("initials_part")) {
            child.position.set(
                child.position.x - centerX,
                child.position.y,
                child.position.z - centerZ
            );

            // naming is of the type "initials_part_1", where 1 indicates the position
            var initialPosition = parseInt(child.name.split("_")[2]);
            // We do not add to the meshes, as this mesh only exists to guide the initials
            // locations
            this.initialsPositions[initialPosition] = child;
            child.visible = false;
            if (child.material) child.material.dispose();
        } else {
            child.position.set(
                child.position.x - centerX,
                child.position.y,
                child.position.z - centerZ
            );
            child.castShadow = true;
            child.receiveShadow = true;
            
            // remove "_part" from string
            this.meshes[child.name.split("_")[0]] = child;
        }
    }

};

/**
 * Disposes all the stored resources to avoid memory leaks. Includes meshes,
 * geometries and materials.
 */
ripe.CSRAssetManager.prototype._disposeResources = function (scene) {
    console.log("Disposing Resources");
    this.pmremGenerator.dispose();

    if (this.meshes) {
        for (var mesh in this.meshes) {
            scene.remove(this.meshes[mesh]);
            this.meshes[mesh].geometry.dispose();
            this.meshes[mesh].material.dispose();
        }
    }
    if (this.textMeshes) {
        for (let i = 0; i < this.textMeshes.length; i++) {
            scene.remove(this.textMeshes[i]);
            this.textMeshes[i].geometry.dispose();
            this.textMeshes[i].material.dispose();
        }
    }
    if (this.loadedTextures) {
        for (var texture in this.loadedTextures) {
            this.loadedTextures[texture].dispose();
        }
    }
    this.loadedGltf.scene.dispose();
};

ripe.CSRAssetManager.prototype._getLetterMaterial = async function () {
    if (this.owner.engraving !== null && !this.owner.engraving.includes("viewport")) {
        this.engraving = this.owner.engraving;
    }

    var splitProps = this.engraving.split("::");
    var material, type;

    if (splitProps[0] === "style") {
        material = splitProps[1].split("_")[0];
        type = splitProps[1].split("_")[1];
    } else {
        material = splitProps[0].split("_")[0];
        type = splitProps[0].split("_")[1];
    }

    var diffuseMapPath = this.assetsPath + "textures/general/" + material + "/" + this.owner.brand + "_" + material + "_" + type + ".png";

    // TODO Add roughness map path if it exists
    // var roughnessMapPath = this.getTexturePath(material, color, "roughness", true);
    const diffuseTexture = await new Promise((resolve, reject) => {
        this.textureLoader.load(diffuseMapPath, function (texture) {
            resolve(texture);
        });
    });

    /*
    const roughnessTexture = await new Promise((resolve, reject) => {
        textureLoader.load(diffuseMapPath, function (texture) {
            resolve(texture);
        });
    }); */

    return new this.library.MeshStandardMaterial({
        map: diffuseTexture,
        roughness: 0.0
    });
};

ripe.CSRAssetManager.prototype.loadMaterials = async function (parts) {
    for (var part in parts) {
        if (part === "shadow") continue;

        var material = parts[part].material;
        var color = parts[part].color;
        console.log("for part " + part + " apply " + material + " " + color);
        await this._loadMaterial(material, color);
    }
};

ripe.CSRAssetManager.prototype._loadTexturesAndMaterials = async function (scene) {
    if (this.environment) this._setupEnvironment(scene);

    this.crossfadeShader = new this.library.ShaderMaterial({
        uniforms: {
            tDiffuse1: {
                type: "t",
                value: null
            },
            tDiffuse2: {
                type: "t",
                value: null
            },
            mixRatio: {
                type: "f",
                value: 0.0
            }
        },
        vertexShader: [
            "varying vec2 vUv;",

            "void main() {",

            "     vUv = vec2( uv.x, uv.y );",
            "     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"
        ].join("\n"),
        fragmentShader: [
            "uniform float mixRatio;",

            "uniform sampler2D tDiffuse1;",
            "uniform sampler2D tDiffuse2;",

            "varying vec2 vUv;",

            "void main() {",

            "    vec4 texel1 = texture2D( tDiffuse1, vUv );",
            "    vec4 texel2 = texture2D( tDiffuse2, vUv );",

            "    gl_FragColor = mix( texel1, texel2, mixRatio );",

            "}"
        ].join("\n")
    });
};

ripe.CSRAssetManager.prototype._loadMaterial = async function (material, color) {
    //return new this.library.MeshStandardMaterial({ color: "#00FF0F" });
    await Promise.all([this._loadTexture(material, color), this._loadTexture(material, "normal"), this._loadTexture(material, "occlusion"), this._loadTexture(material, "disp"), this._loadTexture(material, color + "_spec")]);

    const diffuseTexture = this.loadedTextures[material + "_" + color];
    const normalTexture = this.loadedTextures[material + "_" + "normal"];
    const aoTexture = this.loadedTextures[material + "_" + "occlusion"];
    const displacementTexture = this.loadedTextures[material + "_" + "disp"];
    const roughnessTexture = this.loadedTextures[material + "_" + color + "_spec"];

    const newMaterial = new this.library.MeshStandardMaterial();

    var debug = " material " + material + " " + color;

    if (diffuseTexture) {
        newMaterial.map = diffuseTexture;
        debug += " has diffuse";
    }

    if (roughnessTexture) {
        //newMaterial.roughnessMap = roughnessTexture;
        debug += ", has roughness";
    }

    if (normalTexture) {
        newMaterial.normalMap = normalTexture;
        debug += ", has normal";
    }

    if (aoTexture) {
        newMaterial.aoMap = aoTexture;
        debug += ", has ao";
    }

    if (displacementTexture) {
        //newMaterial.displacementMap = displacementTexture;
        debug += ", has displacement";
    }

    newMaterial.perPixel = true;
    //console.log(debug)

    return newMaterial;
};

ripe.CSRAssetManager.prototype._loadTexture = async function (material, type) {
    if (this.loadedTextures[material + "_" + type])
        return this.loadedTextures[material + "_" + type];


    var generalMapPath = this.assetsPath + "textures/general/" + material + "/" + this.owner.brand + "_" + material + "_" + type + ".png";
    var specificMapPath = this.assetsPath + "textures/" + this.owner.model + "/" + material + "/" + this.owner.brand + "_" + this.owner.model + "_" + material + "_" + type + ".png";

    var texture;
    texture = await new Promise((resolve, reject) => {
        this.textureLoader.load(
            specificMapPath,
            function (texture) {
                resolve(texture);
            },
            undefined,
            function (err) {
                resolve(undefined)
            });
    });


    if (!texture) {
        texture = await new Promise((resolve, reject) => {
            this.textureLoader.load(
                generalMapPath,
                function (texture) {
                    resolve(texture);
                },
                undefined,
                function (err) {
                    resolve(undefined)
                });
        });
    };

    if (texture) {
        texture.anisotropy = this.maxAnisotropy;
        texture.minFilter = this.library.NearestMipmapNearestFilter;
        this.loadedTextures[material + "_" + type] = texture;
    }

    return texture;
}

ripe.CSRAssetManager.prototype._applyMaterial = async function (part, material, color) {
    const newMaterial = await this._loadMaterial(material, color);
    for (var mesh in this.meshes) {
        if (mesh === part) {
            this.meshes[mesh].material.dispose();
            this.meshes[mesh].material = newMaterial;
        }
    }
};

ripe.CSRAssetManager.prototype._setupEnvironment = async function (scene) {
    var environmentMapPath = this.assetsPath + "environments/" + this.environment + ".hdr";

    const rgbeLoader = new this.library.RGBELoader();
    const texture = await new Promise((resolve, reject) => {
        rgbeLoader.setDataType(this.library.UnsignedByteType).load(environmentMapPath, texture => {
            resolve(texture);
        });
    });

    
    this.pmremGenerator.compileEquirectangularShader();
    this.environmentTexture = this.pmremGenerator.fromEquirectangular(texture).texture;

    scene.background = this.environmentTexture;
    scene.environment = this.environmentTexture;

    texture.dispose();
};

ripe.CSRAssetManager.prototype._initializeFonts = async function (type, weight) {
    const loader = new this.library.FontLoader();
    const newFont = await new Promise((resolve, reject) => {
        loader.load(this.fontsPath + type + "/" + weight + ".json", function (font) {
            resolve(font);
        });
    });

    this.loadedFonts[type + "_" + weight] = newFont;
};