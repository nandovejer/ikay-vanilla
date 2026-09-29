/**
 * Keyboard layout with the Keyboard API (Chromium only, no permission).
 * https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/getLayoutMap
 */
import { t } from "../i18n.js";

const LAYOUTS = {
  qwerty: "QWERTY",
  azerty: "AZERTY",
  qwertz: "QWERTZ",
  "',.pyf": "Dvorak",
  qwfpgj: "Colemak",
};

const row = (map, codes) => codes.map((code) => map.get(code) ?? "·").join(" ");

const detectKeyboard = {
  async init() {
    if (!navigator.keyboard?.getLayoutMap) return undefined;
    let map;
    try {
      map = await navigator.keyboard.getLayoutMap();
    } catch {
      return undefined;
    }
    const top = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY"];
    const first = top.map((code) => map.get(code) ?? "").join("");
    const layout = LAYOUTS[first] ?? t("keyboard.type.unknown", first.toUpperCase());

    return {
      value: layout,
      detail: [
        ["KeyQ … KeyP", row(map, ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft"])],
        ["KeyA … Semicolon", row(map, ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"])],
        ["KeyZ … Slash", row(map, ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"])],
      ],
      fingerprint: Array.from(map.entries()).sort().join(","),
    };
  },
};

export default detectKeyboard;
