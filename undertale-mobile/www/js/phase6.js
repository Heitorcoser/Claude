// FASE 6 — A CAVERNA DAS ARANHAS E ESQUELETOS
// Os irmãos fantasmas começam uma guerra só para atingir o jogador.
// O confronto final depende da rota (pacifista, neutra ou genocida).
'use strict';

const WALK6 = 'rwobh';

function critter(id, key, frames, tx, ty, talk, opts = {}) {
  return { id, x: tx2x(tx), y: ty2y(ty), w: opts.w || 18, h: 8, solid: opts.solid ?? true, talk, hidden: !!opts.hidden, scale: opts.scale || 2,
    draw(sx, sy, t) {
      const set = SPR[key][frames], img = Array.isArray(set) ? set[Math.floor(t * 3 + this.x) % 2] : set, s = this.scale;
      drawSpr(img, sx(this.x - img.width * s / 4), sy(this.y - img.height * s / 2) + Math.round(Math.sin(t * 2 + this.x) * (opts.bob ?? 1)), s, this.alpha ?? 1);
    } };
}

MAPS.caverna = {
  music: 'caverna',
  start: { x: tx2x(5), y: ty2y(29), dir: 'right' },
  anim: '',

  build() {
    const MW = 120, MH = 62, F = G.flags;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    rect(2, 26, 14, 8, 'r'); rect(16, 28, 10, 4, 'r');
    // Vila das Teias
    rect(26, 14, 30, 24, 'r'); rect(30, 16, 8, 6, 'w'); rect(44, 28, 8, 6, 'w'); rect(27, 30, 5, 4, 'w');
    // abismo e ponte
    rect(56, 14, 12, 24, 'v'); rect(56, 24, 12, 3, 'b');
    // Cidade dos Ossos
    rect(68, 14, 30, 24, 'o');
    // Toca dos fantasmas
    rect(98, 22, 18, 10, 'r');
    for (const [x, y] of [[102, 23], [110, 23], [114, 28], [101, 30], [108, 30]]) g[y][x] = 'c';
    // Grande Salão de Cristal
    rect(42, 38, 3, 4, 'r'); rect(75, 38, 3, 4, 'r');
    rect(40, 42, 40, 12, 'r');
    for (const [x, y] of [[44, 44], [50, 51], [62, 44], [70, 50], [77, 45], [56, 47]]) g[y][x] = 'c';
    // caminho para o fundo
    rect(58, 54, 4, 5, 'r');
    if (!F.p6after) for (let x = 58; x < 62; x++) g[54][x] = 'W';
    g[58][59] = 'H'; g[58][60] = 'H';
    for (const [x, y] of [[28, 15], [53, 16], [54, 35], [26, 36], [70, 15], [95, 15], [96, 36], [69, 36], [41, 52], [79, 43]]) g[y][x] = 'm';
    return { g };
  },

  solid(c) { return !WALK6.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.deepT, h = (x * 73 + y * 151) % 3;
    if (c === 'r') return T.rock[h];
    if (c === 'w') return T.web[h];
    if (c === 'o') return T.bone[h];
    if (c === 'b') return T.bridge;
    if (c === 'v') return T.abyss;
    if (c === 'c') return T.crystal;
    if (c === 'm') return T.mush;
    if (c === 'W') return T.webWall;
    if (c === 'H') return T.hole;
    if (c === '#') { const b = W.tile(x, y + 1); return WALK6.includes(b) || 'WH'.includes(b) ? T.wall : T.void; }
    return T.void;
  },

  ents(W) {
    const F = G.flags, war = !!F.p6war;
    const list = [
      { id: 'star1', x: tx2x(9), y: ty2y(27), w: 12, h: 8, spr: 'star', solid: true, talk: () => P6.useStar() },
      { id: 'star2', x: tx2x(60), y: ty2y(48), w: 12, h: 8, spr: 'star', solid: true, talk: () => P6.useStar() },
      { id: 'star3', x: tx2x(94), y: ty2y(34), w: 12, h: 8, spr: 'star', solid: true, talk: () => P6.useStar() },
      { id: 'signV', x: tx2x(25), y: ty2y(29), w: 14, h: 6, spr: 'sign', solid: true, talk: () => W.say(['* (VILA DAS TEIAS →)', "* 'Entre devagar. Os bebês dormem de dia.'"]) },
      { id: 'signO', x: tx2x(69), y: ty2y(23), w: 14, h: 6, spr: 'sign', solid: true, talk: () => W.say(['* (CIDADE DOS OSSOS)', "* 'Aranhas e esqueletos: vizinhos há 100 anos.'", war ? '* (Alguém riscou "vizinhos" e escreveu "INIMIGOS".)' : '* (Tem um desenho de uma aranha e um esqueleto de mãos dadas.)']) },
      { id: 'tent1', x: tx2x(30), y: ty2y(19), w: 26, h: 8, spr: 'tent', solid: true, talk: () => W.say([war ? '* (A tenda está rasgada. Ninguém dentro.)' : '* (Uma casa de seda. Dá pra ouvir bebês aranha roncando.)']) },
      { id: 'tent2', x: tx2x(47), y: ty2y(19), w: 26, h: 8, spr: 'tent', solid: true, talk: () => W.say(['* (Uma casa de seda, toda enfeitada com cristais.)']) },
      { id: 'tent3', x: tx2x(51), y: ty2y(34), w: 26, h: 8, spr: 'tent', solid: true, talk: () => W.say(['* (Uma casa de seda. Tem um tapete escrito "LAR".)']) },
      { id: 'hut1', x: tx2x(73), y: ty2y(17), w: 26, h: 8, spr: 'boneHut', solid: true, talk: () => W.say(['* (Uma casinha de ossos. Na porta: "FAMÍLIA FÊMUR".)']) },
      { id: 'hut2', x: tx2x(89), y: ty2y(17), w: 26, h: 8, spr: 'boneHut', solid: true, talk: () => W.say(['* (Uma casa de ossos. Tem cheiro de sopa de cálcio.)']) },
      { id: 'hut3', x: tx2x(91), y: ty2y(33), w: 26, h: 8, spr: 'boneHut', solid: true, talk: () => W.say([war ? '* (O telhado desabou. A família saiu correndo.)' : '* (Uma casa de ossos com flores de cristal na janela.)']) },
      critter('tecela', 'aranha', 'mae', 36, 22, () => P6.talkTecela()),
      critter('fio', 'aranha', 'bebe', 33, 24, () => W.say(['W: Eu sou o FIO! Meu irmão é o NOVELO. A gente brinca de pega-pega na teia!']), { scale: 1, w: 12 }),
      critter('novelo', 'aranha', 'bebe', 39, 24, () => W.say(['W: Eu sou o NOVELO! Você tem quantas pernas? Só DUAS?! Hahaha!']), { scale: 1, w: 12, hidden: war }),
      critter('av1', 'aranha', 'vila', 48, 30, () => P6.villager(1)),
      critter('av2', 'aranha', 'vila', 40, 33, () => P6.villager(2)),
      critter('osso', 'esqueleto', 'mestre', 82, 21, () => P6.talkOsso(), { w: 14 }),
      critter('femur', 'esqueleto', 'civil', 78, 27, () => P6.talkFemur(), { w: 12, scale: 1.4 }),
      critter('ec1', 'esqueleto', 'civil', 90, 28, () => P6.villager(3), { w: 14 }),
      critter('ec2', 'esqueleto', 'civil', 72, 32, () => P6.villager(4), { w: 14 }),
      { id: 'guardE', x: tx2x(97), y: ty2y(26), w: 14, h: 30, solid: true, hidden: war, spr: 'esqSold',
        talk: () => W.say(['* GUARDA: Daqui pra frente é a TOCA ESCURA.', '* GUARDA: Ninguém entra lá. Dizem que fantasmas moram no fundo.']) },
      ghostEnt('fire', 60, 46), ghostEnt('ice', 62, 46),
      sprNpc('vMac', 'macaron', 54, 45, () => {}, { hidden: true, scale: 1.5, w: 20 }),
      sprNpc('vPiru', 'pirulito', 67, 45, () => {}, { hidden: true }),
    ];
    return list;
  },

  triggers(W) {
    const F = G.flags;
    return [
      { x: 26, y: 14, w: 4, h: 24, when: () => !F.p6metB, run: () => P6.enterVillage() },
      { x: 68, y: 14, w: 3, h: 24, when: () => !F.p6metC, run: () => P6.enterBones() },
      { x: 40, y: 42, w: 40, h: 12, when: () => F.p6metB && F.p6metC && !F.p6war, run: () => P6.ghostsScene() },
      { x: 100, y: 22, w: 3, h: 10, when: () => F.p6war && !F.p6confront, run: () => P6.confront() },
    ];
  },

  setup(W) {},
  onEnter(W) { if (!G.flags.p6arrived) P6.arrive(); },

  musicAt(W) {
    const F = G.flags, [x, y] = W.feetTile();
    if (F.p6war && !F.p6after) return x >= 98 ? 'irmaos' : 'guerra';
    if (F.p6after) return 'tristeza';
    if (x >= 26 && x < 56 && y < 38) return 'aranhas';
    if (x >= 68 && y < 38) return 'ossos';
    return 'caverna';
  },

  update(W, dt) {
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
  },

  overlay(W, sx, sy) {
    const F = G.flags, t = W.t;
    // brilho dos cristais
    ctx.fillStyle = `rgba(127,232,255,${0.04 + Math.sin(t * 2) * 0.02})`; ctx.fillRect(0, 0, 640, 480);
    if (F.p6war) {
      for (const [x, y] of [[30, 19], [47, 19], [51, 34], [73, 17], [91, 33], [62, 25], [36, 30], [84, 28]]) {
        const fx = sx(tx2x(x)), fy = sy(ty2y(y));
        if (fx < -40 || fx > 680 || fy < -40 || fy > 520) continue;
        drawFlame(fx - 10, fy, 18, t * 9 + x); drawFlame(fx + 8, fy + 4, 14, t * 11 + y);
      }
      ctx.fillStyle = 'rgba(60,20,20,0.18)'; ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = 'rgba(80,80,90,0.35)';
      for (let i = 0; i < 18; i++) { const x = (i * 83 + t * 20) % 700 - 30, y = (i * 47 - t * 30) % 500; ctx.beginPath(); ctx.arc(x, (y + 500) % 500, 14 + (i % 4) * 4, 0, Math.PI * 2); ctx.fill(); }
    }
    if (P6.ritual) {
      const k = P6.ritual.t;
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.8, k * 0.3)})`; ctx.fillRect(0, 0, 640, 480);
    }
  },

  interactTile(W, c, tx, ty) {
    if (c === 'v') return W.say(['* (Um abismo sem fundo. Uma pedrinha cai... e você nunca ouve o barulho.)']);
    if (c === 'c') return W.say(['* (Um cristal enorme. Ele brilha mais forte quando você chega perto.)']);
    if (c === 'm') return W.say(['* (Um cogumelo rosa gigante. Melhor não comer.)']);
    if (c === 'W') return W.say(['* (Uma parede grossa de teia. Só as aranhas conseguem abrir.)']);
    if (c === 'H') return P6.descend();
  },

  encounter: {
    tile: 'r', counter: 'enc6', max: 6, first: 120, min: 240, rand: 200,
    enabled: () => G.flags.p6war && !G.flags.p6confront,
    pick: n => n % 2 ? 'esqSold' : 'aranhaSold',
    opts: () => ({ dragon: G.dragon }),
    doneText: '* (Por enquanto, ninguém mais te ataca. Mas a guerra continua lá longe.)',
  },

  talkInstr(W) {},
};

// ---------------- CUTSCENE: despedida ----------------
const Cine6 = {
  t: 0, panel: 0,
  async run() {
    Game.cine = this;
    const map = { T: 'trein', B: 'bit', M: 'marsh', L: 'lia', H: 'choco' };
    const say = items => Dialog.show(items.map(t => {
      const m = /^([TBMLH]):\s*(.*)$/s.exec(t);
      return m ? { who: map[m[1]], t: '* ' + m[2] } : { t };
    }), false);
    Object.assign(this, { t: 0, panel: 0 });
    Fade.a = 1; Fade.to(0, 0.8);
    Sfx.playMusic('memoria');
    await wait(0.6);
    await say([
      '* (No cais da Ilha dos Doces, todos vieram se despedir.)',
      'T: Então você vai continuar descendo... Eu sabia que um dia você ia seguir sozinho.',
      'B: Me liga! Toda semana! Todo dia! BIP!',
      'M: A ilha nunca vai esquecer o que você fez. Nunca mais.',
      'H: Eu vou contar a sua história pra todo mundo.',
      'L: Tchau! Lembra: meu nome é LIA!',
      'T: Vá, pequeno. E lembre: você não precisa carregar o mundo sozinho.',
    ]);
    this.panel = 1;
    await say(['* (Você se despede de todos e desce por uma escadaria escondida na rocha...)', '* (...cada vez mais fundo.)', '* (Seu dragão vai junto, escondido nas sombras.)']);
    await Fade.to(1, 1.2);
    Game.enterMap('caverna');
  },
  update(dt) { this.t += dt; Dialog.update(dt); },
  draw() {
    if (this.panel === 0) {
      const sky = ctx.createLinearGradient(0, 0, 0, 300);
      sky.addColorStop(0, '#f8a8c8'); sky.addColorStop(1, '#ffd8a8');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#8a4a2a'; ctx.fillRect(0, 260, W, 220);
      ctx.fillStyle = '#d8a060'; ctx.fillRect(0, 230, W, 40);
      drawSpr(SPR.instr.right[0], 120, 140, 3);
      drawSpr(SPR.robot.bit.right[Math.floor(this.t * 3) % 2], 210, 172, 3);
      drawSpr(SPR.marsh, 290, 168, 3);
      drawSpr(SPR.choco, 360, 178, 3);
      drawSpr(SPR.lia, 430, 174, 3);
      drawSpr(SPR.player.left[0], 540, 170, 3);
    } else {
      ctx.fillStyle = '#0c0a10'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 12; i++) { ctx.fillStyle = '#2a2430'; ctx.fillRect(200 + i * 20, 40 + i * 30, 80, 12); }
      drawSpr(SPR.player.down[Math.floor(this.t * 6) % 4], 300 + Math.sin(this.t) * 20, 120 + (this.t * 20) % 200, 3);
    }
    Dialog.draw();
  },
};

// ---------------- Roteiros da Fase 6 ----------------
const P6 = {
  ritual: null,
  ent(id) { return World.ents.find(e => e.id === id); },
  async note(lines) { const W = World; W.locked = true; await W.say(lines); W.locked = false; },

  async arrive() {
    const W = World, F = G.flags;
    W.locked = true;
    F.p6arrived = true;
    W.player.x = tx2x(5); W.player.y = ty2y(29);
    W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('caverna'); Fade.to(0, 0.8);
    await wait(0.8);
    await W.say(['* (Uma caverna enorme. Teias brilhantes e cristais azuis iluminam tudo.)', '* (Dá pra ouvir passinhos... MUITOS passinhos.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async enterVillage() {
    G.flags.p6metB = true;
    await this.note(['* (VILA DAS TEIAS. Casas de seda penduradas por todo lado.)', '* (Aranhas de todos os tamanhos te olham curiosas.)']);
  },
  async enterBones() {
    G.flags.p6metC = true;
    await this.note(['* (CIDADE DOS OSSOS. Esqueletos varrem a rua, conversam e riem.)', '* (Do outro lado da ponte, a Vila das Teias. Vizinhos.)']);
  },

  talkTecela() {
    const W = World, F = G.flags;
    if (F.p6after) return W.say(['E: Os fantasmas foram embora... mas a guerra continua.', 'E: Dizem que no FUNDO do abismo existe uma cidade linda. Sem guerra.', 'E: Abrimos a teia do caminho no Grande Salão. Vá... e leve a gente junto, se puder.']);
    if (F.p6war) return W.say(['E: NOVELO! Alguém viu o meu Novelo?!', 'E: Ele estava aqui... e na confusão ele SUMIU.', 'E: Por favor... acaba com essa guerra.']);
    return W.say(['E: Um humano? Que raro! Bem-vindo à VILA DAS TEIAS.', 'E: Eu sou a TECELÃ. Aqueles dois pestinhas são meus filhos, Fio e Novelo.', 'E: Aqui a gente tece casas, roupas e redes de dormir. E vive em paz com os esqueletos.']);
  },
  talkOsso() {
    const W = World, F = G.flags;
    if (F.p6after) return W.say(['J: Metade da cidade está sem casa.', 'J: Se você encontrar esse lugar sem guerra lá no fundo... leve nosso povo também.']);
    if (F.p6war) return W.say(['J: Meus esqueletos estão lutando contra as aranhas... nossos VIZINHOS.', 'J: Eu tento lembrar por que começou. Ninguém sabe dizer.']);
    return W.say(['J: Nyeh! Um visitante! Bem-vindo à CIDADE DOS OSSOS.', 'J: Eu sou o MESTRE OSSO. Aranhas e esqueletos vivem em paz há cem anos.', 'J: O Grande Salão de Cristal fica ao sul. Lindo demais. Vá ver!']);
  },
  talkFemur() {
    const W = World, F = G.flags;
    if (F.p6war || F.p6after) return W.say(['* FÊMUR JR.: (chorando) Minha mãe estava na ponte quando tudo começou...', '* FÊMUR JR.: Eu não acho ela. Eu não acho ela em lugar nenhum.']);
    return W.say(['* FÊMUR JR.: Oi! Eu sou o Fêmur Júnior! O Novelo é meu melhor amigo!', '* FÊMUR JR.: A gente brinca de esconde-esconde. Ele sempre se esconde na teia.']);
  },
  villager(n) {
    const W = World, F = G.flags;
    if (F.p6war || F.p6after) {
      const L = { 1: ['* "Disseram que os esqueletos roubaram nossos ovos... será?"'], 2: ['* "Nossa casa pegou fogo. Não sobrou nada."'], 3: ['* "As aranhas querem nossos ossos! ...Foi o que os fantasmas disseram."'], 4: ['* "Minha filha perdeu a mãe. Eu perdi minha irmã. Pra quê?"'] };
      return W.say(L[n]);
    }
    const L = { 1: ['* "Quer uma rede de seda? Dorme que é uma beleza!"'], 2: ['* "Os esqueletos fazem a melhor sopa de cálcio da caverna."'], 3: ['* "Nyeh heh! As aranhas tecem nossos cachecóis. Bom negócio!"'], 4: ['* "Toda sexta tem festa na ponte. Aranhas e esqueletos dançando!"'] };
    return W.say(L[n]);
  },

  async ghostsScene() {
    const W = World, F = G.flags, p = W.player;
    F.p6war = true; W.locked = true;
    Sfx.stopMusic();
    const fire = this.ent('fireG'), ice = this.ent('iceG');
    W.focus(tx2x(61), ty2y(46));
    Object.assign(ice, { hidden: false, alpha: 0, flip: false }); Object.assign(fire, { hidden: false, alpha: G.flags.fireFriend ? 0 : 0, flip: true });
    Sfx.freeze();
    for (let i = 0; i < 40; i++) { await nextFrame(); ice.alpha = fire.alpha = i / 40; }
    Sfx.playMusic('icetheme');
    await W.say([
      'G: ...',
      'G: Não. Não pode ser.',
      'G: COMO VOCÊ AINDA ESTÁ VIVO?!',
      'F: O escorregador! A tempestade de gelo! Era pra você estar CONGELADO lá na ilha!',
      'G: Eu tentei te parar sozinho. Não deu.',
      'G: Então eu vou usar a caverna INTEIRA.',
      'G: Hoje começa uma NOVA ERA DE CAOS!',
    ]);
    W.shake = 1; Sfx.boo();
    const mac = this.ent('vMac'), piru = this.ent('vPiru');
    mac.hidden = false; piru.hidden = false;
    await W.say([
      'G: Venham, todos os vilões que esse humano derrotou!',
      'N: Eles me tiraram da prisão... e eu aceitei com prazer.',
      'Y: Caos? ...Eu só sei dar ordens. Serve?',
      'G: Agora escutem, ARANHAS: os esqueletos roubaram seus OVOS!',
      'G: E vocês, ESQUELETOS: as aranhas querem seus OSSOS!',
      '* (Era tudo mentira. Mas em pouco tempo, todo mundo acreditou.)',
    ]);
    Sfx.stopMusic(); W.shake = 2; Sfx.rumble();
    await Fade.to(1, 1.5);
    for (const e of [fire, ice, mac, piru]) e.hidden = true;
    this.ent('novelo').hidden = true; this.ent('guardE').hidden = true;
    W.focus(null);
    Sfx.playMusic('guerra');
    await wait(0.5);
    await Dialog.show([
      { t: '* (Em poucas horas, a caverna inteira estava em guerra.)' },
      { t: '* (Aranhas contra esqueletos. Vizinhos de cem anos.)' },
      { t: '* (Muitas aranhas perderam seus filhos.)' },
      { t: '* (Muitos filhos perderam suas mães.)' },
      { t: '* (E ninguém lembrava direito por que estava lutando.)' },
    ], true);
    await Fade.to(0, 1.5);
    await W.say(['* (Os fantasmas e os vilões fugiram para a TOCA ESCURA, no fundo da Cidade dos Ossos.)', '* (Você decide: isso precisa ACABAR.)']);
    W.saveHere(0);
    W.locked = false;
  },

  async confront() {
    const W = World, F = G.flags, p = W.player;
    F.p6confront = true; W.locked = true;
    const fire = this.ent('fireG'), ice = this.ent('iceG');
    Object.assign(fire, { hidden: false, alpha: 1, x: tx2x(108), y: ty2y(27), flip: true });
    Object.assign(ice, { hidden: false, alpha: 1, x: tx2x(111), y: ty2y(25), flip: true });
    Sfx.stopMusic();
    await W.walk(p, [[tx2x(104), ty2y(27)]], 50);
    p.dir = 'right';
    await W.say([
      '* (Você respira fundo.)',
      '* "ISSO ACABOU. PONTO FINAL."',
      '* "Ninguém deveria lutar só porque todo mundo está lutando."',
      '* "Aranhas e esqueletos eram vizinhos. Vocês destruíram tudo..."',
      '* "...só pra me atingir."',
      'G: ...E funcionou, não funcionou?',
    ]);
    const r = route();
    if (r === 'pacifista') return this.pacifistEnding();
    await W.say(r === 'genocida'
      ? ['* (Seus olhos ficam frios.)', '* (Você não quer conversa. Você quer VINGANÇA.)', 'F: I-irmão... olha os olhos dele...']
      : ['* (Você está com muita raiva.)', '* (Mas não quer acabar com eles. Só quer que PAREM.)', 'G: Então venha, humano. Vamos ver quem para quem.']);
    W.battle('irmaos', { dragon: G.dragon }, res => this.afterBrothers(res));
  },

  async pacifistEnding() {
    const W = World, F = G.flags;
    await W.say([
      '* (Você não quer vingança.)',
      '* "Eu não vim lutar. Eu vim pedir: PAREM. Por eles."',
      '* "As mães que procuram os filhos. Os filhos que procuram as mães."',
      'F: ...Irmão. Olha o que a gente fez.',
      'G: Eu só... queria que alguém pagasse pela dor que eu senti.',
      'G: Mas agora... a caverna inteira está sentindo essa dor.',
      'G: ...',
      'G: Desculpa, humano.',
    ]);
    const r = await W.ask('F: A gente pode... ser amigos? De verdade, dessa vez?', ['Amigos', 'Só parem a guerra']);
    if (r === 0) {
      F.ghostsFriends = true;
      await W.say(['F: AMIGOS!! Eu tenho TANTAS piadas novas pra te contar!', 'G: (quase sorrindo) ...Amigos.']);
    } else {
      F.ghostsAlive = true;
      await W.say(['G: ...Justo. Vamos parar.']);
    }
    F.ghostsAliveAny = true;
    await W.say(['* (Os irmãos mandam os vilões embora. Macaron e Pirulito fogem gritando "COVARDES!")']);
    return this.nothingChanged();
  },

  async afterBrothers(res) {
    const W = World, F = G.flags;
    W.locked = true;
    const fire = this.ent('fireG'), ice = this.ent('iceG');
    const r = route();
    if (r === 'genocida') {
      await W.say([
        '* (Os irmãos estão no chão, quase apagados.)',
        '* (Você pega um cristal de FOGO e um cristal de GELO da parede.)',
        '* (O RITUAL começa.)',
        'G: O que... o que você está fazendo?!',
        'F: Irmão... eu tô sumindo... eu tô SUMINDO!',
      ]);
      this.ritual = { t: 0 };
      Sfx.freeze(); Sfx.fire(); W.shake = 1.5;
      for (let i = 0; i < 90; i++) { const dt = await nextFrame(); this.ritual.t += dt; fire.alpha = ice.alpha = Math.max(0, 1 - i / 90); }
      fire.hidden = ice.hidden = true; this.ritual = null;
      F.ghostsGone = true;
      await W.say(['* (As chamas e o gelo se apagaram para sempre.)', '* (Não sobrou nada. Nem cinzas. Nem piadas.)', '* (...)', '* (Você se sente... vazio.)']);
    } else {
      F.ghostsAlive = true; F.ghostsAliveAny = true;
      await W.say([
        '* (Os irmãos estão derrotados.)',
        '* "Vocês não vão ser meus amigos. Mas também não vão mais destruir ninguém."',
        'G: ...Isso não acabou, humano.',
        'F: ...Acabou sim, irmão. Vamos embora.',
        '* (Os dois fogem para longe, sem olhar pra trás. Os vilões fogem também.)',
      ]);
      fire.hidden = ice.hidden = true;
    }
    return this.nothingChanged();
  },

  async nothingChanged() {
    const W = World, F = G.flags;
    this.ent('fireG').hidden = true; this.ent('iceG').hidden = true;
    await Fade.to(1, 1.5);
    const p = W.player; p.x = tx2x(60); p.y = ty2y(50); p.dir = 'down';
    W.updateCam(true);
    Sfx.playMusic('guerra');
    await Fade.to(0, 1.5);
    await W.say([
      '* (Você volta para o Grande Salão...)',
      '* (...e a guerra continua.)',
      '* (Os fantasmas sumiram. Os vilões sumiram. Mas o ódio ficou.)',
      '* (Casas pegando fogo. Famílias sem lar. Gente que nem sabe mais por que luta.)',
      '* (Nada mudou.)',
    ]);
    Sfx.playMusic('tristeza');
    const tec = this.ent('tecela'), osso = this.ent('osso');
    Object.assign(tec, { x: tx2x(57), y: ty2y(52) }); Object.assign(osso, { x: tx2x(63), y: ty2y(52) });
    await W.say([
      'E: Humano... os fantasmas foram embora, mas ninguém para de lutar.',
      'J: Nyeh... quando o ódio começa, ele não precisa mais de quem começou.',
      'E: Dizem que no FUNDO do abismo existe uma cidade linda. Um lugar sem guerra.',
      'J: Se você encontrar esse lugar... leve nosso povo. Aranhas E esqueletos.',
      'E: Nós abrimos a teia do caminho. Vá na frente. A gente vai atrás.',
    ]);
    F.p6after = true;
    for (let x = 58; x < 62; x++) { W.setTile(x, 54, 'r'); W.redrawTile(x, 54); }
    Sfx.puff();
    W.saveHere(0);
    W.locked = false;
  },

  async descend() {
    const W = World;
    if (!G.flags.p6after) return W.say(['* (Um buraco fundo. Muito fundo.)']);
    W.locked = true;
    const r = await W.ask('* (Descer pelo abismo? Não tem volta.)', ['Descer', 'Ainda não']);
    if (r !== 0) { W.locked = false; return; }
    await W.say(['* (Você desce por uma corda de seda, cada vez mais fundo...)', '* (Lá embaixo, uma luz rosa e dourada.)', '* (Uma CIDADE.)']);
    G.flags.p6done = true;
    W.saveHere();
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goChapter(7);
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere();
    await W.say(['* (A luz dos cristais te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
