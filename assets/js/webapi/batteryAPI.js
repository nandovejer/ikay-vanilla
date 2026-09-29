import { noSupport } from "../modules/dom.js";

const EMOJI = {
  energy: "⚡",
  hight: "🤩",
  medium: "🙃",
  low: "😥",
  empty: "😱",
  charging: "🔌",
};
const STATUS = ["hight", "medium", "low", "empty"];

const toHours = (seconds) =>
  seconds === Infinity ? "Infinity" : `${Math.round((100 * seconds) / 3600) / 100}h`;

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
  set(battery) {
    const scope = document.querySelector(".battery");
    const icon = scope.querySelector(".battery__icon");
    const $ = (selector) => scope.querySelector(selector);

    const updateStatusCSS = (status) => {
      STATUS.forEach((item) => {
        scope.classList.toggle(`battery--${item}`, item === status);
      });
    };

    const updateLevel = () => {
      const level = Math.round(battery.level * 10000) / 100;
      const status =
        level >= 75 ? "hight" : level >= 45 ? "medium" : level >= 16 ? "low" : "empty";
      icon.dataset.level = `${EMOJI[status]} ${level}%`;
      icon.style.backgroundSize = `${level}%`;
      $(".js-battery-level").textContent = `${level}%`;
      updateStatusCSS(status);
    };

    const updateMode = () => {
      scope.classList.toggle("battery--charging", battery.charging);
      $(".js-battery-mode").textContent = battery.charging ? "Charging" : "Battery";
    };

    const updateDischargingTime = () => {
      $(".js-battery-dischargingtime").textContent = battery.charging
        ? "-"
        : toHours(battery.dischargingTime);
    };

    const updateChargingTime = () => {
      $(".js-battery-chargedtimme").textContent = battery.charging
        ? toHours(battery.chargingTime)
        : "-";
    };

    // FIRST INIT
    updateLevel();
    updateMode();
    updateDischargingTime();
    updateChargingTime();

    // EVENTS
    battery.addEventListener("chargingchange", () => {
      updateMode();
      updateDischargingTime();
      updateChargingTime();
    });
    battery.addEventListener("levelchange", updateLevel);
    battery.addEventListener("dischargingtimechange", updateDischargingTime);
    battery.addEventListener("chargingtimechange", updateChargingTime);
  },
};

export default batteryAPI;
