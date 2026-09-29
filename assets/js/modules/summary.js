/**
 * "What this page already knows": the overview at the top of the page.
 * Everything is read back from the cards once they are painted, so the
 * numbers are exactly what the visitor can see below.
 */
import { t } from "../i18n.js";
import loadingPage from "./loadingPage.js";

/** [card type, selector of the value, selector of an optional second line] */
const HIGHLIGHTS = [
  ["location", ".js-apiValue-city", ".js-apiValue-country"],
  ["timezone", ".js-apiValue-timezone", ".js-apiDetail-timezone"],
  ["device", ".js-apiValue-device"],
  ["os", ".js-apiValue-os"],
  ["browser", ".js-apiValue-browser"],
  ["incognito", ".js-apiValue-incognito"],
  ["adblock", ".js-apiValue-adblock"],
];

const PLACEHOLDERS = new Set(["", "...", "…", "-"]);
const text = (selector) => {
  if (!selector) return "";
  const value = document.querySelector(selector)?.textContent.trim() ?? "";
  return PLACEHOLDERS.has(value) ? "" : value;
};

let chips = [];
let last = "";

const summary = {
  init(cards) {
    const list = document.querySelector(".js-summary-highlights");
    if (!list) return;
    chips = HIGHLIGHTS.map(([type, main, sub]) => {
      const item = document.createElement("li");
      item.className = "summary__chip";
      item.dataset.type = type;
      const label = document.createElement("span");
      label.className = "summary__chipLabel";
      label.textContent = t(`${type}.title`);
      const value = document.createElement("span");
      value.className = "summary__chipValue";
      const extra = document.createElement("span");
      extra.className = "summary__chipExtra";
      item.append(label, value, extra);
      list.append(item);
      return { type, main, sub, item, value, extra };
    });

    const total = cards.length;
    document.querySelector(".js-summary-total").textContent = t("summary.of", total);
  },
  /**
   * @param {HTMLElement[]} cards
   * @param {string[]} states - "pending" | "ready" | "blocked" | "stale"
   */
  update(cards, states) {
    const key = states.join() + cards.map((article) => article.classList.contains("card--win")).join() + chips.map((chip) => text(chip.main) + text(chip.sub)).join();
    if (key === last) return;
    last = key;

    const count = (state) => states.filter((item) => item === state).length;
    const ready = count("ready");
    const blocked = count("blocked");
    const done = cards.length - count("pending");

    document.querySelector(".js-summary-points").textContent = ready;
    // Data the browser did not give away: shown as a win
    // plus results that are good news (an ad blocker, Do Not Track...)
    const wins = blocked + cards.filter((article) => article.classList.contains("card--win")).length;
    const privateEl = document.querySelector(".js-summary-private");
    privateEl.textContent = wins;
    privateEl.closest(".summary__stat").dataset.win = String(wins > 0);
    const blockedEl = document.querySelector(".js-summary-blocked");
    blockedEl.hidden = wins === 0;
    blockedEl.textContent = t("summary.blocked", wins);

    // Count per section
    document.querySelectorAll(".area[data-cards]").forEach((section) => {
      const badge = section.querySelector(".js-area-count");
      if (!badge) return;
      const own = cards
        .map((article, index) => (section.contains(article) ? states[index] : null))
        .filter(Boolean);
      const read = own.filter((state) => state === "ready").length;
      badge.textContent = t("summary.count", read, own.length);
      badge.setAttribute("aria-label", t("summary.countLabel", read, own.length));
      badge.dataset.complete = String(own.every((state) => state !== "pending"));
    });

    // Highlights
    chips.forEach(({ type, main, sub, item, value, extra }) => {
      const index = cards.findIndex((article) => article.classList.contains(`js-card-${type}`));
      const state = states[index];
      item.dataset.state = state;
      value.textContent =
        state === "blocked" ? t("main.noSupportTitle") : text(main) || "…";
      extra.textContent = state === "blocked" || !sub ? "" : text(sub);
    });

    loadingPage.progress(done / cards.length);
  },
};

export default summary;
