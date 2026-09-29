/**
 * SHA-256 as hex with the Web Crypto API.
 * crypto.subtle only exists in secure contexts (https or localhost), so
 * there is a small non-cryptographic fallback (cyrb53) for anything else.
 * @param {string} text
 * @return {Promise<string>}
 */
const hash = async (text) => {
  if (globalThis.crypto?.subtle) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buffer), (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ char, 2654435761);
    h2 = Math.imul(h2 ^ char, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
};

export default hash;
