// Wandering Mochi: https://github.com/rajdeep564/wandering-mochi (MIT License)
// Movement and sprites adapted from oneko.js (https://github.com/adryd325/oneko.js),
// MIT License, Copyright (c) 2022 adryd.
(() => {
  const script = document.currentScript;
  if (!script || window.__wanderingMochi) return;
  window.__wanderingMochi = true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const BASE_URL = new URL(".", script.src).href;
  const PET_NAME = script.dataset.name || "Mochi";
  const OWNER_NAME = script.dataset.owner || "";
  const PHOTO_SELECTOR = script.dataset.photo || "";
  const STORAGE_KEY = "mochi-pet";
  const MODE_STORAGE_KEY = "mochi-mode";

  const WALK_SPEED = 10;
  const RUN_SPEED = 16;
  const FRAME_MS = 100;
  const POINTER_IDLE_MS = 6000;
  const WANDER_REST_FRAMES = 30;
  const PHOTO_COOLDOWN_MS = 30000;
  const THOUGHT_INTERVAL_MS = 40000;
  const PLAY_TIMEOUT_MS = 12000;
  const PLAY_THROWS = 4;

  const SPRITES = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0], [-2, -1]],
    N: [[-1, -2], [-1, -3]],
    NE: [[0, -2], [0, -3]],
    E: [[-3, 0], [-3, -1]],
    SE: [[-5, -1], [-5, -2]],
    S: [[-6, -3], [-7, -2]],
    SW: [[-5, -3], [-6, -1]],
    W: [[-4, -2], [-4, -3]],
    NW: [[-1, 0], [-1, -1]],
  };

  const SHY_THOUGHTS = ["Psst... touch me!", "Hello? Click me!", "Over here! I'm friendly."];
  const THOUGHTS = ["I'm hungry...", "Pet me?", "Throw my ball!", "Don't forget me!"];
  const PET_LINES = ["Prrrrr...", "More, please!", "Right behind the ear!"];
  const FEED_LINES = ["Yum! Thank you!", "Delicious!", "Best fish ever!"];
  const PHOTO_LINES = OWNER_NAME
    ? [`I love ${OWNER_NAME}!`, `${OWNER_NAME} is my human.`]
    : ["This one is my favourite spot."];

  const STYLES = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .root {
      --card: #fffaf2; --ink: #2b2118; --muted: #6b5d4d; --line: #e8dcc8; --accent: #0f766e;
      font: 12px/1.4 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      color: var(--ink);
    }
    @media (prefers-color-scheme: dark) {
      .root { --card: #231c15; --ink: #f6eee2; --muted: #b9aa96; --line: #43372a; --accent: #5eead4; }
    }
    .pet {
      position: fixed; left: 0; top: 0; z-index: 2147483000; width: 44px; height: 44px;
      display: none; place-items: center; padding: 0; border: 0; border-radius: 50%;
      background: none; cursor: pointer;
    }
    .pet:focus-visible { outline: 2px solid var(--accent); }
    .pet.inviting::before {
      content: ""; position: absolute; inset: 0; border: 2px solid var(--accent); border-radius: 50%;
      animation: ping 1.2s ease-out infinite;
    }
    .sprite { width: 32px; height: 32px; image-rendering: pixelated; background-image: url(${BASE_URL}mochi-sprite.png); }
    .panel {
      position: fixed; left: 0; top: 0; z-index: 2147483001; display: flex; flex-direction: column;
      gap: 8px; width: max-content; max-width: 240px; pointer-events: none;
    }
    .speech, .menu {
      background: var(--card); border: 1px solid var(--line); border-radius: 12px;
      box-shadow: 0 4px 14px rgb(0 0 0 / 0.14);
    }
    .speech { margin: 0; padding: 8px 12px; font-weight: 500; }
    .speech:empty { display: none; }
    .menu { display: none; flex-direction: column; gap: 8px; padding: 12px; pointer-events: auto; }
    .menu.open { display: flex; }
    .menu-head { display: flex; justify-content: space-between; gap: 12px; font-weight: 600; }
    .love { color: #ef4444; }
    .level { margin: 0; color: var(--muted); }
    .row { display: flex; gap: 4px; }
    .menu button, .menu a, .recall {
      font: inherit; color: var(--ink); background: none; border: 1px solid var(--line);
      border-radius: 8px; padding: 6px 8px; cursor: pointer; text-decoration: none; text-align: center;
    }
    .menu .row button { flex: 1; white-space: nowrap; }
    .menu button:hover, .menu a:hover, .recall:hover { background: var(--line); }
    .recall {
      position: fixed; right: 16px; bottom: 16px; z-index: 2147483000; display: none;
      width: 40px; height: 40px; padding: 0; border-radius: 50%; background: var(--card);
      font-size: 18px; box-shadow: 0 4px 14px rgb(0 0 0 / 0.14);
    }
    .layer { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; pointer-events: none; }
    .item { position: absolute; left: 0; top: 0; font-size: 22px; line-height: 1; transition: transform 0.3s; }
    .heart { position: absolute; color: #ef4444; font-size: 15px; animation: float 1s ease-out forwards; }
    @keyframes float { to { transform: translateY(-48px) scale(1.2); opacity: 0; } }
    @keyframes ping { to { transform: scale(1.7); opacity: 0; } }
  `;

  const host = document.createElement("div");
  host.id = "wandering-mochi";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${STYLES}</style>
    <div class="root">
      <button class="pet" type="button" aria-expanded="false"><div class="sprite"></div></button>
      <div class="panel">
        <p class="speech" aria-live="polite"></p>
        <div class="menu">
          <div class="menu-head"><span class="pet-name"></span><span class="love"></span></div>
          <p class="level"></p>
          <div class="row">
            <button type="button" data-action="pet">✋ Pet</button>
            <button type="button" data-action="feed">🐟 Feed</button>
            <button type="button" data-action="play">🎾 Play</button>
          </div>
          <div class="row">
            <button type="button" data-action="toggleSit" class="sit">🐾 Sit</button>
            <button type="button" data-action="hide">🙈 Hide</button>
          </div>
          <a target="_blank" rel="noopener" class="diary-link">Where has she been?</a>
        </div>
      </div>
      <button class="recall" type="button">🐈</button>
      <div class="layer" aria-hidden="true"></div>
    </div>
  `;

  const find = (selector) => shadow.querySelector(selector);
  const button = find(".pet");
  const sprite = find(".sprite");
  const panel = find(".panel");
  const speech = find(".speech");
  const menu = find(".menu");
  const layer = find(".layer");
  const recall = find(".recall");
  const sitButton = find(".sit");
  button.setAttribute("aria-label", `${PET_NAME} the cat. Open pet menu`);
  recall.setAttribute("aria-label", `Bring ${PET_NAME} back`);
  recall.title = `Bring ${PET_NAME} back`;
  find(".pet-name").textContent = PET_NAME;
  find(".diary-link").href = BASE_URL;

  function pick(lines) {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function loveLevel(love) {
    if (love < 5) return "Curious about you";
    if (love < 15) return "Likes you";
    if (love < 30) return "Loves you";
    return "Best friends";
  }

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage can be blocked; the pet still works for this visit.
    }
  }

  function readMode() {
    try {
      return JSON.parse(readStorage(MODE_STORAGE_KEY));
    } catch {
      return null;
    }
  }

  const storedLove = readStorage(STORAGE_KEY);
  const savedMode = readMode();
  let currentLove = Number(storedLove) || 0;
  let currentMode = savedMode?.mode ?? "active";
  let x = 32;
  let y = 32;
  let targetX = x;
  let targetY = y;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  let lastPointerAt = -Infinity;
  let lastPointerType = "mouse";
  let lastFrameAt = 0;
  let lastPhotoAt = performance.now();
  let nextThoughtAt = performance.now() + THOUGHT_INTERVAL_MS;
  let isMenuOpen = false;
  let isInviting = false;
  let touched = storedLove !== null;
  let goal = null;
  let pose = null;
  let throwsLeft = 0;
  let playDeadline = 0;
  let speechTimer;
  let item = null;

  function clampX(value) {
    return Math.min(Math.max(32, value), window.innerWidth - 32);
  }

  function clampY(value) {
    return Math.min(Math.max(32, value), window.innerHeight - 32);
  }

  function applyMode(mode) {
    currentMode = mode;
    writeStorage(MODE_STORAGE_KEY, JSON.stringify({ mode, x, y }));
    button.style.display = mode === "hidden" ? "none" : "grid";
    recall.style.display = mode === "hidden" ? "block" : "none";
    sitButton.textContent = mode === "sitting" ? "🐾 Let's go" : "🐾 Sit";
  }

  function say(text, duration = 3500) {
    window.clearTimeout(speechTimer);
    speech.textContent = text;
    speechTimer = window.setTimeout(() => {
      speech.textContent = "";
    }, duration);
  }

  function showLove() {
    find(".love").textContent = `♥ ${currentLove}`;
    find(".level").textContent = loveLevel(currentLove);
  }

  function addLove(amount) {
    currentLove += amount;
    showLove();
    writeStorage(STORAGE_KEY, String(currentLove));
  }

  function spawnHearts(count, heartX = x, heartY = y) {
    for (let index = 0; index < count; index += 1) {
      const heart = document.createElement("span");
      heart.className = "heart";
      heart.textContent = "♥";
      heart.style.left = `${heartX + (Math.random() - 0.5) * 48}px`;
      heart.style.top = `${heartY - 16 - Math.random() * 16}px`;
      heart.style.animationDelay = `${index * 90}ms`;
      heart.addEventListener("animationend", () => heart.remove());
      layer.append(heart);
    }
  }

  function placeItem(emoji, itemX, itemY) {
    if (!item) {
      item = document.createElement("span");
      item.className = "item";
      layer.append(item);
    }
    item.textContent = emoji;
    item.style.transform = `translate(${itemX - 12}px, ${itemY - 12}px)`;
  }

  function clearItem() {
    item?.remove();
    item = null;
  }

  function setSprite(name, frame) {
    const sprites = SPRITES[name];
    const [spriteX, spriteY] = sprites[frame % sprites.length];
    sprite.style.backgroundPosition = `${spriteX * 32}px ${spriteY * 32}px`;
  }

  function placePet() {
    button.style.transform = `translate(${x - 22}px, ${y - 22}px)`;
  }

  function placePanel() {
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    if (!height) return;
    const left = Math.min(Math.max(8, x - width / 2), window.innerWidth - width - 8);
    const top = y - height - 30 >= 8 ? y - height - 30 : y + 30;
    panel.style.transform = `translate(${left}px, ${top}px)`;
  }

  function setInviting(value) {
    isInviting = value;
    button.classList.toggle("inviting", value);
  }

  function closeMenu() {
    isMenuOpen = false;
    menu.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
  }

  function endPlay() {
    throwsLeft = 0;
    goal = null;
    clearItem();
  }

  function throwBall(ballX, ballY) {
    placeItem("🎾", ballX, ballY);
    playDeadline = performance.now() + PLAY_TIMEOUT_MS;
    goal = {
      x: ballX,
      y: ballY,
      onArrive: (now) => {
        throwsLeft -= 1;
        playDeadline = now + PLAY_TIMEOUT_MS;
        if (throwsLeft > 0) {
          say("Got it! Throw again!");
          return;
        }
        endPlay();
        pose = { name: "scratchSelf", until: now + 1500 };
        addLove(3);
        spawnHearts(5);
        say("That was so fun!");
      },
    };
  }

  function visitPhoto(now) {
    const photo = PHOTO_SELECTOR && document.querySelector(PHOTO_SELECTOR);
    if (!photo) return false;
    const rect = photo.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom + 40 > window.innerHeight) return false;
    lastPhotoAt = now;
    goal = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 20,
      onArrive: (arrivedAt) => {
        pose = { name: "sleeping", until: arrivedAt + 4000 };
        spawnHearts(4, rect.left + rect.width / 2, rect.top + rect.height / 2);
        spawnHearts(3);
        say(pick(PHOTO_LINES), 4000);
      },
    };
    return true;
  }

  const actions = {
    pet() {
      closeMenu();
      pose = { name: "sleeping", until: performance.now() + 2000 };
      addLove(1);
      spawnHearts(4);
      say(pick(PET_LINES));
    },
    feed() {
      closeMenu();
      const side = x > window.innerWidth / 2 ? -1 : 1;
      const fishX = clampX(x + side * 140);
      const fishY = clampY(y);
      placeItem("🐟", fishX, fishY);
      say("Is that for me?!");
      goal = {
        x: fishX,
        y: fishY,
        onArrive: (now) => {
          clearItem();
          pose = { name: "scratchSelf", until: now + 1500 };
          addLove(2);
          spawnHearts(5);
          say(pick(FEED_LINES));
        },
      };
    },
    play() {
      closeMenu();
      throwsLeft = PLAY_THROWS;
      playDeadline = performance.now() + PLAY_TIMEOUT_MS;
      placeItem("🎾", clampX(x + 56), clampY(y));
      say("Click anywhere to throw my ball!", 5000);
    },
    toggleSit() {
      closeMenu();
      if (currentMode === "sitting") {
        targetX = x;
        targetY = y;
        applyMode("active");
        say("Yay, I'm free!");
      } else {
        applyMode("sitting");
        say("Okay, I'll stay right here.");
      }
    },
    hide() {
      closeMenu();
      endPlay();
      setInviting(false);
      pose = null;
      window.clearTimeout(speechTimer);
      speech.textContent = "";
      applyMode("hidden");
    },
  };

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
      return;
    }
    endPlay();
    pose = null;
    setInviting(false);
    isMenuOpen = true;
    menu.classList.add("open");
    button.setAttribute("aria-expanded", "true");
    showLove();
    if (!touched) {
      touched = true;
      addLove(1);
      spawnHearts(3);
      say(`You found me! I'm ${PET_NAME}.`, 6000);
    }
  }

  function idle() {
    idleTime += 1;
    if (idleTime > 10 && idleAnimation === null && Math.random() < 0.01) {
      idleAnimation = Math.random() < 0.5 ? "sleeping" : "scratchSelf";
    }

    if (idleAnimation === "sleeping") {
      if (idleAnimationFrame < 8) {
        setSprite("tired", 0);
      } else {
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
      }
      if (idleAnimationFrame > 192) idleAnimation = null;
    } else if (idleAnimation === "scratchSelf") {
      setSprite("scratchSelf", idleAnimationFrame);
      if (idleAnimationFrame > 9) idleAnimation = null;
    } else {
      idleAnimationFrame = 0;
      setSprite("idle", 0);
      return;
    }
    idleAnimationFrame += 1;
  }

  function frame(now) {
    frameCount += 1;
    if (currentMode === "hidden") return;
    if (isMenuOpen) {
      setSprite("idle", 0);
      return;
    }
    if (pose) {
      if (now < pose.until) {
        const step = pose.name === "sleeping" ? Math.floor(frameCount / 4) : frameCount;
        setSprite(pose.name, step);
        return;
      }
      pose = null;
      if (isInviting) setInviting(false);
    }

    const playing = throwsLeft > 0;
    if (playing && now > playDeadline) {
      endPlay();
      say("Maybe later then...");
    }
    if (currentMode === "sitting" && !goal && throwsLeft === 0) {
      idle();
      return;
    }
    if (!goal && !playing && now > nextThoughtAt) {
      nextThoughtAt = now + THOUGHT_INTERVAL_MS;
      say(pick(touched ? THOUGHTS : SHY_THOUGHTS));
    }

    const pointerActive = now - lastPointerAt < POINTER_IDLE_MS;
    if (goal) {
      targetX = goal.x;
      targetY = goal.y;
    } else if (!pointerActive && !playing && idleAnimation === null && idleTime > WANDER_REST_FRAMES) {
      const wantsPhoto = now - lastPhotoAt > PHOTO_COOLDOWN_MS && Math.random() < 0.25;
      if (!wantsPhoto || !visitPhoto(now)) {
        targetX = 16 + Math.random() * (window.innerWidth - 32);
        targetY = 16 + Math.random() * (window.innerHeight - 32);
      }
    }

    const diffX = x - targetX;
    const diffY = y - targetY;
    const distance = Math.hypot(diffX, diffY);
    if (distance < (goal ? 14 : 48)) {
      if (goal) {
        const { onArrive } = goal;
        goal = null;
        idleTime = 0;
        onArrive(now);
      } else {
        idle();
      }
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      idleTime = Math.min(idleTime, 7) - 1;
      return;
    }

    let direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    const speed = Math.min(distance, goal ? RUN_SPEED : WALK_SPEED);
    x = Math.min(Math.max(16, x - (diffX / distance) * speed), window.innerWidth - 16);
    y = Math.min(Math.max(16, y - (diffY / distance) * speed), window.innerHeight - 16);
    placePet();
  }

  function onAnimationFrame(now) {
    if (now - lastFrameAt > FRAME_MS) {
      lastFrameAt = now;
      frame(now);
      placePanel();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function followPointer({ clientX, clientY }) {
    if (throwsLeft > 0 || isMenuOpen || currentMode !== "active") return;
    targetX = clientX;
    targetY = clientY;
    lastPointerAt = performance.now();
  }

  function onPress(event) {
    if (isMenuOpen) closeMenu();
    if (throwsLeft > 0) {
      throwBall(event.clientX, event.clientY);
      return;
    }
    followPointer(event);
  }

  function isPet(event) {
    return event.composedPath().includes(host);
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch") followPointer(event);
  });

  // A touch may be the start of a scroll, so wait for its click.
  document.addEventListener("pointerdown", (event) => {
    lastPointerType = event.pointerType;
    if (event.pointerType !== "touch" && !isPet(event)) onPress(event);
  });

  // A throw should not also follow a link under the pointer.
  document.addEventListener(
    "click",
    (event) => {
      if (isPet(event)) return;
      const playing = throwsLeft > 0;
      if (lastPointerType === "touch") onPress(event);
      if (playing) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen) closeMenu();
  });

  window.addEventListener("pagehide", () => {
    writeStorage(MODE_STORAGE_KEY, JSON.stringify({ mode: currentMode, x, y }));
  });

  button.addEventListener("click", toggleMenu);
  menu.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action) actions[action]();
  });
  recall.addEventListener("click", () => {
    targetX = x;
    targetY = y;
    applyMode("active");
    say("I'm back! Did you miss me?");
  });

  function homecomingLine(stops) {
    const here = window.location.hostname.replace(/^www\./, "");
    const stop = stops.find(({ host: stopHost }) => stopHost !== here);
    const lastHere = stops.find(({ host: stopHost }) => stopHost === here);
    if (lastHere && Math.random() < 0.5) {
      return `I sniffed this site. ${lastHere.review}`;
    }
    return stop ? `Just back from ${stop.host} with ${stop.souvenir.name} ${stop.souvenir.emoji}` : null;
  }

  async function shareTravels() {
    try {
      const response = await fetch(`${BASE_URL}diary.json`);
      const { stops } = await response.json();
      const line = homecomingLine(stops);
      if (line && currentMode !== "hidden") say(line, 7000);
    } catch {
      // Without the diary she simply has no travel stories today.
    }
  }

  function introduce() {
    if (currentMode !== "active") return;
    if (touched) {
      shareTravels();
      return;
    }
    say("Psst... hey!", 3000);
    goal = {
      x: clampX(lastPointerAt > 0 ? targetX : window.innerWidth / 2),
      y: clampY(lastPointerAt > 0 ? targetY + 56 : window.innerHeight / 2),
      onArrive: (now) => {
        setInviting(true);
        pose = { name: "idle", until: now + 12000 };
        nextThoughtAt = now + THOUGHT_INTERVAL_MS;
        say("Hey you! Touch me, I won't bite.", 12000);
      },
    };
  }

  function start() {
    x = clampX(savedMode?.x ?? 32);
    y = clampY(savedMode?.y ?? 32);
    targetX = x;
    targetY = y;
    document.body.append(host);
    applyMode(currentMode);
    showLove();
    setSprite("idle", 0);
    placePet();
    window.setTimeout(introduce, 2500);
    window.requestAnimationFrame(onAnimationFrame);
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
