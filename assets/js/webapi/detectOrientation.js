import isTouchDevice from "./isTouchDevice.js";
import { t } from "../i18n.js";
import detectDevice from "./detectDevice.js";

const detectOrientation = {
  /**
   * @param {string} device - HTML returned by detectDevice.init()
   */
  init(device) {
    if (isTouchDevice()) {
      if (window.matchMedia("screen and (orientation: portrait)").matches) {
        return t("orientation.type.portrait");
      }
      if (window.matchMedia("screen and (orientation: landscape)").matches) {
        return t("orientation.type.landscape");
      }
    }
    return t("orientation.type.undefined", device ?? detectDevice.byUserAgent());
  },
};

export default detectOrientation;
