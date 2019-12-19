const assert = require("assert");
const uuidv4 = require("uuid/v4");
const config = require("../config");
const ripe = require("../../../src/js");

describe("ConfigAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#_getConfigOptions", function() {
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

        describe("#_getConfigInfoOptions", function() {
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
        });
    });

    describe("#configResolveSku", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should resolve SKU", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const identifier = uuidv4();
            const domain = uuidv4();
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
        });

        it("should not resolve SKU", async () => {
            const remote = ripe.RipeAPI();

            await assert.rejects(
                async () => {
                    await remote.configResolveSkuP(uuidv4(), {
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
