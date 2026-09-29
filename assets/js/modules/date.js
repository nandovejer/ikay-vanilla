const PATTERNS = {
  // Viernes
  day: { weekday: "long" },
  // octubre
  month: { month: "long" },
  // 2020
  year: { year: "numeric" },
  // "viernes, 9 de octubre de 2020"
  longDate: { weekday: "long", year: "numeric", month: "long", day: "numeric" },
};

const date = {
  time(el) {
    const tick = () => {
      el.textContent = new Date().toLocaleTimeString();
    };
    return setInterval(tick, 1000);
  },
  /**
   * @param {"day"|"month"|"year"|"longDate"} [type] - default "9/10/2020"
   */
  today(type) {
    return new Intl.DateTimeFormat(navigator.language, PATTERNS[type]).format(
      new Date()
    );
  },
};

export default date;
