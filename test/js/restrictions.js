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
    mockRipe.getConfigP = async () => {
        return new Promise((resolve, reject) => {
            resolve({
                result: {
                    defaults: defaults,
                    parts: partOptions
                }
            });
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
            const promise = new Promise((resolve, reject) => {
                restrictionsPlugin.bind("config", resolve);
            });

            mockRipe.trigger("config");
            await promise;

            assert.deepStrictEqual(initialParts, mockRipe.parts);

            mockRipe.parts.bottom.color = "white";
            restrictionsPlugin._applyRestrictions("bottom", {
                material: mockRipe.parts.bottom.material,
                color: mockRipe.parts.bottom.color
            });
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

            const promise = new Promise((resolve, reject) => {
                restrictionsPlugin.bind("config", resolve);
            });

            assert.deepStrictEqual(initialParts, mockRipe.parts);

            mockRipe.trigger("config");
            await promise;

            mockRipe.parts.logo = {
                material: "metal",
                color: "gold"
            };
            restrictionsPlugin._applyRestrictions("logo", mockRipe.parts.logo);
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
            promise = new Promise((resolve, reject) => {
                restrictionsPlugin.bind("config", resolve);
            });

            assert.strictEqual(restrictionsPlugin.loaded, false);

            const instance = new ripe.Ripe("swear", "vyner", { plugins: [restrictionsPlugin] });
            instance.load();
            await promise;

            config = await instance.getConfigP();
            assert.strictEqual(restrictionsPlugin.loaded, true);
            assert.deepStrictEqual(restrictionsPlugin.restrictions, config.result.restrictions);
            assert.deepStrictEqual(restrictionsPlugin.partsOptions, config.result.parts);

            promise = new Promise((resolve, reject) => {
                restrictionsPlugin.bind("config", resolve);
            });
            instance.config("toga_pulla", "elvis");
            assert.strictEqual(restrictionsPlugin.loaded, false);
            await promise;

            config = await instance.getConfigP();
            assert.strictEqual(restrictionsPlugin.loaded, true);
            assert.deepStrictEqual(restrictionsPlugin.restrictions, config.result.restrictions);
            assert.deepStrictEqual(restrictionsPlugin.partsOptions, config.result.parts);
        });
    });
});
