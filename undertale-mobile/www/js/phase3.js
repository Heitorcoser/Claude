// FASE 3 — A COLÔNIA DE GELO
// Longa e cheia de armadilhas: placas X/O, lago de gelo, estalactites, blocos,
// porta das piadas e ponte de gelo rachado.
'use strict';

Object.assign(ITEMS, {
  'Chocolate Quente': { heal: 25, price: 20, text: '* Você bebeu o Chocolate Quente.\n* Esquenta até a alma.' },
  'Sopa de Neve': { heal: 14, price: 12, text: '* Você tomou a Sopa de Neve.\n* ...É só água gelada. Mas faz bem.' },
  'Picolé Ardente': { heal: 40, price: 32, text: '* Você comeu o Picolé Ardente.\n* Gelado E apimentado?! Que confusão boa.' },
});

const WALK3 = ',.;ixO+cp';
const XO_TILES = [[58, 13], [68, 13], [58, 23], [68, 23], [63, 17], [62, 18], [63, 18], [64, 18], [63, 19]];
const LAKE_ROCKS = [[75, 11], [75, 16], [77, 24], [77, 25], [78, 13], [79, 15], [79, 21], [80, 17], [81, 10], [81, 21], [82, 13], [82, 15], [82, 19],
  [84, 15], [84, 26], [85, 17], [85, 24], [86, 12], [86, 17], [86, 18], [87, 11], [87, 18], [87, 26], [88, 17], [88, 25], [89, 20], [89, 22], [90, 14],
  [91, 11], [92, 19], [92, 26], [93, 21], [93, 24], [94, 10]];
const SWITCHES = [[152, 29], [161, 23]];
const BLOCK_START = [[152, 24], [158, 27]];
const t2c = (tx, ty) => ({ x: tx * TS + 8, y: ty * TS + 12 }); // centro do tile (pés)

function penguinNpc(id, tx, ty, talk, dir = 'right') {
  return { id, x: tx2x(tx), y: ty2y(ty), w: 14, h: 8, solid: true, talk, dir,
    draw(sx, sy, t) {
      const img = this.dir === 'left' ? SPR.pinguimNpcL : SPR.pinguimNpc;
      const wob = Math.sin(t * 4 + this.x) * 1;
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(sx(this.x), sy(this.y), 14, 4, 0, 0, Math.PI * 2); ctx.fill();
      drawSpr(img, sx(this.x - 12) + wob, sy(this.y - 18), 2);
    } };
}

MAPS.gelo = {
  music: 'colonia',
  start: { x: tx2x(2), y: ty2y(19), dir: 'right' },
  anim: 'w',

  build() {
    const MW = 224, MH = 38, F = G.flags;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    const house = (x, y, w, h, doorX) => {
      rect(x, y, w, h - 2, 'R'); rect(x, y + h - 2, w, 2, 'H');
      g[y + h - 2][x + 1] = 'W'; g[y + h - 2][x + w - 2] = 'W'; g[y + h - 1][doorX] = 'D';
    };
    // A: entrada
    rect(1, 14, 21, 11, ','); rect(1, 18, 21, 3, '.');
    for (const [x, y] of [[3, 15], [6, 23], [10, 15], [14, 23], [18, 15], [20, 23], [2, 23], [7, 14], [16, 22]]) g[y][x] = 'T';
    // B: vila
    rect(22, 6, 32, 25, ','); rect(22, 18, 32, 3, '.');
    house(24, 6, 7, 6, 27); house(34, 6, 8, 6, 38); house(45, 6, 7, 6, 48);
    rect(27, 12, 1, 6, '.'); rect(38, 12, 1, 6, '.'); rect(48, 12, 1, 6, '.');
    for (let x = 23; x < 53; x += 3) g[29][x] = 'T';
    // C: placas X/O
    rect(54, 17, 2, 3, '.');
    rect(56, 11, 15, 15, '.');
    for (const [x, y] of XO_TILES) g[y][x] = F.p3g1 ? 'O' : 'x';
    rect(71, 17, 2, 3, '.'); for (let y = 17; y <= 19; y++) g[y][71] = '1';
    // D: lago de gelo
    rect(73, 17, 2, 3, '.');
    rect(75, 10, 20, 17, 'i');
    for (const [x, y] of LAKE_ROCKS) g[y][x] = 'k';
    rect(95, 12, 5, 1, '.');
    // E: corredor das estalactites
    rect(100, 10, 32, 5, '.');
    rect(128, 15, 4, 3, '.');
    // F: campo de neve funda
    rect(118, 18, 28, 16, ';');
    for (const [x, y] of [[121, 22], [126, 28], [133, 24], [139, 20], [141, 30], [124, 32], [136, 31], [130, 26], [143, 23], [119, 29]]) g[y][x] = 'T';
    rect(146, 26, 2, 1, '.');
    // G: blocos de gelo
    rect(148, 21, 17, 11, '.');
    for (const [x, y] of SWITCHES) g[y][x] = '+';
    g[22][155] = 'k'; g[30][163] = 'k';
    g[26][165] = '3'; rect(166, 26, 1, 1, '.');
    // H: porta das piadas
    rect(167, 24, 9, 5, '.');
    g[26][176] = 'J';
    rect(177, 25, 1, 3, '.');
    // I: ponte de gelo rachado
    rect(178, 20, 22, 13, 'w');
    rect(178, 21, 22, 11, 'c');
    const R = rng(77);
    let y = 26;
    for (let x = 178; x <= 199; x++) {
      g[y][x] = 'p';
      if ((x - 178) % 3 === 2 && x < 197) {
        const ny = 22 + ((R() * 9) | 0);
        while (y !== ny) { y += Math.sign(ny - y); g[y][x] = 'p'; }
      }
    }
    while (y !== 26) { y += Math.sign(26 - y); g[y][199] = 'p'; }
    rect(200, 25, 1, 3, '.');
    // J: casa dos irmãos fantasmas
    rect(201, 12, 21, 24, ',');
    rect(205, 13, 13, 5, 'N'); rect(205, 18, 13, 4, 'M');
    g[19][207] = 'V'; g[19][215] = 'V'; g[21][211] = 'X';
    rect(211, 22, 1, 8, '.'); rect(201, 26, 10, 1, '.');
    for (const [x, y] of [[203, 14], [219, 15], [220, 24], [202, 33], [217, 32], [208, 34], [214, 28]]) g[y][x] = 'T';
    return { g };
  },

  solid(c) {
    if (c === '1') return !G.flags.p3g1;
    if (c === '3') return !G.flags.p3g3;
    if (c === 'J') return !G.flags.p3joke;
    return !WALK3.includes(c);
  },

  tileImg(c, x, y, W) {
    const T = SPR.snowT, h = (x * 73 + y * 151) % 3;
    if (c === ',') return T.snow[h];
    if (c === '.') return T.path[h];
    if (c === ';') return T.deep[h];
    if (c === 'i') return T.ice[h];
    if (c === 'k') return MAPS.dragoncity.layer(W.tile(x - 1, y) === 'i' || W.tile(x + 1, y) === 'i' || W.tile(x, y + 1) === 'i' ? T.ice[h] : T.path[h], T.rock);
    if (c === '#') { const b = W.tile(x, y + 1); return WALK3.includes(b) || '13J'.includes(b) ? T.cliff : T.rockWall; }
    if (c === 'T') return MAPS.dragoncity.layer(W.tile(x, y + 1) === ';' ? T.deep[h] : T.snow[h], T.pine);
    if (c === 'R') return T.roofSnow; if (c === 'H') return T.logs; if (c === 'W') return T.logWin; if (c === 'D') return T.logDoor;
    if (c === 'x') return T.xTile; if (c === 'O') return T.oTile;
    if (c === '+') return P3.blockAt(x, y) ? T.switchOn : T.switchOff;
    if (c === '1') return G.flags.p3g1 ? T.path[0] : T.gate;
    if (c === '3') return G.flags.p3g3 ? T.path[0] : T.gate;
    if (c === 'J') return G.flags.p3joke ? T.path[0] : T.jokeDoor;
    if (c === 'w') return T.water[0];
    if (c === 'c') return T.bridgePlate; if (c === 'p') return T.bridgeSafe;
    if (c === 'N') return T.iceRoof; if (c === 'M') return T.iceWall; if (c === 'V') return T.iceWin; if (c === 'X') return T.iceDoor;
    return T.rockWall;
  },
  animImg(c, x, y, fr) { return c === 'w' ? SPR.snowT.water[(fr + x + y) % 3] : null; },

  ents(W) {
    const F = G.flags;
    const list = [
      { id: 'star1', x: tx2x(16), y: ty2y(16), w: 12, h: 8, spr: 'star', solid: true, talk: () => P3.useStar() },
      { id: 'star2', x: tx2x(124), y: ty2y(19), w: 12, h: 8, spr: 'star', solid: true, talk: () => P3.useStar() },
      { id: 'star3', x: tx2x(204), y: ty2y(30), w: 12, h: 8, spr: 'star', solid: true, talk: () => P3.useStar() },
      { id: 'stranger', x: tx2x(13), y: ty2y(19), w: 14, h: 8, solid: true, hidden: !!F.phone, alpha: 1,
        talk: () => W.say(['S: ...']),
        draw(sx, sy, t) { drawSpr(SPR.encapuzado, sx(this.x - 8), sy(this.y - 24) + Math.sin(t * 1.5) * 2, 2, this.alpha); } },
      { id: 'signA', x: tx2x(5), y: ty2y(17), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(['* (COLÔNIA DE GELO →)', "* (Alguém riscou embaixo: 'HUMANOS NÃO SÃO BEM-VINDOS. — IceGhost')"]) },
      { id: 'board', x: tx2x(52), y: ty2y(16), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(['* (Quadro de avisos da colônia:)', "* 'ATENÇÃO: Os irmãos fantasmas encheram o caminho de ARMADILHAS. Desculpem o transtorno. — A Prefeitura'",
          "* 'Piada do dia: por que o boneco de neve ficou triste? Porque estava DERRETIDO de saudade. — FG'"]) },
      penguinNpc('p1', 30, 15, () => P3.talkPenguin(1)),
      penguinNpc('p2', 43, 22, () => P3.talkPenguin(2), 'left'),
      penguinNpc('p3', 50, 14, () => P3.talkPenguin(3), 'left'),
      penguinNpc('pkid', 26, 25, () => P3.talkPenguin(4)),
      { id: 'shop', x: tx2x(40) + 8, y: ty2y(25), w: 40, h: 12, solid: true, talk: () => P3.shop(),
        draw(sx, sy, t) {
          const x = sx(this.x - 22), y = sy(this.y - 34);
          drawSpr(SPR.pinguimNpc, x + 22, y + 2 + Math.sin(t * 3), 2);
          ctx.fillStyle = '#000'; ctx.fillRect(x - 4, y + 34, 96, 34);
          ctx.fillStyle = '#7a4a24'; ctx.fillRect(x - 2, y + 36, 92, 30);
          ctx.fillStyle = '#f4f8ff'; ctx.fillRect(x - 2, y + 36, 92, 6);
          for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#f4f8ff' : '#3a7ad8'; ctx.fillRect(x - 6 + i * 17, y - 22, 17, 14); }
          ctx.fillStyle = '#000'; ctx.fillRect(x - 6, y - 8, 102, 2); ctx.fillRect(x - 4, y - 8, 4, 44); ctx.fillRect(x + 88, y - 8, 4, 44);
        } },
      { id: 'snowman1', x: tx2x(34), y: ty2y(26), w: 14, h: 6, spr: 'snowman', solid: true, talk: () => W.say(['* (Um boneco de neve. Ele parece te julgar.)']) },
      { id: 'snowman2', x: tx2x(19), y: ty2y(22), w: 14, h: 6, spr: 'snowman', solid: true, talk: () => W.say(['* (Alguém fez um boneco de neve com cara de fantasma.)']) },
      { id: 'leverC', x: tx2x(57), y: ty2y(12), w: 12, h: 6, solid: true, talk: () => P3.leverXO(),
        draw(sx, sy) { drawSpr(SPR.lever[G.flags.p3g1 ? 1 : 0], sx(this.x - 7), sy(this.y - 18), 2); } },
      { id: 'signC', x: tx2x(60), y: ty2y(11), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(["* 'PLACAS GELADAS: transforme todo X em O.'", "* 'Mas se pisar duas vezes na mesma placa... ela volta a ser X. Hehehe. — IceGhost'"]) },
      { id: 'signD', x: tx2x(73), y: ty2y(17), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(["* 'LAGO ESCORREGADIO. No gelo você só para quando bate em algo.'", "* 'Boa sorte pra sair do outro lado. — IceGhost'"]) },
      { id: 'signE', x: tx2x(101), y: ty2y(10), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(["* 'CORREDOR DAS ESTALACTITES.'", "* 'Fique longe das SOMBRAS no chão. Ou não. Eu não ligo. — IceGhost'"]) },
      { id: 'leverG', x: tx2x(149), y: ty2y(22), w: 12, h: 6, solid: true, talk: () => P3.leverBlocks(),
        draw(sx, sy) { drawSpr(SPR.lever[G.flags.p3g3 ? 1 : 0], sx(this.x - 7), sy(this.y - 18), 2); } },
      { id: 'signG', x: tx2x(151), y: ty2y(21), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(["* 'Empurre os BLOCOS DE GELO até os BOTÕES. Bloco no botão fica preso.'", "* 'A alavanca coloca tudo no lugar se você fizer besteira. Você VAI fazer besteira. — IceGhost'"]) },
      { id: 'signH', x: tx2x(170), y: ty2y(24), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(["* 'PORTA DAS PIADAS! Acerte 3 piadas e ela abre.'", "* 'Errou? Alçapão! HAHAHA! — FireGhost'"]) },
      { id: 'signI', x: tx2x(175), y: ty2y(28), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(["* 'PONTE DE GELO. Algumas placas estão rachadas.'", "* 'Os pinguins sempre sabem onde pisar. — Pinguim Anônimo'"]) },
    ];
    // blocos de gelo empurráveis
    BLOCK_START.forEach(([bx, by], i) => {
      const pos = F.p3g3 ? SWITCHES[i] : [bx, by];
      list.push({ id: 'block' + i, block: true, tx: pos[0], ty: pos[1], x: tx2x(pos[0]), y: pos[1] * TS + 15, w: 14, h: 12, solid: true,
        draw(sx, sy) { drawSpr(SPR.iceBlock, sx(this.x - 8), sy(this.y - 17), 2); } });
    });
    return list;
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 9, y: 14, w: 2, h: 11, when: () => !F.phone, run: () => P3.strangerScene() },
      { x: 54, y: 17, w: 2, h: 3, when: () => F.phone && !F.p3cHint, run: () => { F.p3cHint = true; P3.note(['* (Uma sala cheia de placas de gelo com X.)', '* (Tem uma placa e uma alavanca no canto.)']); } },
      { x: 96, y: 12, w: 2, h: 1, when: () => !F.p3lake, run: () => P3.afterLake() },
      { x: 118, y: 18, w: 14, h: 2, when: () => !F.p3field, run: () => P3.enterField() },
      { x: 200, y: 25, w: 2, h: 3, when: () => !F.p3bridge, run: () => P3.afterBridge() },
    ];
  },

  onEnter(W) { if (!G.flags.p3arrived) P3.arrive(); },

  musicAt(W) {
    const [x, y] = W.feetTile();
    if (x < 54) return 'colonia';
    if (x < 100) return 'puzzle';
    if (x < 132 && y < 15) return 'icetheme';
    if (x < 146) return 'nevasca';
    if (x <= 200) return 'puzzle';
    return 'icetheme';
  },

  // ---------- deslizar no gelo ----------
  playerControl(W, dt) {
    const p = W.player;
    if (p.slide) {
      const s = p.slide, sp = 160 * dt;
      const dx = s.to.x - p.x, dy = s.to.y - p.y, d = Math.hypot(dx, dy);
      if (d <= sp) {
        p.x = s.to.x; p.y = s.to.y;
        const [tx, ty] = W.feetTile();
        if (W.tile(tx, ty) !== 'i') { p.slide = null; return false; }
        const nx = tx + s.dx, ny = ty + s.dy;
        if (W.solidTile(nx, ny)) { p.slide = null; return true; }
        s.to = t2c(nx, ny);
      } else { p.x += dx / d * sp; p.y += dy / d * sp; }
      return true;
    }
    const [tx, ty] = W.feetTile();
    if (W.tile(tx, ty) !== 'i') { p.onIce = false; return false; }
    let dir = null;
    if (!p.onIce) dir = p.dir; // acabou de pisar no gelo: continua escorregando
    else {
      const v = moveVector();
      if (Math.abs(v.x) > 0.4 || Math.abs(v.y) > 0.4) dir = Math.abs(v.x) > Math.abs(v.y) ? (v.x < 0 ? 'left' : 'right') : (v.y < 0 ? 'up' : 'down');
    }
    p.onIce = true; p.moving = false;
    if (!dir) return true;
    p.dir = dir;
    const [ddx, ddy] = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[dir];
    const c = t2c(tx, ty);
    if (W.solidTile(tx + ddx, ty + ddy)) { p.x = c.x; p.y = c.y; return true; }
    if (ddx) p.y = c.y; else p.x = c.x;
    p.slide = { dx: ddx, dy: ddy, to: t2c(tx + ddx, ty + ddy) };
    return true;
  },

  update(W, dt) {
    const p = W.player, F = G.flags;
    this.updateIcicles(W, dt);
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
    const [tx, ty] = W.feetTile();
    const key = tx + ',' + ty;
    if (key !== this.lastTile) {
      this.lastTile = key;
      const c = W.tile(tx, ty);
      if (!F.p3g1 && (c === 'x' || c === 'O')) P3.stepXO(tx, ty, c);
    }
    // ponte rachada
    if (W.tile(tx, ty) === 'c') {
      const cc = t2c(tx, ty);
      if (Math.abs(p.x - cc.x) < 6 && Math.abs(p.y - cc.y) < 6) P3.fall(tx, ty);
    }
    // empurrar blocos
    if (!p.slide) P3.pushCheck(W, dt);
  },

  // ---------- estalactites ----------
  icicles: [],
  updateIcicles(W, dt) {
    const p = W.player, inZone = p.x > 100 * TS && p.x < 132 * TS && p.y > 10 * TS && p.y < 15.2 * TS;
    for (const s of this.icicles) {
      s.t += dt;
      if (!s.hit && s.t >= 0.9) {
        s.hit = true;
        if (!W.locked && Math.hypot(p.x - s.x, (p.y - 4) - s.y) < 12) P3.icicleHit(W);
      }
    }
    this.icicles = this.icicles.filter(s => s.t < 1.3);
    if (!inZone || W.locked) return;
    this.waveT = (this.waveT || 0) - dt;
    if (this.waveT <= 0) {
      this.waveT = 1.1;
      Sfx.icicle();
      for (let i = 0; i < 4; i++) {
        const x = Math.min(131 * TS, Math.max(100 * TS, p.x - 30 + Math.random() * 110));
        const y = 10 * TS + 6 + Math.random() * (5 * TS - 12);
        this.icicles.push({ x, y, t: 0 });
      }
      this.icicles.push({ x: p.x + 20 * (W.player.dir === 'right' ? 1 : 0), y: p.y - 4, t: 0 });
    }
  },

  overlay(W, sx, sy) {
    for (const s of this.icicles) {
      const k = Math.min(1, s.t / 0.9);
      ctx.fillStyle = `rgba(20,30,60,${0.15 + k * 0.35})`;
      ctx.beginPath(); ctx.ellipse(sx(s.x), sy(s.y), 6 + k * 8, 3 + k * 3, 0, 0, Math.PI * 2); ctx.fill();
      if (!s.hit) {
        const y = sy(s.y) - (1 - k) * 220;
        ctx.fillStyle = '#9fe4ff'; ctx.beginPath(); ctx.moveTo(sx(s.x) - 6, y - 26); ctx.lineTo(sx(s.x) + 6, y - 26); ctx.lineTo(sx(s.x), y); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(sx(s.x) - 2, y - 24, 2, 14);
      } else {
        ctx.fillStyle = '#e8f8ff';
        for (let i = 0; i < 5; i++) { const a = i * 1.3, r = (s.t - 0.9) * 90; ctx.fillRect(sx(s.x) + Math.cos(a) * r, sy(s.y) - 6 + Math.sin(a) * r * 0.5, 3, 3); }
      }
    }
    // neve caindo
    const t = W.t;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 70; i++) {
      const x = ((i * 97 + t * (20 + (i % 5) * 6)) % 680) - 20 + Math.sin(t + i) * 8;
      const y = ((i * 61 + t * (40 + (i % 7) * 8)) % 500) - 10;
      ctx.fillRect(x, y, i % 3 ? 2 : 3, i % 3 ? 2 : 3);
    }
    if (P3.ringing) {
      const sh = Math.sin(W.t * 60) * 3;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(520, 16, 104, 70);
      drawSpr(SPR.phone, 540 + sh, 24, 2);
      text('RING!', 572, 40, 28, '#ffe680');
    }
  },

  interactTile(W, c, tx, ty) {
    if (c === 'D') {
      const msgs = { '27,11': ['* (Toc toc.)', 'P: Quem é? ...Um humano? Desculpa, tô de pijama. Volta amanhã!'],
        '38,11': ['* (A porta está congelada. Literalmente.)'], '48,11': ['* (Um bilhete: "Fui pescar. Volto quando o gelo derreter." )'] };
      return W.say(msgs[tx + ',' + ty] || ['* (Trancada.)']);
    }
    if (c === 'J' && !G.flags.p3joke) return P3.jokeDoor();
    if (c === 'X') return P3.mansion();
    if (c === '1' && !G.flags.p3g1) return W.say(['* (Um portão de gelo. Transforme todos os X em O para abrir.)']);
    if (c === '3' && !G.flags.p3g3) return W.say(['* (Um portão de gelo. Os dois botões precisam estar pressionados.)']);
    if (c === 'w') return W.say(['* (Água gelada. Melhor não nadar.)']);
  },

  encounter: {
    tile: ';', counter: 'enc3', max: 7, first: 120, min: 260, rand: 220,
    enabled: () => true,
    pick: n => ['pinguim', 'nevoso', 'gelinho'][n < 2 ? n : (Math.random() * 3) | 0],
    opts: () => ({ dragon: G.dragon }),
    doneText: '* (O campo de neve ficou em silêncio. Só o vento.)',
  },
};

// ---------------- CELULAR ----------------
const Phone = {
  async open() {
    const W = World;
    if (World.mapId === 'ilha' && G.flags.p5camp && !G.flags.p5out) {
      return W.say(['* (SEM SINAL.)', '* (A Marshmallow disse: só do lado de FORA da cerca.)']);
    }
    const opts = ['Treinador'].concat(G.flags.bitContact ? ['Bit'] : [], ['???', 'Sair']);
    const o = opts[await W.ask('* (CELULAR) Para quem ligar?', opts)];
    if (o === 'Treinador') return P3.callTrainer();
    if (o === 'Bit') {
      Sfx.ring(); await wait(0.4); Sfx.robotSong();
      return W.say(['B: BIP BOP! Alô?! É você?!', 'B: Os valentões agora sentam comigo no recreio. Dá pra acreditar?',
        'B: Toma uma musiquinha pra viagem! ♪', '* (A música do Bit te deixa animado.)']);
    }
    if (o === '???') {
      Sfx.ring();
      await W.say(['* (Chamando...)', '* (...)', '* (Alguém atende. Só se ouve o vento.)', 'S: ...Ainda não é hora.', '* (Desligou.)']);
    }
  },
};

// ---------------- CUTSCENE: enquanto isso... ----------------
const Cine3 = {
  t: 0, panel: 0, shake: 0, white: 0,
  async run() {
    const say = items => Dialog.show(items.map(t => {
      const m = /^([FG]):\s*(.*)$/s.exec(t);
      return m ? { who: m[1] === 'F' ? 'fire' : 'ice', t: '* ' + m[2] } : { t };
    }), false);
    Object.assign(this, { t: 0, panel: 0, shake: 0, white: 0, iceX: 260, done: false });
    const killed = !G.flags.fireFriend;
    Fade.a = 1; Fade.to(0, 0.8);
    Sfx.playMusic('house');
    await wait(0.8);
    await say(['* Enquanto você lutava na casinha do rio...', '* ...na COLÔNIA DE GELO...']);
    await say(['G: Hm hm hmmm... mais uma estátua pra coleção.', 'G: Esta aqui ficou linda. Pena que não é um humano DE VERDADE.']);
    await wait(0.3);
    this.shake = 0.4; Sfx.fire();
    await say(['G: ...?', 'G: Esse cheiro... fumaça. Vindo do rio.', 'G: Irmão?']);
    await Fade.to(1, 1.5);
    this.panel = 1; Sfx.whoosh();
    await Fade.to(0, 1.2);
    if (killed) {
      await say(['G: IRMÃO?!', '* (No chão da casinha, só sobrou um montinho de cinzas... e uma brasa minúscula.)', 'G: Não... não, não, não...', 'G: Quem fez isso com você?!']);
    } else {
      await say(['G: IRMÃO?!', '* (FireGhost está jogado no chão, com a chama quase apagada.)', 'F: Ir...mãozinho... um humano... ele... riu das minhas pia...', 'G: UM HUMANO fez isso com você?!']);
    }
    Sfx.stopMusic();
    await Fade.to(1, 0.8);
    this.panel = 2;
    await Fade.to(0, 0.8);
    Sfx.playMusic('icetheme');
    this.shake = 1.5; Sfx.freeze();
    await say(['G: O HUMANO.', 'G: Eu senti o cheiro dele na cidade. Eu SABIA.', 'G: Escuta aqui, humano. Onde quer que você esteja...']);
    this.shake = 2; Sfx.boo(); this.white = 1;
    await say(['G: EU VOU TER A MINHA VINGANÇA!']);
    await wait(0.6);
    await Fade.to(1, 1.2);
    Sfx.stopMusic();
    this.done = true;
    G.flags.p3cine = true;
    Game.enterMap('gelo');
  },
  update(dt) {
    this.t += dt;
    if (this.shake > 0) this.shake -= dt;
    if (this.white > 0) this.white -= dt;
    Dialog.update(dt);
  },
  draw() {
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 14 * Math.min(1, this.shake), (Math.random() - 0.5) * 8 * Math.min(1, this.shake));
    if (this.panel === 0) this.drawColony();
    else if (this.panel === 1) this.drawHouse();
    else this.drawClose();
    ctx.restore();
    if (this.white > 0) { ctx.fillStyle = `rgba(230,250,255,${Math.min(1, this.white)})`; ctx.fillRect(0, 0, W, H); }
    Dialog.draw();
  },
  snow(n, speed) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < n; i++) {
      const x = ((i * 97 + this.t * speed * (1 + i % 3)) % 680) - 20, y = ((i * 53 + this.t * speed * 1.5) % 500) - 10;
      ctx.fillRect(x, y, 2, 2);
    }
  },
  drawColony() {
    const sky = ctx.createLinearGradient(0, 0, 0, 300);
    sky.addColorStop(0, '#0a1430'); sky.addColorStop(1, '#3a5a8a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e4ecf6'; ctx.beginPath(); ctx.moveTo(0, 300); ctx.quadraticCurveTo(200, 220, 400, 280); ctx.quadraticCurveTo(540, 320, 640, 260); ctx.lineTo(640, 480); ctx.lineTo(0, 480); ctx.fill();
    // mansão de gelo ao fundo
    ctx.fillStyle = '#5a90c4'; ctx.fillRect(420, 150, 160, 120); ctx.fillStyle = '#3a6a9a';
    ctx.beginPath(); ctx.moveTo(400, 150); ctx.lineTo(500, 80); ctx.lineTo(600, 150); ctx.fill();
    ctx.fillStyle = '#7fd9ff'; ctx.fillRect(445, 180, 26, 26); ctx.fillRect(530, 180, 26, 26);
    // estátuas de gelo (humanos de mentira)
    for (const [x, s] of [[80, 1], [170, 0.9], [330, 1.05]]) {
      ctx.globalAlpha = 0.75; ctx.fillStyle = '#9fe4ff'; ctx.fillRect(x - 26 * s, 250 - 90 * s, 52 * s, 90 * s); ctx.globalAlpha = 1;
      ctx.fillStyle = '#3a6a9a'; ctx.beginPath(); ctx.arc(x, 250 - 66 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 9 * s, 250 - 56 * s, 18 * s, 34 * s); ctx.fillRect(x - 8 * s, 250 - 22 * s, 6 * s, 18 * s); ctx.fillRect(x + 2 * s, 250 - 22 * s, 6 * s, 18 * s);
      ctx.fillStyle = '#d8f4ff'; ctx.fillRect(x - 22 * s, 250 - 86 * s, 6 * s, 50 * s);
    }
    drawGhost('ice', 220 + Math.sin(this.t) * 20, 150 + Math.sin(this.t * 2) * 6, 4, this.t);
    this.snow(60, 30);
  },
  drawHouse() {
    ctx.fillStyle = '#100808'; ctx.fillRect(0, 0, W, H);
    const grd = ctx.createRadialGradient(80, 200, 10, 80, 200, 300);
    grd.addColorStop(0, 'rgba(255,90,20,0.45)'); grd.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a2420'; ctx.fillRect(220, 40, 220, 60); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(220, 100, 220, 110);
    ctx.fillStyle = '#120a06'; ctx.fillRect(310, 130, 40, 80);
    ctx.fillStyle = '#2f5a34'; ctx.fillRect(0, 210, W, 270);
    if (!G.flags.fireFriend) {
      ctx.fillStyle = '#4a4245'; ctx.beginPath(); ctx.ellipse(250, 270, 46, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a6266'; ctx.beginPath(); ctx.ellipse(250, 264, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
      drawFlame(252, 260, 10 + Math.sin(this.t * 6) * 2, this.t * 8);
    } else {
      ctx.save(); ctx.translate(250, 250); ctx.rotate(Math.PI / 2 - 0.1); drawGhost('fire', -40, -50, 3, this.t * 0.3, 0.75); ctx.restore();
    }
    drawGhost('ice', 400, 170 + Math.sin(this.t * 2) * 4, 3.4, this.t, 1, true);
    this.snow(20, 15);
  },
  drawClose() {
    ctx.fillStyle = '#06102a'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(159,228,255,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < 30; i++) {
      const k = (this.t * 2 + i / 30) % 1, a = i * 2.4;
      ctx.beginPath(); ctx.moveTo(320 + Math.cos(a) * 600 * (1 - k), 200 + Math.sin(a) * 600 * (1 - k)); ctx.lineTo(320 + Math.cos(a) * 640 * (1 - k), 200 + Math.sin(a) * 640 * (1 - k)); ctx.stroke();
    }
    drawGhost('ice', 320 - 14 * 9, 40 + Math.sin(this.t * 3) * 4, 9, this.t);
    this.snow(120, 120);
  },
};

// ---------------- Roteiros da Fase 3 ----------------
const P3 = {
  ringing: false,
  ent(id) { return World.ents.find(e => e.id === id); },
  blocks() { return World.ents.filter(e => e.block); },
  blockAt(x, y) { return World.ents && World.M === MAPS.gelo && World.ents.some(e => e.block && e.tx === x && e.ty === y); },

  async note(lines) { const W = World; W.locked = true; await W.say(lines); W.locked = false; },

  async ring(insist) {
    const W = World;
    this.ringing = true;
    for (let i = 0; i < 2; i++) { Sfx.ring(); await wait(0.7); }
    for (;;) {
      const r = await W.ask('* (O celular está tocando... Na tela: TREINADOR)', ['Atender', 'Ignorar']);
      if (r === 0 || !insist) break;
      this.ringing = true; Sfx.ring(); await wait(0.5); Sfx.ring();
      await W.say(['* (...ele liga de novo. E de novo. Ele é insistente.)']);
    }
    this.ringing = false;
  },

  async arrive() {
    const W = World, p = W.player;
    W.locked = true;
    G.flags.p3arrived = true;
    p.x = tx2x(2); p.y = ty2y(19); p.dir = 'right';
    W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('colonia'); Fade.to(0, 0.7);
    await W.walk(p, [[tx2x(6), ty2y(19)]], 50);
    await W.say(['* (Brrr... o caminho ao norte de DragonCity leva a um lugar MUITO gelado.)', '* (COLÔNIA DE GELO.)', '* (Seu dragão se encolhe de frio, escondido em algum lugar.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async strangerScene() {
    const W = World, p = W.player, s = this.ent('stranger');
    W.locked = true;
    Sfx.stopMusic();
    p.dir = 'right';
    await W.say(['* (Uma figura encapuzada está parada no meio da neve.)', 'S: ...', 'S: Então você é o humano de quem todos estão falando.']);
    await W.walk(s, [[p.x + 26, p.y]], 30);
    await W.say(['S: Tome. Vai precisar disso.']);
    Sfx.select(); G.flags.phone = true;
    await W.say(['* (O estranho encapuzado te entregou um CELULAR.)', 'S: Não confie no gelo...', 'S: ...nem em todos os amigos.']);
    Sfx.whoosh();
    for (let i = 0; i < 40; i++) { await nextFrame(); s.alpha = 1 - i / 40; s.y -= 0.3; }
    s.hidden = true;
    await W.say(['* (Ele sumiu numa rajada de neve.)']);
    await wait(1.2);
    await this.ring(true);
    Sfx.playMusic('instr');
    const brother = G.flags.fireFriend
      ? 'T: O FireGhost está bem, tá? Só muito cansado de tanto contar piada.'
      : 'T: E calma: fantasma não morre de verdade, sabia? O FireGhost virou cinza, mas vai se recompor. Só demora.';
    await W.say([
      'T: Alô? Alô?! Funcionou! Oi, pequeno humano!',
      'T: Sou eu, seu antigo INSTRUTOR! Agora me chamam de TREINADOR... longa história. Tem a ver com um apito.',
      'T: Escuta, tenho notícias.',
      'T: O fantasma de GELO pegou o fantasma de FOGO e levou pra casa deles, aqui na COLÔNIA DE GELO.',
      brother,
      'T: O problema é que os dois ficaram MUITO estressados com você.',
      'T: Eles espalharam ARMADILHAS e QUEBRA-CABEÇAS pela colônia inteira só pra te atrasar.',
      'T: Vai ser longo... e bem chato. Mas eu confio em você!',
      'T: Se ficar travado, me liga. Abra o menu (B) e escolha CELULAR.',
      'T: Aliás... quem te deu esse celular? Um ENCAPUZADO? Hmm.',
      'T: Estranho. Muito estranho. Tchau!',
    ]);
    await W.say(['* (Clique.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async callTrainer() {
    const W = World, F = G.flags, x = W.player.x / TS;
    Sfx.ring();
    await wait(0.5);
    let tip;
    if (World.mapId === 'futuro') {
      if (!F.p4met) tip = ['T: Uma cidade cheia de robôs! Vai lá, explore. Alguém vai aparecer.'];
      else if ((F.p4tour || 0) < 4) tip = ['T: Um robô amigo te mostrando a cidade? Que fofo! Siga a setinha amarela dele.'];
      else if (!F.p4day2) tip = ['T: Já é noite aí? Vá dormir na casa do Bit. A porta azul da praça.'];
      else if (!F.p4bully) tip = ['T: Escola! A avenida leva até lá. Fique perto do Bit.'];
      else if (!F.p4class) tip = ['T: Entre na escola e ajude o Bit na aula. Ele sabe matemática, mas sentimentos humanos... nem tanto.'];
      else tip = ['T: Valentões? No meu tempo era só pedir pra parar.', 'T: Converse com eles, defenda o Bit... ou mostre que vocês são amigos.'];
      return W.say(['T: Alô! Treinador falando!'].concat(tip, ['T: Boa sorte!']));
    }
    if (!F.p3g1) tip = ['T: As placas com X? Pise em cada uma UMA vez só.', 'T: Se pisar de novo, ela volta a ser X. Se bagunçar, use a alavanca.', 'T: Dica: na cruz do meio, entre por um lado e saia pelo outro... sem voltar.'];
    else if (!F.p3lake) tip = ['T: Lago de gelo! No gelo você só para quando bate em alguma coisa.', 'T: Comece pela parte de BAIXO da margem e escorregue pra direita.', 'T: Se errar, volte pra margem e tente de novo. É chato, eu sei.'];
    else if (x < 132 && !F.p3field) tip = ['T: Estalactites? Olhe as SOMBRAS no chão e saia de baixo delas!'];
    else if (!F.p3g3) tip = ['T: Blocos de gelo: você só consegue EMPURRAR, nunca puxar.', 'T: Se um bloco ficar preso num canto, use a alavanca.'];
    else if (!F.p3joke) tip = ['T: Porta das piadas? Ah, não... São as piadas do FireGhost.', 'T: Lembra das piadas que ele contou? A resposta é sempre a mais BOBA.'];
    else if (!F.p3bridge) tip = ['T: Ponte de gelo rachado... Os pinguins sempre sabem onde pisar.', 'T: Olhe bem de perto: tem PEGADAS nas placas firmes.'];
    else tip = ['T: A casa dos irmãos fantasmas fica logo à frente.', 'T: Salve o jogo antes. E lembre: às vezes, conversar resolve mais que lutar.'];
    await W.say(['T: Alô! Treinador falando!'].concat(tip, ['T: Boa sorte!']));
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere();
    await W.say(['* (O frio da colônia... estranhamente te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },

  talkPenguin(n) {
    const W = World;
    const L = {
      1: ['P: Quá! Um humano! Faz tempo que não aparece um.', 'P: O IceGhost passou por aqui furioso, carregando o irmão nas costas.', 'P: Depois ficou a noite toda montando armadilhas. Ninguém dormiu.'],
      2: ['P: As placas de gelo, o lago, as estalactites, os blocos...', 'P: Eles fizeram até uma porta que só abre com PIADA. Que tortura.'],
      3: ['P: Dica de pinguim: na ponte de gelo, a gente sempre pisa no mesmo lugar.', 'P: Nossos pés deixam marquinhas. Hehe.'],
      4: ['P: Você vai na casa dos fantasmas?! Corajoso!', 'P: Eu tenho medo do IceGhost. Ele transforma tudo em estátua!'],
    };
    return W.say(L[n]);
  },

  async shop() {
    const W = World;
    if (!G.flags.shop3) { G.flags.shop3 = true; await W.say(['P: Bem-vindo ao QUIOSQUE DO PINGUIM!', 'P: Comida quente pra quem tem coragem de andar nesse frio.']); }
    const stock = [['Sopa de Neve', 'Sopa 12G'], ['Chocolate Quente', 'Choco 20G'], ['Picolé Ardente', 'Picolé 32G']];
    for (;;) {
      const r = await W.ask(`* O que vai querer? (Você tem ${G.gold} OURO)`, stock.map(s => s[1]).concat(['Sair']));
      if (r === 3 || r === undefined) { await W.say(['P: Quá! Volte sempre!']); return; }
      const [name] = stock[r], price = ITEMS[name].price;
      if (G.gold < price) { Sfx.back(); await W.say(['P: Hmm... faltou OURO.']); continue; }
      if (G.items.length >= 8) { Sfx.back(); await W.say(['P: Seus bolsos estão cheios!']); continue; }
      G.gold -= price; G.items.push(name); Sfx.select();
      await W.say([`* Você comprou ${name.toUpperCase()}.`]);
    }
  },

  // ----- placas X/O -----
  stepXO(tx, ty, c) {
    const W = World;
    if (c === 'x') { W.setTile(tx, ty, 'O'); Sfx.toggle(); }
    else { W.setTile(tx, ty, 'x'); Sfx.buzz(); }
    W.redrawTile(tx, ty);
    if (XO_TILES.every(([x, y]) => W.tile(x, y) === 'O')) this.solveXO();
  },
  async solveXO() {
    const W = World;
    G.flags.p3g1 = true;
    for (let y = 17; y <= 19; y++) W.redrawTile(71, y);
    W.locked = true;
    Sfx.bridge(); W.shake = 0.6;
    await W.say(['* (Todas as placas viraram O!)', '* (O portão de gelo derreteu.)']);
    W.saveHere(0);
    await this.ring(false);
    await W.say(['T: Alô! Ouvi um portão derretendo daqui! Foi você?', 'T: Muito bem! Mas isso foi só o começo...', 'T: Tchau!']);
    W.locked = false;
  },
  async leverXO() {
    const W = World;
    if (G.flags.p3g1) return W.say(['* (A alavanca está travada. O quebra-cabeça já foi resolvido.)']);
    Sfx.push();
    for (const [x, y] of XO_TILES) { W.setTile(x, y, 'x'); W.redrawTile(x, y); }
    await W.say(['* (Clack! Todas as placas voltaram a ser X.)']);
  },

  // ----- lago -----
  async afterLake() {
    const W = World;
    G.flags.p3lake = true; W.locked = true;
    await W.say(['* (Você conseguiu atravessar o lago escorregadio!)', '* (Suas pernas ainda estão tremendo.)']);
    W.saveHere(0);
    W.locked = false;
  },

  // ----- estalactites -----
  async icicleHit(W) {
    W.locked = true;
    Sfx.hurt(); W.shake = 0.5;
    G.hp = Math.max(1, G.hp - 3);
    const p = W.player;
    for (let i = 0; i < 12; i++) { const nx = p.x - 3; if (!W.blocked(nx, p.y)) p.x = nx; await nextFrame(); }
    const msgs = ['* AI! Uma estalactite caiu na sua cabeça! (-3 HP)', '* OUCH! Isso doeu! (-3 HP)', '* PLÉC! Gelo na cabeça! (-3 HP)'];
    this.hitN = ((this.hitN ?? -1) + 1) % msgs.length;
    await W.say([msgs[this.hitN]]);
    W.locked = false;
  },
  async enterField() {
    const W = World;
    G.flags.p3field = true; W.locked = true;
    await W.say(['* (Você sobreviveu ao corredor das estalactites.)', '* (À frente, um campo de NEVE FUNDA. Algo se mexe embaixo dela...)']);
    W.locked = false;
  },

  // ----- blocos -----
  pushCheck(W, dt) {
    if (G.flags.p3g3) return;
    const p = W.player, v = moveVector();
    if (Math.abs(v.x) < 0.5 && Math.abs(v.y) < 0.5) { this.pushT = 0; return; }
    const [dx, dy] = Math.abs(v.x) > Math.abs(v.y) ? [Math.sign(v.x), 0] : [0, Math.sign(v.y)];
    const [tx, ty] = W.feetTile();
    const b = this.blocks().find(e => e.tx === tx + dx && e.ty === ty + dy);
    if (!b || b.moving || !W.blocked(p.x + dx * 3, p.y + dy * 3)) { this.pushT = 0; return; }
    if (W.tile(b.tx, b.ty) === '+') { this.pushT = 0; return; } // bloco no botão fica travado
    this.pushT = (this.pushT || 0) + dt;
    if (this.pushT < 0.22) return;
    this.pushT = 0;
    const nx = b.tx + dx, ny = b.ty + dy;
    if (W.solidTile(nx, ny) || '13J'.includes(W.tile(nx, ny)) || this.blocks().some(e => e.tx === nx && e.ty === ny)) { Sfx.buzz(); return; }
    this.moveBlock(b, nx, ny);
  },
  async moveBlock(b, nx, ny) {
    const W = World, ox = b.tx, oy = b.ty;
    b.moving = true; Sfx.push();
    b.tx = nx; b.ty = ny;
    const tx = tx2x(nx), ty = ny * TS + 15;
    for (let i = 1; i <= 8; i++) { b.x += (tx - b.x) / (9 - i); b.y += (ty - b.y) / (9 - i); await nextFrame(); }
    b.x = tx; b.y = ty; b.moving = false;
    for (const [x, y] of [[ox, oy], [nx, ny]]) if (W.tile(x, y) === '+') W.redrawTile(x, y);
    if (W.tile(nx, ny) === '+') Sfx.toggle();
    if (SWITCHES.every(([x, y]) => this.blockAt(x, y))) {
      G.flags.p3g3 = true;
      W.redrawTile(165, 26);
      W.locked = true; Sfx.bridge(); W.shake = 0.6;
      await W.say(['* (Os dois botões estão pressionados!)', '* (O portão de gelo derreteu.)']);
      W.saveHere(0);
      W.locked = false;
    }
  },
  async leverBlocks() {
    const W = World;
    if (G.flags.p3g3) return W.say(['* (A alavanca está travada. O quebra-cabeça já foi resolvido.)']);
    Sfx.push();
    this.blocks().forEach((b, i) => { b.tx = BLOCK_START[i][0]; b.ty = BLOCK_START[i][1]; b.x = tx2x(b.tx); b.y = b.ty * TS + 15; });
    for (const [x, y] of SWITCHES) W.redrawTile(x, y);
    const p = W.player;
    if (W.blocked(p.x, p.y)) { p.x = tx2x(149); p.y = ty2y(24); }
    await W.say(['* (Clack! Os blocos voltaram para o lugar.)']);
  },

  // ----- porta das piadas -----
  async jokeDoor() {
    const W = World;
    W.locked = true;
    await W.say(['* (Uma porta vermelha com "HAHA" pintado.)', '* (Uma voz gravada começa a tocar...)', "F: OLÁ, HUMANO! Bem-vindo à PORTA DAS PIADAS!", 'F: Acerte o final de 3 piadas e eu abro. Errou? ALÇAPÃO! Hehehe.']);
    const bank = [
      ['Por que o fantasma não mente?', 'Porque é TRANSPARENTE', ['Porque é educado', 'Porque tem medo']],
      ['O que o gelo disse pro outro gelo?', 'FICA FRIO!', ['Bom dia!', 'Tô derretendo...']],
      ['Qual o doce favorito do fantasma?', 'BOO-lo', ['Brigadeiro', 'Pudim']],
      ['Por que o dragão não joga cartas?', 'Sempre QUEIMA a mão', ['Não tem dedos', 'Perde a paciência']],
      ['Por que o boneco de neve ficou triste?', 'DERRETIDO de saudade', ['Perdeu o nariz', 'Ficou sem cachecol']],
      ['O que o fogo disse pro outro fogo?', 'Tô em CHAMAS por você', ['Que calor!', 'Me apaga não']],
    ];
    const pick = bank.map(q => [Math.random(), q]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(x => x[1]);
    for (let i = 0; i < 3; i++) {
      const [q, right, wrong] = pick[i];
      const opts = [right, ...wrong].map(o => [Math.random(), o]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
      const r = await W.ask(`F: PIADA ${i + 1}: ${q}`, opts);
      if (opts[r] !== right) {
        Sfx.buzz();
        await W.say(['F: ERRRRROU! HAHAHAHA!', '* (O chão se abre embaixo de você!)']);
        Sfx.fall();
        await Fade.to(1, 2.5);
        const p = W.player; p.x = tx2x(147); p.y = ty2y(26); p.dir = 'right';
        W.updateCam(true);
        await Fade.to(0, 2);
        await W.say(['* (Você caiu num escorregador de gelo que te levou de volta...)', '* (...para a sala dos blocos. Que chato.)']);
        W.locked = false;
        return;
      }
      Sfx.select();
      await W.say([i < 2 ? 'F: ACERTOU! Você tem bom gosto... ou péssimo gosto. Próxima!' : 'F: ACERTOU TODAS?! Você é meu FÃ NÚMERO UM!']);
    }
    G.flags.p3joke = true;
    W.redrawTile(176, 26);
    Sfx.bridge();
    await W.say(['* (A porta das piadas se abriu, rindo sozinha.)']);
    W.saveHere(0);
    W.locked = false;
  },

  // ----- ponte rachada -----
  async fall(tx, ty) {
    const W = World;
    W.locked = true;
    Sfx.crack();
    await wait(0.25);
    Sfx.splash(); W.shake = 0.4;
    W.setTile(tx, ty, 'w'); W.redrawTile(tx, ty);
    W.animTiles.push([tx, ty, 'w']);
    G.hp = Math.max(1, G.hp - 2);
    await Fade.to(1, 3);
    const p = W.player; p.x = tx2x(177); p.y = ty2y(26); p.dir = 'right';
    W.updateCam(true);
    await Fade.to(0, 3);
    this.falls = (this.falls || 0) + 1;
    const extra = this.falls === 3 ? ['* (...Talvez seja hora de ligar pro Treinador.)'] : [];
    await W.say(['* SPLASH! A placa de gelo quebrou!', '* (Você nadou de volta, congelando. -2 HP)'].concat(extra));
    W.locked = false;
  },
  async afterBridge() {
    const W = World;
    G.flags.p3bridge = true; W.locked = true;
    await W.say(['* (Você atravessou a ponte de gelo rachado!)', '* (À frente, uma casa enorme feita de GELO.)']);
    await this.ring(false);
    await W.say([
      'T: Alô! Você chegou na casa dos irmãos, não chegou? Dá pra sentir o frio daqui.',
      'T: Escuta. O IceGhost está com raiva... mas raiva também é tristeza, sabia?',
      'T: Salve o jogo na estrela antes de entrar. E... toma cuidado, tá?',
    ]);
    W.locked = false;
  },

  // ----- final -----
  async mansion() {
    const W = World;
    W.locked = true;
    Sfx.stopMusic();
    Sfx.knock();
    await W.say(['* (Toc, toc...)']);
    await wait(1);
    Sfx.freeze();
    Sfx.playMusic('icetheme');
    const fire = G.flags.fireFriend
      ? 'F: Ei! É o HUMANO! O que ri das minhas piadas! Oi, humano!'
      : 'F: ...hu...mano...? (A voz está fraca, mas ainda dá pra ouvir uma risadinha.)';
    await W.say([
      'G: Então você chegou, humano.',
      'G: Depois das placas... do lago... das estalactites... dos blocos...',
      'G: ...e até das piadas horríveis do meu irmão.',
      fire,
      'G: Silêncio, irmão.',
      'G: Entre, humano. Vamos resolver isso...',
      'G: ...do jeito GELADO.',
    ]);
    W.shake = 1.2; Sfx.boo();
    G.flags.p3done = true;
    W.saveHere();
    await Fade.to(1, 0.8);
    Sfx.stopMusic();
    Game.goEnd(3);
  },
};
