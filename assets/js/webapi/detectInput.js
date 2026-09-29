/**
 * How you interact: mouse, trackpad, touch screen or several of them.
 */
import { t } from "../i18n.js";

const mq = (query) => window.matchMedia(query).matches;

const detectInput = {
  async init() {
    const fine = mq("(any-pointer: fine)");
    const coarse = mq("(any-pointer: coarse)");
    const type = fine && coarse ? "both" : fine ? "mouse" : coarse ? "touch" : "none";
    const pointer = ["fine", "coarse", "none"].find((item) => mq(`(pointer: ${item})`));
    const hover = mq("(hover: hover)");

    return {
      value: t(`input.type.${type}`),
      detail: [
        ["(pointer)", pointer],
        ["(any-pointer: fine)", fine],
        ["(any-pointer: coarse)", coarse],
        ["(hover: hover)", hover],
        ["navigator.maxTouchPoints", navigator.maxTouchPoints],
      ],
      fingerprint: [pointer, fine, coarse, hover, navigator.maxTouchPoints].join("|"),
    };
  },
};

export default detectInput;
