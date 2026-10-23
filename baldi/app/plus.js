// Novidades do Beta vindas do Baldi's Basics Plus:
// - Pontos (como os You Thought Points): caderno com pelo menos 2 acertos, símbolos de mais pelo mapa, teste do Dr. Reflex,
//   corda da Playtime e chegar a tempo na aula da Mrs. Pomp. Gaste na loja do Johnny (porta na parede de um corredor).
// - Porta amarela de uma direção: setas verdes de um lado (abre), sinal vermelho do outro (não abre).
// - Beans: cospe chiclete em linha reta; quem é atingido fica bem devagar por 10 s (a tesoura corta).
// - Chalkles: aparece no quadro de uma sala; fique 15 s lá dentro e ele sai, ri e tranca as portas por 15 s.
// - Mrs. Pomp: te convida para a aula dela (2 minutos). Chegou a tempo, ganha pontos; atrasou, ela te arrasta para lá.
(function () {
  'use strict';
  const J = window.Jogo, M = window.Motor, $ = (id) => document.getElementById(id);
  const P = 'beta/plus/', IMG = (n) => P + n + '.png', SOM = (n) => P + n;
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const BEANS = (k) => IMG('beans' + String(k).padStart(2, '0'));
  J.SONS_EXTRA = (J.SONS_EXTRA || []).concat(['BenBlowing', 'Ben_HeyYou', 'Ben_Prepare', 'Ben_Spit', 'Ben_Splat', 'Ben_Sorry', 'Ben_Spit_WatchOut', 'Ben_Spit_HeadsUp', 'Ben_Gum_Whoosh',
    'Chk_Laugh', 'Chk_Spawn', 'NoL_YouThere', 'NoL_RemindingYou', 'NoL_CheckMap', 'NoL_JustInTime', 'NoL_TimesUp', 'NoL_Scream', 'NoL_ClassDismissed',
    'Jon_Welcome', 'Jon_Hi', 'Jon_Buy1', 'Jon_Buy2', 'Jon_Buy3', 'Jon_ThankYou', 'Jon_TooMuch1', 'Jon_SeeLater', 'YTPPickup_0', 'YTPPickup_1', 'YTPPickup_2'].map(SOM));
  J.QUADROS_EXTRA = (J.QUADROS_EXTRA || []).concat([...Array(28).keys()].map(BEANS),
    ['chiclete', 'chalkles', 'quadro', 'pomp', 'pomp_brava', 'johnny', 'mais_verde', 'mais_prata', 'mais_ouro', 'mais_azul', 'loja_porta_fora', 'loja_porta_dentro'].map(IMG),
    ['0Certo', '0Errado', '60Certo', '60Errado'].map((n) => 'Texture2D/SchoolHouse/DoorTextures/SwingDoor/SwingDoor' + n + '.png'));
  const tem = (k) => !!(J.F && J.F[k]);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const embaralha = (l) => { for (let i = l.length - 1; i > 0; i--) { const k = M.rndInt(0, i); [l[i], l[k]] = [l[k], l[i]]; } return l; };
  const plano = (tex, w, h, x, y, z, fx, fz, extra = {}) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial(Object.assign({ map: M.tex(tex) }, extra)));
    m.position.set(x, y, z); m.rotation.y = Math.atan2(fx, fz); J.cena.add(m); return m;
  };

  /* ---------- lugar livre: nada de objeto nascendo dentro de móvel, parede ou outro objeto ---------- */
  J.lugarLivre = (x, z, r = 2) => {
    const G = J.G, o = { x, z };
    J.mundo.resolve(o, r);
    if (Math.hypot(o.x - x, o.z - z) > 0.05) return false;
    for (const c of J.E.caixas) { // móveis (a caixa girada, no chão)
      const dx = x - c.c[0], dz = z - c.c[2], co = Math.cos(c.ang || 0), si = Math.sin(c.ang || 0);
      const lx = Math.abs(dx * co + dz * si) - c.h[0], lz = Math.abs(-dx * si + dz * co) - c.h[2];
      if (Math.hypot(Math.max(0, lx), Math.max(0, lz)) < r) return false;
    }
    if (G) for (const ob of G.objs) if (ob.x !== undefined && ob.ativo !== false && Math.hypot(ob.x - x, ob.z - z) < r + 1.5) return false;
    for (const s of J.E.spr) if (!s.pai.startsWith('NPC/') && Math.hypot(s.M[12] - x, s.M[14] - z) < r + 0.5) return false;
    return true;
  };

  /* ---------- salas: o que fica atrás de cada porta comum (achado pela navegação) ---------- */
  function achaSalas(G) {
    const N = J.nav, W = N.W, bloq = new Set(), salas = [];
    const comuns = G.portas.filter((d) => d.tipo != 'vaivem');
    for (const d of comuns) for (const k of celulasPorta(d)) bloq.add(k);
    for (const d of comuns) {
      if (d === G.diretoria || d.tipo == 'prof' || /MysteryDoor/.test(d.tex.f)) continue;
      const s = d.seg, vx = s.bx - s.ax, vz = s.bz - s.az, L = Math.hypot(vx, vz) || 1, n = [-vz / L, vx / L];
      for (const sg of [1, -1]) {
        const [i, j] = N.cel(d.x + n[0] * sg * 3.75, d.z + n[1] * sg * 3.75);
        if (!N.ok(i, j)) continue;
        const vis = new Set([j * W + i]), fila = [j * W + i];
        let grande = false;
        for (let q = 0; q < fila.length; q++) {
          if (vis.size > 1400) { grande = true; break; }
          const k = fila[q], ci = k % W, cj = (k / W) | 0;
          for (const [di, dj] of D4) {
            const ni = ci + di, nj = cj + dj, nk = nj * W + ni;
            if (!N.ok(ni, nj) || vis.has(nk) || bloq.has(nk) || !N.passa(ci, cj, di, dj)) continue;
            vis.add(nk); fila.push(nk);
          }
        }
        if (grande || vis.size < 40) continue;
        let cx = 0, cz = 0;
        for (const k of vis) { cx += N.x0 + ((k % W) + 0.5) * 2.5; cz += N.z0 + (((k / W) | 0) + 0.5) * 2.5; }
        const sala = { porta: d, cel: vis, n: [n[0] * sg, n[1] * sg], centro: [cx / vis.size, cz / vis.size] };
        sala.tem = (x, z) => { const [a, b] = N.cel(x, z); return sala.cel.has(b * W + a); };
        sala.portas = comuns.filter((p) => p === d || sala.tem(p.x + 1, p.z) || sala.tem(p.x - 1, p.z) || sala.tem(p.x, p.z + 1) || sala.tem(p.x, p.z - 1));
        sala.aula = G.objs.some((o) => o.tipo == 'caderno' && sala.tem(o.x, o.z)) || vis.size > 150;
        salas.push(sala);
        break;
      }
    }
    return salas;
  }
  // células da navegação em cima da linha de uma porta
  function celulasPorta(d, raio = 1.6) {
    const N = J.nav, s = d.seg, out = [];
    const [i0, j0] = N.cel(Math.min(s.ax, s.bx) - 2, Math.min(s.az, s.bz) - 2), [i1, j1] = N.cel(Math.max(s.ax, s.bx) + 2, Math.max(s.az, s.bz) + 2);
    const vx = s.bx - s.ax, vz = s.bz - s.az, L2 = vx * vx + vz * vz || 1;
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const x = N.x0 + (i + 0.5) * 2.5, z = N.z0 + (j + 0.5) * 2.5, t = Math.max(0, Math.min(1, ((x - s.ax) * vx + (z - s.az) * vz) / L2));
      if (Math.hypot(x - (s.ax + vx * t), z - (s.az + vz * t)) < raio) out.push(j * N.W + i);
    }
    return out;
  }
  const trancaSala = (G, sala, t) => { for (const d of sala.portas) { d.trava = t; d.aberta = false; d.seg.ativo = true; J.mostraPorta(d); } };

  /* ---------- pontos ---------- */
  function hudPontos(G) {
    const el = $('pontos'); el.hidden = !tem('loja');
    el.innerHTML = `<img src="assets/${IMG('mais_verde')}" alt="">${G.pontos} pontos`;
  }
  J.ganhaPontos = (n, motivo) => {
    const G = J.G;
    if (!G || !tem('loja') || n <= 0) return;
    G.pontos += n; hudPontos(G);
    J.aviso(`+${n} pontos${motivo ? ' ' + motivo : ''}`, 1.8);
    M.som(SOM('YTPPickup_' + (n >= 100 ? 2 : n >= 50 ? 1 : 0)), { vol: 0.8 });
  };
  J.ganchos.fimConta.push((G, acertos) => { if (acertos >= 2) J.ganhaPontos(acertos >= 3 ? 50 : 25, 'pelo caderno'); });

  // símbolos de mais espalhados (verde 25, prata 50, ouro 100, azul 250)
  const MAIS = [['mais_verde', 25, 60], ['mais_prata', 50, 25], ['mais_ouro', 100, 12], ['mais_azul', 250, 3]];
  function espalhaMais(G, salas) {
    const N = J.nav, ini = [G.p.x, G.p.z], fora = (x) => (J.E.porao && x > J.E.porao.OX - 6) || (J.E.loja && Math.abs(x - J.E.loja.cx) < 25);
    const cels = [];
    for (const s of salas) for (const k of s.cel) cels.push(k);
    let feitos = 0;
    for (let t = 0; t < 400 && feitos < 10; t++) {
      let x, z;
      if (cels.length && Math.random() < 0.7) { const k = cels[M.rndInt(0, cels.length - 1)]; x = N.x0 + ((k % N.W) + 0.5) * 2.5; z = N.z0 + (((k / N.W) | 0) + 0.5) * 2.5; }
      else { const r = J.ronda(false); x = r[0] + M.rnd(-3, 3); z = r[1] + M.rnd(-3, 3); }
      if (fora(x) || Math.hypot(x - ini[0], z - ini[1]) < 15 || !J.lugarLivre(x, z, 2) || !N.caminho(ini[0], ini[1], x, z).length) continue;
      let sorte = M.rnd(0, 100), tipo = MAIS[0];
      for (const m of MAIS) { if (sorte < m[2]) { tipo = m; break; } sorte -= m[2]; }
      const m = J.sprite(IMG(tipo[0]), 3, 3); m.position.set(x, 3, z);
      G.objs.push({ tipo: 'mais', valor: tipo[1], m, x, z, y0: 3, ativo: true });
      feitos++;
    }
  }

  /* ---------- loja do Johnny (montada fora da escola; a porta fica numa parede de corredor) ---------- */
  const ESTOQUE = [[1, 75], [4, 150], [3, 100], [2, 100], [7, 100], [9, 75], [10, 125], [11, 200], [5, 50], [6, 75], [8, 75]];
  J.ganchos.monta.push((E) => {
    if (!tem('loja')) return;
    const K = J.kit(E), T = 10;
    let x0 = 1e9, z0 = 1e9, z1 = -1e9;
    for (const s of E.segs) { x0 = Math.min(x0, s.a[0], s.b[0]); z0 = Math.min(z0, s.a[1], s.b[1]); z1 = Math.max(z1, s.a[1], s.b[1]); }
    const X0 = x0 - 60, Zc = Math.round((z0 + z1) / 2 / 10) * 10, X = (i) => X0 + i * T + 5, Z = (j) => Zc - j * T - 5;
    const mat = (n, tex, rep) => { if (!E.mats.some((m) => m.n === n)) E.mats.push({ n, tex, rep, off: [0, 0], cor: [0.96, 0.96, 0.96, 1] }); return n; };
    const PAREDE = mat('Loja_Parede', IMG('loja_parede'), [2, 2]);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      E.objs.push({ m: 'quad', mat: [K.mi('TileFloor')], M: [0, 0, -T, 0, -T, 0, 0, 0, 0, 1, 0, 0, X(i), 0, Z(j), 1] });
      E.objs.push({ m: 'quad', mat: [K.mi('Ceiling')], M: [T, 0, 0, 0, 0, 0, -T, 0, 0, -1, 0, 0, X(i), 10, Z(j), 1] });
      if (i == 0) K.muro(X(i) - 5, Z(j), T, [1, 0], PAREDE);
      if (i == 2) K.muro(X(i) + 5, Z(j), T, [-1, 0], PAREDE);
      if (j == 0) K.muro(X(i), Z(j) + 5, T, [0, -1], PAREDE);
      if (j == 1) K.muro(X(i), Z(j) - 5, T, [0, 1], PAREDE);
    }
    // balcão com o Johnny atrás e duas mesas compridas com os produtos
    const cx = X0 + 15;
    K.movel('mesaProf', cx, Zc - 16, Math.PI / 2);
    E.spr.push({ n: 'Johnny', pai: 'Environment/Loja/Johnny', tex: IMG('johnny'), ppu: 100, piv: [0.5, 0.5], a: 1, M: [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, cx, 4.6, Zc - 19, 1] });
    K.movel('mesaLonga', X0 + 3, Zc - 10, Math.PI / 2);
    K.movel('mesaLonga', X0 + 27, Zc - 10, Math.PI / 2);
    const lugares = [];
    for (const x of [X0 + 3, X0 + 27]) for (const z of [Zc - 4.5, Zc - 10, Zc - 15.5]) lugares.push([x, z]);
    E.loja = { cx, X0, Zc, dentro: [cx, Zc - 4], saida: [cx, Zc], lugares };
  });
  function abreLoja(G) {
    const L = J.E.loja;
    // a porta de dentro (volta para a escola)
    G.loja = { saida: plano(IMG('loja_porta_dentro'), 9.6, 9.8, L.cx, 4.95, L.Zc - 0.06, 0, -1), itens: [], longe: true, cool: 0 };
    // produtos: 6 do estoque, sorteados a cada partida
    embaralha(ESTOQUE.slice()).slice(0, 6).forEach(([id, preco], k) => {
      const [x, z] = L.lugares[k], m = J.sprite('Texture2D/SchoolHouse/PickUps/' + J.ICONE[id] + '.png', 2.6, 2.6);
      m.position.set(x, 4.2, z);
      G.objs.push({ tipo: 'loja', id, preco, m, x, z, y0: 4.2, ativo: true });
    });
    // a porta de fora: num pedaço reto de parede de corredor, longe de portas, enfeites e da entrada
    const pts = embaralha(J.E.ronda.slice(0, 16).concat(J.E.rondaCorr || []));
    const ini = { x: G.p.x, z: G.p.z };
    for (const r of pts) {
      for (const [dx, dz] of embaralha(D4.slice())) {
        const d = J.mundo.raio(r[0], r[1], dx, dz, 14);
        if (d < 3 || d > 9) continue;
        const px = -dz, pz = dx;
        if (![-4.5, -2.5, 2.5, 4.5].every((o) => Math.abs(J.mundo.raio(r[0] + px * o, r[1] + pz * o, dx, dz, 14) - d) < 0.2)) continue;
        const wx = r[0] + dx * d, wz = r[1] + dz * d;
        if (G.portas.some((p) => Math.hypot(p.x - wx, p.z - wz) < 9) || J.E.spr.some((s) => Math.hypot(s.M[12] - wx, s.M[14] - wz) < 5)) continue;
        if (Math.hypot(wx - ini.x, wz - ini.z) < 25) continue;
        G.loja.porta = plano(IMG('loja_porta_fora'), 9.6, 9.8, wx - dx * 0.06, 4.95, wz - dz * 0.06, -dx, -dz);
        G.loja.fora = { x: wx - dx * 1.9, z: wz - dz * 1.9, sai: [wx - dx * 3.6, wz - dz * 3.6], yaw: Math.atan2(dx, dz) };
        return;
      }
    }
  }
  function tiqueLoja(G, dt) {
    const S = G.loja, p = G.p, L = J.E.loja;
    if (!S || !S.fora) return;
    S.cool -= dt;
    const dentro = (S.dentro = Math.abs(p.x - L.cx) < 16 && p.z < L.Zc + 1 && p.z > L.Zc - 21);
    const naPortaFora = Math.hypot(p.x - S.fora.x, p.z - S.fora.z) < 2.7, naPortaDentro = Math.hypot(p.x - L.saida[0], p.z - L.saida[1]) < 2.4;
    if (!naPortaFora && !naPortaDentro) S.longe = true;
    if (S.longe && S.cool <= 0 && !G.null && !G.pomp?.arrastando) {
      if (naPortaFora) {
        p.x = L.dentro[0]; p.z = L.dentro[1]; p.yaw = 0; S.longe = false; S.cool = 1;
        M.som('Sounds/Doors/door_open', { vol: 0.7 }); M.som(SOM(S.veio ? 'Jon_Hi' : 'Jon_Welcome'), { vol: 0.9 }); S.veio = true;
      } else if (naPortaDentro) {
        p.x = S.fora.sai[0]; p.z = S.fora.sai[1]; p.yaw = S.fora.yaw; S.longe = false; S.cool = 1;
        M.som('Sounds/Doors/door_close', { vol: 0.7 }); M.som(SOM('Jon_SeeLater'), { vol: 0.9 });
      }
    }
    // o que você está olhando na loja: nome e preço
    let painel = $('lojaPainel');
    if (!painel) { painel = document.createElement('div'); painel.id = 'lojaPainel'; $('hud').appendChild(painel); }
    const a = dentro ? J.alvo(['loja'], 0.35) : null;
    painel.hidden = !dentro;
    if (dentro) painel.textContent = a ? `${J.ITEM[a.o.id]}: ${a.o.preco} pontos (toque para comprar)` : `Loja do Johnny: você tem ${G.pontos} pontos`;
  }
  J.compra = (o) => {
    const G = J.G;
    if (!G) return;
    if (G.pontos < o.preco) { J.aviso(`Faltam ${o.preco - G.pontos} pontos`, 1.8); M.som(SOM('Jon_TooMuch1'), { vol: 0.9 }); return; }
    if (G.item.indexOf(0) < 0) { J.aviso('Seus bolsos estão cheios!', 1.8); return; }
    G.pontos -= o.preco; hudPontos(G);
    J.pegaItem(o.id);
    M.som(SOM('Jon_Buy' + M.rndInt(1, 3)), { vol: 0.9 });
    J.aviso(`Comprou: ${J.ITEM[o.id]}`, 1.8);
  };

  /* ---------- porta amarela de uma direção ---------- */
  function portasUmaDir(G) {
    const N = J.nav;
    let feitas = 0;
    for (const d of embaralha(G.portas.filter((d) => d.tipo == 'vaivem' && !(d.trava > 0)))) {
      if (feitas >= 3) break;
      const s = d.seg, vx = s.bx - s.ax, vz = s.bz - s.az, L = Math.hypot(vx, vz) || 1, n = [-vz / L, vx / L];
      // só se der para voltar por outro caminho (senão alguém fica preso do outro lado); as travas dos 2 cadernos não contam
      const salvo = N.trava; N.trava = new Set(celulasPorta(d));
      const volta = N.caminho(d.x + n[0] * 4, d.z + n[1] * 4, d.x - n[0] * 4, d.z - n[1] * 4).length;
      N.trava = salvo;
      if (!volta) continue;
      const sg = Math.random() < 0.5 ? 1 : -1;
      d.umaDir = [n[0] * sg, n[1] * sg]; // direção em que se pode atravessar
      N.umaDir = N.umaDir || new Map();
      for (const k of celulasPorta(d)) N.umaDir.set(k, [d.umaDir[0], d.umaDir[1]]);
      d.seg.ativo = true; J.mostraPorta(d);
      feitas++;
    }
  }

  /* ---------- Beans ---------- */
  function criaBeans(G) {
    const r = longeDoJogador(G);
    const spr = J.sprite(BEANS(0), 3.2, 3.2); spr.visible = false; // do tamanho dos outros alunos (a imagem tem margem)
    return Object.assign(J.Agente('Beans', r[0], r[1], 12), {
      spr, oy: 4, estado: 'anda', t: 0, cool: 8, quadro: 0, dir: 0,
      ativa() { this.ativo = true; this.spr.visible = true; this.vagar(); },
      vagar() { const r = J.ronda(false); this.vai(r[0], r[1]); },
      tique(dt) { this.cool -= dt; this.t += dt; },
      fixo(dt) {
        const p = G.p, d = dist(this, p);
        if (this.estado == 'anda') {
          if (this.cool <= 0 && d < 70 && J.ve(this) && !p.corda && !G.loja?.dentro) { this.estado = 'mira'; this.t = 0; this.cam = []; M.som(SOM(Math.random() < 0.5 ? 'Ben_HeyYou' : 'Ben_Prepare'), { de: this }); }
          else if (this.chegou()) this.vagar();
          this.anda(dt);
        } else if (this.estado == 'mira') {
          this.anda(dt, 0);
          if (!J.ve(this)) { this.estado = 'anda'; this.cool = 3; this.vagar(); }
          else if (this.t > 1.3) { this.cospe(p); this.estado = 'cuspiu'; this.t = 0; }
        } else if (this.estado == 'cuspiu') {
          this.anda(dt, 0);
          if (this.t > 0.8) { this.estado = 'anda'; this.cool = M.rnd(15, 22); this.vagar(); }
        }
      },
      cospe(alvo) {
        const dx = alvo.x - this.x, dz = alvo.z - this.z, l = Math.hypot(dx, dz) || 1, m = J.sprite(IMG('chiclete'), 3, 3);
        const g = { x: this.x + dx / l * 2, z: this.z + dz / l * 2, vx: dx / l * 28, vz: dz / l * 28, m, vida: 4 };
        m.position.set(g.x, 3.5, g.z); (G.chicletes = G.chicletes || []).push(g);
        M.som(SOM('Ben_Spit'), { de: this }); M.som(SOM('Ben_Gum_Whoosh'), { de: g, vol: 0.6 });
      },
      anima() {
        const k = this.estado == 'mira' ? 8 + Math.min(7, Math.floor(this.t / 1.3 * 8)) : this.estado == 'cuspiu' ? 16 + Math.min(7, Math.floor(this.t / 0.8 * 8)) : this.parado() ? 0 : Math.floor(G.t * 10) % 8;
        J.troca(this.spr, BEANS(k));
      },
    });
  }
  function tiqueChicletes(G, dt) {
    const p = G.p;
    for (const g of G.chicletes || []) {
      const passo = 28 * dt, d = Math.hypot(g.vx, g.vz) || 1;
      g.vida -= dt;
      if (J.mundo.raio(g.x, g.z, g.vx / d, g.vz / d, passo + 0.5) < passo + 0.5) g.vida = 0;
      g.x += g.vx * dt; g.z += g.vz * dt; g.m.position.set(g.x, 3.5, g.z);
      if (g.vida > 0 && dist(g, p) < 2.3) {
        g.vida = 0; p.chiclete = 10; J.aviso('Chiclete! Você está grudado (use a tesoura)', 2.5);
        M.som(SOM('Ben_Splat')); const b = G.npcs.beans; if (b) M.som(SOM('Ben_Sorry'), { de: b });
      }
      for (const n of Object.values(G.npcs)) if (g.vida > 0 && n.ativo && n.nome != 'Beans' && dist(g, n) < 2.8) { g.vida = 0; n.chiclete = 10; M.som(SOM('Ben_Splat'), { de: n }); }
      if (g.vida <= 0) J.cena.remove(g.m);
    }
    G.chicletes = (G.chicletes || []).filter((g) => g.vida > 0);
    $('chicleteTela').hidden = !(p.chiclete > 0);
  }

  /* ---------- Chalkles ---------- */
  function chalklesNovo(G) {
    const C = G.chalkles, aulas = G.salas.filter((s) => s.aula && s !== C.sala);
    if (!aulas.length) return;
    if (C.quadro) J.cena.remove(C.quadro), J.cena.remove(C.cara);
    const sala = aulas[M.rndInt(0, aulas.length - 1)], [cx, cz] = sala.centro;
    // o quadro vai na parede mais longe da porta
    let melhor = null;
    for (const [dx, dz] of D4) {
      if (dx * -sala.n[0] + dz * -sala.n[1] > 0.7) continue; // parede da porta
      const d = J.mundo.raio(cx, cz, dx, dz, 40);
      if (!melhor || d > melhor[2]) melhor = [dx, dz, d];
    }
    if (!melhor) return;
    const [dx, dz, d] = melhor, wx = cx + dx * (d - 0.07), wz = cz + dz * (d - 0.07);
    C.sala = sala; C.carga = 0; C.fase = 'quadro';
    C.quadro = plano(IMG('quadro'), 6, 4.5, wx, 5.6, wz, -dx, -dz);
    C.cara = plano(IMG('chalkles'), 3.4, 3.4, wx - dx * 0.05, 5.6, wz - dz * 0.05, -dx, -dz, { transparent: true, opacity: 0, depthWrite: false });
  }
  function tiqueChalkles(G, dt) {
    const C = G.chalkles, p = G.p;
    if (!C || !C.sala || !G.spoop || G.null) return;
    if (C.fase == 'quadro') {
      if (C.sala.tem(p.x, p.z)) C.carga += dt; else C.carga = Math.max(0, C.carga - dt / 4);
      C.cara.material.opacity = Math.min(1, C.carga / 15);
      if (C.carga >= 15) {
        C.fase = 'solto'; C.t = 0; C.cara.visible = false;
        C.voa = J.sprite(IMG('chalkles'), 3, 3);
        M.som(SOM('Chk_Spawn'), { vol: 1 }); C.riso = M.som(SOM('Chk_Laugh'), { de: { x: C.sala.centro[0], z: C.sala.centro[1] }, vol: 1, loop: true });
        trancaSala(G, C.sala, 15);
        const [cx, cz] = C.sala.centro; G.npcs.baldi.ouve(cx, cz, 6);
        J.aviso('O Chalkles trancou a sala!', 2.5);
      }
    } else if (C.fase == 'solto') {
      C.t += dt;
      const [cx, cz] = C.sala.centro, a = C.t * 1.6;
      C.voa.position.set(cx + Math.sin(a) * 6, 5 + (C.t > 15 ? (C.t - 15) * 0.6 : 0), cz + Math.cos(a) * 6);
      if (C.t > 25) { M.para(C.riso); J.cena.remove(C.voa); C.fase = 'espera'; C.t = M.rnd(30, 50); C.cara.visible = true; C.cara.material.opacity = 0; }
    } else if (C.fase == 'espera' && (C.t -= dt) <= 0) chalklesNovo(G);
  }

  /* ---------- Mrs. Pomp ---------- */
  function criaPomp(G) {
    const r = longeDoJogador(G);
    const spr = J.sprite(IMG('pomp'), 3.2, 3.2); spr.visible = false;
    return Object.assign(J.Agente('Mrs. Pomp', r[0], r[1], 10), {
      spr, oy: 4.05, estado: 'anda', cool: 20, perdeu: 0, t: 0,
      ativa() { this.ativo = true; this.spr.visible = true; this.vagar(); },
      vagar() { const r = J.ronda(false); this.vai(r[0], r[1]); },
      tique(dt) { this.cool -= dt; this.t += dt; },
      fixo(dt) {
        const p = G.p, d = dist(this, p), A = G.pomp;
        if (this.estado == 'anda') {
          if (this.cool <= 0 && !A && d < 80 && J.ve(this) && !p.corda) { this.estado = 'vem'; this.perdeu = 0; }
          else if (this.chegou()) this.vagar();
          this.anda(dt, 10);
        } else if (this.estado == 'vem') {
          if (J.ve(this)) this.perdeu = 0; else if ((this.perdeu += dt) > 3) { this.estado = 'anda'; this.vagar(); }
          this.vai(p.x, p.z); this.anda(dt, 20);
          if (d < 4) this.convida();
        } else if (this.estado == 'aula') {
          // espera na sala; atrasou: vai buscar o jogador
          if (A && A.brava) { this.estado = 'caca'; J.troca(this.spr, IMG('pomp_brava')); }
          else { const [cx, cz] = A ? A.sala.centro : [this.x, this.z]; if (this.chegou() && dist(this, { x: cx, z: cz }) > 3) this.vai(cx, cz); this.anda(dt, 22); }
        } else if (this.estado == 'caca') {
          if (!(G.loja && G.loja.dentro)) { this.vai(p.x, p.z); this.anda(dt, 24); }
          if (G.loja && G.loja.dentro) { this.anda(dt, 0); return; } // na loja ela não entra
          if (d < 3.5) { this.estado = 'arrasta'; A.arrastando = true; M.som(SOM('NoL_Scream'), { de: this, vol: 1 }); J.aviso('A Mrs. Pomp te pegou!', 2); }
        } else if (this.estado == 'arrasta') {
          const [cx, cz] = A.sala.centro; this.vai(cx, cz); this.anda(dt, 18);
          if (A.sala.tem(this.x, this.z) && dist(this, { x: cx, z: cz }) < 5) this.daAula();
        } else if (this.estado == 'licao') {
          this.anda(dt, 0);
        }
      },
      convida() {
        const p = G.p, aulas = G.salas.filter((s) => s.aula && !s.tem(p.x, p.z));
        if (!aulas.length) { this.estado = 'anda'; this.cool = 60; return; }
        aulas.sort((a, b) => Math.abs(Math.hypot(a.centro[0] - p.x, a.centro[1] - p.z) - 70) - Math.abs(Math.hypot(b.centro[0] - p.x, b.centro[1] - p.z) - 70));
        const sala = aulas[M.rndInt(0, Math.min(2, aulas.length - 1))], pd = sala.porta;
        // marcador em cima da porta, visto através das paredes
        const marca = J.sprite(IMG('pomp'), 0.9, 0.9); marca.material.depthTest = false; marca.renderOrder = 10; marca.position.set(pd.x, 9, pd.z);
        G.pomp = { sala, t: 120, marca };
        M.som(SOM(Math.random() < 0.5 ? 'NoL_YouThere' : 'NoL_RemindingYou'), { de: this, vol: 1 });
        J.aviso('Mrs. Pomp: venha para a minha aula! Siga o meu rosto em cima da porta', 4);
        this.estado = 'aula'; this.vai(sala.centro[0], sala.centro[1]);
      },
      daAula() {
        const A = G.pomp;
        this.estado = 'licao'; A.arrastando = false; A.licao = 15;
        trancaSala(G, A.sala, 15);
        G.npcs.baldi.ouve(A.sala.centro[0], A.sala.centro[1], 6);
        J.aviso('Aula da Mrs. Pomp: 15 segundos', 3);
      },
      fimAula(pontos) {
        const A = G.pomp;
        if (A) J.cena.remove(A.marca);
        G.pomp = null; this.estado = 'anda'; this.cool = pontos ? 120 : 150; J.troca(this.spr, IMG('pomp')); this.vagar();
      },
      anima() { this.spr.position.y = this.oy + Math.abs(Math.sin(this.t * 7)) * 0.7; },
    });
  }
  function tiquePomp(G, dt) {
    const A = G.pomp, pomp = G.npcs.pomp, p = G.p, el = $('pompT');
    el.hidden = !A || !!G.null;
    if (G.null && A) { if (A.marca) J.cena.remove(A.marca); G.pomp = null; return; } // na luta do Null não tem aula
    if (!A || !pomp) return;
    if (A.marca) A.marca.position.y = 9 + Math.abs(Math.sin(G.t * 4)) * 0.8;
    if (!A.brava && A.licao === undefined) {
      A.t -= dt;
      if (A.sala.tem(p.x, p.z)) {
        const pts = Math.round(5 + 95 * Math.max(0, A.t) / 120);
        M.som(SOM('NoL_JustInTime'), { de: pomp, vol: 1 });
        J.aviso('Mrs. Pomp: bem na hora!', 2.5); J.ganhaPontos(pts, 'da Mrs. Pomp');
        pomp.fimAula(true); return;
      }
      if (A.t <= 0) { A.brava = true; M.som(SOM('NoL_TimesUp'), { de: pomp, vol: 1 }); J.aviso('Você se atrasou para a aula da Mrs. Pomp!', 3); }
    }
    if (A.arrastando) {
      // ela te carrega: você vai junto, sem controle
      if (pomp.vx || pomp.vz) A.dir = Math.atan2(pomp.vx, pomp.vz);
      const o = { x: pomp.x - Math.sin(A.dir || 0) * 2, z: pomp.z - Math.cos(A.dir || 0) * 2 };
      J.mundo.resolve(o, 1.7); p.x = o.x; p.z = o.z;
      if ((A.grito = (A.grito || 0) - dt) <= 0) { A.grito = 2; G.npcs.baldi.ouve(p.x, p.z, 6); }
    }
    if (A.licao !== undefined && (A.licao -= dt) <= 0) { M.som(SOM('NoL_ClassDismissed'), { de: pomp, vol: 1 }); pomp.fimAula(false); return; }
    const t = A.licao !== undefined ? A.licao : A.brava ? 0 : A.t, mm = Math.floor(Math.max(0, t) / 60), ss = String(Math.floor(Math.max(0, t) % 60)).padStart(2, '0');
    el.innerHTML = `<img src="assets/${IMG(A.brava && A.licao === undefined ? 'pomp_brava' : 'pomp')}" alt="">` + (A.licao !== undefined ? `Aula: ${mm}:${ss}` : A.brava ? 'Atrasado!' : `Aula da Mrs. Pomp: ${mm}:${ss}`);
  }

  function longeDoJogador(G) {
    for (let k = 0; k < 40; k++) { const r = J.ronda(false); if (Math.hypot(r[0] - G.p.x, r[1] - G.p.z) > 50) return r; }
    return J.ronda(false);
  }

  /* ---------- começo da partida ---------- */
  J.ganchos.inicia.push((G) => {
    G.pontos = 0; G.chicletes = [];
    if (!J.F) { $('pontos').hidden = true; return; }
    G.salas = achaSalas(G);
    hudPontos(G);
    if (tem('umaDir')) portasUmaDir(G);
    if (tem('loja')) { abreLoja(G); espalhaMais(G, G.salas); }
    if (tem('beans')) G.npcs.beans = criaBeans(G);
    if (tem('pomp')) G.npcs.pomp = criaPomp(G);
    if (tem('chalkles')) { G.chalkles = {}; chalklesNovo(G); }
    for (const n of [G.npcs.beans, G.npcs.pomp]) if (n) n.spr.position.set(n.x, n.oy, n.z);
  });

  /* ---------- a cada quadro ---------- */
  J.ganchos.tique.push((G, dt) => {
    if (!J.F || G.fim) return;
    const p = G.p;
    // símbolos de mais: encostou, pegou
    for (const o of G.objs) if (o.tipo == 'mais' && o.ativo && dist(o, p) < 2.6) { o.ativo = false; o.m.visible = false; J.ganhaPontos(o.valor); }
    for (const o of G.objs) if ((o.tipo == 'mais' || o.tipo == 'loja') && o.ativo) o.m.position.y = o.y0 + Math.sin(G.t * 2 + o.x) * 0.25;
    tiqueLoja(G, dt);
    tiqueChicletes(G, dt);
    tiqueChalkles(G, dt);
    tiquePomp(G, dt);
  });

  // de volta ao menu: some o que ficou na tela
  J.ganchos.menu.push(() => { for (const id of ['pontos', 'pompT', 'chicleteTela', 'lojaPainel']) if ($(id)) $(id).hidden = true; });
})();
