# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Support for multiple character escaping in `escape()`
* Add method to retrieve the url for an attachment
* Support for retry in API requests when receiving authentication related errors (eg: 403)

### Changed

*

### Fixed

*

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
