// Baldi's Basics (web): regras do jogo portadas dos scripts C# do projeto aberto.
(function () {
  'use strict';
  const M = window.Motor, $ = (id) => document.getElementById(id);
  const J = (window.Jogo = { ganchos: { monta: [], inicia: [], tique: [], caderno: [] } });
  const FIXO = 1 / 50; // o Unity roda a física (FixedUpdate) a 50 por segundo
  const ITEM = ['Nada', 'Barra Zesty de Energia', 'Trava Amarela de Porta', 'Chaves do Diretor', 'BSODA', 'Moeda de 25 centavos', 'Fita "Baldi Anti Hearing"', 'Despertador', 'WD-Sem Ranger', 'Tesoura sem ponta', 'Botas Grandes', 'Teletransportador Perigoso'];
  const ICONE = [null, 'EnergyFlavoredZestyBar', 'YellowDoorLock', 'Key', 'BSODA', 'Quarter', 'Tape', 'AlarmClockItem', 'wd_nosquee', 'SafetyScissors', 'BootsIcon', 'TeleporterIcon'];
  const PEGA = { Pickup_EnergyFlavoredZestyBar: 1, Pickup_YellowDoorLock: 2, Pickup_Key: 3, Pickup_BSODA: 4, Pickup_Quarter: 5, Pickup_Tape: 6, Pickup_AlarmClock: 7, 'Pickup_WD-3D': 8, Pickup_SafetyScissors: 9, Pickup_BigBoots: 10, Pickup_Teleporter: 11 };
  const SONS = ['Characters/Baldi/Sounds/BAL_Slap', 'Characters/Baldi/Sounds/BAL_Screech', 'Characters/Baldi/BaldiTutor/BAL_Hi', 'Characters/Baldi/BaldiTutor/BAL_GetPrize', 'Characters/Baldi/BaldiTutor/BAL_Door', 'Characters/Baldi/BAL_AllNotebooks',
    'Characters/Baldi/MathGame/BAL_Math_Plus', 'Characters/Baldi/MathGame/BAL_Math_Minus', 'Characters/Baldi/MathGame/BAL_Math_Times', 'Characters/Baldi/MathGame/BAL_Math_Equals', 'Characters/Baldi/MathGame/Intro/BAL_Math_Intro', 'Characters/Baldi/MathGame/Intro/BAL_General_HowTo',
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => 'Characters/Baldi/MathGame/Numbers/BAL_Math_' + n), ...[1, 2, 3, 4, 5].map((n) => 'Characters/Baldi/MathGame/Praises/BAL_Praise' + n), ...[1, 2, 3].map((n) => 'Characters/Baldi/MathGame/Problems/BAL_General_Problem' + n),
    'Music/mus_School', 'Music/mus_Learn', 'Music/mus_hang', 'Sounds/Buzz', 'Sounds/Doors/door_open', 'Sounds/Doors/door_close', 'Sounds/Doors/swingdoor_open', 'Sounds/Items/soda_spray', 'Sounds/Items/can_spray', 'Sounds/Items/bell', 'Sounds/Items/clocktick', 'Sounds/Items/AntiHearing', 'Sounds/Items/Teleport', 'Sounds/Items/respawn', 'Sounds/delay', 'Sounds/ohno',
    'Sounds/FinalMode/quiet noise loop', 'Sounds/FinalMode/LoudNoiseIntroLoop', 'Sounds/FinalMode/Loud noise 3', 'Sounds/FinalMode/Loud noise 3_Loop', ...['ambience', 'creepy sound', 'dulcimer', 'fret', 'noise', 'tone'].map((n) => 'Sounds/Ambiences/' + n),
    'Characters/Principal/PRI_Whistle', 'Characters/Principal/PRI_DetentionForYou', ...['NoBullying', 'NoDrinking', 'NoEscaping', 'NoFaculty', 'NoRunning'].map((n) => 'Characters/Principal/RuleBroke/PRI_' + n), ...['YourParents', 'KnowBetter', 'WhenLearn'].map((n) => 'Characters/Principal/Scolds/PRI_' + n), ...[15, 30, 45, 60, 99].map((n) => 'Characters/Principal/Seconds/PRI_' + n + 'Sec'),
    ...['Congrats', 'Laugh', 'LetsPlay', 'Oops', 'ReadyGo', 'Sad', 'WannaPlay'].map((n) => 'Characters/Playtime/PT_' + n), ...[1, 2, 3, 4, 5].map((n) => 'Characters/Playtime/Numbers/PT_' + n),
    'Characters/GottaSweep/GS_GottaSweep', 'Characters/GottaSweep/GS_Intro', 'Characters/Arts&Crafters/CFT_Intro', 'Characters/Arts&Crafters/CFT_Loop',
    ...['AmComing', 'AmLooking', 'BeenProgrammed', 'HaveLost', 'IHug', 'ISeeYou', 'Marry', 'OhNo'].map((n) => 'Characters/1stPrize/1PR_' + n), 'Characters/1stPrize/Sounds/1PR_Motor',
    ...['Donation', 'GiveGreat', 'NoItems', 'TakeCandy', 'TakeThat'].map((n) => 'Characters/Bully/B_' + n)];
  J.SONS = SONS;

  /* ---------- cena 3D ---------- */
  const canvas = $('c'), render = new THREE.WebGLRenderer({ canvas, antialias: false });
  render.outputEncoding = THREE.sRGBEncoding;
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  let cena, mundo, nav, E, malhas, monta;
  function ajusta() {
    const w = innerWidth, h = innerHeight;
    render.setPixelRatio(Math.min(devicePixelRatio, 1.5)); render.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w > h ? 60 : 75; camera.updateProjectionMatrix();
  }
  addEventListener('resize', ajusta);

  // sprite virado para a câmera (como o script Billboard do jogo)
  const sprites = [];
  function sprite(tex, larg, alt, piv = [0.5, 0.5]) {
    const g = new THREE.PlaneGeometry(1, 1).translate(0.5 - piv[0], 0.5 - piv[1], 0);
    const mat = new THREE.MeshBasicMaterial({ map: M.tex(tex), alphaTest: 0.5, side: THREE.DoubleSide });
    const m = new THREE.Mesh(g, mat);
    m.userData.larg = larg; m.userData.alt = alt;
    // o tamanho vem da imagem (pixels / 100), então espera ela carregar
    (function ajustaTam() { const i = mat.map.image; if (i && i.width) m.scale.set(i.width / 100 * larg, i.height / 100 * alt, 1); else setTimeout(ajustaTam, 60); })();
    cena.add(m); sprites.push(m);
    return m;
  }
  // troca o desenho do sprite só quando a imagem nova já carregou (senão o personagem pisca/some)
  function troca(m, tex) { const t = M.tex(tex); if (m.material.map !== t && t.image && t.image.width) { m.material.map = t; m.material.needsUpdate = true; } }
  // escala do sprite a partir da matriz do Unity (tamanho em pixels / pixels por unidade × escala)
  function spriteDe(s) {
    const sx = Math.hypot(s.M[0], s.M[1], s.M[2]) * 100 / s.ppu, sy = Math.hypot(s.M[4], s.M[5], s.M[6]) * 100 / s.ppu;
    const m = sprite(s.tex, sx, sy, s.piv);
    m.position.set(s.M[12], s.M[13], s.M[14]);
    return m;
  }

  /* ---------- carregar ---------- */
  J.carregar = async () => {
    const [e, mm] = await Promise.all([fetch('escola.json').then((r) => r.json()), fetch('malhas.json').then((r) => r.json())]);
    J.Ebase = e; malhas = mm;
  };
  function montaCena(modo) {
    E = JSON.parse(JSON.stringify(J.Ebase));
    J.E = E;
    J.ganchos.monta.forEach((f) => f(E, J, modo));
    cena = new THREE.Scene(); cena.background = new THREE.Color(0x000000);
    sprites.length = 0;
    monta = M.monta(E, malhas, cena);
    mundo = new M.Mundo(E);
    let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
    for (const s of E.segs) { x0 = Math.min(x0, s.a[0], s.b[0]); x1 = Math.max(x1, s.a[0], s.b[0]); z0 = Math.min(z0, s.a[1], s.b[1]); z1 = Math.max(z1, s.a[1], s.b[1]); }
    nav = new M.Nav(mundo, [x0 - 5, z0 - 5, x1 + 5, z1 + 5]);
    J.mundo = mundo; J.nav = nav; J.cena = cena; J.camera = camera;
  }

  /* ---------- estado ---------- */
  let G = null; // jogo em andamento
  J.estado = () => G;
  const espDe = (s, n) => E.esp.filter((e) => e.s === s && (!n || e.n === n));
  // dificuldade: raiva do Baldi, espera entre os passos, detenção, energia, Diretor e tempo do teste do Dr. Reflex
  const DIF = {
    facil: { nome: 'Fácil', raiva: 0.6, espera: 1.35, deten: [0, 0, 1, 1, 1], gasto: 0.6, olhar: 1.2, reflexo: 1.5 },
    normal: { nome: 'Normal', raiva: 1, espera: 1, deten: [0, 1, 2, 3, 4], gasto: 1, olhar: 0.5, reflexo: 1 },
    dificil: { nome: 'Difícil', raiva: 1.3, espera: 0.85, deten: [1, 2, 3, 4, 4], gasto: 1.2, olhar: 0.35, reflexo: 0.75 },
  };
  let dificuldade = 'normal';
  try { dificuldade = DIF[localStorage.getItem('baldiDificuldade')] ? localStorage.getItem('baldiDificuldade') : 'normal'; } catch (e) {}
  J.DIF = DIF;
  function novoJogo(modo) {
    montaCena(modo);
    const pj = espDe('PlayerScript')[0];
    G = {
      modo, t: 0, cadernos: 0, totalCadernos: E.totalCadernos || 7, falhou: 0, spoop: false, final: false, saidas: 0, pausado: false, aprendendo: false, fim: false,
      p: { x: pj.pos[0], z: pj.pos[2], yaw: 0, est: 100, culpa: 0, culpaTipo: '', corda: false, varrendo: 0, abracando: 0, botas: 0, h: 4, pulo: 0, vy: 0, preso: null },
      item: [0, 0, 0], sel: 0, objs: [], npcs: {}, portas: [], acum: 0, sons: {}, dif: DIF[dificuldade],
    };
    G.infinito = modo == 'infinito';
    J.G = G;
    // portas
    for (const p of monta.portas) {
      const seg = mundo.addDyn({ ax: p.bar.a[0], az: p.bar.a[1], bx: p.bar.b[0], bz: p.bar.b[1], y0: p.bar.y[0], y1: p.bar.y[1] });
      const base = p.malhas[0].base || '';
      const tipo = /Faculty/.test(base) ? 'prof' : p.tipo;
      const tex = tipo == 'vaivem' ? { f: base, a: base.replace('SwingDoor0', 'SwingDoor60'), t: base.replace(/SwingDoor0(_Dark)?\.png/, 'SwingDoor0_Locked.png') } : { f: base, a: base.replace('_0.png', '_80.png') };
      if (tipo == 'vaivem') tex.a = tex.a.replace('_Dark', ''), tex.t = tex.t.replace('_Dark', '');
      const d = { x: p.pos[0], z: p.pos[2], tipo, tex, seg, malhas: p.malhas, aberta: false, tempo: 0, trava: 0, travada: tipo == 'vaivem', silencio: 0, req: tipo != 'vaivem' };
      seg.ativo = tipo != 'vaivem' || d.travada;
      G.portas.push(d);
      mostraPorta(d);
    }
    // a porta da diretoria é a mais perto do ponto de detenção
    const pd = E.pontos.principalDetentionPoint;
    G.diretoria = G.portas.reduce((a, b) => (Math.hypot(b.x - pd[0], b.z - pd[2]) < Math.hypot(a.x - pd[0], a.z - pd[2]) ? b : a));
    // a porta da diretoria tem a placa "Principal"
    if (G.diretoria.tipo == 'porta') { G.diretoria.tex = { f: 'Texture2D/SchoolHouse/DoorTextures/PrincipalDoor_0.png', a: 'Texture2D/SchoolHouse/DoorTextures/PrincipalDoor_80.png' }; mostraPorta(G.diretoria); }
    // sprites soltos (enfeites, cadernos, itens, placas)
    for (const s of E.spr) {
      if (s.pai.startsWith('NPC/') || /PrototypeStuff|Old/.test(s.pai)) continue;
      const m = spriteDe(s); m.visible = !!s.a;
      const nome = s.pai.split('/').pop();
      if (/Notebooks\//.test(s.pai) && s.n == '_nbSprite') G.objs.push({ tipo: 'caderno', m, x: m.position.x, z: m.position.z, nome, ativo: true });
      else if (PEGA[nome]) G.objs.push({ tipo: 'item', id: PEGA[nome], m, x: m.position.x, z: m.position.z, y0: m.position.y, nome, ativo: !!s.a });
      else if (nome == 'DisorientingDevices') G.objs.push({ tipo: s.n == 'PhoneSprite' ? 'telefone' : 'fita', m, x: m.position.x, z: m.position.z });
    }
    for (const c of E.caixas) if (/BSODAMachine|ZestyMachine/.test(c.n)) G.objs.push({ tipo: 'maquina', id: /BSODA/.test(c.n) ? 4 : 1, x: c.c[0], z: c.c[2] });
    criaNPCs();
    J.ganchos.inicia.forEach((f) => f(G, J));
    atualizaHud();
  }
  function mostraPorta(d) {
    const t = d.trava > 0 || (d.tipo == 'vaivem' && d.travada) ? d.tex.t || d.tex.f : d.aberta ? d.tex.a : d.tex.f;
    d.malhas.forEach((q) => { if (q.mesh.material.map) { const mt = M.tex(t); if (q.mesh.material.map.image !== mt.image) { q.mesh.material.map = mt; q.mesh.material.needsUpdate = true; } } });
  }
  function abrePorta(d, quem) {
    if (d.tipo == 'vaivem') {
      if (d.travada) return;
      if (!d.aberta) M.som('Sounds/Doors/swingdoor_open', { de: d, vol: 0.8 });
      d.aberta = true; d.tempo = 2; mostraPorta(d);
      if (quem == 'jogador' && G.npcs.baldi.ativo) G.npcs.baldi.ouve(d.x, d.z, 1);
      return;
    }
    if (d.trava > 0) return;
    if (!d.aberta && d.silencio <= 0) M.som('Sounds/Doors/door_open', { de: d });
    if (quem == 'jogador') { if (d.silencio > 0) d.silencio--; else if (G.npcs.baldi.ativo) G.npcs.baldi.ouve(d.x, d.z, 1); }
    d.aberta = true; d.tempo = 3; d.seg.ativo = false; mostraPorta(d);
  }
  function portas(dt) {
    const p = G.p;
    for (const d of G.portas) {
      if (d.tipo == 'vaivem') {
        if (!d.req && G.cadernos >= 2) { d.req = true; d.trava = 0; }
        d.trava = Math.max(0, d.trava - dt);
        const travada = !d.req || d.trava > 0;
        if (travada !== d.travada) { d.travada = travada; d.seg.ativo = travada; mostraPorta(d); trancaNav(d, travada); }
        if (!travada) {
          const perto = Math.hypot(p.x - d.x, p.z - d.z) < 5 ? 'jogador' : Object.values(G.npcs).some((n) => n.ativo && Math.hypot(n.x - d.x, n.z - d.z) < 5) ? 'npc' : null;
          if (perto) { if (!d.aberta) abrePorta(d, perto); else d.tempo = 2; }
        }
        if (d.aberta && (d.tempo -= dt) <= 0) { d.aberta = false; mostraPorta(d); }
      } else {
        if (d.trava > 0 && (d.trava -= dt) <= 0) { d.trava = 0; mostraPorta(d); }
        if (d.trava <= 0 && Object.values(G.npcs).some((n) => n.ativo && n.abrePortas !== false && Math.hypot(n.x - d.x, n.z - d.z) < 5)) abrePorta(d, 'npc');
        if (d.aberta && (d.tempo -= dt) <= 0) {
          d.aberta = false; d.seg.ativo = true; mostraPorta(d);
          if (d.silencio <= 0) M.som('Sounds/Doors/door_close', { de: d });
          // ninguém fica preso dentro da porta
          const o = { x: p.x, z: p.z }; mundo.resolve(o, 2); p.x = o.x; p.z = o.z;
        }
      }
    }
  }
  function trancaNav(d, on) {
    nav.trava = nav.trava || new Set();
    const [i0, j0] = nav.cel(d.x, d.z);
    for (let di = -2; di <= 2; di++) for (let dj = -2; dj <= 2; dj++) { const k = (j0 + dj) * nav.W + i0 + di; on ? nav.trava.add(k) : nav.trava.delete(k); }
  }

  /* ---------- personagens ---------- */
  // Agente que anda pela grade (faz o papel do NavMeshAgent)
  function Agente(nome, x, z, vel) {
    return {
      nome, x, z, vel, ativo: false, cam: [], dest: null, vx: 0, vz: 0, empurro: 0, ex: 0, ez: 0,
      vai(tx, tz) {
        // perseguindo: recalcula no máximo 5 vezes por segundo se o alvo mexeu pouco
        if (this.dest && this.cam.length && G && G.t - (this.tVai || -9) < 0.2 && Math.hypot(tx - this.dest[0], tz - this.dest[1]) < 3) return;
        this.tVai = G ? G.t : 0; this.dest = [tx, tz]; this.cam = nav.caminho(this.x, this.z, tx, tz);
      },
      anda(dt, v = this.vel) {
        let ox = this.x, oz = this.z;
        if (this.empurro > 0) { this.empurro -= dt; this.x += this.ex * dt; this.z += this.ez * dt; const o = { x: this.x, z: this.z }; mundo.resolve(o, 1, true); this.x = o.x; this.z = o.z; }
        else {
          // esmagado pelo martelo do Dr. Reflex: parado 2 s, depois metade da velocidade
          if (this.esmagado > 0) { this.esmagado -= dt; v = this.esmagado > 28 ? 0 : v * 0.5; }
          // vento do Cloudy Copter: mais rápido a favor, mais devagar contra
          if (this.cam.length && G.vento) { const [tx, tz] = this.cam[0], d = Math.hypot(tx - this.x, tz - this.z) || 1; v *= G.vento(this.x, this.z, (tx - this.x) / d, (tz - this.z) / d); }
          let passo = v * dt;
          while (passo > 0 && this.cam.length) {
            const [tx, tz] = this.cam[0], dx = tx - this.x, dz = tz - this.z, d = Math.hypot(dx, dz);
            if (d <= passo) { this.x = tx; this.z = tz; passo -= d; this.cam.shift(); } else { this.x += (dx / d) * passo; this.z += (dz / d) * passo; passo = 0; }
          }
        }
        this.vx = (this.x - ox) / dt; this.vz = (this.z - oz) / dt;
      },
      parado() { return Math.hypot(this.vx, this.vz) <= 1; },
      chegou() { return !this.cam.length; },
    };
  }
  // pontos de ronda: os 16 primeiros são corredores, o resto são salas (como no AILocationSelector)
  const ronda = (sala) => {
    const l = sala ? E.ronda.concat(E.rondaCorr || [], E.rondaSala || []) : E.ronda.slice(0, 16).concat(E.rondaCorr || []);
    return l[M.rndInt(0, l.length - 1)];
  };
  const ve = (n) => mundo.ve(n.x, n.z, G.p.x, G.p.z);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  function npcSprite(nomeUnity) {
    const s = E.spr.find((s) => s.pai.startsWith('NPC/' + nomeUnity) && s.n != 'New Sprite');
    const e = E.esp.find((e) => e.n === nomeUnity);
    const m = spriteDe(s); m.visible = false;
    return { m, oy: s.M[13], ex: e ? e.pos : [s.M[12], 0, s.M[14]] };
  }
  function criaNPCs() {
    const N = G.npcs;
    const b = npcSprite('Baldi');
    N.baldi = Object.assign(Agente('Baldi', b.ex[0], b.ex[2], 0), {
      spr: b.m, oy: b.oy, espera: 3, mover: 0, raiva: 0, raivaT: 0, escala: 0.65, quadros: 0, cool: 0, prio: 0, surdo: 0, prev: null, tapa: 0,
      ativa() { this.ativo = true; this.spr.visible = true; this.mover = 3; this.vagar(); },
      vagar() { const r = ronda(true); this.vai(r[0], r[1]); this.cool = 1; this.prio = 0; },
      ouve(x, z, pr) { if (this.ativo && this.surdo <= 0 && pr >= this.prio) { this.vai(x, z); this.prio = pr; } },
      bravo(v) { this.raiva = Math.max(0.5, this.raiva + v * G.dif.raiva); this.espera = (-3 * this.raiva / (this.raiva + 2 / this.escala) + 3) * G.dif.espera; },
      tique(dt) {
        if ((this.mover -= dt) <= 0) this.tapear();
        this.cool -= dt; this.raivaT = Math.max(0, this.raivaT - 0.02 * dt); this.surdo -= dt;
        if (G.infinito && (this.tRaiva = (this.tRaiva ?? 1) - dt) <= 0) { this.tRaiva = 1; this.bravo(this.taxa = (this.taxa ?? 0.01) + 0.00025); }
      },
      fixo(dt) {
        const corre = this.quadros > 0; if (corre) this.quadros--;
        this.anda(dt, corre ? 75 : 0);
        if (ve(this)) { this.vai(G.p.x, G.p.z); this.cool = 1; this.prio = 0; }
      },
      tapear() {
        if (this.prev && Math.hypot(this.x - this.prev[0], this.z - this.prev[1]) < 0.01 && this.cool < 0) this.vagar();
        this.quadros = 10; this.mover = this.espera - this.raivaT; this.prev = [this.x, this.z]; this.tapa = 0.3;
        M.som('Characters/Baldi/Sounds/BAL_Slap', { de: this, alcance: 160 });
      },
      anima(dt) { this.tapa -= dt; const f = this.tapa > 0 ? [0, 6, 12, 18, 24][Math.min(4, Math.floor((0.3 - this.tapa) / 0.06))] : 24; troca(this.spr, 'Texture2D/CharacterSprites/Baldi/Angry/Baldi_Slap' + String(f).padStart(4, '0') + '.png'); },
    });
    // Baldi do tutorial (acena na entrada)
    const tb = E.spr.find((s) => s.pai.startsWith('NPC/TutorBaldi'));
    if (tb) { G.tutor = spriteDe(tb); G.tutorT = 0; }
    const pr = npcSprite('Principal of the Thing');
    N.diretor = Object.assign(Agente('Diretor', pr.ex[0], pr.ex[2], 30), {
      spr: pr.m, oy: pr.oy, vendo: 0, bravo: false, cool: 0, naSala: false, detencoes: 0, fila: [],
      ativa() { this.ativo = true; this.spr.visible = true; },
      fala(n) { this.fila.push(n); },
      tique(dt) {
        this.cool -= dt;
        if (this.fila.length && (!this.falando || this.falando.fim)) this.falando = M.som(this.fila.shift(), { de: this });
        const p = G.p;
        this.naSala = dentro('Office Trigger', this.x, this.z);
        if (!this.bravo) {
          if (ve(this) && p.culpa > 0 && !this.naSala) { if ((this.vendo += dt) >= G.dif.olhar) { this.bravo = true; this.vendo = 0; this.corrige(); } }
          else { this.vendo = 0; if (this.parado() && this.cool <= 0) this.vagar(); }
          const bu = G.npcs.bully;
          if (bu.ativo && bu.culpa > 0 && !this.naSala && mundo.ve(this.x, this.z, bu.x, bu.z) && !this.viuBully) { this.vai(bu.x, bu.z); this.fala('Characters/Principal/RuleBroke/PRI_NoBullying'); this.viuBully = true; }
        } else if (this.cool <= 0 || this.chegou()) { this.vai(p.x, p.z); this.cool = 0.2; }
        if (this.bravo && dist(this, p) < 3) this.detencao();
      },
      fixo(dt) { this.anda(dt); },
      vagar() { const r = ronda(true); this.vai(r[0], r[1]); this.cool = 1; this.viuBully = false; if (Math.random() < 0.1) M.som('Characters/Principal/PRI_Whistle', { de: this, vol: 0.5 }); },
      corrige() { this.fila = []; const m = { faculty: 'NoFaculty', running: 'NoRunning', drink: 'NoDrinking', escape: 'NoEscaping' }[G.p.culpaTipo]; if (m) this.fala('Characters/Principal/RuleBroke/PRI_' + m); },
      detencao() {
        const pp = E.pontos.playerDetentionPoint, dp = E.pontos.principalDetentionPoint, T = [15, 30, 45, 60, 99], t = G.dif.deten[this.detencoes];
        this.x = dp[0]; this.z = dp[2]; this.cam = []; G.p.x = pp[0]; G.p.z = pp[2];
        this.fila = ['Sounds/delay', 'Characters/Principal/Seconds/PRI_' + T[t] + 'Sec', 'Characters/Principal/PRI_DetentionForYou', 'Characters/Principal/Scolds/PRI_' + ['YourParents', 'KnowBetter', 'WhenLearn'][M.rndInt(0, 2)]];
        G.diretoria.trava = T[t]; G.diretoria.aberta = false; G.diretoria.seg.ativo = true; mostraPorta(G.diretoria);
        G.npcs.baldi.ouve(this.x, this.z, 8);
        this.cool = 5; this.bravo = false; this.detencoes = Math.min(4, this.detencoes + 1);
      },
    });
    const pt = npcSprite('Playtime');
    N.playtime = Object.assign(Agente('Playtime', pt.ex[0], pt.ex[2], 15), {
      spr: pt.m, oy: pt.oy, viu: false, cool: 0, jogaCool: 0, avisou: false, triste: 0, voz: 0, fala: null, tAviso: 0,
      ativa() { this.ativo = true; this.spr.visible = true; this.vagar(); },
      // fala no máximo de 8 em 8 segundos e nunca por cima de outra fala dela
      diz(n, pausa = 8) { if (this.voz > 0 || (this.fala && !this.fala.fim)) return; this.fala = M.som('Characters/Playtime/PT_' + n, { de: this }); this.voz = pausa; },
      vagar() { const r = ronda(false); this.vai(r[0], r[1]); this.vel = 15; if (Math.random() < 0.3) this.diz(Math.random() < 0.5 ? 'Laugh' : 'WannaPlay', 12); this.cool = 2; },
      tique(dt) { this.cool -= dt; this.jogaCool -= dt; this.triste -= dt; this.voz -= dt; this.tAviso -= dt; },
      fixo(dt) {
        if (G.p.corda) return;
        if (ve(this) && this.jogaCool <= 0 && dist(this, G.p) < 120) {
          this.viu = true; this.vai(G.p.x, G.p.z); this.vel = 20; this.cool = 0.2;
          if (this.tAviso <= 0) { this.tAviso = 15; this.voz = 0; this.diz('LetsPlay'); }
        } else if (this.viu && this.cool <= 0) { this.viu = false; this.vagar(); }
        else if (this.parado() && this.cool <= 0) this.vagar();
        this.anda(dt);
        if (dist(this, G.p) < 3 && this.jogaCool <= 0 && !G.p.corda) comecaCorda(this);
      },
      anima() { troca(this.spr, 'Texture2D/CharacterSprites/Playtime/' + (this.triste > 0 ? 'JumpRope_None.png' : 'JumpRope_0.png')); },
    });
    const gs = npcSprite('Gotta Sweep');
    N.sweep = Object.assign(Agente('Gotta Sweep', gs.ex[0], gs.ex[2], 50), {
      spr: gs.m, oy: gs.oy, origem: [gs.ex[0], gs.ex[2]], espera: M.rnd(120, 180), voltas: 0, vagando: false, cool: 0, abrePortas: true,
      ativa() { this.ativo = true; this.spr.visible = true; },
      tique(dt) {
        this.cool -= dt;
        if (this.espera > 0) this.espera -= dt;
        else if (!this.vagando) { this.vagando = true; this.voltas = 0; this.vagar(); M.som('Characters/GottaSweep/GS_Intro', { de: this }); }
      },
      fixo(dt) {
        if (this.vagando && this.parado() && this.cool <= 0 && this.voltas < 5) this.vagar();
        else if (this.voltas >= 5) { this.vai(...this.origem); this.espera = M.rnd(120, 180); this.voltas = 0; this.vagando = false; }
        this.anda(dt);
        const p = G.p, perto = dist(this, p) < 5;
        if (perto && !this.tocou) M.som('Characters/GottaSweep/GS_GottaSweep', { de: this });
        this.tocou = perto;
        if (perto && G.p.botas <= 0) p.varrendo = 1, (p.varreV = [this.vx, this.vz]);
        // empurra os outros personagens também
        for (const n of Object.values(G.npcs)) if (n !== this && n.ativo && dist(n, this) < 4 && Math.hypot(this.vx, this.vz) > 1) { n.empurro = 0.5; n.ex = this.vx * 1.1; n.ez = this.vz * 1.1; }
      },
      vagar() { const r = ronda(false); this.vai(r[0], r[1]); this.cool = 1; this.voltas++; },
    });
    const cf = npcSprite('Arts and Crafters');
    N.crafters = Object.assign(Agente('Arts and Crafters', cf.ex[0], cf.ex[2], 30), {
      spr: cf.m, oy: cf.oy, raiva: 0, bravo: false, ficando: false,
      ativa() { this.ativo = true; },
      tique(dt) {
        if (this.ficando) { this.raiva += dt; if (this.raiva >= 1 && !this.bravo) { this.bravo = true; M.som('Characters/Arts&Crafters/CFT_Intro', { de: this }); troca(this.spr, 'Texture2D/CharacterSprites/Arts&Crafters/Crafters_Ohno.png'); } }
        else if (this.raiva > 0) this.raiva -= dt;
        if (!this.bravo) this.spr.visible = dist(this, G.p) >= 60 && !this.cam.length;
        else { this.spr.visible = true; this.vel += 60 * dt; this.vai(G.p.x, G.p.z); if (!this.loop || this.loop.fim) this.loop = M.som('Characters/Arts&Crafters/CFT_Loop', { de: this }); }
      },
      fixo(dt) {
        this.ficando = G.cadernos >= G.totalCadernos && ve(this) && dist(this, G.p) < 200;
        this.anda(dt);
        if (this.bravo && dist(this, G.p) < 3) {
          const pp = E.pontos.playerTeleportPoint, bp = E.pontos.baldiTeleportPoint;
          G.p.x = pp[0]; G.p.z = pp[2]; G.npcs.baldi.x = bp[0]; G.npcs.baldi.z = bp[2]; G.npcs.baldi.cam = [];
          this.ativo = false; this.spr.visible = false; M.para(this.loop);
        }
      },
    });
    const fp = npcSprite('1st Prize');
    N.prize = Object.assign(Agente('1st Prize', fp.ex[0], fp.ex[2], 5), {
      spr: fp.m, oy: fp.oy, dir: 0, viu: false, cool: 1, louco: 0, vAtual: 5, abracou: false, solta: 0,
      ativa() { this.ativo = true; this.spr.visible = true; this.vagar(); },
      vagar() { const r = ronda(false); this.vai(r[0], r[1]); this.abracou = false; if (Math.random() < 0.1) M.som('Characters/1stPrize/1PR_' + (Math.random() < 0.5 ? 'BeenProgrammed' : 'AmLooking'), { de: this }); this.cool = 1; },
      tique(dt) { this.cool -= dt; this.solta -= dt; },
      fixo(dt) {
        if (this.louco > 0) { this.louco -= dt; this.dir += Math.PI * dt; this.vx = this.vz = 0; return; }
        if (ve(this) && !G.p.corda) {
          if (!this.viu) M.som('Characters/1stPrize/1PR_' + (Math.random() < 0.5 ? 'ISeeYou' : 'AmComing'), { de: this });
          this.viu = true; this.vai(G.p.x, G.p.z); this.cool = 0.5; this.vAtual = Math.min(40, this.vAtual + 12 * dt); // acelera devagar
        } else {
          this.vAtual = 5;
          if (this.viu && this.cool <= 0) { M.som('Characters/1stPrize/1PR_' + (Math.random() < 0.5 ? 'HaveLost' : 'OhNo'), { de: this }); this.viu = false; this.vagar(); }
          else if (this.parado() && this.cool <= 0) this.vagar();
        }
        // ele só anda para a frente: vira devagar antes de acelerar
        if (this.cam.length) {
          const alvo = Math.atan2(this.cam[0][0] - this.x, this.cam[0][1] - this.z);
          let d = alvo - this.dir; d = Math.atan2(Math.sin(d), Math.cos(d));
          if (Math.abs(d) < 0.09) { this.dir = alvo; this.anda(dt, this.vAtual); } else { this.dir += Math.sign(d) * Math.min(Math.abs(d), (this.viu ? 1 : 0.7) * dt); this.anda(dt, 0); this.vAtual = Math.max(5, this.vAtual * 0.97); } // vira devagar e perde velocidade
        } else this.anda(dt, 0);
        const sp = Math.hypot(this.vx, this.vz);
        // parado ou quase: solta o jogador e espera um pouco antes de abraçar de novo
        if (G.p.abraco === this && G.p.abracando > 0 && sp < 4) { G.p.abracando = 0; this.solta = 2; this.abracou = false; }
        if (dist(this, G.p) < 3.5 && sp > 8 && G.p.botas <= 0 && this.solta <= 0) {
          G.p.abracando = 0.3; G.p.abraco = this;
          if (!this.abracou) { this.abracou = true; M.som('Characters/1stPrize/1PR_' + (Math.random() < 0.5 ? 'IHug' : 'Marry'), { de: this }); }
        }
      },
      anima() {
        // 16 desenhos, um para cada ângulo em relação à câmera
        let a = Math.atan2(G.p.x - this.x, G.p.z - this.z) - this.dir; a = ((a * 180 / Math.PI) % 360 + 360) % 360;
        const k = Math.round(a / 22.5) % 16, n = k * 22.5;
        troca(this.spr, 'Texture2D/CharacterSprites/1stPrize/1PR_' + (n % 1 ? n.toFixed(1) : n) + '.png');
      },
    });
    const bl = npcSprite('Its a Bully');
    N.bully = Object.assign(Agente('Bully', 0, 0, 0), {
      spr: bl.m, oy: bl.oy, espera: M.rnd(60, 120), tempo: 0, culpa: 0, falou: false, abrePortas: false, solido: 3,
      ativa() { this.ativo = false; this.pronto = true; },
      aparece() {
        for (let k = 0; k < 30; k++) { const r = ronda(false); this.x = r[0]; this.z = r[1]; if (dist(this, G.p) >= 20) break; }
        this.ativo = true; this.spr.visible = true; this.tempo = 0; this.falou = false;
      },
      some() { this.ativo = false; this.spr.visible = false; this.espera = M.rnd(60, 120); },
      tique(dt) {
        this.culpa -= dt;
        if (!this.ativo) { if (this.pronto && (this.espera -= dt) <= 0) this.aparece(); return; }
        this.tempo += dt;
        if (this.tempo >= 180 && dist(this, G.p) >= 120) this.some();
      },
      fixo() {
        if (!this.ativo) return;
        this.vx = this.vz = 0;
        if (ve(this) && dist(this, G.p) < 60) { if (!this.falou) { this.falou = true; M.som('Characters/Bully/B_' + (Math.random() < 0.5 ? 'TakeCandy' : 'GiveGreat'), { de: this }); } this.culpa = 10; }
        if (dist(this, G.p) < 5.2) {
          const cheios = [0, 1, 2].filter((i) => G.item[i]);
          if (!cheios.length) { if (!this.negou || this.negou.fim) this.negou = M.som('Characters/Bully/B_NoItems', { de: this }); }
          else { const i = cheios[M.rndInt(0, cheios.length - 1)]; G.item[i] = 0; atualizaHud(); M.som('Characters/Bully/B_' + (Math.random() < 0.5 ? 'TakeThat' : 'Donation'), { de: this }); this.some(); }
        }
        if (G.npcs.diretor.ativo && dist(this, G.npcs.diretor) < 4 && this.culpa > 0) this.some();
      },
    });
    for (const n of Object.values(N)) if (n.spr) n.spr.position.set(n.x, n.oy, n.z);
  }

  /* ---------- modo spoop (Baldi bravo) e final ---------- */
  function spoop() {
    if (G.spoop) return;
    G.spoop = true;
    abaixaEntradas(true);
    if (G.tutor) G.tutor.visible = false;
    Object.values(G.npcs).forEach((n) => n.ativa());
    M.para(G.sons.musica); M.para(G.sons.aprende);
    M.som('Music/mus_hang');
  }
  function abaixaEntradas(on, so) {
    for (const s of mundo.segs) if (s.ent && (!so || s.ent === so)) s.dy = on ? -10 : 0;
    for (const [nome, ms] of Object.entries(monta.entradas)) if (!so || nome === so) ms.forEach((m) => (m.position.y = on ? -10 : 0));
  }
  function modoFinal() {
    G.final = true; abaixaEntradas(false);
  }
  function chegouSaida(nome) {
    G.saidas++;
    abaixaEntradas(true, nome);
    if (G.saidas == 1) { document.body.classList.add('vermelho'); G.sons.maquina = M.som('Sounds/FinalMode/quiet noise loop', { loop: true, vol: 0.8 }); }
    if (G.saidas == 2) { M.para(G.sons.maquina); G.sons.maquina = M.som('Sounds/FinalMode/LoudNoiseIntroLoop', { loop: true, vol: 0.8 }); }
    if (G.saidas == 3) { M.para(G.sons.maquina); G.sons.maquina = M.som('Sounds/FinalMode/Loud noise 3_Loop', { loop: true }); }
  }

  /* ---------- gatilhos (caixas invisíveis do mapa) ---------- */
  function dentro(nome, x, z) {
    for (const g of E.gat) {
      if (typeof nome == 'string' ? g.n !== nome : !nome.test(g.n)) continue;
      const dx = x - g.c[0], dz = z - g.c[2], c = Math.cos(g.ang), s = Math.sin(g.ang);
      if (Math.abs(dx * c + dz * s) <= g.h[0] && Math.abs(-dx * s + dz * c) <= g.h[2]) return g;
    }
    return null;
  }
  const entradaPerto = (g) => {
    const e = E.esp.filter((e) => e.s == 'EntranceScript').reduce((a, b) => (Math.hypot(b.pos[0] - g.c[0], b.pos[2] - g.c[2]) < Math.hypot(a.pos[0] - g.c[0], a.pos[2] - g.c[2]) ? b : a));
    return e.n;
  };
  function gatilhos() {
    const p = G.p;
    if (dentro(/^_FacultyTrigger/, p.x, p.z)) culpa('faculty', 1);
    const naSala = !!dentro('Office Trigger', p.x, p.z);
    if (G.naSala && !naSala && G.diretoria.trava > 0) culpa('escape', G.diretoria.trava);
    G.naSala = naSala;
    const pa = dentro(/^DoorAudioTrigger/, p.x, p.z);
    if (pa && pa !== G.ultPorta && G.cadernos < 2) M.som('Characters/Baldi/BaldiTutor/BAL_Door');
    G.ultPorta = pa;
    if (G.final) {
      const ne = dentro('NearTrigger', p.x, p.z);
      if (ne && G.saidas < 3) { const n = entradaPerto(ne); if (!G.saidaFeita?.[n]) { (G.saidaFeita = G.saidaFeita || {})[n] = 1; chegouSaida(n); } }
      if (dentro('ExitTrigger', p.x, p.z) && G.cadernos >= G.totalCadernos) vitoria();
    }
  }
  function culpa(tipo, v) { if (v >= G.p.culpa) { G.p.culpa = v; G.p.culpaTipo = tipo; } }

  /* ---------- entrada (toque e teclado) ---------- */
  const ent = { mx: 0, mz: 0, corre: false, olha: 0, teclas: {} };
  J.ent = ent;
  let stickId = null, olhoId = null, olhoX = 0, toqueIni = null;
  const stick = $('stick'), bola = stick.firstElementChild;
  stick.addEventListener('pointerdown', (e) => { stickId = e.pointerId; stick.setPointerCapture(e.pointerId); moveStick(e); });
  stick.addEventListener('pointermove', (e) => e.pointerId === stickId && moveStick(e));
  const soltaStick = (e) => { if (e.pointerId === stickId) { stickId = null; ent.mx = ent.mz = 0; bola.style.transform = ''; } };
  stick.addEventListener('pointerup', soltaStick); stick.addEventListener('pointercancel', soltaStick);
  function moveStick(e) {
    const r = stick.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy), m = r.width / 2; if (d > m) { dx *= m / d; dy *= m / d; }
    ent.mx = dx / m; ent.mz = -dy / m; bola.style.transform = `translate(${dx}px,${dy}px)`;
  }
  const toque = $('toque');
  toque.addEventListener('pointerdown', (e) => {
    if (e.target !== toque) return;
    olhoId = e.pointerId; olhoX = e.clientX; toqueIni = { x: e.clientX, y: e.clientY, t: performance.now() }; toque.setPointerCapture(e.pointerId);
  });
  toque.addEventListener('pointermove', (e) => { if (e.pointerId === olhoId) { ent.olha += (e.clientX - olhoX) * 0.006; olhoX = e.clientX; } });
  toque.addEventListener('pointerup', (e) => {
    if (e.pointerId !== olhoId) return; olhoId = null;
    // toque rápido sem arrastar = pegar/abrir o que foi tocado
    if (toqueIni && Math.hypot(e.clientX - toqueIni.x, e.clientY - toqueIni.y) < 12 && performance.now() - toqueIni.t < 350) interage(e.clientX, e.clientY);
  });
  $('bCorre').addEventListener('pointerdown', () => { ent.corre = !ent.corre; $('bCorre').classList.toggle('on', ent.corre); });
  $('bUsa').addEventListener('pointerdown', () => usaItem());
  $('bToca').addEventListener('pointerdown', () => interage());
  $('bPausa').addEventListener('pointerdown', () => pausa(true));
  $('bPulo').addEventListener('pointerdown', () => pula());
  document.querySelectorAll('.slot').forEach((s) => s.addEventListener('pointerdown', (e) => { e.stopPropagation(); G.sel = +s.dataset.s; atualizaHud(); }));
  addEventListener('keydown', (e) => {
    ent.teclas[e.code] = true;
    if (!G || G.fim) return;
    if (e.code == 'Escape') pausa(!G.pausado);
    if (/^Digit[123]$/.test(e.code)) { G.sel = +e.code[5] - 1; atualizaHud(); }
    if (e.code == 'KeyE') usaItem();
    if (e.code == 'Space') pula();
    if (G.aprendendo) teclaConta(e.key);
  });
  addEventListener('keyup', (e) => (ent.teclas[e.code] = false));
  canvas.addEventListener('click', () => { if (G && !G.fim && !G.pausado && !G.aprendendo) { if (document.pointerLockElement !== canvas && matchMedia('(pointer:fine)').matches) canvas.requestPointerLock?.(); else interage(); } });
  canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); usaItem(); });
  addEventListener('mousemove', (e) => { if (document.pointerLockElement === canvas) ent.olha += e.movementX * 0.003; });
  addEventListener('wheel', (e) => { if (G) { G.sel = (G.sel + (e.deltaY > 0 ? 1 : 2)) % 3; atualizaHud(); } });

  /* ---------- interagir e itens ---------- */
  // procura o objeto mais perto da direção olhada (ou tocada), visível e no alcance
  function alvo(tipos, ang, sx, sy) {
    const p = G.p;
    let dx = -Math.sin(p.yaw), dz = -Math.cos(p.yaw);
    if (sx !== undefined) {
      const v = new THREE.Vector3((sx / innerWidth) * 2 - 1, -(sy / innerHeight) * 2 + 1, 0.5).unproject(camera).sub(camera.position);
      const l = Math.hypot(v.x, v.z); dx = v.x / l; dz = v.z / l;
    }
    let melhor = null, mb = 1e9;
    const testa = (o, tipo, alcance) => {
      const ox = o.x - p.x, oz = o.z - p.z, d = Math.hypot(ox, oz);
      if (d > alcance || d < 0.01) return;
      const a = Math.acos(Math.max(-1, Math.min(1, (ox * dx + oz * dz) / d)));
      if (a > ang + Math.atan(1.5 / d)) return;
      if (!mundo.ve(p.x, p.z, o.x - (ox / d) * 0.8, o.z - (oz / d) * 0.8)) return;
      const nota = a * 10 + d * 0.05;
      if (nota < mb) { mb = nota; melhor = { o, tipo }; }
    };
    for (const o of G.objs) if (tipos.includes(o.tipo) && o.ativo !== false && (!o.m || o.m.visible)) testa(o, o.tipo, o.tipo == 'caderno' ? 10 : 10);
    if (tipos.includes('porta')) for (const d of G.portas) testa(d, 'porta', d.tipo == 'vaivem' ? 10 : 15);
    if (tipos.includes('prize') && G.npcs.prize.ativo) testa(G.npcs.prize, 'prize', 30);
    return melhor;
  }
  function interage(sx, sy) {
    if (!G || G.aprendendo || G.pausado || G.fim) return;
    if (J.toqueMundo && J.toqueMundo(sx, sy, camera)) return; // ex.: teste do Dr. Reflex
    const a = alvo(['caderno', 'item', 'porta'], 0.35, sx, sy);
    if (!a) return;
    if (a.tipo == 'caderno') pegaCaderno(a.o);
    else if (a.tipo == 'item') { a.o.ativo = false; a.o.m.visible = false; pegaItem(a.o.id); }
    else if (a.tipo == 'porta' && a.o.tipo != 'vaivem' && a.o.trava <= 0) abrePorta(a.o, 'jogador');
  }
  function pegaItem(id) {
    const vazio = G.item.indexOf(0);
    G.item[vazio >= 0 ? vazio : G.sel] = id;
    atualizaHud();
  }
  J.pegaItem = pegaItem;
  function usaItem() {
    if (!G || G.aprendendo || G.pausado || G.fim) return;
    const id = G.item[G.sel], p = G.p;
    if (!id) return;
    const gasta = () => { G.item[G.sel] = 0; atualizaHud(); };
    if (id == 1) { p.est = 200; gasta(); }
    else if (id == 2) { const a = alvo(['porta'], 0.4); if (a && a.o.tipo == 'vaivem' && !a.o.travada) { a.o.trava = 15; gasta(); } }
    else if (id == 3) { const a = alvo(['porta'], 0.4); if (a && a.o.tipo != 'vaivem' && a.o.trava > 0) { a.o.trava = 0; abrePorta(a.o, 'jogador'); gasta(); } }
    else if (id == 4) { soltaBsoda(); culpa('drink', 1); M.som('Sounds/Items/soda_spray'); gasta(); }
    else if (id == 5) {
      const a = alvo(['maquina', 'telefone'], 0.5);
      if (a && a.tipo == 'maquina') { gasta(); pegaItem(a.o.id); }
      else if (a && a.tipo == 'telefone') { gasta(); fita(a.o); }
    } else if (id == 6) { const a = alvo(['fita'], 0.5); if (a) { gasta(); fita(a.o); } }
    else if (id == 7) { despertador(); gasta(); }
    else if (id == 8) { const a = alvo(['porta'], 0.4); if (a && a.o.tipo != 'vaivem') { a.o.silencio = 4; M.som('Sounds/Items/can_spray'); gasta(); } }
    else if (id == 9) {
      if (p.corda) { acabaCorda(); G.npcs.playtime.triste = 15; M.som('Characters/Playtime/PT_Sad', { de: G.npcs.playtime }); gasta(); }
      else { const a = alvo(['prize'], 0.3); if (a) { G.npcs.prize.louco = 15; gasta(); } }
    } else if (id == 10) { p.botas = 15; gasta(); aviso('Botas grandes: nada te empurra por 15s', 2); }
    else if (id == 11) { teleporte(); gasta(); }
  }
  function fita(o) { if (o.tipo == 'fita') troca(o.m, 'Texture2D/SchoolHouse/PickUps/TapePlayer/TapePlayerClosed.png'); M.som('Sounds/Items/AntiHearing', { de: o }); G.npcs.baldi.surdo = 30; G.npcs.baldi.vagar(); }
  function despertador() {
    const p = G.p, m = sprite('Texture2D/SchoolHouse/PickUps/AlarmClockItem.png', 0.5, 0.5);
    const o = { x: p.x, z: p.z, m, t: 30, vida: 35 };
    m.position.set(p.x, 1, p.z); G.relogios = (G.relogios || []).concat(o);
    o.tic = M.som('Sounds/Items/clocktick', { de: o, loop: true, vol: 0.6 });
  }
  function soltaBsoda() {
    const p = G.p, m = sprite('Texture2D/SchoolHouse/PickUps/ItemDrop/BSODA_Spray.png', 2, 2);
    const o = { x: p.x, z: p.z, vx: -Math.sin(p.yaw) * 25, vz: -Math.cos(p.yaw) * 25, vida: 3, m };
    m.position.set(o.x, 4, o.z); G.bsodas = (G.bsodas || []).concat(o);
  }
  async function teleporte() {
    const n = M.rndInt(12, 16); let t = 0.2;
    for (let k = 0; k < n && G && !G.fim; k++) {
      await new Promise((r) => setTimeout(r, t * 1000)); t *= 1.1;
      const r = ronda(true); G.p.x = r[0]; G.p.z = r[1]; M.som('Sounds/Items/Teleport');
    }
  }

  /* ---------- cadernos e contas ---------- */
  function pegaCaderno(o) {
    o.ativo = false; o.m.visible = false; o.volta = 120;
    if (o.bonus) return J.pegaBonus(o);
    G.cadernos++;
    J.ganchos.caderno.forEach((f) => f(G, o));
    atualizaHud();
    abreConta();
  }
  const conta = { prob: 0, erros: 0, fila: [], tocando: null, fimT: 0, impossivel: false, sol: 0, txt: '' };
  function abreConta() {
    G.aprendendo = true; conta.prob = 0; conta.erros = 0; conta.fila = []; conta.fimT = 0;
    $('mat').hidden = false; [0, 1, 2].forEach((i) => ($('r' + i).style.visibility = 'hidden'));
    $('baldiCara').style.visibility = G.spoop ? 'hidden' : '';
    if (!G.spoop) { M.para(G.sons.musica); G.sons.aprende = M.som('Music/mus_Learn', { loop: true, vol: 0.6 }); }
    if (G.cadernos == 1) { fala('Characters/Baldi/MathGame/Intro/BAL_Math_Intro'); fala('Characters/Baldi/MathGame/Intro/BAL_General_HowTo'); }
    novoProblema();
  }
  const fala = (n) => conta.fila.push(n);
  const N9 = () => M.rndInt(0, 9), grande = () => (Math.random() * 9998 + 1).toFixed(2).replace(/\.?0+$/, '');
  function novoProblema() {
    conta.txt = ''; $('resp').textContent = '';
    conta.prob++;
    const q = conta.prob;
    if (q <= 3) {
      fala('Characters/Baldi/MathGame/Problems/BAL_General_Problem' + q);
      const normal = G.modo == 'infinito' ? q <= 2 || G.cadernos != 2 : q <= 2 || G.cadernos <= 1;
      if (normal && !J.contaDificil?.(G, q)) {
        conta.impossivel = false;
        const a = N9(), b = N9(), mais = Math.random() < 0.5;
        conta.sol = mais ? a + b : a - b;
        $('pergunta').textContent = `CONTA ${q}:\n\n${a}${mais ? '+' : '-'}${b}=`;
        fala('Characters/Baldi/MathGame/Numbers/BAL_Math_' + a); fala('Characters/Baldi/MathGame/BAL_Math_' + (mais ? 'Plus' : 'Minus')); fala('Characters/Baldi/MathGame/Numbers/BAL_Math_' + b); fala('Characters/Baldi/MathGame/BAL_Math_Equals');
      } else {
        // a famosa conta impossível: três textos embaralhados e o Baldi guinchando
        conta.impossivel = true;
        const t = () => (Math.random() < 0.5 ? `${grande()}+(${grande()}X${grande()}=` : `(${grande()}/${grande()})+${grande()}=`);
        $('pergunta').innerHTML = `CONTA ${q}:<span class=bug>${t()}</span><span class=bug>${t()}</span><span class=bug>${t()}</span>`;
        ['Characters/Baldi/Sounds/BAL_Screech', 'Characters/Baldi/MathGame/BAL_Math_Plus', 'Characters/Baldi/Sounds/BAL_Screech', 'Characters/Baldi/MathGame/BAL_Math_Times', 'Characters/Baldi/Sounds/BAL_Screech', 'Characters/Baldi/MathGame/BAL_Math_Equals'].forEach(fala);
      }
    } else {
      conta.fimT = 5;
      let t;
      if (!G.spoop) t = 'UAU! VOCÊ EXISTE!';
      else if (conta.erros >= 3) { t = 'EU OUVI CONTA TÃO RUIM'; G.npcs.baldi.ouve(G.p.x, G.p.z, 7); G.falhou++; }
      else t = ['QUE PENA, ERROU AQUELA. TENTE DE NOVO!', 'TENTE ESTUDAR MAIS!'][M.rndInt(0, 1)];
      $('pergunta').textContent = t;
    }
  }
  function responde() {
    if (conta.prob > 3) return;
    if (conta.txt === '31718') aviso('AQUI ONDE TUDO COMEÇOU', 2);
    const res = $('r' + (conta.prob - 1));
    res.style.visibility = 'visible';
    if (!conta.impossivel && conta.txt !== '' && +conta.txt === conta.sol) {
      res.src = 'assets/Texture2D/YCTPTextures/Check.png';
      M.para(conta.tocando); conta.fila = []; fala('Characters/Baldi/MathGame/Praises/BAL_Praise' + M.rndInt(1, 5));
    } else {
      res.src = 'assets/Texture2D/YCTPTextures/X.png'; conta.erros++;
      if (!G.spoop) { G.carranca = 1.2; spoop(); }
      if (G.modo == 'infinito') G.npcs.baldi.bravo(1);
      else if (conta.prob == 3) G.npcs.baldi.bravo(1); else G.npcs.baldi.raivaT += 0.25;
      M.para(conta.tocando); conta.fila = [];
    }
    novoProblema();
  }
  function teclaConta(k) {
    if (conta.prob > 3) return;
    if (/^[0-9]$/.test(k) && conta.txt.length < 8) conta.txt += k;
    else if (k == '-' && !conta.txt) conta.txt = '-';
    else if (k == 'Backspace') conta.txt = conta.txt.slice(0, -1);
    else if (k == 'Enter') return responde();
    $('resp').textContent = conta.txt;
  }
  // teclado numérico com as imagens do jogo
  ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '-', 'OK'].forEach((k) => {
    const b = document.createElement('button'); b.dataset.k = k; b.innerHTML = `<img src="assets/Texture2D/YCTPTextures/NumberPad/${k}.png" alt="${k}">`;
    b.onpointerdown = (e) => { e.stopPropagation(); k == 'OK' ? responde() : k == 'C' ? (conta.txt = '', $('resp').textContent = '') : teclaConta(k); };
    $('teclado').append(b);
  });
  function tiqueConta(dt) {
    if (!conta.tocando || conta.tocando.fim) {
      conta.tocando = null;
      if (conta.fila.length && !G.spoop) conta.tocando = M.som(conta.fila.shift());
      else if (G.spoop) conta.fila = [];
    }
    G.carranca = (G.carranca || 0) - dt;
    const fala = conta.tocando && !conta.tocando.fim;
    $('baldiCara').src = 'assets/Texture2D/YCTPTextures/Baldi/' + (G.carranca > 0 ? 'Frown/' + firstFrown() : 'Baldi_Talk' + String(fala ? Math.floor(G.t * 24) % 24 : 0).padStart(4, '0') + '.png');
    if (conta.prob > 3 && (conta.fimT -= dt) <= 0) fechaConta();
  }
  const FROWN = 'Bald_Frown0000.png', firstFrown = () => FROWN;
  function fechaConta() {
    G.aprendendo = false; $('mat').hidden = true;
    if (G.p.est < 100) G.p.est = 100;
    if (!G.spoop) { M.para(G.sons.aprende); G.sons.musica = M.som('Music/mus_School', { loop: true, vol: 0.6 }); }
    if (G.cadernos == 1 && !G.spoop) {
      const q = G.objs.find((o) => o.tipo == 'item' && o.id == 5 && !o.ativo && o.m && !o.usado);
      if (q) { q.usado = true; const r = E.ronda[M.rndInt(1, 15)]; q.x = r[0]; q.z = r[1]; q.m.position.set(r[0], 4, r[1]); q.y0 = 4; q.ativo = true; q.m.visible = true; }
      M.som('Characters/Baldi/BaldiTutor/BAL_GetPrize');
    } else if (G.cadernos == G.totalCadernos && G.modo != 'infinito') { M.som('Characters/Baldi/BAL_AllNotebooks', { vol: 0.8 }); modoFinal(); }
  }

  /* ---------- pular corda (Playtime) ---------- */
  const corda = { pulos: 0, espera: 1, pos: 0, bateu: true, comecou: false };
  function comecaCorda(pt) {
    const p = G.p; p.corda = true; p.cordaPos = [p.x, p.z];
    // a Playtime recua 10 unidades para longe do jogador, como no jogo
    const d = Math.hypot(pt.x - p.x, pt.z - p.z) || 1, o = { x: pt.x + (pt.x - p.x) / d * 8, z: pt.z + (pt.z - p.z) / d * 8 };
    mundo.resolve(o, 1); pt.x = o.x; pt.z = o.z; pt.cam = []; pt.jogaCool = 15;
    Object.assign(corda, { pulos: 0, espera: 3, pos: 0, bateu: true, comecou: false, conta: 3.8 });
    $('corda').hidden = false; $('bPulo').hidden = false; $('pulos').textContent = '0/5';
    M.som('Characters/Playtime/PT_ReadyGo', { de: pt });
  }
  function acabaCorda() { G.p.corda = false; $('corda').hidden = true; $('bPulo').hidden = true; }
  function pula() { const p = G.p; if (p.corda && p.pulo <= 0) p.vy = 5; }
  function tiqueCorda(dt) {
    const p = G.p, pt = G.npcs.playtime;
    p.vy -= 10 * dt; p.pulo = Math.max(0, p.pulo + p.vy * dt); if (p.pulo <= 0) { p.pulo = 0; if (ent.teclas.Space) p.vy = 5; }
    // contagem antes da primeira volta da corda
    if (corda.conta > 0) { corda.conta -= dt; const n = Math.ceil(corda.conta - 0.8); $('cordaConta').textContent = corda.conta > 0.8 ? (n >= 3 ? 'Prepare-se... ' : '') + n : 'PULE!'; }
    else $('cordaConta').textContent = '';
    if (corda.espera > 0) corda.espera -= dt;
    else if (!corda.comecou) { corda.comecou = true; corda.pos = 1; corda.bateu = false; }
    if (corda.pos > 0) corda.pos -= dt;
    else if (!corda.bateu) {
      corda.bateu = true; corda.comecou = false;
      if (p.pulo <= 0.2) { corda.pulos = 0; corda.espera = 2; M.som('Characters/Playtime/PT_Oops', { de: pt }); }
      else { corda.pulos++; corda.espera = 0.5; M.som('Characters/Playtime/Numbers/PT_' + corda.pulos, { de: pt }); if (corda.pulos >= 5) { M.som('Characters/Playtime/PT_Congrats', { de: pt }); acabaCorda(); } }
      $('pulos').textContent = corda.pulos + '/5';
    }
    const f = corda.comecou ? 31 + Math.min(15, Math.floor((1 - corda.pos) * 16)) : 31;
    $('cordaImg').src = 'assets/Texture2D/HudTextures/Jumprope/Rope00' + f + '.png';
  }

  /* ---------- jogador ---------- */
  // o jogador é uma criança: olhos a 3,6 do chão (o teto fica a 10) e corpo de raio 1,5
  const ALTURA = 3.6, RAIO = 1.5;
  function movimenta(dt) {
    const p = G.p, k = ent.teclas;
    let f = ent.mz, s = ent.mx;
    if (k.KeyW || k.ArrowUp) f = 1; if (k.KeyS || k.ArrowDown) f = -1;
    if (k.KeyA) s = -1; if (k.KeyD) s = 1;
    p.yaw -= ent.olha; ent.olha = 0;
    if (k.ArrowLeft) p.yaw += 2.5 * dt; if (k.ArrowRight) p.yaw -= 2.5 * dt;
    const l = Math.hypot(f, s); if (l > 1) { f /= l; s /= l; }
    const corre = (ent.corre || k.ShiftLeft || k.ShiftRight) && p.est > 0;
    let vel = corre ? 16 : 10;
    // esmagado (Dr. Reflex): parado 2 s e depois devagar
    if (p.esmagado > 0) { p.esmagado -= dt; vel = p.esmagado > 28 ? 0 : vel * 0.55; }
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
    let mx = (fx * f + rx * s) * vel * dt, mz = (fz * f + rz * s) * vel * dt;
    if (G.empurraJogador) { const e = G.empurraJogador(p.x, p.z); mx += e[0] * dt; mz += e[1] * dt; } // vento
    if (p.corda) mx = mz = 0;
    else if (p.varrendo > 0 && p.botas <= 0) { mx = p.varreV[0] * dt + mx * 0.3; mz = p.varreV[1] * dt + mz * 0.3; }
    else if (p.abracando > 0 && p.botas <= 0) {
      const a = p.abraco, fx2 = Math.sin(a.dir), fz2 = Math.cos(a.dir);
      mx = a.vx * 1.2 * dt + (a.x + Math.round(fx2) * 3 - p.x); mz = a.vz * 1.2 * dt + (a.z + Math.round(fz2) * 3 - p.z);
    }
    const ox = p.x, oz = p.z;
    // anda em passos curtos: um empurrão forte (1st Prize, Gotta Sweep) não pula a parede
    const np = Math.max(1, Math.ceil(Math.hypot(mx, mz) / 0.5));
    for (let k = 0; k < np; k++) { p.x += mx / np; p.z += mz / np; mundo.resolve(p, RAIO); }
    for (const n of Object.values(G.npcs)) if (n.solido && n.ativo) {
      const d = dist(p, n), r = n.solido + RAIO;
      if (d < r && d > 0.01) { const px = p.x, pz = p.z; p.x = n.x + (p.x - n.x) * r / d; p.z = n.z + (p.z - n.z) * r / d; if (!mundo.ve(px, pz, p.x, p.z, true)) { p.x = px; p.z = pz; } mundo.resolve(p, RAIO); }
    }
    const andou = Math.hypot(p.x - ox, p.z - oz) / dt;
    // energia
    if (andou > 0.1) { if (corre) { p.est -= 10 * G.dif.gasto * dt; if (andou > 0.1 && p.varrendo <= 0 && p.abracando <= 0 && !J.correLiberado) culpa('running', 0.1); } if (p.est < 0 && p.est > -5) p.est = -5; }
    else if (p.est < 100) p.est += 10 * dt;
    if (p.corda && Math.hypot(p.x - p.cordaPos[0], p.z - p.cordaPos[1]) >= 1) acabaCorda();
    p.culpa -= dt; p.varrendo -= dt; p.abracando -= dt; p.botas -= dt;
    $('aviso').hidden = !(p.est < 0) || G.avisoT > 0;
    if (p.est < 0 && !(G.avisoT > 0)) $('aviso').textContent = 'Você precisa descansar!';
  }

  /* ---------- HUD ---------- */
  function atualizaHud() {
    if (!G) return;
    $('cadernos').textContent = G.modo == 'infinito' ? G.cadernos + ' Cadernos' : `${G.cadernos}/${G.totalCadernos} Cadernos`;
    document.querySelectorAll('.slot').forEach((s, i) => {
      const id = G.item[i];
      s.style.backgroundImage = id ? `url(assets/Texture2D/SchoolHouse/PickUps/${ICONE[id]}.png)` : '';
      s.classList.toggle('sel', i === G.sel);
    });
    $('nomeItem').textContent = ITEM[G.item[G.sel]];
  }
  J.atualizaHud = atualizaHud;
  function aviso(t, s) { $('aviso').textContent = t; $('aviso').hidden = false; G.avisoT = s; }
  J.aviso = aviso;
  function evento(t) { $('evento').hidden = !t; $('evento').textContent = t || ''; }
  J.evento = evento;

  /* ---------- fim ---------- */
  function gameOver() {
    if (G.fim) return;
    G.fim = true;
    if (document.pointerLockElement) document.exitPointerLock();
    M.para(G.sons.musica); M.para(G.sons.maquina);
    const b = M.som('Sounds/Buzz', { loop: true });
    $('susto').style.backgroundImage = 'url(assets/Texture2D/CharacterSprites/Baldi/Angry/Baldi_Slap0024.png)'; $('susto').style.display = 'block';
    setTimeout(() => {
      M.para(b); $('susto').style.display = 'none';
      fim(`assets/Texture2D/Screens/GameOver/${M.rndInt(0, 4)}.png`, 'O Baldi te pegou!');
    }, 1500);
  }
  function vitoria() {
    if (G.fim) return;
    G.fim = true; M.para(G.sons.maquina);
    if (document.pointerLockElement) document.exitPointerLock();
    fim('assets/Texture2D/Screens/win.png', G.falhou >= G.totalCadernos ? 'Você errou tudo... e mesmo assim escapou!' : 'Você escapou!');
  }
  function fim(img, txt) {
    document.body.classList.remove('vermelho');
    const f = $('fim'); f.style.backgroundImage = `url(${img})`; f.hidden = false;
    $('fimTxt').textContent = txt;
    $('hud').hidden = true; $('toque').hidden = true;
  }
  $('denovo').onclick = () => { $('fim').hidden = true; comeca(G.modo); };
  $('paraMenu').onclick = () => { $('fim').hidden = true; menu(); };
  function pausa(on) {
    if (!G || G.fim || G.aprendendo) return;
    G.pausado = on; $('pausa').hidden = !on;
    clearInterval(G.cabecaT); if (on) { let k = 0; G.cabecaT = setInterval(() => ($('cabecaPausa').src = 'assets/Texture2D/HudTextures/PauseHead/Nod' + String(k++ % 48).padStart(4, '0') + '.png'), 40); }
    if (on && document.pointerLockElement) document.exitPointerLock();
    M.audio()[on ? 'suspend' : 'resume']();
  }
  $('continua').onclick = () => pausa(false);
  $('sair').onclick = () => { pausa(false); G.fim = true; menu(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) pausa(true); });

  /* ---------- laço principal ---------- */
  let ultimo = performance.now();
  function quadro(agora) {
    requestAnimationFrame(quadro);
    const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
    if (!G || !cena) return;
    if (!G.pausado && !G.fim) passo(dt);
    desenha();
  }
  function passo(dt) {
    G.t += dt;
    if (G.avisoT > 0 && (G.avisoT -= dt) <= 0) $('aviso').hidden = true;
    if (G.aprendendo) { tiqueConta(dt); return; } // o tempo para enquanto faz contas
    movimenta(dt);
    if (G.p.corda) tiqueCorda(dt);
    portas(dt);
    gatilhos();
    // The Test mexe no tempo: os personagens ficam mais lentos (ou mais rápidos depois que ele explode)
    const dn = dt * (G.escala ?? 1);
    for (const n of Object.values(G.npcs)) if (n.ativo || n.pronto) n.tique(dn);
    G.acum += dn;
    while (G.acum >= FIXO) { G.acum -= FIXO; for (const n of Object.values(G.npcs)) if (n.ativo) n.fixo(FIXO); }
    // BSODA e despertadores
    for (const b of G.bsodas || []) {
      b.vida -= dt; b.x += b.vx * dt; b.z += b.vz * dt; b.m.position.set(b.x, 4, b.z);
      if (mundo.raio(b.x - b.vx * dt, b.z - b.vz * dt, b.vx / 25, b.vz / 25, 25 * dt + 1) < 25 * dt + 1) b.vida = 0;
      for (const n of Object.values(G.npcs)) if (n.ativo && dist(n, b) < 3) { n.empurro = 1; n.ex = b.vx; n.ez = b.vz; }
      if (b.vida <= 0) cena.remove(b.m);
    }
    G.bsodas = (G.bsodas || []).filter((b) => b.vida > 0);
    for (const r of G.relogios || []) {
      r.t -= dt; r.vida -= dt;
      if (r.t <= 0 && !r.tocou) { r.tocou = true; M.para(r.tic); M.som('Sounds/Items/bell', { de: r }); G.npcs.baldi.ouve(r.x, r.z, 8); }
      if (r.vida <= 0) cena.remove(r.m);
    }
    G.relogios = (G.relogios || []).filter((r) => r.vida > 0);
    // modo infinito: o caderno volta 2 minutos depois, se você estiver longe
    if (G.infinito) for (const o of G.objs) if (o.tipo == 'caderno' && !o.ativo && o.volta > 0 && dist(o, G.p) > 60 && (o.volta -= dt) <= 0) { o.ativo = true; o.m.visible = true; M.som('Sounds/Items/respawn', { de: o }); }
    // pegou o jogador?
    const b = G.npcs.baldi;
    if (b.ativo && dist(b, G.p) < 2.4 && !J.invencivel) gameOver();
    J.ganchos.tique.forEach((f) => f(G, dt, J));
    // som ambiente de vez em quando
    if ((G.ambT = (G.ambT ?? 20) - dt) <= 0) { G.ambT = M.rnd(25, 60); const r = ronda(true); M.som('Sounds/Ambiences/' + ['ambience', 'creepy sound', 'dulcimer', 'fret', 'noise', 'tone'][M.rndInt(0, 5)], { de: { x: r[0], z: r[1] }, vol: 0.5, alcance: 200 }); }
    M.atualizaSons(G.p.x, G.p.z);
    const dt2 = G.diretoria && G.diretoria.trava > 0 ? Math.ceil(G.diretoria.trava) : 0;
    $('detencao').hidden = !dt2;
    if (dt2) $('detencao').textContent = `Você está de detenção!\nFaltam ${dt2} segundos!`;
    $('estamina').firstElementChild.style.width = Math.max(0, Math.min(100, G.p.est)) + '%';
  }
  function desenha() {
    const p = G.p;
    camera.position.set(p.x, ALTURA + p.pulo, p.z);
    // um desvio mínimo evita um defeito de desenho quando a câmera fica exatamente alinhada às paredes
    camera.rotation.set(0, p.yaw + 0.0001, 0, 'YXZ');
    for (const n of Object.values(G.npcs)) { if (n.spr) { n.spr.position.set(n.x, n.oy, n.z); if (n.anima && n.spr.visible) n.anima(); } }
    if (G.tutor && G.tutor.visible) { troca(G.tutor, 'Texture2D/CharacterSprites/Baldi/Baldi_Wave' + String(Math.floor(G.t * 30) % 100).padStart(4, '0') + '.png'); }
    for (const o of G.objs) if (o.tipo == 'item' && o.m && o.m.visible) o.m.position.y = o.y0 + Math.sin(G.t * 2 + o.x) * 0.25;
    for (const s of sprites) s.rotation.y = p.yaw;
    render.render(cena, camera);
  }

  /* ---------- telas ---------- */
  function menu() {
    G = null; J.G = null;
    M.paraTudo(); // música, alarmes e vozes: senão tocam de novo por cima no próximo jogo
    document.body.classList.remove('vermelho');
    $('hud').hidden = true; $('toque').hidden = true; $('mat').hidden = true; $('corda').hidden = true; $('pausa').hidden = true; evento('');
    $('menu').hidden = false;
  }
  async function comeca(modo) {
    $('menu').hidden = true; $('telaDif').hidden = true; $('carregando').hidden = false;
    M.audio().resume(); M.paraTudo();
    let girando = 0; const gira = setInterval(() => ($('cabeca').src = 'assets/Texture2D/MenuTextures/LoadingHead/HeadSpin' + String(girando++ % 48).padStart(4, '0') + '.png'), 40);
    try {
      if (!J.Ebase) await J.carregar();
      let feitos = 0;
      const todos = SONS.concat(J.SONS_EXTRA || []);
      await Promise.all(todos.map((n) => M.carregaSom(n).catch(() => {}).then(() => ($('carregaTxt').textContent = `Carregando sons... ${++feitos}/${todos.length}`))));
      // carrega antes os quadros das animações (aceno do Baldi, tapa, 1st Prize, personagens do Beta)
      const quadros = [];
      for (let k = 0; k < 100; k++) quadros.push('Texture2D/CharacterSprites/Baldi/Baldi_Wave' + String(k).padStart(4, '0') + '.png');
      for (const k of [0, 6, 12, 18, 24]) quadros.push('Texture2D/CharacterSprites/Baldi/Angry/Baldi_Slap' + String(k).padStart(4, '0') + '.png');
      for (let k = 0; k < 16; k++) { const n = k * 22.5; quadros.push('Texture2D/CharacterSprites/1stPrize/1PR_' + (n % 1 ? n.toFixed(1) : n) + '.png'); }
      quadros.push(...(J.QUADROS_EXTRA || []));
      $('carregaTxt').textContent = 'Carregando imagens...';
      const texs = quadros.map((q) => M.tex(q)), t0 = performance.now();
      while (texs.some((t) => !(t.image && t.image.width)) && performance.now() - t0 < 15000) await new Promise((r) => setTimeout(r, 50));
      novoJogo(modo);
    } finally { clearInterval(gira); $('carregando').hidden = true; }
    ajusta();
    $('hud').hidden = false; $('toque').hidden = matchMedia('(pointer:fine)').matches && !('ontouchstart' in window) ? true : false;
    if (!$('toque').hidden) document.documentElement.requestFullscreen?.().catch(() => {});
    G.sons.musica = M.som('Music/mus_School', { loop: true, vol: 0.6 });
    M.som('Characters/Baldi/BaldiTutor/BAL_Hi');
  }
  J.comeca = comeca; J.menu = menu; J.pegaCaderno = pegaCaderno; J.mostraPorta = mostraPorta; J.dist = dist; J.ve = ve; J.spoop = spoop; J.sprite = sprite; J.troca = troca; J.Agente = Agente; J.ronda = ronda; J.dentro = dentro; J.abrePorta = abrePorta; J.gameOver = gameOver; J.vitoria = vitoria;
  $('titulo').onclick = () => { $('titulo').hidden = true; $('menu').hidden = false; M.audio().resume(); M.carregaSom('Characters/Baldi/BAL_MainMenu').then(() => M.som('Characters/Baldi/BAL_MainMenu')).catch(() => {}); };
  // escolher o modo abre a tela de dificuldade; a escolhida fica guardada para a próxima vez
  let modoEscolhido = 'historia';
  const NOME_MODO = { historia: 'Modo História', infinito: 'Modo Infinito', beta: 'Beta' };
  function escolheDificuldade(modo) { modoEscolhido = modo; $('difModo').textContent = NOME_MODO[modo]; marcaDificuldade(); $('menu').hidden = true; $('telaDif').hidden = false; }
  $('jHistoria').onclick = () => escolheDificuldade('historia');
  $('jInfinito').onclick = () => escolheDificuldade('infinito');
  $('jBeta').onclick = () => (J.abreBeta ? J.abreBeta() : escolheDificuldade('beta'));
  J.escolheDificuldade = escolheDificuldade;
  $('difVolta').onclick = () => { $('telaDif').hidden = true; if (modoEscolhido == 'beta' && J.abreBeta) J.abreBeta(); else $('menu').hidden = false; };
  $('jComo').onclick = () => ($('como').hidden = false);
  function marcaDificuldade() { document.querySelectorAll('#difs button').forEach((b) => b.classList.toggle('sel', b.dataset.d == dificuldade)); }
  document.querySelectorAll('#difs button').forEach((b) => (b.onclick = () => { dificuldade = b.dataset.d; try { localStorage.setItem('baldiDificuldade', dificuldade); } catch (e) {} comeca(modoEscolhido); }));
  $('fechaComo').onclick = () => ($('como').hidden = true);
  // toque na tela de fora do jogo também libera o som no celular
  addEventListener('pointerdown', () => M.audio().resume(), { once: true });
  requestAnimationFrame(quadro);
})();
