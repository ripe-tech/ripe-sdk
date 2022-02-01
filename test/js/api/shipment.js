const assert = require("assert");
const mock = require("./mock");
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

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getShipmentsP();

            assert.notStrictEqual(result.length, 0);
        });
    });

    describe("#getShipment()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to retrieve a shipment", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const order = await mock.buildOrder();
            const shipment = await remote.createShipmentP({
                status: "sent",
                orders: [order.number],
                courier: "ups",
                service: "airplane",
                package: "envelope",
                tracking_number: "tracking123",
                tracking_url: "http://platforme.com/tracking/ups/tracking123",
                shipping_date: Date.now(),
                delivery_date: Date.now(),
                shipper: {
                    name: "Name",
                    phone: "919999999",
                    address: {
                        line: "Address Line",
                        city: "City",
                        postal_code: "4475852",
                        country_code: "PT"
                    }
                },
                customer: {
                    name: "Name",
                    email: "email@email.com",
                    address: {
                        line: "Address Line",
                        city: "City",
                        postal_code: "4475852",
                        state_code: "NY",
                        country_code: "US"
                    }
                }
            });

            result = await remote.getShipmentP(shipment.number);

            await remote.deleteShipmentP(result.number);

            assert.strictEqual(result, shipment);
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

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const now = Date.now();
            const order = await mock.buildOrder();
            result = await remote.createShipmentP({
                status: "sent",
                orders: [order.number],
                description: "A test shipment",
                weight: 1.5,
                weight_units: "kilograms",
                courier: "ups",
                service: "airplane",
                package: "envelope",
                tracking_number: "tracking123",
                tracking_url: "http://platforme.com/tracking/ups/tracking123",
                carbon_neutral: true,
                access_point_delivery: "optional",
                pickup: {
                    offset: 1000,
                    ready_time: 32400000,
                    close_time: 64800000
                },
                shipping_date: now,
                delivery_date: now,
                shipper: {
                    name: "Name",
                    phone: "919999999",
                    address: {
                        line: "Address Line",
                        city: "City",
                        postal_code: "4475852",
                        country_code: "PT"
                    }
                },
                customer: {
                    name: "Name",
                    email: "email@email.com",
                    address: {
                        line: "Address Line",
                        city: "City",
                        postal_code: "4475852",
                        state_code: "NY",
                        country_code: "US"
                    }
                },
                attachments: [1, 2, 3]
            });

            assert.strictEqual(result.status, "created");
            assert.strictEqual(result.orders, [order.number]);
            assert.strictEqual(result.order.number, order.number);
            assert.strictEqual(result.brand, result.order.brand);
            assert.strictEqual(result.brands, [result.order.brand]);
            assert.strictEqual(result.description, "A test shipment");
            assert.strictEqual(result.weight, 1.5);
            assert.strictEqual(result.weight_units, "kilograms");
            assert.strictEqual(result.courier, "ups");
            assert.strictEqual(result.service, "airplane");
            assert.strictEqual(result.package, "envelope");
            assert.strictEqual(result.tracking_number, "tracking123");
            assert.strictEqual(
                result.tracking_url,
                "http://platforme.com/tracking/ups/tracking123"
            );
            assert.strictEqual(result.carbon_neutral, true);
            assert.strictEqual(result.access_point_delivery, "optional");
            assert.strictEqual(result.pickup, {
                offset: 1000,
                ready_time: 32400000,
                close_time: 64800000
            });
            assert.strictEqual(result.shipping_date, now);
            assert.strictEqual(result.delivery_date, now);
            assert.strictEqual(result.shipper, {
                name: "Name",
                phone: "919999999",
                address: {
                    line: "Address Line",
                    city: "City",
                    postal_code: "4475852",
                    country_code: "PT"
                }
            });
            assert.strictEqual(result.customer, {
                name: "Name",
                email: "email@email.com",
                address: {
                    line: "Address Line",
                    city: "City",
                    postal_code: "4475852",
                    state_code: "NY",
                    country_code: "US"
                }
            });
            assert.strictEqual(result.attachments, [1, 2, 3]);

            await remote.deleteShipmentP(result.number);
        });
    });

    describe("#updateShipment()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to update a shipment", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const order = await mock.buildOrder();
            const shipment = await remote.createShipmentP({
                status: "sent",
                orders: [order.number],
                courier: "ups",
                service: "airplane",
                package: "envelope",
                tracking_number: "tracking123",
                tracking_url: "http://platforme.com/tracking/ups/tracking123",
                shipping_date: Date.now(),
                delivery_date: Date.now(),
                shipper: {
                    name: "Name",
                    phone: "919999999",
                    address: {
                        line: "Address Line",
                        city: "City",
                        postal_code: "4475852",
                        country_code: "PT"
                    }
                },
                customer: {
                    name: "Name",
                    email: "email@email.com",
                    address: {
                        line: "Address Line",
                        city: "City",
                        postal_code: "4475852",
                        state_code: "NY",
                        country_code: "US"
                    }
                }
            });

            result = await remote.updateShipmentP({
                number: shipment.number,
                courier: "dhl",
                service: "express",
                package: "customer_box",
                shipper: {
                    name: "Updated Name"
                }
            });

            assert.strictEqual(result.courier, "dhl");
            assert.strictEqual(result.service, "express");
            assert.strictEqual(result.package, "customer_box");
            assert.strictEqual(result.shipper.name, "Updated Name");

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

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const order = await mock.buildOrder();
            const shipment = await remote.createShipmentP({
                status: "sent",
                orders: [order.number],
                courier: "ups",
                service: "airplane",
                package: "envelope",
                tracking_number: "tracking123",
                tracking_url: "http://platforme.com/tracking/ups/tracking123",
                shipping_date: Date.now(),
                delivery_date: Date.now(),
                shipper: {
                    name: "Name",
                    phone: "919999999",
                    address: {
                        line: "Address Line",
                        city: "City",
                        postal_code: "4475852",
                        country_code: "PT"
                    }
                },
                customer: {
                    name: "Name",
                    email: "email@email.com",
                    address: {
                        line: "Address Line",
                        city: "City",
                        postal_code: "4475852",
                        state_code: "NY",
                        country_code: "US"
                    }
                }
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
