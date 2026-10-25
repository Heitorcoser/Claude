// CAPÍTULO 2 — FASE 3: O ALTAR DAS ALMAS
// O jogador encontra o Encapuzado e a Carmim com seis almas presas. Sem medo da sombra,
// ele escuta o plano inteiro. Quando aparece, o demônio o puxa pra batalha e o
// derruba com um golpe só. A tela de determinação é a alma do Instrutor falando.
// Na segunda vez, o jogador QUEBRA o ataque, os olhos ficam vermelhos, e começa a
// batalha final: Carmim e Encapuzado contra o jogador, os amigos, os dragões e o Instrutor.
'use strict';

ENEMIES.c2final = {
  name: 'Encapuzado', spr: 'c2duo', scale: 5, hp: 420, atk: 4, def: 3, xp: 1000, gold: 0, voice: 'posh',
  boss: true, cls: 'c2final', music: 'final2', bubbleW: 210, turnLen: 7,
  intro: '* A Carmim e o Encapuzado.\n* A luta do bem contra o mal.',
  check: '* ENCAPUZADO - ATK ? DEF 3\n* Protege a Carmim com tudo o que tem.\n* Derrube ele primeiro.',
  acts: {
    'Chamar pela Carmim': { text: ['* Você chama pelo nome dela.', '* Por um segundo, os olhos dela piscam castanhos.', '* ...Depois voltam a ficar vermelhos.'], mercy: 0 },
    'Falar do Carmino': { text: ['* Você conta que o irmão dela está com você. Aqui dentro.', '* A Carmim treme inteira.', '* O ATAQUE dela caiu!'], mercy: 0, atkDown: 1 },
    'Encarar a sombra': { text: ['* Você olha o demônio nos olhos.', '* Ele recua. A DEFESA dele caiu!'], mercy: 0, defDown: 1 },
  },
  flavor: ['* O altar treme.', '* As seis almas presas brilham nos potes.', '* Kai e Luna estão do seu lado.', '* Você sente o Carmino aqui dentro.', '* Seus olhos ardem, vermelhos.'],
  talk: [],
  defeatText: [],
  patterns: ['dSlashCircle', 'dKnifeRing', 'dGravity', 'dBoxRun', 'dSpinBones', 'dCrossDash'],
};
const F2_TALK = {
  1: [['S', 'Eu não vou deixar você chegar perto dela.'], ['5', 'Hehe. Vai, mostra.'], ['S', 'Desvia. Ou não.'], ['5', 'Que olhos bonitos você tem agora.'], ['S', 'Por que você não desiste?!']],
  2: [['5', 'VOCÊ MACHUCOU ELE.'], ['5', 'Sua alma vai ser a SÉTIMA.'], ['5', 'Meu irmão era fraco. Igual você.'], ['5', 'POR QUE VOCÊ NÃO CAI?!'], ['5', 'Eu... eu...']],
};

// Ataques de cada parte. Parte 1: os dois juntos. Parte 2: a Carmim sozinha.
const F2_ATK = {
  1: ['dSlashCircle', 'dKnifeRing', 'dGravity', 'dBoxRun', 'dSpinBones', 'dCrossDash'],
  '1f': ['dCrossDash', 'dGravity', 'dSpinBones', 'dKnifeRing', 'dSlashCircle', 'dBoxRun'],
  2: ['cDash', 'cKnifeWalls', 'cMirror', 'cHands', 'cSpiral', 'cClones', 'cVortex'],
  '2f': ['cHands', 'cClones', 'cVortex', 'cDash', 'cSpiral', 'cMirror', 'cKnifeWalls'],
};

class FinalBattle extends Battle {
  constructor(key, opts) {
    super(key, { ...opts, party: ['kai', 'luna'] });
    boss9Sprites();
    this.stage = 1; this.soulCd = 1; this.broke = false; this.redFlash = 0; this.shakeT = 0;
    this.phase = 3; this.flip = false; this.soulMode = 'red'; this.kr = 0; this.krT = 0;
    this.dodges = 2; this.dodgeT = 0; this.atkN = 0; this.finalUsed = false;
    this.diffMul *= 1.1;
    if (opts.oneShot) Sfx.playMusic('carmim');
    if (opts.rematch) this.broke = true;
  }

  st_start(dt) {
    this.introT += dt;
    if (this.introT < 0.4 || this.started) return;
    this.started = true;
    if (this.opts.oneShot) return this.say(['* A SOMBRA te puxou pra dentro da batalha!', { t: '* Sua alma é MINHA.' }], () => this.doom());
    if (this.opts.awaken) return this.say(['* Você abre os olhos.', '* A sombra ataca de novo. O mesmo golpe.'], () => this.doom());
    this.say(['* A Carmim e o Encapuzado.', '* Contra você, Kai, Luna, os dragões... e o Instrutor.'], () => this.toMenu());
  }
  doom() { this.startEnemyTurn('f2Doom'); this.bubble = { t: this.opts.oneShot ? 'Adeus.' : 'De novo?', life: 1.2 }; }

  toMenu() {
    this.flip = false; this.soulMode = 'red'; this.gdir = 'down'; this.pull = 0;
    super.toMenu();
  }

  afterPlayer() {
    if (this.soulCd > 0) this.soulCd--;
    const fr = this.e.hpNow / this.e.hp;
    if (this.stage === 1 && fr < 0.4 && !this.finalUsed) {
      this.finalUsed = true; this.dodges = 1; Sfx.slam();
      this.turn++;
      return this.say(['* O olho do Encapuzado brilha AZUL e AMARELO.', { who: 'stranger', t: '* Pela Carmim... ATAQUE FINAL.' }], () => this.startEnemyTurn('dDuoFinal'));
    }
    if (this.stage === 2 && fr < 0.35 && !this.finalUsed) {
      this.finalUsed = true; Sfx.slam();
      this.turn++;
      return this.say([{ who: 'carmim', t: '* CHEGA. CHEGA. CHEGA!' }, '* A sombra dela cobre o altar inteiro.', '* ATAQUE FINAL.'], () => this.startEnemyTurn('cFinal'));
    }
    Battle.prototype.afterPlayer.call(this);
  }

  startEnemyTurn(p) {
    if (p !== 'f2Doom' && p !== 'dDuoFinal' && p !== 'cFinal') {
      const lowHp = this.e.hpNow < this.e.hp * 0.4;
      const list = F2_ATK[this.stage + (lowHp ? 'f' : '')];
      p = list[this.atkN++ % list.length];
    }
    super.startEnemyTurn(p);
    this.gdir = 'down'; this.pull = 0; this.soul.vg = 0;
    const P = PATTERNS[p];
    this.turnLen = P.len || 7.5;
    if (p === 'f2Doom') this.turnLen = 5;
    this.soulMode = P.blue ? 'blue' : 'red';
    this.soul.vy = 0;
    if (P.blue) this.soul.y = 316 + 80 - 12;
    if (p === 'f2Doom') return;
    const L = F2_TALK[this.stage], q = L[(this.talkN = (this.talkN ?? -1) + 1) % L.length];
    this.bubble = (p === 'dDuoFinal' || p === 'cFinal') ? null : { t: q[1], life: 2.2 };
  }
  // alma azul com gravidade para QUALQUER lado (o ataque escolhe) + puxão pro centro
  moveSoul(dt) {
    const s = this.soul, bx = this.box, ox = s.x, oy = s.y;
    if (this.soulMode !== 'blue') Battle.prototype.moveSoul.call(this, dt);
    else {
      const g = this.gdir || 'down', vert = g === 'down' || g === 'up', sign = g === 'down' || g === 'right' ? 1 : -1;
      const mv = moveVector(), sp = this.soulSpeed || 150, d = Input.drag;
      if (vert) { s.x += mv.x * sp * dt; if (d.active) s.x += d.dx * 1.1; } else { s.y += mv.y * sp * dt; if (d.active) s.y += d.dy * 1.1; }
      const lo = vert ? bx.y + 12 : bx.x + 13, hi = vert ? bx.y + bx.h - 12 : bx.x + bx.w - 13, floor = sign > 0 ? hi : lo;
      let q = vert ? s.y : s.x;
      const away = vert ? -sign * mv.y : -sign * mv.x, dragAway = d.active && (vert ? -sign * d.dy : -sign * d.dx) > 1.5;
      const jump = away > 0.4 || Input.held.a || dragAway;
      s.vg = s.vg || 0;
      if (Math.abs(q - floor) < 0.5 && jump) s.vg = -285;
      if (!jump && s.vg < -90) s.vg = -90;
      s.vg += 640 * dt;
      q += sign * s.vg * dt;
      if (q > hi) { q = hi; s.vg = sign > 0 ? 0 : Math.max(0, s.vg); }
      if (q < lo) { q = lo; s.vg = sign < 0 ? 0 : Math.max(0, s.vg); }
      if (vert) s.y = q; else s.x = q;
    }
    if (this.pull) {
      const cx = bx.x + bx.w / 2, cy = bx.y + bx.h / 2, dd = Math.hypot(cx - s.x, cy - s.y);
      if (dd > 2) { s.x += (cx - s.x) / dd * this.pull * dt; s.y += (cy - s.y) / dd * this.pull * dt; }
    }
    s.x = Math.max(bx.x + 13, Math.min(bx.x + bx.w - 13, s.x));
    s.y = Math.max(bx.y + 12, Math.min(bx.y + bx.h - 12, s.y));
    this.soulMoved = Math.hypot(s.x - ox, s.y - oy) > 0.3;
  }

  // o Encapuzado desvia dos primeiros golpes
  dealDamage(dmg, then, quiet) {
    if (!quiet && this.stage === 1 && this.dodges > 0) {
      this.dodges--;
      this.state = 'damage'; this.dodgeT = 0.6; Sfx.whoosh();
      this.dmgPop = { v: 'MISS', t: 0 }; this.afterDamage = then; this.damageT = 0;
      return;
    }
    super.dealDamage(dmg, then, quiet);
  }

  // ----- ação nova: a alma do Instrutor -----
  actList() {
    const l = super.actList();
    l.push({ name: 'Alma: Carmino', kind: 'alma', disabled: this.soulCd > 0 });
    return l;
  }
  listInput(n, cols) {
    const i = super.listInput(n, cols);
    if (this.state === 'actMenu' && i >= 0) {
      const a = this.actList()[i];
      if (a && a.kind === 'alma') {
        if (a.disabled) { Sfx.back(); return -1; }
        Sfx.magic(); this.soulCd = 4; this.soulFx = { t: 0 }; this.kr = 0;
        const before = G.hp; G.hp = Math.min(G.maxhp, G.hp + Math.round(G.maxhp * 0.3));
        this.say([{ who: 'alma', t: '* Eu tô aqui. Sempre estive.' }, `* A alma do Carmino brilha! Você recuperou ${G.hp - before} HP e o KARMA sumiu.`, '* Uma luz azul acerta em cheio!'],
          () => this.dealDamage(20 + G.lv * 2, () => { this.soulFx = null; this.afterPlayer(); }, true));
        return -1;
      }
    }
    return i;
  }

  st_mercyMenu() {
    const i = this.listInput(1, 1);
    if (i < 0) return;
    Sfx.select();
    this.say(this.stage === 1 ? ['* Você estende a mão pro Encapuzado.', '* Ele olha pra Carmim... e balança a cabeça.'] : ['* Você tenta poupar a Carmim.', '* Lá no fundo, uma menininha quer aceitar.', '* Mas o DEMÔNIO não deixa.'], () => this.afterPlayer());
  }

  // ----- dano no jogador: golpe + KARMA (o HP continua caindo depois) -----
  hurt(dmg, who) {
    if (this.ended || this.breaking) return;
    if (this.opts.oneShot) {
      G.hp = 0; Sfx.hurt(); this.hurtFlash = 0.3;
      return this.end('dead');
    }
    if (!this.broke) return this.breakAttack();
    const d = this.stage === 1 ? 3 : 4 + (this.finalUsed ? 1 : 0);
    G.hp = Math.max(0, G.hp - d);
    this.kr = Math.min(this.kr + 2, 40, Math.max(0, G.hp - 1));
    if (who) who.inv = 0.6; else this.soul.inv = 0.35;
    Sfx.hurt(); this.hurtFlash = 0.12;
    if (G.hp <= 0) { this.kr = 0; this.end('dead'); }
  }
  breakAttack() {
    this.broke = true; this.breaking = true;
    this.bullets = [];
    Sfx.shatter(); this.shakeT = 0.8; this.redFlash = 1;
    for (let i = 0; i < 40; i++) this.particles.push({ x: this.soul.x, y: this.soul.y, vx: (Math.random() - 0.5) * 400, vy: -Math.random() * 300, life: 1.4, c: '#ff3b3b' });
    this.boxTarget = { ...BOX_FULL };
    this.say([
      '* CRACK!',
      '* ...O golpe dela QUEBROU no seu peito.',
      { who: 'sombra', t: '* ...O QUÊ?!' },
      '* Seus olhos ficam VERMELHOS de tanto poder.',
      '* A força dos seus amigos. A força do Carmino. Tudo junto.',
      '3: AGORA SIM! BORA!',
      '4: A gente tá com você!',
      '* (Cuidado: cada golpe deles deixa KARMA. O HP continua caindo depois.)',
    ], () => {
      this.breaking = false;
      G.flags.redEyes = true;
      Sfx.playMusic('final2');
      this.toMenu();
    });
  }

  // ----- o Encapuzado cai primeiro; depois é só a Carmim -----
  doKill() {
    if (this.stage === 1) {
      this.state = 'text';
      Sfx.dust(); this.kr = 0;
      return this.say([
        '* O Encapuzado cai de joelhos.',
        { who: 'stranger', t: '* Carmim... desculpa... eu tentei...' },
        { who: 'carmim', t: '* NÃO!' },
        '* A Carmim grita. A sombra dela cresce até o teto.',
        '* Ela vem com TUDO.',
      ], () => {
        this.stage = 2; this.talkN = -1; this.atkN = 0; this.finalUsed = false;
        this.diffMul *= 1.15;
        Object.assign(this.e, { name: 'Carmim', spr: 'carmimDemon', scale: 6, hp: 520, hpNow: 520, atkNow: 6, def: 3,
          check: '* CARMIM - ATK ? DEF 3\n* Possuída por um demônio.\n* Lá no fundo, ainda é uma criança perdida.' });
        this.toMenu();
      });
    }
    return super.doKill();
  }
  st_dying(dt) {
    this.dyingT += dt;
    if (this.dyingT < 1.3 || this.dyingDone) return;
    this.dyingDone = true;
    G.kills++;
    const up = addXp(this.e.xp);
    this.say(['* A sombra solta um grito horrível... e se desfaz.', `* VOCÊ VENCEU!\n* Você ganhou ${this.e.xp} EXP.`].concat(up ? ['* Seu LV aumentou.'] : []), () => this.end('killed'));
  }

  update(dt) {
    super.update(dt);
    if (this.shakeT > 0) this.shakeT -= dt;
    if (this.redFlash > 0) this.redFlash -= dt * 0.7;
    if (this.dodgeT > 0) { this.dodgeT -= dt; this.e.offX = -Math.sin((1 - this.dodgeT / 0.6) * Math.PI) * 120; } else this.e.offX = 0;
    if (this.kr > 0 && this.state !== 'over') {
      this.krT += dt;
      if (this.krT > 0.4) { this.krT = 0; this.kr--; if (G.hp > 1) G.hp--; }
    }
    if (this.state === 'enemyTurn') for (const b of this.bullets) {
      if (b.kind === 'blaster' && !b.fired && b.t >= b.warn) { b.fired = true; Sfx.blasterFire(); this.shakeT = 0.12; }
      if (b.spd && !b.go && b.t >= b.warn) { b.go = 1; b.vx = Math.cos(b.ang) * b.spd; b.vy = Math.sin(b.ang) * b.spd; Sfx.cut(); }
      if ((b.kind === 'cDash' || b.kind === 'cHand' || b.kind === 'cSafe') && !b.snd && b.t >= b.warn) { b.snd = 1; Sfx.slash(); if (b.kind !== 'cDash') { Sfx.slam(); this.shakeT = 0.15; } }
    }
  }

  drawBg() {
    const t = this.t, g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, this.stage === 2 ? '#2a0410' : '#0a0618'); g.addColorStop(1, this.stage === 2 ? '#5a0a1a' : '#1a0a2a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      const a = t * 0.6 + i * Math.PI / 3, x = 320 + Math.cos(a) * 270, y = 120 + Math.sin(a) * 40;
      ctx.fillStyle = ['#ff3b3b', '#ff9a3a', '#ffe680', '#7aff9a', '#5ac8ff', '#c87aff'][i];
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
  }

  draw() {
    ctx.save();
    if (this.shakeT > 0) ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
    if (this.flip) { ctx.translate(W, H); ctx.rotate(Math.PI); }
    super.draw();
    const t = this.t;
    if (!this.opts.oneShot) {
      ctx.globalAlpha = 0.55 + Math.sin(t * 2) * 0.15 + (this.soulFx ? 0.3 : 0);
      ctx.fillStyle = 'rgba(150,240,255,0.25)'; ctx.beginPath(); ctx.arc(320, 26, 30, 0, Math.PI * 2); ctx.fill();
      drawSpr(SPR.instrSoul, 302, 4 + Math.sin(t * 1.5) * 3, 2);
      ctx.globalAlpha = 1;
      if (this.soulFx) { this.soulFx.t += 1 / 60; const k = Math.min(1, this.soulFx.t / 0.6); ctx.strokeStyle = '#9fe4ff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(320, 44); ctx.lineTo(320, 44 + 60 * k); ctx.stroke(); }
      drawSpr(SPR.dragon[A1.dragonOf('kai')].left[Math.floor(t * 3) % 2], 470, 176, 2);
      drawSpr(SPR.dragon[A1.dragonOf('luna')].left[Math.floor(t * 3 + 1) % 2], 546, 168, 2);
    }
    if (this.state === 'enemyTurn') {
      for (const b of this.bullets) if (b.kind === 'blaster') drawBlaster(b);
      const s = this.soul;
      if (this.soulMode === 'blue' && (s.inv <= 0 || Math.floor(s.inv * 12) % 2)) drawSpr(BOSS9_SPR.soulBlue, s.x - 8, s.y - 7, 1);
      if (G.flags.redEyes && !this.opts.oneShot) { ctx.strokeStyle = `rgba(255,40,60,${0.4 + Math.sin(t * 10) * 0.2})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 14, 0, Math.PI * 2); ctx.stroke(); }
    }
    if (this.e.alpha > 0.1) {
      const img = SPR[this.e.spr], sc = this.e.scale, ex = 320 - img.width * sc / 2 + (this.e.offX || 0), ey = this.enemyY();
      const cx = this.stage === 1 ? ex + (SPR.encapuzado.width + 4) * sc : ex, cy = this.stage === 1 ? ey + (img.height - SPR.carmimDemon.height) * sc : ey;
      ctx.fillStyle = `rgba(255,20,40,${0.7 + Math.sin(t * 8) * 0.3})`;
      ctx.fillRect(cx + 5 * sc, cy + 6 * sc, sc, sc); ctx.fillRect(cx + 8 * sc, cy + 6 * sc, sc, sc);
    }
    ctx.restore();
    if (this.redFlash > 0) { ctx.fillStyle = `rgba(255,0,30,${Math.min(0.6, this.redFlash)})`; ctx.fillRect(0, 0, W, H); }
  }
  // KARMA ao lado do HP
  drawStats() {
    super.drawStats();
    if (this.kr > 0) { const w = G.maxhp * 2.4; text('KR', Math.min(606, 300 + w + 110), 394, 26, '#ff5ac8'); ctx.fillStyle = '#ff5ac8'; ctx.fillRect(286 + w * Math.max(0, G.hp - this.kr) / G.maxhp, 398, w * this.kr / G.maxhp, 20); }
  }
}
BATTLE_CLASSES.c2final = FinalBattle;

// ---------- ataques da batalha final ----------
// Parte 1: o Encapuzado (canhões e ossos) e a Carmim (cortes e facas) atacam JUNTOS.
// Parte 2: a Carmim possuída, sozinha: investidas, mãos de sombra, espirais, cópias da sua alma.
const bf = B => B.boxTarget;
const BOX0 = { x: 320 - 105, y: 236, w: 210, h: 160 };
const segDist = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy || 1, k = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l));
  return Math.hypot(px - (x1 + dx * k), py - (y1 + dy * k));
};
const lineHit = w => function (b, q) { return b.t >= b.warn && b.t < b.warn + (b.act || 0.3) && Math.abs(-(q.x - b.x) * Math.sin(b.ang) + (q.y - b.y) * Math.cos(b.ang)) < w; };
// corte da Carmim: linha inteira atravessando a caixa
function cSlash(B, x, y, ang, warn = 0.5, w = 9, color) {
  B.bullets.push({ kind: 'redSlash', x, y, ang, vx: 0, vy: 0, warn, act: 0.3, life: warn + 0.35, color, hitFn: lineHit(w) });
}
// faca: aparece, mira e voa reto depois do aviso
function cKnife(B, x, y, ang, spd = 300, warn = 0.55) {
  B.bullets.push({ kind: 'knife', x, y, vx: 0, vy: 0, ang, spd, warn, r: 6, life: warn + 2.4 });
}
// investida: a Carmim atravessa a caixa em linha reta
function cDash(B, x1, y1, x2, y2, warn = 0.5) {
  B.bullets.push({ kind: 'cDash', x: x1, y: y1, x2, y2, vx: 0, vy: 0, warn, life: warn + 0.5,
    hitFn(b, q) { return b.t >= b.warn && b.t < b.warn + 0.25 && segDist(q.x, q.y, b.x, b.y, b.x2, b.y2) < 12; } });
}
const orb = (B, x, y, a, v, r = 5) => B.bullets.push({ kind: 'cOrb', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r, life: 5 });
// parede que esmaga (mão de sombra / espinhos na parede)
function cWall(B, x, y, w, h, warn, act, kind = 'cHand') { B.bullets.push({ kind, x, y, w, h, vx: 0, vy: 0, warn, life: warn + act }); }
const C2_COL = { blue: '#3ab8ff', orange: '#ff9a1a' };

const D_ATK = {
  // Carmim corta em CÍRCULO em volta do meio da caixa; o Encapuzado manda canhões de cima
  dSlashCircle: {
    len: 8,
    update(B, dt) {
      const S = B.pState, bx = bf(B), cx = bx.x + bx.w / 2, cy = bx.y + bx.h / 2;
      S.s = (S.s ?? 0.3) - dt;
      if (S.s <= 0) { S.s = 0.42; S.a = (S.a || 0) + Math.PI / 7; cSlash(B, cx, cy, S.a, 0.5); }
      S.b = (S.b ?? 1.2) - dt;
      if (S.b <= 0) { S.b = 1.6; m9Blaster(B, B.soul.x, 150, Math.PI / 2, { warn: 0.75, w: 30 }); }
    },
  },
  // anel de facas fechando em você (com UM buraco) + ossos rasteiros
  dKnifeRing: {
    len: 8,
    update(B, dt) {
      const S = B.pState, bx = bf(B), s = B.soul;
      S.r = (S.r ?? 0.2) - dt;
      if (S.r <= 0) {
        S.r = 1.35; const gap = Math.random() * Math.PI * 2;
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; if (Math.abs(((a - gap + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.45) continue; cKnife(B, s.x + Math.cos(a) * 125, s.y + Math.sin(a) * 125, a + Math.PI, 230, 0.7); }
      }
      S.o = (S.o ?? 0.5) - dt;
      if (S.o <= 0) { S.o = 0.75; const l = Math.random() < 0.5; m9Bone(B, l ? bx.x - 10 : bx.x + bx.w + 10, bx.y + bx.h - 14, 28, l ? 190 : -190); }
    },
  },
  // gravidade que muda de lado (alma azul) + espinhos na parede onde você cai + facas
  dGravity: {
    len: 9, blue: true,
    update(B, dt) {
      const S = B.pState, bx = bf(B);
      S.g = (S.g ?? 0.6) - dt;
      if (S.g <= 0) {
        S.g = 1.9;
        const dirs = ['down', 'left', 'up', 'right'].filter(d => d !== B.gdir);
        B.gdir = dirs[(Math.random() * dirs.length) | 0]; B.soul.vg = 700; Sfx.slam(); B.shakeT = 0.2;
        const g = B.gdir, T = 18;
        if (g === 'down') cWall(B, bx.x + bx.w / 2, bx.y + bx.h - T / 2, bx.w, T, 0.75, 0.6, 'cSpikes');
        if (g === 'up') cWall(B, bx.x + bx.w / 2, bx.y + T / 2, bx.w, T, 0.75, 0.6, 'cSpikes');
        if (g === 'left') cWall(B, bx.x + T / 2, bx.y + bx.h / 2, T, bx.h, 0.75, 0.6, 'cSpikes');
        if (g === 'right') cWall(B, bx.x + bx.w - T / 2, bx.y + bx.h / 2, T, bx.h, 0.75, 0.6, 'cSpikes');
      }
      S.k = (S.k ?? 1) - dt;
      if (S.k <= 0) { S.k = 0.85; const a = Math.random() * Math.PI * 2, s = B.soul; cKnife(B, s.x + Math.cos(a) * 140, s.y + Math.sin(a) * 110, Math.atan2(-Math.sin(a), -Math.cos(a)), 280, 0.55); }
    },
  },
  // a caixa CORRE pela tela; canhões em linhas fixas e a Carmim atravessando
  dBoxRun: {
    len: 9,
    update(B, dt) {
      const S = B.pState, t = B.pt;
      B.boxTarget = { x: 320 - 75 + Math.sin(t * 1.3) * 140, y: 250 + Math.sin(t * 2.1) * 20, w: 150, h: 120 };
      S.b = (S.b ?? 0.6) - dt;
      if (S.b <= 0) { S.b = 0.8; const v = (S.n = (S.n || 0) + 1) % 2; if (v) m9Blaster(B, 40 + Math.random() * 560, 140, Math.PI / 2, { warn: 0.7, w: 26 }); else m9Blaster(B, 30, 250 + Math.random() * 130, 0, { warn: 0.7, w: 24 }); }
      S.d = (S.d ?? 2) - dt;
      if (S.d <= 0) { S.d = 2.2; const y = B.soul.y; cDash(B, 0, y, 640, y, 0.6); }
    },
  },
  // dois braços de osso girando no meio da caixa + facas que te perseguem
  dSpinBones: {
    len: 9,
    update(B, dt) {
      const S = B.pState;
      if (!S.init) { S.init = 1; B.boxTarget = { x: 320 - 90, y: 236, w: 180, h: 160 }; S.beads = []; for (let arm = 0; arm < 3; arm++) for (let k = 1; k <= 7; k++) { const b = { kind: 'cBead', x: 320, y: 316, vx: 0, vy: 0, r: 5, life: 99, arm, k }; S.beads.push(b); B.bullets.push(b); } }
      S.ang = (S.ang || 0) + dt * (1.2 + B.pt * 0.12);
      for (const b of S.beads) { const a = S.ang + b.arm * Math.PI * 2 / 3; b.x = 320 + Math.cos(a) * b.k * 11; b.y = 316 + Math.sin(a) * b.k * 11; }
      S.k = (S.k ?? 1.2) - dt;
      if (S.k <= 0) { S.k = 1.1; const s = B.soul, x = Math.random() < 0.5 ? 150 : 490, y = 260 + Math.random() * 100; cKnife(B, x, y, Math.atan2(s.y - y, s.x - x), 240, 0.6); }
    },
  },
  // investidas cruzadas da Carmim + paredes de osso azul/laranja
  dCrossDash: {
    len: 8,
    update(B, dt) {
      const S = B.pState, bx = bf(B), s = B.soul;
      S.d = (S.d ?? 0.4) - dt;
      if (S.d <= 0) {
        S.d = 0.95; const a = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4][(Math.random() * 4) | 0], L = 400;
        cDash(B, s.x - Math.cos(a) * L, s.y - Math.sin(a) * L, s.x + Math.cos(a) * L, s.y + Math.sin(a) * L, 0.55);
      }
      S.w = (S.w ?? 1) - dt;
      if (S.w <= 0) { S.w = 1.25; const l = (S.n = (S.n || 0) + 1) % 2; m9Bone(B, l ? bx.x - 10 : bx.x + bx.w + 10, bx.y + bx.h / 2, bx.h, l ? 150 : -150, S.n % 3 ? 'blue' : 'orange'); }
    },
  },
  // ataque final do Encapuzado (com a Carmim junto)
  dDuoFinal: {
    len: 20,
    update(B, dt) {
      const t = B.pt, S = B.pState;
      if (t < 5) { D_ATK.dSlashCircle.update(B, dt * 1.25); S.r = (S.r ?? 0) - dt; if (S.r <= 0) { S.r = 0.5; const a = (S.k = (S.k || 0) + 1) * 0.9; m9Blaster(B, 320 + Math.cos(a) * 190, 316 + Math.sin(a) * 150, a + Math.PI, { warn: 0.7, w: 24 }); } }
      else if (t < 10) { if (!S.blue) { S.blue = 1; B.soulMode = 'blue'; } D_ATK.dGravity.update(B, dt * 1.3); }
      else if (t < 15) { if (!S.red) { S.red = 1; B.soulMode = 'red'; B.gdir = 'down'; B.bullets = B.bullets.filter(b => b.kind !== 'cSpikes'); } D_ATK.dBoxRun.update(B, dt); }
      else if (t < 18.5) { B.boxTarget = { ...BOX0 }; D_ATK.dKnifeRing.update(B, dt * 1.4); }
      else if (!S.big) { S.big = 1; m9Blaster(B, 320, 140, Math.PI / 2, { warn: 1, fire: 0.6, w: 60 }); m9Blaster(B, 20, 316, 0, { warn: 1, fire: 0.6, w: 40 }); }
    },
  },

  // ===== PARTE 2: a Carmim =====
  // investidas rápidas passando por onde você está, deixando corações
  cDash: {
    len: 8,
    update(B, dt) {
      const S = B.pState, s = B.soul;
      S.d = (S.d ?? 0.3) - dt;
      if (S.d <= 0) {
        S.n = (S.n || 0) + 1; S.d = Math.max(0.45, 0.85 - S.n * 0.05);
        const a = Math.random() * Math.PI, L = 420, w = Math.max(0.35, 0.6 - S.n * 0.03);
        cDash(B, s.x - Math.cos(a) * L, s.y - Math.sin(a) * L, s.x + Math.cos(a) * L, s.y + Math.sin(a) * L, w);
        S.pend = (S.pend || []).concat([{ t: w, x: s.x, y: s.y }]);
      }
      for (const p of S.pend || []) { p.t -= dt; if (p.t <= 0 && !p.done) { p.done = 1; for (let i = 0; i < 6; i++) orb(B, p.x, p.y, i * Math.PI / 3 + S.n, 80); } }
    },
  },
  // paredes de facas descendo, com um buraco que anda
  cKnifeWalls: {
    len: 9,
    update(B, dt) {
      const S = B.pState, bx = bf(B);
      S.w = (S.w ?? 0) - dt;
      if (S.w <= 0) {
        S.w = 0.62; const gx = bx.x + bx.w / 2 + Math.sin(B.pt * 1.6) * (bx.w / 2 - 34);
        for (let x = bx.x + 8; x < bx.x + bx.w; x += 16) { if (Math.abs(x - gx) < 26) continue; B.bullets.push({ kind: 'knife', x, y: bx.y - 12, vx: 0, vy: 150, ang: Math.PI / 2, go: 1, r: 6, life: 3 }); }
      }
      S.s = (S.s ?? 2) - dt;
      if (S.s <= 0) { S.s = 2.4; cSlash(B, B.soul.x, B.soul.y, 0, 0.55); }
    },
  },
  // cortes AZUIS (fique parado) e LARANJAS (se mexa) pela caixa inteira + espiral lenta
  cMirror: {
    len: 8,
    update(B, dt) {
      const S = B.pState, bx = bf(B);
      S.m = (S.m ?? 0.4) - dt;
      if (S.m <= 0) {
        S.m = 1.05; const c = Math.random() < 0.5 ? 'blue' : 'orange';
        B.bullets.push({ kind: 'cBig', x: bx.x + bx.w / 2, y: bx.y + bx.h / 2, vx: 0, vy: 0, color: c, warn: 0.75, life: 1.05, hitFn: (b, q) => b.t >= b.warn });
      }
      S.o = (S.o ?? 0) - dt;
      if (S.o <= 0) { S.o = 0.22; S.a = (S.a || 0) + 0.5; orb(B, bx.x + bx.w / 2, bx.y + bx.h / 2, S.a, 70, 4); }
    },
  },
  // mãos de sombra gigantes esmagando dos lados
  cHands: {
    len: 9,
    update(B, dt) {
      const S = B.pState, bx = bf(B);
      S.h = (S.h ?? 0.3) - dt;
      if (S.h <= 0) {
        S.h = 1.15; const s = B.soul, gap = 44, side = (S.n = (S.n || 0) + 1) % 2;
        if (side) { const gy = Math.max(bx.y + 30, Math.min(bx.y + bx.h - 30, s.y + (Math.random() - 0.5) * 60)); const h1 = gy - gap / 2 - bx.y, h2 = bx.y + bx.h - gy - gap / 2;
          cWall(B, bx.x + bx.w / 2, bx.y + h1 / 2, bx.w, h1, 0.6, 0.45); cWall(B, bx.x + bx.w / 2, bx.y + bx.h - h2 / 2, bx.w, h2, 0.6, 0.45); }
        else { const gx = Math.max(bx.x + 30, Math.min(bx.x + bx.w - 30, s.x + (Math.random() - 0.5) * 80)); const w1 = gx - gap / 2 - bx.x, w2 = bx.x + bx.w - gx - gap / 2;
          cWall(B, bx.x + w1 / 2, bx.y + bx.h / 2, w1, bx.h, 0.6, 0.45); cWall(B, bx.x + bx.w - w2 / 2, bx.y + bx.h / 2, w2, bx.h, 0.6, 0.45); }
      }
      S.s = (S.s ?? 0.9) - dt;
      if (S.s <= 0) { S.s = 1.15; S.a = (S.a || 0) + Math.PI / 5; cSlash(B, bx.x + bx.w / 2, bx.y + bx.h / 2, S.a, 0.55); }
    },
  },
  // espiral de três braços que inverte no meio, e ela te puxa pro centro
  cSpiral: {
    len: 8,
    update(B, dt) {
      const S = B.pState, bx = bf(B), cx = bx.x + bx.w / 2, cy = bx.y + bx.h / 2;
      B.pull = 22;
      S.o = (S.o ?? 0) - dt;
      if (S.o <= 0) { S.o = 0.13; S.a = (S.a || 0) + (B.pt < 4 ? 0.23 : -0.23); for (let k = 0; k < 3; k++) orb(B, cx, cy, S.a + k * Math.PI * 2 / 3, 105); }
    },
  },
  // cópias da sua alma te perseguindo (ela também tem DETERMINAÇÃO)
  cClones: {
    len: 9,
    update(B, dt) {
      const S = B.pState, bx = bf(B), s = B.soul;
      if (!S.init) { S.init = 1; S.cl = []; for (const [x, y] of [[bx.x + 14, bx.y + 14], [bx.x + bx.w - 14, bx.y + 14], [bx.x + bx.w / 2, bx.y + bx.h - 14]]) { const c = { kind: 'cClone', x, y, vx: 0, vy: 0, r: 6, life: 99 }; S.cl.push(c); B.bullets.push(c); } }
      const sp = 70 + B.pt * 9;
      S.cl.forEach((c, i) => { const a = Math.atan2(s.y - c.y, s.x - c.x) + Math.sin(B.pt * 2 + i * 2) * 0.5; c.x += Math.cos(a) * sp * dt; c.y += Math.sin(a) * sp * dt; });
      S.d = (S.d ?? 2.2) - dt;
      if (S.d <= 0) { S.d = 2.2; const c = S.cl[(Math.random() * 3) | 0]; cDash(B, c.x - 400 * Math.cos(0.3), c.y - 400 * Math.sin(0.3), c.x + 400 * Math.cos(0.3), c.y + 400 * Math.sin(0.3), 0.6); }
    },
  },
  // anel de facas girando em volta de você, abrindo e fechando + rajadas
  cVortex: {
    len: 8,
    update(B, dt) {
      const S = B.pState, s = B.soul;
      B.pull = 16;
      if (!S.init) { S.init = 1; S.ring = []; for (let i = 0; i < 9; i++) { const k = { kind: 'knife', x: 320, y: 316, vx: 0, vy: 0, ang: 0, go: 1, r: 6, life: 99, i }; S.ring.push(k); B.bullets.push(k); } S.cx = s.x; S.cy = s.y; }
      S.cx += (s.x - S.cx) * dt * 1.2; S.cy += (s.y - S.cy) * dt * 1.2;
      const R = 58 + Math.sin(B.pt * 2.2) * 36, rot = B.pt * 2.4;
      for (const k of S.ring) { const a = rot + k.i * Math.PI * 2 / 9; k.x = S.cx + Math.cos(a) * R; k.y = S.cy + Math.sin(a) * R * 0.8; k.ang = a + Math.PI; }
      S.b = (S.b ?? 1.4) - dt;
      if (S.b <= 0) { S.b = 1.6; const bx = bf(B), x = bx.x + Math.random() * bx.w, y = bx.y; for (let i = 0; i < 7; i++) orb(B, x, y, Math.PI / 2 + (i - 3) * 0.25, 120); }
    },
  },
  // ATAQUE FINAL DA CARMIM (22 segundos)
  cFinal: {
    len: 22,
    update(B, dt) {
      const t = B.pt, S = B.pState;
      const phase = t < 5 ? 0 : t < 9.5 ? 1 : t < 14 ? 2 : t < 18 ? 3 : 4;
      if (phase !== S.ph) { S.ph = phase; B.pState = { ph: phase }; B.bullets = B.bullets.filter(b => !['cClone', 'cBead'].includes(b.kind) && !(b.kind === 'knife' && b.life === 99)); B.pull = 0; B.boxTarget = { ...BOX0 }; Sfx.slam(); B.shakeT = 0.25; }
      if (phase === 0) D_ATK.cDash.update(B, dt * 1.35);
      if (phase === 1) D_ATK.cSpiral.update(B, dt * 1.2);
      if (phase === 2) { D_ATK.cHands.update(B, dt * 1.15); }
      if (phase === 3) D_ATK.cClones.update(B, dt * 1.2);
      if (phase === 4) {
        // quatro cortes gigantes: só um canto da caixa fica seguro (marcado em verde)
        const P = B.pState, bx = bf(B);
        if (!P.x) { P.x = 1; P.safe = (Math.random() * 4) | 0; }
        P.s = (P.s ?? 0.2) - dt;
        if (P.s <= 0 && (P.n || 0) < 6) { P.s = 0.55; P.n = (P.n || 0) + 1;
          const sx = P.safe % 2 ? bx.x + bx.w - 22 : bx.x + 22, sy = P.safe > 1 ? bx.y + bx.h - 20 : bx.y + 20;
          B.bullets.push({ kind: 'cSafe', x: sx, y: sy, vx: 0, vy: 0, warn: 1.1, life: 1.5, hitFn: (b, q) => b.t >= b.warn && Math.hypot(q.x - b.x, q.y - b.y) > 26 }); }
      }
    },
  },
};
Object.assign(PATTERNS, D_ATK);

Object.assign(PATTERNS, {
  // o golpe que derruba de primeira (impossível de desviar)
  f2Doom: {
    update(B, dt) {
      const S = B.pState, bx = bf(B);
      S.n = (S.n || 0) + dt;
      if (!S.a) { S.a = 1; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6; B.bullets.push({ kind: 'redSlash', x: B.soul.x, y: B.soul.y, ang: a, vx: 0, vy: 0, warn: 1.1 + i * 0.05, life: 1.6, hitFn: () => false }); } }
      if (S.n > 1.4 && !S.b) {
        S.b = 1; Sfx.slam();
        B.bullets.push({ kind: 'f2wave', x: bx.x + bx.w / 2, y: bx.y + bx.h / 2, vx: 0, vy: 0, life: 2, hitFn: () => true });
      }
    },
  },
});
Object.assign(BULLET_DRAW, {
  cDash(b, t) {
    if (b.t < b.warn) { ctx.strokeStyle = `rgba(255,40,60,${0.3 + Math.sin(t * 40) * 0.25})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x2, b.y2); ctx.stroke(); return; }
    const k = Math.min(1, (b.t - b.warn) / 0.25), f = Math.max(0, 1 - (b.t - b.warn - 0.2) / 0.3);
    ctx.globalAlpha = f;
    ctx.strokeStyle = '#ff1a2a'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + (b.x2 - b.x) * k, b.y + (b.y2 - b.y) * k); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.stroke();
    ctx.globalAlpha = 1;
    if (k < 1) drawSpr(SPR.carmimDemon, b.x + (b.x2 - b.x) * k - 14, b.y + (b.y2 - b.y) * k - 21, 2);
  },
  cOrb(b) { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 1.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff2a4a'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffb0c0'; ctx.fillRect(b.x - 2, b.y - 2, 2, 2); },
  cBead(b) { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); },
  cClone(b, t) {
    ctx.fillStyle = `rgba(255,20,40,${0.25 + Math.sin(t * 9) * 0.1})`; ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.85; drawSpr(SPR.soul, b.x - 8, b.y - 7, 1); ctx.globalAlpha = 1;
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 4, b.y - 2, 2, 2); ctx.fillRect(b.x + 2, b.y - 2, 2, 2);
  },
  cHand(b, t) {
    const x = b.x - b.w / 2, y = b.y - b.h / 2;
    if (b.t < b.warn) { ctx.strokeStyle = `rgba(200,60,255,${0.4 + Math.sin(t * 30) * 0.3})`; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, b.w - 4, b.h - 4); return; }
    ctx.fillStyle = '#1a0624'; ctx.fillRect(x, y, b.w, b.h);
    ctx.fillStyle = '#3a0a4a'; for (let i = 0; i < 5; i++) { if (b.w > b.h) ctx.fillRect(x + 4 + i * (b.w - 8) / 5, y + 3, (b.w - 8) / 5 - 4, b.h - 6); else ctx.fillRect(x + 3, y + 4 + i * (b.h - 8) / 5, b.w - 6, (b.h - 8) / 5 - 4); }
    ctx.fillStyle = '#ff1a2a'; ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
  },
  cSpikes(b, t) {
    const x = b.x - b.w / 2, y = b.y - b.h / 2;
    if (b.t < b.warn) { ctx.fillStyle = `rgba(255,60,60,${0.25 + Math.sin(t * 40) * 0.2})`; ctx.fillRect(x, y, b.w, b.h); return; }
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, b.w, b.h); ctx.fillStyle = '#ff3b3b'; for (let i = 0; i < Math.max(b.w, b.h); i += 8) b.w > b.h ? ctx.fillRect(x + i, y + b.h / 2 - 1, 4, 2) : ctx.fillRect(x + b.w / 2 - 1, y + i, 2, 4);
  },
  cBig(b, t) {
    const c = C2_COL[b.color], bx = Game.battleObj.box;
    if (b.t < b.warn) { ctx.strokeStyle = c; ctx.globalAlpha = 0.4 + Math.sin(t * 30) * 0.3; ctx.lineWidth = 3; ctx.strokeRect(bx.x + 6, bx.y + 6, bx.w - 12, bx.h - 12); ctx.globalAlpha = 1;
      text(b.color === 'blue' ? 'PARE!' : 'MEXA-SE!', bx.x + bx.w / 2, bx.y + 8, 26, c, 'center'); return; }
    ctx.globalAlpha = 0.55; ctx.fillStyle = c; ctx.fillRect(bx.x, bx.y, bx.w, bx.h); ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx.x, bx.y); ctx.lineTo(bx.x + bx.w, bx.y + bx.h); ctx.moveTo(bx.x + bx.w, bx.y); ctx.lineTo(bx.x, bx.y + bx.h); ctx.stroke();
  },
  cSafe(b, t) {
    const bx = Game.battleObj.box, on = b.t >= b.warn;
    ctx.save(); ctx.beginPath(); ctx.rect(bx.x, bx.y, bx.w, bx.h); ctx.arc(b.x, b.y, 26, 0, Math.PI * 2, true); ctx.clip();
    ctx.fillStyle = on ? 'rgba(255,20,40,0.85)' : `rgba(255,40,60,${0.12 + Math.sin(t * 30) * 0.1})`; ctx.fillRect(bx.x, bx.y, bx.w, bx.h);
    ctx.restore();
    ctx.strokeStyle = '#7aff9a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, 26, 0, Math.PI * 2); ctx.stroke();
  },
  f2wave(b, t) {
    const k = Math.min(1, b.t / 0.25);
    ctx.fillStyle = `rgba(255,20,40,${0.85 * k})`; ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#000'; for (let i = 0; i < 8; i++) ctx.fillRect(0, (i * 67 + t * 300) % 480, 640, 6);
  },
});

// ---------------- O MAPA ----------------
const WALK_R3 = '.,';

MAPS.altar = {
  music: 'carmim',
  start: { x: tx2x(20), y: ty2y(47), dir: 'up' },
  noParty: false,

  build() {
    const MW = 40, MH = 52, g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    rect(17, 20, 7, 31, '.');
    rect(6, 3, 28, 17, '.');
    const R = rng(33);
    for (let i = 0; i < 90; i++) { const x = 6 + ((R() * 28) | 0), y = 3 + ((R() * 47) | 0); if (g[y][x] === '.') g[y][x] = ','; }
    for (const [x, y] of [[13, 9], [27, 9], [13, 15], [27, 15], [17, 25], [23, 25], [17, 33], [23, 33], [17, 41], [23, 41]]) g[y][x] = 'P';
    return { g };
  },

  solid(c) { return !WALK_R3.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.tiles, h = (x * 73 + y * 151) % 3;
    if (c === '.') return T.floor[h];
    if (c === ',') return T.leaves[h];
    if (c === 'P') return T.wall;
    const b = W.tile(x, y + 1);
    return WALK_R3.includes(b) ? T.wall : (y < MAPS.altar._mh - 1 && WALK_R3.includes(W.tile(x, y + 2)) ? T.wallTop : SPR.deepT.void);
  },
  _mh: 52,

  ents(W) {
    const F = G.flags, gone = F.c3done;
    const jar = (i) => ({ id: 'jar' + i, x: tx2x(10 + i * 4), y: ty2y(5), w: 14, h: 8, solid: true, hidden: !!F.r3freed,
      draw(sx, sy, t) {
        const x = sx(this.x), y = sy(this.y), c = ['#ff3b3b', '#ff9a3a', '#ffe680', '#7aff9a', '#5ac8ff', '#c87aff'][i];
        ctx.fillStyle = '#000'; ctx.fillRect(x - 12, y - 34, 24, 34);
        ctx.fillStyle = 'rgba(200,220,255,0.25)'; ctx.fillRect(x - 10, y - 32, 20, 30);
        ctx.fillStyle = '#6a5a7a'; ctx.fillRect(x - 12, y - 38, 24, 6);
        ctx.fillStyle = c; ctx.globalAlpha = 0.7 + Math.sin(t * 4 + i) * 0.3;
        ctx.beginPath(); ctx.arc(x, y - 17 + Math.sin(t * 2 + i) * 3, 7, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }, talk: () => c2say(['* (Uma alma presa num pote de vidro. Ela bate no vidro, pedindo pra sair.)']) });
    return [
      { id: 'star', x: tx2x(21), y: ty2y(37), w: 12, h: 8, spr: 'star', solid: true, talk: () => R3.useStar() },
      jar(0), jar(1), jar(2), jar(3), jar(4), jar(5),
      { id: 'carmim', x: tx2x(21), y: ty2y(10), w: 14, h: 8, solid: true, hidden: !!gone, alpha: 1, talk: () => R3.rematch(),
        draw(sx, sy, t) {
          ctx.fillStyle = `rgba(30,0,40,${0.4 + Math.sin(t * 3) * 0.15})`; ctx.beginPath(); ctx.ellipse(sx(this.x), sy(this.y), 26, 8, 0, 0, Math.PI * 2); ctx.fill();
          drawSpr(SPR.carmim, sx(this.x - 7), sy(this.y - 21), 2, this.alpha);
          ctx.fillStyle = `rgba(255,20,40,${0.7 + Math.sin(t * 6) * 0.3})`; ctx.fillRect(sx(this.x - 2), sy(this.y - 15), 2, 2); ctx.fillRect(sx(this.x + 4), sy(this.y - 15), 2, 2);
        } },
      { id: 'enc', x: tx2x(17) + 8, y: ty2y(10), w: 14, h: 8, solid: true, hidden: !!gone, alpha: 1, talk: () => R3.rematch(),
        draw(sx, sy, t) { drawSpr(SPR.encapuzado, sx(this.x - 8), sy(this.y - 24) + Math.sin(t * 1.5) * 2, 2, this.alpha); } },
      { id: 'demon', x: tx2x(21), y: ty2y(9), w: 1, h: 1, solid: false, hidden: !!gone, alpha: 1, zOff: -1,
        draw(sx, sy, t) {
          ctx.globalAlpha = this.alpha * (0.5 + Math.sin(t * 2) * 0.15);
          drawSpr(SPR.sombra, sx(this.x - 14), sy(this.y - 52) + Math.round(Math.sin(t * 2) * 3), 4, this.alpha * 0.6);
          ctx.globalAlpha = 1;
        } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 17, y: 19, w: 7, h: 3, when: () => !F.r3heard, run: () => R3.eavesdrop() },
      { x: 6, y: 3, w: 28, h: 15, when: () => F.r3dead && !F.c3done && !R3.busy, run: () => R3.rematch() },
    ];
  },

  setup(W) { R3.busy = false; R3.free = null; },
  onEnter(W) { if (!G.flags.r3arrived) R3.arrive(); },
  musicAt(W) { return G.flags.c3done ? 'esperanca' : 'carmim'; },
  overlay(W, sx, sy) {
    const t = W.t;
    ctx.fillStyle = G.flags.c3done ? 'rgba(40,20,60,0.25)' : `rgba(60,0,20,${0.22 + Math.sin(t) * 0.05})`; ctx.fillRect(0, 0, 640, 480);
    if (R3.free) {
      R3.free.t += 1 / 60;
      for (let i = 0; i < 6; i++) {
        const k = R3.free.t, x = sx(tx2x(10 + i * 4)) + Math.sin(k * 2 + i) * 20 * k, y = sy(ty2y(5) - 17) - k * 90 * (0.7 + i * 0.08);
        ctx.fillStyle = ['#ff3b3b', '#ff9a3a', '#ffe680', '#7aff9a', '#5ac8ff', '#c87aff'][i];
        ctx.globalAlpha = Math.max(0, 1 - k / 4); ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
  },
  talkInstr() {},
};

QUESTS.altar = function (W) {
  const F = G.flags;
  if (F.c3done) return null;
  if (!F.r3heard) return { t: 'Siga o corredor até o fundo. Sem fazer barulho.', x: 20, y: 20 };
  return { t: 'Enfrente a CARMIM e o ENCAPUZADO.', x: 20, y: 10 };
};

const R3 = {
  busy: false, free: null,
  ent(id) { return World.ents.find(e => e.id === id); },

  async arrive() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; F.r3arrived = true;
    p.x = tx2x(20) + 8; p.y = ty2y(48); p.dir = 'up'; W.trail = []; W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('carmim'); Fade.to(0, 0.6);
    await wait(0.6);
    await c2say([
      '* (Vocês seguiram o sinal do celular até aqui.)',
      '* (Debaixo da floresta onde você caiu, existe um lugar que ninguém conhece.)',
      '* (Um templo antigo. O ar é pesado. Vermelho.)',
      '3: ...Que lugar horrível.',
      '4: Estou sentindo... almas. Várias. Assustadas.',
      '* (Seu peito brilha azul. O Carmino está com você.)',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async eavesdrop() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; this.busy = true;
    Sfx.stopMusic();
    p.dir = 'up';
    W.focus(tx2x(20), ty2y(9));
    await wait(1.2);
    await c2show([
      '* (Lá no fundo, num altar, seis potes de vidro. Dentro de cada um, uma ALMA.)',
      '* (Do lado do altar: o ENCAPUZADO. E ela. A CARMIM.)',
      '* (Atrás dela, uma sombra gigante, com olhos vermelhos.)',
      '* (Da outra vez, você sentiu um arrepio.)',
      '* (Agora não. A alma do Carmino te esquenta por dentro.)',
      '* (Você não tem mais medo de sombra. E escuta TUDO.)',
    ]);
    Sfx.playMusic('encontro');
    await c2show([
      'S: Seis almas. Uma de cada canto do mundo.',
      '5: Faltava uma. Uma com muita, muita DETERMINAÇÃO.',
      'X: A alma do humano de olhos castanhos.',
      'S: E quando você tiver as sete?',
      '5: Aí a gente vira PODER. Eu e você.',
      'X: Os humanos vão ficar ACIMA de todas as outras raças.',
      '5: Monstros, doces, robôs, fantasmas, dragões... todos ajoelhados.',
      'X: Como antigamente. GUERRA. CAOS.',
      '5: E ninguém nunca mais vai ser fraco. Nunca mais vai cair num buraco e chorar sozinho.',
      'S: ...É isso que você quer de verdade, Carmim?',
      '5: É isso que ELE quer.',
      '3: (...a gente tem que impedir isso.)',
      '4: (Juntos.)',
    ]);
    W.focus(null);
    await W.walk(p, [[p.x, ty2y(14)]], 50);
    Sfx.stopMusic();
    await c2show([
      '* PAREM!',
      '5: ...Ah. Você veio.',
      '5: E trouxe o cheiro do meu irmão. Chá e livro velho.',
      'S: Vai embora, humano. Enquanto dá.',
      '* (Você diz que não vai a lugar nenhum.)',
      '* (Você diz que o Carmino—)',
    ]);
    F.r3heard = true;
    Sfx.boo(); W.shake = 1.4;
    await c2show(['X: CHEGA DE CONVERSA.', '* (A sombra pula em cima de você!)']);
    this.busy = false;
    this.fight({ oneShot: true });
  },

  fight(opts) {
    const W = World;
    W.locked = true; this.busy = true;
    const p = W.player;
    Game.flashPos = { x: (p.x - W.cam.x) * 2, y: (p.y - W.cam.y - 10) * 2 };
    Sfx.stopMusic(); Game.flashT = 0.9;
    wait(0.9).then(() => {
      if (!opts.oneShot) G.hp = G.maxhp;
      Game.battleObj = new FinalBattle('c2final', { ...opts, dragon: G.dragon, onEnd: res => this.afterFight(res, opts) });
      Game.scene = 'battle';
    });
  },

  async afterFight(res, opts) {
    const F = G.flags;
    if (res === 'dead') {
      if (opts.oneShot) { await wait(1.2); Sfx.stopMusic(); return C2.scene(Det2); }
      await wait(0.2); GameOver.enter(); Game.scene = 'gameover'; return;
    }
    await Fade.to(1, 2);
    Game.scene = 'world'; Game.battleObj = null;
    this.ending();
  },

  async rematch() {
    const F = G.flags;
    if (!F.r3dead || F.c3done || this.busy) return;
    this.busy = true;
    World.locked = true;
    await c2say(['5: De novo? Você é teimoso igual ele.', '* (Seus olhos queimam, vermelhos.)']);
    F.redEyes = true;
    this.fight({ rematch: true });
  },

  async ending() {
    const W = World, F = G.flags, c = this.ent('carmim'), e = this.ent('enc'), d = this.ent('demon'), p = W.player;
    F.c3done = true; F.redEyes = false;
    p.x = tx2x(20) + 8; p.y = ty2y(14); p.dir = 'up'; W.trail = []; W.updateCam(true);
    Sfx.playMusic('carmino');
    await Fade.to(0, 1.5);
    await c2say([
      '* (A sombra solta um último grito e se desfaz no ar.)',
      '* (No chão, a Carmim. Só uma menina, de olhos castanhos.)',
      '5: ...Onde... onde eu tô?',
      '5: Faz tanto tempo... tanto tempo que eu não vejo direito...',
      { who: 'alma', t: '* Oi, Carmim.' },
      '5: ...Irmãozinho? Carmino? É você?',
      { who: 'alma', t: '* Sou eu. Eu nunca fui embora.' },
      '5: Desculpa... eu fiz tanta coisa horrível...',
      { who: 'alma', t: '* Eu sei. Agora descansa.' },
      '5: ...Você ainda segura a minha mão?',
      { who: 'alma', t: '* Sempre.' },
    ]);
    Sfx.dust();
    for (let i = 0; i < 80; i++) { c.alpha = d.alpha = 1 - i / 80; await nextFrame(); }
    c.hidden = d.hidden = true;
    await c2say([
      '* (A Carmim vira poeira. Uma poeira que brilha.)',
      'S: ...',
      'S: Ela era... a minha única amiga.',
      'S: A gente caiu aqui no mesmo inverno. Ela me achou chorando.',
      'S: Eu faria tudo por ela. E fiz.',
      'S: ...Errado. Eu sei.',
      'S: Toma conta deles, humano. De todo mundo.',
    ]);
    for (let i = 0; i < 80; i++) { e.alpha = 1 - i / 80; await nextFrame(); }
    e.hidden = true;
    Sfx.shatter();
    this.free = { t: 0 };
    for (let i = 0; i < 6; i++) this.ent('jar' + i).hidden = true;
    F.r3freed = true;
    Sfx.playMusic('esperanca');
    await c2say([
      '* (Os potes se quebram. As seis almas voam livres, cada uma pra sua casa.)',
      '3: ...A gente conseguiu?',
      '4: A gente conseguiu.',
      { who: 'alma', t: '* Vocês conseguiram.' },
      { who: 'alma', t: '* Obrigado por salvar o mundo. E por salvar ela, do único jeito que dava.' },
      { who: 'alma', t: '* Eu vou ficar mais um pouquinho aqui dentro, tá? Ainda tem muita coisa pra te ensinar.' },
      '* (Seu peito brilha azul, quentinho.)',
      '* (Kai segura sua mão de um lado. Luna, do outro.)',
      '* (Mas lá no fundo, você sabe: isso ainda não acabou.)',
    ]);
    this.free = null;
    W.saveHere(0);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    C2.end(3);
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere(0);
    await c2say(['* (Mesmo neste lugar escuro, uma estrela brilha.)', '* (Ela te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },

  async call(o) {
    if (o === '???') { Sfx.ring(); await wait(0.5); await c2say(['* (Lá no fundo do corredor, um celular toca.)', '* (Ninguém atende.)']); return true; }
    return false;
  },
};

// ---------------- A TELA DE DETERMINAÇÃO (a alma do Instrutor) ----------------
const Det2 = {
  enter() {
    Object.assign(this, { t: 0, pieces: [], heal: 0, red: 0 });
    for (let i = 0; i < 6; i++) this.pieces.push({ x: 320, y: 240, vx: (Math.random() - 0.5) * 300, vy: -150 - Math.random() * 150, hx: 320, hy: 240 });
    Sfx.breakHeart();
    this.run();
  },
  async run() {
    await wait(2.4);
    Sfx.playMusic('esperanca');
    this.ghost = true;
    await wait(1.2);
    await c2show([
      'A: Ei.',
      'A: ...Ei. Levanta.',
      'A: Lembra o que eu te disse na fogueira?',
      'A: Toda vez que você cair, eu vou estar aqui pra te levantar.',
      'A: Você não está sozinho. Nunca esteve.',
      'A: Você tem a força do Kai. Da Luna. Dos dragões.',
      'A: Do povo da Vila Aurora. Dos docinhos da ilha. Do Seu Jorge, do Mestre Leão...',
      'A: E tem a minha.',
      'A: A minha irmã esqueceu o que é isso. Mostra pra ela.',
      'A: Mostra pra ela o que é DETERMINAÇÃO.',
    ]);
    this.heal = 0.01; Sfx.heal();
    await wait(2);
    this.red = 0.01; Sfx.levelUp();
    await wait(1.6);
    G.flags.r3dead = true;
    G.hp = G.maxhp;
    World.saveHere(0);
    await Fade.to(1, 1, '#ffffff');
    Game.scene = 'world';
    Fade.to(0, 3, '#ffffff');
    R3.busy = false;
    R3.fight({ awaken: true });
  },
  update(dt) {
    this.t += dt; Dialog.update(dt);
    if (this.t > 1.2) for (const p of this.pieces) {
      if (this.heal > 0) { p.x += (p.hx - p.x) * dt * 3; p.y += (p.hy - p.y) * dt * 3; }
      else if (p.y < 520) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; }
    }
    if (this.heal > 0) this.heal = Math.min(1, this.heal + dt * 0.6);
    if (this.red > 0) this.red = Math.min(1, this.red + dt);
  },
  draw() {
    const t = this.t;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (t < 0.6) drawSpr(SPR.soul, 312, 233, 1);
    else if (t < 1.2) drawSpr(SPR.soulBroken, 312, 233, 1);
    else if (this.heal < 0.95) this.pieces.forEach(p => { ctx.fillStyle = '#ff2b2b'; ctx.fillRect(p.x, p.y, 6, 6); });
    if (this.ghost) {
      ctx.globalAlpha = Math.min(0.8, (t - 3.6) * 0.5);
      ctx.fillStyle = 'rgba(150,240,255,0.15)'; ctx.beginPath(); ctx.arc(320, 150, 120, 0, Math.PI * 2); ctx.fill();
      drawSpr(SPR.instrSoul, 286, 70 + Math.sin(t * 1.5) * 6, 4);
      ctx.globalAlpha = 1;
    }
    if (this.heal >= 0.95) {
      const s = 2 + this.red * 2;
      if (this.red > 0) { ctx.fillStyle = `rgba(255,30,40,${0.3 * this.red})`; ctx.beginPath(); ctx.arc(320, 240, 60 * this.red, 0, Math.PI * 2); ctx.fill(); }
      drawSpr(SPR.soul, 320 - 8 * s, 240 - 7 * s, s);
      if (this.red > 0.5) text('DETERMINAÇÃO', 320, 320, 26, `rgba(255,60,60,${this.red})`, 'center', FONT_TITLE);
    }
    Dialog.draw();
  },
};
