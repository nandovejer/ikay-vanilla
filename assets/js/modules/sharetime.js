import template from "./template.js";
import caimodal from "./caimodal.js";
import { t } from "../i18n.js";

const SOCIAL = ["facebook", "twitter", "linkedin", "whatsapp", "reddit", "mail"];
/** Brand names are not translated; "mail" is */
const NAMES = {
  facebook: "Facebook",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  reddit: "Reddit",
};

const sharetime = {
  init() {
    document.querySelector(".sharetime").replaceChildren(template("tpl-share-btn"));

    const onClick = navigator.share ? sharetime.native : sharetime.fallback;
    document.querySelectorAll(".js-share-native").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        onClick();
      });
    });
  },
  async native() {
    try {
      await navigator.share({ title: document.title, url: location.href });
      console.log("Thanks for sharing!");
    } catch (error) {
      // AbortError: the user closed the share sheet
      if (error.name !== "AbortError") console.error(error);
    }
  },
  socialURLs() {
    const msg = encodeURIComponent(document.title);
    const url = encodeURIComponent(location.href);
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${msg}:%20${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?url=${url}&title=${msg}`,
      whatsapp: `https://wa.me/?text=${msg}:%20${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${msg}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${msg}`,
      mail: `mailto:?subject=${msg}&body=${msg}:%20${url}`,
    };
  },
  fallback() {
    const urls = sharetime.socialURLs();
    const list = document.createElement("ul");
    list.className = "shareTimeList";

    SOCIAL.forEach((socialNetwork) => {
      const item = template("tpl-share-item");
      const link = item.querySelector("a");
      const icon = socialNetwork === "mail" ? "contact" : socialNetwork;
      const name = NAMES[socialNetwork] ?? t("global.email");
      link.classList.add(`js-sharetime-${socialNetwork}`);
      link.querySelector(".iconbg").classList.add(`iconbg-${icon}`);
      link.querySelector(".shareTimeList__label").textContent = name;
      link.title = t("global.shareIn", name);
      link.href = urls[socialNetwork];
      list.append(item);
    });

    caimodal.open({ title: t("global.share"), tplMain: list });
  },
};

export default sharetime;
