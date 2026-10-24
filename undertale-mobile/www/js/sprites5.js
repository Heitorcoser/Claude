// Pixel art da Fase 5: Ilha dos Doces (Marshmallow, Chocolate, Capataz Pirulito,
// Diretor Macaron, prisioneiros, uniforme cinza e tiles da cidade/campo).
'use strict';

const MACARON = [
  '..........kkkkkkkk..........',
  '..........kNNNNNNk..........',
  '..........kNNNNNNk..........',
  '..........kOOOOOOk..........',
  '........kkkkkkkkkkkk........',
  '......kkPPPPPPPPPPPPkk......',
  '....kkPPpPPPPPPPPPPPPPkk....',
  '...kPPPPkkkPPPPPPkkkPPPPk...',
  '...kPPPPkWkPPPPPPkOOkPPPk...',
  '..kPPPPPkkkPPPPPPkOWOkPPPk..',
  '..kPPPPPPPPPPPPPPPkOOkPPPk..',
  '..kkkkkkkkkkkkkkkkkkkkkkkk..',
  '..kCCCCkkkkCCCCkkkkCCCCCCk..',
  '..kCCCkkCCkkCCkkCCkkCCCCCk..',
  '..kkkkkkkkkkkkkkkkkkkkkkkk..',
  '..kPPPPPPPPPPPPPPPPPPPPPPk..',
  '...kPPPPPPPPPPPPPPPPPPPPk...',
  '....kkPPPPPPPPPPPPPPPPkk....',
  '......kkkkkkkkkkkkkkkk......',
  '.........kNk....kNk...kOk...',
  '.........kNk....kNk...kNk...',
  '........kkNk...kkNk...kNk...',
  '........kkkk...kkkk...kkk...',
];
const MACARON_PAL = { P: '#f08ac0', p: '#ffc0e0', C: '#fff0d8', N: '#1a1a24', O: '#ffd23a', W: '#ffffff' };

const CHOCO = [
  '....kkkkkkkk....',
  '...kGGGGGGGGk...',
  '..kkkkkkkkkkkk..',
  '...kBBBBBBBBk...',
  '...kBkkBBkkBk...',
  '...kBBBBBBBBk...',
  '...kBBkkkkBBk...',
  '...kbbbbbbbbk...',
  '..kBBBkBBkBBBk..',
  '.kBkBBBkBBkBBBk.',
  '.kBkbbbbbbbbbkBk',
  '.kBkBBBkBBkBBkBk',
  '.kkkBBBkBBkBBkkk',
  '...kbbbbbbbbk...',
  '...kBBBkkBBBk...',
  '...kBBk..kBBk...',
  '...kkkk..kkkk...',
];
const CHOCO_PAL = { G: '#5a5a3a', B: '#7a4a24', b: '#4a2a12' };
const GUARD_PAL = { G: '#3a3a4a', B: '#e8607a', b: '#a83a50' }; // guarda-jujuba

const GUMMY = [
  '..kk......kk..',
  '.kGGk....kGGk.',
  '.kGGkkkkkkGGk.',
  '..kGGGGGGGGk..',
  '.kGGkGGGGkGGk.',
  '.kGGGGkkGGGGk.',
  '.kGGGGGGGGGGk.',
  '..kkGGGGGGkk..',
  '.kGkGgggGGkGk.',
  'kGGkGggggGkGGk',
  'kGGkGGGGGGkGGk',
  '.kkkGGGGGGkkk.',
  '...kGGkkGGk...',
  '...kGGk.kGGk..',
  '...kkkk.kkkk..',
];
const GUMMY_PALS = { g1: { G: '#ff5a5a', g: '#ffa0a0' }, g2: { G: '#5ac85a', g: '#a0f0a0' }, g3: { G: '#ffd23a', g: '#fff0a0' }, g4: { G: '#a05aff', g: '#d0a8ff' } };

const UNIFORM_PAL = { G: '#7a7a86', Y: '#9a9aa8', B: '#5a5a66', D: '#3a3a42' };

function buildSprites5() {
  SPR.macaron = spriteFromRows(MACARON, false, MACARON_PAL);
  SPR.choco = spriteFromRows(CHOCO, false, CHOCO_PAL);
  SPR.guard = spriteFromRows(CHOCO, false, GUARD_PAL);
  SPR.gummy = {};
  for (const k of Object.keys(GUMMY_PALS)) SPR.gummy[k] = spriteFromRows(GUMMY, false, GUMMY_PALS[k]);
  // jogador com uniforme cinza do campo
  const L = [LEGS_STAND, LEGS_W1, LEGS_STAND, LEGS_W2], SL = [SLEGS_STAND, SLEGS_W, SLEGS_STAND, SLEGS_W];
  SPR.playerGray = {
    down: L.map(l => spriteFromRows(P_DOWN.concat(l), false, UNIFORM_PAL)),
    up: L.map(l => spriteFromRows(P_UP.concat(l), false, UNIFORM_PAL)),
    right: SL.map(l => spriteFromRows(P_SIDE.concat(l), false, UNIFORM_PAL)),
    left: SL.map(l => spriteFromRows(P_SIDE.concat(l), true, UNIFORM_PAL)),
  };
  SPR.lia = spriteFromRows(P_DOWN.concat(LEGS_STAND), false, { H: '#c8642a', h: '#e88a4a', ...UNIFORM_PAL });
  SPR.vovo = spriteFromRows(GHOST_ICE, false, { G: '#dcdce8', g: '#a8a8bc', X: '#c8c8d8', r: '#888', z: '#333', W: '#fff' });
  ROBOT_PALS.ferrugem = { A: '#b8784a', C: '#2a1a0a', E: '#ffb04a', R: '#7a4a2a', O: '#5a3a2a', Z: '#4a3a2a' };
  const fp = ROBOT_PALS.ferrugem;
  SPR.robot.ferrugem = { right: [spriteFromRows(ROBOT, false, fp), spriteFromRows(ROBOT_WHEEL, false, fp)], left: [spriteFromRows(ROBOT, true, fp), spriteFromRows(ROBOT_WHEEL, true, fp)], sad: spriteFromRows(ROBOT_SAD, false, fp) };

  SPR.marsh = makeCanvas(18, 24, g => {
    g.fillStyle = '#000'; g.fillRect(1, 5, 16, 19); g.fillRect(2, 4, 14, 1); g.fillRect(2, 24 - 1, 14, 1);
    g.fillStyle = '#fff8fc'; g.fillRect(2, 6, 14, 17);
    g.fillStyle = '#f0e0ea'; g.fillRect(2, 19, 14, 4);
    g.fillStyle = '#000'; g.fillRect(4, 0, 10, 6);
    g.fillStyle = '#ffffff'; g.fillRect(5, 1, 8, 4);
    g.fillStyle = '#ff7ab0'; g.fillRect(8, 2, 2, 2);
    g.fillStyle = '#000'; g.fillRect(6, 10, 2, 2); g.fillRect(11, 10, 2, 2); g.fillRect(8, 14, 3, 1);
    g.fillStyle = '#ffb0d0'; g.fillRect(4, 12, 2, 1); g.fillRect(13, 12, 2, 1);
  });
  SPR.pirulito = makeCanvas(20, 30, g => {
    g.fillStyle = '#000'; g.beginPath(); g.arc(10, 9, 9, 0, Math.PI * 2); g.fill();
    const cols = ['#ff3b3b', '#ffffff', '#ffd23a', '#ff3b3b', '#ffffff'];
    cols.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(10, 9, 8 - i * 1.6, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#000'; g.fillRect(5, 7, 3, 1); g.fillRect(12, 7, 3, 1); g.fillRect(6, 8, 2, 2); g.fillRect(12, 8, 2, 2); g.fillRect(7, 12, 6, 1);
    g.fillStyle = '#000'; g.fillRect(6, 17, 8, 13);
    g.fillStyle = '#3a3a4a'; g.fillRect(7, 18, 6, 9);
    g.fillStyle = '#e8ecf4'; g.fillRect(9, 18, 2, 12);
    g.fillStyle = '#ffd23a'; g.fillRect(13, 20, 4, 2);
  });
  SPR.brickPile = makeCanvas(24, 18, g => {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3 - r; c++) {
      const x = 2 + c * 7 + r * 3, y = 12 - r * 5;
      g.fillStyle = '#000'; g.fillRect(x, y, 8, 6); g.fillStyle = '#f4f0e8'; g.fillRect(x + 1, y + 1, 6, 4); g.fillStyle = '#d8d0c0'; g.fillRect(x + 1, y + 4, 6, 1);
    }
  });
  SPR.brick = makeCanvas(10, 8, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 10, 8); g.fillStyle = '#f4f0e8'; g.fillRect(1, 1, 8, 6); g.fillStyle = '#d8d0c0'; g.fillRect(1, 5, 8, 1); });
  SPR.bunk = makeCanvas(16, 28, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 16, 28);
    g.fillStyle = '#5a4a3a'; g.fillRect(1, 1, 14, 26);
    g.fillStyle = '#8a8a96'; g.fillRect(2, 3, 12, 8); g.fillRect(2, 16, 12, 8);
    g.fillStyle = '#3a2a1a'; g.fillRect(1, 13, 14, 2);
  });
  SPR.poster = makeCanvas(16, 20, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 16, 20);
    g.fillStyle = '#ffd23a'; g.fillRect(1, 1, 14, 18);
    g.fillStyle = '#f08ac0'; g.beginPath(); g.arc(8, 8, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#000'; g.fillRect(3, 15, 10, 1); g.fillRect(4, 17, 8, 1);
  });
  SPR.pot = makeCanvas(20, 16, g => {
    g.fillStyle = '#000'; g.fillRect(1, 4, 18, 12); g.fillRect(0, 4, 20, 2);
    g.fillStyle = '#6a6a78'; g.fillRect(2, 6, 16, 9);
    g.fillStyle = '#c8b890'; g.fillRect(2, 4, 16, 2);
  });
  buildIslandTiles();
}

function buildIslandTiles() {
  const R = rng(5050);
  const T = {};
  T.frost = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#f8c8dc'; g.fillRect(0, 0, 16, 16);
    const sp = ['#ff5a5a', '#5ac8ff', '#ffd23a', '#7aff7a', '#ffffff'];
    for (let i = 0; i < 6; i++) { g.fillStyle = sp[(R() * sp.length) | 0]; g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1); }
  }));
  T.cookie = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#d8a060'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a2a12'; for (let i = 0; i < 4; i++) g.fillRect((R() * 14) | 0, (R() * 14) | 0, 2, 2);
    g.fillStyle = '#e8b878'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 4, 1);
  }));
  T.wafer = makeTile(g => {
    g.fillStyle = '#e8c890'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#c8a060'; for (let i = 0; i < 16; i += 4) { g.fillRect(i, 0, 1, 16); g.fillRect(0, i, 16, 1); }
  });
  T.waferWin = makeTile(g => { g.drawImage(T.wafer, 0, 0); g.fillStyle = '#4a2a12'; g.fillRect(3, 3, 10, 10); g.fillStyle = '#ffe680'; g.fillRect(4, 4, 8, 8); });
  T.waferDoor = makeTile(g => { g.drawImage(T.wafer, 0, 0); g.fillStyle = '#4a2a12'; g.fillRect(3, 2, 10, 14); g.fillStyle = '#ff7ab0'; g.fillRect(4, 3, 8, 13); });
  T.icing = makeTile(g => {
    g.fillStyle = '#ff7ab0'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 16, 6); for (let x = 0; x < 16; x += 4) g.fillRect(x + 1, 6, 2, 2 + (x % 8 ? 2 : 0));
    g.fillStyle = '#ffd23a'; g.fillRect(4, 10, 1, 1); g.fillRect(11, 12, 1, 1);
  });
  T.lolli = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(7, 8, 3, 8); g.fillStyle = '#ffffff'; g.fillRect(8, 9, 1, 7);
    g.fillStyle = '#000'; g.beginPath(); g.arc(8, 6, 6.5, 0, Math.PI * 2); g.fill();
    ['#5ac8ff', '#ffffff', '#ff5a5a', '#ffffff'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(8, 6, 5.5 - i * 1.3, 0, Math.PI * 2); g.fill(); });
  });
  T.hosp = [0, 1, 2].map(() => makeTile(g => { g.fillStyle = '#eef2f6'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#d8dee6'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }));
  T.hospWall = makeTile(g => { g.fillStyle = '#c8d4e0'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ff9ac0'; g.fillRect(0, 10, 16, 2); g.fillStyle = '#b0bccc'; g.fillRect(0, 14, 16, 2); });
  T.dirt = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#6a6460'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#5a5450'; for (let i = 0; i < 7; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
    g.fillStyle = '#7a7470'; for (let i = 0; i < 4; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.gravel = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#86807a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#6a645e'; for (let i = 0; i < 10; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.fence = makeTile(g => {
    g.fillStyle = '#6a6460'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(6, 0, 4, 16);
    g.fillStyle = '#5a5a66'; g.fillRect(7, 0, 2, 16);
    g.strokeStyle = '#9a9aa8'; g.lineWidth = 1;
    for (let y = 2; y < 16; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(16, y + 2); g.stroke(); }
  });
  T.fenceCut = makeTile(g => {
    g.fillStyle = '#6a6460'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(0, 0, 3, 16); g.fillRect(13, 0, 3, 16);
    g.strokeStyle = '#9a9aa8'; g.beginPath(); g.moveTo(0, 4); g.lineTo(4, 6); g.moveTo(16, 10); g.lineTo(12, 8); g.stroke();
  });
  T.gate = makeTile(g => {
    g.fillStyle = '#6a6460'; g.fillRect(0, 0, 16, 16);
    for (let x = 1; x < 16; x += 4) { g.fillStyle = '#000'; g.fillRect(x, 0, 3, 16); g.fillStyle = '#4a4a56'; g.fillRect(x + 1, 0, 1, 16); }
    g.fillStyle = '#000'; g.fillRect(0, 6, 16, 3);
  });
  T.concrete = makeTile(g => {
    g.fillStyle = '#5a5a62'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a4a52'; for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
    g.fillStyle = '#6a6a72'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 3, 1);
  });
  T.boards = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#4a3a2c'; g.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 4) { g.fillStyle = '#3a2c20'; g.fillRect(0, y + 3, 16, 1); }
    g.fillStyle = '#5a4a3c'; g.fillRect((R() * 12) | 0, (R() * 14) | 0, 4, 1);
  }));
  T.factory = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#3a3a44'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#44444e'; g.fillRect(1, 1, 14, 14);
    g.fillStyle = '#2a2a32'; g.fillRect(0, 15, 16, 1);
  }));
  T.door = makeTile(g => { g.fillStyle = '#2a2420'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#4a3a2c'; g.fillRect(2, 0, 12, 16); });
  T.tower = makeTile(g => {
    g.fillStyle = '#c8a040'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#a88020'; for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
    g.fillStyle = '#ffe680'; g.fillRect(6, 4, 4, 6);
  });
  T.towerDoor = makeTile(g => { g.drawImage(T.tower, 0, 0); g.fillStyle = '#000'; g.fillRect(2, 1, 12, 15); g.fillStyle = '#8a1a2a'; g.fillRect(3, 2, 10, 14); g.fillStyle = '#ffd23a'; g.fillRect(10, 8, 2, 2); });
  T.carpet = [0, 1, 2].map(() => makeTile(g => { g.fillStyle = '#8a1a2a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ffd23a'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); g.fillStyle = '#9a2a3a'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 3, 3); }));
  T.void = makeTile(g => { g.fillStyle = '#1a1416'; g.fillRect(0, 0, 16, 16); });
  T.sea = [0, 1, 2].map(f => makeTile(g => {
    g.fillStyle = '#8a4a2a'; g.fillRect(0, 0, 16, 16); // mar de chocolate
    g.fillStyle = '#a8603a'; for (let x = 0; x < 16; x++) if (Math.sin((x + f * 4) * 0.7) > 0.5) g.fillRect(x, 4 + (x % 3), 1, 1);
    g.fillStyle = '#c8804a'; g.fillRect((f * 5 + 2) % 14, (f * 7 + 9) % 14, 2, 1);
  }));
  SPR.islT = T;
}
