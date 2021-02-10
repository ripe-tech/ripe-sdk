const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("FileTuple", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#constructor()", async function() {
        it("should be able to behave like an array", () => {
            const fileTuple = new ripe.ripe.FileTuple();
            const result = fileTuple instanceof Array;
            assert.strictEqual(result, true);
        });
    });

    describe("#fromData()", async function() {
        it("should be able to create a simple file tuple objects", () => {
            const fileTuple = ripe.ripe.FileTuple.fromData(
                new Uint8Array(),
                "hello.txt",
                "text/plain"
            );
            assert.notStrictEqual(fileTuple, null);
            assert.strictEqual(fileTuple.constructor, ripe.ripe.FileTuple);
            assert.strictEqual(fileTuple.name(), "hello.txt");
            assert.strictEqual(fileTuple.mime(), "text/plain");
            assert.strictEqual(fileTuple.data().byteLength, 0);
            assert.strictEqual(fileTuple instanceof ripe.ripe.FileTuple, true);
            assert.strictEqual(fileTuple instanceof Array, true);
        });
    });
});
