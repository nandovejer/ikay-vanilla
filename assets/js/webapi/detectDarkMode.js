import { t } from "../i18n.js";

const detectDarkMode = {
  init() {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return t(`darkmode.type.${isDarkMode ? "enable" : "disable"}`);
  },
};

export default detectDarkMode;
