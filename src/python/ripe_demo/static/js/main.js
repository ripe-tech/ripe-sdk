window.onload = function() {
    var ripe = new Ripe("https://www.my-swear.com/", "vyner", {}, {
        currency: "EUR",
        country: "PT"
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
            alert(result.total.price_final);
        });
    });
};
