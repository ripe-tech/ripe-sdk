const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");
const base = require("../../src/js/base");
const plugins = require("../../src/js/plugins");

const MockRipe = function() {
    const mockRipe = new base.ripe.Observable();
    mockRipe.ready = true;
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

describe("Sync", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should apply string sync rules", () => {
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
            const sync = {
                full: ["upper", "bottom"]
            };
            const mockRipe = new MockRipe();
            mockRipe.setParts(initialParts);

            const syncPlugin = new plugins.ripe.Ripe.plugins.SyncPlugin(sync);
            syncPlugin.register(mockRipe);

            syncPlugin._applySync();
            assert.deepStrictEqual(initialParts, mockRipe.parts);

            mockRipe.setPart("bottom", "nappa", "white");
            assert.strictEqual(mockRipe.parts.bottom.color, "white");
            assert.strictEqual(mockRipe.parts.upper.color, "white");
        });

        it("should apply object sync rules", () => {
            const initialParts = {
                upper: {
                    material: "nappa",
                    color: "black"
                },
                bottom: {
                    material: "suede",
                    color: "white"
                }
            };
            const sync = {
                full: [
                    {
                        part: "upper"
                    },
                    {
                        part: "bottom"
                    }
                ]
            };
            const mockRipe = new MockRipe();
            mockRipe.setParts(initialParts);

            const syncPlugin = new plugins.ripe.Ripe.plugins.SyncPlugin(sync);
            syncPlugin.register(mockRipe);

            syncPlugin._applySync();
            assert.strictEqual(mockRipe.parts.bottom.material, "nappa");
            assert.strictEqual(mockRipe.parts.bottom.color, "black");

            mockRipe.setPart("bottom", "suede", "white");
            assert.strictEqual(mockRipe.parts.bottom.material, "suede");
            assert.strictEqual(mockRipe.parts.bottom.color, "white");
            assert.strictEqual(mockRipe.parts.upper.material, "suede");
            assert.strictEqual(mockRipe.parts.upper.color, "white");
        });

        it("should apply part-material sync rules", () => {
            const initialParts = {
                upper: {
                    material: "nappa",
                    color: "black"
                },
                bottom: {
                    material: "leather",
                    color: "black"
                }
            };

            const sync = {
                full: [
                    {
                        part: "upper",
                        material: "nappa"
                    },
                    {
                        part: "bottom",
                        material: "suede"
                    }
                ]
            };
            const mockRipe = new MockRipe();
            mockRipe.setParts(initialParts);

            const syncPlugin = new plugins.ripe.Ripe.plugins.SyncPlugin(sync);
            syncPlugin.register(mockRipe);

            syncPlugin._applySync();
            assert.strictEqual(mockRipe.parts.bottom.material, "suede");

            mockRipe.setPart("bottom", "suede", "white");
            assert.strictEqual(mockRipe.parts.bottom.material, "suede");
            assert.strictEqual(mockRipe.parts.bottom.color, "white");
            assert.strictEqual(mockRipe.parts.upper.material, "nappa");
            assert.strictEqual(mockRipe.parts.upper.color, "white");
        });

        it("should apply part-color sync rules", () => {
            const initialParts = {
                upper: {
                    material: "nappa",
                    color: "black"
                },
                bottom: {
                    material: "suede",
                    color: "black"
                }
            };
            const sync = {
                full: [
                    {
                        part: "upper",
                        color: "white"
                    },
                    {
                        part: "bottom",
                        color: "white"
                    }
                ]
            };
            const mockRipe = new MockRipe();
            mockRipe.setParts(initialParts);

            const syncPlugin = new plugins.ripe.Ripe.plugins.SyncPlugin(sync);
            syncPlugin.register(mockRipe);

            syncPlugin._applySync();
            assert.deepStrictEqual(initialParts, mockRipe.parts);

            mockRipe.setPart("bottom", "suede", "red");
            assert.strictEqual(mockRipe.parts.bottom.material, "suede");
            assert.strictEqual(mockRipe.parts.bottom.color, "red");
            assert.strictEqual(mockRipe.parts.upper.material, "nappa");
            assert.strictEqual(mockRipe.parts.upper.color, "black");

            mockRipe.setPart("bottom", "suede", "white");
            assert.strictEqual(mockRipe.parts.bottom.material, "suede");
            assert.strictEqual(mockRipe.parts.bottom.color, "white");
            assert.strictEqual(mockRipe.parts.upper.material, "nappa");
            assert.strictEqual(mockRipe.parts.upper.color, "white");
        });

        it("should apply part-material-color sync rules", () => {
            const initialParts = {
                upper: {
                    material: "nappa",
                    color: "black"
                },
                bottom: {
                    material: "suede",
                    color: "black"
                }
            };

            const sync = {
                full: [
                    {
                        part: "upper",
                        material: "nappa",
                        color: "green"
                    },
                    {
                        part: "bottom",
                        material: "suede",
                        color: "red"
                    }
                ]
            };
            const mockRipe = new MockRipe();
            mockRipe.setParts(initialParts);

            const syncPlugin = new plugins.ripe.Ripe.plugins.SyncPlugin(sync);
            syncPlugin.register(mockRipe);

            syncPlugin._applySync();
            assert.deepStrictEqual(initialParts, mockRipe.parts);

            mockRipe.setPart("bottom", "suede", "red");
            assert.strictEqual(mockRipe.parts.bottom.material, "suede");
            assert.strictEqual(mockRipe.parts.bottom.color, "red");
            assert.strictEqual(mockRipe.parts.upper.material, "nappa");
            assert.strictEqual(mockRipe.parts.upper.color, "green");
        });

        it("should apply config sync rules", async () => {
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
            const sync = {
                full: ["upper", "bottom"]
            };
            const mockRipe = new MockRipe();
            mockRipe.getConfigP = async () => {
                return new Promise((resolve, reject) => {
                    resolve({ result: { sync } });
                });
            };
            mockRipe.setParts(initialParts);

            const syncPlugin = new plugins.ripe.Ripe.plugins.SyncPlugin({}, { loadConfig: true });
            await syncPlugin.register(mockRipe);

            assert.deepStrictEqual(initialParts, mockRipe.parts);

            mockRipe.setPart("bottom", "nappa", "white");

            assert.strictEqual(mockRipe.parts.bottom.color, "white");
            assert.strictEqual(mockRipe.parts.upper.color, "white");
        });

        it("should update sync rules when config changes", async () => {
            const instance = new ripe.Ripe("swear", "vyner");
            instance.load();

            await new Promise((resolve, reject) => {
                instance.bind("parts", resolve);
            });

            const syncPlugin = new plugins.ripe.Ripe.plugins.SyncPlugin({}, { loadConfig: true });
            await syncPlugin.register(instance);
            assert.strictEqual(instance.parts.hardware.color, "silver");
            assert.strictEqual(instance.parts.logo.color, "silver");

            instance.setPart("hardware", "metal", "bronze");

            assert.strictEqual(instance.parts.hardware.color, "bronze");
            assert.strictEqual(instance.parts.logo.color, "bronze");

            instance.config("swear", "maltby");
            await new Promise((resolve, reject) => {
                syncPlugin.bind("config", resolve);
            });

            assert.strictEqual(instance.parts.fringe_hardware.color, "silver");
            assert.strictEqual(instance.parts.logo.color, "silver");

            instance.setPart("fringe_hardware", "metal", "bronze");

            assert.strictEqual(instance.parts.fringe_hardware.color, "bronze");
            assert.strictEqual(instance.parts.logo.color, "bronze");
        });
    });
});
