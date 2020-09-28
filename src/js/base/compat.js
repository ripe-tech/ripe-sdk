if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare
    var base = require("./base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Assigns a certain set of values in the provided object to the
 * first parameter of the call (target).
 *
 * @param {String} target The target of the assign operation meaning
 * the object to which the values will be assigned.
 *
 * @ignore
 */
ripe.assign = function(target) {
    if (typeof Object.assign === "function") {
        return Object.assign.apply(this, arguments);
    }

    if (target === null) {
        throw new TypeError("Cannot assign undefined or null object");
    }

    const to = Object(target);
    for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];
        if (nextSource == null) {
            continue;
        }
        for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }

    return to;
};

/**
 * @ignore
 */
ripe.build = function() {
    const _arguments = Array.prototype.slice.call(arguments);
    _arguments.unshift({});
    return ripe.assign.apply(this, _arguments);
};

if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" || typeof __webpack_require__ !== "undefined") && // eslint-disable-line camelcase
    typeof XMLHttpRequest === "undefined" // eslint-disable-line no-use-before-define
) {
    var XMLHttpRequest = null;
    if (
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ === "undefined" &&
        (typeof navigator === "undefined" || navigator.product !== "ReactNative")
    ) {
        // this is an hack to work around metro's (react-native bundler)
        // static analysis, needed until it supports optional imports
        // (https://github.com/react-native-community/discussions-and-proposals/issues/120)
        const mixedModuleName = "Xmlhttprequest";
        const correctModuleName = mixedModuleName.toLowerCase();
        XMLHttpRequest = require(correctModuleName).XMLHttpRequest;
    } else if (typeof window !== "undefined") {
        XMLHttpRequest = window.XMLHttpRequest;
        // eslint-disable-next-line camelcase
    } else if (typeof require !== "undefined" && typeof __webpack_require__ !== "undefined") {
        const mixedModuleName = "Xmlhttprequest";
        const correctModuleName = mixedModuleName.toLowerCase();
        // using a plain require call to load the module, since using
        // the webpack call will result in module not found by nuxt.js
        // applications
        // eslint-disable-next-line camelcase
        XMLHttpRequest = __non_webpack_require__(correctModuleName).XMLHttpRequest;
    }
}

if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative")) &&
    typeof fetch === "undefined" // eslint-disable-line no-use-before-define
) {
    var fetch = null;
    if (
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ === "undefined" &&
        (typeof navigator === "undefined" || navigator.product !== "ReactNative")
    ) {
        fetch = require("node-fetch").default;
    } else if (typeof window !== "undefined") {
        fetch = window.fetch;
    } else if (typeof require !== "undefined") {
        fetch = require("node-fetch").default;
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        XMLHttpRequest: XMLHttpRequest,
        fetch: fetch
    };
}
