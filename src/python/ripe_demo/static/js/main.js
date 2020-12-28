/**
 * The complete set of faces that may be used in the configurator
 * as the starting view.
 */
const FACES = ["side", "top", "front"];

window.onload = function() {
    const elementCSR = document.getElementById("configurator-csr");
    const elementPRC = document.getElementById("configurator-prc");
    const _body = document.querySelector("body");
    // const url = _body.dataset.url || "https://sandbox.platforme.com/api/";
    const url = _body.dataset.url || "http://localhost:8181/api/";
    const brand = _body.dataset.brand || "swear";
    // const model = _body.dataset.model || "vyner";
    const model = _body.dataset.model || "vyner_hitop";
    const variant = _body.dataset.variant || "";
    const version = _body.dataset.version || null;
    const format = _body.dataset.format || "lossless";
    const currency = _body.dataset.currency || "USD";
    const country = _body.dataset.country || "US";
    const clientId = _body.dataset.client_id || null;
    const clientSecret = _body.dataset.client_secret || null;
    const guess = ["1", "true", "True"].indexOf(_body.dataset.guess) !== -1;
    const guessUrl = ["1", "true", "True"].indexOf(_body.dataset.guess_url) !== -1;

    let image = null;
    let currentRenderMode = "csr";
    let configuratorCSR = null;
    let configuratorPRC = null;

    const parts = [];
    const partsMap = {};

    // eslint-disable-next-line no-undef
    const ripe = new Ripe({
        brand: brand,
        model: model,
        variant: variant,
        version: version,
        format: format,
        url: url,
        currency: currency,
        country: country,
        guess: guess,
        guessUrl: guessUrl
    });

    const randomize = async function() {
        const parts = [];
        for (const key in partsMap) {
            const triplets = partsMap[key];
            const index = Math.floor(Math.random() * triplets.length);
            const triplet = triplets[index];
            parts.push(triplet);
        }
        await ripe.setParts(parts, true, { partEvents: false });
    };

    const unique = function() {
        let count = 1;
        for (const key in partsMap) {
            const triplets = partsMap[key];
            count *= triplets.length;
        }
        return count;
    };

    const beautify = function(value) {
        const buffer = [];
        const parts = value.split("_");
        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            buffer.push(part[0].toUpperCase() + part.substring(1));
        }
        return buffer.join(" ");
    };

    const bestFace = function(config) {
        const faces = config.faces || [];
        let bestFace = null;
        for (let index = 0; index < FACES.length; index++) {
            const face = FACES[index];
            if (faces.indexOf(face) === -1) {
                continue;
            }
            bestFace = face;
            break;
        }
        if (bestFace) {
            return bestFace;
        }
        return faces.length > 0 ? faces[0] : null;
    };

    const init = function(instance) {
        initBase(instance);
        initHeader(instance);
        initOAuth(instance);
        initConfigurator(instance);
        initInitials(instance);
    };

    const initBase = function() {
        // registers for the key down event on the global document element
        // to listen to some of the key strokes (global operations)
        document.addEventListener("keydown", async function(event) {
            if (event.ctrlKey && event.keyCode === 90) {
                await ripe.undo();
            }

            if (event.ctrlKey && event.keyCode === 89) {
                await ripe.redo();
            }
        });
    };

    const initHeader = function() {
        const setMessage = document.getElementById("set-message");
        const getPrice = document.getElementById("get-price");
        const getCombinations = document.getElementById("get-combinations");

        setMessage &&
            setMessage.addEventListener("click", function() {
                alert("Not implemented");
            });

        getPrice &&
            getPrice.addEventListener("click", function() {
                ripe.getPrice(function(value) {
                    if (value) {
                        alert(String(value.total.price_final) + " " + value.total.currency);
                    } else {
                        alert("No price available");
                    }
                });
            });

        getCombinations &&
            getCombinations.addEventListener("click", function() {
                ripe.getCombinations(function(combinations) {
                    alert(
                        "There are <strong>" +
                            String(combinations.length.formatMoney(0)) +
                            "</strong> combinations with <strong>" +
                            String(unique().formatMoney(0)) +
                            "</strong> possible compositions"
                    );
                });
            });

        ripe.bind("error", function(error, description) {
            alert(error);
        });

        ripe.bind("message", function(name, value) {
            alert(name + " - " + value);
        });

        ripe.bind("price", function(value) {
            const price = document.getElementById("price");
            if (!value || !value.total) {
                price.innerHTML = "N/A";
                return;
            }
            price.innerHTML = value.total.price_final + " " + value.total.currency;
        });

        ripe.bind("combinations", function(value) {
            for (let index = 0; index < value.length; index++) {
                const triplet = value[index];
                const part = triplet[0];
                const triplets = partsMap[part] || [];
                triplets.push(triplet);
                partsMap[part] = triplets;
                parts.push(triplet);
            }
        });
    };

    const initOAuth = function() {
        let oauthLogin = document.getElementById("oauth-login");
        let oauthLogout = document.getElementById("oauth-logout");
        let oauthOperation = document.getElementById("oauth-operation");

        oauthLogin &&
            oauthLogin.addEventListener("click", function() {
                ripe.oauth({
                    clientId: clientId,
                    clientSecret: clientSecret,
                    scope: ["admin"],
                    force: true
                });
            });

        oauthLogout &&
            oauthLogout.addEventListener("click", function() {
                ripe.unauth();
            });

        oauthOperation &&
            oauthOperation.addEventListener("click", function() {
                ripe.getOrders(function(result) {
                    alert("Retrieved " + String(result.length) + " orders");
                });
            });

        oauthLogin = oauthLogin || { style: {} };
        oauthLogout = oauthLogout || { style: {} };
        oauthOperation = oauthOperation || { style: {} };

        oauthLogin.style.display = "block";
        oauthLogout.style.display = "none";
        oauthOperation.style.display = "none";

        if (ripe.isOAuthPending()) {
            ripe.oauth();
        }

        ripe.bind("auth", function() {
            oauthLogin.style.display = "none";
            oauthLogout.style.display = "block";
            oauthOperation.style.display = "block";
        });

        ripe.bind("unauth", function() {
            oauthLogin.style.display = "block";
            oauthLogout.style.display = "none";
            oauthOperation.style.display = "none";
        });
    };

    const initConfigurator = function() {
        // loads the config of the product to retrieve the
        // complete configuration of the product and be able
        // to define the visible frames and apply restrictions
        const caller = ripe.loadedConfig
            ? function(callback) {
                  callback(ripe.loadedConfig);
              }
            : ripe.getConfig;
        caller(function(result) {
            const frame0 = document.getElementById("frame-0");
            const frame6 = document.getElementById("frame-6");
            const frameTop = document.getElementById("frame-top");
            const frameFront = document.getElementById("frame-front");

            frame0.style.display = "none";
            frame6.style.display = "none";
            frameTop.style.display = "none";
            frameFront.style.display = "none";

            if (result.faces.indexOf("side") !== -1) {
                if (result.frames > 0) {
                    frame0.style.display = "inline";
                    image = ripe.bindImage(frame0, {
                        frame: "side-0"
                    });
                }

                if (result.frames > 6) {
                    frame6.style.display = "inline";
                    ripe.bindImage(frame6, {
                        frame: "side-6"
                    });
                }
            }

            if (result.faces.indexOf("top") !== -1) {
                frameTop.style.display = "inline";
                ripe.bindImage(frameTop, {
                    frame: "top-0"
                });
            }

            if (result.faces.indexOf("front") !== -1) {
                frameFront.style.display = "inline";
                ripe.bindImage(frameFront, {
                    frame: "front-0"
                });
            }

            frame0.addEventListener("click", function() {
                if (result.frames > 9) {
                    configuratorCSR.changeFrame("side-9", {
                        revolutionDuration: 500
                    });
                    configuratorPRC.changeFrame("side-9", {
                        revolutionDuration: 500
                    });
                } else {
                    configuratorCSR.changeFrame("side-0", {
                        revolutionDuration: 500
                    });
                    configuratorPRC.changeFrame("side-0", {
                        revolutionDuration: 500
                    });
                }
            });
            frame6.addEventListener("click", function() {
                configuratorCSR.changeFrame("side-6", {
                    revolutionDuration: 500
                });
                configuratorPRC.changeFrame("side-6", {
                    revolutionDuration: 500
                });
            });
            frameTop.addEventListener("click", function() {
                configuratorCSR.changeFrame("top-0", {
                    duration: 250
                });
                configuratorPRC.changeFrame("top-0", {
                    duration: 250
                });
            });
            frameFront.addEventListener("click", function() {
                configuratorPRC.changeFrame("front-0", {
                    duration: 250
                });
                configuratorCSR.changeFrame("front-0", {
                    duration: 250
                });
            });

            image &&
                image.bind("loaded", function() {
                    console.log("frame-0 loaded");
                });

            setTimeout(function() {
                if (result.frames > 9) {
                    image && image.setFrame("side-9");
                }
            });

            configuratorPRC = ripe.bindConfigurator(elementPRC, {
                render: "prc",
                duration: 250,
                noMasks: false,
                view: bestFace(result)
            });

            configuratorCSR = ripe.bindConfigurator(elementCSR, {
                render: "csr",
                duration: 250,
                noMasks: false,
                view: bestFace(result),

                // can be "crossfade", "rotate" or "none"
                viewAnimate: "crossfade",
                positionAnimate: "rotate",

                // debug is used to change post processing settings
                debug: false,

                usesPostProcessing: true,

                library: window.THREE,
                dat: window.dat,
                postProcessingLibrary: window.POSTPROCESSING,

                assets: {
                    // model data is stored in `vyner_hitop.js` temporarily, is meant to be a JSON
                    // that is downloaded, or present in a spec file
                    config: window.modelData,

                    // the relative path with the location of the assets
                    path: "/static/assets/",

                    // can be "gltf" or "fbx", defaults to "gltf" if no parameter is passed
                    format: "gltf"
                },

                initials: {
                    // TODO extract alignment from build
                    // can be "left", "right", "center"
                    align: "center",
                    size: 0.5,
                    height: 0.1,
                    type: "comic_sans",
                    weight: "light"
                },

                camera: {
                    fov: 13,
                    height: 18,
                    target: { x: 0, y: 6.5, z: 0.0 },
                    distance: 150,
                    maxDistance: 180,
                    minDistance: 100
                },

                controls: {
                    // 'mouseDrift' defaults to true, unless specified to be false
                    // allows drifting when dragging stops
                    driftDuration: 200,

                    // if we're allowed to zoom in as part of the orbital controls
                    canZoom: true,

                    // 'lockRotation' can be 'horizontal', 'vertical', or be left
                    // empty for no axis lock on rotations
                    rotationEasing: "easeInOutQuad"
                },

                renderer: {
                    highlightEasing: "easeOutQuad",
                    materialEasing: "easeInOutQuad",
                    crossfadeEasing: "easeInOutQuad",
                    initialsPlacement: "center",
                    introAnimation: "mesh_slide_in_1.glb",
                    environment: "exterior_building",
                    maskOpacity: 0.7
                },

                postProcess: {
                    exposure: 1.6,
                    shadowBias: -0.0005,
                    bloom: {
                        threshold: 0.9,
                        intensity: 1,
                        opacity: 0.8
                    },
                    antialiasing: true,
                    ambientOcclusion: {}
                }
            });

            configuratorPRC.bind("loaded", function() {
                if (configuratorPRC.isFirst) configuratorPRC.isFirst = false;
                else return;
                if (result.faces.indexOf("side") !== -1) {
                    configuratorPRC.changeFrame("side-12", {
                        revolutionDuration: 500
                    });
                }
            });

            // @todo using this hack until the loaded event is not fixed
            setTimeout(() => {
                configuratorCSR.wireframe = false;
            }, 1500);

            // @todo this event is not being triggered!!!!
            configuratorCSR.bind("loaded", function() {
                if (configuratorCSR.isFirst) configuratorCSR.isFirst = false;
                else return;
                if (result.faces.indexOf("side") !== -1) {
                    configuratorCSR.changeFrame("side-12", {
                        revolutionDuration: 500
                    });
                }
            });

            const toggleRenderMode = document.getElementById("toggle-render");

            toggleRenderMode &&
                toggleRenderMode.addEventListener("click", function() {
                    if (currentRenderMode === "prc") currentRenderMode = "csr";
                    else if (currentRenderMode === "csr") currentRenderMode = "prc";

                    displayRenderMode();
                });

            displayRenderMode();

            const setPart = document.getElementById("set-part");

            setPart &&
                setPart.addEventListener("click", function() {
                    randomize();
                });

            // eslint-disable-next-line no-undef
            const syncPlugin = new Ripe.plugins.SyncPlugin(result.sync);

            // eslint-disable-next-line no-undef
            const restrictionsPlugin = new Ripe.plugins.RestrictionsPlugin(result.restrictions);

            // adds both plugins to the ripe instance so that can
            // be properly used under this runtime
            ripe.addPlugin(syncPlugin);
            ripe.addPlugin(restrictionsPlugin);

            // Added unloading function to avoid memory leaks in ThreeJS
            window.onunload = function() {
                ripe.unbindConfigurator(configuratorCSR);
                ripe.unbindConfigurator(configuratorPRC);
            };
        });
    };

    const displayRenderMode = function() {
        if (currentRenderMode === "prc") {
            elementCSR.style.display = "none";
            elementPRC.style.display = "inline-block";
            configuratorPRC.resize();
        } else if (currentRenderMode === "csr") {
            elementPRC.style.display = "none";
            elementCSR.style.display = "inline-block";
            configuratorCSR.resize();
        }
    };

    const initInitials = function() {
        ripe.bindImage(document.getElementById("initials"), {
            showInitials: true
        });

        ripe.bind("initials_extra", function(initialsExtra) {
            document.getElementById("initials-text").value =
                initialsExtra.main && initialsExtra.main.initials
                    ? initialsExtra.main.initials
                    : "";
        });

        document.getElementById("initials-text").addEventListener("keyup", function() {
            const initialsDrop = document.getElementById("initials-drop");
            const initialsDropContainer = initialsDrop.parentElement;
            const initialsInput = initialsDropContainer.getElementsByTagName("input")[0];
            ripe.setInitials(this.value, initialsInput.value);
        });

        document.getElementById("initials-drop").onvalue_change = function() {
            const initialsText = document.getElementById("initials-text");
            const initialsDropContainer = this.parentElement;
            const initialsInput = initialsDropContainer.getElementsByTagName("input")[0];
            ripe.setInitials(initialsText.value, initialsInput.value);
        };

        // loads the configuration to try to discover the profiles
        // that are available for the current model and build the
        // associated drop down with these values
        const caller = ripe.loadedConfig
            ? function(callback) {
                  callback(ripe.loadedConfig);
              }
            : ripe.getConfig;
        caller(function(result) {
            const initials = result.initials || {};
            const profiles = initials.$profiles || {};
            const profilesKeys = Object.keys(profiles);
            const dropdown = document.getElementById("initials-drop");
            const buffer = [];
            for (let index = 0; index < profilesKeys.length; index++) {
                const profile = profilesKeys[index];
                const profileS = beautify(profile);
                buffer.push('<li data-value="' + profile + '"><span>' + profileS + "</span></li>");
            }
            const innerHTML = buffer.join("");
            dropdown.innerHTML = innerHTML;
            dropdown.dispatchEvent(new Event("update"));
            if (profilesKeys.length === 0) {
                dropdown.dispatchEvent(new Event("disable"));
            } else {
                dropdown.dispatchEvent(new Event("enable"));
            }
        });
    };

    // starts the loading process for the RIPE main instance and binds
    // it to the ready event (all internal structures loaded according
    // to values from the server side
    ripe.load();
    ripe.bind("ready", function() {
        try {
            init(ripe);
        } catch (exception) {
            this.trigger("error", exception);
            throw exception;
        }
    });

    // sets the ripe instance as a global available symbol so that it can
    // be easily used latter for debugging inside console
    window.ripeInstance = ripe;
};
