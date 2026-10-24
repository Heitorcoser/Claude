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
  axis: { x: 0, y: 0 },     // analógico (-1..1)
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
  setupStick();
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

// Analógico: a bolinha segue o dedo; direções viram "teclas" para os menus.
function setupStick() {
  const base = document.getElementById('stick'), knob = document.getElementById('knob');
  let id = null;
  const set = (x, y) => {
    const r = base.getBoundingClientRect();
    const R = r.width / 2;
    let dx = x - (r.left + R), dy = y - (r.top + R);
    const m = Math.hypot(dx, dy), max = R * 0.62;
    if (m > max) { dx *= max / m; dy *= max / m; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    let ax = dx / max, ay = dy / max;
    if (Math.hypot(ax, ay) < 0.18) { ax = 0; ay = 0; }
    Input.axis.x = ax; Input.axis.y = ay;
    const th = 0.5;
    const st = { left: ax < -th, right: ax > th, up: ay < -th, down: ay > th };
    for (const k in st) { if (st[k]) Input.press(k); else Input.release(k); }
  };
  const reset = () => {
    id = null; knob.style.transform = ''; Input.axis.x = 0; Input.axis.y = 0;
    for (const k of ['up', 'down', 'left', 'right']) Input.release(k);
  };
  base.addEventListener('pointerdown', e => { e.preventDefault(); Sfx.init(); id = e.pointerId; base.setPointerCapture(id); set(e.clientX, e.clientY); });
  base.addEventListener('pointermove', e => { if (e.pointerId === id) set(e.clientX, e.clientY); });
  base.addEventListener('pointerup', e => { if (e.pointerId === id) reset(); });
  base.addEventListener('pointercancel', e => { if (e.pointerId === id) reset(); });
}

// ---------------- CONFIGURAÇÕES ----------------
const CFG_KEY = 'perdido_cfg_v1';
const Config = {
  control: 'analog', music: true, sfx: true, quest: true,
  load() {
    try { Object.assign(this, JSON.parse(localStorage.getItem(CFG_KEY) || '{}')); } catch (e) { }
    this.apply();
  },
  save() { try { localStorage.setItem(CFG_KEY, JSON.stringify({ control: this.control, music: this.music, sfx: this.sfx, quest: this.quest })); } catch (e) { } this.apply(); },
  apply() {
    document.body.dataset.control = this.control;
    Sfx.setMusic(this.music); Sfx.setSfx(this.sfx);
  },
};

// Vetor de movimento: analógico (contínuo) ou teclas/direcional (8 direções)
function moveVector() {
  const a = Input.axis;
  if (a.x || a.y) {
    const m = Math.min(1, Math.hypot(a.x, a.y) * 1.15);
    const l = Math.hypot(a.x, a.y) || 1;
    return { x: a.x / l * m, y: a.y / l * m };
  }
  let x = 0, y = 0;
  if (Input.held.left) x -= 1; if (Input.held.right) x += 1;
  if (Input.held.up) y -= 1; if (Input.held.down) y += 1;
  if (x && y) { x *= 0.7071; y *= 0.7071; }
  return { x, y };
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
    const lead = /^ */.exec(para)[0];
    const words = para.slice(lead.length).split(' ');
    let cur = lead;
    for (const w of words) {
      const test = cur.trim() ? cur + ' ' + w : cur + w;
      if (ctx.measureText(test).width > maxW && cur.trim()) { lines.push(cur); cur = '  ' + w; }
      else cur = test;
    }
    lines.push(cur);
  }
  return lines;
}

// Divide um texto longo em páginas de no máximo `maxLines` linhas.
function paginate(str, maxW, size, maxLines = 3) {
  const lines = wrapText(str, maxW, size);
  const pages = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    pages.push(lines.slice(i, i + maxLines).join('\n').replace(/^ +/, ''));
  }
  return pages.length ? pages : [''];
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
    const portrait = !!PORTRAITS[it.who], maxW = portrait ? 430 : 540;
    const pages = paginate(it.t, maxW, 32, 3);
    if (pages.length > 1) {
      // texto grande demais para a caixa: quebra em várias páginas (as escolhas ficam na última)
      const rest = pages.slice(1).map((p, i, a) => ({ ...it, t: p, choices: i === a.length - 1 ? it.choices : undefined }));
      this.queue.unshift(...rest);
      it = { ...it, t: pages[0], choices: undefined };
    }
    this.cur = it;
    this.typer = new Typer(it.t, VOICE_OF[it.who] || 'narr', maxW + 4, 32);
    this.sel = 0;
  },
  update(dt) {
    if (!this.typer) return;
    this.blinkT += dt;
    this.typer.update(dt);
    const ch = this.cur.choices;
    if (ch && this.typer.done) {
      if (Input.isPressed('left') || Input.isPressed('up')) { this.sel = (this.sel + ch.length - 1) % ch.length; Sfx.move(); }
      if (Input.isPressed('right') || Input.isPressed('down')) { this.sel = (this.sel + 1) % ch.length; Sfx.move(); }
      let pick = Input.isPressed('a') ? this.sel : -1;
      if (Input.tap) {
        ch.forEach((c, i) => { const r = this.choiceRect(i); if (hitRect(Input.tap, r)) pick = i; });
      }
      if (pick >= 0) { this.sel = pick; this.choice = pick; Sfx.select(); this.next(); }
      return;
    }
    if (Input.isPressed('a') || Input.tap) {
      if (this.typer.done) { Sfx.move(); this.next(); } else this.typer.skip();
    } else if (Input.isPressed('b')) this.typer.skip();
  },
  ask(text, choices, who) {
    return this.show([{ t: text, who, choices }], World.player && World.player.y - World.cam.y > 150).then(() => this.choice);
  },
  // As escolhas aparecem numa caixa separada, uma por linha, para nunca se sobreporem.
  choicePanel() {
    const ch = this.cur.choices;
    ctx.font = `32px ${FONT}`;
    const w = Math.min(600, Math.max(...ch.map(c => ctx.measureText(c).width)) + 80);
    const h = ch.length * 40 + 20;
    const y = this.top ? 12 + 150 + 8 : 318 - 8 - h;
    return { x: 624 - w, y, w, h };
  },
  choiceRect(i) {
    const P = this.choicePanel();
    return { x: P.x + 10, y: P.y + 10 + i * 40, w: P.w - 20, h: 40 };
  },
  draw() {
    if (!this.typer) return;
    const y = this.top ? 12 : 318;
    frameBox(16, y, 608, 150, 6);
    let tx = 40;
    if (PORTRAITS[this.cur.who]) {
      PORTRAITS[this.cur.who](34, y + 18, this.blinkT);
      tx = 150;
    }
    this.typer.draw(tx, y + 22);
    if (this.cur.choices && this.typer.done) {
      const P = this.choicePanel();
      frameBox(P.x, P.y, P.w, P.h, 5);
      this.cur.choices.forEach((c, i) => {
        const r = this.choiceRect(i);
        if (i === this.sel) drawSpr(SPR.soul, r.x + 8, r.y + 13, 1);
        text(c, r.x + 34, r.y + 4, 32, i === this.sel ? '#ffff40' : '#fff');
      });
      return;
    }
    if (this.typer.done && Math.floor(this.blinkT * 3) % 2) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(590, y + 124, 10, 6); ctx.fillRect(592, y + 130, 6, 3);
    }
  },
};

function hitRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }

const VOICE_OF = { instr: 'instr', fire: 'fire', ice: 'ice', dragon: 'dragon', trein: 'instr', stranger: 'deep', peng: 'peng',
  bit: 'robot', volt: 'robot2', brutao: 'bully', teca: 'bully', ze: 'bully', kid: 'kid',
  marsh: 'soft', choco: 'narr', piru: 'harsh', macaron: 'posh', vovo: 'old', ferrugem: 'robot2', lia: 'kid',
  tecela: 'spider', osso: 'bones', kitsune: 'fox', novelo: 'spider', draco: 'old', golem: 'deep', fantl: 'fire', leao: 'dragon' };
// Rota do jogo inteiro, de acordo com o que o jogador fez nas lutas.
function route() {
  if (!G.kills) return 'pacifista';
  if (G.kills >= 6 && G.spares <= 2) return 'genocida';
  return 'neutra';
}
// No campo, o jogador é chamado por um número. O nome volta quando ele é libertado.
function displayName() { return (G.flags && G.flags.p5camp && !G.flags.p5free) ? 'Nº4812' : G.name; }
function sprPortrait(key, sw, sh, sc, ox = 0, oy = 0) {
  return (x, y) => { const img = typeof key === 'function' ? key() : SPR[key]; ctx.drawImage(img, 0, 0, sw, sh, x + ox, y + oy, sw * sc, sh * sc); };
}
function robotPortrait(pal) {
  return (x, y, t) => {
    const set = SPR.robot[pal], img = (t % 3) > 2.85 ? set.sad : set.right[0];
    ctx.drawImage(img, 0, 0, 16, 14, x + 6, y, 16 * 5.6, 14 * 5.6);
  };
}
function kidPortrait(k) {
  return (x, y) => { const img = SPR.kid[k]; ctx.drawImage(img, 0, 0, img.width, 12, x + 10, y + 6, img.width * 6, 12 * 6); };
}
const PORTRAITS = {
  instr: (x, y, t) => drawInstrPortrait(x, y, t),
  fire: (x, y, t) => drawGhost('fire', x + 2, y + 22, 3.2, t),
  ice: (x, y, t) => drawGhost('ice', x + 2, y + 22, 3.2, t),
  trein: (x, y, t) => {
    drawInstrPortrait(x, y, t);
    drawSpr(SPR.phone, x + 66, y + 54, 2);
    text('TREINADOR', x + 46, y + 104, 20, '#ffe680', 'center');
  },
  stranger: (x, y, t) => {
    const img = SPR.encapuzado;
    ctx.drawImage(img, 0, 0, 16, 12, x + 6, y, 16 * 5.5, 12 * 5.5);
    if ((t % 2.6) > 2.45) { ctx.fillStyle = '#26305a'; ctx.fillRect(x + 30, y + 26, 50, 10); }
  },
  peng: (x, y, t) => { ctx.drawImage(SPR.pinguimNpc, 0, 0, 20, 16, x + 4, y + 4, 20 * 4.4, 16 * 4.4); },
  bit: (x, y, t) => robotPortrait('bit')(x, y, t),
  volt: (x, y, t) => robotPortrait('volt')(x, y, t),
  brutao: (x, y) => kidPortrait('brutao')(x, y),
  teca: (x, y) => kidPortrait('teca')(x, y),
  ze: (x, y) => kidPortrait('ze')(x, y),
  kid: (x, y) => kidPortrait('k1')(x, y),
  marsh: sprPortrait('marsh', 18, 18, 5, 4, 4),
  choco: sprPortrait('choco', 16, 9, 6, 2, 16),
  piru: sprPortrait('pirulito', 20, 16, 5, 0, 8),
  macaron: sprPortrait('macaron', 28, 18, 3.4, -2, 10),
  vovo: sprPortrait('vovo', 28, 16, 3.4, -2, 16),
  ferrugem: (x, y, t) => robotPortrait('ferrugem')(x, y, t),
  lia: sprPortrait('lia', 14, 12, 6, 6, 10),
  tecela: sprPortrait(() => SPR.aranha.mae[0], 26, 12, 3.6, -4, 16),
  novelo: sprPortrait(() => SPR.aranha.bebe[0], 26, 12, 3.6, -4, 16),
  osso: sprPortrait(() => SPR.esqueleto.mestre, 14, 9, 6, 6, 14),
  kitsune: sprPortrait('kitsune', 18, 15, 5.4, 0, 2),
  draco: sprPortrait('draco', 16, 12, 6, 0, 4),
  leao: sprPortrait('leao', 16, 11, 6, 0, 4),
  golem: sprPortrait('golemLava', 18, 9, 5, 0, 20),
  fantl: sprPortrait('fantLava', 18, 12, 5, 0, 14),
};

// Fantasmas com coroa animada (chamas ou pingentes de gelo)
function drawGhost(kind, x, y, sc, t, alpha = 1, flip = false) {
  const img = kind === 'fire' ? SPR.fireghost : SPR.iceghost;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (flip) { ctx.translate(x + img.width * sc, y); ctx.scale(-1, 1); x = 0; y = 0; }
  if (kind === 'fire') {
    const fl = (cx, h, ph) => {
      const hh = h * (0.85 + 0.15 * Math.sin(t * 12 + ph));
      const lay = [['#ff4a1a', 1], ['#ffa21a', 0.7], ['#ffe680', 0.4]];
      for (const [c, k] of lay) {
        ctx.fillStyle = c; ctx.beginPath();
        ctx.moveTo(x + (cx - 3 * k) * sc, y + 2 * sc);
        ctx.quadraticCurveTo(x + (cx - 3 * k) * sc, y + (2 - hh * k * 0.6) * sc, x + (cx + Math.sin(t * 9 + ph)) * sc, y + (2 - hh * k) * sc);
        ctx.quadraticCurveTo(x + (cx + 3 * k) * sc, y + (2 - hh * k * 0.6) * sc, x + (cx + 3 * k) * sc, y + 2 * sc);
        ctx.fill();
      }
    };
    fl(9, 7, 0); fl(19, 7, 2); fl(14, 10, 1);
  } else {
    const spikes = [[9, 4], [11.5, 6], [14, 8], [16.5, 6], [19, 4]];
    for (const [cx, h] of spikes) {
      ctx.fillStyle = '#7fd9ff'; ctx.beginPath();
      ctx.moveTo(x + (cx - 1.6) * sc, y + 2 * sc); ctx.lineTo(x + cx * sc, y + (2 - h) * sc); ctx.lineTo(x + (cx + 1.6) * sc, y + 2 * sc); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x + (cx - 0.5) * sc, y + (2 - h * 0.6) * sc, sc * 0.6, h * 0.5 * sc);
    }
  }
  ctx.drawImage(img, x, y, img.width * sc, img.height * sc);
  ctx.restore();
}

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
    pos: null, map: 'labirinto', dragon: null, enc2: 0,
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

const LV_XP = [0, 10, 30, 70, 120, 200, 300, 450];
// Armas (a Fase 10 dá a Faca do Leão)
const WEAPONS = { 'Faca do Leão': 6 };
function playerAtk() { return 8 + (G.lv - 1) * 2 + (G.dragon === 'preto' ? 3 : G.dragon === 'trevas' ? 6 : 0) + (G.atkBonus || 0) + (WEAPONS[G.weapon] || 0); }
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
  'Pão de Escama': { heal: 12, price: 10, text: '* Você comeu o Pão de Escama.\n* Crocante por fora, macio por dentro.' },
  'Chá Gelado': { heal: 20, price: 18, text: '* Você bebeu o Chá Gelado.\n* Refrescante! Nem parece que tem lava por perto.' },
  'Pimenta Ardente': { heal: 30, price: 28, text: '* Você comeu a Pimenta Ardente.\n* SUA LÍNGUA ESTÁ PEGANDO FOGO!' },
  'Biscoito de Dragão': { heal: 15, text: '* Você comeu o Biscoito de Dragão.\n* Tem formato de dragãozinho. Fofo.' },
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
