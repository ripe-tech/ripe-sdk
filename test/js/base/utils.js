const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Utils", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#equal", async function() {
        it("should be able to compare two objects", () => {
            let result;

            result = ripe.ripe.equal({ hello: "world" }, { hello: "world" });
            assert.strictEqual(result, true);
        });
    });

    describe("#escape", async function() {
        it("should be able to escape strings", () => {
            let result;

            result = ripe.ripe.escape("foo,bar", ",", "$");
            assert.strictEqual(result, "foo$,bar");

            result = ripe.ripe.escape("foo$,bar", ",", "$");
            assert.strictEqual(result, "foo$$$,bar");
        });
    });

    describe("#unescape", async function() {
        it("should be able to unescape strings", () => {
            let result;

            result = ripe.ripe.unescape("foo$,bar", "$");
            assert.strictEqual(result, "foo,bar");

            result = ripe.ripe.unescape("foo$$,bar", "$");
            assert.strictEqual(result, "foo$,bar");

            result = ripe.ripe.unescape("$$foo$,bar$$$$", "$");
            assert.strictEqual(result, "$foo,bar$$");
        });
    });

    describe("#splitUnescape", async function() {
        it("should be able to split and unescape strings", () => {
            let result;

            result = ripe.ripe.splitUnescape("foo bar");
            assert.deepStrictEqual(result, ["foo", "bar"]);

            result = ripe.ripe.splitUnescape("foo bar hello world", undefined, 2);
            assert.deepStrictEqual(result, ["foo", "bar", "hello world"]);

            result = ripe.ripe.splitUnescape("foo,bar", ",");
            assert.deepStrictEqual(result, ["foo", "bar"]);

            result = ripe.ripe.splitUnescape("foo$,bar", ",", undefined, "$");
            assert.deepStrictEqual(result, ["foo,bar"]);

            result = ripe.ripe.splitUnescape("foo$$,bar", ",", undefined, "$", true);
            assert.deepStrictEqual(result, ["foo$", "bar"]);

            result = ripe.ripe.splitUnescape("foo$$,bar", ",", undefined, "$", false);
            assert.deepStrictEqual(result, ["foo$$", "bar"]);

            result = ripe.ripe.splitUnescape("foo$", ",", undefined, "$", true);
            assert.deepStrictEqual(result, ["foo$"]);

            result = ripe.ripe.splitUnescape("foo\\\\\\:bar", ":", undefined, undefined, true);
            assert.deepStrictEqual(result, ["foo\\:bar"]);

            result = ripe.ripe.splitUnescape("foo\\\\:bar", ":", undefined, undefined, true);
            assert.deepStrictEqual(result, ["foo\\", "bar"]);
        });
    });
});
