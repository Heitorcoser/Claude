// BOSS BATTLES — os bosses: sprites, ataques e a classe de batalha com
// modificadores aleatórios (Enfurecido, Veloz, Gigante...) e invocações.
'use strict';

const NOOB = [
  '..kkkkkkkkkkkk..',
  '..kHHHHHHHHHHk..',
  '..kHHHHHHHHHHk..',
  '..kHSSSSSSSSHk..',
  '..kSSSSSSSSSSk..',
  '..kSWkSSSSWkSk..',
  '..kSSSSSSSSSSk..',
  '..kSSSMMMMSSSk..',
  '..kSSSSMMSSSSk..',
  '..kkkkkkkkkkkk..',
  'kkkkCCCCCCCCkkkk',
  'kSSkCCCCCCCCkSSk',
  'kSSkCCCCCCCCkSSk',
  'kSSkCCCCCCCCkSSk',
  'kSSkCCCCCCCCkSSk',
  'kkkkCCCCCCCCkkkk',
  '...kBBBBBBBBk...',
  '...kBBBkkBBBk...',
  '...kBBBkkBBBk...',
  '...kBBBkkBBBk...',
  '...kGGGkkGGGk...',
  '...kkkkkkkkkk...',
];
const NOOB_PAL = { H: '#4a2a12', S: '#e0a878', W: '#ffffff', M: '#7a3a2a', C: '#2ac8d8', B: '#3a3aa8', G: '#6a6a6a' };

const FUSHI = [
  '.k.k..k..k.k.k..',
  'kHkHkkHkkHkHkHk.',
  'kHHHHHHHHHHHHHk.',
  '.kHHHHHHHHHHHk..',
  '.kHHSSSSSSSHHk..',
  '.kHSSSSSSSSSHk..',
  '.kHSkBSSSkBSHk..',
  '..kSSSSSSSSSk...',
  '..kSSSSkkSSSk...',
  '...kkSSSSSkk....',
  '..kUUUUUUUUUk...',
  '.kUUUUYUUUUUUk..',
  'kUkUUUUYUUUUkUk.',
  'kUkUUUUUUUUUkUk.',
  'kSkUUUUYUUUUkSk.',
  '.kkUUUUUUUUUkk..',
  '..kUUUUUUUUUk...',
  '..kUUUkkkUUUk...',
  '..kUUUk.kUUUk...',
  '..kUUUk.kUUUk...',
  '..kDDDk.kDDDk...',
  '..kkkkk.kkkkk...',
];
const FUSHI_PAL = { H: '#16161c', S: '#f0d8c0', B: '#3a5aa8', U: '#1e2236', Y: '#e8c040', D: '#2a2a2a' };

function buildBossSprites() {
  SPR.bbNoob = spriteFromRows(NOOB, false, NOOB_PAL);
  SPR.bbFushi = spriteFromRows(FUSHI, false, FUSHI_PAL);
}

// ---------- os bosses ----------
const BOSSES = ['noob', 'fushiguro'];

Object.assign(ENEMIES, {
  noob: {
    name: 'Noob', title: 'O Noob dos Hambúrgueres', spr: 'bbNoob', scale: 6, hp: 80, atk: 4, def: 1, xp: 40, gold: 25, voice: 'kid',
    boss: true, nonlethal: true, music: 'noob', bubbleW: 200, turnLen: 6,
    intro: '* Um NOOB quadradão aparece!\n* Ele está segurando... um hambúrguer?',
    check: '* NOOB - ATK 4 DEF 1\n* Acabou de começar no jogo.\n* Acha que hambúrguer é arma.',
    acts: {
      'Ensinar a craftar': { text: ['* Você ensina o Noob a fazer uma mesa de trabalho.', '* "UAU! Eu nunca tinha visto uma!"'], mercy: 30 },
      'Aceitar hambúrguer': { text() { G.hp = Math.min(G.maxhp, G.hp + 6); Sfx.heal(); return ['* Você pega um hambúrguer que ele jogou.', '* Tá bom, na verdade. (+6 HP)']; }, mercy: 25 },
      'Elogiar a skin': { text: ['* Você elogia a skin padrão dele.', '* Ele fica vermelho de vergonha. Ou é o sol.'], mercy: 20 },
      'Mostrar diamante': { text: ['* Você mostra um diamante brilhante.', '* Os olhos do Noob brilham mais que o diamante.'], mercy: 35 },
    },
    flavor: ['* Cheiro de hambúrguer no ar.', '* O Noob pula sem motivo nenhum.', '* Ele está tentando quebrar o chão com a mão.', '* Um creeper passou por perto. Ninguém percebeu.'],
    talk: ['Eu sou PRO!', 'Hambúrguer de graça!', 'Como que pula?', 'Quem botou lava aqui?', 'GG EZ!', 'Mãe, olha eu!'],
    spareTalk: 'Vamos fazer uma casa juntos?',
    defeatText: ['* O Noob caiu... e deu respawn na cama dele.', '* "Volto já com mais hambúrguer!"'],
    patterns: ['burgerToss', 'burgerRain', 'pickaxe', 'creeper'],
    finale: ['burgerStorm', 'creeper', 'burgerStorm', 'pickaxe'],
  },
  fushiguro: {
    name: 'Fushiguro', title: 'Fushiguro e as Dez Sombras', spr: 'bbFushi', scale: 6, hp: 170, atk: 6, def: 2, xp: 90, gold: 60, voice: 'deep',
    boss: true, nonlethal: true, music: 'fushiguro', bubbleW: 220, turnLen: 6.5,
    intro: '* FUSHIGURO junta as mãos.\n* As sombras no chão começam a se mexer.',
    check: '* FUSHIGURO - ATK 6 DEF 3\n* Usa a técnica das DEZ SOMBRAS.\n* Cada sombra é um shikigami diferente.',
    acts: {
      'Observar as sombras': { text: ['* Você presta atenção nas mãos dele.', '* Agora dá pra prever a próxima sombra!', '* A DEFESA dele caiu!'], mercy: 20, defDown: 1 },
      'Elogiar a técnica': { text: ['* Você diz que a técnica das sombras é incrível.', '* "...Hm. Obrigado."'], mercy: 25 },
      'Desafiar': { text: ['* "Mostra tudo o que você tem!"', '* Ele fica mais sério. O ATAQUE dele subiu.'], mercy: 15, atkUp: 1 },
    },
    flavor: ['* As sombras se mexem no chão.', '* Fushiguro forma um sinal com as mãos.', '* Você ouve um uivo vindo de baixo da terra.', '* O ar fica frio e escuro.'],
    talk: ['Cães Divinos.', 'Nue!', 'Sapo.', 'Grande Serpente.', 'Elefante Máximo.', 'Coelhos.', 'Não vou perder.'],
    spareTalk: 'Chega. Você é forte.',
    defeatText: ['* Fushiguro cai de joelhos.', '* As sombras voltam para o chão.'],
    patterns: ['dogs', 'nue', 'toad', 'serpent', 'elephant', 'rabbits'],
    finale: ['mahoraga', 'dogs', 'mahoraga', 'nue'],
  },
});

const SHIKIGAMI = { dogs: 'CÃES DIVINOS', nue: 'NUE', toad: 'SAPO', serpent: 'GRANDE SERPENTE', elephant: 'ELEFANTE MÁXIMO', rabbits: 'FUGA DOS COELHOS', mahoraga: 'MAHORAGA' };

// modificadores aleatórios de cada luta
const MODS = {
  enfurecido: { name: 'ENFURECIDO', color: '#ff5a5a', desc: '+2 de força', xp: 1.3 },
  veloz: { name: 'VELOZ', color: '#5ff8ff', desc: 'ataques mais rápidos', xp: 1.3 },
  gigante: { name: 'GIGANTE', color: '#ffb02a', desc: '+50% de vida', xp: 1.4 },
  tanque: { name: 'TANQUE', color: '#9a9aaa', desc: '+3 de defesa', xp: 1.25 },
  generoso: { name: 'GENEROSO', color: '#ffe680', desc: 'dobro de ouro', xp: 1, gold: 2 },
};

class BossBattle extends Battle {
  constructor(key, opts) {
    super(key, { ...opts, solo: true });
    const lv = opts.lv || 1, mod = MODS[opts.mod];
    this.mod = opts.mod || null;
    // o boss cresce junto com o seu nível
    const sc = 1 + 0.18 * (lv - 1);
    this.e.hp = this.e.hpNow = Math.round(this.e.hp * sc * (opts.mod === 'gigante' ? 1.5 : 1));
    this.e.atkNow += Math.floor((lv - 1) / 2) + (opts.mod === 'enfurecido' ? 2 : 0);
    this.e.def += Math.floor((lv - 1) / 3) + (opts.mod === 'tanque' ? 3 : 0);
    this.diffMul = (opts.mod === 'veloz' ? 1.35 : 1) + 0.03 * (lv - 1);
    // recompensa cresce com o nível e com o modificador
    this.e.xp = Math.round(this.e.xp * sc * (mod ? mod.xp : 1));
    this.e.gold = Math.round(this.e.gold * sc * (mod && mod.gold || 1));
    this.dmgTaken = 0; this.summon = null; this.summonT = 0; this.adapt = 0;
  }
  // barra de HP limitada (o HP cresce muito com o nível)
  drawStats() {
    const y = 394, w = 180;
    text(G.name, 32, y, 30); text('LV ' + G.lv, 160, y, 30); text('HP', 250, y, 24);
    ctx.fillStyle = '#c00000'; ctx.fillRect(286, y + 4, w, 20);
    ctx.fillStyle = '#ffff00'; ctx.fillRect(286, y + 4, w * Math.max(0, G.hp) / G.maxhp, 20);
    text(`${Math.max(0, G.hp)} / ${G.maxhp}`, 476, y, 30);
  }
  doSpare() {
    Sfx.spare();
    this.e.alpha = 0.45; this.spared = true;
    G.gold += this.e.gold;
    if (this.e.spareTalk) this.bubble = { t: this.e.spareTalk, life: 99 };
    const t = [`* VOCÊ VENCEU!\n* Você ganhou ${this.e.xp} EXP e ${this.e.gold} OURO.`];
    if (addXp(this.e.xp)) { Sfx.levelUp(); t.push('* Seu LV aumentou!'); }
    this.say(t, () => this.end('spared'));
  }
  hurt(dmg, who) {
    const before = G.hp;
    super.hurt(dmg, who);
    this.dmgTaken += Math.max(0, before - G.hp);
  }
  afterPlayer() {
    if (this.key === 'fushiguro' && !this.mahoraga && this.e.hpNow < this.e.hp * 0.35 && this.e.hpNow > 0) {
      this.mahoraga = true;
      Sfx.rumble();
      return this.say([
        '* Fushiguro forma um sinal diferente com as mãos.',
        '* "Com esta oferenda... eu invoco..."',
        '* "O DIVINO GENERAL DOS OITO PUNHOS: MAHORAGA!"',
      ], () => { Sfx.playMusic('mahoraga'); super.afterPlayer(); });
    }
    super.afterPlayer();
  }
  startEnemyTurn(p) {
    super.startEnemyTurn(p);
    this.summon = SHIKIGAMI[p] || null; this.summonKey = p; this.summonT = 0;
    if (p === 'mahoraga') {
      this.adapt++;
      this.diffMul += 0.12;
      this.bubble = { t: this.adapt > 1 ? `A roda girou... Mahoraga se ADAPTOU! (x${this.adapt})` : 'Mahoraga... acabe com isso.', life: 2.4 };
    }
  }
  draw() {
    super.draw();
    this.summonT += 1 / 60;
    if (this.mod) { const m = MODS[this.mod]; ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(474, 16, 150, 28); text(m.name, 549, 18, 22, m.color, 'center'); }
    if (this.mahoraga) drawShikigami('mahoraga', 110, 130, this.t, 1, this.adapt);
    else if (this.summon && this.state === 'enemyTurn') drawShikigami(this.summonKey, 110, 120, this.t, Math.min(1, this.summonT * 3));
    if (this.summon && this.state === 'enemyTurn') text(this.summon, 110, 200, 22, '#b08aff', 'center');
  }
}

// ---------- desenhos das sombras (shikigami) ----------
function drawShikigami(k, x, y, t, a, adapt = 0) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  const glow = (r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); };
  glow(80, 'rgba(90,40,140,0.18)');
  const eye = (ex, ey, c = '#ff3b3b') => { ctx.fillStyle = c; ctx.fillRect(ex - 2, ey - 2, 5, 4); };
  if (k === 'dogs') {
    for (const [dx, col, s] of [[-34, '#f0f0f0', 1], [30, '#1a1a1e', -1]]) {
      const b = Math.sin(t * 8 + dx) * 2;
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(dx, 18 + b, 30, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(dx, 18 + b, 28, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(dx + s * 24, -2 + b, 14, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(dx + s * 18, -10 + b); ctx.lineTo(dx + s * 22, -26 + b); ctx.lineTo(dx + s * 28, -10 + b); ctx.fill();
      ctx.fillRect(dx - 20, 26 + b, 6, 18); ctx.fillRect(dx + 14, 26 + b, 6, 18);
      eye(dx + s * 28, -4 + b, col === '#f0f0f0' ? '#3a5aa8' : '#ffe680');
    }
  } else if (k === 'nue') {
    const w = Math.sin(t * 10) * 18;
    ctx.fillStyle = '#26203a';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-80, -20 + w); ctx.lineTo(-40, 20); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(80, -20 + w); ctx.lineTo(40, 20); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 10, 18, 28, 0, 0, Math.PI * 2); ctx.fill();
    eye(-6, 0, '#ffe680'); eye(6, 0, '#ffe680');
    ctx.strokeStyle = '#ffe680'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(-8, 56); ctx.lineTo(6, 62); ctx.lineTo(-4, 80); ctx.stroke();
  } else if (k === 'toad') {
    ctx.fillStyle = '#1e3a2a'; ctx.beginPath(); ctx.ellipse(0, 20, 54, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-26, -14, 14, 0, Math.PI * 2); ctx.arc(26, -14, 14, 0, Math.PI * 2); ctx.fill();
    eye(-26, -14, '#ffe680'); eye(26, -14, '#ffe680');
    ctx.fillStyle = '#e04a6a'; ctx.fillRect(-60 - Math.abs(Math.sin(t * 4)) * 30, 22, 60, 6);
  } else if (k === 'serpent') {
    ctx.strokeStyle = '#141018'; ctx.lineWidth = 26; ctx.lineCap = 'round';
    ctx.beginPath(); for (let i = 0; i <= 20; i++) { const yy = 80 - i * 7, xx = Math.sin(i * 0.5 + t * 3) * 30; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    const hx = Math.sin(10 + t * 3) * 30;
    ctx.fillStyle = '#141018'; ctx.beginPath(); ctx.ellipse(hx, -66, 26, 18, 0, 0, Math.PI * 2); ctx.fill();
    eye(hx - 10, -70); eye(hx + 10, -70);
  } else if (k === 'elephant') {
    ctx.fillStyle = '#2a2e44'; ctx.beginPath(); ctx.ellipse(10, 20, 60, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-40, -6, 30, 28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-64, 0, 14, 50); for (const lx of [-20, 10, 40, 60]) ctx.fillRect(lx, 40, 14, 30);
    eye(-46, -12, '#5ff8ff');
    ctx.fillStyle = 'rgba(95,200,255,0.8)'; for (let i = 0; i < 8; i++) { const q = (t * 2 + i / 8) % 1; ctx.beginPath(); ctx.arc(-58 - q * 80, 52 + Math.sin(q * 6) * 10, 6 - q * 3, 0, Math.PI * 2); ctx.fill(); }
  } else if (k === 'rabbits') {
    for (let i = 0; i < 9; i++) {
      const rx = -70 + (i % 5) * 35, ry = -30 + Math.floor(i / 5) * 50 - Math.abs(Math.sin(t * 6 + i)) * 14;
      ctx.fillStyle = '#e8e8f0'; ctx.beginPath(); ctx.ellipse(rx, ry, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(rx - 5, ry - 20, 3, 12); ctx.fillRect(rx + 2, ry - 20, 3, 12);
      eye(rx + 4, ry - 2);
    }
  } else if (k === 'mahoraga') {
    // a roda em cima da cabeça
    ctx.save(); ctx.translate(0, -78); ctx.rotate(t * 1.5 * (1 + 0.3 * adapt));
    ctx.strokeStyle = '#e8c040'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 30, Math.sin(an) * 30); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = '#e8e0d8'; ctx.beginPath(); ctx.ellipse(0, -40, 16, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-26, -24, 52, 60); ctx.fillRect(-36, -20, 12, 50); ctx.fillRect(24, -20, 12, 50);
    ctx.fillRect(-20, 36, 14, 40); ctx.fillRect(6, 36, 14, 40);
    ctx.fillStyle = '#c8c8d8'; ctx.fillRect(36, -40 + Math.sin(t * 4) * 4, 6, 70);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-10, -44, 20, 3);
    ctx.strokeStyle = '#5a5a6a'; ctx.lineWidth = 2; ctx.strokeRect(-26, -24, 52, 60);
  }
  ctx.restore();
}

// ---------- ataques ----------
const bx0 = B => B.boxTarget;
Object.assign(PATTERNS, {
  burgerToss: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.55;
      const bx = bx0(B), left = Math.random() < 0.5;
      B.bullets.push({ kind: 'burger', x: left ? bx.x + 10 : bx.x + bx.w - 10, y: bx.y + 10, vx: (left ? 1 : -1) * (60 + Math.random() * 90), vy: -80 - Math.random() * 60, g: 280, r: 9, life: 3.5 });
    },
  },
  burgerRain: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.24;
      const bx = bx0(B), x = bx.x + 12 + Math.random() * (bx.w - 24);
      if (Math.random() < 0.65) B.bullets.push({ kind: 'burger', x, y: bx.y - 10, vx: 0, vy: 110 + Math.random() * 70, r: 8, life: 3 });
      else B.bullets.push({ kind: 'dirt', x, y: bx.y - 10, vx: 0, vy: 150, w: 14, h: 14, life: 3 });
    },
  },
  pickaxe: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.6;
      const bx = bx0(B), left = Math.random() < 0.5;
      B.bullets.push({ kind: 'pickaxe', x: left ? bx.x - 14 : bx.x + bx.w + 14, y: B.soul.y + (Math.random() - 0.5) * 50, vx: left ? 170 : -170, vy: 0, r: 9, life: 3 });
    },
  },
  creeper: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 1.1;
      const bx = bx0(B), x = bx.x + 30 + Math.random() * (bx.w - 60), y = bx.y + 30 + Math.random() * (bx.h - 60);
      Sfx.blip && Sfx.blip();
      B.bullets.push({ kind: 'creeper', x, y, vx: 0, vy: 0, warn: 0.95, life: 1.25,
        hitFn(b, s) { return b.t >= b.warn && Math.hypot(s.x - b.x, s.y - b.y) < 44; } });
    },
  },
  burgerStorm: {
    update(B, dt) {
      const P = B.pState, bx = bx0(B);
      P.a = (P.a ?? 0) - dt; P.r = (P.r ?? 0.2) - dt;
      if (P.a <= 0) { P.a = 0.45; const left = Math.random() < 0.5; B.bullets.push({ kind: 'burger', x: left ? bx.x + 10 : bx.x + bx.w - 10, y: bx.y + 10, vx: (left ? 1 : -1) * (60 + Math.random() * 90), vy: -80 - Math.random() * 60, g: 280, r: 9, life: 3.5 }); }
      if (P.r <= 0) { P.r = 0.32; B.bullets.push({ kind: Math.random() < 0.7 ? 'burger' : 'dirt', x: bx.x + 12 + Math.random() * (bx.w - 24), y: bx.y - 10, vx: 0, vy: 130, r: 8, w: 14, h: 14, life: 3 }); }
    },
  },

  dogs: {
    update(B, dt) {
      for (const b of B.bullets) if (b.kind === 'dog' && !b.go && b.t >= b.warn) { b.go = 1; b.vx = b.dir * 340; Sfx.whoosh(); }
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.95;
      const bx = bx0(B), y = B.soul.y, n = (B.pState.n = (B.pState.n || 0) + 1), dir = n % 2 ? 1 : -1;
      B.bullets.push({ kind: 'dog', x: dir > 0 ? bx.x - 20 : bx.x + bx.w + 20, y, vx: 0, vy: 0, dir, w: 34, h: 16, warn: 0.5, white: n % 2, life: 2.6 });
    },
  },
  nue: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.75;
      const bx = bx0(B);
      B.bullets.push({ kind: 'bolt', x: B.soul.x + (Math.random() - 0.5) * 20, y: bx.y + bx.h / 2, vx: 0, vy: 0, w: 14, h: bx.h, warn: 0.55, life: 0.9 });
    },
  },
  toad: {
    update(B, dt) {
      const bx = bx0(B);
      for (const b of B.bullets) if (b.kind === 'tongue' && b.t >= b.warn) {
        const q = Math.min(1, (b.t - b.warn) / 0.22), back = b.t > b.warn + 0.45 ? Math.max(0, 1 - (b.t - b.warn - 0.45) / 0.25) : 1, len = bx.w * 0.85 * Math.min(q, back);
        b.w = Math.max(2, len); b.x = b.left ? bx.x + len / 2 : bx.x + bx.w - len / 2;
      }
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.85;
      const left = Math.random() < 0.5;
      B.bullets.push({ kind: 'tongue', left, x: left ? bx.x : bx.x + bx.w, y: B.soul.y, vx: 0, vy: 0, w: 2, h: 10, warn: 0.45, life: 1.2 });
    },
  },
  serpent: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.9;
      const bx = bx0(B);
      B.bullets.push({ kind: 'snake', x: B.soul.x, y: bx.y + bx.h / 2, vx: 0, vy: 0, w: 30, h: bx.h, warn: 0.6, life: 1.2 });
    },
  },
  elephant: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 1.0;
      const bx = bx0(B), y = Math.random() < 0.6 ? B.soul.y : bx.y + 20 + Math.random() * (bx.h - 40);
      B.bullets.push({ kind: 'water', x: bx.x + bx.w / 2, y, vx: 0, vy: 0, w: bx.w, h: 22, warn: 0.55, life: 1.15 });
    },
  },
  rabbits: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.13;
      const bx = bx0(B), left = Math.random() < 0.5;
      B.bullets.push({ kind: 'rabbit', x: left ? bx.x + 8 : bx.x + bx.w - 8, y: bx.y + 10 + Math.random() * (bx.h - 20), vx: (left ? 1 : -1) * (80 + Math.random() * 80), vy: (Math.random() - 0.5) * 140, r: 5, bounce: true, life: 2.2 });
    },
  },
  mahoraga: {
    update(B, dt) {
      B.spawnT -= dt; if (B.spawnT > 0) return; B.spawnT = 0.62;
      const s = B.soul, a = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4][(Math.random() * 4) | 0];
      B.bullets.push({ kind: 'slash', x: s.x, y: s.y, ang: a, vx: 0, vy: 0, warn: 0.5, life: 0.78,
        hitFn(b, q) { return b.t >= b.warn && Math.abs(-(q.x - b.x) * Math.sin(b.ang) + (q.y - b.y) * Math.cos(b.ang)) < 9; } });
    },
  },
});

Object.assign(BULLET_DRAW, {
  burger(b) {
    const x = b.x, y = b.y;
    ctx.fillStyle = '#000'; ctx.fillRect(x - 10, y - 8, 20, 17);
    ctx.fillStyle = '#d8902a'; ctx.fillRect(x - 9, y - 7, 18, 5); ctx.fillStyle = '#fff6c0'; ctx.fillRect(x - 6, y - 6, 2, 1); ctx.fillRect(x + 2, y - 6, 2, 1);
    ctx.fillStyle = '#5ac83a'; ctx.fillRect(x - 10, y - 2, 20, 2);
    ctx.fillStyle = '#7a3a1a'; ctx.fillRect(x - 9, y, 18, 4);
    ctx.fillStyle = '#ffd23a'; ctx.fillRect(x - 9, y - 1, 18, 1);
    ctx.fillStyle = '#d8902a'; ctx.fillRect(x - 9, y + 4, 18, 4);
  },
  dirt(b) {
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 8, b.y - 8, 16, 16);
    ctx.fillStyle = '#8a5a2a'; ctx.fillRect(b.x - 7, b.y - 7, 14, 14);
    ctx.fillStyle = '#5ac83a'; ctx.fillRect(b.x - 7, b.y - 7, 14, 4);
    ctx.fillStyle = '#6a4220'; ctx.fillRect(b.x - 4, b.y, 2, 2); ctx.fillRect(b.x + 3, b.y + 3, 2, 2);
  },
  pickaxe(b, t) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(t * 12 * Math.sign(b.vx || 1));
    ctx.fillStyle = '#000'; ctx.fillRect(-2, -10, 4, 20);
    ctx.fillStyle = '#8a5a2a'; ctx.fillRect(-1, -9, 2, 18);
    ctx.fillStyle = '#5ff8ff'; ctx.beginPath(); ctx.moveTo(-11, -8); ctx.quadraticCurveTo(0, -14, 11, -8); ctx.lineTo(9, -6); ctx.quadraticCurveTo(0, -10, -9, -6); ctx.fill();
    ctx.restore();
  },
  creeper(b, t) {
    if (b.t < b.warn) {
      const fl = Math.floor(b.t * (6 + b.t * 14)) % 2;
      ctx.strokeStyle = `rgba(90,220,90,${0.3 + b.t * 0.4})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, 44, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.fillRect(b.x - 9, b.y - 13, 18, 26);
      ctx.fillStyle = fl ? '#ffffff' : '#4ab84a'; ctx.fillRect(b.x - 8, b.y - 12, 16, 24);
      ctx.fillStyle = '#000'; ctx.fillRect(b.x - 6, b.y - 8, 4, 4); ctx.fillRect(b.x + 2, b.y - 8, 4, 4); ctx.fillRect(b.x - 2, b.y - 4, 4, 6); ctx.fillRect(b.x - 4, b.y, 2, 4); ctx.fillRect(b.x + 2, b.y, 2, 4);
      return;
    }
    const k = (b.t - b.warn) / (b.life - b.warn);
    ctx.fillStyle = `rgba(255,240,200,${1 - k})`; ctx.beginPath(); ctx.arc(b.x, b.y, 20 + k * 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(120,120,120,${0.8 - k * 0.8})`; for (let i = 0; i < 8; i++) ctx.fillRect(b.x + Math.cos(i) * k * 50 - 4, b.y + Math.sin(i * 1.7) * k * 50 - 4, 8, 8);
  },
  dog(b) {
    if (!b.go) { ctx.fillStyle = `rgba(176,138,255,${0.3 + Math.sin(b.t * 40) * 0.2})`; ctx.fillRect(b.x < 320 ? b.x : 0, b.y - 1, 640, 2); }
    const s = b.dir, x = b.x, y = b.y, c = b.white ? '#f0f0f0' : '#202028';
    ctx.fillStyle = '#000'; ctx.fillRect(x - 18, y - 9, 36, 18);
    ctx.fillStyle = c; ctx.fillRect(x - 17, y - 8, 30, 14); ctx.fillRect(x + s * 12, y - 12, 10, 10);
    ctx.fillStyle = '#ff3b3b'; ctx.fillRect(x + s * 16, y - 9, 2, 2);
  },
  bolt(b, t) {
    if (b.t < b.warn) { ctx.fillStyle = `rgba(255,230,120,${0.25 + Math.sin(t * 40) * 0.15})`; ctx.fillRect(b.x - 2, b.y - b.h / 2, 4, b.h); return; }
    ctx.strokeStyle = '#ffe680'; ctx.lineWidth = 6; ctx.beginPath();
    for (let i = 0; i <= 8; i++) { const yy = b.y - b.h / 2 + i * b.h / 8, xx = b.x + (i % 2 ? 6 : -6); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  },
  tongue(b) {
    if (b.t < b.warn) { ctx.fillStyle = 'rgba(224,74,106,0.4)'; ctx.fillRect(b.left ? b.x : b.x - 30, b.y - 2, 30, 4); return; }
    ctx.fillStyle = '#e04a6a'; ctx.fillRect(b.x - b.w / 2, b.y - 5, b.w, 10);
    ctx.fillStyle = '#ff8aa0'; ctx.beginPath(); ctx.arc(b.left ? b.x + b.w / 2 : b.x - b.w / 2, b.y, 8, 0, Math.PI * 2); ctx.fill();
  },
  snake(b, t) {
    if (b.t < b.warn) { ctx.fillStyle = `rgba(176,138,255,${0.3 + Math.sin(t * 30) * 0.15})`; ctx.fillRect(b.x - b.w / 2, b.y + b.h / 2 - 10, b.w, 10); return; }
    const k = Math.min(1, (b.t - b.warn) / 0.15), h = b.h * k, top = b.y + b.h / 2 - h;
    ctx.fillStyle = '#141018'; ctx.fillRect(b.x - b.w / 2, top, b.w, h);
    ctx.fillStyle = '#3a2a4a'; for (let yy = top + 6; yy < top + h; yy += 10) ctx.fillRect(b.x - b.w / 2 + 4, yy, b.w - 8, 3);
    ctx.fillStyle = '#ff3b3b'; ctx.fillRect(b.x - 8, top + 6, 4, 4); ctx.fillRect(b.x + 4, top + 6, 4, 4);
  },
  water(b, t) {
    if (b.t < b.warn) { ctx.fillStyle = `rgba(95,200,255,${0.25 + Math.sin(t * 30) * 0.15})`; ctx.fillRect(b.x - b.w / 2, b.y - 2, b.w, 4); return; }
    ctx.fillStyle = 'rgba(60,160,255,0.85)'; ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    ctx.fillStyle = '#d8f4ff'; for (let x = -b.w / 2; x < b.w / 2; x += 12) ctx.fillRect(b.x + x + (t * 200 % 12), b.y - b.h / 2 + 3, 6, 2);
  },
  rabbit(b) {
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 6, b.y - 5, 12, 10); ctx.fillRect(b.x - 4, b.y - 11, 3, 7); ctx.fillRect(b.x + 1, b.y - 11, 3, 7);
    ctx.fillStyle = '#f0f0f8'; ctx.fillRect(b.x - 5, b.y - 4, 10, 8); ctx.fillRect(b.x - 3, b.y - 10, 1, 6); ctx.fillRect(b.x + 2, b.y - 10, 1, 6);
    ctx.fillStyle = '#ff3b3b'; ctx.fillRect(b.x + 1, b.y - 2, 2, 2);
  },
  slash(b, t) {
    const on = b.t >= b.warn, c = Math.cos(b.ang), s = Math.sin(b.ang);
    ctx.strokeStyle = on ? '#ffffff' : `rgba(232,192,64,${0.35 + Math.sin(t * 40) * 0.2})`;
    ctx.lineWidth = on ? 12 * Math.max(0, 1 - (b.t - b.warn) / 0.28) + 2 : 2;
    ctx.beginPath(); ctx.moveTo(b.x - c * 400, b.y - s * 400); ctx.lineTo(b.x + c * 400, b.y + s * 400); ctx.stroke();
  },
});
