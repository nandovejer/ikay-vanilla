# Icons

Monochrome SVGs, painted as masks with the colour of the text (see `assets/css/objects/icon.css`).

| Icons | Source | Licence |
| --- | --- | --- |
| `menu` `close` `info` `warning` `sun` `moon` `theme-auto` `contrast` `location` `timezone` `contact` `repo` `os` `canvas` | The icon set of [LUZ](https://github.com/nandovejer/luz) (`menu`, `close`, `info`, `warning`, `sun`, `moon`, `auto`, `contrast`, `map-pin`, `clock`, `mail`, `git-branch`, `app` and `feather`) | MIT, see `assets/vendor/luz/LICENSE` |
| `fingerprint` `project` `connection` `hardware` `battery` `incognito` `behaviour` `share` `bolt` `shield-check` `pending` | Drawn for IKAY on the LUZ grid: 24 × 24, stroke 1.5, round caps and joins | MIT, like the rest of the repository |
| `facebook` `twitter` `linkedin` `whatsapp` `reddit` | [Bootstrap Icons](https://github.com/twbs/icons) 1.11.3 (`facebook`, `twitter-x`, `linkedin`, `whatsapp`, `reddit`), scaled to the same margin | MIT, see `assets/vendor/bootstrap-icons/LICENSE` |

The brand marks belong to their owners and are used only to name the network a share button opens.

To add an icon: draw it on the same grid, save it here and add one line to `--ikay-icon-*` in `assets/css/settings/variables.css` and one class to `icon.css`.
