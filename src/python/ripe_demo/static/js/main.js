/**
 * The complete set of faces that may be used in the configurator
 * as the starting view.
 */
var FACES = ["side", "top", "front"];

window.onload = function() {
    var element = document.getElementById("configurator");
    var _body = document.querySelector("body");
    var url = _body.dataset.url || "https://sandbox.platforme.com/api/";
    var brand = _body.dataset.brand || "swear";
    var model = _body.dataset.model || "vyner";
    var variant = _body.dataset.variant || "";
    var currency = _body.dataset.currency || "USD";
    var country = _body.dataset.country || "US";
    var clientId = _body.dataset.client_id || null;
    var clientSecret = _body.dataset.client_secret || null;

    var parts = [];
    var partsMap = {};

    // eslint-disable-next-line no-undef
    var ripe = new Ripe({
        brand: brand,
        model: model,
        variant: variant,
        url: url,
        currency: currency,
        country: country
    });

    var randomize = async function() {
        var parts = [];
        for (var key in partsMap) {
            var triplets = partsMap[key];
            var index = Math.floor(Math.random() * triplets.length);
            var triplet = triplets[index];
            parts.push(triplet);
        }
        await ripe.setParts(parts);
    };

    var unique = function() {
        var count = 1;
        for (var key in partsMap) {
            var triplets = partsMap[key];
            count *= triplets.length;
        }
        return count;
    };

    var beautify = function(value) {
        var buffer = [];
        var parts = value.split("_");
        for (var index = 0; index < parts.length; index++) {
            var part = parts[index];
            buffer.push(part[0].toUpperCase() + part.substring(1));
        }
        return buffer.join(" ");
    };

    var bestFace = function(config) {
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

    var init = function(instance) {
        initBase(instance);
        initHeader(instance);
        initOAuth(instance);
        initConfigurator(instance);
        initInitials(instance);
    };

    var initBase = function() {
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

    var initHeader = function() {
        var setPart = document.getElementById("set-part");
        var setMessage = document.getElementById("set-message");
        var getPrice = document.getElementById("get-price");
        var getCombinations = document.getElementById("get-combinations");

        setPart &&
            setPart.addEventListener("click", function() {
                randomize();
            });

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
            var price = document.getElementById("price");
            if (!value || !value.total) {
                price.innerHTML = "N/A";
                return;
            }
            price.innerHTML = value.total.price_final + " " + value.total.currency;
        });

        ripe.bind("combinations", function(value) {
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

    var initOAuth = function() {
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

        if (ripe.isOAuthPending()) {
            ripe.oauth();
        }

        oauthLogin = oauthLogin || { style: {} };
        oauthLogout = oauthLogout || { style: {} };
        oauthOperation = oauthOperation || { style: {} };

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

        oauthLogin.style.display = "block";
        oauthLogout.style.display = "none";
        oauthOperation.style.display = "none";
    };

    var initConfigurator = function() {
        // loads the config of the product to retrieve the
        // complete configuration of the product and be able
        // to define the visible frames and apply restrictions
        var caller = ripe.loadedConfig
            ? function(callback) {
                  callback(ripe.loadedConfig);
              }
            : ripe.getConfig;
        caller(function(result) {
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

            frame0.addEventListener("click", function() {
                if (result.frames > 9) {
                    configurator.changeFrame("side-9", {
                        revolutionDuration: 500
                    });
                } else {
                    configurator.changeFrame("side-0", {
                        revolutionDuration: 500
                    });
                }
            });
            frame6.addEventListener("click", function() {
                configurator.changeFrame("side-6", {
                    revolutionDuration: 500
                });
            });
            frameTop.addEventListener("click", function() {
                configurator.changeFrame("top-0", {
                    duration: 250
                });
            });
            frameFront.addEventListener("click", function() {
                configurator.changeFrame("front-0", {
                    duration: 250
                });
            });

            image &&
                image.bind("loaded", function() {
                    console.log("frame-0 loaded");
                });

            setTimeout(function() {
                if (result.frames > 9) {
                    image && image.setFrame("9");
                }
            });

            var configurator = ripe.bindConfigurator(element, {
                duration: 250,
                noMasks: false,
                view: bestFace(result)
            });
            configurator.isFirst = true;

            configurator.bind("loaded", function() {
                if (configurator.isFirst) configurator.isFirst = false;
                else return;
                if (result.faces.indexOf("side") !== -1) {
                    configurator.changeFrame("side-12", {
                        revolutionDuration: 500
                    });
                }
            });

            // eslint-disable-next-line no-undef
            var syncPlugin = new Ripe.plugins.SyncPlugin(result.sync);

            // eslint-disable-next-line no-undef
            var restrictionsPlugin = new Ripe.plugins.RestrictionsPlugin(result.restrictions);

            // adds both plugins to the ripe instance so that can
            // be properly used under this runtime
            ripe.addPlugin(syncPlugin);
            ripe.addPlugin(restrictionsPlugin);
        });
    };

    var initInitials = function() {
        ripe.bindImage(document.getElementById("initials"), {
            showInitials: true
        });

        document.getElementById("initials-text").addEventListener("keyup", function() {
            var initialsDrop = document.getElementById("initials-drop");
            var initialsDropContainer = initialsDrop.parentElement;
            var initialsInput = initialsDropContainer.getElementsByTagName("input")[0];
            ripe.setInitials(this.value || "$empty", initialsInput.value);
        });

        document.getElementById("initials-drop").onvalue_change = function() {
            var initialsText = document.getElementById("initials-text");
            var initialsDropContainer = this.parentElement;
            var initialsInput = initialsDropContainer.getElementsByTagName("input")[0];
            ripe.setInitials(initialsText.value || "$empty", initialsInput.value);
        };

        // loads the configuration to try to discover the profiles
        // that are available for the current model and build the
        // associated drop down with these values
        var caller = ripe.loadedConfig
            ? function(callback) {
                  callback(ripe.loadedConfig);
              }
            : ripe.getConfig;
        caller(function(result) {
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

    // sets the initial value of the initials to an empty value
    // this special value is the way to represent an empty initials
    // value under the RIPE composition engine
    ripe.setInitials("$empty");

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
    // be easly used latter for debugging inside console
    window.ripeInstance = ripe;
};
