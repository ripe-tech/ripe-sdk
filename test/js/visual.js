const assert = require("assert");
const jsdom = require("jsdom");
const config = require("./config");
const base = require("../../src/js/base");

describe("Visual", function () {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function () {
        it("should init interactable and bind it to instance", async () => {
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const interactable = new base.ripe.Interactable(instance);
            const _interactable = instance.bindInteractable(interactable);

            assert.equal(interactable, _interactable);
            assert.equal(interactable.owner, instance);
            assert.equal(instance.children.length, 1);
            assert.equal(instance.children[0], interactable);
        });
        it("should deinit instance and unbind interactable", async () => {
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const interactable = new base.ripe.Interactable(instance);

            instance.bindInteractable(interactable);
            instance.deinit();

            assert.equal(interactable.owner, null);
            assert.equal(instance.children.length, 0);
        });
        it("should instance image and load frame", async () => {
            let result = null;

            const dom = new jsdom.JSDOM("<img id='image' />", {
                resources: "usable"
            });
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const image = instance.bindImage(imageElement, { frame: "side-9" });

            assert.equal(imageElement.src, "");

            result = await new Promise((resolve, reject) => {
                image.bind("loaded", resolve);
                assert.equal(image.callbacks["loaded"].length, 1)
            });

            assert.equal(image.frame, "side-9");
            assert(imageElement.src);
            assert.equal(imageElement.src.includes("frame=9"), true);

            result = await new Promise((resolve, reject) => {
                image.bind("loaded", resolve);
                image.setFrame("side-10");
            });

            assert.equal(imageElement.src.includes("frame=10"), true);
        });
        it("should deinit image and stop updating", async () => {
            let result = null;

            const dom = new jsdom.JSDOM("<img id='image' />", {
                resources: "usable"
            });
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const image = instance.bindImage(imageElement, { frame: "side-9" });

            result = await new Promise((resolve, reject) => {
                image.bind("loaded", resolve);
            });

            instance.deinit();

            assert.equal(image.owner, null);
            assert.equal(image.element, null);
            assert.deepStrictEqual(image.callbacks, {});
        });
    });
});
