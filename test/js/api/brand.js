const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("BrandAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getLogoP()", function() {
        it("should gather a simple logo image", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.getLogoP({
                brand: "dummy",
                size: 50
            });
            assert.strictEqual(result.size, 20347);
            assert.strictEqual(result.type, "image/png");
        });
    });

    describe("#getLogoUrl()", function() {
        it("should gather a simple logo URL", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.getLogoUrl({
                brand: "dummy"
            });
            assert.strictEqual(result, "https://sandbox.platforme.com/api/brands/dummy/logo.png?");

            result = await remote.getLogoUrl({
                brand: "dummy",
                variant: "large",
                format: "jpg"
            });
            assert.strictEqual(
                result,
                "https://sandbox.platforme.com/api/brands/dummy/logo.jpg?variant=large"
            );
        });
    });

    describe("#getLogicP()", function() {
        it("should return a simple logic script", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.getLogicP({
                brand: "dummy",
                model: "cube",
                format: "js"
            });

            assert.strictEqual(result.length > 0, true);
            assert.strictEqual(result.includes("allowPersonalization: function(ctx) {"), true);
        });
    });

    describe("#runLogicP()", function() {
        it("should execute a simple logic", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.runLogicP({
                brand: "dummy",
                model: "cube",
                method: "minimum_initials"
            });

            assert.strictEqual(result, "1");

            result = await remote.runLogicP({
                brand: "dummy",
                model: "cube",
                method: "maximum_initials"
            });

            assert.strictEqual(result, "4");
        });

        it("should execute a complex logic with context", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.runLogicP({
                brand: "dummy",
                model: "dummy",
                method: "on_config",
                dataJ: {
                    brand: "dummy",
                    model: "dummy",
                    ctx: {
                        initials: {
                            main: {
                                initials: "AA",
                                engraving: "style:black"
                            }
                        }
                    }
                }
            });

            assert.deepStrictEqual(result, {
                initials: {
                    main: {
                        initials: "ST",
                        engraving: "default"
                    }
                }
            });
        });
    });

    describe("#onConfigP()", function() {
        it("should execute a on_config logic", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.onConfigP({
                brand: "dummy",
                model: "dummy",
                initials: {
                    main: {
                        initials: "AA",
                        engraving: "style:black"
                    }
                },
                parts: {},
                choices: {}
            });

            assert.deepStrictEqual(result, {
                brand: "dummy",
                model: "dummy",
                version: null,
                initials: {
                    main: {
                        initials: "ST",
                        engraving: "default"
                    }
                },
                parts: {},
                choices: {}
            });
        });
    });

    describe("#onPartP()", function() {
        it("should execute a on_part logic", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.onPartP({
                brand: "dummy",
                model: "dummy",
                name: "side",
                value: {
                    material: "suede_dmy",
                    color: "blue"
                },
                initials: {
                    main: {
                        initials: "AA",
                        engraving: "style:black"
                    }
                },
                parts: {
                    side: {
                        material: "suede_dmy",
                        color: "blue"
                    }
                },
                choices: {}
            });

            assert.deepStrictEqual(result, {
                brand: "dummy",
                model: "dummy",
                version: null,
                initials: {
                    main: {
                        initials: "DM",
                        engraving: "default"
                    }
                },
                parts: {
                    side: {
                        material: "leather_dmy",
                        color: "black"
                    }
                },
                choices: {},
                messages: [
                    ["config", "Colors forced to black"],
                    ["config", "Shadow forced to default"]
                ]
            });
        });
    });

    describe("#_getCombinationsOptions()", function() {
        it("should include use_name as 0 by default", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._getCombinationsOptions();

            assert.strictEqual(result.params.use_name, "0");
        });

        it("should include filter as 1 when explicitly defined", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._getCombinationsOptions({
                filter: true
            });

            assert.strictEqual(result.params.filter, "1");
        });

        it("should include use_name as 1 when explicitly defined", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._getCombinationsOptions({
                useName: true
            });

            assert.strictEqual(result.params.use_name, "1");
        });
    });

    describe("#_validateModelOptions()", function() {
        it("should generate a simple set of options", async () => {
            let result = null;

            const remote = ripe.RipeAPI();
            result = remote._validateModelOptions({
                brand: "dummy",
                model: "cube",
                parts: {
                    upper: {
                        material: "nappa",
                        color: "black"
                    },
                    bottom: {
                        material: "suede",
                        color: "white"
                    }
                }
            });

            assert.strictEqual(
                result.url,
                "https://sandbox.platforme.com/api/brands/dummy/models/cube/validate"
            );
            assert.deepStrictEqual(result.params, {
                p: ["bottom:suede:white", "upper:nappa:black"]
            });
        });
    });
});
