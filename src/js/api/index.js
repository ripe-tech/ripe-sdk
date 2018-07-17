const oauth = require("./oauth");
const order = require("./order");
const size = require("./size");

Object.assign(module.exports, oauth);
Object.assign(module.exports, order);
Object.assign(module.exports, size);
