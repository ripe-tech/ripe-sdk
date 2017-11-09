const assert = require("assert");
const config = require("./config")
const ripe = require("../src/js/ripe");

describe("Ripe", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should instance and retrieve values", async () => {
            var instance = new ripe.Ripe("myswear", "vyner");
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve)
            })

            result = await new Promise((resolve, reject) => {
                instance.getPrice(resolve);
            });

            assert.equal(result["total"]["price_final"] > 0.0, true);
            assert.equal(result["total"]["country"], "US");
            assert.equal(result["total"]["currency"], "EUR");
        });
    });
});
