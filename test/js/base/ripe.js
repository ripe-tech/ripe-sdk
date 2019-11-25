const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Ripe", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#setInitials", async function() {
        it("should be able to set initials", async () => {
            const instance = await new ripe.Ripe();

            assert.strictEqual(instance.initials, "");
            assert.strictEqual(instance.engraving, null);
            assert.deepStrictEqual(instance.initialsExtra, {});

            instance.setInitials("CR7", "gold");

            assert.strictEqual(instance.initials, "CR7");
            assert.strictEqual(instance.engraving, "gold");
            assert.strictEqual(instance.initialsExtra.main.initials, "CR7");
            assert.strictEqual(instance.initialsExtra.main.engraving, "gold");

            instance.setInitials("", null);

            assert.strictEqual(instance.initials, "");
            assert.strictEqual(instance.engraving, null);
            assert.strictEqual(instance.initialsExtra.main.initials, "");
            assert.strictEqual(instance.initialsExtra.main.engraving, null);

            instance.setInitials("CR7");

            assert.strictEqual(instance.initials, "CR7");
            assert.strictEqual(instance.engraving, null);
            assert.strictEqual(instance.initialsExtra.main.initials, "CR7");
            assert.strictEqual(instance.initialsExtra.main.engraving, null);

            instance.setInitials("", null);

            assert.strictEqual(instance.initials, "");
            assert.strictEqual(instance.engraving, null);
            assert.strictEqual(instance.initialsExtra.main.initials, "");
            assert.strictEqual(instance.initialsExtra.main.engraving, null);

            instance.setInitialsExtra({
                main: {
                    initials: "CR8",
                    engraving: "gold"
                }
            });

            assert.strictEqual(instance.initials, "CR8");
            assert.strictEqual(instance.engraving, "gold");
            assert.strictEqual(instance.initialsExtra.main.initials, "CR8");
            assert.strictEqual(instance.initialsExtra.main.engraving, "gold");

            instance.setInitialsExtra({
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

            instance.setInitialsExtra({
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

            instance.setInitialsExtra({
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

        it("should be able to validate invalid states", async () => {
            const instance = await new ripe.Ripe({ init: false });

            assert.throws(() => instance.setInitials("", "gold"), Error);

            assert.throws(() => {
                instance.setInitialsExtra({
                    main: {
                        initials: "",
                        engraving: "gold"
                    }
                });
            }, Error);
        });
    });
});
