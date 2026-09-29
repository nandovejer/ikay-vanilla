/**
 * Regional formats: they depend on the language and region of your system.
 */
import { t, langLabel, listLabel } from "../i18n.js";

const detectLocale = {
  async init() {
    const date = Intl.DateTimeFormat().resolvedOptions();
    const number = Intl.NumberFormat().resolvedOptions();
    const example = new Intl.NumberFormat().format(1234567.89);
    const hourCycle = new Intl.DateTimeFormat(undefined, { hour: "numeric" })
      .resolvedOptions().hourCycle;
    const preferred = navigator.languages ?? [navigator.language];
    const languages = preferred.join(", ");

    return {
      value: langLabel(date.locale),
      note: `${t("locale.type.example", example)} ${t("locale.type.languages", listLabel(preferred.map(langLabel)))}`,
      detail: [
        ["navigator.languages", languages],
        ["resolvedOptions().locale", date.locale],
        ["resolvedOptions().calendar", date.calendar],
        ["resolvedOptions().numberingSystem", number.numberingSystem],
        ["resolvedOptions().hourCycle", hourCycle],
        ["new Date().toLocaleString()", new Date(2000, 11, 31, 23, 59).toLocaleString()],
      ],
      fingerprint: [date.locale, date.calendar, number.numberingSystem, hourCycle, languages].join("|"),
    };
  },
};

export default detectLocale;
