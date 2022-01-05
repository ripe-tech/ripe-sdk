const assert = require("assert");
const uuid = require("uuid");
const config = require("../config");
const ripe = require("../../../src/js");

describe("SkuAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getSkus()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to list all SKUs", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getSkusP();

            assert.notStrictEqual(result.length, 0);
        });
    });

    describe("#createSku()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to create a SKU", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
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

            try {
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
            } finally {
                result = await remote.deleteSkuP(createdSku.id);
            }
        });
    });

    describe("#getSku()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to retrieve information about a SKU", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
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

            try {
                result = await remote.getSkuP(createdSku.id);

                assert.strictEqual(result.id, createdSku.id);
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
            } finally {
                result = await remote.deleteSkuP(createdSku.id);
            }
        });
    });

    describe("#updateSku()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able update information about a SKU", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
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

            try {
                assert.strictEqual(createdSku.identifier, identifier);
                assert.strictEqual(createdSku.domain, "dummy");
                assert.strictEqual(createdSku.spec.brand, "dummy");
                assert.strictEqual(createdSku.spec.model, "dummy");
                assert.strictEqual(
                    JSON.stringify(createdSku.spec.parts),
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

                const newParts = {
                    side: {
                        material: "leather_cbe",
                        color: "red"
                    },
                    top0_bottom: {
                        material: "leather_cbe",
                        color: "black"
                    },
                    shadow: {
                        material: "default",
                        color: "default"
                    }
                };
                result = await remote.updateSkuP(createdSku.id, identifier, "dummy", {
                    brand: "dummy",
                    model: "cube",
                    parts: newParts
                });

                assert.strictEqual(result.id, createdSku.id);
                assert.strictEqual(result.identifier, identifier);
                assert.strictEqual(result.domain, "dummy");
                assert.strictEqual(result.spec.brand, "dummy");
                assert.strictEqual(result.spec.model, "cube");
                assert.strictEqual(JSON.stringify(result.spec.parts), JSON.stringify(newParts));
            } finally {
                result = await remote.deleteSkuP(createdSku.id);
            }
        });
    });

    describe("#deleteSku()", function() {
        beforeEach(function() {
            if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
                this.skip();
            }
        });

        it("should be able to delete a SKU", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
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

            result = await remote.deleteSkuP(createdSku.id);

            assert.strictEqual(result.result, "success");
            await assert.rejects(
                async () => await remote.deleteSkuP(createdSku.id),
                err => {
                    assert.strictEqual(err.code, 404);
                    assert.strictEqual(err.status, 404);
                    assert.strictEqual(err.result.code, 404);
                    assert.strictEqual(err.result.name, "NotFoundError");
                    assert.strictEqual(
                        err.result.message,
                        `SKU not found for {'id': ${createdSku.id}}`
                    );
                    return true;
                }
            );
        });
    });
});
