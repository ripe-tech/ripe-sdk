# RIPE SDK

The public SDK for usage of [RIPE Core](https://github.com/ripe-tech/ripe-core).

## Initialization
As a starting point, you need to provide the base `url` of the server where the product is configured, as well as the `brand` and `model` of your customizable product.
You may also pass an `options` map to override parameters like `currency` and `country`, which are 'EUR' and 'US' respectively by default.

```javascript
var ripe = new Ripe(url, brand, model, variant, parts, {
    currency: currency,
    country: country
});
```

## Events
After initializing the ripe library you should subscribe to the available events (`update`, `price`, `parts` and `combinations`) so you can easily respond and update your UI.

### Update

Triggered whenever there is a customization change.

```javascript
ripe.addUpdateCallback(function() {
    updateUI();
});
```

### Price
Notifies you when the price of the customization changes.

```javascript
ripe.addPriceCallback(function(value) {
    var price = document.getElementById("price");
    price.innerHTML = value.total.price_final + " " + value.total.currency;
});
```

### Combinations
Called when the possible customization combinations of the product are loaded. Each combination is a triplet formed by `part`, `material` and `color`. You should use this to populate the customization options on your UI.

```javascript
ripe.addCombinationsCallback(function(value) {
    for (var index = 0; index < value.length; index++) {
        var triplet = value[index];
        var part = triplet[0];
        var material = triplet[1];
        var color = triplet[2];
        addOption(part, material, color);
    }
});
```

## Product visualization
Usually the product has 24 lateral frames, plus a top and bottom view.
To present a frame of the product you can use the `bindFrame` function to automatically update an `<img>` element when there is a customization change.
After the initial binding of the frames you should call the `load` function for the initial update.

```javascript
ripe.bindFrame(document.getElementById("frame-0"), "0");
ripe.bindFrame(document.getElementById("frame-1"), "1");
ripe.bindFrame(document.getElementById("frame-top"), "top");

ripe.load();
```

## Product customization
You can change a part of your product by using the `setPart` function.
Alternatively, all the parts can be changed at once with `setParts`.

```javascript
ripe.setPart(part, material, color);
ripe.setParts(parts);
```

## Getters
If you need to explicitly retrieve the product's customization information you can use the following methods:

- `getPrice`: to get the product's pricing information.
- `getCombinations`: to get all the the available customization options for products.
- `getDefaults`: to get the product's default customization.

```javascript
ripe.getPrice(function(value) {
    var price = document.getElementById("price");
    price.innerHTML = value.total.price_final + " " + value.total.currency;
});
```

## Product interaction
To provide an interactive product visualization you simply need to pass a `<div>` element to the method `bindDrag`. You may also pass the size of the frames (1000px by default) and the maximum frame size.

```javascript
ripe.bindDrag(document.getElementById("product-container"), 640, 1000);
```

This element reacts to the following events:

| Event | Params | Description |
| --- | --- | --- |
| `change_frame` | <ul><li>`frame` *(numeric ([0...n]) or string (named frame)*</li><li>`animated` *(boolean), animation state*</li><li>`step` *[optional] (numeric ([0...n])), the duration, in milliseconds, of each transition between frames*</li></ul> | it displays a frame you pass by with or without animation. If animated, it will gradually display from the current frame to the given one, taking `step` milliseconds |
| `fullscreen` | | sets the frame size to the maximum value |
| `exit_fullscreen` | | sets the frame size to the initial value |
| `highlight_part` | <ul><li>`part` *(string), named part*</li></ul> | highlights a part |

Additionally, that same element may trigger the next set of events:

| Event | Params | Description |
| --- | --- | --- |
| `selected_part` | <ul><li>`part` *(string), named part*</li></ul> | triggered when a part is selected |
| `highlighted_part` | <ul><li>`part` *(string), named part*</li></ul> | triggered when a part is highlighted |
| `loaded` | | triggered when the initial loading finishes |
