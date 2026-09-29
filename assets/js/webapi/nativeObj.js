import parseUserAgent from "./userAgent.js";
import detectOs from "./detectOs.js";
import detectBrowser from "./detectBrowser.js";
import detectDevice from "./detectDevice.js";
import detectOrientation from "./detectOrientation.js";
import date from "../modules/date.js";
import detectSpeedInternet from "./detectSpeedInternet.js";
import detectDarkMode from "./detectDarkMode.js";
import detectRam from "./detectRam.js";
import detectCPU from "./detectCPU.js";
import detectGPU from "./detectGPU.js";
import detectExit from "./detectExit.js";
import { escapeHTML } from "../modules/dom.js";
import { t, langLabel, formatNumber } from "../i18n.js";
// import detectPlugins from "./detectPlugins.js";

/**
 * Collect everything the browser tells about you without asking.
 * Values are HTML-safe strings (undefined when not supported).
 * @return {Promise<object>}
 */
const nativeObj = async () => {
  const ua = await parseUserAgent();
  const device = detectDevice.init(ua);
  const orientation = detectOrientation.init(device);
  const safe = (value) => (value === undefined ? undefined : escapeHTML(value));

  // Not even the type of device could be worked out: a privacy win, and so
  // is the orientation that depends on it
  const deviceUnknown = !ua.device.model && device === escapeHTML(t("device.type.unknownDevice"));
  const kept = deviceUnknown
    ? ["device", ...(orientation === t("orientation.type.undefined", device) ? ["orientation"] : [])]
    : [];

  return {
    os: safe(detectOs.init(ua)),
    browser: safe(detectBrowser.init(ua)),
    device,
    // in plain words; the raw code stays for "Your ID" and the details
    lang: safe(langLabel(navigator.language)),
    langCode: navigator.language,
    screen: `${formatNumber(screen.width)} × ${formatNumber(screen.height)}`,
    screenDetail: [
      ["screen.width x screen.height", `${screen.width}x${screen.height}px`],
      ["screen.colorDepth", `${screen.colorDepth} bits/pixel`],
    ],
    orientation,
    datetime: new Date().toLocaleTimeString(),
    datetoday: date.today("longDate"),
    speed: detectSpeedInternet.init(),
    darkmode: detectDarkMode.init(),
    ram: detectRam.init(),
    cpu: safe(detectCPU.init(ua)),
    gpu: safe(detectGPU.init()),
    exit: detectExit.init(),
    // plugins: detectPlugins(), // TODO - Plugins not work
    kept,
    // raw values for "Your ID": they must not change with the page language
    stable: {
      lang: navigator.language,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      ram: navigator.deviceMemory,
    },
  };
};

export default nativeObj;
