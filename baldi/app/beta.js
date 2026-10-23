// Modo Beta Tester: testa o que vem por aí.
// - Ala Beta: escola maior, aberta no corredor leste, com salas, biblioteca, laboratório e 3 cadernos a mais.
// - Personagens do Baldi's Basics Plus: Dr. Reflex, Cloudy Copter e The Test.
// - Eventos aleatórios: Apagão, Simulado de Incêndio, Chuva de Cadernos, Hora do Lanche e Sinal do Recreio.
(function () {
  'use strict';
  const J = window.Jogo, M = window.Motor, $ = (id) => document.getElementById(id);
  J.SONS_EXTRA = ['alarme', 'apagao'].map((n) => 'beta/sons/' + n).concat(
    ['DrR_Normal_TakeMyTest', 'DrR_Think_Intro', 'DrR_Fast', 'DrR_Faster', 'DrR_TooSlow', 'DrR_HitCircle', 'DrR_Wrong', 'DrR_TryAgain', 'DrR_GoodJob', 'DrR_FirstTry', 'DrR_AllDone', 'DrR_Angry_HeyGetBack', 'DrR_Angry_Random_0', 'DrR_Angry_Random_1', 'DrR_Angry_Random_2', 'DrR_Hammer', 'Boink', 'Cmlo_Blowing', 'LAt_Sighted', 'LAt_Loop', 'LAt_Buildup', 'Explosion'].map((n) => 'beta/sons2/' + n));
  const beta = () => J.G && J.G.modo == 'beta';

  /* ---------- Ala Beta ---------- */
  // Cada letra é um quadrado de 10x10 (o tamanho dos quadrados da escola original).
  // c = corredor, 1/2 = salas de teste, b = biblioteca, d = depósito, l = laboratório, espaço = nada.
  const X0 = 120, Z0 = -240, T = 10;
  const PLANTA = [
    ' 11111 ddddd c      ',
    ' 11111 ddddd c      ',
    ' 11111 ddddd clllll ',
    ' 11111 ddddd clllll ',
    ' 11111 ddddd clllll ',
    'cccccccccccccclllll ',
    ' 22222 bbbbb clllll ',
    ' 22222 bbbbb clllll ',
    ' 22222 bbbbb clllll ',
    ' 22222 bbbbb c      ',
    ' 22222 bbbbb c      ',
    '             c      ',
  ].map((l) => l.padEnd(20));
  // portas: [coluna, linha, lado] entre a sala e o corredor
  const PORTAS = [[3, 4, 's'], [2, 6, 'n'], [9, 4, 's'], [9, 6, 'n'], [14, 5, 'o']];
  const area = (i, j) => (j >= 0 && j < PLANTA.length ? PLANTA[j][i] || ' ' : ' ').trim();
  const PISO = { c: 'TileFloor', 1: 'Carpet', 2: 'Carpet', b: 'Carpet', d: 'TileFloor', l: 'TileFloor' };

  /* ---------- móveis e enfeites da ala (peças do próprio jogo) ---------- */
  // Malhas e tamanhos (meia largura em x e z) tirados dos móveis da escola original.
  const MOVEL = {
    carteira: { m: 'Mesh/CombinedMeshes_Desk_-177138.asset', mat: ['Desk'], y: 2, h: [1.5, 1.65, 1.7] },
    cadeira: { m: 'Mesh/CombinedMeshes_Desk_-453584.asset', mat: ['Desk'], y: 1, h: [1, 2.5, 1] },
    mesaProf: { m: 'Mesh/CombinedMeshes_Desk_-162226.asset', mat: ['Desk'], y: 1.5, h: [2, 1.5, 5] },
    mesaLonga: { m: 'Mesh/CombinedMeshes_Desk_-856402.asset', mat: ['Desk'], y: 1.5, h: [10, 1.5, 2.5], pes: { m: 'Mesh/CombinedMeshes_BSODA_Side_-856454.asset', mat: ['BSODA_Side'] } },
    armario: { m: 'Mesh/CombinedMeshes_Locker_-826616.asset', mat: ['Locker'], y: 4, h: [1, 4, 1], lado: { m: 'Mesh/CombinedMeshes_LockerSide_-826668.asset', mat: ['Locker_Side'] } },
  };
  // Ferramentas para montar peças no mapa (usadas pela ala e pelo mapa aleatório)
  function kit(E) {
    const mi = (n) => E.mats.findIndex((m) => m.n === n);
    // quad de largura w centrado em (x,z), virado para n = [nx, nz] (só a frente aparece)
    const quadV = (x, z, w, n, y = 5, alt = 10) => [w * n[1], 0, -w * n[0], 0, 0, alt, 0, 0, n[0], 0, n[1], 0, x, y, z, 1];
    // parede virada para n; dupla = também do outro lado
    const muro = (x, z, w, n, mat = 'WhiteBrickWall', dupla = false, extra = {}) => {
      E.objs.push(Object.assign({ m: 'quad', mat: [mi(mat)], M: quadV(x, z, w, n, extra.y ?? 5) }, extra.ent ? { ent: extra.ent } : {}));
      if (dupla) E.objs.push(Object.assign({ m: 'quad', mat: [mi(mat)], M: quadV(x, z, w, [-n[0], -n[1]], extra.y ?? 5) }, extra.ent ? { ent: extra.ent } : {}));
      const a = n[0] == 0 ? [x - w / 2, z] : [x, z - w / 2], b = n[0] == 0 ? [x + w / 2, z] : [x, z + w / 2];
      E.segs.push(Object.assign({ a, b, y: extra.ent ? [10, 20] : [0, 10] }, extra.ent ? { ent: extra.ent } : {}));
    };
    // porta de 5 (ou 10, vai-e-vem) no meio de uma parede de 10, com os dois pedaços de parede fina
    const porta = (ex, ez, n, mat = 'Door_0', tipo = 'porta', pai = 'Gerado') => {
      const larg = tipo == 'vaivem' ? 10 : 5, eixoX = n[0] == 0;
      if (larg < 10) for (const k of [-3.75, 3.75]) muro(eixoX ? ex + k : ex, eixoX ? ez : ez + k, 2.5, n, 'WhiteBrickWallThin', true);
      const Mq = (k) => quadV(ex + k * n[0] * 0.02, ez + k * n[1] * 0.02, larg, [k * n[0], k * n[1]]);
      const h = larg / 2, ba = eixoX ? [ex - h, ez] : [ex, ez - h], bb = eixoX ? [ex + h, ez] : [ex, ez + h];
      E.portas.push({ tipo, pos: [ex, 5, ez], quads: [{ M: Mq(1), mat: mi(mat), lado: '_DoorIn' }, { M: Mq(-1), mat: mi(mat), lado: '_DoorOut' }], bar: { a: ba, b: bb, y: [0, 10] }, pai });
    };
    // giro em y: a = 0 é a posição original da peça; a frente (z local) aponta para (-sen a, cos a)
    const giro = (a, sx = 1, sy = 1, sz = 1) => { const c = Math.cos(a), s = Math.sin(a); return [c * sx, 0, s * sx, 0, 0, sy, 0, 0, -s * sz, 0, c * sz, 0]; };
    const caixa = (n, x, y, z, h, a) => E.caixas.push({ n, c: [x, y, z], h, ang: a });
    const movel = (tipo, x, z, a = 0) => {
      const t = MOVEL[tipo];
      for (const p of [t, t.pes, t.lado]) if (p) E.objs.push({ m: p.m, mat: p.mat.map(mi), M: giro(a).concat([x, t.y, z, 1]) });
      caixa(tipo, x, t.y, z, t.h, a);
    };
    const virado = (n) => Math.atan2(-n[0], n[1]); // giro para a frente olhar na direção n
    // fileira de armários encostados na parede, olhando para n
    const armarios = (x0, z0, x1, z1, n) => {
      const L = Math.hypot(x1 - x0, z1 - z0), k = Math.floor(L / 2);
      for (let i = 0; i < k; i++) { const f = (i + 0.5) / k; movel('armario', x0 + (x1 - x0) * f + n[0], z0 + (z1 - z0) * f + n[1], virado(n)); }
    };
    // quadro, cartaz ou janela na parede (quad de 10x10 como os da escola), um pouco à frente dela
    const naParede = (mat, x, z, n) => E.objs.push({ m: 'quad', mat: [mi(mat)], M: quadV(x + n[0] * 0.03, z + n[1] * 0.03, 10, n) });
    // máquina de refrigerante/lanche: frente de 4x8 e caixa com o nome que o jogo reconhece
    const maquina = (mat, x, z, n) => {
      E.objs.push({ m: 'quad', mat: [mi(mat)], M: quadV(x + n[0] * 1.01, z + n[1] * 1.01, 4, n, 4).map((v, i) => (i == 5 ? 8 : v)) });
      E.objs.push({ m: 'cube', mat: [mi('Locker_Side')], M: giro(virado(n), 4, 8, 2).concat([x, 4, z, 1]) });
      caixa(mat, x, 4, z, [2, 4, 1], virado(n));
    };
    // estante de madeira com pilhas de cadernos
    const estante = (x, z, n, L) => {
      const a = virado(n);
      E.objs.push({ m: 'cube', mat: [mi('Desk')], M: giro(a, L, 8, 2).concat([x, 4, z, 1]) });
      caixa('Estante', x, 4, z, [L / 2, 4, 1], a);
      const ux = Math.cos(a), uz = Math.sin(a);
      for (let k = -L / 2 + 1.5; k < L / 2 - 1; k += 3) for (const y of [2.2, 4.6, 7]) enfeite(Math.random() < 0.7 ? 'Notebooks' : 'papers', x + ux * k + n[0] * 1.3, z + uz * k + n[1] * 1.3, y, 0.8);
    };
    // caixote de madeira
    const caixote = (x, z, t = 3, y = 0) => { E.objs.push({ m: 'cube', mat: [mi('Desk')], M: giro(0, t, t, t).concat([x, y + t / 2, z, 1]) }); caixa('Caixote', x, y + t / 2, z, [t / 2, t / 2, t / 2], 0); };
    // enfeite em sprite (copia o tamanho do enfeite original)
    const modelos = {};
    for (const s of E.spr) for (const n of ['Globe', 'Plant', 'Notebooks', 'food', 'pencils', 'papers']) if (!modelos[n] && s.tex.endsWith('/' + n + '.png')) modelos[n] = s;
    function enfeite(n, x, z, y, esc = 1) {
      const b = modelos[n]; if (!b) return;
      const M = b.M.slice(0, 12).map((v, i) => (i < 11 && i % 4 != 3 && i != 8 && i != 10 ? v * esc : v));
      E.spr.push(Object.assign({}, b, { pai: 'Environment/Objects/Billboards/AlaBeta', a: 1, M: M.concat([x, y ?? b.M[13], z, 1]) }));
    }

    return { mi, quadV, muro, porta, giro, caixa, movel, virado, armarios, naParede, maquina, estante, caixote, enfeite };
  }
  J.kit = kit;
  function decora(E) {
    const { naParede, movel, enfeite, armarios, maquina, caixote, estante } = kit(E);
    const S = [0, 1], N = [0, -1], L = [-1, 0], O = [1, 0]; // para onde a peça olha (+z, -z, -x, +x)
    // Sala 1 (x 130-180, z -240 a -290): quadro ao norte, carteiras viradas para ele
    naParede('Math', 155, -240, N);
    naParede('Window', 130, -265, O); naParede('SchoolRulesPoster', 180, -265, L);
    movel('mesaProf', 170, -246, Math.PI / 2); enfeite('Globe', 172, -246, 4.6, 0.35);
    for (const x of [137, 147, 163, 173]) for (const z of [-260, -270, -280]) {
      movel('carteira', x, z, Math.PI); movel('cadeira', x, z - 3, Math.PI);
      if (Math.random() < 0.6) enfeite(['Notebooks', 'pencils', 'papers'][M.rndInt(0, 2)], x, z, 4.4, 0.7);
    }
    enfeite('Plant', 133, -243); enfeite('Plant', 177, -287);
    // Sala 2 (x 130-180, z -300 a -350): espelho da sala 1, quadro ao sul
    naParede('world', 155, -350, S);
    naParede('Window', 130, -325, O); naParede('ScissorsPoster', 180, -325, L);
    movel('mesaProf', 170, -344, Math.PI / 2); enfeite('papers', 168, -344, 4.4, 0.8);
    for (const x of [137, 147, 163, 173]) for (const z of [-310, -320, -330]) {
      movel('carteira', x, z, 0); movel('cadeira', x, z + 3, 0);
      if (Math.random() < 0.6) enfeite(['Notebooks', 'pencils', 'papers'][M.rndInt(0, 2)], x, z, 4.4, 0.7);
    }
    enfeite('Plant', 133, -347); enfeite('Plant', 177, -303);
    // Depósito (x 190-240, z -240 a -290): armários, máquinas, caixotes e mesa com lanches
    armarios(192, -240, 238, -240, N); armarios(190, -244, 190, -276, O);
    maquina('BSODAMachine', 238, -252, L); maquina('ZestyMachine', 238, -262, L);
    movel('mesaLonga', 222, -268, Math.PI / 2); enfeite('food', 222, -262, 4.2); enfeite('food', 222, -272, 4.2);
    caixote(195, -284); caixote(199, -285, 2.5); caixote(195.5, -284.5, 2, 3); caixote(235, -284); caixote(235.5, -279, 2.5);
    naParede('recyclefood', 240, -280, L);
    // Biblioteca (x 190-240, z -300 a -350): estantes nas paredes, mesas de leitura
    estante(191, -312, O, 12); estante(191, -330, O, 12); estante(205, -349, S, 14); estante(225, -349, S, 14); estante(239, -315, L, 14);
    movel('mesaLonga', 225, -327, Math.PI / 2);
    for (const z of [-320, -327, -334]) { movel('cadeira', 221, z, -Math.PI / 2); movel('cadeira', 229, z, Math.PI / 2); enfeite('Notebooks', 225, z, 4.4, 0.7); }
    enfeite('Globe', 235, -304); enfeite('Plant', 193, -303);
    naParede('comic00', 205, -300, S); naParede('comic01', 235, -300, S); naParede('Lore', 240, -335, L);
    // Laboratório (x 260-310, z -260 a -330): bancadas compridas, quadro e globos
    for (const z of [-270, -282, -308, -320]) {
      movel('mesaLonga', 290, z, 0);
      for (const x of [283, 290, 297]) { movel('cadeira', x, z + (z > -295 ? -3.5 : 3.5), z > -295 ? Math.PI : 0); if (Math.random() < 0.7) enfeite(['pencils', 'papers', 'Notebooks'][M.rndInt(0, 2)], x, z, 4.2, 0.6); }
    }
    naParede(99, 310, -295, L); naParede('what', 285, -260, N); naParede('Window', 310, -270, L); naParede('Window', 310, -320, L);
    enfeite('Globe', 305, -264); enfeite('Globe', 305, -326); enfeite('Plant', 264, -327);
    // Corredores: armários, plantas e cartazes
    armarios(160, -290, 178, -290, N); armarios(222, -290, 240, -290, N); armarios(160, -300, 178, -300, S); armarios(190, -300, 206, -300, S);
    armarios(250, -242, 250, -280, O); armarios(250, -306, 250, -350, O);
    naParede('SchoolAttention', 125, -300, S); naParede('BootsPoster', 235, -300, S); naParede('WD_NoSqueePoster', 255, -360, S); naParede('PhonePoster', 255, -240, N);
    enfeite('Plant', 257, -243); enfeite('Plant', 257, -357); enfeite('Plant', 186, -292);
  }

  function constroiAla(E) {
    const mi = (n) => E.mats.findIndex((m) => m.n === n);
    const parede = mi('WhiteBrickWall'), fina = mi('WhiteBrickWallThin'), teto = mi('Ceiling'), porta = mi('Door_0');
    // abre a parede externa do corredor leste onde a ala encosta (x=120, z de -290 a -300)
    const zc = Z0 - 5 * T - 5;
    E.objs = E.objs.filter((o) => !(o.m == 'quad' && Math.abs(o.M[12] - X0) < 0.2 && Math.abs(o.M[14] - zc) < 0.2 && Math.abs(o.M[13] - 5) < 0.2));
    E.segs = E.segs.filter((s) => !(Math.abs(s.a[0] - X0) < 0.2 && Math.abs(s.b[0] - X0) < 0.2 && Math.abs((s.a[1] + s.b[1]) / 2 - zc) < 0.2));
    const piso = (x, z, mat) => E.objs.push({ m: 'quad', mat: [mi(mat)], M: [0, 0, -T, 0, -T, 0, 0, 0, 0, 1, 0, 0, x, 0, z, 1] });
    const forro = (x, z) => E.objs.push({ m: 'quad', mat: [teto], M: [T, 0, 0, 0, 0, 0, -T, 0, 0, -1, 0, 0, x, 10, z, 1] });
    // quad de largura w centrado em (x,z), virado para n = [nx, nz] (só a frente aparece)
    const quadV = (x, z, w, n, y = 5) => [w * n[1], 0, -w * n[0], 0, 0, 10, 0, 0, n[0], 0, n[1], 0, x, y, z, 1];
    // parede virada para n; dupla = também do outro lado (parede entre duas áreas)
    const muro = (x, z, w, n, mat = parede, dupla = false) => {
      E.objs.push({ m: 'quad', mat: [mat], M: quadV(x, z, w, n) });
      if (dupla) E.objs.push({ m: 'quad', mat: [mat], M: quadV(x, z, w, [-n[0], -n[1]]) });
      const a = n[0] == 0 ? [x - w / 2, z] : [x, z - w / 2], b = n[0] == 0 ? [x + w / 2, z] : [x, z + w / 2];
      E.segs.push({ a, b, y: [0, 10] });
    };
    const ehPorta = (i, j, lado) => PORTAS.some(([pi, pj, pl]) => {
      const viz = { n: [0, -1], s: [0, 1], o: [-1, 0], l: [1, 0] }[pl];
      return (pi == i && pj == j && pl == lado) || (pi + viz[0] == i && pj + viz[1] == j && { n: 's', s: 'n', o: 'l', l: 'o' }[pl] == lado);
    });
    for (let j = 0; j < PLANTA.length; j++) for (let i = 0; i < PLANTA[j].length; i++) {
      const a = area(i, j); if (!a) continue;
      const cx = X0 + i * T + T / 2, cz = Z0 - j * T - T / 2;
      piso(cx, cz, PISO[a]); forro(cx, cz);
      for (const [lado, di, dj] of [['n', 0, -1], ['s', 0, 1], ['o', -1, 0], ['l', 1, 0]]) {
        const v = area(i + di, j + dj);
        if (v === a) continue;
        if (i == 0 && j == 5 && lado == 'o') continue; // a passagem para a escola
        if (v && (lado == 's' || lado == 'l') && !ehPorta(i, j, lado)) continue; // parede entre duas áreas: faz uma vez só
        const ex = lado == 'o' ? cx - T / 2 : lado == 'l' ? cx + T / 2 : cx, ez = lado == 'n' ? cz + T / 2 : lado == 's' ? cz - T / 2 : cz;
        const eixo = lado == 'n' || lado == 's' ? 'x' : 'z';
        const n = { n: [0, -1], s: [0, 1], o: [1, 0], l: [-1, 0] }[lado]; // para dentro da área
        if (ehPorta(i, j, lado)) {
          if (v && (lado == 's' || lado == 'l')) continue; // a porta é feita pelo lado do corredor
          // porta de 5 no meio e dois pedaços de parede de 2,5
          const d = (k) => (eixo == 'x' ? [ex + k, ez] : [ex, ez + k]);
          muro(...d(-3.75), 2.5, n, fina, !!v); muro(...d(3.75), 2.5, n, fina, !!v);
          const Mq = (k) => quadV(ex + k * n[0] * 0.02, ez + k * n[1] * 0.02, 5, [k * n[0], k * n[1]]);
          const ba = eixo == 'x' ? [ex - 2.5, ez] : [ex, ez - 2.5], bb = eixo == 'x' ? [ex + 2.5, ez] : [ex, ez + 2.5];
          E.portas.push({ tipo: 'porta', pos: [ex, 5, ez], quads: [{ M: Mq(1), mat: porta, lado: '_DoorIn' }, { M: Mq(-1), mat: porta, lado: '_DoorOut' }], bar: { a: ba, b: bb, y: [0, 10] }, pai: 'AlaBeta' });
        } else muro(ex, ez, T, n, parede, !!v);
      }
    }
    // cadernos e itens novos (copiam o tamanho dos originais)
    const nb = E.spr.find((s) => s.n == '_nbSprite'), it = E.spr.find((s) => s.pai.endsWith('Pickup_BSODA'));
    const poe = (base, pai, tex, i, j) => E.spr.push(Object.assign({}, base, { pai, tex, M: base.M.slice(0, 12).concat([X0 + i * T + 5, base.M[13], Z0 - j * T - 5, 1]) }));
    poe(nb, 'Environment/Objects/Notebooks/BetaTeste1', 'Texture2D/SchoolHouse/PickUps/Notebook/_nbYellow.png', 2, 1);
    poe(nb, 'Environment/Objects/Notebooks/BetaBiblioteca', 'Texture2D/SchoolHouse/PickUps/Notebook/_nbRed.png', 8, 9);
    poe(nb, 'Environment/Objects/Notebooks/BetaLaboratorio', 'Texture2D/SchoolHouse/PickUps/Notebook/_nbGreen.png', 17, 7);
    poe(it, 'Environment/Objects/Pickups/Pickup_BSODA', 'Texture2D/SchoolHouse/PickUps/BSODA.png', 8, 1);
    poe(it, 'Environment/Objects/Pickups/Pickup_AlarmClock', 'Texture2D/SchoolHouse/PickUps/AlarmClockItem.png', 3, 8);
    poe(it, 'Environment/Objects/Pickups/Pickup_Teleporter', 'Texture2D/SchoolHouse/PickUps/TeleporterIcon.png', 16, 3);
    decora(E);
    // pontos de ronda: o corredor da ala vale como corredor, as salas como salas
    E.rondaCorr = [[X0 + 45, zc], [X0 + 105, zc], [X0 + 135, Z0 - 15], [X0 + 135, Z0 - 105]];
    E.rondaSala = [[X0 + 30, Z0 - 25], [X0 + 30, Z0 - 85], [X0 + 85, Z0 - 85], [X0 + 85, Z0 - 25], [X0 + 175, Z0 - 50]];
    E.totalCadernos = 10;
  }
  J.ganchos.monta.push((E, _J, modo) => { const f = J.betaFeat || {}; if (modo == 'beta' && !f.mapa && f.ala !== false) constroiAla(E); });

  /* ---------- tela de Beta Features ---------- */
  // padrão: tudo ligado menos o mapa aleatório; a escolha fica guardada no aparelho
  J.betaFeat = { mapa: false, reflex: true, cloudy: true, test: true, eventos: true, ala: true };
  try { Object.assign(J.betaFeat, JSON.parse(localStorage.getItem('baldiBeta') || '{}')); } catch (e) {}
  const marca = () => {
    document.querySelectorAll('.feat').forEach((b) => { b.classList.toggle('on', !!J.betaFeat[b.dataset.f]); b.classList.toggle('off', b.dataset.f == 'ala' && J.betaFeat.mapa); });
  };
  document.querySelectorAll('.feat').forEach((b) => (b.onclick = () => { J.betaFeat[b.dataset.f] = !J.betaFeat[b.dataset.f]; try { localStorage.setItem('baldiBeta', JSON.stringify(J.betaFeat)); } catch (e) {} marca(); }));
  J.abreBeta = () => { marca(); $('menu').hidden = true; $('telaBeta').hidden = false; };
  $('betaVolta').onclick = () => { $('telaBeta').hidden = true; $('menu').hidden = false; };
  $('betaSegue').onclick = () => { $('telaBeta').hidden = true; J.escolheDificuldade('beta'); };

  /* ---------- personagens novos (vindos do Baldi's Basics Plus) ---------- */
  const IMG = (n) => 'beta/img2/' + n + '.png', SOM = (n) => 'beta/sons2/' + n;
  const quadro2 = (n, k) => IMG(n + String(k).padStart(2, '0'));
  function npcSprite(tex, alt) {
    const m = J.sprite(tex, alt, alt); m.visible = false; return m;
  }
  // o jogador está olhando para (x,z)? (dentro de um cone na frente da câmera e sem parede no meio)
  const olhando = (G, x, z, abertura = 0.4, max = 90) => {
    const p = G.p, dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
    if (d > max || !J.mundo.ve(p.x, p.z, x, z)) return false;
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    return (dx * fx + dz * fz) / d > Math.cos(abertura);
  };
  const corredor = () => J.ronda(false);

  J.ganchos.inicia.push((G) => {
    if (G.modo != 'beta') return;
    const N = G.npcs, F = J.betaFeat || {};
    G.escala = 1;

    /* Dr. Reflex: anda pelos corredores parando e virando; só enxerga o que está na frente dele.
       Quando te vê, corre e faz o teste de reflexo: toque na mão com o círculo bem rápido.
       Se você fugir no meio do teste, ele volta com o martelo e te esmaga (fica lento por 30 s). */
    if (F.reflex !== false) {
      const r0 = J.E.rondaSala ? J.E.rondaSala[J.E.rondaSala.length - 1] : J.ronda(true);
      N.reflex = Object.assign(J.Agente('Dr. Reflex', r0[0], r0[1], 9), {
        spr: npcSprite(IMG('reflex'), 1.9), oy: 4.6, estado: 'anda', dir: 0, pausa: 0, cool: 10, fala: null, t: 0,
        ativa() { this.ativo = true; this.spr.visible = true; this.vagar(); },
        diz(n, forca) { if (forca) M.para(this.fala); if (forca || !this.fala || this.fala.fim) this.fala = M.som(SOM('DrR_' + n), { de: this, alcance: 110 }); },
        vagar() { const r = corredor(); this.vai(r[0], r[1]); },
        // enxerga só na frente (cone de ~70° para cada lado)
        enxerga() {
          const p = G.p, dx = p.x - this.x, dz = p.z - this.z, d = Math.hypot(dx, dz);
          if (d > 80 || !J.ve(this)) return false;
          return d < 6 || (dx * Math.sin(this.dir) + dz * Math.cos(this.dir)) / d > 0.35;
        },
        tique(dt) { this.cool -= dt; this.t += dt; },
        fixo(dt) {
          const p = G.p, d = J.dist(this, p);
          if (this.vx || this.vz) this.dir = Math.atan2(this.vx, this.vz);
          if (this.estado == 'anda') {
            if (this.cool <= 0 && this.enxerga()) { this.estado = 'corre'; this.diz('Normal_TakeMyTest', true); }
            else if (this.chegou()) { if ((this.pausa += dt) > 2) { this.pausa = 0; this.vagar(); } }
            this.anda(dt, 9);
          } else if (this.estado == 'corre') {
            if (!J.ve(this) && d > 15) { this.estado = 'anda'; this.vagar(); }
            this.vai(p.x, p.z); this.anda(dt, 24);
            if (d < 5 && !G.aprendendo && !p.corda) teste.comeca(this);
          } else if (this.estado == 'teste') {
            this.cam = []; this.anda(dt, 0);
            if (d > 14) { teste.fecha(); this.estado = 'bravo'; this.bravoT = 45; this.diz('Angry_HeyGetBack', true); }
          } else if (this.estado == 'bravo') {
            this.bravoT -= dt;
            if (J.ve(this) || this.cam.length == 0) this.vai(p.x, p.z);
            this.anda(dt, 20);
            if (Math.random() < dt * 0.15) this.diz('Angry_Random_' + M.rndInt(0, 2));
            // esmaga quem encostar
            for (const n of Object.values(N)) if (n !== this && n.ativo && J.dist(n, this) < 3.5 && !(n.esmagado > 0)) { n.esmagado = 30; M.som(SOM('Boink'), { de: n }); }
            if (d < 3.5 && G.p.botas <= 0) {
              p.esmagado = 30; M.som(SOM('DrR_Hammer'), { de: this }); M.som(SOM('Boink'));
              J.aviso('Esmagado! Você está mais lento', 2.5);
              p.yaw = Math.atan2(-(this.x - p.x), -(this.z - p.z));
              this.estado = 'anda'; this.cool = 45; this.vagar();
            } else if (this.bravoT <= 0) { this.estado = 'anda'; this.cool = 20; this.vagar(); }
          }
        },
        anima() {
          const mexe = Math.hypot(this.vx, this.vz) > 1, k = Math.floor(this.t * 12);
          if (this.estado == 'bravo') J.troca(this.spr, quadro2('reflex_martelo', k % 14));
          else if (this.estado == 'teste') J.troca(this.spr, teste.quadro || IMG('reflex'));
          else J.troca(this.spr, mexe ? quadro2('reflex_anda', k % 16) : IMG('reflex'));
        },
      });
    }

    /* Cloudy Copter: flutua pelos corredores e de vez em quando para e sopra vento por 10 a 30 s
       ao longo do corredor. O vento empurra você e muda a velocidade de quem anda nele. */
    if (F.cloudy !== false) {
      const c0 = corredor();
      N.cloudy = Object.assign(J.Agente('Cloudy Copter', c0[0], c0[1], 8), {
        spr: npcSprite(IMG('cloudy'), 1.6), oy: 6, sopra: 0, prox: M.rnd(8, 15), dirV: [1, 0], alcance: 0, som: null, t: 0, solido: 0,
        ativa() { this.ativo = true; this.spr.visible = true; this.vagar(); },
        vagar() { const r = corredor(); this.vai(r[0], r[1]); },
        tique(dt) {
          this.t += dt;
          this.oy = 6 + Math.sin(this.t * 2) * 0.4;
          if (this.sopra > 0) {
            if ((this.sopra -= dt) <= 0) { M.para(this.som); this.som = null; this.faixas.visible = false; this.prox = M.rnd(12, 25); this.vagar(); return; }
            this.textura.offset.x -= dt * 1.6; // as riscas correm na direção do vento
          } else if ((this.prox -= dt) <= 0) this.comecaVento();
        },
        // escolhe o lado do corredor mais comprido e sopra para lá
        comecaVento() {
          let melhor = null;
          for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = J.mundo.raio(this.x, this.z, d[0], d[1], 120); if (!melhor || a > melhor[1]) melhor = [d, a]; }
          if (melhor[1] < 20) { this.prox = 3; return; }
          this.dirV = melhor[0]; this.alcance = melhor[1]; this.sopra = M.rnd(10, 30); this.cam = [];
          this.som = M.som(SOM('Cmlo_Blowing'), { de: this, loop: true, alcance: 120 });
          // três faixas verticais ao longo do corredor com riscas de vento andando
          if (!this.faixas) {
            const t = M.tex(IMG('vento')).clone(); t.needsUpdate = true;
            t.wrapS = t.wrapT = THREE.RepeatWrapping; t.center.set(0.5, 0.5); t.rotation = Math.PI / 2;
            this.textura = t;
            const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
            this.faixas = new THREE.Group();
            for (const l of [-2.6, 0.2, 2.8]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.position.set(0.5, 0.5, l); this.faixas.add(m); }
            J.cena.add(this.faixas);
          }
          const f = this.faixas;
          f.children.forEach((m) => { m.scale.set(1, 1, 1); });
          f.scale.set(this.alcance, 8, 1); f.position.set(this.x, 0.5, this.z);
          f.rotation.set(0, Math.atan2(-this.dirV[1], this.dirV[0]), 0);
          this.textura.repeat.set(this.alcance / 12, 1);
          f.visible = true;
        },
        // dentro da faixa do vento?
        noVento(x, z) {
          if (!(this.sopra > 0)) return false;
          const dx = x - this.x, dz = z - this.z, ao = dx * this.dirV[0] + dz * this.dirV[1], lado = Math.abs(dx * this.dirV[1] - dz * this.dirV[0]);
          return ao > 0 && ao < this.alcance && lado < 5;
        },
        fixo(dt) { if (this.sopra > 0) { this.anda(dt, 0); return; } if (this.chegou()) this.vagar(); this.anda(dt, 8); },
      });
      const cl = N.cloudy;
      G.vento = (x, z, ux, uz) => (cl.noVento(x, z) ? Math.max(0.3, 1 + (ux * cl.dirV[0] + uz * cl.dirV[1]) * 0.6) : 1);
      G.empurraJogador = (x, z) => (cl.noVento(x, z) && G.p.botas <= 0 ? [cl.dirV[0] * 11, cl.dirV[1] * 11] : [0, 0]);
    }

    /* The Test: aparece num corredor. Olhar para ele deixa o tempo mais lento e as luzes piscam;
       quando você olha para outro lado ele some e aparece em outro corredor.
       Olhar demais faz ele explodir, e aí tudo fica mais rápido por um minuto. */
    if (F.test !== false) {
      const t0 = corredor();
      N.test = Object.assign(J.Agente('The Test', t0[0], t0[1], 0), {
        spr: npcSprite(IMG('test'), 2.2), oy: 5.2, olhado: 0, visto: false, som: null, morto: false, rapido: 0, explosao: null, solido: 0,
        ativa() { this.ativo = true; this.spr.visible = true; this.muda(); },
        // vai para um corredor longe da vista
        muda() { for (let k = 0; k < 20; k++) { const r = corredor(); if (Math.hypot(r[0] - G.p.x, r[1] - G.p.z) > 40) { this.x = r[0]; this.z = r[1]; break; } } },
        tique(dt) {
          dt = dt / (G.escala || 1); // ele não sofre o próprio efeito
          if (this.morto) {
            if (this.rapido > 0 && (this.rapido -= dt) <= 0) { G.escala = 1; J.evento(''); }
            if (this.explosao) { this.explosao.k += dt * 20; if (this.explosao.k >= 13) { J.cena.remove(this.explosao.m); this.explosao = null; } else J.troca(this.explosao.m, quadro2('explosao', Math.floor(this.explosao.k))); }
            return;
          }
          const vendo = olhando(G, this.x, this.z, 0.45, 100);
          if (vendo) {
            if (!this.visto) { this.visto = true; M.som(SOM('LAt_Sighted'), { de: this }); this.som = M.som(SOM('LAt_Loop'), { de: this, loop: true, alcance: 120 }); }
            this.olhado += dt;
            G.escala = Math.max(0.3, G.escala - dt * 0.5);
            // luzes piscando
            J.cena.fog = Math.random() < 0.15 ? new THREE.Fog(0x000000, 1, 25 + Math.random() * 40) : null;
            if (this.olhado > 5 && !this.aviso) { this.aviso = true; M.som(SOM('LAt_Buildup'), { de: this }); }
            if (this.olhado > 8) this.explode();
          } else {
            if (this.visto) { this.visto = false; M.para(this.som); J.cena.fog = null; this.muda(); this.aviso = false; }
            this.olhado = Math.max(0, this.olhado - dt * 0.5);
            G.escala = Math.min(1, G.escala + dt * 0.6);
          }
        },
        explode() {
          this.morto = true; M.para(this.som); J.cena.fog = null;
          M.som(SOM('Explosion'), { de: this, alcance: 200 });
          const m = J.sprite(quadro2('explosao', 0), 6, 6); m.position.set(this.x, 5, this.z); this.explosao = { m, k: 0 };
          J.troca(this.spr, IMG('test_caido')); this.spr.scale.y = this.spr.scale.x * 0.7; this.oy = this.spr.scale.y * 0.4;
          G.escala = 1.35; this.rapido = 60; J.aviso('The Test explodiu! Tudo ficou mais rápido', 3);
        },
        fixo() {},
        anima() { if (!this.morto) this.spr.position.y = this.oy + (this.visto ? Math.sin(G.t * (12 + this.olhado * 4)) * 0.25 : 0); },
      });
    }
    for (const n of Object.values(N)) if (n.spr) n.spr.position.set(n.x, n.oy, n.z);
    G.ev = { prox: 45, atual: null, fim: 0 };
    J.escuro = false; J.correLiberado = false;
  });

  /* ---------- teste de reflexo do Dr. Reflex ---------- */
  const teste = {
    dr: null, fase: '', t: 0, lado: 0, quadro: null, erros: 0,
    comeca(dr) {
      const G = J.G, p = G.p;
      this.dr = dr; dr.estado = 'teste'; this.erros = 0;
      p.yaw = Math.atan2(-(dr.x - p.x), -(dr.z - p.z)); // vira para ele
      $('reflexo').hidden = false; this.rodada();
    },
    rodada() {
      this.fase = 'pensa'; this.t = M.rnd(1.6, 2.6); this.lado = Math.random() < 0.5 ? 0 : 1; // 0: círculo à esquerda
      this.quadro = quadro2(this.lado ? 'maos_dir' : 'maos_esq', 0); this.mostra();
      this.dr.diz('Think_Intro', true);
    },
    mostra() { $('reflexoImg').src = 'assets/' + this.quadro; },
    tique(dt) {
      if (!this.dr || $('reflexo').hidden) return;
      this.t -= dt;
      if (this.fase == 'pensa' && this.t <= 0) { this.fase = 'abre'; this.t = 0; this.k = 0; this.dr.diz('Fast', true); }
      else if (this.fase == 'abre') {
        this.k += dt * 24; this.quadro = quadro2(this.lado ? 'maos_dir' : 'maos_esq', Math.min(5, Math.floor(this.k))); this.mostra();
        if (this.k >= 5) { this.fase = 'espera'; this.t = J.G.dif.reflexo || 1; }
      } else if (this.fase == 'espera' && this.t <= 0) this.falha('TooSlow');
      else if (this.fase == 'erro' && this.t <= 0) this.rodada();
    },
    toque(ladoTocado) {
      if (this.fase != 'espera') return;
      if (ladoTocado === this.lado) {
        this.dr.diz(this.erros ? 'GoodJob' : 'FirstTry', true); M.som(SOM('DrR_HitCircle'));
        J.aviso(this.erros ? 'Passou no teste!' : 'Passou de primeira!', 2);
        this.fecha(); this.dr.estado = 'anda'; this.dr.cool = 45; this.dr.vagar();
      } else this.falha('Wrong');
    },
    falha(n) { this.erros++; this.fase = 'erro'; this.t = 1.6; this.dr.diz(n, true); this.quadro = IMG('reflex'); this.mostra(); },
    fecha() { $('reflexo').hidden = true; this.fase = ''; },
  };
  $('reflexo').addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); teste.toque(e.clientX > innerWidth / 2 ? 1 : 0); });
  J.ganchos.tique.push((G, dt) => { if (G.modo == 'beta') teste.tique(dt); });
  J.testeReflexo = teste;

  /* ---------- eventos ---------- */
  const EVENTOS = {
    apagao: {
      nome: 'APAGÃO', dur: 25,
      ini() { J.escuro = true; J.cena.fog = new THREE.Fog(0x000000, 1, 20); M.som('beta/sons/apagao'); },
      fim() { J.escuro = false; J.cena.fog = null; },
    },
    incendio: {
      nome: 'SIMULADO DE INCÊNDIO', dur: 20, sub: 'pode correr, o Diretor não liga',
      ini(G) {
        J.correLiberado = true; G.alarme = M.som('beta/sons/alarme', { loop: true, vol: 0.5 });
        for (const d of G.portas) if (d.tipo != 'vaivem' && d.trava <= 0) J.abrePorta(d, 'npc');
      },
      tique(G) { for (const d of G.portas) if (d.tipo != 'vaivem' && d.trava <= 0) d.tempo = Math.max(d.tempo, 1); },
      fim(G) { J.correLiberado = false; M.para(G.alarme); },
    },
    chuva: {
      nome: 'CHUVA DE CADERNOS', dur: 30, sub: 'cadernos dourados dão itens',
      ini(G) {
        G.dourados = [];
        for (let k = 0; k < 3; k++) {
          const r = J.ronda(true), m = J.sprite('Texture2D/SchoolHouse/PickUps/Notebook/_nbYellow.png', 2, 2);
          m.material.color.setRGB(1, 0.85, 0.2); m.position.set(r[0], 4, r[1]);
          const o = { tipo: 'caderno', bonus: true, m, x: r[0], z: r[1], ativo: true };
          G.objs.push(o); G.dourados.push(o);
        }
        M.som('Sounds/Items/respawn');
      },
      fim(G) { for (const o of G.dourados || []) { o.ativo = false; o.m.visible = false; } },
    },
    lanche: {
      nome: 'HORA DO LANCHE', dur: 40, sub: 'barras de energia pela escola',
      ini(G) {
        G.lanches = [];
        for (let k = 0; k < 4; k++) {
          const r = J.ronda(false), m = J.sprite('Texture2D/SchoolHouse/PickUps/EnergyFlavoredZestyBar.png', 2, 2);
          m.position.set(r[0], 4, r[1]);
          const o = { tipo: 'item', id: 1, m, x: r[0], z: r[1], y0: 4, ativo: true };
          G.objs.push(o); G.lanches.push(o);
        }
      },
      fim(G) { for (const o of G.lanches || []) { o.ativo = false; o.m.visible = false; } },
    },
    recreio: {
      nome: 'SINAL DO RECREIO', dur: 12, sub: 'o Baldi foi ver o sinal',
      ini(G) {
        const r = J.ronda(true);
        M.som('Sounds/Items/bell', { de: { x: r[0], z: r[1] }, alcance: 400 });
        G.npcs.baldi.ouve(r[0], r[1], 6);
      },
    },
  };
  J.pegaBonus = (o) => {
    const G = J.G, id = [1, 2, 3, 4, 6, 7, 8, 9, 10][M.rndInt(0, 8)];
    J.pegaItem(id); M.som('Sounds/Items/respawn');
    J.aviso('Caderno dourado: ganhou um item!', 2);
  };
  J.ganchos.tique.push((G, dt) => {
    if (G.modo != 'beta' || !G.spoop || (J.betaFeat || {}).eventos === false) return;
    const ev = G.ev, mostra = () => J.evento(ev.atual ? `${EVENTOS[ev.atual].nome}  ${Math.ceil(ev.fim)}s` + (EVENTOS[ev.atual].sub ? `\n${EVENTOS[ev.atual].sub}` : '') : '');
    if (ev.atual) {
      const e = EVENTOS[ev.atual];
      e.tique && e.tique(G, dt);
      if ((ev.fim -= dt) <= 0) { e.fim && e.fim(G); ev.atual = null; ev.prox = M.rnd(55, 85); }
      mostra();
    } else if ((ev.prox -= dt) <= 0) {
      const lista = Object.keys(EVENTOS).filter((k) => k != ev.ultimo);
      ev.atual = lista[M.rndInt(0, lista.length - 1)]; ev.ultimo = ev.atual; ev.fim = EVENTOS[ev.atual].dur;
      EVENTOS[ev.atual].ini(G);
      mostra();
    }
  });
  J.EVENTOS = EVENTOS;
  // ao sair do jogo, desliga o que um evento deixou ligado
  const menuOriginal = J.menu;
  J.menu = () => { J.escuro = false; J.correLiberado = false; if (J.cena) J.cena.fog = null; teste.fecha(); menuOriginal(); };
})();
