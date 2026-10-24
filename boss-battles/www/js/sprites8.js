// Pixel art das Fases 10 e 11: Mestre Leão, a Sombra do jogador, a arena e o salão dourado.
'use strict';

const LEAO = [
  '....kkkkkkkk....',
  '..kkMMMMMMMMkk..',
  '.kMMmMMMMMMmMMk.',
  'kMMmkkkkkkkkmMMk',
  'kMMkYYYYYYYYkMMk',
  'kMkYkkYYYYkkYkMk',
  'kMkYkWYYYYWkYkMk',
  'kMMkYYYkkYYYkMMk',
  '.kMMkYYPPYYkMMk.',
  '..kMMkYYYYkMMk..',
  '...kkkkkkkkkk...',
  '..kRRRRWWRRRRk..',
  '.kYkRRRWWRRRkYk.',
  'kYYkRRRWWRRRkYYk',
  'kYYkRRRRRRRRkYYk',
  'kYYkKKKKKKKKkYYk',
  '.kkkRRRRRRRRkkk.',
  '...kRRRkkRRRk...',
  '...kRRRkkRRRk...',
  '...kRRk..kRRk...',
  '...kWWk..kWWk...',
  '...kkkk..kkkk...',
];
const LEAO_PAL = { M: '#c8641e', m: '#8a3a12', Y: '#ffc84a', W: '#ffffff', P: '#5a2a1a', R: '#c82a2a', K: '#1a1a1a' };

function buildSprites8() {
  SPR.leao = spriteFromRows(LEAO, false, LEAO_PAL);
  // a Sombra: o jogador todo escuro, com olhos vermelhos
  SPR.sombra = makeCanvas(SPR.player.down[0].width, SPR.player.down[0].height, g => {
    g.drawImage(SPR.player.down[0], 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(30,10,50,0.9)'; g.fillRect(0, 0, 40, 40);
    g.globalCompositeOperation = 'source-over'; g.fillStyle = '#ff2a4a'; g.fillRect(5, 6, 1, 1); g.fillRect(8, 6, 1, 1);
  });
  SPR.faca = makeCanvas(16, 16, g => {
    g.fillStyle = '#000'; g.beginPath(); g.moveTo(1, 15); g.lineTo(4, 12); g.lineTo(14, 1); g.lineTo(15, 2); g.lineTo(6, 13); g.lineTo(3, 16); g.fill();
    g.fillStyle = '#e8ecf4'; g.beginPath(); g.moveTo(5, 11); g.lineTo(14, 2); g.lineTo(7, 12); g.fill();
    g.fillStyle = '#c8641e'; g.fillRect(2, 12, 3, 3); g.fillStyle = '#ffc84a'; g.fillRect(4, 10, 3, 2);
  });
  SPR.dummy = makeCanvas(16, 26, g => {
    g.fillStyle = '#000'; g.fillRect(6, 10, 4, 16); g.beginPath(); g.arc(8, 6, 6, 0, Math.PI * 2); g.fill(); g.fillRect(1, 11, 14, 4);
    g.fillStyle = '#c8a46a'; g.fillRect(7, 11, 2, 15); g.beginPath(); g.arc(8, 6, 5, 0, Math.PI * 2); g.fill(); g.fillRect(2, 12, 12, 2);
    g.fillStyle = '#8a3a12'; g.fillRect(5, 5, 2, 2); g.fillRect(9, 5, 2, 2);
  });
  SPR.torch = makeCanvas(8, 20, g => { g.fillStyle = '#000'; g.fillRect(2, 6, 4, 14); g.fillStyle = '#6a4a2a'; g.fillRect(3, 7, 2, 13); });
  buildArenaTiles();
}

function buildArenaTiles() {
  const R = rng(9090);
  const T = {};
  T.sand = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#d8b878'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#c8a868'; for (let i = 0; i < 6; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
    g.fillStyle = '#e8c888'; for (let i = 0; i < 3; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.stone = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#8a8478'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#6a6458'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 7); g.fillRect(12, 8, 1, 8);
    g.fillStyle = '#9a9488'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 3, 2);
  }));
  T.seats = makeTile(g => {
    g.fillStyle = '#5a5248'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#8a7a64'; g.fillRect(0, 2, 16, 5); g.fillRect(0, 10, 16, 5);
    g.fillStyle = '#3a342c'; g.fillRect(0, 7, 16, 3); g.fillRect(0, 15, 16, 1);
  });
  T.wall = makeTile(g => {
    g.fillStyle = '#6a6458'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#5a5448'; for (let y = 0; y < 16; y += 4) g.fillRect(0, y, 16, 1);
    g.fillStyle = '#4a4438'; for (let y = 0; y < 16; y += 8) { g.fillRect(4, y, 1, 4); g.fillRect(12, y + 4, 1, 4); }
  });
  T.banner = makeTile(g => {
    g.drawImage(T.wall, 0, 0);
    g.fillStyle = '#000'; g.fillRect(3, 0, 10, 15);
    g.fillStyle = '#c82a2a'; g.fillRect(4, 0, 8, 13); g.fillStyle = '#ffc84a'; g.fillRect(6, 4, 4, 4);
  });
  T.gate = makeTile(g => {
    g.fillStyle = '#2a241c'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#6a5a3a'; for (let x = 1; x < 16; x += 4) g.fillRect(x, 0, 2, 16);
    g.fillStyle = '#4a3a24'; g.fillRect(0, 5, 16, 2);
  });
  // salão dourado (Fase 11)
  T.gold = [0, 1].map(v => makeTile(g => {
    g.fillStyle = v ? '#e8c860' : '#d8b44a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(1, 1, 14, 1);
    g.fillStyle = 'rgba(120,80,20,0.35)'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
  }));
  T.pillar = makeTile(g => {
    g.fillStyle = '#c8a040'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#e8c860'; g.fillRect(3, 0, 10, 16);
    g.fillStyle = '#fff0b0'; g.fillRect(5, 0, 2, 16);
    g.fillStyle = '#8a6a20'; g.fillRect(12, 0, 1, 16);
  });
  T.window = makeTile(g => {
    g.fillStyle = '#b89030'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#fff8d8'; g.fillRect(3, 2, 10, 14);
    g.fillStyle = '#b89030'; g.fillRect(7, 2, 2, 14); g.fillRect(3, 8, 10, 2);
  });
  T.goldWall = makeTile(g => { g.fillStyle = '#a88028'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c8a040'; g.fillRect(0, 12, 16, 4); });
  SPR.arenaT = T;
}
