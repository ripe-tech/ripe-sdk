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

            const now = Date.now();
            result = await remote.createShipmentP({
                status: "created",
                brand: "dummy",
                courier: "ups",
                tracking_number: "tracking123",
                tracking_url: "http://platforme.com/tracking/ups/tracking123",
                shipping_date: now,
                delivery_date: now,
                origin_country: "PT",
                origin_city: "Porto",
                destination_country: "GB",
                destination_city: "London"
            });

            assert.strictEqual(result.status, "created");
            assert.strictEqual(result.brand, "dummy");
            assert.strictEqual(result.courier, "ups");
            assert.strictEqual(result.tracking_number, "tracking123");
            assert.strictEqual(
                result.tracking_url,
                "http://platforme.com/tracking/ups/tracking123"
            );
            assert.strictEqual(result.shipping_date, now);
            assert.strictEqual(result.delivery_date, now);
            assert.strictEqual(result.origin_country, "PT");
            assert.strictEqual(result.origin_city, "Porto");
            assert.strictEqual(result.destination_country, "GB");
            assert.strictEqual(result.destination_city, "London");

            await remote.deleteShipmentP(result.number);
        });
    });

    describe("#deleteShipment()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to delete a shipment", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const now = Date.now();
            const shipment = await remote.createShipmentP({
                status: "created",
                brand: "dummy",
                courier: "ups",
                tracking_number: "tracking123",
                tracking_url: "http://platforme.com/tracking/ups/tracking123",
                shipping_date: now,
                delivery_date: now,
                origin_country: "PT",
                origin_city: "Porto",
                destination_country: "GB",
                destination_city: "London"
            });

            result = await remote.deleteShipmentP(shipment.number);

            assert.strictEqual(result.result, "success");
            await assert.rejects(
                async () => await remote.deleteShipmentP(shipment.number),
                err => {
                    assert.strictEqual(err.code, 404);
                    assert.strictEqual(err.status, 404);
                    assert.strictEqual(err.result.code, 404);
                    assert.strictEqual(err.result.name, "NotFoundError");
                    assert.strictEqual(
                        err.result.message,
                        `Shipment not found for {'number': ${shipment.number}}`
                    );
                    return true;
                }
            );
        });
    });
});
