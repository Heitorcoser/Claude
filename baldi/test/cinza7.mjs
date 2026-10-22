export default async function (p, out) {
  const px = async () => { const b = await p.screenshot({ clip: { x: 40, y: 150, width: 1, height: 1 } }); return b.toString('base64').slice(-26, -12); };
  for (const [x, z, yaw] of [[60, -5, Math.PI / 2], [60, -5, Math.PI / 2 + 0.001], [60, -5, Math.PI / 2 + 0.0001], [60, -5, Math.PI / 2 + 0.05], [60, -5, -Math.PI / 2], [5, -30, 0], [5, -30, Math.PI], [5, -30, 0.05], [60, -5, Math.PI / 2 + 0.3]]) {
    await p.evaluate(([x, z, yaw]) => { const G = Jogo.G; G.p.x = x; G.p.z = z; G.p.yaw = yaw; }, [x, z, yaw]);
    await p.waitForTimeout(300); console.log(x, z, yaw.toFixed(2), await px());
  }
  await p.evaluate(() => { const G = Jogo.G; G.p.x = 5; G.p.z = -30; G.p.yaw = 0; }); await p.waitForTimeout(300); await p.screenshot({ path: out + '/cz_g.png' });
}
