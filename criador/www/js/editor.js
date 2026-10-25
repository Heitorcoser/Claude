// Telas do Criador: lista de batalhas, editor e o jogo.
'use strict';

const $ = (sel, el = document) => el.querySelector(sel);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else if (k === 'value') e.value = attrs[k];
    else if (k === 'checked') e.checked = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
};

const App = {
  b: null, saveT: null,
  start() {
    setupTouchControls(); Config.load();
    if (!Store.all().length) Store.put(novaBatalha()); // batalha de exemplo
    this.home();
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      if (document.body.classList.contains('play')) { Batalha.update(dt); Batalha.draw(); }
      Input.endFrame();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
  show(id) { for (const s of document.querySelectorAll('.tela')) s.hidden = s.id !== id; document.body.classList.toggle('play', id === 'jogo'); window.scrollTo(0, 0); },

  // ---------- lista ----------
  home() {
    this.show('home');
    const list = $('#lista'); list.innerHTML = '';
    const all = Store.all();
    if (!all.length) list.append(h('p', { class: 'dica' }, 'Nenhuma batalha ainda. Crie a sua!'));
    for (const b of all) {
      const thumb = h('div', { class: 'thumb' });
      if (b.inimigo.foto) thumb.append(h('img', { src: b.inimigo.foto }));
      else thumb.append(DEFAULT_ENEMY());
      list.append(h('div', { class: 'card' }, thumb,
        h('div', { class: 'info' }, h('b', {}, b.inimigo.nome || 'Sem nome'), h('small', {}, `${(b.ataques || []).length} ataques${b.fase2 && b.fase2.ativa ? ' · 2 fases' : ''}`)),
        h('div', { class: 'acoes' },
          h('button', { class: 'play', onclick: () => this.play(b) }, '▶ JOGAR'),
          h('button', { onclick: () => this.edit(b.id) }, '✏️ EDITAR'),
          h('button', { onclick: () => this.share(b) }, '📤'),
          h('button', { class: 'perigo', onclick: () => { if (confirm(`Apagar "${b.inimigo.nome}"?`)) { Store.del(b.id); this.home(); } } }, '🗑️'))));
    }
  },
  novo() { const b = novaBatalha(); b.inimigo.nome = 'Novo Inimigo'; Store.put(b); this.edit(b.id); },

  // ---------- jogo ----------
  play(b, opts = {}) {
    this.show('jogo'); Sfx.init();
    const back = opts.voltar || (() => this.home());
    Batalha.start(b, { ...opts, onExit: () => back() });
  },
  sair() { Batalha.exit(); },

  // ---------- compartilhar ----------
  async share(b) {
    const code = await gerarCodigo(b);
    const m = this.modal('Compartilhar batalha',
      h('p', {}, 'Mande este código pros seus amigos. Eles colam em "JOGAR CÓDIGO DE AMIGO".'),
      h('textarea', { readonly: '', rows: 5, class: 'codigo' }, code),
      h('small', {}, `${Math.round(code.length / 1024)} KB${code.length > 60000 ? ' — grande por causa das fotos. Se não der pra mandar, use fotos menores.' : ''}`),
      h('div', { class: 'linha' },
        h('button', { class: 'play', onclick: async () => { await copiar(code); this.toast('Código copiado!'); } }, '📋 COPIAR'),
        h('button', { onclick: () => compartilhar(code, b.inimigo.nome) }, '📤 ENVIAR')));
    return m;
  },
  importar() {
    const ta = h('textarea', { rows: 6, placeholder: 'Cole o código aqui (começa com BTL1:)' });
    const go = async jogar => {
      try {
        const b = await lerCodigo(ta.value);
        Store.put(b); this.closeModal();
        if (jogar) this.play(b); else this.home();
        this.toast(`"${b.inimigo.nome}" foi adicionada!`);
      } catch (e) { alert(e.message || 'Código inválido.'); }
    };
    this.modal('Jogar código de amigo', ta,
      h('div', { class: 'linha' }, h('button', { class: 'play', onclick: () => go(true) }, '▶ JOGAR'), h('button', { onclick: () => go(false) }, '💾 SALVAR')));
  },
  modal(titulo, ...kids) {
    this.closeModal();
    const m = h('div', { class: 'modal', onclick: e => { if (e.target === m) this.closeModal(); } },
      h('div', { class: 'caixa' }, h('h2', {}, titulo), ...kids, h('button', { class: 'fechar', onclick: () => this.closeModal() }, 'FECHAR')));
    document.body.append(m); this._modal = m; return m;
  },
  closeModal() { if (this._modal) { this._modal.remove(); this._modal = null; } },
  toast(t) { const e = h('div', { class: 'toast' }, t); document.body.append(e); setTimeout(() => e.remove(), 2200); },

  // ---------- editor ----------
  edit(id) {
    this.b = Store.get(id);
    this.show('editor');
    this.render();
  },
  save() { clearTimeout(this.saveT); this.saveT = setTimeout(() => Store.put(this.b), 250); },
  saveNow() { clearTimeout(this.saveT); Store.put(this.b); },
  render() {
    const b = this.b, f = $('#form'); f.innerHTML = '';
    $('#tituloEditor').textContent = b.inimigo.nome || 'Sem nome';
    f.append(
      this.secao('👾 Inimigo', true,
        this.foto('Foto do inimigo', b.inimigo, 'foto', 160),
        this.check('Visual pixelado (estilo Undertale)', b.inimigo, 'pixel'),
        this.txt('Nome', b.inimigo, 'nome', () => { $('#tituloEditor').textContent = b.inimigo.nome; }),
        this.num('Vida', b.inimigo, 'vida', 1, 9999),
        this.num('Dano de cada ataque', b.inimigo, 'ataque', 1, 99),
        this.num('Defesa', b.inimigo, 'defesa', 0, 99),
        this.sel('Música', b.inimigo, 'musica', MUSICAS, v => { Sfx.init(); Sfx.playMusic(v); setTimeout(() => Sfx.stopMusic(), 4000); }),
        this.txt('Frase de entrada', b.inimigo, 'entrada'),
        this.area('Texto do CHECAR', b.inimigo, 'checar', 2),
        this.area('Falas durante a luta (uma por linha)', b.inimigo, 'falas', 4)),
      this.secao('🧍 Você (jogador)', false,
        this.txt('Nome', b.jogador, 'nome'),
        this.num('Vida', b.jogador, 'vida', 1, 999),
        this.num('Força', b.jogador, 'forca', 1, 999),
        this.check('KARMA (o HP continua caindo depois de levar dano)', b, 'karma')),
      this.secao('💬 AGIR', false,
        this.lista(b.acoes, a => [this.txt('Nome', a, 'nome'), this.area('O que acontece', a, 'texto', 2), this.num('Misericórdia (+% pra poupar)', a, 'misericordia', -100, 100)],
          () => ({ nome: 'Nova ação', texto: '* ...', misericordia: 20 }), '+ AÇÃO'),
        this.check('O inimigo pode ser POUPADO (quando a misericórdia chega a 100%)', b, 'podePoupar')),
      this.secao('🍰 Itens', false,
        this.lista(b.itens, it => [this.txt('Nome', it, 'nome'), this.num('Cura', it, 'cura', 1, 999)], () => ({ nome: 'Doce', cura: 15 }), '+ ITEM', 8)),
      this.secao('⚔️ Ataques', true, this.ataques(b.ataques)),
      this.secao('🔥 2ª fase', false, this.fase2()),
      this.secao('🏆 Final', false,
        this.area('Texto quando você vence lutando', b, 'textoVitoria', 2),
        this.area('Texto quando você poupa', b, 'textoPoupar', 2)),
    );
  },
  secao(titulo, aberta, ...kids) { return h('details', aberta ? { open: '' } : {}, h('summary', {}, titulo), h('div', { class: 'corpo' }, ...kids)); },
  campo(label, input) { return h('label', { class: 'campo' }, h('span', {}, label), input); },
  txt(label, obj, k, cb) { return this.campo(label, h('input', { type: 'text', value: obj[k] || '', maxlength: 80, oninput: e => { obj[k] = e.target.value; this.save(); cb && cb(); } })); },
  area(label, obj, k, rows) { return this.campo(label, h('textarea', { rows, oninput: e => { obj[k] = e.target.value; this.save(); } }, obj[k] || '')); },
  num(label, obj, k, min, max) { return this.campo(label, h('input', { type: 'number', inputmode: 'numeric', min, max, value: obj[k] ?? 0, oninput: e => { const v = Math.max(min, Math.min(max, +e.target.value || 0)); obj[k] = v; this.save(); } })); },
  check(label, obj, k) { return h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: obj[k] !== false && !!obj[k], onchange: e => { obj[k] = e.target.checked; this.save(); } }), h('span', {}, label)); },
  sel(label, obj, k, opts, cb) {
    const s = h('select', { onchange: e => { obj[k] = e.target.value; this.save(); cb && cb(e.target.value); } });
    for (const v in opts) { const o = h('option', { value: v }, opts[v]); if (obj[k] === v) o.selected = true; s.append(o); }
    return this.campo(label, s);
  },
  range(label, obj, k, min, max, fmt) {
    const out = h('b', {}, fmt ? fmt(obj[k]) : obj[k]);
    return h('label', { class: 'campo' }, h('span', {}, label, ' ', out), h('input', { type: 'range', min, max, value: obj[k], oninput: e => { obj[k] = +e.target.value; out.textContent = fmt ? fmt(obj[k]) : obj[k]; this.save(); } }));
  },
  foto(label, obj, k, max) {
    const prev = h('div', { class: 'thumb grande' });
    const upd = () => { prev.innerHTML = ''; if (obj[k]) prev.append(h('img', { src: obj[k] })); else prev.append(h('span', {}, 'sem foto')); };
    upd();
    const inp = h('input', { type: 'file', accept: 'image/*', hidden: '', onchange: async e => {
      const file = e.target.files[0]; if (!file) return;
      try { obj[k] = await lerFoto(file, max); upd(); this.save(); } catch (err) { alert('Não consegui abrir essa foto.'); }
      e.target.value = '';
    } });
    return h('div', { class: 'campo' }, h('span', {}, label), h('div', { class: 'linha' }, prev,
      h('button', { type: 'button', onclick: () => inp.click() }, '📷 ESCOLHER'), obj[k] ? h('button', { type: 'button', class: 'perigo', onclick: () => { obj[k] = null; this.save(); this.render(); } }, '✕') : null), inp);
  },
  lista(arr, campos, novo, addLabel, max = 30) {
    const box = h('div', { class: 'lista' });
    arr.forEach((it, i) => box.append(h('div', { class: 'item' }, ...campos(it),
      h('div', { class: 'linha mini' },
        h('button', { type: 'button', onclick: () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; this.save(); this.render(); } } }, '↑'),
        h('button', { type: 'button', onclick: () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; this.save(); this.render(); } } }, '↓'),
        h('button', { type: 'button', class: 'perigo', onclick: () => { arr.splice(i, 1); this.save(); this.render(); } }, '✕ APAGAR')))));
    if (arr.length < max) box.append(h('button', { type: 'button', class: 'add', onclick: () => { arr.push(novo()); this.save(); this.render(); } }, addLabel));
    return box;
  },
  ataques(arr) {
    const tipos = {}; for (const k in TIPOS) tipos[k] = TIPOS[k].nome;
    return this.lista(arr, a => {
      const extra = [];
      if (a.projetil === 'emoji') extra.push(this.txt('Emoji (pode colar qualquer um)', a, 'emoji'));
      if (a.projetil === 'foto') extra.push(this.foto('Foto do projétil', a, 'foto', 48));
      return [
        h('div', { class: 'titulo-atk' }, `${arr.indexOf(a) + 1}. ${TIPOS[a.tipo] ? TIPOS[a.tipo].nome : '?'}`),
        this.sel('Tipo de ataque', a, 'tipo', tipos, () => this.render()),
        h('small', { class: 'dica' }, TIPOS[a.tipo] ? TIPOS[a.tipo].desc : ''),
        this.sel('Projétil', a, 'projetil', PROJETEIS, () => this.render()),
        ...extra,
        this.sel('Cor', a, 'cor', CORES),
        this.range('Velocidade', a, 'velocidade', 1, 5),
        this.range('Quantidade', a, 'quantidade', 1, 5),
        this.range('Duração', a, 'duracao', 4, 15, v => v + 's'),
        this.sel('Tamanho da caixa', a, 'caixa', CAIXAS),
        h('button', { type: 'button', class: 'play', onclick: () => { this.saveNow(); this.play(this.b, { soAtaque: a, voltar: () => { this.show('editor'); } }); } }, '▶ TESTAR SÓ ESTE ATAQUE'),
      ];
    }, () => novoAtaque(), '+ ATAQUE');
  },
  fase2() {
    const F = this.b.fase2;
    const kids = [this.check('Ativar 2ª fase', F, 'ativa')];
    kids[0].querySelector('input').addEventListener('change', () => this.render());
    if (!F.ativa) return h('div', {}, ...kids, h('small', { class: 'dica' }, 'Quando ativa, o inimigo muda de ataques (e pode até voltar com vida cheia e quebrar o POUPAR).'));
    kids.push(
      this.sel('Quando começa', F, 'modo', { porcentagem: 'Quando a vida cai até uma %', renascer: 'Quando ele "morre" (volta com vida nova)' }, () => this.render()),
      F.modo === 'renascer' ? this.num('Vida nova', F, 'vida', 1, 9999) : this.range('Começa com a vida em', F, 'porcentagem', 10, 90, v => v + '%'),
      this.num('Dano extra por ataque', F, 'ataqueExtra', 0, 50),
      this.check('Quebrar o botão POUPAR', F, 'quebrarPoupar'),
      this.foto('Foto nova (opcional)', F, 'foto', 160),
      this.sel('Música da 2ª fase', F, 'musica', MUSICAS),
      this.area('Texto da transformação (uma frase por linha)', F, 'falas', 3),
      this.area('Falas na 2ª fase (uma por linha)', F, 'falasLuta', 3),
      h('div', { class: 'titulo-atk' }, 'Ataques da 2ª fase'),
      this.ataques(F.ataques));
    return h('div', {}, ...kids);
  },
  testar() { this.saveNow(); this.play(this.b, { voltar: () => this.show('editor') }); },
};

(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => App.start());
