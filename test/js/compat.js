const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");

describe("Compat", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#assign", function() {
        it("should be able to assing simple values", async () => {
            const target = {
                c: 4,
                d: 5
            };
            const origin = {
                a: 1,
                b: 2,
                c: 3
            };
            const result = ripe.ripe.assign(target, origin);

            assert.deepEqual(target, {
                a: 1,
                b: 2,
                c: 3,
                d: 5
            });
            assert.deepEqual(result, {
                a: 1,
                b: 2,
                c: 3,
                d: 5
            });
        });
    });
});
