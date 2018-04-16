const base = require("./base");
const plugins = require("./plugins");
const visual = require("./visual");

Object.assign(module.exports, base);
Object.assign(module.exports, plugins);
Object.assign(module.exports, visual);

module.exports.VERSION = "__VERSION__";
module.exports.Ripe = base.ripe.Ripe;
