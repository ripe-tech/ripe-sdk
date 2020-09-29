/**
 * The complete set of faces that may be used in the configurator
 * as the starting view.
 */
var FACES = ["side", "top", "front"];

window.onload = function () {
    var elementCSR = document.getElementById("configuratorCSR");
    var elementPRC = document.getElementById("configuratorPRC");
    var _body = document.querySelector("body");
    var url = _body.dataset.url || "https://sandbox.platforme.com/api/";
    var brand = _body.dataset.brand || "swear";
    var model = _body.dataset.model || "vyner";
    var variant = _body.dataset.variant || "";
    var version = _body.dataset.version || null;
    var currency = _body.dataset.currency || "USD";
    var country = _body.dataset.country || "US";
    var clientId = _body.dataset.client_id || null;
    var clientSecret = _body.dataset.client_secret || null;
    var guess = ["1", "true", "True"].indexOf(_body.dataset.guess) !== -1;
    var guessUrl = ["1", "true", "True"].indexOf(_body.dataset.guess_url) !== -1;

    var currentRenderMode = "csr";
    var configuratorCSR = null;
    var configuratorPRC = null;

    var parts = [];
    var partsMap = {};
    
    // eslint-disable-next-line no-undef
    var ripe = new Ripe({
        brand: brand,
        model: model,
        variant: variant,
        version: version,
        url: url,
        currency: currency,
        country: country,
        guess: guess,
        guessUrl: guessUrl
    });

    var randomize = async function () {
        var parts = [];
        for (var key in partsMap) {
            var triplets = partsMap[key];
            var index = Math.floor(Math.random() * triplets.length);
            var triplet = triplets[index];
            parts.push(triplet);
        }
        
        await ripe.setParts(parts, true, { partEvents: false });
    };

    var unique = function () {
        var count = 1;
        for (var key in partsMap) {
            var triplets = partsMap[key];
            count *= triplets.length;
        }
        return count;
    };

    var beautify = function (value) {
        var buffer = [];
        var parts = value.split("_");
        for (var index = 0; index < parts.length; index++) {
            var part = parts[index];
            buffer.push(part[0].toUpperCase() + part.substring(1));
        }
        return buffer.join(" ");
    };

    var bestFace = function (config) {
        var faces = config.faces || [];
        var bestFace = null;
        for (var index = 0; index < FACES.length; index++) {
            var face = FACES[index];
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

    var init = function (instance) {
        initBase(instance);
        initHeader(instance);
        initOAuth(instance);
        initConfigurator(instance);
        initInitials(instance);
    };

    var initBase = function () {
        // registers for the key down event on the global document element
        // to listen to some of the key strokes (global operations)
        document.addEventListener("keydown", async function (event) {
            if (event.ctrlKey && event.keyCode === 90) {
                await ripe.undo();
            }

            if (event.ctrlKey && event.keyCode === 89) {
                await ripe.redo();
            }
        });
    };

    var initHeader = function () {
        var setMessage = document.getElementById("set-message");
        var getPrice = document.getElementById("get-price");
        var getCombinations = document.getElementById("get-combinations");

        setMessage &&
            setMessage.addEventListener("click", function () {
                alert("Not implemented");
            });

        getPrice &&
            getPrice.addEventListener("click", function () {
                ripe.getPrice(function (value) {
                    if (value) {
                        alert(String(value.total.price_final) + " " + value.total.currency);
                    } else {
                        alert("No price available");
                    }
                });
            });

        getCombinations &&
            getCombinations.addEventListener("click", function () {
                ripe.getCombinations(function (combinations) {
                    alert(
                        "There are <strong>" +
                            String(combinations.length.formatMoney(0)) +
                            "</strong> combinations with <strong>" +
                            String(unique().formatMoney(0)) +
                            "</strong> possible compositions"
                    );
                });
            });

        ripe.bind("error", function (error, description) {
            alert(error);
        });

        ripe.bind("message", function (name, value) {
            alert(name + " - " + value);
        });

        ripe.bind("price", function (value) {
            var price = document.getElementById("price");
            if (!value || !value.total) {
                price.innerHTML = "N/A";
                return;
            }
            price.innerHTML = value.total.price_final + " " + value.total.currency;
        });

        ripe.bind("combinations", function (value) {
            for (var index = 0; index < value.length; index++) {
                var triplet = value[index];
                var part = triplet[0];
                var triplets = partsMap[part] || [];
                triplets.push(triplet);
                partsMap[part] = triplets;
                parts.push(triplet);
            }
        });
    };

    var initOAuth = function () {
        let oauthLogin = document.getElementById("oauth-login");
        let oauthLogout = document.getElementById("oauth-logout");
        let oauthOperation = document.getElementById("oauth-operation");

        oauthLogin &&
            oauthLogin.addEventListener("click", function () {
                ripe.oauth({
                    clientId: clientId,
                    clientSecret: clientSecret,
                    scope: ["admin"],
                    force: true
                });
            });

        oauthLogout &&
            oauthLogout.addEventListener("click", function () {
                ripe.unauth();
            });

        oauthOperation &&
            oauthOperation.addEventListener("click", function () {
                ripe.getOrders(function (result) {
                    alert("Retrieved " + String(result.length) + " orders");
                });
            });

        if (ripe.isOAuthPending()) {
            ripe.oauth();
        }

        oauthLogin = oauthLogin || { style: {} };
        oauthLogout = oauthLogout || { style: {} };
        oauthOperation = oauthOperation || { style: {} };

        ripe.bind("auth", function () {
            oauthLogin.style.display = "none";
            oauthLogout.style.display = "block";
            oauthOperation.style.display = "block";
        });

        ripe.bind("unauth", function () {
            oauthLogin.style.display = "block";
            oauthLogout.style.display = "none";
            oauthOperation.style.display = "none";
        });

        oauthLogin.style.display = "block";
        oauthLogout.style.display = "none";
        oauthOperation.style.display = "none";
    };

    var initConfigurator = function () {
        // loads the config of the product to retrieve the
        // complete configuration of the product and be able
        // to define the visible frames and apply restrictions
        var caller = ripe.loadedConfig
            ? function (callback) {
                  callback(ripe.loadedConfig);
              }
            : ripe.getConfig;
        caller(function (result) {
            var frame0 = document.getElementById("frame-0");
            var frame6 = document.getElementById("frame-6");
            var frameTop = document.getElementById("frame-top");
            var frameFront = document.getElementById("frame-front");

            frame0.style.display = "none";
            frame6.style.display = "none";
            frameTop.style.display = "none";
            frameFront.style.display = "none";

            if (result.faces.indexOf("side") !== -1) {
                if (result.frames > 0) {
                    frame0.style.display = "inline";
                    var image = ripe.bindImage(frame0, {
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

            frame0.addEventListener("click", function () {
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
            frame6.addEventListener("click", function () {
                configuratorCSR.changeFrame("side-6", {
                    revolutionDuration: 500
                });
                configuratorPRC.changeFrame("side-6", {
                    revolutionDuration: 500
                });
            });
            frameTop.addEventListener("click", function () {
                configuratorCSR.changeFrame("top-0", {
                    duration: 250
                });
                configuratorPRC.changeFrame("top-0", {
                    duration: 250
                });
            });
            frameFront.addEventListener("click", function () {
                configuratorPRC.changeFrame("front-0", {
                    duration: 250
                });
                configuratorCSR.changeFrame("front-0", {
                    duration: 250
                });
            });

            image &&
                image.bind("loaded", function () {
                    console.log("frame-0 loaded");
                });

            setTimeout(function () {
                if (result.frames > 9) {
                    image && image.setFrame("side-9");
                }
            });

            configuratorPRC = ripe.bindConfigurator(elementPRC, {
                duration: 250,
                noMasks: false,
                view: bestFace(result),
                render: "prc"
            });

            /*
            var partsMapArray = ["front", "laces", "sole", "side", "lining", "hardware", "logo"];
            var materials = {
                denim: ["blue", "green", "red"],
                fabric: ["blue", "green", "red", "white"],
                leather: ["brown", "red", "white"]
            };
            */

            configuratorCSR = ripe.bindConfigurator(elementCSR, {
                duration: 250,
                noMasks: false,
                view: bestFace(result),
                render: "csr",
                
                meshPath: "/static/assets/vyner_textures_test3.glb",
                cameraFOV: 28,
                cameraDistance: 28,
                cameraHeight: 5,
                cameraTarget: { x: 0, y: 2, z: 0.0 },
               /*
                meshPath: "/static/assets/vyner_animations_final.glb",
                cameraFOV: 28,
                cameraDistance: 5.1,
                cameraHeight: 0.9,
                cameraTarget: { x: 0, y: 0.375, z: 0.0 },
                */
                assetsPath: "/static/assets/",
                fontsPath: "/static/assets/fonts/",
                fontType: "comic_sans",
                fontWeight: "light",
                library: THREE,
                exposure: 1.6,
                mouseDrift: true,
                driftDuration: 200,
                viewAnimate: "cross",
                easing: "linear",
                highlightEasing: "easeInOutQuad",
                materialEasing: "easeInOutQuad",
                rotationEasing: "easeInOutQuad",
                crossfadeEasing: "easeInOutQuad",
                initialsPlacement: "center",
                introAnimation: "PopIn",
                //environment: "exterior_building",
                textSize: 0.5,
                textHeight: 0.01,
                shadowBias: -0.01
                //introAnimation: "ScaleIn"
                //lockRotation: "horizontal"
            });

            configuratorPRC.bind("loaded", function () {
                if (configuratorPRC.isFirst) configuratorPRC.isFirst = false;
                else return;
                if (result.faces.indexOf("side") !== -1) {
                    configuratorPRC.changeFrame("side-12", {
                        revolutionDuration: 500
                    });
                }
            });

            configuratorCSR.bind("loaded", function () {
                if (configuratorCSR.isFirst) configuratorCSR.isFirst = false;
                else return;
                if (result.faces.indexOf("side") !== -1) {
                    configuratorCSR.changeFrame("side-12", {
                        revolutionDuration: 500
                    });
                }
            });

            var toggleRenderMode = document.getElementById("toggle-render");

            toggleRenderMode &&
                toggleRenderMode.addEventListener("click", function () {
                    //const area = self.querySelector(".area");

                    if (currentRenderMode == "prc") currentRenderMode = "csr";
                    else if (currentRenderMode == "csr") currentRenderMode = "prc";

                    displayRenderMode();
                });

            displayRenderMode();

            var setPart = document.getElementById("set-part");

            setPart &&
                setPart.addEventListener("click", function () {
                    randomize();
                });

            // eslint-disable-next-line no-undef
            var syncPlugin = new Ripe.plugins.SyncPlugin(result.sync);

            // eslint-disable-next-line no-undef
            var restrictionsPlugin = new Ripe.plugins.RestrictionsPlugin(result.restrictions);

            // adds both plugins to the ripe instance so that can
            // be properly used under this runtime
            ripe.addPlugin(syncPlugin);
            ripe.addPlugin(restrictionsPlugin);

            // Added unloading function to avoid memory leaks in ThreeJS
            window.onunload = function () {
                ripe.unbindConfigurator(configuratorCSR);
                ripe.unbindConfigurator(configuratorPRC);
            };
        });
    };

    var displayRenderMode = function () {
        if (currentRenderMode == "prc") {
            elementCSR.style.display = "none";
            elementPRC.style.display = "inline-block";
            configuratorCSR.disable();
            configuratorPRC.resize();
            configuratorPRC.enable();
        } else if (currentRenderMode == "csr") {
            elementPRC.style.display = "none";
            elementCSR.style.display = "inline-block";
            configuratorPRC.disable();
            configuratorCSR.resize();
            configuratorCSR.enable();
        }
    };

    var initInitials = function () {
        ripe.bindImage(document.getElementById("initials"), {
            showInitials: true
        });

        ripe.bind("initials_extra", function (initialsExtra) {
            document.getElementById("initials-text").value =
                initialsExtra.main && initialsExtra.main.initials
                    ? initialsExtra.main.initials
                    : "";
        });

        document.getElementById("initials-text").addEventListener("keyup", function () {
            var initialsDrop = document.getElementById("initials-drop");
            var initialsDropContainer = initialsDrop.parentElement;
            var initialsInput = initialsDropContainer.getElementsByTagName("input")[0];
            ripe.setInitials(this.value, initialsInput.value);
        });

        document.getElementById("initials-drop").onvalue_change = function () {
            var initialsText = document.getElementById("initials-text");
            var initialsDropContainer = this.parentElement;
            var initialsInput = initialsDropContainer.getElementsByTagName("input")[0];
            ripe.setInitials(initialsText.value, initialsInput.value);
        };

        // loads the configuration to try to discover the profiles
        // that are available for the current model and build the
        // associated drop down with these values
        var caller = ripe.loadedConfig
            ? function (callback) {
                  callback(ripe.loadedConfig);
              }
            : ripe.getConfig;
        caller(function (result) {
            var initials = result.initials || {};
            var profiles = initials.$profiles || {};
            var profilesKeys = Object.keys(profiles);
            var dropdown = document.getElementById("initials-drop");
            var buffer = [];
            for (var index = 0; index < profilesKeys.length; index++) {
                var profile = profilesKeys[index];
                var profileS = beautify(profile);
                buffer.push('<li data-value="' + profile + '"><span>' + profileS + "</span></li>");
            }
            var innerHTML = buffer.join("");
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
    ripe.bind("ready", function () {
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
