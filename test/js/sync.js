const assert = require("assert");
const config = require("./config");
const base = require("../../src/js/base");
const plugins = require("../../src/js/plugins");

const MockRipe = function() {
    const mockRipe = new base.ripe.Observable();
    mockRipe.setParts = function(parts) {
        this.parts = parts;
    };
    mockRipe.bind = function(name, callback) {};
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

            mockRipe.parts.bottom.color = "white";
            syncPlugin._applySync("bottom", {
                material: "nappa",
                color: "white"
            });
            assert.equal(mockRipe.parts.bottom.color, "white");
            assert.equal(mockRipe.parts.upper.color, "white");
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
            assert.equal(mockRipe.parts.bottom.material, "nappa");
            assert.equal(mockRipe.parts.bottom.color, "black");

            mockRipe.parts.bottom.material = "suede";
            mockRipe.parts.bottom.color = "white";
            syncPlugin._applySync("bottom", {
                material: "suede",
                color: "white"
            });
            assert.equal(mockRipe.parts.bottom.material, "suede");
            assert.equal(mockRipe.parts.bottom.color, "white");
            assert.equal(mockRipe.parts.upper.material, "suede");
            assert.equal(mockRipe.parts.upper.color, "white");
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
            assert.equal(mockRipe.parts.bottom.material, "suede");

            mockRipe.parts.bottom.material = "suede";
            mockRipe.parts.bottom.color = "white";
            syncPlugin._applySync("bottom", {
                material: "suede",
                color: "white"
            });
            assert.equal(mockRipe.parts.bottom.material, "suede");
            assert.equal(mockRipe.parts.bottom.color, "white");
            assert.equal(mockRipe.parts.upper.material, "nappa");
            assert.equal(mockRipe.parts.upper.color, "white");
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

            mockRipe.parts.bottom.color = "red";
            syncPlugin._applySync("bottom", {
                material: "suede",
                color: "red"
            });
            assert.equal(mockRipe.parts.bottom.material, "suede");
            assert.equal(mockRipe.parts.bottom.color, "red");
            assert.equal(mockRipe.parts.upper.material, "nappa");
            assert.equal(mockRipe.parts.upper.color, "black");

            mockRipe.parts.bottom.color = "white";
            syncPlugin._applySync("bottom", {
                material: "suede",
                color: "white"
            });
            assert.equal(mockRipe.parts.bottom.material, "suede");
            assert.equal(mockRipe.parts.bottom.color, "white");
            assert.equal(mockRipe.parts.upper.material, "nappa");
            assert.equal(mockRipe.parts.upper.color, "white");
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

            mockRipe.parts.bottom.material = "suede";
            mockRipe.parts.bottom.color = "red";
            syncPlugin._applySync("bottom", {
                material: "suede",
                color: "red"
            });
            assert.equal(mockRipe.parts.bottom.material, "suede");
            assert.equal(mockRipe.parts.bottom.color, "red");
            assert.equal(mockRipe.parts.upper.material, "nappa");
            assert.equal(mockRipe.parts.upper.color, "green");
        });
    });
});
