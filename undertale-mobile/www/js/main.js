// Cenas: título, configurações, cutscene inicial, cartões de fase, batalha, fim de jogo e fim de fase.
'use strict';

const Game = {
  scene: 'boot', battleObj: null, flashT: 0, flashWhite: 0,

  start() {
    buildSprites();
    setupTouchControls();
    Config.load();
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
    if (ConfigMenu.isOpen) { ConfigMenu.update(dt); return; }
    const S = { title: Title, intro: Intro, world: World, gameover: GameOver, end: End, chapter: Chapter, cine: this.cine || Cine3 }[this.scene];
    if (this.scene === 'battle') this.battleObj.update(dt);
    else if (S) S.update(dt);
  },

  draw() {
    ctx.imageSmoothingEnabled = false;
    const S = { title: Title, intro: Intro, world: World, gameover: GameOver, end: End, chapter: Chapter, cine: this.cine || Cine3 }[this.scene];
    if (this.scene === 'battle') this.battleObj.draw();
    else if (S) S.draw();
    if (this.flashT > 0) this.drawFlash();
    if (this.flashWhite > 0) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.flashWhite * 2)})`; ctx.fillRect(0, 0, W, H);
      this.flashWhite -= 1 / 60;
    }
    if (ConfigMenu.isOpen) ConfigMenu.draw();
    Fade.draw();
  },

  goTitle() { this.scene = 'title'; Title.enter(); },

  newGame() {
    G = newGameState();
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
    this.scene = 'intro'; Intro.run();
  },

  enterMap(mapId) {
    World.init(mapId);
    this.scene = 'world';
    if (World.M.onEnter) World.M.onEnter(World);
  },

  continueGame() {
    const s = loadGame();
    G = Object.assign(newGameState(), s);
    if (!G.flags) G.flags = {};
    if (G.map === 'dragoncity' && G.flags.bossDone) { this.goChapter(3); return; }
    if ((G.map === 'gelo' && G.flags.p3done) || (G.map === 'futuro' && !G.flags.p4arrived)) { this.goChapter(4); return; }
    if (G.map === 'gelo' && !G.flags.p3arrived) { this.goChapter(3); return; }
    this.enterMap(G.map || 'labirinto');
    if (Fade.a > 0 && !(G.map === 'dragoncity' && !G.flags.p2arrived)) Fade.to(0, 1.5);
    Sfx.playMusic(World.M.musicAt ? World.M.musicAt(World) : World.M.music);
  },

  enterWorldFromIntro() {
    World.init('labirinto'); this.scene = 'world';
    P1.scriptWake();
  },

  goChapter(n) {
    if (n === 2) { G.map = 'dragoncity'; G.pos = null; saveGame(null); }
    if (n === 3) { G.map = 'gelo'; G.pos = null; saveGame(null); }
    if (n === 4) { G.map = 'futuro'; G.pos = null; saveGame(null); }
    this.scene = 'chapter'; Chapter.enter(n);
  },

  async startBattle(key, opts, cb) {
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

  goEnd(phase) { this.scene = 'end'; End.enter(phase); },
};

// ---------------- TÍTULO ----------------
const Title = {
  t: 0, sel: 0, opts: [],
  enter() {
    this.t = 0; this.sel = 0;
    this.save = loadGame();
    this.opts = (this.save ? ['CONTINUAR', 'NOVO JOGO'] : ['NOVO JOGO']).concat(['CONFIGURAÇÕES']);
    Fade.a = 1; Fade.to(0, 1);
    this.musicStarted = false;
  },
  update(dt) {
    this.t += dt;
    if (!this.musicStarted && (Input.tap || Input.pressed.size)) { this.musicStarted = true; Sfx.init(); Sfx.playMusic('title'); }
    if (this.t < 0.6) return;
    if (Input.isPressed('up')) { this.sel = (this.sel + this.opts.length - 1) % this.opts.length; Sfx.move(); }
    if (Input.isPressed('down')) { this.sel = (this.sel + 1) % this.opts.length; Sfx.move(); }
    let ch = Input.isPressed('a') ? this.sel : -1;
    if (Input.tap) this.opts.forEach((o, i) => { if (Math.abs(Input.tap.y - (300 + i * 44)) < 20) ch = i; });
    if (ch < 0) return;
    Sfx.select();
    const o = this.opts[ch];
    this.sel = ch;
    if (o === 'CONFIGURAÇÕES') { ConfigMenu.open(); return; }
    this.t = -99;
    Fade.to(1, 1.5).then(() => { Sfx.stopMusic(); o === 'CONTINUAR' ? Game.continueGame() : Game.newGame(); });
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % 640, y = (i * 53) % 260, a = 0.3 + 0.3 * Math.sin(this.t * 2 + i);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(x, y, 2, 2);
    }
    text('PERDIDO', 320, 90, 52, '#fff', 'center', FONT_TITLE);
    text('um fangame de Undertale', 320, 160, 30, '#aaa', 'center');
    const fase = { dragoncity: 'FASE 2: DRAGONCITY', gelo: 'FASE 3: COLÔNIA DE GELO', futuro: 'FASE 4: CIDADE FUTURISTA' }[this.save && this.save.map] || 'FASE 1: O LABIRINTO';
    text(fase, 320, 196, 30, '#ffe680', 'center');
    drawSpr(SPR.soul, 312, 244 + Math.sin(this.t * 3) * 4, 1);
    this.opts.forEach((o, i) => text(o, 320, 284 + i * 44, 34, i === this.sel ? '#ffff40' : '#fff', 'center'));
    if (Math.floor(this.t * 2) % 2) text('toque para escolher', 320, 440, 26, '#777', 'center');
  },
};

// ---------------- CONFIGURAÇÕES ----------------
const ConfigMenu = {
  isOpen: false, sel: 0,
  open() { this.isOpen = true; this.sel = 0; },
  rows() {
    return [
      { label: 'Controle', val: Config.control === 'analog' ? 'ANALÓGICO' : 'DIRECIONAL', toggle: () => { Config.control = Config.control === 'analog' ? 'dpad' : 'analog'; } },
      { label: 'Música', val: Config.music ? 'LIGADA' : 'DESLIGADA', toggle: () => { Config.music = !Config.music; } },
      { label: 'Efeitos', val: Config.sfx ? 'LIGADOS' : 'DESLIGADOS', toggle: () => { Config.sfx = !Config.sfx; } },
      { label: 'VOLTAR', val: '', toggle: null },
    ];
  },
  update() {
    const R = this.rows();
    if (Input.isPressed('up')) { this.sel = (this.sel + R.length - 1) % R.length; Sfx.move(); }
    if (Input.isPressed('down')) { this.sel = (this.sel + 1) % R.length; Sfx.move(); }
    let ch = (Input.isPressed('a') || Input.isPressed('left') || Input.isPressed('right')) ? this.sel : -1;
    if (Input.tap) R.forEach((r, i) => { if (Math.abs(Input.tap.y - (150 + i * 64)) < 28) ch = i; });
    if (Input.isPressed('b')) ch = R.length - 1;
    if (ch < 0) return;
    this.sel = ch;
    const r = R[ch];
    if (!r.toggle) { Sfx.back(); this.isOpen = false; return; }
    r.toggle(); Config.save(); Sfx.select();
  },
  draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, W, H);
    frameBox(60, 50, 520, 380, 6);
    text('CONFIGURAÇÕES', 320, 74, 22, '#fff', 'center', FONT_TITLE);
    this.rows().forEach((r, i) => {
      const y = 132 + i * 64, on = i === this.sel;
      if (on) drawSpr(SPR.soul, 96, y + 12, 1);
      text(r.label, 124, y, 34, on ? '#ffff40' : '#fff');
      if (r.val) text('< ' + r.val + ' >', 540, y, 34, on ? '#ffff40' : '#aaa', 'right');
    });
    text('toque numa opção para trocar', 320, 392, 26, '#777', 'center');
  },
};

// ---------------- CARTÃO DE FASE ----------------
const Chapter = {
  t: 0, n: 1,
  enter(n) { this.t = 0; this.n = n; this.done = false; Fade.a = 1; Fade.to(0, 1); Sfx.playMusic('title'); },
  update(dt) {
    this.t += dt;
    if (!this.done && (this.t > 4.5 || (this.t > 1.2 && (Input.isPressed('a') || Input.tap)))) {
      this.done = true;
      Fade.to(1, 1.2).then(() => {
        Sfx.stopMusic();
        if (this.n === 3) { Game.cine = Cine3; Game.scene = 'cine'; Cine3.run(); }
        else if (this.n === 4) { Game.cine = Cine4; Game.scene = 'cine'; Cine4.run(); }
        else Game.enterMap(this.n === 2 ? 'dragoncity' : 'labirinto');
      });
    }
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const a = Math.min(1, this.t);
    ctx.globalAlpha = a;
    text('FASE ' + this.n, 320, 150, 40, '#fff', 'center', FONT_TITLE);
    text({ 1: 'O LABIRINTO', 2: 'DRAGONCITY', 3: 'COLÔNIA DE GELO', 4: 'CIDADE FUTURISTA' }[this.n], 320, 220, this.n === 4 ? 26 : 30, { 3: '#9fe4ff', 4: '#ff5ac8' }[this.n] || '#ff9a3a', 'center', FONT_TITLE);
    if (this.n === 4) { P4.drawSkyline(this.t, 0.5); drawSpr(SPR.robot.bit.right[Math.floor(this.t * 4) % 2], 296, 290 + Math.sin(this.t * 3) * 4, 3); }
    if (this.n === 3) {
      drawGhost('ice', 278, 280 + Math.sin(this.t * 2) * 6, 3, this.t);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 40; i++) ctx.fillRect((i * 97 + this.t * 30) % 640, (i * 53 + this.t * 50) % 480, 2, 2);
    }
    if (this.n === 2) {
      const k = ['preto', 'branco', 'laranja'];
      k.forEach((d, i) => drawSpr(SPR.dragon[d].right[Math.floor(this.t * 3 + i) % 2], 170 + i * 110, 300 + Math.sin(this.t * 2 + i) * 6, 3));
    }
    ctx.globalAlpha = 1;
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
      if (loadGame()) Game.continueGame();
      else { G = newGameState(); Game.enterWorldFromIntro(); }
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

// ---------------- FIM DA FASE ----------------
const End = {
  t: 0, phase: 2,
  enter(phase) {
    this.t = 0; this.phase = phase || 2; Fade.to(0, 0.8); Sfx.playMusic('victory');
    if (this.phase === 2) { G.map = 'gelo'; G.pos = null; G.flags.p2done = true; saveGame(null); }
  },
  update(dt) {
    this.t += dt;
    if (this.t > 3 && (Input.isPressed('a') || Input.tap)) {
      Sfx.select(); this.t = -99;
      Fade.to(1, 1).then(() => { Sfx.stopMusic(); this.phase === 2 ? Game.goChapter(3) : this.phase === 3 ? Game.goChapter(4) : Game.goTitle(); });
    }
  },
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const T = Math.max(0, this.t);
    text('FIM DA FASE ' + this.phase, 320, 50, 34, '#fff', 'center', FONT_TITLE);
    drawSpr(SPR.player.down[0], 300, 140, 3);
    if (G.dragon) drawSpr(SPR.dragon[G.dragon].right[Math.floor(T * 4) % 2], 170, 118, 4);
    if (this.phase === 2 && G.flags.fireFriend) drawGhost('fire', 380, 112, 3, T);
    if (this.phase === 3) { drawGhost('ice', 380, 100, 3, T); drawGhost('fire', 470, 120, 2, T, G.flags.fireFriend ? 1 : 0.5); }
    if (this.phase === 4) drawSpr(SPR.robot.bit.left[Math.floor(T * 4) % 2], 380, 130, 3);
    const rota = G.kills === 0 ? 'Rota: PACIFISTA (até agora...)' : (G.kills >= 4 && G.spares === 0) ? 'Rota: ...GENOCIDA?' : 'Rota: NEUTRA';
    text(`LV ${G.lv}   EXP ${G.xp}   OURO ${G.gold}`, 320, 236, 32, '#fff', 'center');
    text(`Poupados: ${G.spares}    Derrotados: ${G.kills}`, 320, 270, 32, '#fff', 'center');
    text(rota, 320, 304, 32, '#ffe680', 'center');
    const line = this.phase === 4 ? (G.flags.bulliesFriends ? 'Bit e os valentões agora são amigos!' : 'Novo contato no celular: BIT')
      : this.phase === 3 ? 'Os irmãos fantasmas estão te esperando...'
      : G.flags.fireFriend ? 'FireGhost virou seu amigo!' : 'O IceGhost sabe que você está aqui...';
    text(line, 320, 344, 30, '#9fe4ff', 'center');
    text({ 2: 'Próxima: FASE 3 — COLÔNIA DE GELO', 3: 'Próxima: FASE 4 — CIDADE FUTURISTA', 4: 'FASE 5 em breve...' }[this.phase], 320, 386, 30, '#ff7f27', 'center');
    if (this.t > 3 && Math.floor(this.t * 2) % 2) text(this.phase < 4 ? 'toque para continuar' : 'toque para voltar ao título', 320, 434, 26, '#777', 'center');
  },
};

document.fonts && document.fonts.load('30px "VT323"');
document.fonts && document.fonts.load('30px "PressStart"');
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => Game.start());
