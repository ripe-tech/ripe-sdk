# RIPE SDK

The public SDK for [RIPE Core](https://github.com/ripe-tech/ripe-core).

## 1. Initialization
As a starting point, you need to provide the `brand` and `model` of your customizable product.
You may also pass an [`options`](#options) map to override parameters like the base `url` of the server where the product is configured, as well as `currency` and `country`, which are 'EUR' and 'US' respectively by default.

```javascript
var ripe = new Ripe(brand, model, {
        variant: variant,
        url: url,
        currency: currency,
        country: country
    });
```

## 2. Events
<!-- After initializing the ripe library you should subscribe to the available events (`update`, `price` and `combinations`) so you can easily respond and update your UI. You may also subscribe to events of parts being highlighted (`highlighted_part`), selected (`selected_part`) or frames being changed (`changed_frame`).
Check all the available events and related subscription/unsubscription method calls [here](#events-list). -->
After initializing the ripe library you should subscribe to the available events so you can easily respond and update your UI. You may also subscribe to events of frames being changed (`changed_frame`).

### Update
Triggered whenever there is a customization change.

```javascript
ripe.bind("update", function() {
   updateUI();
});
```

### Price
Notifies you when the price of the customization changes.

```javascript
ripe.bind("price", function(value) {
    var price = document.getElementById("price");
    price.innerHTML = value.total.price_final + " " + value.total.currency;
});
```

### Combinations
Called when the possible customization combinations of the product are loaded. Each combination is a triplet formed by `part`, `material` and `color`. You should use this to populate the customization options on your UI.

```javascript
ripe.bind("combinations", function(value) {
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
<!-- Notifies you when any part was highlighted.

```javascript
ripe.addHighlightedPartCallback(function(part) {
    part === "lining" && view("top");
});
```

Triggered when some part was selected.

```javascript
ripe.addSelectedPartCallback(function(part) {
    part && showMaterialsPicker(part);
});
``` -->

### Frames
Triggered whenever there is a frame change.

```javascript
configurator.bind("changed_frame", function(frame) {
    frame === "top" && disableButton("top-view-button");
});
```

## 3. Product visualization
Usually the product has 24 lateral frames, plus a top and bottom view.
To present any frame of the product you can use the `bindImage` function to automatically update an `<img>` element when there is a customization change.
After the initial binding of the frames you should call the `load` function for the initial update.

```javascript
var image = ripe.bindImage(document.getElementById("frame-0"), {
    frame: "0"
});

ripe.load();
```

## 4. Product customization
You can change a part of your product by using the `setPart` function.
Alternatively, all the parts can be changed at once with `setParts` method.

```javascript
ripe.setPart(part, material, color);
ripe.setParts(parts);
```

### Getters
If you need to explicitly retrieve the product's customization information you can use the following methods:

- `getPrice`: to get the product's pricing information.
- `getCombinations`: to get all the customization options for products without any restrictions applied.
- `getDefaults`: to get the product's default customization.

Next, the example of how to get the price of the customizable product.
```javascript
ripe.getPrice(function(value) {
    var price = document.getElementById("price");
    price.innerHTML = value.total.price_final + " " + value.total.currency;
});
```

## 5. Product interaction
To provide an interactive product visualization you simply need to pass a `<div>` element to the method `bindConfigurator`.

```javascript
// get the DOM element and bind the configurator
var element = document.getElementById("config");
var configurator = ripe.bindConfigurator(element, {});

// bind the 'loaded' event
configurator.bind("loaded", function() {
    // code example
    showCustomizationPickers();
});
```

This element supports the following methods:

| Method | Params | Description |
| --- | --- | --- |
| `changeFrame` | <ul><li>`frame` *(number or string (named frame)*</li><li>`animate` *[optional] (boolean), if the transition should be animated, from the current frame to the frame provided. "True" by default*</li><li>`step` *[optional] (number), number of frames it iterates on each transition. "1" by default*</li><li>`interval` *[optional] (number), the duration, in milliseconds, of each transition between frames. 100ms by default*</li><li>`preventDrag` *[optional] (boolean), if drag actions during an animated change of frames should be ignored. "True" by default*</li><li> `callback` *[optional] (string), function to be called when the transition finishes*</li></ul> | displays a frame you pass by, with or without animation. If animated, it will gradually display `step` frames from the current one, taking `interval` milliseconds |
| `highlightPart`| <ul><li>`part` *(string), named part*</li></ul> | highlights a part |
| `lowlightPart` | <ul><li>`part` *(string), named part*</li></ul> | lowlights a part |
| `selectPart` | <ul><li>`part` *(string), named part*</li></ul> | selects a part |
| `resize` | <ul><li>`size` *(number), new size value in px*</li></ul> | sets the current frame size to a new given value |
| `fullscreen` | | sets the frame to the maximum allowed size value (`options.maxSize`) |
| `exitFullscreen` | | sets the frame size to the initial value (`options.size`) |

## Appendix

### Options
| Name | Type | Description |
| --- | --- | --- |
<!-- | `backgroundColor` | *string* | RGB format color value of the background, with no need to pass the "#" signal. No background by default. Example: "cccccc" | -->
| `country` | *string* | Two letters standard country codes defined in *ISO 3166-1 alpha-2* codes. "US" by default. Example: "PT" |
| `currency` | *string* | Standard currency codes defined in *ISO 4217* codes. "USD" by default. Example: "EUR" |
<!-- | `engraving` | *string* | Material name of the engraved object. Example: "metal" | -->
<!-- | `format` | *string* | One of the valid image formats: 'jpeg', 'webp', 'sgi' or 'png' | -->
| `duration` |  |  |
<!-- | `frame` |  |  | -->
| `frames` | *array of strings* | All the frames to be used in the customization. Example: ["top", "bottom", "1", "2"] |
| `maxSize` | *number* | Maximum value for frame image size. 1000px by default |
| `noCombinations` | *boolean* | Defines if the combinations are loaded or not. False (loading) by default |
| `noDefaults` | *boolean* | Defines if the defaults are loaded or not. False (loading) by default |
| `parts` | *JSON Object* | Defines the product parts. Each key is a part's name built with color and material information. Example: `var parts = { "sole": { "material": "nappa", "color": "white" }, ... }` |
| `sensitivity` | *string* | Defines the degree of sensitivity of the dragging interaction. 40 by default. |
| `size` | *number* | Initial size value of a frame image that is going to be composed. By default is 1000px |
<!-- | `target` | *HTML <img> element* | Target image element that will be updated when a customization change happens | -->
| `url` | *string* | The base `url` of the server where the product is configured |
| `useChain` | *boolean* | Determines if a chain based loading should be used for the pre-loading process of the various image resources to be loaded. False by default. |
| `variant` | *string* |  |

### Events list
| Name | Subscription | Unsubscription |
| --- | --- | --- |
| `update` | `ripe.bind("update", calback);` | `ripe.unbind("update", calback);` |
| `price` | `ripe.bind("price", calback);` | `ripe.unbind("price", calback);` |
| `combinations` | `ripe.bind("combinations", calback);` | `ripe.unbind("combinations", calback);` |
<!-- | `highlighted_part` | `addHighlightedPartCallback(calback){...}` | `removeHighlightedPartCallback(calback){...}` | -->
<!-- | `selected_part` | `addSelectedPartCallback(calback){...}` | `removeSelectedPartCallback(calback){...}` | -->
| `changed_frame` | `configurator.bind("changed_frame", calback){...}` | `configurator.unbind("changed_frame", calback);` |

## License

RIPE SDK is currently licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).
