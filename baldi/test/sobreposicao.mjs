// Procura objetos dentro de outros: sprites (enfeites, itens, cadernos) dentro de móveis e sprites em cima de sprites
export default async function (p) {
  const r = await p.evaluate(() => {
    const out = { mapas: 0, dentroMovel: [], juntos: [], movelMovel: [] };
    const caixaDentro = (c, x, z, m) => { const dx = x - c.c[0], dz = z - c.c[2], co = Math.cos(c.ang || 0), si = Math.sin(c.ang || 0); return Math.abs(dx * co + dz * si) < c.h[0] + m && Math.abs(-dx * si + dz * co) < c.h[2] + m; };
    for (let k = 0; k < 12; k++) {
      const E = k == 0 ? JSON.parse(JSON.stringify(Jogo.Ebase)) : Jogo.geraMapa(Jogo.Ebase, 7);
      if (!E) continue;
      out.mapas++;
      const spr = E.spr.filter((s) => s.a && !s.pai.startsWith('NPC/') && !/PrototypeStuff|Old|Escada|Lampada/.test(s.pai));
      for (const s of spr) {
        const x = s.M[12], y = s.M[13], z = s.M[14], alt = Math.hypot(s.M[4], s.M[5], s.M[6]) * 100 / s.ppu * 0.5; // metade da altura (aprox.)
        for (const c of E.caixas) {
          const topo = c.c[1] + c.h[1];
          if (caixaDentro(c, x, z, -0.2) && y - alt * 0.6 < topo - 0.4 && y > c.c[1] - c.h[1]) { if (out.dentroMovel.length < 25) out.dentroMovel.push(`${k}:${s.pai.split('/').slice(-2).join('/')} em ${c.n} (${x.toFixed(1)},${z.toFixed(1)}) y${y.toFixed(1)} topo${topo.toFixed(1)}`); }
        }
      }
      for (let i = 0; i < spr.length; i++) for (let j = i + 1; j < spr.length; j++) {
        const a = spr[i], b = spr[j];
        if (Math.hypot(a.M[12] - b.M[12], a.M[14] - b.M[14]) < 1.2 && Math.abs(a.M[13] - b.M[13]) < 1.5 && out.juntos.length < 25) out.juntos.push(`${k}:${a.pai.split('/').pop()} + ${b.pai.split('/').pop()} (${a.M[12].toFixed(1)},${a.M[14].toFixed(1)})`);
      }
      const cx = E.caixas;
      for (let i = 0; i < cx.length; i++) for (let j = i + 1; j < cx.length; j++) {
        const a = cx[i], b = cx[j];
        if (/Wall|Trigger/.test(a.n + b.n)) continue;
        if (caixaDentro(a, b.c[0], b.c[2], -0.3) && out.movelMovel.length < 25) out.movelMovel.push(`${k}:${a.n} x ${b.n} (${b.c[0].toFixed(1)},${b.c[2].toFixed(1)})`);
      }
    }
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
}
