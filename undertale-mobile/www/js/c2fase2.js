// CAPÍTULO 2 — FASE 2: A ARENA DOS DOCES
// De volta à Ilha dos Doces. O antigo campo virou uma ARENA DE TREINO e o Macaron
// (o bigodudo) está na cadeia. O Instrutor treina o jogador três vezes. Depois,
// numa noite em volta da fogueira, ele entrega a própria ALMA ao jogador.
// No fim, o jogador liga pro Encapuzado: ele atende, mas não diz nada.
'use strict';

// ---------- lutas de treino ----------
ENEMIES.c2treino1 = {
  name: 'Instrutor', spr: 'instrR', scale: 6, hp: 999, atk: 2, def: 0, xp: 0, gold: 0, voice: 'instr',
  boss: true, nonlethal: true, cls: 'c2treino', music: 'treino2', bubbleW: 200, turnLen: 6,
  intro: '* TREINO 1: DESVIO.\n* Sobreviva a 3 ataques do Instrutor.',
  check: '* INSTRUTOR - ATK ? DEF ?\n* Ele está pegando leve.\n* Por enquanto.',
  acts: { 'Pedir uma dica': { text: ['* "Não olhe pra sua alma. Olhe pros ATAQUES."', '* "Seu coração vai sozinho pra onde precisa."'], mercy: 0 } },
  flavor: ['* O Instrutor alonga os braços.', '* Kai e Luna torcem do lado de fora da cerca.', '* "Foco!"'],
  talk: ['Desvie!', 'Mais rápido!', 'Isso! De novo!', 'Olhe os espaços!'],
  patterns: ['stars', 'walls', 'orbs'],
};
ENEMIES.c2sombra = {
  name: 'Sombra de Treino', spr: 'carmimDemon', scale: 6, hp: 160, atk: 4, def: 1, xp: 0, gold: 0, voice: 'deep',
  boss: true, nonlethal: true, cls: 'c2treino', music: 'carmim', bubbleW: 200, turnLen: 6,
  intro: '* TREINO 2: A SOMBRA.\n* Uma ilusão feita pelo Instrutor.',
  check: '* SOMBRA DE TREINO - ATK 4 DEF 1\n* Uma cópia dos golpes da Carmim.\n* Não é de verdade. Mas dói.',
  acts: {
    'Não ter medo': { text: ['* Você encara a ilusão sem tremer.', '* Ela fica mais fraca. A DEFESA dela caiu!'], mercy: 0, defDown: 1 },
    'Ouvir o Instrutor': { text: ['* "Os cortes VERMELHOS avisam antes! Saia da linha!"'], mercy: 0 },
  },
  flavor: ['* A ilusão tremula como fumaça.', '* Os olhos dela brilham vermelhos.', '* "É só uma ilusão. Mas lute como se fosse de verdade!"'],
  talk: ['...', 'Alma...', 'Sua alma...', 'Me dá.'],
  defeatText: ['* A Sombra de Treino se desfaz em fumaça.'],
  patterns: ['redSlash', 'knives', 'hearts', 'redSlash'],
};
ENEMIES.c2mestre = {
  name: 'Instrutor', spr: 'instrR', scale: 6, hp: 260, atk: 5, def: 2, xp: 0, gold: 0, voice: 'instr',
  boss: true, nonlethal: true, cls: 'c2treino', music: 'treino2', bubbleW: 210, turnLen: 6.5,
  intro: '* TREINO 3: O INSTRUTOR DE VERDADE.\n* Ele não vai pegar leve.',
  check: '* INSTRUTOR - ATK 5 DEF 2\n* Ensinou centenas de humanos perdidos.\n* Você é o último.',
  acts: {
    'Mostrar o que aprendeu': { text: ['* Você desvia, ataca e se defende do jeito que ele ensinou.', '* Ele sorri, orgulhoso.'], mercy: 34 },
    'Agradecer': { text: ['* Você agradece por tudo.', '* "Não agradeça ainda. LUTE!"'], mercy: 33 },
    'Prometer': { text: ['* Você promete que vai voltar vivo.', '* Os olhos dele se enchem de lágrimas.'], mercy: 33 },
  },
  flavor: ['* O Instrutor está sério como você nunca viu.', '* Cada golpe dele é uma lição.', '* Você sente que ele está se despedindo.'],
  talk: ['Mostra o que aprendeu!', 'De pé!', 'A Carmim não vai ter pena!', 'Isso... isso!', 'Eu tenho orgulho de você.'],
  spareTalk: 'Chega. Você está pronto.',
  defeatText: ['* O Instrutor cai sentado, rindo e ofegante.', '* "Você... está pronto."'],
  patterns: ['stars', 'fireRing', 'skulls', 'orbs', 'walls'],
  finale: ['fireRing', 'skulls', 'walls'],
};

class C2TrainBattle extends Battle {
  constructor(key, opts) {
    super(key, { ...opts, solo: opts.goal !== 'sombra' });
    this.enemyTurns = 0;
  }
  startEnemyTurn(p) { super.startEnemyTurn(p); this.enemyTurns++; }
  toMenu() {
    if (this.opts.goal === 'dodge' && this.enemyTurns >= 3 && !this.ended) {
      this.boxTarget = { ...BOX_FULL };
      if (this.passed) return;
      this.passed = true;
      Sfx.levelUp();
      return this.say(['* VOCÊ SOBREVIVEU AOS 3 ATAQUES!', '* "Muito bem! Seu coração já sabe o caminho."'], () => this.end('spared'));
    }
    super.toMenu();
  }
  // Treino não mata: no máximo deixa com 1 de HP
  hurt(dmg, who) {
    dmg = Math.max(1, dmg - playerDef());
    G.hp = Math.max(1, G.hp - dmg);
    this.soul.inv = 1.2; Sfx.hurt(); this.hurtFlash = 0.15;
  }
}
BATTLE_CLASSES.c2treino = C2TrainBattle;

const WALK_D2 = 'fcgb';

MAPS.doces2 = {
  music: 'doce',
  start: { x: tx2x(27), y: ty2y(35), dir: 'up' },
  anim: 'X',

  build() {
    const MW = 56, MH = 40, g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    rect(2, 2, 52, 32, 'f');
    rect(0, 34, 56, 6, 'X');
    rect(26, 30, 4, 8, 'b');
    rect(26, 24, 4, 6, 'c'); rect(6, 25, 44, 2, 'c');
    rect(8, 10, 2, 15, 'c'); rect(47, 11, 2, 14, 'c');
    // arena (o antigo campo)
    rect(22, 7, 19, 17, 'F'); rect(23, 8, 17, 15, 'g');
    rect(30, 23, 2, 1, 'c');
    // casas de wafer
    const house = (x, y) => { rect(x, y, 7, 2, 'R'); rect(x, y + 2, 7, 3, 'H'); g[y + 3][x + 1] = 'w'; g[y + 3][x + 5] = 'w'; g[y + 4][x + 3] = 'D'; };
    house(5, 4); house(13, 4); house(5, 15); house(13, 15);
    // cadeia do Macaron
    rect(44, 4, 9, 7, 'B'); rect(45, 5, 7, 4, 'E');
    for (let x = 45; x < 52; x++) g[10][x] = 'J';
    for (const [x, y] of [[3, 3], [20, 3], [42, 14], [52, 20], [3, 30], [16, 30], [40, 30], [51, 30], [20, 18]]) g[y][x] = 'L';
    return { g };
  },

  solid(c) { return !WALK_D2.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.islT, h = (x * 73 + y * 151) % 3;
    const m = { f: T.frost[h], c: T.cookie[h], g: T.dirt[h], b: T.boards[h], E: T.carpet[h], H: T.wafer, R: T.icing, w: T.waferWin, D: T.waferDoor, F: T.fence, B: T.concrete, J: T.gate, X: T.sea[0] };
    if (c === 'L') return MAPS.dragoncity.layer(T.frost[h], T.lolli);
    if (c === '#') return W.tile(x, y + 1) === 'f' ? T.void : T.void;
    return m[c] || T.void;
  },
  animImg(c, x, y, fr) { return SPR.islT.sea[(fr + x + y) % 3]; },

  ents(W) {
    const F = G.flags;
    const npc = (id, spr, tx, ty, talk, bob) => ({ id, x: tx2x(tx), y: ty2y(ty), w: 14, h: 8, solid: true, talk,
      draw(sx, sy, t) { const img = typeof spr === 'function' ? spr() : spr; drawSpr(img, sx(this.x - img.width / 2), sy(this.y - img.height + 1) + (bob ? Math.round(Math.abs(Math.sin(t * 5 + this.x)) * -3) : 0), 2, this.alpha ?? 1); } });
    return [
      { id: 'star', x: tx2x(33), y: ty2y(28), w: 12, h: 8, spr: 'star', solid: true, talk: () => D2.useStar() },
      { id: 'placa', x: tx2x(34) + 8, y: ty2y(24), w: 14, h: 6, spr: 'sign', solid: true,
        talk: () => c2say(['* (ARENA DE TREINO DA ILHA DOS DOCES)', '* (Embaixo, em letra de criança: "Aqui era o campo. Nunca mais ninguém vai ficar preso aqui.")']) },
      { id: 'boneco1', x: tx2x(25), y: ty2y(10), w: 14, h: 8, spr: 'dummy', solid: true, talk: () => c2say(['* (Um boneco de treino. Tem marcas de taco por todo lado.)', '3: Fui eu! Fui eu!']) },
      { id: 'boneco2', x: tx2x(38), y: ty2y(10), w: 14, h: 8, spr: 'dummy', solid: true, talk: () => c2say(['* (Um boneco de treino com um bigode desenhado.)', '* (Parece alguém que você conhece.)']) },
      npc('marsh', () => SPR.marsh, 10, 22, () => D2.talk('marsh')),
      npc('choco', () => SPR.choco, 12, 23, () => D2.talk('choco')),
      npc('piru', () => SPR.pirulito, 24, 21, () => D2.talk('piru')),
      npc('g1', () => SPR.gummy.g1, 20, 12, () => D2.talk('g'), true),
      npc('g2', () => SPR.gummy.g2, 20, 16, () => D2.talk('g'), true),
      npc('g3', () => SPR.gummy.g3, 42, 18, () => D2.talk('g'), true),
      npc('g4', () => SPR.gummy.g4, 42, 10, () => D2.talk('g'), true),
      { id: 'macaron', x: tx2x(48), y: ty2y(8), w: 20, h: 8, solid: true,
        draw(sx, sy, t) { drawSpr(SPR.macaron, sx(this.x - 14), sy(this.y - 18) + Math.round(Math.sin(t * 1.5) * 1), 2); } },
    ];
  },

  triggers() { return []; },

  setup(W) {
    const I = W.instr, F = G.flags;
    I.visible = !F.c2soul; I.follow = false; I.x = tx2x(31) + 8; I.y = ty2y(14); I.dir = 'left'; I.alpha = 1;
  },
  onEnter(W) { if (!G.flags.d2arrived) D2.arrive(); },
  musicAt(W) { const p = W.player; return (p.x > 22 * TS && p.x < 41 * TS && p.y < 24 * TS) ? 'treino2' : 'doce'; },
  update(W) {
    if (W.locked || Game.scene !== 'world' || G.flags.c2soul) return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
  },
  overlay(W, sx, sy) {
    const fx = D2.fx;
    if (G.flags.d2night && !G.flags.c2done) { ctx.fillStyle = 'rgba(10,10,40,0.45)'; ctx.fillRect(0, 0, 640, 480); }
    if (D2.fire) drawFlame(sx(tx2x(31) + 8), sy(ty2y(16)), 18, W.t * 10);
    if (fx) {
      fx.t += 1 / 60;
      const k = Math.min(1, fx.t / 2.4), I = W.instr, p = W.player;
      const x = I.x + (p.x - I.x) * k, y = I.y - 30 + (p.y - 30 - (I.y - 30)) * k - Math.sin(k * Math.PI) * 30;
      ctx.fillStyle = `rgba(150,240,255,${0.35 + Math.sin(fx.t * 8) * 0.15})`; ctx.beginPath(); ctx.arc(sx(x), sy(y), 22, 0, Math.PI * 2); ctx.fill();
      drawSpr(SPR.soul, sx(x) - 16, sy(y) - 14, 2);
      if (k >= 1) { ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - (fx.t - 2.4))})`; ctx.fillRect(0, 0, 640, 480); }
    }
  },

  interactTile(W, c, tx, ty) {
    if (c === 'J') return D2.macaron();
    if (c === 'D') return c2say(['* (Uma porta de wafer. Lá dentro, alguém está assando bolo. O cheiro é incrível.)']);
    if (c === 'F') return c2say(['* (A cerca velha do campo. Agora tem fitas coloridas amarradas nela.)']);
  },
  talkInstr() { D2.talkInstr(); },
};

QUESTS.doces2 = function (W) {
  const F = G.flags, n = F.d2train || 0;
  if (!F.d2arrived) return null;
  if (n < 3) return { t: `Fale com o INSTRUTOR no centro da arena. TREINO ${n + 1} de 3.`, x: 31, y: 14 };
  if (!F.c2soul) return { t: 'Fale com o INSTRUTOR. Ele quer conversar.', x: 31, y: 14 };
  return { t: 'Ligue para o ENCAPUZADO (???) pelo CELULAR (botão B → CELULAR).' };
};

const D2 = {
  fx: null, fire: false,
  ent(id) { return World.ents.find(e => e.id === id); },

  async arrive() {
    const W = World, F = G.flags, p = W.player;
    W.locked = true; F.d2arrived = true;
    p.x = tx2x(27) + 8; p.y = ty2y(33); p.dir = 'up'; W.trail = []; W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('doce'); Fade.to(0, 0.6);
    await wait(0.4);
    const m = this.ent('marsh'), c = this.ent('choco');
    await W.walk(m, [[tx2x(27), ty2y(28)], [tx2x(27), ty2y(31)]], 70);
    await W.walk(c, [[tx2x(29), ty2y(28)], [tx2x(29), ty2y(31)]], 70);
    await c2say([
      '* (Três dragões pousam no píer. A ilha inteira vem correndo ver.)',
      { who: 'marsh', t: '* VOCÊS VOLTARAM!!! Eu SABIA que vocês iam voltar!' },
      { who: 'choco', t: '* E trouxeram MAIS dragões. Claro que trouxeram.' },
      'I: Lembra desse lugar?',
      '* (Você lembra. A cerca. O portão. O medo.)',
      'I: Olha agora.',
      '* (O campo virou uma ARENA. Tem bandeirinhas, bonecos de treino e docinhos torcendo na cerca.)',
      { who: 'marsh', t: '* E o Macaron, aquele bigodudo, tá na cadeia! Lá do lado leste. Pode ir dar um oi. Hihi.' },
      'I: Descansem um pouco. Quando estiver pronto, me encontre no centro da arena.',
      'I: Vão ser três treinos. E eu não vou pegar leve.',
    ]);
    await W.walk(m, [[tx2x(10), ty2y(22)]], 70);
    await W.walk(c, [[tx2x(12), ty2y(23)]], 70);
    W.saveHere(0);
    W.locked = false;
  },

  async talk(k) {
    const F = G.flags, n = F.d2train || 0;
    if (F.c2soul) {
      const L = { marsh: [{ who: 'marsh', t: '* ...Ele era o melhor de todos.' }, { who: 'marsh', t: '* Toma. Pão de mel. Pra viagem.' }], choco: [{ who: 'choco', t: '* Vai lá e ganha. Por ele.' }], piru: [{ who: 'piru', t: '* A arena vai ter o nome dele. ARENA CARMINO.' }], g: ['* (O docinho te dá um abraço apertado e não fala nada.)'] }[k];
      if (k === 'marsh' && !F.d2bread && G.items.length < 8) { F.d2bread = true; G.items.push('Pão de Mel'); }
      return c2say(L);
    }
    const L = {
      marsh: [{ who: 'marsh', t: n ? '* Você tá ficando FORTE! Dá pra ver daqui!' : '* A ilha mudou muito depois que vocês foram embora.' }, { who: 'marsh', t: '* Agora todo mundo é livre. Todo mundo tem nome.' }],
      choco: [{ who: 'choco', t: '* O Kai já quebrou três bonecos de treino. Três.' }, '3: Eram bonecos fracos!'],
      piru: [{ who: 'piru', t: '* Eu era guarda aqui. Agora sou JUIZ da arena.' }, { who: 'piru', t: '* Muito melhor. Ninguém chora. Bom... só quem perde.' }],
      g: ['* (O docinho pula de animação.)', '* "VAI! VAI! VAI!"'],
    }[k];
    return c2say(L);
  },

  async macaron() {
    const F = G.flags;
    if (!F.d2mac) {
      F.d2mac = true;
      return c2say([
        { who: 'macaron', t: '* ...Ora, ora. O Nº4812. Veio rir de mim?' },
        '* (Você diz o seu NOME. Seu nome de verdade.)',
        { who: 'macaron', t: '* ...Hmpf.' },
        { who: 'macaron', t: '* Sabe o que é pior aqui dentro? Não é a grade.' },
        { who: 'macaron', t: '* É que eles me trazem bolo. Todo dia. Mesmo depois de tudo que eu fiz.' },
        { who: 'macaron', t: '* ...Eu não entendo esse povo.' },
        '4: Isso se chama perdão.',
        { who: 'macaron', t: '* ...Hmpf. Vai treinar, vai.' },
      ]);
    }
    return c2say([{ who: 'macaron', t: F.c2soul ? '* ...Eu vi a luz daqui. Sinto muito pelo velho. De verdade.' : '* O bolo de hoje era de morango. Não conta pra ninguém que eu gostei.' }]);
  },

  async talkInstr() {
    const W = World, F = G.flags, n = F.d2train || 0, I = W.instr;
    if (F.c2soul) return;
    W.locked = true;
    if (n === 0) {
      await c2say(['I: Pronto pro primeiro treino?', 'I: TREINO 1: DESVIO. Eu vou atacar. Você só precisa sobreviver a 3 ataques.', 'I: Ninguém cai de verdade no treino. Pode ir sem medo.']);
      return this.train('c2treino1', 'dodge');
    }
    if (n === 1) {
      await c2say([
        'I: TREINO 2: A SOMBRA.',
        'I: Eu vou criar uma ilusão com os golpes da Carmim. Do jeitinho que eu lembro.',
        'I: Desta vez, Kai e Luna lutam com você. Ninguém luta sozinho.',
        '3: FINALMENTE!',
      ]);
      return this.train('c2sombra', 'sombra');
    }
    if (n === 2) {
      await c2say([
        'I: TREINO 3. O último.',
        'I: Agora sou eu. De verdade. Sem pegar leve.',
        'I: Me mostre tudo o que você aprendeu desde que caiu aqui.',
      ]);
      return this.train('c2mestre', 'mestre');
    }
    return this.farewell();
  },

  train(key, goal) {
    const W = World, F = G.flags;
    G.hp = G.maxhp;
    W.battle(key, { goal, dragon: G.dragon }, async res => {
      W.locked = true;
      G.hp = G.maxhp;
      F.d2train = (F.d2train || 0) + 1;
      if (goal === 'dodge') { G.maxhp += 8; G.hp = G.maxhp; await c2say(['I: Ótimo! Seu coração já desvia sozinho.', '* Seu HP MÁXIMO aumentou! (+8)']); }
      if (goal === 'sombra') { G.atkBonus = (G.atkBonus || 0) + 3; await c2say(['I: Juntos vocês são muito mais fortes. Nunca esqueçam disso.', '3: A gente MANDOU MUITO!', '* Seu ATAQUE aumentou! (+3)']); }
      if (goal === 'mestre') {
        G.maxhp += 8; G.hp = G.maxhp; G.atkBonus = (G.atkBonus || 0) + 2;
        await c2say(['I: ...Haha. Haha... Você me venceu.', 'I: Agora você está pronto.', '* Seu HP MÁXIMO e seu ATAQUE aumentaram!', 'I: Hoje à noite... vamos fazer uma fogueira aqui na arena. Eu preciso conversar com vocês.']);
        F.d2night = true;
      }
      W.saveHere(0);
      W.locked = false;
    });
  },

  async farewell() {
    const W = World, F = G.flags, I = W.instr, p = W.player;
    await Fade.to(1, 1.5);
    Sfx.stopMusic();
    p.x = tx2x(29); p.y = ty2y(17); p.dir = 'right'; W.trail = [];
    I.x = tx2x(33); I.y = ty2y(16); I.dir = 'left';
    this.fire = true;
    W.updateCam(true);
    await Fade.to(0, 1.5);
    Sfx.playMusic('carmino');
    await c2say([
      '* (A noite cai na Ilha dos Doces. Vocês sentam em volta da fogueira.)',
      'I: Sabe... eu sou bem mais velho do que pareço.',
      'I: Faz muito, muito tempo que eu espero aqui embaixo. Ensinando cada humano que cai.',
      'I: Minha alma está cansada.',
      '4: Instrutor... não fala assim.',
      'I: A Carmim vai vir atrás de você. E ela vai vir com tudo.',
      'I: Treino nenhum vai ser suficiente contra o que vive dentro dela.',
      'I: Mas tem uma coisa que eu posso fazer.',
      'I: Uma coisa que a alma dela não tem mais, e a minha ainda tem.',
      'I: ESPERANÇA.',
      '3: O que você vai fazer?',
      'I: Eu vou te dar a minha alma.',
      '3: ...QUÊ?! NÃO!',
      'I: Ela vai estar com você o tempo todo. Toda vez que você cair... eu vou estar lá pra te levantar.',
      'I: Esse sempre foi o meu trabalho, não foi?',
      '4: Não... por favor...',
      'I: Ei. Não chora.',
      'I: Vocês precisam salvar o mundo da Carmim. Salvar ela também, se der.',
      'I: E se não der...',
      'I: ...façam o que for preciso.',
    ]);
    Sfx.magic();
    this.fx = { t: 0 };
    for (let i = 0; i < 90; i++) { I.alpha = 1 - i / 90; await nextFrame(); }
    I.visible = false;
    await wait(1.6);
    this.fx = null;
    Sfx.heal();
    F.c2soul = true;
    G.maxhp += 10; G.hp = G.maxhp;
    await c2say([
      '* (Uma luz azul entra no seu peito.)',
      '* (É quente. Tem cheiro de chá e de livro velho.)',
      '* (O Instrutor sumiu. Mas você sente ele. Aqui dentro.)',
      '* A ALMA DO CARMINO ESTÁ COM VOCÊ.',
      '* Seu HP MÁXIMO aumentou muito! (+10)',
      '3: ...',
      '4: ...',
      '* (Ninguém fala nada por um bom tempo.)',
    ]);
    this.fire = false;
    await c2say([
      '3: ...Aquele encapuzado. Ele te deu um celular, lembra?',
      '4: O número dele deve estar aí.',
      '3: Liga pra ele. Pergunta onde ela está.',
    ]);
    W.saveHere(0);
    W.locked = false;
  },

  async call(o) {
    const W = World, F = G.flags;
    if (o !== '???' || !F.c2soul || F.d2called) return false;
    W.locked = true;
    Sfx.ring(); await wait(0.8); Sfx.ring(); await wait(0.8);
    await c2say([
      '* (Chamando...)',
      '* (Alguém atende.)',
      '* (...)',
      '* (Silêncio. Só uma respiração do outro lado.)',
      '* (Você chama. Ele não responde.)',
      '* (Lá no fundo, bem baixinho... uma menina cantarolando.)',
      '* (Desligou.)',
    ]);
    F.d2called = true;
    await c2say([
      '4: Ele... ele está com ELA.',
      '3: Então a gente vai até eles.',
      '* (Você aperta o celular na mão. Seu peito brilha azul.)',
      '* (Você está cheio de DETERMINAÇÃO.)',
    ]);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    C2.end(2);
    return true;
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere(0);
    await c2say(['* (O cheiro de doce e os gritos de torcida te enchem de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
