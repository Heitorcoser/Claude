// Caminhos dos NPCs não podem cruzar parede; fotos de cartazes, teto e da ala beta
export default async function (p, out) {
  const r = await p.evaluate(() => {
    const N = Jogo.nav, Mu = Jogo.mundo, livres = [];
    for (let k = 0; k < N.livre.length; k++) if (N.livre[k]) livres.push(k);
    let ruins = 0, tortos = 0, vazios = 0, total = 400, t0 = performance.now();
    for (let n = 0; n < total; n++) {
      const a = livres[(Math.random() * livres.length) | 0], b = livres[(Math.random() * livres.length) | 0];
      const P = (k) => [N.x0 + ((k % N.W) + 0.5) * 2.5, N.z0 + (((k / N.W) | 0) + 0.5) * 2.5];
      const [ax, az] = P(a), [bx, bz] = P(b), c = N.caminho(ax, az, bx, bz);
      if (!c.length) { vazios++; continue; }
      let x = ax, z = az;
      for (const [px, pz] of c) { if (!Mu.ve(x, z, px, pz, true)) { ruins++; break; } if (Math.abs(px - x) > 0.05 && Math.abs(pz - z) > 0.05) { tortos++; break; } x = px; z = pz; }
    }
    return { total, ruins, tortos, vazios, ms: Math.round((performance.now() - t0) / total) };
  });
  console.log('caminhos:', JSON.stringify(r));
  for (const [nome, x, z, yaw] of [['cartaz', 5, -180, 0], ['sala', 5, -200, Math.PI], ['teto', 5, -100, 0], ['ala', 115, -295, -Math.PI / 2], ['ala_sala', 145, -285, Math.PI / 2]]) {
    await p.evaluate(([x, z, yaw]) => { const G = Jogo.G; G.p.x = x; G.p.z = z; G.p.yaw = yaw; }, [x, z, yaw]);
    await p.waitForTimeout(700); await p.screenshot({ path: out + '/' + nome + '.png' });
  }
}
