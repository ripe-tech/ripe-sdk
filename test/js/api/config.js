const assert = require("assert");
const uuid = require("uuid");
const config = require("../config");
const ripe = require("../../../src/js");

describe("ConfigAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#_getConfigOptions()", function() {
        it("should include country in params", async () => {
            let result = null;

            const remote = ripe.RipeAPI({
                country: "PT"
            });
            result = remote._getConfigOptions({
                brand: "swear",
                model: "vyner"
            });

            assert.strictEqual(
                result.url,
                "https://sandbox.platforme.com/api/brands/swear/models/vyner/config"
            );
            assert.strictEqual(result.params.country, "PT");
        });

        it("should include flag in params", async () => {
            let result = null;

            const remote = ripe.RipeAPI({
                flag: "retail"
            });
            result = remote._getConfigOptions({
                brand: "swear",
                model: "vyner"
            });

            assert.strictEqual(
                result.url,
                "https://sandbox.platforme.com/api/brands/swear/models/vyner/config"
            );
            assert.strictEqual(result.params.flag, "retail");
        });
    });

    describe("#_getConfigInfoOptions()", function() {
        it("should include guess as 0 in params", async () => {
            let result = null;

            const remote = ripe.RipeAPI({
                guess: false
            });
            result = remote._getConfigInfoOptions();

            assert.strictEqual(result.url, "https://sandbox.platforme.com/api/config/info");
            assert.strictEqual(result.params.guess, "0");
        });

        it("should include guess as 1 in params when explicitly defined", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._getConfigInfoOptions({
                guess: true
            });

            assert.strictEqual(result.url, "https://sandbox.platforme.com/api/config/info");
            assert.strictEqual(result.params.guess, "1");
        });

        it("should not include guess in params", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._getConfigInfoOptions();

            assert.strictEqual(result.url, "https://sandbox.platforme.com/api/config/info");
            assert.strictEqual(result.params.guess, undefined);
        });

        it("should include sku and domain in params", async () => {
            const remote = ripe.RipeAPI();
            const result = remote._getConfigInfoOptions({
                sku: "314159265359",
                domain: "pi",
                queryOptions: false,
                initialsOptions: false
            });

            assert.strictEqual(result.url, "https://sandbox.platforme.com/api/config/info");
            assert.strictEqual(result.params.sku, "314159265359");
            assert.strictEqual(result.params.domain, "pi");
            assert.strictEqual(Object.keys(result.params).length, 2);
        });

        it("should not include sku and domain in params", async () => {
            const remote = ripe.RipeAPI();
            const result = remote._getConfigInfoOptions();

            assert.strictEqual(result.url, "https://sandbox.platforme.com/api/config/info");
            assert.strictEqual(result.params.sku, undefined);
            assert.strictEqual(result.params.domain, undefined);
        });
    });

    describe("#configResolveSku()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
            if (!assert.rejects) {
                this.skip();
            }
        });

        it("should resolve SKU", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const identifier = uuid.v4();
            const domain = uuid.v4();
            result = await remote.createSkuP(identifier, domain, {
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

            result = await remote.configResolveSkuP(domain, {
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

            assert.strictEqual(result.sku, identifier);
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

        it("should not resolve SKU", async () => {
            const remote = ripe.RipeAPI();

            await assert.rejects(
                async () => {
                    await remote.configResolveSkuP(uuid.v4(), {
                        brand: "swear",
                        model: "vyner",
                        parts: {
                            front: {
                                material: "nappa",
                                color: "white"
                            },
                            side: {
                                material: "nappa",
                                color: "white"
                            },
                            eyelets: {
                                material: "metal",
                                color: "silver"
                            },
                            laces: {
                                material: "nylon",
                                color: "white"
                            },
                            lining: {
                                material: "calf_lining",
                                color: "white"
                            },
                            sole: {
                                material: "rubber",
                                color: "white"
                            }
                        }
                    });
                },
                ripe.RemoteError,
                "Problem in remote operation (400)"
            );
        });
    });
});
