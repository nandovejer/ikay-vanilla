/**
 * Theme: Auto (follows the system) · Light · Dark · High contrast.
 * - <html data-theme="ikay"> is the LUZ theme; <html data-mode="light|dark">
 *   is the colour mode in use. In Auto, the mode is the system's
 *   (prefers-contrast: more, then prefers-color-scheme), and it follows the
 *   system while the page is open.
 * - The choice is kept in localStorage ("ikay-theme"); a tiny inline script
 *   in <head> applies the mode before the first paint.
 * - The "Dark mode" card keeps reading the SYSTEM preference, on purpose.
 */
import template from "./template.js";
import storage from "./storage.js";
import { t } from "../i18n.js";

const MODES = ["auto", "light", "dark", "high-contrast"];
const ICONS = { auto: "theme-auto", light: "sun", dark: "moon", "high-contrast": "contrast" };
/* paper colour of each theme, for the browser chrome */
const CHROME = { light: "#f8f4ec", dark: "#1a1712", "high-contrast": "#ffffff" };

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const current = () => {
  const saved = storage.get("theme");
  return MODES.includes(saved) ? saved : "auto";
};

const systemDark = matchMedia("(prefers-color-scheme: dark)");
const systemContrast = matchMedia("(prefers-contrast: more)");
/** The colour mode to paint: the choice, or else the system's */
const resolve = (mode) => {
  if (mode !== "auto") return mode;
  if (systemContrast.matches) return "high-contrast";
  return systemDark.matches ? "dark" : "light";
};

const theme = {
  init() {
    const cycle = document.querySelector(".js-theme-cycle");
    const options = document.querySelector(".js-theme-options");

    options?.replaceChildren(
      ...MODES.map((mode) => {
        const button = template("tpl-theme-btn").firstElementChild;
        button.dataset.choice = mode;
        button.querySelector(".iconbg").classList.add(`iconbg-${ICONS[mode]}`);
        button.querySelector(".nav__lang__name").textContent = t(`theme.${mode}`);
        button.addEventListener("click", () => theme.set(mode));
        return button;
      })
    );
    cycle?.addEventListener("click", () => {
      const next = MODES[(MODES.indexOf(current()) + 1) % MODES.length];
      theme.set(next);
    });
    theme.paint(current());
    for (const query of [systemDark, systemContrast]) {
      query.addEventListener("change", () => {
        if (current() === "auto") theme.paint("auto");
      });
    }
  },
  /** Save and apply, with a soft cross-fade where supported */
  set(mode) {
    storage.set("theme", mode);
    const apply = () => theme.paint(mode);
    if (document.startViewTransition && !reducedMotion()) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  },
  paint(mode) {
    document.documentElement.dataset.mode = resolve(mode);

    // browser chrome colour
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.dataset.auto ??= meta.content;
      meta.content = mode === "auto" ? meta.dataset.auto : CHROME[mode];
    });

    // header button: shows the current mode and says what it does
    const cycle = document.querySelector(".js-theme-cycle");
    if (cycle) {
      const label = t("theme.change", t(`theme.${mode}`));
      cycle.setAttribute("aria-label", label);
      cycle.title = label;
      const icon = cycle.querySelector(".js-theme-icon");
      icon.className = `iconbg iconbg-${ICONS[mode]} js-theme-icon`;
    }
    document.querySelectorAll(".js-theme-btn").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.choice === mode));
    });
  },
};

export default theme;
