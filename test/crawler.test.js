import assert from "node:assert/strict";
import { test } from "node:test";
import { badgeSvg, emptyDiary, nextGuests, recordStop } from "../crawler/diary.js";
import { isPrivateAddress, normalizeHost, politeFetch, robotsAllows } from "../crawler/net.js";
import { isWelcome, linkedHosts, pawScore, sniff } from "../crawler/sniff.js";
import { walk } from "../crawler/walk.js";

const WELCOME = `<html lang="en"><head><title>Hi</title><meta name="mochi" content="welcome"></head><body><h1>Hi</h1></body></html>`;

function fakeWeb(pages, addresses = {}) {
  const requests = [];
  return {
    requests,
    sleep: async () => {},
    lookupImpl: async (host) => [{ address: addresses[host] ?? "93.184.216.34" }],
    fetchImpl: async (url) => {
      requests.push(String(url));
      const page = pages[String(url)];
      if (page instanceof Error) throw page;
      if (!page) return new Response("missing", { status: 404 });
      const { status = 200, headers = { "content-type": "text/html" }, body = "" } = page;
      return new Response(status === 301 ? null : body, { status, headers });
    },
  };
}

const quiet = () => {};
const now = new Date("2026-11-02T06:00:00Z");

test("refuses addresses that are not public", () => {
  for (const address of ["127.0.0.1", "10.1.1.1", "169.254.169.254", "172.16.0.1", "192.168.1.1", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"]) {
    assert.equal(isPrivateAddress(address), true, address);
  }
  assert.equal(isPrivateAddress("93.184.216.34"), false);
  assert.equal(isPrivateAddress("2606:2800:220:1::1"), false);
});

test("accepts only real public host names", () => {
  assert.equal(normalizeHost("Blog.Example.COM."), "blog.example.com");
  for (const host of ["localhost", "127.0.0.1", "printer.local", "a b.com", "evil.com/../x", "metadata.internal"]) {
    assert.equal(normalizeHost(host), null, host);
  }
});

test("will not follow a redirect to a private address", async () => {
  const net = fakeWeb(
    { "https://nice.dev/": { status: 301, headers: { location: "https://sneaky.dev/" } } },
    { "sneaky.dev": "169.254.169.254" },
  );
  await assert.rejects(politeFetch("https://nice.dev/", net), /public address/);
  assert.deepEqual(net.requests, ["https://nice.dev/"]);
});

test("stops reading a page that is too large", async () => {
  const net = fakeWeb({ "https://big.dev/": { body: "x".repeat(3 * 1024 * 1024) } });
  const page = await politeFetch("https://big.dev/", net);
  assert.equal(page.truncated, true);
  assert.ok(page.text.length <= 2 * 1024 * 1024);
});

test("follows robots.txt rules", () => {
  assert.equal(robotsAllows("User-agent: *\nDisallow: /"), false);
  assert.equal(robotsAllows("User-agent: *\nDisallow:"), true);
  assert.equal(robotsAllows("User-agent: *\nDisallow: /\n\nUser-agent: MochiBot\nAllow: /"), true);
  assert.equal(robotsAllows("User-agent: MochiBot\nDisallow: /\n\nUser-agent: *\nAllow: /"), false);
  assert.equal(robotsAllows("User-agent: *\nDisallow: /private"), true);
  assert.equal(robotsAllows(""), true);
});

test("recognises an invitation", () => {
  assert.equal(isWelcome(WELCOME), true);
  assert.equal(isWelcome(`<meta content="welcome" name="mochi">`), true);
  assert.equal(isWelcome(`<script src="https://mochi.is-a.bot/mochi.js" defer></script>`), true);
  assert.equal(isWelcome(`<meta name="mochi" content="no">`), false);
  assert.equal(isWelcome(`<!-- <meta name="mochi" content="welcome"> -->`), false);
  assert.equal(isWelcome(`<p>mochi.js</p>`), false);
});

test("scores a page and collects linked sites", () => {
  assert.equal(pawScore(sniff(WELCOME, 100)), 3);
  const html = `<a href="https://github.com/me">x</a><a href="https://www.friend.dev/about">y</a><a href="https://me.dev/">z</a><a href="/local">l</a>`;
  assert.deepEqual(linkedHosts(html, "me.dev"), ["friend.dev"]);
});

test("visits whoever has waited longest", () => {
  const diary = emptyDiary();
  diary.sites["a.dev"] = { lastVisit: "2026-11-01" };
  diary.sites["b.dev"] = { lastVisit: "2026-10-01" };
  assert.deepEqual(nextGuests(["a.dev", "b.dev", "c.dev"], diary, 2), ["c.dev", "b.dev"]);
});

test("a walk records a visit and finds an invited neighbour", async () => {
  const net = fakeWeb({
    "https://me.dev/": { body: `${WELCOME}<a href="https://friend.dev/">f</a><a href="https://stranger.dev/">s</a>` },
    "https://friend.dev/": { body: WELCOME },
    "https://stranger.dev/": { body: "<html>no cats</html>" },
  });
  const result = await walk({ guests: ["me.dev"], diary: emptyDiary(), peeked: {}, now, net, log: quiet });
  assert.deepEqual(result.guests, ["friend.dev", "me.dev"]);
  assert.equal(result.diary.sites["me.dev"].visits, 1);
  assert.equal(result.diary.sites["friend.dev"].foundVia, "me.dev");
  assert.equal(result.diary.stops.length, 1);
  assert.equal(JSON.stringify(result.peeked).includes("stranger"), false);
  assert.equal(JSON.stringify(result.diary).includes("stranger"), false);
});

test("an invite file works for sites that bundle the cat", async () => {
  const net = fakeWeb({
    "https://bundled.dev/": { body: "<html><title>x</title></html>" },
    "https://bundled.dev/mochi.txt": { headers: { "content-type": "text/plain" }, body: "welcome\n" },
  });
  const result = await walk({ guests: ["bundled.dev"], diary: emptyDiary(), peeked: {}, now, net, log: quiet });
  assert.equal(result.diary.sites["bundled.dev"].visits, 1);
});

test("a page returned for a missing invite file is not an invitation", async () => {
  const net = fakeWeb({
    "https://spa.dev/": { body: "<html><title>x</title></html>" },
    "https://spa.dev/mochi.txt": { body: "<html><title>x</title></html>" },
  });
  const result = await walk({ guests: ["spa.dev"], diary: emptyDiary(), peeked: {}, now, net, log: quiet });
  assert.deepEqual(result.guests, []);
});

test("a site that stops inviting her is forgotten", async () => {
  const diary = emptyDiary();
  recordStop(diary, { host: "gone.dev", at: "2026-10-01T00:00:00Z", paws: 3, review: "ok", souvenir: { emoji: "🐟", name: "a fish" } });
  const net = fakeWeb({ "https://gone.dev/": { body: "<html>bye</html>" } });
  const result = await walk({ guests: ["gone.dev"], diary, peeked: {}, now, net, log: quiet });
  assert.deepEqual(result.guests, []);
  assert.deepEqual(result.diary.sites, {});
  assert.deepEqual(result.diary.stops, []);
});

test("a site that blocks her in robots.txt is left alone", async () => {
  const net = fakeWeb({
    "https://me.dev/robots.txt": { headers: { "content-type": "text/plain" }, body: "User-agent: *\nDisallow: /" },
    "https://me.dev/": { body: WELCOME },
  });
  const result = await walk({ guests: ["me.dev"], diary: emptyDiary(), peeked: {}, now, net, log: quiet });
  assert.deepEqual(net.requests, ["https://me.dev/robots.txt"]);
  assert.deepEqual(result.guests, []);
});

test("a temporary outage keeps the guest and its history", async () => {
  const diary = emptyDiary();
  recordStop(diary, { host: "down.dev", at: "2026-10-01T00:00:00Z", paws: 3, review: "ok", souvenir: { emoji: "🐟", name: "a fish" } });
  const net = fakeWeb({ "https://down.dev/robots.txt": new Error("connection refused") });
  const result = await walk({ guests: ["down.dev"], diary, peeked: {}, now, net, log: quiet });
  assert.deepEqual(result.guests, ["down.dev"]);
  assert.equal(result.diary.sites["down.dev"].visits, 1);
});

test("a recently checked link is not fetched again", async () => {
  const pages = {
    "https://me.dev/": { body: `${WELCOME}<a href="https://stranger.dev/">s</a>` },
    "https://stranger.dev/": { body: "<html></html>" },
  };
  const first = await walk({ guests: ["me.dev"], diary: emptyDiary(), peeked: {}, now, net: fakeWeb(pages), log: quiet });
  const net = fakeWeb(pages);
  await walk({ guests: ["me.dev"], diary: emptyDiary(), peeked: first.peeked, now, net, log: quiet });
  assert.equal(net.requests.some((url) => url.includes("stranger")), false);
});

test("the badge escapes anything unusual", () => {
  const svg = badgeSvg("me.dev", {
    visits: 2,
    paws: 2,
    review: `<script>"&`,
    souvenir: { emoji: "🐟", name: "a fish" },
  });
  assert.equal(svg.includes("<script>"), false);
  assert.ok(svg.includes("2 visits"));
});
