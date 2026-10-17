# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- RSS block: choose the number of visible items and the total number of loaded items; a scrollbar shows the rest.
- RSS block: filter items by title with comma-separated terms, to include only titles containing one of them and/or exclude titles containing one of them; multi-word terms are
  matched as a whole string.

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
