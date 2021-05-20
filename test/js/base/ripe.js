const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Ripe", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getStructure()", async function() {
        it("should be able to get a simple structure", async () => {
            let result;

            const instance = await new ripe.Ripe("swear", "vyner", { noBundles: true });
            await instance.isReady();

            result = await instance.getStructure();
            assert.deepStrictEqual(result, {
                brand: "swear",
                model: "vyner",
                parts: {
                    front: {
                        color: "white",
                        material: "nappa"
                    },
                    hardware: {
                        color: "silver",
                        material: "metal"
                    },
                    laces: {
                        color: "white",
                        material: "nylon"
                    },
                    lining: {
                        color: "white",
                        material: "calf_lining"
                    },
                    logo: {
                        color: "silver",
                        material: "metal"
                    },
                    shadow: {
                        color: "default",
                        material: "default"
                    },
                    side: {
                        color: "white",
                        material: "nappa"
                    },
                    sole: {
                        color: "white",
                        material: "rubber"
                    }
                }
            });

            await instance.setInitials("ABC", "gold");
            result = await instance.getStructure();
            assert.deepStrictEqual(result, {
                brand: "swear",
                model: "vyner",
                parts: {
                    front: {
                        color: "white",
                        material: "nappa"
                    },
                    hardware: {
                        color: "silver",
                        material: "metal"
                    },
                    laces: {
                        color: "white",
                        material: "nylon"
                    },
                    lining: {
                        color: "white",
                        material: "calf_lining"
                    },
                    logo: {
                        color: "silver",
                        material: "metal"
                    },
                    shadow: {
                        color: "default",
                        material: "default"
                    },
                    side: {
                        color: "white",
                        material: "nappa"
                    },
                    sole: {
                        color: "white",
                        material: "rubber"
                    }
                },
                initials: "ABC",
                engraving: "gold",
                initials_extra: {
                    main: {
                        initials: "ABC",
                        engraving: "gold"
                    }
                }
            });
        });
    });

    describe("#setStructure()", async function() {
        it("should be able to set a simple structure", async () => {
            const instance = await new ripe.Ripe({ noBundles: true });
            await instance.isReady();

            await instance.setStructure({
                brand: "swear",
                model: "vyner",
                parts: {
                    front: {
                        color: "white",
                        material: "nappa"
                    },
                    hardware: {
                        color: "silver",
                        material: "metal"
                    },
                    laces: {
                        color: "white",
                        material: "nylon"
                    },
                    lining: {
                        color: "white",
                        material: "calf_lining"
                    },
                    logo: {
                        color: "silver",
                        material: "metal"
                    },
                    shadow: {
                        color: "default",
                        material: "default"
                    },
                    side: {
                        color: "white",
                        material: "nappa"
                    },
                    sole: {
                        color: "white",
                        material: "rubber"
                    }
                }
            });

            assert.strictEqual(instance.brand, "swear");
            assert.strictEqual(instance.model, "vyner");
            assert.deepStrictEqual(instance.parts, {
                front: {
                    color: "white",
                    material: "nappa"
                },
                hardware: {
                    color: "silver",
                    material: "metal"
                },
                laces: {
                    color: "white",
                    material: "nylon"
                },
                lining: {
                    color: "white",
                    material: "calf_lining"
                },
                logo: {
                    color: "silver",
                    material: "metal"
                },
                shadow: {
                    color: "default",
                    material: "default"
                },
                side: {
                    color: "white",
                    material: "nappa"
                },
                sole: {
                    color: "white",
                    material: "rubber"
                }
            });
        });
    });

    describe("#setInitials()", async function() {
        it("should be able to set initials", async () => {
            const instance = await new ripe.Ripe({ noBundles: true });
            await instance.isReady();

            assert.strictEqual(instance.initials, "");
            assert.strictEqual(instance.engraving, null);
            assert.deepStrictEqual(instance.initialsExtra, {});

            await instance.setInitials("CR7", "gold");

            assert.strictEqual(instance.initials, "CR7");
            assert.strictEqual(instance.engraving, "gold");
            assert.strictEqual(instance.initialsExtra.main.initials, "CR7");
            assert.strictEqual(instance.initialsExtra.main.engraving, "gold");

            await instance.setInitials("", null);

            assert.strictEqual(instance.initials, "");
            assert.strictEqual(instance.engraving, null);
            assert.strictEqual(instance.initialsExtra.main.initials, "");
            assert.strictEqual(instance.initialsExtra.main.engraving, null);

            await instance.setInitials("CR7");

            assert.strictEqual(instance.initials, "CR7");
            assert.strictEqual(instance.engraving, null);
            assert.strictEqual(instance.initialsExtra.main.initials, "CR7");
            assert.strictEqual(instance.initialsExtra.main.engraving, null);

            await instance.setInitials("", null);

            assert.strictEqual(instance.initials, "");
            assert.strictEqual(instance.engraving, null);
            assert.strictEqual(instance.initialsExtra.main.initials, "");
            assert.strictEqual(instance.initialsExtra.main.engraving, null);

            await instance.setInitialsExtra({
                main: {
                    initials: "CR8",
                    engraving: "gold"
                }
            });

            assert.strictEqual(instance.initials, "CR8");
            assert.strictEqual(instance.engraving, "gold");
            assert.strictEqual(instance.initialsExtra.main.initials, "CR8");
            assert.strictEqual(instance.initialsExtra.main.engraving, "gold");

            await instance.setInitialsExtra({
                main: {
                    initials: "CR8",
                    engraving: "gold"
                },
                side: {
                    initials: "CR9",
                    engraving: "silver"
                }
            });

            assert.strictEqual(instance.initials, "CR8");
            assert.strictEqual(instance.engraving, "gold");
            assert.strictEqual(instance.initialsExtra.main.initials, "CR8");
            assert.strictEqual(instance.initialsExtra.main.engraving, "gold");
            assert.strictEqual(instance.initialsExtra.side.initials, "CR9");
            assert.strictEqual(instance.initialsExtra.side.engraving, "silver");

            await instance.setInitialsExtra({
                side: {
                    initials: "CR9",
                    engraving: "silver"
                }
            });

            assert.strictEqual(instance.initials, "CR9");
            assert.strictEqual(instance.engraving, "silver");
            assert.strictEqual(instance.initialsExtra.main, undefined);
            assert.strictEqual(instance.initialsExtra.side.initials, "CR9");
            assert.strictEqual(instance.initialsExtra.side.engraving, "silver");

            await instance.setInitialsExtra({
                side: {
                    initials: "CR9"
                }
            });

            assert.strictEqual(instance.initials, "CR9");
            assert.strictEqual(instance.engraving, null);
            assert.strictEqual(instance.initialsExtra.main, undefined);
            assert.strictEqual(instance.initialsExtra.side.initials, "CR9");
            assert.strictEqual(instance.initialsExtra.side.engraving, null);
        });
    });

    describe("#setInitials (rejects)()", async function() {
        beforeEach(function() {
            if (!assert.rejects) {
                this.skip();
            }
        });

        it("should be able to validate invalid states", async () => {
            const instance = await new ripe.Ripe({ init: false });

            await assert.rejects(async () => {
                await instance.setInitials("", "gold");
            }, Error);

            await assert.rejects(async () => {
                await instance.setInitialsExtra({
                    main: {
                        initials: "",
                        engraving: "gold"
                    }
                });
            }, Error);
        });
    });

    describe("#_initialsBuilder", function() {
        it("should return the initials and profiles of the image", () => {
            const instance = new ripe.Ripe("dummy", "cube");
            instance.loadedConfig = {
                initials: { properties: [] }
            };

            let result = instance._initialsBuilder("AA", "black:color.rib:position", null, null, [
                "report"
            ]);

            assert.strictEqual(result.initials, "AA");
            assert.deepStrictEqual(result.profile, [
                "report:color::black:position::rib",
                "report:black:rib",
                "color::black:position::rib",
                "black:rib",
                "report:position::rib",
                "report:rib",
                "position::rib",
                "rib",
                "report:color::black",
                "report:black",
                "color::black",
                "black",
                "report"
            ]);

            result = instance._initialsBuilder("AA", "black", null, null, ["report", "large"]);

            assert.strictEqual(result.initials, "AA");
            assert.deepStrictEqual(result.profile, [
                "report:black",
                "large:black",
                "black",
                "report",
                "large"
            ]);

            result = instance._initialsBuilder("AA", "white", "left", null, ["step::size"]);

            assert.strictEqual(result.initials, "AA");
            assert.deepStrictEqual(result.profile, [
                "step::size:white:group::left",
                "step::size:white:left",
                "white:group::left",
                "white:left",
                "step::size:group::left",
                "step::size:left",
                "group::left",
                "left",
                "step::size:white",
                "white",
                "step::size"
            ]);
        });
    });

    describe("#_generateProfiles", function() {
        it("should return the image profiles related to the group and viewport given", () => {
            const instance = new ripe.Ripe("dummy", "cube");
            instance.loadedConfig = {
                initials: { properties: [] }
            };

            let profiles = instance._generateProfiles("main");
            assert.deepStrictEqual(profiles, [
                {
                    type: "group",
                    name: "main"
                }
            ]);

            profiles = instance._generateProfiles("left", "large");
            assert.deepStrictEqual(profiles, [
                {
                    type: "group_viewport",
                    name: "left:large"
                },
                {
                    type: "group",
                    name: "left"
                },
                {
                    type: "viewport",
                    name: "left"
                }
            ]);
        });
    });

    describe("#_buildProfiles", function() {
        it("should return all the profiles for the provided engraving and context", () => {
            const instance = new ripe.Ripe("dummy", "cube");
            instance.loadedConfig = {
                initials: {
                    properties: []
                }
            };

            let profiles = instance._buildProfiles("gold:color.expensive:price", [], ["left:small", "left", "small"]);
            assert.deepStrictEqual(profiles, [
                "left:small:color::gold:price::expensive",
                "left:small:gold:expensive",
                "left:color::gold:price::expensive",
                "left:gold:expensive",
                "small:color::gold:price::expensive",
                "small:gold:expensive",
                "color::gold:price::expensive",
                "gold:expensive",
                "left:small:price::expensive",
                "left:small:expensive",
                "left:price::expensive",
                "left:expensive",
                "small:price::expensive",
                "small:expensive",
                "price::expensive",
                "expensive",
                "left:small:color::gold",
                "left:small:gold",
                "left:color::gold",
                "left:gold",
                "small:color::gold",
                "small:gold",
                "color::gold",
                "gold",
                "left:small",
                "left",
                "small"
            ]);

            profiles = instance._buildProfiles("gold", [], ["left:small", "left", "small"]);
            assert.deepStrictEqual(profiles, [
                "left:small:gold",
                "left:gold",
                "small:gold",
                "gold",
                "left:small",
                "left",
                "small"
            ]);

            profiles = instance._buildProfiles("gold", [], []);
            assert.deepStrictEqual(profiles, ["gold"]);
        });

        it("should return all the profiles for the engraving 'style:black' and context 'report'", () => {
            const instance = new ripe.Ripe("dummy", "cube");
            instance.loadedConfig = {
                initials: {
                    properties: []
                }
            };

            const profiles = instance._buildProfiles("style:black", [], ["report"]);
            assert.deepStrictEqual(profiles, [
                "report:black::style",
                "report:style",
                "black::style",
                "style",
                "report"
            ]);
        });
    });
});
