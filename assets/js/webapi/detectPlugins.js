/**
 * @return {string[]} names of the installed plugins
 */
const detectPlugins = () =>
  Array.from(navigator.plugins ?? [], (item) => item.name);

export default detectPlugins;
