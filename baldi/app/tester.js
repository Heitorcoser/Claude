// Só no APK de tester: atalhos para testar o caminho do NULL sem fazer tudo.
(function () {
  'use strict';
  const J = window.Jogo, $ = (id) => document.getElementById(id);
  J.ehTester = true; // a atualização baixa o APK de tester

  const css = document.createElement('style');
  css.textContent = '#telaTeste{background:#111;color:#0f0;gap:8px;overflow:auto;font-family:monospace}' +
    '#telaTeste h2{margin:0;font-size:26px}#telaTeste p{margin:0;max-width:640px;text-align:center;color:#9f9}' +
    '#telaTeste .bt{min-width:300px;color:#0f0;border-color:#0f0}#telaTeste .botoes{flex-direction:column;gap:4px}#testeEstado{color:#ff0}';
  document.head.appendChild(css);

  const tela = document.createElement('div');
  tela.className = 'tela'; tela.id = 'telaTeste'; tela.hidden = true;
  tela.innerHTML = '<h2>Teste do Null</h2><p>Versão de tester. Cada botão pula uma parte do caminho.</p><div id="testeEstado"></div>' +
    '<div class="botoes">' +
    '<button class="bt" data-t="sala">1. Porão com a sala secreta (com a fita verde)</button>' +
    '<button class="bt" data-t="discurso1">2. 1º discurso agora</button>' +
    '<button class="bt" data-t="notif">3. Liberar a tela do Null (finge notificações)</button>' +
    '<button class="bt" data-t="portas">4. Portas bugadas e 2º discurso</button>' +
    '<button class="bt" data-t="boss">5. Bossfight direto</button>' +
    '<button class="bt" data-t="zera">Zerar progresso do Null</button>' +
    '<button class="bt" data-t="volta">Voltar</button></div>';
  document.body.appendChild(tela);

  const bot = document.createElement('button');
  bot.className = 'bt'; bot.id = 'jTeste'; bot.textContent = 'Teste do Null';
  $('jComo').before(bot);

  function estado() {
    const p = J.progressoNull();
    $('testeEstado').textContent = `1º discurso: ${p.d1 ? 'sim' : 'não'} · 2º discurso: ${p.d2 ? 'sim' : 'não'} · notificações: ${J.notificacoes() ? 'ligadas' : 'desligadas'}`;
  }
  function joga(t) {
    J.betaFeat = Object.assign({}, J.betaFeat, { mapa: true, porao: true });
    J.testeNull = t; J.forcaSecreta = t == 'sala' || t == 'discurso1';
    tela.hidden = true;
    J.comeca('beta');
  }
  bot.onclick = () => { $('menu').hidden = true; tela.hidden = false; estado(); };
  tela.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => {
    const t = b.dataset.t;
    if (t == 'volta') { tela.hidden = true; $('menu').hidden = false; J.atualizaTitulo(); return; }
    if (t == 'notif') { J.forcaNotif = true; J.salvaNull({ d1: true }); J.atualizaTitulo(); estado(); return; }
    if (t == 'zera') { J.forcaNotif = false; try { localStorage.removeItem('baldiNull'); } catch (e) {} J.atualizaTitulo(); estado(); return; }
    joga(t);
  }));

  // de volta ao menu: a próxima partida é normal
  J.ganchos.menu.push(() => { J.testeNull = null; J.forcaSecreta = false; });
})();
