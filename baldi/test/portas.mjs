// Fotos de cada tipo de porta do mapa gerado
export default async function (p, out) {
  const l = await p.evaluate(() => {
    const vistos = {}, r = [];
    for (const d of Jogo.G.portas) {
      const t = (Jogo.E.portas.find((q) => q.pos[0] == d.x && q.pos[2] == d.z) || {}).pai || '';
      if (vistos[t] || d.tipo == 'vaivem') continue; vistos[t] = 1;
      // fica de frente para a porta, do lado do corredor
      const b = Jogo.E.portas.find((q) => q.pos[0] == d.x && q.pos[2] == d.z).bar, horiz = b.a[1] == b.b[1];
      for (const s of [1, -1]) { const x = d.x + (horiz ? 0 : s * 9), z = d.z + (horiz ? s * 9 : 0); if (Jogo.mundo.ve(x, z, d.x + (horiz ? 0 : s * 0.5), d.z + (horiz ? s * 0.5 : 0), true)) { r.push([t.split('/').pop(), x, z, Math.atan2(-(d.x - x), -(d.z - z))]); break; } }
    }
    return r;
  });
  for (const [n, x, z, yaw] of l) { await p.evaluate(([x, z, yaw]) => { const G = Jogo.G; G.p.x = x; G.p.z = z; G.p.yaw = yaw; }, [x, z, yaw]); await p.waitForTimeout(500); await p.screenshot({ path: out + '/p_' + n + '.png' }); }
  console.log('portas:', l.map((q) => q[0]).join(','));
}
