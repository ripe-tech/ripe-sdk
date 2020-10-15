const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("Compat", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#assign()", function() {
        it("should be able to assign simple values", async () => {
            const target = {
                c: 4,
                d: 5
            };
            const origin = {
                a: 1,
                b: 2,
                c: 3
            };
            const result = ripe.ripe.assign(target, origin);

            assert.deepStrictEqual(target, {
                a: 1,
                b: 2,
                c: 3,
                d: 5
            });
            assert.deepStrictEqual(result, {
                a: 1,
                b: 2,
                c: 3,
                d: 5
            });
            assert.deepStrictEqual(origin, {
                a: 1,
                b: 2,
                c: 3
            });
        });

        it("should be able to assign multiple values", async () => {
            const target = {
                c: 4,
                d: 5
            };
            const originFirst = {
                a: 1,
                b: 2,
                c: 3
            };
            const originSecond = {
                e: 6,
                f: 7
            };
            const result = ripe.ripe.assign(target, originFirst, originSecond);

            assert.deepStrictEqual(target, {
                a: 1,
                b: 2,
                c: 3,
                d: 5,
                e: 6,
                f: 7
            });
            assert.deepStrictEqual(result, {
                a: 1,
                b: 2,
                c: 3,
                d: 5,
                e: 6,
                f: 7
            });
            assert.deepStrictEqual(originFirst, {
                a: 1,
                b: 2,
                c: 3
            });
            assert.deepStrictEqual(originSecond, {
                e: 6,
                f: 7
            });
        });
    });

    describe("#build()", function() {
        it("should be able to build simple values", async () => {
            const origin = {
                a: 1,
                b: 2,
                c: 3
            };
            const result = ripe.ripe.build(origin);

            assert.deepStrictEqual(result, {
                a: 1,
                b: 2,
                c: 3
            });
            assert.deepStrictEqual(origin, {
                a: 1,
                b: 2,
                c: 3
            });
        });

        it("should be able to build with multiple values", async () => {
            const originFirst = {
                a: 1,
                b: 2,
                c: 3
            };
            const originSecond = {
                d: 4,
                e: 5
            };
            const result = ripe.ripe.build(originFirst, originSecond);

            assert.deepStrictEqual(result, {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5
            });
            assert.deepStrictEqual(originFirst, {
                a: 1,
                b: 2,
                c: 3
            });
            assert.deepStrictEqual(originSecond, {
                d: 4,
                e: 5
            });
        });
    });
});
