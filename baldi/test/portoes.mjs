// Mapa aleatório: portas amarelas trancadas até 2 cadernos, 2 cadernos alcançáveis antes delas
export default async function (p, out) {
  const r = await p.evaluate(() => {
    const G = Jogo.G, N = Jogo.nav, pl = [G.p.x, G.p.z];
    const amarelas = G.portas.filter((d) => d.tipo == 'vaivem');
    const travadas = amarelas.filter((d) => d.travada).length;
    const cad = G.objs.filter((o) => o.tipo == 'caderno');
    // o jogador não passa das portas amarelas trancadas (as portas comuns ele abre)
    const cruza = (a, b, s) => { const d1x = b[0] - a[0], d1z = b[1] - a[1], d2x = s.bx - s.ax, d2z = s.bz - s.az, den = d1x * d2z - d1z * d2x; if (Math.abs(den) < 1e-9) return false; const t = ((s.ax - a[0]) * d2z - (s.az - a[1]) * d2x) / den, u = ((s.ax - a[0]) * d1z - (s.az - a[1]) * d1x) / den; return t >= 0 && t <= 1 && u >= 0 && u <= 1; };
    const segs = amarelas.filter((d) => d.travada).map((d) => d.seg);
    const alcanca = cad.filter((o) => { const c = N.caminho(pl[0], pl[1], o.x, o.z); return c.length && c.every((q, k) => { const a = k ? c[k - 1] : pl; return !segs.some((s) => cruza(a, q, s)); }); }).length;
    const b = G.npcs.baldi;
    return { amarelas: amarelas.length, travadas, cadernos: cad.length, alcancaveisAntes: alcanca, baldiAlcanca: N.caminho(b.x, b.z, pl[0], pl[1]).length > 0 };
  });
  console.log('portoes:', JSON.stringify(r));
  // pega 2 cadernos: as portas destrancam
  const r2 = await p.evaluate(async () => { const G = Jogo.G; G.cadernos = 2; await new Promise((r) => setTimeout(r, 400)); return G.portas.filter((d) => d.tipo == 'vaivem' && d.travada).length; });
  console.log('travadas depois de 2 cadernos:', r2);
  await p.evaluate(() => {
    const G = Jogo.G, d = G.portas.find((d) => d.tipo == 'vaivem'), q = Jogo.E.portas.find((q) => q.pos[0] == d.x && q.pos[2] == d.z), aoLongoX = q.bar.a[0] == q.bar.b[0];
    G.cadernos = 0;
    for (const s of [1, -1]) { const x = d.x + (aoLongoX ? s * 12 : 0), z = d.z + (aoLongoX ? 0 : s * 12); if (Jogo.mundo.ve(x, z, d.x + (aoLongoX ? s : 0), d.z + (aoLongoX ? 0 : s), true)) { G.p.x = x; G.p.z = z; G.p.yaw = Math.atan2(-(d.x - x), -(d.z - z)); break; } }
  });
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/portao.png' });
}
