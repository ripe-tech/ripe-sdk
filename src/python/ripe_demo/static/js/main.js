window.onload = function() {
    var element = document.getElementById("frames");
    var url = element.dataset.url || "http://localhost:8181/";
    var brand = element.dataset.brand || "swear";
    var model = element.dataset.model || "vyner";
    var variant = element.dataset.variant || "";
    var currency = element.dataset.currency || "USD";
    var country = element.dataset.country || "US";

    var parts = [];
    var partsMap = {};
    var index = 0;
    var frames = {
        side: 24,
        top: 1
    };

    var ripe = new Ripe(url, brand, model, variant, frames, {
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

    ripe.bindFrame(document.getElementById("frame-0"), "0");
    ripe.bindFrame(document.getElementById("frame-1"), "1");
    ripe.bindFrame(document.getElementById("frame-6"), "6");
    ripe.bindFrame(document.getElementById("frame-top"), "top");

    var dragElement = document.getElementById("product-drag");
    ripe.bindDrag(dragElement, 620);

    var firstLoad = false;
    ripe.addLoadedCallback(function() {
        if (firstLoad) {
            return;
        }
        firstLoad = true;

        setTimeout(function() {
            ripe.changeFrame(5);
        }, 500);
    });

    ripe.addPriceCallback(function(value) {
        var price = document.getElementById("price");
        price.innerHTML = value.total.price_final + " " + value.total.currency;
    });
    ripe.addCombinationsCallback(function(value) {
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
        ripe.getPrice(function(value) {
            alert(String(value.total.price_final) + " " + value.total.currency);
        });
    });

    getCombinations && getCombinations.addEventListener("click", function() {
        ripe.getCombinations(function(value) {
            alert("There are <strong>" + String(value.length) +
                "</strong> combinations with <strong>" + String(unique()) +
                "</strong> possible compositions");
        });
    });
};
