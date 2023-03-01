const api = require("./api");
const base = require("./base");
const locales = require("./locales");
const plugins = require("./plugins");
const visual = require("./visual");

console.log("---- CJS entry!!!");
console.log("--- api", api);
console.log("--- base", base);
console.log("--- plugins", plugins);
console.log("--- visuals", visual);
console.log("--- win", window);


Object.assign(module.exports, api);
Object.assign(module.exports, base);
Object.assign(module.exports, locales);
Object.assign(module.exports, plugins);
Object.assign(module.exports, visual);

module.exports.VERSION = base.ripe.VERSION;
module.exports.Ripe = base.ripe.Ripe;
module.exports.RipeBase = base.ripe.RipeBase;
module.exports.RipeAPI = base.ripe.RipeAPI;
