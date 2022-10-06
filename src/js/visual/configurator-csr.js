if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("../base");
    require("./visual");
    // eslint-disable-next-line no-redeclare,no-var
    var ripe = base.ripe;
}

/**
 * Binds an PRC Configurator to this Ripe instance.
 *
 * @param {Configurator} element The PRC Configurator to be used by the Ripe instance.
 * @param {Object} options An Object with options to configure the Configurator instance.
 * @returns {Configurator} The Configurator instance created.
 */
ripe.Ripe.prototype.bindConfiguratorCsr = function(element, options = {}) {
    const config = new ripe.ConfiguratorCsr(this, element, options);
    return this.bindInteractable(config);
};

/**
 * @class
 * @classdesc Class that defines an interactive Configurator instance to be
 * used in connection with the main Ripe owner to provide an
 * interactive configuration experience inside a DOM.
 *
 * @param {Object} owner The owner (customizer instance) for
 * this configurator.
 * @param {Object} element The DOM element that is considered to
 * be the target for the configurator, it's going to have its own
 * inner HTML changed.
 * @param {Object} options The options to be used to configure the
 * configurator instance to be created.
 */
ripe.ConfiguratorCsr = function(owner, element, options) {
    this.type = this.type || "ConfiguratorCsr";

    ripe.Visual.call(this, owner, element, options);
};

ripe.ConfiguratorCsr.prototype = ripe.build(ripe.Visual.prototype);
ripe.ConfiguratorCsr.prototype.constructor = ripe.ConfiguratorCsr;

/**
 * The Configurator initializer, which is called whenever
 * the Configurator is going to become active.
 *
 * Sets the various values for the Configurator taking into
 * owner's default values.
 */
ripe.ConfiguratorCsr.prototype.init = function() {
    ripe.Visual.prototype.init.call(this);

    // options variables
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.size = this.options.size || null;
    this.pixelRatio =
        this.options.pixelRatio || (typeof window !== "undefined" && window.devicePixelRatio) || 2;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.duration = this.options.duration || 500;
    this.debug = this.options.debug || false;
    const debugOpts = this.options.debugOptions || {};
    const renderedInitialsOpts = debugOpts.renderedInitials || {};
    this.debugOptions = {
        framerate: debugOpts.framerate !== undefined ? debugOpts.framerate : true,
        worldAxis: debugOpts.worldAxis !== undefined ? debugOpts.worldAxis : true,
        modelAxis: debugOpts.modelAxis !== undefined ? debugOpts.modelAxis : true,
        renderedInitials: {
            axis: renderedInitialsOpts.axis !== undefined ? renderedInitialsOpts.axis : true,
            line: renderedInitialsOpts.line !== undefined ? renderedInitialsOpts.line : true,
            points: renderedInitialsOpts.points !== undefined ? renderedInitialsOpts.points : true
        }
    };
    const rendererOpts = this.options.rendererOptions || {};
    this.rendererOptions = {
        outputEncoding:
            rendererOpts.outputEncoding !== undefined
                ? rendererOpts.outputEncoding
                : window.THREE.sRGBEncoding
    };
    this.mayaScenePath = this.options.mayaScenePath || null;
    this.useDracoLoader =
        this.options.useDracoLoader !== undefined ? this.options.useDracoLoader : true;
    this.dracoLoaderDecoderPath =
        this.options.dracoLoaderDecoderPath || "https://www.gstatic.com/draco/v1/decoders/";
    this.dracoLoaderDecoderFallbackPath =
        this.options.dracoLoaderDecoderFallbackPath ||
        "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/";
    this.sceneEnvironmentPath =
        this.options.sceneEnvironmentPath ||
        "https://www.dl.dropboxusercontent.com/s/o0v07nn5egjrjl5/studio2.hdr";
    const cameraOpts = this.options.cameraOptions || {};
    this.cameraOptions = {
        fov: cameraOpts.fov !== undefined ? cameraOpts.fov : 24.678,
        filmGauge: cameraOpts.filmGauge !== undefined ? cameraOpts.filmGauge : null,
        aspect: cameraOpts.aspect !== undefined ? cameraOpts.aspect : null,
        updateAspectOnResize:
            cameraOpts.updateAspectOnResize !== undefined ? cameraOpts.updateAspectOnResize : true,
        near: cameraOpts.near !== undefined ? cameraOpts.near : 0.1,
        far: cameraOpts.far !== undefined ? cameraOpts.far : 10000,
        position: cameraOpts.position !== undefined ? cameraOpts.position : { x: 0, y: 0, z: 207 },
        rotation: cameraOpts.rotation !== undefined ? cameraOpts.rotation : { x: 0, y: 0, z: 0 },
        scale: cameraOpts.scale !== undefined ? cameraOpts.scale : { x: 1, y: 1, z: 1 },
        lookAt: cameraOpts.lookAt !== undefined ? cameraOpts.lookAt : null
    };
    const zoomOpts = this.options.zoomOptions || {};
    this.zoomOptions = {
        enabled: zoomOpts.enabled !== undefined ? zoomOpts.enabled : true,
        sensitivity: zoomOpts.sensitivity !== undefined ? zoomOpts.sensitivity : 1,
        min: zoomOpts.min !== undefined ? zoomOpts.min : 0.75,
        max: zoomOpts.max !== undefined ? zoomOpts.max : 1.5
    };
    this.enabledInitials = this.options.enabledInitials || false;
    const initialsOpts = this.options.initialsOptions || {};
    this.initialsOptions = {
        width: initialsOpts.width !== undefined ? initialsOpts.width : 3000,
        height: initialsOpts.height !== undefined ? initialsOpts.height : 300,
        options: initialsOpts.options !== undefined ? initialsOpts.options : {},
        points: initialsOpts.points !== undefined ? initialsOpts.points : [],
        position:
            initialsOpts.position !== undefined ? initialsOpts.position : { x: 0, y: 0, z: 0 },
        rotation:
            initialsOpts.rotation !== undefined ? initialsOpts.rotation : { x: 0, y: 0, z: 0 },
        scale: initialsOpts.scale !== undefined ? initialsOpts.scale : { x: 1, y: 1, z: 1 }
    };
    this.initialsBaseTexturePath = this.options.initialsBaseTexturePath || null;
    this.initialsDisplacementTexturePath = this.options.initialsDisplacementTexturePath || null;

    // multiplier to adjust the CSR initials mesh scale
    this.INITIALS_SCALE_MULTIPLIER = 0.01;

    // general state variables
    this.loading = true;
    this.noDrag = false;
    this.clock = null;
    this.animations = [];
    this.isChangeFrameAnimationRunning = false;
    this._pendingOps = [];

    // CSR variables
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.environmentTexture = null;
    this.modelGroup = null;
    this.mesh = null;

    // CSR initials variables
    this.initialsRefs = {
        renderedInitials: null,
        mesh: null,
        baseTexture: null,
        displacementTexture: null
    };

    // CSR debug variables
    this.debugRefs = {
        framerate: null,
        worldAxis: null,
        modelAxis: null,
        renderedInitials: {
            group: null,
            axis: null,
            line: null,
            points: []
        }
    };

    // handlers variables
    this.isMouseDown = false;
    this.referenceX = null;
    this.referenceY = null;
    this.prevPercentX = 0;
    this.prevPercentY = 0;

    // creates the necessary DOM elements and runs the
    // CSR initializer
    this._initLayout();
    this._initCsr().then(async () => {
        this.loading = false;
        await this.flushPending(true);
    });
};

/**
 * The Configurator deinitializer, to be called (by the owner) when
 * it should stop responding to updates so that any necessary
 * cleanup operations can be executed.
 */
ripe.ConfiguratorCsr.prototype.deinit = async function() {
    this._deinitCsr();

    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    this._removeElementHandlers();

    ripe.Visual.prototype.deinit.call(this);
};

/**
 * Updates configurator current options with the ones provided.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator.
 * @param {Boolean} update If an update operation should be executed after
 * the options updated operation has been performed.
 */
ripe.ConfiguratorCsr.prototype.updateOptions = async function(options, update = true) {
    ripe.Visual.prototype.updateOptions.call(this, options);

    this.width = options.width === undefined ? this.width : options.width;
    this.height = options.height === undefined ? this.height : options.height;
    this.size = options.size === undefined ? this.size : options.size;
    this.pixelRatio = options.pixelRatio === undefined ? this.pixelRatio : options.pixelRatio;
    this.sensitivity = options.sensitivity === undefined ? this.sensitivity : options.sensitivity;
    this.verticalThreshold =
        options.verticalThreshold === undefined
            ? this.verticalThreshold
            : options.verticalThreshold;
    this.duration = options.duration === undefined ? this.duration : options.duration;
    this.debug = options.debug === undefined ? this.debug : options.debug;
    const debugOpts = options.debugOptions || {};
    this.debugOptions = { ...this.debugOptions, ...debugOpts };
    const rendererOpts = options.rendererOptions || {};
    this.rendererOptions = { ...this.rendererOptions, ...rendererOpts };
    this.mayaScenePath =
        options.mayaScenePath === undefined ? this.mayaScenePath : options.mayaScenePath;
    this.useDracoLoader =
        options.useDracoLoader === undefined ? this.useDracoLoader : options.useDracoLoader;
    this.dracoLoaderDecoderPath =
        options.dracoLoaderDecoderPath === undefined
            ? this.dracoLoaderDecoderPath
            : options.dracoLoaderDecoderPath;
    this.dracoLoaderDecoderFallbackPath =
        options.dracoLoaderDecoderFallbackPath === undefined
            ? this.dracoLoaderDecoderFallbackPath
            : options.dracoLoaderDecoderFallbackPath;
    this.sceneEnvironmentPath =
        options.sceneEnvironmentPath === undefined
            ? this.sceneEnvironmentPath
            : options.sceneEnvironmentPath;
    const cameraOpts = options.cameraOptions || {};
    this.cameraOptions = { ...this.cameraOptions, ...cameraOpts };
    const zoomOpts = options.zoomOptions || {};
    this.zoomOptions = { ...this.zoomOptions, ...zoomOpts };
    this.enabledInitials =
        options.enabledInitials === undefined ? this.enabledInitials : options.enabledInitials;
    const initialsOpts = this.options.initialsOptions || {};
    this.initialsOptions = { ...this.initialsOptions, ...initialsOpts };
    this.initialsBaseTexturePath =
        options.initialsBaseTexturePath === undefined
            ? this.initialsBaseTexturePath
            : options.initialsBaseTexturePath;
    this.initialsDisplacementTexturePath =
        options.initialsDisplacementTexturePath === undefined
            ? this.initialsDisplacementTexturePath
            : options.initialsDisplacementTexturePath;

    if (update) await this.update();
};

/**
 * This function is called (by the owner) whenever its state changes
 * so that the Configurator can update itself for the new state.
 *
 * This method is "protected" by unique signature validation in order
 * to avoid extra render and frame loading operations. Operations are
 * available to force the update operation even if the signature is the
 * same as the one previously set.
 *
 * @param {Object} state An object containing the new state of the owner.
 * @param {Object} options Set of optional parameters to adjust the Configurator update.
 * @returns {Boolean} If an effective operation has been performed by the
 * update operation.
 */
ripe.ConfiguratorCsr.prototype.update = async function(state, options = {}) {
    const result = true;
    this.trigger("loaded");

    // returns the final result of the underlying update execution
    // to the caller method (may contain the canceled field)
    return result;
};

/**
 * This function is called (by the owner) whenever the current operation
 * in the child should be canceled this way a Configurator is not updated.
 *
 * @param {Object} options Set of optional parameters to adjust the Configurator.
 * @returns {Boolean} If an effective operation has been performed or if
 * instead no cancel logic was executed.
 */
ripe.ConfiguratorCsr.prototype.cancel = async function(options = {}) {
    return true;
};

/**
 * Resizes the configurator's DOM element to 'size' pixels. You can also specify the
 * width and height, the size applied is the more specific one.
 *
 * @param {Number} size The number of pixels to resize to.
 */
ripe.ConfiguratorCsr.prototype.resize = async function(size, width, height) {
    if (!this.element) return;

    const sizeValues = this._configuratorSize(size, width, height);

    // in case the current size of the configurator ignores the
    // request to avoid usage of unneeded resources
    if (
        this.size === sizeValues.size &&
        this.width === sizeValues.width &&
        this.height === sizeValues.height
    ) {
        return;
    }

    this._resizeCsr(sizeValues.width, sizeValues.height);
    this.size = sizeValues.size;
    this.width = sizeValues.width;
    this.height = sizeValues.height;
    await this.update(
        {},
        {
            force: true
        }
    );
};

/**
 * Executes pending operations that were not performed so as
 * to not conflict with the tasks already being executed.
 *
 * The main reason for collision is the loading operation
 * being executed (long duration operation).
 *
 * @param {Boolean} tail If only the last pending operation should
 * be flushed, meaning that the others are discarded.
 */
ripe.ConfiguratorCsr.prototype.flushPending = async function(tail = false) {
    const pending =
        tail && this._pendingOps.length > 0
            ? [this._pendingOps[this._pendingOps.length - 1]]
            : this._pendingOps;
    this._pendingOps = [];
    while (pending.length > 0) {
        const { operation, args } = pending.shift();
        switch (operation) {
            case "changeFrame":
                await this.changeFrame(...args);
                break;
            default:
                break;
        }
    }
};

/**
 * Rotates the model to match the PRC frame.
 *
 * @param {Object} frame The new PRC frame to display using the extended and canonical
 * format for the frame description (eg: side-3).
 * @param {Object} options Set of optional parameters to adjust the change frame, such as:
 * - 'duration' - The duration of the animation in milliseconds (defaults to 'null').
 * - 'stepDuration' - If defined the total duration of the animation is
 * calculated using the amount of steps times the number of steps, instead of
 * using the 'duration' field (defaults to 'null').
 * - 'revolutionDuration' - If defined the step duration is calculated by dividing
 * the revolution duration by the number of frames in the view (defaults to 'null').
 * - 'preventDrag' - If drag actions during an animated change of frames should be
 * ignored (defaults to 'true').
 * - 'safe' - If requested then the operation is only performed in case the configurator
 * is not in the an equivalent state (default to 'true').
 */
ripe.ConfiguratorCsr.prototype.changeFrame = async function(frame, options = {}) {
    // in case the scene group is not loaded then it's not possible to change the frame
    if (!this.modelGroup) throw new Error("Model group not loaded");

    // parses the requested frame value according to the pre-defined
    // standard (eg: side-3) and then unpacks it as view and position
    const _frame = ripe.parseFrameKey(frame);
    const nextView = _frame[0];
    const nextPosition = parseInt(_frame[1]);

    // in case the next position value was not properly parsed (probably undefined)
    // then it's not possible to change frame (throws exception)
    if (isNaN(nextPosition)) {
        throw new RangeError("Frame position is not defined");
    }

    // unpacks the other options to the frame change defaulting their values
    // in case undefined values are found
    let duration = options.duration !== undefined ? options.duration : null;
    let stepDuration = options.stepDuration !== undefined ? options.stepDuration : null;
    const revolutionDuration =
        options.revolutionDuration !== undefined ? options.revolutionDuration : null;
    const preventDrag = options.preventDrag !== undefined ? options.preventDrag : true;
    const safe = options.safe !== undefined ? options.safe : true;

    // retrieves the model frame object
    const frames = await this.owner.getFrames();

    // tries to retrieve the amount of frames for the target view and
    // validates that the target view exists and that the target position
    // (frame) does not overflow the amount of frames in for the view
    const viewFramesNum = frames[nextView];
    if (!viewFramesNum || nextPosition >= viewFramesNum) {
        throw new RangeError("Frame " + frame + " is not supported");
    }

    // in case the safe mode is enabled and the current configuration is
    // still under the loading situation the change frame operation is
    // saved and will be executed after the loading is finished
    if (safe && this.loading) {
        this._pendingOps = [{ operation: "changeFrame", args: [frame, options] }];
        return;
    }

    // normalizes the model group rotation values
    ripe.CsrUtils.normalizeRotations(this.modelGroup);

    // calculates step duration based on revolutionDuration defaulting to the stepDuration
    // if no revolutionDuration is specified
    stepDuration =
        revolutionDuration !== null ? parseInt(revolutionDuration / viewFramesNum) : stepDuration;

    // bases the duration on the stepDuration if stepDuration is specified
    if (stepDuration) {
        // default the step count to 1
        let stepCount = 1;

        // step count calculation logic for "side" view
        if (nextView === "side") {
            // calculates the PRC compatible step count for the change frame animation
            const radPerSide = (2 * Math.PI) / viewFramesNum;
            const rotYStart = ripe.CsrUtils.toPrecision(this.modelGroup.rotation.y);
            const rotYEnd = ripe.CsrUtils.toPrecision(nextPosition * radPerSide);
            const rotYQty = rotYEnd - rotYStart;

            // gets the number of PRC compatible steps
            stepCount = Math.abs(rotYQty / radPerSide);
        }

        // rounds up the step count to it's respective a whole number
        const stepCountRounded = Math.ceil(stepCount);

        // sets duration based on stepDuration
        duration = stepDuration * stepCountRounded;
    }

    // ensures duration default if no duration is set
    duration = duration !== null ? duration : this.duration;

    // duration value compatible with CSR animation defaulting
    // to 0 if no duration was successfully set
    duration = duration ? duration / 1000 : 0;

    // creates a change frame animation
    const animation = new ripe.CsrChangeFrameAnimation(
        this.modelGroup,
        duration,
        nextView,
        nextPosition,
        viewFramesNum
    );

    // sets the animation to clean the state when the animation finishes
    animation.onFinished = () => {
        this.isChangeFrameAnimationRunning = false;
        this.noDrag = false;
    };

    // checks for change frame animations that are already running
    const index = this.animations.findIndex(
        animation => animation.type === "CsrChangeFrameAnimation"
    );
    const runningAnimation = this.animations[index];
    if (runningAnimation) {
        // ignore this call as the running animation is the same
        if (runningAnimation.signature === animation.signature) {
            this.isChangeFrameAnimationRunning = false;
            this.noDrag = false;
            return;
        }

        // removes the running animation as the new animation is different
        this.animations.splice(index, 1);
    }

    // sets the needed state variables and adds the new animation so
    // it can be run
    this.isChangeFrameAnimationRunning = true;
    this.noDrag = preventDrag;
    this.animations.push(animation);
};

/**
 * Syncs the CSR configurator state to a PRC configurator state.
 *
 * @param {ConfiguratorPrc} prcConfigurator The PRC configurator.
 */
ripe.ConfiguratorCsr.prototype.syncFromPRC = async function(prcConfigurator) {
    // sets the CSR configurator state
    const size = prcConfigurator.element.dataset.size || prcConfigurator.size;
    const width = prcConfigurator.element.dataset.width || prcConfigurator.width || size;
    const height = prcConfigurator.element.dataset.height || prcConfigurator.height || size;
    await this.updateOptions({
        width: parseInt(width),
        height: parseInt(height),
        size: parseInt(size),
        pixelRatio: prcConfigurator.pixelRatio,
        sensitivity: prcConfigurator.sensitivity,
        verticalThreshold: prcConfigurator.verticalThreshold,
        duration: prcConfigurator.duration
    });

    // resizes the CSR configurator to match the PRC size
    await this.resize();

    // sets the CSR configurator visuals so it matches the PRC frame
    const frame = ripe.getFrameKey(prcConfigurator.view, prcConfigurator.position);
    await this.changeFrame(frame, { duration: 0 });

    // resets camera zoom to starting value
    this._setZoom(1);
};

ripe.ConfiguratorCsr.prototype.prcFrame = async function() {
    if (!this.modelGroup) return null;

    // gets PRC frames object
    const frames = await this.owner.getFrames();

    // normalizes the model group rotations
    ripe.CsrUtils.normalizeRotations(this.modelGroup);

    // converts the model group x axis rotation value to degrees
    const verticalDeg = window.THREE.MathUtils.radToDeg(this.modelGroup.rotation.x);

    // checks if CSR state is equivalent to PRC top frame
    const topDegMin = 90 - this.verticalThreshold;
    const topDegMax = 90 + this.verticalThreshold;
    const isTop = verticalDeg >= topDegMin && verticalDeg <= topDegMax;
    if (isTop && frames.top !== undefined) {
        return "top-0";
    }

    // checks if CSR state is equivalent to PRC bottom frame
    const bottomDegMin = 270 - this.verticalThreshold;
    const bottomDegMax = 270 + this.verticalThreshold;
    const isBottom = verticalDeg >= bottomDegMin && verticalDeg <= bottomDegMax;
    if (isBottom && frames.bottom !== undefined) {
        return "bottom-0";
    }

    // calculates the PRC equivalent side frame
    const framesNum = frames.side || 0;
    const radPerSide = (Math.PI * 2) / framesNum;
    const position = ripe.CsrUtils.toPrecision(this.modelGroup.rotation.y / radPerSide, 4);
    const positionRounded = Math.round(position);

    return `side-${positionRounded}`;
};

/**
 * Tries to obtain the best possible size for the configurator
 * defaulting to the client with of the element as fallback.
 *
 * @param {Number} size The number of pixels for the viewport both width and height.
 * @param {Number} width The number of pixels for the viewport width.
 * @param {Number} height The number of pixels for the viewport height.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._configuratorSize = function(size, width, height) {
    size = size || this.element.dataset.size || this.size || this.element.clientWidth;
    width = width || this.element.dataset.width || this.width || size;
    height = height || this.element.dataset.height || this.height || size;

    return {
        size: parseInt(size),
        width: parseInt(width),
        height: parseInt(height)
    };
};

/**
 * Loads a GLTF file.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @returns {THREE.Mesh} The loaded model.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._loadMeshGLTF = async function(path) {
    const loader = new window.THREE.GLTFLoader();

    if (this.useDracoLoader) {
        const dracoLoader = new window.THREE.DRACOLoader();
        try {
            dracoLoader.setDecoderPath(this.dracoLoaderDecoderPath);
            dracoLoader.preload();
        } catch (error) {
            // loader fallback
            dracoLoader.setDecoderPath(this.dracoLoaderDecoderFallbackPath);
            dracoLoader.preload();
        }
        loader.setDRACOLoader(dracoLoader);
    }

    return new Promise((resolve, reject) => {
        loader.load(path, gltf => resolve(gltf.scene));
    });
};

/**
 * Loads a mesh.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @param {String} format Mesh file format.
 * @returns {THREE.Mesh} The loaded model.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._loadMesh = async function(path, format = "gltf") {
    switch (format) {
        case "gltf":
            return await this._loadMeshGLTF(path);
        case "fbx":
            return await ripe.CsrUtils.loadFBX(path);
        default:
            throw new Error(`Can't load 3D model, format "${format}" is not supported`);
    }
};

/**
 * Loads a Maya exported fbx scene.
 *
 * @param {String} path Path to the file. Can be local path or an URL.
 * @param {String} format File format for the scene file.
 * @returns {Object} Information about the scene.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._loadMayaScene = async function(path, format = "fbx") {
    const scene = {
        camera: {},
        cameraLookAt: {}
    };
    switch (format) {
        case "fbx": {
            const fbxObj = await ripe.CsrUtils.loadFBX(path);

            // gets information about the side camera
            const sideCamera = fbxObj.getObjectByName("sideCam");
            if (sideCamera) {
                scene.camera = {
                    fov: sideCamera.fov,
                    filmGauge: sideCamera.filmGauge,
                    position: {
                        x: sideCamera.position.x,
                        y: sideCamera.position.y,
                        z: sideCamera.position.z
                    }
                };
            }

            // gets information about the side camera aim
            const sideCameraAim = fbxObj.getObjectByName("sideCam_aim");
            if (sideCameraAim) {
                scene.cameraLookAt = {
                    x: sideCameraAim.position.x,
                    y: sideCameraAim.position.y,
                    z: sideCameraAim.position.z
                };
            }
            break;
        }
        case "json":
            {
                const response = await fetch(path);
                const data = await response.json();
                scene.camera = data.camera;
                scene.cameraLookAt = data.cameraLookAt;
            }
            break;
        default:
            throw new Error(`Can't load Maya scene, format "${format}" is not supported`);
    }

    return scene;
};

/**
 * Initializes the layout for the configurator element by
 * constructing all te child elements required for the proper
 * configurator functionality to work.
 *
 * From a DOM perspective this is a synchronous operation,
 * meaning that after its execution the configurator is ready
 * to be manipulated.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initLayout = function() {
    // in case the element is no longer available (possible due to async
    // nature of execution) returns the control flow immediately
    if (!this.element) return;

    // clears the elements children by iterating over them
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    // creates the renderer canvas and adds it to the element
    const renderer = ripe.createElement("div", "renderer");
    this.element.appendChild(renderer);

    // creates the initials container and its canvas
    const initialsContainer = ripe.createElement("div", "initials-container");
    const initialsCanvas = ripe.createElement("canvas", "canvas");
    const initialsDisplacementCanvas = ripe.createElement("canvas", "displacement");
    initialsContainer.appendChild(initialsCanvas);
    initialsContainer.appendChild(initialsDisplacementCanvas);

    // hides the initials container
    initialsContainer.style.display = "none";

    // adds the initials container to the element
    this.element.appendChild(initialsContainer);

    // register for all the necessary DOM events
    this._registerHandlers();
};

/**
 * Creates and initiates the renderer scene camera.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initCamera = function() {
    this.camera = new window.THREE.PerspectiveCamera(
        this.cameraOptions.fov,
        this.cameraOptions.aspect,
        this.cameraOptions.near,
        this.cameraOptions.far
    );
    if (this.cameraOptions.filmGauge) this.camera.filmGauge = this.cameraOptions.filmGauge;

    ripe.CsrUtils.applyTransform(
        this.camera,
        this.cameraOptions.position,
        this.cameraOptions.rotation,
        this.cameraOptions.scale
    );

    if (this.cameraOptions.lookAt) {
        this.camera.lookAt(
            this.cameraOptions.lookAt.x,
            this.cameraOptions.lookAt.y,
            this.cameraOptions.lookAt.z
        );
    }
};

/**
 * Loads the build scene by setting it's environment and adding it's model to
 * the renderer scene.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initScene = async function() {
    // creates empty scene
    this.scene = new window.THREE.Scene();

    // inits the scene clock
    this.clock = new window.THREE.Clock();

    // loads maya scene information
    if (this.mayaScenePath) {
        const mayaScene = await this._loadMayaScene(this.mayaScenePath);
        this.cameraOptions = {
            ...this.cameraOptions,
            ...mayaScene.camera,
            lookAt: mayaScene.cameraLookAt
        };
    }

    // inits camera thats going to be used to view the scene
    this._initCamera();

    // loads scene resources
    const meshPath = this.owner.getMeshUrl();
    [this.environmentTexture, this.mesh] = await Promise.all([
        ripe.CsrUtils.loadEnvironment(this.sceneEnvironmentPath),
        this._loadMesh(meshPath)
    ]);

    // sets the scene environment
    this.environmentTexture.mapping = window.THREE.EquirectangularReflectionMapping;
    this.scene.environment = this.environmentTexture;

    // inits the scene model group
    this.modelGroup = new window.THREE.Group();

    // sets the model mesh
    this.modelGroup.add(this.mesh);

    // adds model group to the scene
    this.scene.add(this.modelGroup);
};

/**
 * Initializes the CSR initials. This means initializing an instance of `CsrRenderedInitials`,
 * and doing it's setup.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initCsrRenderedInitials = async function() {
    if (!this.enabledInitials) return;

    this._registerInitialsHandlers();

    const initialsContainer = this.element.querySelector(".initials-container");
    if (!initialsContainer) {
        throw new Error("Initials container not initialized, can't initiate CSR initials");
    }

    const canvas = initialsContainer.querySelector(".canvas");
    const displacementCanvas = initialsContainer.querySelector(".displacement");

    this.initialsRefs.renderedInitials = new ripe.CsrRenderedInitials(
        canvas,
        displacementCanvas,
        this.initialsOptions.width,
        this.initialsOptions.height,
        this.pixelRatio,
        this.initialsOptions.options
    );

    // loads textures
    [this.initialsRefs.baseTexture, this.initialsRefs.displacementTexture] = await Promise.all([
        this.initialsBaseTexturePath
            ? ripe.CsrUtils.loadTexture(this.initialsBaseTexturePath)
            : null,
        this.initialsDisplacementTexturePath
            ? ripe.CsrUtils.loadTexture(this.initialsDisplacementTexturePath)
            : null
    ]);

    // apply textures to initials
    if (this.initialsRefs.baseTexture) {
        this.initialsRefs.renderedInitials.setBaseTexture(
            this.initialsRefs.baseTexture,
            this.initialsOptions.options.baseTextureOptions
        );
    }
    if (this.initialsRefs.displacementTexture) {
        this.initialsRefs.renderedInitials.setDisplacementTexture(
            this.initialsRefs.displacementTexture,
            this.initialsOptions.options.displacementTextureOptions
        );
    }

    // uses rendered initials mesh
    this.initialsRefs.mesh = this.initialsRefs.renderedInitials.getMesh();
    this.modelGroup.add(this.initialsRefs.mesh);

    // applies the mesh reference points if available
    if (this.initialsOptions.points && this.initialsOptions.points.length > 0) {
        this.initialsRefs.renderedInitials.setPoints(this.initialsOptions.points);
    }

    // applies the mesh transformations
    const scale = { ...this.initialsOptions.scale };
    if (scale.x !== undefined) scale.x = scale.x * this.INITIALS_SCALE_MULTIPLIER;
    if (scale.y !== undefined) scale.y = scale.y * this.INITIALS_SCALE_MULTIPLIER;
    if (scale.z !== undefined) scale.z = scale.z * this.INITIALS_SCALE_MULTIPLIER;
    ripe.CsrUtils.applyTransform(
        this.initialsRefs.mesh,
        this.initialsOptions.position,
        this.initialsOptions.rotation,
        scale
    );

    // trigger rerender to clear the initials
    this.initialsRefs.renderedInitials.rerenderInitials();
};

/**
 * Cleanups everything related to the CSR initials.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._deinitCsrRenderedInitials = function() {
    // cleanup handlers
    this._unregisterInitialsHandlers();

    // cleanup loaded textures
    if (this.initialsRefs.baseTexture) this.initialsRefs.baseTexture.dispose();
    if (this.initialsRefs.displacementTexture) this.initialsRefs.displacementTexture.dispose();

    // free all resources used
    if (this.initialsRefs.renderedInitials) this.initialsRefs.renderedInitials.destroy();
    this.initialsRefs = {
        renderedInitials: null,
        mesh: null,
        baseTexture: null,
        displacementTexture: null
    };
};

/**
 * Initiates the debug tools.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initDebug = function() {
    if (!this.debug) return;

    // ensures a clean state
    this._deinitDebug();

    // inits framerate panel
    if (this.debugOptions.framerate) {
        const renderer = this.element.querySelector(".renderer");
        if (!renderer) {
            throw new Error("Renderer container not initialized, can't load debug framerate");
        }
        this.debugRefs.framerate = new window.Stats();
        this.debugRefs.framerate.dom.classList.add("framerate-panel");
        renderer.appendChild(this.debugRefs.framerate.dom);
    }

    // inits world axis
    if (this.debugOptions.worldAxis) {
        if (!this.scene) throw new Error("Scene not initialized, can't load debug axis");
        this.debugRefs.worldAxis = new window.THREE.AxesHelper(100);
        this.scene.add(this.debugRefs.worldAxis);
    }

    // inits model group axis
    if (this.debugOptions.modelAxis) {
        if (!this.modelGroup) throw new Error("Model group not initialized, can't load debug axis");
        this.debugRefs.modelAxis = new window.THREE.AxesHelper(50);
        this.modelGroup.add(this.debugRefs.modelAxis);
    }

    // inits rendered initials debug tools
    if (this.enabledInitials && this.debugOptions.renderedInitials) {
        if (!this.modelGroup) {
            throw new Error("Model group not initialized, can't load rendered initials debug tool");
        }
        if (!this.initialsRefs.renderedInitials) {
            throw new Error(
                "CSR initials not initialized, can't load rendered initials debug tool"
            );
        }

        // creates group that will contain all rendered initials debug tools
        this.debugRefs.renderedInitials.group = new window.THREE.Group();

        // inits axis
        if (this.debugOptions.renderedInitials.axis) {
            this.debugRefs.renderedInitials.axis = new window.THREE.AxesHelper(750);
            this.debugRefs.renderedInitials.group.add(this.debugRefs.renderedInitials.axis);
        }

        // ensures it has the minimum number of points
        if (this.initialsRefs.renderedInitials.points.length > 1) {
            // inits reference points curve
            if (this.debugOptions.renderedInitials.line) {
                const curve = new window.THREE.CatmullRomCurve3(
                    this.initialsRefs.renderedInitials.points,
                    false,
                    "centripetal"
                );
                const pointsNum = 50;
                const linePoints = curve.getPoints(pointsNum);
                this.debugRefs.renderedInitials.line = new window.THREE.Line(
                    new window.THREE.BufferGeometry().setFromPoints(linePoints),
                    new window.THREE.LineBasicMaterial({ color: 0x0000ff })
                );

                this.debugRefs.renderedInitials.group.add(this.debugRefs.renderedInitials.line);
            }

            // inits reference points
            if (this.debugOptions.renderedInitials.points) {
                const boxGeometry = new window.THREE.BoxGeometry(50, 50, 50);
                const boxMaterial = new window.THREE.MeshBasicMaterial({ color: 0xff0000 });

                for (const pos of this.initialsRefs.renderedInitials.points) {
                    const pointBox = new window.THREE.Mesh(boxGeometry, boxMaterial);
                    pointBox.position.copy(pos);

                    this.debugRefs.renderedInitials.points.push(pointBox);
                    this.debugRefs.renderedInitials.group.add(pointBox);
                }
            }
        }

        // adjust object transforms
        ripe.CsrUtils.applyTransform(
            this.debugRefs.renderedInitials.group,
            this.initialsOptions.position,
            this.initialsOptions.rotation,
            {
                x: this.initialsOptions.scale.x * this.INITIALS_SCALE_MULTIPLIER,
                y: this.initialsOptions.scale.y * this.INITIALS_SCALE_MULTIPLIER,
                z: this.initialsOptions.scale.z * this.INITIALS_SCALE_MULTIPLIER
            }
        );

        this.modelGroup.add(this.debugRefs.renderedInitials.group);
    }
};

/**
 * Cleanups everything related to the debug tools.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._deinitDebug = function() {
    if (this.debugRefs.renderedInitials) {
        // cleanup reference points boxes
        this.debugRefs.renderedInitials.points.forEach(point => {
            if (point.geometry) point.geometry.dispose();
            if (point.material) point.material.dispose();
            if (this.debugRefs.renderedInitials.group) {
                this.debugRefs.renderedInitials.group.remove(point);
            }
        });
        this.debugRefs.renderedInitials.points = [];

        // cleanup line
        if (this.debugRefs.renderedInitials.line) {
            if (this.debugRefs.renderedInitials.line.geometry) {
                this.debugRefs.renderedInitials.line.geometry.dispose();
            }
            if (this.debugRefs.renderedInitials.line.material) {
                this.debugRefs.renderedInitials.line.material.dispose();
            }
            if (this.debugRefs.renderedInitials.group) {
                this.debugRefs.renderedInitials.group.remove(this.debugRefs.renderedInitials.line);
            }
            this.debugRefs.renderedInitials.line = null;
        }

        // cleanup axis
        if (this.debugRefs.renderedInitials.axis) {
            if (this.debugRefs.renderedInitials.group) {
                this.debugRefs.renderedInitials.group.remove(this.debugRefs.renderedInitials.line);
            }
            this.debugRefs.renderedInitials.axis = null;
        }

        // cleanup group
        this.debugRefs.renderedInitials.group = null;
    }

    if (this.debugRefs.modelAxis) {
        this.debugRefs.modelAxis.dispose();
        this.modelGroup.remove(this.debugRefs.modelAxis);
        this.debugRefs.modelAxis = null;
    }
    if (this.debugRefs.worldAxis) {
        this.debugRefs.worldAxis.dispose();
        this.scene.remove(this.debugRefs.worldAxis);
        this.debugRefs.worldAxis = null;
    }
    if (this.debugRefs.framerate) {
        this.debugRefs.framerate.dom.remove();
        this.debugRefs.framerate = null;
    }
};

/**
 * Initializes and loads everything needed to run the CSR. This means
 * initializing the renderer, it's camera and it's scene.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._initCsr = async function() {
    if (!this.element) throw new Error("CSR layout elements are not initiated");

    // gets configurator size information
    const size = this._configuratorSize();

    // init renderer
    this.renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.outputEncoding = window.THREE.sRGBEncoding;
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(size.width, size.height);
    this.renderer.setAnimationLoop(() => this._onAnimationLoop(this));

    const renderer = this.element.querySelector(".renderer");
    renderer.appendChild(this.renderer.domElement);

    // calculates the camera aspect ratio
    if (this.cameraOptions.aspect === null) {
        this.cameraOptions.aspect = size.width / size.height;
    }

    // init scene
    await this._initScene();

    // init the CSR initials
    await this._initCsrRenderedInitials();

    // init debug tools
    this._initDebug();

    this._render();
};

/**
 * Cleanups everything related to CSR.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._deinitCsr = function() {
    this._deinitDebug();
    this._deinitCsrRenderedInitials();

    if (this.environmentTexture) {
        this.environmentTexture.dispose();
        this.environmentTexture = null;
    }

    if (this.modelGroup) {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
            this.modelGroup.remove(this.mesh);
            this.mesh = null;
        }
        this.modelGroup = null;
    }

    if (this.scene) this.scene = null;

    if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
    }

    if (this.camera) this.camera = null;
};

/**
 * Renders frame.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._render = function() {
    if (!this.scene) throw new Error("Scene not initiated");
    if (!this.camera) throw new Error("Camera not initiated");
    if (!this.renderer) throw new Error("Renderer not initiated");
    this.renderer.render(this.scene, this.camera);
};

/**
 * Sets the camera zoom, will trigger the update of the
 * projection matrix in conformance.
 *
 * @param {Number} zoom The zoom number value.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._setZoom = function(zoom) {
    if (!this.camera) throw new Error("Camera not initialized");
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
};

/**
 * Do the resize operation for every CSR element.
 *
 * @param {Number} width The number of pixels to resize to.
 * @param {Number} height The number of pixels to resize to.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._resizeCsr = function(width, height) {
    // resizes renderer
    this.renderer.setSize(width, height);

    // updates the camera aspect ratio
    if (this.cameraOptions.updateAspectOnResize || this.cameraOptions.aspect === null) {
        this.cameraOptions.aspect = width / height;
    }

    // creates a new camera respecting the new renderer size
    this._initCamera();
};

/**
 * Animation loop tick.
 *
 * @private
 */
ripe.ConfiguratorCsr.prototype._onAnimationLoop = function(self) {
    if (self.loading) return;

    // processes debug related ticks
    if (self.debug) {
        if (self.debugRefs.framerate) self.debugRefs.framerate.update();
    }

    // processes the animation loop tick delta
    const delta = self.clock.getDelta();

    if (!self.modelGroup) return;

    // checks if there are animations to process
    if (self.animations.length > 0) {
        // ticks animations
        for (let i = self.animations.length - 1; i >= 0; i--) {
            const animation = self.animations[i];
            animation.tick(delta);

            if (animation.isFinished()) self.animations.splice(i, 1);
        }

        // normalizes the model group rotations
        ripe.CsrUtils.normalizeRotations(self.modelGroup);
    }

    // renders a frame
    self._render();
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onMouseDown = function(self, event) {
    self.isMouseDown = true;
    self.referenceX = event.pageX;
    self.referenceY = event.pageY;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onMouseUp = function(self, event) {
    self.isMouseDown = false;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onMouseLeave = function(self, event) {
    self.isMouseDown = false;
    self.prevPercentX = 0;
    self.prevPercentY = 0;
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onMouseMove = function(self, event) {
    if (!self.isMouseDown) return;
    if (!self.modelGroup) return;
    if (self.noDrag) return;

    const mousePosX = event.pageX;
    const mousePosY = event.pageY;
    const deltaX = self.referenceX - mousePosX;
    const deltaY = self.referenceY - mousePosY;
    const elementWidth = self.element.clientWidth;
    const elementHeight = self.element.clientHeight;
    const percentX = deltaX / elementWidth;
    const percentY = deltaY / elementHeight;
    const sensitivity = self.sensitivity * 0.1;

    const dragValueX = (percentX - self.prevPercentX) * sensitivity;
    self.modelGroup.rotation.y -= dragValueX;

    const dragValueY = (percentY - self.prevPercentY) * sensitivity;
    self.modelGroup.rotation.x -= dragValueY;

    self.prevPercentX = percentX;
    self.prevPercentY = percentY;
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onWheel = function(self, event) {
    event.preventDefault();
    if (!self.zoomOptions.enabled) return;
    if (!self.modelGroup) return;
    if (!self.camera) return;

    // calculates zoom value
    let zoom = self.camera.zoom + event.deltaY * -(self.zoomOptions.sensitivity / 1000);
    zoom = Math.min(Math.max(self.zoomOptions.min, zoom), self.zoomOptions.max);

    // updates camera zoom, this will trigger
    // the update of the projection matrix
    self._setZoom(zoom);
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onInitialsEvent = function(self, initials, engraving, params) {
    if (!this.initialsRefs.renderedInitials) throw new Error("CSR initials not initialized");

    this.initialsRefs.renderedInitials.setInitials(initials);
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._onInitialsExtraEvent = function(self, initialsExtra, params) {
    if (!this.initialsRefs.renderedInitials) throw new Error("CSR initials not initialized");

    throw new Error("Not implemented");
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._registerHandlers = function() {
    this._addElementHandler("mousedown", event => this._onMouseDown(this, event));
    this._addElementHandler("mouseup", event => this._onMouseUp(this, event));
    this._addElementHandler("mouseleave", event => this._onMouseLeave(this, event));
    this._addElementHandler("mousemove", event => this._onMouseMove(this, event));
    this._addElementHandler("wheel", event => this._onWheel(this, event));
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._registerInitialsHandlers = function() {
    this.owner.bind("initials", (initials, engraving, params) =>
        this._onInitialsEvent(this, initials, engraving, params)
    );
    this.owner.bind("initials_extra", (initialsExtra, params) =>
        this._onInitialsExtraEvent(this, initialsExtra, params)
    );
};

/**
 * @ignore
 */
ripe.ConfiguratorCsr.prototype._unregisterInitialsHandlers = function() {
    this.owner && this.owner.unbind("initials_extra", this._onInitialsExtraEvent);
    this.owner && this.owner.unbind("initials", this._onInitialsEvent);
};
