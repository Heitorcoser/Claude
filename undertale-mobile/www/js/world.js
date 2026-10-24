// Mundo genérico: mapas em tiles, movimento, entidades, diálogos e roteiros.
// Cada fase registra seu mapa em MAPS (phase1.js, phase2.js).
'use strict';

const TS = 16, VIEW_W = 320, VIEW_H = 240;
const tx2x = tx => tx * TS + 8;       // centro do tile
const ty2y = ty => ty * TS + 14;      // "pés" no tile
const MAPS = {};

const World = {
  init(mapId) {
    this.mapId = mapId || G.map || 'labirinto';
    G.map = this.mapId;
    const M = this.M = MAPS[this.mapId];
    const built = M.build();
    this.built = built; this.g = built.g;
    this.mw = this.g[0].length; this.mh = this.g.length;
    this.locked = false; this.trail = []; this.walkDist = 0;
    this.menu = null; this.excl = 0; this.t = 0; this.camFocus = null; this.shake = 0;
    this.player = { x: M.start.x, y: M.start.y, dir: M.start.dir || 'down', anim: 0, moving: false, lying: false };
    this.instr = { x: 0, y: 0, dir: 'left', anim: 0, visible: false, follow: false, moving: false };
    this.ents = M.ents(this, built);
    this.triggers = M.triggers(this);
    if (G.pos) { this.player.x = G.pos.x; this.player.y = G.pos.y; }
    M.setup && M.setup(this);
    if (this.instr.follow) { this.instr.x = this.player.x - 20; this.instr.y = this.player.y; }
    const enc = M.encounter;
    this.nextEnc = enc ? (this.encCount() === 0 ? enc.first : enc.min + Math.random() * enc.rand) : 1e9;
    this.renderMap();
    this.updateCam(true);
  },

  encCount() { return this.M.encounter ? (G[this.M.encounter.counter] || 0) : 0; },
  tile(tx, ty) { return (tx < 0 || ty < 0 || tx >= this.mw || ty >= this.mh) ? '#' : this.g[ty][tx]; },
  setTile(tx, ty, c) { this.g[ty][tx] = c; },
  solidTile(tx, ty) { return this.M.solid(this.tile(tx, ty), tx, ty); },
  blocked(x, y) {
    const pts = [[x - 5, y - 5], [x + 5, y - 5], [x - 5, y], [x + 5, y]];
    for (const [px, py] of pts) if (this.solidTile(Math.floor(px / TS), Math.floor(py / TS))) return true;
    for (const e of this.ents) {
      if (!e.solid || e.hidden) continue;
      if (Math.abs(x - e.x) < e.w / 2 + 5 && y > e.y - e.h - 3 && y - 5 < e.y) return true;
    }
    if (this.instr.visible && !this.instr.follow) {
      if (Math.abs(x - this.instr.x) < 12 && y > this.instr.y - 8 && y - 5 < this.instr.y) return true;
    }
    return false;
  },

  redrawTile(x, y) {
    const g = this.mapImg.getContext('2d');
    g.clearRect(x * TS, y * TS, TS, TS);
    const img = this.M.tileImg(this.g[y][x], x, y, this);
    if (img) g.drawImage(img, x * TS, y * TS);
  },
  feetTile() { return [Math.floor(this.player.x / TS), Math.floor((this.player.y - 2) / TS)]; },

  renderMap() {
    const cvs = document.createElement('canvas');
    cvs.width = this.mw * TS; cvs.height = this.mh * TS;
    const g = cvs.getContext('2d');
    this.animTiles = [];
    for (let y = 0; y < this.mh; y++) for (let x = 0; x < this.mw; x++) {
      const c = this.g[y][x];
      const img = this.M.tileImg(c, x, y, this);
      if (img) g.drawImage(img, x * TS, y * TS);
      if (this.M.anim && this.M.anim.includes(c)) this.animTiles.push([x, y, c]);
    }
    this.M.decorate && this.M.decorate(g, this);
    this.mapImg = cvs;
  },

  // ---------- atualização ----------
  update(dt) {
    this.t += dt;
    if (this.excl > 0) this.excl -= dt;
    if (this.shake > 0) this.shake -= dt;
    if (Dialog.open) { Dialog.update(dt); this.updateCam(); return; }
    if (this.menu) { this.updateMenu(); return; }
    const p = this.player;
    p.moving = false;
    const ctl = !this.locked && !p.lying && this.M.playerControl && this.M.playerControl(this, dt);
    if (!this.locked && !p.lying && !ctl) {
      const v = moveVector();
      if (v.x || v.y) {
        const sp = 90 * dt * (this.M.speedMul ? this.M.speedMul(this) : 1);
        if (Math.abs(v.y) > Math.abs(v.x) * 1.05) p.dir = v.y < 0 ? 'up' : 'down';
        else if (v.x) p.dir = v.x < 0 ? 'left' : 'right';
        const ox = p.x, oy = p.y;
        if (v.x && !this.blocked(p.x + v.x * sp, p.y)) p.x += v.x * sp;
        if (v.y && !this.blocked(p.x, p.y + v.y * sp)) p.y += v.y * sp;
        const moved = Math.hypot(p.x - ox, p.y - oy);
        if (moved > 0) {
          p.moving = true; p.anim += dt * 7 * Math.max(0.6, Math.hypot(v.x, v.y));
          this.trail.push({ x: p.x, y: p.y, dir: p.dir });
          if (this.trail.length > 200) this.trail.shift();
          this.checkTriggers();
          if (!this.locked) this.checkEncounter(moved);
        }
      }
      if (!this.locked) {
        if (Input.isPressed('a') || Input.tap) this.interact();
        else if (Input.isPressed('b')) { Sfx.select(); this.menu = { level: 'main', sel: 0 }; }
      }
    }
    if (!p.moving) p.anim = 0;
    this.updateInstr(dt);
    this.M.update && this.M.update(this, dt);
    this.updateCam();
  },

  updateInstr(dt) {
    const I = this.instr;
    if (!I.follow || I.scripted) return;
    const tr = this.trail, lag = 22;
    if (tr.length > lag) {
      const t = tr[tr.length - 1 - lag];
      const moving = Math.hypot(t.x - I.x, t.y - I.y) > 0.3;
      if (moving) { I.dir = t.x < I.x ? 'left' : (t.x > I.x ? 'right' : I.dir); I.anim += dt * 6; }
      I.moving = moving && this.player.moving;
      I.x = t.x; I.y = t.y;
    }
  },

  updateCam(snap) {
    const p = this.player, f = this.camFocus || { x: p.x, y: p.y - 10 };
    const tx = Math.max(0, Math.min(this.mw * TS - VIEW_W, f.x - VIEW_W / 2));
    const ty = Math.max(0, Math.min(this.mh * TS - VIEW_H, f.y - VIEW_H / 2));
    if (snap || !this.cam || !this.camFocus && !this.camEase) this.cam = { x: tx, y: ty };
    else {
      this.cam.x += (tx - this.cam.x) * 0.08; this.cam.y += (ty - this.cam.y) * 0.08;
      if (!this.camFocus && Math.abs(tx - this.cam.x) < 1 && Math.abs(ty - this.cam.y) < 1) this.camEase = false;
    }
  },
  focus(x, y) { this.camFocus = x === null ? null : { x, y }; this.camEase = true; },

  checkTriggers() {
    const p = this.player, tx = Math.floor(p.x / TS), ty = Math.floor((p.y - 2) / TS);
    for (const t of this.triggers) {
      if (tx >= t.x && tx < t.x + t.w && ty >= t.y && ty < t.y + t.h && t.when()) { t.run(); return; }
    }
  },

  checkEncounter(moved) {
    const E = this.M.encounter; if (!E) return;
    const p = this.player;
    if (this.tile(Math.floor(p.x / TS), Math.floor((p.y - 2) / TS)) !== E.tile) return;
    if (!E.enabled()) return;
    if ((G[E.counter] || 0) >= E.max) return;
    this.walkDist += moved;
    if (this.walkDist >= this.nextEnc) {
      this.walkDist = 0; this.nextEnc = E.min + Math.random() * E.rand;
      this.encounter(E.pick(G[E.counter] || 0));
    }
  },

  interact() {
    const p = this.player;
    const off = { up: [0, -12], down: [0, 10], left: [-12, -3], right: [12, -3] }[p.dir];
    const fx = p.x + off[0], fy = p.y + off[1];
    for (const e of this.ents) {
      if (e.hidden || !e.talk) continue;
      if (Math.abs(fx - e.x) < e.w / 2 + 6 && fy > e.y - e.h - 12 && fy < e.y + 8) { Sfx.move(); e.talk(); return; }
    }
    const I = this.instr;
    const tx = Math.floor(fx / TS), ty = Math.floor(fy / TS);
    // Porta/parede na frente tem prioridade sobre o seguidor (ele costuma ficar colado em você).
    const tileFirst = I.follow && this.solidTile(tx, ty);
    if (!tileFirst && I.visible && Math.abs(fx - I.x) < 16 && fy > I.y - 22 && fy < I.y + 10 && this.M.talkInstr) { this.M.talkInstr(this); return; }
    this.M.interactTile && this.M.interactTile(this, this.tile(tx, ty), tx, ty);
  },

  // ---------- menu do mundo (botão B) ----------
  menuOpts() {
    const M = this.menu;
    if (M.level === 'main') return G.flags.phone ? ['ITEM', 'STATUS', 'CELULAR', 'CONFIG', 'FECHAR'] : ['ITEM', 'STATUS', 'CONFIG', 'FECHAR'];
    if (M.level === 'items') return G.items.concat(['VOLTAR']);
    return ['VOLTAR'];
  },
  updateMenu() {
    const M = this.menu, opts = this.menuOpts();
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
      else if (o === 'CONFIG') { this.menu = null; ConfigMenu.open(); }
      else if (o === 'CELULAR') { this.menu = null; Phone.open(); }
      else this.menu = null;
    } else if (M.level === 'items') {
      if (o === 'VOLTAR') this.menu = { level: 'main', sel: 0 };
      else { this.menu = null; Dialog.show([useItem(ch)]); }
    } else this.menu = { level: 'main', sel: 0 };
  },

  drawMenu() {
    const M = this.menu;
    if (M.level === 'stat') {
      frameBox(20, 20, 330, 380, 5);
      const dn = G.dragon ? DRAGONS[G.dragon].name : '---';
      const L = [`"${displayName()}"`, `LV ${G.lv}`, `HP ${G.hp} / ${G.maxhp}`, `ATQ ${playerAtk()}   DEF ${playerDef()}`,
        `EXP ${G.xp}   OURO ${G.gold}`, `Dragão: ${dn}`, `Poupados: ${G.spares}`, `Derrotados: ${G.kills}`];
      L.forEach((l, i) => text(l, 46, 40 + i * 40, 32));
      return;
    }
    const opts = this.menuOpts();
    frameBox(20, 20, 300, 60 + opts.length * 40, 5);
    opts.forEach((o, i) => {
      if (i === M.sel) drawSpr(SPR.soul, 36, 82 + i * 40, 1);
      text(o, 64, 70 + i * 40, 34);
    });
  },

  // ---------- desenho ----------
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const c = this.cam;
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 12 * this.shake, (Math.random() - 0.5) * 12 * this.shake);
    ctx.drawImage(this.mapImg, Math.round(c.x), Math.round(c.y), VIEW_W, VIEW_H, 0, 0, W, H);
    const sx = x => Math.round((x - c.x) * 2), sy = y => Math.round((y - c.y) * 2);
    // tiles animados (lava, água)
    if (this.animTiles.length) {
      const fr = Math.floor(this.t * 3);
      for (const [x, y, ch] of this.animTiles) {
        if (x * TS + TS < c.x || x * TS > c.x + VIEW_W || y * TS + TS < c.y || y * TS > c.y + VIEW_H) continue;
        const img = this.M.animImg(ch, x, y, fr, this);
        if (img) ctx.drawImage(img, sx(x * TS), sy(y * TS), TS * 2, TS * 2);
      }
    }

    const list = [];
    for (const e of this.ents) if (!e.hidden) list.push({ y: e.y + (e.zOff || 0), d: () => this.drawEnt(e, sx, sy) });
    const I = this.instr;
    if (I.visible) list.push({ y: I.y, d: () => {
      const fr = I.moving ? Math.floor(I.anim) % 2 : 0;
      if (I.kind === 'robot') {
        const set = SPR.robot.bit, img = I.sad ? set.sad : set[I.dir === 'left' ? 'left' : 'right'][I.moving ? Math.floor(I.anim * 2) % 2 : 0];
        drawSpr(img, sx(I.x - 8), sy(I.y - 22) + (I.moving ? 0 : Math.round(Math.sin(this.t * 4))), 2, I.alpha ?? 1);
        return;
      }
      const blink = !I.moving && (this.t % 3.4) > 3.25;
      const img = blink ? (I.dir === 'left' ? SPR.instr.blinkL : SPR.instr.blinkR) : SPR.instr[I.dir === 'left' ? 'left' : 'right'][fr];
      drawSpr(img, sx(I.x - 10), sy(I.y - 34), 2, I.alpha ?? 1);
    } });
    const p = this.player;
    list.push({ y: p.y, d: () => {
      if (p.lying) { drawSpr(SPR.playerLying, sx(p.x - 10), sy(p.y - 12), 2); return; }
      const fr = p.moving ? Math.floor(p.anim) % 4 : 0;
      const pset = (G.flags.p5uniform && !G.flags.p5free) ? SPR.playerGray : SPR.player;
      drawSpr(pset[p.dir][fr], sx(p.x - 7), sy(p.y - 21), 2);
      if (p.carry) drawSpr(SPR.brick, sx(p.x - 5), sy(p.y - 30), 2);
      if (this.excl > 0) text('!', sx(p.x), sy(p.y - 36), 40, '#fff', 'center', FONT_TITLE);
    } });
    list.sort((a, b) => a.y - b.y).forEach(o => o.d());
    this.M.overlay && this.M.overlay(this, sx, sy);
    ctx.restore();

    const grd = ctx.createRadialGradient(320, 240, 180, 320, 240, 420);
    grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    if (this.menu) this.drawMenu();
    Dialog.draw();
  },

  drawEnt(e, sx, sy) {
    if (e.draw) return e.draw(sx, sy, this.t);
    if (e.spr === 'sparkle') {
      const a = 0.5 + Math.sin(this.t * 6) * 0.5;
      ctx.fillStyle = `rgba(255,255,200,${a})`;
      const x = sx(e.x), y = sy(e.y - 6);
      ctx.fillRect(x - 2, y - 8, 4, 16); ctx.fillRect(x - 8, y - 2, 16, 4);
      return;
    }
    const img = typeof e.spr === 'string' ? SPR[e.spr] : e.spr;
    let yy = e.y - img.height + (e.yOff || 0);
    if (e.spr === 'star') {
      yy -= 3 + Math.sin(this.t * 3) * 2;
      ctx.globalAlpha = 0.25 + Math.sin(this.t * 3) * 0.1; ctx.fillStyle = '#ffe680';
      ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y - 8), 22, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
    drawSpr(img, sx(e.x - img.width / 2), sy(yy), 2);
  },

  // ---------- auxiliares de roteiro ----------
  async walk(ent, pts, speed = 60) {
    ent.moving = true;
    for (const [x, y] of pts) {
      while (Math.hypot(x - ent.x, y - ent.y) > 1) {
        const dt = await nextFrame();
        const a = Math.atan2(y - ent.y, x - ent.x), st = Math.min(speed * dt, Math.hypot(x - ent.x, y - ent.y));
        ent.x += Math.cos(a) * st; ent.y += Math.sin(a) * st; ent.anim = (ent.anim || 0) + dt * 6;
        if (Math.abs(x - ent.x) > 0.5) ent.dir = x < ent.x ? 'left' : 'right';
        if (ent === this.player && Math.abs(y - ent.y) > Math.abs(x - ent.x)) ent.dir = y < ent.y ? 'up' : 'down';
      }
      ent.x = x; ent.y = y;
    }
    ent.moving = false;
  },

  say(lines) {
    const WHO = { I: 'instr', F: 'fire', G: 'ice', D: 'dragon', T: 'trein', S: 'stranger', P: 'peng', B: 'bit', V: 'volt', R: 'brutao', K: 'teca', Z: 'ze', C: 'kid',
      M: 'marsh', H: 'choco', Y: 'piru', N: 'macaron', O: 'vovo', U: 'ferrugem', L: 'lia' };
    return Dialog.show(lines.map(t => {
      if (typeof t !== 'string') return t;
      const m = /^([IFGDTSPBVRKZCMHYNOUL]):\s*(.*)$/s.exec(t);
      return m ? { who: WHO[m[1]], t: '* ' + m[2] } : t;
    }), this.player.y - this.cam.y > 150);
  },
  ask(text, choices) {
    const m = /^([IFGBVMHLO]):\s*(.*)$/s.exec(text);
    const who = m ? { I: 'instr', F: 'fire', G: 'ice', B: 'bit', V: 'volt', M: 'marsh', H: 'choco', L: 'lia', O: 'vovo' }[m[1]] : null;
    return Dialog.ask(m ? '* ' + m[2] : text, choices, who);
  },

  battle(key, opts, after) {
    this.locked = true;
    Game.startBattle(key, opts, r => {
      if (r === 'dead') return;
      Sfx.playMusic(this.M.musicAt ? this.M.musicAt(this) : this.M.music);
      this.locked = false;
      after && after(r);
    });
  },

  async encounter(key) {
    this.locked = true;
    this.excl = 0.6; Sfx.encounter();
    await wait(0.6);
    const E = this.M.encounter;
    G[E.counter] = (G[E.counter] || 0) + 1;
    const n = G[E.counter];
    this.battle(key, E.opts ? E.opts() : {}, async r => {
      E.after && await E.after(this, r, n);
      if (n >= E.max) await this.say([E.doneText]);
    });
  },

  saveHere(dy = 4) { saveGame({ x: this.player.x, y: this.player.y + dy }); },
};

// Promessa que resolve no próximo quadro (com dt)
const frameWaiters = [];
function nextFrame() { return new Promise(r => frameWaiters.push(r)); }
function flushFrameWaiters(dt) { const l = frameWaiters.splice(0); l.forEach(r => r(dt)); }
