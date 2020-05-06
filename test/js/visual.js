const assert = require("assert");
const jsdom = require("jsdom");
const config = require("./config");
const base = require("../../src/js/base");

describe("Visual", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should init interactable and bind it to instance", () => {
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const interactable = new base.ripe.Interactable(instance);
            const _interactable = instance.bindInteractable(interactable);

            assert.strictEqual(interactable, _interactable);
            assert.strictEqual(interactable.owner, instance);
            assert.strictEqual(instance.children.length, 1);
            assert.strictEqual(instance.children[0], interactable);
        });

        it("should deinit instance and unbind interactable", async () => {
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const interactable = new base.ripe.Interactable(instance);

            instance.bindInteractable(interactable);
            await instance.deinit();

            assert.strictEqual(interactable.owner, null);
            assert.strictEqual(instance.children.length, 0);
        });

        it("should instance image and load frame", () => {
            const dom = new jsdom.JSDOM("<img id='image' />");
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const image = instance.bindImage(imageElement, {
                frame: "side-9"
            });

            assert.strictEqual(image.frame, "side-9");
            assert.strictEqual(imageElement.src, "");

            image.update();

            assert.strictEqual(imageElement.src.includes("frame=side-9"), true);

            image.setFrame("side-10");

            assert.strictEqual(imageElement.src.includes("frame=side-10"), true);
        });

        it("should deinit image and stop updating", async () => {
            const dom = new jsdom.JSDOM("<img id='image' />");
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const image = instance.bindImage(imageElement);

            await instance.deinit();

            assert.strictEqual(image.owner, null);
            assert.strictEqual(image.element, null);
            assert.strictEqual(image.callbacks, null);
        });
    });
});
