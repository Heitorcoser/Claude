// Motor do Baldi web: monta a escola (vinda da cena do Unity), colisão 2D, navegação dos
// personagens em grade, sons e utilidades. As unidades são as mesmas do jogo original.
(function () {
  'use strict';
  const M = (window.Motor = {});
  const A = 'assets/';

  /* ---------- texturas ---------- */
  const carregador = new THREE.TextureLoader();
  const texCache = {};
  M.tex = (caminho) => {
    if (!texCache[caminho]) {
      const t = carregador.load(A + caminho);
      t.magFilter = THREE.NearestFilter;
      t.minFilter = THREE.NearestMipmapLinearFilter;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.encoding = THREE.sRGBEncoding;
      texCache[caminho] = t;
    }
    return texCache[caminho];
  };
  const imgCache = {};
  M.img = (caminho) => imgCache[caminho] || (imgCache[caminho] = Object.assign(new Image(), { src: A + caminho }));

  /* ---------- geometria da escola ---------- */
  // Junta tudo que usa o mesmo material numa malha só (milhares de quads ficam leves no celular)
  function juntar(lista) {
    let nv = 0, ni = 0;
    for (const g of lista) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
    const pos = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = new Uint32Array(ni);
    let ov = 0, oi = 0;
    for (const g of lista) {
      pos.set(g.attributes.position.array, ov * 3); uv.set(g.attributes.uv.array, ov * 2);
      const I = g.index ? g.index.array : [...Array(g.attributes.position.count).keys()];
      for (let k = 0; k < I.length; k++) idx[oi + k] = I[k] + ov;
      ov += g.attributes.position.count; oi += I.length;
    }
    const r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    r.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    r.setIndex(new THREE.BufferAttribute(idx, 1));
    r.computeBoundingSphere();
    return r;
  }
  const BASE = {
    quad: () => new THREE.PlaneGeometry(1, 1),
    plane: () => new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2),
    cube: () => new THREE.BoxGeometry(1, 1, 1),
    cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 2, 12),
    sphere: () => new THREE.SphereGeometry(0.5, 12, 8),
    capsule: () => new THREE.CylinderGeometry(0.5, 0.5, 2, 12),
  };
  function geoCustom(m, sub) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(m.p), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(m.uv), 2));
    g.setIndex(m.subs[sub]);
    return g;
  }
  M.material = (mt, extra) => {
    // só a frente, como no Unity: com os dois lados, cartazes e portas apareciam espelhados por trás
    const o = { color: new THREE.Color(mt.cor[0], mt.cor[1], mt.cor[2]) };
    if (mt.tex) {
      const t = M.tex(mt.tex).clone(); t.needsUpdate = true;
      t.repeat.set(mt.rep[0], mt.rep[1]); t.offset.set(mt.off[0], mt.off[1]);
      o.map = t; o.alphaTest = 0.5; o.transparent = false;
    }
    return new THREE.MeshBasicMaterial(Object.assign(o, extra));
  };
  // Monta a escola. Devolve a cena e referências para portas e paredes de entrada.
  M.monta = (E, malhas, cena) => {
    const mats = E.mats.map((m) => M.material(m));
    const grupos = new Map(), entradas = {};
    const mat4 = new THREE.Matrix4();
    for (const o of E.objs) {
      mat4.fromArray(o.M);
      const subs = BASE[o.m] ? [BASE[o.m]()] : malhas[o.m] ? malhas[o.m].subs.map((_, i) => geoCustom(malhas[o.m], i)) : [];
      subs.forEach((g, i) => {
        const mi = o.mat[Math.min(i, o.mat.length - 1)];
        if (mi == null) return;
        g.applyMatrix4(mat4);
        // escala negativa espelha a malha: inverte a ordem dos triângulos para a frente continuar do lado certo
        if (mat4.determinant() < 0) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } }
        const chave = o.ent ? 'ent:' + o.ent + ':' + mi : mi;
        if (!grupos.has(chave)) grupos.set(chave, []);
        grupos.get(chave).push(g);
      });
    }
    for (const [chave, lista] of grupos) {
      const mi = typeof chave == 'string' ? +chave.split(':')[2] : chave;
      const mesh = new THREE.Mesh(juntar(lista), mats[mi]);
      cena.add(mesh);
      if (typeof chave == 'string') (entradas[chave.split(':')[1]] = entradas[chave.split(':')[1]] || []).push(mesh);
    }
    // portas: dois quads (dentro e fora) que trocam de textura
    const portas = E.portas.map((p) => {
      const quads = p.quads.map((q) => {
        const mt = E.mats[q.mat];
        const mesh = new THREE.Mesh(BASE.quad(), M.material(mt));
        mesh.matrixAutoUpdate = false; mesh.matrix.fromArray(q.M); cena.add(mesh);
        return { mesh, base: mt.tex };
      });
      return Object.assign(p, { malhas: quads });
    });
    return { portas, entradas };
  };

  /* ---------- colisão em 2D (chão x,z) ---------- */
  const CEL = 10;
  M.Mundo = function (E) {
    this.segs = E.segs.map((s) => ({ ax: s.a[0], az: s.a[1], bx: s.b[0], bz: s.b[1], y0: s.y[0], y1: s.y[1], ent: s.ent, dy: 0, ativo: true }));
    this.caixas = E.caixas.filter((c) => c.c[1] - c.h[1] < 6).map((c) => ({ x: c.c[0], z: c.c[2], hx: c.h[0], hz: c.h[2], co: Math.cos(c.ang), si: Math.sin(c.ang), n: c.n }));
    this.dyn = []; // barreiras que ligam e desligam (portas)
    this.grade = new Map();
    const poe = (k, item) => { if (!this.grade.has(k)) this.grade.set(k, []); this.grade.get(k).push(item); };
    for (const s of this.segs) {
      const x0 = Math.floor(Math.min(s.ax, s.bx) / CEL), x1 = Math.floor(Math.max(s.ax, s.bx) / CEL);
      const z0 = Math.floor(Math.min(s.az, s.bz) / CEL), z1 = Math.floor(Math.max(s.az, s.bz) / CEL);
      for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) poe(x + ',' + z, s);
    }
    for (const c of this.caixas) {
      const r = Math.hypot(c.hx, c.hz);
      for (let x = Math.floor((c.x - r) / CEL); x <= Math.floor((c.x + r) / CEL); x++)
        for (let z = Math.floor((c.z - r) / CEL); z <= Math.floor((c.z + r) / CEL); z++) poe(x + ',' + z, c);
    }
  };
  const P = M.Mundo.prototype;
  P.addDyn = function (s) { s.ativo = true; s.dy = 0; s.y0 = s.y0 ?? 0; s.y1 = s.y1 ?? 10; this.dyn.push(s); return s; };
  P.perto = function (x, z, r) {
    const out = new Set();
    for (let gx = Math.floor((x - r) / CEL); gx <= Math.floor((x + r) / CEL); gx++)
      for (let gz = Math.floor((z - r) / CEL); gz <= Math.floor((z + r) / CEL); gz++) {
        const l = this.grade.get(gx + ',' + gz); if (l) l.forEach((i) => out.add(i));
      }
    this.dyn.forEach((s) => out.add(s));
    return out;
  };
  const bloqueia = (s) => s.ativo && s.y0 + s.dy < 7 && s.y1 + s.dy > 1; // parede na altura do corpo
  // empurra um círculo para fora das paredes e móveis
  P.resolve = function (o, r, semCaixas) {
    for (let it = 0; it < 3; it++) {
      for (const s of this.perto(o.x, o.z, r + 2)) {
        if (s.hx !== undefined) {
          if (semCaixas) continue;
          const dx = o.x - s.x, dz = o.z - s.z, lx = dx * s.co + dz * s.si, lz = -dx * s.si + dz * s.co;
          const cx = Math.max(-s.hx, Math.min(s.hx, lx)), cz = Math.max(-s.hz, Math.min(s.hz, lz));
          let ex = lx - cx, ez = lz - cz, d = Math.hypot(ex, ez);
          if (d < r) {
            if (d < 1e-6) { // centro dentro da caixa: sai pelo lado mais perto
              const px = s.hx - Math.abs(lx), pz = s.hz - Math.abs(lz);
              if (px < pz) { ex = Math.sign(lx) || 1; ez = 0; d = 0; } else { ex = 0; ez = Math.sign(lz) || 1; d = 0; }
              const k = r - d + (px < pz ? px : pz); o.x += (ex * s.co - ez * s.si) * k; o.z += (ex * s.si + ez * s.co) * k;
            } else {
              const k = (r - d) / d; o.x += (ex * s.co - ez * s.si) * k; o.z += (ex * s.si + ez * s.co) * k;
            }
          }
        } else if (bloqueia(s)) {
          const vx = s.bx - s.ax, vz = s.bz - s.az, L2 = vx * vx + vz * vz || 1;
          let t = ((o.x - s.ax) * vx + (o.z - s.az) * vz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
          const px = s.ax + vx * t, pz = s.az + vz * t, dx = o.x - px, dz = o.z - pz, d = Math.hypot(dx, dz);
          if (d < r && d > 1e-6) { o.x += (dx / d) * (r - d); o.z += (dz / d) * (r - d); }
        }
      }
    }
  };
  // linha de visão (raio no chão); caixas não tapam a visão (são baixas)
  P.ve = function (ax, az, bx, bz, semPortas) {
    const dx = bx - ax, dz = bz - az;
    const minx = Math.min(ax, bx), maxx = Math.max(ax, bx), minz = Math.min(az, bz), maxz = Math.max(az, bz);
    const testa = (s) => {
      if (!bloqueia(s) || s.hx !== undefined) return false;
      const ex = s.bx - s.ax, ez = s.bz - s.az, den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) return false;
      const t = ((s.ax - ax) * ez - (s.az - az) * ex) / den, u = ((s.ax - ax) * dz - (s.az - az) * dx) / den;
      return t > 0.001 && t < 0.999 && u >= 0 && u <= 1;
    };
    for (let gx = Math.floor(minx / CEL); gx <= Math.floor(maxx / CEL); gx++)
      for (let gz = Math.floor(minz / CEL); gz <= Math.floor(maxz / CEL); gz++) {
        const l = this.grade.get(gx + ',' + gz);
        if (l) for (const s of l) if (testa(s)) return false;
      }
    if (!semPortas) for (const s of this.dyn) if (testa(s)) return false;
    return true;
  };
  // distância até a parede numa direção (para tocar em objetos na tela)
  P.raio = function (ax, az, dx, dz, max) {
    let best = max;
    for (const s of this.perto(ax + dx * max / 2, az + dz * max / 2, max / 2 + 1)) {
      if (s.hx !== undefined || !bloqueia(s)) continue;
      const ex = s.bx - s.ax, ez = s.bz - s.az, den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((s.ax - ax) * ez - (s.az - az) * ex) / den, u = ((s.ax - ax) * dz - (s.az - az) * dx) / den;
      if (t > 0 && t < best && u >= 0 && u <= 1) best = t;
    }
    return best;
  };

  /* ---------- navegação em grade (no lugar do NavMesh do Unity) ---------- */
  const NC = 2.5;
  M.Nav = function (mundo, limites) {
    this.m = mundo;
    this.x0 = limites[0]; this.z0 = limites[1];
    this.W = Math.ceil((limites[2] - limites[0]) / NC); this.H = Math.ceil((limites[3] - limites[1]) / NC);
    this.livre = new Uint8Array(this.W * this.H);
    for (let j = 0; j < this.H; j++) for (let i = 0; i < this.W; i++) {
      const o = { x: this.x0 + (i + 0.5) * NC, z: this.z0 + (j + 0.5) * NC }, ox = o.x, oz = o.z;
      // livre se um círculo de raio 1.2 cabe ali (portas não contam: os personagens abrem)
      this.m.resolve(o, 1.2);
      this.livre[j * this.W + i] = Math.hypot(o.x - ox, o.z - oz) < 0.3 ? 1 : 0;
    }
    // paredes finas ficam entre duas células livres: marca as passagens bloqueadas (bit 1 = i+1, bit 2 = j+1)
    this.muro = new Uint8Array(this.W * this.H);
    const cx = (i) => this.x0 + (i + 0.5) * NC, cz = (j) => this.z0 + (j + 0.5) * NC;
    for (let j = 0; j < this.H; j++) for (let i = 0; i < this.W; i++) {
      const k = j * this.W + i;
      if (!this.livre[k]) continue;
      if (i + 1 < this.W && this.livre[k + 1] && !mundo.ve(cx(i), cz(j), cx(i + 1), cz(j), true)) this.muro[k] |= 1;
      if (j + 1 < this.H && this.livre[k + this.W] && !mundo.ve(cx(i), cz(j), cx(i), cz(j + 1), true)) this.muro[k] |= 2;
    }
  };
  const N = M.Nav.prototype;
  N.cel = function (x, z) { return [Math.floor((x - this.x0) / NC), Math.floor((z - this.z0) / NC)]; };
  N.ok = function (i, j) { return i >= 0 && j >= 0 && i < this.W && j < this.H && this.livre[j * this.W + i] === 1 && !(this.trava && this.trava.has(j * this.W + i)); };
  // dá para passar da célula (i,j) para a vizinha (i+di, j+dj), um passo reto, sem cruzar parede?
  N.passa = function (i, j, di, dj) {
    if (di) { const a = di > 0 ? i : i - 1; return !(this.muro[j * this.W + a] & 1); }
    const b = dj > 0 ? j : j - 1; return !(this.muro[b * this.W + i] & 2);
  };
  N.maisPerto = function (i, j) {
    if (this.ok(i, j)) return [i, j];
    for (let r = 1; r < 8; r++) for (let a = -r; a <= r; a++) for (const [di, dj] of [[a, -r], [a, r], [-r, a], [r, a]]) if (this.ok(i + di, j + dj)) return [i + di, j + dj];
    return null;
  };
  // distância (em células) de cada célula livre até a parede mais perto: o A* prefere o meio dos corredores
  N.preparaMeio = function () {
    const W = this.W, H = this.H, d = new Uint8Array(W * H), fila = [];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (!this.ok(i, j)) continue;
      let borda = false;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!this.ok(i + di, j + dj) || !this.passa(i, j, di, dj)) borda = true;
      if (borda) { d[j * W + i] = 1; fila.push(j * W + i); }
    }
    for (let q = 0; q < fila.length; q++) {
      const k = fila[q], i = k % W, j = (k / W) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj, nk = nj * W + ni;
        if (this.ok(ni, nj) && !d[nk] && this.passa(i, j, di, dj)) { d[nk] = Math.min(255, d[k] + 1); fila.push(nk); }
      }
    }
    this.meio = d;
  };
  // largura livre em volta da célula, na direção perpendicular ao movimento; devolve [centro, largura]
  N.vao = function (i, j, horiz) {
    const lim = 8;
    let a = 0, b = 0;
    if (horiz) { while (a < lim && this.ok(i, j - a - 1) && this.passa(i, j - a, 0, -1)) a++; while (b < lim && this.ok(i, j + b + 1) && this.passa(i, j + b, 0, 1)) b++; return [this.z0 + (j + (b - a) / 2 + 0.5) * NC, a + b]; }
    while (a < lim && this.ok(i - a - 1, j) && this.passa(i - a, j, -1, 0)) a++; while (b < lim && this.ok(i + b + 1, j) && this.passa(i + b, j, 1, 0)) b++;
    return [this.x0 + (i + (b - a) / 2 + 0.5) * NC, a + b];
  };
  // A* em 4 direções (só frente, trás, esquerda e direita), evitando curvas à toa e beiradas.
  // O caminho sai em linhas retas pelo meio dos corredores e das portas.
  N.caminho = function (ax, az, bx, bz) {
    if (!this.meio) this.preparaMeio();
    const a = this.maisPerto(...this.cel(ax, az)), b = this.maisPerto(...this.cel(bx, bz));
    if (!a || !b) return [];
    const W = this.W, n = W * this.H, ini = a[1] * W + a[0], fim = b[1] * W + b[0];
    const D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    // estado = célula * 4 + direção em que chegou
    const g = new Float32Array(n * 4).fill(1e9), de = new Int32Array(n * 4).fill(-1), fechado = new Uint8Array(n * 4);
    const heap = [];
    const h = (k) => Math.abs((k % W) - b[0]) + Math.abs(((k / W) | 0) - b[1]);
    const push = (it) => { heap.push(it); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const t = heap[0], l = heap.pop(); if (heap.length) { heap[0] = l; let i = 0; for (;;) { const e = 2 * i + 1, d = e + 1; let m = i; if (e < heap.length && heap[e][0] < heap[m][0]) m = e; if (d < heap.length && heap[d][0] < heap[m][0]) m = d; if (m == i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return t; };
    for (let d = 0; d < 4; d++) { g[ini * 4 + d] = 0; push([h(ini), ini * 4 + d]); }
    let achou = -1, it = 0;
    while (heap.length && it++ < 200000) {
      const [, st] = pop();
      if (fechado[st]) continue; fechado[st] = 1;
      const k = st >> 2, dir = st & 3;
      if (k === fim) { achou = st; break; }
      const i = k % W, j = (k / W) | 0;
      for (let nd = 0; nd < 4; nd++) {
        const [di, dj] = D[nd], ni = i + di, nj = j + dj;
        if (!this.ok(ni, nj) || !this.passa(i, j, di, dj)) continue;
        const nk = nj * W + ni, perto = this.meio[nk] || 1;
        // porta de uma direção: não atravessa na contramão
        if (this.umaDir) { const u = this.umaDir.get(nk) || this.umaDir.get(k); if (u && di * u[0] + dj * u[1] < 0) continue; }
        // beirada custa mais (até 2 células da parede); virar custa 3
        const c = g[st] + 1 + (perto < 3 ? (3 - perto) * 0.8 : 0) + (nd !== dir && k !== ini ? 3 : 0);
        const ns = nk * 4 + nd;
        if (c < g[ns]) { g[ns] = c; de[ns] = st; push([c + h(nk), ns]); }
      }
    }
    if (achou < 0) return ini === fim ? [[bx, bz]] : [];
    const cels = [];
    for (let st = achou; st !== -1; st = de[st]) cels.push(st >> 2);
    cels.reverse();
    // trechos retos: [horizontal?, células]
    const trechos = [];
    for (let q = 1; q < cels.length; q++) {
      const horiz = cels[q] % W !== cels[q - 1] % W;
      if (!trechos.length || trechos[trechos.length - 1][0] !== horiz) trechos.push([horiz, [cels[q - 1]]]);
      trechos[trechos.length - 1][1].push(cels[q]);
    }
    const cx = (k) => this.x0 + ((k % W) + 0.5) * NC, cz = (k) => this.z0 + (((k / W) | 0) + 0.5) * NC;
    // linha de cada trecho: o centro do vão mais estreito (meio do corredor ou da porta); se não der, a linha das células
    const linhas = trechos.map(([horiz, ks]) => {
      let melhor = null;
      for (const k of ks) { const v = this.vao(k % W, (k / W) | 0, horiz); if (!melhor || v[1] < melhor[1]) melhor = v; }
      const ks0 = ks[0], ks1 = ks[ks.length - 1], L = melhor[0];
      const livre = horiz ? this.reto(cx(ks0), L, cx(ks1), L) : this.reto(L, cz(ks0), L, cz(ks1));
      return livre ? L : horiz ? cz(ks0) : cx(ks0);
    });
    const pts = [];
    if (!trechos.length) { pts.push([ax, bz], [bx, bz]); return pts.filter((p, q) => q == pts.length - 1 || Math.hypot(p[0] - ax, p[1] - az) > 0.05); }
    // sai de onde está até a linha do 1º trecho, faz as curvas, e no fim vai de lado até o alvo
    pts.push(trechos[0][0] ? [ax, linhas[0]] : [linhas[0], az]);
    for (let q = 1; q < trechos.length; q++) pts.push(trechos[q][0] ? [linhas[q - 1], linhas[q]] : [linhas[q], linhas[q - 1]]);
    const u = trechos.length - 1;
    pts.push(trechos[u][0] ? [bx, linhas[u]] : [linhas[u], bz]);
    if (this.m.ve(pts[pts.length - 1][0], pts[pts.length - 1][1], bx, bz, true)) pts.push([bx, bz]);
    // tira pontos repetidos e confere se nenhum trecho bate em parede ou móvel
    const limpa = (lista) => { const o = []; let px = ax, pz = az; for (const p of lista) if (Math.hypot(p[0] - px, p[1] - pz) > 0.05) { o.push(p); px = p[0]; pz = p[1]; } return o; };
    const bom = (lista) => { let px = ax, pz = az; for (const p of lista) { if (!this.m.ve(px, pz, p[0], p[1], true)) return false; px = p[0]; pz = p[1]; } return true; };
    let out = limpa(pts);
    if (!bom(out)) {
      // sem centralizar: pelas células, ainda só em linha reta
      const alt = [[cx(cels[0]), cz(cels[0])]];
      for (let q = 1; q < cels.length - 1; q++) { const a0 = cels[q - 1], a1 = cels[q + 1]; if (a0 % W !== a1 % W && ((a0 / W) | 0) !== ((a1 / W) | 0)) alt.push([cx(cels[q]), cz(cels[q])]); }
      alt.push([cx(cels[cels.length - 1]), cz(cels[cels.length - 1])]);
      const ul = alt[alt.length - 1];
      if (Math.abs(ul[0] - bx) > 0.05 && Math.abs(ul[1] - bz) > 0.05) alt.push([bx, ul[1]]);
      alt.push([bx, bz]);
      out = limpa([[cx(cels[0]), az]].concat(alt));
    }
    return out;
  };
  N.reto = function (ax, az, bx, bz) {
    const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / (NC * 0.5));
    for (let k = 1; k <= n; k++) { const [i, j] = this.cel(ax + (bx - ax) * k / n, az + (bz - az) * k / n); if (!this.ok(i, j)) return false; }
    // a linha e duas paralelas (largura do personagem) não podem cruzar parede
    const px = d ? -(bz - az) / d : 0, pz = d ? (bx - ax) / d : 0;
    for (const o of [0, 1, -1]) if (!this.m.ve(ax + px * o, az + pz * o, bx + px * o, bz + pz * o, true)) return false;
    return true;
  };

  /* ---------- som ---------- */
  let ctx = null;
  const buf = {};
  M.audio = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
  M.carregaSom = async (n) => {
    if (buf[n]) return buf[n];
    const r = await fetch(A + (n.startsWith('beta/') ? '' : 'AudioClip/') + n + '.mp3');
    buf[n] = await M.audio().decodeAudioData(await r.arrayBuffer());
    return buf[n];
  };
  // toca um som; com 'de' (x,z) o volume cai com a distância até o jogador
  M.som = (n, opt = {}) => {
    const c = M.audio(), b = buf[n];
    if (!b) { M.carregaSom(n).catch(() => {}); return null; }
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = b; s.loop = !!opt.loop;
    g.gain.value = opt.vol ?? 1;
    s.connect(g).connect(c.destination); s.start();
    const h = { s, g, de: opt.de, vol: opt.vol ?? 1, fim: false, alcance: opt.alcance || 120 };
    s.onended = () => { h.fim = true; M.tocando.delete(h); };
    M.tocando.add(h);
    if (h.de) M.posicionais.add(h);
    return h;
  };
  M.posicionais = new Set();
  M.tocando = new Set(); // tudo que está tocando, para parar ao sair do jogo
  M.atualizaSons = (px, pz) => {
    for (const h of M.posicionais) {
      if (h.fim) { M.posicionais.delete(h); continue; }
      const d = Math.hypot(h.de.x - px, h.de.z - pz);
      h.g.gain.value = h.vol * Math.max(0, 1 - d / h.alcance) ** 1.5;
    }
  };
  M.para = (h) => { if (h && !h.fim) { try { h.s.stop(); } catch (e) {} h.fim = true; } if (h) { M.tocando.delete(h); M.posicionais.delete(h); } };
  M.paraTudo = () => { for (const h of [...M.tocando]) M.para(h); };

  M.rnd = (a, b) => a + Math.random() * (b - a);
  M.rndInt = (a, b) => Math.round(M.rnd(a, b)); // igual ao Mathf.RoundToInt(Random.Range(a,b)) do jogo
})();
