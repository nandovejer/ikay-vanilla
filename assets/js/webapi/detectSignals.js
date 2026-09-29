/**
 * Privacy signals and other flags any page can read. The irony: turning on
 * Do Not Track makes you a little easier to tell apart.
 */
import { t } from "../i18n.js";

const detectSignals = {
  async init() {
    const dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";
    const gpc = navigator.globalPrivacyControl === true;
    const yesNo = (value) => t(value ? "signals.type.yes" : "signals.type.no");

    return {
      value: t("signals.type.summary", yesNo(dnt), yesNo(gpc)),
      detail: [
        ["navigator.doNotTrack", navigator.doNotTrack ?? "null"],
        ["navigator.globalPrivacyControl", navigator.globalPrivacyControl],
        ["navigator.cookieEnabled", navigator.cookieEnabled],
        ["navigator.pdfViewerEnabled", navigator.pdfViewerEnabled],
        ["navigator.webdriver", navigator.webdriver],
      ],
      fingerprint: [dnt, gpc, navigator.cookieEnabled, navigator.pdfViewerEnabled].join("|"),
    };
  },
};

export default detectSignals;
