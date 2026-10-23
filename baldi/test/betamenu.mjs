// Tela de Beta Features: liga o mapa aleatório, desliga o Cloudy, entra no Difícil
export default async function (p, out) {
  await p.click('#bPausa'); await p.waitForTimeout(300); await p.click('#sair'); await p.waitForTimeout(300);
  await p.click('#jBeta'); await p.waitForTimeout(400);
  await p.evaluate(() => { Jogo.betaFeat.mapa = false; Jogo.betaFeat.cloudy = true; });
  await p.click('.feat[data-f=mapa]'); await p.click('.feat[data-f=cloudy]'); await p.waitForTimeout(200);
  await p.screenshot({ path: out + '/beta_menu.png' });
  await p.click('#betaSegue'); await p.waitForTimeout(300);
  await p.click('#difs [data-d=dificil]');
  await p.waitForFunction(() => Jogo.G && document.getElementById('carregando').hidden, null, { timeout: 120000 });
  await p.waitForTimeout(800);
  console.log('beta:', await p.evaluate(() => [Jogo.G.modo, Jogo.G.dif.nome, JSON.stringify(Jogo.betaFeat), !!Jogo.E.gerado, Object.keys(Jogo.G.npcs).join(',')]));
  await p.screenshot({ path: out + '/beta_jogo.png' });
}
