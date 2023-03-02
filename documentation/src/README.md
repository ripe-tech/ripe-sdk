<h1><a href="https://tech.platforme.com">RIPE SDK</a></h1>

The public SDK for [RIPE Core](https://github.com/ripe-tech/ripe-core) written in vanilla ECMAScript v6.

## Installation

When using RIPE SDK in a web context, include it via a `<script>` tag, such as:

```html
<script type="text/javascript" src="https://sdk.platforme.com/js/ripe.min.js" />
```

When using RIPE SDK in a NPM compatible context, use as such:

```bash
npm install --save ripe-sdk
```

If using the configurator include the needed CSS tag, such as:

```html
<link rel="stylesheet" type="text/css" href="https://sdk.platforme.com/css/ripe.css">
```

## Initialization

As a starting point, you need to provide the brand and model of your customizable product. You may also pass an options map to override parameters like the base url of the server where the product is configured, as well as other [options](#options).

```js
window.ripeInstance = new Ripe({
    url: "https://ripe-core-sbx.platforme.com/api/"
});
```

## Binding a configurator

To provide an interactive product visualization you simply need to pass a <div> element to the method bindConfigurator. Subscribe to the event loaded and you will know when your configurator is loaded.

```js
window.ripeInstance.bindConfigurator(
    document.getElementById("configurator"),
    {
        width: 400,
        height: 400,
        type: "csr",
    }
);
```

## Load configuration

```js
await ripeInstance.config(brand, model, ripeOptions );
await window.ripeInstance.isReady();
```

## Set model initials

```js
ripeInstance.trigger('initials', "My initials here", null, {});
```

## Sandbox examples

#### Dummy Cube

<br> <iframe title="dummy" src="https://stackblitz.com/edit/web-platform-dvmrcb?ctl=1&embed=1&file=index.html&theme=dark" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts" loading="lazy" style="width:100%;height:400px"></iframe>

#### Dior Book Tote

<br> <iframe title="dummy" src="https://stackblitz.com/edit/web-platform-ha8gto?ctl=1&embed=1&file=script.js" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts" loading="lazy" style="width:100%;height:400px"></iframe>

## Appendix

### Options

| Name                      | Type               | Description                                                                                                                                                                                |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `backgroundColor`         | *string*           | RGB format color value of the background ( no need to pass the "#" signal ). No background by default. Example: "cccccc".                                                                  |
| `country`                 | *string*           | Two letters standard country codes defined in *ISO 3166-1 alpha-2* codes. "US" by default. Example: "PT".                                                                                  |
| `currency`                | *string*           | Standard currency codes defined in *ISO 4217* codes. "USD" by default. Example: "EUR".                                                                                                     |
| `frames`                  | *array of strings* | All the frames to be used in the customization. Example: ["top", "bottom", "1", "2"].                                                                                                      |
| `format`                  | *string*           | One of the valid image formats: 'lossless', 'lossful', 'jpeg', 'webp', 'sgi' or 'png'. "null" by default.                                                                                  |
| `maskDuration`            | *number*           | Specifies how many milliseconds the mask animation takes to complete. 150 by default.                                                                                                      |
| `maskOpacity`             | *number*           | Specifies the opacity value of the the masks used to highlight/select parts. 0.4 by default.                                                                                               |
| `maxSize`                 | *number*           | Maximum value for frame image size. 1000px by default.                                                                                                                                     |
| `noCombinations`          | *boolean*          | Defines if the combinations are loaded or not. False (loading) by default.                                                                                                                 |
| `noDefaults`              | *boolean*          | Defines if the defaults are loaded or not. False (loading) by default.                                                                                                                     |
| `noMasks`                 | *boolean*          | Used to negate the `useMasks` option.                                                                                                                                                      |
| `noPrice`                 | *boolean*          | Used to negate the `usePrice` option.                                                                                                                                                      |
| `parts`                   | *JSON Object*      | Defines the product initial parts. Each key is a part's name built with color and material information. Example: `var parts = { "sole": { "material": "nappa", "color": "white" }, ... }`. |
| `remoteCalls`             | *boolean*          | Activates the remote calls functionality executed by several workflows. True by default.                                                                                                   |
| `remoteOnConfig`          | *boolean*          | Activates the remote execution of the model's logic on config updates. True by default.                                                                                                    |
| `remoteOnPart`            | *boolean*          | Activates the remote execution of the model's logic on parts updates. True by default.                                                                                                     |
| `remoteOnInitials`        | *boolean*          | Activates the remote execution of the model's logic on initials updates. True by default.                                                                                                  |
| `sensitivity`             | *string*           | Defines the degree of sensitivity of the dragging interaction. 40 by default.                                                                                                              |
| `size`                    | *number*           | Initial size value of a frame image that is going to be composed. By default it's 1000px.                                                                                                  |
| `url`                     | *string*           | The base `url` of the server where the product is configured.                                                                                                                              |
| `variant`                 | *string*           | Variant of the customizable product.                                                                                                                                                       |
| `version`                 | *string*           | The version of the build of the customizable product.                                                                                                                                      |
| `useChain`                | *boolean*          | Determines if a chain based loading should be used for the pre-loading process of the various image resources to be loaded. False by default.                                              |
| `useMasks`                | *boolean*          | Enables masks on selection/highlight. True by default.                                                                                                                                     |
| `usePrice`                | *boolean*          | Enables the fetch price feature every time a new part is set. True by default.                                                                                                             |
| `useSync`                 | *boolean*          | Enables the part synchronization feature. False by default.                                                                                                                                |
| `useInitialsBuilderLogic` | *boolean*          | Enables the usage of the client-side initials builder logic defined in the 3DB, instead of the default one. True by default.                                                               |

### Browser Support

Desktop:

* ≥ Chrome v23 (V8)
* ≥ Firefox v21 (SpiderMonkey)
* ≥ Safari v6 (Nitro)

Mobile:

* ≥ Android  4.4
* ≥ iOS's WebKit 9

### License

RIPE SDK is currently licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).
