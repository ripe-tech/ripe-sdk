/** @namespace */
// eslint-disable-next-line no-use-before-define,no-var
var ripe = typeof ripe === "undefined" ? {} : ripe;
if (typeof window !== "undefined") window.ripe = ripe;

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}
