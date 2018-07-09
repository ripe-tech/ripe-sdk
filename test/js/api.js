const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");

describe("RipeAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getSizes", function() {
        it("should be able to retrieve sizes", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await new Promise((resolve, reject) => {
                remote.getSizes(resolve);
            });

            assert.deepEqual(result.fr, ["female"]);
            assert.deepEqual(result.uk, ["female", "male"]);
        });
    });
});
