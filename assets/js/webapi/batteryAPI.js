import { noSupport } from "../modules/dom.js";
import { t, formatNumber } from "../i18n.js";

/** Low battery: painted with the alarm accent */
const LOW = 20;
const STATUS = ["hight", "medium", "low", "empty"];

/** seconds -> "1 h 25 min", or "—" when it does not apply */
const duration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const minutes = Math.round(seconds / 60);
  return t("battery.type.duration", Math.floor(minutes / 60), minutes % 60);
};

const batteryAPI = {
  /** @return {Promise<BatteryManager|undefined>} */
  async get() {
    if (!navigator.getBattery) {
      noSupport("battery");
      return undefined;
    }
    try {
      return await navigator.getBattery();
    } catch {
      noSupport("battery");
      return undefined;
    }
  },
  /**
   * Paint the widget. `battery` is a BatteryManager, or anything with the
   * same shape (level, charging, chargingTime, dischargingTime, events).
   */
  set(battery) {
    const scope = document.querySelector(".battery");
    const $ = (selector) => scope.querySelector(selector);

    const updateLevel = () => {
      const level = Math.round(battery.level * 100);
      const status =
        level >= 75 ? "hight" : level >= 45 ? "medium" : level > LOW ? "low" : "empty";
      STATUS.forEach((item) => scope.classList.toggle(`battery--${item}`, item === status));
      scope.style.setProperty("--level", `${level}%`);
      scope.dataset.state = level <= LOW ? "low" : "ok";
      $(".js-battery-level").textContent = formatNumber(level / 100, { style: "percent" });
    };

    const updateMode = () => {
      scope.classList.toggle("battery--charging", battery.charging);
      $(".js-battery-mode").textContent = t(
        battery.charging ? "battery.type.charging" : "battery.type.discharging"
      );
      $(".js-battery-chargedtimme").textContent = battery.charging
        ? duration(battery.chargingTime)
        : "—";
      $(".js-battery-dischargingtime").textContent = battery.charging
        ? "—"
        : duration(battery.dischargingTime);
    };

    // FIRST INIT
    updateLevel();
    updateMode();

    // EVENTS
    battery.addEventListener?.("chargingchange", updateMode);
    battery.addEventListener?.("levelchange", updateLevel);
    battery.addEventListener?.("dischargingtimechange", updateMode);
    battery.addEventListener?.("chargingtimechange", updateMode);
  },
};

export default batteryAPI;
