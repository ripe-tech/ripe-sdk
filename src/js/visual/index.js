const configurator = require("./configurator");
const configuratorCSR = require("./configurator-csr");
const configuratorPRC = require("./configurator-prc");
const image = require("./image");
const visual = require("./visual");
const renderer = require("./client-side-renderer");
const controls = require("./orbital-controls");

Object.assign(module.exports, configurator);
Object.assign(module.exports, configuratorCSR);
Object.assign(module.exports, configuratorPRC);
Object.assign(module.exports, image);
Object.assign(module.exports, visual);
Object.assign(module.exports, renderer);
Object.assign(module.exports, controls);
