const configurator = require("./configurator");
const configuratorCSR = require("./configurator-csr");
const configuratorPRC = require("./configurator-prc");
const image = require("./image");
const visual = require("./visual");
const csr = require("./csr");
const csrAssetManager = require("./csr-asset-manager");
const csrInitials = require("./csr-initials");
const controls = require("./orbital-controls");

Object.assign(module.exports, configurator);
Object.assign(module.exports, configuratorCSR);
Object.assign(module.exports, configuratorPRC);
Object.assign(module.exports, image);
Object.assign(module.exports, visual);
Object.assign(module.exports, csr);
Object.assign(module.exports, csrAssetManager);
Object.assign(module.exports, csrInitials);
Object.assign(module.exports, controls);
