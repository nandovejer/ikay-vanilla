/**
 * Keeps the <link rel="modulepreload"> list of index.html in step with the
 * ES modules the page really loads. Without it the browser finds each module
 * only after it has downloaded the one that imports it, a chain of round
 * trips before anything is drawn; with it, they all travel at once.
 *
 *   npm run preload            rewrite the list in index.html
 *   npm run preload -- --check exit 1 if it is out of date (npm run check does)
 *
 * It follows the static imports of assets/js/app.js. Run it after adding,
 * moving or removing a module.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = "assets/js/app.js";
const page = join(root, "index.html");
const START = "    <!-- modulepreload:start (npm run preload) -->";
const END = "    <!-- modulepreload:end -->";

const IMPORT = /(?:^|\n)\s*(?:import|export)\b[^'";]*?\bfrom\s*["'](\.[^"']+)["']|(?:^|\n)\s*import\s*["'](\.[^"']+)["']/g;

/** Breadth first, so the modules the page needs first come first. */
const modules = [entry];
for (let i = 0; i < modules.length; i++) {
  const source = readFileSync(join(root, modules[i]), "utf8");
  for (const match of source.matchAll(IMPORT)) {
    const target = relative(root, normalize(join(root, dirname(modules[i]), match[1] ?? match[2]))).replaceAll("\\", "/");
    if (!modules.includes(target)) modules.push(target);
  }
}

const block = [START, ...modules.slice(1).map((file) => `    <link rel="modulepreload" href="${file}" />`), END].join("\n");
const html = readFileSync(page, "utf8");
const current = html.match(new RegExp(`${START.replace(/[().]/g, "\\$&")}[\\s\\S]*?${END}`))?.[0];
if (!current) throw new Error("index.html has no modulepreload:start / modulepreload:end markers");

if (process.argv.includes("--check")) {
  if (current !== block) {
    console.error("index.html: the modulepreload list is out of date. Run: npm run preload");
    process.exit(1);
  }
  console.log(`modulepreload: ${modules.length - 1} modules, up to date`);
} else {
  writeFileSync(page, html.replace(current, block));
  console.log(`modulepreload: ${modules.length - 1} modules written to index.html`);
}
