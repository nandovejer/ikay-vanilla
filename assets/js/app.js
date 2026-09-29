/**
 * IKAY - entry point
 * Native ES modules, no bundler: the browser loads this file with
 * <script type="module"> and follows the imports.
 * Module scripts are deferred, so the DOM is ready when this runs.
 */
import prepareHTML from "./modules/prepareHTML.js";
import navMenu from "./modules/navMenu.js";
import card from "./modules/card.js";
import sharetime from "./modules/sharetime.js";
import webapi from "./webapi/webapi.js";

document.getElementById("nojs")?.remove();
prepareHTML.init();
navMenu.init();
card.init();
sharetime.init();
webapi.init();
