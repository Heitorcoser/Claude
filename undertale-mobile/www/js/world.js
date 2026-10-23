// Mundo: mapa do LABIRINTO (Fase 1), movimento, NPCs e roteiros.
'use strict';

const TS = 16, MW = 64, MH = 36, VIEW_W = 320, VIEW_H = 240;
const tx2x = tx => tx * TS + 8;       // centro do tile
const ty2y = ty => ty * TS + 14;      // "pés" no tile

// ---------- MAPA ----------
function buildMap() {
  const g = [];
  for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
  const carve = (x, y, w, h, ch = '.') => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch;
  };
  carve(2, 2, 11, 8, ',');      // Sala A: onde você cai (folhas)
  carve(13, 5, 3, 2);           // corredor A -> B
  carve(16, 2, 14, 8);          // Sala B: encontro com o Instrutor
  carve(22, 10, 2, 3);          // corredor B -> C
  carve(16, 13, 14, 8);         // Sala C: boneco de treino
  carve(14, 24, 16, 9);         // Sala D: estrela, torta e saída
  carve(30, 4, 4, 1);           // B -> labirinto
  g[4][31] = 'g';               // portão
  carve(30, 30, 4, 1);          // labirinto -> D
  g[23][21] = 'E';              // porta de saída

  // Labirinto gerado (semente fixa escolhida para o caminho mais longo)
  const CW = 14, CH = 16, OX = 34, OY = 2;
  let best = null;
  for (let seed = 1; seed < 60; seed++) {
    const m = genMaze(CW, CH, seed);
    const len = mazePath(m, CW, CH, [0, 1], [0, 14]);
    if (!best || len > best.len) best = { m, len, seed };
  }
  const m = best.m;
  const deadEnds = [];
  for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) {
    const cx = OX + i * 2, cy = OY + j * 2;
    g[cy][cx] = '~';
    const c = m[j][i];
    if (c.e) g[cy][cx + 1] = '~';
    if (c.s) g[cy + 1][cx] = '~';
    const open = (c.e ? 1 : 0) + (c.s ? 1 : 0) + (i > 0 && m[j][i - 1].e ? 1 : 0) + (j > 0 && m[j - 1][i].s ? 1 : 0);
    if (open === 1) deadEnds.push([cx, cy, i + j]);
  }
  deadEnds.sort((a, b) => b[2] - a[2]);
  return { g, leafSpot: deadEnds[0], seed: best.seed };
}

function genMaze(w, h, seed) {
  const R = rng(seed * 7919);
  const m = [];
  for (let j = 0; j < h; j++) { m.push([]); for (let i = 0; i < w; i++) m[j].push({ e: false, s: false, v: false }); }
  const st = [[0, 1]]; m[1][0].v = true;
  while (st.length) {
    const [i, j] = st[st.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [i + dx, j + dy, dx, dy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < w && y < h && !m[y][x].v);
    if (!nb.length) { st.pop(); continue; }
    const [x, y, dx, dy] = nb[(R() * nb.length) | 0];
    if (dx === 1) m[j][i].e = true; if (dx === -1) m[y][x].e = true;
    if (dy === 1) m[j][i].s = true; if (dy === -1) m[y][x].s = true;
    m[y][x].v = true; st.push([x, y]);
  }
  return m;
}

function mazePath(m, w, h, a, b) {
  const dist = {}; const q = [a]; dist[a] = 0;
  while (q.length) {
    const [i, j] = q.shift();
    if (i === b[0] && j === b[1]) return dist[[i, j]];
    const nx = [];
    if (m[j][i].e) nx.push([i + 1, j]);
    if (m[j][i].s) nx.push([i, j + 1]);
    if (i > 0 && m[j][i - 1].e) nx.push([i - 1, j]);
    if (j > 0 && m[j - 1][i].s) nx.push([i, j - 1]);
    for (const n of nx) if (dist[n] === undefined) { dist[n] = dist[[i, j]] + 1; q.push(n); }
  }
  return 0;
}

// ---------- MUNDO ----------
const World = {
  init() {
    const { g, leafSpot } = buildMap();
    this.g = g; this.leafSpot = leafSpot;
    this.locked = false; this.trail = []; this.walkDist = 0;
    this.nextEnc = G.encounters === 0 ? 90 : 260 + Math.random() * 200;
    this.menu = null; this.excl = 0; this.t = 0;
    this.player = { x: tx2x(7), y: ty2y(6), dir: 'down', anim: 0, moving: false, lying: false };
    this.instr = { x: tx2x(28), y: ty2y(5), dir: 'left', anim: 0, visible: false, follow: false, moving: false };
    this.ents = [
      { id: 'signA', x: tx2x(4), y: ty2y(3), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => Dialog.show(['* (Na placa está escrito:)', "* 'Se você caiu aqui, não entre em pânico. Siga para a direita.'"]) },
      { id: 'signB', x: tx2x(28), y: ty2y(2), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => Dialog.show(['* (LABIRINTO  →)', "* 'Quem entra sozinho... sai acompanhado.'"]) },
      { id: 'dummy', x: tx2x(23), y: ty2y(16), w: 14, h: 8, spr: 'dummy', solid: true, talk: () => this.talkDummy() },
      { id: 'star', x: tx2x(18), y: ty2y(27), w: 12, h: 8, spr: 'star', solid: true, talk: () => this.useStar() },
      { id: 'pie', x: tx2x(26), y: ty2y(26), w: 14, h: 8, spr: 'pie', solid: true, talk: () => this.takePie() },
      { id: 'leaf', x: tx2x(leafSpot[0]), y: ty2y(leafSpot[1]), w: 10, h: 8, spr: 'sparkle', solid: false, talk: () => this.takeLeaf() },
    ];
    if (G.flags.dummyGone) this.ents = this.ents.filter(e => e.id !== 'dummy');
    if (G.flags.leafTaken) this.ents = this.ents.filter(e => e.id !== 'leaf');
    this.triggers = [
      { x: 17, y: 2, w: 2, h: 8, when: () => !G.flags.met, run: () => this.scriptMeet() },
      { x: 16, y: 13, w: 14, h: 3, when: () => G.flags.met && !G.flags.dummyHint, run: () => this.scriptDummyHint() },
      { x: 14, y: 24, w: 16, h: 9, when: () => !G.flags.starHint, run: () => this.scriptStarHint() },
      { x: 32, y: 4, w: 2, h: 1, when: () => !G.flags.mazeHint, run: () => this.scriptMazeHint() },
    ];
    // estado do Instrutor conforme o progresso
    if (G.flags.met && !G.flags.tutorialDone) { this.instr.visible = true; this.instr.x = tx2x(19); this.instr.y = ty2y(16); this.instr.dir = 'right'; }
    if (G.flags.tutorialDone) { this.instr.visible = true; this.instr.follow = true; }
    if (G.pos) { this.player.x = G.pos.x; this.player.y = G.pos.y; }
    if (this.instr.follow) { this.instr.x = this.player.x - 20; this.instr.y = this.player.y; }
    this.renderMap();
  },

  tile(tx, ty) { return (tx < 0 || ty < 0 || tx >= MW || ty >= MH) ? '#' : this.g[ty][tx]; },
  solidTile(tx, ty) {
    const c = this.tile(tx, ty);
    return c === '#' || c === 'E' || (c === 'g' && !G.flags.gateOpen);
  },
  blocked(x, y) {
    const pts = [[x - 5, y - 5], [x + 5, y - 5], [x - 5, y], [x + 5, y]];
    for (const [px, py] of pts) if (this.solidTile(Math.floor(px / TS), Math.floor(py / TS))) return true;
    for (const e of this.ents) {
      if (!e.solid) continue;
      if (Math.abs(x - e.x) < e.w / 2 + 5 && y > e.y - e.h - 3 && y - 5 < e.y) return true;
    }
    if (this.instr.visible && !this.instr.follow) {
      if (Math.abs(x - this.instr.x) < 12 && y > this.instr.y - 8 && y - 5 < this.instr.y) return true;
    }
    return false;
  },

  renderMap() {
    const cvs = document.createElement('canvas');
    cvs.width = MW * TS; cvs.height = MH * TS;
    const g = cvs.getContext('2d');
    const T = SPR.tiles;
    const moss = this.mossTiles || (this.mossTiles = [0, 1, 2].map(v => makeTile(c => {
      c.drawImage(T.floor[v], 0, 0);
      c.fillStyle = '#3f5a3c';
      for (let i = 0; i < 5; i++) c.fillRect((Math.random() * 14) | 0, (Math.random() * 14) | 0, 2, 2);
    })));
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const c = this.g[y][x], hsh = (x * 73 + y * 151) % 3;
      let img;
      if (c === '#') {
        const below = this.tile(x, y + 1);
        img = (below !== '#' && below !== 'E') ? T.wall : T.wallTop;
      } else if (c === ',') img = T.leaves[hsh];
      else if (c === '~') img = moss[hsh];
      else if (c === 'g') img = G.flags.gateOpen ? T.floor[0] : T.gate;
      else if (c === 'E') img = T.door;
      else img = T.floor[hsh];
      g.drawImage(img, x * TS, y * TS);
    }
    // pedestal da torta
    g.fillStyle = '#000'; g.fillRect(26 * TS + 1, 26 * TS + 6, 14, 10);
    g.fillStyle = '#8462bf'; g.fillRect(26 * TS + 2, 26 * TS + 7, 12, 8);
    g.fillStyle = '#6a4c9c'; g.fillRect(26 * TS + 2, 26 * TS + 12, 12, 3);
    this.mapImg = cvs;
  },

  // ---------- atualização ----------
  update(dt) {
    this.t += dt;
    if (this.excl > 0) this.excl -= dt;
    if (Dialog.open) { Dialog.update(dt); return; }
    if (this.menu) { this.updateMenu(); return; }
    const p = this.player;
    p.moving = false;
    if (!this.locked && !p.lying) {
      let dx = 0, dy = 0;
      if (Input.held.left) dx -= 1; if (Input.held.right) dx += 1;
      if (Input.held.up) dy -= 1; if (Input.held.down) dy += 1;
      if (dx || dy) {
        const sp = 88 * dt;
        if (dy < 0) p.dir = 'up'; else if (dy > 0) p.dir = 'down';
        if (dx && !dy) p.dir = dx < 0 ? 'left' : 'right';
        const ox = p.x, oy = p.y;
        if (dx && !this.blocked(p.x + dx * sp, p.y)) p.x += dx * sp;
        if (dy && !this.blocked(p.x, p.y + dy * sp)) p.y += dy * sp;
        const moved = Math.hypot(p.x - ox, p.y - oy);
        if (moved > 0) {
          p.moving = true; p.anim += dt * 7;
          this.trail.push({ x: p.x, y: p.y, dir: p.dir });
          if (this.trail.length > 200) this.trail.shift();
          this.checkTriggers();
          this.checkEncounter(moved);
        }
      }
      if (Input.isPressed('a') || (Input.tap && Input.tap.y < 480)) this.interact();
      else if (Input.isPressed('b')) { Sfx.select(); this.menu = { level: 'main', sel: 0 }; }
    }
    if (!p.moving) p.anim = 0;
    this.updateInstr(dt);
    this.updateCam();
  },

  updateInstr(dt) {
    const I = this.instr;
    if (!I.follow || I.scripted) return;
    const tr = this.trail;
    const lag = 22;
    if (tr.length > lag) {
      const t = tr[tr.length - 1 - lag];
      const moving = Math.hypot(t.x - I.x, t.y - I.y) > 0.3;
      if (moving) { I.dir = t.x < I.x ? 'left' : (t.x > I.x ? 'right' : I.dir); I.anim += dt * 6; }
      I.moving = moving && this.player.moving;
      I.x = t.x; I.y = t.y;
    }
  },

  updateCam() {
    const p = this.player;
    this.cam = {
      x: Math.max(0, Math.min(MW * TS - VIEW_W, p.x - VIEW_W / 2)),
      y: Math.max(0, Math.min(MH * TS - VIEW_H, p.y - 10 - VIEW_H / 2)),
    };
  },

  checkTriggers() {
    const p = this.player, tx = Math.floor(p.x / TS), ty = Math.floor((p.y - 2) / TS);
    for (const t of this.triggers) {
      if (tx >= t.x && tx < t.x + t.w && ty >= t.y && ty < t.y + t.h && t.when()) { t.run(); return; }
    }
  },

  checkEncounter(moved) {
    const p = this.player;
    if (this.tile(Math.floor(p.x / TS), Math.floor((p.y - 2) / TS)) !== '~') return;
    if (G.encounters >= 5) return;
    this.walkDist += moved;
    if (this.walkDist >= this.nextEnc) {
      this.walkDist = 0; this.nextEnc = 300 + Math.random() * 260;
      const order = ['musgolho', 'fantasminha'];
      const key = G.encounters < 2 ? order[G.encounters] : order[(Math.random() * 2) | 0];
      this.encounter(key);
    }
  },

  interact() {
    const p = this.player;
    const off = { up: [0, -12], down: [0, 10], left: [-12, -3], right: [12, -3] }[p.dir];
    const fx = p.x + off[0], fy = p.y + off[1];
    for (const e of this.ents) {
      if (Math.abs(fx - e.x) < e.w / 2 + 6 && fy > e.y - e.h - 12 && fy < e.y + 8) { Sfx.move(); e.talk(); return; }
    }
    const I = this.instr;
    if (I.visible && Math.abs(fx - I.x) < 16 && fy > I.y - 22 && fy < I.y + 10) { this.talkInstr(); return; }
    const c = this.tile(Math.floor(fx / TS), Math.floor(fy / TS));
    if (c === 'g' && !G.flags.gateOpen) Dialog.show(['* (Um portão de ferro. Está trancado.)']);
    if (c === 'E') this.scriptExit();
  },

  // ---------- menu do mundo (botão B) ----------
  updateMenu() {
    const M = this.menu;
    const opts = M.level === 'main' ? ['ITEM', 'STATUS', 'FECHAR'] : M.level === 'items' ? G.items.concat(['VOLTAR']) : ['VOLTAR'];
    if (Input.isPressed('up')) { M.sel = (M.sel + opts.length - 1) % opts.length; Sfx.move(); }
    if (Input.isPressed('down')) { M.sel = (M.sel + 1) % opts.length; Sfx.move(); }
    let ch = Input.isPressed('a') ? M.sel : -1;
    if (Input.tap) {
      const i = Math.floor((Input.tap.y - 70) / 40);
      if (Input.tap.x < 330 && i >= 0 && i < opts.length) ch = i;
      else { this.menu = null; return; }
    }
    if (Input.isPressed('b')) { Sfx.back(); this.menu = M.level === 'main' ? null : { level: 'main', sel: 0 }; return; }
    if (ch < 0) return;
    Sfx.select();
    const o = opts[ch];
    if (M.level === 'main') {
      if (o === 'ITEM') this.menu = G.items.length ? { level: 'items', sel: 0 } : this.menu;
      else if (o === 'STATUS') this.menu = { level: 'stat', sel: 0 };
      else this.menu = null;
    } else if (M.level === 'items') {
      if (o === 'VOLTAR') this.menu = { level: 'main', sel: 0 };
      else { this.menu = null; Dialog.show([useItem(ch)]); }
    } else this.menu = { level: 'main', sel: 0 };
  },

  drawMenu() {
    const M = this.menu;
    frameBox(20, 20, 300, M.level === 'stat' ? 330 : 60 + (M.level === 'items' ? G.items.length + 1 : 3) * 40, 5);
    if (M.level === 'stat') {
      const L = [`"${G.name}"`, `LV ${G.lv}`, `HP ${G.hp} / ${G.maxhp}`, `ATQ ${playerAtk()}   DEF ${playerDef()}`,
        `EXP ${G.xp}   OURO ${G.gold}`, `Poupados: ${G.spares}`, `Derrotados: ${G.kills}`];
      L.forEach((l, i) => text(l, 46, 40 + i * 38, 32));
      return;
    }
    const opts = M.level === 'main' ? ['ITEM', 'STATUS', 'FECHAR'] : G.items.concat(['VOLTAR']);
    opts.forEach((o, i) => {
      if (i === M.sel) drawSpr(SPR.soul, 36, 82 + i * 40, 1);
      text(o, 64, 70 + i * 40, 34);
    });
  },

  // ---------- desenho ----------
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const c = this.cam;
    ctx.drawImage(this.mapImg, Math.round(c.x), Math.round(c.y), VIEW_W, VIEW_H, 0, 0, W, H);
    const sx = x => Math.round((x - c.x) * 2), sy = y => Math.round((y - c.y) * 2);

    const list = [];
    for (const e of this.ents) list.push({ y: e.y, d: () => this.drawEnt(e, sx, sy) });
    const I = this.instr;
    if (I.visible) list.push({ y: I.y, d: () => {
      const fr = I.moving ? Math.floor(I.anim) % 2 : 0;
      const blink = !I.moving && (this.t % 3.4) > 3.25;
      const img = blink ? (I.dir === 'left' ? SPR.instr.blinkL : SPR.instr.blinkR) : SPR.instr[I.dir === 'left' ? 'left' : 'right'][fr];
      drawSpr(img, sx(I.x - 10), sy(I.y - 34), 2);
    } });
    const p = this.player;
    list.push({ y: p.y, d: () => {
      if (p.lying) { drawSpr(SPR.playerLying, sx(p.x - 10), sy(p.y - 12), 2); return; }
      const fr = p.moving ? Math.floor(p.anim) % 4 : 0;
      drawSpr(SPR.player[p.dir][fr], sx(p.x - 7), sy(p.y - 21), 2);
      if (this.excl > 0) text('!', sx(p.x), sy(p.y - 36), 40, '#fff', 'center', FONT_TITLE);
    } });
    list.sort((a, b) => a.y - b.y).forEach(o => o.d());

    // vinheta suave
    const grd = ctx.createRadialGradient(320, 240, 180, 320, 240, 420);
    grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    if (this.menu) this.drawMenu();
    Dialog.draw();
  },

  drawEnt(e, sx, sy) {
    if (e.spr === 'sparkle') {
      const a = 0.5 + Math.sin(this.t * 6) * 0.5;
      ctx.fillStyle = `rgba(255,255,200,${a})`;
      const x = sx(e.x), y = sy(e.y - 6);
      ctx.fillRect(x - 2, y - 8, 4, 16); ctx.fillRect(x - 8, y - 2, 16, 4);
      return;
    }
    if (e.id === 'pie' && G.flags.pieTaken) return;
    const img = SPR[e.spr];
    let yy = e.y - img.height;
    if (e.id === 'star') {
      yy -= 3 + Math.sin(this.t * 3) * 2;
      ctx.globalAlpha = 0.25 + Math.sin(this.t * 3) * 0.1; ctx.fillStyle = '#ffe680';
      ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y - 8), 22, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
    if (e.id === 'pie') yy -= 7;
    drawSpr(img, sx(e.x - img.width / 2), sy(yy), 2);
  },

  // ---------- auxiliares de roteiro ----------
  async walk(ent, pts, speed = 60) {
    ent.moving = true;
    for (const [x, y] of pts) {
      while (Math.hypot(x - ent.x, y - ent.y) > 1) {
        const dt = await nextFrame();
        const a = Math.atan2(y - ent.y, x - ent.x), st = Math.min(speed * dt, Math.hypot(x - ent.x, y - ent.y));
        ent.x += Math.cos(a) * st; ent.y += Math.sin(a) * st; ent.anim += dt * 6;
        if (Math.abs(x - ent.x) > 0.5) ent.dir = x < ent.x ? 'left' : 'right';
        if (ent === this.player) {
          if (Math.abs(y - ent.y) > Math.abs(x - ent.x)) ent.dir = y < ent.y ? 'up' : 'down';
          this.updateCam();
        }
      }
    }
    ent.moving = false;
  },

  say(lines) { return Dialog.show(lines.map(t => typeof t === 'string' && t.startsWith('I:') ? { who: 'instr', t: '* ' + t.slice(2).trim() } : t), this.player.y - this.cam.y > 150); },

  // ---------- ROTEIROS ----------
  async scriptWake() {
    this.locked = true;
    this.player.lying = true;
    this.updateCam();
    Sfx.stopMusic();
    Fade.a = 1; await Fade.to(0, 0.5);
    await wait(1.2);
    await this.say(['* ...', '* (Você caiu de muito alto... mas as folhas vermelhas amorteceram a queda.)', '* (Onde você está?)']);
    this.player.lying = false; Sfx.move();
    Sfx.playMusic('ruins');
    await wait(0.3);
    await this.say(['* (Toque no direcional para andar. Botão A para interagir, B para o menu.)']);
    this.locked = false;
  },

  async scriptMeet() {
    G.flags.met = true; this.locked = true;
    const I = this.instr, p = this.player;
    I.visible = true; I.x = tx2x(29); I.y = ty2y(5); I.dir = 'left';
    Sfx.stopMusic();
    await wait(0.4);
    await this.walk(I, [[p.x + 34, p.y]], 50);
    p.dir = 'right';
    Sfx.playMusic('instr');
    await this.say([
      'I: Opa! Um humano?! Aqui embaixo?',
      'I: Você caiu pelo buraco da floresta, não foi? Acontece mais do que você imagina.',
      'I: Não precisa ter medo. Eu sou o INSTRUTOR.',
      'I: Eu ajudo quem se perde a atravessar este LABIRINTO.',
      'I: Mas aqui vivem monstros. Alguns querem briga... outros só querem conversar.',
      'I: Antes de seguir, você precisa aprender a se defender. Venha comigo!',
    ]);
    await this.walk(I, [[tx2x(23) - 8, I.y], [tx2x(23) - 8, ty2y(9)], [tx2x(23) - 8, ty2y(14)], [tx2x(19), ty2y(16)]], 70);
    I.dir = 'right';
    this.locked = false;
  },

  async scriptDummyHint() {
    G.flags.dummyHint = true; this.locked = true;
    await this.say(['I: Este é o BONECO de treino.', 'I: Chegue perto dele e aperte A para começar uma batalha de treino.']);
    this.locked = false;
  },

  async talkInstr() {
    if (!G.flags.tutorialDone) return this.say(['I: Vá até o BONECO e aperte A. Eu explico o resto!']);
    const lines = [
      ['I: O labirinto confunde todo mundo. Dica: siga sempre pela parede.'],
      ['I: Se a luta ficar difícil, me chame em AGIR!'],
      [`I: Você já poupou ${G.spares} e derrotou ${G.kills}. Cada escolha conta.`],
    ];
    this.instrTalkN = ((this.instrTalkN || 0) + 1) % lines.length;
    return this.say(lines[this.instrTalkN]);
  },

  async talkDummy() {
    if (G.flags.tutorialDone) return this.say(['* (É só um boneco de pano.)']);
    if (!G.flags.met) return this.say(['* (Um boneco de treino. Parece estar esperando alguém.)']);
    await this.say(['I: Isso! Vamos começar o treino!']);
    this.battle('dummy', { tutorial: true }, r => this.afterTutorial(r));
  },

  async afterTutorial(result) {
    this.locked = true;
    const I = this.instr;
    if (result === 'killed') {
      G.flags.dummyGone = true; this.ents = this.ents.filter(e => e.id !== 'dummy');
      await this.say(['I: ...Você bateu até ele virar pó.', 'I: Bom, era só um boneco. Mas lembre: os monstros de verdade também sentem dor.']);
    } else {
      await this.say(['I: Muito bem! Você poupou o Boneco.', 'I: Gentileza também é uma arma poderosa aqui embaixo.']);
    }
    await this.say([
      'I: Agora sim, você está pronto.',
      'I: O LABIRINTO fica depois do portão, na sala de cima.',
      'I: Vou com você até a saída. Nas batalhas, me chame em AGIR!',
    ]);
    G.flags.gateOpen = true; G.flags.tutorialDone = true;
    Sfx.save();
    this.renderMap();
    await this.say(['* (Você ouve um portão se abrindo ao longe.)', '* (O INSTRUTOR entrou para o seu grupo!)']);
    await this.walk(I, [[this.player.x, this.player.y]], 80);
    I.follow = true; this.trail = [];
    for (let i = 0; i < 30; i++) this.trail.push({ x: I.x, y: I.y, dir: I.dir });
    saveGame({ x: this.player.x, y: this.player.y });
    Sfx.playMusic('ruins');
    this.locked = false;
  },

  async scriptMazeHint() {
    G.flags.mazeHint = true; this.locked = true;
    await this.say(['I: Aqui começa o LABIRINTO.', 'I: Os corredores mudam de cor por causa do musgo. Cuidado, monstros adoram se esconder nele.']);
    this.locked = false;
  },

  async scriptStarHint() {
    G.flags.starHint = true; this.locked = true;
    await this.say([
      'I: Ufa! Saímos do labirinto!',
      'I: Está vendo aquela ESTRELA brilhando? Toque nela para SALVAR seu progresso.',
      'I: E a porta lá em cima... é a saída. Mas descanse antes.',
    ]);
    this.locked = false;
  },

  async useStar() {
    G.hp = G.maxhp; Sfx.save();
    saveGame({ x: this.player.x, y: this.player.y + 4 });
    await this.say(['* (A luz da estrela te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },

  async takePie() {
    if (G.flags.pieTaken) return this.say(['* (O pedestal está vazio.)']);
    if (G.items.length >= 8) return this.say(['* (Seus bolsos estão cheios.)']);
    G.flags.pieTaken = true; G.items.push('Torta de Canela'); Sfx.select();
    await this.say(['* (Uma torta de canela ainda quentinha.)', '* Você pegou a TORTA DE CANELA.']);
    if (this.instr.follow) await this.say(['I: Hehe, fui eu que deixei aí. Ela cura todo o seu HP!']);
  },

  async takeLeaf() {
    G.flags.leafTaken = true; this.ents = this.ents.filter(e => e.id !== 'leaf');
    G.items.push('Folha Crocante'); Sfx.select();
    await this.say(['* Você achou uma FOLHA CROCANTE no fim do corredor.']);
  },

  async scriptExit() {
    this.locked = true;
    if (!this.instr.follow) { await this.say(['* (A porta não abre.)']); this.locked = false; return; }
    Sfx.playMusic('instr');
    const end = G.kills === 0
      ? 'I: E você não machucou ninguém... Estou muito orgulhoso de você.'
      : G.kills >= 3 ? 'I: Você lutou bastante... só não esqueça quem você é.' : 'I: Você aprendeu rápido. Muito rápido.';
    await this.say([
      'I: Chegamos à saída do LABIRINTO.',
      'I: Depois desta porta começa a próxima área...',
      'I: E lá vive alguém muito mais forte que estes monstros.',
      end,
      'I: Eu vou estar por perto. Quando estiver pronto... abra a porta.',
    ]);
    Sfx.stopMusic();
    await Fade.to(1, 0.8);
    Game.goEnd();
  },

  battle(key, opts, after) {
    this.locked = true;
    Game.startBattle(key, opts, r => {
      if (r === 'dead') return;
      Sfx.playMusic('ruins');
      this.locked = false;
      after && after(r);
    });
  },

  async encounter(key) {
    this.locked = true;
    this.excl = 0.6; Sfx.encounter();
    await wait(0.6);
    G.encounters++;
    const first = G.encounters === 1;
    this.battle(key, { withInstr: this.instr.follow }, async r => {
      if (first && this.instr.follow) {
        this.locked = true;
        if (r === 'spared') await this.say(['I: Viu só? Nem todo monstro precisa virar pó.']);
        else if (r === 'killed') await this.say(['I: ...Às vezes não tem outro jeito. Vamos em frente.']);
        else await this.say(['I: Fugir também é uma escolha. Vamos!']);
        this.locked = false;
      }
      if (G.encounters >= 5) await this.say(['* (O labirinto ficou estranhamente silencioso.)']);
    });
  },
};

// Promessa que resolve no próximo quadro (com dt)
const frameWaiters = [];
function nextFrame() { return new Promise(r => frameWaiters.push(r)); }
function flushFrameWaiters(dt) { const l = frameWaiters.splice(0); l.forEach(r => r(dt)); }
