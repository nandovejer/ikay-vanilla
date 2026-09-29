/**
 * User agent parsing without dependencies (replaces ua-parser-js).
 *
 * Chromium browsers freeze part of the classic userAgent string, but they
 * expose the real values through User-Agent Client Hints
 * (navigator.userAgentData). When they exist we read them first; everywhere
 * else we fall back to the userAgent string.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API
 */

const ua = navigator.userAgent;

/** @return {Promise<object|null>} high entropy client hints, when available */
const getClientHints = async () => {
  const data = navigator.userAgentData;
  if (!data?.getHighEntropyValues) return null;
  try {
    return await data.getHighEntropyValues([
      "architecture",
      "bitness",
      "model",
      "platformVersion",
      "fullVersionList",
    ]);
  } catch {
    return null;
  }
};

const match = (regex) => ua.match(regex)?.[1];
const dots = (version) => version?.replace(/_/g, ".");
const join = (...parts) => parts.filter(Boolean).join(" ");

/* ---------- BROWSER ---------- */

// Order matters: most Chromium browsers also say "Chrome" and "Safari"
const BROWSERS = [
  ["Microsoft Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["UC Browser", /UCBrowser\/([\d.]+)/],
  ["Vivaldi", /Vivaldi\/([\d.]+)/],
  ["Yandex", /YaBrowser\/([\d.]+)/],
  ["Internet Explorer", /(?:MSIE |Trident\/.*rv:)([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/],
];

// Brands reported by Client Hints that are not the browser itself
const GENERIC_BRANDS = /^(Chromium|Not.?A.?Brand)$/i;

const getBrowser = (hints) => {
  const brand = hints?.fullVersionList?.find(
    (item) => !GENERIC_BRANDS.test(item.brand)
  );
  let name = brand?.brand.replace(/^Google /, "");
  let version = brand?.version;

  if (!name) {
    const found = BROWSERS.find(([, regex]) => regex.test(ua));
    name = found?.[0];
    version = found && match(found[1]);
  }

  // Brave hides itself as Chrome in the user agent
  if (name === "Chrome" && navigator.brave) name = "Brave";

  return { name, version, major: version?.split(".")[0] };
};

/* ---------- OS ---------- */

const WINDOWS_NT = {
  "10.0": "10",
  "6.3": "8.1",
  "6.2": "8",
  "6.1": "7",
  "6.0": "Vista",
  "5.1": "XP",
};

const getOS = (hints) => {
  const platform = navigator.userAgentData?.platform;
  const platformVersion = hints?.platformVersion;

  if (platform && platformVersion) {
    const major = parseInt(platformVersion, 10);
    switch (platform) {
      case "Windows":
        // https://learn.microsoft.com/microsoft-edge/web-platform/how-to-detect-win11
        return { name: "Windows", version: major >= 13 ? "11" : "10" };
      case "macOS":
        return { name: "macOS", version: platformVersion.replace(/\.0$/, "") };
      case "Chrome OS":
      case "Chromium OS":
        return { name: "Chrome OS", version: platformVersion };
      case "Linux":
        return { name: "Linux" };
      default:
        return { name: platform, version: platformVersion };
    }
  }

  switch (true) {
    case /Windows Phone/.test(ua):
      return { name: "Windows Phone", version: match(/Windows Phone (?:OS )?([\d.]+)/) };
    case /Windows/.test(ua):
      return { name: "Windows", version: WINDOWS_NT[match(/Windows NT ([\d.]+)/)] };
    case /iPhone|iPad|iPod/.test(ua):
      return { name: "iOS", version: dots(match(/OS ([\d_]+) like Mac/)) };
    case /Android/.test(ua):
      return { name: "Android", version: match(/Android ([\d.]+)/) };
    case /CrOS/.test(ua):
      return { name: "Chrome OS", version: match(/CrOS \S+ ([\d.]+)/) };
    case /Mac OS X/.test(ua):
      return { name: "macOS", version: dots(match(/Mac OS X ([\d_.]+)/)) };
    case /Ubuntu/.test(ua):
      return { name: "Ubuntu" };
    case /Linux/.test(ua):
      return { name: "Linux" };
    default:
      return { name: undefined };
  }
};

/* ---------- DEVICE ---------- */

const getDevice = (hints) => {
  const isMobile = navigator.userAgentData?.mobile ?? /Mobile/.test(ua);

  // Android model: from Client Hints or "Android 10; SM-G973F Build/..."
  // Reduced user agents send the placeholder "K" instead of the model.
  let model = hints?.model || match(/Android [\d.]+; ([^;)]+?)(?: Build|\))/);
  if (model === "K") model = undefined;

  return {
    model,
    type: model ? (isMobile ? "mobile" : "tablet") : undefined,
    vendor: undefined,
  };
};

/* ---------- CPU ---------- */

const getCPU = (hints) => {
  if (hints?.architecture) {
    const arch = hints.architecture;
    const is64 = hints.bitness === "64";
    if (arch === "x86") return { architecture: is64 ? "amd64" : "ia32" };
    if (arch === "arm") return { architecture: is64 ? "arm64" : "arm" };
    return { architecture: arch };
  }

  switch (true) {
    case /x86_64|x86-64|Win64|WOW64|x64|amd64/i.test(ua):
      return { architecture: "amd64" };
    case /aarch64|arm64/i.test(ua):
      return { architecture: "arm64" };
    case /armv\d|arm/i.test(ua):
      return { architecture: "arm" };
    case /i[3-6]86|x86/i.test(ua):
      return { architecture: "ia32" };
    default:
      return { architecture: undefined };
  }
};

/**
 * Parse everything once.
 * @return {Promise<{browser, os, device, cpu}>}
 */
const parseUserAgent = async () => {
  const hints = await getClientHints();
  return {
    browser: getBrowser(hints),
    os: getOS(hints),
    device: getDevice(hints),
    cpu: getCPU(hints),
  };
};

export { join };
export default parseUserAgent;
