// Luta secreta contra o NULL (só no Beta com o mapa aleatório).
// Como liberar: no 2º caderno, errar as duas primeiras contas e digitar 0981277045 na conta impossível.
// Baseada no NULL Style do Baldi's Basics Classic Remastered:
// - todo mundo some, a escola começa a falhar e o Null aparece no corredor falando;
// - ele te persegue sempre sabendo onde você está, e de vez em quando fecha um corredor com uma barreira de PlaceFaces;
// - objetos flutuantes (bananas, plantas, globos) aparecem pela escola: encoste para pegar e use a mão para jogar nele;
// - cada acerto deixa ele tonto por 1,5 s e mais rápido; com 10 acertos ele se desfaz. Se ele te pegar, o jogo "quebra".
(function () {
  'use strict';
  const J = window.Jogo, M = window.Motor, $ = (id) => document.getElementById(id);
  const PASTA = 'beta/null/', SOM = (n) => PASTA + n;
  const FALAS = ['Null_NPC_Bored', 'Null_NPC_Enough', 'Null_NPC_Wherever', 'Null_NPC_Scary', 'Null_NPC_Stop'];
  J.SONS_EXTRA = (J.SONS_EXTRA || []).concat(['NullHit', 'NullEnd', 'Null_PreBoss_Start', 'Null_NPC_Haha', 'Null_NPC_Hide', 'Null_NPC_Nothing', 'Mus_boss_start', 'Mus_boss_loop'].concat(FALAS).map(SOM));
  J.QUADROS_EXTRA = (J.QUADROS_EXTRA || []).concat([PASTA + 'null.png', 'Texture2D/CharacterSprites/PlaceFace.png']);
  const OBJETOS = ['Texture2D/SchoolHouse/Billboards/Placements/Banana.png', 'Texture2D/SchoolHouse/Billboards/Plant.png', 'Texture2D/SchoolHouse/Billboards/Placements/Globe.png'];
  const ACERTOS = 10;

  J.podeNull = (G) => G.modo == 'beta' && J.betaFeat && J.betaFeat.mapa && J.E && J.E.gerado && !G.null;

  // op.direto: a luta começa na hora (depois do 2º discurso), com o Null em op.pos
  J.chefaoNull = (G, op = {}) => {
    const p = G.p, N = J.nav;
    // some todo mundo, para a música e os eventos, destranca as portas
    M.paraTudo();
    for (const n of Object.values(G.npcs)) { n.ativo = false; n.pronto = false; if (n.spr) n.spr.visible = false; }
    if (G.tutor) G.tutor.visible = false;
    for (const d of G.portas) { d.req = true; d.trava = 0; }
    if (G.ev) G.ev.atual = null;
    J.evento('');
    // desliga o que os outros personagens deixaram ligado (vento, tempo lento, teste do Dr. Reflex, corda da Playtime)
    G.vento = null; G.empurraJogador = null; G.escala = 1; J.escuro = false; J.correLiberado = true; J.cena.fog = null;
    if (J.testeReflexo) J.testeReflexo.fecha();
    if (p.corda) { p.corda = false; $('corda').hidden = true; $('bPulo').hidden = true; }
    p.esmagado = 0; p.abracando = 0; p.varrendo = 0;
    // o Null aparece no corredor, longe o suficiente para dar tempo de correr
    const pontos = J.E.ronda.concat(J.E.rondaCorr || []).filter((r) => Math.hypot(r[0] - p.x, r[1] - p.z) > 35 && N.caminho(p.x, p.z, r[0], r[1]).length);
    pontos.sort((a, b) => Math.hypot(a[0] - p.x, a[1] - p.z) - Math.hypot(b[0] - p.x, b[1] - p.z));
    const ini = op.pos || pontos[0] || J.ronda(false);
    const spr = J.sprite(PASTA + 'null.png', 1.7, 1.7);
    const nul = Object.assign(J.Agente('Null', ini[0], ini[1], 12), {
      spr, oy: 4.2, ativo: true, tonto: 0, acertos: 0, t: 0,
      tique() {}, fixo() {},
      // treme e fica rosa quando leva um golpe
      anima() { this.spr.material.color.setRGB(1, this.tonto > 0 ? 0.3 : 1, this.tonto > 0 ? 0.8 : 1); this.spr.position.x += (Math.random() - 0.5) * 0.15 * (1 + this.acertos / 3); },
    });
    spr.position.set(nul.x, nul.oy, nul.z);
    G.npcs.null = nul;
    G.null = { fase: op.direto ? 'luta' : 'intro', t: 0, nul, objs: [], barreiras: [], segurando: null, voo: [], proxObj: 1, proxBarreira: 14, proxFala: 18, falas: 0, musica: null };
    if (op.direto) { G.null.espera = 3; G.null.musica = M.som(SOM('Mus_boss_start'), { vol: 0.7 }); G.null.loopEm = 7.6; for (let k = 0; k < 4; k++) novoObjeto(G, G.null, 6, 30); }
    else { J.aviso('???', 2); G.null.falaIntro = M.som(SOM('Null_PreBoss_Start'), { de: nul, alcance: 400 }); }
    document.body.classList.add('nullGlitch');
  };

  // ---------- a luta, a cada quadro ----------
  J.ganchos.tique.push((G, dt) => {
    const B = G.null;
    if (!B || G.fim) return;
    const p = G.p, nul = B.nul;
    B.t += dt; nul.t += dt;
    p.est = 100; // fôlego infinito durante a luta
    glitch(Math.max(0, 1 - Math.hypot(nul.x - p.x, nul.z - p.z) / 80), B);
    // começa depois da fala (ou já, se você acertar ele antes)
    if (B.fase == 'intro') {
      nul.anda(dt, 0);
      if (B.t > 13.5 || nul.acertos > 0) {
        B.fase = 'luta';
        M.para(B.falaIntro);
        B.musica = M.som(SOM('Mus_boss_start'), { vol: 0.7 });
        B.loopEm = 7.6;
      }
    } else if (B.fase == 'luta') {
      if (B.loopEm > 0 && (B.loopEm -= dt) <= 0) B.musica = M.som(SOM('Mus_boss_loop'), { loop: true, vol: 0.7 });
      if (B.espera > 0) { B.espera -= dt; nul.anda(dt, 0); } // luta direta: um tempinho para correr
      else if (nul.tonto > 0) { nul.tonto -= dt; nul.anda(dt, 0); }
      else { const [ax, az] = alvoNull(G, B); nul.vai(ax, az); nul.anda(dt, nul.vel); }
      // falas de vez em quando
      if ((B.proxFala -= dt) <= 0) {
        B.proxFala = M.rnd(14, 24);
        const semNada = G.item.every((i) => !i) && !B.segurando && p.est <= 0;
        M.som(SOM(semNada ? 'Null_NPC_Nothing' : FALAS[B.falas++ % FALAS.length]), { de: nul, alcance: 300 });
      }
      // barreiras de PlaceFace na frente do jogador
      if ((B.proxBarreira -= dt) <= 0) { B.proxBarreira = M.rnd(9, 15); barreira(G, B); }
      // pegou o jogador
      if (nul.tonto <= 0 && !(B.espera > 0) && Math.hypot(nul.x - p.x, nul.z - p.z) < 2.6) return pegou(G, B);
      J.evento(`NULL  ${nul.acertos}/${ACERTOS}`);
    }
    // objetos flutuantes para jogar
    if ((B.proxObj -= dt) <= 0) {
      // os longes somem (a luta acontece perto de você); com poucos por perto, aparecem mais rápido
      for (const o of B.objs.filter((o) => Math.hypot(o.x - p.x, o.z - p.z) > 70 || noPorao(o.x) != noPorao(p.x))) { J.cena.remove(o.m); B.objs.splice(B.objs.indexOf(o), 1); }
      const pertos = B.objs.filter((o) => Math.hypot(o.x - p.x, o.z - p.z) < 35).length;
      B.proxObj = pertos < 5 ? 0.7 : M.rnd(2.5, 4);
      if (B.objs.length < 12) novoObjeto(G, B, 8, pertos < 2 ? 25 : 40);
    }
    for (const o of B.objs) o.m.position.y = 3 + Math.sin(B.t * 2 + o.x) * 0.4;
    if (!B.segurando) {
      const o = B.objs.find((o) => Math.hypot(o.x - p.x, o.z - p.z) < 3.5);
      if (o) { B.objs.splice(B.objs.indexOf(o), 1); J.cena.remove(o.m); B.segurando = o.tex; mostraNaMao(o.tex); M.som('Sounds/Items/respawn'); }
    }
    // objetos voando
    for (const v of B.voo) {
      v.vida -= dt;
      const passo = 40 * dt, a = J.mundo.raio(v.x, v.z, v.dx, v.dz, passo + 0.5);
      if (a < passo + 0.5) v.vida = 0;
      v.x += v.dx * passo; v.z += v.dz * passo; v.m.position.set(v.x, 3.5, v.z);
      if (B.fase != 'fim' && Math.hypot(v.x - nul.x, v.z - nul.z) < 3) { v.vida = 0; acerto(G, B); }
      if (v.vida <= 0) J.cena.remove(v.m);
    }
    B.voo = B.voo.filter((v) => v.vida > 0);
    // barreiras somem depois de um tempo
    for (const b of B.barreiras) if ((b.t -= dt) <= 0) { b.seg.ativo = false; b.ms.forEach((m) => J.cena.remove(m)); }
    B.barreiras = B.barreiras.filter((b) => b.t > 0);
  });

  // jogar o objeto: qualquer toque (ou o botão da mão) joga reto na direção da mira, no meio da tela
  const toqueAntes = J.toqueMundo;
  J.toqueMundo = (sx, sy, camera) => {
    const G = J.G, B = G && G.null;
    if (B && B.segurando) {
      const p = G.p, y = J.camera.rotation.y, dx = -Math.sin(y), dz = -Math.cos(y); // para onde a câmera olha (também olhando para trás)
      const m = J.sprite(B.segurando, 2, 2);
      B.voo.push({ x: p.x + dx * 2, z: p.z + dz * 2, dx, dz, vida: 2, m });
      B.segurando = null; mostraNaMao(null);
      return true;
    }
    return toqueAntes ? toqueAntes(sx, sy, camera) : false;
  };

  // porão: ele desce e sobe pela escada atrás do jogador
  const noPorao = (x) => !!(J.E.porao && x > J.E.porao.OX - 6);
  function alvoNull(G, B) {
    const p = G.p, nul = B.nul, P = J.E.porao;
    if (!P || noPorao(p.x) == noPorao(nul.x)) return [p.x, p.z];
    const [de, para] = noPorao(nul.x) ? [P.entrada, P.escada] : [P.escada, P.entrada];
    if (Math.hypot(nul.x - de[0], nul.z - de[1]) < 2.5) {
      nul.x = para[0]; nul.z = para[1]; nul.cam = []; nul.dest = null;
      M.som('Sounds/Doors/door_close', { de: nul, vol: 0.8 });
      return [p.x, p.z];
    }
    return de;
  }

  // objeto novo perto do jogador, em qualquer lugar onde dá para andar (corredor, sala, porão), com caminho até ele
  function novoObjeto(G, B, perto = 10, longe = 40) {
    const p = G.p, N = J.nav, nul = B.nul;
    for (let k = 0; k < 40; k++) {
      const ang = Math.random() * Math.PI * 2, d = M.rnd(perto, longe);
      const [i, j] = N.cel(p.x + Math.sin(ang) * d, p.z + Math.cos(ang) * d);
      if (!N.ok(i, j)) continue;
      const x = N.x0 + (i + 0.5) * 2.5, z = N.z0 + (j + 0.5) * 2.5;
      if (noPorao(x) != noPorao(p.x) || Math.hypot(x - nul.x, z - nul.z) < 10 || B.objs.some((o) => Math.hypot(o.x - x, o.z - z) < 8)) continue;
      if (!N.caminho(p.x, p.z, x, z).length) continue;
      const tex = OBJETOS[M.rndInt(0, OBJETOS.length - 1)], m = J.sprite(tex, 2, 2);
      m.position.set(x, 3, z);
      B.objs.push({ x, z, m, tex });
      return true;
    }
    return false;
  }
  function mostraNaMao(tex) {
    let el = $('naMao');
    if (!el) { el = document.createElement('img'); el.id = 'naMao'; el.alt = ''; $('hud').appendChild(el); }
    el.hidden = !tex; if (tex) el.src = 'assets/' + tex;
  }
  // barreira de PlaceFaces atravessando o corredor um pouco à frente do jogador
  function barreira(G, B) {
    const p = G.p, nul = B.nul;
    // eixo para onde o jogador olha (só retas) e um ponto 2 quadrados à frente, no meio do quadrado
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), hor = Math.abs(fx) > Math.abs(fz), sx = hor ? Math.sign(fx) : 0, sz = hor ? 0 : Math.sign(fz);
    for (const dist of [20, 15, 25]) {
      const x = Math.floor((p.x + sx * dist) / 10) * 10 + 5, z = Math.floor((p.z + sz * dist) / 10) * 10 + 5;
      if (!J.mundo.ve(p.x, p.z, x, z) || Math.hypot(x - nul.x, z - nul.z) < 6) continue;
      const [i, j] = J.nav.cel(x, z); if (!J.nav.ok(i, j)) continue;
      // a barreira atravessa o corredor (perpendicular ao olhar)
      const a = hor ? [x, z - 5] : [x - 5, z], b = hor ? [x, z + 5] : [x + 5, z];
      const seg = J.mundo.addDyn({ ax: a[0], az: a[1], bx: b[0], bz: b[1], y0: 0, y1: 10 });
      const ms = [];
      for (const k of [-3.3, 0, 3.3]) for (const y of [2, 6]) { const m = J.sprite('Texture2D/CharacterSprites/PlaceFace.png', 1.3, 1.3); m.position.set(x + (hor ? 0 : k), y, z + (hor ? k : 0)); ms.push(m); }
      B.barreiras.push({ seg, ms, t: 6 });
      if (Math.random() < 0.4) M.som(SOM('Null_NPC_Hide'), { de: nul, alcance: 300 });
      return;
    }
  }
  function acerto(G, B) {
    const nul = B.nul;
    nul.acertos++; nul.tonto = 1.5; nul.vel = Math.min(19, 12 + nul.acertos * 0.8);
    M.som(SOM('NullHit'), { vol: 1 });
    flash();
    if (nul.acertos >= ACERTOS) venceu(G, B);
  }
  function venceu(G, B) {
    B.fase = 'fim'; M.para(B.musica); M.paraTudo();
    J.evento('');
    const nul = B.nul; nul.tonto = 99;
    M.som(SOM('NullEnd'), { vol: 1 });
    document.body.classList.add('nullForte');
    setTimeout(() => {
      if (!J.G || J.G !== G) return;
      document.body.classList.remove('nullGlitch', 'nullForte'); limpaGlitch();
      G.fim = true; M.paraTudo();
      J.fim('assets/' + PASTA + 'fim.jpg', 'Você derrotou o NULL!');
    }, 6000);
  }
  // pegou: a tela congela na cara dele, ele ri e o jogo "crasha" (o app fecha de verdade)
  function pegou(G, B) {
    G.fim = true; B.fase = 'fim'; M.paraTudo();
    const n = B.nul, p = G.p;
    const dx = p.x - n.x, dz = p.z - n.z, l = Math.hypot(dx, dz) || 1;
    const r = Math.min(7.5, J.mundo.raio(n.x, n.z, dx / l, dz / l, 7.5) - 1); // uns passos para trás: a cara dele enche a tela
    p.x = n.x + (dx / l) * r; p.z = n.z + (dz / l) * r;
    p.yaw = Math.atan2(-(n.x - p.x), -(n.z - p.z));
    $('hud').hidden = true; $('toque').hidden = true;
    M.som(SOM('Null_NPC_Haha'), { vol: 1 });
    document.body.classList.add('nullForte');
    setTimeout(() => J.crash(), 1800);
  }

  // "crash": tela preta e o app fecha (no navegador, recarrega)
  J.crash = () => {
    M.paraTudo(); if (J.G) J.G.fim = true;
    document.body.classList.remove('nullGlitch', 'nullForte', 'nullTreme');
    document.body.innerHTML = '<div style="position:fixed;inset:0;background:#000"></div>';
    setTimeout(() => { try { if (window.Android && window.Android.fecha) return window.Android.fecha(); } catch (e) {} location.reload(); }, 1200);
  };

  // ---------- a escola falhando: cores trocando e tremendo, mais forte quando ele está perto ----------
  const cv = () => document.querySelector('canvas');
  function glitch(perto, B) {
    const c = cv(); if (!c) return;
    const forte = document.body.classList.contains('nullForte') ? 1 : perto;
    if (Math.random() < 0.15 + forte * 0.5) {
      const h = Math.floor(Math.random() * 360 * forte), inv = Math.random() < forte * 0.15 ? ' invert(1)' : '';
      c.style.filter = `hue-rotate(${h}deg) saturate(${1 + forte * 2})${inv}`;
      c.style.transform = `translate(${(Math.random() - 0.5) * 12 * forte}px, ${(Math.random() - 0.5) * 8 * forte}px)`;
    }
  }
  function flash() { const c = cv(); if (c) { c.style.filter = 'invert(1) hue-rotate(90deg)'; setTimeout(() => c && (c.style.filter = ''), 120); } }
  function limpaGlitch() { const c = cv(); if (c) { c.style.filter = ''; c.style.transform = ''; } const el = $('naMao'); if (el) el.hidden = true; }

  // ao sair para o menu (ou começar outro jogo), desliga tudo da luta
  const desliga = () => { document.body.classList.remove('nullGlitch', 'nullForte'); limpaGlitch(); };
  J.ganchos.menu.push(desliga); J.ganchos.inicia.push(desliga);
})();
