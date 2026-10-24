// FASE 1 — O LABIRINTO
'use strict';

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

MAPS.labirinto = {
  music: 'ruins',
  start: { x: tx2x(7), y: ty2y(6), dir: 'down' },

  build() {
    const MW = 64, MH = 36;
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
    return { g, leafSpot: deadEnds[0] };
  },

  solid(c) { return c === '#' || c === 'E' || (c === 'g' && !G.flags.gateOpen); },

  tileImg(c, x, y, W) {
    const T = SPR.tiles, hsh = (x * 73 + y * 151) % 3;
    if (!this.moss) this.moss = [0, 1, 2].map(v => makeTile(g => {
      g.drawImage(T.floor[v], 0, 0);
      g.fillStyle = '#3f5a3c';
      const R = rng(v + 5);
      for (let i = 0; i < 5; i++) g.fillRect((R() * 14) | 0, (R() * 14) | 0, 2, 2);
    }));
    if (c === '#') { const b = W.tile(x, y + 1); return (b !== '#' && b !== 'E') ? T.wall : T.wallTop; }
    if (c === ',') return T.leaves[hsh];
    if (c === '~') return this.moss[hsh];
    if (c === 'g') return G.flags.gateOpen ? T.floor[0] : T.gate;
    if (c === 'E') return T.door;
    return T.floor[hsh];
  },

  decorate(g) { // pedestal da torta
    g.fillStyle = '#000'; g.fillRect(26 * TS + 1, 26 * TS + 6, 14, 10);
    g.fillStyle = '#8462bf'; g.fillRect(26 * TS + 2, 26 * TS + 7, 12, 8);
    g.fillStyle = '#6a4c9c'; g.fillRect(26 * TS + 2, 26 * TS + 12, 12, 3);
  },

  ents(W, b) {
    const S = P1;
    const list = [
      { id: 'signA', x: tx2x(4), y: ty2y(3), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(['* (Na placa está escrito:)', "* 'Se você caiu aqui, não entre em pânico. Siga para a direita.'"]) },
      { id: 'signB', x: tx2x(28), y: ty2y(2), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(['* (LABIRINTO  →)', "* 'Quem entra sozinho... sai acompanhado.'"]) },
      { id: 'dummy', x: tx2x(23), y: ty2y(16), w: 14, h: 8, spr: 'dummy', solid: true, talk: () => S.talkDummy() },
      { id: 'star', x: tx2x(18), y: ty2y(27), w: 12, h: 8, spr: 'star', solid: true, talk: () => S.useStar() },
      { id: 'pie', x: tx2x(26), y: ty2y(26), w: 14, h: 8, spr: 'pie', yOff: -7, solid: true, hidden: !!G.flags.pieTaken, talk: () => S.takePie() },
      { id: 'leaf', x: tx2x(b.leafSpot[0]), y: ty2y(b.leafSpot[1]), w: 10, h: 8, spr: 'sparkle', solid: false, talk: () => S.takeLeaf() },
    ];
    return list.filter(e => !(e.id === 'dummy' && G.flags.dummyGone) && !(e.id === 'leaf' && G.flags.leafTaken));
  },

  triggers(W) {
    const S = P1;
    return [
      { x: 17, y: 2, w: 2, h: 8, when: () => !G.flags.met, run: () => S.scriptMeet() },
      { x: 16, y: 13, w: 14, h: 3, when: () => G.flags.met && !G.flags.dummyHint, run: () => S.scriptDummyHint() },
      { x: 14, y: 24, w: 16, h: 9, when: () => !G.flags.starHint, run: () => S.scriptStarHint() },
      { x: 32, y: 4, w: 2, h: 1, when: () => !G.flags.mazeHint, run: () => S.scriptMazeHint() },
    ];
  },

  setup(W) {
    if (G.flags.met && !G.flags.tutorialDone) Object.assign(W.instr, { visible: true, x: tx2x(19), y: ty2y(16), dir: 'right' });
    if (G.flags.tutorialDone) Object.assign(W.instr, { visible: true, follow: true });
  },

  encounter: {
    tile: '~', counter: 'encounters', max: 5, first: 90, min: 300, rand: 260,
    enabled: () => true,
    pick: n => n < 2 ? ['musgolho', 'fantasminha'][n] : ['musgolho', 'fantasminha'][(Math.random() * 2) | 0],
    opts: () => ({ withInstr: World.instr.follow }),
    doneText: '* (O labirinto ficou estranhamente silencioso.)',
    async after(W, r, n) {
      if (n === 1 && W.instr.follow) {
        W.locked = true;
        if (r === 'spared') await W.say(['I: Viu só? Nem todo monstro precisa virar pó.']);
        else if (r === 'killed') await W.say(['I: ...Às vezes não tem outro jeito. Vamos em frente.']);
        else await W.say(['I: Fugir também é uma escolha. Vamos!']);
        W.locked = false;
      }
    },
  },

  talkInstr(W) { return P1.talkInstr(); },

  interactTile(W, c) {
    if (c === 'g' && !G.flags.gateOpen) W.say(['* (Um portão de ferro. Está trancado.)']);
    if (c === 'E') P1.scriptExit();
  },
};

// Roteiros da Fase 1
const P1 = {
  async scriptWake() {
    const W = World;
    W.locked = true;
    W.player.lying = true;
    Sfx.stopMusic();
    Fade.a = 1; await Fade.to(0, 0.5);
    await wait(1.2);
    await W.say(['* ...', '* (Você caiu de muito alto... mas as folhas vermelhas amorteceram a queda.)', '* (Onde você está?)']);
    W.player.lying = false; Sfx.move();
    Sfx.playMusic('ruins');
    await wait(0.3);
    await W.say(['* (Use o controle da esquerda para andar. Botão A para interagir, B para o menu.)']);
    W.locked = false;
  },

  async scriptMeet() {
    const W = World;
    G.flags.met = true; W.locked = true;
    const I = W.instr, p = W.player;
    Object.assign(I, { visible: true, x: tx2x(29), y: ty2y(5), dir: 'left' });
    Sfx.stopMusic();
    await wait(0.4);
    await W.walk(I, [[p.x + 34, p.y]], 50);
    p.dir = 'right';
    Sfx.playMusic('instr');
    await W.say([
      'I: Opa! Um humano?! Aqui embaixo?',
      'I: Você caiu pelo buraco da floresta, não foi? Acontece mais do que você imagina.',
      'I: Não precisa ter medo. Eu sou o INSTRUTOR.',
      'I: Eu ajudo quem se perde a atravessar este LABIRINTO.',
      'I: Mas aqui vivem monstros. Alguns querem briga... outros só querem conversar.',
      'I: Antes de seguir, você precisa aprender a se defender. Venha comigo!',
    ]);
    await W.walk(I, [[tx2x(23) - 8, I.y], [tx2x(23) - 8, ty2y(9)], [tx2x(23) - 8, ty2y(14)], [tx2x(19), ty2y(16)]], 70);
    I.dir = 'right';
    W.locked = false;
  },

  async scriptDummyHint() {
    const W = World;
    G.flags.dummyHint = true; W.locked = true;
    await W.say(['I: Este é o BONECO de treino.', 'I: Chegue perto dele e aperte A para começar uma batalha de treino.']);
    W.locked = false;
  },

  talkInstr() {
    const W = World;
    if (!G.flags.tutorialDone) return W.say(['I: Vá até o BONECO e aperte A. Eu explico o resto!']);
    const lines = [
      ['I: O labirinto confunde todo mundo. Dica: siga sempre pela parede.'],
      ['I: Se a luta ficar difícil, me chame em AGIR!'],
      [`I: Você já poupou ${G.spares} e derrotou ${G.kills}. Cada escolha conta.`],
    ];
    this.instrTalkN = ((this.instrTalkN || 0) + 1) % lines.length;
    return W.say(lines[this.instrTalkN]);
  },

  async talkDummy() {
    const W = World;
    if (G.flags.tutorialDone) return W.say(['* (É só um boneco de pano.)']);
    if (!G.flags.met) return W.say(['* (Um boneco de treino. Parece estar esperando alguém.)']);
    await W.say(['I: Isso! Vamos começar o treino!']);
    W.battle('dummy', { tutorial: true }, r => this.afterTutorial(r));
  },

  async afterTutorial(result) {
    const W = World, I = W.instr;
    W.locked = true;
    if (result === 'killed') {
      G.flags.dummyGone = true; W.ents = W.ents.filter(e => e.id !== 'dummy');
      await W.say(['I: ...Você bateu até ele virar pó.', 'I: Bom, era só um boneco. Mas lembre: os monstros de verdade também sentem dor.']);
    } else {
      await W.say(['I: Muito bem! Você poupou o Boneco.', 'I: Gentileza também é uma arma poderosa aqui embaixo.']);
    }
    await W.say([
      'I: Agora sim, você está pronto.',
      'I: O LABIRINTO fica depois do portão, na sala de cima.',
      'I: Vou com você até a saída. Nas batalhas, me chame em AGIR!',
    ]);
    G.flags.gateOpen = true; G.flags.tutorialDone = true;
    Sfx.save();
    W.renderMap();
    await W.say(['* (Você ouve um portão se abrindo ao longe.)', '* (O INSTRUTOR entrou para o seu grupo!)']);
    await W.walk(I, [[W.player.x, W.player.y]], 80);
    I.follow = true; W.trail = [];
    for (let i = 0; i < 30; i++) W.trail.push({ x: I.x, y: I.y, dir: I.dir });
    W.saveHere(0);
    Sfx.playMusic('ruins');
    W.locked = false;
  },

  async scriptMazeHint() {
    const W = World;
    G.flags.mazeHint = true; W.locked = true;
    await W.say(['I: Aqui começa o LABIRINTO.', 'I: Os corredores mudam de cor por causa do musgo. Cuidado, monstros adoram se esconder nele.']);
    W.locked = false;
  },

  async scriptStarHint() {
    const W = World;
    G.flags.starHint = true; W.locked = true;
    await W.say([
      'I: Ufa! Saímos do labirinto!',
      'I: Está vendo aquela ESTRELA brilhando? Toque nela para SALVAR seu progresso.',
      'I: E a porta lá em cima... é a saída. Mas descanse antes.',
    ]);
    W.locked = false;
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save();
    W.saveHere();
    await W.say(['* (A luz da estrela te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },

  async takePie() {
    const W = World;
    if (G.items.length >= 8) return W.say(['* (Seus bolsos estão cheios.)']);
    G.flags.pieTaken = true; G.items.push('Torta de Canela'); Sfx.select();
    W.ents.find(e => e.id === 'pie').hidden = true;
    await W.say(['* (Uma torta de canela ainda quentinha.)', '* Você pegou a TORTA DE CANELA.']);
    if (W.instr.follow) await W.say(['I: Hehe, fui eu que deixei aí. Ela cura todo o seu HP!']);
  },

  async takeLeaf() {
    const W = World;
    G.flags.leafTaken = true; W.ents = W.ents.filter(e => e.id !== 'leaf');
    G.items.push('Folha Crocante'); Sfx.select();
    await W.say(['* Você achou uma FOLHA CROCANTE no fim do corredor.']);
  },

  async scriptExit() {
    const W = World;
    W.locked = true;
    if (!W.instr.follow) { await W.say(['* (A porta não abre.)']); W.locked = false; return; }
    Sfx.playMusic('instr');
    const end = G.kills === 0
      ? 'I: E você não machucou ninguém... Estou muito orgulhoso de você.'
      : G.kills >= 3 ? 'I: Você lutou bastante... só não esqueça quem você é.' : 'I: Você aprendeu rápido. Muito rápido.';
    await W.say([
      'I: Chegamos à saída do LABIRINTO.',
      end,
      'I: Do outro lado desta porta existe uma cidade incrível.',
      'I: Venha. Eu vou te levar até lá!',
    ]);
    Sfx.stopMusic();
    await Fade.to(1, 0.8);
    Game.goChapter(2);
  },
};
