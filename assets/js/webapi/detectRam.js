/**
 * Support: Edge | Chrome | Opera | Android Browser | Samsung Internet
 * @return {string|undefined} "16 GB", in the format of the page language
 */
import { formatNumber } from "../i18n.js";

const detectRam = {
  init() {
    const ram = navigator.deviceMemory;
    return ram ? formatNumber(ram, { style: "unit", unit: "gigabyte" }) : undefined;
  },
};

export default detectRam;
