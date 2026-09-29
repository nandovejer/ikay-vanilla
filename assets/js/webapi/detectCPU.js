/**
 * @param {object} ua - result of parseUserAgent()
 * @return {string} // "8 Cores, Linux x86_64 amd64"
 */
import { join } from "./userAgent.js";

const detectCPU = {
  init(ua) {
    return join(detectCPU.byNavigator(), ua.cpu.architecture);
  },
  byNavigator() {
    const cores = navigator.hardwareConcurrency
      ? `${navigator.hardwareConcurrency} Cores`
      : "";
    const platform = navigator.userAgentData?.platform || navigator.platform || "";
    return [cores, platform].filter(Boolean).join(", ");
  },
};

export default detectCPU;
