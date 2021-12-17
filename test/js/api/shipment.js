const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("ShipmentAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getShipments()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to retrieve shipments", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getShipmentsP();

            assert.notStrictEqual(result.length, 0);
        });
    });

    describe("#createShipment()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to create a shipment", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.createShipmentP({
                staus: "created",
                brand: "dummy",
                courier: "ups",
                tracking_number: "tracking123",
                tracking_url: "http://platforme.com/tracking/ups/tracking123",
                shipping_date: Date.now(),
                delivery_date: Date.now(),
                origin_country: "PT",
                origin_city: "Porto",
                destination_country: "GB",
                destination_city: "London"
            });

            console.log(result);

            await remote.deleteShipmentP(result.number);
        });
    });
});
