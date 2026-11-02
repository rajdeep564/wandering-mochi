import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { badgeSvg, emptyDiary, forgetHost, nextGuests, recordStop } from "./diary.js";
import { defaultNet, mayVisit, normalizeHost, politeFetch } from "./net.js";
import { hashNumber, isWelcome, linkedHosts, pawScore, reviewFor, sniff, souvenirFor } from "./sniff.js";

const STOPS_PER_WALK = 3;
const PEEK_AGAIN_DAYS = 30;
const PAUSE_MS = 1500;

function hostKey(host) {
  return createHash("sha256").update(host).digest("hex").slice(0, 16);
}

async function fetchHome(host, net) {
  if (!(await mayVisit(host, net))) return { welcome: false };
  const page = await politeFetch(`https://${host}/`, net);
  const isHtml = page.contentType.toLowerCase().includes("html");
  if (page.status !== 200 || !isHtml) return { welcome: false, unreachable: page.status >= 500 };
  return { welcome: isWelcome(page.text) || (await hasInviteFile(host, net)), page };
}

// npm users bundle the cat, so her script is not visible in their HTML.
async function hasInviteFile(host, net) {
  const file = await politeFetch(`https://${host}/mochi.txt`, net);
  return file.status === 200 && file.text.trim().toLowerCase() === "welcome";
}

// Unvisited homepages are checked once a month at most, and only hashes are saved,
// so the public repo never lists sites that did not invite her.
async function peekAt(links, state, now, net, log) {
  const found = [];
  for (const { host, via } of links) {
    const key = hostKey(host);
    const lastPeek = state.peeked[key];
    if (lastPeek && now - new Date(lastPeek) < PEEK_AGAIN_DAYS * 86_400_000) continue;
    state.peeked[key] = now.toISOString();
    await net.sleep(PAUSE_MS);
    try {
      const { welcome } = await fetchHome(host, net);
      if (welcome) found.push({ host, via });
    } catch (error) {
      log(`could not peek at a linked site: ${error.message}`);
    }
  }
  return found;
}

export async function walk({ guests, diary, peeked, now = new Date(), stops = STOPS_PER_WALK, net = defaultNet, log = console.log }) {
  const invited = new Set(guests.map(normalizeHost).filter(Boolean));
  const state = { peeked: { ...peeked } };
  const links = [];

  for (const host of nextGuests(invited, diary, stops)) {
    try {
      const { welcome, page, unreachable } = await fetchHome(host, net);
      if (unreachable) {
        log(`${host} is not answering, trying another day`);
        continue;
      }
      if (!welcome) {
        log(`${host} no longer welcomes Mochi, removing it`);
        invited.delete(host);
        forgetHost(diary, host);
        continue;
      }
      const facts = sniff(page.text, page.ms);
      const seed = hashNumber(`${host}:${now.toISOString().slice(0, 10)}`);
      recordStop(diary, {
        host,
        at: now.toISOString(),
        paws: pawScore(facts),
        review: reviewFor(facts, seed),
        souvenir: souvenirFor(seed),
      });
      for (const link of linkedHosts(page.text, host)) {
        if (!invited.has(link)) links.push({ host: link, via: host });
      }
      log(`visited ${host}`);
    } catch (error) {
      log(`${host} could not be reached: ${error.message}`);
    }
    await net.sleep(PAUSE_MS);
  }

  for (const { host, via } of await peekAt(links, state, now, net, log)) {
    invited.add(host);
    diary.sites[host] = { ...diary.sites[host], foundVia: via };
    log(`found a new welcome mat at ${host}`);
  }

  // A site found this walk has no stop yet, so its first real visit fills in the rest.
  for (const [host, site] of Object.entries(diary.sites)) {
    if (!site.visits) {
      diary.sites[host] = { visits: 0, foundVia: site.foundVia };
    }
  }

  return { guests: [...invited].sort(), diary, peeked: state.peeked };
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeBadges(badgesDir, diary) {
  await mkdir(badgesDir, { recursive: true });
  const visited = Object.entries(diary.sites).filter(([, site]) => site.visits > 0);
  const wanted = new Set(visited.map(([host]) => `${host}.svg`));
  for (const file of await readdir(badgesDir)) {
    if (file.endsWith(".svg") && !wanted.has(file)) await rm(join(badgesDir, file));
  }
  for (const [host, site] of visited) {
    await writeFile(join(badgesDir, `${host}.svg`), badgeSvg(host, site));
  }
}

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const paths = {
    guests: join(root, "docs", "sites.json"),
    diary: join(root, "docs", "diary.json"),
    peeked: join(root, "data", "peeked.json"),
    badges: join(root, "docs", "badges"),
  };
  const result = await walk({
    guests: await readJson(paths.guests, []),
    diary: await readJson(paths.diary, emptyDiary()),
    peeked: await readJson(paths.peeked, {}),
  });
  await writeJson(paths.guests, result.guests);
  await writeJson(paths.diary, result.diary);
  await mkdir(dirname(paths.peeked), { recursive: true });
  await writeJson(paths.peeked, result.peeked);
  await writeBadges(paths.badges, result.diary);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
