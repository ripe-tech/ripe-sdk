const configurator = require("./configurator");
const configuratorPrc = require("./configuratorPrc");
const image = require("./image");
const visual = require("./visual");

Object.assign(module.exports, configurator);
Object.assign(module.exports, configuratorPrc);
Object.assign(module.exports, image);
Object.assign(module.exports, visual);
