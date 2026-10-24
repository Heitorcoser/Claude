// FASE 11 — A BATALHA
// Um salão dourado e silencioso. No fim dele, o MESTRE ENCAPUZADO. Agora é a luta de
// verdade: se você venceu a primeira parte na ponte, começa direto na segunda parte;
// se não, a luta é inteira, do começo ao ataque final.
'use strict';

MAPS.salao = {
  music: 'encontro',
  start: { x: tx2x(4), y: ty2y(8), dir: 'right' },
  anim: '',

  build() {
    const MW = 70, MH = 16;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    rect(2, 5, 64, 6, 'f');
    rect(2, 2, 64, 3, 'H');
    for (let x = 6; x < 64; x += 6) { g[5][x] = 'P'; g[10][x] = 'P'; g[3][x - 3] = 'J'; g[2][x - 3] = 'J'; }
    return { g };
  },

  solid(c) { return c !== 'f'; },

  tileImg(c, x, y, W) {
    const T = SPR.arenaT;
    if (c === 'f') return T.gold[(x + y) % 2];
    if (c === 'P') return T.pillar;
    if (c === 'J') return T.window;
    if (c === 'H') return T.goldWall;
    return y > 10 ? T.goldWall : SPR.deepT.void;
  },

  ents(W) {
    const F = G.flags;
    return [
      { id: 'star', x: tx2x(10), y: ty2y(8), w: 12, h: 8, spr: 'star', solid: true, talk: () => P11.useStar() },
      { id: 'mestre', x: tx2x(58), y: ty2y(8), w: 16, h: 10, solid: true, hidden: !F.p11seen || !!F.p11done, alpha: 1, talk: () => P11.meet(),
        draw(sx, sy, t) { drawSpr(SPR.encapuzado, sx(this.x - 8), sy(this.y - 24) + Math.sin(t * 1.5), 2, this.alpha); } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [{ x: 46, y: 5, w: 2, h: 6, when: () => F.p11arrived && !F.p11done && !P11.busy, run: () => P11.meet() }];
  },

  setup(W) {},
  onEnter(W) { if (!G.flags.p11arrived) P11.arrive(); },
  musicAt() { return 'encontro'; },
  update(W) { if (!W.locked && Game.scene === 'world' && Sfx.current !== 'encontro' && !G.flags.p11done) Sfx.playMusic('encontro'); },

  overlay(W, sx, sy) {
    // raios de luz das janelas
    const t = W.t;
    for (let x = 3; x < 64; x += 6) {
      const px = sx(x * TS + 8), py = sy(3 * TS);
      if (px < -120 || px > 760) continue;
      ctx.fillStyle = `rgba(255,240,180,${0.12 + Math.sin(t + x) * 0.03})`;
      ctx.beginPath(); ctx.moveTo(px - 12, py); ctx.lineTo(px + 12, py); ctx.lineTo(px + 80, py + 260); ctx.lineTo(px + 30, py + 260); ctx.fill();
    }
  },

  interactTile(W, c) {
    if (c === 'J') return W.say(['* (Uma janela. A luz lá fora é dourada, como se fosse sempre fim de tarde.)']);
    if (c === 'P') return W.say(['* (Uma coluna dourada. Dá pra ver seu reflexo nela.)']);
  },
  talkInstr() {},
};

// ---------------- Roteiros da Fase 11 ----------------
const P11 = {
  busy: false,
  ent(id) { return World.ents.find(e => e.id === id); },

  async arrive() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; F.p11arrived = true;
    p.x = tx2x(4); p.y = ty2y(8); p.dir = 'right'; W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('encontro'); Fade.to(0, 0.8);
    await wait(0.6);
    await W.say(['* (Um salão dourado e silencioso.)', '* (Seus passos ecoam entre as colunas.)', '* (Você aperta a FACA DO LEÃO na mão.)', '* (Você sabe quem está te esperando no fim.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async meet() {
    const W = World, F = G.flags, p = W.player, m = this.ent('mestre');
    if (this.busy || F.p11done) return;
    this.busy = true; W.locked = true;
    Sfx.stopMusic();
    await W.walk(p, [[tx2x(50), ty2y(8)]], 50);
    p.dir = 'right';
    if (!F.p11seen) {
      F.p11seen = true;
      Object.assign(m, { hidden: false, alpha: 0 });
      Sfx.whoosh();
      for (let i = 0; i < 40; i++) { await nextFrame(); m.alpha = i / 40; }
      m.alpha = 1;
      await W.say([
        'S: ...Você veio.',
        F.p9part1 ? 'S: Na ponte, você venceu a primeira parte.' : 'S: Na ponte, você caiu com 1 de HP. Eu disse: "quando estiver preparado".',
        'S: E agora você está. Dá pra sentir. A faca do Leão. Os olhos de quem não foge mais.',
        'S: Sem dragão. Sem amigos. Sem conversa. Sem misericórdia.',
        'S: ...',
        'S: A BATALHA VAI COMEÇAR.',
      ]);
    } else {
      m.hidden = false; m.alpha = 1;
      await W.say(['S: De novo.', 'S: Eu espero quantas vezes for preciso.', 'S: A BATALHA VAI COMEÇAR.']);
    }
    W.saveHere(0);
    Sfx.slam(); W.shake = 0.6;
    this.busy = false;
    W.battle('mestre', { part: F.p9part1 ? 2 : 'full' }, res => this.after(res));
  },

  async after(res) {
    const W = World, F = G.flags, m = this.ent('mestre');
    W.locked = true;
    m9Tries(0);
    F.p11done = true;
    Sfx.playMusic('encontro');
    const r = route();
    if (res === 'spared') {
      F.masterSpared = true;
      await W.say([
        'S: ...Você me poupou.',
        'S: Eu quebrei a sua misericórdia duas vezes. E ela voltou duas vezes.',
        'S: Agora eu tenho certeza.',
        '* (Ele abaixa um pouco o capuz. Debaixo dele, só escuridão... e um olho azul que sorri.)',
        'S: Quando chegar a hora, lá embaixo... eu vou lutar do SEU lado.',
      ]);
    } else if (r === 'genocida') {
      await W.say(['S: Hah... forte. Forte demais.', 'S: Então é isso que você virou.', 'S: Tomara que o que está lá embaixo consiga te parar.']);
    } else {
      await W.say(['S: Hah... hah...', 'S: Você é forte de verdade agora.', 'S: Não por causa da faca. Por causa de você.']);
    }
    await W.say(['S: Siga em frente. O caminho continua.', 'S: Eu vou estar olhando.']);
    Sfx.whoosh();
    for (let i = 0; i < 40; i++) { await nextFrame(); m.alpha = 1 - i / 40; m.y -= 0.5; }
    m.hidden = true;
    await W.say(['* (O Mestre Encapuzado sumiu numa nuvem de poeira azul.)', '* (Você venceu a batalha.)']);
    W.saveHere(0);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goEnd(11);
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere(0);
    await W.say(['* (O silêncio do salão... você respira fundo.)', '* (Você está cheio de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
