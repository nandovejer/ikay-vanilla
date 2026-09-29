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
// import detectPlugins from "./detectPlugins.js";

/**
 * Collect everything the browser tells about you without asking.
 * Values are HTML-safe strings (undefined when not supported).
 * @return {Promise<object>}
 */
const nativeObj = async () => {
  const ua = await parseUserAgent();
  const device = detectDevice.init(ua);
  const safe = (value) => (value === undefined ? undefined : escapeHTML(value));

  return {
    os: safe(detectOs.init(ua)),
    browser: safe(detectBrowser.init(ua)),
    device,
    lang: safe(navigator.language),
    screen: `${screen.width}x${screen.height}px ${screen.colorDepth}bits/pixel`,
    orientation: detectOrientation.init(device),
    datetime: new Date().toLocaleTimeString(),
    datetoday: date.today("longDate"),
    speed: detectSpeedInternet.init(),
    darkmode: detectDarkMode.init(),
    ram: detectRam.init(),
    cpu: safe(detectCPU.init(ua)),
    gpu: safe(detectGPU.init()),
    exit: detectExit.init(),
    // plugins: detectPlugins(), // TODO - Plugins not work
  };
};

export default nativeObj;
