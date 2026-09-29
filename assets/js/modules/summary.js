/**
 * "Your file, so far": a dense case-file sheet at the top of the page.
 * Every row is read back from its card once painted (same value, same
 * status), and links to that card for the explanation.
 */
import { t } from "../i18n.js";
import loadingPage from "./loadingPage.js";

/** [card type, selector(s) of the value; several are joined with ", "] */
const ROWS = [
  ["location", ".js-apiValue-city", ".js-apiValue-country"],
  ["telco", ".js-apiValue-telco"],
  ["ip", ".js-apiValue-ip"],
  ["device", ".js-apiValue-device"],
  ["os", ".js-apiValue-os"],
  ["browser", ".js-apiValue-browser"],
  ["screen", ".js-apiValue-screen"],
  ["lang", ".js-apiValue-lang"],
  ["timezone", ".js-apiValue-timezone"],
  ["ram", ".js-apiValue-ram"],
  ["cpu", ".js-apiValue-cpu"],
  ["gpu", ".js-apiValue-gpu"],
  ["fonts", ".js-apiValue-fonts"],
  ["voices", ".js-apiValue-voices"],
  ["incognito", ".js-apiValue-incognito"],
  ["adblock", ".js-apiValue-adblock"],
  ["signals", ".js-apiValue-signals"],
  ["exit", ".js-exit-count"],
  ["behaviour", ".js-behaviour-time"],
  ["motion", ".js-apiValue-motion", ".js-motion-level"],
  ["fingerprint", ".js-apiValue-fingerprint"],
];

/** Extra line under a value: the VPN hint of the time zone */
const EXTRA = { timezone: ".js-apiDetail-timezone" };

const MAX = 48;
const PLACEHOLDERS = new Set(["", "...", "…", "-"]);
const text = (selector) => {
  const value = document.querySelector(selector)?.textContent.trim() ?? "";
  return PLACEHOLDERS.has(value) ? "" : value;
};
const short = (value) => (value.length > MAX ? `${value.slice(0, MAX - 1)}…` : value);

let rows = [];
let last = "";

const summary = {
  init(cards) {
    const list = document.querySelector(".js-summary-highlights");
    if (!list) return;
    rows = ROWS.map(([type, ...selectors]) => {
      const item = document.createElement("li");
      item.className = "summary__row";
      const link = document.createElement("a");
      link.className = "summary__link";
      link.href = `#card-${type}`;
      const icon = document.createElement("span");
      icon.className = "summary__icon iconbg iconbg-status";
      icon.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.className = "summary__rowLabel";
      label.textContent = t(`summary.label.${type}`);
      const value = document.createElement("span");
      value.className = "summary__rowValue";
      value.dir = "auto";
      const extra = document.createElement("span");
      extra.className = "summary__rowExtra";
      link.append(icon, label, value, extra);
      item.append(link);
      list.append(item);
      const card = cards.find((article) => article.classList.contains(`js-card-${type}`));
      return { type, selectors, item, value, extra, card };
    });
    document.querySelector(".js-summary-total").textContent = t("summary.of", cards.length);
  },
  /**
   * @param {HTMLElement[]} cards
   * @param {string[]} states - "pending" | "ready" | "blocked" | "stale"
   */
  update(cards, states) {
    const values = rows.map(({ selectors }) => selectors.map(text).filter(Boolean).join(", "));
    const wins = cards.map((article) => article.classList.contains("card--win"));
    const key = states.join() + wins.join() + values.join("|");
    if (key === last) return;
    last = key;

    const count = (state) => states.filter((item) => item === state).length;
    const done = cards.length - count("pending");
    // shared = read and not good news; in your favour = protected + good news
    const goodNews = wins.filter((win, index) => win && states[index] === "ready").length;
    const favour = count("blocked") + goodNews;
    const shared = count("ready") - goodNews;

    document.querySelector(".js-summary-points").textContent = shared;
    const privateEl = document.querySelector(".js-summary-private");
    privateEl.textContent = favour;
    privateEl.closest(".summary__stat").dataset.win = String(favour > 0);
    const blockedEl = document.querySelector(".js-summary-blocked");
    blockedEl.hidden = favour === 0;
    blockedEl.textContent = t("summary.blocked", favour);

    // Count per chapter
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

    // Rows of the sheet: same value and status as the card
    rows.forEach(({ type, item, value, extra, card }, index) => {
      const state = states[cards.indexOf(card)] ?? "ready";
      const good = state === "blocked" || card?.classList.contains("card--win");
      item.dataset.state =
        state === "pending" || state === "stale" ? "pending" : good ? "good" : "exposed";
      value.textContent =
        state === "blocked"
          ? t("main.status.protected")
          : values[index]
            ? short(values[index])
            : t("main.status.checking");
      extra.textContent = EXTRA[type] && state !== "blocked" ? text(EXTRA[type]) : "";
    });

    loadingPage.progress(done / cards.length);
  },
};

export default summary;
