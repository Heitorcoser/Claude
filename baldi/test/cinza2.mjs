export default async function (p, out) {
  await p.evaluate(() => { const G = Jogo.G; G.p.x = 200; G.p.z = -295; G.p.yaw = Math.PI / 2; });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/cz_a.png' });
  await p.evaluate(() => { Jogo.cena.traverse((o) => { if (o.material && o.material.map) { o.material.map.minFilter = THREE.LinearFilter; o.material.map.needsUpdate = true; } }); });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/cz_b.png' });
  await p.evaluate(() => { const G = Jogo.G; G.p.x = 60; G.p.z = -5; G.p.yaw = Math.PI / 2; });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/cz_c.png' });
}
