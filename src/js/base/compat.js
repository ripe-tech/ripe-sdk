if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" ||
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.product === "ReactNative"))
) {
    // eslint-disable-next-line no-redeclare,no-var
    var base = require("./base");
    // eslint-disable-next-line no-redeclare,no-var
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
    // eslint-disable-next-line no-var
    var XMLHttpRequest = null;
    if (typeof window !== "undefined" && typeof window.XMLHttpRequest !== "undefined") {
        XMLHttpRequest = window.XMLHttpRequest;
    } else if (typeof global !== "undefined" && typeof global.XMLHttpRequest !== "undefined") {
        XMLHttpRequest = global.XMLHttpRequest;
    } else if (
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
    // eslint-disable-next-line no-var
    var fetch = null;
    // eslint-disable-next-line no-var
    var nodeFetch = null;
    if (typeof window !== "undefined" && typeof window.fetch !== "undefined") {
        fetch = window.fetch;
    } else if (typeof global !== "undefined" && typeof global.fetch !== "undefined") {
        fetch = global.fetch;
    } else if (
        // eslint-disable-next-line camelcase
        typeof __webpack_require__ === "undefined" &&
        (typeof navigator === "undefined" || navigator.product !== "ReactNative")
    ) {
        fetch = require("node-fetch").default;
        nodeFetch = fetch;
    } else if (typeof global !== "undefined" && typeof global.__VUE_SSR_CONTEXT__ !== "undefined") {
        // this is a workaround for Nuxt.js SSR built as standalone,
        // which does not have global.fetch populated
        fetch = require("node-fetch").default;
        nodeFetch = fetch;
    }
}

if (nodeFetch) {
    const http = require("http");
    const https = require("https");
    const process = require("process");
    http.globalAgent.keepAlive = true;
    http.globalAgent.keepAliveMsecs = 120000;
    http.globalAgent.timeout = 60000;
    http.globalAgent.scheduling = "fifo";
    http.globalAgent.maxSockets = process.env.MAX_SOCKETS
        ? parseInt(process.env.MAX_SOCKETS)
        : Infinity;
    https.globalAgent.keepAlive = true;
    https.globalAgent.keepAliveMsecs = 120000;
    https.globalAgent.timeout = 60000;
    https.globalAgent.scheduling = "fifo";
    https.globalAgent.maxSockets = process.env.MAX_SOCKETS
        ? parseInt(process.env.MAX_SOCKETS)
        : Infinity;
}

if (typeof module !== "undefined") {
    module.exports = {
        XMLHttpRequest: XMLHttpRequest,
        fetch: fetch
    };
}
