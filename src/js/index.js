const api = require("./api");
const base = require("./base");
const locales = require("./locales");
const plugins = require("./plugins");
const visual = require("./visual");

Object.assign(module.exports, api);
Object.assign(module.exports, base);
Object.assign(module.exports, locales);
Object.assign(module.exports, plugins);
Object.assign(module.exports, visual);

module.exports.VERSION = "__VERSION__";
module.exports.Ripe = base.ripe.Ripe;
module.exports.RipeBase = base.ripe.RipeBase;
module.exports.RipeAPI = base.ripe.RipeAPI;
