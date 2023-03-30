import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

global.THREE = THREE;
global.GLTFLoader = GLTFLoader;
global.DRACOLoader = DRACOLoader;
global.FBXLoader = FBXLoader;
global.RGBELoader = RGBELoader;

const api = require("./api");
const base = require("./base");
const locales = require("./locales");
const plugins = require("./plugins");
const visual = require("./visual");

Object.assign(module.exports, api);
Object.assign(module.exports, base);
Object.assign(module.exports, locales);
Object.assign(module.exports, plugins);
Object.assign(module.exports, visual);

module.exports.VERSION = base.ripe.VERSION;
module.exports.Ripe = base.ripe.Ripe;
module.exports.RipeBase = base.ripe.RipeBase;
module.exports.RipeAPI = base.ripe.RipeAPI;
