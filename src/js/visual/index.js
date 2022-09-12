const csrAnimation = require("./csr/animation-base");
const csrChangeFrameAnimation = require("./csr/animation-change-frame");
const csrInitialsRenderer = require("./csr/initials-renderer");
const csrUtils = require("./csr/utils");
const configuratorCsr = require("./configurator-csr");
const configuratorPrc = require("./configurator-prc");
const image = require("./image");
const visual = require("./visual");

Object.assign(module.exports, csrAnimation);
Object.assign(module.exports, csrChangeFrameAnimation);
Object.assign(module.exports, csrInitialsRenderer);
Object.assign(module.exports, csrUtils);
Object.assign(module.exports, configuratorCsr);
Object.assign(module.exports, configuratorPrc);
Object.assign(module.exports, image);
Object.assign(module.exports, visual);
