// Mapa aleatório (recurso do Beta): monta uma escola nova a cada partida, no mesmo formato do escola.json.
// A escola é uma grade de quadrados de 10x10 (o tamanho dos da escola original):
// - corredores em linhas retas formando um anel e cruzamentos, com alguns trechos tirados para variar;
// - os quarteirões entre os corredores viram salas (de aula, professores, diretoria, cantina, biblioteca, depósito);
// - quatro saídas, uma em cada lado, e o jogador começa na saída sul, como no jogo original.
(function () {
  'use strict';
  const J = window.Jogo, M = window.Motor;
  const T = 10;
  const rnd = (a, b) => a + Math.random() * (b - a), rndInt = (a, b) => Math.floor(rnd(a, b + 1));
  const embaralha = (l) => { for (let i = l.length - 1; i > 0; i--) { const j = rndInt(0, i); [l[i], l[j]] = [l[j], l[i]]; } return l; };
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // linhas de corredor: as duas bordas do anel e algumas no meio, com pelo menos 6 quadrados entre elas
  function linhas(n) {
    for (let t = 0; t < 50; t++) {
      const l = [1, n - 2], k = rndInt(2, 3);
      for (let q = 0; q < k; q++) l.push(rndInt(6, n - 7));
      l.sort((a, b) => a - b);
      if (l.every((v, i) => !i || v - l[i - 1] >= 5)) return l;
    }
    return [1, Math.floor(n / 2), n - 2];
  }

  function planta(W, H) {
    // c[j][i]: 0 = maciço, 1 = corredor, 2 = quarteirão (vira sala)
    const c = Array.from({ length: H }, () => new Array(W).fill(0));
    const cols = linhas(W), rows = linhas(H);
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) c[j][i] = cols.includes(i) || rows.includes(j) ? 1 : 2;
    // tira alguns trechos de corredor entre dois cruzamentos (vira sala maior), sem desconectar nada
    const trechos = [];
    for (const i of cols) for (let r = 0; r < rows.length - 1; r++) trechos.push({ i, j0: rows[r] + 1, j1: rows[r + 1] - 1, vert: true });
    for (const j of rows) for (let q = 0; q < cols.length - 1; q++) trechos.push({ j, i0: cols[q] + 1, i1: cols[q + 1] - 1, vert: false });
    for (const t of embaralha(trechos)) {
      if (Math.random() < 0.7) continue;
      const borda = t.vert ? t.i == 1 || t.i == W - 2 : t.j == 1 || t.j == H - 2;
      if (borda) continue; // o anel fica inteiro
      const cel = t.vert ? Array.from({ length: t.j1 - t.j0 + 1 }, (_, k) => [t.i, t.j0 + k]) : Array.from({ length: t.i1 - t.i0 + 1 }, (_, k) => [t.i0 + k, t.j]);
      cel.forEach(([i, j]) => (c[j][i] = 2));
      if (!conectado(c, W, H)) cel.forEach(([i, j]) => (c[j][i] = 1));
    }
    return { c, cols, rows };
  }
  function conectado(c, W, H) {
    let ini = null, total = 0;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (c[j][i] == 1) { total++; ini = ini || [i, j]; }
    const visto = new Set([ini + '']), fila = [ini];
    while (fila.length) { const [i, j] = fila.pop(); for (const [di, dj] of D4) { const ni = i + di, nj = j + dj, k = ni + ',' + nj; if (c[nj]?.[ni] == 1 && !visto.has(k)) { visto.add(k); fila.push([ni, nj]); } } }
    return visto.size == total;
  }

  // quarteirões -> salas: corta retângulos grandes ao meio até ficarem com no máximo 7 quadrados de lado
  function salas(c, W, H) {
    const id = Array.from({ length: H }, () => new Array(W).fill(-1)), lista = [];
    const vistos = Array.from({ length: H }, () => new Array(W).fill(false));
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (c[j][i] != 2 || vistos[j][i]) continue;
      const comp = [], fila = [[i, j]]; vistos[j][i] = true;
      while (fila.length) { const [a, b] = fila.pop(); comp.push([a, b]); for (const [di, dj] of D4) { const ni = a + di, nj = b + dj; if (c[nj]?.[ni] == 2 && !vistos[nj][ni]) { vistos[nj][ni] = true; fila.push([ni, nj]); } } }
      const xs = comp.map((p) => p[0]), ys = comp.map((p) => p[1]);
      const r = { i0: Math.min(...xs), i1: Math.max(...xs), j0: Math.min(...ys), j1: Math.max(...ys) };
      const retangulo = (r.i1 - r.i0 + 1) * (r.j1 - r.j0 + 1) == comp.length;
      const partes = retangulo ? corta(r) : [{ cel: comp }];
      for (const p of partes) {
        const cel = p.cel || celulas(p);
        const s = { n: lista.length, cel, tipo: '' };
        cel.forEach(([a, b]) => (id[b][a] = s.n));
        lista.push(s);
      }
    }
    for (const s of lista) {
      const xs = s.cel.map((p) => p[0]), ys = s.cel.map((p) => p[1]);
      Object.assign(s, { i0: Math.min(...xs), i1: Math.max(...xs), j0: Math.min(...ys), j1: Math.max(...ys), area: s.cel.length });
    }
    return { id, lista };
  }
  const celulas = (r) => { const l = []; for (let j = r.j0; j <= r.j1; j++) for (let i = r.i0; i <= r.i1; i++) l.push([i, j]); return l; };
  function corta(r) {
    const w = r.i1 - r.i0 + 1, h = r.j1 - r.j0 + 1;
    if (w <= 6 && h <= 6 && (w * h <= 24 || Math.random() < 0.4)) return [r];
    if (w >= h && w >= 6) { const k = rndInt(r.i0 + 2, r.i1 - 3); return corta({ ...r, i1: k }).concat(corta({ ...r, i0: k + 1 })); }
    if (h >= 6) { const k = rndInt(r.j0 + 2, r.j1 - 3); return corta({ ...r, j1: k }).concat(corta({ ...r, j0: k + 1 })); }
    return [r];
  }

  // ---------- monta a escola ----------
  function gera(base, nCad) {
    for (let tent = 0; tent < 40; tent++) { const E = tenta(base, nCad); if (E) return E; }
    return null;
  }
  function tenta(base, nCad) {
    const W = 26 + rndInt(0, 6), H = 26 + rndInt(0, 6);
    const { c, cols, rows } = planta(W, H);
    const { id, lista } = salas(c, W, H);
    const ehCorr = (i, j) => c[j]?.[i] == 1;
    // centro de um quadrado em coordenadas do jogo (x cresce para a direita, z diminui para o norte)
    const cx = (i) => i * T + 5, cz = (j) => -(j * T + 5);

    // portas: cada sala abre para o corredor (de preferência no meio de uma parede)
    for (const s of lista) {
      const opc = [];
      for (const [i, j] of s.cel) for (const [di, dj] of D4) if (ehCorr(i + di, j + dj)) opc.push({ i, j, di, dj, meio: Math.abs(i - (s.i0 + s.i1) / 2) + Math.abs(j - (s.j0 + s.j1) / 2) });
      if (!opc.length) continue;
      opc.sort((a, b) => a.meio - b.meio);
      s.porta = opc[Math.min(opc.length - 1, rndInt(0, Math.min(2, opc.length - 1)))];
    }
    // salas sem corredor do lado ganham porta para a sala vizinha
    for (const s of lista) if (!s.porta) {
      for (const [i, j] of s.cel) for (const [di, dj] of D4) { const v = id[j + dj]?.[i + di]; if (v >= 0 && v != s.n && lista[v].porta && !s.porta) s.porta = { i, j, di, dj, vizinha: v }; }
    }
    if (lista.some((s) => !s.porta)) return null;

    // tipos de sala
    const livres = lista.slice().sort((a, b) => b.area - a.area);
    const pega = (filtro) => { const k = livres.findIndex(filtro); return k < 0 ? null : livres.splice(k, 1)[0]; };
    const cantina = pega((s) => s.area >= 20 && !s.porta.vizinha); if (cantina) cantina.tipo = 'cantina';
    const biblio = pega((s) => s.area >= 12 && !s.porta.vizinha); if (biblio) biblio.tipo = 'biblioteca';
    const sul = (s) => s.j0; // perto da entrada (j pequeno)
    const dir = livres.filter((s) => s.area >= 6 && s.area <= 25 && !s.porta.vizinha).sort((a, b) => sul(a) - sul(b))[1];
    if (!dir) return null;
    livres.splice(livres.indexOf(dir), 1); dir.tipo = 'diretoria';
    const peq = livres.filter((s) => s.area <= 12).sort((a, b) => a.area - b.area);
    for (const s of peq.slice(0, 2)) { s.tipo = 'deposito'; livres.splice(livres.indexOf(s), 1); }
    for (const s of livres.filter((s) => s.area >= 6 && s.area <= 20).slice(-2)) { s.tipo = 'professores'; livres.splice(livres.indexOf(s), 1); }
    for (const s of livres) s.tipo = 'aula';
    const aulas = lista.filter((s) => s.tipo == 'aula' && !s.porta.vizinha);
    if (aulas.length < nCad + 1) return null;

    // ---------- geometria ----------
    const E = { mats: base.mats, objs: [], portas: [], segs: [], caixas: [], gat: [], esp: [], spr: [], ronda: [], pontos: {} };
    const K = J.kit(E);
    const espaco = (i, j) => (c[j]?.[i] == 1 ? 'c' : id[j]?.[i] >= 0 ? 's' + id[j][i] : null);
    const PISO = { aula: 'Carpet', professores: 'Carpet', diretoria: 'Carpet', biblioteca: 'Carpet', cantina: 'TileFloor', deposito: 'TileFloor' };
    const saidas = escolheSaidas(c, W, H, cols, rows);
    const ehSaida = (i, j) => saidas.find((s) => s.i == i && s.j == j);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const e = espaco(i, j), sd = ehSaida(i, j);
      if (!e && !sd) continue;
      const pisoMat = sd || e == 'c' ? 'TileFloor' : PISO[lista[id[j][i]].tipo];
      E.objs.push({ m: 'quad', mat: [K.mi(pisoMat)], M: [0, 0, -T, 0, -T, 0, 0, 0, 0, 1, 0, 0, cx(i), 0, cz(j), 1] });
      E.objs.push({ m: 'quad', mat: [K.mi('Ceiling')], M: [T, 0, 0, 0, 0, 0, -T, 0, 0, -1, 0, 0, cx(i), 10, cz(j), 1] });
      if (sd) continue;
      // paredes: em cada lado onde o vizinho é outro espaço
      for (const [di, dj] of D4) {
        const v = espaco(i + di, j + dj);
        if (v === e || ehSaida(i + di, j + dj)) continue;
        const ex = cx(i) + di * 5, ez = cz(j) - dj * 5, n = [-di, dj]; // n aponta para dentro deste quadrado
        const doLado = v && (di > 0 || dj > 0); // parede entre dois espaços: faz uma vez só
        if (v && !doLado) continue;
        const pt = portaEm(lista, id, i, j, di, dj);
        if (pt) {
          const s = lista[pt.sala];
          const mat = s.tipo == 'professores' ? 'FacultyDoor_0' : 'Door_0';
          K.porta(ex, ez, n, mat, 'porta', 'Gerado/' + s.tipo);
        } else K.muro(ex, ez, T, n, 'WhiteBrickWall', !!v);
      }
    }
    // saídas: vestíbulo com a parede que sobe e desce, o gatilho e a placa de saída
    const nomes = ['EntranceSouth', 'EntranceNorth', 'EntranceWest', 'EntranceEast'];
    const placa = base.spr.find((s) => s.n == 'ExitSignSprite');
    saidas.forEach((sd, k) => {
      const nome = nomes[k], [di, dj] = sd.para; // para = direção de fora para dentro (até o corredor)
      const n = [-di, dj]; // olha para dentro do vestíbulo... (de fora para dentro em coordenadas do jogo)
      const bx = cx(sd.i) + di * 5, bz = cz(sd.j) - dj * 5; // borda entre o vestíbulo e o corredor
      K.muro(bx, bz, T, [di, -dj], 'WhiteBrickWall', true, { ent: nome, y: 15 });
      // paredes do vestíbulo: laterais e fundo
      for (const [ei, ej] of D4) {
        if (ei == di && ej == dj) continue;
        const wx = cx(sd.i) + ei * 5, wz = cz(sd.j) - ej * 5;
        K.muro(wx, wz, T, [-ei, ej], 'WhiteBrickWall');
      }
      const fx = cx(sd.i) - di * 5, fz = cz(sd.j) + dj * 5, ang = di ? Math.PI / 2 : 0;
      E.gat.push({ n: 'ExitTrigger', c: [fx, 5, fz], h: [5, 5, 0.5], ang });
      E.gat.push({ n: 'NearTrigger', c: [bx, 3, bz], h: [7.5, 2.5, 7.5], ang });
      E.esp.push({ s: 'EntranceScript', n: nome, pos: [bx, 0, bz] });
      if (placa) E.spr.push(Object.assign({}, placa, { M: placa.M.slice(0, 12).concat([bx + di * 2, 8.74, bz - dj * 2, 1]) }));
    });

    // ---------- conteúdo das salas ----------
    const reservado = new Set(); // quadrados que ficam livres (porta, caderno, ponto de ronda)
    const res = (i, j) => reservado.add(i + ',' + j);
    const livre = (i, j) => !reservado.has(i + ',' + j);
    for (const s of lista) { const p = s.porta; res(p.i, p.j); }
    const pontoSala = (s) => { const l = s.cel.filter(([i, j]) => !(i == s.porta.i && j == s.porta.j)); const q = l[rndInt(0, l.length - 1)] || [s.porta.i, s.porta.j]; res(q[0], q[1]); return q; };
    const nb = base.spr.find((s) => s.n == '_nbSprite');
    const cores = ['_nbBlue', '_nbRed', '_nbGreen', '_nbYellow', '_nbCyan', '_nbSalmon', '_nbBlack'];
    const cadernos = embaralha(aulas.slice()).slice(0, nCad);
    const rondaSala = [];
    cadernos.forEach((s, k) => {
      const q = pontoSala(s);
      E.spr.push(Object.assign({}, nb, { pai: 'Environment/Objects/Notebooks/Gerado' + k, tex: 'Texture2D/SchoolHouse/PickUps/Notebook/' + cores[k % cores.length] + '.png', M: nb.M.slice(0, 12).concat([cx(q[0]), nb.M[13], cz(q[1]), 1]) }));
    });
    for (const s of lista) { const q = pontoSala(s); rondaSala.push([cx(q[0]), cz(q[1])]); }
    // diretoria: o Diretor fica perto da porta (assim a porta dele é a mais perto), você fica lá dentro
    const pd = [dir.porta.i, dir.porta.j], fundo = dir.cel.reduce((a, b) => (Math.hypot(b[0] - pd[0], b[1] - pd[1]) > Math.hypot(a[0] - pd[0], a[1] - pd[1]) ? b : a));
    res(fundo[0], fundo[1]);
    E.pontos.principalDetentionPoint = [cx(pd[0]) - dir.porta.di * 2, 0, cz(pd[1]) + dir.porta.dj * 2];
    E.pontos.playerDetentionPoint = [cx(fundo[0]), 0, cz(fundo[1])];
    E.gat.push(gatSala('Office Trigger', dir, cx, cz));
    lista.filter((s) => s.tipo == 'professores').forEach((s, k) => E.gat.push(gatSala('_FacultyTrigger' + (k ? ` (${k})` : ''), s, cx, cz)));
    for (const s of lista) mobilia(K, s, cx, cz, livre, res);

    // ---------- corredores: ronda, armários, cartazes, plantas, portas vai-e-vem ----------
    const corr = [];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (c[j][i] == 1) corr.push([i, j]);
    const cruz = corr.filter(([i, j]) => D4.filter(([di, dj]) => ehCorr(i + di, j + dj)).length >= 3);
    const pontosCorr = embaralha(cruz.concat(corr.filter(() => Math.random() < 0.08))).map(([i, j]) => [cx(i), cz(j)]);
    while (pontosCorr.length < 16) pontosCorr.push(pontosCorr[pontosCorr.length % Math.max(1, pontosCorr.length)]);
    E.ronda = pontosCorr.slice(0, 16).concat(rondaSala);
    E.rondaCorr = pontosCorr.slice(16);
    enfeitaCorredores(K, c, W, H, id, lista, cx, cz, ehSaida, base);

    // ---------- jogador, personagens e itens ----------
    const sul0 = saidas[0];
    const ini = [cx(sul0.i), cz(sul0.j)];
    E.esp.push({ s: 'PlayerScript', n: 'Player', pos: [ini[0], 4, ini[1]] });
    const longe = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const corrLonge = (d) => { const l = pontosCorr.filter((p) => longe(p, ini) > d); return l[rndInt(0, l.length - 1)] || pontosCorr[0]; };
    const coloca = (nome, pos, y = 2) => {
      E.esp.push({ s: 'NPC', n: nome, pos: [pos[0], y, pos[1]] });
      const sp = base.spr.find((s) => s.pai.startsWith('NPC/' + nome) && s.n != 'New Sprite');
      if (sp) E.spr.push(Object.assign({}, sp, { M: sp.M.slice(0, 12).concat([pos[0], sp.M[13], pos[1], 1]) }));
    };
    coloca('Baldi', corrLonge(60));
    coloca('Principal of the Thing', [E.pontos.principalDetentionPoint[0], E.pontos.principalDetentionPoint[2]]);
    coloca('Playtime', corrLonge(50));
    const dep = lista.find((s) => s.tipo == 'deposito') || lista[0];
    coloca('Gotta Sweep', rondaSala[dep.n]);
    coloca('Arts and Crafters', rondaSala[cadernos[cadernos.length - 1].n]);
    coloca('1st Prize', corrLonge(70));
    coloca('Its a Bully', [ini[0], ini[1]], -20);
    // Baldi do tutorial acenando logo na entrada
    const tut = base.spr.find((s) => s.pai.startsWith('NPC/TutorBaldi'));
    const frente = [cx(sul0.i + sul0.para[0] * 2), cz(sul0.j + sul0.para[1] * 2)];
    if (tut) E.spr.push(Object.assign({}, tut, { M: tut.M.slice(0, 12).concat([frente[0] + 3, tut.M[13], frente[1], 1]) }));
    E.pontos.playerTeleportPoint = [ini[0], 0, ini[1] - 12];
    const bt = corrLonge(80); E.pontos.baldiTeleportPoint = [bt[0], 0, bt[1]];
    // itens espalhados (em salas e corredores)
    const item = base.spr.find((s) => s.pai.endsWith('Pickup_Quarter'));
    const ITENS = ['EnergyFlavoredZestyBar', 'YellowDoorLock', 'Key', 'BSODA', 'Quarter', 'Tape', 'AlarmClock', 'WD-3D', 'SafetyScissors', 'BigBoots', 'Quarter', 'BSODA', 'EnergyFlavoredZestyBar', 'Quarter'];
    const TEX = { AlarmClock: 'AlarmClockItem', 'WD-3D': 'wd_nosquee', BigBoots: 'BootsIcon' };
    const lugares = embaralha(lista.map((s) => s).filter((s) => s.tipo != 'diretoria'));
    ITENS.forEach((n, k) => {
      const s = lugares[k % lugares.length], cand = s.cel.filter(([i, j]) => livre(i, j));
      const q = cand.length ? cand[rndInt(0, cand.length - 1)] : s.cel[0]; res(q[0], q[1]);
      E.spr.push(Object.assign({}, item, { a: 1, pai: 'Environment/Objects/Pickups/Pickup_' + n, tex: 'Texture2D/SchoolHouse/PickUps/' + (TEX[n] || n) + '.png', M: item.M.slice(0, 12).concat([cx(q[0]) + rnd(-2, 2), item.M[13], cz(q[1]) + rnd(-2, 2), 1]) }));
    });
    E.totalCadernos = nCad;
    E.gerado = { W, H };
    return E;
  }

  // porta neste lado do quadrado? (a porta de uma sala fica no quadrado s.porta, virada para di,dj)
  function portaEm(lista, id, i, j, di, dj) {
    const a = id[j]?.[i], b = id[j + dj]?.[i + di];
    for (const v of [a, b]) {
      if (v == null || v < 0) continue;
      const p = lista[v].porta;
      if (!p) continue;
      if (v === a && p.i == i && p.j == j && p.di == di && p.dj == dj) return { sala: v };
      if (v === b && p.i == i + di && p.j == j + dj && p.di == -di && p.dj == -dj) return { sala: v };
    }
    return null;
  }
  const gatSala = (n, s, cx, cz) => {
    const x0 = cx(s.i0) - 5, x1 = cx(s.i1) + 5, z0 = cz(s.j0) + 5, z1 = cz(s.j1) - 5;
    return { n, c: [(x0 + x1) / 2, 5, (z0 + z1) / 2], h: [(x1 - x0) / 2, 5, Math.abs(z1 - z0) / 2], ang: 0 };
  };

  // uma saída em cada lado, no fim de um corredor que encosta na borda do anel
  function escolheSaidas(c, W, H, cols, rows) {
    const mid = (l) => l.filter((v) => v > 1 && v < l[l.length - 1]);
    const pick = (l, def) => { const m = mid(l); return m.length ? m[rndInt(0, m.length - 1)] : def; };
    const ci = pick(cols, Math.floor(W / 2)), cn = pick(cols, Math.floor(W / 2)), rw = pick(rows, Math.floor(H / 2)), re = pick(rows, Math.floor(H / 2));
    // para = direção de dentro do vestíbulo até o corredor (em i,j)
    return [{ i: ci, j: 0, para: [0, 1] }, { i: cn, j: H - 1, para: [0, -1] }, { i: 0, j: rw, para: [1, 0] }, { i: W - 1, j: re, para: [-1, 0] }];
  }

  // móveis de cada tipo de sala
  function mobilia(K, s, cx, cz, livre, res) {
    const p = s.porta, X = (i) => cx(i), Z = (j) => cz(j);
    // parede do fundo (oposta à porta) e para onde ela olha
    const nPorta = [-p.di, p.dj]; // olha da porta para dentro da sala... (em x,z)
    const meioI = (s.i0 + s.i1) / 2, meioJ = (s.j0 + s.j1) / 2;
    const paredeFundo = () => {
      // quadrado no lado oposto da porta
      if (p.di) { const i = p.di > 0 ? s.i0 : s.i1, j = Math.round(meioJ); return { x: X(i) - p.di * 5, z: Z(j), n: [p.di, 0], i, j }; }
      const j = p.dj > 0 ? s.j0 : s.j1, i = Math.round(meioI); return { x: X(i), z: Z(j) + p.dj * 5, n: [0, -p.dj], i, j };
    };
    const lados = () => {
      // paredes laterais livres da sala (para cartazes e janelas)
      const l = [];
      for (const [i, j] of s.cel) for (const [di, dj] of D4) {
        const v = [i + di, j + dj];
        if (s.cel.some((q) => q[0] == v[0] && q[1] == v[1])) continue;
        if (i == p.i && j == p.j && di == p.di && dj == p.dj) continue;
        l.push({ x: X(i) + di * 5, z: Z(j) - dj * 5, n: [-di, dj] });
      }
      return embaralha(l);
    };
    const parede = lados();
    const POST = ['SchoolRulesPoster', 'BootsPoster', 'ScissorsPoster', 'WD_NoSqueePoster', 'PhonePoster', 'recyclefood', 'what', 'SchoolAttention'];
    const QUADROS = ['Math', 'world', 'Lore', 99, 'Cheese', 'Homestar', 'dab', 'g', 'wow', 'sorry'];
    const cartaz = (k) => { const w = parede.pop(); if (w) K.naParede(POST[k % POST.length], w.x, w.z, w.n); };
    const cantos = s.cel.filter(([i, j]) => livre(i, j));
    if (s.tipo == 'aula') {
      const f = paredeFundo(); K.naParede(QUADROS[rndInt(0, QUADROS.length - 1)], f.x, f.z, f.n);
      // uma carteira por quadrado, virada para o quadro, com a cadeira atrás; a fileira do quadro fica livre
      const a = K.virado(f.n);
      const w = s.i1 - s.i0 + 1, h = s.j1 - s.j0 + 1;
      for (const [i, j] of s.cel) {
        if (!livre(i, j) || (f.n[0] ? i == f.i : j == f.j)) continue;
        // deixa um corredor livre em volta (nas salas maiores) e no máximo 4 fileiras
        if ((w > 3 && (i == s.i0 || i == s.i1)) || (h > 3 && (j == s.j0 || j == s.j1))) continue;
        if (Math.abs(f.n[0] ? i - f.i : j - f.j) > 4) continue;
        const x = X(i), z = Z(j);
        K.movel('carteira', x, z, a); K.movel('cadeira', x + f.n[0] * 3, z + f.n[1] * 3, a);
        if (Math.random() < 0.4) K.enfeite(['Notebooks', 'pencils', 'papers'][rndInt(0, 2)], x, z, 4.4, 0.7);
      }
      K.movel('mesaProf', f.x + f.n[0] * 4 + (f.n[1] ? 6 : 0), f.z + f.n[1] * 4 + (f.n[0] ? 6 : 0), f.n[0] ? 0 : Math.PI / 2);
      cartaz(rndInt(0, 7)); cartaz(rndInt(0, 7));
      if (Math.random() < 0.6) { const w = parede.pop(); if (w) K.naParede('Window', w.x, w.z, w.n); }
      const c0 = cantos[0]; if (c0) K.enfeite('Plant', X(c0[0]) + 3, Z(c0[1]) + 3);
    } else if (s.tipo == 'professores') {
      const m = s.cel.find(([i, j]) => livre(i, j));
      if (m) { const x = X(m[0]), z = Z(m[1]); res(m[0], m[1]); K.movel('mesaLonga', x, z, s.i1 - s.i0 >= s.j1 - s.j0 ? 0 : Math.PI / 2); for (const d of [-6, 0, 6]) K.enfeite('food', x + (s.i1 - s.i0 >= s.j1 - s.j0 ? d : 0), z + (s.i1 - s.i0 >= s.j1 - s.j0 ? 0 : d), 4.2); }
      const w = parede.pop(); if (w) K.maquina(Math.random() < 0.5 ? 'BSODAMachine' : 'ZestyMachine', w.x + w.n[0] * 1.2, w.z + w.n[1] * 1.2, w.n);
      for (const n of ['PRI_Poster', 'Baldi_Poster', 'Prize_Poster', 'Sweep_Poster', 'Playtime_Poster', 'Bully_Poster', 'Crafters_Poster']) { const q = parede.pop(); if (q && Math.random() < 0.5) K.naParede(n, q.x, q.z, q.n); }
    } else if (s.tipo == 'diretoria') {
      const f = paredeFundo(); K.naParede('PRI_Poster', f.x, f.z, f.n);
      for (const n of ['Baldi_Poster', 'Sweep_Poster', 'Playtime_Poster', 'Prize_Poster', 'Bully_Poster', 'Crafters_Poster']) { const q = parede.pop(); if (q) K.naParede(n, q.x, q.z, q.n); }
    } else if (s.tipo == 'cantina') {
      for (const [i, j] of s.cel) if (livre(i, j) && (s.i1 - s.i0 >= s.j1 - s.j0 ? (i - s.i0) % 2 == 1 && j > s.j0 && j < s.j1 : (j - s.j0) % 2 == 1 && i > s.i0 && i < s.i1)) {
        const hor = s.i1 - s.i0 < s.j1 - s.j0; // mesas compridas atravessadas
        K.movel('mesaLonga', X(i), Z(j), hor ? 0 : Math.PI / 2); res(i, j);
        K.enfeite('food', X(i), Z(j), 4.2);
      }
      for (const n of ['BSODAMachine', 'ZestyMachine']) { const w = parede.pop(); if (w) K.maquina(n, w.x + w.n[0] * 1.2, w.z + w.n[1] * 1.2, w.n); }
      cartaz(5);
    } else if (s.tipo == 'biblioteca') {
      for (let k = 0; k < Math.min(6, parede.length); k++) { const w = parede.pop(); K.estante(w.x + w.n[0], w.z + w.n[1], w.n, 8); }
      const m = s.cel.find(([i, j]) => livre(i, j) && i > s.i0 && i < s.i1 && j > s.j0 && j < s.j1);
      if (m) { res(m[0], m[1]); K.movel('mesaLonga', X(m[0]), Z(m[1]), 0); K.enfeite('Notebooks', X(m[0]), Z(m[1]), 4.4, 0.7); }
      K.enfeite('Globe', X(s.i1) + 2, Z(s.j1) - 2);
    } else if (s.tipo == 'deposito') {
      for (let k = 0; k < Math.min(3, parede.length); k++) { const w = parede.pop(); K.armarios(w.x - Math.abs(w.n[1]) * 4, w.z - Math.abs(w.n[0]) * 4, w.x + Math.abs(w.n[1]) * 4, w.z + Math.abs(w.n[0]) * 4, w.n); }
      for (const [i, j] of s.cel) if (livre(i, j) && Math.random() < 0.5) K.caixote(X(i) + rnd(-2, 2), Z(j) + rnd(-2, 2), rnd(2, 3.2));
    }
  }

  function enfeitaCorredores(K, c, W, H, id, lista, cx, cz, ehSaida, base) {
    const ehCorr = (i, j) => c[j]?.[i] == 1;
    const POST = ['SchoolRulesPoster', 'SchoolAttention', 'BootsPoster', 'WD_NoSqueePoster', 'PhonePoster', 'ScissorsPoster', 'recyclefood', 'what', 'comic00', 'comic01'];
    let vaivem = 0;
    const copia = c.map((l) => l.slice()); // para conferir que os corredores continuam ligados sem as vai-e-vem
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (!ehCorr(i, j)) continue;
      const viz = D4.filter(([di, dj]) => ehCorr(i + di, j + dj));
      const reto = viz.length == 2 && viz[0][0] == -viz[1][0] && viz[0][1] == -viz[1][1];
      // porta vai-e-vem no meio de trechos retos, de vez em quando
      // (elas ficam trancadas até o 2º caderno: não podem separar nenhum pedaço da escola)
      if (reto && vaivem < 6 && Math.random() < 0.03 && !D4.some(([di, dj]) => ehSaida(i + di, j + dj)) && ((copia[j][i] = 3), conectado(copia, W, H) || ((copia[j][i] = 1), false))) {
        const [di, dj] = viz[0];
        K.porta(cx(i), cz(j), [di, -dj], 'SwingDoor0', 'vaivem', 'Gerado/vaivem'); // atravessada no corredor
        vaivem++;
        continue;
      }
      for (const [di, dj] of D4) {
        if (ehCorr(i + di, j + dj) || ehSaida(i + di, j + dj)) continue;
        const temPorta = (() => { const v = id[j + dj]?.[i + di]; if (v == null || v < 0) return false; const p = lista[v].porta; return p.i == i + di && p.j == j + dj && p.di == -di && p.dj == -dj; })();
        if (temPorta) continue;
        const x = cx(i) + di * 5, z = cz(j) - dj * 5, n = [-di, dj], r = Math.random();
        if (r < 0.22) K.armarios(x - Math.abs(n[1]) * 4, z - Math.abs(n[0]) * 4, x + Math.abs(n[1]) * 4, z + Math.abs(n[0]) * 4, n);
        else if (r < 0.32) K.naParede(POST[rndInt(0, POST.length - 1)], x, z, n);
        else if (r < 0.40 && c[j + dj]?.[i + di] === 0) K.naParede('Window', x, z, n);
        else if (r < 0.43) K.enfeite('Plant', x + n[0] * 1.5, z + n[1] * 1.5);
      }
    }
  }

  J.geraMapa = gera;
  // no Beta, com o recurso ligado, troca a escola original por uma gerada
  J.ganchos.monta.unshift((E, _J, modo) => {
    if (modo != 'beta' || !(J.betaFeat && J.betaFeat.mapa)) return;
    const novo = gera(J.Ebase, 7);
    if (!novo) return;
    for (const k of Object.keys(E)) delete E[k];
    Object.assign(E, novo);
  });
})();
