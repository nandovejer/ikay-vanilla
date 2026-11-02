import template from "./template.js";
import caimodal from "./caimodal.js";
import summary from "./summary.js";
import properties, { t } from "../i18n.js";

/** Cards with their own <template id="tpl-card-{type}"> */
const CUSTOM = [
  "location",
  "exit",
  "connection",
  "battery",
  "fingerprint",
  "canvas",
  "behaviour",
  "motion",
];

/** Texts that mean "nothing here yet" in the templates */
const PLACEHOLDERS = new Set(["", "...", "…", "-"]);
const isFilled = (el) =>
  el.childElementCount > 0 || !PLACEHOLDERS.has(el.textContent.trim());

/** Values that are already a whole phrase: shown without the sentence */
const BARE_WHEN_LONGER = { orientation: 24 };

/** Is there a translation for this key? (optional per-card texts) */
const has = (key) =>
  typeof key.split(".").reduce((node, part) => node?.[part], properties.get()) === "string";

/** Topic of each card (not shown on the card: the sentence is the heading) */
const TITLE_KEY = { exit: "exit.eyebrow" };
const titleOf = (type) => t(TITLE_KEY[type] ?? `${type}.title`);

/** After this, whatever is still loading stops shimmering */
const TIMEOUT = 20000;

const STATUS = {
  pending: "main.status.checking",
  stale: "main.status.checking",
  ready: "main.status.exposed",
  blocked: "main.status.protected",
};

/** "Your device's memory" -> "your device's memory", to go mid-sentence */
const midSentence = (text) =>
  text.charAt(0).toLocaleLowerCase(properties.lang()) + text.slice(1);

/**
 * Put the translated sentence around the value element:
 * "Your screen measures {0} pixels." -> text, <strong>value</strong>, text.
 * Texts are text nodes: values are never turned into HTML here.
 */
const sentence = (paragraph, key) => {
  // {0}, {1}... are the <strong> values, in order
  const values = [...paragraph.querySelectorAll("strong")];
  const parts = t(key).split(/\{\d\}/);
  const wrap = (text) => {
    const span = document.createElement("span");
    span.className = "card__sentenceText";
    span.textContent = text;
    return span;
  };
  const nodes = [];
  parts.forEach((text, index) => {
    nodes.push(wrap(text));
    const value = values[index];
    if (value && index < parts.length - 1) {
      // numbers and latin text stay left to right inside arabic sentences
      value.setAttribute("dir", "auto");
      nodes.push(value);
    }
  });
  paragraph.replaceChildren(...nodes);
};

const card = {
  /** Paint the cards listed in each <section data-cards="…"> into its .js-cards */
  render() {
    document.querySelectorAll("[data-cards]").forEach((section) => {
      const target = section.querySelector(".js-cards") ?? section;
      section.dataset.cards
        .split(/\s+/)
        .forEach((type) => target.append(card.create(type)));
    });
  },
  /** @return {DocumentFragment} */
  create(type) {
    const fragment = CUSTOM.includes(type) ? template(`tpl-card-${type}`) : card.generic(type);
    card.prepare(fragment, type);
    return fragment;
  },
  generic(type) {
    const fragment = template("tpl-card");
    fragment.querySelector(".card").classList.add(`js-card-${type}`, `card--${type}`);
    fragment.querySelector(".js-card-value").classList.add(`js-apiValue-${type}`);
    fragment.querySelector(".js-card-description").classList.add(`js-apiDetail-${type}`);
    fragment.querySelector("[data-sentence]").dataset.sentence = `${type}.sentence`;
    fragment.querySelectorAll("[data-i18n-plain]").forEach((el) => {
      el.textContent = t(`${type}.plain`);
    });
    return fragment;
  },
  /** Sentences, status and the "protected" line, for every kind of card */
  prepare(fragment, type) {
    // anchor for the rows of the summary sheet
    const article = fragment.querySelector(".js-card");
    if (article) article.id = `card-${type}`;
    fragment.querySelectorAll("[data-sentence]").forEach((paragraph) => {
      sentence(paragraph, paragraph.dataset.sentence);
    });
    fragment.querySelectorAll(".js-card-status").forEach((el) => {
      el.textContent = t(STATUS.pending);
    });
    // "Your browser doesn't share <the title>." or the card's own wording
    const own = has(`${type}.protected`);
    fragment.querySelectorAll(".js-card-protected").forEach((el) => {
      const pattern = t(own ? `${type}.protected` : "main.protectedSentence");
      const [before = "", between = "", after = ""] = pattern.split(/\{0\}|\{1\}/);
      const verb = document.createElement("strong");
      verb.textContent = t(own ? `${type}.protectedVerb` : "main.protectedVerb");
      el.replaceChildren(before, verb, between, own ? "" : midSentence(titleOf(type)), after);
    });
    // Typefaces: the list is the point, so it is open and introduced in words
    if (type === "fonts") {
      const proof = fragment.querySelector(".card__proof");
      if (proof) {
        const intro = document.createElement("p");
        intro.className = "card__listIntro";
        intro.textContent = t("fonts.listLabel");
        const list = proof.querySelector(".js-card-detail");
        (fragment.querySelector(".card__lead") ?? proof).before(intro, list);
        list.classList.add("card__api--visible");
        proof.remove();
      }
    }
  },
  typeOf(article) {
    return article.className.match(/js-card-(\w+)/)?.[1];
  },
  /** "?" button of every card opens its explanation */
  init() {
    const txt = properties.get();
    document.querySelectorAll(".js-card").forEach((article) => {
      const type = card.typeOf(article);
      const more = article.querySelector(".js-card-more");
      const label = t("main.more", titleOf(type));
      more.setAttribute("aria-label", label);
      more.title = label;

      const modalinfo = txt[type]?.modalinfo;
      if (!modalinfo) {
        more.hidden = true;
        return;
      }
      more.addEventListener("click", () => {
        caimodal.open({
          title: modalinfo.title,
          tplMain: modalinfo.description,
          tplFooter: modalinfo.moreinfo,
        });
      });
    });
    card.track();
  },
  /**
   * Card state, read from the DOM so the detectors stay untouched:
   *   pending  -> its .js-card-value still shows the placeholder (skeleton)
   *   ready    -> a detector filled it
   *   blocked  -> .noSupport (the browser does not share it)
   *   stale    -> still empty after TIMEOUT
   * The status pill says "protected" for blocked cards and for .card--win.
   */
  track() {
    const main = document.getElementById("appMain");
    const cards = [...main.querySelectorAll(".js-card")];
    let queued = false;
    let timedOut = false;

    const update = () => {
      queued = false;
      cards.forEach(card.sync);
      main.querySelectorAll("[data-skeleton]").forEach((el) => {
        if (timedOut || isFilled(el)) el.removeAttribute("data-skeleton");
      });
      const states = cards.map((article) => {
        let state = "ready";
        if (article.classList.contains("noSupport")) state = "blocked";
        else if (article.querySelector(".js-card-value[data-skeleton]")) state = "pending";
        else if (timedOut && !card.hasValue(article)) state = "stale";
        if (article.dataset.state !== state) {
          article.dataset.state = state;
          article.setAttribute("aria-busy", String(state === "pending"));
        }
        // protected: only the protected sentence remains as the heading, the
        // "shared" sentence (and any fallback text in it) leaves the page
        if (state === "blocked") {
          article.querySelectorAll(".card__sentence").forEach((el) => el.remove());
        }
        const status = article.classList.contains("card--win") ? "blocked" : state;
        const label = article.querySelector(".js-card-status");
        if (label && label.dataset.status !== status) {
          label.dataset.status = status;
          label.textContent = t(STATUS[status]);
        }
        if (state === "ready") card.fit(article);
        return state;
      });
      summary.update(cards, states);
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    new MutationObserver(schedule).observe(main, {
      subtree: true,
      childList: true,
      characterData: true,
      attributeFilter: ["class"],
    });
    summary.init(cards);
    update();
    setTimeout(() => {
      timedOut = true;
      schedule();
    }, TIMEOUT);
  },
  /** Values that live somewhere else in the card: mirrors and the visit count */
  sync(article) {
    // each typeface name written in its own typeface (our own list of names)
    article.querySelectorAll(".card__api--visible li:not([style])").forEach((item) => {
      item.style.fontFamily = `"${item.textContent}", var(--luz-font-body)`;
    });
    article.querySelectorAll("[data-mirror]").forEach((el) => {
      const text = article.querySelector(el.dataset.mirror)?.textContent ?? "";
      if (el.textContent !== text) el.textContent = text;
    });
    // "Your battery is at 82 %" + " and charging." while it charges
    const battery = article.querySelector(".battery");
    if (battery) {
      const after = article.querySelector(".card__sentence .card__sentenceText:last-child");
      const text = t(battery.classList.contains("battery--charging") ? "battery.afterCharging" : "battery.afterIdle");
      if (after && after.textContent !== text) after.textContent = text;
    }
    const count = article.querySelector(".js-exit-count");
    if (count) {
      const visits = article.querySelectorAll(".js-apiValue-exit li").length;
      if (visits) {
        const rule = new Intl.PluralRules(properties.lang()).select(visits);
        const text = t(`exit.times.${rule === "one" ? "one" : "other"}`, visits);
        if (count.textContent !== text) count.textContent = text;
      }
    }
  },
  /** Long values (GPU names, sentences) get a smaller type size */
  fit(article) {
    const value = article.querySelector("strong.js-card-value");
    if (!value) return;
    const length = value.textContent.trim().length;
    value.dataset.length = length > 40 ? "long" : length > 16 ? "medium" : "short";
    const bare = BARE_WHEN_LONGER[card.typeOf(article)];
    article.classList.toggle("card--bare", Boolean(bare && length > bare));
  },
  hasValue(article) {
    const value = article.querySelector(".js-card-value");
    return !value || isFilled(value);
  },
};

export default card;
