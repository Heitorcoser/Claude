// O Bully aparece no corredor, com os pés no chão, e pega um item
export default async function (p, out) {
  await p.evaluate(() => { Jogo.spoop(); const G = Jogo.G; for (const n of Object.values(G.npcs)) if (n.nome != 'Bully') { n.ativo = false; if (n.spr) n.spr.visible = false; } Jogo.invencivel = true; G.item[0] = 4; Jogo.atualizaHud(); G.npcs.bully.espera = 0; });
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const b = Jogo.G.npcs.bully, G = Jogo.G; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (Jogo.mundo.raio(b.x, b.z, dx, dz, 20) > 12) { G.p.x = b.x + dx * 10; G.p.z = b.z + dz * 10; G.p.yaw = Math.atan2(dx, dz); break; } return [b.ativo, b.spr.visible, +b.spr.position.y.toFixed(2)]; });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/bully.png' });
  console.log('bully [ativo, visível, y]:', JSON.stringify(r));
  await p.evaluate(() => { const b = Jogo.G.npcs.bully, G = Jogo.G; G.p.x = b.x + 3; G.p.z = b.z; });
  await p.waitForTimeout(800);
  console.log('item depois de encostar:', await p.evaluate(() => [Jogo.G.item.join(','), Jogo.G.npcs.bully.ativo]));
}
