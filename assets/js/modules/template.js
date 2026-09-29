import { translate } from "../i18n.js";

/**
 * Clone a <template id="…"> from index.html and translate it.
 * @param {string} id
 * @return {DocumentFragment}
 */
const template = (id) => {
  const tpl = document.getElementById(id);
  if (!tpl) throw new Error(`Template #${id} not found`);
  const fragment = tpl.content.cloneNode(true);
  translate(fragment);
  return fragment;
};

export default template;
