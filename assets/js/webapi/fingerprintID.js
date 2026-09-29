/**
 * "Your ID without cookies": one hash that mixes every stable piece of data
 * of this page. Nothing is stored: it is computed again on every visit and
 * it comes out the same, which is exactly the problem.
 */
import hash from "../modules/hash.js";
import { t } from "../i18n.js";

const fingerprintID = {
  /**
   * @param {Object<string, string>} components - stable values by card type
   */
  async init(components) {
    const entries = Object.entries(components).filter(
      ([, value]) => value !== undefined && value !== ""
    );
    const digest = await hash(JSON.stringify(entries));
    const short = digest.slice(0, 16).match(/.{4}/g).join(" ");

    return {
      value: short,
      detail: [
        [globalThis.crypto?.subtle ? "SHA-256" : "cyrb53", digest],
        [t("fingerprint.type.components", entries.length), entries.map(([key]) => key).join(", ")],
      ],
    };
  },
};

export default fingerprintID;
