// Pixel art da Fase 8: Vila Vulcânica, golens e fantasmas de lava, Mestre Draco,
// dragões evoluídos (lava, neve, trevas) e tiles do vulcão.
'use strict';

Object.assign(DRAGON_PALS, {
  lava: { b: '#3a2420', d: '#1e1210', e: '#ff8a1a', v: '#ff3a0a', h: '#ffe680', y: '#ffe680', z: '#ff2a00' },
  neve: { b: '#e8f8ff', d: '#9fd8f8', e: '#ffffff', v: '#5fc8ff', h: '#d8f4ff', y: '#5ff8ff', z: '#0a5aff' },
  trevas: { b: '#1a1024', d: '#0a0610', e: '#5a2a8a', v: '#8a2aff', h: '#b05aff', y: '#ff2a6a', z: '#ffffff' },
  anciao: { b: '#8a2a1a', d: '#5a160e', e: '#e8b84a', v: '#c8902a', h: '#fff0c0', y: '#ffe680', z: '#000000' },
});

const GOLEM = [
  '.....kkkkkkkk.....',
  '....kRRRRRRRRk....',
  '...kRrRRRRRrRRk...',
  '...kRRkkRRkkRRk...',
  '...kRRkYkkYkRRk...',
  '...kRRRRRRRRRRk...',
  '....kRRoooooRk....',
  '..kkkkRRRRRRkkkk..',
  '.kRRRkRRRoRRkRRRk.',
  'kRRrRkRRooRRkRrRRk',
  'kRRRRkRoRRRRkRRRRk',
  'kRRoRkRRRRoRkRoRRk',
  'kRRRRkRRoRRRkRRRRk',
  '.kRRkkRRRRRRkkRRk.',
  '..kk.kRRRkRRRk.kk.',
  '.....kRoRkRoRk....',
  '....kRRRk.kRRRk...',
  '....kRRRk.kRRRk...',
  '...kkkkkk.kkkkkk..',
];
const GOLEM_PAL = { R: '#3a302e', r: '#5a4a46', o: '#ff7a1a', Y: '#ffe680' };

const FANT_LAVA = [
  '......kkkkkk......',
  '....kkLLLLLLkk....',
  '...kLLLLLLLLLLk...',
  '..kLLLLLLLLLLLLk..',
  '..kLLkkLLLLkkLLk..',
  '.kLLkWzkLLkWzkLLk.',
  '.kLLLkkLLLLkkLLLk.',
  '.kLLLLLLkkLLLLLLk.',
  '.kLLLLLkWWkLLLLLk.',
  '.kLLLLLLkkLLLLLLk.',
  '.kLLLLLLLLLLLLLLk.',
  '.kLLoLLLLLLLLoLLk.',
  '.kLLLLLLLLLLLLLLk.',
  '.kLkLLLkLLkLLLkLk.',
  '..k.kLk.kk.kLk.k..',
  '.....k......k.....',
];
const FANT_LAVA_PAL = { L: '#ff6a1a', o: '#ffd36a', W: '#ffffff', z: '#3a0a00' };

const DRACO = [
  '...k........k...',
  '..kHk......kHk..',
  '..kHHkkkkkkHHk..',
  '...kMMMMMMMMk...',
  '..kMMMMMMMMMMk..',
  '..kSSSSSSSSSSk..',
  '..kSkkSSSSEkSk..',
  '..kSkkSSSSEESk..',
  '..kSSSSkkSSSSk..',
  '...kBBBBBBBBk...',
  '..kBBBBBBBBBBk..',
  '...kBBBBBBBBk...',
  '.kkkkBBBBBBkkkk.',
  'kCCCkCCCCCCkCCCk',
  'kCcCkCCGGCCkCcCk',
  'kCCCkCCGGCCkCCCk',
  'kSSkkCCCCCCkkSSk',
  '.kk.kCcCCcCk.kk.',
  '....kCCCCCCk....',
  '....kPPkkPPk....',
  '....kPPk.kPPk...',
  '...kkkkk.kkkkk..',
];
const DRACO_PAL = { H: '#e8d8b8', M: '#8a2a1a', S: '#e8b088', E: '#4a2a1a', B: '#f0f0f0', C: '#c8502a', c: '#8a2a1a', G: '#ffd23a', P: '#4a3a2a' };

function drawDragonAura(k, x, y, sc, t) {
  if (k === 'lava') {
    ctx.fillStyle = 'rgba(255,90,20,0.18)'; ctx.beginPath(); ctx.ellipse(x + 13 * sc, y + 12 * sc, 15 * sc, 12 * sc, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) {
      const q = (t * 0.8 + i / 8) % 1;
      ctx.fillStyle = i % 2 ? '#ffb21a' : '#ff3a0a';
      ctx.fillRect(x + (4 + (i * 7) % 20) * sc, y + (20 - q * 22) * sc, sc * 0.8, sc * 0.8);
    }
  } else if (k === 'neve') {
    ctx.fillStyle = 'rgba(180,230,255,0.18)'; ctx.beginPath(); ctx.ellipse(x + 13 * sc, y + 12 * sc, 15 * sc, 12 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 10; i++) {
      const q = (t * 0.5 + i / 10) % 1;
      ctx.fillRect(x + ((i * 11) % 28) * sc, y + (-2 + q * 26) * sc, sc * 0.6, sc * 0.6);
    }
  } else if (k === 'trevas') {
    for (let i = 0; i < 6; i++) {
      const a = t * 1.5 + i;
      ctx.fillStyle = 'rgba(60,10,90,0.35)';
      ctx.beginPath(); ctx.arc(x + 13 * sc + Math.cos(a) * 12 * sc, y + 14 * sc + Math.sin(a * 1.3) * 7 * sc, 4 * sc, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// Jogador montado no dragão (cutscene do voo e mapa)
function drawRider(x, y, sc, t, flip, flap = 6) {
  const set = SPR.dragon[G.dragon || 'laranja'], img = set.right[Math.floor(t * flap) % 2];
  ctx.save();
  if (flip) { ctx.translate(x + 26 * sc, 0); ctx.scale(-1, 1); x = 0; }
  drawDragonAura(G.dragon, x, y, sc, t);
  ctx.drawImage(img, x, y, 26 * sc, 22 * sc);
  // jogador sentado nas costas (só a parte de cima aparece)
  const p = SPR.player.right[0];
  ctx.drawImage(p, 0, 0, p.width, 15, x + 2 * sc, y - 4 * sc, p.width * sc, 15 * sc);
  // sela
  ctx.fillStyle = '#000'; ctx.fillRect(x + 4 * sc, y + 9 * sc, 10 * sc, 3 * sc);
  ctx.fillStyle = '#8a4a2a'; ctx.fillRect(x + 4.5 * sc, y + 9.5 * sc, 9 * sc, 2 * sc);
  ctx.fillStyle = '#ffd23a'; ctx.fillRect(x + 8 * sc, y + 10 * sc, 2 * sc, 1 * sc);
  // pescoço e cabeça do dragão ficam na frente do jogador
  ctx.drawImage(img, 14, 0, 12, 12, x + 14 * sc, y, 12 * sc, 12 * sc);
  ctx.restore();
}

function buildSprites7() {
  SPR.golemLava = spriteFromRows(GOLEM, false, GOLEM_PAL);
  SPR.fantLava = spriteFromRows(FANT_LAVA, false, FANT_LAVA_PAL);
  SPR.draco = spriteFromRows(DRACO, false, DRACO_PAL);
  SPR.dragaoAnciao = SPR.dragon.anciao.left[0];
  SPR.lavaHut = makeCanvas(36, 30, g => {
    g.fillStyle = '#000'; g.beginPath(); g.moveTo(18, 0); g.lineTo(36, 14); g.lineTo(0, 14); g.fill(); g.fillRect(2, 12, 32, 18);
    g.fillStyle = '#2a2220'; g.beginPath(); g.moveTo(18, 2); g.lineTo(33, 13); g.lineTo(3, 13); g.fill();
    g.fillStyle = '#4a3a36'; g.fillRect(3, 13, 30, 16);
    g.fillStyle = '#3a2e2a'; for (let y = 16; y < 29; y += 4) g.fillRect(3, y, 30, 1);
    g.fillStyle = '#ff7a1a'; g.fillRect(14, 19, 8, 10); g.fillStyle = '#ffd36a'; g.fillRect(16, 21, 4, 8);
    g.fillStyle = '#ffb21a'; g.fillRect(6, 17, 4, 4); g.fillRect(26, 17, 4, 4);
    g.fillStyle = '#ff5a1a'; g.fillRect(17, 5, 2, 2);
  });
  SPR.alvo = makeCanvas(16, 22, g => {
    g.fillStyle = '#000'; g.fillRect(7, 12, 3, 10); g.beginPath(); g.arc(8, 8, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a5a2a'; g.fillRect(8, 13, 1, 9);
    for (const [r, c] of [[7, '#f0f0f0'], [5, '#d8302a'], [3, '#f0f0f0'], [1.5, '#d8302a']]) { g.fillStyle = c; g.beginPath(); g.arc(8, 8, r, 0, Math.PI * 2); g.fill(); }
  });
  SPR.coracao = makeCanvas(14, 14, g => {
    g.fillStyle = '#000'; g.beginPath(); g.moveTo(7, 13); g.lineTo(0, 5); g.lineTo(3, 1); g.lineTo(7, 3); g.lineTo(11, 1); g.lineTo(14, 5); g.fill();
    g.fillStyle = '#ff3a0a'; g.beginPath(); g.moveTo(7, 12); g.lineTo(1, 5); g.lineTo(3.5, 2); g.lineTo(7, 4); g.lineTo(10.5, 2); g.lineTo(13, 5); g.fill();
    g.fillStyle = '#ffb21a'; g.fillRect(4, 4, 3, 3); g.fillStyle = '#ffe680'; g.fillRect(4, 4, 1, 1);
  });
  SPR.altar = makeCanvas(32, 20, g => {
    g.fillStyle = '#000'; g.fillRect(2, 4, 28, 16);
    g.fillStyle = '#1a1420'; g.fillRect(3, 5, 26, 14);
    g.fillStyle = '#3a2e4a'; g.fillRect(3, 5, 26, 3);
    g.fillStyle = '#ff7a1a'; g.fillRect(6, 11, 2, 6); g.fillRect(24, 11, 2, 6);
  });
  SPR.forja = makeCanvas(32, 26, g => {
    g.fillStyle = '#000'; g.fillRect(0, 6, 32, 20);
    g.fillStyle = '#5a4a46'; g.fillRect(1, 7, 30, 18);
    g.fillStyle = '#1a1210'; g.fillRect(8, 12, 16, 12);
    g.fillStyle = '#ff5a1a'; g.fillRect(9, 16, 14, 8); g.fillStyle = '#ffd36a'; g.fillRect(12, 19, 8, 5);
    g.fillStyle = '#3a302e'; g.fillRect(12, 0, 8, 7);
  });
  buildVolcanoTiles();
}

function buildVolcanoTiles() {
  const R = rng(8080);
  const T = {};
  T.basalt = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#4a3c3a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#55463f'; for (let i = 0; i < 5; i++) g.fillRect((R() * 13) | 0, (R() * 13) | 0, 3, 2);
    g.fillStyle = '#3a2e2c'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
    if (R() < 0.25) { g.fillStyle = '#ff7a1a'; g.fillRect((R() * 13) | 0, (R() * 13) | 0, 2, 1); }
  }));
  T.ash = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#6a605c'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#7a706a'; for (let i = 0; i < 6; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
    g.fillStyle = '#5a504c'; for (let i = 0; i < 4; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.sand = [0, 1, 2].map(() => makeTile(g => {
    g.fillStyle = '#a8704a'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#b8805a'; for (let i = 0; i < 6; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 2, 1);
    g.fillStyle = '#8a5a3a'; for (let i = 0; i < 3; i++) g.fillRect((R() * 15) | 0, (R() * 15) | 0, 1, 1);
  }));
  T.cliff = makeTile(g => {
    g.fillStyle = '#2a2022'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#3a2e2e'; for (let y = 3; y < 16; y += 5) g.fillRect(0, y, 16, 2);
    g.fillStyle = '#ff5a1a'; if (R() < 0.35) g.fillRect((R() * 12 + 2) | 0, (R() * 12 + 2) | 0, 1, 3);
    g.fillStyle = '#120c0e'; g.fillRect(0, 0, 16, 1);
  });
  T.dark = makeTile(g => { g.fillStyle = '#140e10'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1e1618'; g.fillRect((R() * 12) | 0, (R() * 12) | 0, 3, 3); });
  T.stone = makeTile(g => {
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(8, 9, 8, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5a4a46'; g.beginPath(); g.ellipse(8, 8, 7, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7a6a64'; g.fillRect(4, 5, 5, 2);
  });
  T.stoneLow = makeTile(g => {
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(8, 10, 7, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a3a1a'; g.beginPath(); g.ellipse(8, 10, 6, 3, 0, 0, Math.PI * 2); g.fill();
  });
  T.vent = makeTile(g => {
    g.drawImage(T.ash[0], 0, 0);
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(8, 9, 6, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ff5a1a'; g.beginPath(); g.ellipse(8, 9, 4, 2.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd36a'; g.fillRect(7, 8, 2, 1);
  });
  T.obsidian = makeTile(g => {
    g.fillStyle = '#0e0a14'; g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#2a1a3a'; g.beginPath(); g.moveTo(0, 16); g.lineTo(6, 4); g.lineTo(10, 10); g.lineTo(16, 0); g.lineTo(16, 16); g.fill();
    g.fillStyle = '#6a4a9a'; g.fillRect(6, 5, 1, 4);
  });
  T.gate = makeTile(g => {
    g.drawImage(T.ash[1], 0, 0);
    g.fillStyle = '#000'; g.fillRect(0, 2, 16, 12);
    g.fillStyle = '#5a4a46'; g.fillRect(1, 3, 14, 10);
    g.fillStyle = '#ff7a1a'; g.fillRect(3, 7, 10, 2);
  });
  T.fence = makeTile(g => {
    g.drawImage(T.sand[0], 0, 0);
    g.fillStyle = '#000'; g.fillRect(0, 5, 16, 4); g.fillRect(2, 2, 3, 13); g.fillRect(11, 2, 3, 13);
    g.fillStyle = '#8a5a2a'; g.fillRect(0, 6, 16, 2); g.fillRect(3, 3, 1, 11); g.fillRect(12, 3, 1, 11);
  });
  T.rune = makeTile(g => {
    g.fillStyle = '#1a1420'; g.fillRect(0, 0, 16, 16);
    g.strokeStyle = '#ff7a1a'; g.lineWidth = 1; g.strokeRect(2.5, 2.5, 11, 11);
    g.beginPath(); g.moveTo(8, 3); g.lineTo(8, 13); g.moveTo(3, 8); g.lineTo(13, 8); g.stroke();
  });
  SPR.volT = T;
}
