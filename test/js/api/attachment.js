const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("AttachmentAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getAttachmentOrderUrl()", function() {
        it("should be able to generate a simple attachment URL", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            const result = remote.getAttachmentOrderUrl(123123123);
            assert.strictEqual(result, "https://sandbox.platforme.com/attachments/123123123/data?");
        });
    });
});
