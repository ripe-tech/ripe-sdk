<h1><a href="https://tech.platforme.com"><img src="res/logo.svg" alt="RIPE SDK" height="60" style="height: 60px;"></a></h1>

The public SDK for [RIPE Core](https://github.com/ripe-tech/ripe-core) written in vanilla ECMAScript v6.

## 1. Initialization

As a starting point, you need to provide the `brand` and `model` of your customizable product.
You may also pass an [`options`](#options) map to override parameters like the base `url` of the server where the product is configured, as well as `currency` and `country`, which are 'EUR' and 'US' respectively by default.

```javascript
var ripe = new Ripe({
    brand: brand,
    model: model,
    variant: variant,
    url: url,
    currency: currency,
    country: country,
    dku: dku
});
```

## 2. Events

After initializing the Ripe object you should subscribe to the available events so you can easily respond and update your UI.

### Ready

Triggered when all of the async operations related with the instance setup are complete.

```javascript
ripe.bind("ready", function() {
    doSomeStuff();
});
```

### Update

Triggered whenever there is a customization change (eg: the color of a part is changed).

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

### Config

Called when a new model configuration has been loaded. You should use this to explore the model's configuration data, ie: when populating the customization options on your UI.

```javascript
ripe.bind("config", function(config) {
    var parts = config.parts;
});
```

### Combinations

Called when the possible customization combinations of the product are loaded. Each combination is a triplet formed by `part`, `material` and `color`.

```javascript
ripe.bind("combinations", function(value) {
    for (var index = 0; index < value.length; index++) {
        var triplet = value[index];
        var part = triplet[0];
        var material = triplet[1];
        var color = triplet[2];
        // (...)
    }
});
```

### Parts

Notifies you when all the product's parts have changed.

```javascript
ripe.bind("parts", function(parts) {
    parts && showPartsPicker(parts);
});
```

You can also be notified when a part is selected.

```javascript
ripe.bind("selected_part", function(part) {
    console.log("Part selected: ", part);
});
```

### Frames

Triggered whenever there is a frame change.

```javascript
configurator.bind("changed_frame", function(frame) {
    frame === "top" && disableButton("top-view-button");
});
```

## 3. Product visualization

Usually the product has 24 lateral frames, plus a top and bottom view.
To display any frame of the product you can use the `bindImage` function to automatically update an `<img>` element. This method also contains an `options` parameter.
Subscribe to the event `loaded` and you will know when your image is loaded.
Finally, after the initial binding of the frames you should call the `load` function for the initial update.

```javascript
var element = document.getElementById("frame-0")
var image = ripe.bindImage(element, {
    frame: "side-0"
});

image.bind("loaded", function(frame) {
    console.log("frame " + frame + " loaded")
});

ripe.load();
```

Whenever you want to set a new image frame, you only have to call `setFrame` function.

```javascript
image.setFrame("side-3");
```

## 4. Product customization

You can change a part of your product by using the `setPart` function.
Alternatively, multiple parts can be changed at once with `setParts`.

```javascript
ripe.setPart(part, material, color);
ripe.setParts([
    [part, material, color],
    [part, material, color]
]);
```

To undo part changes in the product you can call the `undo` function. The method `canUndo` is also available so you can allow the undo operation based on the current changes. To reverse an `undo` operation you can use the `redo` function.

```javascript
if (ripe.canUndo()) {
    ripe.undo();
}

if (ripe.canRedo()) {
    ripe.redo();
}
```

### Getters

If you need to explicitly retrieve the product's customization information you can use the following methods:

* `getConfig`: to get information about the product's model.
* `getCombinations`: to get all the customization options for products without any restrictions applied.
* `getDefaults`: to get the product's default customization.
* `getFrames`: to get all the product's frames.
* `getPrice`: to get the product's pricing information.
* `getFactory`: to get the factory information where the model is made, specifically its name and the estimated production time in days.

These functions receive a callback function as a parameter as shown below:

```javascript
ripe.getPrice(function(value) {
    var price = document.getElementById("price");
    price.innerHTML = value.total.price_final + " " + value.total.currency;
});
```

## 5. Product personalization

To display a frame with initials you can use the bindImage function by setting the parameter `showInitials` as `true` on the options map.
The initials are set on the `Ripe` object with the `setInitials` function which accepts `initials` and `engraving` as parameters.
If your initials require a transformation to different profiles you can set a function that receives the `initials` and `engraving` parameters and transforms it into a map with initials and an array of profiles using the `setInitialsBuilder` function.

```javascript
ripe.setInitials("SW", "metal_gold");

ripe.bindImage(document.getElementById("frame-initials"), {
    showInitials: true
});
```

## 6. Product interaction

To provide an interactive product visualization you simply need to pass a `<div>` element to the method `bindConfigurator`.
Subscribe to the event `loaded` and you will know when your configurator is loaded.

This element supports the following methods:

| Method         | Params                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Description                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `changeFrame`  | <ul><li>`frame` *(string), named frame defined in the "view-position" format. Eg.: "side-0"*</li><li>`options` *(JSON object with optional fields)*:  `duration`: *(number)* total duration, in milliseconds, of the animation; `type`: *(string)* the animation style you want, which can be "simple" (fade in), "cross" (crossfade) or null (without any style)*; `preventDrag`: *(boolean)* to choose if drag actions during an animated change of frames should be ignored. "True" by default</li></ul> | displays a new frame, with an animation from the starting frame |
| `highlight`    | <ul><li>`part` *(string), named part*</li><li>`options` *(JSON object with optional fields)*</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                      | highlights a product's part                                     |
| `lowlight`     | <ul><li>`options` *(JSON object with optional fields)*</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                                            | removes any highlight from the product                          |
| `selectPart`   | <ul><li>`part` *(string), named part*</li><li>`options` *(JSON object with optional fields)*</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                      | selects a given product's part                                  |
| `deselectPart` | <ul><li>`part` *(string), named part*</li><li>`options` *(JSON object with optional fields)*</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                      | removes selection from a given product's part                   |

This element supports the following events:

| Event           | Description                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ready`         | Triggered upon first loading of the model's internal frame structure (once per model load)                                        |
| `loaded`        | Triggered when the configurator finishes loading all of the internal frames, and is ready for interaction (once per part setting) |
| `changed_frame` | Raises whenever there's a rotation in the configurator viewport (viewable frame has changed)                                       |

```javascript
var element = document.getElementById("config");
var configurator = ripe.bindConfigurator(element, {});

configurator.bind("loaded", function() {
    this.changeFrame("side-11", {
        duration: 500
    });
});
```

## 7. Plugins

### Part synchronization

If your product has synchronization rules, where a set of parts must always have the same material and color, you can use the `sync` plugin to have this behavior automatically. To do this you need to initialize the `SyncPlugin` which receives the synchronization rules and add it to the ripe object using the `addPlugin` function. When a new part is set, the plugin checks the synchronization rules and automatically makes the necessary changes to the related parts.

```javascript
ripe.getConfig(function(config) {
    var syncRules = config.sync;
    var syncPlugin = new Ripe.plugins.SyncPlugin(syncRules);
    ripe.addPlugin(syncPlugin);
});
```

### Part restrictions

To include restrictions to the customization experience the `Restrictions` plugin is available. This allow setting rules that declare that certain combinations between different parts, materials or colors are not possible. When a new option is selected, the plugin will check if any of the other parts has become restricted by the new part and change them to a valid option automatically. The usage of this plugin is similar to the `sync` plugin.
To be notified when a restriction causes parts to be changed, bind to the `restrictions` event on the plugin object. Whenever the restrictions are applied, this event will be triggered with the changes that ocurred and the part that caused them.

```javascript
ripe.getConfig(function(config) {
    var restrictionRules = config.restrictions;
    var restrictionsPlugin = new Ripe.plugins.RestrictionsPlugin(restrictionRules);
    ripe.addPlugin(restrictionsPlugin);
    restrictionsPlugin.bind("restrictions", function(changes, part) {});
});
```

## 8. Sizes

If you need to create an order using the `ripe-core` API then you have to set the size of the product according to the `ripe-core` native scale. The following methods allow you to convert from and to that scale. `scale` is a string that represents the size scale, `value` is the numeric value in that scale and `gender` is a string that can be set to `female`, `male` or `kids`.
To reduce the number of requests when you need to convert several size options you can use the bulk methods that accept an array of values and return an array with all the results.

* `sizeToNative(scale, value, gender)`
* `nativeToSize(scale, value, gender)`
* `sizeToNativeB(scales, values, genders)`
* `nativeToSizeB(scales, values, genders)`

## 9. Authentication

When using API methods that require special permissions you can use the following methods to authenticate your application: `auth(username, password, callback)`, for login with username and password, or OAuth authentication with `oauth`:

```javascript
if (ripe.isOAuthPending()) {
    ripe.oauth({
        clientId: clientId,
        clientSecret: clientSecret,
        scope: ["admin"]
    });
}
```

## Appendix

### Options

| Name               | Type               | Description                                                                                                                                                                        d       |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `backgroundColor`  | *string*           | RGB format color value of the background ( no need to pass the "#" signal ). No background by default. Example: "cccccc".                                                                  |
| `country`          | *string*           | Two letters standard country codes defined in *ISO 3166-1 alpha-2* codes. "US" by default. Example: "PT".                                                                                  |
| `currency`         | *string*           | Standard currency codes defined in *ISO 4217* codes. "USD" by default. Example: "EUR".                                                                                                     |
| `frames`           | *array of strings* | All the frames to be used in the customization. Example: ["top", "bottom", "1", "2"].                                                                                                      |
| `format`           | *string*           | One of the valid image formats: 'lossless', 'lossful', 'jpeg', 'webp', 'sgi' or 'png'. "png" by default.                                                                                   |
| `maskDuration`     | *number*           | Specifies how many milliseconds the mask animation takes to complete. 150 by default.                                                                                                      |
| `maskOpacity`      | *number*           | Specifies the opacity value of the the masks used to highlight/select parts. 0.4 by default.                                                                                               |
| `maxSize`          | *number*           | Maximum value for frame image size. 1000px by default.                                                                                                                                     |
| `noCombinations`   | *boolean*          | Defines if the combinations are loaded or not. False (loading) by default.                                                                                                                 |
| `noDefaults`       | *boolean*          | Defines if the defaults are loaded or not. False (loading) by default.                                                                                                                     |
| `noMasks`          | *boolean*          | Used to negate the `useMasks` option.                                                                                                                                                      |
| `noPrice`          | *boolean*          | Used to negate the `usePrice` option.                                                                                                                                                      |
| `parts`            | *JSON Object*      | Defines the product initial parts. Each key is a part's name built with color and material information. Example: `var parts = { "sole": { "material": "nappa", "color": "white" }, ... }`. |
| `remoteCalls`      | *boolean*          | Activates the remote calls functionality executed by several workflows. True by default.                                                                                                   |
| `remoteOnConfig`   | *boolean*          | Activates the remote execution of the model's logic on config updates. True by default.                                                                                                    |
| `remoteOnPart`     | *boolean*          | Activates the remote execution of the model's logic on parts updates. True by default.                                                                                                     |
| `remoteOnInitials` | *boolean*          | Activates the remote execution of the model's logic on initials updates. True by default.                                                                                                  |
| `sensitivity`      | *string*           | Defines the degree of sensitivity of the dragging interaction. 40 by default.                                                                                                              |
| `size`             | *number*           | Initial size value of a frame image that is going to be composed. By default it's 1000px.                                                                                                  |
| `url`              | *string*           | The base `url` of the server where the product is configured.                                                                                                                              |
| `variant`          | *string*           | Variant of the customizable product.                                                                                                                                                       |
| `version`          | *string*           | The version of the build of the customizable product.                                                                                                                                      |
| `useChain`         | *boolean*          | Determines if a chain based loading should be used for the pre-loading process of the various image resources to be loaded. False by default.                                              |
| `useMasks`         | *boolean*          | Enables masks on selection/highlight. True by default.                                                                                                                                     |
| `usePrice`         | *boolean*          | Enables the fetch price feature every time a new part is set. True by default.                                                                                                             |
| `useSync`          | *boolean*          | Enables the part synchronization feature. False by default.                                                                                                                                |

## Browser Support

Desktop:

* ≥ Chrome v23 (V8)
* ≥ Firefox v21 (SpiderMonkey)
* ≥ Safari v6 (Nitro)
* ≥ Opera v12 (V8)
* ≥ IE v11 (Chakra)

Mobile:

* ≥ Android  4.4
* ≥ iOS's WebKit 9

## Documentation

For API reference documentation follow [ripe-sdk-docs.platforme.com](https://ripe-sdk-docs.platforme.com).

## License

RIPE SDK is currently licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).

## Build Automation

[![Build Status](https://travis-ci.org/ripe-tech/ripe-sdk.svg?branch=master)](https://travis-ci.org/ripe-tech/ripe-sdk)
[![Build Status GitHub](https://github.com/ripe-tech/ripe-sdk/workflows/Main%20Workflow/badge.svg)](https://github.com/ripe-tech/ripe-sdk/actions)
[![npm Status](https://img.shields.io/npm/v/ripe-sdk.svg)](https://www.npmjs.com/package/ripe-sdk)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/)
