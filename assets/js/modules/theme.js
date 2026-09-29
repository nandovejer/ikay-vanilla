/**
 * Theme: Auto (follows the system) · Light · Dark.
 * - <html data-theme="light|dark"> forces a scheme; no attribute = auto.
 *   The css switches color-scheme, and every light-dark() token follows.
 * - The choice is kept in localStorage ("ikay-theme"); a tiny inline script
 *   in <head> applies it before the first paint.
 * - The "Dark mode" card keeps reading the SYSTEM preference, on purpose.
 */
import template from "./template.js";
import storage from "./storage.js";
import { t } from "../i18n.js";

const MODES = ["auto", "light", "dark"];
const ICONS = { auto: "theme-auto", light: "sun", dark: "moon" };
/* paper colour of each theme, for the browser chrome */
const CHROME = { light: "#f8f4ec", dark: "#1a1712" };

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const current = () => {
  const saved = storage.get("theme");
  return MODES.includes(saved) ? saved : "auto";
};

const theme = {
  init() {
    const cycle = document.querySelector(".js-theme-cycle");
    const options = document.querySelector(".js-theme-options");

    options?.replaceChildren(
      ...MODES.map((mode) => {
        const button = template("tpl-theme-btn").firstElementChild;
        button.dataset.theme = mode;
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
    const root = document.documentElement;
    if (mode === "auto") delete root.dataset.theme;
    else root.dataset.theme = mode;

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
      button.setAttribute("aria-pressed", String(button.dataset.theme === mode));
    });
  },
};

export default theme;
