const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");
const base = require("../../src/js/base");
const plugins = require("../../src/js/plugins");

const MockRipe = function(partOptions, optionals) {
    const mockRipe = new base.ripe.Observable();

    const defaults = {};
    optionals = optionals || [];
    optionals.forEach(function(optional) {
        defaults[optional] = {
            optional: true
        };
    });
    mockRipe.loadedConfig = {
        defaults: defaults,
        parts: partOptions
    };
    mockRipe.setPart = function(part, material, color) {
        this.parts[part] = {
            material: material,
            color: color
        };
        this.trigger("part", part, {
            material: material,
            color: color
        });
    };

    mockRipe.setParts = function(parts) {
        this.parts = parts;
    };
    return mockRipe;
};

describe("Restrictions", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should apply restrictions", async () => {
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
                [
                    {
                        color: "black"
                    },
                    {
                        color: "white"
                    }
                ]
            ];
            const partOptions = [
                {
                    name: "upper",
                    materials: [
                        {
                            name: "nappa",
                            colors: ["black", "white"]
                        }
                    ]
                },
                {
                    name: "bottom",
                    materials: [
                        {
                            name: "nappa",
                            colors: ["black", "white"]
                        }
                    ]
                }
            ];

            const mockRipe = new MockRipe(partOptions);
            mockRipe.setParts(initialParts);

            const restrictionsPlugin = new plugins.ripe.Ripe.plugins.RestrictionsPlugin(
                restrictions,
                { manual: true }
            );
            restrictionsPlugin.register(mockRipe);
            mockRipe.trigger("config");

            assert.deepStrictEqual(initialParts, mockRipe.parts);

            mockRipe.setPart("bottom", "nappa", "white");
            assert.strictEqual(mockRipe.parts.bottom.color, "white");
            assert.strictEqual(mockRipe.parts.upper.color, "white");
        });

        it("should remove optional part if needed", async () => {
            const initialParts = {
                upper: {
                    material: "nappa",
                    color: "black"
                }
            };
            const restrictions = [
                [
                    {
                        material: "nappa"
                    },
                    {
                        material: "metal"
                    }
                ]
            ];
            const partOptions = [
                {
                    name: "upper",
                    materials: [
                        {
                            name: "nappa",
                            colors: ["black"]
                        },
                        {
                            name: "suede",
                            colors: ["black"]
                        }
                    ]
                },
                {
                    name: "logo",
                    materials: [
                        {
                            name: "metal",
                            colors: ["gold"]
                        }
                    ]
                }
            ];

            const mockRipe = new MockRipe(partOptions, ["logo"]);
            mockRipe.setParts(initialParts);

            const restrictionsPlugin = new plugins.ripe.Ripe.plugins.RestrictionsPlugin(
                restrictions,
                { manual: true }
            );
            restrictionsPlugin.register(mockRipe);

            assert.deepStrictEqual(initialParts, mockRipe.parts);

            mockRipe.trigger("config");

            mockRipe.setPart("logo", "metal", "gold");
            assert.deepStrictEqual(
                {
                    upper: {
                        material: "suede",
                        color: "black"
                    },
                    logo: {
                        material: "metal",
                        color: "gold"
                    }
                },
                mockRipe.parts
            );

            mockRipe.parts.upper = {
                material: "nappa",
                color: "black"
            };
            restrictionsPlugin._applyRestrictions("upper", mockRipe.parts.upper);
            assert.deepStrictEqual(
                {
                    upper: {
                        material: "nappa",
                        color: "black"
                    },
                    logo: {
                        material: null,
                        color: null
                    }
                },
                mockRipe.parts
            );
        });
    });

    describe("#auto", function() {
        it("should load restrictions from ripe instance", async () => {
            let promise;
            let config;

            const restrictionsPlugin = new plugins.ripe.Ripe.plugins.RestrictionsPlugin();
            const instance = new ripe.Ripe("swear", "vyner", { plugins: [restrictionsPlugin] });
            instance.load();
            await new Promise((resolve, reject) => {
                instance.bind("config", resolve);
            });

            config = instance.loadedConfig;
            assert.deepStrictEqual(restrictionsPlugin.restrictions, config.restrictions);
            assert.deepStrictEqual(restrictionsPlugin.partsOptions, config.parts);

            instance.config("toga_pulla", "elvis");
            await new Promise((resolve, reject) => {
                instance.bind("config", resolve);
            });

            config = instance.loadedConfig;
            assert.deepStrictEqual(restrictionsPlugin.restrictions, config.restrictions);
            assert.deepStrictEqual(restrictionsPlugin.partsOptions, config.parts);
        });
    });
});
