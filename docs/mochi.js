(() => {
// Wandering Mochi: https://github.com/rajdeep564/wandering-mochi (MIT License)
// Movement and sprites adapted from oneko.js (https://github.com/adryd325/oneko.js),
// MIT License, Copyright (c) 2022 adryd.
const SPRITE_URL = "data:image/gif;base64,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";
const HOME_URL = "https://rajdeep564.github.io/wandering-mochi/";

function adoptMochi({ name = "Mochi", owner = "", photo = "", home = HOME_URL } = {}) {
  if (typeof window === "undefined" || window.__wanderingMochi) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  window.__wanderingMochi = true;

  const PET_NAME = name;
  const OWNER_NAME = owner;
  const PHOTO_SELECTOR = photo;
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
  const EAT_MS = 2200;
  const MOUTH_OFFSET = 3;
  const BALL_SIZE = 18;
  const BALL_RADIUS = BALL_SIZE / 2;
  const BALL_REACH = 22;
  const BATS_PER_THROW = 2;
  const BAT_MS = 550;
  const NOTICE_MS = 350;
  const GRAVITY = 1500;
  const BOUNCE = 0.62;
  const BOUNCE_GRIP = 0.86;
  const MIN_BOUNCE_SPEED = 70;
  const ROLL_FRICTION = 2.6;
  const AIR_DRAG = 0.15;
  const WALL_BOUNCE = 0.6;
  const THROW_LIFT = 430;
  const THROW_SECONDS = 1.15;
  const MAX_STEP_SECONDS = 0.033;

  const SPRITES = {
    idle: [[-3, -3]],
    eating: [[-3, -2], [-3, -3]],
    batN: [[0, 0], [0, -1]],
    batE: [[-2, -2], [-2, -3]],
    batS: [[-7, -1], [-6, -2]],
    batW: [[-4, 0], [-4, -1]],
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
    .sprite { width: 32px; height: 32px; image-rendering: pixelated; background-image: url(${SPRITE_URL}); }
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
    .food { position: absolute; left: 0; top: 0; font-size: 13px; line-height: 1; animation: eat ${EAT_MS}ms steps(5, end) forwards; }
    .ball-spot { position: absolute; left: 0; top: 0; width: ${BALL_SIZE}px; height: ${BALL_SIZE}px; }
    .ball-shadow { position: absolute; left: 2px; right: 2px; bottom: -4px; height: 4px; border-radius: 50%; background: rgb(0 0 0 / 0.28); }
    .ball-hop { position: absolute; inset: 0; transform-origin: 50% 100%; }
    .ball-hop::after {
      content: ""; position: absolute; inset: 0; border-radius: 50%;
      background: radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.85), transparent 32%);
      box-shadow: inset -2px -3px 4px rgb(0 0 0 / 0.25);
    }
    .ball-skin {
      position: absolute; inset: 0; border-radius: 50%;
      background: conic-gradient(#ff5a5f 0 60deg, #ffd23f 0 120deg, #fff 0 180deg, #2ec4b6 0 240deg, #4d7cfe 0 300deg, #ff9f1c 0);
    }
    .heart { position: absolute; color: #ef4444; font-size: 15px; animation: float 1s ease-out forwards; }
    @keyframes float { to { transform: translateY(-48px) scale(1.2); opacity: 0; } }
    @keyframes eat { to { transform: var(--food-at) scale(0.15); opacity: 0.4; } }
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
          <a target="_blank" rel="noopener" class="adopt-link">Add me to your site</a>
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
  find(".adopt-link").href = `${home}#adopt`;

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
  let introTimer;
  let animationId = 0;
  let food = null;
  let ball = null;
  let body = null;
  let lastStepAt = 0;
  let batsLeft = 0;
  const listeners = new AbortController();
  const { signal } = listeners;

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

  function clearFood() {
    food?.remove();
    food = null;
  }

  function serveFood() {
    clearFood();
    const place = `translate(${x - 9}px, ${y + MOUTH_OFFSET - 7}px)`;
    food = document.createElement("span");
    food.className = "food";
    food.textContent = "🐟";
    food.style.transform = place;
    food.style.setProperty("--food-at", place);
    layer.append(food);
  }

  function drawBall() {
    const { x: ballX, y: ballY, z, spin, squash } = body;
    const [shadow, hop] = ball.children;
    ball.style.transform = `translate(${ballX - BALL_RADIUS}px, ${ballY - BALL_RADIUS}px)`;
    hop.style.transform = `translateY(${-z}px) scale(${1 + squash}, ${1 - squash})`;
    hop.firstElementChild.style.transform = `rotate(${spin}rad)`;
    shadow.style.transform = `scale(${1 - Math.min(z / 140, 0.6)})`;
    shadow.style.opacity = String(1 - Math.min(z / 200, 0.65));
  }

  function bounceOffWalls() {
    const maxX = window.innerWidth - BALL_RADIUS;
    const maxY = window.innerHeight - BALL_RADIUS;
    if (body.x < BALL_RADIUS || body.x > maxX) {
      body.x = Math.min(Math.max(BALL_RADIUS, body.x), maxX);
      body.vx *= -WALL_BOUNCE;
    }
    if (body.y < BALL_RADIUS || body.y > maxY) {
      body.y = Math.min(Math.max(BALL_RADIUS, body.y), maxY);
      body.vy *= -WALL_BOUNCE;
    }
  }

  // x and y are the ground, and z is the height above it.
  function stepBall(seconds) {
    body.vz -= GRAVITY * seconds;
    body.z += body.vz * seconds;
    if (body.z <= 0) {
      body.z = 0;
      if (body.vz < -MIN_BOUNCE_SPEED) {
        body.squash = Math.min(0.32, -body.vz / 1400);
        body.vz *= -BOUNCE;
        body.vx *= BOUNCE_GRIP;
        body.vy *= BOUNCE_GRIP;
      } else {
        body.vz = 0;
      }
    }
    const drag = Math.exp(-(body.z === 0 ? ROLL_FRICTION : AIR_DRAG) * seconds);
    body.vx *= drag;
    body.vy *= drag;
    body.x += body.vx * seconds;
    body.y += body.vy * seconds;
    bounceOffWalls();
    const speed = Math.hypot(body.vx, body.vy);
    body.spin += (Math.sign(body.vx) || 1) * (speed * seconds) / BALL_RADIUS;
    body.squash *= Math.exp(-14 * seconds);
  }

  function showBall(ballX, ballY) {
    if (!ball) {
      ball = document.createElement("div");
      ball.className = "ball-spot";
      ball.innerHTML = `<div class="ball-shadow"></div><div class="ball-hop"><div class="ball-skin"></div></div>`;
      layer.append(ball);
    }
    body = { x: ballX, y: ballY, z: 0, vx: 0, vy: 0, vz: 0, spin: 0, squash: 0 };
    drawBall();
  }

  function clearBall() {
    ball?.remove();
    ball = null;
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
    clearBall();
  }

  function finishThrow(now) {
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
  }

  // She stops at the ball's edge so she stays in front of it, not under it.
  function aimAtBall() {
    const distance = Math.hypot(x - body.x, y - body.y) || 1;
    goal.x = clampX(body.x + ((x - body.x) / distance) * BALL_REACH);
    goal.y = clampY(body.y + ((y - body.y) / distance) * BALL_REACH);
  }

  function chaseBall() {
    goal = { x, y, track: aimAtBall, onArrive: batBall };
    aimAtBall();
  }

  function hitBall() {
    const angle = Math.atan2(body.y - y, body.x - x) + (Math.random() - 0.5);
    const speed = 190 + Math.random() * 120;
    body.vx = Math.cos(angle) * speed;
    body.vy = Math.sin(angle) * speed;
    body.vz = 170 + Math.random() * 110;
  }

  function batBall(now) {
    const toBallX = body.x - x;
    const toBallY = body.y - y;
    const name = Math.abs(toBallX) > Math.abs(toBallY)
      ? toBallX > 0 ? "batE" : "batW"
      : toBallY > 0 ? "batS" : "batN";
    playDeadline = now + PLAY_TIMEOUT_MS;
    pose = {
      name,
      until: now + BAT_MS,
      onEnd: () => {
        const canReach = Math.hypot(body.x - x, body.y - y) < BALL_REACH * 2;
        if (!canReach) {
          chaseBall();
        } else if (batsLeft > 0) {
          batsLeft -= 1;
          hitBall();
          chaseBall();
        } else {
          finishThrow(performance.now());
        }
      },
    };
  }

  function throwBall(nextX, nextY) {
    body.vx = (nextX - body.x) / THROW_SECONDS;
    body.vy = (nextY - body.y) / THROW_SECONDS;
    body.vz = THROW_LIFT;
    const now = performance.now();
    playDeadline = now + PLAY_TIMEOUT_MS;
    batsLeft = BATS_PER_THROW;
    pose = { name: "alert", until: now + NOTICE_MS, onEnd: chaseBall };
    goal = null;
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
      endPlay();
      serveFood();
      say("Nom nom nom...", EAT_MS);
      pose = {
        name: "eating",
        until: performance.now() + EAT_MS,
        onEnd: () => {
          clearFood();
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
      showBall(clampX(x + 56), clampY(y));
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
      clearFood();
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
    clearFood();
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
      const { onEnd } = pose;
      pose = null;
      onEnd?.();
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
      goal.track?.();
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
    if (ball) {
      stepBall(Math.min((now - lastStepAt) / 1000, MAX_STEP_SECONDS));
      drawBall();
    }
    lastStepAt = now;
    if (now - lastFrameAt > FRAME_MS) {
      lastFrameAt = now;
      frame(now);
      placePanel();
    }
    animationId = window.requestAnimationFrame(onAnimationFrame);
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

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "touch") followPointer(event);
    },
    { signal },
  );

  // A touch may be the start of a scroll, so wait for its click.
  document.addEventListener(
    "pointerdown",
    (event) => {
      lastPointerType = event.pointerType;
      if (event.pointerType !== "touch" && !isPet(event)) onPress(event);
    },
    { signal },
  );

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
    { capture: true, signal },
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && isMenuOpen) closeMenu();
    },
    { signal },
  );

  window.addEventListener(
    "pagehide",
    () => {
      writeStorage(MODE_STORAGE_KEY, JSON.stringify({ mode: currentMode, x, y }));
    },
    { signal },
  );

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
      const response = await fetch(`${home}diary.json`);
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
    introTimer = window.setTimeout(introduce, 2500);
    animationId = window.requestAnimationFrame(onAnimationFrame);
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { signal });

  return () => {
    listeners.abort();
    window.cancelAnimationFrame(animationId);
    window.clearTimeout(introTimer);
    window.clearTimeout(speechTimer);
    host.remove();
    window.__wanderingMochi = false;
  };
}

const script = document.currentScript;
adoptMochi({
  name: script.dataset.name,
  owner: script.dataset.owner,
  photo: script.dataset.photo,
  home: new URL(".", script.src).href,
});
})();
