// Null: o objeto vai para a mira (meio da tela) mesmo tocando no canto; ser pego fecha o jogo
export default async function (p, out) {
  await p.evaluate(() => (Jogo.G.null.espera = 1e9));
  await p.evaluate(() => (Jogo.G.p.yaw = 0.7)); await p.waitForTimeout(150);
  const r = await p.evaluate(() => { const G = Jogo.G, B = G.null; B.segurando = 'Texture2D/SchoolHouse/Billboards/Placements/Banana.png'; Jogo.toqueMundo(innerWidth * 0.9, innerHeight * 0.2, Jogo.camera); const v = B.voo[B.voo.length - 1]; return [+v.dx.toFixed(3), +v.dz.toFixed(3), +(-Math.sin(0.7)).toFixed(3), +(-Math.cos(0.7)).toFixed(3)]; });
  console.log('direcao [dx,dz] vs mira:', r);
  // olhando para trás: o objeto vai para trás
  await p.dispatchEvent('#bTras', 'pointerdown'); await p.waitForTimeout(200);
  const t = await p.evaluate(() => { const G = Jogo.G, B = G.null; B.segurando = 'Texture2D/SchoolHouse/Billboards/Placements/Banana.png'; Jogo.toqueMundo(innerWidth / 2, innerHeight / 2, Jogo.camera); const v = B.voo[B.voo.length - 1]; return +(v.dx * -Math.sin(G.p.yaw) + v.dz * -Math.cos(G.p.yaw)).toFixed(2); });
  await p.dispatchEvent('#bTras', 'pointerup');
  console.log('olhando para trás, direção vs frente (-1 = para trás):', t);
  await p.evaluate(() => { const G = Jogo.G, n = G.null.nul; G.null.espera = 0; n.tonto = 0; G.p.x = n.x + 1; G.p.z = n.z; });
  await p.waitForTimeout(700); await p.screenshot({ path: out + '/pego.png' });
  console.log('pegou:', await p.evaluate(() => [Jogo.G.fim, Jogo.G.null.fase]));
  await p.waitForTimeout(1300);
  console.log('tela preta:', await p.evaluate(() => !document.getElementById('hud')).catch(() => 'já recarregou'));
  await p.waitForTimeout(3000);
  await p.waitForFunction(() => window.Jogo && document.getElementById('titulo') && !Jogo.G, null, { timeout: 30000 }).catch(() => {});
  console.log('recarregou:', await p.evaluate(() => !!(window.Jogo && document.getElementById('titulo') && !Jogo.G)));
}
