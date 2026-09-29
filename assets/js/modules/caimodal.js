/**
 * BASIC MODAL JS, on a native <dialog> (showModal): focus trap, Esc,
 * top layer and ::backdrop come from the browser.
 * One modal for the whole page (<template id="tpl-caimodal">), filled on demand:
 *
 * caimodal.open({
 *   title: "…",            // plain text
 *   tplMain: "<p>…</p>",   // trusted HTML or a Node
 *   tplFooter: "",         // trusted HTML
 *   callbackOpen: () => {},
 *   callbackClose: () => {},
 * });
 */
import template from "./template.js";

let scope;
let current = {};
let lastFocus;

const caimodal = {
  /** Paint the modal once and bind its close events */
  init() {
    if (scope) return scope;
    const container = document.getElementById("caimodal");
    container.classList.add("enable");
    container.replaceChildren(template("tpl-caimodal"));
    scope = container.querySelector(".js-caimodal");

    scope.addEventListener("click", (event) => {
      // event.target === dialog only when clicking the ::backdrop
      if (event.target === scope || event.target.closest("[data-caimodal-action='close']")) {
        caimodal.close();
      }
    });
    // Esc (cancel) and close() end here
    scope.addEventListener("close", () => {
      document.body.dataset.caimodalStatus = "";
      scope.dataset.caimodalStatus = "";
      lastFocus?.focus?.();
      current.callbackClose?.();
    });
    return scope;
  },
  isOpen() {
    return Boolean(scope?.open);
  },
  open(options = {}) {
    caimodal.init();
    current = options;
    const main = scope.querySelector(".js-caimodal-main");
    scope.querySelector(".js-caimodal-title").textContent = options.title ?? "";
    if (options.tplMain instanceof Node) {
      main.replaceChildren(options.tplMain);
    } else {
      main.innerHTML = options.tplMain ?? "";
    }
    scope.querySelector(".js-caimodal-footer").innerHTML = options.tplFooter ?? "";

    if (!scope.open) lastFocus = document.activeElement;
    document.body.dataset.caimodalStatus = "open";
    scope.dataset.caimodalStatus = "open";
    if (!scope.open) scope.showModal();
    current.callbackOpen?.();
  },
  close() {
    if (scope?.open) scope.close();
  },
};

export default caimodal;
