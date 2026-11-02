## How to contribute to IKAY

Thank you for contributing! IKAY is plain HTML, CSS and JavaScript on the [LUZ](https://github.com/nandovejer/luz) design tokens: there is no build step, so what you change is what the browser runs.

## Language

English is the best language to communicate.

## Templates

Please use issue/PR templates which are inserted automatically.

## Before you open a pull request

1. Serve the repository (`python3 -m http.server 3000`) and try your change in the four looks (Auto, Light, Dark, High contrast), in Spanish, English and Arabic (right-to-left), on a narrow and a wide screen, and with the keyboard only.
2. Use LUZ tokens for colours, sizes, corners, shadows and motion (`--luz-*`). Add an `--ikay-*` custom property only for something LUZ has no token for.
3. Add every text to the three files in `assets/locales/`.
4. Run `npm install` once, then `npm run check`. It must finish with 0 blocking findings: it checks the LUZ names, the load order, the contrast of the theme in its three modes and the module preload list. If you added, moved or removed a JavaScript module, `npm run preload` rewrites that list.
5. Do not add runtime dependencies. LUZ is the only one; to update it, see "Work on IKAY" in the README.
