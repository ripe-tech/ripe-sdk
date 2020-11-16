const assert = require("assert");
const config = require("../config");
const base = require("../../../src/js/base");

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
    });
});
