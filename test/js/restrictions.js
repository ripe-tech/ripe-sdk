const assert = require("assert");
const config = require("./config");
const base = require("../../src/js/base");
const plugins = require("../../src/js/plugins");

describe("Ripe", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should apply restrictions", () => {
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

            const mockRipe = new base.ripe.Observable();
            mockRipe.setParts = function(parts) {
                this.parts = parts;
            };
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

    describe("#optional", function() {
        it("should remove optional part if needed", () => {
            const initialParts = {
                upper: {
                    material: "nappa",
                    color: "black"
                }
            };
            const restrictions = [
                [{
                    material: "nappa"
                }, {
                    material: "metal"
                }]
            ];
            const partOptions = [{
                name: "upper",
                materials: [{
                    name: "suede",
                    colors: ["black"]
                }, {
                    name: "nappa",
                    colors: ["black"]
                }]
            }, {
                name: "logo",
                materials: [{
                    name: "metal",
                    colors: ["gold"]
                }]
            }];

            const mockRipe = new base.ripe.Observable();
            mockRipe.setParts = function(parts) {
                this.parts = parts;
            };
            mockRipe.setParts(initialParts);

            const restrictionsPlugin = new plugins.ripe.Ripe.plugins.RestrictionsPlugin(
                restrictions, partOptions, {
                    optionalParts: ["logo"]
                });
            restrictionsPlugin.register(mockRipe);

            assert.deepEqual(initialParts, mockRipe.parts);

            mockRipe.parts.logo = {
                material: "metal",
                color: "gold"
            };
            restrictionsPlugin._applyRestrictions("logo", mockRipe.parts.logo);
            assert.deepEqual({
                upper: {
                    material: "suede",
                    color: "black"
                },
                logo: {
                    material: "metal",
                    color: "gold"
                }
            }, mockRipe.parts);

            mockRipe.parts.upper = {
                material: "nappa",
                color: "black"
            };
            restrictionsPlugin._applyRestrictions("upper", mockRipe.parts.upper);
            assert.deepEqual({
                upper: {
                    material: "nappa",
                    color: "black"
                },
                logo: {
                    material: null,
                    color: null
                }
            }, mockRipe.parts);
        });
    });
});
