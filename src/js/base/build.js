if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    require("./ripe");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Requests the logic script from the build of the current model and
 * overrides the methods available in it.
 */
ripe.Ripe.prototype.setBuildLogic = async function() {
    try {
        // get initials builder of the build and model, if there is one
        // defined, later used in the image's initials builder logic
        const logicScriptText = await this.getLogicP({
            brand: this.brand,
            model: this.model,
            version: this.version,
            format: "js"
        });
        // eslint-disable-next-line no-eval
        const logicScript = eval(logicScriptText);
        this.baseInitialsBuilder = logicScript.baseInitialsBuilder;
    } catch (err) {
        this.baseInitialsBuilder = null;
    }
};
