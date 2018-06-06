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

            assert.equal(interactable, _interactable);
            assert.equal(interactable.owner, instance);
            assert.equal(instance.children.length, 1);
            assert.equal(instance.children[0], interactable);
        });
        it("should deinit instance and unbind interactable", () => {
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const interactable = new base.ripe.Interactable(instance);

            instance.bindInteractable(interactable);
            instance.deinit();

            assert.equal(interactable.owner, null);
            assert.equal(instance.children.length, 0);
        });
        it("should instance image and load frame", () => {
            const dom = new jsdom.JSDOM("<img id='image' />");
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const image = instance.bindImage(imageElement, {
                frame: "side-9"
            });

            assert.equal(image.frame, "side-9");
            assert.equal(imageElement.src, "");

            image.update();

            assert.equal(imageElement.src.includes("frame=9"), true);

            image.setFrame("side-10");

            assert.equal(imageElement.src.includes("frame=10"), true);
        });
        it("should deinit image and stop updating", () => {
            const dom = new jsdom.JSDOM("<img id='image' />");
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const image = instance.bindImage(imageElement);

            instance.deinit();

            assert.equal(image.owner, null);
            assert.equal(image.element, null);
            assert.equal(image.callbacks, null);
        });
    });
});
