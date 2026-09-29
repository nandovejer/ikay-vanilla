/**
 * Accessibility preferences exposed as media queries. Each one that is not
 * the default makes you a bit more unique.
 */
import { t } from "../i18n.js";

const QUERIES = [
  ["prefers-reduced-motion", "reduce"],
  ["prefers-contrast", "more"],
  ["prefers-contrast", "less"],
  ["forced-colors", "active"],
  ["inverted-colors", "inverted"],
  ["prefers-reduced-transparency", "reduce"],
  ["prefers-reduced-data", "reduce"],
];

const detectPreferences = {
  async init() {
    const results = QUERIES.map(([feature, value]) => [
      `(${feature}: ${value})`,
      window.matchMedia(`(${feature}: ${value})`).matches,
    ]);
    const active = results.filter(([, matches]) => matches).length;

    return {
      value: active ? t("preferences.type.some", active) : t("preferences.type.none"),
      detail: results,
      fingerprint: results.map(([, matches]) => Number(matches)).join(""),
    };
  },
};

export default detectPreferences;
