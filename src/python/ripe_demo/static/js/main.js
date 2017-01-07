window.onload = function() {
    var element = document.getElementById("canvas");
    var url = element.dataset.url || "https://www.my-swear.com/";
    var model = element.dataset.model || "vyner";
    var currency = element.dataset.currency || "EUR";
    var country = element.dataset.country || "US";

    var ripe = new Ripe(url, model, {}, {
        currency: currency,
        country: country
    });

    ripe.bind(document.getElementById("frame-0"), "0");
    ripe.bind(document.getElementById("frame-6"), "6");
    ripe.bind(document.getElementById("frame-top"), "top");
    ripe.addPriceCallback(function(value) {
        console.info(value.total.price_final);
    });

    ripe.load();

    var setPart = document.getElementById("set-part");
    var getPrice = document.getElementById("get-price");

    setPart.addEventListener("click", function() {
        ripe.setPart("side", "suede", "navy")
    });

    getPrice.addEventListener("click", function() {
        ripe.getPrice(function(result) {
            alert(String(result.total.price_final) + " " + result.total.currency);
        });
    });
};
