const base = require("./base");
const ripe = base.ripe;

/**
 * Assigns a certain set of values in the provided object to the
 * first parameter of the call (target).
 *
 * @param {Object} target The target of the assign operation meaning
 * the object to which the values will be assigned.
 * @returns {Object} The resulting object from the assign operation
 * that should start as an object copy of the target parameter.
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

/**
 * Requires a module using a "safe" based strategy that overcomes
 * limitation in the react-native import system.
 *
 * The hack/safe strategy tries to circumvent static analysis
 * by applying a transform operation to the string that contains
 * the name of the module.
 *
 * This is an hack to work around metro's (react-native bundler)
 * static analysis, needed until it supports optional imports
 * (https://github.com/react-native-community/discussions-and-proposals/issues/120).
 *
 * @param {String} name The name of the module to require.
 * @param {Boolean} raiseE If the safe mode should be used to run
 * the `require` based import meaning that if an exception is raised
 * then it's ignored and un `undefined` value is returned.
 * @returns {Object} The required imported using a "safe" strategy,
 * may be an `undefined` in case an exception was thrown in the
 * middle of the require operation.
 */
ripe.requireSafe = function(name, raiseE = false) {
    try {
        return global.require(name.toUpperCase().toLowerCase());
    } catch (err) {
        if (raiseE) throw err;
        return undefined;
    }
};

let XMLHttpRequest = null;
if (typeof window !== "undefined" && typeof window.XMLHttpRequest !== "undefined") {
    XMLHttpRequest = window.XMLHttpRequest;
} else if (typeof global !== "undefined" && typeof global.XMLHttpRequest !== "undefined") {
    XMLHttpRequest = global.XMLHttpRequest;
} else if (
    // eslint-disable-next-line camelcase
    typeof __webpack_require__ === "undefined" &&
    (typeof navigator === "undefined" || navigator.product !== "ReactNative")
) {
    // eslint-disable-next-line no-var
    var xmlhttprequest = ripe.requireSafe("xmlhttprequest");
    XMLHttpRequest = xmlhttprequest ? xmlhttprequest.XMLHttpRequest : undefined;
}
if(typeof window !== "undefined") window.XMLHttpRequest = XMLHttpRequest;

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
if(typeof window !== "undefined") window.fetch = fetch;

if (nodeFetch) {
    const http = ripe.requireSafe("http");
    const https = ripe.requireSafe("https");
    const process = ripe.requireSafe("process");
    if (http && process) {
        http.globalAgent.keepAlive = true;
        http.globalAgent.keepAliveMsecs = 120000;
        http.globalAgent.timeout = 60000;
        http.globalAgent.scheduling = "fifo";
        http.globalAgent.maxSockets = process.env.MAX_SOCKETS
            ? parseInt(process.env.MAX_SOCKETS)
            : Infinity;
    }
    if (https && process) {
        https.globalAgent.keepAlive = true;
        https.globalAgent.keepAliveMsecs = 120000;
        https.globalAgent.timeout = 60000;
        https.globalAgent.scheduling = "fifo";
        https.globalAgent.maxSockets = process.env.MAX_SOCKETS
            ? parseInt(process.env.MAX_SOCKETS)
            : Infinity;
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        XMLHttpRequest: XMLHttpRequest,
        fetch: fetch
    };
}
