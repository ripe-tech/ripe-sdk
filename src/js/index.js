const base = require("./base");
const visual = require("./visual");

Object.assign(module.exports, base);
Object.assign(module.exports, visual);

module.exports.Ripe = base.ripe.Ripe;
module.exports.VERSION = "__VERSION__";
