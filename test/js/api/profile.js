const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("ProfileAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    beforeEach(function() {
        if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
            this.skip();
        }
    });

    describe("#getProfiles()", function() {
        it("should be able to retrieve profiles", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getProfilesP();
            assert.notStrictEqual(result.length, 0);
        });
    });

    describe("#getProfile()", function() {
        it("should be able to retrieve an order information", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getProfileP("large");
            assert.strictEqual(result.name, "large");
        });
    });
});
