/**
 * is touch device
 * @return {boolean}
 */
const isTouchDevice = () =>
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  window.matchMedia("(pointer: coarse)").matches;

export default isTouchDevice;
