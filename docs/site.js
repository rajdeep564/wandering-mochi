const SVG_NS = "http://www.w3.org/2000/svg";
const MAP_WIDTH = 640;
const MAP_HEIGHT = 320;
const MAX_MAP_SITES = 14;
const MAX_ENTRIES = 30;

function hash(text) {
  let value = 2166136261;
  for (const char of text) {
    value = Math.imul(value ^ char.codePointAt(0), 16777619);
  }
  return value >>> 0;
}

function pointFor(host) {
  const value = hash(host);
  return {
    x: 70 + (value % 500),
    y: 50 + ((value >>> 12) % 210),
  };
}

function svgElement(name, attributes) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  return element;
}

function drawMap(map, sites, stops) {
  if (!stops.length) {
    const text = svgElement("text", { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, class: "empty" });
    text.textContent = "Her map is blank for now.";
    map.append(text);
    return;
  }

  const hosts = [...new Set(stops.map(({ host }) => host))].slice(0, MAX_MAP_SITES);
  const route = stops
    .filter(({ host }) => hosts.includes(host))
    .slice(0, 40)
    .map(({ host }) => pointFor(host));

  if (route.length > 1) {
    const path = route.map(({ x, y }, index) => `${index ? "L" : "M"}${x} ${y}`).join(" ");
    map.append(svgElement("path", { d: path, class: "trail" }));
  }

  for (const host of hosts) {
    const { x, y } = pointFor(host);
    const radius = Math.min(5 + (sites[host]?.visits ?? 1), 12);
    map.append(svgElement("circle", { cx: x, cy: y, r: radius, class: "home" }));
    const label = svgElement("text", { x, y: y + radius + 16 });
    label.textContent = host;
    map.append(label);
  }
}

function diaryEntry(stop) {
  const entry = document.createElement("li");

  const where = document.createElement("div");
  where.className = "where";
  const host = document.createElement("a");
  host.href = `https://${stop.host}/`;
  host.rel = "noopener nofollow";
  host.textContent = stop.host;
  const time = document.createElement("time");
  time.dateTime = stop.at;
  time.textContent = new Date(stop.at).toLocaleDateString(undefined, { dateStyle: "medium" });
  where.append(host, time);

  const review = document.createElement("p");
  review.className = "review";
  review.textContent = `"${stop.review}"`;

  const gift = document.createElement("span");
  gift.className = "gift";
  gift.textContent = `${"🐾".repeat(stop.paws)} · brought back ${stop.souvenir.emoji} ${stop.souvenir.name}`;

  entry.append(where, review, gift);
  return entry;
}

async function showDiary() {
  const snippetUrl = new URL("mochi.js", window.location.href).href;
  document.getElementById("snippet").textContent = `<script src="${snippetUrl}" defer></script>`;

  const map = document.getElementById("map");
  let diary = { sites: {}, stops: [] };
  try {
    diary = await (await fetch("diary.json")).json();
  } catch {
    // The page still explains itself when the diary can't load.
  }

  const visited = Object.values(diary.sites).filter(({ visits }) => visits > 0);
  document.getElementById("stat-sites").textContent = visited.length;
  document.getElementById("stat-visits").textContent = visited.reduce((total, { visits }) => total + visits, 0);
  if (diary.stops[0]) {
    const { emoji, name } = diary.stops[0].souvenir;
    document.getElementById("stat-gift").textContent = `${emoji} ${name}`;
  }

  drawMap(map, diary.sites, diary.stops);
  document.getElementById("diary-empty").hidden = diary.stops.length > 0;
  document.getElementById("diary").append(...diary.stops.slice(0, MAX_ENTRIES).map(diaryEntry));
}

showDiary();
