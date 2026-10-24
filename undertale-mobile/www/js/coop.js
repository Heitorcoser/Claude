// MULTIPLAYER COOPERATIVO (online, PC e celular juntos, sem VPN)
//
// Quem cria a sala (HOST) roda o jogo de verdade e transmite a tela para os amigos
// por WebRTC (conexão direta entre os aparelhos, usando o servidor gratuito do
// PeerJS só para se encontrarem, e um servidor de repasse quando a rede não deixa
// conectar direto). Os amigos (CONVIDADOS) veem a tela do host e mandam os comandos:
// no mapa eles andam com o próprio personagem e nas batalhas desviam com a própria
// ALMA. O HP é do grupo todo, e quanto mais jogadores, mais forte fica o inimigo.
'use strict';

const COOP_PREFIX = 'losters-coop-';
const COOP_MAX = 4;
const COOP_COLORS = ['#5ff8ff', '#ffd23a', '#7aff7a'];
const COOP_ICE = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
  { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
];

const coopEsc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const Coop = {
  role: null,        // null | 'host' | 'guest'
  peer: null, code: '', players: [], conn: null, toastMsg: '', toastT: 0, status: '',

  get active() { return this.role === 'host' && this.players.length > 0; },
  count() { return this.role === 'host' ? 1 + this.players.length : 1; },
  toast(t) { this.toastMsg = t; this.toastT = 4; },

  // ---------- HOST ----------
  host() {
    if (this.role) return;
    if (typeof Peer === 'undefined') { this.setStatus('Não foi possível carregar o multiplayer.'); return; }
    this.role = 'host';
    this.code = Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[(Math.random() * 32) | 0]).join('');
    this.setStatus('Criando sala...');
    this.peer = new Peer(COOP_PREFIX + this.code, { config: { iceServers: COOP_ICE } });
    this.peer.on('open', () => { this.setStatus('Sala criada! Passe o código para seus amigos.'); CoopUI.render(); });
    this.peer.on('error', e => {
      if (e.type === 'unavailable-id') { this.role = null; this.peer.destroy(); return this.host(); }
      this.setStatus('Erro de conexão: ' + e.type);
    });
    this.peer.on('connection', conn => this.onGuest(conn));
    this.wrapSfx();
  },
  stream() {
    if (!this._stream) {
      this._stream = cv.captureStream(30);
      const tr = this._stream.getVideoTracks()[0];
      if (tr && 'contentHint' in tr) tr.contentHint = 'detail';
    }
    return this._stream;
  },
  onGuest(conn) {
    conn.on('open', () => {
      if (this.players.length >= COOP_MAX - 1) { conn.send({ full: 1 }); setTimeout(() => conn.close(), 500); return; }
      const used = this.players.map(p => p.color);
      const color = COOP_COLORS.find(c => !used.includes(c));
      const name = String((conn.metadata && conn.metadata.name) || 'Amigo').replace(/[^\p{L}\p{N} _-]/gu, '').slice(0, 10) || 'Amigo';
      const p = { id: conn.peer, name, color, conn, input: { axis: { x: 0, y: 0 }, held: {}, pressed: new Set() }, x: 0, y: 0, map: null, dir: 'down', anim: 0, moving: false };
      this.players.push(p);
      conn.send({ hello: 1, code: this.code, color, music: Sfx.current });
      this.peer.call(conn.peer, this.stream());
      this.toast(`${name} entrou na sala! (${this.count()} jogadores)`);
      Sfx.save();
      CoopUI.render();
    });
    conn.on('data', d => {
      const p = this.players.find(q => q.conn === conn);
      if (!p || !d || !d.in) return;
      const i = d.in;
      p.input.axis.x = i.ax || 0; p.input.axis.y = i.ay || 0;
      p.input.held = { up: !!(i.h & 1), down: !!(i.h & 2), left: !!(i.h & 4), right: !!(i.h & 8), a: !!(i.h & 16), b: !!(i.h & 32) };
      for (const k of i.p || []) p.input.pressed.add(k);
    });
    const bye = () => {
      const p = this.players.find(q => q.conn === conn);
      if (!p) return;
      this.players = this.players.filter(q => q !== p);
      this.toast(`${p.name} saiu da sala.`);
      CoopUI.render();
    };
    conn.on('close', bye); conn.on('error', bye);
  },
  broadcast(msg) { for (const p of this.players) { try { if (p.conn.open) p.conn.send(msg); } catch (e) { } } },
  // Os efeitos sonoros e as músicas também tocam no aparelho de quem entrou.
  wrapSfx() {
    if (this._wrapped) return;
    this._wrapped = true;
    for (const k of Object.keys(Sfx)) {
      if (typeof Sfx[k] !== 'function' || ['init', 'setMusic', 'setSfx'].includes(k)) continue;
      const orig = Sfx[k];
      Sfx[k] = (...a) => { if (this.active) this.broadcast({ sfx: k, a }); return orig.apply(Sfx, a); };
    }
  },
  // movimento dos convidados no mapa
  updateWorld(W, dt) {
    const host = W.player;
    for (const p of this.players) {
      if (p.map !== W.mapId || Math.hypot(p.x - host.x, p.y - host.y) > 14 * TS) {
        p.map = W.mapId; p.x = host.x + (this.players.indexOf(p) % 2 ? -18 : 18); p.y = host.y + 4;
        if (W.blocked(p.x, p.y)) { p.x = host.x; p.y = host.y; }
      }
      const v = this.vec(p);
      p.moving = false;
      if ((v.x || v.y) && !W.locked && Game.scene === 'world') {
        const sp = 90 * dt;
        if (Math.abs(v.y) > Math.abs(v.x) * 1.05) p.dir = v.y < 0 ? 'up' : 'down'; else if (v.x) p.dir = v.x < 0 ? 'left' : 'right';
        const ox = p.x, oy = p.y;
        if (v.x && !W.blocked(p.x + v.x * sp, p.y)) p.x += v.x * sp;
        if (v.y && !W.blocked(p.x, p.y + v.y * sp)) p.y += v.y * sp;
        if (p.x !== ox || p.y !== oy) { p.moving = true; p.anim += dt * 7; }
      }
      if (!p.moving) p.anim = 0;
    }
  },
  vec(p) {
    const a = p.input.axis, h = p.input.held;
    let x = a.x, y = a.y;
    if (!x && !y) { x = (h.right ? 1 : 0) - (h.left ? 1 : 0); y = (h.down ? 1 : 0) - (h.up ? 1 : 0); }
    const m = Math.hypot(x, y);
    return m > 1 ? { x: x / m, y: y / m } : { x, y };
  },
  endFrame() { for (const p of this.players) p.input.pressed.clear(); },
  sprites(color) {
    this._spr = this._spr || {};
    if (!this._spr[color]) {
      const pal = { G: color, Y: '#ffffff', H: '#2a2a3a', h: '#4a4a5a' };
      const L = [LEGS_STAND, LEGS_W1, LEGS_STAND, LEGS_W2], S = [SLEGS_STAND, SLEGS_W, SLEGS_STAND, SLEGS_W];
      const soul = makeCanvas(SPR.soul.width, SPR.soul.height, g => { g.drawImage(SPR.soul, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = color; g.fillRect(0, 0, 40, 40); });
      this._spr[color] = {
        down: L.map(l => spriteFromRows(composePlayer(P_DOWN, l), false, pal)),
        up: L.map(l => spriteFromRows(composePlayer(P_UP, l), false, pal)),
        right: S.map(l => spriteFromRows(composePlayer(P_SIDE, l), false, pal)),
        left: S.map(l => spriteFromRows(composePlayer(P_SIDE, l), true, pal)),
        soul,
      };
    }
    return this._spr[color];
  },
  drawWorld(W, list, sx, sy) {
    for (const p of this.players) {
      if (p.map !== W.mapId) continue;
      list.push({ y: p.y, d: () => {
        const set = this.sprites(p.color), img = set[p.dir][p.moving ? Math.floor(p.anim) % 4 : 0];
        drawSpr(img, sx(p.x - 7), sy(p.y - 21), 2);
        text(p.name, sx(p.x), sy(p.y - 34), 18, p.color, 'center');
      } });
    }
  },
  drawHud() {
    if (this.toastT > 0) {
      this.toastT -= 1 / 60;
      ctx.globalAlpha = Math.min(1, this.toastT);
      ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(120, 432, 400, 36);
      text(this.toastMsg, 320, 437, 22, '#5ff8ff', 'center');
      ctx.globalAlpha = 1;
    }
  },

  // ---------- CONVIDADO ----------
  join(code, name) {
    if (this.role) return;
    if (typeof Peer === 'undefined') { this.setStatus('Não foi possível carregar o multiplayer.'); return; }
    code = code.trim().toUpperCase();
    if (code.length < 4) { this.setStatus('Digite o código da sala.'); return; }
    this.role = 'guest'; this.code = code;
    this.setStatus('Procurando a sala ' + code + '...');
    this.peer = new Peer({ config: { iceServers: COOP_ICE } });
    this.peer.on('error', e => { this.setStatus(e.type === 'peer-unavailable' ? 'Sala não encontrada. Confira o código.' : 'Erro de conexão: ' + e.type); this.leave(true); });
    this.peer.on('call', call => {
      call.answer();
      call.on('stream', s => { const v = document.getElementById('coopVideo'); v.srcObject = s; v.play().catch(() => { }); });
    });
    this.peer.on('open', () => {
      const conn = this.conn = this.peer.connect(COOP_PREFIX + code, { metadata: { name: name || 'Amigo' } });
      conn.on('open', () => this.enterGuestMode());
      conn.on('data', d => {
        if (d.full) { this.setStatus('A sala está cheia (máximo de 4 jogadores).'); return this.leave(true); }
        if (d.hello) this.myColor = d.color;
        if (d.sfx && Sfx[d.sfx]) { try { Sfx[d.sfx](...(d.a || [])); } catch (e) { } }
        if (d.hello && d.music) Sfx.playMusic(d.music);
      });
      conn.on('close', () => { alert('A conexão com a sala acabou.'); location.reload(); });
    });
  },
  enterGuestMode() {
    CoopUI.close();
    Sfx.init(); Sfx.stopMusic();
    Game.scene = 'guest';
    document.body.classList.add('guest');
    this.pressedBuf = new Set();
    this.sendTimer = setInterval(() => this.sendInput(), 33);
  },
  guestFrame() { for (const k of Input.pressed) this.pressedBuf.add(k); if (Input.tap) this.pressedBuf.add('a'); },
  sendInput() {
    if (!this.conn || !this.conn.open) return;
    const h = Input.held;
    const bits = (h.up ? 1 : 0) | (h.down ? 2 : 0) | (h.left ? 4 : 0) | (h.right ? 8 : 0) | (h.a ? 16 : 0) | (h.b ? 32 : 0);
    let ax = Input.axis.x, ay = Input.axis.y;
    if (Input.drag.active && (Input.drag.dx || Input.drag.dy)) { ax = Math.max(-1, Math.min(1, Input.drag.dx / 6)); ay = Math.max(-1, Math.min(1, Input.drag.dy / 6)); }
    this.conn.send({ in: { ax, ay, h: bits, p: [...this.pressedBuf] } });
    this.pressedBuf.clear();
  },
  leave(silent) {
    try { this.peer && this.peer.destroy(); } catch (e) { }
    this.peer = null; this.role = null; this.players = []; this.conn = null;
    if (!silent) this.setStatus('');
    CoopUI.render();
  },
  setStatus(t) { this.status = t; CoopUI.render(); },
};

// ---------- Janela do multiplayer (HTML, para dar pra digitar o código) ----------
const CoopUI = {
  open() { document.getElementById('coop').classList.add('show'); this.render(); },
  close() { document.getElementById('coop').classList.remove('show'); },
  isOpen() { return document.getElementById('coop').classList.contains('show'); },
  render() {
    const el = document.getElementById('coopBody');
    if (!el) return;
    const C = Coop;
    let h = '';
    if (C.role === 'host') {
      h += `<p>CÓDIGO DA SALA</p><div class="code">${C.code || '...'}</div>`;
      h += `<p>Jogadores (${C.count()}/${COOP_MAX}):</p><ul><li style="color:#ff5a5a">Você (host)</li>${C.players.map(p => `<li style="color:${p.color}">${coopEsc(p.name)}</li>`).join('')}</ul>`;
      h += `<p class="small">Quanto mais jogadores, mais difícil: inimigos com mais vida e mais ataques. O HP é do grupo todo.</p>`;
      h += `<button onclick="CoopUI.close()">VOLTAR AO JOGO</button><button class="sec" onclick="Coop.leave()">FECHAR SALA</button>`;
    } else if (C.role === 'guest') {
      h += `<p>Conectando...</p>`;
    } else {
      h += `<p class="small">Jogue junto com amigos pela internet, no PC ou no celular. Quem cria a sala joga a história; os amigos entram com o código.</p>`;
      h += `<label>Seu nome<input id="coopName" maxlength="10" value="${coopEsc(localStorage.getItem('perdido_nome') || '')}" placeholder="Amigo"></label>`;
      h += `<button onclick="CoopUI.create()">CRIAR SALA</button>`;
      h += `<div class="row"><input id="coopCode" maxlength="6" placeholder="CÓDIGO" style="text-transform:uppercase"><button onclick="CoopUI.enter()">ENTRAR</button></div>`;
      h += `<button class="sec" onclick="CoopUI.close()">FECHAR</button>`;
    }
    if (C.status) h += `<p class="status">${coopEsc(C.status)}</p>`;
    el.innerHTML = h;
  },
  name() { const n = (document.getElementById('coopName') || {}).value || ''; try { localStorage.setItem('perdido_nome', n); } catch (e) { } return n; },
  create() { this.name(); Coop.host(); },
  enter() { const n = this.name(); Coop.join(document.getElementById('coopCode').value, n); },
};
