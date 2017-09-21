# RIPE SDK
The public SDK for usage of [ripe-core](https://github.com/ripe-tech/ripe-core).

## Getting started
As a starting point, you need to provide the base `url` as well as the `brand` and `model` of your customizable product. You may also give other options as shown below.

```
var ripe = new Ripe(url, brand, model, variant, parts, {
    currency: currency,
    country: country
});
```

After initializing the ripe library you should subscribe to the available events (`update`, `price`, `parts` and `combinations`) so you can easily respond and update your UI whenever occur changes. The combinations of a product are the complete set of options for all its parts. You should use this to populate the customization options on your UI.

```
ripe.addCombinationsCallback(function(value) {
    for (var index = 0; index < value.length; index++) {
        var triplet = value[index];
        var part = triplet[0];
        var triplets = partsMap[part] || [];
        triplets.push(triplet);
        partsMap[part] = triplets;
        parts.push(triplet);
        updateOptions(parts);
    }
});
```

On the next example you can see how to update the price of the product:

```
ripe.addPriceCallback(function(value) {
    var price = document.getElementById("price");
    price.innerHTML = value.total.price_final + " " + value.total.currency;
});
```

## Product visualization
To present a frame of the product you should use the `bind` function to automatically update an `img` element when there is a customization change. After the initial binding of the frames you should call the `load` function for the initial update.

```
ripe.bind(document.getElementById("frame-0"), "0");
ripe.bind(document.getElementById("frame-1"), "1");
ripe.bind(document.getElementById("frame-top"), "top");

ripe.load();
```

## Product customization
To retrieve the possible


You can change a part of your product by using the `setPart` function. Alternatively, all the parts can be changed at once with `setParts`

```
ripe.setPart(part, material, color);
ripe.setParts(parts);
```

## Getters
If you need to explicitly retrieve the product's customization information you can use the following methods: `getPrice`, `getCombinations`, `getDefaults`.
```
ripe.getPrice(function(value) {
    var price = document.getElementById("price");
    price.innerHTML = value.total.price_final + " " + value.total.currency;
});
```
