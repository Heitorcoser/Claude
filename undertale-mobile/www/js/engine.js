// Núcleo: canvas, entrada (teclado + toque), texto e caixa de diálogo.
'use strict';

const W = 640, H = 480;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const FONT = '"VT323", monospace';
const FONT_TITLE = '"PressStart", monospace';

// ---------------- ENTRADA ----------------
const Input = {
  held: { up: false, down: false, left: false, right: false, a: false, b: false },
  pressed: new Set(),
  tap: null,          // {x,y} toque na tela do jogo neste quadro
  drag: { dx: 0, dy: 0, active: false },
  _touchHeld: {},
  isPressed(k) { return this.pressed.has(k); },
  endFrame() { this.pressed.clear(); this.tap = null; this.drag.dx = 0; this.drag.dy = 0; },
  press(k) { if (!this.held[k]) this.pressed.add(k); this.held[k] = true; },
  release(k) { this.held[k] = false; },
};

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'a', Enter: 'a', Space: 'a', KeyX: 'b', ShiftLeft: 'b', ShiftRight: 'b', Escape: 'b', KeyC: 'b',
};
window.addEventListener('keydown', e => {
  const k = KEYMAP[e.code]; if (!k) return;
  e.preventDefault(); Sfx.init(); Input.press(k);
});
window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) Input.release(k); });

function toGame(clientX, clientY) {
  const r = cv.getBoundingClientRect();
  return { x: (clientX - r.left) * W / r.width, y: (clientY - r.top) * H / r.height };
}
let lastDrag = null;
cv.addEventListener('pointerdown', e => {
  Sfx.init();
  const p = toGame(e.clientX, e.clientY);
  Input.tap = p; lastDrag = p; Input.drag.active = true;
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', e => {
  if (!lastDrag) return;
  const p = toGame(e.clientX, e.clientY);
  Input.drag.dx += p.x - lastDrag.x; Input.drag.dy += p.y - lastDrag.y;
  lastDrag = p;
});
const endDrag = () => { lastDrag = null; Input.drag.active = false; };
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);

// Botões na tela (D-pad + A/B). O D-pad permite deslizar o dedo entre direções.
function setupTouchControls() {
  const pad = document.getElementById('dpad');
  let padPointer = null;
  const dirsFromPoint = (x, y) => {
    const r = pad.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    const dead = r.width * 0.12;
    const out = { up: false, down: false, left: false, right: false };
    if (Math.hypot(dx, dy) < dead) return out;
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    if (ang > -157.5 && ang < -22.5) out.up = true;
    if (ang > 22.5 && ang < 157.5) out.down = true;
    if (ang > 112.5 || ang < -112.5) out.left = true;
    if (ang > -67.5 && ang < 67.5) out.right = true;
    return out;
  };
  const applyDirs = d => {
    for (const k of ['up', 'down', 'left', 'right']) {
      if (d[k]) Input.press(k); else Input.release(k);
    }
    pad.dataset.dir = Object.keys(d).filter(k => d[k]).join(' ');
  };
  pad.addEventListener('pointerdown', e => {
    e.preventDefault(); Sfx.init(); padPointer = e.pointerId;
    pad.setPointerCapture(e.pointerId); applyDirs(dirsFromPoint(e.clientX, e.clientY));
  });
  pad.addEventListener('pointermove', e => {
    if (e.pointerId !== padPointer) return; applyDirs(dirsFromPoint(e.clientX, e.clientY));
  });
  const up = e => { if (e.pointerId !== padPointer) return; padPointer = null; applyDirs({}); };
  pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up);

  for (const el of document.querySelectorAll('[data-key]')) {
    const k = el.dataset.key;
    el.addEventListener('pointerdown', e => { e.preventDefault(); Sfx.init(); Input.press(k); el.classList.add('on'); });
    const rel = () => { Input.release(k); el.classList.remove('on'); };
    el.addEventListener('pointerup', rel); el.addEventListener('pointercancel', rel); el.addEventListener('pointerleave', rel);
  }
}

// ---------------- DESENHO ----------------
function drawSpr(img, x, y, scale = 2, alpha = 1) {
  if (!img) return;
  if (alpha !== 1) ctx.globalAlpha = alpha;
  ctx.drawImage(img, Math.round(x), Math.round(y), img.width * scale, img.height * scale);
  if (alpha !== 1) ctx.globalAlpha = 1;
}

function text(str, x, y, size = 30, color = '#fff', align = 'left', font = FONT) {
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillText(str, Math.round(x), Math.round(y));
}

function frameBox(x, y, w, h, border = 5) {
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#000'; ctx.fillRect(x + border, y + border, w - border * 2, h - border * 2);
}

// Quebra de linha respeitando '\n' e largura máxima.
function wrapText(str, maxW, size) {
  ctx.font = `${size}px ${FONT}`;
  const lines = [];
  for (const para of str.split('\n')) {
    const words = para.split(' ');
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = '  ' + w; }
      else cur = test;
    }
    lines.push(cur);
  }
  return lines;
}

// Texto "máquina de escrever"
class Typer {
  constructor(str, voice = 'narr', maxW = 520, size = 30) {
    this.lines = wrapText(str, maxW, size);
    this.full = this.lines.join('\n');
    this.n = 0; this.t = 0; this.voice = voice; this.size = size;
    this.speed = 36; this.pause = 0;
  }
  get done() { return this.n >= this.full.length; }
  skip() { this.n = this.full.length; }
  update(dt) {
    if (this.done) return;
    if (this.pause > 0) { this.pause -= dt; return; }
    this.t += dt * this.speed;
    while (this.t >= 1 && !this.done) {
      this.t -= 1;
      const ch = this.full[this.n++];
      if (ch && ch.trim() && this.n % 2) Sfx.blip(this.voice);
      if (ch === ',' ) { this.pause = 0.12; break; }
      if (ch === '.' || ch === '!' || ch === '?') { this.pause = 0.22; break; }
    }
  }
  draw(x, y, color = '#fff', lineH = 34) {
    let left = this.n;
    for (let i = 0; i < this.lines.length && left > 0; i++) {
      const ln = this.lines[i];
      text(ln.slice(0, left), x, y + i * lineH, this.size, color);
      left -= ln.length + 1;
    }
  }
}

// Caixa de diálogo do mundo. Itens: string ou {t, who}
const Dialog = {
  queue: [], typer: null, cur: null, resolve: null, top: false, blinkT: 0,
  get open() { return !!this.typer; },
  show(items, top = false) {
    return new Promise(res => {
      this.queue = items.slice(); this.resolve = res; this.top = top; this.next();
    });
  },
  next() {
    if (!this.queue.length) { this.typer = null; this.cur = null; const r = this.resolve; this.resolve = null; r && r(); return; }
    let it = this.queue.shift();
    if (typeof it === 'string') it = { t: it };
    this.cur = it;
    const portrait = it.who === 'instr';
    this.typer = new Typer(it.t, it.who === 'instr' ? 'instr' : 'narr', portrait ? 430 : 540, 32);
  },
  update(dt) {
    if (!this.typer) return;
    this.blinkT += dt;
    this.typer.update(dt);
    if (Input.isPressed('a') || Input.tap) {
      if (this.typer.done) { Sfx.move(); this.next(); } else this.typer.skip();
    } else if (Input.isPressed('b')) this.typer.skip();
  },
  draw() {
    if (!this.typer) return;
    const y = this.top ? 12 : 318;
    frameBox(16, y, 608, 150, 6);
    let tx = 40;
    if (this.cur.who === 'instr') {
      drawInstrPortrait(34, y + 18, this.blinkT);
      tx = 150;
    }
    this.typer.draw(tx, y + 22);
    if (this.typer.done && Math.floor(this.blinkT * 3) % 2) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(590, y + 124, 10, 6); ctx.fillRect(592, y + 130, 6, 3);
    }
  },
};

function drawInstrPortrait(x, y, t) {
  const blink = (t % 3.2) > 3.05;
  const img = blink ? SPR.instr.blinkR : SPR.instr.right[0];
  // Recorta só a cabeça (linhas 0-18) e amplia 5x
  ctx.drawImage(img, 0, 0, 17, 19, x, y, 17 * 5.4, 19 * 5.4);
}

// Transições de tela
const Fade = {
  a: 0, target: 0, speed: 2, resolve: null, color: '#000',
  to(target, speed = 2, color = '#000') {
    this.target = target; this.speed = speed; this.color = color;
    return new Promise(r => { this.resolve = r; });
  },
  update(dt) {
    if (this.a < this.target) this.a = Math.min(this.target, this.a + this.speed * dt);
    else if (this.a > this.target) this.a = Math.max(this.target, this.a - this.speed * dt);
    if (this.a === this.target && this.resolve) { const r = this.resolve; this.resolve = null; r(); }
  },
  draw() {
    if (this.a <= 0) return;
    ctx.globalAlpha = this.a; ctx.fillStyle = this.color; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  },
};

// Temporizadores sincronizados com o loop do jogo
const Timers = {
  list: [],
  wait(sec) { return new Promise(r => this.list.push({ t: sec, r })); },
  update(dt) {
    for (const t of this.list) t.t -= dt;
    const done = this.list.filter(t => t.t <= 0);
    this.list = this.list.filter(t => t.t > 0);
    done.forEach(t => t.r());
  },
};
const wait = s => Timers.wait(s);

// ---------------- DADOS / SALVAMENTO ----------------
const SAVE_KEY = 'perdido_save_v1';
function newGameState() {
  return {
    name: 'HUMANO', lv: 1, xp: 0, hp: 20, maxhp: 20, gold: 0,
    items: ['Bala de Monstro'],
    flags: {}, kills: 0, spares: 0, encounters: 0,
    pos: null,
  };
}
let G = newGameState();

function saveGame(pos) {
  G.pos = pos;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { /* sem armazenamento */ }
}
function loadGame() {
  try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}

const LV_XP = [0, 10, 30, 70, 120, 200];
function playerAtk() { return 8 + (G.lv - 1) * 2; }
function playerDef() { return (G.lv - 1); }
function addXp(n) {
  G.xp += n;
  let up = false;
  while (G.lv < LV_XP.length && G.xp >= LV_XP[G.lv]) { G.lv++; G.maxhp += 4; G.hp += 4; up = true; }
  return up;
}

const ITEMS = {
  'Bala de Monstro': { heal: 10, text: '* Você comeu a Bala de Monstro.\n* Tem gosto de... alcaçuz.' },
  'Torta de Canela': { heal: 99, text: '* Você comeu a Torta de Canela.\n* Quentinha. Lembra de casa.' },
  'Folha Crocante': { heal: 4, text: '* Você mastigou a Folha Crocante.\n* Crunch. Quase nutritiva.' },
};
function useItem(idx) {
  const name = G.items[idx]; const it = ITEMS[name];
  G.items.splice(idx, 1);
  const before = G.hp;
  G.hp = Math.min(G.maxhp, G.hp + it.heal);
  Sfx.heal();
  const healed = G.hp - before;
  return it.text + (G.hp >= G.maxhp ? '\n* Seu HP está no máximo.' : `\n* Você recuperou ${healed} HP.`);
}
