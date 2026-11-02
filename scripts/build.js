import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sprite = await readFile(join(root, "docs", "oneko.gif"));
const spriteUrl = `data:image/gif;base64,${sprite.toString("base64")}`;
const source = (await readFile(join(root, "src", "cat.js"), "utf8")).replace("__SPRITE_URL__", spriteUrl);

await mkdir(join(root, "dist"), { recursive: true });
await writeFile(join(root, "dist", "index.js"), source);

// The script tag version reads its settings from data attributes.
const scriptVersion = `(() => {
${source.replace("export function adoptMochi", "function adoptMochi")}
const script = document.currentScript;
adoptMochi({
  name: script.dataset.name,
  owner: script.dataset.owner,
  photo: script.dataset.photo,
  home: new URL(".", script.src).href,
});
})();
`;
await writeFile(join(root, "docs", "mochi.js"), scriptVersion);
