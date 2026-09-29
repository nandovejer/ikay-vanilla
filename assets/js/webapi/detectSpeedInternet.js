/**
 * Detect internet speed native
 * Native detect speed (Don't work Firefox, Safari)
 * https://developer.mozilla.org/en-US/docs/Glossary/Effective_connection_type
 * @return {string} // slow-2g (2000ms-50Kbps) || 2g (1400ms-70Kbps) || 3g (270ms-700Kbps) || 4g (0ms ∞)
 */
const detectSpeedInternet = {
  init() {
    return navigator.connection?.effectiveType?.toLowerCase();
  },
};

export default detectSpeedInternet;
