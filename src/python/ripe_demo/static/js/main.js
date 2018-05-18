window.onload = function() {
    var element = document.getElementById("configurator");
    var _body = document.querySelector("body");
    var url = _body.dataset.url || "https://sandbox.platforme.com/api/";
    var brand = _body.dataset.brand || "swear";
    var model = _body.dataset.model || "vyner";
    var variant = _body.dataset.variant || "";
    var currency = _body.dataset.currency || "USD";
    var country = _body.dataset.country || "US";

    var parts = [];
    var partsMap = {};

    var ripe = new Ripe(brand, model, {
        variant: variant,
        url: url,
        currency: currency,
        country: country
    });

    var randomize = function() {
        var parts = [];
        for (var key in partsMap) {
            var triplets = partsMap[key];
            var index = Math.floor(Math.random() * triplets.length);
            var triplet = triplets[index];
            parts.push(triplet);
        }
        ripe.setParts(parts);
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

    var init = function() {
        initHeader();
        initConfigurator();
        initInitials();
    };

    var initHeader = function() {
        var setPart = document.getElementById("set-part");
        var setMessage = document.getElementById("set-message");
        var getPrice = document.getElementById("get-price");
        var getCombinations = document.getElementById("get-combinations");

        setPart && setPart.addEventListener("click", function() {
            randomize();
        });

        setMessage && setMessage.addEventListener("click", function() {
            alert("Not implemented");
        });

        getPrice && getPrice.addEventListener("click", function() {
            ripe.getPrice(function(value) {
                alert(String(value.total.price_final) + " " + value.total.currency);
            });
        });

        getCombinations && getCombinations.addEventListener("click", function() {
            ripe.getCombinations(function(value) {
                alert("There are <strong>" + String((value.length).formatMoney(0)) +
                    "</strong> combinations with <strong>" + String(unique().formatMoney(0)) +
                    "</strong> possible compositions");
            });
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

    var initConfigurator = function() {
        var image = ripe.bindImage(document.getElementById("frame-0"), {
            frame: "side-0"
        });
        ripe.bindImage(document.getElementById("frame-6"), {
            frame: "side-6"
        });
        ripe.bindImage(document.getElementById("frame-top"), {
            frame: "top-0"
        });

        document.getElementById("frame-0").addEventListener("click", function() {
            configurator.changeFrame("side-9");
        });

        document.getElementById("frame-6").addEventListener("click", function() {
            configurator.changeFrame("side-6");
        });

        document.getElementById("frame-top").addEventListener("click", function() {
            configurator.changeFrame("top-0");
        });

        image.bind("loaded", function() {
            console.log("frame-0 loaded");
        });

        setTimeout(function() {
            image.setFrame("9");
        });

        var configurator = ripe.bindConfigurator(element, {
            noMasks: false
        });

        configurator.bind("loaded", function() {
            configurator.changeFrame("side-12", {
                duration: 500
            });
        });

        // loads the config of the product to retrieve the
        // sync and the restriction rules and initializes
        // the respective plugin if they exits
        ripe.getConfig(function(result) {
            var syncPlugin = new Ripe.plugins.SyncPlugin(result.sync);
            var restrictionsPlugin = new Ripe.plugins.RestrictionsPlugin(
                result.restrictions
            );
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
        ripe.getConfig(function(result) {
            var initials = result.initials || {};
            var profiles = initials.$profiles || {};
            var profilesKeys = Object.keys(profiles);
            var dropdown = document.getElementById("initials-drop");
            var buffer = [];
            for (var index = 0; index < profilesKeys.length; index++) {
                var profile = profilesKeys[index];
                var profileS = beautify(profile);
                buffer.push("<li data-value=\"" + profile + "\"><span>" + profileS + "</span></li>");
            }
            var innerHTML = buffer.join("");
            dropdown.innerHTML = innerHTML;
            dropdown.dispatchEvent(new Event("update"));
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
        init(ripe);
    });
};
