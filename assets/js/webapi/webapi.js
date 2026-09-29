// ## JS - WEBAPI
import locationAPI from "./locationAPI.js";
import nativeObj from "./nativeObj.js";
import batteryAPI from "./batteryAPI.js";
import speedAPI from "./speedAPI.js";
import detectGPU from "./detectGPU.js";
import detectTimezone from "./detectTimezone.js";
import detectLocale from "./detectLocale.js";
import detectDisplay from "./detectDisplay.js";
import detectPreferences from "./detectPreferences.js";
import detectInput from "./detectInput.js";
import detectKeyboard from "./detectKeyboard.js";
import canvasFingerprint from "./canvasFingerprint.js";
import audioFingerprint from "./audioFingerprint.js";
import detectFonts from "./detectFonts.js";
import detectVoices from "./detectVoices.js";
import detectIncognito from "./detectIncognito.js";
import detectAdblock from "./detectAdblock.js";
import detectSignals from "./detectSignals.js";
import detectNavigation from "./detectNavigation.js";
import behaviour from "./behaviour.js";
import fingerprintID from "./fingerprintID.js";
import { noSupport, setHTML, setText, renderDetail, renderList } from "../modules/dom.js";

const NATIVE_KEYS = [
  "device",
  "screen",
  "orientation",
  "darkmode",
  "lang",
  "exit",
  "os",
  "browser",
  "ram",
  "cpu",
  "gpu",
];

// Native values that do not change between visits: they feed "Your ID"
const NATIVE_STABLE = ["os", "browser", "device", "lang", "screen", "darkmode", "ram", "cpu", "gpu"];

/**
 * Detectors with the same contract:
 * async init() -> { value, detail?: [api, value][], list?: string[],
 *                   note?: string, win?: boolean,
 *                   fingerprint?: string, render?(article) } | undefined
 * win: the result is good news for the visitor (painted as .card--win)
 */
const DETECTORS = {
  timezone: detectTimezone,
  locale: detectLocale,
  display: detectDisplay,
  preferences: detectPreferences,
  input: detectInput,
  keyboard: detectKeyboard,
  canvas: canvasFingerprint,
  audio: audioFingerprint,
  fonts: detectFonts,
  voices: detectVoices,
  incognito: detectIncognito,
  adblock: detectAdblock,
  signals: detectSignals,
  navigation: detectNavigation,
};

const webapi = {
  async init() {
    behaviour.init();

    const location = locationAPI.init();
    const native = nativeObj().then((data) => {
      webapi.setNativeObj(data);
      return data;
    });
    const extras = Object.entries(DETECTORS).map(([type, detector]) =>
      webapi.run(type, detector)
    );

    batteryAPI.get().then((battery) => battery && batteryAPI.set(battery));
    speedAPI.init();
    detectGPU.details().then((detail) => {
      renderDetail(document.querySelector(".js-card-gpu .js-card-detail"), detail);
    });

    // Time zone of the system vs time zone of the IP
    location.then((data) => {
      if (data?.timezone) setText(".js-apiDetail-timezone", detectTimezone.compare(data.timezone));
    });

    // Your ID: everything stable, mixed in one hash
    const [nativeData, ...results] = await Promise.all([
      native.catch(() => ({})),
      ...extras,
    ]);
    const components = {};
    NATIVE_STABLE.forEach((key) => {
      components[key] = key === "lang" ? nativeData.langCode : nativeData[key];
    });
    Object.keys(DETECTORS).forEach((type, index) => {
      if (results[index]?.fingerprint) components[type] = results[index].fingerprint;
    });
    webapi.render("fingerprint", await fingerprintID.init(components));
  },
  /** Run one detector and paint its card; never throws */
  async run(type, detector) {
    try {
      const result = await detector.init();
      webapi.render(type, result);
      return result;
    } catch (error) {
      console.error(`${type}:`, error);
      noSupport(type);
      return undefined;
    }
  },
  render(type, result) {
    const article = document.querySelector(`.js-card-${type}`);
    if (!article) return;
    if (result?.value === undefined) {
      noSupport(type);
      return;
    }
    setText(`.js-apiValue-${type}`, result.value);
    if (result.note) setText(`.js-apiDetail-${type}`, result.note);
    article.classList.toggle("card--win", Boolean(result.win));
    const list = article.querySelector(".js-card-detail");
    if (result.detail) renderDetail(list, result.detail);
    if (result.list) renderList(list, result.list);
    result.render?.(article);
  },
  setNativeObj(data) {
    NATIVE_KEYS.forEach((key) => {
      if (data[key] === undefined) {
        noSupport(key);
      } else {
        setHTML(`.js-apiValue-${key}`, data[key]);
      }
    });
    // Values that could not be worked out are shown as protected
    noSupport(...(data.kept ?? []));
    // The raw language codes, for the curious
    renderDetail(document.querySelector(".js-card-lang .js-card-detail"), [
      ["navigator.language", data.langCode],
      ["navigator.languages", (navigator.languages ?? []).join(", ")],
    ]);
  },
};

export default webapi;
