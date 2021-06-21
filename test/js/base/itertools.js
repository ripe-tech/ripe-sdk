const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Itertools", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#combinations()", function() {
        it("should be able to create combinations of length 2", async () => {
            const result = ripe.ripe.combinations(["A", "B", "C", "D"], 2);
            assert.deepStrictEqual(result, [
                ["A", "B"],
                ["A", "C"],
                ["A", "D"],
                ["B", "C"],
                ["B", "D"],
                ["C", "D"]
            ]);
        });

        it("should be able to create combinations of length 3", async () => {
            const result = ripe.ripe.combinations(
                ["style:black", "black", "large", "report", "step::personalization"],
                3
            );
            assert.deepStrictEqual(result, [
                ["style:black", "black", "large"],
                ["style:black", "black", "report"],
                ["style:black", "black", "step::personalization"],
                ["style:black", "large", "report"],
                ["style:black", "large", "step::personalization"],
                ["style:black", "report", "step::personalization"],
                ["black", "large", "report"],
                ["black", "large", "step::personalization"],
                ["black", "report", "step::personalization"],
                ["large", "report", "step::personalization"]
            ]);
        });
    });
});
