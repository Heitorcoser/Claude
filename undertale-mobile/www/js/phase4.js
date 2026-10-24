// FASE 4 — A CIDADE FUTURISTA
// O robô BIT te mostra a cidade, vocês vão ao cinema, dormem na casa dele,
// vão para a escola, enfrentam os valentões e trocam contatos.
'use strict';

Object.assign(ITEMS, {
  'Pão Quântico': { heal: 18, price: 15, text: '* Você comeu o Pão Quântico.\n* Ele estava e não estava aqui ao mesmo tempo.' },
  'Suco de Pilha': { heal: 26, price: 22, text: '* Você bebeu o Suco de Pilha.\n* Sabor limão. Formiga a língua.' },
  'Pizza Laser': { heal: 40, price: 35, text: '* Você comeu a Pizza Laser.\n* Cortada com precisão de 0,001 mm.' },
});

const WALK4 = 'mnvrlzcwp';
const DOORS4 = {
  '22,17': { x: 15, y: 64, dir: 'up', to: 'cinema' }, '15,66': { x: 22, y: 18, dir: 'down' },
  '52,17': { x: 40, y: 62, dir: 'up', to: 'casa' }, '40,64': { x: 52, y: 18, dir: 'down' },
  '115,17': { x: 67, y: 64, dir: 'up', to: 'sala' }, '67,66': { x: 115, y: 18, dir: 'down' },
};
const TOUR = [
  { id: 'holo', x: 37, y: 33, name: 'HOLOGRAMA' },
  { id: 'lanch', x: 55, y: 42, name: 'LANCHONETE' },
  { id: 'mirante', x: 24, y: 43, name: 'MIRANTE' },
  { id: 'cinema', x: 22, y: 18, name: 'CINEMA' },
];

function robotNpc(id, pal, tx, ty, talk, dir = 'left') {
  return { id, x: tx2x(tx), y: ty2y(ty), w: 14, h: 8, solid: true, talk, pal, dir,
    draw(sx, sy, t) {
      const set = SPR.robot[this.pal];
      drawSpr(set[this.dir][Math.floor(t * 2 + this.x) % 2], sx(this.x - 8), sy(this.y - 22) + Math.round(Math.sin(t * 3 + this.x)), 2, this.alpha ?? 1);
    } };
}
function kidNpc(id, k, tx, ty, talk, opts = {}) {
  return { id, x: tx2x(tx), y: ty2y(ty), w: 14, h: 8, solid: true, talk, k, hidden: !!opts.hidden, scale: opts.scale || 2,
    draw(sx, sy, t) {
      const img = SPR.kid[this.k], s = this.scale;
      drawSpr(img, sx(this.x - img.width * s / 4), sy(this.y - img.height * s / 2), s, this.alpha ?? 1);
    } };
}

MAPS.futuro = {
  music: 'futuro',
  start: { x: tx2x(4), y: ty2y(33), dir: 'right' },
  anim: '',

  build() {
    const MW = 130, MH = 70;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    // túnel de chegada
    rect(2, 30, 11, 6, 'm');
    // praça central
    rect(13, 18, 50, 29, 'm'); rect(13, 31, 50, 2, 'n'); rect(36, 18, 2, 29, 'v');
    rect(35, 28, 4, 4, 'h');
    g[17][22] = 'C'; g[17][52] = 'E';
    for (const [x, y] of [[16, 21], [28, 21], [45, 21], [58, 21], [16, 44], [32, 44], [45, 44], [59, 44], [42, 38], [29, 37]]) g[y][x] = 'T';
    // avenida até a escola
    rect(63, 30, 40, 5, 'r');
    for (let x = 63; x < 103; x += 2) g[32][x] = 'l';
    rect(80, 30, 2, 5, 'z');
    // escola
    rect(103, 18, 25, 30, 'm'); rect(103, 10, 25, 8, 'S'); g[17][115] = 'D';
    for (const [x, y] of [[105, 20], [125, 20], [105, 45], [125, 45]]) g[y][x] = 'T';
    // interiores
    rect(3, 52, 26, 14, 'c'); rect(3, 51, 26, 1, 'x');
    for (const y of [55, 57, 59, 61]) { rect(5, y, 9, 1, 's'); rect(17, y, 10, 1, 's'); }
    g[66][15] = 'X';
    rect(33, 54, 16, 10, 'w'); g[64][40] = 'X';
    rect(54, 52, 28, 14, 'w'); rect(58, 51, 20, 1, 'b');
    for (const y of [57, 60, 63]) for (const x of [57, 58, 61, 62, 72, 73, 76, 77]) g[y][x] = 'k';
    g[66][67] = 'X';
    return { g };
  },

  solid(c) { return !WALK4.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.futT, h = (x * 73 + y * 151) % 3;
    if (c === 'm') return T.metal[h];
    if (c === 'n') return T.neon[h];
    if (c === 'v') return T.neonV;
    if (c === 'r') return T.road[h]; if (c === 'l') return T.roadLine; if (c === 'z') return T.cross;
    if (c === 'h') return T.holo;
    if (c === 'T') return MAPS.dragoncity.layer(T.metal[h], T.tree);
    if (c === 'C') return T.doorC; if (c === 'E') return T.doorE; if (c === 'D') return T.doorS;
    if (c === 'S') return T.schoolWall;
    if (c === 'c') return T.carpet[h]; if (c === 's') return T.seat; if (c === 'x') return T.screen;
    if (c === 'w') return T.wood[h]; if (c === 'k') return MAPS.dragoncity.layer(T.wood[h], T.desk); if (c === 'b') return T.board;
    if (c === 'X') return T.doorIn;
    if (c === '#') {
      const b = W.tile(x, y + 1);
      if (y >= 48 && (WALK4.includes(b) || 'X'.includes(b))) return T.wallIn;
      if (y >= 48) return T.void;
      return WALK4.includes(b) ? T.facade[(x >> 2) % 3] : (W.tile(x, y + 2) && WALK4.includes(W.tile(x, y + 2)) ? T.facade[(x >> 2) % 3] : T.void);
    }
    return T.void;
  },

  ents(W) {
    const F = G.flags;
    const list = [
      { id: 'star1', x: tx2x(18), y: ty2y(28), w: 12, h: 8, spr: 'star', solid: true, talk: () => P4.useStar() },
      { id: 'star2', x: tx2x(108), y: ty2y(28), w: 12, h: 8, spr: 'star', solid: true, talk: () => P4.useStar() },
      { id: 'signP', x: tx2x(15), y: ty2y(29), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(['* (CIDADE FUTURISTA — Praça do Holograma)', "* 'Proibido voar abaixo de 2 metros. Exceto drones. Drones podem tudo.'"]) },
      { id: 'signS', x: tx2x(112), y: ty2y(19), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => W.say(["* (ESCOLA MUNICIPAL DA CIDADE FUTURISTA)", "* 'Para robôs, humanos e quem mais quiser aprender.'"]) },
      { id: 'telescope', x: tx2x(24), y: ty2y(44), w: 12, h: 6, spr: 'telescope', solid: true, talk: () => P4.tourStop(2, true) },
      { id: 'stall', x: tx2x(55) + 8, y: ty2y(40), w: 40, h: 12, solid: true, talk: () => P4.stall(),
        draw(sx, sy, t) {
          const x = sx(this.x - 22), y = sy(this.y - 34);
          drawSpr(SPR.robot.ouro.right[Math.floor(t * 2) % 2], x + 28, y - 4 + Math.sin(t * 3), 2);
          ctx.fillStyle = '#000'; ctx.fillRect(x - 4, y + 34, 96, 34);
          ctx.fillStyle = '#2a3040'; ctx.fillRect(x - 2, y + 36, 92, 30);
          ctx.fillStyle = '#5ff8ff'; ctx.fillRect(x - 2, y + 36, 92, 3);
          ctx.fillStyle = `rgba(255,90,200,${0.7 + Math.sin(t * 5) * 0.3})`; ctx.fillRect(x - 6, y - 22, 102, 12);
          text('LANCHES', x + 45, y - 26, 22, '#fff', 'center');
          ctx.fillStyle = '#000'; ctx.fillRect(x - 4, y - 10, 4, 46); ctx.fillRect(x + 88, y - 10, 4, 46);
        } },
      { id: 'bench1', x: tx2x(30), y: ty2y(25), w: 28, h: 6, spr: 'bench', solid: true, talk: () => W.say(['* (Um banco de metal com luzinhas. Quentinho.)']) },
      { id: 'bench2', x: tx2x(118), y: ty2y(38), w: 28, h: 6, spr: 'bench', solid: true, talk: () => W.say(['* (Alguém riscou: "ROBÔ NÃO SENTA AQUI". Que feio.)']) },
      robotNpc('r1', 'ouro', 20, 25, () => W.say(['* BIP. Bem-vindo à CIDADE FUTURISTA.', '* População: 3.012 robôs e 41 humanos. 42 agora. Atualizando...'])),
      robotNpc('r2', 'verde', 50, 26, () => W.say(['* Você já viu o filme do ROBÔ PATO?', '* Eu chorei óleo. Três vezes.']), 'right'),
      robotNpc('r3', 'verde', 124, 41, () => W.say(['* (Um robô zelador.) BIP. Eu limpo a escola todo dia.', '* Os valentões sempre sujam a mesa do Bit. Isso me deixa triste. Bip.'])),
      kidNpc('k2', 'k2', 44, 38, () => W.say(['C: Eu caí aqui ano passado! Do parquinho, acredita?', 'C: A escola é legal... menos os VALENTÕES.'])),
      kidNpc('k1', 'k1', 108, 22, () => W.say(['C: Você é novo? Eu caí aqui por um bueiro. Nojento, né?', 'C: O Bit é o único robô da escola. Ele é muito legal!'])),
      kidNpc('k3', 'k3', 122, 24, () => W.say(['C: Os valentões vivem pegando a bateria de lanche do Bit.', 'C: Ninguém tem coragem de falar nada...'])),
      kidNpc('k4', 'k4', 110, 42, () => W.say(['C: Shhh! Tô fugindo da aula de matemática.', 'C: ...Não conta pra Professora Volt!'])),
      // casa do Bit
      { id: 'bed', x: tx2x(35), y: ty2y(57), w: 18, h: 26, spr: 'bed', solid: true, talk: () => P4.sleep() },
      { id: 'charger', x: tx2x(46), y: ty2y(55), w: 12, h: 8, spr: 'charger', solid: true, talk: () => W.say(['* (O carregador do Bit. Tem um adesivo: "MEU! — BIT".)']) },
      // sala de aula
      robotNpc('volt', 'volt', 67, 54, () => P4.talkVolt(), 'right'),
      kidNpc('ck1', 'k1', 57, 56, () => W.say(['C: Shhh, a aula vai começar.'])),
      kidNpc('ck3', 'k3', 62, 59, () => W.say(['C: Eu sento do lado da janela. Que não existe. É uma tela.'])),
      kidNpc('ck4', 'k4', 73, 56, () => W.say(['C: Zzz... (dormindo de olhos abertos)'])),
      kidNpc('cbru', 'brutao', 77, 62, () => W.say(['R: Que foi? Tá olhando o quê?']), { hidden: true }),
      kidNpc('ctec', 'teca', 76, 59, () => W.say(['K: Hunf.']), { hidden: true }),
      kidNpc('cze', 'ze', 72, 62, () => W.say(['Z: ...']), { hidden: true }),
      // valentões no pátio
      kidNpc('bru', 'brutao', 115, 27, () => {}, { hidden: true, scale: 2.5 }),
      kidNpc('tec', 'teca', 111, 28, () => {}, { hidden: true }),
      kidNpc('zez', 'ze', 119, 28, () => {}, { hidden: true }),
    ];
    return list;
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 13, y: 28, w: 2, h: 9, when: () => F.p4arrived && !F.p4met, run: () => P4.meetBit() },
      { x: 63, y: 30, w: 2, h: 5, when: () => F.p4met && !F.p4day2, run: () => P4.notYet() },
      { x: 103, y: 28, w: 2, h: 8, when: () => F.p4day2 && !F.p4bully, run: () => P4.bullyScene() },
    ];
  },

  setup(W) {
    const F = G.flags;
    if (F.p4met && !F.p4end) Object.assign(W.instr, { kind: 'robot', visible: true, follow: true, x: W.player.x - 20, y: W.player.y });
    if (F.p4class) { for (const id of ['cbru', 'ctec', 'cze']) P4.ent(id, W).hidden = false; }
  },
  onEnter(W) { if (!G.flags.p4arrived) P4.arrive(); },

  musicAt(W) {
    const [x, y] = W.feetTile();
    if (y >= 50) return x < 31 ? 'cinema' : x < 51 ? 'bit' : 'escola';
    if (x >= 103) return 'escola';
    return 'futuro';
  },

  update(W, dt) {
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
    const F = G.flags;
    // paradas do tour
    if (F.p4met && (F.p4tour ?? 0) < 3) {
      const s = TOUR[F.p4tour || 0], p = W.player;
      if (Math.hypot(p.x - tx2x(s.x), p.y - ty2y(s.y)) < 22) P4.tourStop(F.p4tour || 0);
    }
  },

  overlay(W, sx, sy) {
    const F = G.flags, t = W.t;
    // holograma da praça
    const hx = sx(37 * TS), hy = sy(28 * TS);
    if (hx > -100 && hx < 740 && hy > -200 && hy < 600) {
      ctx.globalAlpha = 0.55 + Math.sin(t * 3) * 0.1;
      ctx.strokeStyle = '#5ff8ff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(hx, hy - 30, 30, 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.save(); ctx.translate(hx, hy - 70); ctx.rotate(t);
      ctx.strokeRect(-18, -18, 36, 36); ctx.rotate(-t * 2); ctx.strokeRect(-12, -12, 24, 24); ctx.restore();
      for (let i = 0; i < 6; i++) { const y = hy - 30 - ((t * 40 + i * 18) % 100); ctx.fillStyle = '#5ff8ff'; ctx.fillRect(hx - 25 + i * 10, y, 2, 6); }
      ctx.globalAlpha = 1;
    }
    // seta do tour
    if (F.p4met && (F.p4tour ?? 0) < 4 && !W.locked) {
      const s = TOUR[F.p4tour || 0], ax = sx(tx2x(s.x)), ay = sy(ty2y(s.y) - 34) + Math.sin(t * 5) * 5;
      ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.moveTo(ax - 10, ay - 14); ctx.lineTo(ax + 10, ay - 14); ctx.lineTo(ax, ay); ctx.fill();
      text(s.name, ax, ay - 40, 22, '#ffe680', 'center');
    }
    // noite
    if (F.p4night && !F.p4day2 && W.player.y < 50 * TS) {
      ctx.fillStyle = 'rgba(8,6,40,0.45)'; ctx.fillRect(0, 0, 640, 480);
    }
    // carros voadores na avenida
    for (let i = 0; i < 3; i++) {
      const cx = ((t * (80 + i * 30) + i * 300) % (45 * TS)) + 60 * TS, cy = (27 + i * 0.6) * TS;
      const x = sx(cx), y = sy(cy) - 20 + Math.sin(t * 2 + i) * 4;
      if (x < -60 || x > 700) continue;
      ctx.fillStyle = '#000'; ctx.fillRect(x - 18, y - 7, 36, 14);
      ctx.fillStyle = ['#ff5ac8', '#5ff8ff', '#ffe680'][i]; ctx.fillRect(x - 17, y - 6, 34, 8);
      ctx.fillStyle = '#9fe4ff'; ctx.fillRect(x - 6, y - 10, 14, 5);
      ctx.fillStyle = 'rgba(95,248,255,0.4)'; ctx.fillRect(x - 14, y + 8, 28, 3);
    }
    if (P3.ringing) {
      const sh = Math.sin(t * 60) * 3;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(520, 16, 104, 70);
      drawSpr(SPR.phone, 540 + sh, 24, 2);
      text('RING!', 572, 40, 28, '#ffe680');
    }
    if (P4.view) P4.drawView(t);
  },

  talkInstr(W) { return P4.talkBit(); },

  interactTile(W, c, tx, ty) {
    const d = DOORS4[tx + ',' + ty];
    if (d) return P4.door(c, d);
    if (c === 'h') return W.say(['* (Um holograma gigante da cidade gira no ar.)']);
    if (c === 'x') return W.say(['* (A tela do cinema. Enorme e branquinha.)']);
    if (c === 's') return W.say(['* (Uma poltrona fofinha. Tem pipoca no chão.)']);
    if (c === 'b') return W.say(['* (No quadro: "HOJE: Matemática, Português e... Sentimentos Humanos?")']);
    if (c === 'k') return W.say(['* (Uma mesa digital. Alguém desenhou um robô sorrindo.)']);
    if (c === 'S') return W.say(['* (A parede da escola. Tem cheiro de lanche e borracha.)']);
  },

  encounter: {
    tile: 'r', counter: 'enc4', max: 5, first: 100, min: 260, rand: 220,
    enabled: () => !!G.flags.p4day2 && !G.flags.p4bully,
    pick: n => n === 0 ? 'drone' : n === 1 ? 'aspirabo' : (Math.random() < 0.5 ? 'drone' : 'aspirabo'),
    opts: () => ({ dragon: G.dragon, robot: true }),
    doneText: '* (A avenida ficou tranquila. Só os carros voadores.)',
    async after(W, r, n) {
      if (n === 1) { W.locked = true; await W.say(['B: BIP! Viu? Eu toco música e você fica mais forte!', 'B: Quanto maior o seu nível, mais a música te cura. Ciência!']); W.locked = false; }
    },
  },
};

// ---------------- CUTSCENE: o escorregador gelado ----------------
const Cine4 = {
  t: 0, panel: 0, shake: 0,
  async run() {
    Game.cine = this;
    const say = items => Dialog.show(items.map(t => {
      const m = /^([FG]):\s*(.*)$/s.exec(t);
      return m ? { who: m[1] === 'F' ? 'fire' : 'ice', t: '* ' + m[2] } : { t };
    }), false);
    Object.assign(this, { t: 0, panel: 0, shake: 0 });
    Fade.a = 1; Fade.to(0, 0.8);
    Sfx.playMusic('icetheme');
    await wait(0.6);
    await say(['* (Você empurra a porta da casa de gelo...)', '* (Lá dentro, os dois irmãos fantasmas te esperam.)']);
    await say(['G: Então, humano. Eu prometi VINGANÇA.', 'G: E a vingança... se serve GELADA.',
      G.flags.fireFriend ? 'F: AGORA, IRMÃO! AGORA! AGORA!' : 'F: (com a voz fraquinha) ...agora, irmão... hehe...']);
    this.shake = 1; Sfx.crack();
    await say(['G: ...ESCORREGADOR!']);
    Sfx.stopMusic(); Sfx.fall();
    this.panel = 1; this.t = 0;
    await say(['* AAAAAAAAAAAAH!', 'F: HAHAHAHA! A MELHOR PEGADINHA DE TODAS!', 'G: Boa viagem, humano! E NÃO VOLTE!']);
    await wait(1.2);
    this.panel = 2; this.t = 0; Sfx.whoosh();
    await wait(1.4);
    await say(['* (Você escorrega por quilômetros de túnel de gelo...)', '* (...e lá embaixo, luzes. MUITAS luzes.)', '* (Uma cidade?!)']);
    await Fade.to(1, 1.2);
    Game.enterMap('futuro');
  },
  update(dt) { this.t += dt; if (this.shake > 0) this.shake -= dt; Dialog.update(dt); },
  draw() {
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
    if (this.panel === 0) {
      ctx.fillStyle = '#0c1c34'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1a3a5a'; for (let y = 0; y < 320; y += 24) ctx.fillRect(0, y, W, 2);
      drawGhost('ice', 340, 90 + Math.sin(this.t * 2) * 5, 5, this.t);
      drawGhost('fire', 180, 150 + Math.sin(this.t * 3) * 5, 3.5, this.t, G.flags.fireFriend ? 1 : 0.55);
      drawSpr(SPR.player.up[0], 300, 240, 3);
    } else if (this.panel === 1) {
      ctx.fillStyle = '#0a1830'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 14; i++) {
        const k = ((this.t * 1.8 + i / 14) % 1), r = k * 520;
        ctx.strokeStyle = `rgba(159,228,255,${k})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(320, 200, r, r * 0.7, 0, 0, Math.PI * 2); ctx.stroke();
      }
      const img = SPR.player.down[0];
      ctx.save(); ctx.translate(320, 200); ctx.rotate(this.t * 6);
      ctx.drawImage(img, -21, -31, 42, 63); ctx.restore();
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#05030f'); sky.addColorStop(1, '#2a0a4a');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      P4.drawSkyline(this.t, Math.min(1, this.t / 1.2));
    }
    ctx.restore();
    Dialog.draw();
  },
};

// ---------------- Roteiros da Fase 4 ----------------
const P4 = {
  view: null,
  ent(id, W = World) { return W.ents.find(e => e.id === id); },
  bitNear() {
    const W = World, I = W.instr, p = W.player;
    if (Math.hypot(I.x - p.x, I.y - p.y) > 120) { I.x = p.x - 18; I.y = p.y; }
  },

  drawSkyline(t, a = 1) {
    ctx.globalAlpha = a;
    const cols = ['#5ff8ff', '#ff5ac8', '#ffe680'];
    for (let i = 0; i < 18; i++) {
      const x = i * 38 - 10, h = 120 + ((i * 53) % 150), y = 400 - h;
      ctx.fillStyle = '#10142a'; ctx.fillRect(x, y, 34, h + 80);
      for (let wy = y + 8; wy < 400; wy += 14) for (let wx = x + 5; wx < x + 30; wx += 9) {
        if ((wx * 7 + wy * 3 + i) % 5 < 3) { ctx.fillStyle = cols[(i + wy) % 3]; ctx.fillRect(wx, wy, 4, 6); }
      }
    }
    ctx.fillStyle = '#1a1e3a'; ctx.fillRect(296, 60, 48, 340); ctx.fillStyle = '#5ff8ff'; ctx.fillRect(316, 30, 8, 30);
    ctx.fillStyle = `rgba(255,90,200,${0.6 + Math.sin(t * 4) * 0.4})`; ctx.fillRect(300, 80, 40, 6);
    for (let i = 0; i < 6; i++) {
      const x = (t * (60 + i * 25) + i * 140) % 760 - 60, y = 120 + i * 40;
      ctx.fillStyle = cols[i % 3]; ctx.fillRect(x, y, 26, 8); ctx.fillStyle = '#fff'; ctx.fillRect(x + 20, y + 2, 4, 3);
    }
    ctx.globalAlpha = 1;
  },

  drawView(t) {
    const v = this.view;
    v.t += 1 / 60;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 640, 480);
    if (v.type === 'pano') {
      const sky = ctx.createLinearGradient(0, 0, 0, 480);
      sky.addColorStop(0, '#05030f'); sky.addColorStop(1, '#3a0a5a');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 640, 480);
      this.drawSkyline(v.t);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 80; ctx.beginPath(); ctx.arc(320, 200, 300, 0, Math.PI * 2); ctx.stroke();
      return;
    }
    // filme
    ctx.fillStyle = '#111'; ctx.fillRect(40, 20, 560, 300);
    const p = v.panel;
    if (p === 0) {
      ctx.fillStyle = '#05030f'; ctx.fillRect(44, 24, 552, 292);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = '#fff'; ctx.fillRect(50 + (i * 97) % 540, 30 + (i * 53) % 280, 2, 2); }
      text('O ROBÔ PATO', 320, 110, 30, '#ffe680', 'center', FONT_TITLE);
      text('contra os POMBOS DO ESPAÇO', 320, 170, 32, '#5ff8ff', 'center');
    } else if (p === 1 || p === 2) {
      ctx.fillStyle = '#0a0620'; ctx.fillRect(44, 24, 552, 292);
      for (let i = 0; i < 30; i++) { ctx.fillStyle = '#fff'; ctx.fillRect((50 + i * 97 - v.t * 120) % 540 + 50, 30 + (i * 53) % 280, 2, 2); }
      const dx = p === 1 ? 200 + Math.sin(v.t * 2) * 40 : 300, dy = 170 + Math.sin(v.t * 3) * 20;
      // robô pato
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(dx, dy, 34, 26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.ellipse(dx, dy, 32, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff8a2a'; ctx.fillRect(dx + 26, dy - 4, 20, 8);
      ctx.fillStyle = '#000'; ctx.fillRect(dx + 10, dy - 12, 6, 6); ctx.fillRect(dx - 2, dy - 40, 3, 16);
      ctx.fillStyle = '#ff3b3b'; ctx.fillRect(dx - 5, dy - 44, 9, 6);
      // pombos
      const px = p === 1 ? 470 - Math.sin(v.t * 2) * 30 : 352;
      for (let i = 0; i < (p === 1 ? 3 : 1); i++) {
        const yy = dy - 50 + i * 50;
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(px + i * 30, yy, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#9a9aa8'; ctx.beginPath(); ctx.arc(px + i * 30, yy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7a7a88'; ctx.fillRect(px + i * 30 - 4, yy - 22 + Math.sin(v.t * 20) * 4, 18, 8);
        ctx.fillStyle = '#ff8a2a'; ctx.fillRect(px + i * 30 - 22, yy - 2, 8, 4);
        if (p === 1 && Math.floor(v.t * 3 + i) % 2) { ctx.fillStyle = '#ff3b3b'; ctx.fillRect(dx + 40, yy, px - dx - 60, 3); }
      }
      if (p === 2) {
        ctx.fillStyle = '#ff5ac8'; const hx = 326, hy = 110 + Math.sin(v.t * 4) * 4;
        ctx.beginPath(); ctx.arc(hx - 8, hy, 9, 0, Math.PI * 2); ctx.arc(hx + 8, hy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(hx - 17, hy + 3); ctx.lineTo(hx, hy + 22); ctx.lineTo(hx + 17, hy + 3); ctx.fill();
      }
    } else {
      ctx.fillStyle = '#05030f'; ctx.fillRect(44, 24, 552, 292);
      text('FIM', 320, 140, 40, '#fff', 'center', FONT_TITLE);
    }
    // plateia
    ctx.fillStyle = '#000'; ctx.fillRect(0, 300, 640, 180);
    ctx.fillStyle = '#1a0a10'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(30 + i * 66, 330, 26, Math.PI, 0); ctx.fill(); }
    drawSpr(SPR.player.up[0], 270, 296, 2);
    const bit = SPR.robot.bit;
    drawSpr(p === 3 ? bit.sad : bit.right[0], 340, 290, 2);
    if (p >= 2) { ctx.fillStyle = '#3a3a48'; for (let i = 0; i < 3; i++) ctx.fillRect(352 + (i % 2) * 14, 312 + ((v.t * 40 + i * 9) % 30), 3, 5); }
  },

  async arrive() {
    const W = World, p = W.player;
    W.locked = true;
    G.flags.p4arrived = true;
    p.x = tx2x(4); p.y = ty2y(33); p.lying = true;
    W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('futuro'); Fade.to(0, 0.6);
    await wait(1);
    await W.say(['* (Você saiu de um tubo de gelo e caiu de cara num chão de metal.)', '* (Tem luzes coloridas por todo lado. Carros... VOANDO.)']);
    p.lying = false; Sfx.move();
    await wait(0.6);
    await P3.ring(false);
    await W.say([
      'T: Alô?! Você sumiu do mapa! O sinal te mostra... BEM embaixo da Colônia de Gelo.',
      'T: Na CIDADE FUTURISTA?! Os irmãos te jogaram num ESCORREGADOR?!',
      'T: Que maldade... (risadinha abafada) ...digo, que absurdo!',
      'T: Lá vivem robôs. E crianças humanas que caíram, como você.',
      'T: Faça amigos! E me liga se precisar. Tchau!',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async meetBit() {
    const W = World, I = W.instr, p = W.player, F = G.flags;
    F.p4met = true; W.locked = true;
    Object.assign(I, { kind: 'robot', visible: true, follow: false, x: tx2x(26), y: ty2y(32), dir: 'left', sad: false });
    Sfx.beep();
    await W.walk(I, [[p.x + 30, p.y]], 80);
    Sfx.playMusic('bit');
    p.dir = 'right';
    await W.say([
      'B: BIP BOP! Sensores detectam: um HUMANO NOVO!',
      'B: Análise completa: você está PERDIDO. 98% de certeza.',
      'B: Olá! Eu sou o BIT! Robô, estudante e fã número 1 de filmes!',
      'B: Você caiu do teto, né? Acontece. Os humanos vivem caindo aqui.',
      'B: Quer que eu te mostre a cidade? Por favor? Ninguém nunca aceita...',
    ]);
    const r = await W.ask('B: Tour pela CIDADE FUTURISTA?', ['Claro!', 'Agora não']);
    if (r !== 0) await W.say(['B: ...', 'B: Erro 404: resposta não encontrada. Vou fingir que você disse SIM!']);
    else await W.say(['B: BIIIP! Felicidade em 100%!']);
    await W.say(['B: Primeira parada: o HOLOGRAMA da praça! Siga a setinha amarela!', '* (BIT entrou para o seu grupo!)']);
    F.p4tour = 0;
    I.follow = true; W.trail = [];
    for (let i = 0; i < 30; i++) W.trail.push({ x: I.x, y: I.y, dir: I.dir });
    W.saveHere(0);
    W.locked = false;
  },

  talkBit() {
    const W = World, F = G.flags;
    if (!F.p4day2) {
      const s = TOUR[Math.min(3, F.p4tour || 0)];
      if ((F.p4tour || 0) < 4) return W.say([`B: Próxima parada: ${s.name}! Siga a setinha!`]);
      return W.say(['B: Já tá de noite! Vamos pra minha casa? Fica ali na praça, porta azul.']);
    }
    if (!F.p4bully) return W.say(['B: A escola fica no fim da avenida, à direita! Bip bip!']);
    if (!F.p4class) return W.say(['B: Vamos entrar! A aula já vai começar!']);
    return W.say(['B: Obrigado por ficar do meu lado. Bip.']);
  },

  async tourStop(n, fromTalk) {
    const W = World, F = G.flags;
    if (!F.p4met) return W.say(['* (Um telescópio. Dá pra ver a cidade toda daqui.)']);
    if ((F.p4tour || 0) !== n) {
      if (fromTalk) return W.say(['* (Um telescópio. Dá pra ver a cidade toda daqui.)']);
      return;
    }
    W.locked = true;
    if (n === 0) {
      await W.say([
        'B: Este é o HOLOGRAMA! Ele mostra a cidade inteira girando. Lindo, né?',
        'B: A CIDADE FUTURISTA fica bem embaixo da Colônia de Gelo.',
        'B: Aqui vivem robôs... e os humanos que caem lá de cima. Como você!',
        'B: Próxima parada: a LANCHONETE! Tô com fome. Bom, com sede de óleo.',
      ]);
    } else if (n === 1) {
      await W.say(['B: LANCHONETE! A melhor da cidade. E a única.', '* (O robô dourado te entrega um PÃO QUÂNTICO.)']);
      if (G.items.length < 8) G.items.push('Pão Quântico');
      Sfx.select();
      await W.say(['B: E pra mim: óleo premium! GLUB GLUB GLUB.', 'B: Ahhh. Revigorante.', 'B: Próxima parada: o MIRANTE, no canto da praça!']);
    } else if (n === 2) {
      await W.say(['B: O MIRANTE! Olha pelo telescópio!']);
      this.view = { type: 'pano', t: 0 };
      Sfx.whoosh();
      await W.say([
        'B: Aquela torre gigante é a CENTRAL. Ela controla a luz de tudo.',
        'B: Aqueles são carros voadores. Eu ainda não tenho carteira. Nem idade.',
        'B: E lá longe... a minha ESCOLA.',
        'B: Eu sou o único robô de lá. O resto são crianças humanas.',
        'B: Às vezes... eles não gostam muito de mim. Bip.',
      ]);
      this.view = null;
      await W.say(['B: Mas chega de tristeza! Última parada: o CINEMA! Tá passando o ROBÔ PATO!']);
    }
    F.p4tour = n + 1;
    W.locked = false;
  },

  async door(c, d) {
    const W = World, F = G.flags;
    if (d.to === 'cinema') {
      if (!F.p4met) return W.say(['* (CINEMA. Hoje: "O Robô Pato contra os Pombos do Espaço".)']);
      if (F.p4movie) return W.say(['* (A sessão acabou. Próxima: amanhã.)']);
      if ((F.p4tour || 0) < 3) return W.say(['B: Calma! O cinema é a ÚLTIMA parada. Siga a setinha!']);
      await this.teleport(d);
      return this.movie();
    }
    if (d.to === 'casa') {
      if (!F.p4night && !F.p4day2) return W.say(['* (A casa do BIT. Porta azul com um adesivo de robô.)']);
    }
    if (d.to === 'sala') {
      if (!F.p4bully) return W.say(['* (A porta da escola está fechada. As aulas ainda não começaram.)']);
      if (F.p4class && !F.p4end) return W.say(['B: A aula já acabou! Vamos pro pátio.']);
      if (F.p4end) return W.say(['* (A escola está fechada.)']);
      await this.teleport(d);
      return this.classScene();
    }
    if (d.dir === 'down' && World.player.y > 60 * TS && World.player.x > 50 * TS && F.p4class && !F.p4boss) {
      await this.teleport(d);
      return this.bossScene();
    }
    await this.teleport(d);
  },

  async teleport(d) {
    const W = World, p = W.player, I = W.instr;
    W.locked = true;
    Sfx.select();
    await Fade.to(1, 3);
    p.x = tx2x(d.x); p.y = ty2y(d.y); p.dir = d.dir;
    if (I.follow) { I.x = p.x; I.y = p.y + (d.dir === 'up' ? 14 : -14); W.trail = []; for (let i = 0; i < 30; i++) W.trail.push({ x: I.x, y: I.y, dir: I.dir }); }
    W.updateCam(true);
    await Fade.to(0, 3);
    W.locked = false;
  },

  async movie() {
    const W = World, F = G.flags, p = W.player, I = W.instr;
    W.locked = true;
    await W.walk(p, [[tx2x(15), ty2y(62)], [tx2x(15), ty2y(54)]], 70);
    await W.say(['B: Shhh! Vai começar! Pega pipoca imaginária!']);
    Sfx.stopMusic();
    this.view = { type: 'movie', panel: 0, t: 0 };
    Sfx.playMusic('cinema');
    await W.say(['* (As luzes se apagam...)', '* "O ROBÔ PATO contra os POMBOS DO ESPAÇO."']);
    this.view.panel = 1; this.view.t = 0;
    await W.say(['* PATO: "Quá-bip! Vocês nunca vão roubar o pão da galáxia!"', '* POMBOS: "Gru gru! O pão será NOSSO!"', '* (PEW PEW PEW!)', 'B: (sussurrando) Essa é a melhor parte!!']);
    this.view.panel = 2; this.view.t = 0;
    await W.say(['* POMBO: "Na verdade... a gente só queria um amigo."', '* PATO: "...Eu também, quá-bip."', '* (Eles dividem o pão da galáxia e se abraçam.)', 'B: (snif) Meus olhos estão vazando óleo...']);
    this.view.panel = 3; this.view.t = 0;
    await W.say(['* FIM.', 'B: Que filme LINDO! Eu me identifico com o pato. E com os pombos.', 'B: Todo mundo só quer um amigo, né?']);
    this.view = null;
    Sfx.stopMusic();
    F.p4movie = true; F.p4night = true; F.p4tour = 4;
    await this.teleport(DOORS4['15,66']);
    W.locked = true;
    Sfx.playMusic('bit');
    await W.say(['B: Opa, já anoiteceu! O tempo voa quando a gente tem um amigo.', 'B: Você pode dormir lá em casa! É a porta AZUL na praça.', 'B: Amanhã tem ESCOLA. Você vem comigo? Bip?']);
    W.saveHere(0);
    W.locked = false;
  },

  async sleep() {
    const W = World, F = G.flags;
    if (!F.p4night || F.p4day2) return W.say(['* (A cama do Bit. Ele nem usa, dorme no carregador.)']);
    W.locked = true;
    await W.say(['B: Pode dormir na cama! Eu durmo no carregador.', 'B: Boa noite! Bip... bip... zzz...']);
    Sfx.stopMusic();
    await Fade.to(1, 0.8);
    G.hp = G.maxhp;
    F.p4day2 = true;
    await wait(1.2);
    await Dialog.show([{ t: '* (...)' }, { t: '* (No dia seguinte...)' }], true);
    const p = W.player, I = W.instr;
    p.x = tx2x(37); p.y = ty2y(60); p.dir = 'up'; I.x = tx2x(39); I.y = ty2y(60); W.trail = [];
    W.updateCam(true);
    await Fade.to(0, 0.8);
    Sfx.schoolBell();
    await W.say(['B: BOM DIA! Bateria em 100%!', 'B: Hoje é dia de ESCOLA! A escola fica no fim da avenida, depois da praça.', 'B: ...', 'B: Você vai mesmo comigo? Eu fico nervoso indo sozinho. Bip.', '* (HP recuperado.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async notYet() {
    const W = World, p = W.player;
    W.locked = true;
    await W.say([G.flags.p4night ? 'B: Ei! Já é noite, a escola está fechada! Vamos pra minha casa.' : 'B: Ei! Ainda não terminamos o tour! Siga a setinha!']);
    await W.walk(p, [[p.x - 24, p.y]], 70);
    W.locked = false;
  },

  async bullyScene() {
    const W = World, F = G.flags, I = W.instr, p = W.player;
    F.p4bully = true; W.locked = true;
    this.bitNear();
    const bru = this.ent('bru'), tec = this.ent('tec'), ze = this.ent('zez');
    for (const e of [bru, tec, ze]) e.hidden = false;
    Sfx.stopMusic();
    I.follow = false;
    await W.walk(I, [[tx2x(114), ty2y(31)]], 60);
    I.dir = 'right';
    await W.walk(p, [[tx2x(110), ty2y(32)]], 60);
    Sfx.playMusic('valentoes');
    await W.say([
      'R: Olha só... a LATA VELHA chegou.',
      'K: Cadê sua bateria de lanche, robozinho? Passa pra cá!',
      'Z: Hehehe! Me dá isso!',
      'B: B-bip... por favor... é minha única bateria...',
    ]);
    I.sad = true;
    await W.walk(p, [[tx2x(113), ty2y(31)]], 90);
    await W.say(['* (Você se coloca na frente do Bit.)', 'R: Quem é esse? Um NOVATO?', 'R: Zé! Ensina pra ele como funciona aqui.']);
    W.battle('ze', { dragon: G.dragon, robot: true }, async r1 => {
      W.locked = true;
      ze.hidden = true;
      await W.say([r1 === 'spared' ? 'Z: ...Tá. Eu não queria mesmo.' : 'Z: AAAH! Vou contar pra diretora!', 'K: Hunf. Deixa comigo!']);
      W.battle('teca', { dragon: G.dragon, robot: true }, async r2 => {
        W.locked = true;
        tec.hidden = true;
        await W.say([r2 === 'spared' ? 'K: ...Tá bom, tá bom.' : 'K: Isso não vale!', 'R: ...', 'R: Hunf. Isso não acabou, NOVATO.', 'R: A gente se vê no RECREIO.']);
        bru.hidden = true;
        Sfx.schoolBell();
        I.sad = false;
        await W.say(['* (TRIIIIIM!)', 'B: Você... me defendeu?', 'B: Ninguém nunca fez isso. Bip... obrigado.', 'B: Vamos pra aula! A porta da escola é logo ali em cima.']);
        I.follow = true; W.trail = [];
        for (let i = 0; i < 30; i++) W.trail.push({ x: I.x, y: I.y, dir: I.dir });
        W.saveHere(0);
        W.locked = false;
      });
    });
  },

  talkVolt() {
    const W = World;
    if (G.flags.p4class) return W.say(['V: Bom trabalho hoje! Vão pro recreio, crianças. E robô.']);
    return W.say(['V: Bem-vindo à aula!']);
  },

  async classScene() {
    const W = World, F = G.flags, p = W.player, I = W.instr;
    W.locked = true;
    this.bitNear();
    for (const id of ['cbru', 'ctec', 'cze']) this.ent(id).hidden = false;
    await W.walk(p, [[tx2x(67), ty2y(59)]], 70);
    I.follow = false;
    await W.walk(I, [[tx2x(68) + 8, ty2y(59)]], 70);
    p.dir = 'up'; I.dir = 'left';
    Sfx.playMusic('escola');
    await W.say([
      'V: Bom dia, turma! Eu sou a PROFESSORA VOLT.',
      'V: Temos um aluno novo! Um humano. Sejam gentis.',
      'R: (lá do fundo) Hunf.',
      'V: Hoje vamos revisar para a prova. BIT, você responde primeiro!',
      'B: B-bip! Tá bom!',
      'V: BIT, quanto é 7 vezes 8?',
      'B: 56! ...Fácil. Sou basicamente uma calculadora com rodinhas.',
      'V: Correto! Agora as perguntas de HUMANOS.',
      'B: (sussurrando) Ai não... Me ajuda? Sussurra a resposta pra mim!',
    ]);
    const qs = [
      ['V: Qual é a cor do céu num dia de sol, lá na superfície?', ['Azul', 'Verde', 'Xadrez'], 0, 'B: Céu? Eu nunca vi o céu...'],
      ['V: O que os humanos sentem quando abraçam um amigo?', ['Carinho', 'Fome', 'Choque elétrico'], 0, 'B: Abraço é tipo... um carregador de coração?'],
      ['V: Complete o versinho: "Batatinha quando nasce..."', ['...se esparrama pelo chão', '...vira batata frita', '...chora de saudade'], 0, 'B: Batata... nasce?!'],
      ['V: Por que às vezes os humanos choram?', ['Quando estão tristes ou muito felizes', 'Pra lavar os olhos', 'Porque cortaram cebola, só isso'], 0, 'B: Vazamento? Igual meu óleo no cinema?'],
    ];
    let right = 0;
    for (const [q, opts, ok, bitThink] of qs) {
      await W.say([q, bitThink]);
      const order = opts.map((o, i) => [Math.random(), o, i]).sort((a, b) => a[0] - b[0]);
      const r = await W.ask('* (O que você sussurra pro Bit?)', order.map(o => o[1]));
      const picked = order[r][2], ans = opts[picked];
      if (picked === ok) {
        right++; Sfx.select();
        await W.say([`B: ${ans}!`, 'V: CORRETO! Muito bem, Bit!', 'B: BIIIP! (ele te dá um joinha escondido)']);
      } else {
        Sfx.buzz();
        await W.say([`B: ${ans}?`, 'V: Hmm... não exatamente.', 'R: HAHAHA! Lata burra!', 'V: BRUTÃO! Sem gracinhas!']);
      }
    }
    const nota = [4, 5, 7, 9, 10][right];
    await W.say([`V: Bit, sua nota de "Sentimentos Humanos" é... ${nota}!`, nota >= 9 ? 'B: NOTA ' + nota + '?! Meu recorde! BIP BIP BIP!' : 'B: Bip... dá pra melhorar. Obrigado por me ajudar!',
      'V: Ótimo! Podem ir para o RECREIO.']);
    Sfx.schoolBell();
    F.p4class = true; F.p4grade = nota;
    if (nota >= 9 && G.items.length < 8) { G.items.push('Pizza Laser'); await W.say(['B: Toma! Minha PIZZA LASER de lanche. Você merece!', '* Você ganhou uma PIZZA LASER.']); }
    await W.say(['* (TRIIIIIM! Hora do recreio.)', 'B: Vamos pro pátio! ...Espero que os valentões tenham esquecido de mim.']);
    I.follow = true; W.trail = [];
    for (let i = 0; i < 30; i++) W.trail.push({ x: I.x, y: I.y, dir: I.dir });
    W.saveHere(0);
    W.locked = false;
  },

  async bossScene() {
    const W = World, F = G.flags, I = W.instr, p = W.player;
    W.locked = true;
    const bru = this.ent('bru'), tec = this.ent('tec'), ze = this.ent('zez');
    for (const e of [bru, tec, ze]) e.hidden = false;
    Object.assign(bru, { x: tx2x(115), y: ty2y(25) }); Object.assign(tec, { x: tx2x(111), y: ty2y(25) }); Object.assign(ze, { x: tx2x(119), y: ty2y(25) });
    I.follow = false; I.x = tx2x(116); I.y = ty2y(21);
    await W.walk(p, [[tx2x(114), ty2y(21)]], 60);
    p.dir = 'down'; I.dir = 'left';
    Sfx.stopMusic();
    await W.say([
      'R: Ei, LATA! Tirou nota boa, é? Com ajuda do NOVATO?',
      'K: Dessa vez a gente não vai sozinho.',
      'Z: Dessa vez é a GANGUE INTEIRA!',
      'R: GANGUE DOS VALENTÕES... ATACAR!',
    ]);
    I.sad = true;
    await W.say(['B: B-bip... Fica perto de mim?', 'B: Eu vou tocar música pra te dar força! É o que eu sei fazer!', '* (Seu dragão aparece pra lutar também!)',
      '* (Dica: quando jogarem coisas no Bit, BLOQUEIE com sua ALMA. Se a bateria dele acabar, ele não toca música.)']);
    W.battle('valentoes', { dragon: G.dragon, robot: true }, r => this.afterBoss(r));
  },

  async afterBoss(r) {
    const W = World, F = G.flags, I = W.instr;
    W.locked = true;
    F.p4boss = true;
    I.sad = false;
    const bru = this.ent('bru'), tec = this.ent('tec'), ze = this.ent('zez');
    Sfx.playMusic('bit');
    if (r === 'spared') {
      await W.say([
        'R: ...',
        'R: A gente... só tinha medo. Do que era diferente.',
        'R: Eu também caí aqui sozinho. Achei que se eu fosse mau, ninguém mexia comigo.',
        'R: Desculpa, Bit.',
        'K: Seu robô é... legal até. Me empresta o carregador um dia?',
        'Z: Bit... me ensina quanto é 7 vezes 8?',
        'B: 56! E... claro! BIIIIP! Amigos?!',
      ]);
      F.bulliesFriends = true;
    } else {
      for (const e of [bru, tec, ze]) e.hidden = true;
      await W.say(['* (Os valentões fugiram correndo pelo pátio.)', 'C: EEEEEE! Alguém finalmente enfrentou eles!', 'V: (ao longe) O QUE ESTÁ ACONTECENDO AÍ?!', 'B: Bip! Vamos sair daqui, rápido!']);
    }
    for (const e of [bru, tec, ze]) e.hidden = true;
    await W.say([
      'B: Ei... humano.',
      'B: Você me mostrou que eu não preciso ter medo.',
      'B: Me dá seu número? Eu tenho um celular embutido! Fica aqui na barriga.',
    ]);
    Sfx.beep();
    F.bitContact = true;
    await W.say(['* (Você trocou contatos com o BIT.)', '* (Novo contato no CELULAR: BIT)']);
    await W.say([
      'B: Você precisa continuar sua jornada, né? Voltar pra casa...',
      'B: Eu fico aqui. Agora a escola vai ser bem melhor. Graças a você.',
      'B: Se precisar de música... é só ligar! BIP BOP!',
      'B: Tchau, melhor amigo humano!',
    ]);
    I.follow = false;
    await W.walk(I, [[tx2x(115), ty2y(18)]], 60);
    for (let i = 0; i < 30; i++) { await nextFrame(); I.alpha = 1 - i / 30; }
    I.visible = false; I.alpha = 1;
    F.p4end = true;
    await W.say(['* (BIT deixou o grupo.)']);
    W.saveHere();
    await Fade.to(1, 0.8);
    Sfx.stopMusic();
    Game.goEnd(4);
  },

  async stall() {
    const W = World;
    if (!G.flags.p4met) return W.say(['* (Uma lanchonete de neon. O robô dourado acena.)']);
    const stock = [['Pão Quântico', 'Pão 15G'], ['Suco de Pilha', 'Suco 22G'], ['Pizza Laser', 'Pizza 35G']];
    for (;;) {
      const r = await W.ask(`* BIP! Pedido? (Você tem ${G.gold} OURO)`, stock.map(s => s[1]).concat(['Sair']));
      if (r === 3 || r === undefined) return W.say(['* Volte sempre! Bip.']);
      const [name] = stock[r], price = ITEMS[name].price;
      if (G.gold < price) { Sfx.back(); await W.say(['* Saldo insuficiente. Bip.']); continue; }
      if (G.items.length >= 8) { Sfx.back(); await W.say(['* Seus bolsos estão cheios!']); continue; }
      G.gold -= price; G.items.push(name); Sfx.select();
      await W.say([`* Você comprou ${name.toUpperCase()}.`]);
    }
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere();
    await W.say(['* (As luzes neon da cidade te enchem de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
