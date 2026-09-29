/**
 * Speech synthesis voices: they come from the operating system and from
 * the language packs you installed.
 */
import { t, langLabel } from "../i18n.js";

const getVoices = () =>
  new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    // Chromium fills the list asynchronously
    const timeout = setTimeout(() => resolve(speechSynthesis.getVoices()), 1500);
    speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        clearTimeout(timeout);
        resolve(speechSynthesis.getVoices());
      },
      { once: true }
    );
  });

const detectVoices = {
  async init() {
    if (!("speechSynthesis" in window)) return undefined;
    const voices = await getVoices();
    const local = voices.filter((voice) => voice.localService).length;
    // raw names feed "Your ID"; the list shows the language in plain words
    const names = voices.map((voice) => `${voice.name} (${voice.lang})`);
    const labels = voices.map((voice) => `${voice.name} (${langLabel(voice.lang)})`);

    return {
      value: voices.length
        ? t("voices.type.count", voices.length, local)
        : t("voices.type.none"),
      list: labels,
      fingerprint: names.join(","),
    };
  },
};

export default detectVoices;
