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

    describe("#nativetoSize()", function() {
        it("should be able to convert sizes", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.nativeToSizeP("fr", 31, "female");

            assert.strictEqual(result.value, 42);
        });
    });

    describe("#nativetoSizeB()", function() {
        it("should be able to convert sizes in bulk", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.nativeToSizeBP(["fr"], [31], ["female"]);

            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].value, 42);
        });
    });
});
