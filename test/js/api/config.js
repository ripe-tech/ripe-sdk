const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("ConfigAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#_getConfigOptions", function() {
        it("should include country in params", async () => {
            let result = null;

            const remote = ripe.RipeAPI({
                country: "PT"
            });
            result = remote._getConfigOptions({
                brand: "swear",
                model: "vyner"
            });

            assert.strictEqual(
                result.url,
                "https://sandbox.platforme.com/api/brands/swear/models/vyner/config"
            );
            assert.strictEqual(result.params.country, "PT");
        });

        it("should include flag in params", async () => {
            let result = null;

            const remote = ripe.RipeAPI({
                flag: "retail"
            });
            result = remote._getConfigOptions({
                brand: "swear",
                model: "vyner"
            });

            assert.strictEqual(
                result.url,
                "https://sandbox.platforme.com/api/brands/swear/models/vyner/config"
            );
            assert.strictEqual(result.params.flag, "retail");
        });

        describe("#_getConfigInfoOptions", function() {
            it("should include guess as 0 in params", async () => {
                let result = null;

                const remote = ripe.RipeAPI({
                    guess: false
                });
                result = remote._getConfigInfoOptions();

                assert.strictEqual(result.url, "https://sandbox.platforme.com/api/config/info");
                assert.strictEqual(result.params.guess, "0");
            });

            it("should include guess as 1 in params when explicitly defined", async () => {
                let result = null;

                const remote = ripe.RipeAPI();
                result = remote._getConfigInfoOptions({
                    guess: true
                });

                assert.strictEqual(result.url, "https://sandbox.platforme.com/api/config/info");
                assert.strictEqual(result.params.guess, "1");
            });

            it("should not include guess in params", async () => {
                let result = null;

                const remote = ripe.RipeAPI();
                result = remote._getConfigInfoOptions();

                assert.strictEqual(result.url, "https://sandbox.platforme.com/api/config/info");
                assert.strictEqual(result.params.guess, undefined);
            });
        });
    });
});
