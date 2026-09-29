import properties, { t } from "../i18n.js";
import { noSupport, setText } from "../modules/dom.js";

const URL_API = "https://ipapi.co/json/";

const locationAPI = {
  /** @return {Promise<object|undefined>} ipapi.co data */
  async init() {
    try {
      const data = await locationAPI.getByIp();
      locationAPI.set(data);
      return data;
    } catch (error) {
      console.error("Error API:", URL_API, error);
      noSupport("location", "ip", "telco");
      return undefined;
    }
  },
  /** @return {Promise<object>} */
  async getByIp() {
    const response = await fetch(URL_API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // ipapi.co answers 200 with { error: true } when the quota is over
    if (data.error) throw new Error(data.reason);
    return data;
  },
  set(data) {
    setText(".js-apiValue-city", data.city ?? data.country_capital);
    setText(".js-apiValue-country", data.country_name);
    setText(".js-apiValue-ip", data.ip);
    setText(".js-apiValue-telco", data.org);
    locationAPI.mapIframe(data.latitude, data.longitude);
  },
  mapIframe(lat, lon) {
    const map = document.querySelector(".js-card-map");
    const params = new URLSearchParams({
      q: `${lat},${lon}`,
      hl: properties.lang(),
      z: 14,
      output: "embed",
    });
    const iframe = document.createElement("iframe");
    Object.assign(iframe, {
      className: "card__map",
      src: `https://maps.google.com/maps?${params}`,
      title: t("location.title"),
      loading: "lazy",
      width: "100%",
      height: "100%",
    });
    iframe.style.border = "0";
    map.replaceChildren(iframe);
  },
};

export default locationAPI;
