// Pixel art das Fases 6 e 7: aranhas, esqueletos, Kitsune, caverna e Neo-Sakura (cidade inspirada em Tóquio).
'use strict';

const ARANHA = [
  '..k.......kkkkkk.......k..',
  '...k....kkPPPPPPkk....k...',
  '....k..kPPPPPPPPPPk..k....',
  'kk...kkPPpPPPPPPpPPkk...kk',
  '..kk.kPPPPPPPPPPPPPPk.kk..',
  '....kkPPEkEPPPPEkEPPkk....',
  '..kkkkPPPPPPPPPPPPPPkkkk..',
  '.k...kPPPPPPkkPPPPPPk...k.',
  'k...k.kPPPPPPPPPPPPk.k...k',
  '...k...kkPPPPPPPPkk...k...',
  '..k...k..kkkkkkkk..k...k..',
  '.k...k..............k...k.',
];
const ARANHA_PALS = {
  mae: { P: '#6a3a9a', p: '#9a6aca', E: '#ffffff' },
  bebe: { P: '#c88ae0', p: '#e8b8f8', E: '#ffffff' },
  soldado: { P: '#8a2a2a', p: '#c84a3a', E: '#ffd23a' },
  vila: { P: '#3a5a8a', p: '#6a8aca', E: '#ffffff' },
};

const ESQUELETO = [
  '....kkkkkk....',
  '...kWWWWWWk...',
  '..kWWWWWWWWk..',
  '..kWkkWWkkWk..',
  '..kWkkWWkkWk..',
  '..kWWWkkWWWk..',
  '...kWkWkWWk...',
  '....kkkkkk....',
  '.....kWWk.....',
  '...kkkWWkkk...',
  '..kWkWWWWkWk..',
  '.kWkkkWWkkkWk.',
  '.kWkWWWWWWkWk.',
  '.kWkkkWWkkkWk.',
  '.kWk.kWWk.kWk.',
  '.kkk..kk..kkk.',
  '.....kWWk.....',
  '....kWkkWk....',
  '....kWk.kWk...',
  '....kWk.kWk...',
  '...kWWk.kWWk..',
  '...kkkk.kkkk..',
];
const ESQ_PALS = { civil: { W: '#f0ece0' }, soldado: { W: '#d8d0b8' }, mestre: { W: '#fff8d8' } };

const KITSUNE = [
  '..k..........k..........',
  '.kOk........kOk.........',
  '.kOOk......kOOk.........',
  '.kOWOkkkkkkOWOk.........',
  '..kOOOOOOOOOOk..........',
  '..kOWWOOOOWWOk.....kk...',
  '..kOkROOOORkOk....kOOk..',
  '..kOWWOOOOWWOk...kOOOOk.',
  '...kWWWkkWWWk...kOOOWOk.',
  '....kWWWWWWk...kOOOWWOk.',
  '...kkRRRRRRkk.kOOOWWOk..',
  '..kOkRRRRRRkOkOOOWWOk...',
  '.kOOkRRRRRRkOOkOWWOk....',
  '.kOOkRRYYRRkOOOkWOk.....',
  '.kWWkRRRRRRkWWkkkk......',
  '..kkkRRRRRRkkk..........',
  '....kRRRRRRk............',
  '....kRRkkRRk............',
  '....kWWk.kWWk...........',
  '....kkkk.kkkk...........',
];
const KITSUNE_PAL = { O: '#ff8a2a', W: '#ffffff', R: '#c8302a', Y: '#ffd23a' };

function buildSprites6() {
  SPR.aranha = {};
  for (const k of Object.keys(ARANHA_PALS)) SPR.aranha[k] = [spriteFromRows(ARANHA, false, ARANHA_PALS[k]), spriteFromRows(ARANHA.map((r, i) => i >= 9 ? r.split('').reverse().join('') : r), false, ARANHA_PALS[k])];
  SPR.aranhaSold = SPR.aranha.soldado[0];
  SPR.esqueleto = {};
  for (const k of Object.keys(ESQ_PALS)) SPR.esqueleto[k] = spriteFromRows(ESQUELETO, false, ESQ_PALS[k]);
  SPR.esqSold = makeCanvas(14, 24, g => {
    g.drawImage(SPR.esqueleto.soldado, 0, 2);
    g.fillStyle = '#000'; g.fillRect(2, 0, 10, 4); g.fillStyle = '#7a7a86'; g.fillRect(3, 1, 8, 2);
  });
  SPR.kitsune = spriteFromRows(KITSUNE, false, KITSUNE_PAL);
  SPR.tent = makeCanvas(32, 30, g => {
    g.strokeStyle = 'rgba(230,230,255,0.8)'; g.lineWidth = 1;
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(16, 2); g.lineTo(1 + i * 3.7, 29); g.stroke(); }
    for (let r = 6; r < 30; r += 5) { g.beginPath(); g.moveTo(16 - r / 2, r); g.lineTo(16 + r / 2, r); g.stroke(); }
    g.fillStyle = 'rgba(40,20,60,0.85)'; g.beginPath(); g.moveTo(16, 4); g.lineTo(4, 29); g.lineTo(28, 29); g.fill();
    g.fillStyle = '#ffd36a'; g.fillRect(14, 22, 4, 7);
  });
  SPR.boneHut = makeCanvas(32, 28, g => {
    g.fillStyle = '#000'; g.fillRect(2, 10, 28, 18);
    g.fillStyle = '#5a4a3a'; g.fillRect(3, 11, 26, 16);
    for (let x = 0; x < 32; x += 5) { g.fillStyle = '#000'; g.fillRect(x, 2, 4, 10); g.fillStyle = '#f0ece0'; g.fillRect(x + 1, 3, 2, 8); }
    g.fillStyle = '#1a1410'; g.fillRect(13, 18, 6, 9);
    g.fillStyle = '#f0ece0'; g.fillRect(6, 14, 3, 3); g.fillRect(23, 14, 3, 3);
  });
  SPR.torii = makeCanvas(48, 44, g => {
    g.fillStyle = '#000'; g.fillRect(0, 2, 48, 6); g.fillRect(4, 12, 40, 4); g.fillRect(8, 8, 6, 36); g.fillRect(34, 8, 6, 36);
    g.fillStyle = '#d8302a'; g.fillRect(1, 3, 46, 4); g.fillRect(5, 13, 38, 2); g.fillRect(9, 8, 4, 36); g.fillRect(35, 8, 4, 36);
    g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, 48, 2);
  });
  SPR.lanternJ = makeCanvas(12, 18, g => {
    g.fillStyle = '#000'; g.fillRect(5, 0, 2, 3); g.fillRect(1, 3, 10, 13);
    g.fillStyle = '#ff5a3a'; g.fillRect(2, 4, 8, 11);
    g.fillStyle = '#ffd36a'; g.fillRect(4, 6, 4, 7);
    g.fillStyle = '#000'; g.fillRect(2, 8, 8, 1); g.fillRect(5, 16, 2, 2);
  });
  SPR.ramen = makeCanvas(48, 40, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 48, 10); g.fillRect(2, 22, 44, 18);
    g.fillStyle = '#d8302a'; g.fillRect(1, 1, 46, 8);
    g.fillStyle = '#fff'; for (let x = 6; x < 44; x += 10) g.fillRect(x, 3, 4, 4);
    g.fillStyle = '#8a5a2a'; g.fillRect(3, 23, 42, 16);
    g.fillStyle = '#f4f0e8'; for (let x = 4; x < 46; x += 8) g.fillRect(x, 10, 6, 12);
  });
  buildDeepTiles();
}

function buildDeepTiles() {
  const R = rng(6060);
  const T = {};
  T.rock = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#2a2430'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#342c3c'; for (let i = 0; i < 6; i++) g.fillRect((R() * 14) | 0, (R() * 14) | 0, 3, 2);
    g.fillStyle = '#1e1a24'; for (let i = 0; i < 4; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.wall = makeTile(g => {
    g.fillStyle = '#4a3a5a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#5a4a6a'; for (let y = 2; y < 16; y += 5) g.fillRect(0, y, 16, 2);
    g.fillStyle = '#7fe8ff'; if (R() < 0.6) g.fillRect((R() * 12 + 2) | 0, (R() * 10 + 3) | 0, 2, 2);
    g.fillStyle = '#100c14'; g.fillRect(0, 0, 16, 1);
  });
  T.void = makeTile(g => { g.fillStyle = '#0c0a10'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#16121c'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 3, 3); });
  T.abyss = makeTile(g => { g.fillStyle = '#000'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#0a0612'; g.fillRect(0, 0, 16, 4); });
  T.web = [0, 1, 2].map(v => makeTile(g => {
    g.drawImage(T.rock[v], 0, 0);
    g.strokeStyle = 'rgba(230,230,255,0.45)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(16, 16); g.moveTo(16, 0); g.lineTo(0, 16); g.moveTo(8, 0); g.lineTo(8, 16); g.stroke();
    g.beginPath(); g.arc(8, 8, 4, 0, Math.PI * 2); g.stroke();
  }));
  T.bone = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#3a3230'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#d8d0b8'; if (R() < 0.5) { const x = (R() * 10) | 0, y = (R() * 12) | 0; g.fillRect(x, y, 5, 1); g.fillRect(x - 1, y - 1, 2, 3); g.fillRect(x + 4, y - 1, 2, 3); }
    g.fillStyle = '#2a2420'; for (let i = 0; i < 5; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
  }));
  T.crystal = makeTile(g => {
    g.fillStyle = '#2a2430'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.beginPath(); g.moveTo(8, 0); g.lineTo(14, 9); g.lineTo(8, 16); g.lineTo(2, 9); g.fill();
    g.fillStyle = '#7fe8ff'; g.beginPath(); g.moveTo(8, 1); g.lineTo(13, 9); g.lineTo(8, 15); g.lineTo(3, 9); g.fill();
    g.fillStyle = '#d8f8ff'; g.fillRect(6, 4, 2, 6);
  });
  T.mush = makeTile(g => {
    g.fillStyle = '#2a2430'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(6, 8, 4, 8); g.beginPath(); g.arc(8, 7, 7, Math.PI, 0); g.fill();
    g.fillStyle = '#e8e0d0'; g.fillRect(7, 8, 2, 8);
    g.fillStyle = '#ff5ac8'; g.beginPath(); g.arc(8, 7, 6, Math.PI, 0); g.fill();
    g.fillStyle = '#fff'; g.fillRect(5, 4, 2, 1); g.fillRect(10, 3, 1, 1);
  });
  T.bridge = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x += 4) { g.fillStyle = '#6a4a2a'; g.fillRect(x, 2, 3, 12); g.fillStyle = '#8a6a3a'; g.fillRect(x, 2, 1, 12); }
    g.fillStyle = '#d8d0b8'; g.fillRect(0, 1, 16, 1); g.fillRect(0, 14, 16, 1);
  });
  T.webWall = makeTile(g => {
    g.fillStyle = '#1e1a24'; g.fillRect(0, 0, 16, 16);
    g.strokeStyle = 'rgba(240,240,255,0.9)'; g.lineWidth = 1;
    for (let i = 0; i < 16; i += 3) { g.beginPath(); g.moveTo(i, 0); g.lineTo(16 - i, 16); g.stroke(); }
    g.beginPath(); g.moveTo(0, 8); g.lineTo(16, 8); g.stroke();
  });
  T.hole = makeTile(g => {
    g.fillStyle = '#2a2430'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(8, 8, 7, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd36a'; g.fillRect(7, 7, 2, 2);
  });
  // Neo-Sakura
  T.side = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#9a9aa4'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#8a8a94'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 7); g.fillRect(12, 8, 1, 8);
    g.fillStyle = '#f8b8d0'; if (R() < 0.35) g.fillRect((R() * 14) | 0, (R() * 14) | 0, 2, 1);
  }));
  T.asph = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#4a4a58'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#545464'; for (let i = 0; i < 5; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
  }));
  T.asphLine = makeTile(g => { g.drawImage(T.asph[0], 0, 0); g.fillStyle = '#f0f0f0'; g.fillRect(2, 7, 9, 2); });
  T.zebra = makeTile(g => { g.drawImage(T.asph[0], 0, 0); g.fillStyle = '#f0f0f4'; for (let x = 1; x < 16; x += 4) g.fillRect(x, 1, 2, 14); });
  T.sakura = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(6, 9, 4, 7); g.fillStyle = '#4a2a1a'; g.fillRect(7, 9, 2, 7);
    g.fillStyle = '#000'; g.beginPath(); g.arc(8, 6, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f8a8c8'; g.beginPath(); g.arc(8, 6, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd8e8'; g.fillRect(4, 3, 3, 2); g.fillRect(9, 6, 3, 2); g.fillStyle = '#e888a8'; g.fillRect(6, 8, 3, 2);
  });
  T.neonJ = [0, 1, 2].map(v => makeTile(g => {
    g.fillStyle = ['#1c1a2e', '#2a1a22', '#1a2a2a'][v]; g.fillRect(0, 0, 16, 16);
    const c = ['#ff5ac8', '#ffd23a', '#5ff8ff'][v];
    g.fillStyle = c; g.fillRect(3, 2, 10, 1); g.fillRect(7, 2, 1, 6); g.fillRect(4, 5, 8, 1); g.fillRect(3, 9, 10, 1); g.fillRect(5, 9, 1, 5); g.fillRect(10, 9, 1, 5); g.fillRect(5, 13, 6, 1);
  }));
  T.shopDoor = makeTile(g => {
    g.fillStyle = '#e8ecf4'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#3a8ad8'; g.fillRect(0, 0, 16, 3); g.fillStyle = '#ff5a3a'; g.fillRect(0, 3, 16, 1);
    g.fillStyle = '#000'; g.fillRect(3, 5, 10, 11); g.fillStyle = '#9fd4ff'; g.fillRect(4, 6, 8, 10);
  });
  T.metro = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#3a3a48'; for (let y = 3; y < 16; y += 4) g.fillRect(1, y, 14, 2);
    g.fillStyle = '#2ab05a'; g.fillRect(0, 0, 16, 3); g.fillStyle = '#fff'; g.fillRect(6, 0, 4, 2);
  });
  T.gateBar = makeTile(g => {
    g.fillStyle = '#9a9aa4'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(0, 6, 16, 5); g.fillStyle = '#ffd23a'; for (let x = 0; x < 16; x += 6) g.fillRect(x, 7, 3, 3); g.fillStyle = '#1a1a1a'; for (let x = 3; x < 16; x += 6) g.fillRect(x, 7, 3, 3);
  });
  T.ruin = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#3a3438'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#5a5458'; for (let i = 0; i < 5; i++) g.fillRect((R() * 13) | 0, (R() * 13) | 0, 3, 2);
    g.strokeStyle = '#1a1416'; g.beginPath(); g.moveTo(R() * 16, 0); g.lineTo(R() * 16, 16); g.stroke();
  }));
  SPR.deepT = T;
}
