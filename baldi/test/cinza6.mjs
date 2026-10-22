export default async function (p, out) {
  await p.evaluate(() => { const G = Jogo.G; G.p.x = 60; G.p.z = -5; G.p.yaw = Math.PI / 2; });
  await p.waitForTimeout(500);
  const px = async () => { const b = await p.screenshot({ clip: { x: 40, y: 150, width: 1, height: 1 } }); return b.toString('base64').slice(-30); };
  console.log('antes', await px());
  await p.evaluate(() => { const m = Jogo.cena.children.filter((o) => o.isMesh)[0]; const t = m.material.map; console.log(t.repeat.x, t.repeat.y, t.minFilter, t.wrapS); t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; });
  await p.waitForTimeout(500); console.log('sem mipmap', await px());
  await p.screenshot({ path: out + '/cz_f.png' });
  const uv = await p.evaluate(() => { const m = Jogo.cena.children.filter((o) => o.isMesh)[0]; const u = m.geometry.attributes.uv.array; let mn = 1e9, mx = -1e9; for (const v of u) { mn = Math.min(mn, v); mx = Math.max(mx, v); } return [mn, mx, u.length]; });
  console.log('uv', uv);
}
