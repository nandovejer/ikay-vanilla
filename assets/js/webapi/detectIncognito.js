/**
 * Private mode detection through the storage quota.
 * - Chromium: in incognito the quota is limited by the RAM, in normal mode
 *   it is a share of the free disk (so it also leaks the size of your disk).
 * - Firefox and Safari: the Origin Private File System is blocked in
 *   private windows.
 * It is a heuristic: the card says "probably".
 */
import { t } from "../i18n.js";

const GB = 1024 ** 3;
const gb = (bytes) => `${(bytes / GB).toFixed(1)} GB`;

const detectIncognito = {
  async init() {
    if (!navigator.storage?.estimate) return undefined;
    const { quota = 0, usage = 0 } = await navigator.storage.estimate();
    const isChromium = Boolean(navigator.userAgentData) || "chrome" in window;

    let isPrivate;
    if (isChromium) {
      const heapLimit = performance.memory?.jsHeapSizeLimit ?? GB;
      isPrivate = quota < heapLimit * 2;
    } else {
      try {
        await navigator.storage.getDirectory();
        isPrivate = false;
      } catch {
        isPrivate = true;
      }
    }

    const detail = [
      ["storage.estimate().quota", gb(quota)],
      ["storage.estimate().usage", `${(usage / 1024).toFixed(0)} KB`],
    ];
    // Chromium gives each site up to 60% of the disk
    if (isChromium && !isPrivate) detail.push([t("incognito.type.disk"), `≈ ${gb(quota / 0.6)}`]);

    return {
      value: t(isPrivate ? "incognito.type.likely" : "incognito.type.unlikely"),
      win: isPrivate,
      detail,
    };
  },
};

export default detectIncognito;
