import { createHash } from "node:crypto";
import { normalizeHost } from "./net.js";

const SOUVENIRS = [
  { emoji: "🐟", name: "a fish" },
  { emoji: "🪶", name: "a feather" },
  { emoji: "🧶", name: "some yarn" },
  { emoji: "🌰", name: "an acorn" },
  { emoji: "🔘", name: "a shiny button" },
  { emoji: "🧦", name: "one sock" },
  { emoji: "🍃", name: "a leaf" },
  { emoji: "🐞", name: "a friendly bug" },
];

// Big sites are skipped because they are not going to be hosting a cat.
const BIG_SITES = new Set([
  "facebook.com", "github.com", "google.com", "instagram.com", "linkedin.com",
  "reddit.com", "stackoverflow.com", "twitter.com", "wikipedia.org", "x.com", "youtube.com",
]);

const metaPattern = (name) =>
  new RegExp(
    `<meta\\b(?=[^>]*\\bname=["']?${name}["']?[\\s/>])(?=[^>]*\\bcontent=["']([^"']*)["'])[^>]*>`,
    "i",
  );

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

export function hashNumber(text) {
  return createHash("sha256").update(text).digest().readUInt32BE(0);
}

export function isWelcome(html) {
  const page = stripComments(html);
  if (metaPattern("mochi").exec(page)?.[1].trim().toLowerCase() === "welcome") return true;
  return /<script\b[^>]*\bsrc=["'][^"']*\/mochi\.js(?:[?#][^"']*)?["']/i.test(page);
}

export function sniff(html, ms) {
  const page = stripComments(html);
  return {
    bytes: Buffer.byteLength(html),
    ms,
    images: page.match(/<img\b/gi)?.length ?? 0,
    links: page.match(/<a\b[^>]*\bhref=/gi)?.length ?? 0,
    title: /<title[^>]*>\s*[^<\s]/i.test(page),
    description: Boolean(metaPattern("description").exec(page)?.[1].trim()),
    viewport: metaPattern("viewport").test(page),
    language: /<html\b[^>]*\blang=["'][^"']+["']/i.test(page),
    heading: /<h1\b/i.test(page),
  };
}

export function pawScore(facts) {
  const checks = [facts.title, facts.description, facts.viewport, facts.language, facts.heading];
  return Math.max(1, checks.filter(Boolean).length);
}

export function reviewFor(facts, seed) {
  const lines = [];
  if (facts.bytes > 1_000_000) lines.push("Heavy page. I sat on it and it did not move.");
  if (facts.ms < 300) lines.push("So fast I had no time to stretch.");
  if (facts.ms > 3000) lines.push("Slow enough for a full nap on the doorstep.");
  if (facts.images === 0) lines.push("No pictures to knock off the shelf. Disappointing.");
  if (facts.images > 20) lines.push("So many pictures. I knocked over at least nine.");
  if (facts.links > 100) lines.push("Too many links to chase. I tried anyway.");
  if (facts.bytes < 20_000) lines.push("Tiny and tidy. An excellent nap spot.");
  if (!facts.title) lines.push("No title on the door. Who even lives here?");
  if (!facts.description) lines.push("Nobody told me what this place is. I stayed anyway.");
  if (!facts.viewport) lines.push("I squeezed in through a very narrow phone screen.");
  if (!lines.length) lines.push("Warm, sunny, and nobody moved me off the keyboard.");
  return lines[seed % lines.length];
}

export function souvenirFor(seed) {
  return SOUVENIRS[seed % SOUVENIRS.length];
}

export function linkedHosts(html, ownHost, limit = 5) {
  const hosts = new Set();
  for (const [, href] of stripComments(html).matchAll(/<a\b[^>]*\bhref=["'](https:\/\/[^"']+)["']/gi)) {
    let host;
    try {
      host = normalizeHost(new URL(href).hostname.replace(/^www\./, ""));
    } catch {
      continue;
    }
    if (!host || host === ownHost || BIG_SITES.has(host)) continue;
    hosts.add(host);
    if (hosts.size === limit) break;
  }
  return [...hosts];
}
