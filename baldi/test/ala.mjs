// Fotos da ala decorada, caminhos ainda livres e troca de item tocando no espaço lá em cima
export default async function (p, out) {
  const vistas = [['sala1', 155, -286, Math.PI], ['sala2', 145, -304, 0], ['deposito', 215, -286, Math.PI], ['biblioteca', 215, -304, 0], ['sala1b', 135, -245, -2.4], ['lab', 263, -295, -Math.PI / 2], ['corredor', 150, -295, -Math.PI / 2], ['corredor2', 255, -300, 0]];
  for (const [n, x, z, yaw] of vistas) {
    await p.evaluate(([x, z, yaw]) => { const G = Jogo.G; G.p.x = x; G.p.z = z; G.p.yaw = yaw; }, [x, z, yaw]);
    await p.waitForTimeout(600); await p.screenshot({ path: out + '/ala_' + n + '.png' });
  }
  console.log('caminhos:', await p.evaluate(() => {
    const E = Jogo.E, N = Jogo.nav, l = E.ronda.concat(E.rondaCorr, E.rondaSala), b = Jogo.G.npcs.baldi;
    const sem = l.filter((r) => !N.caminho(b.x, b.z, r[0], r[1]).length);
    const cad = Jogo.G.objs.filter((o) => o.tipo == 'caderno' || o.tipo == 'item').filter((o) => !N.caminho(b.x, b.z, o.x, o.z).length).map((o) => o.nome);
    return { pontos: l.length, semCaminho: sem, objsSemCaminho: cad };
  }));
  // troca de item: põe itens nos espaços 1 e 3, toca no 3
  await p.evaluate(() => { Jogo.G.item = [4, 0, 1]; Jogo.G.sel = 0; Jogo.atualizaHud(); });
  const box = await p.locator('.slot').nth(2).boundingBox();
  await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await p.waitForTimeout(200);
  console.log('item escolhido:', await p.evaluate(() => [Jogo.G.sel, document.getElementById('nomeItem')?.textContent]));
}
