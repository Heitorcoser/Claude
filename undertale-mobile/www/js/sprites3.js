// Pixel art da Fase 3: Colônia de Gelo (tiles de neve, pinguins, boneco de neve, estranho encapuzado).
'use strict';

const PINGUIM = [
  '........kkkkkk..........',
  '......kkZZZZZZkk........',
  '.....kZZZZZZZZZZk.......',
  '....kZkkZZZZZZkkZk......',
  '....kZZZkWZZWkZZZk......',
  '....kZZWkkZZkkWZZk......',
  '...kZZZZWWYYWWZZZZk.....',
  '...kZZZZZYYYYZZZZZk.....',
  '..kZZZWWWWYYWWWWZZZk....',
  '..kZZWWWWWWWWWWWWZZk....',
  '.kZZkWWWWWWWWWWWWkZZk...',
  '.kZk.kWWWWWWWWWWk.kZk...',
  '.kZk.kWWWWWWWWWWk.kZk...',
  '..k..kWWWWWWWWWWk..k....',
  '.....kZWWWWWWWWZk.......',
  '......kZZZZZZZZk........',
  '.....kYYYk..kYYYk.......',
  '.....kkkkk..kkkkk.......',
];
const PING_PAL = { Z: '#2a3550', W: '#f4f8ff', Y: '#ff9a2a' };
// pinguim morador (sem sobrancelha brava)
const PINGUIM_NPC = PINGUIM.slice();
PINGUIM_NPC[3] = '....kZZZZZZZZZZZZk......';

const NEVOSO = [
  '.........kkkkkk.........',
  '.........kNNNNk.........',
  '.........kNNNNk.........',
  '.......kkkkkkkkkk.......',
  '........kWWWWWWk........',
  '.......kWWWWWWWWk.......',
  '.......kWkWWWWkWk.......',
  '.......kWWWYYWWWk.......',
  '.......kWWWWYYYYk.......',
  '........kWkkkkWk........',
  '.........kWWWWk.........',
  '......kRRRRRRRRRRk......',
  '.......kRRkWWWWWk.......',
  '.N....kWRRWWWWWWWk....N.',
  '..N..kWWRRWWkWWWWWk..N..',
  '...NkWWWWWWWWWWWWWWkN...',
  '....kWWWWWWWkWWWWWWk....',
  '....kWWWWWWWWWWWWWWk....',
  '.....kWWWWWWkWWWWWk.....',
  '....kWWWWWWWWWWWWWWk....',
  '...kWWWWWWWWWWWWWWWWk...',
  '...kWWWWWWWWkWWWWWWWk...',
  '...kWWWWWWWWWWWWWWWWk...',
  '...ktWWWWWWWWWWWWWWtk...',
  '....kttWWWWWWWWWWttk....',
  '.....kkkkkkkkkkkkkk.....',
];
const NEVE_PAL = { W: '#f4f8ff', t: '#b8cce4', N: '#5a3a1a', Y: '#ff8a2a', R: '#d8443a' };

const ENCAPUZADO = [
  '......kkkk......',
  '....kkCCCCkk....',
  '...kCCCCCCCCk...',
  '..kCCCkkkkCCCk..',
  '..kCCkkkkkkCCk..',
  '..kCkkEkkEkkCk..',
  '..kCkkkkkkkkCk..',
  '..kCCkkkkkkCCk..',
  '...kCCkkkkCCk...',
  '..kCCCCCCCCCCk..',
  '.kCCCCCcCCCCCCk.',
  '.kCCCCCcCCCCCCk.',
  'kCCCCCCcCCCCCCCk',
  'kCCcCCCcCCCCcCCk',
  'kCCcCCCcCCCCcCCk',
  'kCCcCCCcCCCCcCCk',
  'kkCcCCCcCCCCcCkk',
  '.kCCCCCcCCCCCCk.',
  '.kCCCCCcCCCCCCk.',
  '.kCCCCCcCCCCCCk.',
  'kCCcCCCcCCCCcCCk',
  'kCCcCCCcCCCCcCCk',
  'kcCCCcCcCcCCCCck',
  'kkkkkkkkkkkkkkkk',
];
const CAPUZ_PAL = { C: '#26305a', c: '#161c38', E: '#9fe4ff' };

function buildSprites3() {
  SPR.pinguim = spriteFromRows(PINGUIM, false, PING_PAL);
  SPR.pinguimNpc = spriteFromRows(PINGUIM_NPC, false, PING_PAL);
  SPR.pinguimNpcL = spriteFromRows(PINGUIM_NPC, true, PING_PAL);
  SPR.nevoso = spriteFromRows(NEVOSO, false, NEVE_PAL);
  SPR.encapuzado = spriteFromRows(ENCAPUZADO, false, CAPUZ_PAL);
  SPR.iceBlock = makeCanvas(16, 18, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 16, 18);
    g.fillStyle = '#7fc8ec'; g.fillRect(1, 1, 14, 16);
    g.fillStyle = '#bfeaff'; g.fillRect(1, 1, 14, 5);
    g.fillStyle = '#ffffff'; g.fillRect(3, 2, 5, 1); g.fillRect(3, 3, 2, 1);
    g.fillStyle = '#5aa8d8'; g.fillRect(1, 15, 14, 2); g.fillRect(12, 6, 2, 8);
  });
  SPR.lever = [0, 1].map(on => makeCanvas(14, 18, g => {
    g.fillStyle = '#000'; g.fillRect(2, 12, 10, 6);
    g.fillStyle = '#6a6a78'; g.fillRect(3, 13, 8, 4);
    g.fillStyle = '#000'; g.save(); g.translate(7, 13); g.rotate(on ? 0.6 : -0.6); g.fillRect(-1.5, -12, 3, 12); g.restore();
    g.fillStyle = '#d8443a'; g.beginPath(); g.arc(on ? 13 : 1, 3, 2.5, 0, Math.PI * 2); g.fill();
  }));
  SPR.snowman = makeCanvas(18, 26, g => {
    const c = (x, y, r, col) => { g.fillStyle = '#000'; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
    c(9, 19, 7, '#f4f8ff'); c(9, 9, 5, '#f4f8ff');
    g.fillStyle = '#000'; g.fillRect(7, 8, 1, 1); g.fillRect(10, 8, 1, 1); g.fillRect(4, 0, 10, 2); g.fillRect(6, 0, 6, 4);
    g.fillStyle = '#ff8a2a'; g.fillRect(9, 10, 3, 1);
    g.fillStyle = '#d8443a'; g.fillRect(4, 13, 10, 2);
  });
  SPR.phone = makeCanvas(14, 22, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 14, 22);
    g.fillStyle = '#3a3a48'; g.fillRect(1, 1, 12, 20);
    g.fillStyle = '#9fe4ff'; g.fillRect(2, 3, 10, 13);
    g.fillStyle = '#ffffff'; g.fillRect(5, 18, 4, 2);
  });
  buildSnowTiles();
}

function buildSnowTiles() {
  const R = rng(333);
  const T = {};
  T.snow = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#e4ecf6'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#d0dcea'; for (let i = 0; i < 6; i++) g.fillRect((R() * 14) | 0, (R() * 15) | 0, 3, 1);
    g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.path = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#c4d0e0'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#b0bed2'; for (let i = 0; i < 7; i++) g.fillRect((R() * 14) | 0, (R() * 15) | 0, 2, 1);
    g.fillStyle = '#d8e2ee'; for (let i = 0; i < 4; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
  }));
  T.deep = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#dce6f4'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#c2d0e6'; for (let i = 0; i < 3; i++) { const x = (R() * 10) | 0, y = (R() * 13) | 0; g.fillRect(x, y, 6, 1); g.fillRect(x + 1, y + 1, 4, 1); }
    g.fillStyle = '#9fe4ff'; if (R() < 0.5) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.ice = [0, 1, 2].map(v => makeTile(g => {
    g.fillStyle = '#a8def6'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#c8ecfc'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
    g.fillStyle = '#ffffff'; g.fillRect(3 + v * 3, 4, 4, 1); g.fillRect(4 + v * 3, 5, 2, 1);
    g.fillStyle = '#8ccbea'; g.fillRect(9 - v, 11, 5, 1);
  }));
  T.rockWall = makeTile(g => {
    g.fillStyle = '#1c2434'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#242e42'; for (let i = 0; i < 5; i++) g.fillRect((R() * 14) | 0, (R() * 14) | 0, 3, 2);
  });
  T.cliff = makeTile(g => {
    g.fillStyle = '#4a5870'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#5c6c86'; for (let y = 4; y < 16; y += 5) g.fillRect(0, y, 16, 2);
    g.fillStyle = '#36435a'; for (let i = 0; i < 6; i++) g.fillRect((R() * 15) | 0, (R() * 12 + 4) | 0, 1, 3);
    g.fillStyle = '#f4f8ff'; g.fillRect(0, 0, 16, 3); g.fillRect(2, 3, 3, 1); g.fillRect(9, 3, 4, 2);
  });
  T.water = [0, 1, 2].map(f => makeTile(g => {
    g.fillStyle = '#163a68'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#245a94';
    for (let y = 2; y < 16; y += 5) for (let x = 0; x < 16; x++) if (Math.sin((x + f * 4) * 0.7) > 0.55) g.fillRect(x, y, 1, 1);
    g.fillStyle = '#9fd4ff'; g.fillRect((f * 5 + 3) % 14, (f * 7 + 2) % 14, 2, 1);
  }));
  T.pine = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(6, 12, 4, 4);
    g.fillStyle = '#4a2a14'; g.fillRect(7, 12, 2, 4);
    const tri = (y, w, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(8, y); g.lineTo(8 - w, y + 6); g.lineTo(8 + w, y + 6); g.fill(); };
    tri(0, 4, '#000'); tri(4, 6, '#000'); tri(7, 7.5, '#000');
    tri(1, 3, '#1f5a3a'); tri(5, 5, '#1f5a3a'); tri(8, 6.5, '#1f5a3a');
    g.fillStyle = '#f4f8ff'; g.fillRect(7, 1, 2, 2); g.fillRect(4, 6, 3, 1); g.fillRect(10, 9, 3, 1); g.fillRect(3, 10, 2, 1);
  });
  T.rock = makeTile(g => {
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(8, 9, 7.5, 6.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6c7a90'; g.beginPath(); g.ellipse(8, 9, 6.5, 5.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f4f8ff'; g.beginPath(); g.ellipse(8, 5.5, 5, 2.5, 0, 0, Math.PI * 2); g.fill();
  });
  T.roofSnow = makeTile(g => {
    g.fillStyle = '#5a3a1e'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#f4f8ff'; g.fillRect(0, 0, 16, 11);
    g.fillStyle = '#d6e2f0'; g.fillRect(0, 9, 16, 2);
    g.fillStyle = '#f4f8ff'; g.fillRect(2, 11, 3, 2); g.fillRect(9, 11, 2, 3);
  });
  T.logs = makeTile(g => {
    g.fillStyle = '#7a4a24'; g.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 4) { g.fillStyle = '#9a6234'; g.fillRect(0, y, 16, 3); g.fillStyle = '#5a3418'; g.fillRect(0, y + 3, 16, 1); }
  });
  T.logWin = makeTile(g => {
    g.drawImage(T.logs, 0, 0);
    g.fillStyle = '#2a1608'; g.fillRect(3, 3, 10, 10);
    g.fillStyle = '#ffd36a'; g.fillRect(4, 4, 8, 8);
    g.fillStyle = '#2a1608'; g.fillRect(7, 4, 2, 8); g.fillRect(4, 7, 8, 2);
  });
  T.logDoor = makeTile(g => {
    g.drawImage(T.logs, 0, 0);
    g.fillStyle = '#1a0c04'; g.fillRect(3, 2, 10, 14);
    g.fillStyle = '#4a2a10'; g.fillRect(4, 3, 8, 13);
    g.fillStyle = '#ffd36a'; g.fillRect(10, 9, 1, 2);
  });
  const plate = (mark) => makeTile(g => {
    g.fillStyle = '#7c9cbc'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#b8d4ec'; g.fillRect(1, 1, 14, 14);
    g.fillStyle = '#d8ecfc'; g.fillRect(1, 1, 14, 2);
    mark && mark(g);
  });
  T.xTile = plate(g => { g.strokeStyle = '#2a5aa8'; g.lineWidth = 2; g.beginPath(); g.moveTo(4, 4); g.lineTo(12, 12); g.moveTo(12, 4); g.lineTo(4, 12); g.stroke(); });
  T.oTile = plate(g => { g.strokeStyle = '#2aa84a'; g.lineWidth = 2; g.beginPath(); g.arc(8, 8, 4.5, 0, Math.PI * 2); g.stroke(); });
  T.switchOff = plate(g => { g.fillStyle = '#000'; g.beginPath(); g.arc(8, 8, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d8443a'; g.beginPath(); g.arc(8, 8, 4, 0, Math.PI * 2); g.fill(); });
  T.switchOn = plate(g => { g.fillStyle = '#000'; g.beginPath(); g.arc(8, 8, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3ce64b'; g.beginPath(); g.arc(8, 8, 4, 0, Math.PI * 2); g.fill(); });
  T.gate = makeTile(g => {
    g.fillStyle = '#c4d0e0'; g.fillRect(0, 0, 16, 16);
    for (let x = 1; x < 16; x += 4) { g.fillStyle = '#000'; g.fillRect(x, 0, 3, 16); g.fillStyle = '#9fe4ff'; g.fillRect(x + 1, 0, 1, 16); }
    g.fillStyle = '#000'; g.fillRect(0, 3, 16, 3); g.fillStyle = '#c8f0ff'; g.fillRect(0, 4, 16, 1);
  });
  T.jokeDoor = makeTile(g => {
    g.fillStyle = '#1c2434'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(1, 0, 14, 16);
    g.fillStyle = '#c8402a'; g.fillRect(2, 1, 12, 15);
    g.fillStyle = '#ffd23a'; g.fillRect(4, 4, 2, 5); g.fillRect(6, 6, 1, 1); g.fillRect(7, 4, 2, 5); g.fillRect(10, 4, 2, 5); g.fillRect(12, 4, 1, 1); g.fillRect(10, 6, 3, 1);
  });
  T.bridgePlate = makeTile(g => {
    g.fillStyle = '#163a68'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#9cc4e4'; g.fillRect(1, 1, 14, 14);
    g.fillStyle = '#c4e2f8'; g.fillRect(1, 1, 14, 2);
    g.fillStyle = '#84acd0'; g.fillRect(3, 9, 4, 1); g.fillRect(10, 5, 3, 1);
  });
  T.bridgeSafe = makeTile(g => {
    g.drawImage(T.bridgePlate, 0, 0);
    g.fillStyle = 'rgba(70,100,140,0.45)'; // pegadas de pinguim, bem discretas
    for (const [x, y] of [[4, 4], [10, 10]]) { g.fillRect(x, y, 1, 2); g.fillRect(x + 1, y + 1, 1, 2); g.fillRect(x + 2, y, 1, 2); }
  });
  T.iceWall = makeTile(g => {
    g.fillStyle = '#8ccbea'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#5aa0d0'; for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
    for (let y = 0; y < 16; y += 4) for (let x = (y / 4) % 2 ? 4 : 0; x < 16; x += 8) g.fillRect(x, y, 1, 3);
    g.fillStyle = '#d8f4ff'; g.fillRect(2, 1, 3, 1); g.fillRect(10, 9, 3, 1);
  });
  T.iceRoof = makeTile(g => {
    g.fillStyle = '#3a6a9a'; g.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 4) { g.fillStyle = '#5a90c4'; g.fillRect(0, y, 16, 3); g.fillStyle = '#9fd4ff'; g.fillRect(0, y, 16, 1); }
  });
  T.iceWin = makeTile(g => {
    g.drawImage(T.iceWall, 0, 0);
    g.fillStyle = '#1a3a6a'; g.fillRect(3, 3, 10, 10);
    g.fillStyle = '#7fd9ff'; g.fillRect(4, 4, 8, 8);
    g.fillStyle = '#1a3a6a'; g.fillRect(7, 4, 2, 8);
  });
  T.iceDoor = makeTile(g => {
    g.drawImage(T.iceWall, 0, 0);
    g.fillStyle = '#0c1c34'; g.fillRect(2, 1, 12, 15);
    g.fillStyle = '#2a5a8a'; g.fillRect(3, 2, 10, 14);
    g.fillStyle = '#9fe4ff'; g.fillRect(7, 2, 2, 14);
  });
  SPR.snowT = T;
}
