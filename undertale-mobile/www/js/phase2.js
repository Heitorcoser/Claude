// FASE 2 — DRAGONCITY, a cidade dos dragões
'use strict';

const WALKABLE2 = '.s,ab';

function npcDragon(id, pal, tx, ty, talk, opts = {}) {
  return {
    id, x: tx2x(tx), y: ty2y(ty), w: 22, h: 10, solid: true, talk, pal, dir: opts.dir || 'left',
    scale: opts.scale || 2, hidden: !!opts.hidden, flap: opts.flap ?? 0.5,
    draw(sx, sy, t) {
      const set = SPR.dragon[this.pal], img = set[this.dir][Math.floor(t * 4 * this.flap + this.x) % 2];
      const s = this.scale, bob = Math.sin(t * 2 + this.x) * 1;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(sx(this.x), sy(this.y), 9 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
      drawSpr(img, sx(this.x - img.width * s / 4), sy(this.y - img.height * s / 2 + bob - (this.lift || 0)), s, this.alpha ?? 1);
    },
  };
}

function ghostEnt(kind, tx, ty) {
  return {
    id: kind + 'G', kind, x: tx2x(tx), y: ty2y(ty), w: 20, h: 8, solid: false, hidden: true, alpha: 1, flip: false,
    draw(sx, sy, t) {
      ctx.fillStyle = `rgba(0,0,0,${0.25 * this.alpha})`; ctx.beginPath(); ctx.ellipse(sx(this.x), sy(this.y), 16, 5, 0, 0, Math.PI * 2); ctx.fill();
      drawGhost(this.kind, sx(this.x - 14), sy(this.y - 34 + Math.sin(t * 2.5) * 2), 2, t, this.alpha, this.flip);
    },
  };
}

function lampEnt(tx, ty) {
  return { id: 'lamp', x: tx2x(tx), y: ty2y(ty), w: 6, h: 4, solid: true, spr: 'lamp',
    draw(sx, sy, t) {
      ctx.fillStyle = `rgba(255,210,110,${0.12 + Math.sin(t * 3 + this.x) * 0.03})`;
      ctx.beginPath(); ctx.arc(sx(this.x), sy(this.y - 30), 34, 0, Math.PI * 2); ctx.fill();
      drawSpr(SPR.lamp, sx(this.x - 5), sy(this.y - 34), 2);
    } };
}

const STATUE_ORDER = ['preto', 'branco', 'laranja'];

MAPS.dragoncity = {
  music: 'dragoncity',
  start: { x: tx2x(3), y: ty2y(22), dir: 'right' },
  anim: 'Lwq',

  build() {
    const MW = 100, MH = 46;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    const house = (x, y, w, h, doorX, old) => {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        g[y + j][x + i] = j < h - 2 ? (old ? 'r' : 'R') : (old ? 'h' : 'H');
      }
      if (!old && w >= 5) { g[y + h - 2][x + 1] = 'W'; g[y + h - 2][x + w - 2] = 'W'; }
      g[y + h - 1][doorX] = old ? 'X' : 'D';
    };
    // entrada (vinda do labirinto)
    rect(1, 19, 13, 7, ',');
    rect(1, 21, 13, 3, 's');
    g[20][13] = 'P'; g[24][13] = 'P';
    for (const [x, y] of [[3, 19], [7, 25], [10, 19], [5, 25]]) g[y][x] = 'T';
    // praça
    rect(14, 8, 32, 30, '.');
    rect(14, 34, 32, 4, ',');
    for (let x = 15; x < 45; x += 3) if (x !== 15 && x !== 44) g[37][x] = 'T';
    rect(27, 20, 6, 6, 'o'); rect(28, 21, 4, 4, 'w');
    house(15, 1, 8, 7, 18); house(24, 3, 7, 5, 27); house(34, 1, 10, 7, 38);
    // rua do mercado
    rect(46, 18, 22, 8, '.');
    house(47, 11, 8, 7, 50); house(57, 10, 9, 8, 61);
    rect(46, 26, 22, 1, 'f');
    // Bosque das Cinzas
    rect(68, 3, 14, 40, 'a');
    for (let x = 68; x <= 81; x++) {
      if (x !== 76 && x !== 77) g[9][x] = 'T';
      if (x !== 69 && x !== 70) g[15][x] = 'T';
      if (x !== 78 && x !== 79) g[29][x] = 'T';
      if (x !== 71 && x !== 72) g[35][x] = 'T';
    }
    for (const [x, y] of [[70, 17], [74, 25], [75, 17], [78, 26], [80, 18], [71, 27], [69, 24], [72, 5], [79, 6], [70, 12], [80, 12],
      [74, 32], [69, 31], [80, 33], [73, 38], [76, 41], [69, 40], [77, 4]]) g[y][x] = 'T';
    // rio de lava e ponte
    rect(82, 0, 4, 46, 'L');
    rect(82, 22, 4, 2, 'q');
    // outro lado do rio
    rect(86, 6, 12, 34, ',');
    rect(86, 22, 6, 2, 's'); rect(90, 14, 2, 9, 's');
    house(89, 10, 5, 4, 91, true);
    for (const [x, y] of [[87, 8], [95, 9], [96, 15], [87, 30], [94, 33], [88, 37], [96, 27], [93, 18]]) g[y][x] = 'T';
    return { g };
  },

  solid(c) {
    if (c === 'q') return !G.flags.bridge;
    return !WALKABLE2.includes(c);
  },

  tileImg(c, x, y, W) {
    const T = SPR.city, h = (x * 73 + y * 151) % 3;
    const under = { '.': T.cobble[h], s: T.dirt[h], ',': T.grass[h], a: T.ash[h] };
    if (under[c]) return under[c];
    if (c === '#') { const b = W.tile(x, y + 1); return WALKABLE2.includes(b) || b === 'q' ? T.cliff : T.rock; }
    if (c === 'T') return this.layer(W.tile(x, y + 1) === 'a' || W.tile(x - 1, y) === 'a' ? T.ash[h] : T.grass[h], T.tree);
    if (c === 'P') return this.layer(T.dirt[h], T.pillar);
    if (c === 'R') return T.roof; if (c === 'H') return T.wallH; if (c === 'W') return T.window; if (c === 'D') return T.door;
    if (c === 'r') return T.oldRoof; if (c === 'h') return T.oldWall; if (c === 'X') return T.doorDark;
    if (c === 'o') return T.rim; if (c === 'w') return T.water[0];
    if (c === 'f') return this.layer(T.cobble[h], T.fence);
    if (c === 'L') return T.lava[0];
    if (c === 'q') return G.flags.bridge ? T.bridge : T.lava[0];
    return T.rock;
  },
  layer(a, b) {
    this._lc = this._lc || new Map();
    const k = a; let m = this._lc.get(k);
    if (!m) { m = new Map(); this._lc.set(k, m); }
    let c = m.get(b);
    if (!c) { c = makeTile(g => { g.drawImage(a, 0, 0); g.drawImage(b, 0, 0); }); m.set(b, c); }
    return c;
  },
  animImg(c, x, y, fr) {
    const T = SPR.city;
    if (c === 'w') return T.water[(fr + x) % 3];
    if (c === 'L' || (c === 'q' && !G.flags.bridge)) return T.lava[(fr + x + y) % 3];
    return null;
  },

  overlay(W, sx, sy) {
    // brilho da lava
    const c = W.cam;
    if (c.x + VIEW_W > 80 * TS) {
      const x = sx(84 * TS);
      const grd = ctx.createRadialGradient(x, 240, 20, x, 240, 260);
      grd.addColorStop(0, `rgba(255,90,20,${0.18 + Math.sin(W.t * 2) * 0.04})`); grd.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, 640, 480);
    }
  },

  ents(W) {
    const F = G.flags;
    const list = [
      { id: 'star1', x: tx2x(19), y: ty2y(30), w: 12, h: 8, spr: 'star', solid: true, talk: () => P2.useStar() },
      { id: 'star2', x: tx2x(88), y: ty2y(26), w: 12, h: 8, spr: 'star', solid: true, talk: () => P2.useStar() },
      { id: 'signPlaza', x: tx2x(17), y: ty2y(17), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(['* (DRAGONCITY — Praça do Ninho)', "* 'Aqui, todo viajante encontra um parceiro.'"]) },
      { id: 'signWoods', x: tx2x(70), y: ty2y(20), w: 14, h: 6, spr: 'sign', solid: true, talk: () => P2.riddle() },
      { id: 'signRiver', x: tx2x(87), y: ty2y(21), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(["* (Uma placa torta. Escrito com fuligem:)", "* 'CASINHA DO RIO. Proibido humanos. Exceto se gostarem de piadas.'"]) },
      npcDragon('dpreto', 'preto', 23, 12, () => P2.talkNest('preto'), { dir: 'right', hidden: F.dragonChosen && G.dragon === 'preto' }),
      npcDragon('dbranco', 'branco', 30, 12, () => P2.talkNest('branco'), { dir: 'right', hidden: F.dragonChosen && G.dragon === 'branco' }),
      npcDragon('dlaranja', 'laranja', 37, 12, () => P2.talkNest('laranja'), { dir: 'left', hidden: F.dragonChosen && G.dragon === 'laranja' }),
      npcDragon('elder', 'cinza', 41, 28, () => P2.talkElder(), { flap: 0.2 }),
      npcDragon('mother', 'azul', 21, 24, () => P2.talkMother(), { dir: 'right' }),
      npcDragon('kidHome', 'azul', 22, 25, () => W.say(['D: Rawr! Obrigado por me achar! Você é o humano mais legal do mundo!']), { dir: 'right', scale: 1, hidden: !F.kidFound, flap: 2 }),
      npcDragon('kidGreen', 'verde', 35, 31, () => P2.talkKid(), { scale: 1, flap: 2 }),
      npcDragon('guard', 'vermelho', 44, 18, () => P2.talkGuard(), { flap: 0.2 }),
      npcDragon('kidLost', 'azul', 79, 39, () => P2.findKid(), { scale: 1, flap: 2, hidden: !!F.kidFound }),
      { id: 'shop', x: tx2x(52) + 8, y: ty2y(20), w: 40, h: 12, solid: true, talk: () => P2.shop(),
        draw(sx, sy, t) {
          const x = sx(this.x - 22), y = sy(this.y - 34);
          drawSpr(SPR.dragon.rosa.right[Math.floor(t * 1.5) % 2], x + 10, y - 2 + Math.sin(t * 2), 2);
          ctx.fillStyle = '#000'; ctx.fillRect(x - 4, y + 34, 96, 34);
          ctx.fillStyle = '#8a5a2a'; ctx.fillRect(x - 2, y + 36, 92, 30);
          ctx.fillStyle = '#a8743a'; ctx.fillRect(x - 2, y + 36, 92, 6);
          for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff4e0' : '#d8443a'; ctx.fillRect(x - 6 + i * 17, y - 22, 17, 14); }
          ctx.fillStyle = '#000'; ctx.fillRect(x - 6, y - 8, 102, 2); ctx.fillRect(x - 4, y - 8, 4, 44); ctx.fillRect(x + 88, y - 8, 4, 44);
          drawSpr(SPR.pie, x + 50, y + 26, 2);
        } },
      { id: 'crate1', x: tx2x(59), y: ty2y(23), w: 16, h: 10, solid: true, spr: 'crate' },
      { id: 'crate2', x: tx2x(60), y: ty2y(23), w: 16, h: 10, solid: true, spr: 'crate' },
      { id: 'crate3', x: tx2x(61), y: ty2y(23), w: 16, h: 10, solid: true, spr: 'crate' },
      { id: 'barrel1', x: tx2x(63), y: ty2y(19), w: 12, h: 6, solid: true, spr: 'barrel' },
      { id: 'barrel2', x: tx2x(48), y: ty2y(24), w: 12, h: 6, solid: true, spr: 'barrel' },
      { id: 'barrel3', x: tx2x(66), y: ty2y(24), w: 12, h: 6, solid: true, spr: 'barrel' },
      { id: 'tea', x: tx2x(74), y: ty2y(5), w: 10, h: 8, spr: 'sparkle', hidden: !!F.teaTaken, talk: () => P2.takeTea() },
      lampEnt(15, 9), lampEnt(44, 9), lampEnt(15, 33), lampEnt(44, 33), lampEnt(55, 18), lampEnt(66, 18),
      ghostEnt('fire', 70, 21), ghostEnt('ice', 70, 18),
    ];
    for (const [k, tx] of [['laranja', 73], ['preto', 76], ['branco', 79]]) list.push(P2.statue(k, tx, 21));
    return list;
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 46, y: 18, w: 2, h: 8, when: () => !F.dragonChosen, run: () => P2.guardStop() },
      { x: 55, y: 18, w: 2, h: 8, when: () => F.dragonChosen && !F.ghostScene, run: () => P2.ghostScene() },
      { x: 86, y: 21, w: 2, h: 4, when: () => !F.farHint, run: () => P2.farHint() },
      { x: 68, y: 16, w: 2, h: 13, when: () => !F.woodsHint && F.ghostScene, run: () => P2.woodsHint() },
    ];
  },

  setup(W) {
    if (!G.flags.instrLeft) {
      Object.assign(W.instr, { visible: true, follow: !!G.flags.p2arrived ? false : true });
      if (G.flags.p2arrived) Object.assign(W.instr, { x: tx2x(27), y: ty2y(15), dir: 'right', follow: false });
    }
  },
  onEnter(W) { if (!G.flags.p2arrived) P2.arrive(); },
  musicAt(W) {
    const x = W.player.x / TS;
    if (x >= 86) return G.flags.bossDone ? 'dragoncity' : 'house';
    if (x >= 68) return 'cinzas';
    return 'dragoncity';
  },
  update(W) {
    if (W.locked || Dialog.open || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
  },

  talkInstr(W) {
    if (!G.flags.dragonChosen) return W.say(['I: Fale com os três dragões e escolha o seu parceiro. Sem pressa!']);
  },

  interactTile(W, c, tx, ty) {
    if (c === 'D') {
      const msgs = {
        '18,7': ["* (Toc toc.)", "D: Tô fazendo bolo de lava! Volta mais tarde!"],
        '27,7': ['* (A porta está trancada. Tem um cheiro bom de pão vindo lá de dentro.)'],
        '38,7': ['* (Um bilhete na porta: "Fui voar. — Bico de Ferro")'],
        '50,7': ['* (Ronc... ronc... alguém está roncando muito alto lá dentro.)'],
        '61,17': ['* (Um bilhete na porta: "Fechado. Fui caçar... digo, passear. — G.")', '* (Tem gelo no trinco.)'],
        '50,17': ['* (Fechada. A Dona Escama atende na barraca.)'],
      };
      return W.say(msgs[tx + ',' + ty] || ['* (A porta está trancada.)']);
    }
    if (c === 'X') return P2.bossScene();
    if (c === 'w' || c === 'o') return W.say(['* (A fonte tem moedas no fundo... e um dragãozinho de pedra cuspindo água.)']);
    if (c === 'L' || c === 'q') return W.say(['* (Lava. Muito quente. Melhor não.)']);
  },

  encounter: {
    tile: 'a', counter: 'enc2', max: 6, first: 110, min: 280, rand: 240,
    enabled: () => !!G.dragon,
    pick: n => n === 0 ? 'brasinha' : n === 1 ? 'gelinho' : (Math.random() < 0.5 ? 'brasinha' : 'gelinho'),
    opts: () => ({ dragon: G.dragon }),
    doneText: '* (O Bosque das Cinzas ficou em silêncio.)',
  },
};

// ---------------- Roteiros da Fase 2 ----------------
const P2 = {
  order: [],

  ent(id) { return World.ents.find(e => e.id === id); },

  statue(kind, tx, ty) {
    const names = { preto: 'PRETO', branco: 'BRANCO', laranja: 'LARANJA' };
    return {
      id: 'st_' + kind, kind, x: tx2x(tx), y: ty2y(ty), w: 18, h: 10, solid: true, lit: false,
      talk: () => P2.useStatue(kind, names[kind]),
      draw(sx, sy, t) {
        const x = sx(this.x), y = sy(this.y);
        drawSpr(SPR.pedestal, x - 20, y - 20, 2);
        drawSpr(SPR.dragon[kind].right[0], x - 22, y - 62, 1.75);
        drawSpr(SPR.brazier, x - 14, y - 4, 2);
        const on = G.flags.bridge || this.lit;
        if (on) drawFlame(x, y - 2, 16, t * 10 + this.x);
      },
    };
  },

  async arrive() {
    const W = World, I = W.instr, p = W.player;
    W.locked = true;
    G.flags.p2arrived = true;
    Object.assign(I, { visible: true, follow: false, x: tx2x(1), y: ty2y(22), dir: 'right' });
    p.x = tx2x(3); p.y = ty2y(22); p.dir = 'right';
    W.updateCam(true);
    Fade.a = 1;
    Sfx.playMusic('dragoncity');
    Fade.to(0, 0.7);
    await Promise.all([W.walk(p, [[tx2x(10), ty2y(22)]], 50), W.walk(I, [[tx2x(8), ty2y(22)]], 50)]);
    I.dir = 'right';
    await W.say([
      'I: Ufa... finalmente, ar fresco! Bom, quase fresco.',
      'I: Bem-vindo a DRAGONCITY, a cidade dos dragões!',
      'I: Aqui moram dragões de todo tipo. Calma, eles são gentis... a maioria.',
      'I: Venha comigo, quero te apresentar alguns amigos.',
    ]);
    await Promise.all([
      W.walk(p, [[tx2x(14), ty2y(22)], [tx2x(20), ty2y(16)], [tx2x(30), ty2y(15)]], 65),
      (async () => { await wait(0.35); await W.walk(I, [[tx2x(14), ty2y(22)], [tx2x(20), ty2y(16)], [tx2x(27), ty2y(15)]], 65); })(),
    ]);
    p.dir = 'up'; I.dir = 'right';
    Sfx.playMusic('instr');
    await W.say([
      'I: Estes são os dragões do NINHO.',
      'I: Todo viajante que passa por DragonCity escolhe um dragão parceiro.',
      'I: O PRETO é FORTE. O BRANCO é RÁPIDO. E o LARANJA solta FOGO!',
      'I: Cada um ajuda de um jeito nas batalhas.',
      'I: Fale com cada um deles e escolha o seu.',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async talkNest(kind) {
    const W = World, D = DRAGONS[kind];
    if (G.flags.dragonChosen) {
      const lines = {
        preto: ['D: GRRR. (Ele flexiona os músculos. Parece não ligar de ter sido trocado.)'],
        branco: ['D: Fiuuu! (Ele dá uma volta tão rápida que você fica tonto.)'],
        laranja: ['D: Fsssh! (Uma fumacinha sai do nariz dele. Ele parece amigável.)'],
      };
      return W.say(lines[kind]);
    }
    const intro = {
      preto: '* (O DRAGÃO PRETO te encara com olhos vermelhos. Ele parece muito forte.)',
      branco: '* (O DRAGÃO BRANCO não para quieto. Ele voa em círculos rapidíssimo.)',
      laranja: '* (O DRAGÃO LARANJA espirra uma faísca. A ponta da cauda está pegando fogo.)',
    };
    await W.say([intro[kind], `* ${D.desc}`]);
    const r = await W.ask(`* Escolher o ${D.name.toUpperCase()}?`, ['Sim', 'Não']);
    if (r === 0) await this.choose(kind);
  },

  async choose(kind) {
    const W = World, I = W.instr, D = DRAGONS[kind], de = this.ent('d' + kind);
    W.locked = true;
    G.dragon = kind; G.flags.dragonChosen = true;
    Sfx.roar(); W.shake = 0.4;
    await W.say([`* O ${D.name.toUpperCase()} solta um rugido feliz!`, `* (O ${D.name.toUpperCase()} agora é seu parceiro!)`]);
    const lines = {
      preto: 'I: O forte! Com ele, seus golpes vão ficar muito mais pesados.',
      branco: 'I: O rápido! Com ele, ninguém vai conseguir te acertar fácil.',
      laranja: 'I: O de fogo! Os inimigos vão continuar queimando depois do sopro dele.',
    };
    await W.say([lines[kind], 'I: Agora observe...']);
    // o dragão voa para longe (só aparece nas batalhas)
    Sfx.whoosh();
    de.flap = 3;
    for (let i = 0; i < 70; i++) { const dt = await nextFrame(); de.lift = (de.lift || 0) + dt * 90; de.alpha = Math.max(0, 1 - i / 70); }
    de.hidden = true;
    await W.say([
      'I: Ele vai ficar escondido, sempre perto de você...',
      'I: ...e só vai aparecer quando você precisar LUTAR.',
      'I: Bom. Agora eu preciso te contar uma coisa.',
      'I: Tenho que voltar para o LABIRINTO. Sempre tem alguém novo se perdendo por lá.',
      'I: Daqui em diante você segue sem mim... mas não está sozinho. Tem seu dragão.',
      'I: Siga para o LESTE, pelo mercado. Do outro lado do rio de lava...',
      'I: ...bom, você vai ver.',
      'I: Ah, e cuidado com FANTASMAS. Tchau, pequeno humano!',
    ]);
    Sfx.playMusic('instr');
    await W.walk(I, [[tx2x(20), ty2y(16)], [tx2x(14), ty2y(22)], [tx2x(4), ty2y(22)]], 70);
    for (let i = 0; i < 30; i++) { await nextFrame(); I.alpha = 1 - i / 30; }
    I.visible = false; I.alpha = 1;
    G.flags.instrLeft = true;
    await W.say(['* (O INSTRUTOR deixou o grupo.)']);
    Sfx.playMusic('dragoncity');
    W.saveHere(0);
    W.locked = false;
  },

  async guardStop() {
    const W = World, p = W.player;
    W.locked = true;
    await W.say(['D: ALTO LÁ, pequeno!', 'D: Ninguém atravessa o mercado sem um DRAGÃO parceiro.', 'D: Vá até o NINHO, ao norte da praça, e escolha o seu.']);
    await W.walk(p, [[p.x - 22, p.y]], 70);
    p.dir = 'left';
    W.locked = false;
  },

  talkGuard() {
    const W = World;
    if (!G.flags.dragonChosen) return W.say(['D: Primeiro, escolha um dragão no NINHO.']);
    if (!G.flags.ghostScene) return W.say(['D: Belo dragão! ...Digo, imagino. Ele está escondido, né?', 'D: Pode passar.']);
    return W.say(['D: Viu fantasmas no mercado? Eles vivem aprontando por aqui.']);
  },

  talkElder() {
    const W = World;
    if (!G.flags.ghostScene) return W.say([
      'D: Hohoho... um humano. Faz muitos anos que não vejo um.',
      'D: Dizem que dois fantasmas IRMÃOS vivem perto do rio de lava.',
      'D: Um é de FOGO e conta piadas terríveis. O outro é de GELO...',
      'D: ...e coleciona humanos CONGELADOS. Tome cuidado, pequeno.',
    ]);
    return W.say([
      'D: Você viu os irmãos? Hohoho... e ainda está inteiro!',
      'D: O de fogo não é mau. Só quer alguém que RIA das piadas dele.',
      'D: Às vezes, rir é a melhor defesa.',
    ]);
  },

  talkKid() {
    const W = World;
    const L = [
      ['D: Você é um HUMANO?! Que legal! Você cospe fogo?', '* (Você balança a cabeça.)', 'D: Ah... que sem graça.'],
      ['D: Quando eu crescer vou ser forte igual ao Dragão Preto!'],
      ['D: A Dona Escama vende pimenta que faz você soltar fumaça pela orelha!'],
    ];
    this.kidN = ((this.kidN ?? -1) + 1) % L.length;
    return W.say(L[this.kidN]);
  },

  async talkMother() {
    const W = World, F = G.flags;
    if (F.questDone) return W.say(['D: Pipoca não para de falar de você! Obrigada de novo.']);
    if (F.kidFound) {
      F.questDone = true; G.gold += 20;
      const got = G.items.length < 8 ? (G.items.push('Biscoito de Dragão'), true) : false;
      Sfx.heal();
      return W.say(['D: PIPOCA! Meu filhote! Você o encontrou!', 'D: Tome, é tudo o que eu tenho.',
        got ? '* Você ganhou 20 OURO e um BISCOITO DE DRAGÃO.' : '* Você ganhou 20 OURO. (Seus bolsos estão cheios para o biscoito.)']);
    }
    F.questTaken = true;
    return W.say(['D: Ai, ai, ai... meu filhote PIPOCA sumiu!', 'D: Ele adora brincar no BOSQUE DAS CINZAS, depois do mercado.',
      'D: Ele é azulzinho e bem pequeno. Se encontrar, mande ele voltar pra casa!']);
  },

  async findKid() {
    const W = World;
    await W.say(['D: Rawr?! Um humano!', 'D: Eu tava brincando de esconde-esconde com um fantasma de gelo...', 'D: ...mas ele queria me CONGELAR! Fiquei com medo e me perdi.',
      G.flags.questTaken ? '* (Você diz que a mãe dele está procurando.)' : '* (Você diz que ele deveria voltar para a praça.)', 'D: Mamãe! Vou voltar agora! Valeu, humano!']);
    G.flags.kidFound = true;
    Sfx.whoosh();
    this.ent('kidLost').hidden = true;
    this.ent('kidHome').hidden = false;
  },

  async shop() {
    const W = World;
    if (!G.flags.shopHi) {
      G.flags.shopHi = true;
      await W.say(['D: Bem-vindo à barraca da DONA ESCAMA!', 'D: Tudo fresquinho... e só um pouquinho chamuscado.']);
    }
    const stock = [['Pão de Escama', 'Pão 10G'], ['Chá Gelado', 'Chá 18G'], ['Pimenta Ardente', 'Pimenta 28G']];
    for (;;) {
      const r = await W.ask(`* O que vai querer? (Você tem ${G.gold} OURO)`, stock.map(s => s[1]).concat(['Sair']));
      if (r === 3 || r === undefined) { await W.say(['D: Volte sempre, docinho!']); return; }
      const [name] = stock[r], price = ITEMS[name].price;
      if (G.gold < price) { Sfx.back(); await W.say(['D: Hmm... falta OURO, querido.']); continue; }
      if (G.items.length >= 8) { Sfx.back(); await W.say(['D: Seus bolsos estão cheios!']); continue; }
      G.gold -= price; G.items.push(name); Sfx.select();
      await W.say([`* Você comprou ${name.toUpperCase()}.`]);
    }
  },

  async takeTea() {
    const W = World;
    if (G.items.length >= 8) return W.say(['* (Seus bolsos estão cheios.)']);
    G.flags.teaTaken = true; G.items.push('Chá Gelado'); Sfx.select();
    this.ent('tea').hidden = true;
    await W.say(['* Você achou um CHÁ GELADO esquecido no meio das cinzas.', '* (Quem deixaria isso aqui...?)']);
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save();
    W.saveHere();
    await W.say(['* (O cheiro de pão quente e lava te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },

  riddle() {
    if (G.flags.bridge) return World.say(['* (A placa diz: "Bom trabalho, viajante.")']);
    return World.say([
      '* (Uma placa antiga. As letras brilham como brasas:)',
      "* 'O FORTE abre o caminho.'",
      "* 'O VELOZ mostra a direção.'",
      "* 'O FOGO acende o coração.'",
      '* (Três estátuas de dragão. Cada uma tem um braseiro apagado.)',
    ]);
  },

  async useStatue(kind, nm) {
    const W = World;
    if (G.flags.bridge) return W.say(['* (O braseiro arde tranquilo.)']);
    const st = this.ent('st_' + kind);
    if (st.lit) return W.say(['* (Este braseiro já está aceso.)']);
    const r = await W.ask(`* (Estátua do DRAGÃO ${nm}. Acender o braseiro?)`, ['Sim', 'Não']);
    if (r !== 0) return;
    W.locked = true;
    st.lit = true; this.order.push(kind); Sfx.fire();
    const ok = this.order.every((k, i) => STATUE_ORDER[i] === k);
    if (!ok) {
      await wait(0.6);
      Sfx.puff();
      for (const k of STATUE_ORDER) this.ent('st_' + k).lit = false;
      this.order = [];
      await W.say(['* (As chamas se apagaram de repente...)', '* (Parece que a ordem estava errada.)']);
    } else if (this.order.length === 3) {
      await wait(0.6);
      W.shake = 1.2; Sfx.bridge();
      await wait(1.2);
      G.flags.bridge = true;
      W.renderMap();
      await W.say(['* (O chão treme...)', '* (Uma PONTE de madeira surgiu sobre o rio de lava!)']);
      W.saveHere(0);
    }
    W.locked = false;
  },

  async woodsHint() {
    const W = World;
    G.flags.woodsHint = true; W.locked = true;
    await W.say(['* (BOSQUE DAS CINZAS. As árvores soltam faíscas.)', '* (Algo se mexe entre as cinzas... monstros podem aparecer aqui.)']);
    W.locked = false;
  },

  async farHint() {
    const W = World;
    G.flags.farHint = true; W.locked = true;
    await W.say(['* (Do outro lado do rio... uma casinha bem pequena.)', '* (A luz está apagada. Mas a chaminé solta uma fumacinha laranja.)']);
    W.locked = false;
  },

  // ---------- CUTSCENE: os irmãos fantasmas ----------
  async ghostScene() {
    const W = World, p = W.player, F = G.flags;
    F.ghostScene = true; W.locked = true;
    const fire = this.ent('fireG'), ice = this.ent('iceG');
    Sfx.stopMusic();
    Object.assign(fire, { hidden: false, x: tx2x(72), y: ty2y(21), alpha: 0, flip: true });
    W.focus(tx2x(64), ty2y(20));
    Sfx.whoosh();
    for (let i = 0; i < 30; i++) { await nextFrame(); fire.alpha = i / 30; }
    W.walk(fire, [[tx2x(67), ty2y(21)]], 30);
    await wait(0.6);
    W.excl = 0.8; Sfx.encounter();
    await W.say(['* (!!!)', '* (Um FANTASMA EM CHAMAS!)', '* (Rápido, se esconda!)']);
    W.focus(null);
    await W.walk(p, [[p.x, ty2y(21)], [tx2x(60), ty2y(21)], [tx2x(60), ty2y(23) - 8]], 110);
    p.dir = 'right';
    await W.say(['* (Você se escondeu atrás das caixas.)']);
    W.focus(tx2x(63), ty2y(20));
    Sfx.playMusic('ghosts');
    await W.walk(fire, [[tx2x(64), ty2y(20)]], 30);
    await W.say([
      'F: Hehehe... ninguém por aqui? Que pena. Eu tinha uma piada NOVINHA.',
      'F: Por que o fantasma foi ao médico?',
      'F: Porque estava se sentindo... TRANSPARENTE! HAHAHAHA!',
    ]);
    Sfx.laugh();
    await W.say(['F: ...', 'F: Tá. Essa foi ruim até pra mim.']);
    // chega o IceGhost
    Object.assign(ice, { hidden: false, x: tx2x(72), y: ty2y(18), alpha: 0, flip: true });
    Sfx.freeze();
    for (let i = 0; i < 30; i++) { await nextFrame(); ice.alpha = i / 30; }
    await W.walk(ice, [[tx2x(66), ty2y(19)]], 35);
    fire.flip = false;
    await W.say([
      'G: Irmão. De novo contando piadas para as paredes?',
      'F: IRMÃOZINHO GELADO! Quer ouvir uma? O que o gelo disse pro outro gelo?',
      'G: Não.',
      "F: 'FICA FRIO!' HAHAHAHAHA!",
      'G: ...Por que eu ainda ando com você.',
      'G: Escuta. Senti cheiro de HUMANO nesta cidade.',
      'F: Humano?! Aqui? Que PIADA! ...entendeu? Não? Tá bom.',
      'G: Humanos são raros. Se eu encontrar um...',
      'G: ...vira PICOLÉ para a minha coleção.',
    ]);
    Sfx.freeze(); W.shake = 0.3;
    await W.say([
      'F: Você e essa mania de caçar humanos... Eu só quero alguém que RIA das minhas piadas.',
      'G: Vou procurar no Bosque das Cinzas. Não me atrapalhe.',
      'F: E eu vou pra minha casinha perto do rio! Talvez alguém apareça pra ouvir minhas piadas. Hehe!',
    ]);
    ice.flip = true; fire.flip = true;
    Sfx.whoosh();
    await Promise.all([W.walk(ice, [[tx2x(74), ty2y(16)]], 45), W.walk(fire, [[tx2x(74), ty2y(22)]], 40)]);
    for (let i = 0; i < 30; i++) { await nextFrame(); ice.alpha = fire.alpha = 1 - i / 30; }
    ice.hidden = fire.hidden = true;
    W.focus(null);
    await wait(0.5);
    await W.walk(p, [[tx2x(60), ty2y(21)]], 50);
    p.dir = 'down';
    await W.say([
      '* (Ufa... eles foram embora.)',
      '* (Dois irmãos fantasmas: um conta piadas horríveis... o outro caça humanos.)',
      '* (Melhor tomar cuidado daqui pra frente.)',
    ]);
    Sfx.playMusic('dragoncity');
    W.saveHere(0);
    W.locked = false;
  },

  // ---------- CUTSCENE: o susto e a BOSS FIGHT ----------
  async bossScene() {
    const W = World, p = W.player;
    if (G.flags.bossDone) return W.say(['* (A casinha está vazia e quentinha.)']);
    W.locked = true;
    Sfx.stopMusic();
    Sfx.knock();
    await W.say(['* (Toc, toc...)']);
    await wait(0.8);
    await W.say(['* (Ninguém responde.)', '* (A porta está trancada.)']);
    const fire = this.ent('fireG');
    Object.assign(fire, { hidden: false, x: p.x, y: p.y + 44, alpha: 0, flip: false });
    for (let i = 0; i < 3; i++) { Sfx.step(); await wait(0.7); fire.alpha = (i + 1) / 4; }
    await W.say(['* (...)', '* (Você sente um CALOR estranho nas suas costas...)']);
    for (let i = 0; i < 40; i++) { await nextFrame(); fire.y -= 0.5; fire.alpha = Math.min(1, fire.alpha + 0.02); }
    await wait(0.5);
    p.dir = 'down';
    await wait(0.25);
    Sfx.boo(); W.shake = 1.4;
    Game.flashWhite = 0.5;
    p.y -= 6; await wait(0.12); p.y += 6;
    await W.say(['F: BUUUUUUUUUU!!!']);
    Sfx.laugh();
    Sfx.playMusic('ghosts');
    await W.say([
      'F: HAHAHAHA! Te peguei! Essa foi melhor que TODAS as minhas piadas!',
      'F: Espera... esse cabelo... essa roupa... essa cara de assustado...',
      'F: VOCÊ É UM HUMANO?!',
      'F: Meu irmão ia AMAR te transformar em picolé...',
      'F: ...mas eu te achei PRIMEIRO! E eu não quero um picolé.',
      'F: Eu quero uma PLATEIA!',
      'F: Vamos ver se você aguenta o CALOR... e as minhas PIADAS!',
    ]);
    W.battle('fireghost', { dragon: G.dragon }, r => this.afterBoss(r));
  },

  async afterBoss(r) {
    const W = World, fire = this.ent('fireG');
    W.locked = true;
    G.flags.bossDone = true;
    Sfx.stopMusic();
    if (r === 'spared') {
      G.flags.fireFriend = true;
      Object.assign(fire, { hidden: false, alpha: 1 });
      Sfx.playMusic('ghosts');
      await W.say([
        'F: Hehe... ninguém nunca tinha rido das minhas piadas antes.',
        'F: Você é diferente, humano.',
        'F: Tá bom. Não vou contar pro meu irmão que te vi.',
        'F: Mas toma cuidado: o IceGhost não gosta de piadas... nem de humanos.',
        'F: Se cuida! E volta pra ouvir mais piadas, tá? Tenho MILHARES!',
      ]);
      Sfx.whoosh();
      await W.walk(fire, [[fire.x + 60, fire.y - 30]], 60);
      for (let i = 0; i < 30; i++) { await nextFrame(); fire.alpha = 1 - i / 30; }
      fire.hidden = true;
    } else {
      fire.hidden = true;
      await W.say(['* (O silêncio toma conta do lugar.)', '* (A fumacinha da chaminé se apagou.)']);
      await wait(0.8);
      Sfx.freeze(); W.shake = 1;
      await W.say(['* (Ao longe, um grito gelado ecoa pelo bosque...)', 'G: ...IRMÃO?!']);
    }
    await wait(0.6);
    Sfx.stopMusic();
    W.saveHere();
    await Fade.to(1, 0.8);
    Game.goEnd(2);
  },
};
