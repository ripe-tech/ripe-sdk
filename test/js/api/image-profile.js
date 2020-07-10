const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

const dummyProfileName = Date.now().toString();
let dummyProfileId;

describe("Image Profiles", function() {
    this.timeout(config.TEST_TIMEOUT);

    beforeEach(function() {
        if (!config.TEST_USERNAME || !config.TEST_PASSWORD) {
            this.skip();
        }
    });

    describe("#createImageProfile()", function() {
        it("should be able to create an image profile", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const imageProfile = {
                name: dummyProfileName,
                options: { width: 5, height: 5, background: "ffffff", crop: true }
            };

            result = await remote.createImageProfileP(imageProfile);
            dummyProfileId = result.id;
            assert.strictEqual(result.name, dummyProfileName);
        });
    });

    describe("#getImageProfiles()", function() {
        it("should be able to retrieve image profiles", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP("root", "root");

            assert.strictEqual(result.username, "root");
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getImageProfilesP();
            assert.notStrictEqual(result.length, 0);
        });
    });

    describe("#getImageProfile()", function() {
        it("should be able to retrieve an order information", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            result = await remote.getImageProfileP(dummyProfileName);
            assert.strictEqual(result.id, dummyProfileId);
            assert.strictEqual(result.name, dummyProfileName);
        });
    });

    describe("#updateImageProfile()", function() {
        it("should be able to update an image profile", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const imageProfile = await remote.getImageProfileP(dummyProfileName);
            const updatedOptions = { width: 4000, height: 4000, background: "fafafa", crop: false };
            imageProfile.options = updatedOptions;

            result = await remote.updateImageProfileP(imageProfile);
            assert.deepStrictEqual(result.options, updatedOptions);
        });
    });

    describe("#deleteImageProfile()", function() {
        it("should be able to delete an image profile", async () => {
            let result = null;

            const remote = ripe.RipeAPI();

            result = await remote.authAdminP(config.TEST_USERNAME, config.TEST_PASSWORD);

            assert.strictEqual(result.username, config.TEST_USERNAME);
            assert.notStrictEqual(typeof result.sid, undefined);

            const imageProfile = await remote.getImageProfileP(dummyProfileName);

            result = await remote.deleteImageProfileP(imageProfile);
            assert.strictEqual(result.toString(), imageProfile.name);
        });
    });
});
