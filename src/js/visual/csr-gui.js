if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    const base = require("../base");
    // eslint-disable-next-line no-redeclare
    // eslint-disable-next-line no-var
    var ripe = base.ripe;
}

/**
 * @class
 * @classdesc Class that defines the client side renderer that supports
 * the ConfiguratorCSR class. Stores and executes all logic for the
 * rendering, including loading meshes and materials, as well as setting
 * up the scene to be used.
 *
 * @param {ConfiguratorCSR} configurator The base configurator.
 * @param {Object} options The options to be used to configure the
 * renderer instance to be created.
 */
ripe.GUI = function(csr, options) {
    this.guiLib = options.dat === undefined ? null : options.dat;
    this.csr = csr;
};

ripe.GUI.prototype = ripe.build(ripe.Observable.prototype);
ripe.GUI.prototype.constructor = ripe.GUI;

/**
 * Creates the debug GUI for the post processing pipeline, with support
 * for dynamic change of the render pass parameters.
 */
ripe.GUI.prototype.setup = function() {
    if (this.guiLib === null) return;

    const self = this;

    this.gui = new this.guiLib.GUI({ width: 300 });

    this.gui.domElement.id = "gui";

    const updateShadows = (param, value) => {
        this.csr.keyLight.shadow[param] = value;
        this.csr.rimLight.shadow[param] = value;
        this.csr.fillLight.shadow[param] = value;
        this.csr.render();
    };

    const updateRenderer = (param, value) => {
        this.csr.renderer[param] = value;
        this.csr.render();
    };

    const folder = this.gui.addFolder("Render Settings");
    folder
        .add(this.csr.renderer, "toneMappingExposure", 0.0, 4.0)
        .name("Exposure")
        .onChange(function(value) {
            updateRenderer("toneMappingExposure", value);
        });
    folder
        .add(this.csr.keyLight.shadow, "bias", -0.005, 0.005)
        .step(0.0001)
        .name("Shadow Bias")
        .onChange(function(value) {
            updateShadows("bias", value);
        });
    folder
        .add(this.csr.keyLight.shadow, "radius", 1, 10)
        .step(1)
        .name("Shadow Radius")
        .onChange(function(value) {
            updateShadows("radius", value);
        });
    folder
        .add(this.csr, "_wireframe")
        .name("Enable Wireframe Mode")
        .onChange(function(value) {
            self.csr.updateWireframe(value);
            self.csr.render();
        });
    folder.open();
};

ripe.GUI.prototype.setupBloom = function(bloomEffect) {
    const self = this;

    const folderBloom = this.gui.addFolder("Bloom Pass");

    folderBloom
        .add(bloomEffect.luminanceMaterial, "threshold", 0.0, 1.0)
        .step(0.01)
        .name("Threshold")
        .onChange(function(value) {
            bloomEffect.luminanceMaterial.threshold = value;
            self.csr.render();
        });
    folderBloom
        .add(bloomEffect, "intensity", 0.0, 3.0)
        .step(0.01)
        .name("Intensity")
        .onChange(function(value) {
            bloomEffect.intensity = value;
            self.csr.render();
        });
    folderBloom
        .add(bloomEffect.blendMode.opacity, "value", 0.0, 1.0)
        .step(0.01)
        .step(0.01)
        .name("Opacity")
        .onChange(function(value) {
            bloomEffect.blendMode.opacity.value = value;
            self.csr.render();
        });

    folderBloom.open();
};

ripe.GUI.prototype.setupAA = function(lib, aaEffect) {
    const folderAA = this.gui.addFolder("SMAA Pass");
    const edgeDetectionMaterial = aaEffect.edgeDetectionMaterial;

    const self = this;

    const SMAAMode = {
        DEFAULT: 0,
        SMAA_EDGES: 1,
        SMAA_WEIGHTS: 2
    };

    const params = {
        smaa: {
            mode: SMAAMode.DEFAULT,
            preset: lib.SMAAPreset.HIGH,
            opacity: aaEffect.blendMode.opacity.value,
            "blend mode": aaEffect.blendMode.blendFunction
        },
        edgeDetection: {
            mode: Number(edgeDetectionMaterial.defines.EDGE_DETECTION_MODE),
            "contrast factor": Number(
                edgeDetectionMaterial.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR
            ),
            threshold: Number(edgeDetectionMaterial.defines.EDGE_THRESHOLD)
        },
        predication: {
            mode: Number(edgeDetectionMaterial.defines.PREDICATION_MODE),
            threshold: Number(edgeDetectionMaterial.defines.PREDICATION_THRESHOLD),
            strength: Number(edgeDetectionMaterial.defines.PREDICATION_STRENGTH),
            scale: Number(edgeDetectionMaterial.defines.PREDICATION_SCALE)
        }
    };

    folderAA.add(params.smaa, "preset", lib.SMAAPreset).onChange(() => {
        aaEffect.applyPreset(Number(params.smaa.preset));
        params.edgeDetection.threshold = Number(edgeDetectionMaterial.defines.EDGE_THRESHOLD);
        self.csr.render();
    });

    let subfolder = folderAA.addFolder("Edge Detection");

    subfolder.add(params.edgeDetection, "mode", lib.EdgeDetectionMode).onChange(() => {
        edgeDetectionMaterial.setEdgeDetectionMode(Number(params.edgeDetection.mode));
        self.csr.render();
    });

    subfolder
        .add(params.edgeDetection, "contrast factor")
        .min(1.0)
        .max(3.0)
        .step(0.01)
        .onChange(() => {
            edgeDetectionMaterial.setLocalContrastAdaptationFactor(
                Number(params.edgeDetection["contrast factor"])
            );
            self.csr.render();
        });

    subfolder
        .add(params.edgeDetection, "threshold")
        .min(0.0)
        .max(0.5)
        .step(0.0001)
        .onChange(() => {
            edgeDetectionMaterial.setEdgeDetectionThreshold(Number(params.edgeDetection.threshold));
            self.csr.render();
        })
        .listen();

    subfolder = folderAA.addFolder("Predicated Thresholding");

    subfolder.add(params.predication, "mode", lib.PredicationMode).onChange(() => {
        edgeDetectionMaterial.setPredicationMode(Number(params.predication.mode));
        self.csr.render();
    });

    subfolder
        .add(params.predication, "threshold")
        .min(0.0)
        .max(0.5)
        .step(0.0001)
        .onChange(() => {
            edgeDetectionMaterial.setPredicationThreshold(Number(params.predication.threshold));
            self.csr.render();
        });

    subfolder
        .add(params.predication, "strength")
        .min(0.0)
        .max(1.0)
        .step(0.0001)
        .onChange(() => {
            edgeDetectionMaterial.setPredicationStrength(Number(params.predication.strength));
            self.csr.render();
        });

    subfolder
        .add(params.predication, "scale")
        .min(1.0)
        .max(5.0)
        .step(0.01)
        .onChange(() => {
            edgeDetectionMaterial.setPredicationScale(Number(params.predication.scale));
            self.csr.render();
        });

    folderAA
        .add(params.smaa, "opacity")
        .min(0.0)
        .max(1.0)
        .step(0.01)
        .onChange(() => {
            aaEffect.blendMode.opacity.value = params.smaa.opacity;
            self.csr.render();
        });

    folderAA.add(params.smaa, "blend mode", lib.BlendFunction).onChange(() => {
        aaEffect.blendMode.setBlendFunction(Number(params.smaa["blend mode"]));
        self.csr.render();
    });

    folderAA.open();
};
