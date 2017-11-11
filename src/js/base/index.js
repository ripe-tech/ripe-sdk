const api = require("./api");
const base = require("./base");
const compat = require("./compat");
const export_ = require("./export");
const interactable = require("./interactable");
const observable = require("./observable");
const ripe = require("./ripe");
const utils = require("./utils");

Object.assign(module.exports, api);
Object.assign(module.exports, base);
Object.assign(module.exports, compat);
Object.assign(module.exports, export_);
Object.assign(module.exports, interactable);
Object.assign(module.exports, observable);
Object.assign(module.exports, ripe);
Object.assign(module.exports, utils);
