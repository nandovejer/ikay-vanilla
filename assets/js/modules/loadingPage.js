import template from "./template.js";

const config = {
  classNameBody: "loadingEnable",
  // Limit loading in time
  time: 3000,
};

const loadingPage = {
  init() {
    const selector = document.getElementById("loadingPage");
    selector.classList.add("loadingPage");
    selector.replaceChildren(template("tpl-loading"));
    loadingPage.ready();
  },
  ready() {
    if (document.body.classList.contains(config.classNameBody)) {
      loadingPage.close();
    }

    setTimeout(() => {
      if (document.body.classList.contains(config.classNameBody)) {
        loadingPage.close();
        console.error("A lot of time waiting the loading");
      }
    }, config.time);
  },
  open() {
    document.body.classList.add(config.classNameBody);
  },
  close() {
    document.body.classList.remove(config.classNameBody);
  },
};

export default loadingPage;
