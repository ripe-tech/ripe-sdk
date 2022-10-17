const assert = require("assert");
const config = require("../config");
const ripe = require("../../../src/js");

describe("RipeAPI", function() {
    this.timeout(config.TEST_TIMEOUT);

    describe("#ping", function() {
        it("should be able to ping the Core server", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            const result = await remote.pingP();
            assert.notStrictEqual(result.timestamp, undefined);
        });
    });

    describe("#info", function() {
        it("should be able to retrieve summary info from the Core server", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            const result = await remote.infoP();
            assert.notStrictEqual(result.version, undefined);
            assert.notStrictEqual(result.description, undefined);
            assert.notStrictEqual(result.observations, undefined);
        });
    });

    describe("#geoResolve", function() {
        it("should be able to resolve geographical data of the request's origin", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            const result = await remote.geoResolveP();
            assert.notStrictEqual(result, null);
        });
    });

    describe("#_authCallback", function() {
        it("should be able to retry operations", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            let options = {
                retries: 2,
                dummy: 3,
                authCallback: callback => {
                    options.dummy--;
                    if (callback) callback();
                }
            };
            await new Promise((resolve, reject) => {
                remote._cacheURL("https://httpbin.org/status/403", options, () => resolve());
            });
            assert.strictEqual(options.retries, 0);
            assert.strictEqual(options.dummy, 1);

            options = {
                dummy: 3,
                authCallback: callback => {
                    options.dummy--;
                    if (callback) callback();
                }
            };
            await new Promise((resolve, reject) => {
                remote._cacheURL("https://httpbin.org/status/403", options, () => resolve());
            });
            assert.strictEqual(options.retries, 0);
            assert.strictEqual(options.dummy, 2);
        });

        it("should not retry operations, if not required", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            const options = {
                retries: 2,
                dummy: 3,
                authCallback: callback => {
                    options.dummy--;
                    if (callback) callback();
                }
            };
            await new Promise((resolve, reject) => {
                remote._cacheURL("https://httpbin.org/status/200", options, () => resolve());
            });
            assert.strictEqual(options.retries, 2);
            assert.strictEqual(options.dummy, 3);
        });
    });

    describe("#_queryToSpec()", function() {
        it("should be able to convert a query to spec", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            const spec = remote._queryToSpec(
                "brand=dummy&model=dummy&p=piping:leather_dmy:black&p=side:leather_dmy:black&p=top0_bottom:leather_dmy:black&p=shadow:default:default&p=overlay:default:default"
            );

            assert.deepStrictEqual(spec, {
                brand: "dummy",
                model: "dummy",
                parts: {
                    piping: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    side: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    top0_bottom: {
                        material: "leather_dmy",
                        color: "black"
                    },
                    shadow: {
                        material: "default",
                        color: "default"
                    },
                    overlay: {
                        material: "default",
                        color: "default"
                    }
                },
                initials: null,
                engraving: null,
                initials_extra: {}
            });
        });

        it("should be able to convert a one part query to spec", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            const spec = remote._queryToSpec("brand=dummy&model=dummy&p=piping:leather_dmy:black");

            assert.deepStrictEqual(spec, {
                brand: "dummy",
                model: "dummy",
                parts: {
                    piping: {
                        material: "leather_dmy",
                        color: "black"
                    }
                },
                initials: null,
                engraving: null,
                initials_extra: {}
            });
        });

        it("should be able to convert a query to spec with initials extra with one group", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            const spec = remote._queryToSpec(
                "brand=dummy&model=dummy&p=piping:leather_dmy:black&initials_extra=main:AA:black:style"
            );
            assert.deepStrictEqual(spec, {
                brand: "dummy",
                model: "dummy",
                parts: {
                    piping: {
                        material: "leather_dmy",
                        color: "black"
                    }
                },
                initials: null,
                engraving: null,
                initials_extra: { main: { initials: "AA", engraving: "black:style" } }
            });
        });
    });

    describe("#_queryToImageUrl()", function() {
        it("should be able to convert a query to a image URL", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            const url = remote._queryToImageUrl(
                "brand=dummy&model=dummy&p=piping:leather_dmy:black&p=side:leather_dmy:black&p=top0_bottom:leather_dmy:black&p=shadow:default:default&p=overlay:default:default"
            );

            assert.deepStrictEqual(
                url,
                `${config.TEST_URL}compose?brand=dummy&model=dummy&p=overlay%3Adefault%3Adefault&p=piping%3Aleather_dmy%3Ablack&p=shadow%3Adefault%3Adefault&p=side%3Aleather_dmy%3Ablack&p=top0_bottom%3Aleather_dmy%3Ablack`
            );
        });

        it("should be able to convert a query to a image URL with size and format", async () => {
            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            const url = remote._queryToImageUrl(
                "brand=dummy&model=dummy&p=piping:leather_dmy:black&p=side:leather_dmy:black&p=top0_bottom:leather_dmy:black&p=shadow:default:default&p=overlay:default:default",
                { size: 100, format: "png" }
            );

            assert.deepStrictEqual(
                url,
                `${config.TEST_URL}compose?brand=dummy&format=png&model=dummy&p=overlay%3Adefault%3Adefault&p=piping%3Aleather_dmy%3Ablack&p=shadow%3Adefault%3Adefault&p=side%3Aleather_dmy%3Ablack&p=top0_bottom%3Aleather_dmy%3Ablack&size=100`
            );
        });
    });

    describe("#_buildQuery()", function() {
        it("should correctly generate a query string from array", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = remote._buildQuery([["hello", "world"]]);

            assert.strictEqual(result, "hello=world");
        });

        it("should correctly generate a query string from object", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = remote._buildQuery({
                hello: "world"
            });

            assert.strictEqual(result, "hello=world");
        });

        it("should correctly generate a query string from a complex array", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = remote._buildQuery([
                ["hello", "world"],
                ["hello", "world2"],
                ["world", "hello"],
                ["world", "hello2"]
            ]);

            assert.strictEqual(result, "hello=world&hello=world2&world=hello&world=hello2");
        });

        it("should correctly generate a query string from a complex object", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = remote._buildQuery({
                hello: ["world", "world2"],
                world: ["hello", "hello2"]
            });

            assert.strictEqual(result, "hello=world&hello=world2&world=hello&world=hello2");
        });

        it("should properly escape characters", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = remote._buildQuery([["olá", "mundo"]]);

            assert.strictEqual(result, "ol%C3%A1=mundo");
        });
    });

    describe("#_unpackQuery()", function() {
        it("should properly unescape characters", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = remote._unpackQuery("ol%C3%A1=mundo");

            assert.deepStrictEqual(result, { olá: "mundo" });
        });
    });

    describe("#_partsMToQuery()", function() {
        it("should convert a simple parts map to a query", async () => {
            let result = null;
            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            result = remote._partsMToQuery(
                {
                    side: {
                        material: "nappa",
                        color: "white"
                    },
                    front: {
                        material: "nappa",
                        color: "black"
                    }
                },
                true
            );
            assert.strictEqual(result, "p=front:nappa:black&p=side:nappa:white");

            result = remote._partsMToQuery(
                {
                    logo: {
                        material: "metal",
                        color: "silver"
                    },
                    sole: {
                        material: "rubber_wedge",
                        color: "black"
                    },
                    swear_tape: {
                        material: "rubber_heel",
                        color: "white"
                    },
                    upper: {
                        material: "mesh",
                        color: "white"
                    },
                    shadow: {
                        material: "default",
                        color: "default"
                    }
                },
                true
            );
            assert.strictEqual(
                result,
                "p=logo:metal:silver&p=shadow:default:default&p=sole:rubber_wedge:black&p=swear_tape:rubber_heel:white&p=upper:mesh:white"
            );
        });
    });

    describe("#_partsMToTriplets()", function() {
        it("should convert a simple parts map to a set of triplets", async () => {
            let result = null;
            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            result = remote._partsMToTriplets(
                {
                    side: {
                        material: "nappa",
                        color: "white"
                    },
                    front: {
                        material: "nappa",
                        color: "black"
                    }
                },
                true
            );
            assert.deepStrictEqual(result, ["front:nappa:black", "side:nappa:white"]);

            result = remote._partsMToTriplets(
                {
                    logo: {
                        material: "metal",
                        color: "silver"
                    },
                    sole: {
                        material: "rubber_wedge",
                        color: "black"
                    },
                    swear_tape: {
                        material: "rubber_heel",
                        color: "white"
                    },
                    upper: {
                        material: "mesh",
                        color: "white"
                    },
                    shadow: {
                        material: "default",
                        color: "default"
                    }
                },
                true
            );
            assert.deepStrictEqual(result, [
                "logo:metal:silver",
                "shadow:default:default",
                "sole:rubber_wedge:black",
                "swear_tape:rubber_heel:white",
                "upper:mesh:white"
            ]);
        });
    });

    describe("#_parseExtraS()", function() {
        it("should properly parse an initials extra string", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = remote._parseExtraS(["left:pt:gold", "right:tp:silver"]);

            assert.deepStrictEqual(result, {
                left: { initials: "pt", engraving: "gold" },
                right: { initials: "tp", engraving: "silver" }
            });

            result = remote._parseExtraS([
                "left:pt\\:tp:gold\\:yellow",
                "right:tp\\:pt:silver\\:grey"
            ]);

            assert.deepStrictEqual(result, {
                left: { initials: "pt:tp", engraving: "gold:yellow" },
                right: { initials: "tp:pt", engraving: "silver:grey" }
            });

            result = remote._parseExtraS(["left:pt\\:tp:", "right:tp\\:pt:"]);

            assert.deepStrictEqual(result, {
                left: { initials: "pt:tp", engraving: null },
                right: { initials: "tp:pt", engraving: null }
            });
        });
    });

    describe("#_generateExtraS()", function() {
        it("should properly generate an initials extra string", async () => {
            let result = null;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });
            result = remote._generateExtraS({
                left: { initials: "pt", engraving: "gold" },
                right: { initials: "tp", engraving: "silver" }
            });

            assert.deepStrictEqual(result, ["left:pt:gold", "right:tp:silver"]);

            result = remote._generateExtraS({
                left: { initials: "pt:tp", engraving: "gold:yellow" },
                right: { initials: "tp:pt", engraving: "silver:grey" }
            });

            assert.deepStrictEqual(result, [
                "left:pt\\:tp:gold\\:yellow",
                "right:tp\\:pt:silver\\:grey"
            ]);

            result = remote._generateExtraS({
                left: { initials: "pt:tp", engraving: null },
                right: { initials: "tp:pt", engraving: null }
            });

            assert.deepStrictEqual(result, ["left:pt\\:tp:", "right:tp\\:pt:"]);

            result = remote._generateExtraS({
                left: { initials: "pt:tp", engraving: null },
                right: { initials: "", engraving: null }
            });

            assert.deepStrictEqual(result, ["left:pt\\:tp:"]);

            result = remote._generateExtraS(
                {
                    left: { initials: "pt:tp", engraving: null },
                    right: { initials: "", engraving: null }
                },
                true,
                false
            );

            assert.deepStrictEqual(result, ["left:pt\\:tp:", "right::"]);
        });
    });

    describe("#_encodeMultipart()", function() {
        beforeEach(function() {
            if (typeof TextEncoder === "undefined" || typeof TextDecoder === "undefined") {
                this.skip();
            }
        });

        it("should be able to encode simple multipart values", async () => {
            let contentType, body;

            const remote = ripe.RipeAPI({ url: config.TEST_URL });

            [contentType, body] = remote._encodeMultipart({
                file: "Hello World"
            });

            assert.strictEqual(
                contentType,
                "multipart/form-data; boundary=Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs"
            );
            assert.strictEqual(
                new TextDecoder("utf-8").decode(body),
                "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs\r\n" +
                    'Content-Disposition: form-data; name="file"\r\n' +
                    "\r\n" +
                    "Hello World\r\n" +
                    "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs--\r\n" +
                    "\r\n"
            );

            [contentType, body] = remote._encodeMultipart({
                file: new TextEncoder("utf-8").encode("Hello World")
            });

            assert.strictEqual(
                contentType,
                "multipart/form-data; boundary=Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs"
            );
            assert.strictEqual(
                new TextDecoder("utf-8").decode(body),
                "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs\r\n" +
                    'Content-Disposition: form-data; name="file"\r\n' +
                    "\r\n" +
                    "Hello World\r\n" +
                    "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs--\r\n" +
                    "\r\n"
            );

            [contentType, body] = remote._encodeMultipart({
                file: ripe.ripe.FileTuple.fromString("Hello World", "hello.txt", "text/plain")
            });

            assert.strictEqual(
                contentType,
                "multipart/form-data; boundary=Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs"
            );
            assert.strictEqual(
                new TextDecoder("utf-8").decode(body),
                "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs\r\n" +
                    'Content-Disposition: form-data; name="file"; filename="hello.txt"\r\n' +
                    "Content-Type: text/plain\r\n" +
                    "\r\n" +
                    "Hello World\r\n" +
                    "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs--\r\n" +
                    "\r\n"
            );

            [contentType, body] = remote._encodeMultipart({
                file: ripe.ripe.FileTuple.fromString("Hello World", "hello.txt", "text/plain"),
                message: {
                    data: new TextEncoder("utf-8").encode("Hello Message"),
                    Header1: "header1-value",
                    Header2: "header2-value"
                }
            });

            assert.strictEqual(
                contentType,
                "multipart/form-data; boundary=Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs"
            );
            assert.strictEqual(
                new TextDecoder("utf-8").decode(body),
                "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs\r\n" +
                    'Content-Disposition: form-data; name="file"; filename="hello.txt"\r\n' +
                    "Content-Type: text/plain\r\n" +
                    "\r\n" +
                    "Hello World\r\n" +
                    "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs\r\n" +
                    "Header1: header1-value\r\n" +
                    "Header2: header2-value\r\n" +
                    "\r\n" +
                    "Hello Message\r\n" +
                    "--Vq2xNWWHbmWYF644q9bC5T2ALtj5CynryArNQRXGYsfm37vwFKMNsqPBrpPeprFs--\r\n" +
                    "\r\n"
            );
        });
    });
});
