/**
 * BASIC MODAL JS
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
      if (event.target.closest("[data-caimodal-action='close']")) {
        caimodal.close();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && caimodal.isOpen()) caimodal.close();
    });
    return scope;
  },
  isOpen() {
    return scope?.dataset.caimodalStatus === "open";
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

    lastFocus = document.activeElement;
    document.body.dataset.caimodalStatus = "open";
    scope.dataset.caimodalStatus = "open";
    scope.querySelector(".caimodalBox").focus();
    current.callbackOpen?.();
  },
  close() {
    document.body.dataset.caimodalStatus = "";
    scope.dataset.caimodalStatus = "";
    lastFocus?.focus?.();
    current.callbackClose?.();
  },
};

export default caimodal;
