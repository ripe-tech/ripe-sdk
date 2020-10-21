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

ripe.CSRInitials = function (owner, options) {
    this.owner = owner;
    this.library = options.library;

    this.initialsType = "emboss";
    this.initialsText = "";
    this.engraving = "metal_gold";
    this.textSize = 1;
    this.textHeight = 0.1;

    this.fontsPath = "/static/assets/fonts/";
    this.fontType = "comic_sans";
    this.fontWeight = "light";

    this.loadedFonts = {};
    this.letterMaterial = null;
    this.loadedLetterMaterials = {};
    this.initialsPositions = {};
    this.textMeshes = [];

    this.logoMesh = null;

    this.engraving = options.engraving === undefined ? "metal_gold" : options.engraving;
};

ripe.CSRInitials.prototype = ripe.build(ripe.Observable.prototype);
ripe.CSRInitials.prototype.constructor = ripe.CSRInitials;

ripe.CSRInitials.prototype._setInitialsOptions = function (options = {}) {
    if (!options.initials) return;

    const initialsOptions = options.initials;

    this.textSize = initialsOptions.textSize === undefined ? this.textSize : initialsOptions.textSize;
    this.textHeight =
        initialsOptions.textHeight === undefined ? this.textHeight : initialsOptions.textHeight;
    this.fontsPath = initialsOptions.path === undefined ? this.fontsPath : initialsOptions
    this.fontType = initialsOptions.fontType === undefined ? this.fontType : initialsOptions.fontType;
    this.fontWeight =
        initialsOptions.fontWeight === undefined ? this.fontWeight : initialsOptions.fontWeight;
};

ripe.CSRInitials.prototype.updateOptions = async function (options) {
    this._setInitialsOptions(options);
};

ripe.CSRInitials.prototype.initialize = async function (assetManager) {
    this.assetManager = assetManager;

    const traverseScene = child => {
        if (child.name === "logo_part") {
            this.logoMesh = child;
        } else if (child.name.includes("initials_part")) {
            // naming is of the type "initials_part_1, where 1 indicates the position
            var initialPosition = parseInt(child.name.split("_")[2]);
            this.initialsPositions[initialPosition] = child;
            child.visible = false;
            if (child.material) child.material.dispose();
        }
    };

    this.assetManager.loadedScene.traverse(traverseScene);

    await this._initializeFonts(this.fontType, this.fontWeight);
};

ripe.CSRInitials.prototype._initializeFonts = async function (type, weight) {
    const loader = new this.library.FontLoader();
    const newFont = await new Promise((resolve, reject) => {
        loader.load(this.fontsPath + type + "/" + weight + ".json", function (font) {
            resolve(font);
        });
    });

    this.loadedFonts[type + "_" + weight] = newFont;
};

ripe.CSRInitials.prototype.update = async function () {
    const initials = this.owner.initials;

    // hides or unhides logo part
    if (
        (this.logoMesh && initials === "" && this.initialsText !== "") ||
        (initials !== "" && this.initialsText === "")
    ) {
        var isLogoVisible = initials === "" && this.initialsText !== "";
        this.logoMesh.visible = isLogoVisible;
    }

    // If there are no initials in mesh
    if (!this.initialsPositions) return;

    // Check if it is a valid engraving
    if (this.owner.engraving !== null && this.owner.engraving.includes("viewport")) {
        return;
    }

    // If initials or engraving haven't changed
    if (initials === this.initialsText && this.owner.engraving === this.engraving) {
        return;
    }

    const newEngraving = this.owner.engraving === null ? this.engraving : this._parseEngraving();

    if (this.initialsType === "emboss") await this.embossLetters(initials, newEngraving);
    else if (this.initialsType === "engrave") await this.engraveLetters(initials, newEngraving);

    this.engraving = newEngraving;
    this.initialsText = initials;
};

ripe.CSRInitials.prototype.embossLetters = async function (initials, newEngraving) {
    // avoid creating new materials
    let changedMaterial = false;
    if (this.letterMaterial === null || newEngraving !== this.engraving) {
        this.letterMaterial = await this._getLetterMaterial(newEngraving);
        changedMaterial = true;
    }

    const maxLength = Object.keys(this.initialsPositions).length;

    if (initials.length < this.initialsText.length) {
        var diff = this.initialsText.length - initials.length;
        while (diff > 0) {
            this.disposeLetter(this.textMeshes.length - 1);
            diff--;
        }
    }

    // Starts at 1 to line up with initials mesh position
    for (var i = 1; i <= Math.min(initials.length, maxLength); i++) {
        const posRot = this.getPosRotLetter(i, initials);
        const letter = initials.charAt(i - 1);

        const canReplaceLetter = i <= this.initialsText.length;
        const isNewLetter = letter !== this.initialsText.charAt(i - 1);

        if (isNewLetter || !canReplaceLetter) {
            var mesh = this.createLetter(letter);

            if (canReplaceLetter) {
                this.disposeLetter(i - 1, true);
                this.textMeshes[i - 1] = mesh;
            } else {
                this.textMeshes.push(mesh);
            }
        } else if (changedMaterial) {
            this.assetManager.disposeMaterial(this.textMeshes[i - 1].material);
            this.textMeshes[i - 1].material = this.letterMaterial.clone();
        }

        this.textMeshes[i - 1].position.set(
            posRot.position.x,
            posRot.position.y,
            posRot.position.z
        );
        this.textMeshes[i - 1].rotation.set(
            posRot.rotation.x,
            posRot.rotation.y,
            posRot.rotation.z
        );
    }
};

ripe.CSRInitials.prototype._parseEngraving = function () {
    var splitProps = this.owner.engraving.split("::");
    var material, type;

    if (splitProps[0] === "style") {
        material = splitProps[1].split("_")[0];
        type = splitProps[1].split("_")[1];
    } else {
        material = splitProps[0].split("_")[0];
        type = splitProps[0].split("_")[1];
    }

    return material + "_" + type;
};

ripe.CSRInitials.prototype._getLetterMaterial = async function (engraving) {
    const material = engraving.split("_")[0];
    const type = engraving.split("_")[1];

    const letterMaterial = await this.assetManager._loadMaterial("initials", material, type);
    return letterMaterial;
};

ripe.CSRInitials.prototype.disposeLetter = function (index, willReplace = false) {
    this.textMeshes[index].geometry.dispose();
    if (!willReplace) this.textMeshes.pop();
};

ripe.CSRInitials.prototype.getPosRotLetter = function (letterNumber, initials) {
    // Check if placement is interpolated or in the precise spot
    var transform = {};
    const size = Object.keys(this.initialsPositions).length;
    const center = (size + 1) / 2;

    const posInInitials = center + letterNumber - (initials.length + 1) / 2;

    if (initials.length % 2 === size % 2) {
        transform.position = this.initialsPositions[posInInitials].position;
        transform.rotation = this.initialsPositions[posInInitials].rotation;
    } else {
        // Interpolate between the two closest positions
        const previous = this.initialsPositions[Math.floor(posInInitials)];
        const next = this.initialsPositions[Math.ceil(posInInitials)];

        var position = new this.library.Vector3(0, 0, 0);
        var rotation = new this.library.Vector3(0, 0, 0);

        position.x = (previous.position.x + next.position.x) / 2;
        position.y = (previous.position.y + next.position.y) / 2;
        position.z = (previous.position.z + next.position.z) / 2;

        rotation.x = (previous.rotation.x + next.rotation.x) / 2;
        rotation.y = (previous.rotation.y + next.rotation.y) / 2;
        rotation.z = (previous.rotation.z + next.rotation.z) / 2;

        transform.position = position;
        transform.rotation = rotation;
    }

    return transform;
};

ripe.CSRInitials.prototype.createLetter = function (letter) {
    var textGeometry = new this.library.TextGeometry(letter, {
        font: this.loadedFonts[this.fontType + "_" + this.fontWeight],

        size: this.textSize,
        height: this.textHeight,
        curveSegments: 10
    });

    textGeometry = new this.library.BufferGeometry().fromGeometry(textGeometry);

    var letterMesh = new this.library.Mesh(textGeometry, this.letterMaterial);

    // rotates geometry to negate default text rotation
    letterMesh.geometry.rotateX(-Math.PI / 2);
    letterMesh.geometry.rotateY(Math.PI / 2);

    letterMesh.geometry.center();

    return letterMesh;
};

ripe.CSRInitials.prototype.engraveLetters = function (initials, newEngraving) { };

ripe.CSRInitials.prototype.disposeResources = async function () {
    console.log("Disposing Initials Resources.");
    var count = 0;

    if (this.textMeshes.length > 0) {
        for (let i = 0; i < this.textMeshes.length; i++) {
            await this.assetManager.disposeMesh(this.textMeshes[i]);
            count++;
        }
    }

    console.log("Finished disposing " + count + " letters.");

    count = 0;
    for (var mesh in this.initialsPositions) {
        await this.assetManager.disposeMesh(this.initialsPositions[mesh]);
        count++;
    }

    if (this.letterMaterial) await this.assetManager.disposeMaterial(this.letterMaterial);

    this.loadedFonts = {};
    this.loadedLetterMaterials = {};
    this.initialsPositions = {};
    this.textMeshes = [];
    this.library = null;
    this.textMeshes = [];

    console.log("Finished disposing " + count + " initials positions mesh.");
};
