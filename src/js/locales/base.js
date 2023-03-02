const LOCALES_BASE = {
    en_us: {
        "hello.world": "hello world"
    }
};
if (typeof window !== "undefined") window.LOCALES_BASE = LOCALES_BASE;

if (typeof module !== "undefined") {
    module.exports = {
        LOCALES_BASE: LOCALES_BASE
    };
}
