const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("SizeAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#_specToQuery()", function() {
        it("should be able to convert a spec to query", async () => {
            const remote = ripe.RipeAPI();

            const query = remote._specToQuery({
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
                initials: "JB",
                engraving: "normal",
                initials_extra: {
                    main: {
                        initials: "JB",
                        engraving: "normal"
                    }
                }
            });

            assert.deepStrictEqual(
                query,
                "brand=dummy&model=dummy&p=piping:leather_dmy:black&p=shadow:default:default&p=side:leather_dmy:black&p=top0_bottom:leather_dmy:black&initials=JB&engraving=normal&initials_extra=main:JB:normal"
            );
        });
    });

    describe("#getSizes()", function() {
        it("should be able to retrieve sizes", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.getSizesP();

            assert.deepStrictEqual(result.fr, ["female"]);
            assert.deepStrictEqual(result.uk, ["female", "male"]);
        });
    });

    describe("#sizeToNative()", function() {
        it("should be able to convert sizes", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.sizeToNativeP("fr", 42, "female");

            assert.strictEqual(result.scale, "fr");
            assert.strictEqual(result.value, 31);
            assert.strictEqual(result.native, 31);
        });
    });

    describe("#sizeToNativeB()", function() {
        it("should be able to convert sizes in bulk", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.sizeToNativeBP(["fr"], [42], ["female"]);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].scale, "fr");
            assert.strictEqual(result[0].value, 31);
            assert.strictEqual(result[0].native, 31);
        });
    });

    describe("#nativeToSize()", function() {
        it("should be able to convert sizes", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.nativeToSizeP("fr", 31, "female");

            assert.strictEqual(result.value, 42);
        });
    });

    describe("#nativeToSizeB()", function() {
        it("should be able to convert sizes in bulk", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.nativeToSizeBP(["fr"], [31], ["female"]);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].value, 42);
        });
    });

    describe("#localeToNative()", function() {
        it("should be able to convert sizes", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.localeToNativeP("std:clothing", "XXL", "female");

            assert.strictEqual(result.scale, "std:clothing");
            assert.strictEqual(result.value, "XXL");
            assert.strictEqual(result.gender, "female");
            assert.strictEqual(result.native, 24);
        });
    });

    describe("#localeToNativeB()", function() {
        it("should be able to convert sizes in bulk", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.localeToNativeBP(
                ["std:clothing", "bag", "it", "std:clothing"],
                ["XXL", "One Size", "38.5", "4 Yrs"],
                ["female", "female", "male", "kids"]
            );

            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0].scale, "std:clothing");
            assert.strictEqual(result[0].value, "XXL");
            assert.strictEqual(result[0].gender, "female");
            assert.strictEqual(result[0].native, 24);
            assert.strictEqual(result[1].scale, "bag");
            assert.strictEqual(result[1].value, "One Size");
            assert.strictEqual(result[1].gender, "female");
            assert.strictEqual(result[1].native, 17);
            assert.strictEqual(result[2].scale, "it");
            assert.strictEqual(result[2].value, "8.5");
            assert.strictEqual(result[2].gender, "male");
            assert.strictEqual(result[2].native, 22);
            assert.strictEqual(result[3].scale, "std:clothing");
            assert.strictEqual(result[3].value, "4 Yrs");
            assert.strictEqual(result[3].gender, "kids");
            assert.strictEqual(result[3].native, 19);
        });
    });
});
