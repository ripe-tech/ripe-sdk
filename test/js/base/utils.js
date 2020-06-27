const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Utils", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#equal()", async function() {
        it("should be able to compare two objects", () => {
            const result = ripe.ripe.equal({ hello: "world" }, { hello: "world" });
            assert.strictEqual(result, true);
        });

        it("should be able to compare two unordered objects", () => {
            const result = ripe.ripe.equal(
                { world: "hello", hello: "world" },
                { hello: "world", world: "hello" }
            );
            assert.strictEqual(result, true);
        });

        it("should be able to compare two multilevel objects", () => {
            const result = ripe.ripe.equal(
                { deep: { world: "hello", hello: "world" }, world: "hello", hello: "world" },
                { hello: "world", world: "hello", deep: { world: "hello", hello: "world" } }
            );
            assert.strictEqual(result, true);
        });

        it("should be able to verify difference in two multilevel objects", () => {
            const result = ripe.ripe.equal(
                { deep: { world: "hello", hello: "world2" }, world: "hello", hello: "world" },
                { hello: "world", world: "hello", deep: { world: "hello", hello: "world" } }
            );
            assert.strictEqual(result, false);
        });

        it("should be able to compare arrays", () => {
            let result;

            result = ripe.ripe.equal([1, 2, 3], [1, 2, 3]);
            assert.strictEqual(result, true);

            result = ripe.ripe.equal(null, [1, 2, 3], [1, 2]);
            assert.strictEqual(result, false);

            result = ripe.ripe.equal(
                { deep: { world: "hello", hello: [1, 2, 3] }, world: "hello", hello: "world" },
                { hello: "world", world: "hello", deep: { world: "hello", hello: [1, 2, 3] } }
            );
            assert.strictEqual(result, true);

            result = ripe.ripe.equal(
                { deep: { world: "hello", hello: [1, 2, 3] }, world: "hello", hello: "world" },
                { hello: "world", world: "hello", deep: { world: "hello", hello: [1, 2] } }
            );
            assert.strictEqual(result, false);
        });

        it("should be able to verify difference in two data types", () => {
            let result;

            result = ripe.ripe.equal(null, undefined);
            assert.strictEqual(result, false);

            result = ripe.ripe.equal(null, {});
            assert.strictEqual(result, false);

            result = ripe.ripe.equal(undefined, {});
            assert.strictEqual(result, false);

            result = ripe.ripe.equal(2, {});
            assert.strictEqual(result, false);

            result = ripe.ripe.equal(2, [2]);
            assert.strictEqual(result, false);

            result = ripe.ripe.equal(2, 3);
            assert.strictEqual(result, false);
        });
    });

    describe("#escape()", async function() {
        it("should be able to escape strings", () => {
            let result;

            result = ripe.ripe.escape("foo,bar", ",", "$");
            assert.strictEqual(result, "foo$,bar");

            result = ripe.ripe.escape("foo$,bar", ",", "$");
            assert.strictEqual(result, "foo$$$,bar");
        });
    });

    describe("#unescape()", async function() {
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

    describe("#countUnescape()", async function() {
        it("should be able to count escaped strings", () => {
            let result;

            result = ripe.ripe.countUnescape("foo:bar", ":");
            assert.strictEqual(result, 1);

            result = ripe.ripe.countUnescape("foo:bar:hello:world", ":");
            assert.strictEqual(result, 3);

            result = ripe.ripe.countUnescape("foo,bar,hello,world", ":");
            assert.strictEqual(result, 0);

            result = ripe.ripe.countUnescape("foo:bar\\:hello:world", ":");
            assert.strictEqual(result, 2);

            result = ripe.ripe.countUnescape("foo:bar\\:hello\\:world", ":");
            assert.strictEqual(result, 1);

            result = ripe.ripe.countUnescape("foo:bar\\:hello\\\\:world", ":");
            assert.strictEqual(result, 2);

            result = ripe.ripe.countUnescape("foo\\:bar\\:hello\\:world", ":");
            assert.strictEqual(result, 0);
        });
    });

    describe("#splitUnescape()", async function() {
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
