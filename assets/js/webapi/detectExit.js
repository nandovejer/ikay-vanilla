import { t } from "../i18n.js";
import date from "../modules/date.js";
import storage from "../modules/storage.js";
import { escapeHTML } from "../modules/dom.js";

const detectExit = {
  /**
   * Save this visit and return every visit as <li> items
   * @return {string} HTML
   */
  init() {
    const visits = detectExit.checkAndSave();
    detectExit.updateTitle(visits.length === 1 ? "first" : "several");
    return visits.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  },
  updateTitle(status) {
    document.querySelectorAll(".js-apiValue-exitTitle").forEach((item) => {
      item.textContent = t(status === "first" ? "exit.firsttime" : "exit.severaltimes");
    });
  },
  /** Old versions saved a comma separated string, new ones save JSON */
  read() {
    const saved = storage.get("visited");
    if (!saved) return [];
    try {
      const visits = JSON.parse(saved);
      if (Array.isArray(visits)) return visits;
    } catch {
      // legacy format
    }
    return saved.split(",").filter(Boolean);
  },
  checkAndSave() {
    const visits = [...detectExit.read(), detectExit.takeDateTime()];
    storage.set("visited", JSON.stringify(visits));
    return visits;
  },
  takeDateTime() {
    return `${date.today()} - ${new Date().toLocaleTimeString()}`;
  },
};

export default detectExit;
