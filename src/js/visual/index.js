const configuratorCsr = require("./configurator-csr");
const configuratorPrc = require("./configurator-prc");
const image = require("./image");
const visual = require("./visual");

Object.assign(module.exports, configuratorCsr);
Object.assign(module.exports, configuratorPrc);
Object.assign(module.exports, image);
Object.assign(module.exports, visual);
