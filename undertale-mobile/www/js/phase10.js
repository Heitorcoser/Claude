// FASE 10 — A ARENA
// Depois da ponte, uma arena de pedra. O MESTRE LEÃO te mostra a verdadeira força de
// você mesmo: agilidade, força e a luta contra a sua própria SOMBRA. No fim, ele te dá
// a FACA DO LEÃO. Você sai pronto para a Fase 11, a luta de verdade.
'use strict';

const WALK10 = 'sd';

// ---------- treino de agilidade (só desviar) ----------
ENEMIES.treino = {
  name: 'Boneco de Treino', spr: 'dummy', scale: 6, hp: 999, atk: 1, def: 0, xp: 0, gold: 0, voice: 'narr',
  boss: true, nonlethal: true, cls: 'treino', music: 'draco',
  intro: '* LIÇÃO 1: AGILIDADE', check: '* Um boneco de palha.', acts: {}, flavor: ['* O Mestre Leão observa.'], talk: ['...'], patterns: [],
};
class TrainBattle extends Battle {
  constructor(key, opts) {
    super(key, { ...opts, dragon: null, robot: false, withInstr: false, solo: true });
    boss9Sprites();
    this.rounds = ['mBoneGap', 'mBlueOrange', 'mBlasters'];
    this.ri = 0; this.hits = 0; this.phase = 1;
  }
  st_start(dt) {
    this.introT += dt;
    if (this.introT > 0.3 && !this.begun) {
      this.begun = true;
      this.say(['* LIÇÃO 1: AGILIDADE.', '* Sobreviva a 3 rodadas de ataques. Não precisa atacar.', '* Ossos AZUIS: fique parado. Ossos LARANJAS: continue se mexendo.'], () => this.nextRound());
    }
  }
  nextRound() {
    if (this.ri >= this.rounds.length) {
      return this.say([`* Treino terminado! Você levou ${this.hits} golpe${this.hits === 1 ? '' : 's'}.`, this.hits <= 3 ? '* Mestre Leão: "RÁPIDO como um leão!"' : '* Mestre Leão: "Nada mal. Seu corpo já está aprendendo."'], () => this.end('done'));
    }
    this.startEnemyTurn(this.rounds[this.ri++]);
    this.turnLen = 6; this.bubble = null;
  }
  toMenu() { this.nextRound(); }
  hurt() { this.hits++; this.soul.inv = 0.6; Sfx.hurt(); this.hurtFlash = 0.12; }
  update(dt) {
    super.update(dt);
    if (this.state === 'enemyTurn') for (const b of this.bullets) if (b.kind === 'blaster' && !b.fired && b.t >= b.warn) { b.fired = true; Sfx.blasterFire(); }
  }
  draw() {
    super.draw();
    if (this.state === 'enemyTurn') for (const b of this.bullets) if (b.kind === 'blaster') drawBlaster(b);
    text(`RODADA ${Math.min(this.ri, 3)} / 3`, 320, 16, 26, '#ffe680', 'center');
  }
}
BATTLE_CLASSES.treino = TrainBattle;

// ---------- a Sombra ----------
ENEMIES.sombra = {
  name: 'Sua Sombra', spr: 'sombra', scale: 7, hp: 160, atk: 5, def: 2, xp: 80, gold: 0, voice: 'deep',
  boss: true, nonlethal: true, music: 'mestre', bubbleW: 220,
  intro: '* LIÇÃO 3: A VERDADEIRA FORÇA.\n* Sua SOMBRA se levanta do chão.',
  check: '* SUA SOMBRA - ATK 5 DEF 2\n* Tudo o que você tem medo de ser.\n* Ela conhece todos os seus golpes.',
  acts: {
    'Encarar a sombra': { text: ['* Você olha a Sombra nos olhos.', '* Ela treme. Ela é feita do seu medo.'], mercy: 30 },
    'Aceitar seus erros': { text: ['* Você lembra de tudo o que fez de errado.', '* Você não foge. Você aceita.', '* A Sombra fica menor.'], mercy: 35 },
    'Lembrar dos amigos': { text: ['* Você lembra do Instrutor, do Bit, do Treinador, do seu dragão...', '* A luz deles faz a Sombra recuar.'], mercy: 40 },
  },
  flavor: ['* A Sombra copia cada movimento seu.', '* Ela sussurra com a sua voz.', '* O Mestre Leão não interfere.'],
  talk: ['Você é fraco.', 'Você perdeu na ponte.', 'Ninguém vem te ajudar.', 'Eu sou você.', '...Ou não?'],
  spareTalk: 'Então... somos um só.',
  defeatText: ['* A Sombra se desfaz em fumaça...', '* ...e volta para debaixo dos seus pés.'],
  patterns: ['knives', 'mBoneGap', 'knives', 'mBlueOrange'],
};
Object.assign(PATTERNS, {
  knives: {
    update(B, dt) {
      for (const b of B.bullets) if (b.kind === 'knife' && !b.go && b.t >= b.warn) { b.go = 1; b.vx = Math.cos(b.ang) * 330; b.vy = Math.sin(b.ang) * 330; Sfx.cut(); }
      B.spawnT -= dt;
      if (B.spawnT > 0) return;
      B.spawnT = 0.5;
      const s = B.soul, a = Math.random() * Math.PI * 2, x = s.x + Math.cos(a) * 130, y = s.y + Math.sin(a) * 100;
      B.bullets.push({ kind: 'knife', x, y, vx: 0, vy: 0, ang: Math.atan2(s.y - y, s.x - x), warn: 0.5, r: 6, life: 2.5 });
    },
  },
});
Object.assign(BULLET_DRAW, {
  knife(b) {
    if (!b.go) { ctx.strokeStyle = `rgba(255,60,90,${0.5 + Math.sin(b.t * 30) * 0.3})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(b.ang) * 300, b.y + Math.sin(b.ang) * 300); ctx.stroke(); }
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.ang + Math.PI / 4);
    ctx.drawImage(SPR.faca, -12, -12, 24, 24);
    ctx.restore();
  },
});

MAPS.arena = {
  music: 'draco',
  start: { x: tx2x(4), y: ty2y(20), dir: 'right' },
  anim: '',

  build() {
    const MW = 64, MH = 40, F = G.flags;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    rect(2, 18, 14, 5, 'd');
    rect(16, 4, 36, 32, 'W');
    rect(17, 5, 34, 30, 'B');
    rect(19, 7, 30, 26, 's');
    for (let x = 18; x < 51; x += 4) g[4][x] = 'N';
    rect(16, 18, 3, 5, 's');
    rect(49, 18, 3, 5, F.p10gift ? 's' : 'G');
    rect(52, 18, 10, 5, 'd');
    return { g };
  },

  solid(c) { return !WALK10.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.arenaT, h = (x * 73 + y * 151) % 3;
    if (c === 's') return T.sand[h];
    if (c === 'd') return SPR.city.dirt[h];
    if (c === 'B') return T.seats;
    if (c === 'W') return T.wall;
    if (c === 'N') return T.banner;
    if (c === 'G') return T.gate;
    if (c === '#') return W.tile(x, y + 1) === 'd' ? SPR.city.cliff : SPR.city.rock;
    return SPR.city.rock;
  },

  ents(W) {
    const F = G.flags;
    const torch = (id, x, y) => ({ id, x: tx2x(x), y: ty2y(y), w: 6, h: 4, solid: true,
      draw(sx, sy, t) { drawSpr(SPR.torch, sx(this.x - 4), sy(this.y - 20), 2); drawFlame(sx(this.x), sy(this.y - 20), 10, t * 10 + this.x); } });
    const fan = (id, k, x, y) => ({ ...kidNpc(id, k, x, y, () => P10.fan(id)), solid: true });
    return [
      { id: 'star', x: tx2x(22), y: ty2y(20), w: 12, h: 8, spr: 'star', solid: true, talk: () => P10.useStar() },
      torch('t1', 15, 17), torch('t2', 15, 23), torch('t3', 52, 17), torch('t4', 52, 23),
      { id: 'leao', x: tx2x(34), y: ty2y(15), w: 16, h: 10, solid: true, talk: () => P10.talkLeao(),
        draw(sx, sy, t) { drawSpr(SPR.leao, sx(this.x - 8), sy(this.y - 22) + (Math.floor(t * 2) % 2), 1.7); } },
      { id: 'd1', x: tx2x(26), y: ty2y(26), w: 12, h: 6, solid: true, talk: () => W.say(['* (Um boneco de treino, todo remendado.)']), draw(sx, sy) { drawSpr(SPR.dummy, sx(this.x - 8), sy(this.y - 26), 2); } },
      { id: 'd2', x: tx2x(42), y: ty2y(26), w: 12, h: 6, solid: true, talk: () => W.say(['* (Um boneco de treino. Alguém desenhou um capuz nele.)']), draw(sx, sy) { drawSpr(SPR.dummy, sx(this.x - 8), sy(this.y - 26), 2); } },
      fan('f1', 'k1', 24, 6), fan('f2', 'k3', 30, 5), fan('f3', 'k2', 40, 6), fan('f4', 'k4', 46, 5),
      { id: 'sombraE', x: 0, y: 0, w: 0, h: 0, solid: false, hidden: true, draw(sx, sy, t) { drawSpr(SPR.sombra, sx(this.x - 7), sy(this.y - 21) + Math.sin(t * 3) * 2, 2, 0.85); } },
      { id: 'facaE', x: 0, y: 0, w: 0, h: 0, solid: false, hidden: true, zOff: 40, draw(sx, sy, t) {
        ctx.fillStyle = `rgba(255,220,120,${0.35 + Math.sin(t * 6) * 0.15})`; ctx.beginPath(); ctx.arc(sx(this.x), sy(this.y - 20), 24, 0, Math.PI * 2); ctx.fill();
        drawSpr(SPR.faca, sx(this.x - 8), sy(this.y - 28) + Math.sin(t * 3) * 3, 2); } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [{ x: 54, y: 18, w: 3, h: 5, when: () => F.p10gift && !F.p10done, run: () => P10.leave() }];
  },

  setup(W) {},
  onEnter(W) { if (!G.flags.p10arrived) P10.arrive(); },
  musicAt() { return 'draco'; },

  update(W, dt) {
    if (P10.mini) { P10.updateMini(dt); return; }
    if (W.locked || Game.scene !== 'world') return;
    if (Sfx.current !== 'draco') Sfx.playMusic('draco');
  },
  overlay(W) { if (P10.mini) P10.drawMini(); },

  interactTile(W, c) {
    if (c === 'G') return W.say(['* (O portão leste está trancado. O Mestre Leão tem a chave.)']);
    if (c === 'B') return W.say(['* (A arquibancada. Tem pipoca no chão.)']);
    if (c === 'N') return W.say(['* (Uma bandeira com um leão dourado.)']);
  },
  talkInstr() {},
};

// ---------------- Roteiros da Fase 10 ----------------
const P10 = {
  mini: null,
  ent(id) { return World.ents.find(e => e.id === id); },

  async arrive() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; F.p10arrived = true;
    G.hp = G.maxhp;
    p.x = tx2x(4); p.y = ty2y(20); p.dir = 'right'; W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('draco'); Fade.to(0, 0.8);
    await wait(0.6);
    await W.say(['* (Depois da ponte, uma ARENA de pedra enorme.)', '* (Bandeiras vermelhas, tochas, e uma plateia animada.)']);
    await W.walk(p, [[tx2x(30), ty2y(20)]], 70);
    p.dir = 'up';
    await W.say([
      '2: HAHAHA! Então você é o humano da ponte!',
      '2: Eu sou o MESTRE LEÃO. Esta é a minha arena.',
      F.p9part1 ? '2: Você aguentou a primeira parte da luta com o Encapuzado. Impressionante!' : '2: Você caiu com 1 de HP contra o Encapuzado. Sem vergonha nenhuma: TODO MUNDO cai na primeira vez.',
      '2: Mas a luta de verdade ainda vai acontecer. E ele vai vir com TUDO.',
      '2: Eu vou te mostrar a VERDADEIRA FORÇA...',
      '2: ...a força de VOCÊ MESMO.',
      '2: Três lições. Fale comigo quando estiver pronto.',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  fan(id) {
    const L = { f1: ['C: VAI, HUMANO!!'], f2: ['C: O Mestre Leão já treinou mil guerreiros!'], f3: ['C: Dizem que ele lutou com o Encapuzado uma vez... e empatou!'], f4: ['C: Eu trouxe pipoca. Quer?'] };
    return World.say(L[id]);
  },

  async talkLeao() {
    const W = World, F = G.flags;
    if (F.p10gift) return W.say(['2: Vá. O portão leste está aberto.', '2: E lembre: a sua força é SUA. Ninguém tira isso de você.']);
    W.locked = true;
    if (!F.p10l1) {
      await W.say(['2: LIÇÃO 1: AGILIDADE!', '2: Um guerreiro de verdade não precisa ser atingido.', '2: Vou soltar uns ataques. Só DESVIE.']);
      W.locked = false;
      W.battle('treino', {}, () => this.afterL1());
      return;
    }
    if (!F.p10l2) {
      await W.say(['2: LIÇÃO 2: FORÇA!', '2: Força não é bater forte. É bater CERTO.', '2: Acerte o centro do alvo 5 vezes. Aperte A quando a linha estiver no MEIO.']);
      await this.runMini();
      F.p10l2 = true; G.atkBonus = (G.atkBonus || 0) + 3;
      Sfx.levelUp();
      await W.say(['2: PERFEITO! Golpes certeiros!', '* (Você ficou mais FORTE! +3 de ATAQUE)', '2: Fale comigo para a última lição.']);
      W.saveHere(0);
      W.locked = false;
      return;
    }
    if (!F.p10l3) {
      await W.say(['2: LIÇÃO 3: A VERDADEIRA FORÇA.', '2: O inimigo mais difícil não é o Encapuzado.', '2: É VOCÊ.', '2: Olhe para o chão.']);
      const p = W.player, sh = this.ent('sombraE');
      Object.assign(sh, { hidden: false, x: p.x, y: p.y + 6 });
      Sfx.boo();
      for (let i = 0; i < 40; i++) { await nextFrame(); sh.y -= 0.4; sh.x += 0.6; }
      await W.say(['* (Sua SOMBRA se descola do chão e fica de pé na sua frente.)', '2: Vença ela. Ou aceite ela. Do jeito que você quiser.']);
      sh.hidden = true;
      W.locked = false;
      W.battle('sombra', {}, () => this.afterL3());
      return;
    }
    W.locked = false;
  },

  async afterL1() {
    const W = World, F = G.flags;
    W.locked = true;
    F.p10l1 = true; G.agi = 1;
    Sfx.levelUp();
    await W.say(['* (Você ficou mais ÁGIL! Sua alma se move mais rápido nas lutas.)', '2: Fale comigo para a LIÇÃO 2.']);
    W.saveHere(0);
    W.locked = false;
  },

  async afterL3() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true;
    F.p10l3 = true;
    await W.say([
      '2: ...Agora você entendeu.',
      '2: A sua sombra é o seu medo, os seus erros, as suas derrotas.',
      '2: E mesmo assim você continua de pé. ISSO é a verdadeira força.',
      '2: Tome. Ela é sua agora.',
    ]);
    const f = this.ent('facaE'), l = this.ent('leao');
    Object.assign(f, { hidden: false, x: l.x, y: l.y + 8 });
    for (let i = 0; i < 40; i++) { await nextFrame(); f.x += (p.x - f.x) * 0.08; f.y += (p.y - 6 - f.y) * 0.08; }
    f.hidden = true;
    G.weapon = 'Faca do Leão';
    G.maxhp += 10; G.hp = G.maxhp;
    F.p10gift = true;
    Sfx.levelUp();
    await W.say([
      '* (Você recebeu a FACA DO LEÃO! +6 de ATAQUE)',
      '* (Seu HP máximo subiu +10. HP cheio.)',
      '2: Uma faca forjada no fogo da minha arena.',
      '2: Agora vá. O Encapuzado está te esperando no SALÃO, depois do portão leste.',
      '2: E dessa vez... a batalha vai ser de VERDADE.',
    ]);
    for (let y = 18; y < 23; y++) for (let x = 49; x < 52; x++) { W.setTile(x, y, 's'); W.redrawTile(x, y); }
    Sfx.bridge();
    W.saveHere(0);
    W.locked = false;
  },

  async leave() {
    const W = World, F = G.flags;
    F.p10done = true; W.locked = true;
    await W.say(['* (A plateia grita o seu nome enquanto você sai da arena.)', '* (Você se sente mais forte do que nunca.)']);
    W.saveHere(0);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goEnd(10);
  },

  // ----- lição 2: golpe perfeito -----
  runMini() {
    return new Promise(res => { this.mini = { t: 0, x: 0, dir: 1, speed: 1.1, hits: 0, miss: 0, msg: '', flash: 0, res }; }).then(() => { this.mini = null; });
  },
  updateMini(dt) {
    const M = this.mini;
    M.t += dt; if (M.flash > 0) M.flash -= dt;
    M.x += M.dir * M.speed * dt;
    if (M.x > 1) { M.x = 1; M.dir = -1; } if (M.x < 0) { M.x = 0; M.dir = 1; }
    if (M.done || !(Input.isPressed('a') || Input.tap)) return;
    if (Math.abs(M.x - 0.5) < 0.06) { M.hits++; M.flash = 0.3; M.msg = 'PERFEITO!'; Sfx.slash(); Sfx.hit(); M.speed += 0.18; }
    else { M.miss++; M.msg = 'FORA DO CENTRO!'; Sfx.buzz(); }
    if (M.miss >= 3) { M.hits = 0; M.miss = 0; M.speed = 1.1; M.msg = 'MESTRE LEÃO: DE NOVO!'; }
    if (M.hits >= 5) { M.done = true; setTimeout(() => M.res(), 600); }
  },
  drawMini() {
    const M = this.mini;
    ctx.fillStyle = 'rgba(10,6,4,0.9)'; ctx.fillRect(0, 0, 640, 480);
    text('LIÇÃO 2: FORÇA', 320, 30, 40, '#ffc84a', 'center');
    text('Aperte A quando a linha estiver no MEIO do alvo', 320, 80, 26, '#e8d8c8', 'center');
    drawSpr(SPR.dummy, 296, 120, 3);
    if (M.flash > 0) { ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(280, 120); ctx.lineTo(360, 200); ctx.stroke(); }
    const bx = 60, bw = 520, by = 240, bh = 90;
    frameBox(bx - 8, by - 8, bw + 16, bh + 16, 4);
    ctx.strokeStyle = '#1f7a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(320, by + bh / 2, 250, 38, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#3cbf4a'; ctx.beginPath(); ctx.ellipse(320, by + bh / 2, 120, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#3cbf4a'; ctx.beginPath(); ctx.ellipse(320, by + bh / 2, 32, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(bx + M.x * bw - 5, by - 4, 10, bh + 8);
    text(`CENTROS: ${M.hits} / 5     ERROS: ${M.miss} / 3`, 320, 360, 28, '#ffe680', 'center');
    if (M.msg) text(M.msg, 320, 400, 30, M.msg === 'PERFEITO!' ? '#7aff7a' : '#ff9a9a', 'center');
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere(0);
    await W.say(['* (Os gritos da plateia te enchem de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
