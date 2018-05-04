const assert = require("assert");
const config = require("./config");
const base = require("../../src/js/base");
const plugins = require("../../src/js/plugins");

describe("Ripe", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should apply restrictions", async () => {
            const mockRipe = new base.ripe.Observable();
            mockRipe.setParts = function(parts) {
                this.parts = parts;
            };

            const initialParts = {
                upper: {
                    material: "nappa",
                    color: "black"
                },
                bottom: {
                    material: "nappa",
                    color: "black"
                }
            };
            const restrictions = [
                [{
                    color: "black"
                }, {
                    color: "white"
                }]
            ];
            const partOptions = [{
                name: "upper",
                materials: [{
                    name: "nappa",
                    colors: ["black", "white"]
                }]
            }, {
                name: "bottom",
                materials: [{
                    name: "nappa",
                    colors: ["black", "white"]
                }]
            }];

            mockRipe.setParts(initialParts);

            const restrictionsPlugin = new plugins.ripe.Ripe.plugins.RestrictionsPlugin(
                restrictions, partOptions);
            restrictionsPlugin.register(mockRipe);

            restrictionsPlugin._applyRestrictions();
            assert.deepEqual(initialParts, mockRipe.parts);

            mockRipe.parts.bottom.color = "white";
            restrictionsPlugin._applyRestrictions(
                "bottom", {
                    material: mockRipe.parts.bottom.material,
                    color: mockRipe.parts.bottom.color
                }
            );
            assert.equal(mockRipe.parts.bottom.color, "white");
            assert.equal(mockRipe.parts.upper.color, "white");
        });
    });
});
