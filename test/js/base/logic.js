const config = require("../config");
const ripe = require("../../../src/js");

describe("Logic", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#parseEngraving", async function() {
        it("should be able to parse a single engraving value", async () => {
            const instance = await new ripe.Ripe();

            instance.parseEngraving();
        });
    });
});
