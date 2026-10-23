// Sistema de batalha estilo Undertale: LUTAR / AGIR / ITEM / POUPAR + fase de desvio da ALMA.
'use strict';

const ENEMIES = {
  dummy: {
    name: 'Boneco', spr: 'dummy', scale: 6, hp: 15, atk: 0, def: 0, xp: 0, gold: 0, voice: 'narr',
    intro: '* O Boneco de treino bloqueia o caminho!',
    check: '* BONECO - ATK 0 DEF 0\n* Um boneco de pano. Paciência infinita.',
    acts: {
      'Conversar': { text: ['* Você conversa com o Boneco.', '* Ele não responde... mas parece feliz.'], mercy: 100 },
    },
    flavor: ['* O Boneco te encara sem olhos.', '* O Boneco está parado. Muito parado.', '* Cheira a pano velho.'],
    talk: ['...'], patterns: [],
  },
  musgolho: {
    name: 'Musgolho', spr: 'musgolho', scale: 6, hp: 24, atk: 3, def: 1, xp: 8, gold: 5, voice: 'musg',
    intro: '* Musgolho rola até você!',
    check: '* MUSGOLHO - ATK 3 DEF 1\n* Um olho que mora no musgo.\n* Só quer ser notado.',
    acts: {
      'Elogiar': { text: ['* Você elogia o olhar de Musgolho.', '* Musgolho pisca, envergonhado.'], mercy: 50 },
      'Regar': { text: ['* Você joga um pouco de água em Musgolho.', '* Ele fica mais verdinho e feliz!'], mercy: 60 },
      'Encarar': { text: ['* Você encara Musgolho.', '* Ele encara de volta. Ninguém pisca.', '* ...Musgolho ficou irritado!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* Musgolho está de olho em você.', '* Cheira a chuva e terra molhada.', '* Musgolho tenta parecer assustador.'],
    talk: ['Glub glub.', 'Tô de olho em você!', '*pisca*', 'Musgo é vida.'],
    spareTalk: 'Valeu... glub!',
    patterns: ['spores', 'vines'],
  },
  fantasminha: {
    name: 'Fantasminha', spr: 'fantasminha', scale: 6, hp: 20, atk: 2, def: 0, xp: 7, gold: 6, voice: 'ghost',
    intro: '* Fantasminha aparece... chorando?',
    check: '* FANTASMINHA - ATK 2 DEF 0\n* Um fantasma tímido.\n* Chora quando fica nervoso.',
    acts: {
      'Consolar': { text: ['* Você diz que vai ficar tudo bem.', '* Fantasminha funga... e sorri um pouquinho.'], mercy: 50 },
      'Piada': { text: ['* Você conta uma piada sobre lençóis.', '* Fantasminha ri tanto que fica transparente!'], mercy: 60 },
      'Assustar': { text: ['* Você faz "BUU!"', '* Fantasminha chora mais forte!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* Fantasminha flutua tristemente.', '* Um frio passa pelas suas costas.', '* Fantasminha enxuga as lágrimas.'],
    talk: ['snif... snif...', 'Não olha pra mim!', 'buu... hu hu.', 'Eu sou assustador?'],
    spareTalk: 'Você é legal... snif.',
    patterns: ['tears', 'orbs'],
  },
};

const BTN = [
  { label: 'LUTAR', x: 22, icon: 'fight' },
  { label: 'AGIR', x: 177, icon: 'act' },
  { label: 'ITEM', x: 332, icon: 'item' },
  { label: 'POUPAR', x: 487, icon: 'mercy' },
];
const BTN_Y = 422, BTN_W = 131, BTN_H = 46;
const BOX_FULL = { x: 32, y: 250, w: 576, h: 140 };

class Battle {
  constructor(key, opts = {}) {
    const def = ENEMIES[key];
    this.key = key;
    this.e = { ...def, hpNow: def.hp, mercy: 0, atkNow: def.atk, shake: 0, alpha: 1 };
    this.opts = opts; // {tutorial, withInstr, onEnd}
    this.state = 'start';
    this.btn = 0; this.sel = 0;
    this.box = { ...BOX_FULL }; this.boxTarget = { ...BOX_FULL };
    this.typer = null; this.textQueue = []; this.textDone = null;
    this.bullets = []; this.soul = { x: 320, y: 320, inv: 0 };
    this.t = 0; this.turn = 0; this.dmgPop = null; this.particles = [];
    this.bubble = null; this.instrCast = null; this.instrHealUsed = false;
    this.practiceDone = false; this.magicCd = 0;
    this.flavorTyper = new Typer(def.intro, 'narr', 520, 32);
    Sfx.playMusic('battle');
    this.introT = 0;
  }

  // ---------- utilidades ----------
  say(items, then) {
    this.textQueue = items.map(it => typeof it === 'string' ? { t: it } : it);
    this.textDone = then; this.state = 'text'; this.nextText();
  }
  nextText() {
    const it = this.textQueue.shift();
    if (!it) { this.typer = null; const d = this.textDone; this.textDone = null; d && d(); return; }
    this.typerWho = it.who;
    this.typer = new Typer(it.t, it.who === 'instr' ? 'instr' : 'narr', it.who === 'instr' ? 420 : 530, 32);
  }
  toMenu() {
    this.state = 'menu';
    this.boxTarget = { ...BOX_FULL };
    const fl = this.e.mercy >= 100 ? `* ${this.e.name} não quer mais lutar.` : this.e.flavor[(Math.random() * this.e.flavor.length) | 0];
    this.flavorTyper = new Typer(fl, 'narr', 520, 32);
  }
  get spareable() { return this.e.mercy >= 100; }

  actList() {
    const list = [{ name: 'Checar', kind: 'check' }];
    for (const n of Object.keys(this.e.acts)) list.push({ name: n, kind: 'act' });
    if (this.opts.withInstr) {
      list.push({ name: 'Instr: Magia', kind: 'magic', disabled: this.magicCd > 0 });
      list.push({ name: 'Instr: Acalmar', kind: 'calm' });
    }
    return list;
  }

  // ---------- atualização ----------
  update(dt) {
    this.t += dt;
    const lerp = (a, b) => a + (b - a) * Math.min(1, dt * 10);
    for (const k of ['x', 'y', 'w', 'h']) this.box[k] = lerp(this.box[k], this.boxTarget[k]);
    if (this.e.shake > 0) this.e.shake -= dt;
    if (this.dmgPop) { this.dmgPop.t += dt; }
    this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 20 * dt; p.life -= dt; });
    this.particles = this.particles.filter(p => p.life > 0);
    if (this.instrCast) {
      this.instrCast.t += dt;
    }
    const fn = this['st_' + this.state];
    fn && fn.call(this, dt);
  }

  st_start(dt) {
    this.introT += dt;
    if (this.introT > 0.4) {
      if (this.opts.tutorial) {
        this.say([
          { who: 'instr', t: 'Esta é uma BATALHA. Não tenha medo!' },
          { who: 'instr', t: 'LUTAR ataca. AGIR interage. ITEM usa itens. POUPAR tem piedade.' },
          { who: 'instr', t: 'Toque num botão ou use as setas e o botão A. Tente!' },
        ], () => this.toMenu());
      } else if (this.opts.withInstr && !G.flags.instrBattleTip) {
        G.flags.instrBattleTip = true;
        this.say([
          { who: 'instr', t: 'Estou com você! Em AGIR você pode me chamar.' },
          { who: 'instr', t: 'Eu solto MAGIA para atacar, ou ACALMO o monstro para você poupar.' },
        ], () => this.toMenu());
      } else this.toMenu();
    }
  }

  st_text(dt) {
    if (!this.typer) return;
    this.typer.update(dt);
    if (Input.isPressed('a') || Input.tap) {
      if (this.typer.done) { Sfx.move(); this.nextText(); } else this.typer.skip();
    } else if (Input.isPressed('b')) this.typer.skip();
  }

  st_menu(dt) {
    this.flavorTyper.update(dt);
    // ajuda do Instrutor quando o HP está baixo
    if (this.opts.withInstr && !this.instrHealUsed && G.hp <= Math.ceil(G.maxhp * 0.3)) {
      this.instrHealUsed = true;
      G.hp = Math.min(G.maxhp, G.hp + 10); Sfx.heal();
      this.say([{ who: 'instr', t: 'Você está ferido! Deixa eu ajudar...' }, '* O Instrutor te curou 10 HP.'], () => this.toMenu());
      return;
    }
    if (Input.isPressed('left')) { this.btn = (this.btn + 3) % 4; Sfx.move(); }
    if (Input.isPressed('right')) { this.btn = (this.btn + 1) % 4; Sfx.move(); }
    let choose = Input.isPressed('a');
    if (Input.tap) {
      const i = BTN.findIndex(b => hit(Input.tap, b.x, BTN_Y, BTN_W, BTN_H));
      if (i >= 0) { this.btn = i; choose = true; }
    }
    if (!choose) return;
    Sfx.select(); this.sel = 0;
    if (this.btn === 0) this.startFight();
    else if (this.btn === 1) this.state = 'actMenu';
    else if (this.btn === 2) {
      if (!G.items.length) { Sfx.back(); return; }
      this.state = 'itemMenu';
    } else this.state = 'mercyMenu';
  }

  // Lista de opções genérica na caixa (2 colunas)
  listInput(n, cols = 2) {
    if (Input.isPressed('b')) { Sfx.back(); this.state = 'menu'; return -2; }
    const s = this.sel;
    if (Input.isPressed('right') && s % cols < cols - 1 && s + 1 < n) this.sel++;
    if (Input.isPressed('left') && s % cols > 0) this.sel--;
    if (Input.isPressed('down') && s + cols < n) this.sel += cols;
    if (Input.isPressed('up') && s - cols >= 0) this.sel -= cols;
    if (s !== this.sel) Sfx.move();
    if (Input.tap) {
      for (let i = 0; i < n; i++) {
        const r = this.optRect(i, cols);
        if (hit(Input.tap, r.x, r.y, r.w, r.h)) { this.sel = i; return i; }
      }
      const b = BTN.findIndex(bb => hit(Input.tap, bb.x, BTN_Y, BTN_W, BTN_H));
      if (b >= 0 && b !== this.btn) { Sfx.back(); this.btn = b; this.state = 'menu'; return -2; }
    }
    if (Input.isPressed('a')) return this.sel;
    return -1;
  }
  optRect(i, cols = 2) {
    const cw = cols === 1 ? 520 : 270;
    return { x: 60 + (i % cols) * cw, y: 268 + Math.floor(i / cols) * 36, w: cw - 10, h: 34 };
  }

  st_actMenu() {
    const list = this.actList();
    const i = this.listInput(list.length);
    if (i < 0) return;
    const a = list[i];
    if (a.disabled) { Sfx.back(); return; }
    Sfx.select();
    if (a.kind === 'check') this.say([this.e.check], () => this.afterPlayer());
    else if (a.kind === 'act') {
      const act = this.e.acts[a.name];
      this.e.mercy = Math.max(0, Math.min(100, this.e.mercy + act.mercy));
      if (act.atkUp) this.e.atkNow += act.atkUp;
      const t = act.text.slice();
      if (this.spareable) t.push(`* ${this.e.name} não quer mais lutar.`);
      this.say(t, () => this.afterPlayer());
    } else if (a.kind === 'magic') {
      this.magicCd = 2;
      this.instrCast = { t: 0 };
      Sfx.magic();
      this.say([{ who: 'instr', t: 'Lá vai! ESTRELA ARCANA!' }], () => {
        const dmg = 9 + ((Math.random() * 5) | 0);
        this.instrCast = null;
        this.dealDamage(dmg, () => this.afterPlayer());
      });
    } else if (a.kind === 'calm') {
      this.e.mercy = Math.min(100, this.e.mercy + 50);
      Sfx.spare();
      const t = [{ who: 'instr', t: 'Calma, calma... ninguém precisa se machucar.' }, `* O Instrutor acalmou ${this.e.name}.`];
      if (this.spareable) t.push(`* ${this.e.name} não quer mais lutar.`);
      this.say(t, () => this.afterPlayer());
    }
  }

  st_itemMenu() {
    const i = this.listInput(G.items.length);
    if (i < 0) return;
    Sfx.select();
    const msg = useItem(i);
    this.say([msg], () => this.afterPlayer());
  }

  st_mercyMenu() {
    const opts = this.opts.tutorial ? ['Poupar'] : ['Poupar', 'Fugir'];
    const i = this.listInput(opts.length, 1);
    if (i < 0) return;
    Sfx.select();
    if (i === 0) {
      if (this.spareable) return this.doSpare();
      this.say([`* Você tentou poupar ${this.e.name}...`, '* Mas ele ainda quer lutar.'], () => this.afterPlayer());
    } else {
      if (Math.random() < 0.6) {
        this.say(['* Você fugiu... com as pernas tremendo.'], () => this.end('fled'));
      } else this.say(['* Você tentou fugir, mas tropeçou!'], () => this.afterPlayer());
    }
  }

  doSpare() {
    Sfx.spare();
    this.e.alpha = 0.45; this.spared = true;
    G.spares++;
    const gold = this.e.gold; G.gold += gold;
    const items = [];
    if (this.e.spareTalk) { this.bubble = { t: this.e.spareTalk, life: 99 }; }
    items.push(`* VOCÊ VENCEU!\n* Você ganhou 0 EXP e ${gold} OURO.`);
    this.say(items, () => this.end('spared'));
  }

  // ---------- LUTAR: barra de mira ----------
  startFight() {
    this.state = 'fightBar';
    this.bar = { x: 40, speed: 560, stopped: false, t: 0 };
  }
  st_fightBar(dt) {
    const b = this.bar;
    if (b.stopped) {
      b.t += dt;
      if (b.t > 0.55 && !b.dealt) {
        b.dealt = true;
        this.dealDamage(b.dmg, () => this.afterPlayer());
      }
      return;
    }
    b.x += b.speed * dt;
    if (Input.isPressed('a') || Input.tap) {
      b.stopped = true;
      const dist = Math.abs(b.x - 320) / 280;
      const mult = dist < 0.04 ? 2.2 : Math.max(0.3, 2 * (1 - dist));
      b.dmg = Math.max(1, Math.round((playerAtk() - this.e.def) * mult * (0.9 + Math.random() * 0.2)));
      Sfx.slash();
      this.slash = { t: 0 };
    } else if (b.x > 610) {
      b.stopped = true; b.dmg = 0; b.dealt = true; this.bar = null;
      this.say(['* ERROU!'], () => this.afterPlayer());
    }
  }

  dealDamage(dmg, then) {
    this.state = 'damage';
    this.e.hpNow = Math.max(0, this.e.hpNow - dmg);
    this.e.shake = 0.5; Sfx.hit();
    this.dmgPop = { v: dmg, t: 0 };
    this.afterDamage = then;
    this.damageT = 0;
  }
  st_damage(dt) {
    this.damageT += dt;
    if (this.damageT < 1.1) return;
    this.dmgPop = null; this.slash = null; this.bar = null;
    if (this.e.hpNow <= 0) return this.doKill();
    const t = this.afterDamage; this.afterDamage = null; t && t();
  }

  doKill() {
    this.state = 'dying';
    Sfx.dust();
    this.makeDust();
    this.e.alpha = 0;
    this.dyingT = 0;
  }
  st_dying(dt) {
    this.dyingT += dt;
    if (this.dyingT < 1.3) return;
    G.kills++;
    const xp = this.e.xp, gold = this.e.gold;
    G.gold += gold;
    const up = addXp(xp);
    const t = [`* VOCÊ VENCEU!\n* Você ganhou ${xp} EXP e ${gold} OURO.`];
    if (up) { Sfx.levelUp(); t.push('* Seu LV aumentou.'); }
    this.say(t, () => this.end('killed'));
  }

  makeDust() {
    const img = SPR[this.e.spr]; const g = img.getContext('2d');
    const d = g.getImageData(0, 0, img.width, img.height).data;
    const sc = this.e.scale, ox = 320 - img.width * sc / 2, oy = this.enemyY();
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      if (d[(y * img.width + x) * 4 + 3] < 10) continue;
      if ((x + y) % 2) continue;
      this.particles.push({
        x: ox + x * sc, y: oy + y * sc, vx: (Math.random() - 0.3) * 40, vy: -20 - Math.random() * 40,
        life: 0.4 + y / img.height * 1.0 + Math.random() * 0.3, c: `rgb(${d[(y * img.width + x) * 4]},${d[(y * img.width + x) * 4 + 1]},${d[(y * img.width + x) * 4 + 2]})`,
      });
    }
  }

  afterPlayer() {
    if (this.magicCd > 0) this.magicCd--;
    this.turn++;
    if (this.opts.tutorial && !this.practiceDone) {
      this.practiceDone = true;
      this.say([
        { who: 'instr', t: 'Muito bem! Agora a parte importante: DESVIAR.' },
        { who: 'instr', t: 'Vou jogar estrelas bem fraquinhas. Arraste o dedo na tela para mover sua ALMA!' },
      ], () => this.startEnemyTurn('stars'));
      return;
    }
    if (!this.e.patterns.length) {
      this.say([this.opts.tutorial ? { who: 'instr', t: 'O Boneco não ataca. Termine: LUTE ou POUPE.' } : '* Nada acontece.'], () => this.toMenu());
      return;
    }
    const p = this.e.patterns[this.turn % this.e.patterns.length];
    this.startEnemyTurn(p);
  }

  // ---------- TURNO DO INIMIGO ----------
  startEnemyTurn(pattern) {
    this.state = 'enemyTurn';
    this.boxTarget = { x: 320 - 105, y: 236, w: 210, h: 160 };
    this.soul.x = 320; this.soul.y = 316; this.soul.inv = 0;
    this.bullets = [];
    this.pattern = PATTERNS[pattern];
    this.pt = 0; this.spawnT = 0; this.patternName = pattern;
    this.turnLen = pattern === 'stars' ? 6 : 5.5;
    const talk = pattern === 'stars' ? null : this.e.talk[(Math.random() * this.e.talk.length) | 0];
    this.bubble = talk ? { t: talk, life: 1.6 } : null;
    this.pState = {};
  }
  st_enemyTurn(dt) {
    if (this.bubble) { this.bubble.life -= dt; if (this.bubble.life <= 0) this.bubble = null; }
    // movimento da alma
    const s = this.soul, sp = 150;
    if (Input.held.left) s.x -= sp * dt;
    if (Input.held.right) s.x += sp * dt;
    if (Input.held.up) s.y -= sp * dt;
    if (Input.held.down) s.y += sp * dt;
    if (Input.drag.active) { s.x += Input.drag.dx * 1.1; s.y += Input.drag.dy * 1.1; }
    const bx = this.box;
    s.x = Math.max(bx.x + 13, Math.min(bx.x + bx.w - 13, s.x));
    s.y = Math.max(bx.y + 12, Math.min(bx.y + bx.h - 12, s.y));
    if (s.inv > 0) s.inv -= dt;

    if (this.bubble && this.pt === 0 && this.bubble.life > 0.9) return; // deixa a fala aparecer
    this.pt += dt;
    if (this.pt < this.turnLen - 0.6) this.pattern.update(this, dt);
    for (const b of this.bullets) {
      b.t = (b.t || 0) + dt;
      if (b.home) {
        if (b.t < b.home) {
          const a = Math.atan2(s.y - b.y, s.x - b.x);
          b.vx += Math.cos(a) * 160 * dt; b.vy += Math.sin(a) * 160 * dt;
          const v = Math.hypot(b.vx, b.vy), mx = 90;
          if (v > mx) { b.vx *= mx / v; b.vy *= mx / v; }
        }
      }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.sway) b.x += Math.sin(b.t * 5 + b.ph) * b.sway * dt;
      if (s.inv <= 0 && Math.hypot(b.x - s.x, b.y - s.y) < b.r + 5) {
        this.hurt(b.dmg ?? this.e.atkNow);
        if (b.pop) b.dead = true;
      }
      if (b.y > 520 || b.y < -40 || b.x < -40 || b.x > 680) b.dead = true;
    }
    this.bullets = this.bullets.filter(b => !b.dead);
    if (this.pt >= this.turnLen) {
      this.bullets = [];
      if (G.hp <= 0) return;
      if (this.patternName === 'stars') {
        this.say([{ who: 'instr', t: 'Ótimo! Você é rápido!' }, { who: 'instr', t: 'Agora termine com o Boneco: LUTE ou POUPE.' }], () => this.toMenu());
      } else this.toMenu();
    }
  }
  hurt(dmg) {
    dmg = Math.max(1, dmg - playerDef());
    if (this.opts.tutorial) G.hp = Math.max(1, G.hp - dmg);
    else G.hp = Math.max(0, G.hp - dmg);
    this.soul.inv = 1.2; Sfx.hurt();
    this.hurtFlash = 0.15;
    if (G.hp <= 0) this.end('dead');
  }

  end(result) {
    if (this.ended) return;
    this.ended = true;
    this.state = 'over';
    if (G.hp <= 0) Sfx.breakHeart();
    this.opts.onEnd && this.opts.onEnd(result, this);
  }

  enemyY() { return 128 - SPR[this.e.spr].height * this.e.scale / 2 + 10; }

  // ---------- DESENHO ----------
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // grade de fundo
    ctx.strokeStyle = '#123a1e'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) ctx.strokeRect(14 + i * 210, 14, 196, 200);

    // inimigo
    const img = SPR[this.e.spr], sc = this.e.scale;
    let ex = 320 - img.width * sc / 2, ey = this.enemyY();
    if (this.e.spr === 'fantasminha') ey += Math.sin(this.t * 2) * 6;
    if (this.e.spr === 'musgolho') ey += Math.abs(Math.sin(this.t * 3)) * -6;
    if (this.e.shake > 0) ex += Math.sin(this.e.shake * 60) * 10 * this.e.shake;
    if (this.e.alpha > 0) {
      ctx.globalAlpha = this.e.alpha * (this.e.spr === 'fantasminha' ? 0.9 : 1);
      ctx.drawImage(img, ex, ey, img.width * sc, img.height * sc);
      ctx.globalAlpha = 1;
    }
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, sc, sc);
    }
    ctx.globalAlpha = 1;

    // Instrutor ao lado
    if (this.opts.withInstr || this.opts.tutorial) {
      const ix = 60, iy = 70 + Math.sin(this.t * 1.5) * 3;
      drawSpr(SPR.instr.right[0], ix, iy, 4);
      if (this.instrCast) {
        const k = Math.min(1, this.instrCast.t / 0.8);
        const sx = ix + 80 + (320 - ix - 80) * k, sy = iy + 20 + (ey + 60 - iy - 20) * k - Math.sin(k * Math.PI) * 60;
        drawStar(sx, sy, 14, this.t * 8, '#ffe680');
      }
    }

    // golpe
    if (this.slash && this.slash.t !== undefined) {
      this.slash.t += 1 / 60;
      const k = Math.min(1, this.slash.t / 0.35);
      ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(250, ey + 10); ctx.lineTo(250 + 140 * k, ey + 10 + 140 * k); ctx.stroke();
    }
    // dano
    if (this.dmgPop) {
      const k = this.dmgPop.t;
      const y = ey - 10 - Math.max(0, Math.sin(Math.min(k, 0.5) * Math.PI * 2) * 20);
      text(String(this.dmgPop.v), 320, y, 28, '#ff3b3b', 'center', FONT_TITLE);
      // barra de vida do inimigo
      const bw = 200, fr = this.e.hpNow / this.e.hp;
      ctx.fillStyle = '#404040'; ctx.fillRect(220, ey + img.height * sc + 6, bw, 14);
      ctx.fillStyle = '#3ce64b'; ctx.fillRect(220, ey + img.height * sc + 6, bw * fr, 14);
    }
    // balão de fala
    if (this.bubble && this.e.alpha > 0.1) {
      const bx = 320 + img.width * sc / 2 + 10, by = ey + 10;
      const lines = wrapText(this.bubble.t, 140, 26);
      const bh = 16 + lines.length * 26;
      ctx.fillStyle = '#fff'; ctx.fillRect(bx, by, 160, bh);
      ctx.beginPath(); ctx.moveTo(bx, by + 18); ctx.lineTo(bx - 14, by + 26); ctx.lineTo(bx, by + 32); ctx.fill();
      lines.forEach((l, i) => text(l, bx + 10, by + 8 + i * 26, 26, '#000'));
    }

    // caixa
    const b = this.box;
    frameBox(b.x, b.y, b.w, b.h, 5);

    ctx.save();
    ctx.beginPath(); ctx.rect(b.x + 5, b.y + 5, b.w - 10, b.h - 10); ctx.clip();
    this.drawBoxContent();
    ctx.restore();

    // status
    this.drawStats();
    // botões
    BTN.forEach((bt, i) => {
      const on = i === this.btn && ['menu', 'actMenu', 'itemMenu', 'mercyMenu'].includes(this.state);
      const c = on ? '#ffff40' : '#ff7f27';
      ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.strokeRect(bt.x + 2, BTN_Y + 2, BTN_W - 4, BTN_H - 4);
      if (on) drawSpr(SPR.soul, bt.x + 10, BTN_Y + 16, 1);
      else drawBtnIcon(bt.icon, bt.x + 12, BTN_Y + 13, c);
      text(bt.label, bt.x + 76, BTN_Y + 7, 32, c, 'center');
    });

    if (this.hurtFlash > 0) { this.hurtFlash -= 1 / 60; ctx.fillStyle = 'rgba(255,0,0,0.12)'; ctx.fillRect(0, 0, W, H); }
  }

  drawBoxContent() {
    const st = this.state;
    if (st === 'menu') this.flavorTyper.draw(56, 268);
    else if (st === 'text' && this.typer) {
      let tx = 56;
      if (this.typerWho === 'instr') {
        ctx.drawImage(SPR.instr.right[0], 0, 0, 17, 19, 48, 266, 17 * 4.6, 19 * 4.6);
        tx = 150;
      }
      this.typer.draw(tx, 268);
    } else if (st === 'actMenu') this.drawList(this.actList().map(a => ({ t: a.name, c: a.disabled ? '#777' : '#fff' })));
    else if (st === 'itemMenu') this.drawList(G.items.map(n => ({ t: n })));
    else if (st === 'mercyMenu') {
      const o = [{ t: 'Poupar', c: this.spareable ? '#ffff40' : '#fff' }];
      if (!this.opts.tutorial) o.push({ t: 'Fugir' });
      this.drawList(o, 1);
    } else if (st === 'fightBar' || (st === 'damage' && this.bar)) {
      this.drawTarget();
    } else if (st === 'enemyTurn') {
      for (const bl of this.bullets) BULLET_DRAW[bl.kind](bl, this.t);
      const s = this.soul;
      if (s.inv <= 0 || Math.floor(s.inv * 12) % 2) drawSpr(SPR.soul, s.x - 8, s.y - 7, 1);
    }
  }

  drawList(items, cols = 2) {
    items.forEach((it, i) => {
      const r = this.optRect(i, cols);
      if (i === this.sel) drawSpr(SPR.soul, r.x - 4, r.y + 9, 1);
      text('* ' + it.t, r.x + 20, r.y, 32, it.c || '#fff');
    });
  }

  drawTarget() {
    const b = BOX_FULL;
    // alvo em forma de olho
    ctx.fillStyle = '#0a1a0a'; ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
    ctx.strokeStyle = '#1f7a2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(320, b.y + 70, 270, 58, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#3cbf4a';
    ctx.beginPath(); ctx.ellipse(320, b.y + 70, 150, 46, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#3cbf4a';
    ctx.beginPath(); ctx.ellipse(320, b.y + 70, 40, 28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(316, b.y + 12, 8, b.h - 24);
    if (this.bar) {
      const flash = this.bar.stopped && Math.floor(this.bar.t * 20) % 2;
      ctx.fillStyle = flash ? '#000' : '#fff';
      ctx.fillRect(this.bar.x - 7, b.y + 8, 14, b.h - 16);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(this.bar.x - 4, b.y + 12, 8, b.h - 24);
    }
  }

  drawStats() {
    const y = 394;
    text(G.name, 32, y, 30);
    text('LV ' + G.lv, 160, y, 30);
    text('HP', 250, y, 24);
    const w = G.maxhp * 2.4;
    ctx.fillStyle = '#c00000'; ctx.fillRect(286, y + 4, w, 20);
    ctx.fillStyle = '#ffff00'; ctx.fillRect(286, y + 4, w * Math.max(0, G.hp) / G.maxhp, 20);
    text(`${Math.max(0, G.hp)} / ${G.maxhp}`, 300 + w, y, 30);
  }
}

function hit(p, x, y, w, h) { return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h; }

function drawStar(x, y, r, rot, color) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r, a = rot + i * Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}

function drawBtnIcon(kind, x, y, c) {
  ctx.fillStyle = c;
  if (kind === 'fight') { ctx.fillRect(x + 8, y, 4, 14); ctx.fillRect(x + 3, y + 13, 14, 3); ctx.fillRect(x + 8, y + 16, 4, 5); }
  else if (kind === 'act') { ctx.beginPath(); ctx.arc(x + 10, y + 10, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(x + 5, y + 6, 3, 3); ctx.fillRect(x + 12, y + 6, 3, 3); ctx.fillRect(x + 6, y + 13, 8, 2); }
  else if (kind === 'item') { ctx.fillRect(x + 3, y + 5, 15, 14); ctx.fillStyle = '#000'; ctx.fillRect(x + 6, y + 8, 9, 2); ctx.fillStyle = c; ctx.fillRect(x + 7, y + 1, 7, 4); }
  else { ctx.fillRect(x + 2, y + 9, 17, 4); ctx.fillRect(x + 9, y + 2, 4, 18); }
}

// ---------- PADRÕES DE ATAQUE ----------
const PATTERNS = {
  stars: { // treino do Instrutor
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.9;
        const bx = B.box, gap = bx.y + 30 + Math.random() * (bx.h - 60);
        for (let y = bx.y + 15; y < bx.y + bx.h - 10; y += 26) {
          if (Math.abs(y - gap) < 32) continue;
          B.bullets.push({ kind: 'star', x: bx.x + bx.w + 10, y, vx: -95, vy: 0, r: 7, dmg: 1 });
        }
      }
    },
  },
  spores: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.32;
        const bx = B.box;
        B.bullets.push({ kind: 'spore', x: bx.x + 10 + Math.random() * (bx.w - 20), y: bx.y - 6, vx: 0, vy: 85 + Math.random() * 50, r: 6, sway: 60, ph: Math.random() * 6 });
      }
    },
  },
  vines: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.0;
        const bx = B.box, left = Math.random() < 0.5;
        const y = B.soul.y + (Math.random() - 0.5) * 40;
        for (let i = 0; i < 3; i++) {
          B.bullets.push({ kind: 'vine', x: left ? bx.x - 10 - i * 14 : bx.x + bx.w + 10 + i * 14, y, vx: left ? 150 : -150, vy: 0, r: 7 });
        }
      }
    },
  },
  tears: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.7;
        const bx = B.box, x = bx.x + Math.random() * bx.w;
        for (let i = -1; i <= 1; i++) B.bullets.push({ kind: 'tear', x, y: bx.y - 6, vx: i * 55, vy: 130, r: 6 });
      }
    },
  },
  orbs: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.4;
        const bx = B.box;
        const pts = [[bx.x + 14, bx.y + 14], [bx.x + bx.w - 14, bx.y + 14], [bx.x + 14, bx.y + bx.h - 14], [bx.x + bx.w - 14, bx.y + bx.h - 14]];
        const p = pts[(Math.random() * 4) | 0];
        B.bullets.push({ kind: 'orb', x: p[0], y: p[1], vx: 0, vy: 0, r: 8, home: 1.6, pop: true });
      }
    },
  },
};

const BULLET_DRAW = {
  star(b, t) { drawStar(b.x, b.y, 8, t * 4, '#fff7a0'); },
  spore(b) { ctx.fillStyle = '#9fe07a'; ctx.fillRect(b.x - 5, b.y - 5, 10, 10); ctx.fillStyle = '#2f6e30'; ctx.fillRect(b.x - 2, b.y - 2, 4, 4); },
  vine(b) { ctx.fillStyle = '#4fa64a'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2f6e30'; ctx.fillRect(b.x - 2, b.y - 7, 4, 3); },
  tear(b) {
    ctx.fillStyle = '#7fd9ff'; ctx.beginPath(); ctx.arc(b.x, b.y + 2, 6, 0, Math.PI); ctx.lineTo(b.x, b.y - 9); ctx.closePath(); ctx.fill();
  },
  orb(b, t) {
    ctx.globalAlpha = 0.6 + Math.sin(t * 10) * 0.2; ctx.fillStyle = '#e9eefa';
    ctx.beginPath(); ctx.arc(b.x, b.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#2a2440'; ctx.fillRect(b.x - 4, b.y - 2, 2, 3); ctx.fillRect(b.x + 2, b.y - 2, 2, 3);
  },
};
