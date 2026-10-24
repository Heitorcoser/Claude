// FASE 7 — NEO-SAKURA (continuação da Fase 6)
// Uma cidade inspirada em Tóquio. Os refugiados da caverna chegam, a cidade
// decide se aceita (depende da rota), a vida segue por um bom tempo... até a
// guerra chegar e o jogador precisar fugir.
'use strict';

Object.assign(ITEMS, {
  'Onigiri': { heal: 20, price: 10, text: '* Você comeu o Onigiri.\n* Arroz, alga e um recheio de saudade.' },
  'Mochi': { heal: 12, price: 6, text: '* Você comeu o Mochi.\n* Puxa-puxa e docinho.' },
  'Ramen': { heal: 40, price: 25, text: '* Você tomou o Ramen.\n* Quente, salgado, perfeito.' },
});

const DOORS7 = {
  '28,17': { x: 8, y: 59, dir: 'up', to: 'konbini' }, '8,61': { x: 28, y: 18, dir: 'down' },
  '50,17': { x: 24, y: 59, dir: 'up', to: 'casa' }, '24,61': { x: 50, y: 18, dir: 'down' },
  '72,17': { x: 48, y: 62, dir: 'up', to: 'escola' }, '48,64': { x: 72, y: 18, dir: 'down' },
};
const ESCAPE_TIME = 75;

MAPS.sakura = {
  music: 'sakura',
  start: { x: tx2x(4), y: ty2y(27), dir: 'right' },
  anim: '',

  build() {
    const MW = 100, MH = 66;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    rect(2, 22, 16, 12, 's');
    rect(18, 24, 1, 8, G.flags.p7accepted ? 's' : 'Y');
    rect(19, 18, 60, 20, 's'); rect(19, 25, 60, 5, 'a');
    rect(40, 25, 3, 5, 'z'); rect(62, 25, 3, 5, 'z');
    rect(66, 10, 13, 8, 'S');
    g[17][28] = 'K'; g[17][50] = 'P'; g[17][72] = 'D';
    for (const [x, y] of [[22, 19], [34, 19], [46, 19], [58, 19], [25, 22], [35, 22], [55, 22], [70, 22], [25, 33], [45, 33], [57, 33], [75, 33], [70, 36], [24, 36], [54, 36], [36, 36]]) g[y][x] = 'T';
    rect(79, 24, 8, 8, 's'); g[27][87] = 'M'; g[28][87] = 'M';
    rect(30, 38, 3, 2, 's'); rect(20, 40, 28, 10, 's');
    // interiores
    rect(2, 53, 12, 8, 'w'); g[61][8] = 'X';
    rect(18, 53, 12, 8, 'w'); g[61][24] = 'X';
    rect(36, 52, 24, 12, 'w'); rect(40, 51, 16, 1, 'b'); g[64][48] = 'X';
    for (const y of [56, 59]) for (const x of [39, 40, 44, 45, 51, 52, 56, 57]) g[y][x] = 'k';
    // escombros e fogo durante a fuga
    if (G.flags.p7war) for (const [x, y] of [[30, 22], [31, 22], [36, 30], [52, 24], [53, 24], [58, 32], [67, 22], [68, 22], [74, 29], [44, 26]]) g[y][x] = 'f';
    return { g };
  },

  solid(c) { return !'sazw'.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.deepT, FT = SPR.futT, h = (x * 73 + y * 151) % 3;
    if (c === 's') return T.side[h];
    if (c === 'a') return y === 27 ? (x % 3 ? T.asphLine : T.asph[h]) : T.asph[h];
    if (c === 'z') return T.zebra;
    if (c === 'T') return MAPS.dragoncity.layer(T.side[h], T.sakura);
    if (c === 'K') return T.shopDoor; if (c === 'P') return FT.doorE; if (c === 'D') return FT.doorS; if (c === 'S') return FT.schoolWall;
    if (c === 'Y') return T.gateBar; if (c === 'M') return T.metro;
    if (c === 'w') return FT.wood[h]; if (c === 'k') return MAPS.dragoncity.layer(FT.wood[h], FT.desk); if (c === 'b') return FT.board; if (c === 'X') return FT.doorIn;
    if (c === 'f') return T.ruin[h];
    if (c === '#') {
      const b = W.tile(x, y + 1);
      if (y >= 50) return 'swkX'.includes(b) ? FT.wallIn : FT.void;
      return 'sazKPDTYM'.includes(b) || 'sazKPD'.includes(W.tile(x, y + 2)) ? (G.flags.p7war ? T.ruin[h] : T.neonJ[(x >> 1) % 3]) : FT.void;
    }
    return FT.void;
  },

  ents(W) {
    const F = G.flags, acc = !!F.p7accepted;
    const at = (gate, home) => acc ? home : gate;
    const list = [
      { id: 'star1', x: tx2x(9), y: ty2y(24), w: 12, h: 8, spr: 'star', solid: true, talk: () => P7.useStar() },
      { id: 'star2', x: tx2x(44), y: ty2y(42), w: 12, h: 8, spr: 'star', solid: true, talk: () => P7.useStar() },
      { id: 'torii', x: tx2x(18), y: ty2y(23), w: 0, h: 0, solid: false, zOff: -200,
        draw(sx, sy) { drawSpr(SPR.torii, sx(this.x - 24), sy(this.y - 40), 2); } },
      { id: 'signN', x: tx2x(15), y: ty2y(24), w: 14, h: 6, spr: 'sign', solid: true, talk: () => W.say(['* (NEO-SAKURA)', "* 'A cidade das cerejeiras. Paz desde sempre.'"]) },
      critter('tec', 'aranha', 'mae', ...at([8, 27], [26, 44]), () => P7.talkTecela()),
      critter('fio', 'aranha', 'bebe', ...at([6, 29], [24, 46]), () => W.say(['W: Eu sou o Fio! ...Cadê o Novelo?']), { scale: 1, w: 12 }),
      critter('nov', 'aranha', 'bebe', 26, 46, () => W.say(['W: Eu voltei pra mamãe! Graças a você e aos esqueletos!']), { scale: 1, w: 12, hidden: !F.p7reunion }),
      critter('ar1', 'aranha', 'vila', ...at([10, 30], [34, 42]), () => P7.refugee(1)),
      critter('osso', 'esqueleto', 'mestre', ...at([12, 26], [40, 44]), () => P7.refugee(2), { w: 14 }),
      critter('femur', 'esqueleto', 'civil', ...at([13, 29], [38, 47]), () => P7.refugee(3), { w: 12, scale: 1.4 }),
      critter('es1', 'esqueleto', 'civil', ...at([11, 32], [30, 47]), () => P7.refugee(4), { w: 14 }),
      { id: 'kit', x: tx2x(acc ? 45 : 21), y: ty2y(acc ? 30 : 27), w: 18, h: 8, solid: true, hidden: !acc && !F.p7kitShown, talk: () => P7.talkKitsune(),
        draw(sx, sy, t) { drawSpr(SPR.kitsune, sx(this.x - 12), sy(this.y - 20) + Math.sin(t * 2) * 2, 2); } },
      robotNpc('r1', 'ouro', 22, 24, () => P7.citizen(1)),
      kidNpc('k1', 'k2', 22, 31, () => P7.citizen(2)),
      kidNpc('k2', 'k1', 54, 34, () => P7.citizen(3)),
      robotNpc('r2', 'verde', 64, 34, () => P7.citizen(4), 'right'),
      { id: 'ramen', x: tx2x(58) + 8, y: ty2y(23), w: 46, h: 10, solid: true, talk: () => P7.ramen(),
        draw(sx, sy, t) { drawSpr(SPR.robot.ouro.right[Math.floor(t * 2) % 2], sx(this.x - 8), sy(this.y - 42), 2); drawSpr(SPR.ramen, sx(this.x - 24), sy(this.y - 40), 2); } },
      // konbini
      robotNpc('clerk', 'verde', 8, 55, () => P7.konbini(), 'right'),
      { id: 'shelf', x: tx2x(4), y: ty2y(57), w: 28, h: 10, solid: true, talk: () => W.say(['* (Prateleiras cheias: onigiri, mochi, ramen instantâneo, balas de melão...)']),
        draw(sx, sy) { const x = sx(this.x - 14), y = sy(this.y - 26); ctx.fillStyle = '#000'; ctx.fillRect(x, y, 60, 52); ctx.fillStyle = '#c8ccd8'; ctx.fillRect(x + 2, y + 2, 56, 48); for (let i = 0; i < 3; i++) { ctx.fillStyle = '#8a8a96'; ctx.fillRect(x + 2, y + 14 + i * 14, 56, 2); for (let j = 0; j < 6; j++) { ctx.fillStyle = ['#ff5a5a', '#5ac8ff', '#ffd23a', '#7aff7a'][(i + j) % 4]; ctx.fillRect(x + 6 + j * 9, y + 6 + i * 14, 6, 8); } } } },
      // apartamento
      { id: 'bed7', x: tx2x(20), y: ty2y(56), w: 18, h: 24, spr: 'bed', solid: true, talk: () => P7.sleep() },
      { id: 'photo', x: tx2x(27), y: ty2y(54), w: 12, h: 6, spr: 'poster', solid: true, talk: () => P7.photo() },
      // escola
      robotNpc('prof', 'volt', 48, 54, () => P7.school(), 'right'),
      kidNpc('ck1', 'k3', 41, 55, () => W.say(['C: Você também é novo? Eu caí aqui faz um ano. Neo-Sakura é a melhor cidade!'])),
      kidNpc('ck2', 'k4', 55, 58, () => W.say(['C: Arigatō = obrigado. Sayonara = tchau. Tomodachi = amigo. Anota aí!'])),
      critter('novS', 'aranha', 'bebe', 52, 61, () => P7.findNovelo(), { scale: 1, w: 12, hidden: !!F.p7reunion || !!F.p7novFound }),
      // festival
      ...[[36, 26], [40, 22], [46, 22], [50, 26], [46, 32], [40, 32]].map(([x, y], i) => ({ id: 'lan' + i, x: tx2x(x), y: ty2y(y), w: 8, h: 4, solid: false, hidden: !F.p7festival || !!F.p7war,
        draw(sx, sy, t) { drawSpr(SPR.lanternJ, sx(this.x - 6), sy(this.y - 30) + Math.sin(t * 2 + i) * 3, 2); } })),
      // guerra
      ...[[34, 28], [48, 30], [60, 26], [70, 30]].map(([x, y], i) => ({ id: 'sold' + i, x: tx2x(x), y: ty2y(y), w: 14, h: 8, solid: true, hidden: !F.p7war || !!F.p7escape,
        draw(sx, sy, t) { const im = i % 2 ? SPR.aranhaSold : SPR.esqSold; drawSpr(im, sx(this.x - im.width / 2), sy(this.y - im.height) + Math.sin(t * 6 + i) * 2, 2); },
        talk: () => W.say(['* O soldado nem te escuta. Ele só segue em frente.']) })),
      ghostEnt('fire', 60, 28), ghostEnt('ice', 62, 27),
    ];
    return list;
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 14, y: 22, w: 3, h: 12, when: () => F.p7arrived && !F.p7accepted && !F.p7gateScene, run: () => P7.gateScene() },
      { x: 79, y: 24, w: 8, h: 8, when: () => F.p7escape && !F.p7done, run: () => P7.reachMetro() },
    ];
  },

  setup(W) {},
  onEnter(W) { if (!G.flags.p7arrived) P7.arrive(); },

  musicAt(W) {
    const F = G.flags, [x, y] = W.feetTile();
    if (F.p7escape) return 'fuga7';
    if (F.p7war) return 'guerra';
    if (F.p7night) return 'festival';
    if (y >= 50) return x < 31 ? 'sakura' : 'escola';
    return 'sakura';
  },

  update(W, dt) {
    const F = G.flags, p = W.player;
    P7.updateDebris(W, dt);
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
    if (F.p7escape && !F.p7done) {
      P7.escapeT -= dt;
      if (P7.escapeT <= 0) P7.escapeFail();
    }
  },

  overlay(W, sx, sy) {
    const F = G.flags, t = W.t, out = W.player.y < 50 * TS;
    // pétalas
    if (out && !F.p7war) {
      ctx.fillStyle = 'rgba(255,200,220,0.9)';
      for (let i = 0; i < 26; i++) { const x = ((i * 97 + t * 25) % 680) - 20 + Math.sin(t + i) * 10, y = ((i * 61 + t * 35) % 500) - 10; ctx.fillRect(x, y, 4, 2); }
    }
    if (out && F.p7night && !F.p7war) {
      ctx.fillStyle = 'rgba(10,8,40,0.4)'; ctx.fillRect(0, 0, 640, 480);
      for (let i = 0; i < 4; i++) {
        const k = ((t * 0.5 + i * 0.25) % 1), fx = 120 + i * 130, fy = 160 - k * 120;
        if (k > 0.6) { ctx.strokeStyle = ['#ff5ac8', '#ffd23a', '#5ff8ff', '#7aff7a'][i]; ctx.lineWidth = 2; for (let a = 0; a < 12; a++) { const r = (k - 0.6) * 160; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(a / 2) * r, fy + Math.sin(a / 2) * r); ctx.stroke(); } }
        else { ctx.fillStyle = '#fff'; ctx.fillRect(fx, fy + 60, 2, 6); }
      }
    }
    if (out && F.p7war) {
      ctx.fillStyle = 'rgba(80,10,10,0.25)'; ctx.fillRect(0, 0, 640, 480);
      for (let y = 0; y < W.mh; y++) for (let x = 0; x < W.mw; x++) if (W.g[y][x] === 'f') {
        const fx = sx(x * TS + 8), fy = sy(y * TS + 14);
        if (fx > -40 && fx < 680 && fy > -40 && fy < 520) { drawFlame(fx - 6, fy, 20, t * 9 + x); drawFlame(fx + 8, fy + 3, 16, t * 11 + y); }
      }
      ctx.fillStyle = 'rgba(70,70,80,0.35)';
      for (let i = 0; i < 16; i++) { const x = (i * 83 + t * 25) % 700 - 30, y = ((i * 47 - t * 40) % 500 + 500) % 500; ctx.beginPath(); ctx.arc(x, y, 16 + (i % 4) * 5, 0, Math.PI * 2); ctx.fill(); }
    }
    for (const d of P7.debris) {
      const k = Math.min(1, d.t / 0.9), x = sx(d.x), y = sy(d.y);
      ctx.fillStyle = `rgba(0,0,0,${0.2 + k * 0.4})`; ctx.beginPath(); ctx.ellipse(x, y, 8 + k * 10, 4 + k * 4, 0, 0, Math.PI * 2); ctx.fill();
      if (!d.hit) { ctx.fillStyle = '#6a6470'; ctx.fillRect(x - 10, y - (1 - k) * 260 - 20, 20, 16); ctx.fillStyle = '#4a444e'; ctx.fillRect(x - 10, y - (1 - k) * 260 - 8, 20, 4); }
    }
    if (P7.hitFx > 0) { P7.hitFx -= 1 / 60; ctx.fillStyle = `rgba(255,40,40,${P7.hitFx * 0.6})`; ctx.fillRect(0, 0, 640, 480); text('-4 HP', 320, 200, 34, '#ff5a5a', 'center'); }
    if (F.p7escape && !F.p7done) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(10, 10, 220, 44);
      text(`FUJA: ${Math.ceil(Math.max(0, P7.escapeT))}s`, 120, 16, 30, P7.escapeT < 20 ? '#ff5a5a' : '#ffe680', 'center');
    }
  },

  interactTile(W, c, tx, ty) {
    const d = DOORS7[tx + ',' + ty];
    if (d) return P7.door(d);
    if (c === 'Y') return W.say(['* (Uma barreira. Os guardas da cidade não deixam ninguém passar.)']);
    if (c === 'M') return G.flags.p7escape ? P7.reachMetro() : W.say(['* (A estação de metrô. Os trens levam para longe, muito longe.)']);
    if (c === 'f') return W.say(['* (Fogo e escombros. Não dá pra passar.)']);
    if (c === 'b') return W.say(['* (No quadro: "HOJE: palavras em japonês!" e um desenho de cerejeira.)']);
    if (c === 'k') return W.say(['* (Uma mesa. Alguém escreveu: "TOMODACHI = AMIGO".)']);
  },

  talkInstr(W) {},
};

// ---------------- Roteiros da Fase 7 ----------------
const P7 = {
  debris: [], escapeT: 0,
  ent(id) { return World.ents.find(e => e.id === id); },
  async note(lines) { const W = World; W.locked = true; await W.say(lines); W.locked = false; },

  async arrive() {
    const W = World, F = G.flags;
    W.locked = true;
    F.p7arrived = true;
    W.player.x = tx2x(4); W.player.y = ty2y(27); W.player.dir = 'right';
    W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('sakura'); Fade.to(0, 0.8);
    await wait(0.8);
    await W.say([
      '* (No fundo do abismo... uma cidade enorme e linda.)',
      '* (Cerejeiras cor-de-rosa, letreiros neon, lanternas vermelhas, trens voando sobre os prédios.)',
      '* (NEO-SAKURA.)',
      '* (Atrás de você, uma fila enorme: aranhas e esqueletos que fugiram da guerra.)',
      'E: É aqui... É lindo. Nós finalmente vamos ter um lar.',
      'J: Nyeh... vamos até o portão. Com calma.',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async gateScene() {
    const W = World, F = G.flags;
    F.p7gateScene = true; W.locked = true;
    const kit = this.ent('kit');
    kit.hidden = false; F.p7kitShown = true;
    Sfx.whoosh();
    await W.say([
      '* MORADOR: Aranhas?! Esqueletos?! Vocês vêm da caverna da GUERRA!',
      '* MORADORA: Vão trazer a guerra pra cá! Fechem o portão!',
      'Q: Silêncio.',
      'Q: Eu sou a GUARDIÃ KITSUNE. Protejo Neo-Sakura há trezentos anos.',
      'Q: E vocês, refugiados... não vão entrar.',
      'E: Por favor! Nós perdemos tudo! Só queremos um lugar pra viver!',
    ]);
    const r = route();
    if (r === 'genocida') {
      await W.say([
        '* (Você dá um passo à frente.)',
        '* (Não diz nada. Só olha nos olhos da Kitsune.)',
        'Q: ...Esses olhos.',
        'Q: Já vi olhos assim antes. Em quem já perdeu tudo... e já tirou tudo dos outros.',
        '* (Os moradores recuam, tremendo.)',
        'Q: ...Entrem. (A voz dela treme.) Mas fiquem longe de nós.',
      ]);
      return this.accept(false);
    }
    if (r === 'neutra') {
      await W.say(['* "Eles vão entrar. Por bem ou por mal."', 'Q: Então prove que é digno, humano.']);
      W.battle('kitsune', { dragon: G.dragon }, () => this.afterKitsune());
      return;
    }
    await W.say([
      '* (Você pega o Fio no colo. Ele está tremendo de frio.)',
      '* "Eles não trazem guerra. Eles FOGEM dela. Igual a mim."',
      'Q: ...',
      'Q: Você carrega uma aranhinha no colo como se fosse um irmão.',
      'Q: E fala baixinho, com humildade.',
      'Q: Quem cuida assim dos outros não traz guerra.',
      'Q: Neo-Sakura... dá as boas-vindas a vocês.',
    ]);
    return this.accept(true);
  },
  async afterKitsune() {
    const W = World;
    W.locked = true;
    await W.say(['Q: ...Você luta para proteger quem não consegue se proteger.', 'Q: Muito bem. Entrem. Mas cuidem desta paz.']);
    return this.accept(true);
  },

  async accept(kind) {
    const W = World, F = G.flags;
    F.p7accepted = true;
    for (let y = 24; y < 32; y++) { W.setTile(18, y, 's'); W.redrawTile(18, y); }
    Sfx.bridge();
    G.gold = (G.gold || 0) + 60;
    await W.say([
      '* (A barreira se abre.)',
      kind ? '* (Os moradores ajudam a carregar as coisas dos refugiados.)' : '* (Os moradores abrem caminho em silêncio, sem olhar nos seus olhos.)',
      'Q: A prefeitura dá uma ajuda de boas-vindas. E um apartamento para você, humano.',
      '* (Você recebeu 60 OURO e a chave de um APARTAMENTO.)',
    ]);
    await Fade.to(1, 1.5);
    for (const [id, x, y] of [['tec', 26, 44], ['fio', 24, 46], ['ar1', 34, 42], ['osso', 40, 44], ['femur', 38, 47], ['es1', 30, 47]]) {
      const e = this.ent(id); e.x = tx2x(x); e.y = ty2y(y);
    }
    const kit = this.ent('kit'); kit.x = tx2x(45); kit.y = ty2y(30);
    const p = W.player; p.x = tx2x(30); p.y = ty2y(28); p.dir = 'down';
    F.p7day = 1;
    W.updateCam(true);
    await Fade.to(0, 1.5);
    await W.say([
      '* (Os refugiados ganharam casas no BAIRRO NOVO, ao sul da avenida.)',
      '* (E você... ganhou uma vida nova.)',
      '* DIA 1: vá à ESCOLA, compre comida no KONBINI e visite a família da Tecelã. Depois, durma no seu apartamento.',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async door(d) {
    const W = World, F = G.flags;
    if (F.p7war && !F.p7escape) return W.say(['* (Não é hora. A cidade precisa de você lá fora.)']);
    if (F.p7escape) return W.say(['* (Não dá tempo! CORRA PARA O METRÔ!)']);
    if (!F.p7accepted) return;
    if (d.to === 'escola' && F.p7day !== 1) return W.say(['* (A escola está fechada agora.)']);
    await this.teleport(d);
  },
  async teleport(d) {
    const W = World, p = W.player;
    W.locked = true; Sfx.select();
    await Fade.to(1, 3);
    p.x = tx2x(d.x); p.y = ty2y(d.y); p.dir = d.dir;
    W.updateCam(true);
    await Fade.to(0, 3);
    W.locked = false;
  },

  async school() {
    const W = World, F = G.flags;
    if (F.p7school) return W.say(['V: Ótima aula hoje! Até amanhã!']);
    W.locked = true;
    await W.say(['V: Bem-vindo à ESCOLA DE NEO-SAKURA! Eu sou a Professora Sakura.', 'V: Hoje: palavras em japonês! Vamos ver se você aprende rápido.']);
    const qs = [['V: Como se diz "obrigado"?', ['Arigatō', 'Sayonara', 'Konnichiwa'], 0], ['V: O que é "sakura"?', ['Cerejeira', 'Comida', 'Gato'], 0], ['V: "Tomodachi" significa...', ['Amigo', 'Escola', 'Chuva'], 0]];
    let ok = 0;
    for (const [q, opts, right] of qs) {
      const order = opts.map((o, i) => [Math.random(), o, i]).sort((a, b) => a[0] - b[0]);
      const r = await W.ask(q, order.map(o => o[1]));
      if (order[r][2] === right) { ok++; Sfx.select(); await W.say(['V: Correto! Sugoi!']); } else { Sfx.buzz(); await W.say([`V: Quase! A resposta era "${opts[right]}".`]); }
    }
    await W.say([`V: ${ok} de 3! ${ok === 3 ? 'Perfeito!' : 'Muito bem pra primeiro dia!'}`]);
    F.p7school = true;
    if (!F.p7reunion) await W.say(['* (No fundo da sala, uma aranhinha te olha... é o NOVELO!)']);
    W.locked = false;
  },
  async findNovelo() {
    const W = World, F = G.flags;
    W.locked = true;
    await W.say(['W: HUMANO!! Sou eu, o NOVELO!', 'W: Na guerra, uns ESQUELETOS me tiraram da confusão e me trouxeram até aqui!', 'W: Eles me protegeram. Mesmo eu sendo aranha.', 'W: Cadê a mamãe? Ela tá viva?!', '* (Você diz que a Tecelã está no BAIRRO NOVO.)', 'W: MAMÃE! Vou correndo!']);
    F.p7novFound = true;
    this.ent('novS').hidden = true;
    W.locked = false;
  },

  async talkTecela() {
    const W = World, F = G.flags;
    if (!F.p7accepted) return W.say(['E: Fique perto de mim, Fio. Vai dar tudo certo... eu acho.']);
    if (F.p7war) return W.say(['E: A guerra... ela nos seguiu até aqui. Leve meus filhos daqui, por favor!']);
    if (F.p7novFound && !F.p7reunion) {
      W.locked = true;
      F.p7reunion = true; F.p7visit = true;
      this.ent('nov').hidden = false;
      Sfx.heal();
      await W.say(['W: MAMÃE!!!', 'E: NOVELO?! MEU FILHO! MEU FILHINHO!', '* (A Tecelã abraça o Novelo com as oito patas.)', 'W: Os esqueletos me salvaram, mamãe. Eles não são maus.', 'E: ...Nunca foram. Era tudo mentira. Obrigada, humano. Obrigada.']);
      W.locked = false;
      return;
    }
    if (!F.p7school) return W.say(['E: Ainda nenhuma notícia do Novelo...', 'E: Vá pra escola, humano. Uma vida normal faz bem.']);
    F.p7visit = true;
    return W.say(['E: Esta casa nova é linda. Mas nada substitui uma família inteira.']);
  },
  refugee(n) {
    const W = World, F = G.flags;
    if (F.p7war) return W.say(['* "De novo não... de novo NÃO!"']);
    const L = { 1: ['* "Uma casa de verdade! Com teto e tudo!"'], 2: ['J: Aranhas e esqueletos na mesma rua de novo. Como antes da guerra.', 'J: Nyeh... talvez dê pra recomeçar.'], 3: ['* FÊMUR JR.: O Novelo voltou?! ...Eu ainda procuro minha mãe. Mas não perco a esperança.'], 4: ['* "Os moradores ainda olham torto. Mas a velhinha do lado trouxe mochi pra gente."'] };
    return W.say(L[n]);
  },
  talkKitsune() {
    const W = World, F = G.flags;
    if (F.p7war) return W.say(['Q: Trezentos anos... e eu não consegui proteger minha cidade.']);
    if (F.p7day === 2 && !F.p7night) return this.festivalInvite();
    return W.say(['Q: Neo-Sakura é uma cidade de paz. Que continue assim.']);
  },
  citizen(n) {
    const W = World, F = G.flags;
    if (F.p7war) return W.say(['* "CORRE! O metrô é a única saída!"']);
    const L = { 1: ['* BIP. Bem-vindo a Neo-Sakura. Lembre-se: atravesse sempre na faixa.'], 2: ['C: Minha mãe disse pra não falar com refugiado...', 'C: ...mas você parece legal.'], 3: ['C: O ramen da esquina é o MELHOR do mundo inteiro!'], 4: ['* BIP. Os trens saem da estação no fim da avenida, a leste.'] };
    return W.say(L[n]);
  },

  async konbini() {
    const W = World, F = G.flags;
    const stock = [['Mochi', 'Mochi 6G'], ['Onigiri', 'Onigiri 10G'], ['Ramen', 'Ramen 25G']];
    for (;;) {
      const r = await W.ask(`* IRASSHAIMASE! (Você tem ${G.gold} OURO)`, stock.map(s => s[1]).concat(['Sair']));
      if (r === 3 || r === undefined) return W.say(['* Arigatō gozaimasu! Bip.']);
      const [name] = stock[r], price = ITEMS[name].price;
      if (G.gold < price) { Sfx.back(); await W.say(['* Saldo insuficiente.']); continue; }
      if (G.items.length >= 8) { Sfx.back(); await W.say(['* Seus bolsos estão cheios!']); continue; }
      G.gold -= price; G.items.push(name); Sfx.select(); F.p7food = true;
      await W.say([`* Você comprou ${name.toUpperCase()}.`]);
    }
  },
  async ramen() {
    const W = World, F = G.flags;
    if (F.p7war) return W.say(['* (A barraca de ramen está vazia. O dono fugiu.)']);
    const r = await W.ask('* Ramen quentinho por 20 OURO?', ['Comer', 'Não']);
    if (r !== 0) return;
    if (G.gold < 20) return W.say(['* (Você não tem ouro suficiente.)']);
    G.gold -= 20; G.hp = G.maxhp; F.p7food = true; Sfx.heal();
    await W.say(['* (O melhor ramen da sua vida. Seu HP encheu.)']);
  },
  photo() {
    const W = World, F = G.flags;
    if (F.p7war) return W.say(['* (Uma foto do festival. Todo mundo sorrindo. Parece outro mundo.)']);
    return W.say(['* (Um quadro vazio. Você ainda não tem fotos aqui.)']);
  },

  async sleep() {
    const W = World, F = G.flags;
    if (F.p7war) return W.say(['* (Não dá pra dormir com sirenes tocando.)']);
    if (F.p7day === 1) {
      if (!(F.p7school && F.p7food && F.p7visit)) return W.say(['* (Ainda falta coisa pra fazer hoje. Veja a MISSÃO.)']);
      W.locked = true;
      await Fade.to(1, 1);
      F.p7day = 2; G.hp = G.maxhp;
      await wait(0.8);
      await Dialog.show([{ t: '* (Dia 2.)' }], true);
      await Fade.to(0, 1);
      await W.say(['* (Hoje à noite é o FESTIVAL DAS LANTERNAS. A Guardiã Kitsune está na avenida.)']);
      W.locked = false;
      return;
    }
    if (F.p7day === 2 && F.p7festival) return this.monthsPass();
    return W.say(['* (Ainda não é hora de dormir.)']);
  },

  async festivalInvite() {
    const W = World, F = G.flags;
    W.locked = true;
    await W.say(['Q: Humano. Esta noite é o FESTIVAL DAS LANTERNAS.', 'Q: Moradores e refugiados, juntos pela primeira vez.', 'Q: ...Venha. Você merece uma noite feliz.']);
    await Fade.to(1, 1);
    F.p7night = true; F.p7festival = true;
    for (let i = 0; i < 6; i++) this.ent('lan' + i).hidden = false;
    const p = W.player; p.x = tx2x(43); p.y = ty2y(28); p.dir = 'down';
    for (const [id, x, y] of [['tec', 38, 28], ['nov', 37, 30], ['fio', 39, 30], ['osso', 48, 28], ['femur', 47, 30], ['kit', 43, 25]]) { const e = this.ent(id); e.x = tx2x(x); e.y = ty2y(y); if (id === 'nov') e.hidden = !F.p7reunion; }
    W.updateCam(true);
    Sfx.playMusic('festival');
    await Fade.to(0, 1);
    await W.say([
      '* (Lanternas vermelhas flutuam pela avenida. Fogos de artifício explodem no céu.)',
      '* (Aranhas dançam com esqueletos. Crianças da cidade brincam com o Fio e o Novelo.)',
      'J: Nyeh heh heh! Faz tempo que eu não danço!',
      'E: Olha, humano... todo mundo junto. É assim que devia ser sempre.',
      'Q: ...Talvez eu estivesse errada sobre vocês.',
      '* (Pela primeira vez em muito tempo, você se sente em CASA.)',
      '* (Volte ao seu apartamento para dormir.)',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async monthsPass() {
    const W = World, F = G.flags;
    W.locked = true;
    await Fade.to(1, 1);
    Sfx.playMusic('sakura');
    await Dialog.show([
      { t: '* (Os dias viraram semanas.)' },
      { t: '* (As semanas viraram meses.)' },
      { t: '* (Você ia pra escola de manhã. Comprava onigiri no konbini. Tomava ramen na esquina.)' },
      { t: '* (O Novelo e o Fêmur Jr. viraram melhores amigos de novo.)' },
      { t: '* (Neo-Sakura era um lugar bom de viver.)' },
      { t: '* (Até que um dia...)' },
    ], true);
    Sfx.stopMusic();
    Sfx.siren();
    await wait(1.5);
    F.p7war = true; F.p7night = false;
    for (let i = 0; i < 6; i++) this.ent('lan' + i).hidden = true;
    W.g = MAPS.sakura.build().g; W.renderMap();
    for (let i = 0; i < 4; i++) this.ent('sold' + i).hidden = false;
    const p = W.player; p.x = tx2x(50); p.y = ty2y(18) + 4; p.dir = 'down';
    W.updateCam(true);
    Sfx.playMusic('guerra');
    await Fade.to(0, 1);
    W.shake = 1.5; Sfx.rumble();
    await W.say([
      '* (SIRENES.)',
      '* (A guerra da caverna chegou a Neo-Sakura.)',
      '* (Soldados aranha, soldados esqueleto, e sombras que ninguém reconhece invadem as ruas.)',
      '* (Você corre para a avenida. Precisa PARAR isso, de qualquer jeito.)',
    ]);
    W.battle('guerra', { dragon: G.dragon }, r => this.afterWar(r));
  },

  async afterWar() {
    const W = World, F = G.flags;
    W.locked = true;
    W.shake = 1; Sfx.rumble();
    await W.say(['* (Você tentou. Tentou de todo jeito.)', '* (Mas não dá para parar uma guerra sozinho.)', '* (Você não muda o mundo.)']);
    Sfx.playMusic('tristeza');
    await W.say([
      '* (Você cai de joelhos no meio da avenida.)',
      '* "Isso é culpa minha..."',
      '* "Eu nunca devia ter conhecido os fantasmas de gelo e fogo."',
      '* "Se eu nunca tivesse batido naquela porta... nada disso teria acontecido."',
    ]);
    const fire = this.ent('fireG'), ice = this.ent('iceG');
    if (F.ghostsFriends) {
      Object.assign(fire, { hidden: false, alpha: 1, x: tx2x(52), y: ty2y(22), flip: true });
      Object.assign(ice, { hidden: false, alpha: 1, x: tx2x(54), y: ty2y(21), flip: true });
      Sfx.freeze();
      await W.say([
        'F: ...Humano. A gente viu a guerra chegar aqui também.',
        'G: Você tem razão de nos culpar. Fomos nós que começamos tudo isso.',
        'F: Eu achei que a gente ia ser amigos pra sempre...',
        'G: Mas a nossa amizade só trouxe desgraça pra todo mundo.',
        'F: Então... a gente vai embora. Pra bem longe. Onde não dá pra machucar mais ninguém.',
        'G: Adeus, humano.',
        'F: ...Tchau. (Nenhuma piada dessa vez.)',
      ]);
      for (let i = 0; i < 50; i++) { await nextFrame(); fire.alpha = ice.alpha = 1 - i / 50; fire.y -= 1; ice.y -= 1; }
      fire.hidden = ice.hidden = true;
      F.ghostsLeft = true;
      await W.say(['* (A amizade acabou. Os irmãos fantasmas foram para bem longe.)']);
    } else if (F.ghostsAliveAny || F.ghostsAlive) {
      await W.say(['* (Lá no alto, você vê um rastro de fogo e um rastro de gelo cruzando o céu.)', '* (Os irmãos fantasmas, que ainda vivem, estão indo embora para um lugar bem distante.)', '* (Eles nem olham pra trás.)']);
      F.ghostsLeft = true;
    } else {
      await W.say(['* (Não existem mais fantasmas para culpar.)', '* (Você mesmo cuidou disso.)', '* (Só sobrou você.)']);
    }
    W.shake = 2; Sfx.rumble();
    await W.say(['* (Um prédio desaba. Depois outro.)', '* (A cidade está sendo destruída, pedaço por pedaço.)', 'Q: HUMANO! O METRÔ, NO FIM DA AVENIDA, A LESTE! É A ÚNICA SAÍDA!', 'E: Os refugiados já estão indo! CORRE!']);
    for (let i = 0; i < 4; i++) this.ent('sold' + i).hidden = true;
    this.startEscape();
    W.locked = false;
  },

  startEscape() {
    const W = World, F = G.flags;
    F.p7escape = true;
    this.escapeT = ESCAPE_TIME;
    this.escapeStart = { x: W.player.x, y: W.player.y };
    this.debris = [];
    W.saveHere(0);
  },
  updateDebris(W, dt) {
    const F = G.flags, p = W.player;
    for (const d of this.debris) {
      d.t += dt;
      if (!d.hit && d.t >= 0.9) { d.hit = true; Sfx.puff(); if (!W.locked && Math.hypot(p.x - d.x, (p.y - 4) - d.y) < 13) this.debrisHit(W); }
    }
    this.debris = this.debris.filter(d => d.t < 1.3);
    if (!F.p7escape || F.p7done || W.locked || p.y > 50 * TS || p.x > 78 * TS) return;
    this.debT = (this.debT || 0) - dt;
    if (this.debT <= 0) {
      this.debT = 0.9;
      for (let i = 0; i < 2; i++) this.debris.push({ x: p.x - 40 + Math.random() * 120, y: p.y - 40 + Math.random() * 70, t: 0 });
      this.debris.push({ x: p.x + (p.dir === 'right' ? 26 : 0), y: p.y - 4, t: 0 });
    }
  },
  async debrisHit(W) {
    W.locked = true;
    Sfx.hurt(); W.shake = 0.6; this.hitFx = 0.5;
    G.hp = Math.max(1, G.hp - 4);
    const p = W.player;
    for (let i = 0; i < 8; i++) { const nx = p.x - 3; if (!W.blocked(nx, p.y)) p.x = nx; await nextFrame(); }
    W.locked = false;
  },
  async escapeFail() {
    const W = World;
    W.locked = true;
    Sfx.rumble(); W.shake = 2;
    await W.say(['* (Os escombros fecharam o caminho...)', '* (Você volta correndo e tenta de novo!)']);
    await Fade.to(1, 2);
    const p = W.player; p.x = this.escapeStart.x; p.y = this.escapeStart.y;
    G.hp = Math.max(G.hp, Math.ceil(G.maxhp / 2));
    this.escapeT = ESCAPE_TIME; this.debris = [];
    W.updateCam(true);
    await Fade.to(0, 2);
    W.locked = false;
  },

  async reachMetro() {
    const W = World, F = G.flags;
    if (!F.p7escape || F.p7done) return;
    F.p7done = true; W.locked = true;
    this.debris = [];
    Sfx.playMusic('tristeza');
    await W.say([
      '* (Você chega na estação. O último trem está saindo.)',
      'E: HUMANO! AQUI! Pula pra dentro!',
      '* (Aranhas, esqueletos, moradores da cidade... todos juntos no mesmo vagão.)',
      'J: Nyeh... perdemos a caverna. Agora perdemos a cidade.',
      'W: Mas a gente ainda tem uns aos outros, né?',
      'Q: Trezentos anos de paz... e tudo acabou em uma noite.',
      '* (O trem corre pelo túnel escuro.)',
      '* (Atrás de vocês, Neo-Sakura vai ficando pequena... e apagada.)',
      '* (Para onde esse trem vai, ninguém sabe.)',
    ]);
    F.p7end = true;
    W.saveHere();
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goEnd(7);
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere();
    await W.say([G.flags.p7war ? '* (Mesmo com a cidade caindo, você se agarra à DETERMINAÇÃO.)' : '* (O cheiro de cerejeira te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
