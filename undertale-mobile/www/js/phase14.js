// FASE 14 — A CASA
// Uma casinha no fim da trilha da praia. O grupo fica lá por um tempo. No porão,
// uma PORTA GIGANTE. Do outro lado, uma estrada de neve... e os créditos do Capítulo 1.
'use strict';

const WALK14 = ',frzn';
const DOORS14 = { '16,37': { x: 16, y: 12, dir: 'up' }, '16,14': { x: 16, y: 38, dir: 'down' } };

MAPS.casa = {
  music: 'house',
  start: { x: tx2x(16), y: ty2y(42), dir: 'up' },
  anim: '',

  build() {
    const MW = 60, MH = 76;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    // lado de fora
    rect(4, 38, 26, 8, ',');
    for (let j = 0; j < 8; j++) for (let i = 0; i < 16; i++) g[30 + j][8 + i] = j < 5 ? 'R' : 'H';
    g[36][10] = 'W'; g[36][21] = 'W'; g[37][16] = 'D';
    for (const [x, y] of [[5, 39], [27, 39], [6, 44], [26, 44]]) g[y][x] = 'T';
    // dentro
    rect(4, 3, 24, 11, 'f');
    rect(12, 7, 6, 4, 'r');
    g[14][16] = 'X';
    g[4][25] = 'v';
    // porão
    rect(4, 60, 26, 9, 'z');
    g[68][26] = 'u';
    // estrada de neve
    rect(40, 2, 8, 46, 'n');
    for (let y = 3; y < 47; y += 3) { g[y][39] = 'P'; g[y + 1][48] = 'P'; }
    return { g };
  },

  solid(c) { return !WALK14.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.city, N = SPR.t9, S = SPR.snowT, h = (x * 73 + y * 151) % 3;
    if (c === ',') return T.grass[h];
    if (c === 'f') return N.wood[h];
    if (c === 'r') return N.rug;
    if (c === 'z') return N.basement[h];
    if (c === 'n') return S.snow[h] || S.snow;
    if (c === 'P') return MAPS.dragoncity.layer(S.snow[h] || S.snow, S.pine);
    if (c === 'v' || c === 'u') return N.stairs;
    if (c === 'X') return SPR.futT.doorIn;
    if (c === 'T') return MAPS.dragoncity.layer(T.grass[h], T.tree);
    if (c === 'R') return T.roof; if (c === 'H') return T.wallH; if (c === 'W') return T.window; if (c === 'D') return T.door;
    if (c === '#') {
      const b = W.tile(x, y + 1);
      if (y < 16) return 'frXv'.includes(b) ? N.houseWall : SPR.deepT.void;
      if (y >= 56) return 'zu'.includes(b) ? N.basementWall : SPR.deepT.void;
      if (x >= 36) return 'nP'.includes(b) ? S.rock || T.rock : SPR.deepT.void;
      return b === ',' ? T.cliff : T.rock;
    }
    return T.rock;
  },

  ents(W) {
    const F = G.flags;
    const bed = (id, x, y) => ({ id, x: tx2x(x), y: ty2y(y) + 6, w: 18, h: 26, solid: true, talk: () => P14.bed(),
      draw(sx, sy) { drawSpr(SPR.cama, sx(this.x - 10), sy(this.y - 30), 2); } });
    return [
      { id: 'star', x: tx2x(22), y: ty2y(41), w: 12, h: 8, spr: 'star', solid: true, talk: () => P14.useStar() },
      { id: 'bilhete', x: tx2x(18), y: ty2y(38), w: 12, h: 6, spr: 'sign', solid: true, talk: () => W.say(['* (Um bilhete pregado numa placa:)', "* 'Para os viajantes: fiquem o tempo que precisarem. A casa é de vocês.'"]) },
      bed('b1', 5, 10), bed('b2', 8, 10), bed('b3', 11, 10),
      { id: 'mesa', x: tx2x(21), y: ty2y(9), w: 30, h: 10, solid: true, talk: () => P14.dinner(), draw(sx, sy) { drawSpr(SPR.mesa, sx(this.x - 16), sy(this.y - 22), 2); } },
      { id: 'lareira', x: tx2x(8), y: ty2y(4), w: 30, h: 8, solid: true, talk: () => W.say(['* (Uma lareira quentinha. O fogo estala.)']),
        draw(sx, sy, t) { drawSpr(SPR.forja, sx(this.x - 16), sy(this.y - 26), 2); drawFlame(sx(this.x), sy(this.y - 10), 10, t * 10); } },
      { id: 'porta', x: tx2x(17), y: ty2y(61) + 2, w: 64, h: 12, solid: true, talk: () => P14.bigDoor(),
        draw(sx, sy, t) {
          drawSpr(SPR.portaGigante, sx(this.x - 32), sy(this.y - 80), 2);
          if (G.flags.p14open) { ctx.fillStyle = `rgba(230,245,255,${0.6 + Math.sin(t * 3) * 0.2})`; ctx.fillRect(sx(this.x - 22), sy(this.y - 70), 88, 140); }
        } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [{ x: 40, y: 2, w: 8, h: 4, when: () => F.p14road && !F.p14done, run: () => P14.credits() }];
  },

  setup(W) {},
  onEnter(W) { if (!G.flags.p14arrived) P14.arrive(); },
  musicAt(W) { const p = W.player; return p.x > 36 * TS ? 'colonia' : p.y > 56 * TS ? 'encontro' : 'house'; },
  update(W) {
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
  },
  overlay(W, sx, sy) {
    const t = W.t, p = W.player;
    if (p.x > 36 * TS) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 50; i++) ctx.fillRect(((i * 97 + Math.sin(t + i) * 20 + t * 20) % 680) - 20, (i * 61 + t * 40) % 480, 3, 3);
      ctx.fillStyle = 'rgba(220,235,255,0.15)'; ctx.fillRect(0, 0, 640, 480);
    } else if (p.y > 28 * TS && p.y < 50 * TS) { ctx.fillStyle = 'rgba(60,30,80,0.3)'; ctx.fillRect(0, 0, 640, 480); }
  },

  interactTile(W, c, tx, ty) {
    const d = DOORS14[tx + ',' + ty];
    if (d) return P14.teleport(d);
    if (c === 'v') return P14.stairsDown();
    if (c === 'u') return P14.teleport({ x: 25, y: 5, dir: 'down' });
    if (c === 'W') return W.say(['* (A luz de dentro é amarelinha e quente.)']);
  },
  talkInstr() {},
};

const P14 = {
  ent(id) { return World.ents.find(e => e.id === id); },

  async arrive() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; F.p14arrived = true;
    p.x = tx2x(16); p.y = ty2y(44); p.dir = 'up'; W.trail = []; W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('house'); Fade.to(0, 0.8);
    await wait(0.6);
    await W.say([
      '* (No fim da trilha, uma casinha com a luz acesa.)',
      '* (Ninguém em casa. Só um bilhete na porta.)',
      '4: Que aconchegante...',
      '3: Será que tem comida?!',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async teleport(d) {
    const W = World, p = W.player;
    W.locked = true; Sfx.select();
    await Fade.to(1, 3);
    p.x = tx2x(d.x); p.y = ty2y(d.y); p.dir = d.dir; W.trail = [];
    W.updateCam(true);
    await Fade.to(0, 3);
    W.locked = false;
  },

  async dinner() {
    const W = World, F = G.flags;
    if (F.p14dinner) return W.say(['* (A mesa ainda tem cheiro de sopa.)']);
    W.locked = true;
    await Fade.to(1, 1.5);
    F.p14dinner = true;
    await Dialog.show([
      { t: '* (Vocês fazem a janta juntos.)' },
      { t: '* (O Kai queimou o arroz. A Luna salvou a sopa com magia.)', who: null },
      { t: '* (Vocês comem rindo, contando histórias de antes de cair aqui embaixo.)' },
    ], true);
    G.hp = G.maxhp;
    await Fade.to(0, 1.5);
    await W.say(['4: Que tal a gente dormir aqui hoje?', '3: Hoje, amanhã, depois de amanhã...', '* (As camas ficam no canto da sala.)']);
    W.locked = false;
  },

  async bed() {
    const W = World, F = G.flags;
    if (!F.p14dinner) return W.say(['* (Uma cama macia. Mas sua barriga está roncando. Janta primeiro!)']);
    if (F.p14slept) return W.say(['* (A cama ainda está quentinha.)']);
    W.locked = true;
    await Fade.to(1, 1);
    Sfx.stopMusic();
    F.p14slept = true;
    await Dialog.show([
      { t: '* (Vocês dormem.)' },
      { t: '* (Um dia vira dois. Dois viram uma semana.)' },
      { t: '* (Vocês arrumam a casa, pescam na praia, o Kai ensina a Luna a jogar taco, a Luna ensina o Kai a ler.)' },
      { t: '* (Pela primeira vez, aquilo parece um LAR.)' },
      { t: '* (Até que, numa noite...)' },
    ], true);
    W.shake = 1; Sfx.knock();
    await wait(0.8); Sfx.knock(); W.shake = 1;
    await Fade.to(0, 1);
    await W.say(['* (TUM... TUM...)', '* (O barulho vem de baixo. Do PORÃO.)', '3: ...Vocês ouviram isso?', '4: A escada do porão fica no canto da sala.']);
    W.saveHere(0);
    W.locked = false;
  },

  async stairsDown() {
    const W = World, F = G.flags;
    if (!F.p14slept) return W.say(['* (Uma escada pro porão. Está escuro lá embaixo.)', '* (Melhor ver isso depois.)']);
    await this.teleport({ x: 25, y: 66, dir: 'up' });
    if (!F.p14basement) {
      F.p14basement = true;
      W.locked = true;
      await W.say([
        '* (O porão é frio e escuro.)',
        '* (Na parede do fundo, uma PORTA GIGANTE de pedra.)',
        '* (Nela, um símbolo: um coração com asas.)',
        '4: Eu já vi esse símbolo... nos livros do Instrutor.',
        '3: Tá saindo um vento GELADO por baixo dela.',
      ]);
      W.locked = false;
    }
  },

  async bigDoor() {
    const W = World, F = G.flags, p = W.player;
    if (F.p14road) return;
    W.locked = true;
    if (!F.p14open) {
      const r = await W.ask('* (Abrir a porta gigante?)', ['Abrir', 'Ainda não']);
      if (r !== 0) { W.locked = false; return; }
      Sfx.rumble(); W.shake = 1.5;
      await W.say(['* (Você empurra a porta com toda a força.)', '* (Kai e Luna empurram junto.)', '* (A porta range... e abre.)']);
      F.p14open = true;
      Sfx.wind();
      await W.say(['* (Do outro lado, uma luz branca. E neve. Muita neve.)', '3: ...Bora?', '4: Juntos.']);
    }
    await W.walk(p, [[this.ent('porta').x, p.y - 8]], 40);
    await Fade.to(1, 1, '#ffffff');
    p.x = tx2x(44); p.y = ty2y(45); p.dir = 'up'; W.trail = [];
    F.p14road = true;
    W.updateCam(true);
    Sfx.playMusic('colonia');
    await Fade.to(0, 1, '#ffffff');
    await W.say(['* (Uma estrada de neve, no meio de um bosque de pinheiros.)', '* (A porta sumiu atrás de vocês.)', '4: Que frio...', '3: Que LINDO!', '* (Sigam a estrada.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async credits() {
    const W = World, F = G.flags;
    F.p14done = true; W.locked = true;
    await W.say([
      '* (Vocês caminham pela neve por um bom tempo.)',
      '* (Kai e Luna do seu lado. Seu dragão voando lá em cima.)',
      '* (Você não sabe o que vem pela frente.)',
      '* (Mas você não está mais PERDIDO.)',
    ]);
    F.ch1done = true;
    W.saveHere(0);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goCredits();
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere(0);
    await W.say(['* (Uma casinha com luz acesa. Isso te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
