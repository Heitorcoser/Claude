export default async function (p, out) {
  await p.evaluate(() => { const G = Jogo.G; G.p.x = 60; G.p.z = -5; G.p.yaw = Math.PI / 2; });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/cz_d.png' });
  const info = await p.evaluate(() => { const l = []; Jogo.cena.traverse((o) => { if (o.isMesh && o.geometry.type == 'PlaneGeometry' && o.visible) l.push([(o.material.map?.image?.src || '').split('/').pop(), o.position.x.toFixed(0), o.position.z.toFixed(0), o.scale.x.toFixed(1), o.scale.y.toFixed(1)]); }); return l.filter((x) => Math.hypot(x[1] - 60, x[2] + 5) < 40); });
  console.log(JSON.stringify(info));
  await p.evaluate(() => Jogo.cena.traverse((o) => { if (o.isMesh && o.geometry.type == 'PlaneGeometry') o.visible = false; }));
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/cz_e.png' });
}
