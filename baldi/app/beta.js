// Modo Beta Tester: testa o que vem por aí.
// - Ala Beta: escola maior, aberta no corredor leste, com salas, biblioteca, laboratório e 3 cadernos a mais.
// - Personagens novos: Robô Inspetor (entrega sua posição ao Baldi) e Fantasma do Apagão.
// - Eventos aleatórios: Apagão, Simulado de Incêndio, Chuva de Cadernos, Hora do Lanche e Sinal do Recreio.
(function () {
  'use strict';
  const J = window.Jogo, M = window.Motor, $ = (id) => document.getElementById(id);
  J.SONS_EXTRA = ['alarme', 'apagao', 'bipe', 'fantasma', 'fantasma_respira', 'robo_TargetFound', 'robo_TargetLost', 'robo_WhereAreYou', 'robo_Initializing', 'robo_BackupRequested', 'robo_Ouch', 'robo_WhereDidYouGo'].map((n) => 'beta/sons/' + n);
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

  function constroiAla(E) {
    const mi = (n) => E.mats.findIndex((m) => m.n === n);
    const parede = mi('WhiteBrickWall'), fina = mi('WhiteBrickWallThin'), teto = mi('Ceiling'), porta = mi('Door_0');
    // abre a parede externa do corredor leste onde a ala encosta (x=120, z de -290 a -300)
    const zc = Z0 - 5 * T - 5;
    E.objs = E.objs.filter((o) => !(o.m == 'quad' && Math.abs(o.M[12] - X0) < 0.2 && Math.abs(o.M[14] - zc) < 0.2 && Math.abs(o.M[13] - 5) < 0.2));
    E.segs = E.segs.filter((s) => !(Math.abs(s.a[0] - X0) < 0.2 && Math.abs(s.b[0] - X0) < 0.2 && Math.abs((s.a[1] + s.b[1]) / 2 - zc) < 0.2));
    const piso = (x, z, mat) => E.objs.push({ m: 'quad', mat: [mi(mat)], M: [0, 0, -T, 0, -T, 0, 0, 0, 0, 1, 0, 0, x, 0, z, 1] });
    const forro = (x, z) => E.objs.push({ m: 'quad', mat: [teto], M: [T, 0, 0, 0, 0, 0, -T, 0, 0, -1, 0, 0, x, 10, z, 1] });
    // parede de largura w centrada em (x,z); 'x' = corre ao longo do eixo x
    const muro = (x, z, w, eixo, mat = parede) => {
      const M = eixo == 'x' ? [w, 0, 0, 0, 0, 10, 0, 0, 0, 0, 1, 0, x, 5, z, 1] : [0, 0, w, 0, 0, 10, 0, 0, 1, 0, 0, 0, x, 5, z, 1];
      E.objs.push({ m: 'quad', mat: [mat], M });
      const a = eixo == 'x' ? [x - w / 2, z] : [x, z - w / 2], b = eixo == 'x' ? [x + w / 2, z] : [x, z + w / 2];
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
        if (ehPorta(i, j, lado)) {
          if (v && (lado == 's' || lado == 'l')) continue; // a porta é feita pelo lado do corredor
          // porta de 5 no meio e dois pedaços de parede de 2,5
          const d = (k) => (eixo == 'x' ? [ex + k, ez] : [ex, ez + k]);
          muro(...d(-3.75), 2.5, eixo, fina); muro(...d(3.75), 2.5, eixo, fina);
          const Mq = (s) => (eixo == 'x' ? [5, 0, 0, 0, 0, 10, 0, 0, 0, 0, 1, 0, ex, 5, ez + s, 1] : [0, 0, 5, 0, 0, 10, 0, 0, 1, 0, 0, 0, ex + s, 5, ez, 1]);
          const ba = eixo == 'x' ? [ex - 2.5, ez] : [ex, ez - 2.5], bb = eixo == 'x' ? [ex + 2.5, ez] : [ex, ez + 2.5];
          E.portas.push({ tipo: 'porta', pos: [ex, 5, ez], quads: [{ M: Mq(0.02), mat: porta, lado: '_DoorIn' }, { M: Mq(-0.02), mat: porta, lado: '_DoorOut' }], bar: { a: ba, b: bb, y: [0, 10] }, pai: 'AlaBeta' });
        } else muro(ex, ez, T, eixo);
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
    // pontos de ronda: o corredor da ala vale como corredor, as salas como salas
    E.rondaCorr = [[X0 + 45, zc], [X0 + 105, zc], [X0 + 135, Z0 - 15], [X0 + 135, Z0 - 105]];
    E.rondaSala = [[X0 + 30, Z0 - 25], [X0 + 30, Z0 - 85], [X0 + 85, Z0 - 85], [X0 + 85, Z0 - 25], [X0 + 175, Z0 - 50]];
    E.totalCadernos = 10;
  }
  J.ganchos.monta.push((E, _J, modo) => { if (modo == 'beta') constroiAla(E); });

  /* ---------- personagens novos ---------- */
  function npcSprite(tex, alt) {
    const m = J.sprite(tex, alt, alt); m.visible = false; return m;
  }
  J.ganchos.inicia.push((G) => {
    if (G.modo != 'beta') return;
    const mundo = J.mundo, N = G.npcs;
    // Robô Inspetor: anda pelos corredores e, quando te vê, avisa o Baldi onde você está
    const r0 = J.E.rondaCorr[1];
    N.robo = Object.assign(J.Agente('Robô Inspetor', r0[0], r0[1], 12), {
      spr: npcSprite('beta/img/robo.png', 2.4), oy: 3.2, viu: false, cool: 0, aviso: 0, tonto: 0, fala: null,
      ativa() { this.ativo = true; this.spr.visible = true; this.diz('Initializing'); this.vagar(); },
      diz(n) { if (!this.fala || this.fala.fim) this.fala = M.som('beta/sons/robo_' + n, { de: this, alcance: 90 }); },
      vagar() { const r = J.ronda(false); this.vai(r[0], r[1]); this.cool = 1; },
      tique(dt) { this.cool -= dt; this.aviso -= dt; this.tonto -= dt; },
      fixo(dt) {
        if (this.empurro > 0 && this.tonto <= 0) { this.diz('Ouch'); this.tonto = 4; }
        if (this.tonto > 0) { this.anda(dt, 0); return; }
        const p = G.p, d = J.dist(this, p);
        if (J.ve(this) && d < 70 && !J.escuro) {
          if (!this.viu) { this.diz('TargetFound'); M.som('beta/sons/bipe', { de: this }); }
          this.viu = true;
          // fica de olho de longe e chama o Baldi a cada 3 segundos
          if (d > 18) this.vai(p.x, p.z); else this.cam = [];
          if (this.aviso <= 0) { this.aviso = 3; G.npcs.baldi.ouve(p.x, p.z, 2); M.som('beta/sons/bipe', { de: this, vol: 0.6 }); if (Math.random() < 0.3) this.diz('BackupRequested'); }
          this.cool = 1.5;
        } else if (this.viu && this.cool <= 0) { this.viu = false; this.diz(Math.random() < 0.5 ? 'TargetLost' : 'WhereDidYouGo'); this.vagar(); }
        else if (this.parado() && this.cool <= 0) { this.vagar(); if (Math.random() < 0.15) this.diz('WhereAreYou'); }
        this.anda(dt, this.viu ? 16 : 12);
      },
    });
    // Fantasma do Apagão: só aparece no escuro, atravessa paredes e te deixa sem fôlego
    N.fantasma = Object.assign(J.Agente('Fantasma', 0, 0, 7), {
      spr: npcSprite('beta/img/fantasma.png', 2.2), oy: 4, abrePortas: false,
      ativa() {},
      surge() {
        const p = G.p, a = Math.random() * Math.PI * 2;
        this.x = p.x + Math.cos(a) * 45; this.z = p.z + Math.sin(a) * 45;
        this.ativo = true; this.spr.visible = true; M.som('beta/sons/fantasma', { de: this, alcance: 100 });
      },
      some() { this.ativo = false; this.spr.visible = false; M.para(this.respira); },
      tique(dt) {
        if (!J.escuro) return this.some();
        const p = G.p, dx = p.x - this.x, dz = p.z - this.z, d = Math.hypot(dx, dz);
        this.x += (dx / d) * this.vel * dt; this.z += (dz / d) * this.vel * dt;
        if (d < 25 && (!this.respira || this.respira.fim)) this.respira = M.som('beta/sons/fantasma_respira', { de: this, alcance: 40 });
        if (d < 2.5) { p.est = -5; J.aviso('O fantasma te assustou! Sem fôlego!', 2.5); this.some(); }
      },
      fixo() {},
    });
    N.fantasma.spr.material.transparent = true; N.fantasma.spr.material.opacity = 0.75; N.fantasma.spr.material.alphaTest = 0.05;
    for (const n of [N.robo, N.fantasma]) n.spr.position.set(n.x, n.oy, n.z);
    G.ev = { prox: 45, atual: null, fim: 0 };
    J.escuro = false; J.correLiberado = false;
  });

  /* ---------- eventos ---------- */
  const EVENTOS = {
    apagao: {
      nome: 'APAGÃO', dur: 25,
      ini(G) { J.escuro = true; J.cena.fog = new THREE.Fog(0x000000, 1, 20); M.som('beta/sons/apagao'); G.npcs.fantasma.surge(); },
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
    if (G.modo != 'beta' || !G.spoop) return;
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
  J.menu = () => { J.escuro = false; J.correLiberado = false; if (J.cena) J.cena.fog = null; menuOriginal(); };
})();
