import template from "./template.js";
import caimodal from "./caimodal.js";
import summary from "./summary.js";
import properties, { t } from "../i18n.js";

/** Cards with their own <template id="tpl-card-{type}"> */
const CUSTOM = [
  "location",
  "exit",
  "connection",
  "battery",
  "fingerprint",
  "canvas",
  "behaviour",
];

/** Icon of each generic card, when it is not named as the card */
const ICONS = { device: "devices", screen: "resolution" };

/** Texts that mean "nothing here yet" in the templates */
const PLACEHOLDERS = new Set(["", "...", "…", "-"]);
const isFilled = (el) =>
  el.childElementCount > 0 || !PLACEHOLDERS.has(el.textContent.trim());

/** After this, whatever is still loading stops shimmering */
const TIMEOUT = 20000;

const card = {
  /** Paint the cards listed in each <section data-cards="…"> into its .js-cards */
  render() {
    document.querySelectorAll("[data-cards]").forEach((section) => {
      const target = section.querySelector(".js-cards") ?? section;
      section.dataset.cards
        .split(/\s+/)
        .forEach((type) => target.append(card.create(type)));
    });
  },
  /** @return {DocumentFragment} */
  create(type) {
    if (CUSTOM.includes(type)) return template(`tpl-card-${type}`);

    const fragment = template("tpl-card");
    fragment.querySelector(".card").classList.add(`js-card-${type}`, `card--${type}`);
    fragment.querySelector(".card__icon .iconbg").classList.add(`iconbg-${ICONS[type] ?? type}`);
    fragment.querySelector(".js-card-value").classList.add(`js-apiValue-${type}`);
    fragment.querySelector(".js-card-description").classList.add(`js-apiDetail-${type}`);
    fragment.querySelectorAll("[data-i18n-card]").forEach((el) => {
      el.textContent = t(`${type}.title`);
    });
    fragment.querySelectorAll("[data-i18n-plain]").forEach((el) => {
      el.textContent = t(`${type}.plain`);
    });
    return fragment;
  },
  typeOf(article) {
    return article.className.match(/js-card-(\w+)/)?.[1];
  },
  /** "?" button of every card opens its explanation */
  init() {
    const txt = properties.get();
    document.querySelectorAll(".js-card").forEach((article) => {
      const type = card.typeOf(article);
      const more = article.querySelector(".js-card-more");
      const title = article.querySelector(".card__type")?.textContent || t(`${type}.title`);
      const label = t("main.cardmoreFor", title);
      more.setAttribute("aria-label", label);
      more.title = label;

      const modalinfo = txt[type]?.modalinfo;
      if (!modalinfo) {
        more.hidden = true;
        return;
      }
      more.addEventListener("click", () => {
        caimodal.open({
          title: modalinfo.title,
          tplMain: modalinfo.description,
          tplFooter: modalinfo.moreinfo,
        });
      });
    });
    card.track();
  },
  /**
   * Card state, read from the DOM so the detectors stay untouched:
   *   pending  -> its .js-card-value still shows the placeholder (skeleton)
   *   ready    -> a detector filled it
   *   blocked  -> .noSupport (the browser does not share it)
   *   stale    -> still empty after TIMEOUT
   */
  track() {
    const main = document.getElementById("appMain");
    const cards = [...main.querySelectorAll(".js-card")];
    let queued = false;
    let timedOut = false;

    const update = () => {
      queued = false;
      main.querySelectorAll("[data-skeleton]").forEach((el) => {
        if (timedOut || isFilled(el)) el.removeAttribute("data-skeleton");
      });
      const states = cards.map((article) => {
        let state = "ready";
        if (article.classList.contains("noSupport")) state = "blocked";
        else if (article.querySelector(".js-card-value[data-skeleton]")) state = "pending";
        else if (timedOut && !card.hasValue(article)) state = "stale";
        if (article.dataset.state !== state) {
          article.dataset.state = state;
          article.setAttribute("aria-busy", String(state === "pending"));
        }
        if (state === "ready") card.fit(article);
        return state;
      });
      summary.update(cards, states);
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    new MutationObserver(schedule).observe(main, {
      subtree: true,
      childList: true,
      characterData: true,
      attributeFilter: ["class"],
    });
    summary.init(cards);
    update();
    setTimeout(() => {
      timedOut = true;
      schedule();
    }, TIMEOUT);
  },
  /** Long values (GPU names, sentences) get a smaller type size */
  fit(article) {
    const value = article.querySelector("p.js-card-value");
    if (!value) return;
    const length = value.textContent.trim().length;
    value.dataset.length = length > 48 ? "long" : length > 24 ? "medium" : "short";
  },
  hasValue(article) {
    const value = article.querySelector(".js-card-value");
    return !value || isFilled(value);
  },
};

export default card;
