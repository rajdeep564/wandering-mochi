// Wandering Mochi website. Plain JS, no dependencies.
// Everything that comes from the crawled diary is inserted with textContent.

const SVG_NS = "http://www.w3.org/2000/svg";
const MAX_ENTRIES = 30;
const FIRST_PAGE = 6;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function hash(text) {
  let value = 2166136261;
  for (const char of text) {
    value = Math.imul(value ^ char.codePointAt(0), 16777619);
  }
  return value >>> 0;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- Paw icons ---------- */

function pawIcon(filled) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", filled ? "paw on" : "paw");
  const shapes = [
    ["ellipse", { cx: 12, cy: 16, rx: 5.2, ry: 4.4 }],
    ["ellipse", { cx: 5.2, cy: 10.4, rx: 2.2, ry: 2.8 }],
    ["ellipse", { cx: 9.4, cy: 6.2, rx: 2.2, ry: 2.9 }],
    ["ellipse", { cx: 14.6, cy: 6.2, rx: 2.2, ry: 2.9 }],
    ["ellipse", { cx: 18.8, cy: 10.4, rx: 2.2, ry: 2.8 }],
  ];
  for (const [name, attrs] of shapes) {
    const shape = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) shape.setAttribute(key, value);
    svg.append(shape);
  }
  return svg;
}

function pawScore(paws) {
  const score = Math.max(0, Math.min(5, Math.round(Number(paws) || 0)));
  const wrap = el("span", "paws");
  wrap.setAttribute("role", "img");
  wrap.setAttribute("aria-label", `${score} out of 5 paws`);
  for (let i = 0; i < 5; i += 1) wrap.append(pawIcon(i < score));
  return wrap;
}

/* ---------- Copy buttons ---------- */

const copyStatus = document.getElementById("copy-status");

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-copy]");
  if (!button) return;
  const source = document.getElementById(button.dataset.copy);
  const text = source ? source.textContent.trim() : "";
  if (!text) return;
  const ok = await copyText(text);
  clearTimeout(button._resetTimer);
  button.classList.toggle("copied", ok);
  button.classList.toggle("failed", !ok);
  button.textContent = ok ? "Copied ✓" : "Press Ctrl+C";
  copyStatus.textContent = ok ? "Copied to clipboard." : "Could not copy. Select the text and copy it manually.";
  if (!ok && source) {
    const range = document.createRange();
    range.selectNodeContents(source);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
  button._resetTimer = setTimeout(() => {
    button.classList.remove("copied", "failed");
    button.textContent = "Copy";
  }, 2000);
});

/* ---------- Diary ---------- */

const STAMP_SHAPES = ["rect", "circle", "oval", "ticket"];

function stampEntry(stop, index, shape) {
  const seed = hash(`${stop.host}|${stop.at}`);
  const entry = el("li", "entry");
  entry.style.setProperty("--tilt", `${(seed % 11) - 5}deg`);
  entry.style.setProperty("--shift", `${(seed >>> 4) % 14}px`);
  entry.style.setProperty("--i", index % FIRST_PAGE);
  // Inks alternate so red and teal both show up from the second stamp.
  entry.dataset.ink = index % 2 ? "secondary" : "accent";
  entry.dataset.shape = shape;

  const stamp = el("div", "stamp");
  stamp.append(el("span", "stamp-top", "Arrived · Mochi"));
  const host = el("a", "stamp-host", stop.host);
  host.href = `https://${stop.host}/`;
  host.rel = "noopener nofollow";
  stamp.append(host);
  const time = el("time", "stamp-date", formatDate(stop.at));
  time.dateTime = stop.at;
  stamp.append(time, pawScore(stop.paws));

  const note = el("div", "entry-note");
  const quote = el("blockquote", "review");
  quote.append(el("p", "", `“${stop.review}”`));
  note.append(quote);

  if (stop.souvenir) {
    const gift = el("p", "souvenir");
    gift.append(el("span", "souvenir-label", "Brought back"));
    gift.append(el("span", "souvenir-emoji", stop.souvenir.emoji));
    gift.append(el("span", "souvenir-name", stop.souvenir.name));
    note.append(gift);
  }

  entry.append(stamp, note);
  return entry;
}

function placeholderSlot(text) {
  const slot = el("li", "entry slot");
  slot.setAttribute("aria-hidden", "true");
  slot.append(el("span", "slot-text", text));
  return slot;
}

function firstPageSlot() {
  const slot = el("li", "entry slot first-page");
  const ring = el("span", "ghost-stamp", "Your site here");
  ring.setAttribute("aria-hidden", "true");
  const text = el("p", "slot-text", "The first page is still blank. Your site could be her first stamp: ");
  text.append(el("code", "", "npx wandering-mochi invite"));
  slot.append(ring, text);
  return slot;
}

const SLOT_LINES = [
  "Reserved for her next stamp.",
  "Space kept free for a future nap.",
  "Blank. She is stretching first.",
];

function renderDiary(stops) {
  const list = document.getElementById("diary");
  list.replaceChildren();
  const entries = stops.slice(0, MAX_ENTRIES);

  let previousShape = "";
  entries.forEach((stop, index) => {
    // Each stop gets a shape from its own hash, nudged so neighbours never match.
    let shapeIndex = hash(`${stop.host}|${stop.at}`) % STAMP_SHAPES.length;
    if (STAMP_SHAPES[shapeIndex] === previousShape) shapeIndex = (shapeIndex + 1) % STAMP_SHAPES.length;
    previousShape = STAMP_SHAPES[shapeIndex];
    const entry = stampEntry(stop, index, previousShape);
    if (index >= FIRST_PAGE) entry.hidden = true;
    list.append(entry);
  });

  // Keep the passport spread looking intentional with 0 or 1 stamps.
  const shown = Math.min(entries.length, FIRST_PAGE);
  if (!shown) {
    list.append(firstPageSlot());
  } else if (shown % 2) {
    list.append(placeholderSlot(SLOT_LINES[0]));
  }

  if (entries.length > FIRST_PAGE) {
    const more = el("button", "button small more", `Show all ${entries.length} stamps`);
    more.type = "button";
    more.addEventListener("click", () => {
      list.querySelectorAll(".entry[hidden]").forEach((node) => (node.hidden = false));
      list.querySelectorAll(".slot").forEach((node) => node.remove());
      if (entries.length % 2) list.append(placeholderSlot(SLOT_LINES[0]));
      more.remove();
      list.querySelector(`.entry:nth-child(${FIRST_PAGE + 1}) a`)?.focus();
    });
    list.after(more);
  }
}

async function loadDiary() {
  const status = document.getElementById("diary-status");
  const lastJudged = document.getElementById("last-judged");
  status.hidden = false;
  status.className = "diary-status";
  status.textContent = "Unpacking her suitcase…";
  document.querySelector(".travels .more")?.remove();

  let diary;
  try {
    const response = await fetch("diary.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(String(response.status));
    diary = await response.json();
  } catch {
    status.className = "diary-status error";
    status.textContent = "Her diary is underneath her and she will not move. ";
    const retry = el("button", "button small", "Try again");
    retry.type = "button";
    retry.addEventListener("click", loadDiary);
    status.append(retry);
    lastJudged.textContent = "Notes misplaced";
    for (const id of ["stat-sites", "stat-visits", "stat-gift"]) document.getElementById(id).textContent = "–";
    renderDiary([]);
    return;
  }

  const sites = diary && typeof diary.sites === "object" && diary.sites ? diary.sites : {};
  const stops = Array.isArray(diary?.stops) ? diary.stops.filter((stop) => stop && stop.host) : [];
  const visited = Object.entries(sites).filter(([, site]) => site && site.visits > 0);

  document.getElementById("stat-sites").textContent = visited.length;
  document.getElementById("stat-visits").textContent = visited.reduce((total, [, site]) => total + site.visits, 0);
  const gift = document.getElementById("stat-gift");
  if (stops[0]?.souvenir) {
    gift.replaceChildren(
      el("span", "gift-emoji", stops[0].souvenir.emoji),
      el("span", "gift-name", stops[0].souvenir.name),
    );
  } else {
    gift.textContent = "Nothing yet";
  }

  lastJudged.textContent = stops[0] ? stops[0].host : "Nobody yet. Suspicious.";

  if (stops.length) {
    status.hidden = true;
  } else {
    status.textContent = "No stamps yet. Mochi is still packing her bag, which mostly means sitting in it.";
  }
  renderDiary(stops);

  const updated = document.getElementById("diary-updated");
  if (diary.updatedAt && formatDate(diary.updatedAt)) {
    updated.textContent = `Diary last updated ${formatDate(diary.updatedAt)}.`;
    updated.hidden = false;
  }

  // Show a real badge from the most recent visited site.
  const badgeHost = stops.find((stop) => sites[stop.host]?.visits > 0)?.host ?? visited[0]?.[0];
  if (badgeHost) {
    const img = document.getElementById("badge-img");
    img.alt = `Mochi visited ${badgeHost}`;
    img.addEventListener("load", () => (document.getElementById("badge-preview").hidden = false), { once: true });
    img.src = `badges/${encodeURIComponent(badgeHost)}.svg`;
    document.getElementById("badge-caption").textContent = `A real one, from ${badgeHost}.`;
  }
}

/* ---------- Snippet ---------- */

document.getElementById("snippet").textContent =
  `<script src="${new URL("mochi.js", window.location.href).href}" defer></script>`;

/* ---------- Is she here? ---------- */

window.addEventListener("load", () => {
  const text = document.getElementById("psst-text");
  if (reduceMotion.matches) {
    text.textContent = "She is napping off screen because your device asked for less motion. She respects that.";
  } else if (!window.__wanderingMochi) {
    text.textContent = "She has wandered off for a moment. She'll be back. Probably.";
  }
});

/* ---------- The shelf ---------- */

const SHELF_ITEMS = [
  { emoji: "☕", name: "mug of tea", quip: "The mug was asking for it." },
  { emoji: "🪴", name: "small plant", quip: "The plant has been moved to the floor. Better light there, apparently." },
  { emoji: "🥛", name: "glass of milk", quip: "Milk everywhere. She looks at you as if you did this." },
  { emoji: "🖊️", name: "pen", quip: "Pen gone. You did not need to sign anything today." },
  { emoji: "📱", name: "phone", quip: "Your phone is on the floor. Notifications: handled." },
  { emoji: "🔑", name: "keys", quip: "Your keys are under the sofa now. That is their home." },
  { emoji: "🏆", name: "Best Developer trophy", quip: "Trophy removed. She is the best developer now." },
];

function setupShelf() {
  const shelf = document.getElementById("shelf");
  const log = document.getElementById("shelf-log");
  const reset = document.getElementById("shelf-reset");
  const floor = document.querySelector(".shelf-toy .floor");
  let knocked = 0;
  let startedAt = 0;

  function build() {
    shelf.replaceChildren();
    floor.replaceChildren();
    knocked = 0;
    startedAt = 0;
    for (const item of SHELF_ITEMS) {
      const li = el("li");
      const button = el("button", "shelf-item");
      button.type = "button";
      button.setAttribute("aria-label", `Knock the ${item.name} off the shelf`);
      button.append(el("span", "shelf-emoji", item.emoji));
      button.addEventListener("click", () => knock(button, item));
      li.append(button);
      shelf.append(li);
    }
  }

  function land(item, seed) {
    const piece = el("span", "floor-piece", item.emoji);
    piece.style.setProperty("--rot", `${(seed % 120) - 60}deg`);
    piece.setAttribute("aria-hidden", "true");
    floor.append(piece);
  }

  function knock(button, item) {
    if (button.disabled) return;
    if (!startedAt) startedAt = performance.now();
    const seed = hash(item.name + knocked);
    button.disabled = true;
    button.setAttribute("aria-label", `The ${item.name} is on the floor`);
    button.style.setProperty("--dx", `${(seed % 2 ? 1 : -1) * (30 + (seed % 50))}px`);
    button.style.setProperty("--rot", `${(seed % 2 ? 1 : -1) * (160 + (seed % 200))}deg`);
    knocked += 1;
    reset.disabled = false;

    const finish = () => {
      button.classList.add("gone");
      land(item, seed);
    };
    if (reduceMotion.matches) {
      finish();
    } else {
      button.classList.add("falling");
      button.addEventListener("animationend", finish, { once: true });
    }

    if (knocked === SHELF_ITEMS.length) {
      const seconds = Math.max(1, Math.round((performance.now() - startedAt) / 1000));
      log.textContent = `Shelf cleared in ${seconds} second${seconds === 1 ? "" : "s"}. She calls this a productive day.`;
      reset.focus();
    } else {
      log.textContent = item.quip;
      const next = shelf.querySelector(".shelf-item:not(:disabled)");
      if (document.activeElement === button || document.activeElement === document.body) next?.focus();
    }
  }

  reset.addEventListener("click", () => {
    build();
    reset.disabled = true;
    log.textContent = "Everything is back. She noticed. She will do it again.";
    shelf.querySelector(".shelf-item")?.focus();
  });

  build();
}

/* ---------- Cat translator ---------- */

// Sixteen sounds, one per half byte. Each byte becomes two sounds joined by a
// non-breaking hyphen; the sounds rotate with position so she never repeats herself.
const MEOWS = ["mew", "meow", "mrrp", "mrow", "purr", "prrt", "nya", "mya", "miau", "mao", "rrr", "hiss", "mrr", "nyan", "meep", "yowl"];
const MEOW_INDEX = new Map(MEOWS.map((sound, index) => [sound, index]));
const JOIN = "‑";

function toCat(text) {
  const bytes = new TextEncoder().encode(text.trim());
  if (!bytes.length) return "";
  const words = [...bytes].map((byte, i) => `${MEOWS[((byte >> 4) + i) % 16]}${JOIN}${MEOWS[((byte & 15) + 3 * i) % 16]}`);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return `${words.join(" ")}.`;
}

function toHuman(text) {
  const words = text.toLowerCase().replace(/[.,!?…]/g, " ").split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const bytes = [];
  for (const [i, word] of words.entries()) {
    const parts = word.split(/[-‐‑]/);
    if (parts.length !== 2 || !MEOW_INDEX.has(parts[0]) || !MEOW_INDEX.has(parts[1])) return null;
    const hi = (MEOW_INDEX.get(parts[0]) - (i % 16) + 16) % 16;
    const lo = (MEOW_INDEX.get(parts[1]) - ((3 * i) % 16) + 16) % 16;
    bytes.push((hi << 4) | lo);
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

function setupTranslator() {
  const form = document.getElementById("translator");
  const input = document.getElementById("translator-in");
  const output = document.getElementById("translator-out");
  const swap = document.getElementById("translator-swap");
  const direction = document.getElementById("translator-direction");
  const inLabel = document.getElementById("translator-in-label");
  const outLabel = document.getElementById("translator-out-label");
  let humanToCat = true;

  function render() {
    output.classList.remove("confused");
    if (!input.value.trim()) {
      output.textContent = humanToCat ? "…" : "She is waiting for you to say something first.";
      return;
    }
    if (humanToCat) {
      output.textContent = toCat(input.value);
      return;
    }
    const decoded = toHuman(input.value);
    if (decoded === null) {
      output.classList.add("confused");
      output.textContent = "That is not a dialect she recognises. Paste one of her translations here.";
    } else {
      output.textContent = decoded;
    }
  }

  function setDirection(toCatMode) {
    humanToCat = toCatMode;
    inLabel.textContent = humanToCat ? "Human" : "Cat";
    outLabel.textContent = humanToCat ? "Cat" : "Human";
    direction.textContent = humanToCat ? "Human → Cat" : "Cat → Human";
    input.maxLength = humanToCat ? 140 : 4000;
  }

  swap.addEventListener("click", () => {
    const previous = output.classList.contains("confused") ? "" : output.textContent;
    setDirection(!humanToCat);
    input.value = previous === "…" ? "" : previous;
    render();
  });

  input.addEventListener("input", () => {
    // Pasting meows into the human box flips the translator for you.
    if (humanToCat && toHuman(input.value)) setDirection(false);
    render();
  });
  form.addEventListener("submit", (event) => event.preventDefault());

  setDirection(true);
  render();
}

setupShelf();
setupTranslator();
loadDiary();
