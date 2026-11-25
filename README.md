# YourHouse

Starter web platform for architectural homes, villas, and modern real estate built with modular HTML5, CSS3 design tokens, lightweight i18n, and Light/Dark themes.

## Features

- **English-first i18n (`en` / `vi`)**: Loads `src/i18n/{lang}.json` via `window.AppI18n`, supports `?lang=en|vi`, persists selection to `localStorage` (`yourhouse_lang`), and updates `[data-i18n]`, `[data-i18n-placeholder]`, `[data-i18n-aria]`, and page/OG meta tags.
- **Light / Dark Theme**: Managed by `window.AppTheme`, defaults to `light`, persists to `localStorage` (`yourhouse_theme`), and sets `data-theme` early in `<head>` to prevent flash on load.
- **Extension Hooks**: Dispatches `yourhouse:langchange` and `yourhouse:themechange` events on `window` for future dynamic components.

## Project Structure

```text
src/
├── assets/
│   └── images/
│       └── favicon.svg
├── css/
│   └── style.css
├── i18n/
│   ├── en.json
│   └── vi.json
├── js/
│   ├── i18n.js
│   ├── main.js
│   └── theme.js
└── index.html
```

## Running Locally

Serve `src/` over a local HTTP server so `fetch("i18n/*.json")` works without `file://` CORS restrictions:

```bash
npx serve src
# or
python -m http.server 8000 --directory src
```
