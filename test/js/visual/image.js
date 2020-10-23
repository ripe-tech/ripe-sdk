const assert = require("assert");
const jsdom = require("jsdom");
const base = require("../../../src/js/base");

describe("Image", function () {
    describe("#_profilePermutations", function () {
        it("should create all the permutations for a specific profiles and context", () => {
            const dom = new jsdom.JSDOM("<img id='image' />");
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("dummy", "cube");
            const image = instance.bindImage(imageElement);

            const profiles = ["style:black", "style:grey"];
            const finalProfiles = image._profilePermutations(profiles, ["report"]);
            assert.deepStrictEqual(finalProfiles, [
                "style:grey",
                "report",
                "style:grey:style:black",
                "style:black:style:grey",
                "style:black"
            ]);
        });

        it("should return the initials and profiles of the image", () => {
            const dom = new jsdom.JSDOM("<img id='image' />");
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("dummy", "cube");
            const image = instance.bindImage(imageElement);

            const initials = "AA";
            instance.loadedConfig = {
                initials: {
                    properties: [
                        {
                            type: "style",
                            name: "black"
                        }
                    ]
                }
            };

            const result = image.initialsBuilder(
                initials,
                "style:black",
                imageElement
            )(["step::personalization", "step::personalization::main"]);
            assert.strictEqual(result.initials, initials);
            assert.deepStrictEqual(result.profile, [
                "style",
                "black::style",
                "step::personalization",
                "step::personalization::main"
            ]);
        });
    });
});
