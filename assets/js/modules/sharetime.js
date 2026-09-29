import template from "./template.js";
import caimodal from "./caimodal.js";
import { t } from "../i18n.js";

const SOCIAL = ["facebook", "twitter", "linkedin", "whatsapp", "reddit", "mail"];

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
      // TODO - CHANGE ICON MAIL SVG WITH A EDITOR
      const icon = socialNetwork === "mail" ? "contact" : socialNetwork;
      link.classList.add(`iconbg-${icon}`, `js-sharetime-${socialNetwork}`);
      link.title = t("global.shareIn", socialNetwork);
      link.href = urls[socialNetwork];
      list.append(item);
    });

    caimodal.open({ title: t("global.share"), tplMain: list });
  },
};

export default sharetime;
