const base = require("./base");
const diag = require("./diag");
const restrictions = require("./restrictions");
const sync = require("./sync");

Object.assign(module.exports, base);
Object.assign(module.exports, diag);
Object.assign(module.exports, restrictions);
Object.assign(module.exports, sync);
