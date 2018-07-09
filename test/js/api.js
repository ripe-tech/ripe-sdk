const assert = require("assert");
const config = require("./config");
const ripe = require("../../src/js");

describe("API", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#getSizes", function() {
        it("should be able to retrieve sizes", () => {
            const remote = ripe.RipeAPI();

            // @todo must create a promise around this
            // and await for this
            remote.getSizes();
        });
    });
});
