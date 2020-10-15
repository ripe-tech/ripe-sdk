const assert = require("assert");
const uuid = require("uuid");
const config = require("../config");
const ripe = require("../../../src/js");

describe("NotifyInfoAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#createDeviceId()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to create a device ID", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            const deviceId = uuid.v4();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            try {
                result = await remote.createDeviceIdP(deviceId);
                assert.notStrictEqual(typeof result.created, undefined);
                assert.notStrictEqual(typeof result.email, undefined);
                assert.strictEqual(result.device_ids.includes(deviceId), true);
            } finally {
                await remote.removeDeviceIdP(deviceId);
            }
        });

        it("should be able to create several device IDs for one user", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            const deviceId1 = uuid.v4();
            const deviceId2 = uuid.v4();
            const deviceId3 = uuid.v4();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            try {
                result = await remote.createDeviceIdP(deviceId1);
                assert.strictEqual(result.device_ids.includes(deviceId1), true);

                result = await remote.createDeviceIdP(deviceId2);
                assert.strictEqual(result.device_ids.includes(deviceId1), true);
                assert.strictEqual(result.device_ids.includes(deviceId2), true);

                result = await remote.createDeviceIdP(deviceId3);
                assert.strictEqual(result.device_ids.includes(deviceId1), true);
                assert.strictEqual(result.device_ids.includes(deviceId2), true);
                assert.strictEqual(result.device_ids.includes(deviceId3), true);
            } finally {
                await remote.removeDeviceIdP(deviceId1);
                await remote.removeDeviceIdP(deviceId2);
                await remote.removeDeviceIdP(deviceId3);
            }
        });

        it("should not be possible to create duplicate device IDs", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            const deviceId = "duplicate-id";

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            try {
                result = await remote.createDeviceIdP(deviceId);
                result = await remote.createDeviceIdP(deviceId);
            } finally {
                await remote.removeDeviceIdP(deviceId);
            }
        });
    });

    describe("#removeDeviceId()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to remove a device ID", async () => {
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

        it("should not throw when removing a device ID that doesn't exist", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            const deviceId = uuid.v4();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            assert.doesNotThrow(async () => remote.removeDeviceIdP(deviceId));
        });
    });
});
