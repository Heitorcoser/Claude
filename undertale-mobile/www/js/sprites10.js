// Sprites do Capítulo 2: moradores da Vila Aurora (Antártica), Seu Jorge, peixes,
// a forma demônio da Carmim e a alma do Instrutor.
'use strict';

// Morador agasalhado: capuz com pelinho, cachecol e botas
const MORADOR = [
  '....kkkkkk....',
  '...kFFFFFFk...',
  '..kFPPPPPPFk..',
  '.kFPPPPPPPPFk.',
  '.kFPSSSSSSPFk.',
  '.kFPSkSSkSPFk.',
  '.kFPSSSSSSPFk.',
  '..kFSSppSSFk..',
  '...kCCCCCCk...',
  '..kCCCCCCCCk..',
  '.kPPPPPPPPPPk.',
  'kPkPPPPPPPPkPk',
  'kPkPPPPPPPPkPk',
  'kMkPPPYPPPPkMk',
  'kkkPPPPPPPPkkk',
  '..kPPPPPPPPk..',
  '..kLLLkkLLLk..',
  '..kLLk..kLLk..',
  '..kBBk..kBBk..',
  '..kkkk..kkkk..',
];
const MORADOR_PALS = {
  m1: { F: '#e8e4dc', P: '#3a6aa8', S: '#e8b890', p: '#e08a8a', C: '#c8302a', M: '#5a3a2a', Y: '#ffd23a', L: '#2a2a3a', B: '#3a2416' },
  m2: { F: '#e8e4dc', P: '#a83a4a', S: '#c88a5a', p: '#d07a6a', C: '#3aa05a', M: '#2a2a2a', Y: '#e8e4dc', L: '#3a3a4a', B: '#2a1a10' },
  m3: { F: '#d8d0c0', P: '#6a6a3a', S: '#f0c8a0', p: '#f08a8a', C: '#ffd23a', M: '#4a2a1a', Y: '#6a6a3a', L: '#2a2a2a', B: '#3a2416' },
  m4: { F: '#e8e4dc', P: '#5a3a8a', S: '#8a5a3a', p: '#b06a5a', C: '#ff9a3a', M: '#2a1a10', Y: '#ffe680', L: '#2a2a3a', B: '#1a1008' },
};
// Criança da vila (menor)
const CRIANCA = [
  '...kkkkkk...',
  '..kFFFFFFk..',
  '.kFPPPPPPFk.',
  '.kFSSSSSSFk.',
  '.kFSkSSkSFk.',
  '.kFSSppSSFk.',
  '..kCCCCCCk..',
  '.kPPPPPPPPk.',
  'kPkPPPPPPkPk',
  'kSkPPPPPPkSk',
  'kkkPPPPPPkkk',
  '..kLLkkLLk..',
  '..kBBk.kBBk.',
  '..kkkk.kkkk.',
];
// Seu Jorge: pescador velho, gorro vermelho, barba branca, casaco marrom
const JORGE = [
  '....kkkkkk....',
  '...kRRRRRRk...',
  '..kRRWRRWRRk..',
  '..kRRRRRRRRk..',
  '.kWWWWWWWWWWk.',
  '.kGSSSSSSSSGk.',
  '.kGSkSSSSkSGk.',
  '.kGSSSNNSSSGk.',
  '.kGWWWWWWWWGk.',
  '..kWWWkkWWWk..',
  '...kWWWWWWk...',
  '..kCCCCCCCCk..',
  '.kCCCCCCCCCCk.',
  'kCkCCYYCCCCkCk',
  'kCkCCCCCCCCkCk',
  'kSkCCCCCCCCkSk',
  'kkkCCCCCCCCkkk',
  '..kLLLLLLLLk..',
  '..kLLLkkLLLk..',
  '..kBBk..kBBk..',
  '..kkkk..kkkk..',
];
const JORGE_PAL = { R: '#c8302a', W: '#f0f0f0', G: '#c8c8c8', S: '#e0a878', N: '#c87a5a', C: '#7a4a24', Y: '#ffd23a', L: '#3a3a4a', B: '#2a1a10' };
// Peixes
const PEIXE = [
  '....kkkk....',
  '.k.kAAAAk...',
  'kAkAAAAAAk..',
  'kAAAAAAWkAk.',
  'kAkBBBBBBBk.',
  '.k.kBBBBk...',
  '....kkkk....',
];
const PEIXE_PALS = {
  gelo: { A: '#8ad8ff', B: '#d8f4ff', W: '#000' },
  bacalhau: { A: '#8a7a5a', B: '#d8ccb0', W: '#000' },
  dourado: { A: '#ffc23a', B: '#fff0a0', W: '#000' },
};
// Botinha velha (pescaria azarada)
const BOTA = [
  '..kkkk..',
  '..kBBk..',
  '..kBBk..',
  '..kBBkk.',
  '.kBBBBBk',
  'kBBBBBBk',
  'kkkkkkkk',
];

function tinted(img, color, eyes) {
  return makeCanvas(img.width, img.height, g => {
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = color; g.fillRect(0, 0, img.width, img.height);
    g.globalCompositeOperation = 'source-over';
    if (eyes) { g.fillStyle = eyes.c; for (const [x, y] of eyes.at) g.fillRect(x, y, 1, 1); }
  });
}

function buildSprites10() {
  SPR.morador = {};
  for (const k in MORADOR_PALS) SPR.morador[k] = spriteFromRows(MORADOR, false, MORADOR_PALS[k]);
  SPR.crianca = spriteFromRows(CRIANCA, false, MORADOR_PALS.m3);
  SPR.jorge = spriteFromRows(JORGE, false, JORGE_PAL);
  SPR.peixe = {};
  for (const k in PEIXE_PALS) SPR.peixe[k] = spriteFromRows(PEIXE, false, PEIXE_PALS[k]);
  SPR.bota = spriteFromRows(BOTA, false, { B: '#5a3a2a' });
  // Carmim possuída: escura, só os olhos vermelhos acesos
  SPR.carmimDemon = tinted(SPR.carmim, 'rgba(24,6,30,0.92)', { c: '#ff1a2a', at: [[5, 6], [8, 6]] });
  // A alma do Instrutor (Carmino): um brilho azul-claro com a forma dele
  SPR.instrSoul = tinted(SPR.instr.right[0], 'rgba(150,240,255,0.85)');
  SPR.instrR = SPR.instr.right[0];
  // Os dois vilões lado a lado (batalha final)
  const e = SPR.encapuzado, c = SPR.carmimDemon, hh = Math.max(e.height, c.height);
  SPR.c2duo = makeCanvas(e.width + 4 + c.width, hh, g => { g.drawImage(e, 0, hh - e.height); g.drawImage(c, e.width + 4, hh - c.height); });
  SPR.encSombra = tinted(SPR.encapuzado, 'rgba(10,8,20,0.85)', null);
}
