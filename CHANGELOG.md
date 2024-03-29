# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.1] - 2023-08-16

### Fixed

-   Fixed Articles being unreliably marked as read

## [0.13.0] - 2023-08-11

### Added

-   Standalone Article page
-   Hotkeys
-   Previous/next Article buttons (mobile only)

### Fixed

-   Fix opening Article by URL
-   Fix previous/next Article calculations

### Removed

-   Swiping left/right on Article page

## [0.12.7] - 2023-07-14

### Added

-   Specific optimistic update for "mark all as read" operation for Collections with "unread" filter applied

### Fixed

-   Fix adding Collections without URL (#160)

### Changed

-   Update dependencies

## [0.12.6] - 2023-07-06

### Fixed

-   Fix User-Agent not always being set when fetching feeds (#149)

## [0.12.5] - 2023-07-03

### Fixed

-   Fix renaming Collections without URL (#145)
-   Fix URL validation (#149)

### Changed

-   Upgrade to Storybook 7

## [0.12.4] - 2023-06-25

### Added

-   ARM64 image

## [0.12.2] - 2023-03-27

### Fixed

-   Fix incorrect unread count being returned after refreshing collection
-   Fix session TTL not being refreshed
-   Fix API code coverage reporting incorrect numbers

### Added

-   Added `justfile`

### Changed

-   Changed from Server-Sent Events to WebSockets

## [0.12.1] - 2023-03-17

### Fixed

-   Fix HTML tags appearing in entry summary
-   Fix not being able to add Collection without URL
-   Fix parent collection items not being refetched when children were either marked as read or refreshed
-   Fix Article skeleton padding in expandable view

### Changed

-   Migrate to Next.js 13

## [0.12.0] - 2023-03-02

### Changed

-   Rewrite backend in Rust
    -   tiny Docker image, no Node.js runtime
    -   new task queue implementation
    -   more efficient feed refresh
    -   `COOKIE_SECRET` now must be at least 64 characters (if it's shorter, default value is used)
    -   dropped ARM64 image

## [0.11.1] - 2022-12-19

### Fixed

-   Fix OPML import
-   Fix missing Collection layout

## [0.11.0] - 2022-12-17

### Added

-   Performance: cache start page using service worker
-   Performance: use Tailwind for Drawer, Modal, Sidebar components
-   Respect "prefers reduced motion" setting
-   New syntax highlighter:
    -   detects language from HTML classes (rather than relying on Highlight.js' expensive language auto-detection)
    -   uses Prism.js and CSS-based styles

### Changed

-   Use Node.js 18

### Fixed

-   Fix disappearing Collections when reordering
-   Settings: fix mobile layout on some viewports

## [0.10.0] - 2022-12-04

### Added

-   Vertical panes layout
-   Expandable panes layout
-   Group by date: additional date buckets

### Changed

-   Drawer on mobile no longer takes 100% width
-   Made Article and Collection headers shorter on desktop

### Fixed

-   Icons for "Mark all as read"/"Mark as unread" are now different
-   List layout: improved scrolling performance on mobile

## [0.9.1] - 2022-11-28

### Fixed

-   Fixed crash when not using HTTPS ([#94](https://github.com/frysztak/orpington-news/issues/94))

## [0.9.0] - 2022-11-21

### Added

-   Collection item grouping (by date or by Collection)
-   Collection item sorting (newest/oldest first)

### Changed

-   Mark as read: relabel as "Mark all as read"

### Fixed

-   Fixed redundant fetching of empty collection pages
-   Mark as read: improve snappiness

## [0.8.0] - 2022-11-11

### Added

-   Collection filters (read, unread)
-   Collection item list: highlight active article
-   Collection item list: list layout
-   Article view: updated header
-   Add support for ETags, which significantly reduces collection refresh time

### Changed

-   Refactored how Home collection works internally
-   Changed collection page size to 30

### Fixed

-   Fixed missing loading state in Edit Collection modal

## [0.7.4] - 2022-10-20

### Fixed

-   Fixed changing layouts

## [0.7.3] - 2022-10-15

### Fixed

-   Fixed navigation when changing active collections on Firefox

## [0.7.2] - 2022-10-09

### Fixed

-   Improve UX of setting active collection and collapsing/expanding collections in high-latency scenarios
-   Fixed flickering when navigating to main page while not being logged-in

## [0.7.1] - 2022-10-06

### Added

-   Allow to mark Home collection as read
-   Improved UX of when marking article as read

### Changed

-   Hide article when changing active collection

### Fixed

-   Mark as read: properly refresh home collection

## [0.7.0] - 2022-09-25

### Added

-   Improved UX of when marking entire collection as read
-   Improved loading performance

### Changed

-   Migrated to React Query 4
-   Migrated to Slonik 31
-   Migrated to Jest 29
-   Migrated to TypeScript 4.8

## [0.6.4] - 2022-09-17

### Fixed

-   Fix handling of HTTP responses with `text/xml` content type
-   Fix feed detection for URLs with non-empty pathname (e.g. `https://example.com/blog`)

### Changed

-   Change default feed refresh interval to 6h
-   Collections list: increase overscan for smoother scrolling experience
-   Collection item list: show date an article was published

## [0.6.3] - 2022-08-26

### Fixed

-   Linux ARM64 build

## [0.6.2] - 2022-08-26

### Changed

-   Disable Linux ARM64 builds for now

## [0.6.1] - 2022-08-26

### Fixed

-   Linux ARM64 build

## [0.6.0] - 2022-08-26

### Added

-   Collections: implement OPML import
-   Collections: implement virtualization
-   Backend: better error logging
-   Backend: run feed updates in a separate thread
-   Backend: handle feeds in various encodings (that includes ISO-8859-2)

### Changed

-   Settings: reorganize some of the pages

## [0.5.1] - 2022-08-04

### Fixed

-   Fonts: use `latin-ext` variants
-   Card layout: fix little layout imperfection

### Changed

-   Settings sidebar: hide "Organize collections" section on mobile

## [0.5.0] - 2022-07-22

### Fixed

-   Article page: fixed articles not being marked as read
-   Article header: break very long, single-word titles

### Added

-   Collection list: refresh gesture (Pull To Refresh)
-   Article page (mobile): swipe to navigate to previous/next article
-   PWA: "Update available" toast
-   Settings: add option to select article font size and font family (Nunito, Ubuntu, Lato, OpenDyslexic) and monospace font family (Source Code Pro, Ubuntu Mono, Fira Mono, OpenDyslexic Mono)

### Changed

-   Mobile: disable browser's default Pull To Refresh behaviour

## [0.4.2] - 2022-06-17

### Fixed

-   Article page: fixed flashing "If you click on an article, it'll appear here." message
-   Collections: navigate to homepage when deleting currently active collection
-   Collection Icon Picker: highlight currently selected icon

### Changed

-   Frontend: nicer "article not found" page
-   Frontend: nicer colours in Card layout for light mode
-   Backend: default value for `COOKIE_SECRET` env variable

## [0.4.1] - 2022-06-15

### Fixed

-   Article page: remove SVG anchors from heading components

## [0.4.0] - 2022-06-12

### Added

-   Feature: Reduced Docker image size from 478 MB to 126 MB (uncompressed)
-   Feature: automatically detect RSS/Atom feed from URL
-   Feature: automatically detect system color mode

### Changed

-   Frontend: disable SSR
-   Backend: migrate to Fastify 4
-   Backend: improve compatibility with certain feeds

## [0.3.0] - 2022-06-04

### Added

-   `.nvmrc` file
-   Collection header: added menu, allowing to mark entire collection as read on mobile
-   Article page: allow to select article width (narrow, wide, unlimited)

### Changed

-   Collection icon picker: increase size (of both popover and icons themselves), add tooltips

### Fixed

-   Settings page: fix redirect on mobile
-   PWA: clear CacheStorage on login/logout
-   Article page: show 'go back' button when in mobile/tablet mode
-   Panes: improve performance when opening modals
-   Menu: fix disappearing shadow

## [0.2.0] - 2022-05-22

### Added

-   Auto-expand parent collection when adding children to it
-   Support `DB_PASS_FILE` and `COOKIE_SECRET_FILE` env variables

### Changed

-   Migrated to React 18 and Chakra UI v2
-   Bumped all dependencies

### Fixed

-   About page: show short commit SHA
-   Password page: disable form in demo mode
-   Main page: fixed column width jumping on initial render
-   Settings page: fix empty SSR render

## [0.1.1] - 2022-05-14

### Fixed

-   Release pipelines

## [0.1.0] - 2022-05-14

### Added

-   The entire app!

[Unreleased]: https://github.com/frysztak/orpington-news/compare/0.13.1...HEAD

[0.13.1]: https://github.com/frysztak/orpington-news/compare/0.13.0...0.13.1

[0.13.0]: https://github.com/frysztak/orpington-news/compare/0.12.7...0.13.0

[0.12.7]: https://github.com/frysztak/orpington-news/compare/0.12.6...0.12.7

[0.12.6]: https://github.com/frysztak/orpington-news/compare/0.12.5...0.12.6

[0.12.5]: https://github.com/frysztak/orpington-news/compare/0.12.4...0.12.5

[0.12.4]: https://github.com/frysztak/orpington-news/compare/0.12.3...0.12.4

[0.12.3]: https://github.com/frysztak/orpington-news/compare/0.12.2...0.12.3

[0.12.2]: https://github.com/frysztak/orpington-news/compare/0.12.1...0.12.2

[0.12.1]: https://github.com/frysztak/orpington-news/compare/0.12.0...0.12.1

[0.12.0]: https://github.com/frysztak/orpington-news/compare/0.11.1...0.12.0

[0.11.1]: https://github.com/frysztak/orpington-news/compare/0.11.0...0.11.1

[0.11.0]: https://github.com/frysztak/orpington-news/compare/0.10.0...0.11.0

[0.10.0]: https://github.com/frysztak/orpington-news/compare/0.9.1...0.10.0

[0.9.1]: https://github.com/frysztak/orpington-news/compare/0.9.0...0.9.1

[0.9.0]: https://github.com/frysztak/orpington-news/compare/0.8.0...0.9.0

[0.8.0]: https://github.com/frysztak/orpington-news/compare/0.7.4...0.8.0

[0.7.4]: https://github.com/frysztak/orpington-news/compare/0.7.3...0.7.4

[0.7.3]: https://github.com/frysztak/orpington-news/compare/0.7.2...0.7.3

[0.7.2]: https://github.com/frysztak/orpington-news/compare/0.7.1...0.7.2

[0.7.1]: https://github.com/frysztak/orpington-news/compare/0.7.0...0.7.1

[0.7.0]: https://github.com/frysztak/orpington-news/compare/0.6.4...0.7.0

[0.6.4]: https://github.com/frysztak/orpington-news/compare/0.6.3...0.6.4

[0.6.3]: https://github.com/frysztak/orpington-news/compare/0.6.2...0.6.3

[0.6.2]: https://github.com/frysztak/orpington-news/compare/0.6.1...0.6.2

[0.6.1]: https://github.com/frysztak/orpington-news/compare/0.6.0...0.6.1

[0.6.0]: https://github.com/frysztak/orpington-news/compare/0.5.1...0.6.0

[0.5.1]: https://github.com/frysztak/orpington-news/compare/0.5.0...0.5.1

[0.5.0]: https://github.com/frysztak/orpington-news/compare/0.4.2...0.5.0

[0.4.2]: https://github.com/frysztak/orpington-news/compare/0.4.1...0.4.2

[0.4.1]: https://github.com/frysztak/orpington-news/compare/0.4.0...0.4.1

[0.4.0]: https://github.com/frysztak/orpington-news/compare/0.3.0...0.4.0

[0.3.0]: https://github.com/frysztak/orpington-news/compare/0.2.0...0.3.0

[0.2.0]: https://github.com/frysztak/orpington-news/compare/0.1.1...0.2.0

[0.1.1]: https://github.com/frysztak/orpington-news/compare/0.1.0...0.1.1

[0.1.0]: https://github.com/frysztak/orpington-news/compare/3a8ce08cb5a8d1f4b2b75de39ad2d1f79aaab9a6...0.1.0
