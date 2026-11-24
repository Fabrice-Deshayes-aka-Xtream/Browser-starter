# Browser starter

A customizable start page / new tab for your browser: a multi-engine search bar and a free-form layout of columns and blocks.
Compatible with chromium-based browsers (Chrome, Edge, Vivaldi, Brave...).
Everything is stored locally; no account, no server, no ads.
Open source, MIT license. See [PRIVACY.md](PRIVACY.md) for details.

## Features

- **Search bar** – multi-engine search bar. Default is the one defined in your browser configuration. Changing search engine in Browser Starter will not change your browser 
  default engine configuration. 
- **Customizable layout** – any number of columns (1–8), resizable widths, blocks you can reorder, move between columns. View mode by default, edit mode on demand.
- **Blocks**
  - *Bookmarks*: titled groups of links, automatic favicon or your own uploaded icon, drag to reorder.
  - *Weather*: current conditions and forecast for a city ([Open-Meteo](https://open-meteo.com/), no API key). Optional (block settings): use the browser position (asks for
    permission; the place is
    named with [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/), the chosen city being the fallback), rain in the next hour (4 × 15 min grid, colored by intensity)
    and sunrise/sunset (as a sentence)
    with the moon phase.
  - *News*: mix several RSS/Atom feeds of your choice in a single merged view, choose how many items to display, with thumbnails, favicons or nothing. Add feeds from predefined
    lists per language (French, English) grouped by category (news, science, technology, business, sports, culture), or add a custom feed by URL and name.
  - *Today*: the date, the local time and optional extra clocks for other time zones, and the next events of one or several iCal calendars (custom URLs, optional name) merged
    together, with an optional emoji per event. Each part can be toggled, and the number of events is configurable.
- **Workspaces** – create as many workspaces as you like, each with its own layout and blocks, e.g. one start page for home and another for work.
- **Backup** – export/import each workspace as JSON.
- **Local cache** – to speed up the page display, avoid useless requests and allow offline display, all data coming from the internet (RSS feeds, weather, calendar...) is cached
  locally until its next refresh.
- Light, dark or automatic theme; English and French.

## Screenshots

### Overview
![Overview](docs/screenshots/overview.png)

The start page in view mode: search bar, and your columns of bookmarks, weather and news blocks.

### Edit mode
![Edit mode](docs/screenshots/overview-edit-mode.png)

Edit mode lets you reorder blocks, move them between columns and resize columns and blocks.

### Adding a block
![Add a block](docs/screenshots/add_block.png)

Add a bookmarks, weather or news block to any column.

### Settings
![Settings](docs/screenshots/settings.png)

Configure theme, language and workspaces.

### About
![About](docs/screenshots/about.png)

Version information and project links.

## Install

Download the latest zip from the releases page, or build it yourself:

```bash
npm install
npm run build:extension
```

**Chrome / Edge / Vivaldi / Brave**: open `chrome://extensions` (or `edge://extensions`, `vivaldi://extensions`), enable developer mode, "Load unpacked" and select
`build/chromium`.

This extension replaces your browser home page.

## Development

```bash
npm run dev        # dev server (data kept in localStorage)
npm test           # unit tests
npm run lint
npm run type-check
npm run build:extension
```

Requires Node.js `>=26.13.0` (see `.nvmrc`). See [CONTRIBUTING.md](CONTRIBUTING.md) and [PRIVACY.md](PRIVACY.md).

## Stack

Vue 3, TypeScript, Vite, Pinia, Zod, vue-i18n, VueUse, SortableJS, Simple Icons, tldts, Vitest, Playwright.

## Open source components and services

- [Vue](https://vuejs.org), [Pinia](https://pinia.vuejs.org), [Vue I18n](https://vue-i18n.intlify.dev), [VueUse](https://vueuse.org)
- [Zod](https://zod.dev): schema validation
- [SortableJS](https://sortablejs.github.io/Sortable): drag and drop
- [Simple Icons](https://simpleicons.org): brand logos
- [tldts](https://github.com/remusao/tldts): domain name parsing
- [Open-Meteo](https://open-meteo.com): weather and geocoding API (no API key)
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org): reverse geocoding of the browser position

## License

[MIT](LICENSE). Brand logos are trademarks of their respective owners and are used only to identify the search engines.