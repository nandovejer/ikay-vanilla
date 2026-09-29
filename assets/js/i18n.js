/**
 * i18n without libraries.
 *
 * - One JSON per language (assets/locales/{lang}.json), fetched once with
 *   top-level await, so everything else reads it synchronously.
 * - t("a.b.c", ...params) looks up a dotted key and fills {0}, {1}...
 * - translate(root) paints the declarative attributes of the templates:
 *     data-i18n="a.b"                 -> textContent
 *     data-i18n-html="a.b"            -> innerHTML (trusted translations)
 *     data-i18n-attr="title:a.b;..."  -> attributes
 * - Intl gives the rest for free: language names (Intl.DisplayNames),
 *   text direction (Intl.Locale) and dates (Intl.DateTimeFormat).
 */
import storage from "./modules/storage.js";

/** Supported languages. Add one here and drop its JSON in assets/locales/. */
export const LANGS = ["es", "en", "ar"];
const FALLBACK = "en";

/** Session choice first, then the browser's preferred languages. */
const negotiate = () => {
  const sessionLang = storage.get("sessionLang");
  if (LANGS.includes(sessionLang)) return sessionLang;
  const preferred = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const tag of preferred) {
    const base = new Intl.Locale(tag).language;
    if (LANGS.includes(base)) return base;
  }
  return FALLBACK;
};

const load = async (code) => {
  const response = await fetch(new URL(`../locales/${code}.json`, import.meta.url));
  if (!response.ok) throw new Error(`Cannot load ${code}.json`);
  return response.json();
};

let lang = negotiate();
const texts = await load(lang).catch((error) => {
  console.error(error);
  lang = FALLBACK;
  return load(FALLBACK);
});

/** Replace in str the pattern {0} for each item of params */
const format = (str, ...params) =>
  params.reduce((result, item, index) => result.replaceAll(`{${index}}`, item), str);

/**
 * @param {string} key - dotted path, e.g. "header.location"
 * @return {string} the translation, or the key itself when missing
 */
export const t = (key, ...params) => {
  const value = key.split(".").reduce((node, part) => node?.[part], texts);
  if (typeof value !== "string") {
    console.warn(`i18n: missing key "${key}" (${lang})`);
    return key;
  }
  return format(value, ...params);
};

/** Paint every data-i18n* attribute inside root (element or fragment). */
export const translate = (root = document) => {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":").map((part) => part.trim());
      el.setAttribute(attr, t(key));
    });
  });
};

/** "Español", "English", "العربية": each name in its own language. */
export const langName = (code) => {
  const name = new Intl.DisplayNames([code], { type: "language" }).of(code);
  return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
};

/**
 * A language or locale code in plain words, in the language of the page:
 * "es-US" -> "Spanish (United States)" | "Español (Estados Unidos)".
 * Falls back to the code itself.
 */
export const langLabel = (code) => {
  try {
    const name = new Intl.DisplayNames([lang], {
      type: "language",
      languageDisplay: "standard",
    }).of(code);
    return name ? name.charAt(0).toLocaleUpperCase(lang) + name.slice(1) : code;
  } catch {
    return code;
  }
};

/** "Spanish (United States) and English": a readable list */
export const listLabel = (items) => {
  try {
    return new Intl.ListFormat(lang, { type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
};

/** "rtl" | "ltr" */
export const langDir = (code) => {
  const locale = new Intl.Locale(code);
  const info = locale.getTextInfo?.() ?? locale.textInfo;
  return info?.direction ?? (["ar", "he", "fa", "ur"].includes(code) ? "rtl" : "ltr");
};

const properties = {
  lang: () => lang,
  get: () => texts,
  set: format,
};

export default properties;
