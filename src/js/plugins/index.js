const base = require("./base");
const restrictions = require("./restrictions");
const sync = require("./sync");

Object.assign(module.exports, base);
Object.assign(module.exports, restrictions);
Object.assign(module.exports, sync);
