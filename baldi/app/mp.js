// Multiplayer: até 4 jogadores pela internet, com código de sala (PeerJS liga os celulares direto).
// - O anfitrião escolhe o modo e as opções; todo mundo monta a mesma escola com a mesma semente.
// - O anfitrião manda no mundo: o Baldi e os outros personagens rodam no celular dele (e vão atrás de quem estiver mais perto);
//   os convidados recebem posições, portas, cadernos e os sons dos personagens, e mandam o que fazem (cadernos, itens, portas, barulho).
// - Cadernos em equipe. Quem é pego fica assistindo; se todos forem pegos, acabou. Se alguém escapar, todos vencem.
(function () {
  'use strict';
  const J = window.Jogo, M = window.Motor, $ = (id) => document.getElementById(id);
  const PREFIXO = 'baldimodded-sala-', CORES = ['#e33', '#38f', '#2b2', '#fb0'];
  const S = { papel: null, codigo: '', conexoes: [], conn: null, peer: null, eu: 0, jogadores: [], remotos: {}, avatares: {}, envT: 0, pend: {} };
  J.mp = S;
  const nome = () => (($('mpNome') && $('mpNome').value.trim()) || 'Jogador').slice(0, 12);

  /* ---------- transporte: PeerJS (internet) ou BroadcastChannel (no mesmo aparelho, para teste) ---------- */
  const local = () => /mp=local/.test(location.search) || window.MP_LOCAL;
  function criaSala(cb) {
    const codigo = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[M.rndInt(0, 23)]).join('');
    S.papel = 'host'; S.codigo = codigo; S.eu = 0; S.jogadores = [{ id: 0, nome: nome(), cor: CORES[0] }];
    if (local()) {
      const bc = new BroadcastChannel(PREFIXO + codigo); S.bc = bc;
      bc.onmessage = (e) => {
        const { de, para, msg } = e.data; if (para !== 'host') return;
        let c = S.conexoes.find((c) => c.id === de);
        if (!c) { c = { id: de, envia: (m) => bc.postMessage({ para: de, msg: m }) }; S.conexoes.push(c); }
        recebeHost(c, msg);
      };
      return cb(null, codigo);
    }
    const peer = new window.Peer(PREFIXO + codigo); S.peer = peer;
    peer.on('open', () => cb(null, codigo));
    peer.on('error', (e) => { if (e.type == 'unavailable-id') { peer.destroy(); criaSala(cb); } else cb(e); });
    peer.on('connection', (dc) => {
      const c = { id: dc.peer, envia: (m) => { if (dc.open) dc.send(m); }, dc };
      dc.on('open', () => S.conexoes.push(c));
      dc.on('data', (m) => recebeHost(c, m));
      dc.on('close', () => saiu(c));
    });
  }
  function entraSala(codigo, cb) {
    S.papel = 'cliente'; S.codigo = codigo.toUpperCase();
    if (local()) {
      const id = 'c' + Math.random().toString(36).slice(2, 8), bc = new BroadcastChannel(PREFIXO + S.codigo); S.bc = bc;
      S.conn = { envia: (m) => bc.postMessage({ de: id, para: 'host', msg: m }) };
      bc.onmessage = (e) => { if (e.data.para === id) recebeCliente(e.data.msg); };
      S.conn.envia({ t: 'ola', nome: nome() });
      return cb(null);
    }
    const peer = new window.Peer(); S.peer = peer;
    peer.on('error', (e) => cb(e));
    peer.on('open', () => {
      const dc = peer.connect(PREFIXO + S.codigo, { reliable: true });
      S.conn = { envia: (m) => { if (dc.open) dc.send(m); }, dc };
      dc.on('open', () => { S.conn.envia({ t: 'ola', nome: nome() }); cb(null); });
      dc.on('data', recebeCliente);
      dc.on('close', () => { if (S.papel == 'cliente') caiu('O anfitrião saiu da sala.'); });
      setTimeout(() => { if (!dc.open) cb(new Error('Sala não encontrada')); }, 12000);
    });
  }
  const paraTodos = (m) => S.conexoes.forEach((c) => c.envia(m));
  function sai() {
    try { if (S.papel == 'host') paraTodos({ t: 'fechou' }); else if (S.conn) S.conn.envia({ t: 'tchau' }); } catch (e) {}
    try { S.peer && S.peer.destroy(); } catch (e) {}
    try { S.bc && S.bc.close(); } catch (e) {}
    Object.assign(S, { papel: null, codigo: '', conexoes: [], conn: null, peer: null, bc: null, jogadores: [], remotos: {} });
    J.mpAtivo = false; J.mpEnvia = null; J.semente = null;
    restauraOpcoes(); atualizaTela();
  }
  function caiu(txt) {
    sai();
    if (J.G) { J.G.fim = true; J.menu(); }
    $('telaMP').hidden = false; $('mpMsg').textContent = txt;
  }

  /* ---------- anfitrião ---------- */
  function recebeHost(c, m) {
    const G = J.G;
    if (m.t == 'ola') {
      if (S.jogadores.length >= 4) return c.envia({ t: 'cheia' });
      const id = Math.max(...S.jogadores.map((j) => j.id)) + 1;
      c.jid = id; S.jogadores.push({ id, nome: m.nome, cor: CORES[id % 4] });
      c.envia({ t: 'bemvindo', id });
      paraTodos({ t: 'lobby', jogadores: S.jogadores }); atualizaTela();
      if (G && !G.fim && S.inicio) c.envia(Object.assign({ t: 'inicio' }, S.inicio)); // chegou com a partida rolando: entra nela
      return;
    }
    if (m.t == 'tchau') return saiu(c);
    if (!G || G.fim) return;
    const r = S.remotos[c.jid] || (S.remotos[c.jid] = proxy(c.jid));
    const N = G.npcs, b = N.baldi;
    switch (m.t) {
      case 'eu': Object.assign(r, { x: m.x, z: m.z, yaw: m.yaw, culpa: m.culpa, culpaTipo: m.ct, pego: m.pego, t: performance.now() }); break;
      case 'caderno': { const o = G.objs[m.i]; if (o && o.ativo) { o.ativo = false; o.m.visible = false; o.volta = 120; G.cadernos++; J.atualizaHud(); chegouUltimo(G); } break; }
      case 'obj': { const o = G.objs[m.i]; if (o) { o.ativo = false; if (o.m) o.m.visible = false; } break; }
      case 'porta': { const d = G.portas[m.i]; if (d && !d.aberta) { if (m.s) d.silencio = Math.max(1, d.silencio); J.abrePorta(d, 'jogador'); } break; }
      case 'trava': { const d = G.portas[m.i]; if (d) d.trava = m.v; break; }
      case 'ouve': if (b) b.ouve(m.x, m.z, m.pr); break;
      case 'spoop': J.spoop(); break;
      case 'bravo': if (b) b.bravo(m.v); break;
      case 'raiva': if (b) b.raivaT += m.v; break;
      case 'bsoda': J.soltaBsoda(m.x, m.z, m.vx, m.vz, true); break;
      case 'relogio': J.despertador(m.x, m.z, true); break;
      case 'surdo': J.surdo(); break;
      case 'prize': if (N.prize) N.prize.louco = 15; break;
      case 'pego': r.pego = true; confereTodosPegos(); break;
      case 'vitoria': paraTodos({ t: 'vitoria', nome: nomeDe(c.jid) }); J.vitoria(`${nomeDe(c.jid)} escapou! Vocês venceram!`); break;
    }
  }
  function saiu(c) {
    S.conexoes = S.conexoes.filter((x) => x !== c);
    S.jogadores = S.jogadores.filter((j) => j.id !== c.jid);
    delete S.remotos[c.jid]; tiraAvatar(c.jid);
    paraTodos({ t: 'lobby', jogadores: S.jogadores }); atualizaTela();
    confereTodosPegos();
  }
  const nomeDe = (id) => (S.jogadores.find((j) => j.id === id) || {}).nome || 'Alguém';
  const proxy = (id) => ({ id, x: 0, z: 0, yaw: 0, est: 100, culpa: 0, culpaTipo: '', corda: false, varrendo: 0, abracando: 0, botas: 0, pulo: 0, h: 4, esmagado: 0, chiclete: 0, pego: false, t: 0 });
  function chegouUltimo(G) {
    if (G.cadernos >= G.totalCadernos && G.modo != 'infinito' && !G.final) { M.som('Characters/Baldi/BAL_AllNotebooks', { vol: 0.8 }); J.modoFinal(); }
  }
  function confereTodosPegos() {
    const G = J.G;
    if (!G || G.fim || S.papel != 'host') return;
    const vivos = (S.pegoEu ? 0 : 1) + Object.values(S.remotos).filter((r) => !r.pego).length;
    if (vivos == 0) { paraTodos({ t: 'fimTodos' }); fimDeVerdade(); }
  }
  // personagens que vão atrás de qualquer jogador (os outros só do anfitrião)
  const PERSEGUEM = ['baldi', 'diretor', 'sweep', 'prize', 'crafters', 'beans'];
  function alvos(G) {
    const l = [];
    if (!S.pegoEu) l.push(G.p);
    const agora = performance.now();
    for (const r of Object.values(S.remotos)) if (!r.pego && agora - r.t < 3000) l.push(r);
    return l;
  }
  function maisPerto(G, n) {
    const l = alvos(G);
    if (!l.length) return null;
    const visto = l.filter((a) => J.mundo.ve(n.x, n.z, a.x, a.z));
    const lista = visto.length ? visto : l;
    return lista.reduce((a, b) => (Math.hypot(b.x - n.x, b.z - n.z) < Math.hypot(a.x - n.x, a.z - n.z) ? b : a));
  }
  // roda o personagem com o "jogador" trocado pelo mais perto; o que ele fizer no remoto vai para o celular dele
  function comAlvo(G, n, f) {
    return function (dt) {
      const alvo = maisPerto(G, n);
      if (!alvo || alvo === G.p) { S.emNPC = true; try { return f.call(n, dt); } finally { S.emNPC = false; } }
      const real = G.p, x0 = alvo.x, z0 = alvo.z;
      G.p = alvo; S.emNPC = true;
      try { f.call(n, dt); } finally { G.p = real; S.emNPC = false; }
      const c = S.conexoes.find((c) => c.jid === alvo.id);
      if (!c) return;
      if (Math.hypot(alvo.x - x0, alvo.z - z0) > 3) c.envia({ t: 'tp', x: alvo.x, z: alvo.z }); // detenção, Arts and Crafters
      if (alvo.varrendo > 0) { c.envia({ t: 'efeito', varre: alvo.varreV }); alvo.varrendo = 0; }
      if (alvo.abracando > 0) { c.envia({ t: 'efeito', abraco: 1 }); alvo.abracando = 0; }
    };
  }
  J.mpRemotos = () => (S.papel == 'host' ? Object.values(S.remotos).filter((r) => !r.pego) : []);
  J.mpEfeito = (id, ef) => { const c = S.conexoes.find((c) => c.jid === id); if (c) c.envia(Object.assign({ t: 'efeito' }, ef)); };
  // sons dos personagens (no anfitrião) tocam também nos outros celulares
  const somOriginal = M.som;
  M.som = function (n, op = {}) {
    if (S.papel == 'host' && S.emNPC && J.mpAtivo && !op.loop) {
      const de = op.de && op.de.x !== undefined ? [Math.round(op.de.x * 10) / 10, Math.round(op.de.z * 10) / 10] : null;
      paraTodos({ t: 'som', n, de, vol: op.vol, al: op.alcance });
    }
    return somOriginal.call(this, n, op);
  };
  function mandaMundo(G) {
    const npcs = {};
    for (const [k, n] of Object.entries(G.npcs)) if (n.spr) npcs[k] = [+n.x.toFixed(2), +n.z.toFixed(2), n.spr.visible ? 1 : 0, n.spr.userData.tex || '', +n.spr.position.y.toFixed(2), n.ativo ? 1 : 0, +(n.dir || 0).toFixed(2), +(n.vx || 0).toFixed(1), +(n.vz || 0).toFixed(1)];
    const portas = G.portas.map((d) => (d.aberta ? 1 : 0) + ',' + Math.ceil(d.trava || 0));
    const objs = G.objs.map((o) => (o.tipo == 'caderno' || o.tipo == 'item' ? (o.ativo ? 1 : 0) : 2)).join('');
    const jog = [{ id: 0, x: +G.p.x.toFixed(2), z: +G.p.z.toFixed(2), yaw: +G.p.yaw.toFixed(2), pego: !!S.pegoEu }].concat(Object.values(S.remotos).map((r) => ({ id: r.id, x: +r.x.toFixed(2), z: +r.z.toFixed(2), yaw: +r.yaw.toFixed(2), pego: r.pego })));
    paraTodos({ t: 'mundo', npcs, portas, objs, cad: G.cadernos, spoop: G.spoop, jog });
  }

  /* ---------- convidado ---------- */
  function recebeCliente(m) {
    if (m.t == 'bemvindo') { S.eu = m.id; atualizaTela(); return; }
    if (m.t == 'lobby') { S.jogadores = m.jogadores; atualizaTela(); return; }
    if (m.t == 'cheia') return caiu('A sala está cheia (4 jogadores).');
    if (m.t == 'fechou') return caiu('O anfitrião fechou a sala.');
    if (m.t == 'inicio') {
      S.inicio = m; $('telaMP').hidden = true; $('fim').hidden = true;
      if (J.G) { J.G.fim = true; }
      guardaOpcoes();
      Object.assign(m.modo == 'beta' ? J.betaFeat : J.histFeat, m.feats || {});
      J.dificuldade(m.dif); J.semente = m.semente; J.mpAtivo = true; S.vindoDoHost = true;
      J.comeca(m.modo);
      return;
    }
    const G = J.G;
    if (!G || !J.mpAtivo) return;
    const p = G.p;
    switch (m.t) {
      case 'mundo': aplicaMundo(G, m); break;
      case 'som': M.som(m.n, { de: m.de ? { x: m.de[0], z: m.de[1] } : undefined, vol: m.vol, alcance: m.al }); break;
      case 'tp': p.x = m.x; p.z = m.z; break;
      case 'efeito':
        if (m.varre && p.botas <= 0) { p.varrendo = 1; p.varreV = m.varre; }
        if (m.abraco && p.botas <= 0 && G.npcs.prize) { p.abracando = 0.3; p.abraco = G.npcs.prize; }
        if (m.chiclete) { p.chiclete = m.chiclete; J.aviso('Chiclete! Você está grudado (use a tesoura)', 2.5); }
        break;
      case 'vitoria': J.vitoria(`${m.nome} escapou! Vocês venceram!`); break;
      case 'fimTodos': fimDeVerdade(); break;
    }
  }
  function aplicaMundo(G, m) {
    for (const [k, v] of Object.entries(m.npcs)) {
      const n = G.npcs[k]; if (!n || !n.spr) continue;
      n.x = v[0]; n.z = v[1]; n.spr.visible = !!v[2]; if (v[3]) J.troca(n.spr, v[3]); n.oy = v[4]; n.ativo = !!v[5]; n.dir = v[6]; n.vx = v[7]; n.vz = v[8];
    }
    m.portas.forEach((s, i) => {
      const d = G.portas[i]; if (!d) return;
      const [a, t] = s.split(',').map(Number);
      if (d.tipo == 'vaivem') { d.trava = Math.max(d.trava, t); return; }
      if (t > 0 && !(d.trava > 0)) { d.trava = t; d.aberta = false; d.seg.ativo = true; J.mostraPorta(d); }
      else if (a && !d.aberta && !(d.trava > 0)) { d.aberta = true; d.tempo = 3; d.seg.ativo = false; J.mostraPorta(d); }
    });
    const agora = performance.now();
    for (let i = 0; i < m.objs.length; i++) {
      const o = G.objs[i], f = m.objs[i];
      if (!o || f == '2' || (S.pend[i] && agora - S.pend[i] < 2000)) continue;
      const ativo = f == '1';
      if (o.ativo !== ativo) { o.ativo = ativo; if (o.m) o.m.visible = ativo; }
    }
    if (m.cad !== G.cadernos) { G.cadernos = m.cad; J.atualizaHud(); }
    if (G.cadernos >= G.totalCadernos && G.modo != 'infinito' && !G.final && !G.aprendendo) { M.som('Characters/Baldi/BAL_AllNotebooks', { vol: 0.8 }); J.modoFinal(); }
    if (m.spoop && !G.spoop) J.spoop();
    S.outros = m.jog.filter((j) => j.id !== S.eu);
  }

  /* ---------- começo da partida ---------- */
  // o anfitrião manda modo, dificuldade, opções e a semente da escola
  J.antesComeca = (modo) => {
    if (S.papel == 'cliente' && !S.vindoDoHost) sai(); // convidado começou sozinho: sai da sala
    S.vindoDoHost = false;
    if (S.papel != 'host') { if (S.papel != 'cliente') { J.mpAtivo = false; J.semente = null; } return; }
    const feats = Object.assign({}, J.feats(modo) || {}, { porao: false }); // o Null fica fora do multiplayer
    S.inicio = { modo, dif: J.dificuldade(), feats, semente: (Math.random() * 4294967296) >>> 0 };
    J.semente = S.inicio.semente; J.mpAtivo = true; S.pegoEu = false;
    if (modo == 'beta') guardaOpcoes(), Object.assign(J.betaFeat, feats); else if (modo == 'historia') guardaOpcoes(), Object.assign(J.histFeat, feats);
    for (const r of Object.values(S.remotos)) r.pego = false;
    paraTodos(Object.assign({ t: 'inicio' }, S.inicio));
    $('telaMP').hidden = true; $('mpAvisoMenu').hidden = true;
  };
  let guardadas = null;
  function guardaOpcoes() { if (!guardadas) guardadas = { b: JSON.stringify(J.betaFeat), h: JSON.stringify(J.histFeat) }; }
  function restauraOpcoes() { if (guardadas) { Object.assign(J.betaFeat, JSON.parse(guardadas.b)); Object.assign(J.histFeat, JSON.parse(guardadas.h)); guardadas = null; } }

  J.ganchos.inicia.push((G) => {
    S.pegoEu = false; S.outros = []; S.pend = {};
    for (const id of Object.keys(S.avatares)) tiraAvatar(id);
    if (!J.mpAtivo) return;
    J.modoNull = false;
    if (S.papel == 'host') {
      for (const r of Object.values(S.remotos)) Object.assign(r, { pego: false, t: performance.now() });
      for (const [k, n] of Object.entries(G.npcs)) if (PERSEGUEM.includes(k)) { n.tique = comAlvo(G, n, n.tique); n.fixo = comAlvo(G, n, n.fixo); }
      else { const t = n.tique, f = n.fixo; n.tique = function (dt) { S.emNPC = true; try { t.call(this, dt); } finally { S.emNPC = false; } }; n.fixo = function (dt) { S.emNPC = true; try { f.call(this, dt); } finally { S.emNPC = false; } }; }
    } else {
      // no convidado os personagens só seguem o que o anfitrião manda
      for (const n of Object.values(G.npcs)) { n.tique = () => {}; n.fixo = () => {}; n.anima = null; }
      J.mpEnvia = (m) => S.conn && S.conn.envia(m);
    }
  });
  // caderno pego pelo convidado: avisa o anfitrião
  J.ganchos.caderno.push((G, o) => { if (S.papel == 'cliente' && J.mpAtivo) { const i = G.objs.indexOf(o); S.pend[i] = performance.now(); S.conn.envia({ t: 'caderno', i }); } });
  // ser pego: fica assistindo
  J.interceptaGameOver = () => {
    if (!J.mpAtivo || S.forcaFim) return false;
    if (S.pegoEu) return true;
    S.pegoEu = true;
    M.som('Characters/Baldi/Sounds/BAL_Slap');
    J.aviso('O Baldi te pegou! Agora você assiste os outros.', 4);
    if (S.papel == 'cliente') S.conn.envia({ t: 'pego' }); else confereTodosPegos();
    return true;
  };
  function fimDeVerdade() { S.forcaFim = true; S.pegoEu = false; const G = J.G; if (G) { G.fim = false; J.gameOver(); } S.forcaFim = false; }
  J.aoVencer = () => { if (!J.mpAtivo) return; if (S.papel == 'cliente') S.conn.envia({ t: 'vitoria' }); else paraTodos({ t: 'vitoria', nome: nome() }); };

  // quem foi pego só assiste: não pega nada
  const toqueAntes = J.toqueMundo;
  J.toqueMundo = (sx, sy, cam) => (J.mpAtivo && S.pegoEu) || (toqueAntes ? toqueAntes(sx, sy, cam) : false);

  /* ---------- a cada quadro ---------- */
  J.ganchos.tique.push((G, dt) => {
    if (!J.mpAtivo || G.fim) return;
    const p = G.p;
    // pego: a câmera vai com quem ainda está jogando
    if (S.pegoEu) {
      const vivos = S.papel == 'host' ? Object.values(S.remotos).filter((r) => !r.pego).map((r) => ({ x: r.x, z: r.z, yaw: r.yaw })) : (S.outros || []).filter((j) => !j.pego);
      if (vivos.length) { const v = vivos[0]; p.x = v.x; p.z = v.z; p.yaw = v.yaw; }
    }
    if ((S.envT -= dt) <= 0) {
      S.envT = 0.08;
      if (S.papel == 'host') mandaMundo(G);
      else S.conn.envia({ t: 'eu', x: +p.x.toFixed(2), z: +p.z.toFixed(2), yaw: +p.yaw.toFixed(2), culpa: +p.culpa.toFixed(2), ct: p.culpaTipo, pego: !!S.pegoEu });
    }
    // os outros jogadores na tela
    const lista = S.papel == 'host' ? Object.values(S.remotos) : S.outros || [];
    const vistos = new Set();
    for (const j of lista) {
      vistos.add(String(j.id));
      const a = S.avatares[j.id] || (S.avatares[j.id] = avatar(j.id));
      a.position.set(j.x, 2.6, j.z); a.rotation.y = J.camera.rotation.y; a.visible = !j.pego;
    }
    for (const id of Object.keys(S.avatares)) if (!vistos.has(id)) tiraAvatar(id);
  });
  // boneco de aluno com o nome em cima (desenhado num canvas)
  function avatar(id) {
    const j = S.jogadores.find((j) => j.id == id) || { nome: 'Jogador', cor: CORES[id % 4] };
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 256;
    const c = cv.getContext('2d');
    c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillRect(4, 0, 120, 30); c.fillStyle = '#fff'; c.fillText(j.nome, 64, 23);
    c.fillStyle = '#f2c79b'; c.beginPath(); c.arc(64, 72, 30, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#000'; c.fillRect(50, 64, 6, 8); c.fillRect(72, 64, 6, 8); c.fillRect(54, 86, 20, 4);
    c.fillStyle = '#5a3a1a'; c.fillRect(34, 40, 60, 14);
    c.fillStyle = j.cor; c.fillRect(30, 104, 68, 80);
    c.fillStyle = '#234'; c.fillRect(36, 184, 24, 64); c.fillRect(68, 184, 24, 64);
    c.fillStyle = '#f2c79b'; c.fillRect(14, 108, 16, 60); c.fillRect(98, 108, 16, 60);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 5.2), new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, transparent: false }));
    J.cena.add(m); return m;
  }
  function tiraAvatar(id) { const a = S.avatares[id]; if (a) { J.cena && J.cena.remove(a); delete S.avatares[id]; } }
  J.ganchos.menu.push(() => { for (const id of Object.keys(S.avatares)) delete S.avatares[id]; if (S.papel) atualizaTela(); });

  /* ---------- telas ---------- */
  function atualizaTela() {
    const em = !!S.papel;
    $('mpInicio').hidden = em; $('mpSala').hidden = !em;
    if (!em) return;
    $('mpCodigo').textContent = S.codigo;
    $('mpLista').innerHTML = S.jogadores.map((j) => `<li style="color:${j.cor}">${j.nome}${j.id === (S.papel == 'host' ? 0 : S.eu) ? ' (você)' : ''}${j.id === 0 ? ' — anfitrião' : ''}</li>`).join('');
    $('mpComecar').hidden = S.papel != 'host';
    $('mpEspera').hidden = S.papel == 'host';
    $('jMulti').textContent = `Multiplayer (sala ${S.codigo})`;
  }
  try { const n = localStorage.getItem('baldiNome'); if (n) $('mpNome').value = n; } catch (e) {}
  $('mpNome').onchange = () => { try { localStorage.setItem('baldiNome', $('mpNome').value); } catch (e) {} };
  $('jMulti').onclick = () => { $('menu').hidden = true; $('telaMP').hidden = false; $('mpMsg').textContent = ''; atualizaTela(); };
  $('mpVolta').onclick = () => { $('telaMP').hidden = true; $('menu').hidden = false; };
  $('mpCriar').onclick = () => {
    if (!local() && !window.Peer) { $('mpMsg').textContent = 'Multiplayer indisponível.'; return; }
    $('mpMsg').textContent = 'Criando a sala...';
    criaSala((e) => { $('mpMsg').textContent = e ? 'Não deu para criar a sala (sem internet?).' : 'Passe o código para seus amigos.'; if (e) sai(); else atualizaTela(); });
  };
  $('mpEntrar').onclick = () => {
    const cod = $('mpCodigoIn').value.trim().toUpperCase();
    if (cod.length != 4) { $('mpMsg').textContent = 'Digite o código de 4 letras.'; return; }
    $('mpMsg').textContent = 'Entrando...';
    entraSala(cod, (e) => { $('mpMsg').textContent = e ? 'Não achei essa sala.' : 'Você entrou! Espere o anfitrião começar.'; if (e) sai(); else atualizaTela(); });
  };
  $('mpComecar').onclick = () => { $('telaMP').hidden = true; $('menu').hidden = false; $('mpAvisoMenu').hidden = false; };
  $('mpSair').onclick = () => { sai(); $('mpMsg').textContent = 'Você saiu da sala.'; };
  // no fim da partida o convidado espera o anfitrião (o "de novo" é dele)
  const denovo = $('denovo');
  new MutationObserver(() => { denovo.hidden = S.papel == 'cliente'; }).observe($('fim'), { attributes: true, attributeFilter: ['hidden'] });
  const paraMenu = $('paraMenu'), antigo = paraMenu.onclick;
  paraMenu.onclick = (e) => { if (S.papel == 'cliente') sai(); antigo && antigo.call(paraMenu, e); };
  // de volta ao menu sem estar numa sala: tudo como antes
  J.ganchos.menu.push(() => { if (!S.papel) { J.mpAtivo = false; J.semente = null; restauraOpcoes(); } $('mpAvisoMenu').hidden = S.papel != 'host'; });
})();
