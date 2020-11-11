const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Easing", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#linear()", async function() {
        it("should be able to do some linear easing", () => {
            let result;

            result = ripe.ripe.easing.linear(0.5, 0, 10);
            assert.strictEqual(result, 5);

            result = ripe.ripe.easing.linear(0, 0, 10);
            assert.strictEqual(result, 0);

            result = ripe.ripe.easing.linear(1, 0, 10);
            assert.strictEqual(result, 10);
        });
    });

    describe("#easeInQuad()", async function() {
        it("should be able to do some ease in quad easing", () => {
            let result;

            result = ripe.ripe.easing.easeInQuad(0.5, 0, 10);
            assert.strictEqual(result, 7.5);

            result = ripe.ripe.easing.easeInQuad(0, 0, 10);
            assert.strictEqual(result, 0);

            result = ripe.ripe.easing.easeInQuad(1, 0, 10);
            assert.strictEqual(result, 10);

            result = ripe.ripe.easing.easeInQuad(0.25, 0, 10);
            assert.strictEqual(result, 4.375);
        });
    });
});