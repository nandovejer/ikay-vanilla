/**
 * Ad blocker detection with a bait: an empty element whose classes look like
 * an ad. Blockers hide it, and the page can notice.
 */
import { t } from "../i18n.js";

const detectAdblock = {
  async init() {
    const bait = document.createElement("div");
    bait.className = "adsbox ad-banner ad-placeholder pub_300x250 textads banner_ad";
    bait.setAttribute("aria-hidden", "true");
    bait.style.cssText = "position:absolute;left:-9999px;top:0;width:10px;height:10px;";
    bait.innerHTML = "&nbsp;";
    document.body.append(bait);

    await new Promise((resolve) => setTimeout(resolve, 300));
    const style = getComputedStyle(bait);
    const blocked =
      !bait.isConnected ||
      bait.offsetHeight === 0 ||
      style.display === "none" ||
      style.visibility === "hidden";
    bait.remove();

    return {
      value: t(blocked ? "adblock.type.detected" : "adblock.type.none"),
      detail: [['<div class="adsbox ad-banner">', blocked ? "display: none" : "visible"]],
      fingerprint: String(blocked),
    };
  },
};

export default detectAdblock;
