const csrAnimation = require("./csr/animation-base");
const csrChangeFrameAnimation = require("./csr/animation-change-frame");
const csrTextureRenderer = require("./csr/texture-renderer");
const csrUtils = require("./csr/utils");
const configuratorCsr = require("./configurator-csr");
const configuratorPrc = require("./configurator-prc");
const image = require("./image");
const visual = require("./visual");

Object.assign(module.exports, csrAnimation);
Object.assign(module.exports, csrChangeFrameAnimation);
Object.assign(module.exports, csrTextureRenderer);
Object.assign(module.exports, csrUtils);
Object.assign(module.exports, configuratorCsr);
Object.assign(module.exports, configuratorPrc);
Object.assign(module.exports, image);
Object.assign(module.exports, visual);
