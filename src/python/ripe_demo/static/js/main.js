window.onload = function() {
    var element = document.getElementById("configurator");
    var _body = document.querySelector("body");
    var url = _body.dataset.url || "http://demo.platforme.com/api/";
    var brand = _body.dataset.brand || "myswear";
    var model = _body.dataset.model || "vyner";
    var variant = _body.dataset.variant || "";
    var currency = _body.dataset.currency || "USD";
    var country = _body.dataset.country || "US";

    var parts = [];
    var partsMap = {};
    var index = 0;

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

    var sequence = function() {
        var target = index % parts.length;
        var part = parts[target];
        ripe.setPart(part[0], part[1], part[2]);
        index++;
    };

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
        console.log("frame-0 loaded")
    });

    setTimeout(function() {
        image.setFrame("9");
    });

    var configurator = ripe.bindConfigurator(element);

    configurator.bind("loaded", function() {
        configurator.changeFrame("side-12", {
            duration: 500
        });
    });

    ripe.bind("price", function(value) {
        var price = document.getElementById("price");
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

    ripe.load();

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
        ripe.getPrice({}, function(value) {
            alert(String(value.total.price_final) + " " + value.total.currency);
        });
    });

    getCombinations && getCombinations.addEventListener("click", function() {
        ripe.getCombinations({}, function(value) {
            alert("There are <strong>" + String(value.length) +
                "</strong> combinations with <strong>" + String(unique()) +
                "</strong> possible compositions");
        });
    });
};
