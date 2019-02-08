const base = require("./base");
const diag = require("./diag");
const restrictions = require("./restrictions");
const sync = require("./sync");
const configSync = require("./config_sync");

Object.assign(module.exports, base);
Object.assign(module.exports, diag);
Object.assign(module.exports, restrictions);
Object.assign(module.exports, sync);
Object.assign(module.exports, configSync);
