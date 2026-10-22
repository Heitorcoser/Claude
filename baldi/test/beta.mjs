// Testa o Beta Tester: ala nova, personagens e eventos
export default async function (p, out) {
  const info = await p.evaluate(() => { const G = Jogo.G; return { total: G.totalCadernos, cadernos: G.objs.filter((o) => o.tipo == 'caderno').length, npcs: Object.keys(G.npcs).join(','), portas: G.portas.length }; });
  console.log('beta:', JSON.stringify(info));
  // vai até a passagem nova e olha para dentro da ala
  await p.evaluate(() => { const G = Jogo.G; G.p.x = 115; G.p.z = -295; G.p.yaw = -Math.PI / 2; });
  await p.waitForTimeout(800); await p.screenshot({ path: out + '/beta_passagem.png' });
  // anda pela ala até o fim do corredor
  await p.evaluate(() => (Jogo.ent.mz = 1)); await p.waitForTimeout(4000); await p.evaluate(() => (Jogo.ent.mz = 0));
  console.log('pos na ala:', await p.evaluate(() => [Jogo.G.p.x.toFixed(1), Jogo.G.p.z.toFixed(1)]));
  await p.screenshot({ path: out + '/beta_corredor.png' });
  // caminho do Baldi até a ala (a navegação conhece a ala?)
  console.log('caminho até o laboratório:', await p.evaluate(() => Jogo.nav.caminho(5, -125, 290, -290).length));
  // liga o modo bravo e força os eventos
  await p.evaluate(() => { Jogo.spoop(); const G = Jogo.G; G.npcs.robo.x = 160; G.npcs.robo.z = -295; G.p.x = 200; G.p.z = -295; G.p.yaw = -Math.PI / 2 * -1; });
  await p.waitForTimeout(1500); await p.screenshot({ path: out + '/beta_robo.png' });
  console.log('robo viu:', await p.evaluate(() => Jogo.G.npcs.robo.viu));
  for (const ev of ['apagao', 'incendio', 'chuva']) {
    await p.evaluate((ev) => { const G = Jogo.G; if (G.ev.atual) { Jogo.EVENTOS[G.ev.atual].fim?.(G); } G.ev.atual = ev; G.ev.fim = Jogo.EVENTOS[ev].dur; Jogo.EVENTOS[ev].ini(G); }, ev);
    await p.waitForTimeout(2500); await p.screenshot({ path: out + '/beta_' + ev + '.png' });
    console.log(ev, await p.evaluate(() => document.getElementById('evento').textContent));
  }
}
