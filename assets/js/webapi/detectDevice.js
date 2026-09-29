/**
 * Detect Device by user agent, platform and touch device
 * mobileAndroid || tabletAndroid || ipad || iphone || laptopWin || laptopmac || tv
 */
import isTouchDevice from "./isTouchDevice.js";
import { t } from "../i18n.js";
import { escapeHTML } from "../modules/dom.js";

const detectDevice = {
  /**
   * @param {object} ua - result of parseUserAgent()
   * @return {string} HTML
   */
  init(ua) {
    return ua.device.model
      ? detectDevice.byModel(ua.device)
      : escapeHTML(detectDevice.byUserAgent());
  },
  byModel({ model, type, vendor }) {
    const extra = [type, vendor].filter(Boolean).join("|");
    return `${escapeHTML(model)}${extra ? ` <small>(${escapeHTML(extra)})</small>` : ""}`;
  },
  byUserAgent() {
    const isTouch = isTouchDevice();
    const userAgent = navigator.userAgent.toLowerCase();
    const os = (navigator.userAgentData?.platform || navigator.platform).toLowerCase();
    const isAndroid = userAgent.includes("android");
    const isMobile = userAgent.includes("mobile");
    // Since iPadOS 13 the iPad says it is a Mac, but Macs have no touch screen
    const isIpad =
      userAgent.includes("ipad") ||
      (userAgent.includes("macintosh") && navigator.maxTouchPoints > 1);

    switch (true) {
      case isAndroid && isMobile:
        return t("device.type.mobileAndroid");
      case isAndroid && !isMobile && isTouch:
        return t("device.type.tabletAndroid");
      case isIpad:
        return t("device.type.ipad");
      case userAgent.includes("iphone"):
        return t("device.type.iphone");
      case !isTouch && os.includes("win"):
        return t("device.type.laptopWin");
      case !isTouch && os.includes("mac"):
        return t("device.type.laptopMac");
      case os.includes("tv") || /smart-?tv|tizen|webos/.test(userAgent):
        return t("device.type.tv");
      default:
        return t("device.type.unknownDevice");
    }
  },
};

export default detectDevice;
