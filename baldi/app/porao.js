// O caminho até o NULL (Beta com mapa aleatório + Porão):
// 1. No porão (escada num beco do corredor) às vezes existe a sala secreta, com a porta misteriosa.
//    Lá dentro, tudo escuro, uma mesa e a FITA VERDE.
// 2. Use a fita verde no toca-fitas da escola: toca uma música estranha do Null.
// 3. Enquanto a fita toca, volte na sala secreta: o Null aparece e faz o 1º discurso (o jogo "trava" no fim).
// 4. Com o 1º discurso feito e as NOTIFICAÇÕES do app ligadas (o jogo não pede: o jogador liga nas configurações),
//    a tela inicial fica estranha. Aí, no Beta com o mapa aleatório, o Baldi sumiu e não há cadernos;
//    toda porta que você encosta vira a "saída errada". Na porta certa está o Null: 2º discurso, grito, e a luta.
(function () {
  'use strict';
  const J = window.Jogo, M = window.Motor, $ = (id) => document.getElementById(id);
  const PASTA = 'beta/null/', SOM = (n) => PASTA + n;
  J.SONS_EXTRA = (J.SONS_EXTRA || []).concat(['fita_null', 'Null_Demo', 'Null_PreBoss_Intro', 'NullFinaleBackground'].map(SOM), ['Sounds/FinalMode/quiet noise loop', 'Sounds/MEC_SLINGSHOT']);
  J.QUADROS_EXTRA = (J.QUADROS_EXTRA || []).concat([PASTA + 'escada.png', PASTA + 'fita_verde.png'].concat(['North', 'South', 'East', 'West'].map((n) => `Texture2D/SchoolHouse/WallTextures/Posters/MapExits/${n}Exit.png`)));
  const SAIDA_ERRADA = () => `Texture2D/SchoolHouse/WallTextures/Posters/MapExits/${['North', 'South', 'East', 'West'][M.rndInt(0, 3)]}Exit.png`;

  // ---------- progresso (fica salvo no aparelho) ----------
  const prog = () => { try { return JSON.parse(localStorage.getItem('baldiNull') || '{}'); } catch (e) { return {}; } };
  const salva = (o) => { try { localStorage.setItem('baldiNull', JSON.stringify(Object.assign(prog(), o))); } catch (e) {} };
  J.progressoNull = prog; J.salvaNull = salva;
  // notificações do app ligadas? (só o app Android sabe; o jogo nunca pede a permissão)
  J.notificacoes = () => { if (J.forcaNotif) return true; try { return !!(window.Android && window.Android.notificacoes && window.Android.notificacoes()); } catch (e) { return false; } };
  // tela inicial do Null: 1º discurso feito + notificações ligadas
  J.atualizaTitulo = () => { J.modoNull = !!prog().d1 && J.notificacoes(); document.body.classList.toggle('telaNull', J.modoNull); };
  J.atualizaTitulo();
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !J.G) J.atualizaTitulo(); });
  J.ganchos.menu.push(() => setTimeout(J.atualizaTitulo, 0));

  // legendas (o Null fala em inglês)
  function legendas(lista, dur) {
    const passo = dur / lista.length;
    lista.forEach((t, k) => setTimeout(() => { if (J.G && !J.G.fim) J.aviso(t, Math.min(passo, 6)); }, k * passo * 1000));
  }
  const FALA1 = ['NULL: O quê? O que você está fazendo aqui embaixo?!', 'NULL: Por que você não me escuta?', 'NULL: Ah... acho que eu entendi.', 'NULL: Você só quer saber da "história", né?', 'NULL: Tem muita história aqui embaixo, sim...', 'NULL: Mas isso não importa!', 'NULL: Você precisa parar. Destrua o jogo.', 'NULL: Antes que seja tarde demais...', 'NULL: ...'];
  const FALA2 = ['NULL: Ahá! Seu bobo!', 'NULL: Você achou mesmo que conseguiria vencer isso?', 'NULL: Não, não, não.', 'NULL: Eu fechei a última saída.', 'NULL: Não tem como você ganhar. Isso não deveria acontecer!', 'NULL: Não há NADA que você possa fazer agora!', 'NULL: Feche o jogo... e NUNCA volte.', 'NULL: Por favor! Só POR FAVOR!', 'NULL: Só vá embora...', 'NULL: PARE!', 'NULL: Me escute!'];
  const FALA3 = ['NULL: Hehehe... Tá bom, tá bom! Sabe de uma coisa?', 'NULL: Você VAI se arrepender disso.', 'NULL: AAAAAAAAAHHHHHHH!!!'];

  const FOG_NULL = new THREE.Fog(0x000000, 2, 30), FOG_SALA = new THREE.Fog(0x000000, 1, 13), FOG_PORAO = new THREE.Fog(0x1c140a, 8, 75);

  // ---------- começo da partida ----------
  J.ganchos.inicia.push((G) => {
    const E = J.E;
    G.porao = E.porao ? { cool: 1, longe: true, fog: false } : null;
    // partida especial do 2º discurso
    if (G.modo == 'beta' && J.betaFeat && J.betaFeat.mapa && (J.modoNull || J.testeNull == 'portas') && J.testeNull != 'boss') comecaEspecial(G);
    // atalhos do APK de tester
    if (J.testeNull) setTimeout(() => testeAtalho(G), 300);
  });

  function comecaEspecial(G) {
    const E = J.E;
    G.especialNull = { t: 0, fase: 'portas', certa: null };
    for (const n of Object.values(G.npcs)) { n.ativo = false; n.pronto = false; if (n.spr) n.spr.visible = false; }
    if (G.tutor) G.tutor.visible = false;
    for (const o of G.objs) if (o.tipo == 'caderno') { o.ativo = false; o.m.visible = false; }
    for (const d of G.portas) d.req = true; // as portas amarelas não ficam trancadas (não há cadernos)
    // a porta certa: uma sala de aula longe da entrada
    const salas = (E.portaSala || []).filter((s) => s.tipo == 'aula');
    salas.sort((a, b) => Math.hypot(b.x - G.p.x, b.z - G.p.z) - Math.hypot(a.x - G.p.x, a.z - G.p.z));
    const alvo = salas[M.rndInt(0, Math.min(2, salas.length - 1))];
    if (alvo) G.especialNull.certa = { porta: G.portas.find((d) => Math.hypot(d.x - alvo.x, d.z - alvo.z) < 0.5), centro: alvo.centro };
  }

  // portas da partida especial: viram a saída errada, menos a certa
  J.portaHook = (d) => {
    const G = J.G, S = G && G.especialNull;
    if (!S || S.fase != 'portas' || d.tipo == 'vaivem') return true;
    if (S.certa && d === S.certa.porta) { S.fase = 'achou'; return true; }
    if (!d.bugada) {
      d.bugada = true; const t = SAIDA_ERRADA(); d.tex = { f: t, a: t }; d.trava = 1e9; d.aberta = false; d.seg.ativo = true;
      J.mostraPorta(d); flash();
      M.som('Sounds/MEC_SLINGSHOT', { de: d, vol: 0.7 });
    }
    return false;
  };

  // ---------- a cada quadro ----------
  J.ganchos.tique.push((G, dt) => {
    if (G.fim) return;
    const p = G.p, E = J.E, P = G.porao;
    // primeiro quadro da partida especial: sem a música da escola, só um zumbido
    const S = G.especialNull;
    if (S) {
      S.t += dt;
      if (!S.zumbido) { M.paraTudo(); S.zumbido = M.som('Sounds/FinalMode/quiet noise loop', { loop: true, vol: 0.35 }); }
      if (S.fase == 'achou' && S.certa) aparece2(G, S);
      if (S.fase == 'esperando') { const dn = Math.hypot(S.nul.position.x - p.x, S.nul.position.z - p.z); if (dn < 10 || (dn < 30 && J.mundo.ve(S.nul.position.x, S.nul.position.z, p.x, p.z))) discurso2(G, S); }
      if (S.fase == 'esperando' || S.fase == 'falando') J.cena.fog = FOG_NULL;
    }
    // escadas do porão
    if (P && E.porao) {
      P.cool -= dt;
      const [ex, ez] = E.porao.escada, [bx, bz] = E.porao.entrada;
      const de = Math.hypot(p.x - ex, p.z - ez), db = Math.hypot(p.x - bx, p.z - bz);
      if (de > 4 && db > 4) P.longe = true;
      if (P.longe && P.cool <= 0 && (de < 2.5 || db < 2.5)) {
        const [x, z] = de < 2.5 ? [bx, bz] : [ex, ez];
        p.x = x; p.z = z; P.longe = false; P.cool = 1;
        M.som('Sounds/Doors/door_close', { vol: 0.8 });
        if (de < 2.5) J.aviso('Porão', 1.5);
      }
      // escuro no porão (e quase breu na sala secreta)
      const noPorao = p.x > E.porao.OX - 6, naSecreta = !!J.dentro('SalaSecreta', p.x, p.z);
      if (noPorao) { J.cena.fog = naSecreta ? FOG_SALA : FOG_PORAO; P.fog = true; }
      else if (P.fog && !J.escuro && !S) { J.cena.fog = null; P.fog = false; }
      // fita verde tocando: entrar na sala secreta chama o Null
      if (G.fitaNull) {
        G.fitaNull.t -= dt;
        if (G.fitaNull.t <= 0) { M.para(G.fitaNull.som); G.fitaNull = null; J.aviso('A fita acabou.', 2); }
        else if (naSecreta && !G.discurso1) discurso1(G);
      }
    }
  });

  // ---------- fita verde no toca-fitas ----------
  J.usaItemExtra = (id, G, gasta, alvo) => {
    if (id != 12) return;
    const a = alvo(['fita'], 0.6);
    if (!a) { J.aviso('Use a fita verde no toca-fitas', 2); return; }
    if (G.fitaNull) return;
    J.troca(a.o.m, 'Texture2D/SchoolHouse/PickUps/TapePlayer/TapePlayerClosed.png');
    G.fitaNull = { t: 75, som: M.som(SOM('fita_null'), { de: a.o, loop: true, alcance: 160, vol: 0.9 }) };
    J.aviso('A fita verde está tocando... algo mudou no porão.', 3);
    // a fita não é gasta: dá para tentar de novo se ela acabar
  };

  // ---------- 1º discurso: na sala secreta, com a fita tocando ----------
  function discurso1(G) {
    G.discurso1 = true;
    const E = J.E, [sx, sz] = E.porao.sala;
    // ninguém atrapalha, e a porta misteriosa tranca
    for (const n of Object.values(G.npcs)) { n.ativo = false; if (n.spr) n.spr.visible = false; }
    const porta = G.portas.find((d) => d.tex.f.includes('MysteryDoor'));
    if (porta) { porta.aberta = false; porta.trava = 1e9; porta.seg.ativo = true; J.mostraPorta(porta); }
    const nul = J.sprite(PASTA + 'null.png', 1.7, 1.7); nul.position.set(sx + 4, 4.2, sz);
    M.para(G.fitaNull && G.fitaNull.som);
    const fala = M.som(SOM('Null_Demo'), { vol: 1 });
    legendas(FALA1, 170);
    document.body.classList.add('nullGlitch');
    const fim = () => {
      salva({ d1: true });
      document.body.classList.add('nullForte');
      M.som(SOM('NullFinaleBackground'), { vol: 1 });
      // o jogo "trava" e volta para a tela inicial
      setTimeout(() => { M.paraTudo(); if (J.G) J.G.fim = true; document.body.innerHTML = '<div style="position:fixed;inset:0;background:#000"></div>'; setTimeout(() => location.reload(), 1800); }, 2600);
    };
    const espera = () => { if (!J.G || J.G !== G) return; if (fala && !fala.fim) setTimeout(espera, 300); else fim(); };
    setTimeout(espera, 1500);
  }

  // ---------- 2º discurso: atrás da porta certa ----------
  function aparece2(G, S) {
    S.fase = 'esperando';
    M.para(S.zumbido);
    const [x, z] = S.certa.centro;
    S.nul = J.sprite(PASTA + 'null.png', 1.7, 1.7); S.nul.position.set(x, 4.2, z);
    if (S.nul.material) { S.nul.material.fog = false; S.nul.material.needsUpdate = true; } // aparece no meio do escuro
  }
  function discurso2(G, S) {
    S.fase = 'falando';
    const fala = M.som(SOM('Null_PreBoss_Intro'), { vol: 1 });
    legendas(FALA2, 82);
    document.body.classList.add('nullGlitch');
    const depois = () => {
      if (!J.G || J.G !== G || G.fim) return;
      if (fala && !fala.fim) return setTimeout(depois, 300);
      // o grito: tudo treme e começa a luta
      M.som(SOM('Null_PreBoss_Start'), { vol: 1 });
      legendas(FALA3, 12);
      setTimeout(() => document.body.classList.add('nullTreme', 'nullForte'), 9000);
      setTimeout(() => {
        if (!J.G || J.G !== G || G.fim) return;
        document.body.classList.remove('nullTreme', 'nullForte');
        J.cena.remove(S.nul); S.fase = 'luta'; J.cena.fog = null;
        salva({ d2: true });
        J.chefaoNull(G, { direto: true, pos: [S.nul.position.x, S.nul.position.z] });
      }, 13500);
    };
    setTimeout(depois, 1500);
  }

  function flash() { const c = document.querySelector('canvas'); if (c) { c.style.filter = 'invert(1) hue-rotate(180deg)'; setTimeout(() => (c.style.filter = ''), 150); } }

  // ---------- atalhos do tester (o APK de tester liga J.testeNull) ----------
  function testeAtalho(G) {
    const t = J.testeNull, E = J.E, p = G.p;
    if (!G || J.G !== G) return;
    if ((t == 'sala' || t == 'discurso1') && E.porao && E.porao.sala) {
      G.item[0] = 12; J.atualizaHud();
      const [sx, sz] = E.porao.sala, porta = G.portas.find((d) => d.tex.f.includes('MysteryDoor'));
      if (t == 'discurso1') { G.fitaNull = { t: 75, som: null }; p.x = sx; p.z = sz; }
      else if (porta) { const [bx, bz] = E.porao.entrada; p.x = bx; p.z = bz; }
      if (G.porao) { G.porao.longe = false; G.porao.cool = 1; } // não volta pela escada na hora
    }
    if (t == 'boss') J.chefaoNull(G, { direto: true });
  }
})();
