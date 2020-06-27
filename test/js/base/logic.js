const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Logic", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#parseEngraving()", async function() {
        it("should be able to parse a single engraving value", async () => {
            let result;

            const properties = [
                {
                    name: "gold",
                    type: "material"
                },
                {
                    name: "silver",
                    type: "material"
                },
                {
                    name: "arial",
                    type: "font"
                },
                {
                    name: "opensans",
                    type: "font"
                }
            ];
            const instance = await new ripe.Ripe({ init: false });

            result = instance.parseEngraving("gold.opensans", properties);
            assert.deepStrictEqual(result, {
                values: [
                    { name: "gold", type: "material" },
                    { name: "opensans", type: "font" }
                ],
                valuesM: { material: "gold", font: "opensans" }
            });

            result = instance.parseEngraving("opensans.gold", properties);
            assert.deepStrictEqual(result, {
                values: [
                    { name: "gold", type: "material" },
                    { name: "opensans", type: "font" }
                ],
                valuesM: { material: "gold", font: "opensans" }
            });
        });
    });

    describe("#normalizeEngraving()", async function() {
        it("should be able to normalize an engraving value", async () => {
            let result;

            const properties = [
                {
                    name: "gold",
                    type: "material"
                },
                {
                    name: "silver",
                    type: "material"
                },
                {
                    name: "arial",
                    type: "font"
                },
                {
                    name: "opensans",
                    type: "font"
                }
            ];
            const instance = await new ripe.Ripe({ init: false });

            result = instance.normalizeEngraving("gold.opensans", properties);
            assert.strictEqual(result, "gold:material.opensans:font");

            result = instance.normalizeEngraving("opensans.gold", properties);
            assert.strictEqual(result, "gold:material.opensans:font");
        });
    });
});
