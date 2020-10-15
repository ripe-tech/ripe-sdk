const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Ripe", function() {
    this.timeout(config.TEST_TIMEOUT);

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
});
