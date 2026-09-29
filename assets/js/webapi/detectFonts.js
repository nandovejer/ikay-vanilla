/**
 * Installed fonts, without any permission: measure a text with each font and
 * a generic fallback. If the width changes, the font exists on your system.
 */
import { t } from "../i18n.js";

const BASES = ["monospace", "sans-serif", "serif"];
const SAMPLE = "mmmmmmmmmmlli10OQ@&WwÅ";

// Windows, macOS, Linux, Android and popular apps (Office, Adobe…)
const FONTS = [
  "Arial", "Arial Black", "Arial Narrow", "Bahnschrift", "Calibri", "Cambria",
  "Candara", "Comic Sans MS", "Consolas", "Constantia", "Corbel", "Courier New",
  "Franklin Gothic Medium", "Gabriola", "Georgia", "Impact", "Lucida Console",
  "Palatino Linotype", "Segoe UI", "Segoe Print", "Sitka Text", "Tahoma",
  "Times New Roman", "Trebuchet MS", "Verdana", "Aptos",
  "American Typewriter", "Avenir", "Avenir Next", "Baskerville", "Didot",
  "Futura", "Geneva", "Gill Sans", "Helvetica", "Helvetica Neue", "Hoefler Text",
  "Menlo", "Monaco", "Optima", "SF Pro", "SF Mono",
  "Cantarell", "DejaVu Sans", "DejaVu Serif", "Droid Sans", "Liberation Sans",
  "Liberation Mono", "Noto Sans", "Noto Serif", "Ubuntu", "Ubuntu Mono",
  "Roboto", "Open Sans", "Lato", "Montserrat", "Source Code Pro", "Fira Sans",
  "JetBrains Mono", "Cascadia Code", "Myriad Pro", "Minion Pro",
];

const detectFonts = {
  async init() {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return undefined;

    const width = (font) => {
      ctx.font = `72px ${font}`;
      return ctx.measureText(SAMPLE).width;
    };
    const base = Object.fromEntries(BASES.map((item) => [item, width(item)]));
    const found = FONTS.filter((font) =>
      BASES.some((item) => width(`"${font}", ${item}`) !== base[item])
    );

    return {
      value: t("fonts.type.count", found.length, FONTS.length),
      list: found,
      fingerprint: found.join(","),
    };
  },
};

export default detectFonts;
