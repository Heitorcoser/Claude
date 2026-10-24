// FASE 9 — VALE COMUM
// O dragão pousa numa cidade normal, tranquila. Mas o ESTRANHO ENCAPUZADO (o mesmo que
// te deu o celular na Colônia de Gelo) está esperando na ponte. Ele é um mestre, e a
// luta é 1 contra 1 (boss9.js).
'use strict';

Object.assign(ITEMS, {
  'Café': { heal: 15, price: 6, text: '* Você tomou o Café.\n* Acordou até a alma.' },
  'Pão Doce': { heal: 22, price: 10, text: '* Você comeu o Pão Doce.\n* Tem gosto de domingo.' },
  'Torta de Maçã': { heal: 45, price: 26, text: '* Você comeu a Torta de Maçã.\n* Igual à da sua avó. Quase.' },
});

const WALK9 = ",.sazqb";
const DOORS9 = { '27,18': 'casa1', '36,18': 'padaria', '46,18': 'casa2', '56,18': 'pousada' };

function dragonEnt9() {
  return { id: 'dragao9', x: tx2x(12), y: ty2y(28), w: 0, h: 0, solid: false, hidden: false, zOff: 2,
    lift: 0, crouch: 0, flap: 6, rider: false, sleep: false, mount: null, dust: [], flip: false,
    draw(sx, sy, t) {
      const k = G.dragon || 'laranja', set = SPR.dragon[k], cr = this.crouch;
      const bob = this.lift > 0 ? Math.sin(t * 5) * 2 : 0;
      const L = this.x - 13, T = this.y - 22 - this.lift + cr * 3 + bob;
      const sh = Math.max(0.15, 1 - this.lift / 120);
      ctx.fillStyle = `rgba(0,0,0,${0.35 * sh})`; ctx.beginPath(); ctx.ellipse(sx(this.x), sy(this.y), 22 * sh, 6 * sh, 0, 0, Math.PI * 2); ctx.fill();
      for (const d of this.dust) { ctx.fillStyle = `rgba(200,200,190,${Math.max(0, 0.7 - d.t)})`; ctx.beginPath(); ctx.arc(sx(d.x), sy(d.y), 4 + d.t * 14, 0, Math.PI * 2); ctx.fill(); }
      if (this.rider) { drawRider(sx(L), sy(T), 2, t, this.flip, this.flap); }
      else {
        drawDragonAura(k, sx(L), sy(T), 2, t);
        const img = set[this.flip ? 'left' : 'right'][this.sleep ? 1 : Math.floor(t * this.flap) % 2], hh = 22 * (1 - cr * 0.15);
        ctx.drawImage(img, sx(L), sy(T) + (22 - hh) * 2, 52, hh * 2);
      }
      if (this.mount) {
        const m = this.mount, q = Math.min(1, m.k);
        const px = m.x + (m.tx - m.x) * q, py = m.y + (m.ty - m.y) * q - Math.sin(q * Math.PI) * 26;
        drawSpr(SPR.player.left[q < 0.9 ? 1 : 0], sx(px), sy(py), 2);
      }
      if (this.sleep) for (let i = 0; i < 3; i++) { const q = (t * 0.4 + i / 3) % 1; text('z', sx(this.x + 8 + q * 14), sy(this.y - 30 - q * 22), 18 + q * 10, `rgba(255,255,255,${1 - q})`); }
    } };
}

MAPS.cidade = {
  music: 'cidade9',
  start: { x: tx2x(10), y: ty2y(28), dir: 'right' },
  anim: 'w',

  build() {
    const MW = 84, MH = 44, F = G.flags;
    const g = [];
    for (let y = 0; y < MH; y++) g.push(new Array(MW).fill('#'));
    const rect = (x, y, w, h, ch) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch; };
    const house = (x, y, w, h, doorX) => {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) g[y + j][x + i] = j < h - 3 ? 'R' : 'H';
      g[y + h - 2][x + 1] = 'W'; g[y + h - 2][x + w - 2] = 'W';
      g[y + h - 1][doorX] = 'D';
    };
    // parque
    rect(2, 12, 20, 24, ',');
    for (const [x, y] of [[3, 13], [8, 13], [14, 13], [19, 14], [3, 20], [3, 26], [4, 33], [10, 34], [17, 33], [20, 30], [20, 16]]) g[y][x] = 'T';
    rect(9, 19, 4, 4, 'o'); rect(10, 20, 2, 2, 'w');
    rect(13, 22, 9, 2, 's');
    // rua principal
    rect(22, 19, 42, 8, 's'); rect(22, 21, 42, 4, 'a'); rect(40, 21, 2, 4, 'z');
    house(24, 11, 7, 8, 27); house(32, 10, 9, 9, 36); house(43, 11, 7, 8, 46); house(52, 10, 9, 9, 56);
    // praça do lado sul
    rect(22, 27, 42, 8, ',');
    for (const [x, y] of [[24, 28], [31, 33], [38, 29], [47, 33], [55, 28], [61, 33]]) g[y][x] = 'T';
    rect(42, 29, 3, 3, 'o');
    // rio e ponte
    rect(64, 0, 4, MH, 'w');
    rect(64, 21, 4, 4, 'q');
    // depois da ponte
    rect(68, 19, 14, 8, ',');
    for (const [x, y] of [[70, 19], [75, 26], [79, 19], [80, 25]]) g[y][x] = 'T';
    rect(68, 21, 14, 4, 'b');
    void F;
    return { g };
  },

  solid(c) { return !WALK9.includes(c); },

  tileImg(c, x, y, W) {
    const T = SPR.city, D = SPR.deepT, h = (x * 73 + y * 151) % 3;
    if (c === ',') return T.grass[h];
    if (c === 's') return D.side[h];
    if (c === 'a') return y === 22 || y === 23 ? (y === 22 && x % 3 ? D.asphLine : D.asph[h]) : D.asph[h];
    if (c === 'z') return D.zebra;
    if (c === 'b') return T.dirt[h];
    if (c === 'T') return MAPS.dragoncity.layer(T.grass[h], T.tree);
    if (c === 'R') return T.roof; if (c === 'H') return T.wallH; if (c === 'W') return T.window; if (c === 'D') return T.door;
    if (c === 'o') return T.rim; if (c === 'w') return T.water[0];
    if (c === 'q') return T.bridge;
    if (c === '#') { const b = W.tile(x, y + 1); return WALK9.includes(b) || 'oTw'.includes(b) ? T.cliff : T.rock; }
    return T.rock;
  },
  animImg(c, x, y, fr) { return c === 'w' ? SPR.city.water[(fr + x + y) % 3] : null; },

  ents(W) {
    const F = G.flags;
    const lamp = (id, x, y) => ({ ...lampEnt(x, y), id });
    return [
      dragonEnt9(),
      { id: 'star1', x: tx2x(18), y: ty2y(23), w: 12, h: 8, spr: 'star', solid: true, talk: () => P9.useStar() },
      { id: 'star2', x: tx2x(60), y: ty2y(20), w: 12, h: 8, spr: 'star', solid: true, talk: () => P9.useStar() },
      { id: 'sign', x: tx2x(21), y: ty2y(20), w: 14, h: 6, spr: 'sign', solid: true, talk: () => W.say(['* (BEM-VINDO A VALE COMUM)', "* 'Uma cidade normal. Sem aventura nenhuma. Prometemos.'"]) },
      lamp('l1', 25, 19), lamp('l2', 39, 19), lamp('l3', 51, 19), lamp('l4', 62, 19), lamp('l5', 30, 26), lamp('l6', 50, 26),
      kidNpc('m1', 'k1', 16, 27, () => P9.citizen(1)),
      kidNpc('m2', 'k3', 34, 30, () => P9.citizen(2)),
      kidNpc('m3', 'k2', 45, 31, () => P9.citizen(3)),
      robotNpc('m4', 'verde', 30, 20, () => P9.citizen(4), 'right'),
      kidNpc('m5', 'k4', 58, 25, () => P9.citizen(5)),
      robotNpc('m6', 'ouro', 52, 29, () => P9.citizen(6)),
      { id: 'mestre', x: tx2x(66) + 8, y: ty2y(22), w: 16, h: 10, solid: true, hidden: !!F.p9done, talk: () => P9.meetMaster(),
        draw(sx, sy, t) { drawSpr(SPR.encapuzado, sx(this.x - 8), sy(this.y - 24) + Math.sin(t * 1.5) * 1, 2, this.alpha ?? 1); } },
    ];
  },

  triggers(W) {
    const F = G.flags;
    return [{ x: 62, y: 19, w: 2, h: 8, when: () => F.p9arrived && !F.p9done && !P9.busy, run: () => P9.meetMaster() }];
  },

  setup(W) {},
  onEnter(W) {
    const F = G.flags, d = W.ents.find(e => e.id === 'dragao9');
    if (!F.p9arrived) P9.arrive();
    else { d.sleep = true; d.x = tx2x(12); d.y = ty2y(28); }
  },

  musicAt(W) { const [x] = W.feetTile(); return x >= 56 && !G.flags.p9done ? 'encontro' : 'cidade9'; },

  update(W, dt) {
    const d = W.ents.find(e => e.id === 'dragao9');
    for (const q of d.dust) q.t += dt; d.dust = d.dust.filter(q => q.t < 0.8);
    if (W.locked || Game.scene !== 'world') return;
    const m = this.musicAt(W);
    if (Sfx.current !== m) Sfx.playMusic(m);
  },

  overlay(W, sx, sy) {
    // entardecer perto da ponte
    const x = W.player.x / TS, k = Math.max(0, Math.min(1, (x - 44) / 18));
    if (k > 0 && !G.flags.p9done) { ctx.fillStyle = `rgba(60,20,70,${k * 0.45})`; ctx.fillRect(0, 0, 640, 480); }
  },

  interactTile(W, c, tx, ty) {
    const d = DOORS9[tx + ',' + ty];
    if (d === 'padaria') return P9.shop();
    if (d === 'pousada') return P9.inn();
    if (d) return W.say(d === 'casa1' ? ['* (Toc toc.)', '* "Não queremos comprar nada!"'] : ['* (Você ouve uma TV ligada lá dentro. Alguém ri de um programa de culinária.)']);
    if (c === 'w') return W.say(['* (Um rio calmo. Tem um peixe te olhando.)']);
    if (c === 'o') return W.say(['* (Uma fonte. Tem moedinhas no fundo e pedidos escritos num papel molhado.)']);
    if (c === 'W') return W.say(['* (Uma janela. Cortinas com bolinhas.)']);
  },

  talkInstr(W) {},
};

// ---------------- Roteiros da Fase 9 ----------------
const P9 = {
  busy: false,
  ent(id) { return World.ents.find(e => e.id === id); },
  async frames(n, fn) { for (let i = 0; i < n; i++) { const dt = await nextFrame(); fn(i / n, dt || 1 / 60); } },
  dust(d, n) { for (let i = 0; i < n; i++) d.dust.push({ x: d.x + (Math.random() - 0.5) * 40, y: d.y + (Math.random() - 0.5) * 6, t: Math.random() * 0.2 }); },

  async arrive() {
    const W = World, F = G.flags, p = W.player, d = this.ent('dragao9');
    W.locked = true; F.p9arrived = true;
    p.hidden = true; p.x = tx2x(10); p.y = ty2y(28); p.dir = 'right';
    Object.assign(d, { rider: true, x: tx2x(13), y: ty2y(28), lift: 180, flap: 10, flip: false });
    W.focus(d.x, d.y - 40); W.updateCam(true);
    Fade.a = 1; Sfx.playMusic('voo'); Fade.to(0, 0.8);
    await this.frames(120, k => { d.lift = 180 * (1 - k) * (1 - k); if (k > 0.8 && Math.random() < 0.4) this.dust(d, 1); });
    d.lift = 0; Sfx.puff(); this.dust(d, 8); W.shake = 0.3;
    d.flap = 3;
    await W.say(['* (Seu dragão pousa num parque verde e tranquilo.)', '* (Prédios baixinhos, uma fonte, crianças brincando, cheiro de pão.)', '* (Uma cidade... normal.)']);
    // desce do dragão
    await this.frames(18, k => { d.crouch = k; });
    d.rider = false;
    d.mount = { x: d.x - 24, y: d.y - 27, tx: d.x - 34, ty: d.y - 21, k: 0 };
    Sfx.whoosh();
    await this.frames(36, k => { d.mount.k = k * k * (3 - 2 * k); });
    d.mount = null; p.hidden = false; p.x = d.x - 27; p.y = d.y; p.dir = 'right';
    Sfx.step();
    await this.frames(14, k => { d.crouch = 1 - k; });
    d.crouch = 0;
    Sfx.playMusic('cidade9');
    await W.say(['* (Seu dragão boceja. O voo foi longo.)', '* (Ele deita na grama, enrola o rabo... e dorme.)']);
    d.sleep = true; d.flap = 0;
    await W.say(['* (Deixe ele descansar. Explore a cidade.)']);
    W.focus(null);
    W.saveHere(0);
    W.locked = false;
  },

  citizen(n) {
    const W = World;
    const L = {
      1: ['C: Uau, um DRAGÃO dormindo no parque!', 'C: Posso fazer carinho? ...Ele roncou fogo. Melhor não.'],
      2: ['C: Aqui nunca acontece nada. Nadinha.', 'C: Ontem o assunto da cidade foi um gato que subiu numa árvore.'],
      3: ['C: Tinha um cara de capuz andando por aí.', 'C: Ele perguntou de um humano com um dragão... É você?', 'C: Ele foi pra PONTE, no leste.'],
      4: ['* BIP. Bem-vindo a Vale Comum. Padaria: porta 2. Pousada: porta 4.', '* BIP. Recomendação: compre comida antes de qualquer... imprevisto.'],
      5: ['C: O moço encapuzado tá parado na ponte faz horas.', 'C: Ele nem se mexe. Mas o olho dele... brilhou.', 'C: Se eu fosse você, comia alguma coisa antes.'],
      6: ['* BIP. Previsão do tempo: céu limpo.', '* BIP. ...Com chance de ossos.'],
    };
    return W.say(L[n]);
  },
  async shop() {
    const W = World;
    const stock = [['Café', 'Café 6G'], ['Pão Doce', 'Pão Doce 10G'], ['Torta de Maçã', 'Torta de Maçã 26G']];
    await W.say(['* PADEIRA: Bom dia, querido! Pão quentinho!']);
    for (;;) {
      const r = await W.ask(`* O que vai querer? (Você tem ${G.gold} OURO)`, stock.map(s => s[1]).concat(['Sair']));
      if (r === 3 || r === undefined) return W.say(['* PADEIRA: Volte sempre!']);
      const [name] = stock[r], price = ITEMS[name].price;
      if (G.gold < price) { Sfx.back(); await W.say(['* PADEIRA: Hmm, falta um pouquinho de ouro, querido.']); continue; }
      if (G.items.length >= 8) { Sfx.back(); await W.say(['* (Seus bolsos estão cheios!)']); continue; }
      G.gold -= price; G.items.push(name); Sfx.select();
      await W.say([`* Você comprou ${name.toUpperCase()}.`]);
    }
  },
  async inn() {
    const W = World;
    W.locked = true;
    await W.say(['* RECEPCIONISTA: Bem-vindo à POUSADA!', '* RECEPCIONISTA: Você parece cansado. Hoje é por conta da casa.']);
    await Fade.to(1, 2);
    G.hp = G.maxhp; Sfx.heal();
    await wait(0.6);
    await Fade.to(0, 2);
    W.saveHere(0);
    await W.say(['* (Você descansou. HP cheio. Jogo salvo.)']);
    W.locked = false;
  },

  async meetMaster() {
    const W = World, F = G.flags, p = W.player, m = this.ent('mestre');
    if (this.busy || F.p9done) return;
    this.busy = true; W.locked = true;
    W.saveHere(0);
    Sfx.stopMusic();
    await W.walk(p, [[tx2x(63), ty2y(22)]], 60);
    p.dir = 'right';
    const retry = m9Tries() > 0;
    if (retry) {
      await W.say(['S: ...De novo?', 'S: Hm. Gostei.']);
    } else {
      const r = route();
      await W.say([
        '* (No meio da ponte, uma figura encapuzada.)',
        '* (Você conhece esse capuz. É o estranho que te deu o celular, lá na Colônia de Gelo.)',
        'S: ...Lembra? "Ainda não é hora."',
        'S: Agora é.',
        'S: Desde aquele dia na neve, eu vi tudo. Cada passo seu.',
        r === 'pacifista' ? 'S: Você não machucou ninguém. Nem quem merecia.' : r === 'genocida' ? 'S: Você deixou um rastro de poeira por onde passou.' : 'S: Você poupou alguns. Outros, não.',
        'S: Depois desta cidade, lá no fundo, existe uma coisa que nem eu consigo parar.',
        'S: Eu preciso saber se você aguenta.',
      ]);
      await W.ask('S: Você está pronto?', ['Estou pronto.', 'Espera...']);
      await W.say(['S: Eu não estava perguntando de verdade.']);
    }
    Sfx.slam(); W.shake = 0.6;
    this.busy = false;
    W.battle('mestre', {}, res => this.afterMaster(res));
  },

  async afterMaster(res) {
    const W = World, F = G.flags, m = this.ent('mestre');
    W.locked = true;
    m9Tries(0);
    Sfx.playMusic('encontro');
    const r = route();
    if (res === 'spared') {
      F.masterSpared = true;
      await W.say([
        'S: ...Você me poupou.',
        'S: Eu quebrei a sua misericórdia. E ela voltou sozinha.',
        'S: É por isso que você vai conseguir. Eu tenho certeza agora.',
      ]);
    } else if (r === 'genocida') {
      await W.say(['S: Hah... forte.', 'S: Então é isso que você virou.', 'S: Tomara que o que está lá embaixo seja mais forte que você.']);
    } else {
      await W.say(['S: Hah... hah... forte.', 'S: Mas força sozinha não basta lá embaixo.', 'S: Lembre dos seus amigos. Você vai precisar deles.']);
    }
    await W.say([
      'S: Meu nome? ...Um dia eu te conto.',
      'S: Atravesse a ponte. O caminho desce pela última vez.',
      'S: Eu vou estar olhando.',
    ]);
    Sfx.whoosh();
    for (let i = 0; i < 40; i++) { await nextFrame(); m.alpha = 1 - i / 40; m.y -= 0.5; }
    m.hidden = true;
    F.p9done = true;
    await W.say(['* (O Mestre Encapuzado sumiu numa nuvem de poeira azul.)', '* (Lá atrás, no parque, seu dragão acorda e voa até você.)']);
    W.saveHere(0);
    await Fade.to(1, 1);
    Sfx.stopMusic();
    Game.goEnd(9);
  },

  async useStar() {
    const W = World;
    G.hp = G.maxhp; Sfx.save(); W.saveHere(0);
    await W.say([G.flags.p9arrived && W.player.x > 50 * TS ? '* (O vento frio da ponte... você sente que algo grande vai acontecer. Isso te enche de DETERMINAÇÃO.)' : '* (O cheiro de pão quentinho te enche de DETERMINAÇÃO.)', '* HP recuperado. Jogo salvo.']);
  },
};
