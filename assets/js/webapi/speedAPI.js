// INSPIRATION IN THE WORK OF https://webkay.robinlinus.com/
import { t } from "../i18n.js";
import { setHTML, setText } from "../modules/dom.js";

const IMAGE_TARGET =
  "https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%285mb%29.jpg";
const IMAGE_TARGET_SIZE = 5245329; // bytes

const speedAPI = {
  /**
   * Download a known image and time it.
   * @return {Promise<{speedMbps: string, speedKbps: string}>}
   */
  measure() {
    return new Promise((resolve, reject) => {
      const download = new Image();
      const startTime = performance.now();
      download.onload = () => {
        const duration = (performance.now() - startTime) / 1000;
        const speedBps = (IMAGE_TARGET_SIZE * 8) / duration;
        resolve({
          speedKbps: (speedBps / 1024).toFixed(2),
          speedMbps: (speedBps / 1024 / 1024).toFixed(2),
        });
      };
      download.onerror = () => {
        reject(new Error(`Invalid image, or error downloading: ${IMAGE_TARGET}`));
      };
      download.src = `${IMAGE_TARGET}?nnn=${Date.now()}`;
    });
  },
  /** @return {string|undefined} */
  connectionType() {
    const effectiveType = navigator.connection?.effectiveType;
    if (!effectiveType) return undefined;
    switch (effectiveType.toUpperCase()) {
      case "SLOW-2G":
        return t("connection.type.lower2g");
      case "2G":
        return t("connection.type.low2g");
      case "3G":
        return t("connection.type.normal3g");
      case "4G":
        return t("connection.type.faster4g");
      default:
        // WIFI, ETHERNET, UNKNOWN
        return "...";
    }
  },
  async init() {
    const type = speedAPI.connectionType();
    if (type) speedAPI.showType(type);
    try {
      const { speedMbps, speedKbps } = await speedAPI.measure();
      speedAPI.showSpeed(speedMbps, speedKbps);
    } catch (error) {
      console.error(error.message);
    }
  },
  showSpeed(speedMbps, speedKbps) {
    setHTML(
      ".js-apiValue-connection-mbps",
      `${speedMbps} Mbps <small>(${speedKbps} kbps)</small>`
    );
  },
  showType(typeValue) {
    setText(".js-apiValue-connection-type", typeValue);
  },
};

export default speedAPI;
