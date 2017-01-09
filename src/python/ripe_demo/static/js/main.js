window.onload = function() {
    var element = document.getElementById("canvas");
    var url = element.dataset.url || "https://www.my-swear.com/";
    var model = element.dataset.model || "vyner";
    var currency = element.dataset.currency || "USD";
    var country = element.dataset.country || "US";

    var parts = [
        ["side", "suede", "navy"],
        ["side", "nappa", "beige"],
        ["side", "crocodile", "silver"],
        ["side", "nappa", "white"]
    ];
    var index = 0;

    var ripe = new Ripe(url, model, {}, {
        currency: currency,
        country: country
    });

    ripe.bind(document.getElementById("frame-0"), "0");
    ripe.bind(document.getElementById("frame-6"), "6");
    ripe.bind(document.getElementById("frame-top"), "top");
    ripe.addPriceCallback(function(value) {
        var price = document.getElementById("price");
        price.innerHTML = value.total.price_final + " " + value.total.currency;
    });

    ripe.load();

    var setPart = document.getElementById("set-part");
    var getPrice = document.getElementById("get-price");

    setPart.addEventListener("click", function() {
        var target = index % parts.length;
        var part = parts[target];
        ripe.setPart(part[0], part[1], part[2])
        index++;
    });

    getPrice.addEventListener("click", function() {
        ripe.getPrice(function(value) {
            alert(String(value.total.price_final) + " " + value.total.currency);
        });
    });
};
