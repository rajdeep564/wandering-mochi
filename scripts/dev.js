import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "docs");
const PORT = Number(process.env.PORT ?? 3412);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, "http://localhost").pathname));
  let file = join(ROOT, path);
  if (!file.startsWith(ROOT)) file = ROOT;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  // MOCHI_DIARY previews the site with sample travels without touching the real diary.
  if (path.endsWith("diary.json") && process.env.MOCHI_DIARY) file = process.env.MOCHI_DIARY;
  if (!existsSync(file)) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
