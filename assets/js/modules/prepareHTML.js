import template from "./template.js";
import loadingPage from "./loadingPage.js";
import choiceLang from "./choiceLang.js";
import card from "./card.js";

const prepareHTML = {
  init() {
    choiceLang.htmlLang();
    document.getElementById("appHeader").replaceChildren(template("tpl-header"));
    document.getElementById("appMain").replaceChildren(template("tpl-main"));
    document.getElementById("appFooter").replaceChildren(template("tpl-footer"));
    card.render();
    loadingPage.init();
  },
};

export default prepareHTML;
