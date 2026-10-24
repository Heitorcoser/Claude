// FASE 5 — A ILHA DOS DOCES
// Uma crítica ao nazismo: na ilha, os doces se dizem "raça superior" e prendem
// robôs, humanos e fantasmas num campo de trabalho forçado. O jogador perde o
// nome (vira um número), passa fome, trabalha, resiste, foge, chama os amigos
// e detém o Diretor Macaron Dourado.
'use strict';

const WALK5 = 'hdfcgybmEo';
const BRICKS_NEEDED = 6;
const ROLL_SPOT = { x: 76, y: 24 };

function gummyNpc(id, k, tx, ty, talk) {
  return { id, x: tx2x(tx), y: ty2y(ty), w: 14, h: 8, solid: true, talk, k,
    draw(sx, sy, t) { drawSpr(SPR.gummy[this.k], sx(this.x - 7), sy(this.y - 15) + Math.round(Math.sin(t * 3 + this.x)), 2, this.alpha ?? 1); } };
}
function sprNpc(id, spr, tx, ty, talk, opts = {}) {
  return { id, x: tx2x(tx), y: ty2y(ty), w: opts.w || 14, h: 8, solid: opts.solid ?? true, talk, spr, hidden: !!opts.hidden, scale: opts.scale || 2,
    draw(sx, sy, t) {
      const img = typeof this.spr === 'function' ? this.spr(t) : SPR[this.spr], s = this.scale;
      drawSpr(img, sx(this.x - img.width * s / 4), sy(this.y - img.height * s / 2) + (opts.bob ? Math.round(Math.sin(t * 2 + this.x) * 2) : 0), s, this.alpha ?? 1);
    } };
}
function guardEnt(id, path) {
  return { id, guard: true, x: tx2x(path[0][0]), y: ty2y(path[0][1]), w: 14, h: 8, solid: false, path, pi: 1, ang: 0, hidden: true,
    talk: () => P5.guardTalk(),
    draw(sx, sy, t) { drawSpr(SPR.guard, sx(this.x - 8), sy(this.y - 17), 2); } };
}

MAPS.ilha = {
  music: 'doce',
  start: { x: tx2x(5), y: ty2y(7), dir: 'down' },
  anim: 'X',

  build() {
    const MW = 112, MH = 74;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('X'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    const house = (x, y, w, h, doorX) => {
      rect(x, y, w, h - 2, 'R'); rect(x, y + h - 2, w, 2, 'H');
      g[y + h - 2][x + 1] = 'w'; g[y + h - 2][x + w - 2] = 'w'; g[y + h - 1][doorX] = 'D';
    };
    // hospital
    rect(1, 1, 24, 13, '#'); rect(2, 2, 22, 11, 'h'); g[13][12] = 'd';
    // cidade dos doces
    rect(1, 14, 40, 23, 'f'); rect(1, 24, 40, 2, 'c'); rect(12, 14, 2, 23, 'c');
    house(24, 15, 8, 6, 27); house(3, 28, 7, 6, 6); house(30, 28, 8, 6, 33); house(17, 28, 7, 6, 20);
    for (const [x, y] of [[5, 16], [9, 20], [20, 17], [36, 16], [38, 21], [15, 35], [28, 35], [39, 35]]) g[y][x] = 'L';
    rect(41, 24, 3, 2, 'c');
    // campo
    rect(44, 4, 64, 64, 'F'); rect(45, 5, 62, 62, 'g');
    g[24][44] = 'G'; g[25][44] = 'G';
    rect(47, 6, 16, 10, 'B'); rect(48, 7, 14, 8, 'b'); g[15][54] = 'd';
    rect(66, 6, 10, 7, 'B'); rect(67, 7, 8, 5, 'm'); g[12][70] = 'd';
    rect(64, 18, 26, 14, 'y');
    rect(68, 38, 30, 16, 'B'); rect(69, 39, 28, 14, 'm'); g[38][82] = 'd';
    rect(92, 8, 14, 14, 'T'); rect(93, 9, 12, 12, 'E'); g[21][98] = 'Z';
    rect(47, 58, 6, 6, 'B'); rect(48, 59, 4, 4, 'b');
    g[67][80] = G.flags.p5cut ? 'o' : 'Q';
    // lado de fora (sul)
    rect(45, 68, 61, 4, 'f');
    return { g };
  },

  solid(c) {
    if (c === 'G') return !G.flags.p5free;
    return !WALK5.includes(c);
  },

  tileImg(c, x, y, W) {
    const T = SPR.islT, h = (x * 73 + y * 151) % 3;
    const m = { h: T.hosp[h], f: T.frost[h], c: T.cookie[h], g: T.dirt[h], y: T.gravel[h], b: T.boards[h], m: T.factory[h], E: T.carpet[h],
      H: T.wafer, R: T.icing, w: T.waferWin, D: T.waferDoor, F: T.fence, G: G.flags.p5free ? T.dirt[0] : T.gate, Q: T.fence, o: T.fenceCut,
      B: T.concrete, T: T.tower, Z: T.towerDoor, d: T.door, X: T.sea[0] };
    if (c === 'Q') return T.fenceWeak;
    if (c === 'L') return MAPS.dragoncity.layer(T.frost[h], T.lolli);
    if (c === '#') return y < 14 ? T.hospWall : T.void;
    return m[c] || T.void;
  },
  animImg(c, x, y, fr) { return c === 'X' ? SPR.islT.sea[(fr + x + y) % 3] : null; },

  ents(W) {
    const F = G.flags;
    const list = [
      { id: 'star1', x: tx2x(20), y: ty2y(8), w: 12, h: 8, spr: 'star', solid: true, talk: () => P5.useStar() },
      { id: 'star2', x: tx2x(60), y: ty2y(70), w: 12, h: 8, spr: 'star', solid: true, hidden: !F.p5out, talk: () => P5.useStar() },
      { id: 'bedP', x: tx2x(5), y: ty2y(5), w: 18, h: 24, spr: 'bed', solid: true, talk: () => W.say(['* (A cama onde você acordou. O lençol tem desenhos de balas.)']) },
      { id: 'bed2', x: tx2x(10), y: ty2y(5), w: 18, h: 24, spr: 'bed', solid: true, talk: () => W.say(['* (Um doce dorme aqui, todo enfaixado. Ele acorda, te vê e vira para o outro lado.)']) },
      { id: 'bed3', x: tx2x(15), y: ty2y(5), w: 18, h: 24, spr: 'bed', solid: true, talk: () => W.say(['* (Uma cama vazia, cheirando a algodão-doce.)']) },
      sprNpc('marsh', 'marsh', 8, 8, () => P5.talkMarsh(), { hidden: !!F.p5camp && !F.p5free }),
      sprNpc('choco', 'choco', 12, 11, () => P5.talkChoco(), { hidden: true }),
      sprNpc('piru', 'pirulito', 47, 26, () => P5.guardTalk('Y'), { hidden: !F.p5camp || !!F.p5free }),
      gummyNpc('g1', 'g1', 8, 26, () => P5.citizen(1)),
      gummyNpc('g2', 'g2', 22, 22, () => P5.citizen(2)),
      gummyNpc('g3', 'g3', 34, 34, () => P5.citizen(3)),
      gummyNpc('g4', 'g4', 18, 26, () => P5.citizen(4)),
      { id: 'sign1', x: tx2x(14), y: ty2y(15), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(['* (Uma placa na porta do hospital:)', "* 'HOSPITAL DOS DOCES. Não-doces: PROIBIDA A ENTRADA.'"]) },
      { id: 'post1', x: tx2x(23), y: ty2y(24), w: 14, h: 6, spr: 'poster', solid: true,
        talk: () => W.say(['* (Um cartaz de propaganda:)', "* 'DOCES: O POVO PERFEITO. O RESTO SERVE.'", '* (Alguém escreveu embaixo, bem pequeno: "mentira".)']) },
      { id: 'post2', x: tx2x(40), y: ty2y(23), w: 14, h: 6, spr: 'poster', solid: true,
        talk: () => W.say(["* (Um cartaz: 'CAMPO DE TRABALHO DOCE: ORDEM, AÇÚCAR E OBEDIÊNCIA.')", '* (Estão sorrindo no cartaz. Ninguém sorri lá dentro.)']) },
      { id: 'post3', x: tx2x(64), y: ty2y(17), w: 14, h: 6, spr: 'poster', solid: true,
        talk: () => W.say(["* (Um cartaz: 'O TRABALHO TORNA O NÚMERO ÚTIL.')", '* (Você sente um frio na barriga lendo isso.)']) },
      // barracão
      { id: 'bunk1', x: tx2x(49), y: ty2y(9), w: 16, h: 24, spr: 'bunk', solid: true, talk: () => P5.bunk() },
      { id: 'bunk2', x: tx2x(49), y: ty2y(13), w: 16, h: 24, spr: 'bunk', solid: true, talk: () => P5.bunk() },
      { id: 'bunk3', x: tx2x(60), y: ty2y(9), w: 16, h: 24, spr: 'bunk', solid: true, talk: () => W.say(['* (O beliche do Ferrugem. Tem um parafuso guardado como tesouro.)']) },
      { id: 'bunk4', x: tx2x(60), y: ty2y(13), w: 16, h: 24, spr: 'bunk', solid: true, talk: () => W.say(['* (O beliche da Lia. Tem um desenho de uma casa com sol.)']) },
      sprNpc('vovo', 'vovo', 55, 9, () => P5.talkVovo(), { bob: true, hidden: !F.p5camp && !F.p5free }),
      sprNpc('ferr', t => SPR.robot.ferrugem.right[Math.floor(t * 2) % 2], 58, 12, () => P5.talkFerrugem(), { hidden: !F.p5camp && !F.p5free }),
      sprNpc('lia', 'lia', 52, 12, () => P5.talkLia(), { hidden: !F.p5camp && !F.p5free }),
      // refeitório
      { id: 'pot', x: tx2x(70), y: ty2y(8), w: 18, h: 8, spr: 'pot', solid: true, talk: () => P5.soup() },
      gummyNpc('cook', 'g3', 72, 8, () => P5.guardTalk()),
      // obra
      { id: 'pile', x: tx2x(49), y: ty2y(44), w: 22, h: 8, spr: 'brickPile', solid: true, talk: () => P5.pile() },
      { id: 'site', x: tx2x(58) + 8, y: ty2y(48), w: 44, h: 16, solid: true, talk: () => P5.site(),
        draw(sx, sy) {
          const n = G.flags.p5task1 ? BRICKS_NEEDED : (G.p5bricks || 0), x = sx(this.x - 22), y = sy(this.y - 16);
          ctx.fillStyle = '#000'; ctx.fillRect(x - 2, y + 28, 92, 6);
          for (let i = 0; i < n; i++) { const r = Math.floor(i / 3), c = i % 3; drawSpr(SPR.brick, x + 4 + c * 28 + (r % 2) * 10, y + 14 - r * 16, 2.6); }
          if (n >= BRICKS_NEEDED) {
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x - 6, y - 18); ctx.lineTo(x + 44, y - 50); ctx.lineTo(x + 94, y - 18); ctx.fill();
            ctx.fillStyle = '#ff7ab0'; ctx.beginPath(); ctx.moveTo(x - 2, y - 20); ctx.lineTo(x + 44, y - 46); ctx.lineTo(x + 90, y - 20); ctx.fill();
            text('SOMENTE DOCES', x + 44, y + 36, 18, '#ffd23a', 'center');
          } else text(`${n}/${BRICKS_NEEDED}`, x + 44, y + 36, 22, '#fff', 'center');
        } },
      // fábrica
      { id: 'belt', x: tx2x(82), y: ty2y(46), w: 120, h: 12, solid: true, talk: () => P5.factory(),
        draw(sx, sy, t) {
          const x = sx(this.x - 60), y = sy(this.y - 14);
          ctx.fillStyle = '#000'; ctx.fillRect(x, y, 240, 30);
          ctx.fillStyle = '#2a2a32'; ctx.fillRect(x + 2, y + 2, 236, 26);
          ctx.fillStyle = '#4a4a56'; for (let i = 0; i < 12; i++) ctx.fillRect(x + 4 + ((i * 20 + t * 40) % 232), y + 4, 10, 22);
          drawSpr(SPR.gummy.g3, x + 100 + ((t * 40) % 120), y - 6, 1.2);
        } },
      sprNpc('chocoF', 'choco', 90, 42, () => P5.talkChoco(), { hidden: true }),
      // chamada
      { id: 'mark', x: tx2x(ROLL_SPOT.x), y: ty2y(ROLL_SPOT.y), w: 0, h: 0, solid: false,
        draw(sx, sy, t) { if (!P5.roll) return; ctx.strokeStyle = '#ffe680'; ctx.lineWidth = 3; const x = sx(this.x), y = sy(this.y - 6); ctx.beginPath(); ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10); ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10); ctx.stroke(); } },
      sprNpc('ferrY', t => SPR.robot.ferrugem.sad, 74, 29, () => {}, { hidden: true }),
      sprNpc('piruY', 'pirulito', 71, 29, () => {}, { hidden: true }),
      // libertação
      sprNpc('bitL', t => SPR.robot.bit.right[Math.floor(t * 3) % 2], 62, 70, () => W.say(['B: Bit pronto pra resgate! BIP!']), { hidden: true }),
      { id: 'dragL', x: tx2x(66), y: ty2y(70), w: 22, h: 10, solid: true, hidden: true, talk: () => W.say(['D: GRRRAAAWR! (Seu dragão está pronto.)']),
        draw(sx, sy, t) { if (!G.dragon) return; const img = SPR.dragon[G.dragon].left[Math.floor(t * 4) % 2]; drawSpr(img, sx(this.x - 13), sy(this.y - 22) + Math.sin(t * 2) * 2, 2); } },
      sprNpc('macaronB', 'macaron', 98, 12, () => {}, { hidden: !!F.p5boss, w: 28 }),
      // guardas de patrulha (só à noite)
      guardEnt('gd1', [[50, 34], [100, 34]]),
      guardEnt('gd2', [[66, 18], [66, 60]]),
      guardEnt('gd3', [[56, 58], [100, 58]]),
      guardEnt('gd4', [[100, 64], [60, 64]]),
      sprNpc('guardDay', t => SPR.guard, 62, 22, () => P5.guardTalk(), { hidden: !F.p5camp || !!F.p5free }),
    ];
    return list;
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 64, y: 32, w: 26, h: 5, when: () => F.p5task2 && !F.p5fight1, run: () => P5.ferrugemScene() },
      { x: 45, y: 68, w: 61, h: 4, when: () => F.p5cut && !F.p5out, run: () => P5.outside() },
      { x: 76, y: 32, w: 8, h: 3, when: () => F.p5camp && !F.p5yardHint, run: () => { F.p5yardHint = true; P5.note(['* (O pátio. Uma torre dourada brilha no canto: a TORRE DO DIRETOR.)']); } },
    ];
  },

  setup(W) {
    const F = G.flags;
    if (F.p5out && !F.p5free) Object.assign(W.instr, { kind: undefined, visible: !!F.p5called, follow: !!F.p5called });
    if (F.p5free && !F.p5end) Object.assign(W.instr, { kind: undefined, visible: true, follow: true });
    if (F.p5night2 && !F.p5cut) for (const e of W.ents) if (e.guard) e.hidden = false;
    if (F.p5night2) { const gd = W.ents.find(e => e.id === 'guardDay'); if (gd) gd.hidden = true; }
  },
  onEnter(W) { if (!G.flags.p5arrived) P5.arrive(); },

  musicAt(W) {
    const F = G.flags, [x, y] = W.feetTile();
    if (F.p5free) return x >= 92 && y < 22 ? 'macaron' : 'resistencia';
    if (F.p5night2 && !F.p5out) return 'fuga';
    if (x < 44) return 'doce';
    return 'campo';
  },

  speedMul() { return (G.flags.p5camp && !G.flags.p5out && (G.hunger ?? 100) < 25) ? 0.65 : 1; },

  update(W, dt) {
    const F = G.flags, p = W.player;
    if (P5.mini) { P5.updateMini(dt); return; }
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
    // fome
    if (F.p5camp && !F.p5out && !F.p5free && !F.p5night2) {
      const rate = 100 / 240 * (p.carry ? 1.8 : 1) * (p.moving ? 1 : 0.5);
      G.hunger = Math.max(0, (G.hunger ?? 70) - rate * dt);
      if (G.hunger <= 0) return P5.faint();
    }
    // chamada
    if (P5.roll) {
      P5.roll.t -= dt;
      if (Math.hypot(p.x - tx2x(ROLL_SPOT.x), p.y - ty2y(ROLL_SPOT.y)) < 18) return P5.rollDone(true);
      if (P5.roll.t <= 0) return P5.rollDone(false);
    }
    // patrulha noturna
    if (F.p5night2 && !F.p5cut) P5.patrol(W, dt);
  },

  overlay(W, sx, sy) {
    const F = G.flags, t = W.t;
    const night = (F.p5night1 && !F.p5day2) || (F.p5night2 && !F.p5out);
    if (night) {
      ctx.fillStyle = 'rgba(5,5,25,0.62)'; ctx.fillRect(0, 0, 640, 480);
    }
    if (F.p5night2 && !F.p5cut) {
      for (const e of W.ents) if (e.guard && !e.hidden) {
        const x = sx(e.x), y = sy(e.y - 8), L = 80 * 2, a = e.ang;
        ctx.fillStyle = 'rgba(255,240,150,0.28)';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - 0.5) * L, y + Math.sin(a - 0.5) * L); ctx.lineTo(x + Math.cos(a + 0.5) * L, y + Math.sin(a + 0.5) * L); ctx.fill();
        if (F.p5map) {
          ctx.strokeStyle = 'rgba(255,90,90,0.5)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sx(tx2x(e.path[0][0])), sy(ty2y(e.path[0][1]) - 8)); ctx.lineTo(sx(tx2x(e.path[1][0])), sy(ty2y(e.path[1][1]) - 8)); ctx.stroke(); ctx.setLineDash([]);
        }
      }
    }
    if (F.p5night2 && !F.p5cut) { // cerca fraca brilhando
      const x = sx(80 * TS), y = sy(67 * TS), k = 0.5 + Math.sin(t * 5) * 0.5;
      ctx.strokeStyle = `rgba(255,150,60,${0.5 + k * 0.5})`; ctx.lineWidth = 3; ctx.strokeRect(x - 2, y - 2, 36, 36);
      ctx.fillStyle = `rgba(255,150,60,${0.15 + k * 0.2})`; ctx.fillRect(x, y, 32, 32);
    }
    if (F.p5inCell && !W.locked) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, 640, 480); }
    // HUD da fome
    if (F.p5camp && !F.p5out && !F.p5free) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(10, 10, 190, 58);
      text(displayName(), 20, 12, 26, '#c8c8d4');
      text('FOME', 20, 38, 22, '#fff');
      ctx.fillStyle = '#333'; ctx.fillRect(72, 44, 116, 14);
      const hu = G.hunger ?? 70;
      ctx.fillStyle = hu < 25 ? '#ff5a5a' : hu < 50 ? '#ffd23a' : '#7aff7a'; ctx.fillRect(72, 44, 116 * hu / 100, 14);
      if (hu < 25 && Math.floor(t * 2) % 2) text('com muita fome...', 200, 40, 20, '#ff9a9a');
    }
    if (P5.roll) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(10, 76, 190, 44);
      text(`CHAMADA: ${Math.ceil(P5.roll.t)}s`, 105, 82, 28, P5.roll.t < 8 ? '#ff5a5a' : '#ffe680', 'center');
    }
    if (P5.mini) P5.drawMini();
  },

  async talkInstr(W) {
    if (G.flags.p5called && !G.flags.p5free) {
      const r = await W.ask('T: Prontos para libertar o campo?', ['Vamos!', 'Ainda não']);
      if (r === 0) return P5.liberate();
      return;
    }
    return W.say(['T: Estou com você, pequeno. Vamos acabar com isso.']);
  },

  interactTile(W, c, tx, ty) {
    if (c === 'D') return W.say(['* (Uma casa de doce. Na porta: "SOMENTE DOCES".)']);
    if (c === 'G') return W.say(['* (O portão do campo. Trancado por fora. Tem guardas do outro lado.)']);
    if (c === 'Q') return P5.fence();
    if (c === 'F') {
      if (G.flags.p5night2 && !G.flags.p5cut) return W.say(['* (Esta parte da cerca é forte demais para o alicate.)', '* (A cerca FRACA, enferrujada, fica no lado de BAIXO (SUL) do campo, bem no MEIO. Siga a seta amarela.)']);
      return W.say(['* (Uma cerca alta. Do outro lado, o mar de chocolate e a liberdade.)']);
    }
    if (c === 'Z') return G.flags.p5free ? null : W.say(['* (A porta da TORRE DO DIRETOR. Dourada. Trancada.)']);
    if (c === 'X') return W.say(['* (O mar de chocolate. Cheira bem, mas ninguém aqui pode aproveitar.)']);
  },
};

// ---------------- CUTSCENE: o ataque dos fantasmas ----------------
const Cine5 = {
  t: 0, panel: 0, shake: 0, white: 0,
  async run() {
    Game.cine = this;
    const say = items => Dialog.show(items.map(t => {
      const m = /^([FG]):\s*(.*)$/s.exec(t);
      return m ? { who: m[1] === 'F' ? 'fire' : 'ice', t: '* ' + m[2] } : { t };
    }), false);
    Object.assign(this, { t: 0, panel: 0, shake: 0, white: 0 });
    Fade.a = 1; Fade.to(0, 0.8);
    Sfx.playMusic('house');
    await wait(0.6);
    await say(['* (Você caminha sozinho pela Cidade Futurista, à noite.)', '* (De repente, o ar fica gelado...)']);
    this.panel = 1; Sfx.freeze(); this.shake = 0.6;
    Sfx.playMusic('icetheme');
    await say(['G: Achou que o escorregador era o fim, humano?',
      G.flags.fireFriend ? 'F: Irmão, CHEGA! Ele é legal! Ele riu das minhas piadas!' : 'F: (fraquinho) ...a gente... avisou...',
      'G: Silêncio! Ele vai pagar. VINGANÇA!', 'G: TEMPESTADE DE GELO!']);
    this.white = 1.5; this.shake = 2; Sfx.boo();
    await wait(1.4);
    this.panel = 2; Sfx.stopMusic(); Sfx.whoosh();
    await say(['* (Tudo fica branco...)', '* (...e depois, escuro.)', '* (O vento gelado te carrega para muito, muito longe.)']);
    await Fade.to(1, 1.2);
    Game.enterMap('ilha');
  },
  update(dt) { this.t += dt; if (this.shake > 0) this.shake -= dt; if (this.white > 0) this.white -= dt * 0.7; Dialog.update(dt); },
  draw() {
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8);
    ctx.fillStyle = '#05030f'; ctx.fillRect(0, 0, W, H);
    if (this.panel < 2) {
      P4.drawSkyline(this.t, 0.6);
      drawSpr(SPR.player.right[Math.floor(this.t * 6) % 4 * (this.panel ? 0 : 1)], 150, 300, 3);
      if (this.panel === 1) {
        drawGhost('ice', 360, 140 + Math.sin(this.t * 2) * 5, 4.5, this.t, 1, true);
        drawGhost('fire', 470, 190 + Math.sin(this.t * 3) * 5, 2.8, this.t, G.flags.fireFriend ? 1 : 0.5, true);
      }
    }
    ctx.restore();
    if (this.white > 0) { ctx.fillStyle = `rgba(230,250,255,${Math.min(1, this.white)})`; ctx.fillRect(0, 0, W, H); }
    Dialog.draw();
  },
};

// ---------------- Roteiros da Fase 5 ----------------
const P5 = {
  roll: null, mini: null,
  ent(id) { return World.ents.find(e => e.id === id); },
  async note(lines) { const W = World; W.locked = true; await W.say(lines); W.locked = false; },

  async arrive() {
    const W = World, p = W.player, F = G.flags;
    W.locked = true;
    F.p5arrived = true;
    p.x = tx2x(5); p.y = ty2y(5) - 4; p.lying = true;
    W.updateCam(true);
    Fade.a = 1; Fade.to(0, 0.5);
    await wait(1.2);
    Sfx.playMusic('doce');
    await W.say(['* (...)', '* (Cheiro de açúcar. Um teto cor-de-rosa.)']);
    p.lying = false; p.y = ty2y(7); p.dir = 'right';
    await W.say([
      'M: Ah! Você acordou! Que susto!',
      'M: Te encontraram desmaiado na praia, todo congelado. Parecia que uma tempestade de gelo tinha te atingido.',
      'M: Eu sou a MARSHMALLOW, enfermeira deste hospital.',
      'M: Bem-vindo à ILHA DOS DOCES.',
      'M: ...Espera.',
      'M: Você não é um doce, é?',
      'M: (sussurrando) Por favor... não conte pra ninguém que você é humano. Aqui não é seguro.',
    ]);
    const ch = this.ent('choco');
    Object.assign(ch, { hidden: false, x: tx2x(12), y: ty2y(12) });
    Sfx.step();
    await W.walk(ch, [[tx2x(11), ty2y(8)]], 45);
    await W.say([
      'H: Enfermeira Marshmallow! Vim conferir o paciente novo. Ordens do Diretor.',
      'H: ...',
      'H: Isso aí não é um doce.',
      'M: Ele está ferido, Chocolate! Ele precisa descansar!',
      'H: Desculpa, Marshmallow. As regras são claras: não-doces não podem ficar no hospital dos doces.',
      'H: (mais baixo) ...Eu não faço as regras.',
      'H: Você vem comigo. Para o CAMPO.',
    ]);
    // escolta pela cidade
    await Promise.all([
      W.walk(ch, [[tx2x(12) + 8, ty2y(13)], [tx2x(12) + 8, ty2y(24)], [tx2x(22), ty2y(24) + 8]], 55),
      (async () => { await wait(0.5); await W.walk(p, [[tx2x(12) + 8, ty2y(12)], [tx2x(12) + 8, ty2y(23)], [tx2x(19), ty2y(24) + 8]], 55); })(),
    ]);
    await W.say([
      '* (A Ilha dos Doces é linda: casas de biscoito, árvores de pirulito, um mar de chocolate.)',
      '* (Mas os doces na rua te olham com nojo. Uma mãe jujuba esconde o filho atrás dela.)',
      "* (Em todo canto, cartazes: 'DOCES: O POVO PERFEITO. O RESTO SERVE.')",
      'H: Não olha pra eles. É pior.',
    ]);
    await Promise.all([W.walk(ch, [[tx2x(42), ty2y(24) + 8]], 60), (async () => { await wait(0.4); await W.walk(p, [[tx2x(40), ty2y(24) + 8]], 60); })()]);
    await Fade.to(1, 2);
    // dentro do campo
    F.p5camp = true; F.p5uniform = true; G.hunger = 70; G.p5bricks = 0;
    F.phone = false; F.p5phoneTaken = true;
    ch.hidden = true;
    const piru = this.ent('piru'); piru.hidden = false;
    for (const id of ['vovo', 'ferr', 'lia', 'guardDay']) this.ent(id).hidden = false;
    this.ent('marsh').hidden = true;
    p.x = tx2x(46); p.y = ty2y(26); p.dir = 'right';
    W.updateCam(true);
    Sfx.playMusic('campo');
    await Fade.to(0, 1.5);
    await W.say([
      '* (O portão do campo se fecha atrás de você com um barulho seco.)',
      'Y: Mais um NÚMERO.',
      'Y: Nome?',
      '* (Você abre a boca pra dizer seu nome...)',
      'Y: Não interessa. Aqui você é o NÚMERO 4812.',
      'Y: Regra 1: TRABALHAR. Regra 2: OBEDECER. Regra 3: NÚMEROS NÃO FALAM COM DOCES.',
      'Y: Esse celular? CONFISCADO.',
      '* (O Capataz Pirulito tomou seu CELULAR.)',
      'Y: E veste isso.',
      '* (Você recebeu um uniforme cinza com o número 4812 costurado no peito.)',
      'Y: Comida só no horário da SOPA. Se desmaiar de fome, problema seu.',
      'Y: Agora: OBRA. Carregue os blocos de açúcar até a construção, lá no sul. VAI!',
      '* (Fique de olho na sua FOME no canto da tela.)',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  talkMarsh() { return World.say(['M: Descansa um pouco. Aqui ninguém vai te machucar... por enquanto.']); },
  talkChoco() {
    if (G.flags.p5free) return World.say(['H: Eu vou contar tudo o que vi. Pra ninguém esquecer.']);
    return this.guardTalk('H');
  },

  citizen(n) {
    const W = World;
    if (G.flags.p5free) {
      const L = { 1: ['* (A jujuba vermelha tira o cartaz da janela, envergonhada.)'], 2: ['* "A gente fingia que não via. Isso também foi errado."'], 3: ['* "Seja bem-vindo à ilha. De verdade, desta vez."'], 4: ['* "Meu filho perguntou por que vocês estavam presos. Eu não soube responder."'] };
      return W.say(L[n]);
    }
    const L = { 1: ['* (A jujuba vermelha vira a cara.) "Não fala comigo, NÃO-DOCE."'], 2: ['* "Hmpf. Os cartazes dizem que vocês são perigosos."', '* (Ela não parece ter certeza.)'],
      3: ['* (A jujuba amarela olha para os lados e sussurra:) "...Desculpa."'], 4: ['* "O Diretor Macaron diz que é pro nosso bem. Deve ser, né?"'] };
    return W.say(L[n]);
  },

  async guardTalk(who) {
    const W = World, F = G.flags;
    if (!F.p5camp || F.p5free || F.p5out) return W.say(['* (Ele não diz nada.)']);
    G.p5warn = (G.p5warn || 0) + 1;
    const name = who === 'Y' ? 'Y:' : who === 'H' ? 'H:' : '';
    const lines = [name ? `${name} NÚMEROS NÃO FALAM COM DOCES!` : '* GUARDA: NÚMEROS NÃO FALAM COM DOCES!', `* (Advertência ${G.p5warn} de 3.)`];
    if (who === 'H' && F.p5bread) lines.splice(1, 0, 'H: (sussurrando) ...Não me olha assim. Eles estão vendo.');
    await W.say(lines);
    if (G.p5warn >= 3) {
      G.p5warn = 0;
      W.locked = true;
      await W.say(['* (Os guardas te levam para a SOLITÁRIA.)']);
      await Fade.to(1, 2);
      G.hunger = Math.max(5, (G.hunger ?? 50) - 15);
      await wait(1.5);
      await Dialog.show([{ t: '* (Escuro. Frio. Você não sabe quanto tempo passou.)' }], true);
      const p = W.player; p.x = tx2x(54); p.y = ty2y(13); p.dir = 'down';
      W.updateCam(true);
      await Fade.to(0, 2);
      W.locked = false;
    }
  },

  // ----- fome -----
  async faint() {
    const W = World;
    W.locked = true;
    Sfx.hurt();
    await W.say(['* (Sua visão escurece... a fome é forte demais.)', '* (Você desmaiou.)']);
    await Fade.to(1, 1.5);
    G.hunger = 35; G.hp = Math.max(1, G.hp - 5);
    const p = W.player; p.x = tx2x(54); p.y = ty2y(12); p.dir = 'down'; p.carry = false;
    W.updateCam(true);
    await Fade.to(0, 1.5);
    await W.say(['L: Você acordou! A gente te carregou de volta pro barracão.', 'L: Toma... guardei um pedacinho de pão pra você.', '* (Lia dividiu o pouco que tinha com você.)']);
    W.locked = false;
  },

  // ----- tarefa 1: obra -----
  async pile() {
    const W = World, p = W.player, F = G.flags;
    if (!F.p5camp || F.p5free) return W.say(['* (Uma pilha de blocos de açúcar.)']);
    if (F.p5task1) return W.say(['* (Os blocos que sobraram. Você não quer nem olhar.)']);
    if (p.carry) return W.say(['* (Você já está carregando um bloco. Leve até a obra.)']);
    p.carry = true; Sfx.push();
    if (!G.p5bricks) await W.say(['* (Você pegou um bloco de açúcar. É MUITO pesado.)', '* (Carregar peso dá mais fome.)']);
  },
  async site() {
    const W = World, p = W.player, F = G.flags;
    if (F.p5task1) return W.say(['* (A casa que você construiu. Uma placa diz: "SOMENTE DOCES".)']);
    if (!F.p5camp) return;
    if (!p.carry) return W.say([`* (A obra. Faltam ${BRICKS_NEEDED - (G.p5bricks || 0)} blocos. A pilha fica à esquerda.)`]);
    p.carry = false; G.p5bricks = (G.p5bricks || 0) + 1; Sfx.push();
    if (G.p5bricks < BRICKS_NEEDED) return;
    W.locked = true;
    F.p5task1 = true;
    await W.say([
      '* (A casinha ficou pronta.)',
      "* (Um guarda pendura uma placa na porta: 'SOMENTE DOCES'.)",
      '* (Você construiu uma casa onde nunca vai poder entrar.)',
    ]);
    Sfx.whistle();
    await W.say(['Y: SOPA! Todos os números para o REFEITÓRIO! Fica lá no norte, perto do barracão.']);
    F.p5soupTime = true;
    W.saveHere(0);
    W.locked = false;
  },

  async soup() {
    const W = World, F = G.flags;
    if (!F.p5camp || F.p5free) return W.say(['* (Uma panela vazia.)']);
    if (!F.p5soupTime) return W.say(['* GUARDA: FORA DO HORÁRIO! Volta pro trabalho!']);
    W.locked = true;
    F.p5soupTime = false;
    Sfx.select();
    G.hunger = Math.min(100, (G.hunger ?? 50) + 30);
    await W.say(['* (Uma concha de sopa rala. É quase só água... mas está quente.)']);
    if (!F.p5shared) {
      const r = await W.ask('L: ...Você vai tomar tudo? (Lia está tremendo de fome.)', ['Dividir com Lia', 'Tomar tudo']);
      if (r === 0) {
        F.p5shared = true; G.hunger = Math.max(10, G.hunger - 15);
        await W.say(['* (Você dá metade da sua sopa para a Lia.)', 'L: ...Obrigada.', 'L: Ninguém divide nada aqui. Todo mundo tem fome demais.', 'L: Eu me chamo LIA. Não 2207. LIA.']);
      } else {
        F.p5shared = 'no';
        await W.say(['L: ...Tudo bem. Eu entendo. A fome é muita.']);
      }
    }
    if (!F.p5day2) {
      Sfx.whistle();
      await W.say(['Y: DORMITÓRIO! Luzes apagadas! Quem estiver fora do beliche vai pra SOLITÁRIA!', '* (Volte para o BARRACÃO e deite no seu beliche: o da esquerda.)']);
      F.p5night1 = true;
    } else {
      await W.say(['* (Depois da sopa, vá conversar com a Vovó Fantasma e com o Ferrugem no barracão.)']);
    }
    W.locked = false;
  },

  async bunk() {
    const W = World, F = G.flags;
    if (F.p5night1 && !F.p5day2) {
      W.locked = true;
      await W.say(['* (Você deita no beliche duro.)', 'O: (sussurrando no escuro) Durma, criança. Amanhã é outro dia.', 'O: Eles podem tirar nosso nome. Mas não podem tirar quem a gente é.']);
      await Fade.to(1, 0.8);
      F.p5day2 = true;
      await wait(1);
      await Dialog.show([{ t: '* (Na manhã seguinte...)' }], true);
      const p = W.player; p.x = tx2x(51); p.y = ty2y(13); p.dir = 'down';
      W.updateCam(true);
      await Fade.to(0, 0.8);
      Sfx.whistle();
      await W.say(['Y: CHAMADA! TODOS NO PÁTIO! Quem se atrasar fica SEM COMIDA!', '* (Corra até o X no PÁTIO, a leste do barracão!)']);
      this.roll = { t: 25 };
      W.locked = false;
      return;
    }
    if (F.p5night2 && !F.p5cut) return W.say(['* (Não é hora de dormir. É hora de fugir.)']);
    return W.say(['* (Seu beliche. Duro como pedra de açúcar.)']);
  },

  async rollDone(ok) {
    const W = World, F = G.flags;
    this.roll = null;
    W.locked = true;
    if (!ok) { G.hunger = Math.max(5, (G.hunger ?? 50) - 20); await W.say(['Y: ATRASADO, 4812! Sem comida hoje!', '* (Sua fome aumentou.)']); }
    await W.say(['Y: ...0331. (Ferrugem levanta a mão.)', 'Y: ...2207. (Lia levanta a mão.)', 'Y: ...4812.', '* (Ele não chama ninguém pelo nome. Ninguém.)', 'Y: Agora, FÁBRICA! Embalar doces para os cidadãos! A fábrica fica ao sul do pátio.']);
    F.p5roll = true;
    this.ent('chocoF').hidden = false;
    W.saveHere(0);
    W.locked = false;
  },

  // ----- tarefa 2: fábrica (minijogo) -----
  async factory() {
    const W = World, F = G.flags;
    if (!F.p5roll) return W.say(['* (Uma esteira parada. Ainda não é hora.)']);
    if (F.p5task2) return W.say(['* (A esteira continua girando, levando doces que você nunca vai comer.)']);
    W.locked = true;
    await W.say(['* (A esteira leva doces embrulhados para a cidade.)', '* GUARDA: Embala só os PERFEITOS. Aperta A quando um doce DOURADO passar no quadrado.', '* GUARDA: Errou três vezes? Começa de novo.']);
    await new Promise(res => { this.mini = { items: [], t: 0, spawnT: 0, score: 0, errors: 0, flash: 0, res }; });
    this.mini = null;
    F.p5task2 = true;
    G.hunger = Math.max(5, (G.hunger ?? 50) - 10);
    const ch = this.ent('chocoF');
    await W.walk(ch, [[W.player.x + 22, W.player.y]], 50);
    await W.say([
      '* (A esteira para. Seus braços doem.)',
      'H: (sussurrando) Ei. 4812.',
      'H: Toma. Um pão. Esconde rápido.',
      '* (Chocolate te deu um pão escondido.)',
      'H: ...Eu não sei mais se tudo isso é certo.',
      'H: Me disseram que vocês eram perigosos. Mas você só parece... cansado.',
    ]);
    F.p5bread = true;
    G.hunger = Math.min(100, (G.hunger ?? 50) + 25);
    ch.hidden = true;
    await W.say(['* (Volte para o PÁTIO.)']);
    W.saveHere(0);
    W.locked = false;
  },
  updateMini(dt) {
    const M = this.mini;
    M.t += dt; M.spawnT -= dt; if (M.flash > 0) M.flash -= dt;
    if (M.spawnT <= 0) { M.spawnT = 0.62 + Math.random() * 0.3; M.items.push({ x: 40, good: Math.random() < 0.65 }); }
    for (const it of M.items) it.x += 165 * dt;
    M.items = M.items.filter(it => it.x < 610 && !it.gone);
    if (Input.isPressed('a') || Input.tap) {
      const it = M.items.find(i => Math.abs(i.x - 320) < 26);
      if (it && it.good) { it.gone = true; M.score++; Sfx.select(); M.msg = 'PERFEITO!'; }
      else { M.errors++; Sfx.buzz(); M.flash = 0.3; M.msg = it ? 'ESSE ESTÁ QUEBRADO!' : 'NADA NO QUADRADO!'; if (it) it.gone = true; }
      if (M.errors >= 3) { M.errors = 0; M.score = 0; M.msg = 'GUARDA: DE NOVO! DO COMEÇO!'; Sfx.alarm(); }
      if (M.score >= 10) M.res();
    }
  },
  drawMini() {
    const M = this.mini;
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, 640, 480);
    if (M.flash > 0) { ctx.fillStyle = 'rgba(255,0,0,0.2)'; ctx.fillRect(0, 0, 640, 480); }
    text('FÁBRICA DE DOCES', 320, 50, 44, '#fff', 'center');
    text('Aperte A quando um doce DOURADO estiver no quadrado', 320, 110, 26, '#c8c8d4', 'center');
    ctx.fillStyle = '#2a2a32'; ctx.fillRect(30, 200, 580, 70);
    ctx.fillStyle = '#4a4a56'; for (let i = 0; i < 30; i++) ctx.fillRect(30 + ((i * 24 + M.t * 165) % 580), 204, 12, 62);
    ctx.strokeStyle = '#ffe680'; ctx.lineWidth = 4; ctx.strokeRect(290, 190, 60, 90);
    for (const it of M.items) {
      const x = it.x, y = 235;
      if (it.good) {
        ctx.fillStyle = '#000'; ctx.fillRect(x - 16, y - 11, 32, 22);
        ctx.fillStyle = '#ffd23a'; ctx.fillRect(x - 14, y - 9, 28, 18); ctx.fillStyle = '#fff6b0'; ctx.fillRect(x - 10, y - 7, 8, 4);
        ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x - 24, y - 9); ctx.lineTo(x - 24, y + 9); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 14, y); ctx.lineTo(x + 24, y - 9); ctx.lineTo(x + 24, y + 9); ctx.fill();
      } else {
        ctx.fillStyle = '#000'; ctx.fillRect(x - 15, y - 10, 30, 20);
        ctx.fillStyle = '#8a8a8a'; ctx.fillRect(x - 13, y - 8, 26, 16);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y - 8); ctx.lineTo(x, y); ctx.lineTo(x - 4, y + 8); ctx.stroke();
      }
    }
    text(`EMBALADOS: ${M.score} / 10`, 320, 310, 32, '#7aff7a', 'center');
    text(`ERROS: ${M.errors} / 3`, 320, 346, 28, M.errors ? '#ff9a9a' : '#c8c8d4', 'center');
    if (M.msg) text(M.msg, 320, 390, 28, '#ffe680', 'center');
  },

  // ----- Pirulito e Ferrugem -----
  async ferrugemScene() {
    const W = World, F = G.flags;
    F.p5fight1 = true; W.locked = true;
    const fy = this.ent('ferrY'), py = this.ent('piruY');
    fy.hidden = false; py.hidden = false; this.ent('piru').hidden = true;
    await W.say([
      'Y: Robô velho e LENTO! Você embalou só a metade!',
      'U: Bip... minhas juntas... estão enferrujadas... desculpa...',
      'Y: Desculpa não enche barriga de doce! Você é INÚTIL!',
      'Y: Sem sopa hoje. E amanhã também!',
      'U: B-bip...',
    ]);
    await W.walk(W.player, [[tx2x(73) + 8, ty2y(29)]], 70);
    await W.say(['* (Você se coloca entre o Capataz Pirulito e o Ferrugem.)', 'Y: O QUÊ?! Um NÚMERO me desafiando?!']);
    W.battle('pirulito', { dragon: G.dragon }, r => this.afterPirulito(r));
  },
  async afterPirulito(r) {
    const W = World, F = G.flags;
    W.locked = true;
    await W.say([r === 'spared' ? 'Y: ...Volta pro trabalho. Todos vocês. AGORA.' : 'Y: (ofegante) Isso não vai ficar assim!', 'Y: GUARDAS! Levem esse número pra SOLITÁRIA!']);
    this.ent('ferrY').hidden = true; this.ent('piruY').hidden = true; this.ent('piru').hidden = false;
    await Fade.to(1, 2);
    const p = W.player; p.x = tx2x(49) + 8; p.y = ty2y(61); p.dir = 'up';
    F.p5inCell = true;
    W.updateCam(true);
    G.hunger = Math.max(10, (G.hunger ?? 50) - 10);
    await Fade.to(0, 1);
    await W.say(['* (A solitária é escura, apertada e gelada.)', '* (Você não sabe quanto tempo passou.)']);
    await wait(1.2);
    const marsh = this.ent('marsh');
    Object.assign(marsh, { hidden: false, x: tx2x(50), y: ty2y(59) });
    Sfx.step();
    await W.say([
      'M: Psst! Sou eu, a Marshmallow. Entrei escondida.',
      'M: Eu vi o que você fez pelo Ferrugem. Quase ninguém tem coragem de fazer isso.',
      'M: Nem todo doce acredita nessa mentira de "raça superior". Muitos só têm MEDO.',
      'M: E o medo faz a gente ficar quieto enquanto coisas horríveis acontecem.',
      'M: Chega de ficar quieta.',
      'M: Toma. Peguei seu celular no escritório do Pirulito.',
    ]);
    F.phone = true; Sfx.select();
    await W.say([
      '* (Você recuperou o CELULAR!)',
      'M: Aqui dentro não tem sinal. Só do lado de FORA da cerca.',
      'M: O Ferrugem tem um ALICATE escondido. A Vovó Fantasma sabe as rotas dos guardas.',
      'M: Hoje à noite... fuja. E traga ajuda. Por todos eles.',
    ]);
    marsh.hidden = true;
    await Fade.to(1, 2);
    F.p5inCell = false; F.p5cell = true;
    p.x = tx2x(54); p.y = ty2y(12); p.dir = 'down';
    W.updateCam(true);
    await Fade.to(0, 1.5);
    await W.say(['* (Os guardas te jogaram de volta no barracão.)', '* (Fale com o FERRUGEM e com a VOVÓ FANTASMA.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async talkVovo() {
    const W = World, F = G.flags;
    if (F.p5free) return W.say(['O: Faz anos que eu não vejo o portão aberto.', 'O: Obrigada, criança. Agora vá. Termine o que começou.']);
    if (F.p5cell && !F.p5map) {
      W.locked = true;
      await W.say(['O: Então você vai mesmo tentar...', 'O: Eu atravesso paredes, sabia? Já vi cada canto deste campo.', 'O: Os guardas andam sempre no mesmo caminho, de um lado pro outro, com lanternas.', 'O: Fique FORA da luz das lanternas.', '* (A Vovó Fantasma te contou as ROTAS DOS GUARDAS.)', 'O: A cerca fraca fica no SUL, bem no meio.']);
      F.p5map = true;
      await this.checkEscape();
      W.locked = false;
      return;
    }
    if (F.p5map) return W.say(['O: Fique fora da luz. E volte por nós.']);
    return W.say([
      'O: Olá, criança. Estou aqui faz tanto tempo que já esqueci a cor do céu.',
      'O: Eles dizem que fantasmas são "sujos". Que robôs são "peças". Que humanos são "perigosos".',
      'O: Mentiras repetidas mil vezes... até parecerem verdade.',
    ]);
  },
  async talkFerrugem() {
    const W = World, F = G.flags;
    if (F.p5free) return W.say(['U: Meu nome é FERRUGEM. Eu conserto relógios. E vou voltar a consertar.']);
    if (F.p5cell && !F.p5alicate) {
      W.locked = true;
      await W.say(['U: Bip... você levou a culpa por mim.', 'U: Ninguém nunca fez isso por um robô velho.', 'U: Toma. Eu escondi este ALICATE dentro do meu peito, atrás das engrenagens.', '* (Você recebeu o ALICATE.)', 'U: Corta a cerca. E volta pra buscar a gente, tá?']);
      F.p5alicate = true;
      await this.checkEscape();
      W.locked = false;
      return;
    }
    if (F.p5alicate) return W.say(['U: Bip. Boa sorte. Meus circuitos estão torcendo por você.']);
    return W.say(['U: Bip... minhas juntas rangem.', 'U: Antes de vir pra cá, eu consertava relógios na cidade.', 'U: Um dia trocaram meu nome por um número. 0331.']);
  },
  async talkLia() {
    const W = World, F = G.flags;
    if (F.p5free) return W.say(['L: Meu nome é LIA. Não é 2207. LIA!']);
    if (F.p5night2) return W.say(['L: Eu fico de vigia. Volta pra gente, tá? Promete?']);
    if (F.p5shared === true) return W.say(['L: Obrigada pela sopa. Eu nunca vou esquecer.']);
    return W.say(['L: Você também caiu aqui? Eu caí do balanço do parquinho...', 'L: Eu tô com fome. Faz dias que eu tô com fome.']);
  },

  async checkEscape() {
    const W = World, F = G.flags;
    if (!F.p5alicate || !F.p5map || F.p5night2) return;
    await W.say(['* (A noite cai sobre o campo.)', 'L: Eu fico de vigia. Vai!', '* (Saia do barracão, fuja das LANTERNAS dos guardas e vá até a cerca fraca, no SUL.)']);
    F.p5night2 = true;
    for (const e of W.ents) if (e.guard) { e.hidden = false; e.x = tx2x(e.path[0][0]); e.y = ty2y(e.path[0][1]); e.pi = 1; }
    this.ent('guardDay').hidden = true;
    W.saveHere(0);
  },

  // ----- patrulha -----
  patrol(W, dt) {
    const p = W.player;
    for (const e of W.ents) {
      if (!e.guard || e.hidden) continue;
      const tgt = e.path[e.pi], tx = tx2x(tgt[0]), ty = ty2y(tgt[1]);
      const d = Math.hypot(tx - e.x, ty - e.y);
      if (d < 2) { e.pi = (e.pi + 1) % e.path.length; continue; }
      e.ang = Math.atan2(ty - e.y, tx - e.x);
      const sp = 42 * dt; e.x += (tx - e.x) / d * sp; e.y += (ty - e.y) / d * sp;
      const px = p.x - e.x, py = (p.y - 6) - (e.y - 8), pd = Math.hypot(px, py);
      if (pd < 80 && Math.abs(((Math.atan2(py, px) - e.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.5 && W.feetTile()[1] < 67) {
        return this.caught();
      }
    }
  },
  async caught() {
    const W = World;
    W.locked = true;
    W.excl = 0.8; Sfx.alarm();
    await W.say(['* GUARDA: QUEM ESTÁ AÍ?! VOLTA PRO BARRACÃO!']);
    await Fade.to(1, 2.5);
    const p = W.player; p.x = tx2x(54); p.y = ty2y(13); p.dir = 'down';
    for (const e of W.ents) if (e.guard) { e.x = tx2x(e.path[0][0]); e.y = ty2y(e.path[0][1]); e.pi = 1; }
    W.updateCam(true);
    await Fade.to(0, 2);
    await W.say(['L: (sussurrando) Tudo bem? Tenta de novo. Fica longe da luz.']);
    W.locked = false;
  },

  async fence() {
    const W = World, F = G.flags;
    if (!F.p5night2) return W.say(['* (A cerca aqui parece mais fraca. Os arames estão enferrujados.)']);
    if (!F.p5alicate) return W.say(['* (Você precisa de algo para cortar o arame.)']);
    W.locked = true;
    Sfx.cut(); await wait(0.4); Sfx.cut();
    F.p5cut = true;
    W.setTile(80, 67, 'o'); W.redrawTile(80, 67);
    for (const e of W.ents) if (e.guard) e.hidden = true;
    await W.say(['* (Clec! Clec! Você abriu um buraco na cerca!)']);
    const ch = this.ent('choco');
    Object.assign(ch, { hidden: false, x: W.player.x - 40, y: W.player.y });
    Sfx.alarm();
    await W.say(['H: PARADO!', '* (É o Chocolate. A lanterna treme na mão dele.)']);
    W.battle('chocolate', { dragon: G.dragon }, r => this.afterChoco(r));
  },
  async afterChoco(r) {
    const W = World, F = G.flags;
    W.locked = true;
    const ch = this.ent('choco');
    if (r === 'spared') {
      F.p5chocoAlly = true;
      await W.say(['H: ...Vai.', 'H: E volta com ajuda. Quando vocês chegarem, eu abro o portão.', 'H: Eu cansei de fingir que não vejo.']);
    } else {
      await W.say(['H: ...Eu só cumpria ordens...', '* (Chocolate foge correndo para o escuro.)', '* (Cumprir ordens não apaga o que a gente faz.)']);
    }
    ch.hidden = true;
    await W.say(['* (Atravesse o buraco na cerca!)']);
    W.saveHere(0);
    W.locked = false;
  },

  async outside() {
    const W = World, F = G.flags, I = W.instr;
    F.p5out = true; W.locked = true;
    Sfx.playMusic('resistencia');
    Sfx.beep();
    await W.say(['* (Você está do lado de fora. O ar tem cheiro de chocolate e liberdade.)', '* (O celular vibra: TEM SINAL!)']);
    Sfx.ring(); await wait(0.6);
    await W.say([
      'T: ALÔ?! FINALMENTE! Te procurei por todo lugar! O IceGhost confessou o que fez!',
      '* (Você conta tudo: o campo, os números, a fome, o Ferrugem, a Lia, a Vovó...)',
      'T: ...',
      'T: Isso é horrível. Ninguém merece ser tratado assim. NINGUÉM.',
      'T: Aguenta firme. Estou indo. E vou levar reforços.',
    ]);
    Sfx.ring(); await wait(0.5); Sfx.robotSong();
    await W.say(['B: BIP?! É você?! Você sumiu da cidade!', 'B: Um campo? Robôs presos? Gente passando FOME?!', 'B: Modo resgate ATIVADO! Chego em 3, 2...']);
    await W.say(['* (Você assobia bem alto, olhando para o céu.)']);
    Sfx.roar();
    await W.say(['* (Lá longe, um rugido responde.)']);
    await Fade.to(1, 1);
    const p = W.player;
    Object.assign(I, { kind: undefined, visible: true, follow: false, x: p.x - 30, y: p.y + 4, dir: 'right', alpha: 1 });
    const bit = this.ent('bitL'), dr = this.ent('dragL');
    Object.assign(bit, { hidden: false, x: p.x + 28, y: p.y });
    Object.assign(dr, { hidden: false, x: p.x + 58, y: p.y });
    this.ent('star2').hidden = false;
    await Fade.to(0, 1);
    p.dir = 'left';
    await W.say([
      'T: Pequeno! Graças às estrelas!',
      'B: BIP BOP! Abraço em grupo! ...Eu não sei abraçar. Mas finge que sim.',
      'D: GRRRAAAWR!',
      'T: Escuta todo mundo. A gente NÃO vai machucar os doces que só têm medo.',
      'T: Vamos libertar os prisioneiros... e deter quem mandou fazer tudo isso.',
      'T: Quando estiver pronto, salve na estrela e me diga.',
    ]);
    F.p5called = true;
    W.saveHere(0);
    W.locked = false;
    const r = await W.ask('T: Prontos para libertar o campo?', ['Vamos!', 'Ainda não']);
    if (r === 0) return this.liberate();
    this.waitingLiberate = true;
  },

  async liberate() {
    const W = World, F = G.flags, I = W.instr, p = W.player;
    W.locked = true;
    this.waitingLiberate = false;
    await Fade.to(1, 1.2);
    F.p5free = true;
    W.renderMap();
    p.x = tx2x(47); p.y = ty2y(25); p.dir = 'right';
    Object.assign(I, { visible: true, follow: false, x: tx2x(46), y: ty2y(24) });
    const bit = this.ent('bitL'), dr = this.ent('dragL');
    Object.assign(bit, { x: tx2x(48), y: ty2y(23) }); Object.assign(dr, { x: tx2x(49), y: ty2y(27) });
    this.ent('piru').hidden = true; this.ent('guardDay').hidden = true;
    W.updateCam(true);
    Sfx.roar(); W.shake = 1;
    await Fade.to(0, 1.2);
    await W.say([
      '* (O dragão derruba o portão do campo com um rugido!)',
      '* (Os guardas largam as lanternas e os uniformes e fogem.)',
      F.p5chocoAlly ? 'H: Eu disse que ia abrir! Os barracões estão destrancados!' : 'B: Hackeando as fechaduras... BIP! Barracões ABERTOS!',
      '* (Os prisioneiros saem devagar. Robôs, humanos, fantasmas. Dezenas deles.)',
      'O: ...Faz anos que eu não vejo o portão aberto.',
      'U: Bip... bip... BIP! Estamos LIVRES?',
      'L: VOCÊ VOLTOU! Você prometeu e voltou!',
    ]);
    const marsh = this.ent('marsh');
    Object.assign(marsh, { hidden: false, x: tx2x(50), y: ty2y(25) });
    await W.say([
      'M: Eu trouxe a chave da TORRE DO DIRETOR.',
      'M: O Diretor Macaron está lá em cima. Foi ele que começou tudo isso.',
      '* (Você arranca o número 4812 do seu uniforme.)',
      '* (Seu nome não é um número.)',
    ]);
    I.follow = true; W.trail = [];
    for (let i = 0; i < 30; i++) W.trail.push({ x: I.x, y: I.y, dir: I.dir });
    bit.hidden = true; dr.hidden = true;
    await W.say(['T: Vamos juntos até a TORRE DOURADA, no canto do campo.', '* (A porta da torre agora está aberta.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async towerScene() {
    const W = World, F = G.flags;
    W.locked = true;
    await W.say([
      'N: Ora, ora... o número 4812.',
      'N: E trouxe gentalha: um mago velho, um robô de lata e um lagarto com asas.',
      'N: Esta ilha funcionava PERFEITAMENTE. Cada um no seu lugar.',
      'N: Os doces no topo. O resto... a nosso serviço.',
      'T: Ninguém nasceu pra servir ninguém.',
      'B: Bip. Calculando "superioridade dos doces"... ERRO. Isso não existe.',
      'N: GUARDAS! ...GUARDAS?!',
      '* (Nenhum guarda aparece. Eles largaram os uniformes.)',
      'N: Então EU MESMO vou colocar vocês no seu LUGAR!',
    ]);
    W.battle('macaron', { withInstr: true, instrNoCalm: true, dragon: G.dragon, robot: true }, r => this.afterBoss(r));
  },

  async afterBoss() {
    const W = World, F = G.flags;
    W.locked = true;
    F.p5boss = true;
    this.ent('macaronB').hidden = true;
    Sfx.playMusic('memoria');
    for (const [id, x, y] of [['marsh', 96, 15], ['vovo', 100, 15], ['ferr', 101, 17], ['lia', 95, 17]]) Object.assign(this.ent(id), { hidden: false, x: tx2x(x), y: ty2y(y) });
    await W.say([
      '* (Macaron é cercado pelos prisioneiros... e pelos doces que se recusaram a obedecer.)',
      'M: Ele vai ser JULGADO. Por tudo o que fez.',
      F.p5chocoAlly ? 'H: E eu vou contar tudo o que vi. Tudo. Pra ninguém esquecer.' : 'H: (Chocolate aparece na porta, envergonhado) ...Eu também vou responder pelo que fiz.',
      'O: Hoje, cada um volta a ter um NOME.',
      'L: Meu nome é LIA. Não 2207.',
      'U: Meu nome é FERRUGEM. Não 0331.',
      '* (Você diz o seu nome também. Bem alto.)',
      'T: Muito bem, pequeno. Hoje você mostrou uma coisa importante:',
      'T: Ninguém é superior a ninguém. E ficar calado diante da injustiça também é escolher um lado.',
    ]);
    F.p5end = true;
    W.saveHere();
    await Fade.to(1, 0.8);
    Sfx.stopMusic();
    Game.goEnd(5);
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere();
    await W.say([G.flags.p5free ? '* (Pela primeira vez, o campo está em silêncio de paz. Isso te enche de DETERMINAÇÃO.)' : '* (Mesmo aqui, uma estrela brilha. Isso te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
    if (this.waitingLiberate) {
      const r = await W.ask('T: Prontos para libertar o campo?', ['Vamos!', 'Ainda não']);
      if (r === 0) return this.liberate();
    }
  },
};

// porta da torre
const _p5interact = MAPS.ilha.interactTile;
MAPS.ilha.interactTile = function (W, c, tx, ty) {
  if (c === 'Z' && G.flags.p5free && !G.flags.p5boss) return P5.towerDoor();
  return _p5interact.call(this, W, c, tx, ty);
};
P5.towerDoor = async function () {
  const W = World, p = W.player, I = W.instr;
  W.locked = true;
  await Fade.to(1, 3);
  p.x = tx2x(98); p.y = ty2y(16); p.dir = 'up';
  I.x = tx2x(97); I.y = ty2y(17);
  W.trail = []; for (let i = 0; i < 30; i++) W.trail.push({ x: I.x, y: I.y, dir: 'up' });
  W.updateCam(true);
  await Fade.to(0, 3);
  P5.towerScene();
};
