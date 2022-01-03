const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("LOCALES_BASE", function() {
    it("should be able to properly translate an hello string", () => {
        const remote = ripe.RipeAPI({ url: config.TEST_URL });

        const result = remote.localeLocal("hello.world");
        assert.strictEqual(result, "hello world");
    });
});
