const assert = require("assert");
const uuid = require("uuid");
const mock = require("./mock");
const config = require("../config");
const ripe = require("../../../src/js");

describe("OrderAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getOrders()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to retrieve orders", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getOrdersP();

            assert.notStrictEqual(result.length, 0);
        });
    });

    describe("#getOrder()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to retrieve an order information", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getOrderP(4488);

            assert.strictEqual(result.number, 4488);
            assert.strictEqual(result.number_s, "#004488");
        });
    });

    describe("#_getOrderReportURL()", function() {
        it("should be able to generate a simple URL", async () => {
            const remote = ripe.RipeAPI();
            const result = remote._getOrderReportURL(1234, "secret-key");
            assert.strictEqual(
                result,
                "https://sandbox.platforme.com/api/orders/1234/report?key=secret-key"
            );
        });
    });

    describe("#_getOrderReportURL()", function() {
        it("should be able to generate a simple URL", async () => {
            const remote = ripe.RipeAPI();
            const result = remote._getOrderReportURL(1234, "secret-key");
            assert.strictEqual(
                result,
                "https://sandbox.platforme.com/api/orders/1234/report?key=secret-key"
            );
        });
    });

    describe("#_getOrderReportPDFURL()", function() {
        it("should be able to generate a simple URL", async () => {
            const remote = ripe.RipeAPI();
            const result = remote._getOrderReportPDFURL(1234, "secret-key");
            assert.strictEqual(
                result,
                "https://sandbox.platforme.com/api/orders/1234/report.pdf?key=secret-key"
            );
        });
    });

    describe("#_getOrderReportURL()", function() {
        it("should be able to generate a simple URL", async () => {
            const remote = ripe.RipeAPI();
            const result = remote._getOrderReportPNGURL(1234, "secret-key");
            assert.strictEqual(
                result,
                "https://sandbox.platforme.com/api/orders/1234/report.png?key=secret-key"
            );
        });
    });

    describe("#importOrder()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to import order", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            const ffOrderId = uuid.v4();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.importOrderP(ffOrderId, {
                brand: "dummy",
                model: "dummy",
                parts: {
                    piping: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    side: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    top0_bottom: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    shadow: {
                        material: "default",
                        color: "default"
                    }
                },
                gender: "female",
                size: 20,
                meta: ["client:ripe-sdk-test", "context:test"]
            });

            const structure = JSON.parse(result.structure);
            assert.strictEqual(result.ff_order_id, ffOrderId);
            assert.strictEqual(result.brand, "dummy");
            assert.strictEqual(result.shoe, "dummy");
            assert.strictEqual(
                JSON.stringify(structure.parts_m),
                JSON.stringify({
                    piping: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    side: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    top0_bottom: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    shadow: {
                        material: "default",
                        color: "default"
                    }
                })
            );
            assert.strictEqual(structure.size, 20);
            assert.strictEqual(structure.gender, "female");
            assert.strictEqual(result.meta.client, "ripe-sdk-test");
            assert.strictEqual(result.meta.context, "test");

            await remote.deleteOrderP(result.number);
        });
    });

    describe("#preCustomization()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to create a pre-customization", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const ffId = Date.now();
            result = await remote.precustomizationOrderP(ffId, {
                brand: "dummy",
                model: "dummy",
                parts: {
                    piping: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    side: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    top0_bottom: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    shadow: {
                        material: "default",
                        color: "default"
                    }
                },
                product_id: 31415926,
                size: 20,
                meta: ["client:ripe-sdk-test", "context:test"]
            });

            const structure = JSON.parse(result.structure);
            assert.strictEqual(result.production, "reference");
            assert.strictEqual(result.ff_id, ffId);
            assert.strictEqual(result.ff_shoe_id, 31415926);
            assert.strictEqual(result.brand, "dummy");
            assert.strictEqual(result.shoe, "dummy");
            assert.strictEqual(
                JSON.stringify(structure.parts_m),
                JSON.stringify({
                    piping: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    side: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    top0_bottom: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    shadow: {
                        material: "default",
                        color: "default"
                    }
                })
            );
            assert.strictEqual(structure.size, 20);
            assert.strictEqual(result.meta.client, "ripe-sdk-test");
            assert.strictEqual(result.meta.context, "test");

            await remote.deleteOrderP(result.number);
        });
    });

    describe("#subscribeOrder()", function() {
        const ctx = {};

        beforeEach(async function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
            ctx.order = await mock.buildOrder();
        });

        afterEach(async function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
            await mock.destroyOrder(ctx.order);
        });

        it("should be able to subscribe an unsubscribed order", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.unsubscribeOrderP(ctx.order.number);
            assert.strictEqual(result.subscribed, false);

            result = await remote.getOrderSubscriptionP(ctx.order.number);
            assert.strictEqual(result.subscribed, false);

            result = await remote.subscribeOrderP(ctx.order.number);
            assert.strictEqual(result.subscribed, true);

            result = await remote.getOrderSubscriptionP(ctx.order.number);
            assert.strictEqual(result.subscribed, true);
        });

        it("should not throw when subscribing an order that's already subscribed", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.subscribeOrderP(ctx.order.number);
            assert.strictEqual(result.subscribed, true);

            assert.doesNotThrow(async () => remote.subscribeOrderP(ctx.order.number));

            result = await remote.getOrderSubscriptionP(ctx.order.number);
            assert.strictEqual(result.subscribed, true);
        });
    });

    describe("#unsubscribeOrder()", function() {
        const ctx = {};

        beforeEach(async function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
            ctx.order = await mock.buildOrder();
        });

        afterEach(async function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
            await mock.destroyOrder(ctx.order);
        });

        it("should be able to unsubscribe a subscribed order", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.subscribeOrderP(ctx.order.number);
            assert.strictEqual(result.subscribed, true);

            result = await remote.getOrderSubscriptionP(ctx.order.number);
            assert.strictEqual(result.subscribed, true);

            result = await remote.unsubscribeOrderP(ctx.order.number);
            assert.strictEqual(result.subscribed, false);

            result = await remote.getOrderSubscriptionP(ctx.order.number);
            assert.strictEqual(result.subscribed, false);
        });

        it("should not throw when unsubscribing an order that's already unsubscribed", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);
            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.unsubscribeOrderP(ctx.order.number);
            assert.strictEqual(result.subscribed, false);

            result = await remote.getOrderSubscriptionP(ctx.order.number);
            assert.strictEqual(result.subscribed, false);
            assert.doesNotThrow(async () => remote.unsubscribeOrderP(ctx.order.number));

            result = await remote.getOrderSubscriptionP(ctx.order.number);
            assert.strictEqual(result.subscribed, false);
        });
    });
});
