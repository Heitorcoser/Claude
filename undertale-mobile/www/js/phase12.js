// FASE 12 — O HOSPITAL E A VILA DAS ESPÉCIES
// Depois da batalha, você acorda num hospital. Lá fora, uma vila onde moram várias
// espécies. Lá você conhece KAI e LUNA, dois humanos que entram no seu grupo para o
// resto da jornada (eles seguem você e ajudam nas batalhas).
'use strict';

const WALK12 = ',bh';
const DOORS12 = { '11,13': { x: 15, y: 60, dir: 'up' }, '15,62': { x: 11, y: 14, dir: 'down' } };

MAPS.vila = {
  music: 'hospital',
  start: { x: tx2x(7), y: ty2y(55), dir: 'down' },
  anim: 'w',

  build() {
    const MW = 70, MH = 66;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    const house = (x, y, w, h, doorX, wall = 'H') => {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) g[y + j][x + i] = j < h - 3 ? 'R' : wall;
      g[y + h - 2][x + 1] = 'W'; g[y + h - 2][x + w - 2] = 'W';
      g[y + h - 1][doorX] = 'D';
    };
    // vila
    rect(2, 4, 64, 32, ',');
    rect(2, 20, 66, 3, 'b'); rect(11, 14, 1, 6, 'b'); rect(35, 12, 3, 8, 'b'); rect(35, 23, 3, 8, 'b');
    house(6, 6, 11, 8, 11, 'Q');
    house(20, 8, 8, 7, 23); house(42, 7, 8, 7, 45); house(53, 8, 9, 7, 57);
    house(20, 26, 8, 7, 23); house(44, 26, 8, 7, 47);
    rect(34, 15, 5, 4, 'o'); rect(35, 16, 3, 2, 'w');
    for (const [x, y] of [[3, 5], [18, 5], [30, 6], [40, 5], [63, 6], [4, 30], [16, 33], [32, 33], [40, 32], [58, 33], [63, 27], [30, 26]]) g[y][x] = 'T';
    // hospital por dentro
    rect(4, 52, 24, 10, 'h');
    g[62][15] = 'X';
    return { g };
  },

  solid(c) { return !WALK12.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.city, N = SPR.t9, h = (x * 73 + y * 151) % 3;
    if (c === ',') return T.grass[h];
    if (c === 'b') return T.dirt[h];
    if (c === 'h') return N.hosp[(x + y) % 2];
    if (c === 'X') return SPR.futT.doorIn;
    if (c === 'T') return MAPS.dragoncity.layer(T.grass[h], T.tree);
    if (c === 'R') return T.roof; if (c === 'H') return T.wallH; if (c === 'W') return T.window; if (c === 'D') return T.door;
    if (c === 'Q') return N.hospWall;
    if (c === 'o') return T.rim; if (c === 'w') return T.water[0];
    if (c === '#') {
      if (y >= 46) return 'hX'.includes(W.tile(x, y + 1)) ? N.hospWall : SPR.deepT.void;
      return WALK12.includes(W.tile(x, y + 1)) ? T.cliff : T.rock;
    }
    return T.rock;
  },
  animImg(c, x, y, fr) { return c === 'w' ? SPR.city.water[(fr + x + y) % 3] : null; },

  ents(W) {
    const F = G.flags, joined = !!F.p12joined;
    const npc = (id, spr, x, y, talk, sc = 2) => ({ id, x: tx2x(x), y: ty2y(y), w: 16, h: 8, solid: true, talk,
      draw(sx, sy, t) { const img = typeof spr === 'function' ? spr(t) : SPR[spr]; drawSpr(img, sx(this.x - img.width * sc / 4), sy(this.y - img.height * sc / 2) + Math.round(Math.sin(t * 2 + this.x) * 1), sc); } });
    const bed = (id, x) => ({ id, x: tx2x(x), y: ty2y(54) + 6, w: 18, h: 26, solid: true, talk: () => W.say(['* (Uma cama de hospital, branquinha e cheirosa.)']),
      draw(sx, sy) { drawSpr(SPR.cama, sx(this.x - 10), sy(this.y - 30), 2); } });
    const d = dragonEnt9(); Object.assign(d, { x: tx2x(5), y: ty2y(17), sleep: true, flap: 0 });
    return [
      bed('b1', 7), bed('b2', 12), bed('b3', 19), bed('b4', 24),
      npc('pena', 'pena', 15, 57, () => P12.talkPena()),
      npc('pac', 'pinguimNpc', 21, 59, () => W.say(['* PINGUIM: Eu escorreguei no gelo. De novo.', '* PINGUIM: Pelo menos aqui tem gelatina.'])),
      { id: 'cruz', x: tx2x(11), y: ty2y(6), w: 0, h: 0, solid: false, zOff: -100, draw(sx, sy) {
        const x = sx(this.x), y = sy(this.y - 8); ctx.fillStyle = '#fff'; ctx.fillRect(x - 14, y - 14, 28, 28); ctx.fillStyle = '#e0303a'; ctx.fillRect(x - 4, y - 11, 8, 22); ctx.fillRect(x - 11, y - 4, 22, 8); } },
      d,
      { id: 'sign', x: tx2x(30), y: ty2y(19), w: 14, h: 6, spr: 'sign', solid: true, talk: () => W.say(['* (VILA DAS ESPÉCIES)', "* 'Aranhas, esqueletos, robôs, pinguins, fantasmas, golens, humanos... TODO MUNDO é bem-vindo.'"]) },
      critter('ar', 'aranha', 'vila', 26, 18, () => W.say(['* ARANHA: Eu teço cachecóis pros pinguins.', '* ARANHA: Eles pagam com peixe. ...Eu não como peixe.'])),
      critter('es', 'esqueleto', 'civil', 41, 18, () => W.say(['* ESQUELETO: Eu sou o carteiro da vila!', '* ESQUELETO: Ninguém nunca me pergunta se eu tô com frio. Valeu por não perguntar.']), { w: 14 }),
      npc('gol', 'golemLava', 30, 29, () => W.say(['* GOLEM: GRRM. EU ESQUENTO A ÁGUA DO BANHO DA VILA INTEIRA.'])),
      robotNpc('rob', 'verde', 50, 18, () => W.say(['* ROBÔ: BIP. Eu conserto relógios. E corações partidos. Brincadeira: só relógios.'])),
      npc('fan', 'fantasminha', 56, 25, () => W.say(['* FANTASMINHA: ...oi.', '* FANTASMINHA: ...eu gosto daqui. ninguém se assusta comigo.'])),
      npc('pin', 'pinguimNpc', 16, 24, () => W.say(['* PINGUIM: Você é o humano que lutou com o ENCAPUZADO?!', '* PINGUIM: Dois humanos ali no leste estavam falando de você!'])),
      kidNpc('crianca', 'k1', 48, 31, () => W.say(['C: Lá no leste tem dois humanos! O menino tem um TACO e a menina faz MÁGICA!'])),
      // Kai e Luna (antes de entrarem no grupo)
      { id: 'kaiE', x: tx2x(58), y: ty2y(18), w: 14, h: 8, solid: true, hidden: joined, talk: () => P12.meetHumans(),
        draw(sx, sy, t) { drawSpr(SPR.party.kai, sx(this.x - 7), sy(this.y - 21) + (Math.floor(t * 3) % 2), 2); ctx.fillStyle = '#c8a46a'; ctx.fillRect(sx(this.x + 6), sy(this.y - 16), 3, 18); } },
      { id: 'lunaE', x: tx2x(61), y: ty2y(17), w: 14, h: 8, solid: true, hidden: joined, talk: () => P12.meetHumans(),
        draw(sx, sy, t) { drawSpr(SPR.party.lunaL, sx(this.x - 7), sy(this.y - 21) + Math.sin(t * 2) * 1, 2); } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 52, y: 14, w: 3, h: 12, when: () => F.p12out && !F.p12joined && !P12.busy, run: () => P12.meetHumans() },
      { x: 66, y: 20, w: 2, h: 3, when: () => F.p12joined && !F.p12done, run: () => P12.leave() },
    ];
  },

  setup(W) {},
  onEnter(W) { if (!G.flags.p12arrived) P12.wake(); },
  musicAt(W) { return W.player.y > 46 * TS ? 'hospital' : 'vila12'; },
  update(W) {
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
  },

  interactTile(W, c, tx, ty) {
    const d = DOORS12[tx + ',' + ty];
    if (d) return P12.door(d);
    if (c === 'D') return W.say(['* (Toc toc.)', '* "Tá aberto não! Volta mais tarde!"']);
    if (c === 'o' || c === 'w') return W.say(['* (Um poço. Lá no fundo, alguém deixou um bilhete: "OI".)']);
  },
  talkInstr() {},
};

const P12 = {
  busy: false,
  ent(id) { return World.ents.find(e => e.id === id); },

  async wake() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; F.p12arrived = true;
    p.x = tx2x(7); p.y = ty2y(54) + 2; p.lying = true;
    W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('hospital'); Fade.to(0, 0.5);
    await wait(1.2);
    await W.say(['* (...)', '* (Bip... bip... bip...)', '* (Você abre os olhos. Uma luz branca. Cheiro de remédio.)']);
    p.lying = false; Sfx.move();
    p.y = ty2y(56);
    const pe = this.ent('pena');
    await W.walk(pe, [[tx2x(10), ty2y(56)]], 50);
    await W.say([
      '7: Ah, acordou! Que bom, que bom!',
      '7: Eu sou a DOUTORA PENA. Você está no hospital da Vila das Espécies.',
      '7: Seu dragão te trouxe voando, desmaiado, todo machucado.',
      '7: Que luta foi ESSA, hein? Você estava cheio de arranhões de osso!',
      '7: Mas agora está tudo bem. Eu cuidei de tudo.',
    ]);
    G.hp = G.maxhp; Sfx.heal();
    await W.say(['* (Seu HP foi totalmente recuperado.)', '7: Quando quiser, a saída é a porta de baixo. Seu dragão está dormindo lá fora.']);
    W.saveHere(0);
    W.locked = false;
  },

  talkPena() {
    const W = World;
    if (G.flags.p12out) return W.say(['7: Se machucar de novo, volte aqui! E coma direitinho!']);
    G.hp = G.maxhp;
    return W.say(['7: Descanse quando precisar. Aqui é seguro.', '* (HP cheio.)']);
  },

  async door(d) {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; Sfx.select();
    await Fade.to(1, 3);
    p.x = tx2x(d.x); p.y = ty2y(d.y); p.dir = d.dir; W.trail = [];
    W.updateCam(true);
    await Fade.to(0, 3);
    if (!F.p12out && d.y < 46) {
      F.p12out = true;
      await W.say(['* (Lá fora, uma vila colorida.)', '* (Aranhas, esqueletos, robôs, pinguins, fantasmas, golens... todo mundo junto, vivendo em paz.)', '* (Dizem que tem dois HUMANOS morando no leste da vila.)']);
      W.saveHere(0);
    }
    W.locked = false;
  },

  async meetHumans() {
    const W = World, F = G.flags, p = W.player;
    if (this.busy || F.p12joined) return;
    this.busy = true; W.locked = true;
    await W.walk(p, [[tx2x(55), ty2y(18)]], 60);
    p.dir = 'right';
    Sfx.playMusic('vila12');
    await W.say([
      '3: EI! Você! Cabelo marrom, cara de quem apanhou muito...',
      '3: É VOCÊ! O humano que lutou com o ENCAPUZADO!',
      '4: Kai, calma. Você vai assustar.',
      '4: Oi. Eu sou a LUNA. E esse barulhento é o KAI.',
      '3: A gente também caiu aqui embaixo. Faz tempo já.',
      '4: Eu aprendi magia de cura com um velhinho de chapéu roxo. Ele se chamava... INSTRUTOR.',
      '* (Você conta que conhece o Instrutor. A Luna arregala os olhos.)',
      '4: Ele falava de um humano que ia mudar tudo. Acho que era você.',
      '3: Olha, a gente ouviu falar de tudo: o labirinto, os dragões, a ilha, a guerra, a ponte...',
      '3: Você passou por tudo isso SOZINHO?!',
      '3: Não mais.',
      '4: A gente vai com você. Pra onde for.',
      '3: Pro resto da vida, se precisar!',
    ]);
    F.p12joined = true;
    G.party = ['kai', 'luna'];
    for (const id of ['kaiE', 'lunaE']) this.ent(id).hidden = true;
    W.trail = [];
    Sfx.levelUp();
    await W.say([
      '* (KAI e LUNA entraram no seu grupo!)',
      '* (Nas batalhas, use AGIR:)',
      '* (KAI: GOLPE — ataca com o taco.)',
      '* (LUNA: CURA — recupera seu HP. LUNA: ACALMAR — ajuda a poupar.)',
      '* (KAI+LUNA: COMBO — um golpe muito forte.)',
      '3: Bora! A saída da vila é pelo LESTE.',
    ]);
    W.saveHere(0);
    this.busy = false;
    W.locked = false;
  },

  async leave() {
    const W = World, F = G.flags;
    F.p12done = true; W.locked = true;
    await W.say(['4: Tchau, vila. A gente volta um dia.', '3: Ouvi dizer que depois daqui tem uma PRAIA! Bora!']);
    W.saveHere(0);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goEnd(12);
  },
};
