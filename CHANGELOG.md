# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Add `localeToNative`, `localeToNativeP`, `localeToNativeB` and `localeToNativeBP` methods to convert locale sizes to native sizes and unit tests - [#4638](https://github.com/ripe-tech/ripe-core/issues/4638)
* Add `Invoice Rules` API methods - [peri-invoicing/#3](https://github.com/ripe-tech/peri-invoicing/issues/3)
* Add `textLengthP` and `textLength` to get the length of the value of the initials

### Changed

* Made the `initialsBuilder` function `async` to support async calls in external initials builder logic
* Added `ctx` to `initialsBuilder` call so that there is parity between the Javascript and Python initials builders

### Fixed

*

## [2.11.0] - 2021-12-03

### Added

* Add `Bulk Order` API methods - [ripe-util-vue/#218](https://github.com/ripe-tech/ripe-util-vue/issues/218)

## [2.10.0] - 2021-11-19

### Added

* Add `setProofOfDeliveryP` and `setProofOfDelivery` methods to set proof of delivery info of an order - [#34](https://github.com/ripe-tech/peri-shipping/issues/34)
* Add `createReturnWaybillOrder` as part of the Order API

## [2.9.0] - 2021-11-12

### Added

* Support for `size` parameter in `_getMaskURL` request
* Add `refreshShippingOrder` and `refreshShippingOrderP` - [#260](https://github.com/ripe-tech/ripe-pulse/issues/260)
* Add `blockOrderP` and `blockOrder` methods to block an order - [#263](https://github.com/ripe-tech/ripe-pulse/issues/263)

## [2.8.0] - 2021-11-05

### Added

* Support for the `Order` touch API endpoint
* Support for `scale` in import order
* Add test `should be able to set the price` in `#importOrder()` tests

### Fixed

* Fix `price` not being correctly set in `importOrderP()`
* Problem relates with invalid `hasTag()`

## [2.7.1] - 2021-09-27

### Fixed

* `useMasks` calculation on init and usage in order to allow usage of an `undefined` value that defaults to `true`

## [2.7.0] - 2021-09-13

### Added

* Added `itertools.js` to gulpfile build files in order to be bundled
* Support for `no_masks` tag
* `getPrices` which consumes `/api/config/prices` for getting prices for several configs in a single batch call

## [2.6.0] - 2021-08-27

### Added

* `notify` option to endpoints for changing an order's status, to allow triggering notifications upon a status change

## [2.5.1] - 2021-08-26

### Fixed

* Small `terminate()` issue
* Attribute stability for the canceled preload images

## [2.5.0] - 2021-08-25

### Added

* Added `itertools.js` to gulpfile build files in order to be bundled

### Changed

* Improved performance by allowing cancelling image loading for images that are not needed (quick `setFrame` changes)
* Created structures that prevented concurrent `update()` at a `Visual` class level

### Fixed

* Issue where the `changeFrame` operation was being incorrectly canceled

## [2.4.2] - 2021-08-14

### Fixed

* Removed warnings for node.js `requireSafe()` hack under webpack

## [2.4.1] - 2021-08-09

### Fixed

* Issue related to problem in loading front mask image

## [2.4.0] - 2021-08-05

### Added

* Endpoints for creating order notes

## [2.3.1] - 2021-07-26

### Changed

* Made `requireSafe()` sa safer method allowing auto catching of import errors.

## [2.3.0] - 2021-07-26

### Changed

* When doing a configurator resize use the defined `size` option, if defined, otherwise fallsback to the old behavior of using the "binded" element's width

## [2.2.3] - 2021-07-26

### Fixed

* Use of the SDK in a react-native environment

## [2.2.2] - 2021-07-26

### Added

* Support for multiple character escaping in `escape()`
* Add method to retrieve the URL for an attachment
* Support for retry in API requests when receiving authentication related errors (eg: 403)

## [2.2.1] - 2021-06-13

### Fixed

* Addition of attachments to a specific order state (`stateCreateAttachmentOrder`) - [#230](https://github.com/ripe-tech/ripe-pulse/issues/230)

## [2.2.0] - 2021-07-06

### Added

* Ability to override `name` and `meta` for attachments - [#282](https://github.com/ripe-tech/ripe-sdk/issues/282)
* Added method to issue a create waybill command for a given order - [ripe-pulse/211](https://github.com/ripe-tech/ripe-pulse/issues/211)
* Add `rejectOrderP` and `rejectOrder` methods - [ripe-pulse/#219](https://github.com/ripe-tech/ripe-pulse/issues/219)

### Fixed

* Set order status takes relevant params from options and populates request params
* Multipart encoding extended to classes that implement `toString`
* Multipart encoding no longer sends an extra newline separator on the last field

## [2.1.0] - 2021-06-22

### Changed

* Import order method propagates shipping info
* Made image support the best file format by default

### Fixed

* Initials builder initialization when `useInitialsBuilderLogic` was `false`

## [2.0.1] - 2021-06-22

### Fixed

* Small issue fix

## [2.0.0] - 2021-06-01

### Added

* [BREAKING CHANGES] Support for dynamic `initialsBuilder` logic sourced from server side 3DB ⚠️ (requires `initialsBuilder` signature change)

## [1.26.0] - 2021-06-01

### Added

* `setTracking` method to the `Order` entity
* `setReturnTracking` method to the `Order` entity
* `setMeta` method allowing dynamic set of metadata attributes for the `Order` entity
* Method for generating an image URL from a query (`_queryToImageUrl`)

## [1.25.9] - 2021-05-24

### Added

* Transport Rule API
* `getTransportOrder` method
* `attachmentOrder` method
* `qualityAssureOrder` method

## [1.25.8] - 2021-05-14

### Added

* `getDefaultsP` - the promise based version of `getDefaults`
* `changePriority` Order API method
* `tenancyAccountMe` endpoint

### Fixed

* `lowlight` when the mouse leaves the configurator area

## [1.25.7] - 2021-04-29

### Fixed

* Take `variant` into account in update operations

## [1.25.6] - 2021-04-01

### Added

* Small changes in the code

## [1.25.5] - 2021-04-01

### Added

* Added typing for `getBuildsP`

## [1.25.4] - 2021-03-23

### Added

* Added typing for `getBuildP`

### Changed

* Fixed jsdoc by removing unused parameter

## [1.25.3] - 2021-03-03

### Added

* Added typing for native to size

## [1.25.2] - 2021-02-23

### Added

* Support for validation of SKU in API calls
* More locale utility methods

## [1.25.1] - 2021-02-22

### Changed

* Support for `count` methods added to the API level

## [1.25.0] - 2021-02-20

### Changed

* Added extra param ´override´ to `setInitials` and `setInitialsExtra`
