const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");
const base = require("../../../src/js/base");
const plugins = require("../../../src/js/plugins");

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
            mockRipe.trigger("post_config");

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

            mockRipe.trigger("post_config");

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
                    }
                },
                mockRipe.parts
            );
        });
    });

    describe("#auto()", function() {
        it("should load restrictions from ripe instance", async () => {
            const restrictionsPlugin = new plugins.ripe.Ripe.plugins.RestrictionsPlugin();
            const instance = new ripe.Ripe("swear", "vyner", {
                plugins: [restrictionsPlugin],
                noBundles: true
            }).load();

            await new Promise((resolve, reject) => {
                instance.bind("post_config", resolve);
            });

            await instance.isReady();

            assert.deepStrictEqual(
                restrictionsPlugin.restrictions,
                instance.loadedConfig.restrictions
            );
            assert.deepStrictEqual(restrictionsPlugin.partsOptions, instance.loadedConfig.parts);

            instance.config("toga_pulla", "elvis");
            await new Promise((resolve, reject) => {
                instance.bind("post_config", resolve);
            });

            assert.deepStrictEqual(
                restrictionsPlugin.restrictions,
                instance.loadedConfig.restrictions
            );
            assert.deepStrictEqual(restrictionsPlugin.partsOptions, instance.loadedConfig.parts);
        });
    });

    describe("#_applyChanges()", function() {
        it("should apply simple changes", () => {
            let result;
            let target;

            const restrictionsPlugin = new plugins.ripe.Ripe.plugins.RestrictionsPlugin();

            result = restrictionsPlugin._applyChanges(
                [
                    {
                        name: "side",
                        material: "suede",
                        color: "black"
                    }
                ],
                {
                    side: {
                        name: "side",
                        material: "suede",
                        color: "white"
                    }
                }
            );
            assert.deepStrictEqual(result, [
                {
                    from: {
                        part: "side",
                        material: "suede",
                        color: "white"
                    },
                    to: {
                        part: "side",
                        material: "suede",
                        color: "black"
                    }
                }
            ]);

            result = restrictionsPlugin._applyChanges(
                [
                    {
                        name: "side",
                        material: null,
                        color: null
                    }
                ],
                {
                    side: {
                        name: "side"
                    }
                }
            );
            assert.deepStrictEqual(result, []);

            target = { side: { name: "side" } };
            result = restrictionsPlugin._applyChanges(
                [
                    {
                        name: "side",
                        material: null,
                        color: null
                    }
                ],
                target
            );
            assert.deepStrictEqual(result, []);
            assert.deepStrictEqual(target, { side: { name: "side" } });

            target = { side: { name: "side", material: "suede", color: "white" } };
            result = restrictionsPlugin._applyChanges(
                [
                    {
                        name: "side",
                        material: null,
                        color: null
                    }
                ],
                target
            );
            assert.deepStrictEqual(result, [
                {
                    from: {
                        part: "side",
                        material: "suede",
                        color: "white"
                    },
                    to: {
                        part: "side",
                        material: null,
                        color: null
                    }
                }
            ]);
            assert.deepStrictEqual(target, {});
        });
    });
});
