// BOSS BATTLES — hub, níveis, missões, loja, roleta aleatória e resultados.
'use strict';

// sem multiplayer neste jogo
const Coop = { active: false, role: null, players: [], count: () => 1, vec: () => ({ x: 0, y: 0 }), sprites: () => SPR };

// ---------- progresso ----------
const BB_KEY = 'bossbattles_v1';
function newProgress() {
  return {
    name: 'HERÓI', lv: 1, xp: 0, hp: 20, maxhp: 20, gold: 30, items: ['Hambúrguer'],
    flags: {}, kills: 0, spares: 0, atkBonus: 0, defBonus: 0,
    wins: 0, losses: 0, streak: 0, best: 0, bossWins: {}, seen: {}, missions: [], missionsDone: 0,
  };
}
function saveProgress() { try { localStorage.setItem(BB_KEY, JSON.stringify(G)); } catch (e) { } }
function loadProgress() {
  try { const s = JSON.parse(localStorage.getItem(BB_KEY)); if (s) return { ...newProgress(), ...s }; } catch (e) { }
  return newProgress();
}

const xpNeed = lv => 30 + (lv - 1) * 25;
// trocam as fórmulas do PERDIDO: aqui não tem limite de nível
function addXp(n) {
  G.xp += n;
  let up = false;
  while (G.xp >= xpNeed(G.lv)) { G.xp -= xpNeed(G.lv); G.lv++; G.maxhp += 4; G.hp = G.maxhp; up = true; }
  return up;
}
function playerAtk() { return 8 + (G.lv - 1) * 2 + G.atkBonus; }
function playerDef() { return Math.floor((G.lv - 1) / 2) + G.defBonus; }

Object.assign(ITEMS, {
  'Hambúrguer': { heal: 15, price: 10, text: '* Você comeu um Hambúrguer.\n* Presente do Noob, provavelmente.' },
  'Poção': { heal: 30, price: 22, text: '* Você bebeu a Poção.\n* Gosto de morango com magia.' },
  'Bolo Gigante': { heal: 99, price: 55, text: '* Você comeu o Bolo Gigante inteiro.\n* Como coube?' },
});
const SHOP = [
  { name: 'Hambúrguer', item: true },
  { name: 'Poção', item: true },
  { name: 'Bolo Gigante', item: true },
  { name: 'Treinar ATAQUE', price: () => 40 + G.atkBonus * 30, buy() { G.atkBonus++; } },
  { name: 'Treinar DEFESA', price: () => 50 + G.defBonus * 40, buy() { G.defBonus++; } },
];
const shopPrice = s => s.item ? ITEMS[s.name].price : s.price();

// ---------- missões aleatórias ----------
const pick = a => a[(Math.random() * a.length) | 0];
const rint = (a, b) => a + ((Math.random() * (b - a + 1)) | 0);
function newMission() {
  const kinds = ['win', 'boss', 'nodmg', 'spare', 'fast', 'mod', 'streak', 'fight'];
  const t = pick(kinds), m = { t, p: 0, n: 1 };
  if (t === 'win') { m.n = rint(2, 4); m.text = `Vença ${m.n} lutas`; }
  else if (t === 'boss') { m.k = pick(BOSSES); m.n = rint(1, 2); m.text = `Vença ${ENEMIES[m.k].name} ${m.n}x`; }
  else if (t === 'nodmg') m.text = 'Vença sem levar dano';
  else if (t === 'spare') m.text = 'Poupe um boss';
  else if (t === 'fast') { m.max = rint(5, 8); m.text = `Vença em até ${m.max} turnos`; }
  else if (t === 'mod') m.text = 'Vença um boss modificado';
  else if (t === 'streak') { m.n = rint(2, 3); m.text = `Faça ${m.n} vitórias seguidas`; }
  else m.text = 'Derrote um boss lutando';
  m.xp = 20 + G.lv * 8; m.gold = 15 + G.lv * 4;
  return m;
}
function fillMissions() { while (G.missions.length < 3) G.missions.push(newMission()); }
// r = {boss, result, dmg, turns, mod}
function progressMissions(r) {
  const win = r.result === 'spared' || r.result === 'defeated', done = [];
  for (const m of G.missions) {
    if (m.t === 'streak') m.p = win ? Math.max(m.p, G.streak) : 0;
    else if (!win) continue;
    else if (m.t === 'win') m.p++;
    else if (m.t === 'boss' && m.k === r.boss) m.p++;
    else if (m.t === 'nodmg' && r.dmg === 0) m.p++;
    else if (m.t === 'spare' && r.result === 'spared') m.p++;
    else if (m.t === 'fast' && r.turns <= m.max) m.p++;
    else if (m.t === 'mod' && r.mod) m.p++;
    else if (m.t === 'fight' && r.result === 'defeated') m.p++;
    if (m.p >= m.n) done.push(m);
  }
  G.missions = G.missions.filter(m => !done.includes(m));
  for (const m of done) { G.gold += m.gold; G.missionsDone++; }
  return done;
}

// ---------- interface ----------
function button(x, y, w, h, label, on, color = '#ffe680') {
  ctx.fillStyle = on ? 'rgba(255,230,128,0.14)' : '#000'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = on ? '#ffff40' : color; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  if (on) drawSpr(SPR.soul, x + 10, y + h / 2 - 7, 1);
  text(label, x + w / 2 + (on ? 8 : 0), y + h / 2 - 15, 30, on ? '#ffff40' : color, 'center');
}
function tapped(r) { return Input.tap && hitRect(Input.tap, r); }
function menuNav(sel, n, cols = 1) {
  if (Input.isPressed('down')) { Sfx.move(); sel = (sel + cols) % n; }
  if (Input.isPressed('up')) { Sfx.move(); sel = (sel - cols + n) % n; }
  if (cols > 1 && Input.isPressed('right')) { Sfx.move(); sel = (sel + 1) % n; }
  if (cols > 1 && Input.isPressed('left')) { Sfx.move(); sel = (sel - 1 + n) % n; }
  return sel;
}
function stars(t) {
  for (let i = 0; i < 40; i++) {
    const x = (i * 97 + t * (10 + i % 5 * 6)) % 660 - 10, y = (i * 53) % 480;
    ctx.fillStyle = i % 3 ? '#2a2a4a' : '#4a3a6a'; ctx.fillRect(x, y, 2, 2);
  }
}

// ----- HUB -----
const HUB_BTNS = [
  { k: 'fight', label: 'LUTAR!', x: 40, y: 330, w: 270, h: 56 },
  { k: 'shop', label: 'LOJA', x: 330, y: 330, w: 270, h: 56 },
  { k: 'dex', label: 'BOSSES', x: 40, y: 398, w: 270, h: 56 },
  { k: 'cfg', label: 'CONTROLE', x: 330, y: 398, w: 270, h: 56 },
];
const Hub = {
  sel: 0, t: 0, toast: null,
  enter() { Game.scene = 'hub'; G.hp = G.maxhp; fillMissions(); saveProgress(); Sfx.playMusic('bbhub'); },
  update(dt) {
    this.t += dt;
    if (this.toast) { this.toast.t -= dt; if (this.toast.t <= 0) this.toast = null; }
    this.sel = menuNav(this.sel, 4, 2);
    let go = Input.isPressed('a') ? HUB_BTNS[this.sel].k : null;
    HUB_BTNS.forEach((b, i) => { if (tapped(b)) { this.sel = i; go = b.k; } });
    if (!go) return;
    Sfx.select();
    if (go === 'fight') Roulette.enter();
    else if (go === 'shop') Shop.enter();
    else if (go === 'dex') Dex.enter();
    else {
      Config.control = Config.control === 'analog' ? 'dpad' : 'analog'; Config.save();
      this.toast = { s: Config.control === 'analog' ? 'Controle: ANALÓGICO' : 'Controle: DIRECIONAL', t: 1.6 };
    }
  },
  draw() {
    ctx.fillStyle = '#05050c'; ctx.fillRect(0, 0, W, H); stars(this.t);
    text('BOSS BATTLES', 320, 14, 30, '#ff5a5a', 'center', FONT_TITLE);
    // cartão do jogador
    frameBox(28, 58, 584, 104, 4);
    drawSpr(SPR.soul, 48, 76, 3);
    text(G.name, 110, 64, 34); text('LV ' + G.lv, 110, 98, 30, '#ffe680');
    const need = xpNeed(G.lv), fr = G.xp / need;
    ctx.fillStyle = '#333'; ctx.fillRect(200, 108, 220, 14); ctx.fillStyle = '#5ff8ff'; ctx.fillRect(200, 108, 220 * fr, 14);
    text(`EXP ${G.xp}/${need}`, 200, 120, 22, '#9adfff');
    text(`HP ${G.maxhp}   ATK ${playerAtk()}   DEF ${playerDef()}`, 200, 66, 26);
    text(`OURO ${G.gold}`, 600, 66, 26, '#ffd23a', 'right');
    text(`VITÓRIAS ${G.wins}`, 600, 92, 24, '#7fff9f', 'right');
    text(`SEQUÊNCIA ${G.streak}`, 600, 118, 24, G.streak ? '#ff9a3a' : '#888', 'right');
    // missões
    text('MISSÕES', 40, 172, 28, '#b08aff');
    G.missions.forEach((m, i) => {
      const y = 204 + i * 38;
      ctx.strokeStyle = '#3a2a5a'; ctx.lineWidth = 2; ctx.strokeRect(40, y, 560, 32);
      text('★ ' + m.text, 52, y + 2, 26);
      text(`${Math.min(m.p, m.n)}/${m.n}`, 440, y + 2, 26, '#ffe680', 'right');
      text(`+${m.xp}XP +${m.gold}G`, 590, y + 4, 22, '#7fff9f', 'right');
    });
    HUB_BTNS.forEach((b, i) => button(b.x, b.y, b.w, b.h, b.label, i === this.sel, b.k === 'fight' ? '#ff5a5a' : '#ffe680'));
    if (this.toast) { frameBox(170, 200, 300, 60, 4); text(this.toast.s, 320, 214, 28, '#fff', 'center'); }
  },
};

// ----- ROLETA (boss e modificador aleatórios) -----
const MOD_KEYS = Object.keys(MODS);
const Roulette = {
  enter() {
    Game.scene = 'roulette'; this.t = 0; this.done = false;
    this.boss = pick(BOSSES);
    this.mod = Math.random() < 0.45 ? null : pick(MOD_KEYS);
    this.spinB = 0; this.spinM = 0; this.tick = 0;
    Sfx.stopMusic && Sfx.stopMusic();
  },
  update(dt) {
    this.t += dt;
    const T = 2.4;
    if (this.t < T) {
      this.tick -= dt;
      if (this.tick <= 0) { this.tick = 0.05 + this.t * 0.07; this.spinB++; this.spinM += 2; Sfx.move(); }
    } else if (!this.done) {
      this.done = true; Sfx.select();
      if (this.mod) setTimeout(() => Sfx.rumble(), 300);
    }
    if (this.done && this.t > T + 0.6 && (Input.isPressed('a') || Input.tap)) this.start();
  },
  start() {
    G.seen[this.boss] = true; G.hp = G.maxhp; Results.lvStart = G.lv;
    const boss = this.boss, mod = this.mod;
    Game.scene = 'battle';
    Game.battleObj = new BossBattle(boss, { lv: G.lv, mod, onEnd: (res, B) => setTimeout(() => Results.enter(boss, mod, res, B), res === 'dead' ? 1600 : 500) });
  },
  draw() {
    ctx.fillStyle = '#05050c'; ctx.fillRect(0, 0, W, H); stars(this.t * 6);
    text('ROLETA DO DESTINO', 320, 24, 22, '#ffe680', 'center', FONT_TITLE);
    const k = this.done ? this.boss : BOSSES[this.spinB % BOSSES.length], d = ENEMIES[k], img = SPR[d.spr];
    frameBox(180, 70, 280, 230, 4);
    const sc = 7, a = this.done ? 1 : 0.6;
    if (!this.done) { ctx.globalAlpha = 0.5; }
    ctx.drawImage(img, 320 - img.width * sc / 2, 86 + (this.done ? Math.sin(this.t * 3) * 3 : 0), img.width * sc, img.height * sc);
    ctx.globalAlpha = 1; void a;
    text(d.name.toUpperCase(), 320, 310, 34, this.done ? '#fff' : '#888', 'center');
    text(d.title, 320, 342, 24, '#b08aff', 'center');
    const mk = this.done ? this.mod : (this.spinM % 3 ? MOD_KEYS[this.spinM % MOD_KEYS.length] : null), m = MODS[mk];
    frameBox(170, 376, 300, 44, 3);
    text(m ? m.name : 'NORMAL', 320, 382, 30, m ? m.color : '#ccc', 'center');
    if (this.done) {
      if (m) text(m.desc, 320, 424, 24, '#aaa', 'center');
      if (this.t > 3 && Math.floor(this.t * 2) % 2) text('Toque ou A para LUTAR', 320, 450, 26, '#ffff40', 'center');
    }
  },
};

// ----- RESULTADOS -----
const Results = {
  enter(boss, mod, res, B) {
    Game.scene = 'results'; this.t = 0;
    const win = res === 'spared' || res === 'defeated';
    this.win = win; this.res = res; this.boss = boss;
    if (win) {
      G.wins++; G.streak++; G.best = Math.max(G.best, G.streak);
      G.bossWins[boss] = (G.bossWins[boss] || 0) + 1;
      this.xp = B.e.xp; this.gold = B.e.gold;
    } else { G.losses++; G.streak = 0; this.xp = 0; this.gold = 0; }
    this.done = progressMissions({ boss, result: res, dmg: B.dmgTaken, turns: B.turn, mod });
    for (const m of this.done) addXp(m.xp);
    this.lvUp = G.lv > this.lvStart;
    this.lv = G.lv;
    fillMissions(); saveProgress();
    Sfx.playMusic(win ? 'victory' : 'bbhub');
  },
  update(dt) {
    this.t += dt;
    if (this.t > 1 && (Input.isPressed('a') || Input.tap)) { Sfx.select(); Hub.enter(); }
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(this.t * 4);
    const title = this.win ? (this.res === 'spared' ? 'POUPADO!' : 'VITÓRIA!') : (this.res === 'fled' ? 'FUGIU...' : 'DERROTA');
    text(title, 320, 40, 34, this.win ? '#7fff9f' : '#ff5a5a', 'center', FONT_TITLE);
    text(ENEMIES[this.boss].title, 320, 96, 28, '#b08aff', 'center');
    let y = 150;
    if (this.win) {
      text(`+${this.xp} EXP   +${this.gold} OURO`, 320, y, 32, '#ffe680', 'center'); y += 40;
      text(`Sequência: ${G.streak} (recorde ${G.best})`, 320, y, 26, '#ff9a3a', 'center'); y += 40;
    } else { text('Não desista! Os bosses são sorteados de novo.', 320, y, 26, '#ccc', 'center'); y += 50; }
    if (this.lvUp) { text(`SUBIU PARA O LV ${this.lv}!`, 320, y, 32, '#5ff8ff', 'center'); y += 44; }
    for (const m of this.done) { text(`★ Missão: ${m.text}  (+${m.xp}XP +${m.gold}G)`, 320, y, 24, '#7fff9f', 'center'); y += 32; }
    if (this.t > 1 && Math.floor(this.t * 2) % 2) text('Toque ou A para continuar', 320, 440, 26, '#ffff40', 'center');
  },
};

// ----- LOJA -----
const Shop = {
  enter() { Game.scene = 'shop'; this.sel = 0; this.msg = 'Bem-vindo! Compre antes da luta.'; },
  rows() { return SHOP.map((s, i) => ({ s, r: { x: 40, y: 110 + i * 54, w: 560, h: 46 }, i })).concat([{ back: true, r: { x: 40, y: 110 + SHOP.length * 54, w: 560, h: 46 }, i: SHOP.length }]); },
  update() {
    const rows = this.rows();
    this.sel = menuNav(this.sel, rows.length);
    let i = Input.isPressed('a') ? this.sel : -1;
    rows.forEach(o => { if (tapped(o.r)) { this.sel = o.i; i = o.i; } });
    if (Input.isPressed('b')) { Sfx.back(); return Hub.enter(); }
    if (i < 0) return;
    const o = rows[i];
    if (o.back) { Sfx.back(); return Hub.enter(); }
    const p = shopPrice(o.s);
    if (G.gold < p) { Sfx.back(); this.msg = 'Ouro insuficiente!'; return; }
    if (o.s.item && G.items.length >= 8) { Sfx.back(); this.msg = 'Sua mochila está cheia (8).'; return; }
    G.gold -= p; Sfx.heal();
    if (o.s.item) { G.items.push(o.s.name); this.msg = `Você comprou ${o.s.name}.`; } else { o.s.buy(); this.msg = 'Você ficou mais forte!'; }
    saveProgress();
  },
  draw() {
    ctx.fillStyle = '#0a0806'; ctx.fillRect(0, 0, W, H);
    text('LOJA', 320, 20, 28, '#ffd23a', 'center', FONT_TITLE);
    text(`OURO ${G.gold}   MOCHILA ${G.items.length}/8   ATK ${playerAtk()}   DEF ${playerDef()}`, 320, 64, 26, '#ccc', 'center');
    for (const o of this.rows()) {
      const on = o.i === this.sel, r = o.r;
      ctx.strokeStyle = on ? '#ffff40' : '#665'; ctx.lineWidth = 3; ctx.strokeRect(r.x, r.y, r.w, r.h);
      if (on) drawSpr(SPR.soul, r.x + 10, r.y + 16, 1);
      if (o.back) { text('VOLTAR', r.x + 40, r.y + 8, 30, on ? '#ffff40' : '#fff'); continue; }
      const it = ITEMS[o.s.name];
      text(o.s.name, r.x + 40, r.y + 8, 30, on ? '#ffff40' : '#fff');
      text(o.s.item ? `cura ${it.heal >= 99 ? 'tudo' : it.heal}` : 'permanente', r.x + 330, r.y + 10, 24, '#9a9');
      text(`${shopPrice(o.s)}G`, r.x + r.w - 14, r.y + 8, 30, '#ffd23a', 'right');
    }
    text(this.msg, 320, 440, 26, '#ffe680', 'center');
  },
};

// ----- BESTIÁRIO -----
const Dex = {
  enter() { Game.scene = 'dex'; this.i = 0; this.t = 0; },
  update(dt) {
    this.t += dt;
    if (Input.isPressed('right') || (Input.tap && Input.tap.x > 480 && Input.tap.y < 400)) { Sfx.move(); this.i = (this.i + 1) % BOSSES.length; }
    if (Input.isPressed('left') || (Input.tap && Input.tap.x < 160 && Input.tap.y < 400)) { Sfx.move(); this.i = (this.i - 1 + BOSSES.length) % BOSSES.length; }
    if (Input.isPressed('b') || Input.isPressed('a') || (Input.tap && Input.tap.y >= 400)) { Sfx.back(); Hub.enter(); }
  },
  draw() {
    ctx.fillStyle = '#05050c'; ctx.fillRect(0, 0, W, H); stars(this.t);
    const k = BOSSES[this.i], d = ENEMIES[k], seen = G.seen[k], img = SPR[d.spr];
    text(`BOSSES ${this.i + 1}/${BOSSES.length}`, 320, 18, 22, '#ffe680', 'center', FONT_TITLE);
    text('◀', 60, 160, 50, '#888', 'center'); text('▶', 580, 160, 50, '#888', 'center');
    const sc = 7;
    if (!seen) ctx.filter = 'brightness(0)';
    ctx.drawImage(img, 320 - img.width * sc / 2, 60, img.width * sc, img.height * sc);
    ctx.filter = 'none';
    text(seen ? d.title : '???', 320, 226, 30, '#b08aff', 'center');
    if (seen) {
      d.check.split('\n').forEach((l, j) => text(l, 320, 266 + j * 30, 26, '#ddd', 'center'));
      text(`Vitórias contra ele: ${G.bossWins[k] || 0}`, 320, 366, 26, '#7fff9f', 'center');
    } else text('Lute para descobrir!', 320, 280, 26, '#888', 'center');
    text('VOLTAR', 320, 430, 30, '#ffff40', 'center');
  },
};

// ----- TÍTULO -----
const Title = {
  t: 0,
  enter() { Game.scene = 'title'; Sfx.playMusic('bbhub'); },
  update(dt) { this.t += dt; if (this.t > 0.5 && (Input.isPressed('a') || Input.tap)) { Sfx.select(); Hub.enter(); } },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(this.t * 10);
    text('BOSS', 320, 70, 56, '#ff5a5a', 'center', FONT_TITLE);
    text('BATTLES', 320, 140, 56, '#ffe680', 'center', FONT_TITLE);
    const n = SPR.bbNoob, f = SPR.bbFushi;
    ctx.drawImage(n, 150, 230 + Math.sin(this.t * 3) * 4, n.width * 6, n.height * 6);
    ctx.drawImage(f, 394, 230 + Math.sin(this.t * 3 + 1) * 4, f.width * 6, f.height * 6);
    drawSpr(SPR.soul, 312, 300, 2);
    text('Um simulador de lutas contra bosses. Tudo é aleatório.', 320, 200, 24, '#aaa', 'center');
    if (Math.floor(this.t * 2) % 2) text('Toque ou A para começar', 320, 420, 28, '#fff', 'center');
  },
};

// ---------- laço principal ----------
const Game = {
  scene: 'boot', battleObj: null,
  start() {
    buildSprites(); buildBossSprites();
    setupTouchControls();
    Config.load();
    G = loadProgress();
    Title.enter();
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      Timers.update(dt); Fade.update(dt);
      const S = { title: Title, hub: Hub, roulette: Roulette, results: Results, shop: Shop, dex: Dex }[this.scene];
      ctx.imageSmoothingEnabled = false;
      if (this.scene === 'battle') { this.battleObj.update(dt); this.battleObj.draw(); }
      else if (S) { S.update(dt); S.draw(); }
      Fade.draw && Fade.draw();
      Input.endFrame();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
};

document.fonts && document.fonts.load('30px "VT323"');
document.fonts && document.fonts.load('30px "PressStart"');
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => Game.start());
