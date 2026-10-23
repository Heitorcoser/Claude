// Partida especial: portas viram a saída errada, a porta certa traz o Null, 2º discurso e a luta
export default async function (p, out) {
  const info = await p.evaluate(() => { const S = Jogo.G.especialNull; return { S: !!S, certa: !!(S && S.certa && S.certa.porta), npcs: Object.values(Jogo.G.npcs).filter((n) => n.ativo).length, cadernos: Jogo.G.objs.filter((o) => o.tipo == 'caderno' && o.ativo).length }; });
  console.log('especial:', JSON.stringify(info));
  // encosta numa porta errada
  const r = await p.evaluate(() => { const G = Jogo.G, S = G.especialNull; const d = G.portas.find((d) => d !== S.certa.porta && d.tipo != 'vaivem'); Jogo.abrePorta(d, 'jogador'); return [d.bugada, d.tex.f, d.aberta]; });
  console.log('porta errada:', JSON.stringify(r));
  await p.evaluate(() => { const G = Jogo.G, d = G.portas.find((d) => d.bugada); const vz = Jogo.mundo.livre ? 0 : 0; G.p.x = d.x + 5; G.p.z = d.z; Jogo.mundo.resolve(G.p, 1.7); if (Math.hypot(G.p.x - d.x - 5, G.p.z - d.z) > 0.5) { G.p.x = d.x; G.p.z = d.z + 5; Jogo.mundo.resolve(G.p, 1.7); } G.p.yaw = Math.atan2(-(d.x - G.p.x), -(d.z - G.p.z)); });
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/porta_bugada.png' });
  // porta certa
  await p.evaluate(() => { const G = Jogo.G, S = G.especialNull; Jogo.abrePorta(S.certa.porta, 'jogador'); });
  await p.waitForTimeout(300);
  console.log('fase:', await p.evaluate(() => Jogo.G.especialNull.fase));
  await p.evaluate(() => { const G = Jogo.G, S = G.especialNull, [x, z] = S.certa.centro; G.p.x = S.certa.porta.x; G.p.z = S.certa.porta.z; G.p.yaw = Math.atan2(-(x - G.p.x), -(z - G.p.z)); });
  await p.waitForTimeout(1500); await p.screenshot({ path: out + '/discurso2.png' });
  console.log('discurso2:', await p.evaluate(() => [Jogo.G.especialNull.fase, document.getElementById('aviso').textContent]));
  // pula a fala longa e espera o grito e a luta
  await p.evaluate(() => Motor.paraTudo());
  await p.waitForTimeout(6000); await p.screenshot({ path: out + '/grito.png' });
  await p.waitForTimeout(9500);
  console.log('luta:', await p.evaluate(() => [Jogo.G.especialNull.fase, !!Jogo.G.null, localStorage.getItem('baldiNull')]));
  await p.screenshot({ path: out + '/luta.png' });
}
