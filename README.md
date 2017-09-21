# RIPE SDK
The public SDK for usage of [ripe-core](https://github.com/ripe-tech/ripe-core).

## Getting started
As a starting point, you need to provide the base `url` as well as the `brand` and `model` of your customizable product. You may also give other options as shown below.

```javascript
var ripe = new Ripe(url, brand, model, variant, parts, {
    currency: currency,
    country: country
});
```

After initializing the ripe library you should subscribe to the available events (`update`, `price`, `parts` and `combinations`) so you can easily respond and update your UI whenever occur changes. The combinations of a product are the complete set of options for all its parts. You should use this to populate the customization options on your UI.

```javascript
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

```javascript
ripe.addPriceCallback(function(value) {
    var price = document.getElementById("price");
    price.innerHTML = value.total.price_final + " " + value.total.currency;
});
```

## Product visualization
Usually the product has 24 lateral frames, plus a top and bottom view.
To present a frame of the product you should use the `bindFrame` function to automatically update an `<img>` element when there is a customization change. After the initial binding of the frames you should call the `load` function for the initial update.

```javascript
ripe.bindFrame(document.getElementById("frame-0"), "0");
ripe.bindFrame(document.getElementById("frame-1"), "1");
ripe.bindFrame(document.getElementById("frame-top"), "top");

ripe.load();
```

## Product customization
To retrieve the possible


You can change a part of your product by using the `setPart` function. Alternatively, all the parts can be changed at once with `setParts`

```javascript
ripe.setPart(part, material, color);
ripe.setParts(parts);
```

## Getters
If you need to explicitly retrieve the product's customization information you can use the following methods: `getPrice`, `getCombinations`, `getDefaults`.
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
- `change_to_frame`: it displays a single frame you pass by.
    - parameter: `frame` (numeric _([0...n]) or string (named frame)
- `animate_to_frame`: it allows you to gradually display from a starting frame to another. Between each frame the animation takes `step` milliseconds.
    - parameter: `from` (numeric _([0...n]) or string), the starting frame
    - parameter: `to` (numeric _([0...n]) or string), the final frame
    - parameter: `step` (numeric _([0...n])), the duration, in milliseconds, of each transition between frames.
- `fullscreen`: sets the frame size to the maximum value.
- `exit_fullscreen` sets the frame size to the initial value.
- `highlight_part` highlights a part.
    - parameter: `part` (string), named part

Additionally, that same element may trigger the next set of events:
- `selected_part`: triggered when a part is selected.
    - parameter: `part` (string), named part
- `highlighted_part`: triggered when a part is highlighted.
    - parameter: `part` (string), named part
- `loaded`: triggered when the initial loading finishes.
