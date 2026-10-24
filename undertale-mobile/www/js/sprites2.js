// Pixel art da Fase 2: dragões, fantasmas, inimigos novos, objetos e tiles de DragonCity.
'use strict';

// ---------- DRAGÃO (26x22, olhando para a direita) ----------
const DRAGON = [
  '.....kk...................',
  '....kvvk..................',
  '...kvvvvk..........kk.....',
  '..kvvvvvvk........khk.....',
  '..kvkvvvvvk....kkkkbkk....',
  '.kvvkvvvvvvk..kbbbbbbbk...',
  '.kvvvkvvvvvvkkbbbbbbyybk..',
  '.kvvvvkvvvvvkbbbbbbyzzbbk.',
  '..kvvvvkkvvkbbbbbbbbbbbbbk',
  '...kkvvvvkkbbdbbbbbbeekkk.',
  '.....kkkkkbbbdbbbbbeek....',
  '..........kbbdbbbbeek.....',
  '...kkk...kbbbbdbbbeek.....',
  '..kbbbk.kbbbbbbdbeeeek....',
  '.kbk.kbkbbbbbbbbbeeeek....',
  '.kbk..kbbbbbbbbbbeeeek....',
  '..kbk.kbbbbbbbbbbeeek.....',
  '...kbbkbbbdbbbbbdbbk......',
  '....kkkbbbdkkbbbdbk.......',
  '......kbbdk..kbbdk........',
  '......kddk...kddk.........',
  '......kkkk...kkkk.........',
];
// Asa abaixada (para o bater de asas)
const DRAGON_FLAP = [
  '..........................',
  '..........................',
  '...................kk.....',
  '..................khk.....',
  '...............kkkkbkk....',
  '..............kbbbbbbbk...',
  '.............kbbbbbbyybk..',
  '.......kkkkkkbbbbbbyzzbbk.',
  '.....kkvvvvvkbbbbbbbbbbbbk',
  '..kkvvkvvkvkbdbbbbbbeekkk.',
  '..kvvvkvvkvvkbdbbbbbeek...',
  '..kvvkvvkvvkbbdbbbbeek....',
  '...kkkkkkkkbbbbdbbbeek....',
  '..kbbbk.kbbbbbbdbeeeek....',
  '.kbk.kbkbbbbbbbbbeeeek....',
  '.kbk..kbbbbbbbbbbeeeek....',
  '..kbk.kbbbbbbbbbbeeek.....',
  '...kbbkbbbdbbbbbdbbk......',
  '....kkkbbbdkkbbbdbk.......',
  '......kbbdk..kbbdk........',
  '......kddk...kddk.........',
  '......kkkk...kkkk.........',
];

const DRAGON_PALS = {
  preto: { b: '#34304a', d: '#1c1a28', e: '#6a5a92', v: '#54447e', h: '#d8d8e8', y: '#ff4a4a', z: '#5a0000' },
  branco: { b: '#f2f5ff', d: '#b9c6e6', e: '#d6e4ff', v: '#9fd4ff', h: '#ffe680', y: '#ffffff', z: '#2a6aff' },
  laranja: { b: '#ff8a2a', d: '#cf531a', e: '#ffd36a', v: '#ff5a3a', h: '#fff0c0', y: '#ffffff', z: '#000000' },
  verde: { b: '#5fbf5a', d: '#3a8a3a', e: '#d8f0a0', v: '#8fd06a', h: '#ffffff', y: '#ffffff', z: '#000000' },
  azul: { b: '#4a8ae0', d: '#2a5aa8', e: '#bfe0ff', v: '#7ab0f0', h: '#fff4c0', y: '#ffffff', z: '#000000' },
  vermelho: { b: '#d8443a', d: '#9a2a22', e: '#ffc08a', v: '#ff7a5a', h: '#fff0c0', y: '#ffffff', z: '#000000' },
  rosa: { b: '#f08ac0', d: '#b85a90', e: '#ffe0f0', v: '#ffb0d8', h: '#ffffff', y: '#ffffff', z: '#000000' },
  cinza: { b: '#a0a0ae', d: '#6c6c7a', e: '#dcdce4', v: '#80808e', h: '#fff8d0', y: '#ffffff', z: '#000000' },
  pedra: { b: '#7a7680', d: '#55525c', e: '#8e8a94', v: '#66626e', h: '#9a96a0', y: '#8e8a94', z: '#55525c' },
};

// ---------- FANTASMAS (28x23) ----------
const GHOST_FIRE = [
  '..........kkkkkkkk..........',
  '........kkGGGGGGGGkk........',
  '.......kGGGGGGGGGGGGk.......',
  '......kGGGGGGGGGGGGGGk......',
  '.....kGGGGGGGGGGGGGGGGk.....',
  '.....kGGkkkGGGGGGkkkGGk.....',
  '....kGGkWWzkGGGGkWWzkGGk....',
  '....kGGkWzzkGGGGkWzzkGGk....',
  '....kGGGkkkGGGGGGkkkGGGk....',
  '....kGXXGGGGGGGGGGGGXXGk....',
  '....kGGGkkkkkkkkkkkkGGGk....',
  '....kGGGkWkWkWkWkWkkGGGk....',
  '....kGGGGkrrrrrrrrkGGGGk....',
  '....kGGGGGkkkkkkkkGGGGGk....',
  '...kGGGGGGGGGGGGGGGGGGGGk...',
  '..kGGkGGGGGGGGGGGGGGGGkGGk..',
  '..kGk.kGGGGGGGGGGGGGGk.kGk..',
  '...k..kGGGGGGGGGGGGGGk..k...',
  '......kGGGGGGGGGGGGGGk......',
  '......kGGgGGGGGGGGgGGk......',
  '......kGgkGGGgGGGgkgGk......',
  '......kgk.kGgkkGgk.kgk......',
  '......kk...kk..kk...kk......',
];
const GHOST_ICE = GHOST_FIRE.slice();
GHOST_ICE[5] = '.....kGkkGGGGGGGGGGkkGk.....';
GHOST_ICE[6] = '....kGGGkkkGGGGGGkkkGGGk....';
GHOST_ICE[7] = '....kGGkWzzkGGGGkzzWkGGk....';
GHOST_ICE[8] = '....kGGGkkkGGGGGGkkkGGGk....';
GHOST_ICE[9] = '....kGXGGGGGGGGGGGGGGXGk....';
GHOST_ICE[10] = '....kGGGGGGGGGGGGGGGGGGk....';
GHOST_ICE[11] = '....kGGGGGGkkkkkkkGGGGGk....';
GHOST_ICE[12] = '....kGGGGGGGGGGGGkGGGGGk....';
GHOST_ICE[13] = '....kGGGGGGGGGGGGGGGGGGk....';
const FIRE_PAL = { G: '#ff9a3a', g: '#d9561a', X: '#ffd23a', r: '#ff3b3b', z: '#000000', W: '#ffffff' };
const ICE_PAL = { G: '#d4f0ff', g: '#8ec5e8', X: '#9fdcff', r: '#5aa0d0', z: '#1a3a6a', W: '#ffffff' };

// ---------- INIMIGOS NOVOS ----------
const BRASINHA = [
  '.........k..........',
  '........kyk.........',
  '.......kyOk.....k...',
  '...k...kyOOk...kyk..',
  '..kyk.kyOOOk..kyOk..',
  '..kOOkkOOrOOkkyOOk..',
  '..kOOOOOrrrOOOOOk...',
  '..kOOOOrrrrrOOOOk...',
  '.kOOOOrrrrrrrOOOOk..',
  '.kOOOrrrrrrrrrOOOk..',
  '.kOOrrkkrrrkkrrOOk..',
  '.kOrrrkWrrrkWrrrOk..',
  '.kOrrrrrrrrrrrrrOk..',
  '.kOrrrrrkkkrrrrrOk..',
  '..kOrrrrrrrrrrrOk...',
  '..kOOrrrrrrrrrOOk...',
  '...kOOOrrrrrOOOk....',
  '....kkOOOOOOOkk.....',
  '......kkkkkkk.......',
];
const BRASA_PAL = { y: '#ffe680', O: '#ff9a2a', r: '#e8452a', W: '#ffffff' };
const GELINHO = [
  '...kkkkkkkkkkkkk....',
  '..kWWWWWWWWWWWWLk...',
  '.kWLLLLLLLLLLLLLLk..',
  '.kWLLWLLLLLLLLLLLk..',
  '.kWLWLLLLLLLLLLLLk..',
  '.kWLLLkkLLLLkkLLLk..',
  '.kWLLLkWLLLLkWLLLk..',
  '.kWLLLLLLLLLLLLLLk..',
  '.kWLLXLLLLLLLLXLLk..',
  '.kWLLLLLLkkLLLLLLk..',
  '.kWLLLLLkLLkLLLLLk..',
  '.kWLLLLLLkkLLLLLLk..',
  '.kWLLLLLLLLLLLLLtk..',
  '.kLLLLLLLLLLLLLttk..',
  '.kkkkkkkkkkkkkkkk...',
];
const GELO_PAL = { W: '#ffffff', L: '#9fe4ff', t: '#4aa8d8', X: '#ffb0d0' };

function makeCanvas(w, h, draw) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d'));
  return cv;
}

function buildSprites2() {
  SPR.dragon = {};
  for (const k of Object.keys(DRAGON_PALS)) {
    const p = DRAGON_PALS[k];
    SPR.dragon[k] = {
      right: [spriteFromRows(DRAGON, false, p), spriteFromRows(DRAGON_FLAP, false, p)],
      left: [spriteFromRows(DRAGON, true, p), spriteFromRows(DRAGON_FLAP, true, p)],
    };
  }
  SPR.fireghost = spriteFromRows(GHOST_FIRE, false, FIRE_PAL);
  SPR.iceghost = spriteFromRows(GHOST_ICE, false, ICE_PAL);
  SPR.brasinha = spriteFromRows(BRASINHA, false, BRASA_PAL);
  SPR.gelinho = spriteFromRows(GELINHO, false, GELO_PAL);

  // Caixas empilhadas (esconderijo)
  SPR.crate = makeCanvas(16, 26, g => {
    const box = (y, h) => {
      g.fillStyle = '#000'; g.fillRect(0, y, 16, h);
      g.fillStyle = '#a8743a'; g.fillRect(1, y + 1, 14, h - 2);
      g.fillStyle = '#7a4f22'; g.fillRect(1, y + 1, 14, 1); g.fillRect(1, y + h - 2, 14, 1);
      g.fillRect(1, y + 1, 1, h - 2); g.fillRect(14, y + 1, 1, h - 2);
      for (let i = 0; i < h - 4; i++) { g.fillRect(2 + Math.floor(i * 12 / (h - 4)), y + 2 + i, 1, 1); g.fillRect(13 - Math.floor(i * 12 / (h - 4)), y + 2 + i, 1, 1); }
    };
    box(0, 13); box(13, 13);
  });
  SPR.barrel = makeCanvas(14, 16, g => {
    g.fillStyle = '#000'; g.fillRect(1, 0, 12, 16); g.fillRect(0, 2, 14, 12);
    g.fillStyle = '#8a5a2a'; g.fillRect(2, 1, 10, 14); g.fillRect(1, 3, 12, 10);
    g.fillStyle = '#a8743a'; g.fillRect(4, 1, 3, 14);
    g.fillStyle = '#4a4a52'; g.fillRect(1, 4, 12, 1); g.fillRect(1, 11, 12, 1);
  });
  SPR.lamp = makeCanvas(10, 34, g => {
    g.fillStyle = '#000'; g.fillRect(3, 8, 4, 26); g.fillRect(0, 0, 10, 10);
    g.fillStyle = '#3a3a44'; g.fillRect(4, 9, 2, 24); g.fillRect(2, 31, 6, 2);
    g.fillStyle = '#ffd36a'; g.fillRect(1, 1, 8, 8);
    g.fillStyle = '#fff4c0'; g.fillRect(3, 3, 4, 4);
  });
  SPR.pedestal = makeCanvas(20, 10, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 20, 10);
    g.fillStyle = '#8a8494'; g.fillRect(1, 1, 18, 8);
    g.fillStyle = '#a8a2b2'; g.fillRect(1, 1, 18, 2);
  });
  SPR.nest = makeCanvas(34, 12, g => {
    g.fillStyle = '#5a3a1a'; g.beginPath(); g.ellipse(17, 6, 17, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c8a050';
    for (let i = 0; i < 40; i++) g.fillRect(2 + (i * 7) % 30, 2 + (i * 5) % 8, 3, 1);
  });
  SPR.brazier = makeCanvas(14, 12, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 14, 6); g.fillRect(4, 5, 6, 7);
    g.fillStyle = '#5a5a66'; g.fillRect(1, 1, 12, 4); g.fillRect(5, 5, 4, 6);
    g.fillStyle = '#2a2a30'; g.fillRect(2, 1, 10, 1);
  });
  buildCityTiles();
}

// ---------- TILES DE DRAGONCITY ----------
function buildCityTiles() {
  const R = rng(99);
  const T = {};
  T.cobble = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#5e4c3c'; g.fillRect(0, 0, 16, 16);
    const st = [[0, 0, 7, 5], [8, 0, 8, 5], [0, 6, 5, 5], [6, 6, 6, 5], [13, 6, 3, 5], [0, 12, 8, 4], [9, 12, 7, 4]];
    for (const [x, y, w, h] of st) {
      const c = 0x7a + ((R() * 20) | 0);
      g.fillStyle = `rgb(${c},${c - 18},${c - 36})`; g.fillRect(x, y, w - 1, h - 1);
      g.fillStyle = `rgba(255,240,210,0.15)`; g.fillRect(x, y, w - 1, 1);
    }
  }));
  T.dirt = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#6b4a2e'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#7d5836'; for (let i = 0; i < 8; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
    g.fillStyle = '#58391f'; for (let i = 0; i < 5; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.grass = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#2f5a34'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#3f7444'; for (let i = 0; i < 10; i++) { const x = (R() * 15) | 0, y = (R() * 14) | 0; g.fillRect(x, y, 1, 2); }
    g.fillStyle = '#24482a'; for (let i = 0; i < 6; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
    if (R() < 0.3) { g.fillStyle = '#ffd36a'; g.fillRect((R() * 13 + 1) | 0, (R() * 13 + 1) | 0, 1, 1); }
  }));
  T.ash = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#3a3436'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a4245'; for (let i = 0; i < 8; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
    g.fillStyle = '#ff7a2a'; if (R() < 0.6) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
    g.fillStyle = '#2a2426'; for (let i = 0; i < 4; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.rock = makeTile(g => {
    g.fillStyle = '#140d0b'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#1e1411'; for (let i = 0; i < 5; i++) g.fillRect((R() * 14) | 0, (R() * 14) | 0, 3, 2);
  });
  T.cliff = makeTile(g => {
    g.fillStyle = '#3a2620'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4e3329'; for (let y = 1; y < 16; y += 5) g.fillRect(0, y, 16, 2);
    g.fillStyle = '#28190f'; for (let i = 0; i < 6; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 3);
    g.fillStyle = '#140d0b'; g.fillRect(0, 0, 16, 1);
  });
  T.roof = makeTile(g => {
    g.fillStyle = '#7a2218'; g.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 4) {
      g.fillStyle = '#b8402e'; g.fillRect(0, y, 16, 3);
      g.fillStyle = '#d65a40'; g.fillRect(0, y, 16, 1);
      g.fillStyle = '#7a2218'; for (let x = (y / 4) % 2 ? 2 : 6; x < 16; x += 8) g.fillRect(x, y, 1, 3);
    }
  });
  T.wallH = makeTile(g => {
    g.fillStyle = '#e8d2a8'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#c8ad80';
    for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
    for (let y = 0; y < 16; y += 4) for (let x = (y / 4) % 2 ? 4 : 0; x < 16; x += 8) g.fillRect(x, y, 1, 3);
  });
  T.window = makeTile(g => {
    g.drawImage(T.wallH, 0, 0);
    g.fillStyle = '#4a2a1a'; g.fillRect(3, 3, 10, 10);
    g.fillStyle = '#ffd36a'; g.fillRect(4, 4, 8, 8);
    g.fillStyle = '#4a2a1a'; g.fillRect(7, 4, 2, 8); g.fillRect(4, 7, 8, 2);
  });
  T.door = makeTile(g => {
    g.drawImage(T.wallH, 0, 0);
    g.fillStyle = '#2a160a'; g.fillRect(3, 2, 10, 14);
    g.fillStyle = '#6a3a1a'; g.fillRect(4, 3, 8, 13);
    g.fillStyle = '#ffd36a'; g.fillRect(10, 9, 1, 2);
  });
  T.doorDark = makeTile(g => {
    g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a3a2a'; for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
    g.fillStyle = '#120a06'; g.fillRect(3, 2, 10, 14);
    g.fillStyle = '#3a2416'; g.fillRect(4, 3, 8, 13);
    g.fillStyle = '#9a9aa8'; g.fillRect(10, 9, 1, 2);
  });
  T.oldWall = makeTile(g => {
    g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a3a2a'; for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
    g.fillStyle = '#6a5a48'; g.fillRect(2, 1, 4, 1); g.fillRect(9, 9, 5, 1);
  });
  T.oldRoof = makeTile(g => {
    g.fillStyle = '#2a2420'; g.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 4) { g.fillStyle = '#3e342c'; g.fillRect(0, y, 16, 3); }
    g.fillStyle = '#1a1410'; g.fillRect(5, 6, 3, 2);
  });
  T.lava = [0, 1, 2].map(f => makeTile(g => {
    g.fillStyle = '#c8321a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#ff6a1a';
    for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x++) if (Math.sin((x + f * 5) * 0.8 + y) > 0.3) g.fillRect(x, y + 1, 1, 2);
    g.fillStyle = '#ffd23a';
    const bx = [3, 10, 6][f], by = [4, 11, 8][f];
    g.fillRect(bx, by, 2, 2); g.fillRect((bx + 7) % 15, (by + 6) % 15, 1, 1);
  }));
  T.water = [0, 1, 2].map(f => makeTile(g => {
    g.fillStyle = '#2a6ab8'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a9ae0';
    for (let y = 2; y < 16; y += 5) for (let x = 0; x < 16; x++) if (Math.sin((x + f * 4) * 0.7) > 0.5) g.fillRect(x, y, 1, 1);
    g.fillStyle = '#bfe8ff'; g.fillRect((f * 5 + 2) % 14, (f * 7 + 3) % 14, 2, 1);
  }));
  T.rim = makeTile(g => {
    g.fillStyle = '#8a8494'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#a8a2b2'; g.fillRect(0, 0, 16, 3);
    g.fillStyle = '#6a6474'; g.fillRect(0, 13, 16, 3); g.fillRect(7, 3, 1, 10);
  });
  T.bridge = makeTile(g => {
    g.fillStyle = '#c8321a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x += 4) { g.fillStyle = '#8a5a2a'; g.fillRect(x, 1, 3, 14); g.fillStyle = '#a8743a'; g.fillRect(x, 1, 1, 14); }
  });
  T.tree = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(6, 9, 4, 7);
    g.fillStyle = '#3a2416'; g.fillRect(7, 9, 2, 7);
    g.fillStyle = '#000'; g.beginPath(); g.arc(8, 6, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a2a2e'; g.beginPath(); g.arc(8, 6, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d8541a'; for (let i = 0; i < 9; i++) g.fillRect(3 + ((i * 5) % 10), 2 + ((i * 3) % 8), 2, 1);
  });
  T.pillar = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(2, 0, 12, 16);
    g.fillStyle = '#9a8a7a'; g.fillRect(3, 0, 10, 16);
    g.fillStyle = '#b8a898'; g.fillRect(3, 0, 3, 16);
    g.fillStyle = '#ff8a2a'; g.fillRect(6, 3, 4, 3);
  });
  T.fence = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(0, 5, 16, 3); g.fillRect(0, 10, 16, 3);
    g.fillStyle = '#8a5a2a'; g.fillRect(0, 6, 16, 1); g.fillRect(0, 11, 16, 1);
    for (const x of [2, 12]) { g.fillStyle = '#000'; g.fillRect(x - 1, 2, 4, 14); g.fillStyle = '#a8743a'; g.fillRect(x, 3, 2, 12); }
  });
  SPR.city = T;
}
