import template from "./template.js";
import storage from "./storage.js";
import properties, { LANGS, langName, langDir } from "../i18n.js";

const choiceLang = {
  /** One button per supported language, named by Intl.DisplayNames */
  init() {
    const current = properties.lang();
    const buttons = LANGS.map((lang) => {
      const button = template("tpl-lang-btn").firstElementChild;
      const name = langName(lang);
      button.querySelector(".nav__lang__code").textContent = lang.toUpperCase();
      button.querySelector(".nav__lang__name").textContent = name;
      button.lang = lang;
      button.dataset.name = name;
      button.setAttribute("aria-label", name);
      button.setAttribute("aria-pressed", String(lang === current));
      button.classList.toggle("active", lang === current);
      button.addEventListener("click", () => {
        if (lang !== current) choiceLang.changeLang(lang);
      });
      return button;
    });
    document.querySelector(".js-choiceLang").replaceChildren(...buttons);
  },
  changeLang(strLang) {
    storage.set("sessionLang", strLang);
    location.reload();
  },
  /** <html lang dir>: logical properties in the css do the rest for rtl */
  htmlLang() {
    const lang = properties.lang();
    document.documentElement.lang = lang;
    document.documentElement.dir = langDir(lang);
  },
};

export default choiceLang;
