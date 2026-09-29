/**
 * No more full-screen loader: a thin progress bar at the top of the page
 * tells how many cards are still being read, while every card shows its own
 * skeleton. body.loadingEnable is removed when everything is done.
 */
import template from "./template.js";

const config = {
  classNameBody: "loadingEnable",
  // Limit loading in time
  time: 20000,
};

let bar;

const loadingPage = {
  init() {
    const selector = document.getElementById("loadingPage");
    selector.classList.add("loadingPage");
    selector.replaceChildren(template("tpl-loading"));
    bar = selector.querySelector(".js-loading-bar");
    loadingPage.ready();
  },
  ready() {
    setTimeout(() => {
      if (document.body.classList.contains(config.classNameBody)) loadingPage.close();
    }, config.time);
  },
  /** @param {number} ratio - 0..1 */
  progress(ratio) {
    if (!bar) return;
    const percent = Math.round(ratio * 100);
    bar.style.setProperty("--progress", ratio);
    bar.setAttribute("aria-valuenow", percent);
    if (percent >= 100) loadingPage.close();
  },
  open() {
    document.body.classList.add(config.classNameBody);
  },
  close() {
    document.body.classList.remove(config.classNameBody);
  },
};

export default loadingPage;
