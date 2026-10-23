// Desenha a planta do mapa (vista de cima) e confere caminhos; tira fotos dentro da escola
export default async function (p, out) {
  const info = await p.evaluate(() => {
    const E = Jogo.E, N = Jogo.nav, cv = document.createElement('canvas');
    let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
    for (const s of E.segs) { x0 = Math.min(x0, s.a[0], s.b[0]); x1 = Math.max(x1, s.a[0], s.b[0]); z0 = Math.min(z0, s.a[1], s.b[1]); z1 = Math.max(z1, s.a[1], s.b[1]); }
    const k = 3; cv.width = (x1 - x0) * k + 20; cv.height = (z1 - z0) * k + 20;
    const g = cv.getContext('2d'), X = (x) => (x - x0) * k + 10, Z = (z) => (z1 - z) * k + 10;
    g.fillStyle = '#222'; g.fillRect(0, 0, cv.width, cv.height);
    // piso por material
    for (const o of E.objs) if (o.m == 'quad' && o.M[13] == 0 && Math.abs(o.M[9]) == 1) { const n = E.mats[o.mat[0]].n; g.fillStyle = n == 'Carpet' ? '#2b4f8a' : '#d8c79a'; g.fillRect(X(o.M[12] - 5), Z(o.M[14] + 5), 10 * k, 10 * k); }
    g.strokeStyle = '#fff'; g.lineWidth = 2;
    for (const s of E.segs) { g.strokeStyle = s.ent ? '#f0f' : '#fff'; g.beginPath(); g.moveTo(X(s.a[0]), Z(s.a[1])); g.lineTo(X(s.b[0]), Z(s.b[1])); g.stroke(); }
    for (const d of E.portas) { g.strokeStyle = d.tipo == 'vaivem' ? '#ff0' : '#0f0'; g.lineWidth = 4; g.beginPath(); g.moveTo(X(d.bar.a[0]), Z(d.bar.a[1])); g.lineTo(X(d.bar.b[0]), Z(d.bar.b[1])); g.stroke(); }
    g.fillStyle = '#a52';
    for (const c of E.caixas) { g.save(); g.translate(X(c.c[0]), Z(c.c[2])); g.rotate(-c.ang); g.fillRect(-c.h[0] * k, -c.h[2] * k, c.h[0] * 2 * k, c.h[2] * 2 * k); g.restore(); }
    for (const gt of E.gat) { g.strokeStyle = gt.n == 'Office Trigger' ? '#f80' : /Faculty/.test(gt.n) ? '#f44' : '#0ff'; g.lineWidth = 1; g.save(); g.translate(X(gt.c[0]), Z(gt.c[2])); g.rotate(-gt.ang); g.strokeRect(-gt.h[0] * k, -gt.h[2] * k, gt.h[0] * 2 * k, gt.h[2] * 2 * k); g.restore(); }
    for (const s of E.spr) { g.fillStyle = /Notebooks\//.test(s.pai) && s.n == '_nbSprite' ? '#f00' : s.pai.startsWith('NPC/') ? '#0f0' : /Pickup/.test(s.pai) ? '#ff0' : null; if (g.fillStyle && (/Notebooks\//.test(s.pai) && s.n == '_nbSprite' || s.pai.startsWith('NPC/') || /Pickup/.test(s.pai))) { g.beginPath(); g.arc(X(s.M[12]), Z(s.M[14]), 5, 0, 7); g.fill(); } }
    const pl = E.esp.find((e) => e.s == 'PlayerScript').pos; g.fillStyle = '#0ff'; g.beginPath(); g.arc(X(pl[0]), Z(pl[2]), 7, 0, 7); g.fill();
    // caminhos do Baldi até cada caderno, saída e ponto de ronda
    const b = Jogo.G.npcs.baldi, alvos = [];
    for (const o of Jogo.G.objs) if (o.tipo == 'caderno' || o.tipo == 'item') alvos.push([o.x, o.z, o.tipo]);
    for (const r of E.ronda.concat(E.rondaCorr || [])) alvos.push([r[0], r[1], 'ronda']);
    for (const e of E.esp.filter((e) => e.s == 'EntranceScript')) alvos.push([e.pos[0], e.pos[2], 'saida']);
    const sem = alvos.filter((a) => !N.caminho(pl[0], pl[2], a[0], a[1]).length);
    document.body.innerHTML = ''; document.body.style.background = '#000'; cv.style.cssText = 'position:fixed;left:0;top:0;width:auto;height:100vh;z-index:99'; document.body.appendChild(cv);
    return { tam: [x1 - x0, z1 - z0], portas: E.portas.length, salas: E.gat.length, cadernos: Jogo.G.objs.filter((o) => o.tipo == 'caderno').length, total: Jogo.G.totalCadernos, alvos: alvos.length, semCaminho: sem };
  });
  console.log('planta:', JSON.stringify(info));
  await p.setViewportSize({ width: 900, height: 900 });
  await p.waitForTimeout(300); await p.screenshot({ path: out + '/planta.png' });
}
