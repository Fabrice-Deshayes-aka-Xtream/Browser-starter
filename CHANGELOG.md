# Changelog

## unreleased

feats:

- RSS block:
  - choose the number of visible items and the total number of loaded items; a scrollbar shows the rest

## 1.1.0 - 2026-10-15

feats:
- RSS block: 
  - add feeds from predefined lists per language (French, English) grouped by category (news, science, technology, business, sports, culture), or add a custom feed by URL and name
  - improve view (thumbnail, favicon or nothing)
  - fix text cut if no space to wrap line on r
- Settings: 
  - allow workspace import/export, remove whole config import/export
  - improve GUI 
- Docs: update screenshots & README.md


## 1.0.0 - 2026-10-10

First release.

- Search bar with multiple engines: default ones can be added, removed and reordered in edit mode; custom engines supported; favicons shown in a theme-aware bubble
- Workspaces: several independent configurations (search engines, layout), switcher at top left, managed in settings, last workspace restored on startup
- Free layout: configurable columns and blocks, view and edit modes, blocks fit their content
- Blocks: bookmarks (list or tiles, favicon detection, custom icons), weather (Open-Meteo), RSS/Atom feeds (with optional block title)
- Searches, bookmarks and feed items open in a new tab
- Local persistence, JSON import/export of all workspaces, light/dark themes, English and French
- About dialog with author, version, links and open source components
- Browser extension for Chromium-based browsers and Firefox (Manifest V3)