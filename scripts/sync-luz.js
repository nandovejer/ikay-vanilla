/**
 * Copies the LUZ tokens into assets/vendor/luz/, so the site is served as it
 * is (GitHub Pages, no build) and no visitor's IP address goes to a CDN.
 * Run it after changing the @luz-ds/tokens version in package.json:
 *
 *   npm install && npm run luz:sync
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = resolve(root, "node_modules/@luz-ds/tokens");
const out = resolve(root, "assets/vendor/luz");

const { version } = JSON.parse(readFileSync(resolve(pkg, "package.json"), "utf8"));

mkdirSync(out, { recursive: true });
copyFileSync(resolve(pkg, "dist/tokens.min.css"), resolve(out, "tokens.min.css"));
copyFileSync(resolve(pkg, "LICENSE"), resolve(out, "LICENSE"));
writeFileSync(
  resolve(out, "README.md"),
  `# LUZ tokens ${version}\n\n` +
    "Copy of [`@luz-ds/tokens`](https://github.com/nandovejer/luz/tree/main/packages/tokens) " +
    `${version} (MIT, see \`LICENSE\`): the design tokens, without the web fonts.\n\n` +
    "Do not edit it. To update, change the version in `package.json` and run:\n\n" +
    "```sh\nnpm install && npm run luz:sync\n```\n"
);
console.log(`LUZ tokens ${version} -> assets/vendor/luz/`);
