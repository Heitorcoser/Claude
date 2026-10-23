// Cenas: título, cutscene inicial, mundo, batalha, fim de jogo e fim da fase.
'use strict';

const Game = {
  scene: 'boot', battleObj: null, flashT: 0,

  start() {
    buildSprites();
    setupTouchControls();
    this.goTitle();
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      this.update(dt); this.draw();
      Input.endFrame();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  update(dt) {
    Timers.update(dt); Fade.update(dt); flushFrameWaiters(dt);
    if (this.scene === 'title') Title.update(dt);
    else if (this.scene === 'intro') Intro.update(dt);
    else if (this.scene === 'world') World.update(dt);
    else if (this.scene === 'battle') this.battleObj.update(dt);
    else if (this.scene === 'gameover') GameOver.update(dt);
    else if (this.scene === 'end') End.update(dt);
  },

  draw() {
    ctx.imageSmoothingEnabled = false;
    if (this.scene === 'title') Title.draw();
    else if (this.scene === 'intro') Intro.draw();
    else if (this.scene === 'world') World.draw();
    else if (this.scene === 'battle') this.battleObj.draw();
    else if (this.scene === 'gameover') GameOver.draw();
    else if (this.scene === 'end') End.draw();
    if (this.flashT > 0) this.drawFlash();
    Fade.draw();
  },

  goTitle() { this.scene = 'title'; Title.enter(); },

  newGame() {
    G = newGameState();
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
    this.scene = 'intro'; Intro.run();
  },

  continueGame() {
    const s = loadGame();
    G = Object.assign(newGameState(), s);
    World.init(); this.scene = 'world';
    Fade.a = 1; Fade.to(0, 1.5);
    Sfx.playMusic('ruins');
  },

  enterWorldFromIntro() {
    World.init(); this.scene = 'world';
    World.scriptWake();
  },

  async startBattle(key, opts, cb) {
    // transição: tela pisca com a ALMA
    const p = World.player;
    this.flashPos = { x: (p.x - World.cam.x) * 2, y: (p.y - World.cam.y - 10) * 2 };
    Sfx.stopMusic();
    this.flashT = 0.9;
    await wait(0.9);
    this.battleObj = new Battle(key, {
      ...opts,
      onEnd: async (result) => {
        if (result === 'dead') { await wait(0.2); GameOver.enter(); this.scene = 'gameover'; return; }
        await Fade.to(1, 3);
        this.scene = 'world'; this.battleObj = null;
        await Fade.to(0, 3);
        cb(result);
      },
    });
    this.scene = 'battle';
  },

  drawFlash() {
    this.flashT -= 1 / 60;
    const ph = Math.floor((0.9 - this.flashT) * 10);
    if (ph < 6) {
      if (ph % 2 === 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); drawSpr(SPR.soul, this.flashPos.x - 8, this.flashPos.y - 7, 1); }
    } else {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const k = (ph - 6) / 3;
      const x = this.flashPos.x + (BTN[0].x + 10 - this.flashPos.x) * k, y = this.flashPos.y + (BTN_Y + 16 - this.flashPos.y) * k;
      drawSpr(SPR.soul, x - 8, y - 7, 1);
    }
  },

  goEnd() { this.scene = 'end'; End.enter(); },
};

// ---------------- TÍTULO ----------------
const Title = {
  t: 0, sel: 0, opts: [],
  enter() {
    this.t = 0; this.sel = 0;
    this.opts = loadGame() ? ['CONTINUAR', 'NOVO JOGO'] : ['NOVO JOGO'];
    Fade.a = 1; Fade.to(0, 1);
    this.musicStarted = false;
  },
  update(dt) {
    this.t += dt;
    if (!this.musicStarted && (Input.tap || Input.pressed.size)) { this.musicStarted = true; Sfx.playMusic('title'); }
    if (this.t < 0.6) return;
    if (Input.isPressed('up') || Input.isPressed('down')) { this.sel = (this.sel + 1) % this.opts.length; Sfx.move(); }
    let ch = Input.isPressed('a') ? this.sel : -1;
    if (Input.tap) {
      this.opts.forEach((o, i) => { if (Math.abs(Input.tap.y - (330 + i * 50)) < 24) ch = i; });
    }
    if (ch < 0) return;
    Sfx.select();
    const o = this.opts[ch];
    this.t = -99;
    Fade.to(1, 1.5).then(() => { Sfx.stopMusic(); o === 'CONTINUAR' ? Game.continueGame() : Game.newGame(); });
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // estrelas de fundo
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % 640, y = (i * 53) % 260, a = 0.3 + 0.3 * Math.sin(this.t * 2 + i);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(x, y, 2, 2);
    }
    text('PERDIDO', 320, 110, 52, '#fff', 'center', FONT_TITLE);
    text('um fangame de Undertale', 320, 182, 30, '#aaa', 'center');
    text('FASE 1: O LABIRINTO', 320, 222, 30, '#ffe680', 'center');
    drawSpr(SPR.soul, 312, 270 + Math.sin(this.t * 3) * 4, 1);
    this.opts.forEach((o, i) => {
      const on = i === this.sel;
      text(o, 320, 314 + i * 50, 36, on ? '#ffff40' : '#fff', 'center');
    });
    if (Math.floor(this.t * 2) % 2) text('toque para escolher', 320, 430, 26, '#777', 'center');
  },
};

// ---------------- CUTSCENE INICIAL ----------------
const Intro = {
  t: 0, scroll: 0, walking: false, dark: 0, px: 150, pdir: 'right', sink: 0, hole: 0,
  falling: false, fallT: 0, shake: 0, typer: null, resolve: null, leaves: [], panelText: null,
  async run() {
    Object.assign(this, { t: 0, scroll: 0, walking: true, dark: 0, px: 150, pdir: 'right', sink: 0, hole: 0, falling: false, fallT: 0, shake: 0, leaves: [] });
    this.buildForest();
    Fade.a = 1; Fade.to(0, 0.8);
    Sfx.playMusic('title');
    await wait(1);
    await this.say('Era uma tarde tranquila de outono.');
    await this.say('Você resolveu explorar a floresta atrás de casa.');
    this.darkTarget = 0.35;
    await this.say('Você andou... e andou...\ne as árvores foram ficando cada vez mais altas.');
    this.darkTarget = 0.6;
    this.walking = false;
    await wait(0.6);
    this.pdir = 'left'; await wait(0.7); this.pdir = 'right'; await wait(0.7); this.pdir = 'left'; await wait(0.5);
    await this.say('Quando percebeu, o caminho de volta tinha sumido.');
    this.pdir = 'right';
    Sfx.stopMusic();
    await this.say('Você estava PERDIDO.');
    await wait(0.4);
    // o chão cede
    this.shake = 1; Sfx.hit(); await wait(0.6);
    this.shake = 0.8; Sfx.hit(); this.hole = 0.01; await wait(0.8);
    Sfx.fall();
    this.sinking = true; await wait(1.0);
    this.falling = true; this.fallT = 0;
    await wait(2.4);
    await Fade.to(1, 1.2);
    this.falling = false;
    Game.enterWorldFromIntro();
  },
  say(str) {
    return new Promise(r => { this.typer = new Typer(str, 'narr', 570, 32); this.resolve = r; });
  },
  buildForest() {
    const R = rng(42);
    this.far = Array.from({ length: 14 }, (_, i) => ({ x: i * 34 + R() * 10, h: 60 + R() * 40 }));
    this.near = Array.from({ length: 7 }, (_, i) => ({ x: i * 70 + R() * 20, h: 120 + R() * 30, w: 10 + R() * 6 }));
  },
  update(dt) {
    this.t += dt;
    if (this.walking) this.scroll += dt * 40;
    this.dark += ((this.darkTarget || 0) - this.dark) * dt;
    if (this.shake > 0) this.shake -= dt;
    if (this.hole > 0 && this.hole < 1) this.hole = Math.min(1, this.hole + dt * 2);
    if (this.sinking) this.sink += dt * 60;
    if (this.falling) {
      this.fallT += dt;
      if (Math.random() < 0.3) this.leaves.push({ x: Math.random() * 640, y: 500, vy: -200 - Math.random() * 200, c: ['#b8322a', '#d9542b', '#e8873a'][(Math.random() * 3) | 0] });
      this.leaves.forEach(l => l.y += l.vy * dt);
    }
    if (this.typer) {
      this.typer.update(dt);
      if (Input.isPressed('a') || Input.tap) {
        if (this.typer.done) { Sfx.move(); this.typer = null; const r = this.resolve; this.resolve = null; r(); }
        else this.typer.skip();
      }
    }
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (this.falling) return this.drawFall();
    const ox = this.shake > 0 ? (Math.random() - 0.5) * 10 * this.shake : 0;
    ctx.save(); ctx.translate(ox, 0);
    // céu
    const sky = ctx.createLinearGradient(0, 0, 0, 340);
    sky.addColorStop(0, '#2a1846'); sky.addColorStop(0.6, '#c2553a'); sky.addColorStop(1, '#f2a65a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 640, 340);
    ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.arc(470, 250, 40, 0, Math.PI * 2); ctx.fill();
    // árvores distantes
    ctx.fillStyle = '#3b1f3a';
    for (const tr of this.far) {
      const x = ((tr.x - this.scroll * 0.3) % 476 + 476) % 476 * 1.4 - 40;
      ctx.beginPath(); ctx.moveTo(x, 340); ctx.lineTo(x + 24, 340 - tr.h * 1.6); ctx.lineTo(x + 48, 340); ctx.fill();
    }
    // chão
    ctx.fillStyle = '#2b1a14'; ctx.fillRect(0, 336, 640, 144);
    ctx.fillStyle = '#4a2e1a'; ctx.fillRect(0, 336, 640, 10);
    for (let i = 0; i < 40; i++) {
      const x = ((i * 53 - this.scroll * 2) % 680 + 680) % 680 - 20;
      ctx.fillStyle = ['#b8322a', '#d9542b', '#8f1f1f'][i % 3]; ctx.fillRect(x, 350 + (i * 37) % 120, 6, 3);
    }
    // buraco
    if (this.hole > 0) {
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(this.px + 21, 342, 50 * this.hole, 14 * this.hole, 0, 0, Math.PI * 2); ctx.fill();
    }
    // árvores próximas
    for (const tr of this.near) {
      const x = ((tr.x - this.scroll * 1.6) % 490 + 490) % 490 * 1.4 - 60;
      ctx.fillStyle = '#1a0f12'; ctx.fillRect(x, 340 - tr.h * 2, tr.w * 2, tr.h * 2 + 10);
      ctx.fillStyle = '#26101a'; ctx.beginPath(); ctx.arc(x + tr.w, 340 - tr.h * 2, 50, 0, Math.PI * 2); ctx.fill();
    }
    // jogador
    const fr = this.walking ? Math.floor(this.t * 7) % 4 : 0;
    const img = SPR.player[this.pdir][fr];
    ctx.save();
    if (this.sinking) { ctx.beginPath(); ctx.rect(0, 0, 640, 342); ctx.clip(); }
    drawSpr(img, this.px, 279 + this.sink, 3);
    ctx.restore();
    // escurecer
    ctx.fillStyle = `rgba(5,0,15,${this.dark})`; ctx.fillRect(0, 0, 640, 480);
    ctx.restore();
    this.drawCaption();
  },
  drawFall() {
    for (const l of this.leaves) { ctx.fillStyle = l.c; ctx.fillRect(l.x, l.y, 8, 4); }
    const s = Math.max(0.5, 4 - this.fallT * 1.4);
    const img = SPR.player.down[0];
    ctx.save(); ctx.translate(320, 220); ctx.rotate(this.fallT * 4);
    ctx.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s);
    ctx.restore();
    this.drawCaption();
  },
  drawCaption() {
    if (!this.typer) return;
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 384, 640, 96);
    this.typer.draw(34, 398, '#fff', 34);
  },
};

// ---------------- FIM DE JOGO ----------------
const GameOver = {
  t: 0, typer: null, pieces: [],
  enter() {
    this.t = 0; this.typer = null; this.pieces = []; Sfx.stopMusic();
    this.lines = ['Não desista agora...', `${G.name}! Fique DETERMINADO...`];
    this.li = 0;
  },
  update(dt) {
    this.t += dt;
    if (this.t > 1.2 && !this.pieces.length) {
      Sfx.dust();
      for (let i = 0; i < 6; i++) this.pieces.push({ x: 320, y: 240, vx: (Math.random() - 0.5) * 300, vy: -150 - Math.random() * 150 });
    }
    this.pieces.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; });
    if (this.t > 2.6 && !this.typer && this.li < this.lines.length) this.typer = new Typer(this.lines[this.li], 'instr', 520, 34);
    if (this.typer) {
      this.typer.update(dt);
      if (Input.isPressed('a') || Input.tap) {
        if (!this.typer.done) this.typer.skip();
        else { this.li++; this.typer = null; if (this.li >= this.lines.length) this.retry(); }
      }
    }
  },
  retry() {
    Fade.to(1, 1).then(() => {
      const s = loadGame();
      if (s) Game.continueGame();
      else { G = newGameState(); World.init(); Game.scene = 'world'; World.scriptWake(); }
    });
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (this.t < 0.6) drawSpr(SPR.soul, 312, 233, 1);
    else if (this.t < 1.2) drawSpr(SPR.soulBroken, 312, 233, 1);
    else this.pieces.forEach(p => { ctx.fillStyle = '#ff2b2b'; ctx.fillRect(p.x, p.y, 6, 6); });
    if (this.t > 2) {
      ctx.globalAlpha = Math.min(1, (this.t - 2));
      text('FIM DE', 320, 70, 56, '#fff', 'center', FONT_TITLE);
      text('JOGO', 320, 150, 56, '#fff', 'center', FONT_TITLE);
      ctx.globalAlpha = 1;
    }
    if (this.typer) this.typer.draw(110, 320, '#fff', 40);
  },
};

// ---------------- FIM DA FASE 1 ----------------
const End = {
  t: 0,
  enter() { this.t = 0; Fade.to(0, 0.8); Sfx.playMusic('title'); try { saveGame(G.pos); } catch (e) { } },
  update(dt) {
    this.t += dt;
    if (this.t > 3 && (Input.isPressed('a') || Input.tap)) { Sfx.select(); Fade.to(1, 1).then(() => { Sfx.stopMusic(); Game.goTitle(); }); this.t = -99; }
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    text('FIM DA FASE 1', 320, 70, 34, '#fff', 'center', FONT_TITLE);
    drawSpr(SPR.instr.right[0], 270, 120, 3);
    drawSpr(SPR.player.down[0], 340, 165, 3);
    const rota = G.kills === 0 ? 'Rota: PACIFISTA (até agora...)' : (G.kills >= 3 && G.spares === 0) ? 'Rota: ...GENOCIDA?' : 'Rota: NEUTRA';
    text(`LV ${G.lv}   EXP ${G.xp}   OURO ${G.gold}`, 320, 250, 32, '#fff', 'center');
    text(`Poupados: ${G.spares}    Derrotados: ${G.kills}`, 320, 285, 32, '#fff', 'center');
    text(rota, 320, 320, 32, '#ffe680', 'center');
    text('FASE 2 em breve: a primeira BOSS FIGHT!', 320, 372, 30, '#ff7f27', 'center');
    if (this.t > 3 && Math.floor(this.t * 2) % 2) text('toque para voltar ao título', 320, 430, 26, '#777', 'center');
  },
};

document.fonts && document.fonts.load('30px "VT323"');
document.fonts && document.fonts.load('30px "PressStart"');
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => Game.start());
