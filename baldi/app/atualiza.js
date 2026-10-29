// Atualização automática: confere no GitHub se saiu versão nova e oferece baixar e instalar (no app Android).
(function () {
  'use strict';
  const J = window.Jogo, $ = (id) => document.getElementById(id);
  const BASE = 'https://raw.githubusercontent.com/Heitorcoser/claude/claude/graphify-repo-setup-d9dotq/baldi/';
  const A = () => window.Android || {};
  J.VERSAO = (A().versao && A().versao()) || '1.17';
  const tester = () => !!(A().pacote && /\.tester$/.test(A().pacote())) || !!J.ehTester;
  // "1.10" > "1.9": compara número por número
  const maior = (a, b) => {
    const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
    for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) != (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
    return false;
  };
  const caixa = document.createElement('div'); caixa.id = 'atualiza'; caixa.hidden = true;
  $('menu').appendChild(caixa);
  const ver = document.createElement('div'); ver.id = 'versaoTxt'; ver.textContent = 'v' + J.VERSAO + (tester() ? ' (tester)' : '');
  $('menu').appendChild(ver);
  let ultima = 0;
  async function confere() {
    if (Date.now() - ultima < 10 * 60 * 1000) return;
    ultima = Date.now();
    try {
      const v = await (await fetch(BASE + 'versao.json?t=' + Date.now(), { cache: 'no-store' })).json();
      if (!maior(v.versao, J.VERSAO)) return;
      const url = BASE + (tester() && v.tester ? v.tester : v.apk);
      caixa.innerHTML = `<b>Nova versão ${v.versao} disponível!</b><span>${v.novidades || ''}</span><button class="bt" id="bAtualiza">Atualizar</button>`;
      caixa.hidden = false;
      $('bAtualiza').onclick = () => {
        if (A().atualiza) { A().atualiza(url); caixa.innerHTML = '<b>Baixando...</b><span>Quando terminar, o instalador abre sozinho (ou toque na notificação). Se o Android pedir, permita instalar apps deste app.</span>'; }
        else window.open(url, '_blank');
      };
    } catch (e) { /* sem internet: tenta de novo depois */ }
  }
  J.confereAtualizacao = (forca) => { if (forca) ultima = 0; return confere(); };
  setTimeout(confere, 1500);
  J.ganchos.menu.push(() => setTimeout(confere, 500));
})();
