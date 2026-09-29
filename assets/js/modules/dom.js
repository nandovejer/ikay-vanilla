/**
 * Small DOM helpers shared by the modules.
 */

/** Set the text of every element that matches the selector. */
export const setText = (selector, value) => {
  document.querySelectorAll(selector).forEach((item) => {
    item.textContent = value ?? "";
  });
};

/** Set trusted HTML (our own templates) on every element that matches. */
export const setHTML = (selector, value) => {
  document.querySelectorAll(selector).forEach((item) => {
    item.innerHTML = value ?? "";
  });
};

/** Mark a card as "not supported by your browser". */
export const noSupport = (...types) => {
  types.forEach((type) => {
    document.querySelector(`.js-card-${type}`)?.classList.add("noSupport");
  });
};

/** Escape a string before putting it into an HTML template. */
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]
  );

/**
 * Paint a list of [api, value] pairs:
 * <li><code>navigator.webdriver</code> <span>false</span></li>
 * Built with textContent, so values never become HTML.
 */
export const renderDetail = (list, pairs = []) => {
  if (!list) return;
  list.replaceChildren(
    ...pairs.map(([api, value]) => {
      const item = document.createElement("li");
      const code = document.createElement("code");
      const span = document.createElement("span");
      code.textContent = api;
      span.textContent = value === undefined ? "—" : String(value);
      item.append(code, " ", span);
      return item;
    })
  );
};

/** Paint a plain list of strings as <li> items (textContent). */
export const renderList = (list, items = []) => {
  if (!list) return;
  list.replaceChildren(
    ...items.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    })
  );
};
