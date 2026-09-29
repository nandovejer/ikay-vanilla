/**
 * What the page knows about how you arrived.
 */
import { t } from "../i18n.js";

const detectNavigation = {
  async init() {
    const entry = performance.getEntriesByType?.("navigation")[0];
    return {
      value: t("navigation.type.pages", history.length),
      detail: [
        ["history.length", history.length],
        ["document.referrer", document.referrer || t("navigation.type.direct")],
        ["PerformanceNavigationTiming.type", entry?.type],
      ],
    };
  },
};

export default detectNavigation;
