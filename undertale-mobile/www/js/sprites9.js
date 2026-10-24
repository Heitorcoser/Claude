// Pixel art das Fases 12, 13 e 14: os dois humanos do grupo (Kai e Luna), Carmim,
// o surfista Kauã, a Dra. Pena, hospital, praia, casa, porão e a porta gigante.
'use strict';

const KAI = [
  '..k.kk.kk.k...',
  '.kHkHHkHHkHk..',
  '.kHHHHHHHHHHk.',
  'kHHHHHHHHHHHHk',
  'kHHSSSSSSSSHHk',
  '.kHSSSSSSSSHk.',
  '.kSSkSSSSkSSk.',
  '.kSSkSSSSkSSk.',
  '..kSSSkkSSSk..',
  '...kkSSSSkk...',
  '..kRRWWWWRRk..',
  '.kRRRWWWWRRRk.',
  'kRkRRWWWWRRkRk',
  'kRkRRWWWWRRkRk',
  'kSkRRRRRRRRkSk',
  'kkkRRRRRRRRkkk',
  '..kBBBBBBBBk..',
  '..kBBBkkBBBk..',
  '..kBBk..kBBk..',
  '..kDDk..kDDk..',
  '..kkkk..kkkk..',
];
const KAI_PAL = { H: '#1a1a24', S: '#e8b07a', R: '#c8302a', W: '#f0f0f0', B: '#2a4a8a', D: '#1a1a1a' };

const LUNA = [
  '....kkkkkk....',
  '...kHHHHHHk...',
  '..kHHhHHHHHk..',
  '.kHHHHHHHHHHk.',
  '.kHHSSSSSSHHk.',
  'kHHSSSSSSSSHHk',
  'kHSSkSSSSkSSHk',
  'kHSSkSSSSkSSHk',
  'kHHSSSppSSSHHk',
  'kHHkkSSSSkkHHk',
  'kHkVVVVVVVVkHk',
  '.kVVVWWWWVVVk.',
  'kVkVVVVVVVVkVk',
  'kVkVVVVVVVVkVk',
  'kSkVVVVVVVVkSk',
  'kkkVVVVVVVVkkk',
  '..kVVVVVVVVk..',
  '.kVVVVVVVVVVk.',
  '..kkkSkkSkkk..',
  '...kDk..kDk...',
  '...kkk..kkk...',
];
const LUNA_PAL = { H: '#8a5ad8', h: '#b08aff', S: '#f8d0b0', p: '#e88a9a', V: '#5a3aa8', W: '#ffe680', D: '#2a1a3a' };

const CARMIM = [
  '....kkkkkk....',
  '...kHHHHHHk...',
  '..kHHhHHHHHk..',
  '.kHHHHHHHHHHk.',
  '.kHHHSSSSHHHk.',
  '.kHSSSSSSSSHk.',
  '.kHSkRSSRkSHk.',
  '.kHSSSSSSSSHk.',
  '..kSpSkkSpSk..',
  '...kkSSSSkk...',
  '..kGGGGGGGGk..',
  '.kGGGGGGGGGGk.',
  'kGkYYYYYYYYkGk',
  'kGkGGGGGGGGkGk',
  'kSkGGGGGGGGkSk',
  'kkkGGGGGGGGkkk',
  '..kBBBBBBBBk..',
  '..kBBBkkBBBk..',
  '..kBBk..kBBk..',
  '..kDDk..kDDk..',
  '..kkkk..kkkk..',
];
const CARMIM_PAL = { H: '#7a4a24', h: '#9a6a3a', S: '#f8d8b8', R: '#e01a2a', p: '#f08a8a', G: '#3aa05a', Y: '#f2d040', B: '#6a4a2a', D: '#3a2a1a' };

const KAUA = [
  '...k.kkkkk.k..',
  '..kHkHHHHHkHk.',
  '.kHHHHhHHHHHk.',
  '.kHHHHHHHHHHk.',
  '.kHSSSSSSSSHk.',
  '.kSSSSSSSSSSk.',
  '.kSkkkkkkkkSk.',
  '.kSkkkSSkkkSk.',
  '..kSSSkkSSSk..',
  '...kkSSSSkk...',
  '..kSOSSSSOSk..',
  '.kOOSSSSSSOOk.',
  'kSkOSSSSSSOkSk',
  'kSkOSSSSSSOkSk',
  'kSkOSSSSSSOkSk',
  'kkkCCCCCCCCkkk',
  '..kCCCCCCCCk..',
  '..kCCCkkCCCk..',
  '..kSSk..kSSk..',
  '..kSSk..kSSk..',
  '..kkkk..kkkk..',
];
const KAUA_PAL = { H: '#ffd84a', h: '#fff0a0', S: '#c88a5a', O: '#ff8a2a', C: '#2ab0c8' };

const PENA = [
  '.....kkkk.....',
  '....kWWWWk....',
  '...kWRWWRWk...',
  '...kWWRRWWk...',
  '..kkkkkkkkkk..',
  '..kFFFFFFFFk..',
  '.kFFkFFFFkFFk.',
  '.kFFFFOOFFFFk.',
  '.kFFFFFOFFFFk.',
  '..kFFFFFFFFk..',
  '.kWWWWWWWWWWk.',
  'kFkWWWRRWWWkFk',
  'kFkWWRRRRWWkFk',
  'kFkWWWRRWWWkFk',
  '.kkWWWWWWWWkk.',
  '..kWWWWWWWWk..',
  '...kOk..kOk...',
  '...kkk..kkk...',
];
const PENA_PAL = { W: '#ffffff', R: '#e0303a', F: '#a8d8ff', O: '#ffb02a' };

function buildSprites9() {
  SPR.party = {
    kai: spriteFromRows(KAI, false, KAI_PAL), kaiL: spriteFromRows(KAI, true, KAI_PAL),
    luna: spriteFromRows(LUNA, false, LUNA_PAL), lunaL: spriteFromRows(LUNA, true, LUNA_PAL),
  };
  SPR.carmim = spriteFromRows(CARMIM, false, CARMIM_PAL);
  SPR.kaua = spriteFromRows(KAUA, false, KAUA_PAL);
  SPR.pena = spriteFromRows(PENA, false, PENA_PAL);
  SPR.prancha = makeCanvas(10, 30, g => {
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(5, 15, 5, 15, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ff5ac8'; g.beginPath(); g.ellipse(5, 15, 4, 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffe680'; g.fillRect(4, 3, 2, 24);
  });
  SPR.palm = makeCanvas(32, 44, g => {
    g.fillStyle = '#000'; g.fillRect(13, 14, 7, 30);
    g.fillStyle = '#8a5a2a'; g.fillRect(14, 14, 5, 30); g.fillStyle = '#6a4a1a'; for (let y = 16; y < 44; y += 5) g.fillRect(14, y, 5, 1);
    const leaf = (a) => { g.save(); g.translate(16, 14); g.rotate(a); g.fillStyle = '#000'; g.beginPath(); g.ellipse(9, 0, 11, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3ab04a'; g.beginPath(); g.ellipse(9, 0, 10, 3, 0, 0, Math.PI * 2); g.fill(); g.restore(); };
    [-2.8, -2, -1.2, -0.4, 0.3].forEach(leaf);
    g.fillStyle = '#6a4a1a'; g.beginPath(); g.arc(14, 16, 2.5, 0, Math.PI * 2); g.arc(19, 16, 2.5, 0, Math.PI * 2); g.fill();
  });
  SPR.quiosque = makeCanvas(40, 34, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 40, 10); g.fillRect(3, 10, 4, 24); g.fillRect(33, 10, 4, 24); g.fillRect(2, 20, 36, 14);
    for (let x = 1; x < 39; x += 6) { g.fillStyle = (x / 6) % 2 < 1 ? '#ff5a5a' : '#ffffff'; g.fillRect(x, 1, 6, 8); }
    g.fillStyle = '#c89a5a'; g.fillRect(4, 10, 2, 24); g.fillRect(34, 10, 2, 24); g.fillRect(3, 21, 34, 12);
    g.fillStyle = '#ffe680'; g.fillRect(8, 24, 6, 6); g.fillStyle = '#ff8a2a'; g.fillRect(18, 24, 6, 6); g.fillStyle = '#7ad8ff'; g.fillRect(28, 24, 6, 6);
  });
  SPR.cama = makeCanvas(20, 30, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 20, 30);
    g.fillStyle = '#c8ccd8'; g.fillRect(1, 1, 18, 28);
    g.fillStyle = '#ffffff'; g.fillRect(3, 3, 14, 7);
    g.fillStyle = '#7ab0e8'; g.fillRect(2, 12, 16, 16); g.fillStyle = '#5a90c8'; g.fillRect(2, 12, 16, 2);
  });
  SPR.portaGigante = makeCanvas(64, 80, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 64, 80);
    g.fillStyle = '#4a4a5a'; g.fillRect(2, 2, 60, 78);
    g.fillStyle = '#2a2a38'; g.fillRect(8, 10, 22, 70); g.fillRect(34, 10, 22, 70);
    g.fillStyle = '#5a5a6a'; g.fillRect(2, 2, 60, 6);
    // símbolo de asas e coração
    g.fillStyle = '#b08aff'; g.beginPath(); g.moveTo(32, 30); g.lineTo(14, 24); g.lineTo(20, 34); g.lineTo(12, 38); g.lineTo(32, 36); g.fill();
    g.beginPath(); g.moveTo(32, 30); g.lineTo(50, 24); g.lineTo(44, 34); g.lineTo(52, 38); g.lineTo(32, 36); g.fill();
    g.fillStyle = '#ff3b3b'; g.beginPath(); g.moveTo(32, 50); g.lineTo(26, 43); g.lineTo(29, 40); g.lineTo(32, 42); g.lineTo(35, 40); g.lineTo(38, 43); g.fill();
    g.fillStyle = '#ffe680'; g.fillRect(29, 56, 2, 6); g.fillRect(33, 56, 2, 6);
  });
  SPR.mesa = makeCanvas(32, 22, g => {
    g.fillStyle = '#000'; g.fillRect(0, 4, 32, 10); g.fillRect(2, 14, 4, 8); g.fillRect(26, 14, 4, 8);
    g.fillStyle = '#a8743a'; g.fillRect(1, 5, 30, 8); g.fillRect(3, 14, 2, 8); g.fillRect(27, 14, 2, 8);
    g.fillStyle = '#ffffff'; g.fillRect(6, 2, 6, 4); g.fillRect(20, 2, 6, 4); g.fillStyle = '#ff8a2a'; g.fillRect(7, 2, 4, 2); g.fillStyle = '#7aff7a'; g.fillRect(21, 2, 4, 2);
  });
  buildTiles9();
}

function buildTiles9() {
  const R = rng(1212);
  const T = {};
  T.hosp = [0, 1].map(v => makeTile(g => { g.fillStyle = v ? '#e8f0f8' : '#dce8f4'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c8d8e8'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }));
  T.hospWall = makeTile(g => { g.fillStyle = '#a8d0e8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ffffff'; g.fillRect(0, 12, 16, 4); g.fillStyle = '#e0303a'; g.fillRect(0, 11, 16, 1); });
  T.sea = [0, 1, 2].map(f => makeTile(g => {
    g.fillStyle = '#2a7ad8'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a9ae8'; for (let i = 0; i < 3; i++) g.fillRect(((i * 6 + f * 3) % 16), 3 + i * 5, 5, 1);
    g.fillStyle = '#d8f4ff'; if (f === 1) g.fillRect(9, 9, 3, 1);
  }));
  T.shore = [0, 1, 2].map(f => makeTile(g => {
    g.fillStyle = '#e8d098'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#2a7ad8'; g.fillRect(0, 10 + (f % 2), 16, 6);
    g.fillStyle = '#ffffff'; g.fillRect(0, 9 + (f % 2), 16, 2);
  }));
  T.sand = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#f0d898'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#e0c888'; for (let i = 0; i < 6; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
    if (R() < 0.15) { g.fillStyle = '#ff8a8a'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 2, 2); }
  }));
  T.wood = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#b8844a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#9a6a3a'; g.fillRect(0, 5, 16, 1); g.fillRect(0, 11, 16, 1); g.fillRect((R() * 14) | 0, 0, 1, 5);
  }));
  T.houseWall = makeTile(g => { g.fillStyle = '#f0e0c0'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#d8c8a0'; g.fillRect(0, 13, 16, 3); g.fillStyle = '#c8a87a'; g.fillRect(0, 12, 16, 1); });
  T.rug = makeTile(g => { g.fillStyle = '#c8402a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ffe680'; g.fillRect(2, 2, 12, 1); g.fillRect(2, 13, 12, 1); g.fillRect(2, 2, 1, 12); g.fillRect(13, 2, 1, 12); });
  T.stairs = makeTile(g => { g.fillStyle = '#3a2a1a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#6a4a2a'; for (let y = 1; y < 16; y += 4) g.fillRect(1, y, 14, 2); });
  T.basement = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#3a3a44'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#2a2a34'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 7); g.fillRect(12, 8, 1, 8);
    g.fillStyle = '#4a4a54'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 3, 2);
  }));
  T.basementWall = makeTile(g => { g.fillStyle = '#24242c'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#2e2e38'; for (let y = 2; y < 16; y += 5) g.fillRect(0, y, 16, 2); });
  SPR.t9 = T;
}
