// Sair e entrar de novo não duplica a música; Beta Tester pede a dificuldade
export default async function (p, out) {
  const musicas = () => p.evaluate(() => [...Motor.tocando].filter((h) => h.s.loop).length);
  console.log('tocando em loop no 1º jogo:', await musicas());
  for (let i = 0; i < 2; i++) {
    await p.evaluate(() => Jogo.pausa(true)); await p.waitForTimeout(300); await p.click('#sair'); await p.waitForTimeout(300);
    console.log('no menu:', await musicas());
    await p.evaluate(() => document.getElementById('jBeta').click()); await p.waitForTimeout(300); await p.evaluate(() => document.getElementById('betaSegue').click()); await p.waitForTimeout(300);
    if (i == 0) await p.screenshot({ path: out + '/dificuldade.png' });
    await p.evaluate((d) => document.querySelector('#difs [data-d=' + d + ']').click(), i == 0 ? 'dificil' : 'facil');
    await p.waitForFunction(() => Jogo.G && document.getElementById('carregando').hidden, null, { timeout: 120000 });
    await p.waitForTimeout(800);
    console.log('jogo', i + 2, await p.evaluate(() => [Jogo.G.modo, Jogo.G.dif.nome, Jogo.G.npcs.robo ? 'robo' : '-']), 'loops:', await musicas());
  }
}
