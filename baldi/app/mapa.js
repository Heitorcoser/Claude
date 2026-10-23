// Mapa aleatório (recurso do Beta): monta uma escola nova a cada partida, no mesmo formato do escola.json.
// A escola é montada com CHUNKS prontos: pedaços de 9x9 quadrados (de 10x10, o tamanho dos da escola original)
// desenhados à mão, com salas e corredores já arrumados. Cada chunk tem saídas de corredor no meio dos lados
// (norte, sul, oeste, leste). O gerador faz uma grade de chunks ligados entre si (uma árvore com alguns laços),
// e para cada lugar escolhe um chunk (girado ou espelhado) cujas saídas batem com os vizinhos.
// Depois: portas, tipos de sala, móveis, enfeites, quatro saídas da escola, personagens e itens.
(function () {
  'use strict';
  const J = window.Jogo, M = window.Motor;
  const T = 10, C = 9, MEIO = 4;
  const rnd = (a, b) => a + Math.random() * (b - a), rndInt = (a, b) => Math.floor(rnd(a, b + 1));
  const embaralha = (l) => { for (let i = l.length - 1; i > 0; i--) { const j = rndInt(0, i); [l[i], l[j]] = [l[j], l[i]]; } return l; };
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  /* ---------- chunks prontos ----------
     c = corredor, p = praça (corredor largo), . = maciço
     a A e E g = salas de aula (letras diferentes = salas diferentes)
     s S t T = salas especiais (viram diretoria, professores, clínica do Dr. Reflex ou depósito)
     k = cantina, b = biblioteca */
  const CHUNKS = [
    { nome: 'cruzamento', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'ccccccccc', 'eeeecEEEE', 'eeeecEEEE', 'eeeecEEEE', 'eeeecEEEE'] },
    { nome: 'pátio', l: ['aaaacbbbb', 'aaaacbbbb', 'aaaacbbbb', 'aaapppbbb', 'ccccpcccc', 'ssspppkkk', 'SSSSckkkk', 'SSSSckkkk', 'SSSSckkkk'] },
    { nome: 'anel', l: ['aaaacAAAA', 'aaaacAAAA', 'aacccccAA', 'aacssscAA', 'cccssscc' + 'c', 'eecssscEE', 'eecccccEE', 'eeeecEEEE', 'eeeecEEEE'] },
    { nome: 'tê', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'eeeeccccc', 'eeeecSSSS', 'eeeecSSSS', 'eeeecSSSS', 'eeeecSSSS'] },
    { nome: 'cantina', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'ccccccccc', 'kkkkkkkkk', 'kkkkkkkkk', 'kkkkkkkkk', 'kkkkkkkkk'] },
    { nome: 'biblioteca', l: ['bbbbbssSS', 'bbbbbssSS', 'bbbbbssSS', 'bbbbbssSS', 'ccccccccc', 'aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA'] },
    { nome: 'curva', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'eeeeccccc', 'eeeebbbbb', 'eeeebbbbb', 'eeeebbbbb', 'eeeebbbbb'] },
    { nome: 'curva com praça', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'ssspppAAA', 'ssspccccc', 'SSSpppeee', 'SSSSeeeee', 'SSSSeeeee', 'SSSSeeeee'] },
    { nome: 'reto', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'eeeecEEEE', 'eeeecEEEE', 'eeeecEEEE', 'sssscSSSS', 'sssscSSSS'] },
    { nome: 'reto com praça', l: ['aaaacAAAA', 'aaaacAAAA', 'aaapppAAA', 'ssspppSSS', 'ssspppSSS', 'eeepppEEE', 'eeeecEEEE', 'eeeecEEEE', 'eeeecEEEE'] },
    { nome: 'fim com cantina', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'ssspppSSS', 'kkkkkkkkk', 'kkkkkkkkk', 'kkkkkkkkk', 'kkkkkkkkk', 'kkkkkkkkk'] },
    { nome: 'fim com salas', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'eeeecEEEE', 'eeeecEEEE', 'eeeecEEEE', 'sssssssss', 'sssssssss'] },
    { nome: 'átrio', l: ['aaaacAAAA', 'aaaacAAAA', 'aapppppAA', 'aapppppAA', 'ccpppppcc', 'eepppppEE', 'eepppppEE', 'eeeecEEEE', 'eeeecEEEE'] },
    { nome: 'escritórios', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'sssscSSSS', 'ttttcTTTT', 'eeeecEEEE', 'eeeecEEEE', 'eeeecEEEE', 'eeeecEEEE'] },
    { nome: 'volta', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'eeeecAAAA', 'eeeecSScc', 'eeeecSScE', 'eeeeccccE', 'eeeeeEEEE', 'eeeeeEEEE'] },
    { nome: 'fim com biblioteca', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'ssspppSSS', 'bbbbbbbbb', 'bbbbbbbbb', 'bbbbbbbbb', 'bbbbbbbbb', 'bbbbbbbbb'] },
    { nome: 'tê com praça', l: ['aaaacAAAA', 'aaaacAAAA', 'aaaacAAAA', 'aaapppAAA', 'cccpppccc', 'eeepppEEE', 'eeeeEEEEE', 'eeeeEEEEE', 'eeeeEEEEE'] },
  ];
  const corr = (ch) => ch == 'c' || ch == 'p';
  // giros e espelhos de cada chunk, com a máscara das saídas (1 = norte/j-, 2 = leste/i+, 4 = sul/j+, 8 = oeste/i-)
  const gira = (l) => Array.from({ length: C }, (_, r) => Array.from({ length: C }, (_, c) => l[C - 1 - c][r]).join(''));
  const espelha = (l) => l.map((r) => r.split('').reverse().join(''));
  const mascara = (l) => (corr(l[0][MEIO]) ? 1 : 0) | (corr(l[MEIO][C - 1]) ? 2 : 0) | (corr(l[C - 1][MEIO]) ? 4 : 0) | (corr(l[MEIO][0]) ? 8 : 0);
  const VARIANTES = [];
  for (const ch of CHUNKS) {
    let l = ch.l, vistos = new Set();
    for (const esp of [false, true]) {
      let v = esp ? espelha(l) : l;
      for (let g = 0; g < 4; g++) { const k = v.join('/'); if (!vistos.has(k)) { vistos.add(k); VARIANTES.push({ nome: ch.nome, l: v, m: mascara(v) }); } v = gira(v); }
    }
  }

  // grade de chunks ligados: árvore aleatória + alguns laços (para dar caminhos alternativos)
  function ligacoes(GW, GH) {
    const m = Array.from({ length: GH }, () => new Array(GW).fill(0));
    const BIT = { '0,-1': 1, '1,0': 2, '0,1': 4, '-1,0': 8 }, OPOSTO = { 1: 4, 4: 1, 2: 8, 8: 2 };
    const liga = (x, y, dx, dy) => { const b = BIT[dx + ',' + dy]; m[y][x] |= b; m[y + dy][x + dx] |= OPOSTO[b]; };
    const visto = new Set(['0,0']), pilha = [[rndInt(0, GW - 1), rndInt(0, GH - 1)]];
    visto.clear(); visto.add(pilha[0] + '');
    while (pilha.length) {
      const [x, y] = pilha[pilha.length - 1];
      const viz = embaralha(D4.slice()).filter(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < GW && y + dy < GH && !visto.has([x + dx, y + dy] + ''));
      if (!viz.length) { pilha.pop(); continue; }
      const [dx, dy] = viz[0]; liga(x, y, dx, dy); visto.add([x + dx, y + dy] + ''); pilha.push([x + dx, y + dy]);
    }
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) if (x + dx < GW && y + dy < GH && Math.random() < 0.4) liga(x, y, dx, dy);
    return m;
  }

  // monta a planta: c[j][i] 0 = maciço, 1 = corredor, 2 = sala; id[j][i] = número da sala
  function montaChunks() {
    const GW = rndInt(3, 4), GH = rndInt(3, 4), W = GW * C + 2, H = GH * C + 2;
    const m = ligacoes(GW, GH);
    // saídas da escola: uma em cada lado, num chunk da borda (sul = j pequeno, onde o jogador começa)
    const saidas = [];
    const sx = rndInt(0, GW - 1), nx = rndInt(0, GW - 1), wy = rndInt(0, GH - 1), ey = rndInt(0, GH - 1);
    m[0][sx] |= 1; m[GH - 1][nx] |= 4; m[wy][0] |= 8; m[ey][GW - 1] |= 2;
    saidas.push({ i: 1 + sx * C + MEIO, j: 0, para: [0, 1] }, { i: 1 + nx * C + MEIO, j: H - 1, para: [0, -1] }, { i: 0, j: 1 + wy * C + MEIO, para: [1, 0] }, { i: W - 1, j: 1 + ey * C + MEIO, para: [-1, 0] });
    const c = Array.from({ length: H }, () => new Array(W).fill(0)), id = Array.from({ length: H }, () => new Array(W).fill(-1));
    const praca = new Set(), lista = [], porLetra = {};
    const usados = {};
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      let op = VARIANTES.filter((v) => v.m === m[y][x]);
      // o chunk da entrada (como no mapa clássico) precisa ter pelo menos 2 salas de aula para os 2 primeiros cadernos
      if (x == sx && y == 0) op = op.filter((v) => aulasNoChunk(v.l) >= 2);
      // evita repetir o mesmo chunk muitas vezes
      op.sort((a, b) => (usados[a.nome] || 0) - (usados[b.nome] || 0) + rnd(-0.8, 0.8));
      const v = op[0]; usados[v.nome] = (usados[v.nome] || 0) + 1;
      for (let r = 0; r < C; r++) for (let q = 0; q < C; q++) {
        const ch = v.l[r][q], i = 1 + x * C + q, j = 1 + y * C + r;
        if (corr(ch)) { c[j][i] = 1; if (ch == 'p') praca.add(i + ',' + j); }
        else if (ch != '.') {
          c[j][i] = 2;
          const k = x + ',' + y + ',' + ch;
          if (porLetra[k] === undefined) { porLetra[k] = lista.length; lista.push({ n: lista.length, cel: [], letra: ch, chunk: v.nome }); }
          id[j][i] = porLetra[k]; lista[porLetra[k]].cel.push([i, j]);
        }
      }
    }
    // a mesma letra num chunk pode ter virado dois pedaços separados: separa em salas diferentes
    for (const s of lista.slice()) {
      const resto = new Set(s.cel.map((q) => q + '')), partes = [];
      while (resto.size) {
        const ini = [...resto][0].split(',').map(Number), comp = [ini], fila = [ini]; resto.delete(ini + '');
        while (fila.length) { const [a, b] = fila.pop(); for (const [di, dj] of D4) { const k = [a + di, b + dj] + ''; if (resto.has(k)) { resto.delete(k); comp.push([a + di, b + dj]); fila.push([a + di, b + dj]); } } }
        partes.push(comp);
      }
      s.cel = partes[0];
      for (const p of partes.slice(1)) { const n = { n: lista.length, cel: p, letra: s.letra, chunk: s.chunk }; lista.push(n); p.forEach(([i, j]) => (id[j][i] = n.n)); }
    }
    for (const s of lista) {
      const xs = s.cel.map((p) => p[0]), ys = s.cel.map((p) => p[1]);
      Object.assign(s, { i0: Math.min(...xs), i1: Math.max(...xs), j0: Math.min(...ys), j1: Math.max(...ys), area: s.cel.length });
    }
    // portas amarelas: em toda saída de corredor do chunk da entrada (menos a da escola), trancadas até o 2º caderno
    const portoes = [];
    const ox = 1 + sx * C, oy = 1;
    if (m[0][sx] & 2) portoes.push({ i: ox + C - 1, j: oy + MEIO, n: [1, 0] });
    if (m[0][sx] & 8) portoes.push({ i: ox, j: oy + MEIO, n: [1, 0] });
    if (m[0][sx] & 4) portoes.push({ i: ox + MEIO, j: oy + C - 1, n: [0, 1] });
    const zona = { i0: ox, i1: ox + C - 1, j0: oy, j1: oy + C - 1 };
    return { c, id, lista, saidas, praca, W, H, portoes, zona };
  }
  // quantas salas de aula (letras de aula com pelo menos 6 quadrados) tem um chunk
  function aulasNoChunk(l) {
    const n = {};
    for (const r of l) for (const ch of r) if ('aAeEgG'.includes(ch)) n[ch] = (n[ch] || 0) + 1;
    return Object.values(n).filter((k) => k >= 6).length;
  }
  function conectado(c, W, H) {
    let ini = null, total = 0;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (c[j][i] == 1) { total++; ini = ini || [i, j]; }
    const visto = new Set([ini + '']), fila = [ini];
    while (fila.length) { const [i, j] = fila.pop(); for (const [di, dj] of D4) { const ni = i + di, nj = j + dj, k = ni + ',' + nj; if (c[nj]?.[ni] == 1 && !visto.has(k)) { visto.add(k); fila.push([ni, nj]); } } }
    return visto.size == total;
  }

  // ---------- monta a escola ----------
  function gera(base, nCad) {
    for (let tent = 0; tent < 40; tent++) { const E = tenta(base, nCad); if (E) return E; }
    return null;
  }
  function tenta(base, nCad) {
    const { c, id, lista, saidas, praca, W, H, portoes, zona } = montaChunks();
    const naZona = (s) => s.cel.every(([i, j]) => i >= zona.i0 && i <= zona.i1 && j >= zona.j0 && j <= zona.j1);
    const ehCorr = (i, j) => c[j]?.[i] == 1;
    // centro de um quadrado em coordenadas do jogo (x cresce para a direita, z diminui para o norte)
    const cx = (i) => i * T + 5, cz = (j) => -(j * T + 5);

    // portas: cada sala abre para o corredor (de preferência no meio de uma parede)
    for (const s of lista) {
      const opc = [];
      for (const [i, j] of s.cel) for (const [di, dj] of D4) if (ehCorr(i + di, j + dj)) opc.push({ i, j, di, dj, meio: Math.abs(i - (s.i0 + s.i1) / 2) + Math.abs(j - (s.j0 + s.j1) / 2) });
      if (!opc.length) continue;
      opc.sort((a, b) => a.meio - b.meio);
      s.porta = opc[Math.min(opc.length - 1, rndInt(0, Math.min(1, opc.length - 1)))];
    }
    // salas sem corredor do lado ganham porta para a sala vizinha
    for (const s of lista) if (!s.porta) {
      for (const [i, j] of s.cel) for (const [di, dj] of D4) { const v = id[j + dj]?.[i + di]; if (v >= 0 && v != s.n && lista[v].porta && !s.porta) s.porta = { i, j, di, dj, vizinha: v }; }
    }
    if (lista.some((s) => !s.porta)) return null;

    // tipos de sala: vêm das letras do chunk; as especiais viram diretoria (perto da entrada), professores, clínica e depósito
    const ini0 = saidas[0];
    const longeIni = (s) => Math.hypot((s.i0 + s.i1) / 2 - ini0.i, (s.j0 + s.j1) / 2 - ini0.j);
    for (const s of lista) s.tipo = 'aeEgGA'.includes(s.letra) ? 'aula' : s.letra == 'k' ? 'cantina' : s.letra == 'b' ? 'biblioteca' : 'especial';
    // salas de 1 quadrado de largura ou muito pequenas não servem de sala de aula
    for (const s of lista) if (s.tipo == 'aula' && (s.area < 6 || s.i1 == s.i0 || s.j1 == s.j0)) s.tipo = 'especial';
    // no máximo uma cantina e uma biblioteca grandes; o resto vira sala de aula
    for (const t of ['cantina', 'biblioteca']) lista.filter((s) => s.tipo == t).sort((a, b) => b.area - a.area).slice(1).forEach((s) => (s.tipo = 'aula'));
    const esp = lista.filter((s) => s.tipo == 'especial' && !s.porta.vizinha).sort((a, b) => longeIni(a) - longeIni(b));
    const dir = esp.find((s) => s.area >= 4 && s.area <= 25);
    if (!dir) return null;
    dir.tipo = 'diretoria';
    const resto = esp.filter((s) => s !== dir);
    const clin = resto.filter((s) => s.area >= 4).sort((a, b) => longeIni(b) - longeIni(a))[0];
    if (clin) clin.tipo = 'clinica';
    resto.filter((s) => s.tipo == 'especial' && s.area >= 4).slice(0, 2).forEach((s) => (s.tipo = 'professores'));
    lista.filter((s) => s.tipo == 'especial').forEach((s) => (s.tipo = 'deposito'));
    const aulas = lista.filter((s) => s.tipo == 'aula' && !s.porta.vizinha);
    if (aulas.length < nCad + 1) return null;
    // 2 cadernos na área da entrada (antes das portas amarelas) e o resto no resto da escola, como no mapa clássico
    const aulasZona = embaralha(aulas.filter(naZona)), aulasFora = embaralha(aulas.filter((s) => !naZona(s)));
    if (aulasZona.length < 2 || aulasFora.length < nCad - 2) return null;
    const cadernos = aulasZona.slice(0, 2).concat(aulasFora.slice(0, nCad - 2));
    // Só tem porta onde vale a pena entrar: salas com caderno, diretoria, professores, clínica do Dr. Reflex
    // e o armário do Gotta Sweep. Cantina e biblioteca ficam abertas (sem porta). As outras salas viram parede.
    const F = J.F || {};
    const sweepSala = lista.find((s) => s.tipo == 'deposito' && !s.porta.vizinha);
    for (const s of lista) {
      if (s.tipo == 'cantina' || s.tipo == 'biblioteca') s.aberta = true;
      const fica = cadernos.includes(s) || s.aberta || s === sweepSala || s.tipo == 'diretoria' || s.tipo == 'professores' || (s.tipo == 'clinica' && F.reflex);
      if (!fica) s.fechada = true;
    }
    for (const s of lista) if (!s.fechada && s.porta.vizinha != null && lista[s.porta.vizinha].fechada) s.fechada = true;
    if (cadernos.some((s) => s.fechada) || dir.fechada) return null;
    for (const s of lista) if (s.fechada) for (const [i, j] of s.cel) { c[j][i] = 0; id[j][i] = -1; }
    const abertas = lista.filter((s) => !s.fechada);

    // ---------- geometria ----------
    const E = { mats: base.mats.slice(), objs: [], portas: [], segs: [], caixas: [], gat: [], esp: [], spr: [], ronda: [], pontos: {} };
    const K = J.kit(E);
    const espaco = (i, j) => (c[j]?.[i] == 1 ? 'c' : id[j]?.[i] >= 0 ? 's' + id[j][i] : null);
    const PISO = { aula: 'Carpet', professores: 'Carpet', diretoria: 'Carpet', biblioteca: 'Carpet', cantina: 'TileFloor', deposito: 'TileFloor', clinica: 'TileFloor' };
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
        if (pt && lista[pt.sala].aberta) continue; // cantina e biblioteca: passagem aberta
        if (pt) {
          const s = lista[pt.sala];
          // cada tipo de sala tem a sua porta (como no Baldi's Basics Plus)
          const mat = { professores: 'FacultyDoor_0', diretoria: 'PrincipalDoor_0', clinica: 'DoctorDoor_0', deposito: 'SuppliesDoor_0' }[s.tipo] || 'Door_0';
          K.porta(ex, ez, n, mat, 'porta', 'Gerado/' + s.tipo);
          (E.portaSala = E.portaSala || []).push({ x: ex, z: ez, tipo: s.tipo, centro: [cx((s.i0 + s.i1) / 2), cz((s.j0 + s.j1) / 2)] }); // usado pela partida do Null
        } else K.muro(ex, ez, T, n, 'WhiteBrickWall', !!v);
      }
    }
    // portas amarelas (vai-e-vem) separando a área da entrada do resto da escola; o Baldi avisa quando você chega perto
    portoes.forEach((g, k) => {
      K.porta(cx(g.i), cz(g.j), g.n, 'SwingDoor0', 'vaivem', 'Gerado/portao');
      E.gat.push({ n: 'DoorAudioTrigger' + (k ? ` (${k})` : ''), c: [cx(g.i), 5, cz(g.j)], h: [7, 5, 7], ang: 0 });
    });
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
    for (const s of abertas) { const p = s.porta; res(p.i, p.j); }
    const pontoSala = (s) => { const l = s.cel.filter(([i, j]) => !(i == s.porta.i && j == s.porta.j)); const q = l[rndInt(0, l.length - 1)] || [s.porta.i, s.porta.j]; res(q[0], q[1]); return q; };
    const nb = base.spr.find((s) => s.n == '_nbSprite');
    const cores = ['_nbBlue', '_nbRed', '_nbGreen', '_nbYellow', '_nbCyan', '_nbSalmon', '_nbBlack'];
    const rondaSala = {};
    for (const s of abertas) { const q = pontoSala(s); rondaSala[s.n] = [cx(q[0]), cz(q[1])]; }
    // diretoria: o Diretor fica perto da porta (assim a porta dele é a mais perto), você fica lá dentro
    const pd = [dir.porta.i, dir.porta.j], fundo = dir.cel.reduce((a, b) => (Math.hypot(b[0] - pd[0], b[1] - pd[1]) > Math.hypot(a[0] - pd[0], a[1] - pd[1]) ? b : a));
    res(fundo[0], fundo[1]);
    E.pontos.principalDetentionPoint = [cx(pd[0]) - dir.porta.di * 2, 0, cz(pd[1]) + dir.porta.dj * 2];
    E.pontos.playerDetentionPoint = [cx(fundo[0]), 0, cz(fundo[1])];
    E.gat.push(gatSala('Office Trigger', dir, cx, cz));
    lista.filter((s) => s.tipo == 'professores').forEach((s, k) => E.gat.push(gatSala('_FacultyTrigger' + (k ? ` (${k})` : ''), s, cx, cz)));
    for (const s of abertas) mobilia(K, s, cx, cz, livre, res);
    // cadernos em cima de uma carteira; nas outras carteiras, de vez em quando, cadernos, lápis e papéis
    cadernos.forEach((s, k) => {
      const m = s.mesas.length ? s.mesas.splice(rndInt(0, s.mesas.length - 1), 1)[0] : (() => { const q = pontoSala(s); return [cx(q[0]), cz(q[1])]; })();
      E.spr.push(Object.assign({}, nb, { pai: 'Environment/Objects/Notebooks/Gerado' + k, tex: 'Texture2D/SchoolHouse/PickUps/Notebook/' + cores[k % cores.length] + '.png', M: nb.M.slice(0, 12).concat([m[0], nb.M[13], m[1], 1]) }));
    });
    // toca-fitas em cima de uma carteira livre de uma sala com caderno (use a fita nele)
    const toca = base.spr.find((s) => s.n == 'TapeSprite'), salaFita = cadernos.find((s) => (s.mesas || []).length);
    if (toca && salaFita) { const m = salaFita.mesas.pop(); E.spr.push(Object.assign({}, toca, { M: toca.M.slice(0, 12).concat([m[0], toca.M[13], m[1], 1]) })); }
    for (const s of abertas) for (const m of s.mesas || []) if (Math.random() < 0.4) K.enfeite(['Notebooks', 'pencils', 'papers'][rndInt(0, 2)], m[0], m[1], 4.4);

    // ---------- corredores: ronda, armários, cartazes, plantas, portas vai-e-vem ----------
    const corr = [];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (c[j][i] == 1) corr.push([i, j]);
    const cruz = corr.filter(([i, j]) => D4.filter(([di, dj]) => ehCorr(i + di, j + dj)).length >= 3);
    const pontosCorr = embaralha(cruz.concat(corr.filter(() => Math.random() < 0.08))).map(([i, j]) => [cx(i), cz(j)]);
    while (pontosCorr.length < 16) pontosCorr.push(pontosCorr[pontosCorr.length % Math.max(1, pontosCorr.length)]);
    E.ronda = pontosCorr.slice(0, 16).concat(Object.values(rondaSala));
    E.rondaCorr = pontosCorr.slice(16);
    enfeitaCorredores(K, c, W, H, id, lista, cx, cz, ehSaida, praca, saidas, portoes, zona);
    const cl = abertas.find((s) => s.tipo == 'clinica'); if (cl) E.clinica = rondaSala[cl.n]; // casa do Dr. Reflex

    // ---------- jogador, personagens e itens ----------
    const sul0 = saidas[0];
    const ini = [cx(sul0.i), cz(sul0.j)];
    const pertoDaSaida = (i, j) => saidas.some((q) => Math.abs(q.i - i) + Math.abs(q.j - j) <= 3);
    E.esp.push({ s: 'PlayerScript', n: 'Player', pos: [ini[0], 4, ini[1]] });
    const longe = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const corrLonge = (d) => { const l = pontosCorr.filter((p) => longe(p, ini) > d); return l[rndInt(0, l.length - 1)] || pontosCorr[0]; };
    const coloca = (nome, pos, y = 2) => {
      E.esp.push({ s: 'NPC', n: nome, pos: [pos[0], y, pos[1]] });
      const sp = base.spr.find((s) => s.pai.startsWith('NPC/' + nome) && s.n != 'New Sprite');
      if (sp) E.spr.push(Object.assign({}, sp, { M: sp.M.slice(0, 12).concat([pos[0], sp.M[13], pos[1], 1]) }));
    };
    const corrZona = corr.filter(([i, j]) => i >= zona.i0 && i <= zona.i1 && j >= zona.j0 && j <= zona.j1 && !portoes.some((g) => g.i == i && g.j == j)).map(([i, j]) => [cx(i), cz(j)]);
    const baldiIni = corrZona.sort((a, b) => longe(b, ini) - longe(a, ini))[0];
    coloca('Baldi', baldiIni && longe(baldiIni, ini) > 25 ? baldiIni : corrLonge(60));
    coloca('Principal of the Thing', [E.pontos.principalDetentionPoint[0], E.pontos.principalDetentionPoint[2]]);
    coloca('Playtime', corrLonge(50));
    coloca('Gotta Sweep', sweepSala && !sweepSala.fechada ? rondaSala[sweepSala.n] : corrLonge(40));
    coloca('Arts and Crafters', rondaSala[cadernos[cadernos.length - 1].n]);
    coloca('1st Prize', corrLonge(70));
    coloca('Its a Bully', [ini[0], ini[1]], -20);
    // Baldi do tutorial acenando logo na entrada
    const tut = base.spr.find((s) => s.pai.startsWith('NPC/TutorBaldi'));
    const frente = [cx(sul0.i + sul0.para[0] * 2), cz(sul0.j + sul0.para[1] * 2)];
    if (tut) E.spr.push(Object.assign({}, tut, { M: tut.M.slice(0, 12).concat([frente[0], tut.M[13], frente[1], 1]) })); // no meio do corredor, de frente para a entrada
    E.pontos.playerTeleportPoint = [ini[0], 0, ini[1] - 12];
    const bt = corrLonge(80); E.pontos.baldiTeleportPoint = [bt[0], 0, bt[1]];
    // itens espalhados (em salas e corredores)
    const item = base.spr.find((s) => s.pai.endsWith('Pickup_Quarter'));
    const ITENS = ['EnergyFlavoredZestyBar', 'YellowDoorLock', 'Key', 'BSODA', 'Quarter', 'Tape', 'AlarmClock', 'WD-3D', 'SafetyScissors', 'BigBoots', 'Quarter', 'BSODA', 'EnergyFlavoredZestyBar', 'Quarter'];
    const TEX = { AlarmClock: 'AlarmClockItem', 'WD-3D': 'wd_nosquee', BigBoots: 'BootsIcon' };
    const lugares = embaralha(abertas.filter((s) => s.tipo != 'diretoria' && s.tipo != 'professores'));
    ITENS.forEach((n, k) => {
      const s = lugares[k % lugares.length], cand = s.cel.filter(([i, j]) => livre(i, j));
      const q = cand.length ? cand[rndInt(0, cand.length - 1)] : s.cel[0]; res(q[0], q[1]);
      E.spr.push(Object.assign({}, item, { a: 1, pai: 'Environment/Objects/Pickups/Pickup_' + n, tex: 'Texture2D/SchoolHouse/PickUps/' + (TEX[n] || n) + '.png', M: item.M.slice(0, 12).concat([cx(q[0]) + rnd(-2, 2), item.M[13], cz(q[1]) + rnd(-2, 2), 1]) }));
    });
    // orelhão num corredor (moeda nele deixa o Baldi surdo)
    const fone = base.spr.find((s) => s.n == 'PhoneSprite');
    const corrLivres = embaralha(corr.filter(([i, j]) => !pertoDaSaida(i, j)));
    for (const [i, j] of corrLivres) {
      const w = D4.find(([di, dj]) => c[j + dj]?.[i + di] !== 1 && !ehSaida(i + di, j + dj));
      if (!w || !fone) continue;
      const fx = cx(i) + w[0] * 3.8, fz = cz(j) - w[1] * 3.8;
      if (E.caixas.some((c) => Math.hypot(c.c[0] - fx, c.c[2] - fz) < 4) || E.spr.some((s) => Math.hypot(s.M[12] - fx, s.M[14] - fz) < 3)) continue; // nada de orelhão dentro de máquina
      E.spr.push(Object.assign({}, fone, { M: fone.M.slice(0, 12).concat([fx, fone.M[13], fz, 1]) }));
      break;
    }
    // porão (recurso do Beta, só com o mapa aleatório): escada num beco do corredor, fora da área da entrada
    if (F.porao) {
      const naZonaC = (i, j) => i >= zona.i0 && i <= zona.i1 && j >= zona.j0 && j <= zona.j1;
      const beco = (i, j) => D4.filter(([di, dj]) => ehCorr(i + di, j + dj)).length == 1;
      const cand = embaralha(corr.filter(([i, j]) => !naZonaC(i, j) && !pertoDaSaida(i, j) && !praca.has(i + ',' + j)));
      const esc = cand.find(([i, j]) => beco(i, j)) || cand[0];
      if (esc) geraPorao(E, K, [cx(esc[0]), cz(esc[1])], (W + 6) * T);
    }
    E.totalCadernos = nCad;
    E.gerado = { W, H };
    Object.defineProperty(E, 'debug', { value: { lista, id, c } }); // só para os testes
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
    // o móvel cabe inteiro na sala? (cantos e meios das bordas, com folga de 1 da parede)
    const TAM = { carteira: [1.5, 1.7], cadeira: [1, 1], mesaProf: [2, 5], mesaLonga: [10, 2.5] };
    const naSala = (x, z) => s.cel.some(([i, j]) => Math.floor(x / T) == i && Math.floor(-z / T) == j);
    const cabe = (tipo, x, z, a) => {
      const [hx, hz] = TAM[tipo], co = Math.cos(a), si = Math.sin(a);
      for (const ux of [-1, 0, 1]) for (const uz of [-1, 0, 1]) {
        if (!ux && !uz) continue;
        const lx = ux * (hx + 1), lz = uz * (hz + 1);
        if (!naSala(x + co * lx - si * lz, z + si * lx + co * lz)) return false;
      }
      return true;
    };
    // tenta pôr o móvel no lugar (ou girado, ou deslocado meio quadrado); devolve a posição usada
    const poe = (tipo, x, z, a) => {
      for (const [dx, dz] of [[0, 0], [5, 0], [-5, 0], [0, 5], [0, -5]]) for (const g of [a, a + Math.PI / 2]) {
        if (cabe(tipo, x + dx, z + dz, g)) { K.movel(tipo, x + dx, z + dz, g); return [x + dx, z + dz]; }
      }
      return null;
    };
    s.mesas = [];
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
        if (!cabe('carteira', x, z, a)) continue;
        K.movel('carteira', x, z, a); K.movel('cadeira', x + f.n[0] * 3, z + f.n[1] * 3, a);
        s.mesas.push([x, z]); // cadernos e enfeites vão em cima depois
      }
      poe('mesaProf', f.x + f.n[0] * 4 + (f.n[1] ? 6 : 0), f.z + f.n[1] * 4 + (f.n[0] ? 6 : 0), f.n[0] ? 0 : Math.PI / 2);
      cartaz(rndInt(0, 7)); cartaz(rndInt(0, 7));
      if (Math.random() < 0.6) { const w = parede.pop(); if (w) K.naParede('JanelaFora', w.x, w.z, w.n); }
      const c0 = cantos[0]; if (c0) K.enfeite('Plant', X(c0[0]) + 3, Z(c0[1]) + 3);
    } else if (s.tipo == 'professores') {
      const m = s.cel.find(([i, j]) => livre(i, j));
      if (m) { res(m[0], m[1]); const q = poe('mesaLonga', X(m[0]), Z(m[1]), s.i1 - s.i0 >= s.j1 - s.j0 ? 0 : Math.PI / 2) || poe('mesaProf', X(m[0]), Z(m[1]), 0); if (q) K.enfeite('food', q[0], q[1], 4.2); }
      const w = parede.pop(); if (w) K.maquina(Math.random() < 0.5 ? 'BSODAMachine' : 'ZestyMachine', w.x + w.n[0] * 1.2, w.z + w.n[1] * 1.2, w.n);
      for (const n of ['PRI_Poster', 'Baldi_Poster', 'Prize_Poster', 'Sweep_Poster', 'Playtime_Poster', 'Bully_Poster', 'Crafters_Poster']) { const q = parede.pop(); if (q && Math.random() < 0.5) K.naParede(n, q.x, q.z, q.n); }
    } else if (s.tipo == 'clinica') {
      // clínica do Dr. Reflex: mesa, armários e o cartaz dele
      const f = paredeFundo(); K.naParede('PhonePoster', f.x, f.z, f.n);
      poe('mesaProf', f.x + f.n[0] * 4, f.z + f.n[1] * 4, f.n[0] ? 0 : Math.PI / 2);
      const w = parede.pop(); if (w) K.armarios(w.x - Math.abs(w.n[1]) * 3, w.z - Math.abs(w.n[0]) * 3, w.x + Math.abs(w.n[1]) * 3, w.z + Math.abs(w.n[0]) * 3, w.n);
      const c0 = cantos[cantos.length - 1]; if (c0) K.enfeite('Plant', X(c0[0]) + 3, Z(c0[1]) - 3);
    } else if (s.tipo == 'diretoria') {
      const f = paredeFundo(); K.naParede('PRI_Poster', f.x, f.z, f.n);
      for (const n of ['Baldi_Poster', 'Sweep_Poster', 'Playtime_Poster', 'Prize_Poster', 'Bully_Poster', 'Crafters_Poster']) { const q = parede.pop(); if (q) K.naParede(n, q.x, q.z, q.n); }
    } else if (s.tipo == 'cantina') {
      for (const [i, j] of s.cel) if (livre(i, j) && (s.i1 - s.i0 >= s.j1 - s.j0 ? (i - s.i0) % 2 == 1 && j > s.j0 && j < s.j1 : (j - s.j0) % 2 == 1 && i > s.i0 && i < s.i1)) {
        const hor = s.i1 - s.i0 < s.j1 - s.j0; // mesas compridas atravessadas
        if (cabe('mesaLonga', X(i), Z(j), hor ? 0 : Math.PI / 2)) { K.movel('mesaLonga', X(i), Z(j), hor ? 0 : Math.PI / 2); res(i, j); K.enfeite('food', X(i), Z(j), 4.2); }
      }
      for (const n of ['BSODAMachine', 'ZestyMachine']) { const w = parede.pop(); if (w) K.maquina(n, w.x + w.n[0] * 1.2, w.z + w.n[1] * 1.2, w.n); }
      cartaz(5);
    } else if (s.tipo == 'biblioteca') {
      for (let k = 0; k < Math.min(6, parede.length); k++) { const w = parede.pop(); K.estante(w.x + w.n[0], w.z + w.n[1], w.n, 8); }
      const m = s.cel.find(([i, j]) => livre(i, j) && i > s.i0 && i < s.i1 && j > s.j0 && j < s.j1);
      if (m) { res(m[0], m[1]); const q = poe('mesaLonga', X(m[0]), Z(m[1]), 0) || poe('mesaProf', X(m[0]), Z(m[1]), 0); if (q) K.enfeite('Notebooks', q[0], q[1], 4.4); }
      K.enfeite('Globe', X(s.i1) + 2, Z(s.j1) - 2);
    } else if (s.tipo == 'deposito') {
      for (let k = 0; k < Math.min(3, parede.length); k++) { const w = parede.pop(); K.armarios(w.x - Math.abs(w.n[1]) * 4, w.z - Math.abs(w.n[0]) * 4, w.x + Math.abs(w.n[1]) * 4, w.z + Math.abs(w.n[0]) * 4, w.n); }
      if (s.area >= 6 && s.i1 > s.i0 && s.j1 > s.j0) for (const [i, j] of s.cel) if (livre(i, j) && Math.random() < 0.5) K.caixote(X(i) + rnd(-2, 2), Z(j) + rnd(-2, 2), rnd(2, 3.2));
    }
  }

  /* ---------- porão: labirinto escuro de corredores (como o Baldi's Basement) ----------
     Às vezes (é raro) tem a sala secreta: porta misteriosa num beco, sala toda escura com uma mesa e a fita verde. */
  function geraPorao(E, K, escada, OX) {
    const NX = 6, NZ = 6, w = NX * 2 - 1, h = NZ * 2 - 1, c = Array.from({ length: h }, () => new Array(w + 3).fill(0));
    // labirinto: nós nas posições pares, ligados por uma árvore aleatória + alguns laços
    const vis = new Set(['0,0']), pilha = [[0, 0]]; c[0][0] = 1;
    while (pilha.length) {
      const [x, y] = pilha[pilha.length - 1];
      const viz = embaralha(D4.slice()).filter(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < NX && y + dy < NZ && !vis.has([x + dx, y + dy] + ''));
      if (!viz.length) { pilha.pop(); continue; }
      const [dx, dy] = viz[0]; c[y * 2 + dy][x * 2 + dx] = 1; c[(y + dy) * 2][(x + dx) * 2] = 1; vis.add([x + dx, y + dy] + ''); pilha.push([x + dx, y + dy]);
    }
    for (let y = 0; y < NZ; y++) for (let x = 0; x < NX - 1; x++) if (Math.random() < 0.12) c[y * 2][x * 2 + 1] = 1;
    for (let y = 0; y < NZ - 1; y++) for (let x = 0; x < NX; x++) if (Math.random() < 0.12) c[y * 2 + 1][x * 2] = 1;
    // sala secreta (rara): 2x2 encostada num nó da borda leste do labirinto
    const secreta = J.forcaSecreta || (J.betaFeat || {})._secreta || Math.random() < 0.35;
    let sala = null;
    if (secreta) {
      const yn = rndInt(0, NZ - 1) * 2, j0 = Math.min(h - 2, yn);
      sala = { i0: w, j0, porta: [w - 1, yn] };
      for (const [i, j] of [[w, j0], [w + 1, j0], [w, j0 + 1], [w + 1, j0 + 1]]) c[j][i] = 2;
    }
    const X = (i) => OX + i * T + 5, Z = (j) => -(j * T + 5);
    const esp = (i, j) => c[j]?.[i] || 0;
    // texturas do porão (como o Baldi's Basement do Classic Remastered): tábuas de madeira, carpete bege, teto amarelado
    const mat = (n, tex, rep, cor = [0.96, 0.96, 0.96, 1]) => { if (!E.mats.some((m) => m.n === n)) E.mats.push({ n, tex, rep, off: [0, 0], cor }); return n; };
    const PAREDE = mat('Porao_Parede', 'beta/porao/parede.png', [1, 1]), PAREDE_FINA = mat('Porao_ParedeFina', 'beta/porao/parede.png', [0.25, 1]);
    const CHAO = mat('Porao_Chao', 'beta/porao/chao.png', [2, 2]), TETO = mat('Porao_Teto', 'Texture2D/SchoolHouse/Ceiling.png', [1, 1], [0.95, 0.8, 0.42, 1]);
    for (let j = 0; j < h; j++) for (let i = 0; i < w + 3; i++) {
      const e = esp(i, j); if (!e) continue;
      E.objs.push({ m: 'quad', mat: [K.mi(CHAO)], M: [0, 0, -T, 0, -T, 0, 0, 0, 0, 1, 0, 0, X(i), 0, Z(j), 1] });
      E.objs.push({ m: 'quad', mat: [K.mi(TETO)], M: [T, 0, 0, 0, 0, 0, -T, 0, 0, -1, 0, 0, X(i), 10, Z(j), 1] });
      for (const [di, dj] of D4) {
        const v = esp(i + di, j + dj);
        if (v === e) continue;
        const ex = X(i) + di * 5, ez = Z(j) - dj * 5, n = [-di, dj];
        if (v && !(di > 0 || dj > 0)) continue;
        const ehPorta = sala && ((e == 1 && v == 2 && i == sala.porta[0] && j == sala.porta[1]) || (e == 2 && v == 1 && i + di == sala.porta[0] && j + dj == sala.porta[1]));
        if (ehPorta) K.porta(ex, ez, n, 'PoraoMysteryDoor_0', 'porta', 'Porao/secreta', PAREDE_FINA);
        else K.muro(ex, ez, T, n, PAREDE, !!v);
      }
    }
    // enfeites: quadrinhos nas paredes de alguns cruzamentos
    for (let j = 0; j < h; j += 2) for (let i = 0; i < w; i += 2) {
      if (esp(i, j) != 1 || Math.random() > 0.15 || (i == 0 && j == 0)) continue;
      const lado = D4.find(([di, dj]) => !esp(i + di, j + dj));
      if (lado) K.naParede(Math.random() < 0.5 ? 'comic00' : 'comic01', X(i) + lado[0] * 5, Z(j) - lado[1] * 5, [-lado[0], lado[1]]);
    }
    // escadas: uma no beco da escola (desce) e outra no começo do labirinto (sobe)
    const desenho = (x, z) => ({ n: 'Escada', pai: 'Environment/Porao/Escada', tex: 'beta/null/escada.png', ppu: 100, piv: [0.5, 0.5], a: 1, M: [4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1, 0, x, 2.6, z, 1] });
    E.spr.push(desenho(X(0), Z(0)), desenho(escada[0], escada[1]));
    // lâmpadas azuis penduradas no teto dos cruzamentos
    for (let j = 0; j < h; j += 2) for (let i = 0; i < w; i += 2) if (esp(i, j) == 1 && (i + j) % 4 == 0)
      E.spr.push({ n: 'Lampada', pai: 'Environment/Porao/Lampada', tex: 'beta/porao/lampada.png', ppu: 100, piv: [0.5, 0.5], a: 1, M: [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, X(i), 8.5, Z(j), 1] });
    // pontos do labirinto (para os objetos da luta do Null aparecerem aqui também)
    const pontos = [];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (esp(i, j) == 1) pontos.push([X(i), Z(j)]);
    E.porao = { OX, entrada: [X(0), Z(0)], escada, pontos };
    if (sala) {
      const cxs = X(sala.i0) + 5, czs = Z(sala.j0) - 5;
      K.movel('mesaProf', cxs, czs, 0);
      E.spr.push({ n: 'ItemSprite', pai: 'Environment/Objects/Pickups/Pickup_FitaVerde', tex: 'beta/null/fita_verde.png', ppu: 100, piv: [0.5, 0.5], a: 1, M: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, cxs, 4.3, czs, 1] });
      E.gat.push({ n: 'SalaSecreta', c: [cxs, 5, czs], h: [10, 5, 10], ang: 0 });
      E.porao.sala = [cxs, czs];
    }
  }

  function enfeitaCorredores(K, c, W, H, id, lista, cx, cz, ehSaida, praca, saidas, portoes, zona) {
    // perto das saídas o corredor fica limpo (o Baldi do tutorial acena logo na entrada)
    const pertoSaida = (i, j) => saidas.some((s) => Math.abs(s.i - i) + Math.abs(s.j - j) <= 4) || portoes.some((g) => Math.abs(g.i - i) + Math.abs(g.j - j) <= 1);
    const ehCorr = (i, j) => c[j]?.[i] == 1;
    const POST = ['SchoolRulesPoster', 'SchoolAttention', 'BootsPoster', 'WD_NoSqueePoster', 'PhonePoster', 'ScissorsPoster', 'recyclefood', 'what', 'comic00', 'comic01'];
    let vaivem = 0;
    const comArmario = new Set();
    const copia = c.map((l) => l.slice()); // para conferir que os corredores continuam ligados sem as vai-e-vem
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (!ehCorr(i, j)) continue;
      const viz = D4.filter(([di, dj]) => ehCorr(i + di, j + dj));
      const reto = viz.length == 2 && viz[0][0] == -viz[1][0] && viz[0][1] == -viz[1][1];
      // porta vai-e-vem no meio de trechos retos, de vez em quando
      // (elas ficam trancadas até o 2º caderno: não podem separar nenhum pedaço da escola)
      const naPraca = praca.has(i + ',' + j);
      const naZona = i >= zona.i0 && i <= zona.i1 && j >= zona.j0 && j <= zona.j1; // dentro da área da entrada não (os 2 primeiros cadernos ficam livres)
      if (!naPraca && !naZona && reto && vaivem < 6 && Math.random() < 0.03 && !D4.some(([di, dj]) => ehSaida(i + di, j + dj)) && ((copia[j][i] = 3), conectado(copia, W, H) || ((copia[j][i] = 1), false))) {
        const [di, dj] = viz[0];
        K.porta(cx(i), cz(j), [di, -dj], 'SwingDoor0', 'vaivem', 'Gerado/vaivem'); // atravessada no corredor
        vaivem++;
        continue;
      }
      if (pertoSaida(i, j)) continue;
      for (const [di, dj] of D4) {
        if (ehCorr(i + di, j + dj) || ehSaida(i + di, j + dj)) continue;
        const temPorta = (() => { const v = id[j + dj]?.[i + di]; if (v == null || v < 0) return false; const p = lista[v].porta; return p.i == i + di && p.j == j + dj && p.di == -di && p.dj == -dj; })();
        if (temPorta) continue;
        const x = cx(i) + di * 5, z = cz(j) - dj * 5, n = [-di, dj], r = Math.random();
        // praças: máquinas, plantas e cartazes, sem armários
        if (naPraca) { if (r < 0.2) K.maquina(Math.random() < 0.5 ? 'BSODAMachine' : 'ZestyMachine', x + n[0] * 1.2, z + n[1] * 1.2, n); else if (r < 0.5) K.enfeite('Plant', x + n[0] * 1.5, z + n[1] * 1.5); else if (r < 0.75) K.naParede(POST[rndInt(0, POST.length - 1)], x, z, n); continue; }
        if (r < 0.12 && !comArmario.has(i + ',' + j) && !comArmario.has((i - di) + ',' + (j - dj)) && (comArmario.add(i + ',' + j), true)) K.armarios(x - Math.abs(n[1]) * 4, z - Math.abs(n[0]) * 4, x + Math.abs(n[1]) * 4, z + Math.abs(n[0]) * 4, n);
        else if (r < 0.32) K.naParede(POST[rndInt(0, POST.length - 1)], x, z, n);
        else if (r < 0.40 && (i + di <= 0 || j + dj <= 0 || i + di >= W - 1 || j + dj >= H - 1)) K.naParede('JanelaFora', x, z, n);
        else if (r < 0.43) K.enfeite('Plant', x + n[0] * 1.5, z + n[1] * 1.5);
      }
    }
  }

  function valida(E) {
    const mu = new M.Mundo(E);
    let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
    for (const s of E.segs) { x0 = Math.min(x0, s.a[0], s.b[0]); x1 = Math.max(x1, s.a[0], s.b[0]); z0 = Math.min(z0, s.a[1], s.b[1]); z1 = Math.max(z1, s.a[1], s.b[1]); }
    const N = new M.Nav(mu, [x0 - 5, z0 - 5, x1 + 5, z1 + 5]);
    const pl = E.esp.find((e) => e.s == 'PlayerScript').pos;
    const alvos = E.ronda.concat(E.rondaCorr || []);
    for (const s of E.spr) if (((s.n == '_nbSprite' && /Notebooks\//.test(s.pai)) || /Pickup_/.test(s.pai)) && !/FitaVerde/.test(s.pai)) alvos.push([s.M[12], s.M[14]]); // a fita verde fica no porão
    for (const e of E.esp) if (e.s == 'EntranceScript') alvos.push([e.pos[0], e.pos[2]]);
    return alvos.every((a) => N.caminho(pl[0], pl[2], a[0], a[1]).length);
  }
  // itens que caíram dentro de um móvel ou em cima de outro objeto vão para um lugar livre ali perto
  function desgruda(E) {
    const mu = new M.Mundo(E);
    const naCaixa = (x, z, m) => E.caixas.some((c) => { const dx = x - c.c[0], dz = z - c.c[2], co = Math.cos(c.ang || 0), si = Math.sin(c.ang || 0); return Math.abs(dx * co + dz * si) < c.h[0] + m && Math.abs(-dx * si + dz * co) < c.h[2] + m; });
    const outros = (s, x, z) => E.spr.some((o) => o !== s && o.a && !o.pai.startsWith('NPC/') && Math.hypot(o.M[12] - x, o.M[14] - z) < 2 && Math.abs(o.M[13] - s.M[13]) < 2);
    const livre = (s, x, z) => { const o = { x, z }; mu.resolve(o, 1.3); return Math.hypot(o.x - x, o.z - z) < 0.05 && !naCaixa(x, z, 0.8) && !outros(s, x, z); };
    for (const s of E.spr) {
      if (!/Pickup_/.test(s.pai) || /FitaVerde/.test(s.pai)) continue;
      const x = s.M[12], z = s.M[14];
      if (livre(s, x, z)) continue;
      fora: for (let r = 2; r <= 8; r += 1.5) for (let a = 0; a < 8; a++) {
        const nx = x + Math.cos(a * Math.PI / 4) * r, nz = z + Math.sin(a * Math.PI / 4) * r;
        if (mu.ve(x, z, nx, nz) && livre(s, nx, nz)) { s.M[12] = nx; s.M[14] = nz; break fora; }
      }
    }
  }
  J.geraMapa = (b, n) => { const e = gera(b, n); if (e) desgruda(e); return e; }; J.validaMapa = valida;
  // no Beta, com o recurso ligado, troca a escola original por uma gerada
  J.ganchos.monta.unshift((E, _J, modo) => {
    if (!J.F || !J.F.mapa) return;
    // gera e confere com a navegação de verdade: tudo (cadernos, itens, saídas, ronda) tem que ter caminho
    let novo = null;
    for (let k = 0; k < 8 && !novo; k++) { const e = J.geraMapa(J.Ebase, 7); if (e && valida(e)) novo = e; }
    if (!novo) return;
    for (const k of Object.keys(E)) delete E[k];
    Object.assign(E, novo);
  });
})();
