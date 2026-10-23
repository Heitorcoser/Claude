// Modo História: sem opções = jogo original; com opções = novidades que saíram do Beta (sem as do Beta novo)
export default async function (p) {
  const r = (n) => p.evaluate((n) => { const G = Jogo.G; return { n, mapa: !!Jogo.E.gerado, npcs: Object.keys(G.npcs).join(','), pontosVisivel: !document.getElementById('pontos').hidden, umaDir: G.portas.filter((d) => d.umaDir).length, mais: G.objs.filter((o) => o.tipo == 'mais').length, cadernos: G.totalCadernos }; }, n);
  console.log(JSON.stringify(await r('original')));
  await p.evaluate(() => { Jogo.menu(); Object.assign(Jogo.histFeat, { mapa: true, reflex: true, cloudy: true, test: false, eventos: true, porao: true }); });
  await p.evaluate(() => Jogo.comeca('historia'));
  await p.waitForFunction(() => Jogo.G && Jogo.G.t > 0.5, null, { timeout: 120000 });
  console.log(JSON.stringify(await r('com opções')));
  // tela de opções
  await p.evaluate(() => { Jogo.menu(); Jogo.abreOpcoes('historia'); });
  console.log('botões História:', await p.evaluate(() => [...document.querySelectorAll('.feat')].filter((b) => !b.hidden).map((b) => b.dataset.f).join(',')), '| título:', await p.evaluate(() => document.getElementById('betaTitulo').textContent));
  await p.evaluate(() => { document.getElementById('betaVolta').click(); Jogo.abreOpcoes('beta'); });
  console.log('botões Beta:', await p.evaluate(() => [...document.querySelectorAll('.feat')].filter((b) => !b.hidden).map((b) => b.dataset.f).join(',')));
  await p.screenshot({ path: process.argv[3] + '/opcoes_beta.png' });
}
