// FASE 13 — A PRAIA
// No píer, uma humana de olhos vermelhos: CARMIM. Na rota genocida ela te dá parabéns;
// nas outras, vocês lutam. Ela diz que vai coletar 6 ALMAS e some. Depois, o surfista
// KAUÃ te ensina a surfar, vocês se divertem na praia e ele te dá um doce e um salgado.
'use strict';

Object.assign(ITEMS, {
  'Picolé de Coco': { heal: 35, price: 0, text: '* Você chupou o Picolé de Coco.\n* Gelado, docinho, gosto de férias.' },
  'Pastel de Praia': { heal: 45, price: 0, text: '* Você comeu o Pastel de Praia.\n* Crocante, quentinho e com muito queijo.' },
});

ENEMIES.carmim = {
  name: 'Carmim', spr: 'carmim', scale: 7, hp: 220, atk: 6, def: 3, xp: 200, gold: 0, voice: 'posh',
  boss: true, nonlethal: true, music: 'carmim', bubbleW: 220, turnLen: 6.5,
  intro: '* CARMIM sorri.\n* Os olhos dela brilham vermelhos.',
  check: '* CARMIM - ATK 6 DEF 3\n* Uma humana que caiu há muito tempo.\n* Ninguém sabe o que ela quer de verdade.',
  acts: {
    'Perguntar o nome': { text: ['* "Carmim. Bonito, né? É a cor do..."', '* Ela não termina a frase. Só sorri.'], mercy: 25 },
    'Falar dos amigos': { text: ['* Você fala do Kai, da Luna, do seu dragão...', '* "Amigos. Que fofo. Amigos não duram, sabia?"'], mercy: 30 },
    'Não ter medo': { text: ['* Você olha nos olhos vermelhos dela, sem tremer.', '* Ela pisca. Por um segundo, parece surpresa.'], mercy: 35 },
  },
  flavor: ['* Carmim gira uma faca de brinquedo. Ou não é de brinquedo?', '* O mar fica em silêncio.', '* Ela cantarola uma música que você quase reconhece.'],
  talk: ['Hehe.', 'Você é interessante.', 'Quantos amigos você tem?', 'DETERMINAÇÃO... eu também tenho.', 'Isso é divertido!'],
  spareTalk: 'Tá bom, tá bom. Você venceu.',
  defeatText: ['* Carmim cai sentada na areia...', '* ...e começa a rir.'],
  patterns: ['redSlash', 'knives', 'hearts', 'redSlash'],
  finale: ['redSlash', 'hearts', 'knives'],
};
Object.assign(PATTERNS, {
  redSlash: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT > 0) return;
      B.spawnT = 0.7;
      const s = B.soul, a = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4][(Math.random() * 4) | 0];
      B.bullets.push({ kind: 'redSlash', x: s.x, y: s.y, ang: a, vx: 0, vy: 0, warn: 0.55, life: 0.85,
        hitFn(b, q) { if (b.t < b.warn) return false; return Math.abs(-(q.x - b.x) * Math.sin(b.ang) + (q.y - b.y) * Math.cos(b.ang)) < 9; } });
    },
  },
  hearts: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT > 0) return;
      B.spawnT = 0.75;
      const bx = B.box;
      B.bullets.push({ kind: 'heartB', x: bx.x + 20 + Math.random() * (bx.w - 40), y: bx.y + 16, vx: (Math.random() < 0.5 ? -1 : 1) * (70 + Math.random() * 50), vy: 90 + Math.random() * 40, r: 7, bounce: true, life: 4 });
    },
  },
});
Object.assign(BULLET_DRAW, {
  redSlash(b, t) {
    const on = b.t >= b.warn, c = Math.cos(b.ang), s = Math.sin(b.ang);
    ctx.strokeStyle = on ? '#ff1a2a' : `rgba(255,40,60,${0.35 + Math.sin(t * 40) * 0.2})`;
    ctx.lineWidth = on ? 10 * Math.max(0, 1 - (b.t - b.warn) / 0.3) + 2 : 2;
    ctx.beginPath(); ctx.moveTo(b.x - c * 400, b.y - s * 400); ctx.lineTo(b.x + c * 400, b.y + s * 400); ctx.stroke();
  },
  heartB(b) {
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x - 3, b.y - 2, 5, 0, Math.PI * 2); ctx.arc(b.x + 3, b.y - 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff2a4a'; ctx.beginPath(); ctx.moveTo(b.x - 7, b.y); ctx.lineTo(b.x, b.y + 8); ctx.lineTo(b.x + 7, b.y); ctx.fill();
    ctx.beginPath(); ctx.arc(b.x - 3, b.y - 2, 4, 0, Math.PI * 2); ctx.arc(b.x + 3, b.y - 2, 4, 0, Math.PI * 2); ctx.fill();
  },
});

const WALK13 = 'sk';

MAPS.praia = {
  music: 'praia',
  start: { x: tx2x(4), y: ty2y(18), dir: 'right' },
  anim: 'me',

  build() {
    const MW = 80, MH = 40;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    rect(2, 8, 76, 19, 's');
    rect(0, 27, 80, 1, 'e');
    rect(0, 28, 80, 12, 'm');
    rect(60, 22, 4, 14, 'k');
    rect(78, 15, 2, 5, 's');
    return { g };
  },

  solid(c) { return !WALK13.includes(c); },

  tileImg(c, x, y, W) {
    const N = SPR.t9, h = (x * 73 + y * 151) % 3;
    if (c === 's') return N.sand[h];
    if (c === 'k') return N.wood[h];
    if (c === 'm') return N.sea[0];
    if (c === 'e') return N.shore[0];
    if (c === '#') return W.tile(x, y + 1) === 's' ? SPR.city.cliff : SPR.city.rock;
    return SPR.city.rock;
  },
  animImg(c, x, y, fr) {
    if (c === 'm') return SPR.t9.sea[(fr + x) % 3];
    if (c === 'e') return SPR.t9.shore[(fr >> 1) % 2];
    return null;
  },

  ents(W) {
    const F = G.flags;
    const palm = (id, x, y) => ({ id, x: tx2x(x), y: ty2y(y), w: 10, h: 6, solid: true, draw(sx, sy) { drawSpr(SPR.palm, sx(this.x - 16), sy(this.y - 44), 2); } });
    const umb = (id, x, y, c) => ({ id, x: tx2x(x), y: ty2y(y), w: 6, h: 4, solid: true, talk: () => W.say(['* (Um guarda-sol. A sombra é geladinha.)']),
      draw(sx, sy) { const X = sx(this.x), Y = sy(this.y); ctx.fillStyle = '#000'; ctx.fillRect(X - 2, Y - 44, 4, 44); ctx.fillStyle = '#fff'; ctx.fillRect(X - 1, Y - 44, 2, 44);
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(X - 34, Y - 34); ctx.quadraticCurveTo(X, Y - 70, X + 34, Y - 34); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(X - 12, Y - 40); ctx.quadraticCurveTo(X, Y - 60, X + 12, Y - 40); ctx.fill(); } });
    const towel = (id, x, y, c) => ({ id, x: tx2x(x), y: ty2y(y), w: 0, h: 0, solid: false, zOff: -50, draw(sx, sy) { ctx.fillStyle = c; ctx.fillRect(sx(this.x - 10), sy(this.y - 14), 40, 24); ctx.fillStyle = '#fff'; ctx.fillRect(sx(this.x - 10), sy(this.y - 6), 40, 4); } });
    return [
      { id: 'star', x: tx2x(10), y: ty2y(14), w: 12, h: 8, spr: 'star', solid: true, talk: () => P13.useStar() },
      palm('p1', 6, 11), palm('p2', 18, 10), palm('p3', 42, 10), palm('p4', 54, 11), palm('p5', 72, 10), palm('p6', 26, 24),
      umb('u1', 14, 22, '#ff5a5a'), umb('u2', 38, 23, '#5ac8ff'), umb('u3', 50, 21, '#ffe680'),
      towel('t1', 15, 23, '#ff8ac8'), towel('t2', 39, 24, '#7aff9a'),
      { id: 'quiosque', x: tx2x(31), y: ty2y(12), w: 38, h: 10, solid: true, talk: () => P13.talkKaua(),
        draw(sx, sy) { drawSpr(SPR.quiosque, sx(this.x - 20), sy(this.y - 34), 2); drawSpr(SPR.prancha, sx(this.x + 22), sy(this.y - 30), 2); } },
      { id: 'kaua', x: tx2x(29), y: ty2y(14), w: 14, h: 8, solid: true, talk: () => P13.talkKaua(),
        draw(sx, sy, t) { drawSpr(SPR.kaua, sx(this.x - 7), sy(this.y - 21) + (Math.floor(t * 2.5) % 2), 2); } },
      kidNpc('k1', 'k2', 46, 17, () => W.say(['C: O mar tá PERFEITO hoje!', 'C: O Kauã é o melhor surfista do mundo. Ele que disse.'])),
      critter('crab', 'aranha', 'soldado', 22, 25, () => W.say(['* (Um caranguejo... não, é uma aranha de férias, com óculos escuros.)', '* ARANHA: Shh. Tô pegando sol.']), { scale: 1, w: 12 }),
      { id: 'carmimE', x: tx2x(61) + 8, y: ty2y(34), w: 14, h: 8, solid: true, hidden: !!F.p13carmim, alpha: 1, talk: () => P13.meetCarmim(),
        draw(sx, sy, t) { drawSpr(SPR.carmim, sx(this.x - 7), sy(this.y - 21), 2, this.alpha); if (Math.floor(t * 0.5) % 4 === 0) { ctx.fillStyle = 'rgba(255,30,40,0.6)'; ctx.fillRect(sx(this.x - 3), sy(this.y - 15), 2, 2); ctx.fillRect(sx(this.x + 1), sy(this.y - 15), 2, 2); } } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 60, y: 25, w: 4, h: 3, when: () => F.p13arrived && !F.p13carmim && !P13.busy, run: () => P13.meetCarmim() },
      { x: 78, y: 15, w: 2, h: 5, when: () => F.p13gift && !F.p13done, run: () => P13.leave() },
    ];
  },

  setup(W) {},
  onEnter(W) { if (!G.flags.p13arrived) P13.arrive(); },
  musicAt(W) { const [x, y] = W.feetTile(); return (!G.flags.p13carmim && x >= 56 && y >= 21) ? 'carmim' : 'praia'; },
  update(W, dt) {
    if (P13.mini) { P13.updateMini(dt); return; }
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
  },
  overlay(W) {
    // sol e brilho
    ctx.fillStyle = 'rgba(255,240,200,0.08)'; ctx.fillRect(0, 0, 640, 480);
    if (P13.mini) P13.drawMini();
  },

  interactTile(W, c) {
    if (c === 'm' || c === 'e') return W.say(['* (O mar. Ondas grandes e azuis.)', G.flags.p13surf ? '* (Você já sabe surfar!)' : '* (Seria legal aprender a surfar...)']);
  },
  talkInstr() {},
};

const P13 = {
  busy: false, mini: null,
  ent(id) { return World.ents.find(e => e.id === id); },

  async arrive() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; F.p13arrived = true;
    p.x = tx2x(4); p.y = ty2y(18); p.dir = 'right'; W.trail = []; W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('praia'); Fade.to(0, 0.8);
    await wait(0.6);
    await W.say([
      '* (Areia quente. Coqueiros. O barulho das ondas.)',
      '3: UMA PRAIA!!! DEBAIXO DA TERRA!!!',
      '4: Como tem sol aqui embaixo...? Ah, deixa. Que lindo.',
      '3: Bora pro mar!',
      '4: Espera... tem alguém parado lá no fim do PÍER.',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async meetCarmim() {
    const W = World, F = G.flags, p = W.player, c = this.ent('carmimE');
    if (this.busy || F.p13carmim) return;
    this.busy = true; W.locked = true;
    await W.walk(p, [[tx2x(61) + 8, ty2y(30)]], 50);
    p.dir = 'down';
    Sfx.stopMusic();
    await wait(0.6);
    const r = route();
    await W.say([
      '* (Uma menina olha para o mar. Suéter verde com uma listra amarela. Bochechas vermelhas.)',
      '* (Ela se vira. Os olhos dela são VERMELHOS.)',
      '5: Oiê.',
      '5: Eu sou a CARMIM. Eu também caí aqui embaixo. Faz MUITO tempo.',
      '5: Eu acompanhei sua história inteirinha. O labirinto, os dragões, a ponte...',
    ]);
    if (r === 'genocida') {
      Sfx.playMusic('carmim');
      await W.say([
        '5: E olha só pra você.',
        `5: ${G.kills} monstros. ${G.kills}! Que eficiente!`,
        '5: Parabéns! De verdade! Hehehe!',
        '* (Ela bate palmas devagar.)',
        '3: ...Do que ela tá falando?',
        '4: ...',
        '5: A gente vai se dar MUITO bem, parceiro.',
      ]);
      return this.afterCarmim(null);
    }
    await W.say([
      '5: E sabe o que eu percebi?',
      '5: Você poupa. Você conversa. Você faz AMIGOS.',
      '5: ...Que sem graça.',
      '5: Vamos ver quanto tempo isso dura.',
      '3: Ei! Se for brigar com ele, vai brigar com a gente também!',
      '5: Melhor ainda. Hehehe.',
    ]);
    this.busy = false;
    W.battle('carmim', { dragon: G.dragon }, res => this.afterCarmim(res));
  },

  async afterCarmim(res) {
    const W = World, F = G.flags, c = this.ent('carmimE');
    W.locked = true;
    if (res) await W.say(res === 'spared'
      ? ['5: Hehe... tá bom. Você é mais forte do que parece.', '5: E ainda nem me machucou. Esquisito.']
      : ['5: Ai... hehe. Você bate forte.', '5: Mas eu não fico no chão por muito tempo.']);
    await W.say([
      '5: Bom. Eu tenho coisas pra fazer.',
      '5: Eu vou coletar 6 ALMAS.',
      '5: Seis almas humanas. Quando eu tiver todas... ah, você vai ver.',
      '5: Até logo, parceiro.',
    ]);
    Sfx.boo();
    for (let i = 0; i < 50; i++) { await nextFrame(); c.alpha = 1 - i / 50; }
    c.hidden = true;
    F.p13carmim = true;
    await W.say([
      '* (Carmim sumiu como se nunca tivesse estado ali.)',
      '4: ...Seis almas humanas.',
      '3: A gente é TRÊS humanos aqui, né...',
      '4: Não pensa nisso agora, Kai.',
      '3: ...Tá. Bora esquecer isso. Olha aquele quiosque de surfe!',
    ]);
    W.saveHere(0);
    this.busy = false;
    W.locked = false;
  },

  async talkKaua() {
    const W = World, F = G.flags;
    if (!F.p13carmim) return W.say(['6: E aí, brother! Bem-vindo à PRAIA DO FUNDO!', '6: Ó, tem uma mina estranha lá no píer olhando pra você faz tempo. Vai lá ver.']);
    if (F.p13gift) return W.say(['6: Volta sempre, brother! As ondas vão sentir sua falta!']);
    W.locked = true;
    if (!F.p13surf) {
      await W.say([
        '6: E aí, brother! Eu sou o KAUÃ, o rei das ondas!',
        '6: Tá com uma cara de quem precisa relaxar. Bora SURFAR?',
        '6: É fácil: mova pra CIMA e pra BAIXO e fique sempre na CRISTA da onda (a espuma branca).',
        '6: Desvie das gaivotas! Encha a barra de ESTILO até o fim!',
      ]);
      await this.runMini();
      F.p13surf = true;
      Sfx.levelUp();
      await W.say(['6: IRADO!!! Você nasceu pra isso, brother!', '3: EU QUERO TENTAR!!!', '4: Kai, você caiu da prancha onze vezes...']);
      // diversão na praia
      await Fade.to(1, 1.5);
      Sfx.playMusic('praia');
      await Dialog.show([
        { t: '* (O resto da tarde foi só diversão.)' },
        { t: '* (Vocês construíram um castelo de areia GIGANTE. O Kai chamou de "Fortaleza Kai".)' },
        { t: '* (Jogaram vôlei de praia contra os pinguins. Os pinguins ganharam.)' },
        { t: '* (A Luna achou uma concha que brilha. Ela deu pra você.)' },
        { t: '* (Vocês viram o pôr do sol subterrâneo, sentados na areia.)' },
        { t: '* (Por um tempo, você esqueceu de tudo: da ponte, do Encapuzado, da Carmim.)' },
      ], true);
      await Fade.to(0, 1.5);
    }
    await W.say([
      '6: Ei, antes de vocês irem, toma aqui!',
      '6: Um DOCE e um SALGADO, direto do meu quiosque!',
    ]);
    G.items.push('Picolé de Coco', 'Pastel de Praia');
    F.p13gift = true;
    Sfx.save();
    await W.say(['* (Você recebeu PICOLÉ DE COCO e PASTEL DE PRAIA!)', '* (Eles recuperam bastante HP quando você comer.)', '6: A saída é pelo LESTE. Aloha, brother!']);
    W.saveHere(0);
    W.locked = false;
  },

  async leave() {
    const W = World, F = G.flags;
    F.p13done = true; W.locked = true;
    await W.say(['4: Que dia bom.', '3: O melhor dia da minha vida embaixo da terra!', '* (Uma trilha entre os coqueiros leva até uma casinha.)']);
    W.saveHere(0);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goEnd(13);
  },

  // ----- minijogo do surfe -----
  runMini() {
    Sfx.playMusic('surf');
    return new Promise(res => { this.mini = { t: 0, y: 240, style: 0, birds: [], spawnT: 1.5, flash: 0, msg: '', res }; }).then(() => { this.mini = null; Sfx.playMusic('praia'); });
  },
  crest(M, x) { return 250 + Math.sin(x * 0.011 - M.t * 2.1) * 70 + Math.sin(x * 0.03 + M.t) * 10; },
  updateMini(dt) {
    const M = this.mini;
    M.t += dt; if (M.flash > 0) M.flash -= dt;
    const v = moveVector();
    M.y = Math.max(120, Math.min(420, M.y + v.y * 220 * dt));
    if (Input.drag.active) M.y = Math.max(120, Math.min(420, M.y + Input.drag.dy * 1.2));
    const c = this.crest(M, 170), on = Math.abs(M.y - c) < 28;
    M.on = on;
    if (on) M.style = Math.min(100, M.style + 9 * dt);
    else M.style = Math.max(0, M.style - 3 * dt);
    M.spawnT -= dt;
    if (M.spawnT <= 0) { M.spawnT = 1.4 + Math.random(); M.birds.push({ x: 700, y: 140 + Math.random() * 260 }); }
    for (const b of M.birds) {
      b.x -= 220 * dt;
      if (!b.hit && Math.abs(b.x - 170) < 24 && Math.abs(b.y - M.y) < 22) { b.hit = true; M.style = Math.max(0, M.style - 12); M.flash = 0.4; M.msg = 'GAIVOTA!'; Sfx.hurt(); }
    }
    M.birds = M.birds.filter(b => b.x > -40);
    if (M.style >= 100 && !M.done) { M.done = true; M.msg = 'ESTILO MÁXIMO!'; Sfx.levelUp(); setTimeout(() => M.res(), 900); }
  },
  drawMini() {
    const M = this.mini, t = M.t;
    const sky = ctx.createLinearGradient(0, 0, 0, 480);
    sky.addColorStop(0, '#5ac8ff'); sky.addColorStop(0.6, '#ffe8b0'); sky.addColorStop(1, '#ff9a6a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(520, 80, 40, 0, Math.PI * 2); ctx.fill();
    // onda
    ctx.fillStyle = '#2a7ad8'; ctx.beginPath(); ctx.moveTo(0, 480);
    for (let x = 0; x <= 640; x += 10) ctx.lineTo(x, this.crest(M, x));
    ctx.lineTo(640, 480); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.beginPath();
    for (let x = 0; x <= 640; x += 10) { const y = this.crest(M, x); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 20; i++) ctx.fillRect((i * 67 + t * 120) % 640, this.crest(M, (i * 67 + t * 120) % 640) + 20 + (i % 4) * 30, 18, 3);
    // gaivotas
    for (const b of M.birds) { ctx.strokeStyle = b.hit ? '#888' : '#fff'; ctx.lineWidth = 3; ctx.beginPath(); const w = Math.sin(t * 12 + b.y) * 6; ctx.moveTo(b.x - 14, b.y - w); ctx.lineTo(b.x, b.y); ctx.lineTo(b.x + 14, b.y - w); ctx.stroke(); }
    // você na prancha
    const y = M.y, tilt = Math.sin(t * 6) * 0.1;
    ctx.save(); ctx.translate(170, y); ctx.rotate(Math.PI / 2 + tilt);
    ctx.drawImage(SPR.prancha, -15, -45, 30, 90);
    ctx.restore();
    if (!M.flash || Math.floor(M.flash * 20) % 2) drawSpr(SPR.player.right[0], 170 - 21, y - 66, 3);
    if (M.on) for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(130 - i * 10 - (t * 200 % 10), y + 6 + Math.sin(i + t * 9) * 4, 6, 3); }
    // barra de estilo
    frameBox(120, 14, 400, 34, 4);
    ctx.fillStyle = '#333'; ctx.fillRect(130, 22, 380, 18);
    ctx.fillStyle = M.on ? '#7aff9a' : '#ffe680'; ctx.fillRect(130, 22, 380 * M.style / 100, 18);
    text('ESTILO', 320, 52, 24, '#000', 'center');
    text(M.on ? 'NA CRISTA!' : 'Volte para a CRISTA da onda!', 320, 440, 28, M.on ? '#ffffff' : '#ffe680', 'center');
    if (M.msg && M.flash > 0) text(M.msg, 320, 400, 30, '#ff5a5a', 'center');
    if (M.done) text('ESTILO MÁXIMO!', 320, 200, 44, '#ffffff', 'center');
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere(0);
    await W.say(['* (O som das ondas te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
