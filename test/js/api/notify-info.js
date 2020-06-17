const assert = require("assert");
const uuid = require("uuid");
const config = require("../config");
const ripe = require("../../../src/js");

describe("NotifyInfoAPI", function() {
    this.timeout(config.TEST_TIMEOUT);


    describe("#createDeviceId", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to create a deviceID", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            const deviceId = uuid.v4();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.createDeviceIdP(deviceId);

            assert.notStrictEqual(typeof result.created, undefined);
            assert.notStrictEqual(typeof result.email, undefined);
        });
    });

    describe("#removeDeviceId", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to remove a deviceID", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            const deviceId = uuid.v4();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.createDeviceIdP(deviceId);
            result = await remote.removeDeviceIdP(deviceId);

            assert.strictEqual(result.device_ids.includes(deviceId), false);
        });
    });
});
