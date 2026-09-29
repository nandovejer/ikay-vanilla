import template from "./template.js";
import caimodal from "./caimodal.js";
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

const card = {
  /** Paint the cards listed in each <section data-cards="…"> */
  render() {
    document.querySelectorAll("[data-cards]").forEach((section) => {
      section.dataset.cards
        .split(/\s+/)
        .forEach((type) => section.append(card.create(type)));
    });
  },
  /** @return {DocumentFragment} */
  create(type) {
    if (CUSTOM.includes(type)) return template(`tpl-card-${type}`);

    const fragment = template("tpl-card");
    fragment.querySelector(".card").classList.add(`js-card-${type}`, `card--${type}`);
    fragment.querySelector(".card__icon").classList.add(`iconbg-${ICONS[type] ?? type}`);
    fragment.querySelector(".js-card-value").classList.add(`js-apiValue-${type}`);
    fragment.querySelector(".js-card-description").classList.add(`js-apiDetail-${type}`);
    fragment.querySelectorAll("[data-i18n-card]").forEach((el) => {
      el.textContent = t(`${type}.title`);
    });
    return fragment;
  },
  /** "?" button of every card opens its explanation */
  init() {
    const txt = properties.get();
    document.querySelectorAll(".js-card").forEach((article) => {
      const type = article.className.match(/js-card-(\w+)/)?.[1];
      const modalinfo = txt[type]?.modalinfo;
      if (!modalinfo) return;

      article.querySelector(".js-card-more").addEventListener("click", () => {
        caimodal.open({
          title: modalinfo.title,
          tplMain: modalinfo.description,
          tplFooter: modalinfo.moreinfo,
        });
      });
    });
  },
};

export default card;
