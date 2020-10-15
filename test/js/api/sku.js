const assert = require("assert");
const uuid = require("uuid");
const config = require("../config");
const ripe = require("../../../src/js");

describe("SkuAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#createSku()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to create a SKU", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            const identifier = uuid.v4();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.createSkuP(identifier, "dummy", {
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
                }
            });
            const createdSku = Object.assign({}, result);

            assert.strictEqual(result.identifier, identifier);
            assert.strictEqual(result.domain, "dummy");
            assert.strictEqual(result.spec.brand, "dummy");
            assert.strictEqual(result.spec.model, "dummy");
            assert.strictEqual(
                JSON.stringify(result.spec.parts),
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

            result = await remote.configInfoP({ params: { sku: identifier, domain: "dummy" } });
            assert.strictEqual(result.brand, "dummy");
            assert.strictEqual(result.model, "dummy");
            assert.strictEqual(
                JSON.stringify(result.parts),
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

            // deletes the newly created SKU
            result = await new Promise((resolve, reject) => {
                const options = remote._build({
                    url: `${remote.webUrl}admin/models/skus/${createdSku._id}/delete`,
                    auth: true
                });
                remote._requestURL(options.url, options, (result, isValid, request) => {
                    resolve(request);
                });
            });
        });
    });
});
