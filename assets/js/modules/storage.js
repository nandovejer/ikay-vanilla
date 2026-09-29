/**
 * Tiny wrapper over localStorage. Every key is prefixed with "ikay-".
 * Private windows or blocked storage must not break the app, so every
 * access is guarded.
 */
const PREFIX = "ikay-";
const TYPES = ["sessionLang", "visited", "theme"];

const isValid = (type) => {
  if (!TYPES.includes(type)) {
    console.error(`The type ${type} is not valid`);
    return false;
  }
  return true;
};

const storage = {
  get(type) {
    if (!isValid(type)) return null;
    try {
      return localStorage.getItem(PREFIX + type);
    } catch {
      return null;
    }
  },
  set(type, value) {
    if (!isValid(type)) return;
    try {
      localStorage.setItem(PREFIX + type, value);
    } catch {
      // storage unavailable: the app keeps working without memory
    }
  },
};

export default storage;
