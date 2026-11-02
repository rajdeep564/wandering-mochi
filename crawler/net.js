import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const USER_AGENT = "MochiBot/0.1 (+https://mochi.is-a.bot/bot.html)";
const ROBOT_TOKEN = "mochibot";
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const BLOCKED_SUFFIXES = [".local", ".internal", ".localhost", ".test", ".example", ".invalid", ".onion"];

export const defaultNet = {
  fetchImpl: fetch,
  lookupImpl: (host) => lookup(host, { all: true }),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

export function normalizeHost(value) {
  const host = String(value).trim().toLowerCase().replace(/\.$/, "");
  if (host.length > 253 || isIP(host)) return null;
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) return null;
  return BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix)) ? null : host;
}

export function isPrivateAddress(address) {
  const mapped = address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateAddress(mapped[1]);

  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }

  const text = address.toLowerCase();
  return text === "::" || text === "::1" || /^(?:f[cd]|fe[89ab]|ff)/.test(text);
}

async function assertPublicUrl(url, net) {
  if (url.protocol !== "https:" || url.port || url.username || url.password) {
    throw new Error(`refusing ${url.href}`);
  }
  const host = normalizeHost(url.hostname);
  if (!host) throw new Error(`refusing host ${url.hostname}`);
  const addresses = await net.lookupImpl(host);
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error(`${host} does not resolve to a public address`);
  }
}

async function readCapped(response) {
  if (!response.body) return { text: "", truncated: false };
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) return { text: Buffer.concat(chunks).toString("utf8"), truncated: false };
    chunks.push(value);
    size += value.length;
  }
  await reader.cancel();
  return { text: Buffer.concat(chunks).toString("utf8").slice(0, MAX_BYTES), truncated: true };
}

// Each redirect is checked again, so a public page can't send her somewhere private.
export async function politeFetch(address, net = defaultNet) {
  let url = new URL(address);
  const startedAt = Date.now();
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertPublicUrl(url, net);
    const response = await net.fetchImpl(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": USER_AGENT, accept: "text/html,text/plain;q=0.9" },
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      url = new URL(location, url);
      continue;
    }
    const { text, truncated } = await readCapped(response);
    return {
      url: url.href,
      status: response.status,
      contentType: response.headers.get("content-type") ?? "",
      text,
      truncated,
      ms: Date.now() - startedAt,
    };
  }
  throw new Error(`too many redirects from ${address}`);
}

function patternToRegex(pattern) {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

function parseRobotGroups(text) {
  const groups = [];
  let current = null;
  let readingAgents = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === "user-agent") {
      if (!readingAgents) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      readingAgents = true;
    } else if (current && (field === "allow" || field === "disallow")) {
      readingAgents = false;
      if (value) current.rules.push({ allow: field === "allow", pattern: value });
    }
  }
  return groups;
}

export function robotsAllows(text, path = "/") {
  const groups = parseRobotGroups(text);
  const named = groups.filter(({ agents }) => agents.some((agent) => agent !== "*" && ROBOT_TOKEN.includes(agent)));
  const chosen = named.length ? named : groups.filter(({ agents }) => agents.includes("*"));
  const rules = chosen.flatMap(({ rules: groupRules }) => groupRules);
  const matches = rules
    .filter(({ pattern }) => patternToRegex(pattern).test(path))
    .sort((a, b) => b.pattern.length - a.pattern.length || Number(b.allow) - Number(a.allow));
  return matches.length ? matches[0].allow : true;
}

// When robots.txt can't be read because the server is failing, she stays out.
export async function mayVisit(host, net = defaultNet) {
  const robots = await politeFetch(`https://${host}/robots.txt`, net);
  if (robots.status >= 500) return false;
  if (robots.status >= 400) return true;
  return robotsAllows(robots.text);
}
