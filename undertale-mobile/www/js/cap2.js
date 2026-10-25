// CAPÍTULO 2 — estrutura: lista de capítulos, save separado, cartões de fase,
// fim de fase, créditos, celular e falas dos personagens novos.
// O Capítulo 2 pode ser jogado sem passar pelo 1 (se tiver save do 1, ele aproveita
// nome, dragão, nível e rota).
'use strict';

const CH1_KEY = 'perdido_save_v1', CH2_KEY = 'perdido_save_c2';

Object.assign(VOICE_OF, { jorge: 'old', morador: 'narr', crianca: 'kid', sombra: 'deep', alma: 'instr' });
Object.assign(PORTRAITS, {
  jorge: sprPortrait('jorge', 14, 11, 6.4, 2, 6),
  morador: sprPortrait(() => SPR.morador.m1, 14, 10, 6.4, 2, 8),
  crianca: sprPortrait('crianca', 12, 8, 7, 4, 14),
  sombra: (x, y, t) => {
    ctx.drawImage(SPR.carmimDemon, 0, 0, 14, 10, x + 2, y + 10, 14 * 6.4, 10 * 6.4);
    ctx.fillStyle = `rgba(255,30,40,${0.6 + Math.sin(t * 8) * 0.4})`;
    ctx.fillRect(x + 2 + 5 * 6.4, y + 10 + 6 * 6.4, 6.4, 6.4); ctx.fillRect(x + 2 + 8 * 6.4, y + 10 + 6 * 6.4, 6.4, 6.4);
  },
  alma: (x, y, t) => { ctx.globalAlpha = 0.7 + Math.sin(t * 3) * 0.2; drawInstrPortrait(x, y, t); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(150,240,255,0.25)'; ctx.fillRect(x, y, 96, 110); },
});

// Falas: "J: texto" vira { who: 'jorge', t: '* texto' }
const C2_WHO = { I: 'instr', T: 'trein', S: 'stranger', J: 'jorge', M: 'morador', C: 'crianca', X: 'sombra', A: 'alma', 2: 'leao', 3: 'kai', 4: 'luna', 5: 'carmim' };
function c2lines(lines) {
  return lines.map(t => {
    if (typeof t !== 'string') return t;
    const m = /^([ITSJMCXA2-5]):\s*(.*)$/s.exec(t);
    return m ? { who: C2_WHO[m[1]], t: '* ' + m[2] } : t;
  });
}
const c2say = lines => World.say(c2lines(lines));
const c2show = (lines, top = false) => Dialog.show(c2lines(lines), top);

const C2 = {
  slot(key) { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
  use(n) { SAVE_KEY = n === 2 ? CH2_KEY : CH1_KEY; },

  // Estado inicial do Capítulo 2 (aproveita o save do Capítulo 1, se existir)
  newState() {
    const g = newGameState(), c1 = this.slot(CH1_KEY);
    Object.assign(g, {
      ch: 2, lv: 8, xp: 450, maxhp: 48, hp: 48, gold: 40, items: ['Picolé de Coco'],
      dragon: 'lava', weapon: 'Faca do Leão', party: ['kai', 'luna'], map: 'aurora', pos: null,
      flags: { phone: true, ch2: true },
    });
    if (!c1 || !c1.dragon) g.flags.pickDragon = true;
    if (c1) {
      if (c1.name) g.name = c1.name;
      if (c1.dragon) g.dragon = c1.dragon;
      if (c1.lv >= g.lv) { g.lv = c1.lv; g.xp = c1.xp; }
      g.maxhp = Math.max(g.maxhp, c1.maxhp || 0); g.hp = g.maxhp;
      g.kills = c1.kills || 0; g.spares = c1.spares || 0;
      g.atkBonus = c1.atkBonus || 0; g.dragonLv = c1.dragonLv || 0;
      if (c1.weapon) g.weapon = c1.weapon;
    }
    return g;
  },

  start() {
    this.use(2);
    G = this.newState();
    try { localStorage.removeItem(CH2_KEY); } catch (e) { }
    saveGame(null);
    this.card(1);
  },

  resume() {
    const F = G.flags;
    if (G.map === 'aurora' && F.c1done) return this.card(2);
    if (G.map === 'doces2' && F.c2done) return this.card(3);
    if (G.map === 'altar' && F.c3done) return this.credits();
    if (G.map === 'aurora' && !F.a1arrived) return this.card(1);
    Game.enterMap(G.map);
    if (Fade.a > 0) Fade.to(0, 1.5);
    Sfx.playMusic(World.M.musicAt ? World.M.musicAt(World) : World.M.music);
  },

  scene(obj, ...args) { Game.cine = obj; Game.scene = 'cine'; return obj.enter(...args); },
  card(n) {
    const map = { 1: 'aurora', 2: 'doces2', 3: 'altar' }[n];
    if (G.map !== map) { G.map = map; G.pos = null; saveGame(null); }
    this.scene(Card2, n);
  },
  end(n) { this.scene(End2, n); },
  credits() { this.scene(Credits2); },

  // ---------- celular ----------
  async phone() {
    const W = World, F = G.flags;
    const opts = ['Instrutor'].concat(F.leaoNum ? ['Mestre Leão'] : [], ['???', 'Sair']);
    const o = opts[await W.ask('* (CELULAR) Para quem ligar?', opts)];
    const P = { aurora: typeof A1 !== 'undefined' && A1, doces2: typeof D2 !== 'undefined' && D2, altar: typeof R3 !== 'undefined' && R3 }[W.mapId];
    if (o === 'Sair' || o === undefined) return;
    if (P && P.call) { const handled = await P.call(o); if (handled) return; }
    Sfx.ring(); await wait(0.5);
    if (o === 'Instrutor') {
      if (F.c2soul) return c2say(['* (Chamando... ninguém atende.)', '* (Você sente um calorzinho no peito. Ele está com você.)']);
      return c2say(['I: Alô? Tudo bem por aí? Se cuida, viu?']);
    }
    if (o === 'Mestre Leão') return c2say(['2: GRRR... Treine. Coma. Durma. Nessa ordem.']);
    return c2say(['* (Chamando...)', '* (...)', '* (Ninguém atende.)']);
  },
};

// O celular do Capítulo 1 continua igual; no Capítulo 2 ele tem outros contatos.
const _phoneOpen = Phone.open;
Phone.open = function () { return G.ch === 2 ? C2.phone() : _phoneOpen.call(this); };

// Continuar: cada capítulo sabe onde o jogador parou.
const _continueGame = Game.continueGame;
Game.continueGame = function () {
  if (SAVE_KEY !== CH2_KEY) return _continueGame.call(this);
  const s = loadGame();
  if (!s) return C2.start();
  G = Object.assign(newGameState(), s);
  if (!G.flags) G.flags = {};
  C2.resume();
};

// O olhar vermelho (Fase 3): muito mais força
const _playerAtk = playerAtk;
playerAtk = function () { return _playerAtk() + (G.flags && G.flags.redEyes ? 10 : 0); };

// Comida do Capítulo 2
Object.assign(ITEMS, {
  'Peixe Assado': { heal: 35, price: 0, text: '* Você comeu o Peixe Assado do Seu Jorge.\n* Quentinho, com gosto de casa.' },
  'Dourado Assado': { heal: 90, price: 0, text: '* Você comeu o Dourado Assado.\n* O peixe mais raro da Antártica. Que delícia!' },
  'Pão de Mel': { heal: 25, price: 0, text: '* Você comeu o Pão de Mel da Marshmallow.\n* Docinho e macio.' },
});

// ---------------- LISTA DE CAPÍTULOS ----------------
const ChapterSel = {
  enter() {
    this.t = 0; this.sel = 0; this.sub = null; this.confirm = false;
    Fade.to(0, 2);
  },
  info(n) {
    const s = C2.slot(n === 2 ? CH2_KEY : CH1_KEY);
    if (!s) return { save: null, st: 'NOVO' };
    if (n === 1) {
      if (s.flags && s.flags.ch1done) return { save: s, st: 'COMPLETO ★' };
      const ph = { labirinto: 1, dragoncity: 2, gelo: 3, futuro: 4, ilha: 5, caverna: 6, sakura: 7, vulcao: 8, cidade: 9, arena: 10, salao: 11, vila: 12, praia: 13, casa: 14 }[s.map] || 1;
      return { save: s, st: 'FASE ' + ph + ' de 14' };
    }
    if (s.flags && s.flags.c3done) return { save: s, st: 'COMPLETO ★' };
    return { save: s, st: 'FASE ' + ({ aurora: 1, doces2: 2, altar: 3 }[s.map] || 1) + ' de 3' };
  },
  rows() { return this.sub ? this.sub.opts : ['CAPÍTULO 1', 'CAPÍTULO 2', 'VOLTAR']; },
  update(dt) {
    this.t += dt;
    if (this.t < 0.4 || this.busy) return;
    const R = this.rows();
    if (Input.isPressed('up')) { this.sel = (this.sel + R.length - 1) % R.length; this.confirm = false; Sfx.move(); }
    if (Input.isPressed('down')) { this.sel = (this.sel + 1) % R.length; this.confirm = false; Sfx.move(); }
    let ch = Input.isPressed('a') ? this.sel : -1;
    if (Input.tap) {
      if (this.sub) R.forEach((o, i) => { if (Math.abs(Input.tap.y - (360 + i * 36)) < 17) ch = i; });
      else {
        if (Input.tap.y > 90 && Input.tap.y < 330) ch = Input.tap.x < 320 ? 0 : 1;
        if (Input.tap.y > 400) ch = 2;
      }
    }
    if (Input.isPressed('b')) { Sfx.back(); if (this.sub) { this.sel = this.sub.n - 1; this.sub = null; } else this.back(); return; }
    if (ch < 0) return;
    this.sel = ch;
    const o = R[ch];
    if (!this.sub) {
      if (o === 'VOLTAR') { Sfx.back(); return this.back(); }
      Sfx.select();
      const n = ch + 1, inf = this.info(n);
      if (!inf.save) return this.go(n, 'new');
      this.sub = { n, opts: ['CONTINUAR', 'NOVO JOGO', 'VOLTAR'] }; this.sel = 0; this.confirm = false;
      return;
    }
    if (o === 'VOLTAR') { Sfx.back(); this.sel = this.sub.n - 1; this.sub = null; return; }
    if (o === 'NOVO JOGO' && !this.confirm) { Sfx.buzz(); this.confirm = true; return; }
    Sfx.select();
    this.go(this.sub.n, o === 'CONTINUAR' ? 'cont' : 'new');
  },
  go(n, how) {
    this.busy = true;
    Fade.to(1, 1.5).then(() => {
      this.busy = false; Sfx.stopMusic();
      C2.use(n);
      if (n === 1) return how === 'cont' ? Game.continueGame() : Game.newGame();
      return how === 'cont' ? Game.continueGame() : C2.start();
    });
  },
  back() { this.busy = true; Fade.to(1, 3).then(() => { this.busy = false; Game.goTitle(); }); },
  draw() {
    const t = this.t;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(t * 2 + i)})`; ctx.fillRect((i * 97) % 640, (i * 53) % 480, 2, 2); }
    text('CAPÍTULOS', 320, 22, 26, '#fff', 'center', FONT_TITLE);
    for (const n of [1, 2]) {
      const x = n === 1 ? 24 : 332, on = !this.sub ? this.sel === n - 1 : this.sub.n === n, inf = this.info(n);
      ctx.fillStyle = on ? 'rgba(255,255,64,0.08)' : '#000'; ctx.fillRect(x, 80, 284, 260);
      ctx.strokeStyle = on ? '#ffff40' : '#666'; ctx.lineWidth = 4; ctx.strokeRect(x + 2, 82, 280, 256);
      text('CAPÍTULO ' + n, x + 142, 96, 18, on ? '#ffff40' : '#fff', 'center', FONT_TITLE);
      text(n === 1 ? 'PERDIDO' : 'DETERMINAÇÃO', x + 142, 126, 30, n === 1 ? '#ff9a3a' : '#ff3b4a', 'center');
      const cx = x + 142, cy = 250;
      if (n === 1) {
        drawSpr(SPR.instr.right[0], cx - 90, cy - 70, 3);
        drawSpr(SPR.player.down[Math.floor(t * 4) % 4 === 1 ? 1 : 0], cx - 12, cy - 60, 3);
        drawSpr(SPR.dragon.laranja.left[Math.floor(t * 3) % 2], cx + 30, cy - 70 + Math.sin(t * 2) * 4, 2.5);
      } else {
        ctx.fillStyle = `rgba(255,30,40,${0.15 + Math.sin(t * 3) * 0.08})`; ctx.beginPath(); ctx.arc(cx + 40, cy - 30, 60, 0, Math.PI * 2); ctx.fill();
        drawSpr(SPR.player.right[0], cx - 80, cy - 60, 3);
        drawSpr(SPR.carmimDemon, cx + 20, cy - 66, 3);
        drawSpr(SPR.encapuzado, cx + 66, cy - 70, 2.4, 0.8);
        ctx.fillStyle = '#ff1a2a'; ctx.fillRect(cx + 20 + 15, cy - 66 + 18, 3, 3); ctx.fillRect(cx + 20 + 24, cy - 66 + 18, 3, 3);
      }
      text(inf.st, x + 142, 296, 28, inf.st.startsWith('COMPLETO') ? '#7aff9a' : '#aaa', 'center');
    }
    if (this.sub) {
      frameBox(170, 344, 300, 124, 4);
      this.sub.opts.forEach((o, i) => {
        const on = i === this.sel, lbl = o === 'NOVO JOGO' && this.confirm && on ? 'APAGAR O SAVE?' : o;
        if (on) drawSpr(SPR.soul, 200, 360 + i * 36 + 4, 1);
        text(lbl, 320, 352 + i * 36, 30, on ? (this.confirm && o === 'NOVO JOGO' ? '#ff5a5a' : '#ffff40') : '#fff', 'center');
      });
    } else {
      const on = this.sel === 2;
      text('VOLTAR', 320, 410, 32, on ? '#ffff40' : '#fff', 'center');
      text('O Capítulo 2 pode ser jogado sem terminar o 1.', 320, 446, 22, '#777', 'center');
    }
  },
};

// ---------------- CARTÃO DE FASE ----------------
const C2_PHASES = { 1: ['VILA AURORA', '#9fe4ff'], 2: ['A ARENA DOS DOCES', '#f8c8dc'], 3: ['O ALTAR DAS ALMAS', '#ff3b4a'] };
const Card2 = {
  enter(n) { this.t = 0; this.n = n; this.done = false; Fade.a = 1; Fade.to(0, 1); Sfx.playMusic(n === 3 ? 'carmim' : 'title'); },
  update(dt) {
    this.t += dt;
    if (!this.done && (this.t > 5 || (this.t > 1.2 && (Input.isPressed('a') || Input.tap)))) {
      this.done = true;
      Fade.to(1, 1.2).then(() => { Sfx.stopMusic(); Game.enterMap({ 1: 'aurora', 2: 'doces2', 3: 'altar' }[this.n]); });
    }
  },
  draw() {
    const t = this.t, n = this.n;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = Math.min(1, t);
    text('CAPÍTULO 2', 320, 70, 22, '#ff3b4a', 'center', FONT_TITLE);
    text('FASE ' + n, 320, 140, 40, '#fff', 'center', FONT_TITLE);
    text(C2_PHASES[n][0], 320, 210, 26, C2_PHASES[n][1], 'center', FONT_TITLE);
    if (n === 1) {
      ctx.fillStyle = '#fff'; for (let i = 0; i < 50; i++) ctx.fillRect((i * 97 + t * 25) % 640, (i * 53 + t * 45) % 480, 2, 2);
      drawSpr(SPR.morador.m1, 230, 290, 3); drawSpr(SPR.jorge, 300, 284, 3); drawSpr(SPR.peixe.gelo, 360, 330 + Math.sin(t * 4) * 4, 3);
    }
    if (n === 2) {
      drawSpr(SPR.instr.right[0], 250, 280, 3); drawSpr(SPR.player.left[0], 340, 290, 3);
      drawStar(320, 300 + Math.sin(t * 3) * 6, 10, t * 4, '#ffe680');
    }
    if (n === 3) {
      ctx.fillStyle = `rgba(255,20,40,${0.12 + Math.sin(t * 2) * 0.06})`; ctx.fillRect(0, 0, W, H);
      drawSpr(SPR.encapuzado, 240, 280, 3); drawSpr(SPR.carmimDemon, 340, 284, 3);
      for (let i = 0; i < 6; i++) { const a = t + i * Math.PI / 3; ctx.fillStyle = ['#ff3b3b', '#ff9a3a', '#ffe680', '#7aff9a', '#5ac8ff', '#c87aff'][i]; ctx.beginPath(); ctx.arc(320 + Math.cos(a) * 140, 330 + Math.sin(a) * 40, 6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  },
};

// ---------------- FIM DE FASE ----------------
const End2 = {
  enter(n) {
    this.t = 0; this.n = n; Fade.to(0, 0.8);
    Sfx.playMusic(n === 2 ? 'tristeza' : 'victory');
    const map = { 1: 'aurora', 2: 'doces2' }[n];
    if (map) { G.map = map; G.pos = null; G.flags['c' + n + 'done'] = true; saveGame(null); }
  },
  update(dt) {
    this.t += dt;
    if (this.t > 3 && (Input.isPressed('a') || Input.tap)) {
      Sfx.select(); this.t = -99;
      Fade.to(1, 1).then(() => { Sfx.stopMusic(); C2.card(this.n + 1); });
    }
  },
  draw() {
    const T = Math.max(0, this.t), n = this.n;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    text('CAPÍTULO 2', 320, 18, 18, '#ff3b4a', 'center', FONT_TITLE);
    text('FIM DA FASE ' + n, 320, 50, 30, '#fff', 'center', FONT_TITLE);
    drawSpr(SPR.player.down[0], 300, 140, 3);
    drawSpr(SPR.partySet.kai.down[0], 230, 146, 3); drawSpr(SPR.partySet.luna.down[0], 370, 146, 3);
    if (n === 1) { drawSpr(SPR.dragon[G.dragon || 'lava'].right[Math.floor(T * 4) % 2], 60, 110, 3.4); drawSpr(SPR.jorge, 470, 130, 3); }
    if (n === 2) { ctx.globalAlpha = 0.6 + Math.sin(T * 2) * 0.2; drawSpr(SPR.instrSoul, 450, 104, 3); ctx.globalAlpha = 1; }
    text(`LV ${G.lv}   HP ${G.maxhp}   ATQ ${playerAtk()}`, 320, 236, 32, '#fff', 'center');
    const food = G.items.filter(i => /Peixe|Dourado/.test(i)).length;
    text(n === 1 ? `Comida na mochila: ${food}` : `Treinos completos: ${G.flags.d2train || 0} de 3`, 320, 270, 30, '#fff', 'center');
    const line = n === 1 ? 'O Instrutor é o IRMÃO da Carmim.' : 'A alma do Instrutor está com você.';
    text(line, 320, 320, 30, '#9fe4ff', 'center');
    text(n === 1 ? 'Próxima: FASE 2 — A ARENA DOS DOCES' : 'Próxima: FASE 3 — O ALTAR DAS ALMAS', 320, 370, 28, '#ff7f27', 'center');
    if (this.t > 3 && Math.floor(this.t * 2) % 2) text('toque para continuar', 320, 434, 26, '#777', 'center');
  },
};

// ---------------- CRÉDITOS DO CAPÍTULO 2 ----------------
const Credits2 = Object.create(Credits);
Credits2.enter = function () {
  Credits.enter.call(this);
  const sp = k => () => SPR[k];
  this.items = [
    { title: 'PERDIDO', size: 56 },
    { text: 'CAPÍTULO 2: DETERMINAÇÃO', size: 34, c: '#ff3b4a' },
    { gap: 60 },
    { text: 'ELENCO', size: 34, c: '#ff9a3a' },
    { spr: () => SPR.player.down[0], text: 'VOCÊ — de olhos vermelhos' },
    { spr: () => SPR.partySet.kai.down[0], text: 'KAI' },
    { spr: () => SPR.partySet.luna.down[0], text: 'LUNA' },
    { spr: () => SPR.dragon[G.dragon || 'lava'].right[0], text: (DRAGONS[G.dragon] || DRAGONS.lava).name.toUpperCase() },
    { spr: sp('jorge'), text: 'SEU JORGE, o pescador' },
    { spr: () => SPR.morador.m2, text: 'O POVO DA VILA AURORA' },
    { spr: sp('leao'), text: 'MESTRE LEÃO' },
    { spr: sp('marsh'), text: 'MARSHMALLOW e CHOCOLATE' },
    { spr: sp('macaron'), text: 'MACARON (na cadeia)' },
    { spr: sp('instrSoul'), text: 'CARMINO, o Instrutor' },
    { spr: sp('encapuzado'), text: 'O MESTRE ENCAPUZADO' },
    { spr: sp('carmimDemon'), text: 'CARMIM' },
    { gap: 40 },
    { text: 'IDEIA E HISTÓRIA', size: 30, c: '#ff9a3a' },
    { text: 'Heitorcoser' },
    { text: 'PROGRAMAÇÃO, ARTE E MÚSICA', size: 30, c: '#ff9a3a' },
    { text: 'Claude' },
    { text: 'INSPIRADO EM', size: 30, c: '#ff9a3a' },
    { text: 'Undertale e Deltarune, de Toby Fox' },
    { gap: 80 },
    { text: 'Em memória do Instrutor Carmino,', c: '#9fe4ff' },
    { text: 'que escolheu poupar todo mundo.', c: '#9fe4ff' },
    { gap: 80 },
    { text: 'Obrigado por jogar!', size: 40 },
    { gap: 40 },
    { text: 'VOCÊ COMPLETOU O CAPÍTULO 2', size: 34, c: '#7aff9a' },
    { gap: 20 },
    { text: 'CAPÍTULO 3 EM BREVE...', size: 40, c: '#ff9a3a' },
  ];
  let y = 0;
  for (const it of this.items) { it.y = y; y += it.gap || (it.spr || it.draw ? 110 : (it.size || 30) + 22); }
  this.total = y;
};
