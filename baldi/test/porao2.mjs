// Porão com as texturas novas; na luta do Null ele desce atrás do jogador e aparecem objetos lá embaixo
export default async function (p, out) {
  await p.evaluate(() => { const G = Jogo.G, [x, z] = Jogo.E.porao.entrada; G.null.espera = 1e9; G.p.x = x; G.p.z = z; G.porao.longe = false; G.porao.cool = 1; G.p.yaw = Math.PI / 2; });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/porao_novo.png' });
  await p.evaluate(() => { const G = Jogo.G, d = G.portas.find((d) => d.tex.f.includes('MysteryDoor')); if (d) { G.p.x = d.x - 7; G.p.z = d.z; G.p.yaw = -Math.PI / 2; } });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/porta_porao.png' });
  // anda um pouco no labirinto e solta o Null
  await p.evaluate(() => { const G = Jogo.G, pt = Jogo.E.porao.pontos[Math.floor(Jogo.E.porao.pontos.length / 2)]; G.p.x = pt[0]; G.p.z = pt[1]; G.null.espera = 0; G.null.nul.tonto = 0; Jogo.G.p.est = 100; });
  const ini = await p.evaluate(() => [Jogo.G.null.nul.x > Jogo.E.porao.OX - 6]);
  let desceu = false;
  for (let k = 0; k < 30 && !desceu; k++) { await p.waitForTimeout(1000); desceu = await p.evaluate(() => Jogo.G.null && Jogo.G.null.nul.x > Jogo.E.porao.OX - 6).catch(() => true); }
  console.log('null começou no porão:', ini[0], 'desceu:', desceu);
  await p.evaluate(() => { const B = Jogo.G.null; B.proxObj = 0; }).catch(() => {});
  await p.waitForTimeout(400);
  console.log('objetos no porão:', await p.evaluate(() => Jogo.G.null.objs.filter((o) => o.x > Jogo.E.porao.OX - 6).length).catch((e) => e.message));
}
