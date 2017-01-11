window.onload = function() {
    var element = document.getElementById("canvas");
    var url = element.dataset.url || "https://myswear-test.platforme.com/";
    var model = element.dataset.model || "vyner";
    var currency = element.dataset.currency || "USD";
    var country = element.dataset.country || "US";

    var parts = [];
    var partsMap = {};
    var index = 0;

    var ripe = new Ripe(url, model, {}, {
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

    var sequence = function() {
        var target = index % parts.length;
        var part = parts[target];
        ripe.setPart(part[0], part[1], part[2]);
        index++;
    };

    ripe.bind(document.getElementById("frame-0"), "0");
    ripe.bind(document.getElementById("frame-6"), "6");
    ripe.bind(document.getElementById("frame-top"), "top");
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

    setPart.addEventListener("click", function() {
        randomize();
    });

    setMessage.addEventListener("click", function() {
        alert("Not implemented");
    });

    getPrice.addEventListener("click", function() {
        ripe.getPrice(function(value) {
            alert(String(value.total.price_final) + " " + value.total.currency);
        });
    });
};
