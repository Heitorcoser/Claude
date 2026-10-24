// FASE 9 — A LUTA CONTRA O MESTRE ENCAPUZADO
// Luta 1 contra 1, sem dragão e sem amigos. Ele ataca de surpresa e quebra os botões
// de AGIR e POUPAR. Usa canhões de caveira, ossos (azuis e laranjas), alma azul com
// gravidade, tela de cabeça pra baixo e KARMA (o HP continua caindo depois do golpe).
'use strict';

const BLASTER = [
  '.....kkkkkkkk.......',
  '...kkWWWWWWWWkk.....',
  '..kWWWWWWWWWWWWk....',
  '.kWWkkkWWWWWWWWWk...',
  '.kWkkBkkWWWWWWWWWk..',
  'kWWkkkkkWWWWWWWWWWk.',
  'kWWWkkkWWWWWWWWWWWWk',
  'kWWWWWWWWWWWkkkkkkkk',
  'kWWWWWWWWWkkk.......',
  '.kWWkWkWkWk.........',
  '.kWWWWWWWWk.........',
  '..kWkWkWkWkk........',
  '...kkkkkkkkk........',
];
const BLASTER_OPEN = [
  '.....kkkkkkkk.......',
  '...kkWWWWWWWWkk.....',
  '..kWWWWWWWWWWWWk....',
  '.kWWkkkWWWWWWWWWk...',
  '.kWkkBkkWWWWWWWWWk..',
  'kWWkkkkkWWWWWWWWWWk.',
  'kWWWkkkWWWWWWWWWWWWk',
  'kWWWWWWWkkkkkkkkkkkk',
  'kWWWWWkk............',
  'kWWkk...............',
  'kWWWWWkk............',
  '.kWkWkWkWkkk........',
  '..kkkkkkkkkkk.......',
];

let BOSS9_SPR = null;
// Quantas vezes o jogador perdeu para o Mestre (fica guardado mesmo depois do game over).
// A cada derrota, os golpes dele machucam um pouco menos (até a metade).
function m9Tries(set) {
  try {
    if (set !== undefined) localStorage.setItem('perdido_p9tries', String(set));
    return +(localStorage.getItem('perdido_p9tries') || 0);
  } catch (e) { return set || 0; }
}
function boss9Sprites() {
  if (BOSS9_SPR) return BOSS9_SPR;
  const pal = { W: '#ffffff', B: '#5ff8ff' };
  const soulBlue = makeCanvas(SPR.soul.width, SPR.soul.height, g => {
    g.drawImage(SPR.soul, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#2a7aff'; g.fillRect(0, 0, 32, 32);
  });
  BOSS9_SPR = { blaster: [spriteFromRows(BLASTER, false, pal), spriteFromRows(BLASTER_OPEN, false, pal)], soulBlue };
  return BOSS9_SPR;
}

ENEMIES.mestre = {
  name: 'Mestre Encapuzado', spr: 'encapuzado', scale: 7, hp: 320, atk: 2, def: 2, xp: 500, gold: 0, voice: 'deep',
  boss: true, nonlethal: true, cls: 'mestre', music: 'mestre', bubbleW: 220,
  intro: '* ...',
  check: '* MESTRE ENCAPUZADO - ATK ? DEF ?\n* ...',
  acts: {},
  flavor: ['* O vento para.', '* Ele nem se mexe. Só espera.', '* Você sente o peso de cada osso dele.', '* O capuz esconde tudo. Menos o olho.'],
  talk: ['...'],
  spareTalk: '...Obrigado.',
  defeatText: ['* O Mestre Encapuzado cai para trás.', '* Ele some numa nuvem de poeira azul...', "* '...Passou.'"],
  patterns: [],
};

const M9_PHASES = {
  1: ['mBoneGap', 'mBlasters', 'mBlue', 'mBlueOrange'],
  2: ['mFlip', 'mCage', 'mBlueBlasters', 'mBlasters', 'mBlueOrange'],
  3: ['mStorm', 'mBlueBlasters', 'mFlip', 'mCage'],
};
const M9_TALK = {
  1: ['Sabe por que eu te dei aquele celular?', 'Pra te observar.', 'Nada de dragão hoje.', 'Desvia. Ou não.', 'Você melhorou. Um pouco.'],
  2: ['Tá ficando sério.', 'De cabeça pra baixo.', 'Lá embaixo é pior.', 'Não pisca.', 'Ninguém vem te salvar.'],
  3: ['Determinação... hm.', 'Ainda de pé?', 'Mais rápido!', 'Eu também já caí aqui um dia.'],
};
const M9_FLAVOR = {
  2: ['* Um olho azul brilha debaixo do capuz.', '* O chão da ponte range.', '* Ele está falando sério agora.'],
  3: ['* O ar está roxo e pesado.', '* O olho dele pisca: azul, amarelo, azul.', '* Seu coração bate muito rápido.', '* Você está DETERMINADO.'],
};

class MasterBattle extends Battle {
  constructor(key, opts) {
    super(key, { ...opts, dragon: null, robot: false, withInstr: false, solo: true });
    boss9Sprites();
    this.kr = 0; this.krT = 0;
    this.broken = false; this.breaking = false; this.brokenAct = false; this.brokenMercy = false; this.mercyBack = false;
    this.phase = 1; this.dodges = 2; this.dodgeT = 0;
    this.finalPending = false; this.finalDone = false; this.exhausted = false;
    this.flip = false; this.soulMode = 'red'; this.btnShake = 0; this.shakeT = 0;
    this.tries = m9Tries();
    this.dmgMul = Math.max(0.5, 1 - this.tries * 0.1);
    this.m9turn = 0;
    // part 1 = luta na ponte (Fase 9); 2 = continuação na Fase 11; 'full' = luta inteira (Fase 11, se perdeu na ponte)
    this.part = opts.part || 'full';
    if (this.part === 2) { this.phase = 2; this.dodges = 1; this.breaking = true; }
    if (this.part === 1) this.dmgMul = 1;
  }

  // ----- início: ataque surpresa -----
  st_start(dt) {
    this.introT += dt;
    if (this.introT > 0.3 && !this.surprised) {
      this.surprised = true;
      if (this.part === 2) return this.say(['* O Mestre Encapuzado estala os dedos.'], () => { this.state = 'breaking'; this.breakT = 0; });
      this.startEnemyTurn('mSurprise');
      this.bubble = null;
    }
  }

  toMenu() {
    if (this.endingSeq) return;
    this.flip = false; this.soulMode = 'red';
    if (!this.broken) return this.breakButtons();
    if (this.finalPending) return this.afterFinal();
    Battle.prototype.toMenu.call(this);
    const fl = M9_FLAVOR[this.phase];
    if (fl && !this.exhausted) this.flavorTyper = new Typer(fl[(Math.random() * fl.length) | 0], 'narr', 520, 32);
    if (this.exhausted) this.flavorTyper = new Typer(this.mercyBack ? '* Ele não consegue mais lutar. O botão POUPAR brilha.' : '* Ele mal consegue ficar de pé.', 'narr', 520, 32);
  }

  breakButtons() {
    if (this.breaking) return;
    this.breaking = true;
    this.boxTarget = { ...BOX_FULL };
    this.say(['* ...ATAQUE SURPRESA.', '* O Encapuzado estala os dedos.'], () => { this.state = 'breaking'; this.breakT = 0; });
  }
  st_breaking(dt) {
    this.breakT += dt;
    const shards = (bx) => { for (let i = 0; i < 14; i++) this.particles.push({ x: bx + 20 + Math.random() * 90, y: BTN_Y + 10 + Math.random() * 30, vx: (Math.random() - 0.5) * 200, vy: -60 - Math.random() * 160, life: 1.2, c: '#ff7f27' }); };
    if (this.breakT > 0.4 && !this.brokenAct) { this.brokenAct = true; Sfx.shatter(); shards(BTN[1].x); this.shakeT = 0.3; }
    if (this.breakT > 1.3 && !this.brokenMercy) { this.brokenMercy = true; Sfx.shatter(); shards(BTN[3].x); this.shakeT = 0.3; }
    if (this.breakT > 2.3) {
      this.state = 'text';
      this.say(this.part === 2 ? [
        '* AGIR e POUPAR quebraram de novo.',
        '* "Da última vez foi só o começo."',
        '* "Agora começa a SEGUNDA PARTE."',
      ] : [
        '* Ele QUEBROU os seus botões de AGIR e POUPAR.',
        '* Aqui não tem conversa. Não tem misericórdia.',
        '* Seu dragão está longe. Seus amigos estão longe.',
        '* É só você e ele. 1 CONTRA 1.',
      ], () => { this.broken = true; this.toMenu(); });
    }
  }

  isBroken(i) {
    if (i === 1) return this.brokenAct;
    if (i === 3) return this.brokenMercy && !this.mercyBack;
    return false;
  }
  st_menu(dt) {
    let target = -1;
    if (Input.tap) target = BTN.findIndex(b => hit(Input.tap, b.x, BTN_Y, BTN_W, BTN_H));
    else if (Input.isPressed('a')) target = this.btn;
    if (target >= 0 && this.isBroken(target)) {
      this.btn = target; Sfx.buzz(); this.btnShake = 0.35;
      this.flavorTyper = new Typer(target === 1 ? '* O botão AGIR está quebrado.' : '* O botão POUPAR está quebrado.', 'narr', 520, 32);
      return;
    }
    super.st_menu(dt);
  }

  // ----- dano no Mestre (ele desvia) -----
  dealDamage(dmg, then, quiet) {
    if (!quiet && this.dodges > 0 && !this.exhausted) {
      this.dodges--;
      this.state = 'damage'; this.dodgeT = 0.6; Sfx.whoosh();
      this.dmgPop = { v: 'MISS', t: 0 }; this.afterDamage = then; this.damageT = 0;
      return;
    }
    super.dealDamage(dmg, then, quiet);
    if (!this.finalDone) this.e.hpNow = Math.max(Math.ceil(this.e.hp * 0.08), this.e.hpNow);
  }

  afterPlayer() {
    if (this.exhausted) return this.say(['* Ele está esperando.'], () => this.toMenu());
    const fr = this.e.hpNow / this.e.hp;
    if (this.part === 1 && fr <= 0.66) return this.part1Win();
    if (this.phase === 1 && fr <= 0.66) {
      this.phase = 2; this.dodges = 1; Sfx.slam();
      return this.say(['* O Encapuzado para de brincar.', '* Um olho brilha AZUL debaixo do capuz.', '* "O aquecimento acabou."'], () => this.nextAttack());
    }
    if (this.phase === 2 && fr <= 0.33) {
      this.phase = 3; this.dodges = 1; Sfx.slam(); Sfx.playMusic('mestre2');
      return this.say(['* O ar fica pesado e roxo.', '* O olho dele pisca entre AZUL e AMARELO.', '* "Eu vi tudo. Cada passo seu, desde o labirinto."', '* "Agora me mostra se você aguenta o que vem lá embaixo."'], () => this.nextAttack());
    }
    if (this.phase === 3 && fr <= 0.1 && !this.finalDone) {
      return this.say(['* Ele respira fundo.', '* "Então vamos acabar com isso."', '* ...', '* ATAQUE FINAL.'], () => { this.finalPending = true; this.startEnemyTurn('mFinal'); });
    }
    this.nextAttack();
  }
  // ----- Fase 9: a luta para no fim da primeira parte -----
  part1Win() {
    this.endingSeq = true; this.kr = 0;
    Sfx.slam();
    this.say([
      '* O Encapuzado recua e segura o braço.',
      '* "...Hm. Você passou da PRIMEIRA PARTE."',
      '* "A segunda parte fica pra depois. Mais pra frente."',
      '* "Fique mais forte. Eu vou estar esperando."',
      '* Ele some numa nuvem de poeira azul.',
    ], () => { this.vanish = true; setTimeout(() => this.end('part1'), 900); });
  }
  notReady() {
    if (this.endingSeq) return;
    this.endingSeq = true; this.bullets = []; this.kr = 0; this.flip = false; this.soulMode = 'red';
    G.hp = 1;
    this.boxTarget = { ...BOX_FULL };
    this.say([
      '* Seu HP chegou a 1.',
      '* O Encapuzado abaixa a mão. Os canhões somem.',
      '* "...Chega. Você ainda não está pronto."',
      '* "Treine. Fique mais forte."',
      '* "Quando estiver preparado, me encontre de novo."',
      '* Ele some numa nuvem de poeira azul.',
    ], () => { this.vanish = true; setTimeout(() => this.end('notready'), 900); });
  }

  nextAttack() {
    const list = M9_PHASES[this.phase];
    this.startEnemyTurn(list[this.m9turn++ % list.length]);
  }

  afterFinal() {
    this.finalPending = false; this.finalDone = true; this.exhausted = true; this.dodges = 0;
    const pac = route() === 'pacifista';
    const lines = ['* O Encapuzado cai de joelhos.', '* "Hah... hah... você... ainda está de pé."', '* Ele não consegue mais atacar.'];
    if (pac) {
      lines.push('* ...', '* O botão POUPAR começa a brilhar.', '* Os pedaços voltam pro lugar, um por um.', '* Misericórdia não se quebra. Não a sua.');
    } else lines.push('* O botão POUPAR continua quebrado.', '* Só resta LUTAR.');
    this.say(lines, () => {
      if (pac) { this.mercyBack = true; this.e.mercy = 100; Sfx.heal(); }
      this.toMenu();
    });
  }

  startEnemyTurn(p) {
    super.startEnemyTurn(p);
    const P = PATTERNS[p];
    this.turnLen = P.len || 7;
    this.soulMode = P.blue ? 'blue' : 'red';
    this.soul.vy = 0;
    if (P.blue) this.soul.y = 316 + 80 - 12;
    const talk = M9_TALK[this.phase];
    this.bubble = (p === 'mSurprise' || p === 'mFinal') ? null : { t: talk[(this.talkN = (this.talkN ?? -1) + 1) % talk.length], life: 2.4 };
  }

  moveSoul(dt) {
    if (this.soulMode !== 'blue') return super.moveSoul(dt);
    const s = this.soul, sp = this.soulSpeed || 150, ox = s.x, oy = s.y, bx = this.box;
    const mv = moveVector();
    s.x += mv.x * sp * dt;
    if (Input.drag.active) s.x += Input.drag.dx * 1.1;
    const floor = bx.y + bx.h - 12, top = bx.y + 12;
    const onGround = s.y >= floor - 0.5;
    const jumpHeld = mv.y < -0.4 || Input.held.up || Input.held.a || (Input.drag.active && Input.drag.dy < -1.5);
    if (onGround && jumpHeld) s.vy = -285;
    if (!jumpHeld && s.vy < -90) s.vy = -90;
    s.vy = (s.vy || 0) + 640 * dt;
    s.y += s.vy * dt;
    if (s.y > floor) { s.y = floor; s.vy = 0; }
    if (s.y < top) { s.y = top; s.vy = 0; }
    s.x = Math.max(bx.x + 13, Math.min(bx.x + bx.w - 13, s.x));
    this.soulMoved = Math.hypot(s.x - ox, s.y - oy) > 0.3;
  }

  hurt() {
    if (this.endingSeq) return;
    const d = Math.max(1, Math.round(2 * this.dmgMul));
    if (this.part === 1 && G.hp - d <= 1) return this.notReady();
    G.hp = Math.max(0, G.hp - d);
    this.kr = Math.min(this.kr + (this.dmgMul < 0.8 ? 1 : 2), 40, Math.max(0, G.hp - 1));
    this.soul.inv = 0.3; Sfx.hurt(); this.hurtFlash = 0.12;
    if (G.hp <= 0) { m9Tries(this.tries + 1); this.kr = 0; this.end('dead'); }
  }

  update(dt) {
    super.update(dt);
    if (this.vanish) this.e.alpha = Math.max(0, this.e.alpha - dt * 1.5);
    if (this.part === 1 && G.hp <= 1 && !this.endingSeq && (this.state === 'enemyTurn' || this.state === 'menu')) this.notReady();
    if (this.kr > 0 && this.state !== 'over') {
      this.krT += dt;
      if (this.krT > 0.45) { this.krT = 0; this.kr--; if (G.hp > 1) G.hp--; }
    }
    if (this.dodgeT > 0) { this.dodgeT -= dt; this.e.offX = -Math.sin((1 - this.dodgeT / 0.6) * Math.PI) * 120; } else this.e.offX = 0;
    if (this.btnShake > 0) this.btnShake -= dt;
    if (this.shakeT > 0) this.shakeT -= dt;
    if (this.state === 'enemyTurn') for (const b of this.bullets) if (b.kind === 'blaster' && !b.fired && b.t >= b.warn) { b.fired = true; Sfx.blasterFire(); this.shakeT = 0.15; }
  }

  // ----- desenho -----
  drawBg() {
    const t = this.t;
    if (this.phase === 1) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05060f'); g.addColorStop(1, '#0c1024'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); return; }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, this.phase === 3 ? '#2a0838' : '#140a2a'); g.addColorStop(1, this.phase === 3 ? '#5a0a4a' : '#24123a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (this.phase === 3) {
      for (let i = 0; i < 9; i++) {
        const x = (i * 83 + t * (20 + i * 4)) % 700 - 30, y = (i * 131 + Math.sin(t + i) * 40) % 480, r = 14 + (i % 3) * 8, a = t * (0.5 + i * 0.1);
        ctx.fillStyle = `rgba(255,90,200,${0.12 + (i % 3) * 0.05})`;
        ctx.beginPath(); for (let k = 0; k < 6; k++) ctx.lineTo(x + Math.cos(a + k * Math.PI / 3) * r, y + Math.sin(a + k * Math.PI / 3) * r); ctx.fill();
      }
    }
  }

  draw() {
    ctx.save();
    if (this.shakeT > 0) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    if (this.flip) { ctx.translate(W, H); ctx.rotate(Math.PI); }
    super.draw();
    this.drawEye();
    this.drawBrokenButtons();
    if (this.state === 'enemyTurn') {
      for (const b of this.bullets) if (b.kind === 'blaster') drawBlaster(b);
      if (this.soulMode === 'blue') {
        const s = this.soul;
        if (s.inv <= 0 || Math.floor(s.inv * 12) % 2) drawSpr(BOSS9_SPR.soulBlue, s.x - 8, s.y - 7, 1);
      }
    }
    ctx.restore();
    if (this.phase === 3 && Math.random() < 0.04) {
      const y = Math.random() * H;
      ctx.drawImage(cv, 0, y, W, 6, (Math.random() - 0.5) * 30, y, W, 6);
    }
  }

  drawEye() {
    if (this.phase < 2 || this.e.alpha <= 0) return;
    const sc = this.e.scale, ex = 320 - SPR.encapuzado.width * sc / 2 + (this.e.offX || 0), ey = this.enemyY();
    const x = ex + 9.5 * sc, y = ey + 5.5 * sc;
    const c = this.phase === 3 && Math.floor(this.t * 6) % 2 ? '255,230,80' : '95,248,255';
    ctx.fillStyle = `rgba(${c},0.35)`; ctx.beginPath(); ctx.arc(x, y, 14 + Math.sin(this.t * 10) * 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgb(${c})`; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i++) { const k = (this.t * 1.5 + i / 4) % 1; ctx.fillStyle = `rgba(${c},${0.5 * (1 - k)})`; ctx.fillRect(x + 4 + k * 26, y - 3 - k * 10, 4, 4); }
  }

  drawBrokenButtons() {
    BTN.forEach((bt, i) => {
      if (!this.isBroken(i)) {
        if (i === 3 && this.mercyBack) { ctx.strokeStyle = `rgba(255,255,120,${0.5 + Math.sin(this.t * 6) * 0.4})`; ctx.lineWidth = 3; ctx.strokeRect(bt.x - 2, BTN_Y - 2, BTN_W + 4, BTN_H + 4); }
        return;
      }
      const sx = this.btnShake > 0 && i === this.btn ? Math.sin(this.t * 80) * 5 : 0, x = bt.x + sx;
      ctx.fillStyle = '#000'; ctx.fillRect(x - 2, BTN_Y - 2, BTN_W + 4, BTN_H + 4);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.strokeRect(x + 2, BTN_Y + 2, BTN_W - 4, BTN_H - 4); ctx.setLineDash([]);
      ctx.save(); ctx.translate(x + 66, BTN_Y + 23); ctx.rotate(-0.12); text(bt.label, 6, -16, 32, '#4a4a4a', 'center'); ctx.restore();
      ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(x + 30, BTN_Y + 2); ctx.lineTo(x + 52, BTN_Y + 20); ctx.lineTo(x + 44, BTN_Y + 30); ctx.lineTo(x + 70, BTN_Y + 44);
      ctx.moveTo(x + 52, BTN_Y + 20); ctx.lineTo(x + 96, BTN_Y + 14); ctx.lineTo(x + 120, BTN_Y + 28);
      ctx.stroke();
    });
  }

  drawStats() {
    super.drawStats();
    if (this.kr <= 0) return;
    const y = 394, w = G.maxhp * 2.4, hp = Math.max(0, G.hp);
    ctx.fillStyle = '#ff2aff'; ctx.fillRect(286 + w * (hp - this.kr) / G.maxhp, y + 4, w * this.kr / G.maxhp, 20);
    text('KR', 286 + w + 6, y - 18, 20, '#ff2aff');
  }
}
BATTLE_CLASSES.mestre = MasterBattle;

// ---------- canhões de caveira ----------
function m9Blaster(B, x, y, ang, o = {}) {
  const warn = o.warn ?? 0.75, fire = o.fire ?? 0.4, w = o.w ?? 30;
  const sx = x - Math.cos(ang) * 160, sy = y - Math.sin(ang) * 160;
  B.bullets.push({
    kind: 'blaster', x, y, sx, sy, ang, warn, fire, w, vx: 0, vy: 0, life: warn + fire + 0.35,
    hitFn(b, s) {
      if (b.t < b.warn || b.t > b.warn + b.fire) return false;
      const dx = s.x - b.x, dy = s.y - b.y, c = Math.cos(b.ang), n = Math.sin(b.ang);
      if (dx * c + dy * n < 12) return false;
      return Math.abs(-dx * n + dy * c) < b.w / 2 + 2;
    },
  });
  Sfx.blasterCharge();
}
function m9AimBlaster(B, r = 170, o) {
  const s = B.soul, a = Math.random() * Math.PI * 2;
  const x = Math.max(30, Math.min(610, s.x + Math.cos(a) * r)), y = Math.max(40, Math.min(450, s.y + Math.sin(a) * r * 0.8));
  m9Blaster(B, x, y, Math.atan2(s.y - y, s.x - x), o);
}
function drawBlaster(b) {
  const t = b.t || 0, k = Math.min(1, t / 0.3), e = 1 - (1 - k) * (1 - k);
  const x = b.sx + (b.x - b.sx) * e, y = b.sy + (b.y - b.sy) * e;
  const firing = t >= b.warn, end = b.warn + b.fire;
  ctx.save(); ctx.translate(x, y); ctx.rotate(b.ang);
  if (firing && t < end + 0.3) {
    const fade = t > end ? Math.max(0, 1 - (t - end) / 0.3) : 1, w = b.w * fade * (0.9 + Math.sin(t * 60) * 0.1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(28, -w / 2, 1000, w);
    ctx.fillStyle = 'rgba(160,240,255,0.6)'; ctx.fillRect(20, -w / 2 - 4, 1000, 4); ctx.fillRect(20, w / 2, 1000, 4);
  } else if (!firing && t > 0.3) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.sin(t * 40) * 0.1})`; ctx.fillRect(20, -1, 1000, 2);
  }
  const img = BOSS9_SPR.blaster[firing ? 1 : 0], sc = 3.4 + (firing ? 0.4 : 0);
  ctx.drawImage(img, -img.width * sc / 2, -img.height * sc / 2, img.width * sc, img.height * sc);
  ctx.restore();
}

// ---------- ossos ----------
function m9Bone(B, x, y, h, vx, color, vy = 0) { B.bullets.push({ kind: 'mbone', x, y, w: 8, h, vx, vy, color }); }
function m9BoneH(B, x, y, w, vx, vy, color) { B.bullets.push({ kind: 'mbone', x, y, w, h: 8, vx, vy, color }); }
const M9_COLORS = { blue: '#3ab8ff', orange: '#ff9a1a' };

Object.assign(BULLET_DRAW, {
  blaster() {},
  mbone(b) {
    const c = M9_COLORS[b.color] || '#ffffff', hz = b.w > b.h;
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - b.w / 2 - 1, b.y - b.h / 2 - 1, b.w + 2, b.h + 2);
    ctx.fillStyle = c;
    if (hz) { ctx.fillRect(b.x - b.w / 2 + 2, b.y - 2, b.w - 4, 4); ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, 4, b.h); ctx.fillRect(b.x + b.w / 2 - 4, b.y - b.h / 2, 4, b.h); }
    else { ctx.fillRect(b.x - 2, b.y - b.h / 2 + 2, 4, b.h - 4); ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, 4); ctx.fillRect(b.x - b.w / 2, b.y + b.h / 2 - 4, b.w, 4); }
  },
  spikes(b, t) {
    if (b.t < b.warn) { ctx.fillStyle = `rgba(255,60,60,${0.4 + Math.sin(t * 40) * 0.3})`; ctx.fillRect(b.x - b.w / 2, b.y + b.h / 2 - 4, b.w, 4); return; }
    ctx.fillStyle = '#fff';
    for (let x = b.x - b.w / 2; x < b.x + b.w / 2; x += 10) { ctx.beginPath(); ctx.moveTo(x, b.y + b.h / 2); ctx.lineTo(x + 5, b.y - b.h / 2); ctx.lineTo(x + 10, b.y + b.h / 2); ctx.fill(); }
  },
});

const bt9 = B => B.boxTarget;
Object.assign(PATTERNS, {
  mSurprise: {
    len: 5,
    update(B, dt) {
      const S = B.pState, bx = bt9(B);
      if (!S.a) { S.a = 1; for (const [x, y] of [[60, 200], [580, 200], [60, 450], [580, 450]]) m9Blaster(B, x, y, Math.atan2(316 - y, 320 - x), { warn: 0.9 }); }
      if (B.pt > 1.6 && !S.b) { S.b = 1; for (let i = 0; i < 6; i++) { const h = 40 + (i % 3) * 18; m9Bone(B, bx.x - 20 - i * 70, bx.y + bx.h - h / 2, h, 200, null); m9Bone(B, bx.x + bx.w + 20 + i * 70, bx.y + h / 2, h, -200, null); } }
      if (B.pt > 3 && !S.c) { S.c = 1; m9Blaster(B, 40, B.soul.y, 0, { warn: 0.7 }); m9Blaster(B, 600, B.soul.y - 40, Math.PI, { warn: 0.9 }); }
    },
  },
  mBoneGap: {
    len: 7,
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT > 0) return;
      B.spawnT = 0.55;
      const bx = bt9(B), gap = 46, gy = bx.y + 24 + Math.random() * (bx.h - 48), left = (B.pState.n = (B.pState.n || 0) + 1) % 2;
      const x = left ? bx.x - 10 : bx.x + bx.w + 10, v = left ? 175 : -175;
      const h1 = gy - gap / 2 - bx.y, h2 = bx.y + bx.h - (gy + gap / 2);
      if (h1 > 4) m9Bone(B, x, bx.y + h1 / 2, h1, v);
      if (h2 > 4) m9Bone(B, x, bx.y + bx.h - h2 / 2, h2, v);
    },
  },
  mBlasters: {
    len: 7,
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT > 0) return;
      B.spawnT = B.phase === 1 ? 0.95 : 0.7;
      m9AimBlaster(B, 170, { warn: B.phase === 1 ? 0.8 : 0.65 });
    },
  },
  mBlue: {
    len: 7.5, blue: true,
    update(B, dt) {
      const S = B.pState, bx = bt9(B);
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.8;
        const left = (S.n = (S.n || 0) + 1) % 2, h = 18 + Math.random() * 16;
        m9Bone(B, left ? bx.x - 10 : bx.x + bx.w + 10, bx.y + bx.h - h / 2, h, left ? 150 : -150);
      }
      if (B.pt > 3.2 && !S.slam) {
        S.slam = 1; B.soul.vy = 900; Sfx.slam(); B.shakeT = 0.25;
        B.bullets.push({ kind: 'spikes', x: bx.x + bx.w / 2, y: bx.y + bx.h - 11, w: bx.w, h: 22, vx: 0, vy: 0, warn: 0.6, life: 1.1 });
      }
    },
  },
  mBlueOrange: {
    len: 7,
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT > 0) return;
      B.spawnT = 0.62;
      const bx = bt9(B), n = (B.pState.n = (B.pState.n || 0) + 1), left = Math.floor(n / 3) % 2;
      m9Bone(B, left ? bx.x - 10 : bx.x + bx.w + 10, bx.y + bx.h / 2, bx.h, left ? 140 : -140, n % 2 ? 'blue' : 'orange');
    },
  },
  mFlip: {
    len: 7,
    update(B, dt) {
      const S = B.pState;
      if (!S.f) { S.f = 1; B.flip = true; Sfx.slam(); B.shakeT = 0.3; }
      PATTERNS.mBoneGap.update(B, dt);
      S.bl = (S.bl ?? 1.2) - dt;
      if (S.bl <= 0) { S.bl = 1.4; m9AimBlaster(B, 170, { warn: 0.75 }); }
    },
  },
  mCage: {
    len: 7,
    update(B, dt) {
      const S = B.pState;
      if (!S.c) { S.c = 1; B.boxTarget = { x: 320 - 65, y: 252, w: 130, h: 130 }; }
      const bx = bt9(B);
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.5;
        const side = (S.n = (S.n || 0) + 1) % 4, off = (Math.random() - 0.5) * 50;
        if (side === 0) m9BoneH(B, bx.x + bx.w / 2 + off, bx.y - 10, bx.w * 0.55, 0, 130);
        else if (side === 1) m9BoneH(B, bx.x + bx.w / 2 + off, bx.y + bx.h + 10, bx.w * 0.55, 0, -130);
        else if (side === 2) m9Bone(B, bx.x - 10, bx.y + bx.h / 2 + off, bx.h * 0.55, 130);
        else m9Bone(B, bx.x + bx.w + 10, bx.y + bx.h / 2 + off, bx.h * 0.55, -130);
      }
      S.bl = (S.bl ?? 2) - dt;
      if (S.bl <= 0) { S.bl = 2.2; const v = Math.random() < 0.5; m9Blaster(B, v ? B.soul.x : 70, v ? 150 : B.soul.y, v ? Math.PI / 2 : 0, { warn: 0.8, w: 26 }); }
    },
  },
  mBlueBlasters: {
    len: 7.5, blue: true,
    update(B, dt) {
      const bx = bt9(B);
      B.spawnT -= dt;
      if (B.spawnT > 0) return;
      B.spawnT = 1.1;
      const low = (B.pState.n = (B.pState.n || 0) + 1) % 2, right = Math.random() < 0.5;
      const y = low ? bx.y + bx.h - 14 : bx.y + bx.h - 60;
      m9Blaster(B, right ? 600 : 40, y, right ? Math.PI : 0, { warn: 0.7, w: low ? 22 : 40 });
    },
  },
  mStorm: {
    len: 8,
    update(B, dt) {
      const S = B.pState;
      if (!S.c) { S.c = 1; B.boxTarget = { x: 320 - 150, y: 236, w: 300, h: 160 }; }
      const bx = bt9(B);
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.75;
        const y = B.soul.y + (Math.random() - 0.5) * 30;
        m9Blaster(B, 30, y, 0, { warn: 0.7, w: 24 }); m9Blaster(B, 610, y + (Math.random() < 0.5 ? -50 : 50), Math.PI, { warn: 0.8, w: 24 });
      }
      S.r = (S.r ?? 0.3) - dt;
      if (S.r <= 0) { S.r = 0.28; m9Bone(B, bx.x + 10 + Math.random() * (bx.w - 20), bx.y - 14, 22, 0, null, 190); }
    },
  },
  mFinal: {
    len: 17,
    update(B, dt) {
      const S = B.pState, t = B.pt, bx = bt9(B), cx = 320, cy = 316;
      // 0-3s: anel de canhões em volta da caixa
      if (t < 3) {
        S.r = (S.r ?? 0) - dt;
        if (S.r <= 0) { S.r = 0.32; const a = (S.k = (S.k || 0) + 1) * 0.78; m9Blaster(B, cx + Math.cos(a) * 170, cy + Math.sin(a) * 140, a + Math.PI, { warn: 0.7, w: 26 }); }
      }
      // 3-6.5s: alma azul, batida no chão e espinhos
      else if (t < 6.5) {
        if (!S.blue) { S.blue = 1; B.soulMode = 'blue'; B.soul.vy = 900; Sfx.slam(); B.shakeT = 0.3; }
        S.sp = (S.sp ?? 0.4) - dt;
        if (S.sp <= 0) { S.sp = 1.2; B.bullets.push({ kind: 'spikes', x: bx.x + bx.w / 2, y: bx.y + bx.h - 11, w: bx.w, h: 22, vx: 0, vy: 0, warn: 0.55, life: 1.0 }); }
        S.bo = (S.bo ?? 0.6) - dt;
        if (S.bo <= 0) { S.bo = 0.9; const l = Math.random() < 0.5; m9Bone(B, l ? bx.x - 10 : bx.x + bx.w + 10, bx.y + bx.h - 60, 16, l ? 160 : -160); }
      }
      // 6.5-10.5s: tela virando e ossos com buraco
      else if (t < 10.5) {
        if (!S.red) { S.red = 1; B.soulMode = 'red'; }
        S.fl = (S.fl ?? 0) - dt;
        if (S.fl <= 0) { S.fl = 1.4; B.flip = !B.flip; Sfx.slam(); B.shakeT = 0.2; }
        PATTERNS.mBoneGap.update(B, dt);
      }
      // 10.5-14.5s: tempestade de canhões mirando em você
      else if (t < 14.5) {
        if (!S.unf) { S.unf = 1; B.flip = false; }
        S.st = (S.st ?? 0) - dt;
        if (S.st <= 0) { S.st = 0.42; m9AimBlaster(B, 180, { warn: 0.6, w: 26 }); }
      }
      // fim: um último canhão enorme no meio (dá pra desviar pelos cantos)
      else if (!S.big) { S.big = 1; m9Blaster(B, 320, 150, Math.PI / 2, { warn: 1.0, fire: 0.6, w: 70 }); }
    },
  },
});
