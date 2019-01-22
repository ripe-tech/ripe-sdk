const brand = require("./brand");
const build = require("./build");
const locale = require("./locale");
const oauth = require("./oauth");
const order = require("./order");
const size = require("./size");

Object.assign(module.exports, brand);
Object.assign(module.exports, build);
Object.assign(module.exports, locale);
Object.assign(module.exports, oauth);
Object.assign(module.exports, order);
Object.assign(module.exports, size);
