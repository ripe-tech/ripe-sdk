const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Config", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#hasTag()", function() {
        it("should be able validate simple tags", async () => {
            let instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasTag("no_customization"), false);

            instance = await new ripe.Ripe("swear", "maddox_glitter", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasTag("no_customization"), true);
        });
    });

    describe("#hasCustomization()", function() {
        it("should be able validate customization status", async () => {
            let instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasCustomization(), true);

            instance = await new ripe.Ripe("swear", "maddox_glitter", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasCustomization(), false);
        });
    });

    describe("#hasPersonalization()", function() {
        it("should be able validate personalization status", async () => {
            let instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasPersonalization(), true);

            instance = await new ripe.Ripe("swear", "uglyww", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasPersonalization(), false);
        });
    });

    describe("#hasSize()", function() {
        it("should be able validate size status", async () => {
            const instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasSize(), true);
        });
    });

    describe("#hasInitialsRadius()", function() {
        it("should be able validate initials radius status", async () => {
            const instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.hasInitialsRadius(), true);
        });
    });

    describe("#initialsConfig()", function() {
        it("should be able to merge two the initials configurations", () => {
            const instance = new ripe.Ripe("swear", "vyner", {
                noBundles: true,
                remoteCalls: false
            });

            let result = instance._initialsMerge({}, {});
            assert.deepEqual(result, {});

            result = instance._initialsMerge({ a: 1, b: 2 }, {});
            assert.deepEqual(result, { a: 1, b: 2 });

            result = instance._initialsMerge({ a: 1, b: 2 }, { c: 3 });
            assert.deepEqual(result, { a: 1, b: 2, c: 3 });

            result = instance._initialsMerge({ a: 1, b: 2 }, { a: 3 });
            assert.deepEqual(result, { a: 3, b: 2 });

            result = instance._initialsMerge({ a: 1, b: 2 }, { a: 3 });
            assert.deepEqual(result, { a: 3, b: 2 });

            result = instance._initialsMerge({ a: 1, b: 2 }, { c: { c1: 1, c2: 2 } });
            assert.deepEqual(result, { a: 1, b: 2, c: { c1: 1, c2: 2 } });

            result = instance._initialsMerge({ a: 1, b: 2, c: { c1: 1, c2: 2 } }, { c: { c3: 3 } });
            assert.deepEqual(result, { a: 1, b: 2, c: { c1: 1, c2: 2, c3: 3 } });

            result = instance._initialsMerge(
                { a: 1, b: 2, c: { c1: 1, c2: 2 } },
                { c: { c1: 123, c3: 3 } }
            );
            assert.deepEqual(result, { a: 1, b: 2, c: { c1: 123, c2: 2, c3: 3 } });

            result = instance._initialsMerge(
                { a: 1, b: { b1: 1, b2: { b21: 11, b22: 22 } } },
                { c: { c1: 1, c2: 2 } }
            );
            assert.deepEqual(result, {
                a: 1,
                b: { b1: 1, b2: { b21: 11, b22: 22 } },
                c: { c1: 1, c2: 2 }
            });

            result = instance._initialsMerge(
                { a: 1, b: { b1: 1, b2: { b21: 11, b22: 22 } } },
                { b: { b1: 1, b2: { b22: 2222 } }, c: { c1: 1, c2: 2 } }
            );
            assert.deepEqual(result, {
                a: 1,
                b: { b1: 1, b2: { b21: 11, b22: 2222 } },
                c: { c1: 1, c2: 2 }
            });

            result = instance._initialsMerge(
                { a: 1, b: { b1: 1, b2: { b21: 11, b22: 22 } } },
                {
                    a: 111,
                    d: 5,
                    b: { b1: 1, b2: { b22: 2222 }, b3: 3 },
                    c: { c1: 1, c2: 2, c3: { c31: { c311: { c3111: "submarine" } } } }
                }
            );
            assert.deepEqual(result, {
                a: 111,
                b: { b1: 1, b2: { b21: 11, b22: 2222 }, b3: 3 },
                c: { c1: 1, c2: 2, c3: { c31: { c311: { c3111: "submarine" } } } },
                d: 5
            });

            result = instance._initialsMerge({ a: [1, 2] }, { a: [11, 22, 33] });
            assert.deepEqual(result, { a: [11, 22, 33] });

            result = instance._initialsMerge({ a: 1, b: 2 }, { a: [1, 2, 3] });
            assert.deepEqual(result, { a: [1, 2, 3], b: 2 });

            result = instance._initialsMerge(
                { a: 1, b: [1, 2, 3] },
                { c: { c1: [4, 5, 6], c2: 2 } }
            );
            assert.deepEqual(result, { a: 1, b: [1, 2, 3], c: { c1: [4, 5, 6], c2: 2 } });

            result = instance._initialsMerge({ a: "example a" }, { a: "override a" });
            assert.deepEqual(result, { a: "override a" });

            result = instance._initialsMerge({ a: 1, b: 2 }, { a: "example 1" });
            assert.deepEqual(result, { a: "example 1", b: 2 });

            result = instance._initialsMerge(
                { a: "1", b: [1, 2, 3] },
                { c: { c1: "example text", c2: 2 } }
            );
            assert.deepEqual(result, { a: "1", b: [1, 2, 3], c: { c1: "example text", c2: 2 } });
        });

        it("should be able to retrieve the initials config with the applied profiles", () => {
            const config = {
                initials: {
                    $profiles: {
                        base: {
                            frame: "top",
                            align: "center",
                            image_rotation: 270,
                            font_family: "Gold",
                            font_spacing: -10,
                            rotation: 0
                        },
                        metal_copper: { font_family: "Copper" },
                        metal_gold: { font_family: "Gold" },
                        metal_silver: { font_family: "Silver" },
                        "viewport::large": { viewport: [324, 283, 250, 250] },
                        "viewport::medium": { viewport: [349, 308, 200, 200] }
                    },
                    $alias: {
                        "step::personalization": ["viewport::large"],
                        custom_alias_1: ["base", "viewport::medium"],
                        custom_alias_2: ["base", "metal_gold", "metal_silver"]
                    }
                }
            };
            const instance = new ripe.Ripe("swear", "vyner", {
                noBundles: true,
                remoteCalls: false
            });

            let initialsConfig = instance.initialsConfig(config);
            assert.strictEqual(initialsConfig.frame, undefined);
            assert.strictEqual(initialsConfig.align, undefined);
            assert.strictEqual(initialsConfig.image_rotation, undefined);
            assert.strictEqual(initialsConfig.font_family, undefined);
            assert.strictEqual(initialsConfig.font_spacing, undefined);
            assert.strictEqual(initialsConfig.rotation, undefined);

            initialsConfig = instance.initialsConfig(config, ["base"]);
            assert.strictEqual(initialsConfig.frame, "top");
            assert.strictEqual(initialsConfig.align, "center");
            assert.strictEqual(initialsConfig.image_rotation, 270);
            assert.strictEqual(initialsConfig.font_family, "Gold");
            assert.strictEqual(initialsConfig.font_spacing, -10);
            assert.strictEqual(initialsConfig.rotation, 0);

            initialsConfig = instance.initialsConfig(config, ["step::personalization"]);
            assert.strictEqual(initialsConfig.frame, undefined);
            assert.strictEqual(initialsConfig.align, undefined);
            assert.strictEqual(initialsConfig.image_rotation, undefined);
            assert.strictEqual(initialsConfig.font_family, undefined);
            assert.strictEqual(initialsConfig.font_spacing, undefined);
            assert.strictEqual(initialsConfig.rotation, undefined);
            assert.deepEqual(initialsConfig.viewport, [324, 283, 250, 250]);

            initialsConfig = instance.initialsConfig(config, [
                "custom_alias_1",
                "step::personalization"
            ]);
            assert.strictEqual(initialsConfig.frame, "top");
            assert.strictEqual(initialsConfig.align, "center");
            assert.strictEqual(initialsConfig.image_rotation, 270);
            assert.strictEqual(initialsConfig.font_family, "Gold");
            assert.strictEqual(initialsConfig.font_spacing, -10);
            assert.strictEqual(initialsConfig.rotation, 0);
            assert.deepEqual(initialsConfig.viewport, [349, 308, 200, 200]);

            initialsConfig = instance.initialsConfig(config, ["custom_alias_2"]);
            assert.strictEqual(initialsConfig.frame, "top");
            assert.strictEqual(initialsConfig.align, "center");
            assert.strictEqual(initialsConfig.image_rotation, 270);
            assert.strictEqual(initialsConfig.font_family, "Silver");
            assert.strictEqual(initialsConfig.font_spacing, -10);
            assert.strictEqual(initialsConfig.rotation, 0);

            initialsConfig = instance.initialsConfig(config, [
                "metal_copper",
                "metal_silver",
                "metal_gold"
            ]);
            assert.strictEqual(initialsConfig.font_family, "Copper");

            initialsConfig = instance.initialsConfig(config, [
                "custom_alias_2",
                "metal_copper",
                "metal_silver",
                "metal_gold"
            ]);
            assert.strictEqual(initialsConfig.font_family, "Silver");
        });

        it("should be able to match the config of the remote initials config call", async () => {
            const instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            let remote = await instance.getInitialsConfigP();
            let local = instance.initialsConfig(instance.loadedConfig);
            assert.deepEqual(remote.profiles, ["base"]);
            assert.strictEqual(remote.frame, "top");
            assert.strictEqual(remote.align, "center");
            assert.strictEqual(remote.image_rotation, 270);
            assert.strictEqual(remote.font_family, "SwearGold");
            assert.strictEqual(remote.font_spacing, -10);
            assert.strictEqual(remote.rotation, 0);
            assert.deepEqual(remote.profiles, local.profiles);
            assert.strictEqual(remote.frame, local.frame);
            assert.strictEqual(remote.align, local.align);
            assert.strictEqual(remote.image_rotation, local.image_rotation);
            assert.strictEqual(remote.font_family, local.font_family);
            assert.strictEqual(remote.font_spacing, local.font_spacing);
            assert.strictEqual(remote.rotation, local.rotation);

            remote = await instance.getInitialsConfigP({ profiles: ["step::personalization"] });
            local = instance.initialsConfig(instance.loadedConfig, ["step::personalization"]);
            assert.deepEqual(remote.profiles, ["base", "viewport::large"]);
            assert.strictEqual(remote.frame, "top");
            assert.strictEqual(remote.align, "center");
            assert.strictEqual(remote.image_rotation, 270);
            assert.strictEqual(remote.font_family, "SwearGold");
            assert.strictEqual(remote.font_spacing, -10);
            assert.strictEqual(remote.rotation, 0);
            assert.deepEqual(remote.viewport, [324, 283, 250, 250]);
            assert.deepEqual(remote.profiles, local.profiles);
            assert.strictEqual(remote.frame, local.frame);
            assert.strictEqual(remote.align, local.align);
            assert.strictEqual(remote.image_rotation, local.image_rotation);
            assert.strictEqual(remote.font_family, local.font_family);
            assert.strictEqual(remote.font_spacing, local.font_spacing);
            assert.strictEqual(remote.rotation, local.rotation);
            assert.deepEqual(remote.viewport, local.viewport);
        });
    });
});
