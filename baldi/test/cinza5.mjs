export default async function (p, out) {
  await p.evaluate(() => { const G = Jogo.G; G.p.x = 60; G.p.z = -5; G.p.yaw = Math.PI / 2; });
  await p.waitForTimeout(500);
  const n = await p.evaluate(() => (window.__ms = Jogo.cena.children.filter((o) => o.isMesh)).length);
  const cor = async () => { const b = await p.screenshot({ clip: { x: 40, y: 150, width: 1, height: 1 } }); return b.toString('base64').slice(-40); };
  const base = await cor(); const achados = [];
  for (let i = 0; i < n; i++) {
    await p.evaluate((i) => { window.__ms.forEach((m, k) => (m.visible = k !== i)); }, i);
    await p.waitForTimeout(60);
    const c = await cor();
    if (c !== base) achados.push(await p.evaluate((i) => { const m = window.__ms[i]; return [i, (m.material.map?.image?.src || 'cor').split('/').slice(-2).join('/'), m.geometry.attributes.position.count, m.material.color.getHexString(), m.position.y]; }, i));
  }
  console.log('malhas que mudam o pixel cinza:', JSON.stringify(achados));
}
