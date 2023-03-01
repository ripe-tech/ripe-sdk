/** @namespace */
// eslint-disable-next-line no-use-before-define,no-var
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const three = require("three");

const aaa = require("three/examples/jsm/loaders/GLTFLoader.js").GLTFLoader;

var ripe = typeof ripe === "undefined" ? {} : ripe;

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}

ripe.TestAPI = function(options = {}) {
    console.log("test run");

    console.log("afa", aaa);

    const scene = new THREE.Scene();
    console.log("scene", scene);

    const loader = new GLTFLoader();
    console.log("loader", loader);
};

ripe.stuff = function() {
    return "10";
};

window.TestAPI = ripe.TestAPI;
