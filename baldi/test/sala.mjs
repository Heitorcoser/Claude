// Fotos: caderno em cima da carteira e corredor, da altura de uma criança
export default async function (p, out) {
  const l = await p.evaluate(() => {
    const G = Jogo.G, cad = G.objs.filter((o) => o.tipo == 'caderno').slice(0, 2), r = [];
    for (const [k, c] of cad.entries()) r.push(['caderno' + k, c.x, c.z + 9, 0], ['caderno' + k + 'b', c.x + 8, c.z, Math.PI / 2]);
    const rr = Jogo.E.ronda; r.push(['corr', rr[1][0], rr[1][1], 0], ['corr2', rr[2][0], rr[2][1], Math.PI / 2]);
    return r;
  });
  for (const [n, x, z, yaw] of l) { await p.evaluate(([x, z, yaw]) => { const G = Jogo.G; G.p.x = x; G.p.z = z; G.p.yaw = yaw; }, [x, z, yaw]); await p.waitForTimeout(500); await p.screenshot({ path: out + '/s_' + n + '.png' }); }
}
