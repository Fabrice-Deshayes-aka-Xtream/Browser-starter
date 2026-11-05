# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Bookmarks, weather and today blocks now have a minimum width of 250px, and news blocks 350px: columns containing them can no longer be shrunk below it, by resizing a column or
  the window.
- Today block: events get an emoji picked from French/English keywords in their title (option "icon for each event").

### Changed

- Today block: the clock now refreshes every second (was 15 s) and calendar events every 5 minutes (was 15 minutes).

## [1.3.2] - 2026-11-01

### Changed

- Minimum required Node.js version is now 24.19.2 (`engines` in `package.json`, enforced through `engine-strict` in `.npmrc`).
- Updated dependencies:
    - `pinia` 4.0.3 → 4.1.0
    - `simple-icons` 16.34.0 → 16.36.0
    - `tldts` 7.4.18 → 7.4.19
    - `vue` 3.5.43 → 3.5.44
    - `vue-i18n` 11.4.14 → 11.4.17
    - `@playwright/test` 1.64.0 → 1.64.1 (dev)
    - `@types/chrome` 0.3.5 → 0.3.7 (dev)
    - `eslint-plugin-oxlint` 1.82.0 → 1.90.0 (dev)
    - `eslint-plugin-vue` 10.11.1 → 10.12.0 (dev)
    - `jsdom` 30.1.2 → 30.1.3 (dev)
    - `npm-run-all2` 9.0.3 → 9.0.4 (dev)
    - `oxlint` 1.82.0 → 1.90.0 (dev)
    - `prettier` 3.9.6 → 3.9.10 (dev)
    - `vite` 8.3.4 → 8.3.5 (dev)
    - `vitest` 4.1.12 → 5.0.5 (dev)
    - `vue-tsc` 3.3.13 → 3.3.14 (dev)

## [1.3.1] - 2026-11-01

### Added

- The extension tab now shows the extension icon as its favicon.
- update README.md screenshots to match the current version.

## [1.3.0] - 2026-10-20

### Added

- Weather block: option to follow the browser position (with the chosen city as fallback), the place being named with OpenStreetMap Nominatim. Adds the `geolocation` permission.
- Weather block: "rain in the next hour" grid (4 × 15 min, colored by rain intensity with a legend) and sunrise/sunset times with the moon phase, both enabled
  in the block settings.
- Weather block: the wind is shown with its direction.

### Changed

- Weather block: the current conditions now also show the feels-like temperature next to the actual one.
- Weather block: the number of forecast days is no longer a setting; as many days as fit the block width are shown (up to 15).

## [1.2.0] - 2026-10-17

### Added

- "Today" block: several iCal calendars can be added (custom URLs, with an optional name, like RSS feeds); the next N events are merged across all calendars. Existing single-URL
  configurations are migrated automatically.
- On-disk caches are cleaned at startup: entries of feeds, cities and calendars no longer used by any block are removed, as well as RSS site favicons not refreshed for 30 days.
- RSS and "Today" blocks: the last loaded feed items and calendar events are cached on disk and shown instantly (also offline) when opening a tab or the browser, then updated once
  the
  network request completes. Site favicons of the RSS block are also stored (refreshed weekly).
- RSS block: the refresh frequency is configurable in the block settings (default 15 minutes).
- Weather block: the refresh frequency is configurable in the block settings (default 30 minutes), and the date of the last update is displayed.
- Weather block: the last loaded forecast is cached and shown when offline (including after restarting the browser); it is refreshed whenever the network is available.
- "Today" block: shows the date, the local time and optional extra clocks for other time zones, and the next N events (default 5) of an iCal calendar URL; each part can be toggled
  in the block settings.
- RSS block: choose the number of visible items and the total number of loaded items; a scrollbar shows the rest.
- RSS block: filter items by title with comma-separated terms, to include only titles containing one of them and/or exclude titles containing one of them; multi-word terms are
  matched as a whole string.

### Changed

- Weather block: larger weather icons in the daily forecast.

## [1.1.0] - 2026-10-15

### Added

- RSS block: add feeds from predefined lists per language (French, English), grouped by category (news, science, technology, business, sports, culture), or add a custom feed by URL
  and name.
- Settings: workspace import/export.

### Changed

- RSS block: improved item view (thumbnail, favicon or nothing).
- Settings: improved GUI.
- Docs: updated screenshots and README.

### Removed

- Settings: whole-configuration import/export (replaced by workspace import/export).

### Fixed

- RSS block: text no longer cut off when there is no space to wrap the line.

## [1.0.0] - 2026-10-10

First release.

### Added

- Search bar with multiple engines: default ones can be added, removed and reordered in edit mode; custom engines supported; favicons shown in a theme-aware bubble.
- Workspaces: several independent configurations (search engines, layout), switcher at top left, managed in settings, last workspace restored on startup.
- Free layout: configurable columns and blocks, view and edit modes, blocks fit their content.
- Blocks: bookmarks (list or tiles, favicon detection, custom icons), weather (Open-Meteo), RSS/Atom feeds (with optional block title).
- Searches, bookmarks and feed items open in a new tab.
- Local persistence, JSON import/export of all workspaces, light/dark themes, English and French.
- About dialog with author, version, links and open source components.
- Browser extension for Chromium-based browsers and Firefox (Manifest V3).
