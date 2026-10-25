// CAPÍTULO 2 — FASE 1: VILA AURORA (Antártica)
// Uma vila de neve, linda e pobre. Seu Jorge ensina a pescar no lago congelado.
// O jogador vê o Encapuzado conversando com uma SOMBRA, descobre (pelo Mestre Leão)
// que o nome verdadeiro do Instrutor é CARMINO — irmão da Carmim — e voa de dragão
// até o labirinto. No caminho, para pra comer. Lá, o Instrutor conta a história dos dois.
'use strict';

const WALK_A1 = ',.;=i';

MAPS.aurora = {
  music: 'aurora',
  start: { x: tx2x(30), y: ty2y(42), dir: 'up' },
  anim: 'o',

  build() {
    const MW = 64, MH = 46, g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    rect(3, 3, 58, 41, ',');
    // pinheiros em volta
    for (let x = 1; x < 63; x++) for (const y of [1, 2, 44]) if (x < 29 || x > 32 || y < 40) g[y][x] = 'T';
    for (let y = 1; y < 45; y++) for (const x of [1, 2, 61, 62]) g[y][x] = 'T';
    for (const [x, y] of [[4, 4], [6, 5], [16, 4], [44, 4], [42, 26], [57, 40], [52, 42], [6, 40], [14, 42], [24, 41], [37, 41], [58, 30], [4, 26], [5, 36]]) g[y][x] = 'T';
    // estrada (vinda da porta gigante), praça e caminhos
    rect(29, 24, 4, 22, '.');
    rect(20, 15, 22, 10, '.');
    rect(8, 11, 34, 2, '.');
    rect(28, 3, 5, 8, '.');
    rect(8, 19, 12, 2, '.');
    rect(42, 17, 3, 2, '.');
    rect(10, 33, 19, 2, '.');
    rect(46, 31, 4, 3, '.'); rect(44, 22, 2, 11, '.');
    // casas de troncos com neve no telhado
    const house = (x, y) => { rect(x, y, 7, 2, 'R'); rect(x, y + 2, 7, 3, 'H'); g[y + 3][x + 1] = 'W'; g[y + 3][x + 5] = 'W'; g[y + 4][x + 3] = 'D'; };
    house(8, 6); house(20, 6); house(34, 6); house(8, 28); house(46, 26); house(36, 27);
    // lago congelado com buracos de pesca
    rect(45, 6, 14, 16, 'i');
    rect(55, 6, 4, 5, 'w');
    for (const [x, y] of [[50, 12], [52, 17], [47, 18]]) g[y][x] = 'o';
    // penhasco dos dragões (oeste)
    rect(3, 14, 5, 10, ';');
    for (let y = 14; y < 24; y++) g[y][3] = '#';
    return { g };
  },

  solid(c) { return !WALK_A1.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.snowT, h = (x * 73 + y * 151) % 3;
    if (c === ',') return T.snow[h];
    if (c === '.') return T.path[h];
    if (c === ';') return T.deep[h];
    if (c === 'i') return T.ice[h];
    if (c === '=') return T.logs;
    if (c === 'o' || c === 'w') return T.water[0];
    if (c === 'T') return MAPS.dragoncity.layer(T.snow[h], T.pine);
    if (c === 'R') return T.roofSnow; if (c === 'H') return T.logs; if (c === 'W') return T.logWin; if (c === 'D') return T.logDoor;
    if (c === '#') { const b = W.tile(x, y + 1); return WALK_A1.includes(b) ? T.cliff : T.rockWall; }
    return T.rockWall;
  },
  animImg(c, x, y, fr) { return SPR.snowT.water[(fr + x + y) % 3]; },

  ents(W) {
    const F = G.flags;
    const npc = (id, spr, tx, ty, talk, opts = {}) => ({ id, x: tx2x(tx), y: ty2y(ty), w: 14, h: 8, solid: true, talk, hidden: !!opts.hidden,
      draw(sx, sy, t) {
        const img = typeof spr === 'function' ? spr() : spr;
        const shiver = !G.flags.a1feast ? Math.round(Math.sin(t * 30 + this.x) * 0.6) : 0;
        drawSpr(img, sx(this.x - img.width / 2) + shiver, sy(this.y - img.height + 1), 2, this.alpha ?? 1);
      } });
    const dragon = (id, k, tx, ty, hidden) => ({ id, x: tx2x(tx), y: ty2y(ty), w: 30, h: 12, solid: true, hidden, talk: () => A1.cliff(),
      draw(sx, sy, t) { drawSpr(SPR.dragon[k()].right[Math.floor(t * 2 + this.x) % 2], sx(this.x - 13), sy(this.y - 22) + Math.round(Math.sin(t * 2 + this.x) * 1.5), 2); } });
    return [
      { id: 'star', x: tx2x(24), y: ty2y(20), w: 12, h: 8, spr: 'star', solid: true, talk: () => A1.useStar() },
      { id: 'placa', x: tx2x(27), y: ty2y(40), w: 14, h: 6, spr: 'sign', solid: true, talk: () => c2say(['* (VILA AURORA — Antártica.)', '* (Embaixo, escrito à mão: "Aqui o frio é grande. O coração do povo, maior ainda.")']) },
      { id: 'placaD', x: tx2x(9), y: ty2y(18), w: 14, h: 6, spr: 'sign', solid: true, talk: () => c2say(['* (PENHASCO DOS DRAGÕES ←)', '* (Cuidado com o vento.)']) },
      { id: 'cozinha', x: tx2x(33) + 8, y: ty2y(18), w: 34, h: 12, solid: true, talk: () => A1.kitchen(),
        draw(sx, sy, t) {
          const x = sx(this.x), y = sy(this.y);
          ctx.fillStyle = '#000'; ctx.fillRect(x - 34, y - 6, 68, 12);
          ctx.fillStyle = '#5a3a24'; ctx.fillRect(x - 32, y - 4, 64, 8);
          drawFlame(x, y - 8, G.flags.a1feast ? 16 : 8, t * 10);
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, y - 22, 22, 14, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#3a3a44'; ctx.beginPath(); ctx.ellipse(x, y - 22, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = G.flags.a1feast ? '#e8c890' : '#22222a'; ctx.beginPath(); ctx.ellipse(x, y - 30, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
          if (G.flags.a1feast) for (let i = 0; i < 3; i++) { const q = (t * 0.6 + i / 3) % 1; ctx.fillStyle = `rgba(255,255,255,${0.5 - q * 0.5})`; ctx.fillRect(x - 10 + i * 10 + Math.sin(q * 6) * 4, y - 36 - q * 30, 4, 4); }
        } },
      npc('mA', () => SPR.morador.m1, 26, 22, () => A1.villager('A')),
      npc('mB', () => SPR.morador.m2, 37, 22, () => A1.villager('B')),
      npc('mC', () => SPR.crianca, 22, 17, () => A1.villager('C')),
      npc('mD', () => SPR.morador.m4, 13, 13, () => A1.villager('D')),
      npc('mE', () => SPR.morador.m3, 39, 13, () => A1.villager('E')),
      npc('mF', () => SPR.morador.m2, 14, 34, () => A1.villager('F')),
      npc('jorge', () => SPR.jorge, F.a1dragons && !F.a1left ? 8 : 49, F.a1dragons && !F.a1left ? 21 : 12, () => A1.talkJorge()),
      dragon('dP', () => G.dragon || 'lava', 5, 18, false),
      dragon('dK', () => A1.dragonOf('kai'), 5, 15, !F.a1dragons),
      dragon('dL', () => A1.dragonOf('luna'), 5, 21, !F.a1dragons),
      { id: 'enc', x: tx2x(29) + 8, y: ty2y(6), w: 14, h: 8, solid: false, hidden: true, alpha: 1,
        draw(sx, sy, t) { drawSpr(SPR.encapuzado, sx(this.x - 8), sy(this.y - 24) + Math.sin(t * 1.5) * 2, 2, this.alpha); } },
      { id: 'sombra', x: tx2x(31) + 8, y: ty2y(6), w: 14, h: 8, solid: false, hidden: true, alpha: 1,
        draw(sx, sy, t) {
          ctx.globalAlpha = this.alpha * (0.85 + Math.sin(t * 9) * 0.1);
          ctx.fillStyle = 'rgba(30,0,40,0.5)'; ctx.beginPath(); ctx.ellipse(sx(this.x), sy(this.y), 20, 6, 0, 0, Math.PI * 2); ctx.fill();
          drawSpr(SPR.sombra, sx(this.x - 7) + Math.round(Math.sin(t * 20) * 0.7), sy(this.y - 21), 2, this.alpha);
          ctx.globalAlpha = 1;
        } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [{ x: 28, y: 9, w: 5, h: 2, when: () => F.a1feast && !F.a1shadow, run: () => A1.shadowScene() }];
  },

  onEnter(W) { if (!G.flags.a1arrived) A1.arrive(); },
  musicAt(W) { return 'aurora'; },
  overlay(W, sx, sy) {
    const t = W.t;
    // aurora austral no céu (só aparece na parte de cima do mapa)
    const top = sy(0);
    if (top > -200) for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ['rgba(90,255,160,0.07)', 'rgba(120,200,255,0.06)', 'rgba(200,120,255,0.05)'][i];
      ctx.beginPath(); ctx.moveTo(0, top + 40);
      for (let x = 0; x <= 640; x += 32) ctx.lineTo(x, top + 30 + i * 18 + Math.sin(x * 0.012 + t * 0.6 + i) * 22);
      ctx.lineTo(640, top - 60); ctx.lineTo(0, top - 60); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 45; i++) ctx.fillRect(((i * 97 + Math.sin(t + i) * 20 + t * 15) % 680) - 20, (i * 61 + t * 35) % 480, 2, 2);
    ctx.fillStyle = 'rgba(200,225,255,0.12)'; ctx.fillRect(0, 0, 640, 480);
  },

  interactTile(W, c, tx, ty) {
    if (c === 'o') return A1.fishHole();
    if (c === 'w') return c2say(['* (Água aberta. Gelada demais até pra pensar em nadar.)']);
    if (c === 'D') return A1.door(tx, ty);
    if (c === 'W') return c2say(['* (Pela janela, uma família enrolada em cobertores, perto de uma vela.)']);
  },
  talkInstr() {},
};

// Missões da Fase 1
QUESTS.aurora = function (W) {
  const F = G.flags, n = F.cesto || 0;
  if (!F.a1rod) return { t: 'Converse com os moradores e procure o SEU JORGE no lago congelado (leste).', x: 49, y: 12 };
  if (!F.a1feast) return n < 5 ? { t: `Pesque nos BURACOS do lago congelado (${n}/5 peixes no cesto).`, x: 50, y: 12 } : { t: 'Leve os peixes para a COZINHA da praça.', x: 33, y: 17 };
  if (!F.a1shadow) return { t: 'Todo mundo comeu! Dê uma volta pela vila. (O beco fica ao norte da praça.)', x: 30, y: 6 };
  if (!F.a1feast2) return n < 3 ? { t: `O povo ainda precisa de comida. Pesque mais (${n}/3 no cesto).`, x: 52, y: 17 } : { t: 'Leve os peixes para a COZINHA da praça.', x: 33, y: 17 };
  if (!F.a1called) return { t: 'Ligue para o INSTRUTOR pelo CELULAR (botão B → CELULAR).' };
  if (!F.a1leao) return { t: 'Ligue para o MESTRE LEÃO pelo CELULAR.' };
  if (!F.a1dragons) return { t: 'Conte tudo para o SEU JORGE, no lago.', x: 49, y: 12 };
  return n < 3 ? { t: `Comida pra viagem: pesque pelo menos 3 (${n} no cesto). Quanto mais, mais comida pra lutar depois!`, x: 50, y: 12 }
    : { t: `Vá ao PENHASCO DOS DRAGÕES (oeste) para partir. (${n} peixes no cesto)`, x: 6, y: 18 };
};

const A1 = {
  ent(id) { return World.ents.find(e => e.id === id); },
  dragonOf(who) {
    const base = (DRAGONS[G.dragon] && DRAGONS[G.dragon].base) || G.dragon || 'laranja';
    const pool = ['preto', 'branco', 'laranja'].filter(k => k !== base);
    return who === 'kai' ? pool[0] : pool[1];
  },

  async arrive() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; F.a1arrived = true;
    p.x = tx2x(30); p.y = ty2y(43); p.dir = 'up'; W.trail = []; W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('aurora'); Fade.to(0, 0.6);
    await wait(0.4);
    await c2say([
      '* (A estrada de neve termina numa vila pequenininha.)',
      '* (Casas de tronco, telhados brancos, fumaça fina saindo das chaminés.)',
      '* (No céu, luzes verdes dançam.)',
      '3: Que LINDO! Que lugar é esse?!',
      '4: A placa diz... VILA AURORA. Antártica.',
      '3: ANTÁRTICA?! A gente andou até o POLO SUL?!',
      '4: Acho que a porta gigante levou a gente pra bem longe.',
    ]);
    if (F.pickDragon) {
      await c2say(['* (Seu dragão pousa do seu lado, sacudindo a neve das asas.)']);
      const r = await W.ask('* (Qual é o SEU dragão?)', ['Dragão de Lava', 'Dragão de Neve', 'Dragão das Trevas']);
      G.dragon = ['lava', 'neve', 'trevas'][r] || 'lava';
      F.pickDragon = false;
      await c2say([`* (O ${DRAGONS[G.dragon].name.toUpperCase()} encosta a cabeça em você.)`]);
    }
    await W.walk(p, [[tx2x(30), ty2y(36)]], 50);
    const m = this.ent('mA');
    await W.walk(m, [[tx2x(30), ty2y(30)]], 40);
    await c2say([
      'M: ...Viajantes? Aqui? Faz tanto tempo...',
      'M: Sejam bem-vindos. Desculpem... a gente não tem nada pra oferecer.',
      'M: O frio piorou. Os peixes sumiram do lago. A comida acabou faz dias.',
      'M: As crianças estão com fome.',
      '* (Ele tenta sorrir, mas está tremendo.)',
      '4: ...Que triste.',
      '3: Ei. A gente pode ficar uns dias e ajudar, né?',
      '4: Claro que sim.',
      'M: Ajudar...? Se vocês querem mesmo... falem com o Seu Jorge. Lá no lago congelado.',
      'M: É o único que ainda consegue pescar alguma coisa.',
    ]);
    await W.walk(m, [[tx2x(26), ty2y(22)]], 40);
    m.x = tx2x(26); m.y = ty2y(22);
    W.saveHere(0);
    W.locked = false;
  },

  async villager(k) {
    const F = G.flags, fed = F.a1feast, gone = F.a1left;
    const L = {
      A: fed ? ['M: Que sopa! Eu tinha até esquecido o gosto de peixe.', 'M: Obrigado. De verdade.'] : ['M: O Seu Jorge fica no lago, a leste da praça.', 'M: Se alguém pode ensinar vocês a pescar, é ele.'],
      B: fed ? ['M: Meus filhos dormiram de barriga cheia hoje. Faz semanas que isso não acontecia.'] : ['M: A gente divide o pouco que tem. Mas está ficando difícil.', 'M: Aqui ninguém é rico. Mas ninguém deixa ninguém pra trás.'],
      C: fed ? ['C: TIO! A SOPA TAVA MUITO BOA!', 'C: Quando eu crescer eu vou ser pescador igual o Seu Jorge!'] : ['C: Tio... você tem comida?', 'C: ...Tudo bem. Eu nem tô com tanta fome.', '* (A barriga dela ronca alto.)'],
      D: fed ? ['M: Na minha época, o lago era cheio de peixe dourado.', 'M: Talvez eles voltem. Hoje eu acredito.'] : ['M: Eu moro aqui há 80 anos, meu jovem. Nunca vi um inverno tão longo.', 'M: Mas a aurora continua bonita. Isso ninguém tira da gente.'],
      E: fed ? ['M: Você viu aquelas figuras estranhas no beco, outro dia?', 'M: Eu senti um frio que não era da neve.'] : ['M: A lenha está acabando também. A gente queima o que dá.'],
      F: fed ? ['M: Seus amigos são muito engraçados. O de boné derrubou a panela duas vezes.', '3: Foi UMA vez!'] : ['M: Tem gente que passa por aqui e nem olha pra gente.', 'M: Vocês são diferentes.'],
    }[k];
    if (gone) return c2say(['M: Boa viagem!']);
    return c2say(L);
  },

  async door(tx, ty) {
    const lines = { '11,10': '* (Você bate. Uma senhorinha abre, te dá um sorriso e um abraço quentinho.)', '23,10': '* (Ninguém atende. Lá dentro, alguém tosse.)',
      '37,10': '* (A porta está trancada. Um bilhete: "Fui pescar com o Jorge.")', '11,32': '* (Lá dentro, crianças brincam de guerra de travesseiro pra esquentar.)',
      '49,30': '* (A cabana do Seu Jorge. Cheiro de peixe e de lenha.)', '39,31': '* (Uma família inteira dorme junta embaixo de um monte de cobertores.)' };
    return c2say([lines[tx + ',' + ty] || '* (Uma porta de madeira, coberta de gelo.)']);
  },

  async talkJorge() {
    const W = World, F = G.flags, j = this.ent('jorge');
    W.locked = true;
    if (!F.a1rod) {
      F.a1jorge = true;
      await c2say([
        'J: Opa! Gente nova! E com um dragão ainda!',
        'J: Eu sou o Jorge. Seu Jorge, pros mais novos. Pescador desde que me entendo por gente.',
        'J: O lago anda triste. Tão frio que os peixes foram pro fundo.',
        'J: Mas peixe é teimoso. Sempre sobra algum, pra quem tem paciência.',
        'J: Vocês querem ajudar a vila? Então aprendam a pescar.',
        'J: Senta aqui no buraco do gelo. Eu ensino.',
      ]);
      await c2say([
        'J: Primeiro, aperte A pra LANÇAR a linha.',
        'J: Depois, espera. Quando a boia AFUNDAR e aparecer o "!", aperta A rápido!',
        'J: Aí começa a briga: SEGURE A (ou o dedo na tela) pra subir a rede verde. Solte pra descer.',
        'J: Deixe o peixe DENTRO da rede verde até a barra encher. Fácil!',
      ]);
      await Fish2.play({ tutorial: true });
      F.a1rod = true;
      Sfx.levelUp();
      await c2say([
        'J: HAHA! Olha só! Primeira tentativa!',
        '* Você ganhou uma VARA DE PESCA!',
        'J: Pode pescar em qualquer BURACO do lago. Os peixes vão pro seu CESTO.',
        'J: Pega uns 5 e leva na COZINHA da praça. O povo vai fazer festa.',
      ]);
      W.saveHere(0);
    } else if (!F.a1feast) {
      await c2say([`J: Já tem ${F.cesto || 0} no cesto! Faltam ${Math.max(0, 5 - (F.cesto || 0))} pros 5.`, 'J: O peixe DOURADO é raro e foge muito. Mas vale por três!']);
    } else if (!F.a1shadow) {
      await c2say(['J: Que festa, hein? Faz anos que eu não via o povo rindo assim.', 'J: Vai dar uma volta, vai. Você merece.']);
    } else if (!F.a1leao) {
      await c2say(['J: Tá com uma cara de quem viu fantasma.', 'J: Peixe resolve. Ou pelo menos ajuda a pensar.']);
    } else if (!F.a1dragons) {
      await this.giveDragons();
    } else {
      await c2say(['J: Quanto mais peixe, mais comida pra viagem. E o que sobrar eu asso pra vocês.', 'J: Quando estiver pronto, vai pro PENHASCO.']);
    }
    W.locked = false;
  },

  async fishHole() {
    const W = World, F = G.flags;
    if (!F.a1rod) return c2say(['* (Um buraco no gelo. A água lá embaixo é escura e gelada.)', '* (Você não tem vara de pesca.)']);
    if (F.a1left) return;
    W.locked = true;
    const r = await W.ask('* (Pescar aqui?)', ['Pescar', 'Agora não']);
    if (r === 0) await Fish2.play({});
    W.locked = false;
  },

  takeFish(n) {
    const F = G.flags;
    F.cesto = (F.cesto || 0) - n;
    const extraGold = Math.max(0, (F.cestoD || 0) - F.cesto);
    F.cestoD = (F.cestoD || 0) - extraGold;
  },

  async kitchen() {
    const W = World, F = G.flags, n = F.cesto || 0;
    if (!F.a1rod) return c2say(['* (Um caldeirão enorme... vazio.)', '* (O fogo embaixo está quase apagando.)']);
    const second = F.a1shadow && !F.a1feast2, need = second ? 3 : 5;
    if (F.a1feast && !second) return c2say(['* (O caldeirão ainda está quentinho.)']);
    if (n < need) return c2say([`* (A cozinha da vila precisa de ${need} peixes. Você tem ${n} no cesto.)`]);
    W.locked = true;
    this.takeFish(need);
    await Fade.to(1, 1.5);
    G.hp = G.maxhp;
    if (!second) {
      F.a1feast = true;
      await c2show([
        '* (Vocês acendem o fogo e jogam os peixes no caldeirão.)',
        '* (O cheiro se espalha pela vila. As portas vão se abrindo, uma por uma.)',
        '* (Logo a praça está cheia. Gente rindo, crianças correndo, tigelas fumegando.)',
        '3: Mais uma tigela pra mim!',
        '4: Kai, deixa pros outros!',
        '* (Pela primeira vez em muito tempo, a Vila Aurora janta de barriga cheia.)',
      ], true);
    } else {
      F.a1feast2 = true;
      await c2show([
        '* (Mais uma panela de sopa. A vila inteira agradece.)',
        '* (A senhorinha te dá um abraço. A criança te dá um desenho seu, de olho vermelho e tudo.)',
        '4: ...Você está quieto. Ainda pensando naquela sombra?',
        '* (Você está.)',
        '4: Por que você não liga pro Instrutor? Ele sempre sabe o que fazer.',
      ], true);
    }
    await Fade.to(0, 1.5);
    W.saveHere(0);
    W.locked = false;
  },

  async shadowScene() {
    const W = World, F = G.flags, p = W.player, e = this.ent('enc'), s = this.ent('sombra');
    W.locked = true;
    e.hidden = false; s.hidden = false; e.alpha = 1; s.alpha = 1;
    Sfx.stopMusic();
    W.excl = 0.8; Sfx.encounter();
    W.focus(tx2x(30), ty2y(8));
    await wait(1);
    W.shake = 0.6; Sfx.wind();
    await c2show([
      '* (No fim do beco, duas figuras conversam baixinho.)',
      '* (Uma é o ENCAPUZADO.)',
      '* (A outra... é uma SOMBRA. Uma sombra com a SUA forma.)',
      '* (Um ARREPIO sobe pela sua espinha. Você nunca sentiu nada assim na vida.)',
      '3: (...quem são esses?)',
      '4: (Shhh!)',
    ]);
    Sfx.playMusic('encontro');
    await c2show([
      'S: ...então está decidido.',
      'X: Faltam poucas. Muito poucas.',
      'S: E quando estiverem todas juntas?',
      'X: Aí a Carmim vai atrás d—',
    ]);
    W.shake = 1; Sfx.wind();
    await c2show(['* (Uma rajada de vento passa uivando pelo beco e engole o resto da frase.)', 'X: ...só falta encontrar o ——.', '* (Você não consegue ouvir.)']);
    await wait(0.4);
    await c2show(['X: ...', 'X: Tem alguém aqui.']);
    Sfx.puff();
    for (let i = 0; i < 30; i++) { e.alpha = s.alpha = 1 - i / 30; await nextFrame(); }
    e.hidden = s.hidden = true;
    W.focus(null);
    F.a1shadow = true;
    Sfx.playMusic('aurora');
    await c2show([
      '3: Eles... sumiram?',
      '4: Aquela sombra... era igualzinha a VOCÊ.',
      '3: E falaram da CARMIM. A menina da praia!',
      '* (Seu coração ainda está acelerado.)',
      '* (Mas a vila ainda precisa de comida. Você decide deixar isso de lado... por enquanto.)',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  // Celular (chamado pelo C2.phone)
  async call(o) {
    const W = World, F = G.flags;
    if (o === 'Instrutor' && F.a1feast2 && !F.a1called) {
      W.locked = true;
      Sfx.ring(); await wait(0.6);
      await c2say([
        'I: ...Alô? Ah! É você! Tudo bem? Onde vocês estão?',
        'I: ANTÁRTICA?! Hahaha! Vocês não param quieto, hein?',
        '* (Você conta da vila, da pescaria... e do beco. Do Encapuzado e da sombra.)',
        'I: ...',
        '* (Você diz que eles falaram da CARMIM.)',
        'I: ......',
        '* (O Instrutor fica em silêncio por muito tempo.)',
        'I: Escuta. Eu não posso explicar isso pelo telefone.',
        'I: Liga pro Mestre Leão. Ele é forte, e sabe de coisas... que eu nunca tive coragem de contar.',
        'I: Vou te mandar o número dele.',
        '* (Novo contato: MESTRE LEÃO.)',
        'I: E... se cuida. Por favor.',
      ]);
      F.a1called = true; F.leaoNum = true;
      W.saveHere(0); W.locked = false;
      return true;
    }
    if (o === 'Instrutor' && !F.a1called) {
      Sfx.ring(); await wait(0.5);
      await c2say(['I: Alô! Antártica? Que aventura!', 'I: Ajudem esse povo. Vocês fazem diferença onde passam.']);
      return true;
    }
    if (o === 'Mestre Leão' && F.a1called && !F.a1leao) {
      W.locked = true;
      Sfx.ring(); await wait(0.6);
      await c2say([
        '2: GRRRR... Quem fala?',
        '2: ...Ah. O pupilo do CARMINO. Eu reconheço essa determinação até pelo telefone.',
        '* (Carmino...?)',
        '2: O seu instrutor, oras! Carmino. Ninguém chama ele pelo nome verdadeiro faz muito, muito tempo.',
        '2: Se ele mandou você me ligar, a coisa é séria.',
        '* (Você conta da sombra. E da Carmim.)',
        '2: ...GRRR.',
        '2: Não cabe a mim contar essa história. É dele.',
        '2: Vá até ele. Pessoalmente. Olhe nos olhos dele e pergunte.',
        '2: E garoto... treine. Você vai precisar.',
        '* (Desligou.)',
      ]);
      await wait(0.4);
      await c2say([
        '3: Carmino...',
        '4: ...Carmim.',
        '3: Quase o mesmo nome. Que coincidência, né?',
        '* (Você junta as peças.)',
        '* (O nome. O silêncio dele quando você falou dela. Os olhos tristes quando via alguém cair aqui.)',
        '* (Não é coincidência.)',
        '* O INSTRUTOR É IRMÃO DA CARMIM.',
        '3: QUÊ?!',
        '4: Faz sentido... Temos que falar com ele. Lá no labirinto.',
        '3: O LABIRINTO?! Isso é do outro lado do mundo! A pé leva meses!',
        '4: ...De dragão, não.',
        '3: Mas só tem UM dragão. A gente não cabe todo mundo.',
        '4: Talvez o Seu Jorge saiba de alguma coisa.',
      ]);
      F.a1leao = true;
      W.saveHere(0); W.locked = false;
      return true;
    }
    if (o === '???' && F.a1shadow) {
      Sfx.ring(); await wait(0.5);
      await c2say(['* (Chamando...)', '* (...)', '* (Ninguém atende. Mas você jura que ouviu uma risada baixinha antes de cair.)']);
      return true;
    }
    return false;
  },

  async giveDragons() {
    const W = World, F = G.flags, p = W.player, j = this.ent('jorge');
    await c2say([
      'J: Irmão da menina de olho vermelho? Do outro lado do mundo? Hmm...',
      'J: Vocês precisam de asas. E de mais asas do que esse dragão sozinho tem.',
      'J: Venham comigo. Vou mostrar uma coisa.',
    ]);
    await Fade.to(1, 2);
    p.x = tx2x(10); p.y = ty2y(19); p.dir = 'left'; W.trail = [];
    j.x = tx2x(8); j.y = ty2y(21);
    W.updateCam(true);
    await Fade.to(0, 2);
    await c2say(['* (O Seu Jorge leva dois dedos à boca e assobia.)']);
    Sfx.roar(); W.shake = 0.6;
    for (const id of ['dK', 'dL']) { const d = this.ent(id); d.hidden = false; }
    await c2say([
      '* (Dois dragões descem do céu e pousam no penhasco!)',
      'J: Esses dois eu achei ainda ovinho, congelados na neve. Criei como filhos.',
      'J: Eles cresceram. Querem voar longe. E eu sei reconhecer gente boa.',
      'J: Kai. Luna. Eles são de vocês.',
      '3: UM DRAGÃO... SÓ MEU?!',
      '* (Kai sai correndo e abraça o pescoço do dragão. O dragão lambe a cara dele.)',
      '4: Obrigada, Seu Jorge... eu nem sei o que dizer.',
      'J: Diz que vai cuidar bem dele. Basta.',
      'J: Agora escutem: é viagem LONGA. Vão ter que parar pra comer no caminho.',
      'J: Pesquem bastante. Pelo menos 3 peixes pras paradas.',
      'J: E o que sobrar, eu ASSO pra vocês levarem. Comida de briga. Vai que encontram aquele encapuzado de novo...',
    ]);
    F.a1dragons = true;
    W.saveHere(0);
  },

  async cliff() {
    const W = World, F = G.flags, n = F.cesto || 0;
    if (!F.a1dragons) return c2say(['* (Seu dragão está descansando no penhasco, olhando pro horizonte.)']);
    if (F.a1left) return;
    if (n < 3) return c2say([`J: Calma! Com ${n} peixe${n === 1 ? '' : 's'} vocês não chegam nem no meio do mar.`, 'J: Pelo menos 3 no cesto. Vai pescar!']);
    W.locked = true;
    const r = await W.ask(`* (Partir para o labirinto? Você tem ${n} peixes no cesto.)`, ['Partir', 'Pescar mais']);
    if (r !== 0) { W.locked = false; return; }
    const left = n - 3, gold = Math.min(F.cestoD || 0, left);
    let given = 0;
    for (let i = 0; i < left && G.items.length < 8; i++) { G.items.push(i < gold ? 'Dourado Assado' : 'Peixe Assado'); given++; }
    F.cesto = 3; F.cestoD = 0;
    await c2say(given ? [
      `J: Separei 3 peixes pras paradas. Os outros ${given}, eu assei agora mesmo. Tão na mochila!`,
      'J: É pra comer na hora do aperto. Promete?',
    ] : ['J: Separei os 3 peixes pras paradas.', 'J: Não sobrou nada pra assar... Se precisar de comida no caminho, se vira, hein?']);
    await c2say([
      '* (A vila inteira veio se despedir.)',
      'C: TIO! VOLTA LOGO!',
      'M: Obrigado por tudo. A Vila Aurora nunca vai esquecer vocês.',
      'J: Vão com cuidado. E voltem pra pescar comigo um dia.',
    ]);
    F.a1left = true;
    W.saveHere(0);
    await Fade.to(1, 1.2);
    Sfx.stopMusic();
    C2.scene(Voo2);
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere(0);
    await c2say(['* (A aurora brilha no céu. Mesmo com frio, isso te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};

// ---------------- PESCARIA ----------------
const FISH2 = {
  gelo: { name: 'PEIXE-GELO', w: 55, speed: 0.55, jump: 0.35 },
  bacalhau: { name: 'BACALHAU', w: 30, speed: 0.85, jump: 0.5 },
  dourado: { name: 'PEIXE DOURADO', w: 8, speed: 1.4, jump: 0.75 },
  bota: { name: 'UMA BOTA VELHA', w: 7, speed: 0.25, jump: 0.15 },
};
const Fish2 = {
  play(opts) {
    return new Promise(res => {
      this.res = res; this.opts = opts || {}; this.prev = Game.scene;
      Game.cine = this; Game.scene = 'cine';
      this.enter();
    });
  },
  enter() {
    Object.assign(this, { t: 0, st: 'aim', pow: 0, powDir: 1, msg: null, msgT: 0, catches: 0, choice: 0, bob: { x: 420, y: 330 }, castT: 0 });
    Sfx.playMusic('pesca');
  },
  pick() {
    if (this.opts.tutorial) return 'gelo';
    let r = Math.random() * Object.values(FISH2).reduce((a, f) => a + f.w, 0);
    for (const k in FISH2) { r -= FISH2[k].w; if (r <= 0) return k; }
    return 'gelo';
  },
  hold() { return Input.held.a || Input.held.up || Input.drag.active; },
  press() { return Input.isPressed('a') || !!Input.tap; },
  say(m, t = 1.4) { this.msg = m; this.msgT = t; },
  update(dt) {
    this.t += dt; this.clock = (this.clock || 0) + dt;
    if (this.msgT > 0) this.msgT -= dt;
    const S = this;
    if (S.st === 'aim') {
      S.pow += dt * 1.4 * S.powDir;
      if (S.pow > 1) { S.pow = 1; S.powDir = -1; } if (S.pow < 0) { S.pow = 0; S.powDir = 1; }
      if (S.press() && S.t > 0.3) { Sfx.whoosh(); S.st = 'cast'; S.castT = 0; S.dist = 0.4 + S.pow * 0.6; }
    } else if (S.st === 'cast') {
      S.castT += dt;
      if (S.castT > 0.6) { Sfx.splash(); S.st = 'wait'; S.waitT = this.opts.tutorial ? 1.4 : 1.4 + Math.random() * 2.6 - S.dist * 0.6; S.nib = 0; }
    } else if (S.st === 'wait') {
      S.waitT -= dt;
      if (S.press()) { Sfx.back(); S.say('Puxou cedo demais! O peixe se assustou.'); S.st = 'aim'; S.t = 0; return; }
      if (S.waitT <= 0) { S.st = 'bite'; S.biteT = this.opts.tutorial ? 1.6 : 0.85; S.kind = S.pick(); Sfx.splash(); }
    } else if (S.st === 'bite') {
      S.biteT -= dt;
      if (S.press()) { Sfx.select(); S.st = 'reel'; S.fish = 0.5; S.fishV = 0; S.fishT = 0; S.zone = 0.35; S.zoneV = 0; S.prog = 0.3; return; }
      if (S.biteT <= 0) { Sfx.back(); S.say('O peixe escapou...'); S.st = 'aim'; S.t = 0; }
    } else if (S.st === 'reel') {
      const f = FISH2[S.kind], tut = this.opts.tutorial, size = tut ? 0.4 : 0.28;
      S.fishT -= dt;
      if (S.fishT <= 0) { S.fishT = (0.5 + Math.random() * 0.8) / (0.6 + f.speed * 0.5); S.fishGoal = Math.max(0.05, Math.min(0.95, S.fish + (Math.random() - 0.5) * 2 * f.jump)); }
      S.fish += (S.fishGoal - S.fish) * Math.min(1, dt * (tut ? 1.5 : 2 + f.speed * 3));
      S.zoneV += (S.hold() ? 2.6 : -2.2) * dt;
      S.zoneV = Math.max(-1.2, Math.min(1.2, S.zoneV));
      S.zone += S.zoneV * dt;
      if (S.zone < 0) { S.zone = 0; S.zoneV = Math.max(0, S.zoneV) * 0.3; }
      if (S.zone > 1 - size) { S.zone = 1 - size; S.zoneV = Math.min(0, S.zoneV) * 0.3; }
      const inside = S.fish >= S.zone && S.fish <= S.zone + size;
      S.inside = inside;
      S.prog += (inside ? (tut ? 0.45 : 0.32) : (tut ? -0.08 : -0.2)) * dt;
      if (S.prog >= 1) return S.caught();
      if (S.prog <= 0) { Sfx.back(); S.say('A linha soltou! O peixe fugiu.'); S.st = 'aim'; S.t = 0; }
    } else if (S.st === 'show') {
      if (S.t > 0.8 && S.press()) {
        if (this.opts.tutorial) return S.finish();
        S.st = 'menu'; S.choice = 0; S.t = 0;
      }
    } else if (S.st === 'menu') {
      if (Input.isPressed('up') || Input.isPressed('down')) { S.choice = 1 - S.choice; Sfx.move(); }
      let ch = Input.isPressed('a') && S.t > 0.2 ? S.choice : -1;
      if (Input.tap) { if (Math.abs(Input.tap.y - 372) < 20) ch = 0; if (Math.abs(Input.tap.y - 412) < 20) ch = 1; }
      if (Input.isPressed('b')) ch = 1;
      if (ch === 0) { Sfx.select(); S.st = 'aim'; S.t = 0; }
      if (ch === 1) { Sfx.select(); S.finish(); }
    }
  },
  caught() {
    const F = G.flags;
    this.st = 'show'; this.t = 0;
    if (this.kind === 'bota') { Sfx.buzz(); return; }
    Sfx.levelUp();
    F.cesto = (F.cesto || 0) + 1;
    if (this.kind === 'dourado') F.cestoD = (F.cestoD || 0) + 1;
    F.fishTotal = (F.fishTotal || 0) + 1;
    this.catches++;
  },
  async finish() {
    await Fade.to(1, 3);
    Game.scene = this.prev || 'world';
    Sfx.playMusic(World.M.music);
    Fade.to(0, 3);
    const r = this.res; this.res = null; r && r(this.catches);
  },
  draw() {
    const t = this.t, S = this, T = this.clock || 0;
    // céu com aurora
    const sky = ctx.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, '#040818'); sky.addColorStop(1, '#1a3a5a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 260);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ['rgba(90,255,160,0.18)', 'rgba(120,200,255,0.14)', 'rgba(200,120,255,0.1)'][i];
      ctx.beginPath(); ctx.moveTo(0, 140);
      for (let x = 0; x <= 640; x += 20) ctx.lineTo(x, 70 + i * 26 + Math.sin(x * 0.015 + T * 0.7 + i * 2) * 26);
      ctx.lineTo(640, 0); ctx.lineTo(0, 0); ctx.fill();
    }
    ctx.fillStyle = '#fff'; for (let i = 0; i < 30; i++) ctx.fillRect((i * 97) % 640, (i * 37) % 120, 2, 2);
    // montanhas e gelo
    ctx.fillStyle = '#c8d8ec'; ctx.beginPath(); ctx.moveTo(0, 250); ctx.lineTo(120, 180); ctx.lineTo(220, 240); ctx.lineTo(360, 170); ctx.lineTo(520, 245); ctx.lineTo(640, 200); ctx.lineTo(640, 260); ctx.lineTo(0, 260); ctx.fill();
    ctx.fillStyle = '#dcecf8'; ctx.fillRect(0, 250, W, 230);
    ctx.fillStyle = '#b8d0e8'; for (let i = 0; i < 12; i++) ctx.fillRect((i * 131) % 640, 270 + (i * 47) % 180, 40, 2);
    // buraco no gelo
    ctx.fillStyle = '#8ab4d8'; ctx.beginPath(); ctx.ellipse(430, 340, 90, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a2440'; ctx.beginPath(); ctx.ellipse(430, 342, 82, 21, 0, 0, Math.PI * 2); ctx.fill();
    // pescador (você) com a vara
    drawSpr(SPR.player.right[0], 150, 280, 4);
    if (this.opts.tutorial) drawSpr(SPR.jorge, 60, 274, 4);
    const tipX = 270, tipY = 230 + (S.st === 'reel' ? Math.sin(t * 30) * 3 : 0);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(196, 330); ctx.lineTo(tipX, tipY); ctx.stroke();
    ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(196, 330); ctx.lineTo(tipX, tipY); ctx.stroke();
    // boia
    let bx = 430, by = 336;
    if (S.st === 'aim') { bx = tipX; by = tipY + 30; }
    if (S.st === 'cast') { const k = Math.min(1, S.castT / 0.6); bx = tipX + (430 - tipX) * k; by = tipY + 30 + (336 - tipY - 30) * k - Math.sin(k * Math.PI) * 80; }
    if (S.st === 'wait') by += Math.sin(t * 3) * 2 + (Math.sin(t * 13) > 0.92 ? 4 : 0);
    if (S.st === 'bite') by += 8;
    if (S.st === 'reel') { bx += Math.sin(t * 11) * 14; by += 6; }
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(bx, by - 6); ctx.stroke();
    if (!['show', 'menu'].includes(S.st)) {
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(bx, by - 4, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(bx, by - 5, 5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by - 5, 5, 0, Math.PI); ctx.fill();
    }
    if (S.st === 'bite') { text('!', bx, by - 70, 48, '#fff', 'center', FONT_TITLE); }
    // cesto
    frameBox(16, 16, 220, 56, 4);
    text(`CESTO: ${G.flags.cesto || 0} peixe${(G.flags.cesto || 0) === 1 ? '' : 's'}`, 30, 26, 30, '#ffe680');
    // painéis
    if (S.st === 'aim') {
      frameBox(150, 400, 340, 66, 4);
      text('A / toque: LANÇAR', 320, 406, 28, '#fff', 'center');
      ctx.fillStyle = '#333'; ctx.fillRect(180, 440, 280, 14);
      ctx.fillStyle = '#7aff9a'; ctx.fillRect(180, 440, 280 * S.pow, 14);
    }
    if (S.st === 'wait') text('Espere a boia afundar...', 320, 420, 30, '#fff', 'center');
    if (S.st === 'bite') text('AGORA! Aperte A!', 320, 420, 34, '#ffff40', 'center');
    if (S.st === 'reel') {
      const x = 560, y = 90, h = 300, size = this.opts.tutorial ? 0.4 : 0.28;
      frameBox(x - 30, y - 10, 60, h + 20, 4);
      ctx.fillStyle = '#0a2440'; ctx.fillRect(x - 22, y, 44, h);
      ctx.fillStyle = S.inside ? 'rgba(90,255,120,0.75)' : 'rgba(90,255,120,0.45)';
      ctx.fillRect(x - 20, y + h - (S.zone + size) * h, 40, size * h);
      const img = SPR.peixe[S.kind === 'bota' ? 'bacalhau' : S.kind] || SPR.peixe.gelo;
      if (S.kind === 'bota') drawSpr(SPR.bota, x - 8, y + h - S.fish * h - 7, 2);
      else drawSpr(img, x - 12, y + h - S.fish * h - 7, 2);
      // progresso
      ctx.fillStyle = '#333'; ctx.fillRect(x - 46, y, 10, h);
      ctx.fillStyle = S.prog > 0.66 ? '#7aff9a' : S.prog > 0.33 ? '#ffe680' : '#ff5a5a';
      ctx.fillRect(x - 46, y + h - S.prog * h, 10, S.prog * h);
      text('SEGURE A', 330, 420, 30, '#fff', 'center');
      text('(ou o dedo na tela)', 330, 448, 22, '#aaa', 'center');
    }
    if (S.st === 'show' || S.st === 'menu') {
      frameBox(140, 110, 360, 200, 5);
      const f = FISH2[S.kind];
      text(S.kind === 'bota' ? 'Que azar...' : 'VOCÊ PESCOU:', 320, 124, 28, '#aaa', 'center');
      if (S.kind === 'bota') drawSpr(SPR.bota, 288, 170, 8);
      else drawSpr(SPR.peixe[S.kind], 272, 176 + Math.sin(t * 4) * 3, 8);
      text(f.name + '!', 320, 250, 32, S.kind === 'dourado' ? '#ffd23a' : '#fff', 'center');
      if (S.kind === 'bota') text('Ninguém come isso.', 320, 280, 24, '#888', 'center');
      else text(S.kind === 'dourado' ? 'Raro! Vale muito mais.' : 'Foi pro cesto.', 320, 280, 24, '#9fe4ff', 'center');
    }
    if (S.st === 'menu') {
      ['PESCAR DE NOVO', 'PARAR'].forEach((o, i) => {
        const on = i === S.choice;
        if (on) drawSpr(SPR.soul, 220, 364 + i * 40 + 4, 1);
        text(o, 320, 356 + i * 40, 32, on ? '#ffff40' : '#fff', 'center');
      });
    }
    if (S.msgT > 0 && S.msg) { frameBox(110, 160, 420, 60, 4); text(S.msg, 320, 174, 28, '#fff', 'center'); }
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 30; i++) ctx.fillRect(((i * 97 + T * 20) % 680) - 20, (i * 61 + T * 40) % 480, 2, 2);
  },
};

// ---------------- O VOO ATÉ O LABIRINTO ----------------
const Voo2 = {
  enter() {
    Object.assign(this, { t: 0, stop: null, sky: 0 });
    Fade.a = 1; Fade.to(0, 1);
    Sfx.playMusic('voo');
    this.run();
  },
  async run() {
    const F = G.flags;
    await wait(1.2);
    await c2show(['3: UHUUUUUUL! EU TÔ VOANDO!', '4: Kai! Segura direito!', '3: Meu dragão vai se chamar... BIFE!', '4: ...Por quê?', '3: Porque eu tô com fome!']);
    const stops = [
      { name: 'UM ICEBERG NO MEIO DO MAR', sky: 1, l: ['* (Vocês pousam num iceberg pra descansar.)', '* (Os dragões dividem um peixe do cesto.)', '4: Olha, pinguins!'] },
      { name: 'UMA ILHA DESERTA', sky: 2, l: ['* (Uma ilhazinha com uma palmeira só.)', '* (Vocês acendem uma fogueira e assam mais um peixe.)', '3: Isso aqui é melhor que férias.'] },
      { name: 'O TOPO DE UMA MONTANHA', sky: 3, l: ['* (Quase lá. Lá embaixo, a floresta onde tudo começou.)', '* (O último peixe do cesto. Todo mundo come um pedacinho.)', '4: ...Você acha que o Instrutor vai contar tudo?', '* (Você não sabe. Mas vai perguntar.)'] },
    ];
    for (const s of stops) {
      await wait(3.2);
      await Fade.to(1, 2);
      this.stop = s; this.sky = s.sky;
      F.cesto = Math.max(0, (F.cesto || 0) - 1);
      await Fade.to(0, 2);
      await c2show(s.l);
      await Fade.to(1, 2);
      this.stop = null;
      await Fade.to(0, 2);
    }
    await wait(2);
    await c2show(['* (Vocês descem pelo mesmo buraco por onde você caiu um dia.)', '* (O LABIRINTO.)']);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    C2.scene(Lab2);
  },
  update(dt) { this.t += dt; Dialog.update(dt); },
  draw() {
    const t = this.t, S = this.stop;
    const skies = [['#0a1430', '#5a8ac8'], ['#2a6ac8', '#a8d8ff'], ['#ff8a4a', '#ffd8a0'], ['#3a1a5a', '#c86a8a']];
    const [a, b] = skies[this.sky];
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (S) {
      ctx.fillStyle = this.sky === 1 ? '#2a5aa8' : this.sky === 2 ? '#3a8ac8' : '#5a4a6a'; ctx.fillRect(0, 330, W, 150);
      if (this.sky === 1) { ctx.fillStyle = '#e8f4ff'; ctx.beginPath(); ctx.moveTo(140, 340); ctx.lineTo(220, 240); ctx.lineTo(420, 250); ctx.lineTo(500, 340); ctx.fill(); }
      if (this.sky === 2) { ctx.fillStyle = '#f2d8a0'; ctx.beginPath(); ctx.ellipse(320, 345, 200, 30, 0, 0, Math.PI * 2); ctx.fill(); drawSpr(SPR.palm, 440, 230, 3); }
      if (this.sky === 3) { ctx.fillStyle = '#8a7a9a'; ctx.beginPath(); ctx.moveTo(60, 340); ctx.lineTo(320, 230); ctx.lineTo(580, 340); ctx.fill(); }
      drawFlame(320, 318, 14, t * 10);
      drawSpr(SPR.partySet.kai.right[0], 230, 270, 3); drawSpr(SPR.player.right[0], 270, 266, 3); drawSpr(SPR.partySet.luna.left[0], 370, 270, 3);
      drawSpr(SPR.dragon[G.dragon || 'lava'].right[0], 60, 250, 3);
      drawSpr(SPR.dragon[A1.dragonOf('kai')].left[0], 470, 250, 2.6); drawSpr(SPR.dragon[A1.dragonOf('luna')].left[0], 520, 280, 2.6);
      text(S.name, 320, 30, 26, '#fff', 'center');
    } else {
      // nuvens passando
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 8; i++) { const x = ((i * 173 - t * (120 + i * 20)) % 900 + 900) % 900 - 130; ctx.beginPath(); ctx.ellipse(x, 60 + (i * 97) % 380, 70, 18, 0, 0, Math.PI * 2); ctx.fill(); }
      drawRider(230, 190 + Math.sin(t * 2) * 10, 4, t);
      const kai = SPR.dragon[A1.dragonOf('kai')], luna = SPR.dragon[A1.dragonOf('luna')];
      drawSpr(kai.right[Math.floor(t * 6) % 2], 80, 110 + Math.sin(t * 2 + 1) * 10, 3);
      drawSpr(SPR.party.kai, 92, 92 + Math.sin(t * 2 + 1) * 10, 2.4);
      drawSpr(luna.right[Math.floor(t * 6 + 1) % 2], 90, 300 + Math.sin(t * 2 + 2) * 10, 3);
      drawSpr(SPR.party.luna, 102, 282 + Math.sin(t * 2 + 2) * 10, 2.4);
    }
    Dialog.draw();
  },
};

// ---------------- NO LABIRINTO: A HISTÓRIA DOS DOIS ----------------
const Lab2 = {
  enter() {
    Object.assign(this, { t: 0, panel: 'room', glow: 0 });
    Fade.a = 1; Fade.to(0, 1);
    Sfx.playMusic('instr');
    this.run();
  },
  async run() {
    await wait(1);
    await c2show([
      'I: ...Vocês?! Aqui?! Como...',
      'I: De DRAGÃO?! Três dragões?! Da ANTÁRTICA?!',
      '3: Oi, Instrutor! Esse é o Bife!',
      'I: Hahaha... vocês não existem.',
      '* (Você olha pra ele sério. Ele para de rir.)',
      '* (Você conta tudo: o Encapuzado. A sombra. O Mestre Leão.)',
      '* (E o nome. CARMINO.)',
      'I: ......',
    ]);
    Sfx.stopMusic();
    await wait(1);
    Sfx.playMusic('carmino');
    await c2show([
      'I: Então vocês descobriram.',
      'I: Carmino. Faz tanto tempo que ninguém me chama assim...',
      'I: Sim. A Carmim é minha IRMÃ.',
    ]);
    await this.goPanel('fall');
    await c2show([
      'I: Há muito, muito tempo, quando nós dois éramos crianças...',
      'I: ...a gente caiu aqui. Juntos. No mesmo buraco que você.',
      'I: Ela segurava a minha mão. Eu lembro disso até hoje.',
    ]);
    await this.goPanel('paths');
    await c2show([
      'I: Aqui embaixo, cada um escolheu um caminho.',
      'I: Eu escolhi POUPAR. Ajudar todo mundo que eu encontrava.',
      'I: E prometi pra mim mesmo: ninguém que caísse aqui ia ficar sozinho e perdido, sem saber o que fazer... como eu fiquei.',
      'I: Por isso eu fico aqui. Esperando. Ensinando.',
      'I: Mas a Carmim...',
      'I: Ela escolheu lutar. E matar. E matar de novo.',
      'I: Ela nunca, nunca poupava ninguém.',
    ]);
    await this.goPanel('demon');
    await c2show([
      'I: Quanto mais ela matava, mais vazia ficava.',
      'I: Até que um dia, alguma coisa entrou nesse vazio.',
      'I: Um DEMÔNIO.',
      'I: Desde aquele dia, ela nunca mais falou direito com ninguém. Nem comigo.',
      'I: A sombra que você viu... era ele. O que vive dentro dela.',
    ]);
    await this.goPanel('room');
    await c2show([
      '* (Você conta que a Carmim FALOU com você. Na praia.)',
      'I: ...Ela falou com você?',
      'I: Ela não fala com ninguém há anos.',
      'I: Isso só quer dizer uma coisa.',
      'I: Você é o próximo ALVO dela.',
      '4: Alvo...?',
      'I: Ela quer as ALMAS. Todas que conseguir juntar. E a sua alma tem muita DETERMINAÇÃO.',
      '3: Ninguém vai encostar nele. Nem se for demônio!',
      'I: Isso. É esse o espírito.',
      'I: Eu não vou deixar acontecer com você o que aconteceu com ela.',
      'I: Vou te treinar. Treinar DE VERDADE. Como eu nunca treinei ninguém.',
      'I: Arrumem as coisas. Vamos pra ILHA DOS DOCES.',
      'I: Aquele campo horrível... virou uma ARENA DE TREINO.',
      '3: TREINO?! BORAAA!',
      '4: ...Instrutor. Você está bem?',
      'I: Estou. Estou sim.',
      '* (Mas os olhos dele dizem outra coisa.)',
    ]);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    C2.end(1);
  },
  async goPanel(p) { await Fade.to(1, 2); this.panel = p; this.pt = 0; await Fade.to(0, 1.5); },
  update(dt) { this.t += dt; this.pt = (this.pt || 0) + dt; Dialog.update(dt); },
  draw() {
    const t = this.t, P = this.panel;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (P === 'room') {
      const T = SPR.tiles;
      for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++) ctx.drawImage(y < 4 ? T.wall : T.floor[(x * 7 + y * 3) % 3], x * 32, y * 32, 32, 32);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
      drawSpr(SPR.instr.left[0], 400, 170, 4);
      drawSpr(SPR.player.right[0], 250, 190, 4);
      drawSpr(SPR.partySet.kai.right[0], 180, 200, 4); drawSpr(SPR.partySet.luna.right[0], 120, 196, 4);
    } else if (P === 'fall') {
      for (let i = 0; i < 40; i++) { ctx.fillStyle = ['#b8322a', '#d9542b', '#e8873a'][i % 3]; ctx.fillRect((i * 97) % 640, ((i * 53) - t * 160 % 480 + 960) % 480, 8, 4); }
      ctx.save(); ctx.translate(320, 220); ctx.rotate(Math.sin(t) * 0.3);
      ctx.drawImage(SPR.instr.right[0], -60, -40, 17 * 3, 19 * 3);
      ctx.drawImage(SPR.carmim, 10, -40, 14 * 3, 21 * 3);
      ctx.fillStyle = '#e8b07a'; ctx.fillRect(-12, -6, 26, 6);
      ctx.restore();
      text('...há muito tempo.', 320, 40, 28, '#ccc', 'center');
    } else if (P === 'paths') {
      ctx.fillStyle = '#10203a'; ctx.fillRect(0, 0, 320, H); ctx.fillStyle = '#2a0810'; ctx.fillRect(320, 0, 320, H);
      drawSpr(SPR.instr.right[0], 90, 180, 4); drawSpr(SPR.fantasminha, 190, 190, 3);
      drawSpr(SPR.soul, 160, 140 + Math.sin(t * 3) * 4, 1.5);
      text('POUPAR', 160, 60, 30, '#9fe4ff', 'center');
      drawSpr(SPR.carmim, 420, 180, 4); drawSpr(SPR.faca, 470, 210, 3);
      ctx.fillStyle = '#8a8a8a'; for (let i = 0; i < 14; i++) ctx.fillRect(520 + (i * 13) % 50, 260 + (i * 7) % 20 - ((t * 20 + i * 3) % 30), 3, 3);
      text('LUTAR', 480, 60, 30, '#ff5a5a', 'center');
    } else if (P === 'demon') {
      const k = Math.min(1, (this.pt || 0) / 4);
      ctx.fillStyle = `rgba(60,0,20,${k})`; ctx.fillRect(0, 0, W, H);
      drawSpr(SPR.carmim, 270, 170, 6, 1 - k * 0.8);
      drawSpr(SPR.carmimDemon, 270, 170, 6, k);
      for (let i = 0; i < 16; i++) {
        const a = i * 0.4 + t, r = 220 * (1 - ((t * 0.3 + i / 16) % 1));
        ctx.fillStyle = 'rgba(20,0,30,0.7)'; ctx.beginPath(); ctx.arc(312 + Math.cos(a) * r, 230 + Math.sin(a) * r * 0.6, 14, 0, Math.PI * 2); ctx.fill();
      }
      if (k > 0.9) { ctx.fillStyle = '#ff1a2a'; ctx.fillRect(270 + 5 * 6, 170 + 6 * 6, 6, 6); ctx.fillRect(270 + 8 * 6, 170 + 6 * 6, 6, 6); }
    }
    Dialog.draw();
  },
};
