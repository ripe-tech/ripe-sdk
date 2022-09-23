/**
 * The complete set of faces that may be used in the configurator
 * as the starting view.
 */
const FACES = ["side", "top", "front"];

window.onload = function() {
    let visibleConfigurator = null;
    let configuratorPrc = null;
    let configuratorCsr = null;

    const element = document.getElementById("configurator-prc");
    const _body = document.querySelector("body");
    const url = _body.dataset.url || "https://sandbox.platforme.com/api/";
    const brand = _body.dataset.brand || "dummy";
    const model = _body.dataset.model || "cube";
    const variant = _body.dataset.variant || "$base";
    const version = _body.dataset.version || null;
    const format = _body.dataset.format || "lossless";
    const currency = _body.dataset.currency || "USD";
    const country = _body.dataset.country || "US";
    const clientId = _body.dataset.client_id || null;
    const clientSecret = _body.dataset.client_secret || null;
    const guess = ["1", "true", "True"].indexOf(_body.dataset.guess) !== -1;
    const guessUrl = ["1", "true", "True"].indexOf(_body.dataset.guess_url) !== -1;

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

    const showConfigurator = function(type) {
        const prcElement = document.getElementById("configurator-prc");
        const csrElement = document.getElementById("configurator-csr");
        prcElement.style.display = "none";
        csrElement.style.display = "none";

        switch (type) {
            case "csr":
                configuratorCsr.syncFromPRC(configuratorPrc).then(() => {
                    csrElement.style.display = "block";
                    visibleConfigurator = "csr";
                });
                break;
            case "prc":
            default:
                configuratorPrc.syncFromCSR(configuratorCsr).then(() => {
                    prcElement.style.display = "block";
                    visibleConfigurator = "prc";
                });
                break;
        }
    };

    const init = function(instance) {
        // force PRC visualizer to appear at the start
        const prcElement = document.getElementById("configurator-prc");
        const csrElement = document.getElementById("configurator-csr");
        csrElement.style.display = "none";
        prcElement.style.display = "block";
        visibleConfigurator = "prc";

        initBase(instance);
        initHeader(instance);
        initOAuth(instance);
        initConfiguratorPrc(instance);
        initInitials(instance);
        initConfiguratorCsr();
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
        const setPart = document.getElementById("set-part");
        const setMessage = document.getElementById("set-message");
        const getPrice = document.getElementById("get-price");
        const getCombinations = document.getElementById("get-combinations");
        const changeConfigurator = document.getElementById("change-configurator");

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

        changeConfigurator && changeConfigurator.addEventListener("click", function() {
            switch (visibleConfigurator) {
                case "prc":
                    showConfigurator("csr");
                    break;
                case "csr":
                default:
                    showConfigurator("prc");
                    break;
            }
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

    const initConfiguratorPrc = function() {
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

            let image = null;
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
                    configuratorPrc.changeFrame("side-9", {
                        revolutionDuration: 500
                    });
                } else {
                    configuratorPrc.changeFrame("side-0", {
                        revolutionDuration: 500
                    });
                }
            });
            frame6.addEventListener("click", function() {
                configuratorPrc.changeFrame("side-6", {
                    revolutionDuration: 500
                });
            });
            frameTop.addEventListener("click", function() {
                configuratorPrc.changeFrame("top-0", {
                    duration: 250
                });
            });
            frameFront.addEventListener("click", function() {
                configuratorPrc.changeFrame("front-0", {
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

            configuratorPrc = ripe.bindConfigurator(element, {
                duration: 250,
                noMasks: false,
                view: bestFace(result)
            });
            configuratorPrc.isFirst = true;

            configuratorPrc.bind("loaded", function() {
                if (configuratorPrc.isFirst) configuratorPrc.isFirst = false;
                else return;
                if (result.faces.indexOf("side") !== -1) {
                    configuratorPrc.changeFrame("side-12", {
                        revolutionDuration: 500
                    });
                }
            });

            // eslint-disable-next-line no-undef
            const syncPlugin = new Ripe.plugins.SyncPlugin(result.sync);

            // eslint-disable-next-line no-undef
            const restrictionsPlugin = new Ripe.plugins.RestrictionsPlugin(result.restrictions);

            // adds both plugins to the ripe instance so that can
            // be properly used under this runtime
            ripe.addPlugin(syncPlugin);
            ripe.addPlugin(restrictionsPlugin);
        });
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

    const initConfiguratorCsr = function() {
        const element = document.getElementById("configurator-csr");
        configuratorCsr = ripe.bindConfigurator(element, { type: "csr" });

        // change frame on frame click
        const frame0 = document.getElementById("frame-0");
        const frame6 = document.getElementById("frame-6");
        const frameTop = document.getElementById("frame-top");
        const frameFront = document.getElementById("frame-front");
        frame0.addEventListener("click", function() {
            configuratorCsr.changeFrame("side-9", {
                revolutionDuration: 500
            });
        });
        frame6.addEventListener("click", function() {
            configuratorCsr.changeFrame("side-6", {
                revolutionDuration: 500
            });
        });
        frameTop.addEventListener("click", function() {
            configuratorCsr.changeFrame("top-0", {
                duration: 250
            });
        });
        frameFront.addEventListener("click", function() {
            configuratorCsr.changeFrame("front-0", {
                duration: 250
            });
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
