/**
 * Support: Edge | Chrome | Opera | Android Browser | Samsung Internet
 * @return {string|undefined}
 */
const detectRam = {
  init() {
    const ram = navigator.deviceMemory;
    return ram ? `${ram}GB` : undefined;
  },
};

export default detectRam;
