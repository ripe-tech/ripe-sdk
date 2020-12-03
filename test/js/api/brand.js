const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("BrandAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getLogoP()", function() {
        it("should gather a simple logo image", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.getLogoP({
                brand: "dummy",
                size: 50
            });
            assert.strictEqual(result.size, 20347);
            assert.strictEqual(result.type, "image/png");
        });
    });

    describe("#getLogoUrl()", function() {
        it("should gather a simple logo URL", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.getLogoUrl({
                brand: "dummy"
            });
            assert.strictEqual(result, "https://sandbox.platforme.com/api/brands/dummy/logo.png?");

            result = await remote.getLogoUrl({
                brand: "dummy",
                variant: "large",
                format: "jpg"
            });
            assert.strictEqual(
                result,
                "https://sandbox.platforme.com/api/brands/dummy/logo.jpg?variant=large"
            );
        });
    });

    describe("#runLogicP()", function() {
        it("should execute a simple logic", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.runLogicP({
                brand: "dummy",
                model: "cube",
                method: "minimum_initials"
            });

            assert.strictEqual(result, "1");

            result = await remote.runLogicP({
                brand: "dummy",
                model: "cube",
                method: "maximum_initials"
            });

            assert.strictEqual(result, "4");
        });
    });

    describe("#getLogicP()", function() {
        it("should return a simple logic script", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.getLogicP({
                brand: "dummy",
                model: "cube"
            });

            assert.strictEqual(result, "<Logic module for (dummy, cube) version unknown>");
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
