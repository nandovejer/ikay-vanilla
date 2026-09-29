/**
 * Time zone of the operating system, compared later with the one of your IP.
 * If they do not match, you are probably behind a VPN or a proxy.
 */
import { t } from "../i18n.js";

const offset = () => {
  const minutes = -new Date().getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const rest = abs % 60;
  return `UTC${sign}${hours}${rest ? `:${String(rest).padStart(2, "0")}` : ""}`;
};

const detectTimezone = {
  zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  async init() {
    return {
      value: `${detectTimezone.zone} (${offset()})`,
      detail: [
        ["resolvedOptions().timeZone", detectTimezone.zone],
        ["getTimezoneOffset()", new Date().getTimezoneOffset()],
      ],
      fingerprint: detectTimezone.zone,
    };
  },
  /**
   * @param {string} ipZone - time zone that ipapi.co gives for your IP
   * @return {string} explanation
   */
  compare(ipZone) {
    return t(
      ipZone === detectTimezone.zone ? "timezone.type.match" : "timezone.type.mismatch",
      ipZone
    );
  },
};

export default detectTimezone;
