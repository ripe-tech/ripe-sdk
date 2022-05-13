const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

const { Blob } = require("buffer");

describe("FileTuple", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#constructor()", async function() {
        it("should be able to behave like an array", () => {
            const fileTuple = new ripe.ripe.FileTuple();
            assert.notStrictEqual(fileTuple, null);
            assert.strictEqual(fileTuple instanceof Array, true);
        });

        it("should not override the array class", () => {
            assert.notStrictEqual(ripe.ripe.FileTuple.prototype.constructor, Array);
            assert.strictEqual(Array.prototype.constructor, Array);
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

    describe("#fromString()", async function() {
        it("should be able to create a simple file tuple objects", () => {
            const fileTuple = ripe.ripe.FileTuple.fromString("hello", "hello.txt", "text/plain");
            assert.notStrictEqual(fileTuple, null);
            assert.strictEqual(fileTuple.constructor, ripe.ripe.FileTuple);
            assert.strictEqual(fileTuple.name, "hello.txt");
            assert.strictEqual(fileTuple.mime, "text/plain");
            assert.strictEqual(fileTuple.data.byteLength, 5);
            assert.strictEqual(fileTuple instanceof ripe.ripe.FileTuple, true);
            assert.strictEqual(fileTuple instanceof Array, true);
            assert.strictEqual(Array.isArray(fileTuple), true);
        });
    });

    describe("#fromArrayBuffer()", async function() {
        it("should be able to create a simple file tuple objects", () => {
            const fileTuple = ripe.ripe.FileTuple.fromArrayBuffer(
                new ArrayBuffer(),
                "hello.txt",
                "text/plain"
            );
            assert.notStrictEqual(fileTuple, null);
            assert.strictEqual(fileTuple.constructor, ripe.ripe.FileTuple);
            assert.strictEqual(fileTuple.name, "hello.txt");
            assert.strictEqual(fileTuple.mime, "text/plain");
            assert.strictEqual(fileTuple.data.byteLength, 0);
            assert.strictEqual(fileTuple instanceof ripe.ripe.FileTuple, true);
            assert.strictEqual(fileTuple instanceof Array, true);
            assert.strictEqual(Array.isArray(fileTuple), true);
        });
    });

    describe("#fromBlob()", async function() {
        it("should be able to create a simple file tuple objects", async () => {
            const fileTuple = await ripe.ripe.FileTuple.fromBlob(
                new Blob(),
                "hello.txt",
                "text/plain"
            );
            assert.notStrictEqual(fileTuple, null);
            assert.strictEqual(fileTuple.constructor, ripe.ripe.FileTuple);
            assert.strictEqual(fileTuple.name, "hello.txt");
            assert.strictEqual(fileTuple.mime, "text/plain");
            assert.strictEqual(fileTuple.data.byteLength, 0);
            assert.strictEqual(fileTuple instanceof ripe.ripe.FileTuple, true);
            assert.strictEqual(fileTuple instanceof Array, true);
            assert.strictEqual(Array.isArray(fileTuple), true);
        });
    });
});
