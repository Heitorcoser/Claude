// APK de tester: menu "Teste do Null" e os atalhos
export default async function (p, out) {
  await p.evaluate(() => Jogo.menu());
  await p.evaluate(() => new Promise((ok) => { const s = document.createElement('script'); s.src = 'tester.js'; s.onload = ok; document.body.appendChild(s); }));
  await p.click('#jTeste'); await p.waitForTimeout(300); await p.screenshot({ path: out + '/tester_menu.png' });
  const clica = async (t) => { await p.evaluate(() => Jogo.G && Jogo.menu()); await p.evaluate(() => { document.getElementById('menu').hidden = true; document.getElementById('telaTeste').hidden = false; }); await p.click(`#telaTeste [data-t="${t}"]`); await p.waitForTimeout(2500); };
  await clica('sala');
  console.log('sala:', await p.evaluate(() => { const G = Jogo.G, [bx, bz] = Jogo.E.porao.entrada; return [!!Jogo.E.porao.sala, G.item.join(','), +Math.hypot(G.p.x - bx, G.p.z - bz).toFixed(1)]; }));
  await clica('discurso1');
  console.log('discurso1:', await p.evaluate(() => [!!Jogo.G.discurso1, document.getElementById('aviso').textContent]));
  await p.evaluate(() => Jogo.menu()); await p.waitForTimeout(300);
  await p.evaluate(() => { document.getElementById('menu').hidden = true; document.getElementById('telaTeste').hidden = false; });
  await p.click('#telaTeste [data-t="notif"]'); await p.waitForTimeout(300);
  console.log('notif:', await p.evaluate(() => [document.getElementById('testeEstado').textContent, document.body.classList.contains('telaNull')]));
  await clica('portas');
  console.log('portas:', await p.evaluate(() => [!!Jogo.G.especialNull, Jogo.G.especialNull && !!Jogo.G.especialNull.certa]));
  await clica('boss');
  await p.waitForTimeout(3000);
  console.log('boss:', await p.evaluate(() => [!!Jogo.G.null, !!Jogo.G.especialNull]));
  await p.evaluate(() => Jogo.menu()); await p.waitForTimeout(300);
  await p.evaluate(() => { document.getElementById('menu').hidden = true; document.getElementById('telaTeste').hidden = false; });
  await p.click('#telaTeste [data-t="zera"]');
  console.log('zera:', await p.evaluate(() => [localStorage.getItem('baldiNull'), document.body.classList.contains('telaNull'), Jogo.testeNull]));
}
