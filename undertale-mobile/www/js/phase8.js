// FASE 8 — A VILA VULCÂNICA
// O trem de Neo-Sakura chega à Vila Brasa, aos pés do GIGANTE ADORMECIDO (um vulcão
// gigante que descansa). Mestre Draco treina o seu dragão; no topo do vulcão está o
// CORAÇÃO DO VULCÃO, que faz o dragão evoluir. No fim, o dragão já sabe voar e leva
// você embora, rumo à Fase 9.
'use strict';

Object.assign(ITEMS, {
  'Pão de Lava': { heal: 25, price: 14, text: '* Você comeu o Pão de Lava.\n* Crocante, quente e um pouco apimentado.' },
  'Sopa Fervente': { heal: 45, price: 28, text: '* Você tomou a Sopa Fervente.\n* Queimou a língua. Valeu a pena.' },
});

const WALK8 = 'basqrg';
const STONES8 = [[32, 25], [32, 24], [32, 23], [31, 23], [30, 23], [29, 23], [29, 22], [29, 21], [29, 20], [30, 20], [31, 20], [32, 20],
  [33, 20], [34, 20], [35, 20], [35, 19], [35, 18], [35, 17], [34, 17], [33, 17], [33, 16], [33, 15], [33, 14]];
const GEYSER_ROWS = [36, 33, 30];
const GEYSER_CYCLE = 3.2;

MAPS.vulcao = {
  music: 'vulcao',
  start: { x: tx2x(5), y: ty2y(59), dir: 'right' },
  anim: 'Lo',

  build() {
    const MW = 96, MH = 78, F = G.flags;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    // estação
    rect(3, 57, 10, 6, 'b'); g[59][2] = 'M'; g[60][2] = 'M';
    rect(13, 58, 8, 4, 'a');
    // Vila Brasa
    rect(21, 46, 38, 26, 'b'); rect(21, 58, 38, 3, 'a');
    rect(38, 46, 3, 26, 'L'); rect(38, 51, 3, 2, 'q'); rect(38, 58, 3, 3, 'q'); rect(38, 66, 3, 2, 'q');
    for (const [x, y] of [[23, 47], [57, 47], [22, 70], [57, 70], [44, 47], [30, 71]]) g[y][x] = 'O';
    // arena do Mestre Draco
    rect(60, 50, 22, 16, 's');
    for (let x = 60; x < 82; x++) { g[50][x] = 'f'; g[65][x] = 'f'; }
    for (let y = 50; y < 66; y++) { g[y][60] = 'f'; g[y][81] = 'f'; }
    rect(59, 56, 2, 3, 'a');
    // caminho do vulcão (portão)
    rect(28, 40, 5, 6, 'a');
    if (!F.p8climb) rect(28, 44, 5, 1, 'Y');
    // 1) campo de gêiseres
    rect(20, 28, 26, 12, 'a');
    for (const y of GEYSER_ROWS) for (let x = 21; x < 45; x += 3) g[y][x] = 'g';
    rect(30, 26, 5, 2, 'a');
    // 2) lago de lava com pedras que afundam
    rect(18, 14, 32, 12, 'L');
    for (const [x, y] of STONES8) g[y][x] = 'o';
    rect(30, 13, 8, 1, 'a');
    // 3) trilha em zigue-zague até o topo
    rect(26, 4, 18, 9, 'a');
    for (let x = 26; x < 40; x++) g[10][x] = 'O';
    for (let x = 30; x < 44; x++) g[7][x] = 'O';
    // cume (cratera com runas)
    rect(27, 1, 16, 3, 'r');
    if (F.p8heart) { rect(30, 26, 5, 2, 'L'); rect(30, 13, 8, 1, 'L'); }
    return { g };
  },

  solid(c, tx, ty) {
    if (c === 'o') { const s = P8.stone(tx, ty); return s.state === 'down'; }
    return !WALK8.includes(c);
  },

  tileImg(c, x, y, W) {
    const V = SPR.volT, h = (x * 73 + y * 151) % 3;
    if (c === 'b') return V.basalt[h];
    if (c === 'a') return V.ash[h];
    if (c === 's') return V.sand[h];
    if (c === 'g') return V.vent;
    if (c === 'r') return V.rune;
    if (c === 'q') return SPR.deepT.bridge;
    if (c === 'L' || c === 'o') return SPR.city.lava[0];
    if (c === 'f') return V.fence;
    if (c === 'O') return MAPS.dragoncity.layer(V.basalt[h], V.obsidian);
    if (c === 'Y') return V.gate;
    if (c === 'M') return SPR.deepT.metro;
    if (c === '#') {
      const b = W.tile(x, y + 1);
      return (WALK8 + 'LofYO').includes(b) ? V.cliff : V.dark;
    }
    return V.dark;
  },

  animImg(c, x, y, fr) {
    const lava = SPR.city.lava[(fr + x + y) % 3];
    if (c === 'L') return lava;
    if (c === 'o') {
      const s = P8.stone(x, y), V = SPR.volT;
      if (s.state === 'down') return lava;
      return MAPS.dragoncity.layer(lava, s.state === 'warn' && Math.floor(World.t * 8) % 2 ? V.stoneLow : V.stone);
    }
    return null;
  },

  ents(W) {
    const F = G.flags;
    const hut = (id, x, y, txt) => ({ id, x: tx2x(x), y: ty2y(y), w: 32, h: 10, spr: 'lavaHut', solid: true, talk: () => W.say(txt),
      draw(sx, sy) { drawSpr(SPR.lavaHut, sx(this.x - 18), sy(this.y - 28), 2); } });
    const golem = (id, x, y, talk, opts = {}) => ({ id, x: tx2x(x), y: ty2y(y), w: 22, h: 10, solid: true, talk, hidden: !!opts.hidden, scale: opts.scale || 2,
      draw(sx, sy, t) { const s = this.scale; drawSpr(SPR.golemLava, sx(this.x - 9 * s / 2), sy(this.y - 19 * s / 2) + (Math.floor(t * 1.5 + this.x) % 2), s); } });
    const fant = (id, x, y, talk) => ({ id, x: tx2x(x), y: ty2y(y), w: 16, h: 8, solid: true, talk,
      draw(sx, sy, t) { drawSpr(SPR.fantLava, sx(this.x - 9), sy(this.y - 22) + Math.sin(t * 2.5 + this.x) * 3, 2); } });
    return [
      { id: 'star1', x: tx2x(31), y: ty2y(62), w: 12, h: 8, spr: 'star', solid: true, talk: () => P8.useStar() },
      { id: 'star2', x: tx2x(24), y: ty2y(38), w: 12, h: 8, spr: 'star', solid: true, talk: () => P8.useStar() },
      { id: 'star3', x: tx2x(28), y: ty2y(12), w: 12, h: 8, spr: 'star', solid: true, talk: () => P8.useStar() },
      { id: 'signA', x: tx2x(57), y: ty2y(56), w: 14, h: 6, spr: 'sign', solid: true, talk: () => W.say(['* (ARENA DO MESTRE DRACO →)', "* 'Treinamos dragões desde antes do vulcão dormir.'"]) },
      { id: 'signV', x: tx2x(34), y: ty2y(47), w: 14, h: 6, spr: 'sign', solid: true, talk: () => W.say(['* (↑ O GIGANTE ADORMECIDO)', "* 'Não acorde o vulcão. Ele está só descansando.'"]) },
      hut('h1', 25, 50, ['* (Uma casa de basalto. Lá dentro, um golem ronca alto.)']),
      hut('h2', 33, 50, ['* (Uma casa de basalto quentinha. Tem pão assando no forno de lava.)']),
      hut('h3', 46, 50, ['* (Uma casa nova. Na porta: "ARANHAS E ESQUELETOS — BEM-VINDOS".)']),
      hut('h4', 53, 50, ['* (Uma casa de basalto. Alguém pendurou uma lanterna de Neo-Sakura na janela.)']),
      hut('h5', 25, 68, ['* (Uma casa de basalto com uma horta de pimentas.)']),
      hut('h6', 52, 68, ['* (A casa da Kitsune. Tem um torii pequenininho na porta.)']),
      { id: 'forja', x: tx2x(45), y: ty2y(69), w: 30, h: 10, solid: true, talk: () => W.say(['* (A forja da vila. O fogo nunca apaga.)']),
        draw(sx, sy, t) { drawSpr(SPR.forja, sx(this.x - 16), sy(this.y - 26), 2); drawFlame(sx(this.x), sy(this.y - 10), 10, t * 10); } },
      golem('basalto', 30, 55, () => P8.talkBasalto(), { scale: 2.6 }),
      golem('gol1', 48, 55, () => P8.citizen(1)),
      golem('gol2', 55, 63, () => P8.citizen(2)),
      fant('loja', 27, 63, () => P8.shop()),
      fant('fl2', 50, 62, () => P8.citizen(3)),
      critter('tec', 'aranha', 'mae', 35, 66, () => P8.refugee(1)),
      critter('fio', 'aranha', 'bebe', 33, 68, () => P8.refugee(2), { scale: 1, w: 12 }),
      critter('nov', 'aranha', 'bebe', 36, 68, () => P8.refugee(3), { scale: 1, w: 12, hidden: !F.p7reunion }),
      critter('osso', 'esqueleto', 'mestre', 44, 63, () => P8.refugee(4), { w: 14 }),
      critter('femur', 'esqueleto', 'civil', 46, 64, () => P8.refugee(5), { w: 12, scale: 1.4 }),
      { id: 'kit', x: tx2x(52), y: ty2y(57), w: 18, h: 8, solid: true, talk: () => P8.refugee(6),
        draw(sx, sy, t) { drawSpr(SPR.kitsune, sx(this.x - 12), sy(this.y - 20) + Math.sin(t * 2) * 2, 2); } },
      // arena
      { id: 'draco', x: tx2x(70), y: ty2y(54), w: 16, h: 8, solid: true, talk: () => P8.talkDraco(),
        draw(sx, sy, t) { drawSpr(SPR.draco, sx(this.x - 8), sy(this.y - 22) + (Math.floor(t * 2) % 2), 1.6); } },
      { id: 'anciao', x: tx2x(76), y: ty2y(55), w: 40, h: 12, solid: true, talk: () => W.say(['* (O DRAGÃO ANCIÃO solta uma fumacinha.)', '* (Ele tem 500 anos e cara de quem já viu de tudo.)']),
        draw(sx, sy, t) { const s = SPR.dragon.anciao.left[Math.floor(t * 2) % 2]; drawSpr(s, sx(this.x - 26), sy(this.y - 40) + Math.sin(t * 1.5) * 2, 2); } },
      ...[[65, 61], [72, 62], [78, 60]].map(([x, y], i) => ({ id: 'alvo' + i, x: tx2x(x), y: ty2y(y), w: 12, h: 6, solid: true,
        talk: () => W.say(['* (Um alvo de treino, todo chamuscado.)']), draw(sx, sy) { drawSpr(SPR.alvo, sx(this.x - 8), sy(this.y - 22), 2); } })),
      // portão
      golem('guarda', 26, 43, () => P8.talkGate(), { scale: 1.6 }),
      // cume
      { id: 'altar', x: tx2x(35), y: ty2y(2), w: 30, h: 8, solid: true, talk: () => P8.takeHeart(),
        draw(sx, sy, t) {
          drawSpr(SPR.altar, sx(this.x - 16), sy(this.y - 20), 2);
          if (G.flags.p8heart) return;
          ctx.fillStyle = `rgba(255,90,20,${0.25 + Math.sin(t * 4) * 0.1})`; ctx.beginPath(); ctx.arc(sx(this.x), sy(this.y - 30), 22, 0, Math.PI * 2); ctx.fill();
          drawSpr(SPR.coracao, sx(this.x - 7), sy(this.y - 38) + Math.sin(t * 3) * 3, 2);
        } },
      // o seu dragão (cutscenes)
      { id: 'meuDragao', x: 0, y: 0, w: 0, h: 0, solid: false, hidden: true, flip: false, rider: false, flash: 0, k: null, zOff: 2,
        draw(sx, sy, t) {
          if (this.rider) { drawRider(sx(this.x - 26), sy(this.y - 44), 2, t, this.flip); return; }
          const k = this.k || G.dragon || 'laranja', set = SPR.dragon[k];
          drawDragonAura(k, sx(this.x - 26), sy(this.y - 44), 2, t);
          drawSpr(set[this.flip ? 'left' : 'right'][Math.floor(t * 6) % 2], sx(this.x - 26), sy(this.y - 44) + Math.sin(t * 3) * 3, 2);
          if (this.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${this.flash})`; ctx.beginPath(); ctx.arc(sx(this.x), sy(this.y - 22), 40, 0, Math.PI * 2); ctx.fill(); }
        } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 59, y: 55, w: 3, h: 5, when: () => F.p8arrived && !F.p8metDraco, run: () => P8.meetDraco() },
      { x: 20, y: 38, w: 26, h: 2, when: () => F.p8climb && !F.p8base, run: () => P8.baseScene() },
      { x: 26, y: 11, w: 18, h: 2, when: () => F.p8climb && !F.p8lakeDone, run: () => { F.p8lakeDone = true; P8.note(['* (Você atravessou o lago de lava!)', '* (Agora é só subir a trilha até o topo.)']); } },
    ];
  },

  setup(W) { P8.stones = new Map(); },
  onEnter(W) { if (!G.flags.p8arrived) P8.arrive(); },

  musicAt(W) {
    const [x, y] = W.feetTile();
    if (y < 44) return 'cume';
    if (x >= 60) return 'draco';
    return 'vulcao';
  },

  update(W, dt) {
    if (P8.mini) { P8.updateMini(dt); return; }
    if (P8.hurtT > 0) P8.hurtT -= dt;
    P8.updateStones(W, dt);
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
    P8.checkGeysers(W);
    P8.checkStoneFall(W);
  },

  overlay(W, sx, sy) {
    const t = W.t, F = G.flags;
    // gêiseres
    if (W.player.y < 42 * TS) {
      GEYSER_ROWS.forEach((row, i) => {
        const ph = P8.geyserPhase(i);
        for (let x = 21; x < 45; x += 3) {
          const px = sx(x * TS + 8), py = sy(row * TS + 9);
          if (px < -40 || px > 680 || py < -200 || py > 520) continue;
          if (ph === 'warn') { ctx.fillStyle = `rgba(255,120,20,${0.4 + Math.sin(t * 30) * 0.2})`; ctx.beginPath(); ctx.arc(px, py, 10 + Math.sin(t * 20) * 3, 0, Math.PI * 2); ctx.fill(); }
          if (ph === 'erupt') {
            const hgt = 90 + Math.sin(t * 25 + x) * 8;
            ctx.fillStyle = 'rgba(255,60,10,0.85)'; ctx.fillRect(px - 10, py - hgt, 20, hgt + 6);
            ctx.fillStyle = 'rgba(255,190,40,0.9)'; ctx.fillRect(px - 5, py - hgt + 8, 10, hgt);
            ctx.fillStyle = '#ffe680'; ctx.fillRect(px - 2, py - hgt + 14, 4, hgt - 10);
            drawFlame(px, py - hgt, 14, t * 12 + x);
          }
        }
        if (ph === 'erupt') { ctx.fillStyle = 'rgba(255,90,20,0.18)'; const y0 = sy((row - 1) * TS), y1 = sy((row + 2) * TS); ctx.fillRect(0, y0, 640, y1 - y0); }
      });
    }
    // fumaça e brasas no ar
    ctx.fillStyle = 'rgba(255,140,40,0.8)';
    for (let i = 0; i < 18; i++) { const x = (i * 97 + Math.sin(t + i) * 30 + 700) % 680 - 20, y = 500 - ((i * 61 + t * 30) % 520); ctx.fillRect(x, y, 3, 3); }
    if (P8.hurtT > 0) { ctx.fillStyle = `rgba(255,40,40,${P8.hurtT * 0.5})`; ctx.fillRect(0, 0, 640, 480); }
    if (P8.quake > 0) { ctx.fillStyle = `rgba(255,60,0,${0.15 + Math.sin(t * 8) * 0.08})`; ctx.fillRect(0, 0, 640, 480); }
    if (P8.mini) P8.drawMini();
  },

  interactTile(W, c, tx, ty) {
    if (c === 'Y') return P8.talkGate();
    if (c === 'M') return W.say(['* (A estação. O trem de Neo-Sakura não volta mais.)']);
    if (c === 'L' || c === 'o') return W.say(['* (LAVA. Muito, muito quente.)']);
    if (c === 'g') return W.say(['* (Um gêiser. Ele borbulha... e explode de tempos em tempos.)']);
    if (c === 'O') return W.say(['* (Uma pedra de obsidiana, preta e brilhante.)']);
    if (c === 'f') return W.say(['* (A cerca da arena. Tem marcas de garras de dragão.)']);
    if (c === 'r') return W.say(['* (Runas antigas. Elas brilham como brasa.)']);
  },

  encounter: {
    tile: 'a', counter: 'enc8', max: 6, first: 140, min: 260, rand: 220,
    enabled: () => !!G.flags.p8climb && !G.flags.p8heart && World.player.y < 44 * TS,
    pick: n => n % 2 ? 'fantLava' : 'golemLava',
    opts: () => ({ dragon: G.dragon }),
    doneText: '* (Os monstros do vulcão já te conhecem. Ninguém mais te ataca.)',
  },

  talkInstr(W) {},
};

// ---------------- Roteiros da Fase 8 ----------------
const P8 = {
  stones: new Map(), mini: null, hurtT: 0, quake: 0,
  ent(id) { return World.ents.find(e => e.id === id); },
  async note(lines) { const W = World; W.locked = true; await W.say(lines); W.locked = false; },

  // ----- pedras que afundam -----
  stone(x, y) {
    const k = x + ',' + y;
    let s = this.stones.get(k);
    if (!s) { const i = STONES8.findIndex(p => p[0] === x && p[1] === y); s = { state: 'up', t: 0, stood: 0, auto: i % 5 === 3, ph: i * 0.37 }; this.stones.set(k, s); }
    return s;
  },
  updateStones(W, dt) {
    const [fx, fy] = W.feetTile();
    for (const [x, y] of STONES8) {
      const s = this.stone(x, y);
      if (W.tile(x, y) !== 'o') continue;
      if (s.auto) {
        const c = (W.t + s.ph) % 4;
        s.state = c < 2.4 ? 'up' : c < 3 ? 'warn' : 'down';
        continue;
      }
      s.t += dt;
      const on = fx === x && fy === y;
      s.stood = on ? s.stood + dt : 0;
      if (s.state === 'up' && s.stood > 1.1) { s.state = 'warn'; s.t = 0; }
      else if (s.state === 'warn' && s.t > 0.5) { s.state = 'down'; s.t = 0; }
      else if (s.state === 'down' && s.t > 2.2) { s.state = 'up'; s.t = 0; }
    }
  },
  checkStoneFall(W) {
    const [fx, fy] = W.feetTile();
    if (W.tile(fx, fy) !== 'o' || this.stone(fx, fy).state !== 'down') return;
    this.fall();
  },
  async fall() {
    const W = World;
    W.locked = true;
    Sfx.splash(); Sfx.hurt(); this.hurtT = 0.8;
    G.hp = Math.max(1, G.hp - 6);
    await W.say(['* (A pedra afundou na lava! -6 HP)', '* (Você pula de volta pra margem.)']);
    await Fade.to(1, 3);
    W.player.x = tx2x(32); W.player.y = ty2y(27); W.player.dir = 'up';
    W.updateCam(true);
    await Fade.to(0, 3);
    W.locked = false;
  },

  // ----- gêiseres -----
  geyserPhase(i) {
    const c = (World.t + (GEYSER_CYCLE - i * 1.07)) % GEYSER_CYCLE;
    return c > 2.5 ? 'erupt' : c > 1.9 ? 'warn' : 'idle';
  },
  checkGeysers(W) {
    if (this.hurtT > 0) return;
    const [fx, fy] = W.feetTile();
    if (fx < 20 || fx > 45) return;
    GEYSER_ROWS.forEach((row, i) => {
      if (this.hurtT > 0 || Math.abs(fy - row) > 1 || this.geyserPhase(i) !== 'erupt') return;
      this.hurtT = 1;
      Sfx.hurt(); W.shake = 0.4;
      G.hp = Math.max(1, G.hp - 5);
      const p = W.player;
      for (let k = 0; k < 28; k++) if (!W.blocked(p.x, p.y + 1)) p.y += 1;
    });
  },

  // ----- chegada -----
  async arrive() {
    const W = World, F = G.flags;
    W.locked = true;
    F.p8arrived = true;
    W.player.x = tx2x(5); W.player.y = ty2y(59); W.player.dir = 'right';
    W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('vulcao'); Fade.to(0, 0.8);
    await wait(0.8);
    await W.say([
      '* (O trem para numa estação quente e cheia de fumaça.)',
      '* (Uma vila de pedra preta, rios de lava... e uma montanha ENORME no meio de tudo.)',
      '* (A montanha tem o formato de um gigante dormindo. Ela sobe e desce, bem devagar, como se respirasse.)',
      '* (Todo mundo da cidade veio junto: aranhas, esqueletos, a Kitsune, os moradores de Neo-Sakura.)',
    ]);
    await W.walk(W.player, [[tx2x(22), ty2y(59)]], 70);
    await W.say([
      'X: GRRRM. BEM-VINDOS... À VILA BRASA.',
      'X: EU SOU BASALTO. CHEFE DOS GOLENS.',
      'X: AQUI MORAM GOLENS DE LAVA... E FANTASMAS DE LAVA. TODOS SÃO BEM-VINDOS.',
      'X: SÓ UMA REGRA: NÃO ACORDEM O GIGANTE.',
      '* (Basalto aponta para a montanha que respira.)',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  talkBasalto() {
    const W = World, F = G.flags;
    if (!F.p8metDraco) return W.say(['X: A ARENA FICA A LESTE. O MESTRE DRACO VAI GOSTAR DO SEU DRAGÃO.']);
    if (!F.p8climb) return W.say(['X: O MESTRE DRACO É DURO. MAS JUSTO.', 'X: TERMINE O TREINO. SÓ ASSIM O PORTÃO DO GIGANTE ABRE.']);
    return W.say(['X: VOCÊ VAI SUBIR O GIGANTE?', 'X: PISE LEVE. ELE TEM SONO PESADO... MAS NEM TANTO.']);
  },
  citizen(n) {
    const W = World;
    const L = {
      1: ['X: GRRM. EU NUNCA TINHA VISTO UMA ARANHA.', 'X: ELAS TÊM MUITAS PERNAS. MUITO EFICIENTE.'],
      2: ['X: O GIGANTE DORME HÁ MIL ANOS.', 'X: DIZEM QUE NO TOPO DELE TEM UM CORAÇÃO DE FOGO.'],
      3: ['Ç: Blub! Por que o golem não vai à praia?', 'Ç: Porque ele já é um PEDREGULHO! Hehehe... blub.'],
    };
    return W.say(L[n]);
  },
  refugee(n) {
    const W = World, r = route();
    const L = {
      1: ['E: Aqui é quente demais pra uma aranha... mas ninguém aponta pra gente.', 'E: Os golens até fizeram uma teia de pedra pros meus filhos brincarem.'],
      2: ['W: O chão é QUENTINHO! Eu e o Novelo fazemos corrida de pedra!'],
      3: ['W: Humano! Você vai ficar forte igual ao dragão velho?'],
      4: ['J: Nyeh... perdemos duas casas. Mas ainda estamos juntos.', 'J: Aranhas e esqueletos ajudando os golens a construir. Quem diria.'],
      5: ['* FÊMUR JR.: Os fantasmas de lava contam piada igual ao FireGhost!', '* FÊMUR JR.: ...Só que piores.'],
      6: r === 'genocida' ? ['Q: ...Você está aqui também.', 'Q: Fique longe dos filhotes. Por favor.'] : ['Q: Trezentos anos protegendo uma cidade... e agora não tenho cidade.', 'Q: Mas tenho todos eles. Talvez isso seja um lar.'],
    };
    return W.say(L[n]);
  },
  async shop() {
    const W = World;
    const stock = [['Pão de Lava', 'Pão de Lava 14G'], ['Sopa Fervente', 'Sopa Fervente 28G']];
    await W.say(['Ç: Blub! Bem-vindo à BARRACA FERVENTE!']);
    for (;;) {
      const r = await W.ask(`* Quer comprar? (Você tem ${G.gold} OURO)`, stock.map(s => s[1]).concat(['Sair']));
      if (r === 2 || r === undefined) return W.say(['Ç: Volte sempre! Blub!']);
      const [name] = stock[r], price = ITEMS[name].price;
      if (G.gold < price) { Sfx.back(); await W.say(['Ç: Blub... falta ouro.']); continue; }
      if (G.items.length >= 8) { Sfx.back(); await W.say(['* (Seus bolsos estão cheios!)']); continue; }
      G.gold -= price; G.items.push(name); Sfx.select();
      await W.say([`* Você comprou ${name.toUpperCase()}.`]);
    }
  },
  async talkGate() {
    const W = World, F = G.flags;
    if (F.p8climb) return W.say(['X: CUIDADO COM OS GÊISERES. ESPERE A ONDA PASSAR, DEPOIS ANDE.']);
    return W.say(['X: GRRM. O CAMINHO DO GIGANTE ESTÁ FECHADO.', 'X: SÓ QUEM TERMINA O TREINO DO MESTRE DRACO PODE SUBIR.']);
  },

  // ----- Mestre Draco -----
  async meetDraco() {
    const W = World, F = G.flags;
    F.p8metDraco = true; W.locked = true;
    const d = this.meuDragao();
    Object.assign(d, { hidden: false, x: W.player.x - 30, y: W.player.y - 4, flip: false, rider: false, k: null });
    Sfx.whoosh();
    await W.say([
      '* (Seu dragão sai das sombras e pousa do seu lado, todo animado com o calor.)',
      'A: HOHO! Que dragão é ESSE?!',
      'A: Eu sou o MESTRE DRACO. Treino dragões há sessenta anos.',
      `A: Um ${DRAGONS[G.dragon].name.toUpperCase()}... bonito. Mas olha essas asas! Fraquinhas!`,
      'A: Ele te segue desde o começo, não é? Escondido nas sombras, só aparecendo nas lutas.',
      'A: Ele nunca aprendeu a VOAR de verdade. Nem a usar a força que tem.',
      'A: Me deixa treinar ele. Três lições. Ele vai ficar MUITO mais forte.',
    ]);
    d.hidden = true;
    W.locked = false;
    return this.talkDraco();
  },
  meuDragao() { return this.ent('meuDragao'); },

  async talkDraco() {
    const W = World, F = G.flags;
    if (F.p8climb) return W.say(['A: O treino acabou. Agora falta o CORAÇÃO DO VULCÃO, lá no topo do Gigante.', 'A: Os gêiseres estouram em ONDAS, de baixo pra cima. Espere a onda passar e siga atrás dela.', 'A: E não fique parado nas pedras do lago!']);
    W.locked = true;
    if (!F.p8lesson1) {
      await W.say(['A: LIÇÃO 1: PONTARIA!', 'A: Seu dragão vai soprar nos alvos. Aperte A quando a agulha estiver na faixa VERDE.', 'A: Acerte 5. Errou 3? Começa de novo.']);
      await this.runMini('aim');
      F.p8lesson1 = true; G.dragonLv = Math.max(G.dragonLv || 0, 1);
      Sfx.levelUp();
      await W.say(['A: HOHO! Pontaria de mestre!', '* (O ataque do seu dragão ficou mais forte! +4 de dano)', 'A: Fale comigo de novo para a LIÇÃO 2.']);
    } else if (!F.p8lesson2) {
      await W.say(['A: LIÇÃO 2: VOO!', 'A: Você vai montar nele... só um pouquinho. Mova para CIMA e para BAIXO e passe pelos buracos das rochas.', 'A: Passe por 8 rochas. Bateu 3 vezes? De novo!']);
      await this.runMini('fly');
      F.p8lesson2 = true; G.dragonLv = Math.max(G.dragonLv || 0, 2);
      Sfx.levelUp();
      await W.say(['A: Ele voou! Baixinho, tremendo... mas VOOU!', '* (O ataque do seu dragão ficou mais forte! +4 de dano)', 'A: Fale comigo de novo para a PROVA FINAL.']);
    } else if (!F.p8lesson3) {
      await W.say(['A: PROVA FINAL: lutar contra o meu DRAGÃO ANCIÃO.', 'A: Não precisa vencer. Precisa IMPRESSIONAR.', 'A: Use o seu dragão (AGIR) e mostre respeito. Quando ele estiver satisfeito, POUPE.']);
      W.locked = false;
      W.battle('anciao', { dragon: G.dragon }, () => this.afterAnciao());
      return;
    }
    W.locked = false;
  },
  async afterAnciao() {
    const W = World, F = G.flags;
    W.locked = true;
    F.p8lesson3 = true; G.dragonLv = 3; F.dragonFly = true;
    Sfx.levelUp();
    await W.say([
      'A: HOHOHO! O Ancião está sorrindo! Fazia cem anos que eu não via isso!',
      '* (O ataque do seu dragão ficou mais forte! +4 de dano)',
      '* (Seu dragão aprendeu a VOAR!)',
      'A: Agora ele voa. Mas ainda não tem fogo no coração pra carregar você longe.',
      'A: O último passo do treino fica no TOPO DO GIGANTE ADORMECIDO.',
      'A: Lá existe o CORAÇÃO DO VULCÃO. Um cristal raro. Dê ele ao seu dragão...',
      'A: ...e ele vai virar algo que você nunca viu.',
      'A: Vou avisar o Basalto para abrir o portão. Boa sorte, pequeno.',
    ]);
    F.p8climb = true;
    for (let x = 28; x < 33; x++) { W.setTile(x, 44, 'a'); W.redrawTile(x, 44); }
    W.saveHere(0);
    W.locked = false;
  },

  async baseScene() {
    const W = World, F = G.flags;
    F.p8base = true;
    await this.note(['* (O CAMPO DE GÊISERES.)', '* (As fileiras explodem uma depois da outra, de baixo pra cima.)', '* (Espere a fileira da frente estourar... e corra logo atrás da onda!)']);
  },

  // ----- minijogos de treino -----
  runMini(kind) {
    return new Promise(res => {
      this.mini = kind === 'aim'
        ? { kind, t: 0, hits: 0, miss: 0, needle: 0, dir: 1, speed: 0.9, zone: 0.4, shot: null, msg: '', res }
        : { kind, t: 0, y: 240, rocks: [], spawnT: 0.6, passed: 0, hits: 0, inv: 0, msg: '', res };
    }).then(() => { this.mini = null; });
  },
  updateMini(dt) {
    const M = this.mini;
    M.t += dt;
    if (M.kind === 'aim') {
      M.needle += M.dir * M.speed * dt;
      if (M.needle > 1) { M.needle = 1; M.dir = -1; } if (M.needle < 0) { M.needle = 0; M.dir = 1; }
      if (M.shot) { M.shot.t += dt; if (M.shot.t > 0.6) M.shot = null; }
      if (!M.shot && (Input.isPressed('a') || Input.tap)) {
        const ok = Math.abs(M.needle - M.zone) < 0.08;
        M.shot = { t: 0, ok };
        if (ok) { M.hits++; Sfx.fire(); M.msg = 'NO ALVO!'; M.zone = 0.15 + Math.random() * 0.7; M.speed += 0.15; }
        else { M.miss++; Sfx.buzz(); M.msg = 'ERROU!'; }
        if (M.miss >= 3) { M.hits = 0; M.miss = 0; M.speed = 0.9; M.msg = 'MESTRE DRACO: DE NOVO!'; }
        if (M.hits >= 5) setTimeout(() => M.res(), 700);
      }
      return;
    }
    // voo
    const v = moveVector();
    M.y = Math.max(70, Math.min(420, M.y + v.y * 230 * dt));
    if (M.inv > 0) M.inv -= dt;
    M.spawnT -= dt;
    if (M.spawnT <= 0 && M.passed + M.rocks.length < 8) { M.spawnT = 1.5; M.rocks.push({ x: 700, gap: 120 + Math.random() * 240, done: false }); }
    for (const r of M.rocks) {
      r.x -= 190 * dt;
      if (!r.done && r.x < 100) { r.done = true; M.passed++; Sfx.select(); }
      if (M.inv <= 0 && Math.abs(r.x - 140) < 30 && Math.abs(M.y - r.gap) > 62) {
        M.inv = 1; M.hits++; Sfx.hurt(); M.msg = 'BATEU!';
        if (M.hits >= 3) { M.hits = 0; M.passed = 0; M.rocks = []; M.spawnT = 1; M.msg = 'MESTRE DRACO: DE NOVO!'; return; }
      }
    }
    M.rocks = M.rocks.filter(r => r.x > -60);
    if (M.passed >= 8 && !M.done) { M.done = true; setTimeout(() => M.res(), 500); }
  },
  drawMini() {
    const M = this.mini, t = M.t;
    ctx.fillStyle = 'rgba(20,6,4,0.92)'; ctx.fillRect(0, 0, 640, 480);
    if (M.kind === 'aim') {
      text('LIÇÃO 1: PONTARIA', 320, 30, 40, '#ffb21a', 'center');
      text('Aperte A quando a agulha estiver no VERDE', 320, 80, 26, '#e8d8c8', 'center');
      const set = SPR.dragon[G.dragon];
      drawSpr(set.right[Math.floor(t * 6) % 2], 60, 150, 4);
      drawSpr(SPR.alvo, 500, 150, 5);
      if (M.shot) {
        const k = Math.min(1, M.shot.t / 0.4), y = M.shot.ok ? 200 : 200 + k * 140;
        drawFlame(170 + k * 330, y, 18, t * 12);
        if (M.shot.ok && k >= 1) { ctx.fillStyle = 'rgba(255,200,40,0.6)'; ctx.beginPath(); ctx.arc(540, 200, 40, 0, Math.PI * 2); ctx.fill(); }
      }
      const bx = 80, bw = 480, by = 340;
      ctx.fillStyle = '#000'; ctx.fillRect(bx - 4, by - 4, bw + 8, 40);
      ctx.fillStyle = '#5a2a1a'; ctx.fillRect(bx, by, bw, 32);
      ctx.fillStyle = '#3aca4a'; ctx.fillRect(bx + (M.zone - 0.08) * bw, by, 0.16 * bw, 32);
      ctx.fillStyle = '#fff'; ctx.fillRect(bx + M.needle * bw - 3, by - 8, 6, 48);
      text(`ACERTOS: ${M.hits} / 5     ERROS: ${M.miss} / 3`, 320, 396, 28, '#ffe680', 'center');
      if (M.msg) text(M.msg, 320, 432, 30, M.msg === 'NO ALVO!' ? '#7aff7a' : '#ff9a9a', 'center');
      return;
    }
    const sky = ctx.createLinearGradient(0, 0, 0, 480);
    sky.addColorStop(0, '#3a1a2a'); sky.addColorStop(1, '#a8401a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = 'rgba(255,200,180,0.25)';
    for (let i = 0; i < 6; i++) { const x = ((i * 150 - t * 60) % 800 + 800) % 800 - 80; ctx.beginPath(); ctx.ellipse(x, 60 + i * 60, 60, 16, 0, 0, Math.PI * 2); ctx.fill(); }
    for (const r of M.rocks) {
      ctx.fillStyle = '#000'; ctx.fillRect(r.x - 24, 0, 48, r.gap - 62); ctx.fillRect(r.x - 24, r.gap + 62, 48, 480);
      ctx.fillStyle = '#4a3a36'; ctx.fillRect(r.x - 22, 0, 44, r.gap - 64); ctx.fillRect(r.x - 22, r.gap + 64, 44, 480);
      ctx.fillStyle = '#ff7a1a'; ctx.fillRect(r.x - 10, r.gap - 70, 20, 4); ctx.fillRect(r.x - 10, r.gap + 66, 20, 4);
    }
    if (M.inv <= 0 || Math.floor(M.inv * 12) % 2) drawRider(140 - 52, M.y - 30, 4, t, false);
    text('LIÇÃO 2: VOO', 320, 14, 34, '#ffb21a', 'center');
    text(`ROCHAS: ${M.passed} / 8    BATIDAS: ${M.hits} / 3`, 320, 440, 26, '#ffe680', 'center');
    if (M.t < 3) text('Mova para CIMA e para BAIXO', 320, 60, 26, '#fff', 'center');
  },

  // ----- topo do vulcão -----
  async takeHeart() {
    const W = World, F = G.flags;
    if (F.p8heart) return W.say(['* (O altar está vazio.)']);
    W.locked = true;
    Sfx.save();
    await W.say(['* (No topo do Gigante Adormecido, um altar de obsidiana.)', '* (Em cima dele, um cristal vermelho que pulsa como um coração.)', '* (Você pegou o CORAÇÃO DO VULCÃO!)']);
    F.p8heart = true;
    if (!G.dragon) G.dragon = 'laranja';
    const d = this.meuDragao(), p = W.player;
    Object.assign(d, { hidden: false, x: p.x + 40, y: p.y - 60, flip: true, rider: false, k: null });
    Sfx.whoosh();
    await W.walk(d, [[p.x + 32, p.y]], 80);
    await W.say(['* (Seu dragão pousa do seu lado. Ele não tira os olhos do cristal.)']);
    for (;;) {
      const r = await W.ask('* (Dar o CORAÇÃO DO VULCÃO para o seu dragão?)', ['Dar o coração', 'Ainda não']);
      if (r === 0) break;
      await W.say(['* (Seu dragão faz cara de choro.)', '* (Ele encosta a cabeça na sua mão. Bem fofo.)']);
    }
    await this.evolve(d);
    await this.wakeGiant(d);
  },

  async evolve(d) {
    const W = World;
    const base = DRAGONS[G.dragon].base ? null : G.dragon;
    const evo = base ? DRAGON_EVO[base] : G.dragon;
    await W.say(['* (Seu dragão engole o cristal...)', '* (O corpo dele começa a brilhar.)']);
    Sfx.magic();
    for (let i = 0; i < 14; i++) {
      d.k = i % 2 ? evo : (base || evo);
      for (let f = 0; f < 6 + i; f++) { d.flash = Math.max(0, 1 - f / 6); await nextFrame(); }
    }
    d.k = null; d.flash = 1;
    G.dragon = evo;
    W.shake = 1; Sfx.roar(); Sfx.levelUp();
    for (let f = 0; f < 40; f++) { d.flash = 1 - f / 40; await nextFrame(); }
    d.flash = 0;
    const L = {
      lava: ['* (Seu dragão virou o DRAGÃO DE LAVA!)', '* (Agora o sopro dele é MAGMA: muito mais dano, e a queima dura mais tempo e machuca mais.)'],
      neve: ['* (Seu dragão virou o DRAGÃO DE NEVE!)', '* (Ele ficou MUITO mais rápido, e agora pode CONGELAR o inimigo: o inimigo perde 1 ataque.)'],
      trevas: ['* (Seu dragão virou o DRAGÃO DAS TREVAS!)', '* (O golpe dele agora causa um dano ENORME.)'],
    };
    await W.say(L[evo]);
  },

  async wakeGiant(d) {
    const W = World, p = W.player;
    Sfx.stopMusic(); Sfx.rumble(); W.shake = 2; this.quake = 1;
    await W.say(['* (...)', '* (A montanha inteira TREME.)', '* (O Gigante Adormecido abre um olho de fogo.)', '* (Ele sentiu o coração sair do peito dele.)']);
    Sfx.rumble(); W.shake = 2.5;
    for (const [x, y] of [[30, 13], [31, 13], [32, 13], [33, 13], [34, 13]]) { W.setTile(x, y, 'L'); W.redrawTile(x, y); }
    await W.say(['* (A lava sobe! O caminho de volta desmoronou!)', '* (Não tem como descer a pé...)', '* (Seu dragão abaixa as asas e olha pra você.)', '* (Ele aprendeu a voar no treino. Agora ele tem força pra te carregar.)']);
    const r = await W.ask('* (Montar no dragão?)', ['Montar!']);
    void r;
    Sfx.whoosh();
    p.hidden = true;
    Object.assign(d, { rider: true, flip: false, x: p.x, y: p.y });
    Sfx.playMusic('voo');
    for (let i = 0; i < 90; i++) { await nextFrame(); d.y -= 2 + i * 0.06; d.x += i * 0.05; }
    G.flags.p8done = true;
    this.quake = 0;
    W.saveHere();
    await Fade.to(1, 1.2);
    Game.cine = Cine8; Game.scene = 'cine'; Cine8.run();
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere();
    await W.say(['* (O calor do vulcão te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};

// ---------------- CUTSCENE: o voo ----------------
const Cine8 = {
  t: 0,
  async run() {
    Game.cine = this;
    this.t = 0;
    const map = { A: 'draco', Q: 'kitsune', E: 'tecela', X: 'golem', J: 'osso' };
    const say = items => Dialog.show(items.map(t => {
      const m = /^([AQEXJ]):\s*(.*)$/s.exec(t);
      return m ? { who: map[m[1]], t: '* ' + m[2] } : { t };
    }), false);
    Fade.a = 1; Fade.to(0, 0.8);
    Sfx.playMusic('voo');
    await wait(1.5);
    await say([
      '* (Vocês sobem cada vez mais alto. O vento quente bate no seu rosto.)',
      '* (Lá embaixo, o Gigante Adormecido solta fumaça... e volta a dormir, devagarinho.)',
      'A: VOOOA, PEQUENO! HOHOHO! ESSE É O MEU ALUNO!',
      'X: GRRM! VOLTE QUANDO QUISER!',
      'E: Tchau, humano! Os meus filhos vão contar sua história!',
      'Q: Que o vento te leve para um lugar de paz.',
      '* (Seu dragão ruge de alegria. Ele nunca tinha voado tão alto.)',
      '* (À frente, além das nuvens, uma luz nova aparece no horizonte...)',
    ]);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goEnd(8);
  },
  update(dt) { this.t += dt; Dialog.update(dt); },
  draw() {
    const t = this.t;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#2a1a4a'); sky.addColorStop(0.6, '#d8603a'); sky.addColorStop(1, '#ffb05a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // vulcão (o gigante) ficando para trás
    const vx = 120 - t * 8, vy = 330;
    ctx.fillStyle = '#2a1a1a'; ctx.beginPath(); ctx.moveTo(vx - 200, H); ctx.lineTo(vx - 40, vy); ctx.lineTo(vx + 40, vy); ctx.lineTo(vx + 200, H); ctx.fill();
    ctx.fillStyle = '#ff5a1a'; ctx.fillRect(vx - 40, vy - 4, 80, 6);
    ctx.fillStyle = '#ffb21a'; ctx.beginPath(); ctx.arc(vx - 12, vy + 40, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(80,60,60,0.5)';
    for (let i = 0; i < 6; i++) { const k = (t * 0.3 + i / 6) % 1; ctx.beginPath(); ctx.arc(vx + Math.sin(i) * 20, vy - k * 200, 20 + k * 30, 0, Math.PI * 2); ctx.fill(); }
    // nuvens
    ctx.fillStyle = 'rgba(255,230,220,0.6)';
    for (let i = 0; i < 8; i++) { const x = ((i * 130 - t * (60 + i * 10)) % 900 + 900) % 900 - 130; ctx.beginPath(); ctx.ellipse(x, 60 + (i * 47) % 260, 70, 18, 0, 0, Math.PI * 2); ctx.fill(); }
    drawRider(250, 70 + Math.sin(t * 2) * 12, 5, t, false);
    // linhas de vento
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const x = ((i * 97 - t * 500) % 700 + 700) % 700, y = 60 + i * 50; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y); ctx.stroke(); }
    Dialog.draw();
  },
};
