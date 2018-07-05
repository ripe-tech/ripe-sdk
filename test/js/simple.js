const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");

describe("Ripe", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should instance and retrieve values", async () => {
            let result = null;

            const instance = new ripe.Ripe("swear", "vyner");
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            result = await new Promise((resolve, reject) => {
                instance.bind("price", resolve);
            });

            assert.equal(result.total.price_final > 0.0, true);
            assert.equal(result.total.country, "US");
            assert.equal(result.total.currency, "EUR");

            result = await new Promise((resolve, reject) => {
                instance.getPrice(resolve);
            });

            assert.equal(result.total.price_final > 0.0, true);
            assert.equal(result.total.country, "US");
            assert.equal(result.total.currency, "EUR");
        });
        it("should instance and retrieve config", async () => {
            let result = null;

            const instance = new ripe.Ripe("swear", "vyner");
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            result = await new Promise((resolve, reject) => {
                instance.getConfig(resolve);
            });

            assert.equal(result.hidden.indexOf("shadow") !== -1, true);
        });
        it("should instance with custom options", async () => {
            const instance = new ripe.Ripe("swear", "vyner", {
                noDefaults: true,
                noCombinations: true
            });
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            assert.equal(Object.keys(instance.parts).length, 0);
        });
        it("should set parts and undo", async () => {
            const instance = new ripe.Ripe("swear", "vyner", {
                noCombinations: true
            });
            instance.load();

            var initialParts = await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            assert.deepStrictEqual(instance.parts, initialParts);
            assert.equal(instance.canUndo(), false);
            assert.equal(instance.canRedo(), false);

            instance.undo();
            assert.equal(instance.canUndo(), false);
            assert.equal(instance.canRedo(), false);

            assert.deepStrictEqual(instance.parts, initialParts);

            assert.equal(instance.parts.front.material, "nappa");
            assert.equal(instance.parts.front.color, "white");

            instance.setPart("front", "suede", "black");
            var changedParts = Object.assign({}, instance.parts);

            assert.equal(instance.parts.front.material, "suede");
            assert.equal(instance.parts.front.color, "black");
            assert.equal(instance.canUndo(), true);
            assert.equal(instance.canRedo(), false);

            instance.undo();

            assert.deepStrictEqual(instance.parts, initialParts);
            assert.equal(instance.parts.front.material, "nappa");
            assert.equal(instance.parts.front.color, "white");
            assert.equal(instance.canUndo(), false);
            assert.equal(instance.canRedo(), true);

            instance.redo();

            assert.deepStrictEqual(instance.parts, changedParts);
            assert.equal(instance.parts.front.material, "suede");
            assert.equal(instance.parts.front.color, "black");
            assert.equal(instance.canUndo(), true);
            assert.equal(instance.canRedo(), false);

            instance.undo();

            assert.deepStrictEqual(instance.parts, initialParts);
            assert.equal(instance.canUndo(), false);
            assert.equal(instance.canRedo(), true);
        });
    });
});
