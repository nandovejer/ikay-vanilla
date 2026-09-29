/**
 * Screen details beyond the resolution: pixel density, the space taken by
 * the taskbar or the dock, color gamut, HDR and extra monitors.
 */
import { t } from "../i18n.js";

const mq = (query) => window.matchMedia(query).matches;

const detectDisplay = {
  async init() {
    const taskbar = screen.height - screen.availHeight;
    const gamut = ["rec2020", "p3", "srgb"].find((item) => mq(`(color-gamut: ${item})`));
    const hdr = mq("(dynamic-range: high)");

    const detail = [
      ["window.devicePixelRatio", window.devicePixelRatio],
      ["innerWidth x innerHeight", `${innerWidth}x${innerHeight}px`],
      ["screen.availWidth x availHeight", `${screen.availWidth}x${screen.availHeight}px`],
      ["screen.height - availHeight", `${taskbar}px`],
      ["(color-gamut)", gamut ?? "—"],
      ["(dynamic-range: high)", hdr],
    ];
    if ("isExtended" in screen) detail.push(["screen.isExtended", screen.isExtended]);

    return {
      value: t("display.type.window", innerWidth, innerHeight),
      detail,
      fingerprint: [devicePixelRatio, screen.availWidth, screen.availHeight, gamut, hdr].join("|"),
    };
  },
};

export default detectDisplay;
