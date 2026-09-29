# Browser fingerprint

## Disclaimer

Este repositorio tiene ya cierto tiempo; lo mantengo casi en su estado original porque me gusta ver cómo hemos evolucionado generando código a mano.

Esta es la versión **vanilla**: la misma IKAY de siempre, modernizada con HTML, CSS y JavaScript nativos. Sin npm, sin bundler, sin preprocesadores, sin dependencias.

Hi, I'm Nando Muñoz, IKAY is a tool that you can visualize, identify and manage your fingerprint. I will show you a dashboard with part of the information that you deliver to a website, every time you access by your browser.

![Repo IKAY image](assets/images/repo.jpg)

DEMO: https://nandovejer.github.io/ikay/

## Run it

There is nothing to install or build. The browser runs the repository as it is; you only need a static server, because ES modules do not load from `file://`.

```sh
$ python3 -m http.server 3000
```

Open http://localhost:3000. Any other static server works as well, for example `npx serve` or the VS Code _Live Server_ extension.

### Publish on GitHub Pages

_Settings → Pages → Build and deployment → Deploy from a branch_, pick the branch and the `/ (root)` folder. No build and no workflow: the repository is the website. The empty `.nojekyll` file tells GitHub Pages to serve the files as they are, without Jekyll.

## Project structure

```
.
├── index.html            # page skeleton + every <template>
├── favicon.ico
├── .nojekyll             # GitHub Pages: serve files as they are
└── assets/
    ├── css/
    │   ├── app.css       # entry point, @imports in ITCSS order
    │   ├── settings/     # custom properties (former SCSS variables)
    │   ├── generic/      # normalize + reset
    │   ├── elements/     # bare html elements
    │   ├── objects/      # icons
    │   ├── components/   # card, modal, battery, nav, share
    │   └── sections/     # header, main, footer, loading page
    ├── js/
    │   ├── app.js        # entry point (<script type="module">)
    │   ├── i18n.js       # translations: t(), data-i18n, Intl
    │   ├── modules/      # UI: templates, modal, cards, menu, share, storage…
    │   └── webapi/       # one module per piece of data read from the browser
    ├── locales/          # one JSON per language
    └── images/
```

## What IKAY shows

Everything below is read **without asking for any permission**: it is what any website gets from a browser with its default settings. Each card has a "?" button that explains the data.

| Section             | Data                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Your ID             | A hash that mixes every stable piece of data: an identifier that survives cookies and incognito |
| Geolocation         | City, country and map from your IP (ipapi.co)                                                 |
| General information | Device, screen, orientation, dark mode, language, your previous visits                        |
| Your environment    | Time zone (compared with your IP's: VPN hint), regional formats, window and screen details, accessibility preferences, pointer type, keyboard layout |
| Software            | Operating system and browser                                                                  |
| Connection          | Download speed, internet provider, IP                                                         |
| Hardware            | RAM, CPU cores and architecture, GPU (WebGL and WebGPU)                                       |
| Battery             | Level, charging state and times                                                               |
| Active fingerprints | Canvas, audio, installed fonts, speech voices                                                 |
| Privacy             | Incognito detection, ad blocker, Do Not Track / GPC and other flags, how you arrived          |
| Behaviour           | Live mouse trail, clicks, scroll, keys, tab switches and time on page (never stored)          |

### Adding a card

1. Write a detector in `assets/js/webapi/` that returns `{ value, detail?, list?, fingerprint? }` (see `webapi.js`).
2. Register it in `DETECTORS` in `webapi.js` and add its type to a `data-cards` section in `index.html`.
3. Add `{type}.title` and `{type}.modalinfo` to every JSON in `assets/locales/`, and an icon in `assets/images/svg/` plus its `.iconbg-{type}` class.

## What changed from the original

| Before                                   | Now                                                           |
| ---------------------------------------- | ------------------------------------------------------------- |
| Webpack + Babel + BrowserSync            | Native ES modules, no build step                              |
| SCSS (variables, mixins, `@extend`)      | CSS custom properties and native nesting                      |
| HTML inside JS template strings          | `<template>` elements in `index.html`, cloned with `cloneNode` |
| `import en from "./en.json"` (bundler)   | `fetch` + top-level `await`, only the active language         |
| `ua-parser-js`                           | Own parser: User-Agent Client Hints, `userAgent` as fallback   |
| Build output in `docs/`, sources in `src/` | One tree: the repository root is the website                 |
| `XMLHttpRequest` and callbacks           | `fetch`, `async/await`, `Promise.allSettled`                  |
| ESLint, Stylelint, Travis CI             | Removed                                                       |

## Translations (i18n)

Texts live in `assets/locales/{lang}.json`. The templates ask for them declaratively:

```html
<span data-i18n="header.location"></span>                   <!-- textContent -->
<div data-i18n-html="main.intro.content1"></div>            <!-- innerHTML -->
<button data-i18n-attr="title:main.cardmore"></button>      <!-- attributes -->
```

From JavaScript, use `t()`; `{0}`, `{1}`… are replaced by the extra arguments:

```js
import { t } from "../i18n.js";

t("global.shareIn", "twitter"); // "Share on twitter"
```

The language is the one chosen in the menu (saved in `localStorage`) or else the first of `navigator.languages` that we support. `Intl` does the rest: `Intl.DisplayNames` names each language in its own language for the menu, and `Intl.Locale` gives the text direction (`rtl` for Arabic).

**Add a language:** copy `en.json` to `xx.json`, translate it and add `"xx"` to `LANGS` in `assets/js/i18n.js`.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari: ES modules, top-level `await` and CSS nesting.
