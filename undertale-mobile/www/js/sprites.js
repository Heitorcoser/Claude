// Pixel art feita em código. Cada caractere = 1 pixel; '.' = transparente.
'use strict';

const PAL = {
  k: '#000000', // contorno
  H: '#6b3e1f', // cabelo
  h: '#8a5530', // brilho do cabelo
  S: '#f5c79a', // pele
  s: '#d9a173', // sombra da pele
  G: '#2e8b57', // camiseta
  Y: '#f2c230', // listra
  B: '#3a55a4', // calça
  D: '#4a2a12', // sapato
  P: '#5b3a9e', // manto do instrutor
  p: '#7c5cc4', // manto claro
  F: '#a9c4d6', // pele do instrutor
  f: '#86a3b8', // sombra pele instrutor
  W: '#f4f4f4', // barba / branco
  w: '#cfcfcf', // barba sombra
  L: '#7fd9ff', // lente
  O: '#ffdf5e', // ouro
  N: '#8b5a2b', // madeira
  n: '#6d4420',
  R: '#ff2b2b', // alma
  r: '#b0141e',
  E: '#ffe680', // brilho do orbe
  C: '#d6b88a', // pano do boneco
  c: '#a8875b',
  M: '#4fa64a', // musgo
  m: '#2f6e30',
  V: '#9fe07a',
  T: '#e9eefa', // fantasma
  t: '#aab6d6',
  Z: '#2a2440', // olho escuro
  X: '#ff8fb0', // bochecha
};

function spriteFromRows(rows, flip, pal) {
  const w = Math.max(...rows.map(r => r.length));
  const h = rows.length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      g.fillStyle = (pal && pal[ch]) || PAL[ch] || '#ff00ff';
      g.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }
  }
  return cv;
}

// ---------- JOGADOR (14x21) ----------
const P_DOWN = [
  '....kkkkkk....',
  '...kHHhhHHk...',
  '..kHHhHHHHHk..',
  '.kHHHHHHHHHHk.',
  '.kHHSSSSSSHHk.',
  '.kHSSSSSSSSHk.',
  '.kSSkSSSSkSSk.',
  '.kSSkSSSSkSSk.',
  '..kSXSSSSXSk..',
  '...kkSSSSkk...',
  '..kGGGGGGGGk..',
  '.kGGYYYYYYGGk.',
  'kGkGGGGGGGGkGk',
  'kGkYYYYYYYYkGk',
  'kSkGGGGGGGGkSk',
  'kkkGGGGGGGGkkk',
];
const P_UP = [
  '....kkkkkk....',
  '...kHHhhHHk...',
  '..kHHhHHHHHk..',
  '.kHHHHHHHHHHk.',
  '.kHHHHHHHHHHk.',
  '.kHHHHhHHHHHk.',
  '.kHHHHHHHHHHk.',
  '.kSHHHHHHHHSk.',
  '..kSHHHHHHSk..',
  '...kkSSSSkk...',
  '..kGGGGGGGGk..',
  '.kGGYYYYYYGGk.',
  'kGkGGGGGGGGkGk',
  'kGkYYYYYYYYkGk',
  'kSkGGGGGGGGkSk',
  'kkkGGGGGGGGkkk',
];
const P_SIDE = [
  '....kkkkkk....',
  '...kHHhhHHk...',
  '..kHHhHHHHHk..',
  '.kHHHHHHHHHHk.',
  '.kHHHHHSSSSSk.',
  '.kHHHHSSSSSSk.',
  '.kHHHSSSSkSSk.',
  '.kHHHSSSSkSSk.',
  '..kHSSSSSXSk..',
  '...kkSSSSkk...',
  '...kGGGGGGk...',
  '...kYYYYYYk...',
  '...kGGkGGGk...',
  '...kYYkYYYk...',
  '...kGkSkGGk...',
  '...kkkkkkkk...',
];
const LEGS_STAND = [
  '..kBBBBBBBBk..',
  '..kBBBkkBBBk..',
  '..kBBk..kBBk..',
  '..kDDk..kDDk..',
  '..kkkk..kkkk..',
];
const LEGS_W1 = [
  '..kBBBBBBBBk..',
  '..kBBBkkBBBk..',
  '..kBBk..kBBk..',
  '..kDDk..kkkk..',
  '..kkkk........',
];
const LEGS_W2 = [
  '..kBBBBBBBBk..',
  '..kBBBkkBBBk..',
  '..kBBk..kBBk..',
  '..kkkk..kDDk..',
  '........kkkk..',
];
const SLEGS_STAND = [
  '...kBBBBBBk...',
  '...kBBBBBBk...',
  '....kBBBBk....',
  '....kDDDDDk...',
  '....kkkkkkk...',
];
const SLEGS_W = [
  '...kBBBBBBk...',
  '..kBBk..kBBk..',
  '..kBk....kBk..',
  '..kDDk...kDDk.',
  '..kkk....kkkk.',
];

// ---------- INSTRUTOR (20x34) ----------
// Um velho mago-monstro gentil: chapéu pontudo, óculos redondos,
// barba branca e cajado com orbe de luz.
const I_BASE = [
  '........kk..........',
  '.......kPPk.........',
  '......kPpPPk........',
  '......kPPPPk.....kk.',
  '.....kPPPOPPk...kEEk',
  '.....kPPOOOPk..kEOEk',
  '....kPPPPOPPPk.kEEEk',
  '....kPPPPPPPPk..kNk.',
  '..kkkkkkkkkkkkkkkNk.',
  '..kOOOOOOOOOOOOk.Nk.',
  '...kFFFFFFFFFFk..Nk.',
  '...kFkkkFFkkkFk..Nk.',
  '...kkLLkkkkLLkk..Nk.',
  '...kFkkkFFkkkFk..Nk.',
  '...kFFFFffFFFFk..Nk.',
  '...kWWWWWWWWWWk..Nk.',
  '..kWWWWkkkWWWWWk.Nk.',
  '..kWWWWWWWWWWWWk.Nk.',
  '.kPkWWWWWWWWWWkPkNk.',
  'kPPkkWWWWWWWWkkPkFk.',
  'kPpPPkWWWWWWkPPPFFk.',
  'kPpPPPkWWWWkPPPPkNk.',
  'kPpPPPPkWWkPPPPPkNk.',
  'kFFkPPPPkkPPPPPPkNk.',
  'kFFkOOOOOOOOOOOOkNk.',
  '.kkkPPPPPOPPPPPPkNk.',
  '...kPpPPPPPPPPPPkNk.',
  '...kPpPPPPPPPPPPkNk.',
  '...kPpPPPPPPPPPPkNk.',
  '..kPPpPPPPPPPPPPPkk.',
  '..kPPPPPPPPPPPPPPk..',
  '..kkkkkkkkkkkkkkkk..',
  '....kDDDk..kDDDk....',
  '....kkkkk..kkkkk....',
];
// Variação piscando (olhos fechados)
const I_BLINK = I_BASE.map((r, i) => i === 12 ? '...kkkkkkkkkkkk..Nk.' : r);
// Variação de "andar": pés alternados
const I_WALK = I_BASE.slice(0, 32).concat([
  '....kDDDk...........',
  '....kkkkk..kDDDk....',
]);

// ---------- ALMA (16x16) ----------
const SOUL = [
  '..kkkk....kkkk..',
  '.kRRRRk..kRRRRk.',
  'kRRWRRRkkRRRRRRk',
  'kRWRRRRRRRRRRRRk',
  'kRRRRRRRRRRRRRRk',
  'kRRRRRRRRRRRRRRk',
  'kRRRRRRRRRRRRRRk',
  '.kRRRRRRRRRRRRk.',
  '..kRRRRRRRRRRk..',
  '...kRRRRRRRRk...',
  '....kRRRRRRk....',
  '.....kRRRRk.....',
  '......kRRk......',
  '.......kk.......',
];
const SOUL_BROKEN = [
  '..kkkk....kkkk..',
  '.kRRRRk..kRRRRk.',
  'kRRWRRRk.kRRRRRk',
  'kRWRRRRk.kRRRRRk',
  'kRRRRRk.kRRRRRRk',
  'kRRRRRRk.kRRRRRk',
  'kRRRRRk.kRRRRRRk',
  '.kRRRRRk.kRRRRk.',
  '..kRRRk.kRRRRk..',
  '...kRRRk.kRRk...',
  '....kRRk.kRk....',
  '.....kRk.kRk....',
  '......kk.kk.....',
];

// ---------- INIMIGOS (desenhados em baixa resolução, ampliados) ----------
const DUMMY = [
  '.........kkkkkk.........',
  '.......kkCCCCCCkk.......',
  '......kCCCCCCCCCCk......',
  '.....kCCCcCCCCcCCCk.....',
  '.....kCCkkCCCCkkCCk.....',
  '.....kCCCCCCCCCCCCk.....',
  '.....kCCCCkkkkCCCCk.....',
  '......kCCCCCCCCCCk......',
  '.......kkCCCCCCkk.......',
  '.........kcCCck.........',
  '...kkkkkkkCCCCkkkkkkk...',
  '..kCCCCCCCCCCCCCCCCCCk..',
  '..kCcCCCCCCCCCCCCCCcCk..',
  '..kkkkkkkCCcCCCkkkkkkk..',
  '........kCCCCCCk........',
  '........kCCcCCCk........',
  '........kCCCCCCk........',
  '........kCCCCcCk........',
  '.........kCCCCk.........',
  '..........kNNk..........',
  '..........kNNk..........',
  '..........kNNk..........',
  '..........kNNk..........',
  '.......kkkkNNkkkk.......',
  '......knnnnnnnnnnk......',
  '......kkkkkkkkkkkk......',
];

const MUSGOLHO = [
  '...........kkkkkk...........',
  '........kkkMMVMMMkkk........',
  '......kkMMMMMMMMMMMMkk......',
  '.....kMMVMMMMMMMMMVMMMk.....',
  '....kMMMMMkkkkkkkkMMMMMk....',
  '...kMMMMMkWWWWWWWWkMMMMMk...',
  '...kMMMMkWWWWWWWWWWkMMMMk...',
  '..kMMVMMkWWWZZZZWWWkMMVMMk..',
  '..kMMMMkWWWZZZZZZWWWkMMMMk..',
  '..kMMMMkWWWZZWZZZWWWkMMMMk..',
  '..kMMMMkWWWZZZZZZWWWkMMMMk..',
  '..kMMMMMkWWWZZZZWWWkMMMMMk..',
  '..kMMMMMMkWWWWWWWWkMMMMMMk..',
  '..kMMMMMMMkkkkkkkkMMMMMMMk..',
  '..kmMMMMMMMMMMMMMMMMMMMMmk..',
  '..kmMMMMMMMMkkkkMMMMMMMMmk..',
  '..kmmMMMMMMkXXXXkMMMMMMmmk..',
  '...kmmMMMMMMkkkkMMMMMMmmk...',
  '...kmmmMMMMMMMMMMMMMMmmmk...',
  '....kmmmmMMMMMMMMMMmmmmk....',
  '..kkkmmmmmmmmmmmmmmmmmmkkk..',
  '.kVkMkkmmmmmmmmmmmmmmkkMkVk.',
  '.kMkk..kkkkkkkkkkkkkk..kkMk.',
  '..kk....................kk..',
];

const FANTASMINHA = [
  '..........kkkkkkkk..........',
  '........kkTTTTTTTTkk........',
  '.......kTTTTTTTTTTTTk.......',
  '......kTTTTTTTTTTTTTTk......',
  '.....kTTTWTTTTTTTTTTTTk.....',
  '.....kTTWTTTTTTTTTTTTTk.....',
  '....kTTTTTkkTTTTkkTTTTTk....',
  '....kTTTTkZZkTTkZZkTTTTk....',
  '....kTTTTkZZkTTkZZkTTTTk....',
  '....kTTTTTkkTTTTkkTTTTTk....',
  '....kTTXXTTTTTTTTTTXXTTk....',
  '....kTTTTTTTkkkkTTTTTTTk....',
  '....kTTTTTTkZZZZkTTTTTTk....',
  '....kTTTTTTTkkkkTTTTTTTk....',
  '...kTTTTTTTTTTTTTTTTTTTTk...',
  '..kTTkTTTTTTTTTTTTTTTTkTTk..',
  '..kTk.kTTTTTTTTTTTTTTk.kTk..',
  '...k..kTTTTTTTTTTTTTTk..k...',
  '......kTTTTTTTTTTTTTTk......',
  '......kTTtTTTTTTTTtTTk......',
  '......kTtkTTTtTTTtkTTk......',
  '......ktk.kTtkkTtk.kTk......',
  '......kk...kk..kk...kk......',
];

// Ícones pequenos
const ICON_STAR = [
  '.....kk.....',
  '....kOOk....',
  '....kOOk....',
  'kkkkOEEOkkkk',
  'kOOOEEEEOOOk',
  '.kOOEEEEOOk.',
  '..kOOEEOOk..',
  '..kOOOOOOk..',
  '.kOOOkkOOOk.',
  '.kOOk..kOOk.',
  'kOkk....kkOk',
  'kk........kk',
];
const ICON_PIE = [
  '....kkkkkk....',
  '..kkOOOOOOkk..',
  '.kOONNOONNOOk.',
  'kOOOOOOOOOOOOk',
  'kNNNNNNNNNNNNk',
  'kOOOOOOOOOOOOk',
  '.kkkkkkkkkkkk.',
];
const ICON_SIGN = [
  'kkkkkkkkkkkkkk',
  'kNNNNNNNNNNNNk',
  'kNkkNkkkNkNNNk',
  'kNNNNNNNNNNNNk',
  'kNkkkNkkNkkNNk',
  'kNNNNNNNNNNNNk',
  'kkkkkkNNkkkkkk',
  '.....kNNk.....',
  '.....kNNk.....',
  '.....kNNk.....',
  '....knnnnk....',
];

function composePlayer(torso, legs) { return torso.concat(legs); }

const SPR = {};
function buildSprites() {
  const L = [LEGS_STAND, LEGS_W1, LEGS_STAND, LEGS_W2];
  SPR.player = {
    down: L.map(l => spriteFromRows(composePlayer(P_DOWN, l))),
    up: L.map(l => spriteFromRows(composePlayer(P_UP, l))),
    right: [SLEGS_STAND, SLEGS_W, SLEGS_STAND, SLEGS_W].map(l => spriteFromRows(composePlayer(P_SIDE, l))),
    left: [SLEGS_STAND, SLEGS_W, SLEGS_STAND, SLEGS_W].map(l => spriteFromRows(composePlayer(P_SIDE, l), true)),
  };
  // Deitado (acordando): jogador de frente rotacionado
  const lying = document.createElement('canvas');
  lying.width = 21; lying.height = 14;
  const lg = lying.getContext('2d');
  lg.translate(21, 0); lg.rotate(Math.PI / 2);
  lg.drawImage(SPR.player.down[0], 0, 0);
  SPR.playerLying = lying;

  SPR.instr = {
    right: [spriteFromRows(I_BASE), spriteFromRows(I_WALK)],
    left: [spriteFromRows(I_BASE, true), spriteFromRows(I_WALK, true)],
    blinkR: spriteFromRows(I_BLINK),
    blinkL: spriteFromRows(I_BLINK, true),
  };
  SPR.soul = spriteFromRows(SOUL);
  SPR.soulBroken = spriteFromRows(SOUL_BROKEN);
  SPR.dummy = spriteFromRows(DUMMY);
  SPR.musgolho = spriteFromRows(MUSGOLHO);
  SPR.fantasminha = spriteFromRows(FANTASMINHA);
  SPR.star = spriteFromRows(ICON_STAR);
  SPR.pie = spriteFromRows(ICON_PIE);
  SPR.sign = spriteFromRows(ICON_SIGN);
  buildTiles();
  buildSprites2();
}

// ---------- TILES (16x16) gerados proceduralmente ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function makeTile(draw) {
  const cv = document.createElement('canvas');
  cv.width = 16; cv.height = 16;
  draw(cv.getContext('2d'));
  return cv;
}

function buildTiles() {
  const R = rng(7);
  SPR.tiles = {};
  // Chão de pedra roxa
  SPR.tiles.floor = [0, 1, 2].map(v => makeTile(g => {
    g.fillStyle = '#3b2a55'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#33244b';
    for (let i = 0; i < 6; i++) g.fillRect((R() * 16) | 0, (R() * 16) | 0, 2, 1);
    g.fillStyle = '#46336a';
    for (let i = 0; i < 4; i++) g.fillRect((R() * 16) | 0, (R() * 16) | 0, 1, 1);
    if (v === 1) { g.fillStyle = '#2c1f40'; g.fillRect(3, 9, 6, 1); g.fillRect(8, 10, 3, 1); }
  }));
  // Folhas vermelhas
  SPR.tiles.leaves = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#3b2a55'; g.fillRect(0, 0, 16, 16);
    const cols = ['#b8322a', '#d9542b', '#8f1f1f', '#e8873a'];
    for (let i = 0; i < 22; i++) {
      g.fillStyle = cols[(R() * cols.length) | 0];
      const x = (R() * 15) | 0, y = (R() * 15) | 0;
      g.fillRect(x, y, 2, 1); g.fillRect(x, y + 1, 1, 1);
    }
  }));
  // Parede de tijolos
  SPR.tiles.wall = makeTile(g => {
    g.fillStyle = '#1b1229'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#6a4c9c';
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      for (let c = -1; c < 3; c++) g.fillRect(c * 8 + off + 1, row * 4 + 1, 6, 2);
    }
    g.fillStyle = '#8462bf';
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      for (let c = -1; c < 3; c++) g.fillRect(c * 8 + off + 1, row * 4 + 1, 6, 1);
    }
  });
  // Topo da parede (escuro, para dar profundidade)
  SPR.tiles.wallTop = makeTile(g => {
    g.fillStyle = '#120c1c'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#1e1530'; g.fillRect(0, 14, 16, 2);
  });
  // Portão (barras)
  SPR.tiles.gate = makeTile(g => {
    g.fillStyle = '#3b2a55'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; for (let x = 1; x < 16; x += 4) g.fillRect(x, 0, 3, 16);
    g.fillStyle = '#9a9aa8'; for (let x = 2; x < 16; x += 4) g.fillRect(x, 0, 1, 16);
    g.fillStyle = '#000'; g.fillRect(0, 2, 16, 3); g.fillRect(0, 11, 16, 3);
    g.fillStyle = '#9a9aa8'; g.fillRect(0, 3, 16, 1); g.fillRect(0, 12, 16, 1);
  });
  // Porta de saída
  SPR.tiles.door = makeTile(g => {
    g.fillStyle = '#120c1c'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(1, 1, 14, 15);
    g.fillStyle = '#05030a'; g.fillRect(2, 2, 12, 14);
    g.fillStyle = '#6a4c9c'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16);
  });
}
