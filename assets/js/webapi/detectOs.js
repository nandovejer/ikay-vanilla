/**
 * @param {object} ua - result of parseUserAgent()
 * @return {string|undefined} // "Windows 11" || "macOS 14.5" || "Android 14"
 */
import { join } from "./userAgent.js";

const detectOs = {
  init(ua) {
    const { name, version } = ua.os;
    return name ? join(name, version) : undefined;
  },
};

export default detectOs;
