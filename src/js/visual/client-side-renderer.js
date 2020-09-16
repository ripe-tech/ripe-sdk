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
 * @classdesc Class that defines the client sider renderer that supports
 * the ConfiguratorCSR class. Stores and executes all logic for the
 * rendering, including loading meshes and materials, as well as setting
 * up the scene to be used.
 *
 * @param {Object} owner The owner (customizer instance) for
 * this configurator.
 * @param {Object} element The DOM element in which the renderer will
 * render to.
 * @param {Object} options The options to be used to configure the
 * renderer instance to be created.
 */
ripe.CSRenderer = function(owner, element, options) {
    this.type = this.type || "CSRenderer";
    this.element = element;
    this.owner = owner;

    this.library = options.library;
    this.library = options.library || null;
    this.cameraTarget = new this.library.Vector3(
        options.cameraTarget.x,
        options.cameraTarget.y,
        options.cameraTarget.z
    );
    this.cameraFOV = options.cameraFOV;

    // materials
    this.texturesPath = options.texturesPath || "";
    this.partsMap = options.partsMap || {};
    this.loadedMaterials = {};

    this.meshPath = options.meshPath;

    this.raycaster = new this.library.Raycaster();
    this.intersectedPart = "";

    this.cameraDistance = options.cameraDistance || 0;
    this.cameraHeight = options.cameraHeight || 0;
    this.exposure = options.exposure || 3.0;

    this.useMasks = options.useMasks || true;

    // initialize all ThreeJS components
    this._initializeLights();
    this._initializeCamera();
    this._initializeRenderer();
    this._initializeMesh();
    this._registerHandlers();
};

ripe.CSRenderer.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRenderer.prototype.constructor = ripe.CSRenderer;

ripe.CSRenderer.prototype.updateOptions = async function(options) {
    if (options.meshPath && this.meshPath !== options.meshPath) {
        this.meshPath = options.meshPath;
        this._initializeMesh();
    }

    // TODO Add the rest here
};

ripe.CSRenderer.prototype._registerHandlers = function() {
    const self = this;
    const area = this.element.querySelector(".area");

    area.addEventListener("mousemove", function(event) {
        event = ripe.fixEvent(event);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed

        if (self.down === true) {
            self.lowlight();
            return;
        }

        self._attemptRaycast(event);
    });
};

ripe.CSRenderer.prototype._initializeLights = function() {
    const keyLight = new this.library.PointLight(0xffffff, 2.2, 18);
    keyLight.position.set(2, 2, 2);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.000001;
    keyLight.shadow.camera.far = 10;
    // keyLight.shadow.radius = 8;

    const fillLight = new this.library.PointLight(0xffffff, 1.1, 18);
    fillLight.position.set(-2, 1, 2);
    fillLight.castShadow = true;
    fillLight.shadow.camera.near = 0.000001;
    fillLight.shadow.camera.far = 10;
    // fillLight.shadow.radius = 8;

    const rimLight = new this.library.PointLight(0xffffff, 3.1, 18);
    rimLight.position.set(-1, 1.5, -3);
    rimLight.castShadow = true;
    rimLight.shadow.camera.near = 0.000001;
    rimLight.shadow.camera.far = 10;
    // rimLight.shadow.radius = 8;

    const ambientLight = new this.library.AmbientLight(0xffffff, 0.1);

    this.lights = [keyLight, fillLight, rimLight, ambientLight];
};

ripe.CSRenderer.prototype._initializeRenderer = function() {
    // creates the renderer using the "default" WebGL approach
    // notice that the shadow map is enabled
    this.renderer = new this.library.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(this.element.clientWidth, this.element.clientHeight);

    this.renderer.toneMappingExposure = this.exposure;
    this.renderer.toneMapping = this.library.CineonToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.library.BasicShadowMap;

    const area = this.element.querySelector(".area");

    area.appendChild(this.renderer.domElement);
};

ripe.CSRenderer.prototype._initializeCamera = function() {
    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;

    this.camera = new this.library.PerspectiveCamera(this.cameraFOV, width / height, 1, 20000);
    this.camera.position.set(0, this.cameraHeight, this.cameraDistance);

    if (this.element.dataset.view === "side") {
        // TODO Use previous position
        this._currentVerticalRot = 0;
        this.verticalRot = 0;
    } else if (this.element.dataset.view === "top") {
        this._currentVerticalRot = Math.PI / 2;
        this.verticalRot = Math.PI / 2;
    }
};

ripe.CSRenderer.prototype._initializeMesh = async function() {
    const gltfLoader = new this.library.GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(this.meshPath, gltf => {
            resolve(gltf);
        });
    });

    const model = gltf.scene;

    const box = new this.library.Box3().setFromObject(model);

    const floorGeometry = new this.library.PlaneGeometry(100, 100);
    const floorMaterial = new this.library.ShadowMaterial();
    floorMaterial.opacity = 0.5;

    this.floorMesh = new this.library.Mesh(floorGeometry, floorMaterial);
    this.floorMesh.rotation.x = Math.PI / 2;
    this.floorMesh.receiveShadow = true;
    this.floorMesh.position.y = box.min.y;

    model.castShadow = true;

    const centerX = box.min.x + (box.max.x - box.min.x) / 2.0;
    const centerZ = box.min.z + (box.max.z - box.min.z) / 2.0;

    this.camera.lookAt(this.cameraTarget);

    this.meshes = {};
    for (let i = 0; i < model.children.length; i++) {
        if (model.children[i].isMesh) {
            model.children[i].geometry.translate(-centerX, 0, -centerZ);
            model.children[i].castShadow = true;
            model.children[i].receiveShadow = true;

            // remove "_part" from string
            this.meshes[model.children[i].name.split("_")[0]] = model.children[i];
        }
    }

    // Load default material
    await this._initializeTexturesAndMaterials();
    this._applyDefaults();
    // Only now can we populate the scene safely
    this.scene = new this.library.Scene();
    this.populateScene(this.scene);

    // TODO set initial camera positions
    // this._setPositionalRotations();

    this.render();
};

ripe.CSRenderer.prototype._applyDefaults = function() {
    for (var mesh in this.meshes) {
        this.meshes[mesh].material.dispose();
        this.meshes[mesh].material = this.loadedMaterials.default.clone();
    }
};

ripe.CSRenderer.prototype.render = function() {
    if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
    }
};

ripe.CSRenderer.prototype._linearTween = function(currentTime, startValue, endValue, duration) {
    var change = endValue - startValue;
    return (change * currentTime) / duration + startValue;
};

ripe.CSRenderer.prototype._attemptRaycast = function(mouseEvent) {
    const animating = this.element.classList.contains("animating");
    const dragging = this.element.classList.contains("drag");

    if (!this.elementBoundingBox || animating || dragging) return;

    const mouse = this._getNormalizedCoordinatesRaycast(mouseEvent);

    if (this.raycaster && this.scene) {
        this.raycaster.setFromCamera(mouse, this.camera);

        var intersects = this.raycaster.intersectObjects(this.scene.children);
        if (intersects.length > 0) {
            if (this.intersectedPart !== intersects[0].object.name) {
                if (this.intersectedPart !== "") {
                    this.lowlight();
                }
                this.intersectedPart = intersects[0].object.name;
                this.highlight(this.intersectedPart);
            }
        } else {
            if (this.intersectedPart !== "") {
                this.lowlight();
            }
        }
    }
};

/**
 * Highlights a model's part, showing a dark mask on top of the such referred
 * part identifying its borders.
 *
 * @param {String} part The part of the model that should be highlighted.
 * @param {Object} options Set of optional parameters to adjust the highlighting.
 */
ripe.CSRenderer.prototype.highlight = async function(part, options = {}) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // TODO Use time here
    var duration = 100;

    await this.changeHighlight(part, 1.0, 0.5, duration);

    // triggers an event indicating that a highlight operation has been
    // performed on the current configurator
    this.trigger("highlighted");
};

/**
 * Removes the a highlighting of a model's part, meaning that no masks
 * are going to be presented on screen.
 *
 * @param {String} part The part to lowlight.
 * @param {Object} options Set of optional parameters to adjust the lowlighting.
 */
ripe.CSRenderer.prototype.lowlight = async function(options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately

    // const test = new TimelineMax({paused: true});
    if (!this.useMasks) {
        return;
    }

    // There's no intersection
    if (this.intersectedPart === "") {
        return;
    }

    var duration = 100;

    await this.changeHighlight(this.intersectedPart, 0.5, 1.0, duration);

    this.intersectedPart = "";

    // triggers an event indicating that a lowlight operation has been
    // performed on the current configurator
    this.trigger("lowlighted");
};

ripe.CSRenderer.prototype.changeHighlight = async function(part, startValue, endValue, duration) {
    var startingValue = startValue;
    var meshTarget = null;

    var startTime = Date.now();
    var currentTime = 0;

    for (var mesh in this.meshes) {
        if (this.meshes[mesh].name === part) {
            meshTarget = this.meshes[mesh];
            startingValue = meshTarget.material.color.r;
        }
    }

    var currentValue = startingValue;

    const changeHighlightTransition = () => {
        if (!meshTarget) return;

        meshTarget.material.color.r = currentValue;
        meshTarget.material.color.g = currentValue;
        meshTarget.material.color.b = currentValue;

        currentTime = Date.now() - startTime;
        currentValue = this._linearTween(currentTime, startingValue, endValue, duration);

        this.render();

        if (currentTime < duration) requestAnimationFrame(changeHighlightTransition);
    };

    requestAnimationFrame(changeHighlightTransition);
};

/**
 * Disposes all the stored resources to avoid memory leaks. Includes meshes,
 * geometries and materials.
 */
ripe.CSRenderer.prototype._disposeResources = function() {
    if (this.meshes) {
        for (var mesh in this.meshes) {
            this.scene.remove(this.meshes[mesh]);
            this.meshes[mesh].geometry.dispose();
            this.meshes[mesh].material.dispose();
        }
    }
    if (this.loadedMaterials) {
        for (var material in this.loadedMaterials) {
            this.loadedMaterials[material].dispose();
        }
    }
};

ripe.CSRenderer.prototype._assignMaterials = async function() {
    for (var part in this.owner.parts) {
        if (part === "shadow") continue;

        var material = this.owner.parts[part].material;
        var color = this.owner.parts[part].color;
        await this._loadMaterial(material, color);
    }
};

ripe.CSRenderer.prototype._initializeTexturesAndMaterials = async function() {
    this.loadedMaterials.default = new this.library.MeshPhongMaterial({ color: "#ffffff" });

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

ripe.CSRenderer.prototype._loadMaterial = async function(material, color) {
    // Loadedmaterials store threejs materials in the format
    if (this.loadedMaterials[material + "_" + color]) {
        return;
    }

    const textureLoader = new this.library.TextureLoader();

    var diffuseMapPath = this.getTexturePath(material, color, "diffuse");
    var roughnessMapPath = this.getTexturePath(material, color, "roughness");
    var normalMapPath = this.getTexturePath(material, color, "normal");
    var aoMapPath = this.getTexturePath(material, color, "ao");

    const diffuseTexture = await new Promise((resolve, reject) => {
        textureLoader.load(diffuseMapPath, function(texture) {
            resolve(texture);
        });
    });

    const roughnessTexture = await new Promise((resolve, reject) => {
        textureLoader.load(roughnessMapPath, function(texture) {
            resolve(texture);
        });
    });

    const normalTexture = await new Promise((resolve, reject) => {
        textureLoader.load(normalMapPath, function(texture) {
            resolve(texture);
        });
    });

    const aoTexture = await new Promise((resolve, reject) => {
        textureLoader.load(aoMapPath, function(texture) {
            resolve(texture);
        });
    });

    diffuseTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    roughnessTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    normalTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    aoTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    diffuseTexture.minFilter = this.library.NearestMipmapNearestFilter;
    roughnessTexture.minFilter = this.library.NearestMipmapNearestFilter;
    normalTexture.minFilter = this.library.NearestMipmapNearestFilter;
    aoTexture.minFilter = this.library.NearestMipmapNearestFilter;

    const defaultMaterial = new this.library.MeshStandardMaterial({
        map: diffuseTexture,
        roughnessMap: roughnessTexture,
        normalMap: normalTexture,
        aoMap: aoTexture
    });

    // Dispose of textures, as they are already stored
    diffuseTexture.dispose();
    roughnessTexture.dispose();
    normalTexture.dispose();
    aoTexture.dispose();

    this.loadedMaterials[material + "_" + color] = defaultMaterial;
};

ripe.CSRenderer.prototype._applyMaterial = function(part, material) {
    for (var mesh in this.meshes) {
        if (mesh === part) {
            this.meshes[mesh].material.dispose();
            this.meshes[mesh].material = material.clone();
        }
    }
};

ripe.CSRenderer.prototype.getTexturePath = function(materialName, color, type) {
    return this.texturesPath + materialName + "/" + color + "/" + type + ".jpg";
};

ripe.CSRenderer.prototype.populateScene = function(scene) {
    for (let i = 0; i < this.lights.length; i++) {
        scene.add(this.lights[i]);
    }
    for (var mesh in this.meshes) {
        scene.add(this.meshes[mesh]);
    }
    // scene.add(this.floorMesh);
};

ripe.CSRenderer.prototype._getNormalizedCoordinatesRaycast = function(mouseEvent) {
    // Origin of the coordinate system is the center of the element
    // Coordinates range from -1,-1 (bottom left) to 1,1 (top right)
    const newX =
        ((mouseEvent.x - this.elementBoundingBox.x) / this.elementBoundingBox.width) * 2 - 1;
    const newY =
        -(
            (mouseEvent.y - this.elementBoundingBox.y + window.scrollY) /
            this.elementBoundingBox.height
        ) *
            2 +
        1;

    return {
        x: newX,
        y: newY
    };
};

ripe.CSRenderer.prototype.updateElementBoundingBox = function() {
    // Raycaster needs accurate positions of the element, needs to be
    // updated on every window resize event
    if (this.element) {
        this.elementBoundingBox = this.element.getBoundingClientRect();
    }
};

ripe.CSRenderer.prototype.crossfade = async function(options = {}) {
    var renderTargetParameters = {
        minFilter: this.library.LinearFilter,
        magFilter: this.library.LinearFilter,
        format: this.library.RGBAFormat
    };

    var width = this.elementBoundingBox.width;
    var height = this.elementBoundingBox.height;

    var transitionCamera = new this.library.OrthographicCamera(
        -width / 2,
        width / 2,
        height / 2,
        -height / 2,
        -100,
        100
    );

    // transitionCamera = new this.library.PerspectiveCamera(this.cameraFOV, width / height, 1, 20000);

    transitionCamera.position.x = this.camera.position.x;
    transitionCamera.position.y = this.camera.position.y;
    transitionCamera.position.z = this.camera.position.z;
    // transitionCamera.lookAt(this.cameraTarget);

    var previousSceneFBO = new this.library.WebGLRenderTarget(
        width,
        height,
        renderTargetParameters
    );

    var currentSceneFBO = new this.library.WebGLRenderTarget(width, height, renderTargetParameters);

    var duration = 24;
    var currentTime = 0;
    var mixRatio = 0.0;

    this.crossfadeShader.uniforms.tDiffuse1.value = previousSceneFBO.texture;
    this.crossfadeShader.uniforms.tDiffuse2.value = currentSceneFBO.texture;
    this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

    var quadGeometry = new this.library.PlaneBufferGeometry(width, height);
    var quad = new this.library.Mesh(quadGeometry, this.crossfadeShader);
    quad.position.z = 1;
    this.scene.add(quad);

    // Store current image
    this.renderer.setRenderTarget(previousSceneFBO);
    this.renderer.clear();
    this.render();

    if (options.type === "material") {
        // Update scene's materials
        for (var part in this.owner.parts) {
            if (part === "shadow") continue;

            var material = this.owner.parts[part].material;
            var color = this.owner.parts[part].color;
            this._applyMaterial(part, this.loadedMaterials[material + "_" + color]);
        }
    }

    // Render next image
    this.renderer.setRenderTarget(currentSceneFBO);
    this.renderer.clear();
    this.render();

    // Reset renderer
    this.renderer.setRenderTarget(null);
    this.renderer.clear();

    const crossfadeFunction = () => {
        this.renderer.render(this.scene, transitionCamera);

        mixRatio += 1.0 / duration;
        currentTime++;
        this.crossfadeShader.uniforms.mixRatio.value = mixRatio;

        if (currentTime < duration) requestAnimationFrame(crossfadeFunction);
        else {
            this.scene.remove(quad);
            this.element.classList.remove("animating");
            this.element.classList.remove("no-drag");
            quad.geometry.dispose();
            quad.material.dispose();
            quadGeometry.dispose();
            previousSceneFBO.dispose();
            currentSceneFBO.dispose();
        }
    };

    // Prevents transition from being initiated multiple times
    this.element.classList.add("animating");
    this.element.classList.add("no-drag");

    requestAnimationFrame(crossfadeFunction);
};

ripe.CSRenderer.prototype._rotateMeshes = function(modelRotation) {
    // var allowedRotation = this.maximumHorizontalRot - this.minimumHorizontalRot;
    for (var mesh in this.meshes) {
        this.meshes[mesh].rotation.y = ripe.deg2rad(modelRotation);
    }
};

ripe.CSRenderer.prototype._rotateCamera = function(cameraRotation) {
    var maxHeight = this.cameraDistance - this.cameraHeight;

    this.camera.position.y =
        this.cameraHeight + maxHeight * Math.sin((Math.PI / 2 / 90) * cameraRotation);
    this.camera.position.z = this.cameraDistance * Math.cos((Math.PI / 2 / 90) * cameraRotation);

    this.camera.lookAt(this.cameraTarget);
};
