// Motor de batalha do Criador: roda qualquer batalha montada no editor.
// Usa o texto, o "Typer", os controles e as músicas do PERDIDO (engine.js e audio.js).
'use strict';

const BOX_FULL = { x: 32, y: 250, w: 576, h: 140 };
const BTN_Y = 422, BTN_W = 131, BTN_H = 46;
const BTNS = [{ k: 'lutar', label: 'LUTAR', x: 32 }, { k: 'agir', label: 'AGIR', x: 180 }, { k: 'item', label: 'ITEM', x: 328 }, { k: 'poupar', label: 'POUPAR', x: 476 }];
const BOXES = { p: { w: 150, h: 130 }, m: { w: 210, h: 160 }, g: { w: 300, h: 170 } };
const COLORS = { azul: '#3ab8ff', laranja: '#ff9a1a' };
const hitR = (p, x, y, w, h) => p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;

// ---------- desenhos dos projéteis ----------
function heartPath(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.4, y + s * 0.1, x - s * 0.7, y - s * 1.0, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.7, y - s * 1.0, x + s * 1.4, y + s * 0.1, x, y + s * 0.9);
}
function drawSoul(x, y, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color; heartPath(x, y, 8); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x - 5, y - 4, 2, 2);
  ctx.globalAlpha = 1;
}
const PROJ = {
  osso(b, c) {
    const L = b.len || 22, a = b.ang || 0;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
    ctx.fillStyle = '#000'; ctx.fillRect(-L / 2 - 1, -4, L + 2, 8);
    ctx.fillStyle = c || '#fff'; ctx.fillRect(-L / 2 + 2, -2, L - 4, 4);
    ctx.beginPath(); ctx.arc(-L / 2 + 2, -2, 3, 0, 7); ctx.arc(-L / 2 + 2, 2, 3, 0, 7); ctx.arc(L / 2 - 2, -2, 3, 0, 7); ctx.arc(L / 2 - 2, 2, 3, 0, 7); ctx.fill();
    ctx.restore();
  },
  estrela(b, c) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate((b.t || 0) * 4);
    ctx.fillStyle = '#000'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 4.5 : 10, a = i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill();
    ctx.fillStyle = c || '#ffe680'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 3 : 8, a = i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill();
    ctx.restore();
  },
  faca(b, c) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang ?? Math.atan2(b.vy, b.vx));
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-2, -5); ctx.lineTo(-2, 5); ctx.fill(); ctx.fillRect(-12, -3, 11, 6);
    ctx.fillStyle = c || '#e8ecf4'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-1, -3); ctx.lineTo(-1, 3); ctx.fill();
    ctx.fillStyle = '#a8642a'; ctx.fillRect(-11, -2, 9, 4);
    ctx.restore();
  },
  fogo(b, c) {
    const f = Math.sin((b.t || 0) * 20) * 1.5;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, 7); ctx.fill();
    ctx.fillStyle = c || '#ff7a1a'; ctx.beginPath(); ctx.moveTo(b.x - 7, b.y + 2); ctx.quadraticCurveTo(b.x, b.y - 16 - f, b.x + 7, b.y + 2); ctx.arc(b.x, b.y + 1, 7, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(b.x, b.y + 2, 3.5, 0, 7); ctx.fill();
  },
  coracao(b, c) { ctx.fillStyle = '#000'; heartPath(b.x, b.y, 9); ctx.fill(); ctx.fillStyle = c || '#ff3b6a'; heartPath(b.x, b.y, 7); ctx.fill(); },
  bola(b, c) { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, 7); ctx.fill(); ctx.fillStyle = c || '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, 7); ctx.fill(); },
  emoji(b, c, atk) {
    ctx.font = '22px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (c) { ctx.fillStyle = c; ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.arc(b.x, b.y, 12, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.fillText(atk.emoji || '⭐', b.x, b.y + 1);
  },
  foto(b, c, atk, img) {
    if (!img) return PROJ.bola(b, c);
    if (c) { ctx.fillStyle = c; ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    const s = 24 / Math.max(img.width, img.height);
    ctx.drawImage(img, b.x - img.width * s / 2, b.y - img.height * s / 2, img.width * s, img.height * s);
  },
};

// ---------- tipos de ataque ----------
// cada um recebe (B = batalha, S = estado do ataque, dt, A = configuração do ataque)
const TIPOS = {
  chuva: { nome: 'Chuva', desc: 'Projéteis caem do alto.', run(B, S, dt, A) {
    S.c = (S.c ?? 0) - dt; if (S.c > 0) return; S.c = 0.5 / A.dn;
    const bx = B.box; B.shot(A, { x: bx.x + 10 + Math.random() * (bx.w - 20), y: bx.y - 8, vx: 0, vy: 140 * A.sp });
  } },
  lados: { nome: 'Dos lados', desc: 'Projéteis atravessam da esquerda e da direita.', run(B, S, dt, A) {
    S.c = (S.c ?? 0) - dt; if (S.c > 0) return; S.c = 0.55 / A.dn;
    const bx = B.box, l = Math.random() < 0.5; B.shot(A, { x: l ? bx.x - 10 : bx.x + bx.w + 10, y: bx.y + 10 + Math.random() * (bx.h - 20), vx: (l ? 1 : -1) * 160 * A.sp, vy: 0 });
  } },
  paredes: { nome: 'Paredes com buraco', desc: 'Paredes atravessam a caixa. Passe pelo buraco.', run(B, S, dt, A) {
    S.c = (S.c ?? 0) - dt; if (S.c > 0) return; S.c = 1.15 / A.dn;
    const bx = B.box, l = (S.n = (S.n || 0) + 1) % 2, gap = bx.y + 28 + Math.random() * (bx.h - 56);
    for (let y = bx.y + 8; y < bx.y + bx.h; y += 17) { if (Math.abs(y - gap) < 28) continue; B.shot(A, { x: l ? bx.x - 10 : bx.x + bx.w + 10, y, vx: (l ? 1 : -1) * 140 * A.sp, vy: 0, ang: Math.PI / 2 }); }
  } },
  perseguir: { nome: 'Perseguem você', desc: 'Projéteis que seguem a sua alma.', run(B, S, dt, A) {
    S.c = (S.c ?? 0.3) - dt;
    if (S.c <= 0) { S.c = 1 / A.dn; const bx = B.box, k = Math.random() * 4 | 0; B.shot(A, { x: k === 0 ? bx.x + 8 : k === 1 ? bx.x + bx.w - 8 : bx.x + Math.random() * bx.w, y: k === 2 ? bx.y + 8 : k === 3 ? bx.y + bx.h - 8 : bx.y + Math.random() * bx.h, vx: 0, vy: 0, home: 2.4, life: 5 }); }
  } },
  anel: { nome: 'Anel que fecha', desc: 'Um anel fecha em você. Fuja pelo buraco.', run(B, S, dt, A) {
    S.c = (S.c ?? 0.2) - dt; if (S.c > 0) return; S.c = 1.6 / A.dn;
    const s = B.soul, bx = B.box, gap = Math.atan2(bx.y + bx.h / 2 - s.y, bx.x + bx.w / 2 - s.x) + (Math.random() - 0.5) * 0.8;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; if (Math.abs(((a - gap + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.45) continue;
      B.shot(A, { x: s.x + Math.cos(a) * 125, y: s.y + Math.sin(a) * 125, vx: 0, vy: 0, ang: a + Math.PI, launch: 210 * A.sp, warn: 0.7, life: 3 }); }
  } },
  canhao: { nome: 'Canhão (raio)', desc: 'Canhões miram em você e soltam um raio.', run(B, S, dt, A) {
    S.c = (S.c ?? 0.2) - dt; if (S.c > 0) return; S.c = 1.15 / A.dn;
    const s = B.soul, a = Math.random() * Math.PI * 2, x = Math.max(24, Math.min(616, s.x + Math.cos(a) * 180)), y = Math.max(30, Math.min(460, s.y + Math.sin(a) * 150));
    B.bullets.push({ kind: 'raio', A, x, y, ang: Math.atan2(s.y - y, s.x - x), vx: 0, vy: 0, warn: 0.75 / Math.sqrt(A.sp), fire: 0.35, w: 28, life: 1.5 });
  } },
  cortes: { nome: 'Cortes', desc: 'Linhas de corte com aviso antes.', run(B, S, dt, A) {
    S.c = (S.c ?? 0.2) - dt; if (S.c > 0) return; S.c = 0.75 / A.dn;
    const s = B.soul; B.bullets.push({ kind: 'corte', A, x: s.x, y: s.y, ang: [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4][Math.random() * 4 | 0], vx: 0, vy: 0, warn: 0.6 / Math.sqrt(A.sp), life: 1 });
  } },
  espiral: { nome: 'Espiral', desc: 'Projéteis saem girando do meio da caixa.', run(B, S, dt, A) {
    S.c = (S.c ?? 0) - dt; if (S.c > 0) return; S.c = 0.16 / A.dn;
    const bx = B.box; S.a = (S.a || 0) + 0.32;
    for (let k = 0; k < 2; k++) { const a = S.a + k * Math.PI; B.shot(A, { x: bx.x + bx.w / 2, y: bx.y + bx.h / 2, vx: Math.cos(a) * 100 * A.sp, vy: Math.sin(a) * 100 * A.sp }); }
  } },
  gravidade: { nome: 'Alma azul (pular)', desc: 'Sua alma fica azul e cai. Pule os obstáculos (aperte pra cima ou A).', blue: true, run(B, S, dt, A) {
    S.c = (S.c ?? 0.4) - dt; if (S.c > 0) return; S.c = 1 / A.dn;
    const bx = B.box, l = Math.random() < 0.5, low = Math.random() < 0.7;
    B.shot(A, { x: l ? bx.x - 10 : bx.x + bx.w + 10, y: low ? bx.y + bx.h - 12 : bx.y + bx.h - 70, vx: (l ? 1 : -1) * 160 * A.sp, vy: 0, ang: Math.PI / 2 });
  } },
  esmagar: { nome: 'Esmagar', desc: 'Paredes fecham dos lados, deixando uma fresta perto de você.', run(B, S, dt, A) {
    S.c = (S.c ?? 0.3) - dt; if (S.c > 0) return; S.c = 1.35 / A.dn;
    const bx = B.box, s = B.soul, gap = 46, v = (S.n = (S.n || 0) + 1) % 2;
    if (v) { const gy = Math.max(bx.y + 28, Math.min(bx.y + bx.h - 28, s.y)), h1 = gy - gap / 2 - bx.y, h2 = bx.y + bx.h - gy - gap / 2;
      B.wall(A, bx.x, bx.y, bx.w, h1); B.wall(A, bx.x, gy + gap / 2, bx.w, h2); }
    else { const gx = Math.max(bx.x + 28, Math.min(bx.x + bx.w - 28, s.x)), w1 = gx - gap / 2 - bx.x, w2 = bx.x + bx.w - gx - gap / 2;
      B.wall(A, bx.x, bx.y, w1, bx.h); B.wall(A, gx + gap / 2, bx.y, w2, bx.h); }
  } },
  quicar: { nome: 'Quicando', desc: 'Projéteis quicam nas paredes da caixa.', run(B, S, dt, A) {
    S.c = (S.c ?? 0) - dt; if (S.c > 0) return; S.c = 0.9 / A.dn;
    const bx = B.box, a = Math.random() * Math.PI * 2; B.shot(A, { x: bx.x + 14 + Math.random() * (bx.w - 28), y: bx.y + 14, vx: Math.cos(a) * 130 * A.sp, vy: Math.abs(Math.sin(a)) * 130 * A.sp + 30, bounce: 1, life: 5 });
  } },
};

// ---------- a batalha ----------
const Batalha = {
  start(def, opts = {}) {
    this.def = def; this.opts = opts;
    this.imgs = {}; this.ready = false;
    const load = (k, src) => new Promise(r => { if (!src) return r(); const i = new Image(); i.onload = () => { this.imgs[k] = i; r(); }; i.onerror = () => r(); i.src = src; });
    const jobs = [load('inimigo', def.inimigo.foto), load('inimigo2', def.fase2 && def.fase2.foto)];
    (def.ataques || []).concat((def.fase2 && def.fase2.ataques) || []).forEach((a, i) => { if (a.foto) jobs.push(load('p' + a.id, a.foto)); });
    return Promise.all(jobs).then(() => this.begin());
  },
  begin() {
    const d = this.def, J = d.jogador;
    Object.assign(this, {
      t: 0, state: 'intro', btn: 0, sel: 0, bullets: [], particles: [], typer: null, queue: [], after: null,
      hp: J.vida, maxhp: J.vida, kr: 0, ehp: d.inimigo.vida, emax: d.inimigo.vida, eatk: d.inimigo.ataque, edef: d.inimigo.defesa,
      mercy: 0, phase: 1, mercyBroken: false, turn: 0, talkN: 0, shake: 0, flash: 0, dmgPop: null, bubble: null, flip: 0,
      items: (d.itens || []).map(i => ({ ...i })), soul: { x: 320, y: 316, inv: 0, vy: 0 }, box: { ...BOX_FULL }, boxT: { ...BOX_FULL },
      ended: false, alpha: 1, soulMode: 'red', atkN: -1, won: false, result: null,
    });
    this.ready = true;
    Sfx.playMusic(d.inimigo.musica || 'boss');
    if (this.opts.soAtaque) { this.say([`* Testando: ${TIPOS[this.opts.soAtaque.tipo].nome}`], () => this.enemyTurn()); return; }
    this.say([d.inimigo.entrada || `* ${d.inimigo.nome} aparece!`], () => this.toMenu());
  },
  attacks() { return (this.phase === 2 && this.def.fase2 && this.def.fase2.ataques.length ? this.def.fase2.ataques : this.def.ataques) || []; },

  // ----- texto -----
  say(lines, then) { this.queue = lines.slice(); this.after = then; this.state = 'text'; this.next(); },
  next() {
    const l = this.queue.shift();
    if (l === undefined) { this.typer = null; const a = this.after; this.after = null; return a && a(); }
    this.typer = new Typer(l, 'narr', 540, 30);
  },
  toMenu() {
    this.state = 'menu'; this.boxT = { ...BOX_FULL }; this.soulMode = 'red';
    const fl = this.def.inimigo.flavor && this.def.inimigo.flavor.length ? this.def.inimigo.flavor : [`* ${this.def.inimigo.nome} está te encarando.`];
    this.typer = new Typer(this.mercy >= 100 && this.canSpare() ? `* ${this.def.inimigo.nome} não quer mais lutar.` : fl[Math.random() * fl.length | 0], 'narr', 540, 30);
  },
  canSpare() { return this.def.podePoupar !== false && !this.mercyBroken; },
  pressA() { return Input.isPressed('a') || !!Input.tap; },

  // ----- atualização -----
  update(dt) {
    if (!this.ready) return;
    this.t += dt;
    for (const k of ['x', 'y', 'w', 'h']) this.box[k] += (this.boxT[k] - this.box[k]) * Math.min(1, dt * 10);
    if (this.shake > 0) this.shake -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.dmgPop) this.dmgPop.t += dt;
    this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; });
    this.particles = this.particles.filter(p => p.life > 0);
    if (this.kr > 0) { this.krT = (this.krT || 0) + dt; if (this.krT > 0.4) { this.krT = 0; this.kr--; if (this.hp > 1) this.hp--; } }
    const f = this['st_' + this.state]; f && f.call(this, dt);
  },
  st_intro() {},
  st_text(dt) {
    if (!this.typer) return;
    this.typer.update(dt);
    if (this.pressA()) { if (this.typer.done) { Sfx.move(); this.next(); } else this.typer.skip(); }
    else if (Input.isPressed('b')) this.typer.skip();
  },
  st_menu(dt) {
    this.typer && this.typer.update(dt);
    if (Input.isPressed('left')) { this.btn = (this.btn + 3) % 4; Sfx.move(); }
    if (Input.isPressed('right')) { this.btn = (this.btn + 1) % 4; Sfx.move(); }
    let ch = Input.isPressed('a') ? this.btn : -1;
    if (Input.tap) BTNS.forEach((b, i) => { if (hitR(Input.tap, b.x, BTN_Y, BTN_W, BTN_H)) ch = i; });
    if (ch < 0) return;
    this.btn = ch;
    if (ch === 3 && this.mercyBroken) { Sfx.buzz(); this.typer = new Typer('* O botão POUPAR está quebrado.', 'narr', 540, 30); return; }
    Sfx.select();
    if (ch === 0) { this.state = 'bar'; this.bar = { x: 40, stop: false, t: 0 }; return; }
    this.sel = 0;
    this.listKind = ['', 'agir', 'item', 'poupar'][ch];
    if (ch === 2 && !this.items.length) { Sfx.back(); this.state = 'menu'; return; }
    this.state = 'list';
  },
  listOpts() {
    if (this.listKind === 'agir') return [{ t: 'Checar' }].concat((this.def.acoes || []).map(a => ({ t: a.nome })));
    if (this.listKind === 'item') return this.items.map(i => ({ t: i.nome }));
    return [{ t: 'Poupar', c: this.mercy >= 100 && this.canSpare() ? '#ffff40' : '#fff' }];
  },
  optRect(i) { const k = i % 6; return { x: 60 + (k % 2) * 270, y: 268 + Math.floor(k / 2) * 36, w: 260, h: 34 }; },
  st_list() {
    const o = this.listOpts(), n = o.length;
    if (Input.isPressed('b')) { Sfx.back(); this.state = 'menu'; return; }
    const s = this.sel;
    if (Input.isPressed('right') && s % 2 === 0 && s + 1 < n) this.sel++;
    if (Input.isPressed('left') && s % 2 === 1) this.sel--;
    if (Input.isPressed('down') && s + 2 < n) this.sel += 2;
    if (Input.isPressed('up') && s - 2 >= 0) this.sel -= 2;
    if (s !== this.sel) Sfx.move();
    let ch = Input.isPressed('a') ? this.sel : -1;
    if (Input.tap) {
      const pg = Math.floor(this.sel / 6) * 6;
      for (let i = pg; i < Math.min(n, pg + 6); i++) { const r = this.optRect(i); if (hitR(Input.tap, r.x, r.y, r.w, r.h)) ch = i; }
      if (n > 6 && hitR(Input.tap, 520, 366, 90, 26)) { this.sel = (pg + 6) % n; return; }
      const b = BTNS.findIndex(bb => hitR(Input.tap, bb.x, BTN_Y, BTN_W, BTN_H));
      if (b >= 0 && ch < 0) { this.state = 'menu'; return; }
    }
    if (ch < 0) return;
    Sfx.select();
    const d = this.def;
    if (this.listKind === 'agir') {
      if (ch === 0) return this.say([d.inimigo.checar || `* ${d.inimigo.nome.toUpperCase()} - ATK ${this.eatk} DEF ${this.edef}`], () => this.afterPlayer());
      const a = d.acoes[ch - 1];
      this.mercy = Math.min(100, this.mercy + (+a.misericordia || 0));
      const t = (a.texto || '* ...').split('\n').filter(Boolean);
      if (this.mercy >= 100 && this.canSpare()) t.push(`* ${d.inimigo.nome} não quer mais lutar.`);
      return this.say(t, () => this.afterPlayer());
    }
    if (this.listKind === 'item') {
      const it = this.items.splice(ch, 1)[0], before = this.hp;
      this.hp = Math.min(this.maxhp, this.hp + (+it.cura || 0)); this.kr = 0; Sfx.heal();
      return this.say([`* Você usou ${it.nome}.\n* ${this.hp >= this.maxhp ? 'Seu HP está no máximo.' : `Você recuperou ${this.hp - before} HP.`}`], () => this.afterPlayer());
    }
    if (this.mercy >= 100 && this.canSpare()) return this.win(true);
    this.say([`* Você tentou poupar ${d.inimigo.nome}...`, '* Mas ainda não deu.'], () => this.afterPlayer());
  },
  st_bar(dt) {
    const b = this.bar;
    if (b.stop) { b.t += dt; if (b.t > 0.6 && !b.done) { b.done = 1; this.damage(b.dmg); } return; }
    b.x += 560 * dt;
    if (this.pressA()) {
      b.stop = true; const dist = Math.abs(b.x - 320) / 280, mult = dist < 0.04 ? 2.2 : Math.max(0.3, 2 * (1 - dist));
      b.dmg = Math.max(1, Math.round((this.def.jogador.forca - this.edef) * mult * (0.9 + Math.random() * 0.2)));
      Sfx.slash(); this.slash = { t: 0 };
    } else if (b.x > 610) { b.stop = true; b.dmg = 0; b.done = 1; this.say(['* ERROU!'], () => this.afterPlayer()); }
  },
  damage(n) {
    this.state = 'damage'; this.dt0 = 0;
    this.ehp = Math.max(0, this.ehp - n); this.shake = 0.5; Sfx.hit(); this.dmgPop = { v: n, t: 0 };
  },
  st_damage(dt) {
    this.dt0 += dt; if (this.dt0 < 1.1) return;
    this.dmgPop = null; this.bar = null; this.slash = null;
    const F = this.def.fase2;
    if (this.ehp <= 0) {
      if (F && F.ativa && this.phase === 1 && F.modo === 'renascer') return this.phase2(true);
      return this.kill();
    }
    if (F && F.ativa && this.phase === 1 && F.modo !== 'renascer' && this.ehp <= this.emax * (F.porcentagem || 50) / 100) return this.phase2(false);
    this.afterPlayer();
  },
  phase2(refill) {
    const F = this.def.fase2;
    this.phase = 2; this.atkN = -1;
    if (refill) { this.ehp = this.emax = Math.max(1, +F.vida || this.emax); }
    if (F.ataqueExtra) this.eatk += +F.ataqueExtra;
    const lines = (F.falas || '').split('\n').filter(Boolean);
    Sfx.stopMusic(); Sfx.slam();
    this.say(lines.length ? lines : ['* ...', `* ${this.def.inimigo.nome} se levanta de novo!`], () => {
      if (F.quebrarPoupar) {
        this.mercyBroken = true; Sfx.shatter(); this.shake = 0.5;
        for (let i = 0; i < 16; i++) this.particles.push({ x: BTNS[3].x + 20 + Math.random() * 90, y: BTN_Y + 10, vx: (Math.random() - 0.5) * 200, vy: -100 - Math.random() * 150, life: 1.2, c: '#ff7f27' });
      }
      Sfx.playMusic(F.musica || this.def.inimigo.musica || 'boss');
      if (F.quebrarPoupar) this.say(['* O botão POUPAR QUEBROU.'], () => this.toMenu()); else this.toMenu();
    });
  },
  kill() {
    Sfx.dust(); this.state = 'dying'; this.dt0 = 0;
    const img = this.enemyImg(); if (!img) return;
    const r = this.enemyRect();
    for (let i = 0; i < 60; i++) this.particles.push({ x: r.x + Math.random() * r.w, y: r.y + Math.random() * r.h, vx: (Math.random() - 0.5) * 60, vy: -40 - Math.random() * 80, life: 1.5, c: '#ccc' });
  },
  st_dying(dt) { this.alpha = Math.max(0, this.alpha - dt); this.dt0 += dt; if (this.dt0 > 1.4 && !this.won) this.win(false); },
  win(spared) {
    this.won = true; Sfx.stopMusic();
    const d = this.def;
    if (spared) { Sfx.spare(); this.alpha = 0.5; }
    else Sfx.levelUp();
    const msg = (spared ? d.textoPoupar : d.textoVitoria) || (spared ? `* Você poupou ${d.inimigo.nome}.` : `* Você derrotou ${d.inimigo.nome}!`);
    this.say(msg.split('\n').filter(Boolean).concat(['* VOCÊ VENCEU!']), () => { this.state = 'end'; this.result = 'win'; Sfx.playMusic('victory'); });
  },
  afterPlayer() {
    this.turn++;
    this.enemyTurn();
  },

  // ----- turno do inimigo -----
  enemyTurn() {
    const list = this.opts.soAtaque ? [this.opts.soAtaque] : this.attacks();
    if (!list.length) return this.say(['* (Esta batalha ainda não tem ataques.)'], () => this.toMenu());
    const A0 = list[(this.atkN = (this.atkN ?? -1) + 1) % list.length];
    const A = { ...A0, sp: 0.6 + (+A0.velocidade || 3) * 0.2, dn: 0.5 + (+A0.quantidade || 3) * 0.25 };
    this.atk = A; this.S = {}; this.pt = 0; this.bullets = [];
    this.state = 'enemy';
    const bs = BOXES[A.caixa] || BOXES.m;
    this.boxT = { x: 320 - bs.w / 2, y: 236 + (160 - bs.h), w: bs.w, h: bs.h };
    this.soul.x = 320; this.soul.y = 236 + 160 - bs.h / 2; this.soul.inv = 0; this.soul.vy = 0;
    this.soulMode = TIPOS[A.tipo] && TIPOS[A.tipo].blue ? 'blue' : 'red';
    if (this.soulMode === 'blue') this.soul.y = 236 + 160 - 14;
    const falas = this.phase === 2 && this.def.fase2 && this.def.fase2.falasLuta ? this.def.fase2.falasLuta : this.def.inimigo.falas;
    const L = (falas || '').split('\n').filter(Boolean);
    this.bubble = L.length ? { t: L[this.talkN++ % L.length], life: 2.2 } : null;
  },
  shot(A, o) { this.bullets.push({ A, r: 7, life: 6, ...o }); },
  wall(A, x, y, w, h) { if (w > 2 && h > 2) this.bullets.push({ kind: 'parede', A, x: x + w / 2, y: y + h / 2, w, h, vx: 0, vy: 0, warn: 0.6, life: 1.1 }); },
  st_enemy(dt) {
    const A = this.atk, s = this.soul;
    if (this.bubble) { this.bubble.life -= dt; if (this.pt === 0 && this.bubble.life > 0.4) { if (this.pressA()) this.bubble.life = 0.4; this.moveSoul(dt); return; } }
    this.pt += dt;
    const dur = Math.max(3, +A.duracao || 7);
    if (this.pt < dur - 0.5 && TIPOS[A.tipo]) TIPOS[A.tipo].run(this, this.S, dt, A);
    this.moveSoul(dt);
    if (s.inv > 0) s.inv -= dt;
    for (const b of this.bullets) {
      b.t = (b.t || 0) + dt;
      if (b.launch && !b.go && b.t >= b.warn) { b.go = 1; b.vx = Math.cos(b.ang) * b.launch; b.vy = Math.sin(b.ang) * b.launch; }
      if (b.home && b.t < b.home) { const a = Math.atan2(s.y - b.y, s.x - b.x); b.vx += Math.cos(a) * 200 * dt; b.vy += Math.sin(a) * 200 * dt; const v = Math.hypot(b.vx, b.vy), mx = 85 * A.sp; if (v > mx) { b.vx *= mx / v; b.vy *= mx / v; } }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.bounce) { const bx = this.box; if ((b.x < bx.x + 8 && b.vx < 0) || (b.x > bx.x + bx.w - 8 && b.vx > 0)) b.vx *= -1; if ((b.y < bx.y + 8 && b.vy < 0) || (b.y > bx.y + bx.h - 8 && b.vy > 0)) b.vy *= -1; }
      if (s.inv <= 0 && this.hits(b, s)) this.hurt();
      if (b.y > 520 || b.y < -60 || b.x < -120 || b.x > 760 || b.t > b.life) b.dead = true;
    }
    this.bullets = this.bullets.filter(b => !b.dead);
    if (this.pt >= dur && this.state === 'enemy') { this.bullets = []; if (this.opts.soAtaque) return this.say(['* Fim do teste do ataque.'], () => this.enemyTurn()); this.toMenu(); }
  },
  hits(b, s) {
    if (b.warn && b.t < b.warn) return false;
    let h;
    if (b.kind === 'raio') { if (b.t > b.warn + b.fire) return false; const dx = s.x - b.x, dy = s.y - b.y, c = Math.cos(b.ang), n = Math.sin(b.ang); h = dx * c + dy * n > 10 && Math.abs(-dx * n + dy * c) < b.w / 2 + 2; }
    else if (b.kind === 'corte') { if (b.t > b.warn + 0.25) return false; h = Math.abs(-(s.x - b.x) * Math.sin(b.ang) + (s.y - b.y) * Math.cos(b.ang)) < 9; }
    else if (b.kind === 'parede') h = Math.abs(s.x - b.x) < b.w / 2 + 3 && Math.abs(s.y - b.y) < b.h / 2 + 3;
    else h = Math.hypot(b.x - s.x, b.y - s.y) < (b.r || 7) + 4;
    const cor = b.A && b.A.cor;
    if (h && cor === 'azul' && !this.moved) h = false;
    if (h && cor === 'laranja' && this.moved) h = false;
    return h;
  },
  hurt() {
    const dmg = Math.max(1, +this.eatk || 1);
    this.hp = Math.max(0, this.hp - dmg);
    if (this.def.karma) { this.kr = Math.min(this.kr + 2, Math.max(0, this.hp - 1)); this.soul.inv = 0.3; } else this.soul.inv = 0.9;
    Sfx.hurt(); this.flash = 0.12;
    if (this.hp <= 0) { this.kr = 0; this.lose(); }
  },
  lose() { this.state = 'over'; this.result = 'lose'; this.overT = 0; Sfx.stopMusic(); Sfx.breakHeart(); },
  st_over(dt) { this.overT += dt; if (this.overT > 2.5) { this.state = 'end'; this.endPieces = null; } },
  st_end() {
    const ch = Input.isPressed('a') ? 0 : Input.isPressed('b') ? 1 : -1;
    let c = ch;
    if (Input.tap) { if (hitR(Input.tap, 120, 330, 190, 56)) c = 0; if (hitR(Input.tap, 330, 330, 190, 56)) c = 1; }
    if (c === 0) { Sfx.select(); this.begin(); }
    if (c === 1) { Sfx.select(); this.exit(); }
  },
  exit() { Sfx.stopMusic(); this.ready = false; this.opts.onExit && this.opts.onExit(); },
  moveSoul(dt) {
    const s = this.soul, bx = this.box, ox = s.x, oy = s.y, mv = moveVector(), sp = 150;
    if (this.soulMode === 'blue') {
      s.x += mv.x * sp * dt; if (Input.drag.active) s.x += Input.drag.dx * 1.1;
      const floor = bx.y + bx.h - 12, on = s.y >= floor - 0.5;
      const jump = mv.y < -0.4 || Input.held.up || Input.held.a || (Input.drag.active && Input.drag.dy < -1.5);
      if (on && jump) s.vy = -285;
      if (!jump && s.vy < -90) s.vy = -90;
      s.vy += 640 * dt; s.y += s.vy * dt;
      if (s.y > floor) { s.y = floor; s.vy = 0; }
    } else {
      s.x += mv.x * sp * dt; s.y += mv.y * sp * dt;
      if (Input.drag.active) { s.x += Input.drag.dx * 1.1; s.y += Input.drag.dy * 1.1; }
    }
    s.x = Math.max(bx.x + 12, Math.min(bx.x + bx.w - 12, s.x));
    s.y = Math.max(bx.y + 11, Math.min(bx.y + bx.h - 11, s.y));
    if (s.y <= bx.y + 11 && s.vy < 0) s.vy = 0;
    this.moved = Math.hypot(s.x - ox, s.y - oy) > 0.3;
  },

  // ----- desenho -----
  enemyImg() { return (this.phase === 2 && this.imgs.inimigo2) || this.imgs.inimigo || DEFAULT_ENEMY(); },
  enemyRect() {
    const img = this.enemyImg(), maxW = 230, maxH = 180, sc = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * sc, h = img.height * sc;
    return { x: 320 - w / 2, y: 214 - h, w, h };
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (!this.ready) { text('carregando...', 320, 220, 30, '#fff', 'center'); return; }
    const d = this.def, t = this.t;
    if (this.state === 'end' || this.state === 'over') return this.drawEnd();
    // fundo
    const bg = d.fundo || '#123a1e';
    ctx.strokeStyle = this.phase === 2 ? '#5a1020' : bg; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) ctx.strokeRect(14 + i * 210, 14, 196, 200);
    // inimigo
    const img = this.enemyImg(), r = this.enemyRect();
    let x = r.x, y = r.y + Math.sin(t * 2) * 3;
    if (this.shake > 0) x += Math.sin(this.shake * 60) * 10 * this.shake;
    ctx.imageSmoothingEnabled = !d.inimigo.pixel;
    ctx.globalAlpha = this.alpha; ctx.drawImage(img, x, y, r.w, r.h); ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
    for (const p of this.particles) { ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 4, 4); }
    ctx.globalAlpha = 1;
    if (this.slash) { this.slash.t += 1 / 60; const k = Math.min(1, this.slash.t / 0.35); ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(250, r.y + 10); ctx.lineTo(250 + 140 * k, r.y + 10 + 140 * k); ctx.stroke(); }
    if (this.dmgPop) {
      const k = this.dmgPop.t, yy = r.y - 10 - Math.max(0, Math.sin(Math.min(k, 0.5) * Math.PI * 2) * 20);
      text(String(this.dmgPop.v), 320, yy, 28, '#ff3b3b', 'center', FONT_TITLE);
      ctx.fillStyle = '#404040'; ctx.fillRect(220, 220, 200, 12); ctx.fillStyle = '#3ce64b'; ctx.fillRect(220, 220, 200 * this.ehp / this.emax, 12);
    }
    if (this.bubble && this.bubble.life > 0 && this.state === 'enemy') {
      const bw = 200, bx = Math.min(r.x + r.w + 12, 636 - bw), by = r.y + 6, L = wrapText(this.bubble.t, bw - 20, 24), bh = 14 + L.length * 24;
      ctx.fillStyle = '#fff'; ctx.fillRect(bx, by, bw, bh); ctx.beginPath(); ctx.moveTo(bx, by + 14); ctx.lineTo(bx - 12, by + 22); ctx.lineTo(bx, by + 28); ctx.fill();
      L.forEach((l, i) => text(l, bx + 10, by + 7 + i * 24, 24, '#000'));
    }
    // caixa
    const b = this.box;
    frameBox(b.x, b.y, b.w, b.h, 5);
    ctx.save(); ctx.beginPath(); ctx.rect(b.x + 5, b.y + 5, b.w - 10, b.h - 10); ctx.clip();
    this.drawBox();
    ctx.restore();
    if (this.state === 'enemy') for (const bl of this.bullets) if (bl.kind === 'raio') this.drawRaio(bl);
    // status
    const J = d.jogador;
    text(J.nome || 'HUMANO', 32, 394, 30);
    text('HP', 220, 394, 24);
    const w = Math.min(200, this.maxhp * 2);
    ctx.fillStyle = '#c00000'; ctx.fillRect(256, 398, w, 20);
    ctx.fillStyle = '#ffff00'; ctx.fillRect(256, 398, w * Math.max(0, this.hp) / this.maxhp, 20);
    if (this.kr > 0) { ctx.fillStyle = '#ff2aff'; ctx.fillRect(256 + w * Math.max(0, this.hp - this.kr) / this.maxhp, 398, w * this.kr / this.maxhp, 20); }
    text(`${Math.max(0, this.hp)} / ${this.maxhp}${this.kr > 0 ? '  KR' : ''}`, 266 + w, 394, 30, this.kr > 0 ? '#ff2aff' : '#fff');
    // botões
    BTNS.forEach((bt, i) => {
      if (i === 3 && this.mercyBroken) {
        ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.strokeRect(bt.x + 2, BTN_Y + 2, BTN_W - 4, BTN_H - 4); ctx.setLineDash([]);
        text(bt.label, bt.x + 70, BTN_Y + 7, 32, '#4a4a4a', 'center');
        ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bt.x + 30, BTN_Y + 2); ctx.lineTo(bt.x + 52, BTN_Y + 20); ctx.lineTo(bt.x + 44, BTN_Y + 30); ctx.lineTo(bt.x + 70, BTN_Y + 44); ctx.moveTo(bt.x + 52, BTN_Y + 20); ctx.lineTo(bt.x + 110, BTN_Y + 18); ctx.stroke();
        return;
      }
      const on = i === this.btn && ['menu', 'list'].includes(this.state), c = on ? '#ffff40' : '#ff7f27';
      ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.strokeRect(bt.x + 2, BTN_Y + 2, BTN_W - 4, BTN_H - 4);
      if (on) drawSoul(bt.x + 18, BTN_Y + 23, '#ff2020');
      text(bt.label, bt.x + 76, BTN_Y + 7, 32, c, 'center');
    });
    if (this.flash > 0) { ctx.fillStyle = 'rgba(255,0,0,0.12)'; ctx.fillRect(0, 0, W, H); }
    if (this.opts.soAtaque) text('TESTE DE ATAQUE — toque em SAIR em cima', 320, 2, 20, '#ffe680', 'center');
  },
  drawBox() {
    const st = this.state, b = this.box;
    if ((st === 'text' || st === 'menu') && this.typer) this.typer.draw(56, 268, '#fff', 32);
    if (st === 'list') {
      const o = this.listOpts(), pg = Math.floor(this.sel / 6) * 6;
      for (let i = pg; i < Math.min(o.length, pg + 6); i++) { const r = this.optRect(i); if (i === this.sel) drawSoul(r.x - 14, r.y + 17, '#ff2020'); text('* ' + o[i].t, r.x, r.y, 30, o[i].c || '#fff'); }
      if (o.length > 6) text('mais ▶', 520, 366, 24, '#aaa');
    }
    if ((st === 'bar' || st === 'damage') && this.bar) {
      ctx.strokeStyle = '#3ce64b'; ctx.lineWidth = 2;
      for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.ellipse(320, 320, 280 * i / 4, 60 * i / 4, 0, 0, 7); ctx.stroke(); }
      ctx.fillStyle = 'rgba(60,230,75,0.6)'; ctx.beginPath(); ctx.ellipse(320, 320, 30, 18, 0, 0, 7); ctx.fill();
      ctx.fillStyle = this.bar.stop && Math.floor(this.bar.t * 12) % 2 ? '#000' : '#fff'; ctx.fillRect(this.bar.x - 4, 258, 8, 124);
    }
    if (st === 'enemy') {
      for (const bl of this.bullets) this.drawBullet(bl);
      const s = this.soul;
      if (s.inv <= 0 || Math.floor(s.inv * 12) % 2) drawSoul(s.x, s.y, this.soulMode === 'blue' ? '#2a7aff' : '#ff2020');
    }
  },
  drawBullet(b) {
    const A = b.A || {}, col = COLORS[A.cor];
    if (b.kind === 'raio') return;
    if (b.kind === 'corte') {
      const on = b.t >= b.warn, c = Math.cos(b.ang), s = Math.sin(b.ang);
      ctx.strokeStyle = on ? (col || '#ff1a2a') : `rgba(255,60,60,${0.35 + Math.sin(this.t * 40) * 0.2})`;
      ctx.lineWidth = on ? 12 * Math.max(0, 1 - (b.t - b.warn) / 0.3) + 2 : 2;
      ctx.beginPath(); ctx.moveTo(b.x - c * 400, b.y - s * 400); ctx.lineTo(b.x + c * 400, b.y + s * 400); ctx.stroke();
      return;
    }
    if (b.kind === 'parede') {
      const x = b.x - b.w / 2, y = b.y - b.h / 2;
      if (b.t < b.warn) { ctx.strokeStyle = `rgba(255,80,80,${0.4 + Math.sin(this.t * 30) * 0.3})`; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, b.w - 4, b.h - 4); return; }
      ctx.fillStyle = col || '#fff'; ctx.fillRect(x, y, b.w, b.h); ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < Math.max(b.w, b.h); i += 10) b.w > b.h ? ctx.fillRect(x + i, y, 3, b.h) : ctx.fillRect(x, y + i, b.w, 3);
      return;
    }
    if (b.launch && !b.go) { ctx.strokeStyle = 'rgba(255,60,90,0.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(b.ang) * 120, b.y + Math.sin(b.ang) * 120); ctx.stroke(); }
    (PROJ[A.projetil] || PROJ.bola)(b, col, A, this.imgs['p' + A.id]);
  },
  drawRaio(b) {
    const A = b.A, col = COLORS[A.cor], t = b.t || 0, firing = t >= b.warn, end = b.warn + b.fire;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang);
    if (firing && t < end + 0.3) {
      const f = t > end ? Math.max(0, 1 - (t - end) / 0.3) : 1, w = b.w * f;
      ctx.fillStyle = col || '#fff'; ctx.fillRect(14, -w / 2, 1000, w);
      ctx.fillStyle = 'rgba(160,240,255,0.5)'; ctx.fillRect(10, -w / 2 - 4, 1000, 4); ctx.fillRect(10, w / 2, 1000, 4);
    } else if (!firing) { ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(t * 40) * 0.1})`; ctx.fillRect(14, -1, 1000, 2); }
    ctx.restore();
    // a "cabeça" do canhão é o projétil escolhido, bem grande
    ctx.save(); ctx.translate(b.x, b.y); ctx.scale(2, 2);
    (PROJ[A.projetil] || PROJ.bola)({ x: 0, y: 0, t, ang: b.ang, vx: Math.cos(b.ang), vy: Math.sin(b.ang) }, col, A, this.imgs['p' + A.id]);
    ctx.restore();
  },
  drawEnd() {
    const win = this.result === 'win';
    if (this.state === 'over') {
      const k = this.overT;
      if (k < 0.7) drawSoul(320, 240, '#ff2020'); else { for (let i = 0; i < 6; i++) { ctx.fillStyle = '#ff2b2b'; ctx.fillRect(320 + Math.cos(i) * (k - 0.7) * 120, 240 + Math.sin(i * 1.7) * (k - 0.7) * 80 + (k - 0.7) ** 2 * 120, 6, 6); } }
      return;
    }
    text(win ? 'VOCÊ VENCEU!' : 'FIM DE JOGO', 320, 100, 40, win ? '#ffe680' : '#fff', 'center', FONT_TITLE);
    if (!win) text('Fique DETERMINADO...', 320, 190, 32, '#ccc', 'center');
    else text(this.def.inimigo.nome, 320, 190, 32, '#ccc', 'center');
    for (const [i, l] of [[0, 'DE NOVO'], [1, 'SAIR']]) {
      const x = i ? 330 : 120;
      ctx.strokeStyle = '#ff7f27'; ctx.lineWidth = 4; ctx.strokeRect(x, 330, 190, 56);
      text(l, x + 95, 342, 32, '#ff7f27', 'center');
    }
  },
};

// Inimigo padrão (quando a batalha ainda não tem foto): uma bolinha brava
let _defEnemy = null;
function DEFAULT_ENEMY() {
  if (_defEnemy) return _defEnemy;
  const c = document.createElement('canvas'); c.width = 48; c.height = 48;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.beginPath(); g.arc(24, 28, 19, 0, 7); g.fill();
  g.fillStyle = '#b07aff'; g.beginPath(); g.arc(24, 28, 17, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.fillRect(14, 22, 7, 7); g.fillRect(28, 22, 7, 7);
  g.fillStyle = '#000'; g.fillRect(17, 24, 3, 4); g.fillRect(29, 24, 3, 4); g.fillRect(13, 19, 9, 2); g.fillRect(27, 19, 9, 2);
  g.fillRect(19, 36, 11, 2);
  _defEnemy = c; return c;
}
