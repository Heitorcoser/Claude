// Luta do Null: objetos para jogar aparecem perto do jogador, no corredor e no porão
export default async function (p, out) {
  const conta = () => p.evaluate(() => { const G = Jogo.G, B = G.null, P = Jogo.E.porao; return { total: B.objs.length, perto: B.objs.filter((o) => Math.hypot(o.x - G.p.x, o.z - G.p.z) < 35).length, porao: B.objs.filter((o) => o.x > P.OX - 6).length }; });
  await p.evaluate(() => { const G = Jogo.G, c = Jogo.E.rondaCorr[0]; G.null.espera = 1e9; G.p.x = c[0]; G.p.z = c[1]; });
  await p.waitForTimeout(8000);
  console.log('corredor:', JSON.stringify(await conta()));
  await p.screenshot({ path: out + '/obj_corredor.png' });
  await p.evaluate(() => { const G = Jogo.G, P = Jogo.E.porao, pt = P.pontos[Math.floor(P.pontos.length / 2)]; G.p.x = pt[0]; G.p.z = pt[1]; G.porao.longe = false; G.porao.cool = 1; });
  await p.waitForTimeout(8000);
  console.log('porão:', JSON.stringify(await conta()));
  await p.evaluate(() => { const G = Jogo.G, B = G.null, o = B.objs.filter((o) => o.x > Jogo.E.porao.OX - 6).sort((a, b) => Math.hypot(a.x - G.p.x, a.z - G.p.z) - Math.hypot(b.x - G.p.x, b.z - G.p.z))[0]; if (o) { const y = [0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => [a, Math.abs(Math.atan2(-(o.x - G.p.x), -(o.z - G.p.z)) - a)]).sort((a, b) => a[1] - b[1])[0][0]; G.p.x = o.x + Math.sin(y) * 7; G.p.z = o.z + Math.cos(y) * 7; G.p.yaw = Math.atan2(-(o.x - G.p.x), -(o.z - G.p.z)); } });
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/obj_porao.png' });
}
