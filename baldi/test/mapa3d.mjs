// Fotos dentro da escola gerada
export default async function (p, out) {
  const lugares = await p.evaluate(() => {
    const E = Jogo.E, pl = E.esp.find((e) => e.s == 'PlayerScript').pos, l = [['inicio', pl[0], pl[2], 0]];
    const r = E.ronda; l.push(['corredor', r[0][0], r[0][1], Math.PI / 2], ['corredor2', r[3][0], r[3][1], 0]);
    for (const g of E.gat) if (g.n == 'Office Trigger' || /^_Faculty/.test(g.n)) { l.push([g.n.slice(0, 8), g.c[0] - g.h[0] + 3, g.c[2] + g.h[2] - 3, 2.36]); }
    for (const [k, rs] of E.ronda.slice(16, 20).entries()) l.push(['sala' + k, rs[0], rs[1], k]);
    return l;
  });
  for (const [n, x, z, yaw] of lugares) {
    await p.evaluate(([x, z, yaw]) => { const G = Jogo.G; G.p.x = x; G.p.z = z; G.p.yaw = yaw; }, [x, z, yaw]);
    await p.waitForTimeout(500); await p.screenshot({ path: out + '/g_' + n + '.png' });
  }
  console.log('fotos:', lugares.map((l) => l[0]).join(','));
}
