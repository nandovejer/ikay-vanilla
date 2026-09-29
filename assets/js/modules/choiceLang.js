import template from "./template.js";
import storage from "./storage.js";
import properties, { LANGS, langName, langDir } from "../i18n.js";

const choiceLang = {
  /** One button per supported language, named by Intl.DisplayNames */
  init() {
    const current = properties.lang();
    const buttons = LANGS.map((lang) => {
      const button = template("tpl-lang-btn").firstElementChild;
      button.textContent = lang.toUpperCase();
      button.lang = lang;
      button.dataset.name = langName(lang);
      button.classList.toggle("active", lang === current);
      button.addEventListener("click", () => choiceLang.changeLang(lang));
      return button;
    });
    document.querySelector(".js-choiceLang").replaceChildren(...buttons);
  },
  changeLang(strLang) {
    storage.set("sessionLang", strLang);
    location.reload();
  },
  /** <html lang dir>: the css reads html[lang="ar"] for the rtl layout */
  htmlLang() {
    const lang = properties.lang();
    document.documentElement.lang = lang;
    document.documentElement.dir = langDir(lang);
  },
};

export default choiceLang;
