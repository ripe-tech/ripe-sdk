const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");

describe("Auth", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#auth", function() {
        it("should be able to authenticate", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await new Promise((resolve, reject) => {
                remote.auth("root", "root", resolve);
            });

            assert.equal(result.username, "root");
            assert.notEqual(typeof result.sid, undefined);
        });
    });
});
