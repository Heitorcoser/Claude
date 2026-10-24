// Pixel art da Fase 4: Cidade Futurista (robô BIT, crianças, valentões, drones, tiles neon).
'use strict';

const ROBOT = [
  '.......kk.......',
  '.......kRk......',
  '.......kk.......',
  '........k.......',
  '....kkkkkkkk....',
  '...kAAAAAAAAk...',
  '..kAkkkkkkkkAk..',
  '..kAkCCCCCCkAk..',
  '..kAkCEkkECkAk..',
  '..kAkCEkkECkAk..',
  '..kAkCCEECCkAk..',
  '..kAkkkkkkkkAk..',
  '...kAAAAAAAAk...',
  '....kkkkkkkk....',
  '..kkkAAAAAAkkk..',
  '.kAkkAOOOOAkkAk.',
  '.kAk.kAOOAAk.kAk',
  '.kkk.kAAAAk..kkk',
  '....kkkkkkkk....',
  '...kZZZZZZZZk...',
  '...kZkZkZkZZk...',
  '....kkkkkkkk....',
];
const ROBOT_WHEEL = ROBOT.slice(); ROBOT_WHEEL[20] = '...kZZkZkZkZk...';
const ROBOT_SAD = ROBOT.slice();
ROBOT_SAD[8] = '..kAkCCCCCCkAk..';
ROBOT_SAD[9] = '..kAkEECCEEkAk..';
ROBOT_SAD[10] = '..kAkCCCCCCkAk..';
const ROBOT_PALS = {
  bit: { A: '#b8c4d4', C: '#0a2a3a', E: '#5ff8ff', R: '#ff3b3b', O: '#ffa21a', Z: '#3a3a48' },
  volt: { A: '#f0a8d0', C: '#2a0a2a', E: '#ffe680', R: '#ffe680', O: '#8a5aff', Z: '#4a3a5a' },
  ouro: { A: '#e8c860', C: '#2a1a0a', E: '#7fff9f', R: '#7fff9f', O: '#ff5a5a', Z: '#5a4a2a' },
  verde: { A: '#8ad8a0', C: '#0a2a1a', E: '#ffffff', R: '#ffa21a', O: '#5ff8ff', Z: '#2a4a3a' },
};

// Valentão: corpo de criança com sobrancelha brava
const BULLY_DOWN = P_DOWN.slice();
BULLY_DOWN[5] = '.kHkkSSSSkkHk.';
BULLY_DOWN[6] = '.kSSkkSSkkSSk.';
BULLY_DOWN[8] = '..kSSkkkkSSk..';
const KID_PALS = {
  k1: { H: '#e8c040', h: '#ffe080', G: '#3a7ad8', Y: '#ffffff', B: '#4a4a52' },
  k2: { H: '#1a1a1a', h: '#3a3a3a', G: '#d8443a', Y: '#ffe680', B: '#3a55a4' },
  k3: { H: '#c8642a', h: '#e88a4a', G: '#8a5aff', Y: '#ffb0d8', B: '#2a2a3a' },
  k4: { H: '#5a3a1a', h: '#7a5a3a', G: '#2ab0a0', Y: '#d8f4ff', B: '#6a4a2a' },
  brutao: { H: '#1a1a1a', h: '#2a2a2a', G: '#c8302a', Y: '#1a1a1a', B: '#2a2a3a', S: '#e0a878' },
  teca: { H: '#8a2ad8', h: '#b05aff', G: '#f08ac0', Y: '#ffffff', B: '#4a2a5a' },
  ze: { H: '#6a4a2a', h: '#8a6a4a', G: '#4a8a3a', Y: '#e8d040', B: '#3a3a48' },
};

function buildSprites4() {
  SPR.robot = {};
  for (const k of Object.keys(ROBOT_PALS)) {
    const p = ROBOT_PALS[k];
    SPR.robot[k] = {
      right: [spriteFromRows(ROBOT, false, p), spriteFromRows(ROBOT_WHEEL, false, p)],
      left: [spriteFromRows(ROBOT, true, p), spriteFromRows(ROBOT_WHEEL, true, p)],
      sad: spriteFromRows(ROBOT_SAD, false, p),
    };
  }
  SPR.kid = {};
  for (const k of ['k1', 'k2', 'k3', 'k4']) SPR.kid[k] = spriteFromRows(P_DOWN.concat(LEGS_STAND), false, KID_PALS[k]);
  for (const k of ['brutao', 'teca', 'ze']) SPR.kid[k] = spriteFromRows(BULLY_DOWN.concat(LEGS_STAND), false, KID_PALS[k]);
  // Teca tem marias-chiquinhas
  const tc = SPR.kid.teca, g = tc.getContext('2d');
  const big = document.createElement('canvas'); big.width = 20; big.height = tc.height;
  const bg = big.getContext('2d'); bg.drawImage(tc, 3, 0);
  for (const x of [0, 17]) { bg.fillStyle = '#000'; bg.fillRect(x, 3, 3, 6); bg.fillStyle = KID_PALS.teca.H; bg.fillRect(x + 1 - (x ? 1 : 0) * 0, 4, 2, 4); }
  SPR.kid.teca = big;
  // Zé usa boné
  const ze = SPR.kid.ze.getContext('2d');
  ze.fillStyle = '#000'; ze.fillRect(2, 0, 11, 4); ze.fillRect(9, 3, 5, 2);
  ze.fillStyle = '#3a7ad8'; ze.fillRect(3, 1, 9, 2); ze.fillRect(10, 3, 3, 1);

  SPR.ze = SPR.kid.ze; SPR.teca = SPR.kid.teca; SPR.brutao = SPR.kid.brutao;
  SPR.drone = makeCanvas(24, 16, g => {
    g.fillStyle = '#000'; g.fillRect(0, 1, 9, 3); g.fillRect(15, 1, 9, 3); g.fillRect(10, 2, 4, 4);
    g.fillStyle = '#9fe4ff'; g.fillRect(1, 2, 7, 1); g.fillRect(16, 2, 7, 1);
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(12, 10, 9, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d8dce4'; g.beginPath(); g.ellipse(12, 10, 8, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0a2a3a'; g.fillRect(7, 8, 10, 4);
    g.fillStyle = '#ff3b3b'; g.fillRect(9, 9, 2, 2); g.fillRect(13, 9, 2, 2);
  });
  SPR.aspirabo = makeCanvas(26, 16, g => {
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(13, 9, 13, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5a5a6a'; g.beginPath(); g.ellipse(13, 9, 12, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a8a9a'; g.beginPath(); g.ellipse(13, 7, 10, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5ff8ff'; g.fillRect(8, 6, 3, 2); g.fillRect(15, 6, 3, 2);
    g.fillStyle = '#ffa21a'; g.fillRect(12, 3, 2, 1);
    g.fillStyle = '#2a2a32'; g.fillRect(4, 13, 18, 2);
  });
  SPR.bed = makeCanvas(20, 30, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 20, 30);
    g.fillStyle = '#5a6a8a'; g.fillRect(1, 1, 18, 28);
    g.fillStyle = '#f4f8ff'; g.fillRect(3, 2, 14, 6);
    g.fillStyle = '#3a7ad8'; g.fillRect(1, 10, 18, 19);
    g.fillStyle = '#5ff8ff'; g.fillRect(1, 10, 18, 1);
  });
  SPR.charger = makeCanvas(14, 24, g => {
    g.fillStyle = '#000'; g.fillRect(1, 0, 12, 24);
    g.fillStyle = '#3a3a48'; g.fillRect(2, 1, 10, 22);
    g.fillStyle = '#7fff9f'; g.fillRect(4, 4, 6, 12);
    g.fillStyle = '#000'; g.fillRect(6, 6, 2, 3); g.fillRect(5, 9, 4, 1); g.fillRect(6, 10, 2, 3);
  });
  SPR.telescope = makeCanvas(18, 26, g => {
    g.fillStyle = '#000'; g.fillRect(8, 10, 3, 16); g.fillRect(3, 23, 13, 3);
    g.fillStyle = '#8a8a9a'; g.fillRect(9, 11, 1, 14);
    g.save(); g.translate(9, 9); g.rotate(-0.5);
    g.fillStyle = '#000'; g.fillRect(-9, -4, 18, 8); g.fillStyle = '#c8d0dc'; g.fillRect(-8, -3, 16, 6); g.fillStyle = '#5ff8ff'; g.fillRect(6, -2, 2, 4);
    g.restore();
  });
  SPR.bench = makeCanvas(30, 12, g => {
    g.fillStyle = '#000'; g.fillRect(0, 2, 30, 6); g.fillRect(2, 8, 3, 4); g.fillRect(25, 8, 3, 4);
    g.fillStyle = '#5ff8ff'; g.fillRect(1, 3, 28, 1); g.fillStyle = '#3a4a6a'; g.fillRect(1, 4, 28, 3);
  });
  buildFutureTiles();
}

function buildFutureTiles() {
  const R = rng(4242);
  const T = {};
  T.metal = [0, 1, 2].map(v => makeTile(g => {
    g.fillStyle = '#2a3040'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#323a4e'; g.fillRect(1, 1, 14, 14);
    g.fillStyle = '#20263a'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
    g.fillStyle = '#5a6480'; g.fillRect(2, 2, 1, 1); g.fillRect(13, 2, 1, 1); g.fillRect(2, 13, 1, 1); g.fillRect(13, 13, 1, 1);
    if (v === 1) { g.fillStyle = '#3a4258'; g.fillRect(5, 6, 6, 1); }
  }));
  T.neon = [0, 1, 2].map(() => makeTile(g => {
    g.drawImage(T.metal[0], 0, 0);
    g.fillStyle = 'rgba(95,248,255,0.25)'; g.fillRect(0, 5, 16, 6);
    g.fillStyle = '#5ff8ff'; g.fillRect(0, 7, 16, 2);
  }));
  T.neonV = makeTile(g => { g.drawImage(T.metal[0], 0, 0); g.fillStyle = 'rgba(255,90,200,0.25)'; g.fillRect(5, 0, 6, 16); g.fillStyle = '#ff5ac8'; g.fillRect(7, 0, 2, 16); });
  T.road = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#1a1c24'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#22242e'; for (let i = 0; i < 6; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
  }));
  T.roadLine = makeTile(g => { g.drawImage(T.road[0], 0, 0); g.fillStyle = '#ffd23a'; g.fillRect(2, 7, 8, 2); });
  T.cross = makeTile(g => { g.drawImage(T.road[0], 0, 0); g.fillStyle = '#e8ecf4'; for (let y = 1; y < 16; y += 4) g.fillRect(1, y, 14, 2); });
  T.void = makeTile(g => { g.fillStyle = '#0a0c14'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#10141e'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 3, 3); });
  T.facade = [0, 1, 2].map(v => makeTile(g => {
    g.fillStyle = ['#1c2236', '#241c36', '#1c2a30'][v]; g.fillRect(0, 0, 16, 16);
    const lit = ['#ffd36a', '#5ff8ff', '#ff5ac8'][v];
    for (let y = 2; y < 16; y += 5) for (let x = 2; x < 16; x += 5) { g.fillStyle = R() < 0.6 ? lit : '#0a0c14'; g.fillRect(x, y, 3, 3); }
  }));
  T.doorC = makeTile(g => {
    g.fillStyle = '#241c36'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(2, 3, 12, 13); g.fillStyle = '#8a2a4a'; g.fillRect(3, 4, 10, 12);
    g.fillStyle = '#ffd23a'; for (let x = 1; x < 16; x += 3) g.fillRect(x, 0, 1, 1);
  });
  T.doorE = makeTile(g => {
    g.fillStyle = '#1c2a30'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(3, 2, 10, 14); g.fillStyle = '#2a6a7a'; g.fillRect(4, 3, 8, 13);
    g.fillStyle = '#5ff8ff'; g.fillRect(7, 3, 2, 13);
  });
  T.doorS = makeTile(g => {
    g.fillStyle = '#3a2a1c'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#000'; g.fillRect(1, 2, 14, 14); g.fillStyle = '#c87a3a'; g.fillRect(2, 3, 5, 13); g.fillRect(9, 3, 5, 13);
    g.fillStyle = '#ffd23a'; g.fillRect(6, 9, 1, 2); g.fillRect(9, 9, 1, 2);
  });
  T.schoolWall = makeTile(g => {
    g.fillStyle = '#e8b86a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#c8984a'; for (let y = 3; y < 16; y += 4) g.fillRect(0, y, 16, 1);
    g.fillStyle = '#5ff8ff'; g.fillRect(3, 5, 4, 4); g.fillRect(10, 5, 4, 4);
    g.fillStyle = '#000'; g.fillRect(5, 5, 1, 4); g.fillRect(12, 5, 1, 4);
  });
  T.holo = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#3a4258'; g.fillRect(1, 1, 14, 14);
    g.fillStyle = '#5ff8ff'; g.fillRect(3, 3, 10, 10); g.fillStyle = '#0a2a3a'; g.fillRect(4, 4, 8, 8);
  });
  T.tree = makeTile(g => {
    g.fillStyle = '#000'; g.fillRect(6, 8, 4, 8); g.fillStyle = '#8a8a9a'; g.fillRect(7, 8, 2, 8);
    g.fillStyle = '#000'; g.beginPath(); g.arc(8, 6, 6.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ff5ac8'; g.beginPath(); g.arc(8, 6, 5.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffb0e8'; g.fillRect(5, 3, 3, 2); g.fillStyle = '#c8308a'; g.fillRect(9, 8, 3, 2);
  });
  T.carpet = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#6a1a2a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#7a2434'; for (let i = 0; i < 5; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 2);
  }));
  T.seat = makeTile(g => {
    g.drawImage(T.carpet[0], 0, 0);
    g.fillStyle = '#000'; g.fillRect(1, 2, 14, 13);
    g.fillStyle = '#c8302a'; g.fillRect(2, 3, 12, 6); g.fillStyle = '#9a2420'; g.fillRect(2, 9, 12, 5);
  });
  T.screen = makeTile(g => { g.fillStyle = '#e8ecf4'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c8ccd8'; g.fillRect(0, 14, 16, 2); });
  T.wood = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 4) { g.fillStyle = '#7a5a3a'; g.fillRect(0, y + 3, 16, 1); g.fillStyle = '#9a7a5a'; g.fillRect((R() * 12) | 0, y + 1, 4, 1); }
  }));
  T.desk = makeTile(g => {
    g.drawImage(T.wood[0], 0, 0);
    g.fillStyle = '#000'; g.fillRect(0, 3, 16, 9); g.fillStyle = '#c8d0dc'; g.fillRect(1, 4, 14, 3); g.fillStyle = '#8a92a0'; g.fillRect(1, 7, 14, 4);
    g.fillStyle = '#5ff8ff'; g.fillRect(5, 4, 6, 2);
  });
  T.board = makeTile(g => {
    g.fillStyle = '#5a3a1a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#1a4a3a'; g.fillRect(0, 2, 16, 12);
    g.fillStyle = '#e8ecf4'; g.fillRect((R() * 10) | 0, 5, 4, 1); g.fillRect((R() * 10) | 0, 9, 5, 1);
  });
  T.wallIn = makeTile(g => {
    g.fillStyle = '#3a4258'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a5470'; g.fillRect(0, 0, 16, 2); g.fillStyle = '#2a3040'; g.fillRect(0, 14, 16, 2);
  });
  T.doorIn = makeTile(g => {
    g.drawImage(T.wallIn, 0, 0);
    g.fillStyle = '#000'; g.fillRect(3, 1, 10, 15); g.fillStyle = '#5ff8ff'; g.fillRect(4, 2, 8, 14); g.fillStyle = '#2a6a7a'; g.fillRect(5, 3, 6, 12);
  });
  SPR.futT = T;
}
