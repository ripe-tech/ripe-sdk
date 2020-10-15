const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("BrandAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#runLogicP()", function() {
        it("should execute a simple logic", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.runLogicP({
                brand: "dummy",
                model: "cube",
                method: "minimum_initials"
            });

            assert.strictEqual(await result.text(), "1");

            result = await remote.runLogicP({
                brand: "dummy",
                model: "cube",
                method: "maximum_initials"
            });

            assert.strictEqual(await result.text(), "4");
        });
    });

    describe("#_getCombinationsOptions()", function() {
        it("should include use_name as 0 by default", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._getCombinationsOptions();

            assert.strictEqual(result.params.use_name, "0");
        });

        it("should include filter as 1 when explicitly defined", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._getCombinationsOptions({
                filter: true
            });

            assert.strictEqual(result.params.filter, "1");
        });

        it("should include use_name as 1 when explicitly defined", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._getCombinationsOptions({
                useName: true
            });

            assert.strictEqual(result.params.use_name, "1");
        });
    });
});
