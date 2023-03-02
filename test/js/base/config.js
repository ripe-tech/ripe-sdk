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
        it("should be able to merge two initials configurations", () => {
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

            const config2 = {
                initials: {
                    $profiles: {
                        base: {
                            example_a: 1000,
                            example_b: 50000,
                            more_detail: {
                                value_a: 1,
                                value_b: 3.14,
                                value_c: [1, 2, 3],
                                value_d: "text example",
                                value_e: true,
                                value_f: {
                                    a: 42,
                                    b: 2.71,
                                    c: [1, 2],
                                    d: "lorim epsum",
                                    e: false,
                                    f: { val_a: "submarine", val_b: 7 }
                                }
                            }
                        },
                        complex_1: {
                            example_b: 100,
                            more_detail: {
                                value_a: 20,
                                value_b: 6.8,
                                value_c: [3],
                                value_d: false,
                                value_e: "random text",
                                value_f: {
                                    a: 42.5,
                                    d: "lorim epsum",
                                    e: [4.1, 6.5],
                                    f: { val_b: 57 }
                                },
                                value_g: { a: 10, b: "https://www.platforme.com/" }
                            }
                        },
                        simple_1: { example_a: 10.0, value_a: 37 },
                        simple_2: { more_detail: ["a", "b", 42] }
                    },
                    $alias: {
                        alias_1: ["base", "complex_1"],
                        alias_2: ["base", "complex_1", "base"],
                        alias_3: ["base", "complex_1", "simple_2", "simple_1"]
                    }
                }
            };
            initialsConfig = instance.initialsConfig(config2, ["base"]);
            assert.strictEqual(initialsConfig.example_a, 1000);
            assert.strictEqual(initialsConfig.example_b, 50000);
            let moreDetail = initialsConfig.more_detail;
            assert.strictEqual(moreDetail.value_a, 1);
            assert.strictEqual(moreDetail.value_b, 3.14);
            assert.deepEqual(moreDetail.value_c, [1, 2, 3]);
            assert.strictEqual(moreDetail.value_d, "text example");
            assert.strictEqual(moreDetail.value_e, true);
            let valueF = moreDetail.value_f;
            assert.strictEqual(valueF.a, 42);
            assert.strictEqual(valueF.b, 2.71);
            assert.deepEqual(valueF.c, [1, 2]);
            assert.strictEqual(valueF.d, "lorim epsum");
            assert.strictEqual(valueF.e, false);
            assert.strictEqual(valueF.f.val_a, "submarine");
            assert.strictEqual(valueF.f.val_b, 7);

            initialsConfig = instance.initialsConfig(config2, ["base", "complex_1"]);
            assert.strictEqual(initialsConfig.example_a, 1000);
            assert.strictEqual(initialsConfig.example_b, 50000);
            moreDetail = initialsConfig.more_detail;
            assert.strictEqual(moreDetail.value_a, 1);
            assert.strictEqual(moreDetail.value_b, 3.14);
            assert.deepEqual(moreDetail.value_c, [1, 2, 3]);
            assert.strictEqual(moreDetail.value_d, "text example");
            assert.strictEqual(moreDetail.value_e, true);
            valueF = moreDetail.value_f;
            assert.strictEqual(valueF.a, 42);
            assert.strictEqual(valueF.b, 2.71);
            assert.deepEqual(valueF.c, [1, 2]);
            assert.strictEqual(valueF.d, "lorim epsum");
            assert.strictEqual(valueF.e, false);
            assert.strictEqual(valueF.f.val_a, "submarine");
            assert.strictEqual(valueF.f.val_b, 7);

            initialsConfig = instance.initialsConfig(config2, ["complex_1", "base"]);
            assert.strictEqual(initialsConfig.example_a, 1000);
            assert.strictEqual(initialsConfig.example_b, 100);
            moreDetail = initialsConfig.more_detail;
            assert.strictEqual(moreDetail.value_a, 20);
            assert.strictEqual(moreDetail.value_b, 6.8);
            assert.deepEqual(moreDetail.value_c, [3]);
            assert.strictEqual(moreDetail.value_d, false);
            assert.strictEqual(moreDetail.value_e, "random text");
            valueF = moreDetail.value_f;
            assert.strictEqual(valueF.a, 42.5);
            assert.strictEqual(valueF.b, 2.71);
            assert.deepEqual(valueF.c, [1, 2]);
            assert.strictEqual(valueF.d, "lorim epsum");
            assert.deepEqual(valueF.e, [4.1, 6.5]);
            assert.strictEqual(valueF.f.val_a, "submarine");
            assert.strictEqual(valueF.f.val_b, 57);
            const valueG = moreDetail.value_g;
            assert.strictEqual(valueG.a, 10);
            assert.strictEqual(valueG.b, "https://www.platforme.com/");

            initialsConfig = instance.initialsConfig(config2, [
                "simple_1",
                "simple_2",
                "complex_1",
                "base"
            ]);
            assert.strictEqual(initialsConfig.example_a, 10.0);
            assert.strictEqual(initialsConfig.example_b, 100);
            assert.strictEqual(initialsConfig.value_a, 37);
            assert.deepEqual(initialsConfig.more_detail, ["a", "b", 42]);

            initialsConfig = instance.initialsConfig(config2, ["alias_3"]);
            assert.strictEqual(initialsConfig.example_a, 10.0);
            assert.strictEqual(initialsConfig.example_b, 100);
            assert.strictEqual(initialsConfig.value_a, 37);
            assert.deepEqual(initialsConfig.more_detail, ["a", "b", 42]);
        });

        it("should be able to match the config of the remote initials config call", async () => {
            let instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
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

            instance = await new ripe.Ripe("dummy", "cube", { noBundles: true });
            await instance.isReady();

            remote = await instance.getInitialsConfigP({ profiles: ["style::black"] });
            local = instance.initialsConfig(instance.loadedConfig, ["style::black"]);
            assert.deepEqual(remote.profiles, ["base", "style::black"]);
            assert.deepEqual(remote.position, [500, 500]);
            assert.strictEqual(remote.frame, "0");
            assert.strictEqual(remote.image_rotation, 0);
            assert.strictEqual(remote.color, "000000");
            assert.strictEqual(remote.font_size, 80);
            assert.strictEqual(remote.font_spacing, 6);
            assert.strictEqual(remote.shadow, true);
            assert.strictEqual(remote.csr.width, 4550);
            assert.strictEqual(remote.csr.height, 500);
            assert.strictEqual(remote.csr.curve_type, "catmullrom");
            assert.strictEqual(remote.csr.curve_tension, 0);
            assert.strictEqual(remote.csr.text.font_size, 315);
            assert.strictEqual(remote.csr.material.displacement_scale, 20);
            assert.deepEqual(remote.profiles, local.profiles);
            assert.deepEqual(remote.position, local.position);
            assert.strictEqual(remote.frame, local.frame);
            assert.strictEqual(remote.image_rotation, local.image_rotation);
            assert.strictEqual(remote.color, local.color);
            assert.strictEqual(remote.font_size, local.font_size);
            assert.strictEqual(remote.font_spacing, local.font_spacing);
            assert.strictEqual(remote.shadow, local.shadow);
            assert.strictEqual(remote.csr.width, local.csr.width);
            assert.strictEqual(remote.csr.height, local.csr.height);
            assert.strictEqual(remote.csr.curve_type, local.csr.curve_type);
            assert.strictEqual(remote.csr.curve_tension, local.csr.curve_tension);
            assert.strictEqual(remote.csr.text.font_size, local.csr.text.font_size);
            assert.strictEqual(
                remote.csr.material.displacement_scale,
                local.csr.material.displacement_scale
            );
        });
    });
});
