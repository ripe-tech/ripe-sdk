# RIPE SDK

The public SDK for [RIPE Core](https://github.com/ripe-tech/ripe-core).

## Initialization
As a starting point, you need to provide the base `url` of the server where the product is configured, as well as the `brand` and `model` of your customizable product.
You may also pass an `options` map to override parameters like `currency` and `country`, which are 'EUR' and 'US' respectively by default.

```javascript
var ripe = new Ripe(url, brand, model, variant, frames, {
    currency: currency,
    country: country
});
```

## Events
After initializing the ripe library you should subscribe to the available events (`update`, `price`, `parts` and `combinations`) so you can easily respond and update your UI. You may also subscribe to events of parts being highlighted (`highlighted_part`), selected (`selected_part`) or frames being changed (`changed_frame`).
Check all the available events and related subscription/unsubscription method calls [here](#events-list).

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

### Parts
Notifies you when any part was highlighted.

```javascript
ripe.addHighlightedPartCallback(function(part) {
    part === "lining" && view("top");
});
```

Same when some part was selected.

```javascript
ripe.addSelectedPartCallback(function(part) {
    part && showMaterialsPicker(part);
});
```

### Frame
Triggered whenever there is a frame change.

```javascript
ripe.addChangedFrameCallback(function(frame) {
    frame === "top" && disableButton("top-view-button");
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

This element can call the following methods:

| Method | Params | Description |
| --- | --- | --- |
| `changeFrame` | <ul><li>`frame` *(number ([0...n]) or string (named frame)*</li><li>`animate` *[optional] (boolean), animation state. "True" by default*</li><li>`step` *[optional] (number ([0...n])), number of frames it iterates on each transition. "1" by default*</li><li>`interval` *[optional] (number ([0...n])), the duration, in milliseconds, of each transition between frames. 100ms by default*</li><li>`preventDrag` *[optional] (boolean), it allows to prevent drag actions during an animated change of frames. "True" by default*</li><li> `callback` *[optional] (string), named function expression to use as a callback function*</li></ul> | displays a frame you pass by, with or without animation. If animated, it will gradually display `step` frames from the current one, taking `interval` milliseconds |
| `highlightPart`| <ul><li>`part` *(string), named part*</li></ul> | highlights a part |
| `lowlightPart` | <ul><li>`part` *(string), named part*</li></ul> | lowlights a part |
| `selectPart` | <ul><li>`part` *(string), named part*</li></ul> | selects a part |
| `resize` | <ul><li>`size` *(number ([0...n])), new size value in px*</li></ul> | sets the current frame size to a new given value |
| `fullscreen` | | sets the frame to the maximum allowed size value (`options.maxSize`) |
| `exitFullscreen` | | sets the frame size to the initial value (`options.size`) |

### Appendix

## Options
| Name | Type | Description |
| --- | --- | --- |
| `backgroundColor` | *string* | RGB format color value of the background, with no need to pass the "#" signal. No background by default. Example: "cccccc" |
| `country` | *string* | Two letters standard country codes defined in *ISO 3166-1 alpha-2* codes. "US" by default. Example: "PT" |
| `currency` | *string* | Standard currency codes defined in *ISO 4217* codes. "USD" by default. Example: "EUR" |
| `engraving` | *string* | Material name of the engraved object. Example: "metal" |
| `format` | *string* | One of the valid image formats: 'jpeg', 'webp', 'sgi' or 'png' |
| `frames` | *array of strings* | All the frames to be used in the customization. Example: ["top", "bottom", "1", "2"] |
| `maxSize` | *number* | Maximum value for frame image size. 1000px by default |
| `noCombinations` | *boolean* | Defines if the combinations are loaded or not. False (loading) by default |
| `noDefaults` | *boolean* | Defines if the defaults are loaded or not. False (loading) by default |
| `parts` | *JSON Object* | Defines the product parts. Each key is a part's name built with color and material information. Example: `var parts = { "sole": { "material": "nappa", "color": "white" }, ... }` |
| `sensitivity` | *string* | Defines the degree of sensitivity of the dragging interaction. 40 by default. |
| `size` | *number* | Initial size value of a frame image that is going to be composed. By default is 1000px |
| `target` | *HTML <img> element* | Target image element that will be updated when a customization change happens |
| `useChain` | *boolean* | Determines if a chain based loading should be used for the pre-loading process of the various image resources to be loaded. False by default. |

## Events list
| Name | Subscription | Unsubscription |
| `update` | addUpdateCallback(calback){...} | removeUpdateCallback(calback){...} |
| `price` | addPriceCallback(calback){...} | removePriceCallback(calback){...} |
| `combinations` | addCombinationsCallback(calback){...} | removeCombinationsCallback(calback){...} |
| `highlighted_part` | addHighlightedPartCallback(calback){...} | removeHighlightedPartCallback(calback){...} |
| `selected_part` | addSelectedPartCallback(calback){...} | removeSelectedPartCallback(calback){...} |
| `changed_frame` | addChangedFrameCallback(calback){...} | removeChangedFrameCallback(calback){...} |

## License

RIPE SDK is currently licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).
