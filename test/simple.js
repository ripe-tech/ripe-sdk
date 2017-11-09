var assert = require("assert");
var ripe = require("../src/js/ripe");

describe("Ripe", function() {
    describe("#main", function() {
        it("should instance and retrieve values", function() {
            var instance = new ripe.Ripe("myswear", "vyner");
        });
    });
});
