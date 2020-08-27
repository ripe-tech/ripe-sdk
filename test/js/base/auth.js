const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Auth", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#auth()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to authenticate", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);
        });
    });

    describe("#auth key()", function() {
        beforeEach(function() {
            if (!config.TEST_KEY) {
                this.skip();
            }
        });

        it("should be able to authenticate with key", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authKeyP(config.TEST_KEY);

            assert.strictEqual(result.username, config.TEST_USERNAME || "ripe-bot");
            assert.notStrictEqual(typeof result.key, undefined);
        });
    });
});
