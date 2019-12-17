const assert = require("assert");
const uuidv4 = require("uuid/v4");
const config = require("../config");
const ripe = require("../../../src/js");

describe("SkuAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#createSku", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to create a SKU", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            const uuid = uuidv4();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.createSkuP(uuid, "dummy", {
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

            assert.strictEqual(result.identifier, uuid);
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

            // deletes the newly created sku
            result = await new Promise((resolve, reject) => {
                const options = remote._build({
                    url: `${remote.webUrl}admin/models/skus/${result._id}/delete`,
                    auth: true
                });
                remote._requestURL(options.url, options, (result, isValid, request) => {
                    resolve(request);
                });
            });
        });
    });
});
