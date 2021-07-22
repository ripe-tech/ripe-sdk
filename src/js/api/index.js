const attachment = require("./attachment");
const account = require("./account");
const availabilityRule = require("./availability-rule");
const brand = require("./brand");
const build = require("./build");
const config = require("./config");
const countryGroup = require("./country-group");
const factoryRule = require("./factory-rule");
const justification = require("./justification");
const letterRule = require("./letter-rule");
const locale = require("./locale");
const notifyInfo = require("./notify-info");
const oauth = require("./oauth");
const order = require("./order");
const priceRule = require("./price-rule");
const profile = require("./profile");
const size = require("./size");
const sku = require("./sku");
const transportRule = require("./transport-rule");

Object.assign(module.exports, attachment);
Object.assign(module.exports, account);
Object.assign(module.exports, availabilityRule);
Object.assign(module.exports, brand);
Object.assign(module.exports, build);
Object.assign(module.exports, config);
Object.assign(module.exports, countryGroup);
Object.assign(module.exports, factoryRule);
Object.assign(module.exports, justification);
Object.assign(module.exports, letterRule);
Object.assign(module.exports, locale);
Object.assign(module.exports, notifyInfo);
Object.assign(module.exports, oauth);
Object.assign(module.exports, order);
Object.assign(module.exports, priceRule);
Object.assign(module.exports, profile);
Object.assign(module.exports, size);
Object.assign(module.exports, sku);
Object.assign(module.exports, transportRule);
