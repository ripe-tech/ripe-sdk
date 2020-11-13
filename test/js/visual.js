const assert = require("assert");
const jsdom = require("jsdom");
const config = require("./config");
const base = require("../../src/js/base");

describe("Visual", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#main", function() {
        it("should init interactable and bind it to instance", () => {
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const interactable = new base.ripe.Interactable(instance);
            const _interactable = instance.bindInteractable(interactable);

            assert.strictEqual(interactable, _interactable);
            assert.strictEqual(interactable.owner, instance);
            assert.strictEqual(instance.children.length, 1);
            assert.strictEqual(instance.children[0], interactable);
        });

        it("should deinit instance and unbind interactable", async () => {
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const interactable = new base.ripe.Interactable(instance);

            instance.bindInteractable(interactable);
            await instance.deinit();

            assert.strictEqual(interactable.owner, null);
            assert.strictEqual(instance.children.length, 0);
        });

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

        it("should generate the correct image URL", () => {
            const dom = new jsdom.JSDOM("<img id='image' />");
            const imageElement = dom.window.document.getElementById("image");
            const instance = new base.ripe.Ripe("myswear", "vyner");
            const image = instance.bindImage(imageElement, {
                brand: "myswear",
                model: "vyner",
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
                lineHeight: 30
            });
            assert.strictEqual(image._url, null);

            image.update();
            assert.strictEqual(
                image._url,
                "https://sandbox.platforme.com/api/compose?algorithm=mask_top&background=ff00ff&bounding_box=2000&bounding_box=2000&debug=true&engine=base&flip=true&font_size=50&font_spacing=10&font_trim=true&font_weight=900&initials_algorithm=multiplicative&initials_align=left&initials_blend_color=222222&initials_color=ff0000&initials_height=20&initials_image_flip=true&initials_image_rotation=30&initials_opacity=0.7&initials_rotation=20&initials_vertical=top&initials_viewport=1&initials_viewport=1&initials_viewport=20&initials_viewport=20&initials_width=20&initials_x=2&initials_y=2&initials_z_index=5&line_height=30&mirror=true&rotation=20"
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
    });
});
