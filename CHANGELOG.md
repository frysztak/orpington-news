# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Article page: fixed articles not being marked as read
- Article header: break very long, single-word titles

### Added

- Collection list: refresh gesture (Pull To Refresh)
- Article page (mobile): swipe to navigate to previous/next article
- PWA: "Update available" toast
- Settings: add option to select article font size and font family (Nunito, Ubuntu, Lato, OpenDyslexic) and monospace font family (Source Code Pro, Ubuntu Mono, Fira Mono, OpenDyslexic Mono)

### Changed

- Mobile: disable browser's default Pull To Refresh behaviour

## [0.4.2] - 2022-06-17

### Fixed

- Article page: fixed flashing "If you click on an article, it'll appear here." message
- Collections: navigate to homepage when deleting currently active collection
- Collection Icon Picker: highlight currently selected icon

### Changed

- Frontend: nicer "article not found" page
- Frontend: nicer colours in Card layout for light mode
- Backend: default value for `COOKIE_SECRET` env variable

## [0.4.1] - 2022-06-15

### Fixed

- Article page: remove SVG anchors from heading components

## [0.4.0] - 2022-06-12

### Added

- Feature: Reduced Docker image size from 478 MB to 126 MB (uncompressed)
- Feature: automatically detect RSS/Atom feed from URL
- Feature: automatically detect system color mode

### Changed

- Frontend: disable SSR
- Backend: migrate to Fastify 4
- Backend: improve compatibility with certain feeds

## [0.3.0] - 2022-06-04

### Added

- `.nvmrc` file
- Collection header: added menu, allowing to mark entire collection as read on mobile
- Article page: allow to select article width (narrow, wide, unlimited)

### Changed

- Collection icon picker: increase size (of both popover and icons themselves), add tooltips

### Fixed

- Settings page: fix redirect on mobile
- PWA: clear CacheStorage on login/logout
- Article page: show 'go back' button when in mobile/tablet mode
- Panes: improve performance when opening modals
- Menu: fix disappearing shadow

## [0.2.0] - 2022-05-22

### Added

- Auto-expand parent collection when adding children to it
- Support `DB_PASS_FILE` and `COOKIE_SECRET_FILE` env variables

### Changed

- Migrated to React 18 and Chakra UI v2
- Bumped all dependencies

### Fixed

- About page: show short commit SHA
- Password page: disable form in demo mode
- Main page: fixed column width jumping on initial render
- Settings page: fix empty SSR render

## [0.1.1] - 2022-05-14

### Fixed

- Release pipelines

## [0.1.0] - 2022-05-14

### Added

- The entire app!

[unreleased]: https://github.com/frysztak/orpington-news/compare/0.4.2...HEAD
[0.4.2]: https://github.com/frysztak/orpington-news/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/frysztak/orpington-news/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/frysztak/orpington-news/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/frysztak/orpington-news/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/frysztak/orpington-news/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/frysztak/orpington-news/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/frysztak/orpington-news/compare/3a8ce08cb5a8d1f4b2b75de39ad2d1f79aaab9a6...0.1.0
