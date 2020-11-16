const assert = require("assert");
const jsdom = require("jsdom");
const base = require("../../../src/js/base");

describe("Image", function() {
    it("should instance image and load frame", () => {
        const dom = new jsdom.JSDOM("<img id='image' />");
        const imageElement = dom.window.document.getElementById("image");
        const instance = new base.ripe.Ripe("myswear", "vyner");
        const image = instance.bindImage(imageElement, {
            frame: "side-9"
        });

        assert.strictEqual(image.frame, "side-9");
        assert.strictEqual(imageElement.src, "");

        image.update();

        assert.strictEqual(imageElement.src.includes("frame=side-9"), true);

        image.setFrame("side-10");

        assert.strictEqual(imageElement.src.includes("frame=side-10"), true);
    });

    it("should generate the correct image URL", async () => {
        const dom = new jsdom.JSDOM("<img id='image' />");
        const imageElement = dom.window.document.getElementById("image");
        const instance = new base.ripe.Ripe("myswear", "vyner");
        await instance.isReady();
        const image = instance.bindImage(imageElement, {
            rotation: 20,
            flip: true,
            mirror: true,
            boundingBox: [2000, 2000],
            algorithm: "mask_top",
            background: "ff00ff",
            engine: "base",
            initialsX: 2,
            initialsY: 2,
            initialsWidth: 20,
            initialsHeight: 20,
            initialsViewport: [1, 1, 20, 20],
            initialsColor: "ff0000",
            initialsOpacity: 0.7,
            initialsAlign: "left",
            initialsVertical: "top",
            initialsRotation: 20,
            initialsZindex: 5,
            initialsAlgorithm: "multiplicative",
            initialsBlendColor: "222222",
            initialsImageRotation: 30,
            initialsImageFlip: true,
            initialsImageMirror: false,
            debug: true,
            fontWeight: 900,
            fontSize: 50,
            fontSpacing: 10,
            fontTrim: true,
            lineHeight: 30,
            shadow: true,
            shadowColor: "0000ff",
            shadowOffset: 20,
            offsets: { 0: [0, 10], 1: [-1, -10] },
            curve: [
                [0.2, 0.2],
                [0.7, 0.2],
                [0.2, 0.5],
                [0.7, 0.5]
            ]
        });
        assert.strictEqual(image._url, null);
        image.update();
        assert.strictEqual(
            image._url,
            "https://sandbox.platforme.com/api/compose?algorithm=mask_top&background=ff00ff&bounding_box=2000&bounding_box=2000&brand=myswear&curve=%5B%5B0.2%2C0.2%5D%2C%5B0.7%2C0.2%5D%2C%5B0.2%2C0.5%5D%2C%5B0.7%2C0.5%5D%5D&debug=true&engine=base&flip=true&font_size=50&font_spacing=10&font_trim=true&font_weight=900&initials_algorithm=multiplicative&initials_align=left&initials_blend_color=222222&initials_color=ff0000&initials_height=20&initials_image_flip=true&initials_image_rotation=30&initials_opacity=0.7&initials_rotation=20&initials_vertical=top&initials_viewport=1&initials_viewport=1&initials_viewport=20&initials_viewport=20&initials_width=20&initials_x=2&initials_y=2&initials_z_index=5&line_height=30&mirror=true&model=vyner&offsets=%7B%220%22%3A%5B0%2C10%5D%2C%221%22%3A%5B-1%2C-10%5D%7D&p=lining%3Acalf_lining%3Awhite&p=front%3Anappa%3Awhite&p=side%3Anappa%3Awhite&p=sole%3Arubber%3Awhite&p=laces%3Anylon%3Awhite&p=eyelets%3Ametal%3Asilver&p=shadow%3Adefault%3Adefault&rotation=20&shadow=true&shadow_color=0000ff&shadow_offset=20"
        );
    });

    it("should deinit image and stop updating", async () => {
        const dom = new jsdom.JSDOM("<img id='image' />");
        const imageElement = dom.window.document.getElementById("image");
        const instance = new base.ripe.Ripe("myswear", "vyner");
        const image = instance.bindImage(imageElement);

        await instance.deinit();

        assert.strictEqual(image.owner, null);
        assert.strictEqual(image.element, null);
        assert.strictEqual(image.callbacks, null);
    });

    describe("#_profilePermutations", function() {
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
