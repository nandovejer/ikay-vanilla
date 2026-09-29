/**
 * @param {object} ua - result of parseUserAgent()
 * @return {string|undefined} // "Firefox 131"
 */
import { join } from "./userAgent.js";

const detectBrowser = {
  init(ua) {
    const { name, major } = ua.browser;
    return name ? join(name, major) : undefined;
  },
};

export default detectBrowser;
