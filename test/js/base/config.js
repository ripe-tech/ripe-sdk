const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Config", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#hasCustomization()", function() {
        it("should be able validate customization status", async () => {
            let instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasCustomization(), true);

            instance = await new ripe.Ripe("swear", "maddox_glitter", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasCustomization(), false);
        });
    });

    describe("#hasPersonalization()", function() {
        it("should be able validate personalization status", async () => {
            let instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasPersonalization(), true);

            instance = await new ripe.Ripe("swear", "uglyww", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasPersonalization(), false);
        });
    });

    describe("#hasSize()", function() {
        it("should be able validate size status", async () => {
            const instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasSize(), true);
        });
    });
});
