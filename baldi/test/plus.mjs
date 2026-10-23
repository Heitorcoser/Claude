// Dr. Reflex, Cloudy Copter e The Test
export default async function (p, out) {
  await p.evaluate(() => { Jogo.spoop(); const G = Jogo.G; for (const k of ['baldi', 'diretor', 'playtime', 'sweep', 'prize', 'bully', 'crafters']) if (G.npcs[k]) { G.npcs[k].ativo = false; if (G.npcs[k].spr) G.npcs[k].spr.visible = false; } });
  // Dr. Reflex na frente do jogador, olhando para ele
  await p.evaluate(() => { const G = Jogo.G, r = G.npcs.reflex; G.p.x = 5; G.p.z = -20; G.p.yaw = 0; r.x = 5; r.z = -40; r.dir = Math.PI; r.vx = r.vz = 0; r.cool = 0; r.estado = 'anda'; r.cam = []; G.npcs.test.x = 500; G.npcs.cloudy.x = 500; });
  await p.waitForFunction(() => Jogo.G.npcs.reflex.estado == 'teste', null, { timeout: 8000 }).catch(() => {});
  console.log('reflex estado:', await p.evaluate(() => Jogo.G.npcs.reflex.estado));
  await p.waitForFunction(() => Jogo.testeReflexo.fase == 'espera', null, { timeout: 8000 }).catch(() => {});
  await p.screenshot({ path: out + '/reflexo.png' });
  const lado = await p.evaluate(() => Jogo.testeReflexo.lado);
  await p.mouse.click(lado ? 700 : 200, 200);
  await p.waitForTimeout(300);
  console.log('depois do toque:', await p.evaluate(() => [Jogo.G.npcs.reflex.estado, document.getElementById('reflexo').hidden]));
  // martelo: fugir do teste
  await p.evaluate(() => { const r = Jogo.G.npcs.reflex; r.cool = 0; r.estado = 'teste'; Jogo.testeReflexo.comeca(r); Jogo.G.p.z = -5; });
  await p.waitForFunction(() => Jogo.G.npcs.reflex.estado == 'bravo', null, { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(800); await p.screenshot({ path: out + '/martelo.png' });
  await p.waitForFunction(() => Jogo.G.p.esmagado > 0, null, { timeout: 15000 }).catch(() => {});
  console.log('esmagado:', await p.evaluate(() => [Jogo.G.npcs.reflex.estado, +(Jogo.G.p.esmagado || 0).toFixed(1)]));
  // Cloudy Copter soprando no corredor
  await p.evaluate(() => { const G = Jogo.G, c = G.npcs.cloudy; G.npcs.reflex.ativo = false; G.npcs.reflex.spr.visible = false; G.p.esmagado = 0; c.x = 5; c.z = -10; c.cam = []; c.sopra = 0; c.prox = 0; G.p.x = 5; G.p.z = -30; G.p.yaw = Math.PI; });
  await p.waitForTimeout(400);
  const z0 = await p.evaluate(() => [Jogo.G.npcs.cloudy.dirV, Jogo.G.npcs.cloudy.alcance, Jogo.G.p.z]);
  await p.waitForTimeout(1000); await p.screenshot({ path: out + '/vento.png' });
  console.log('vento:', JSON.stringify(z0), 'z agora', await p.evaluate(() => Jogo.G.p.z.toFixed(1)));
  // The Test
  await p.evaluate(() => { const G = Jogo.G, t = G.npcs.test; G.npcs.cloudy.sopra = 0.01; G.p.x = 5; G.p.z = -20; G.p.yaw = 0; t.x = 5; t.z = -45; });
  await p.waitForTimeout(2500); await p.screenshot({ path: out + '/test.png' });
  console.log('test olhando:', await p.evaluate(() => [Jogo.G.escala.toFixed(2), Jogo.G.npcs.test.olhado.toFixed(1)]));
  await p.waitForTimeout(9000);
  console.log('test depois:', await p.evaluate(() => [Jogo.G.escala.toFixed(2), Jogo.G.npcs.test.morto]));
  await p.waitForTimeout(300); await p.screenshot({ path: out + '/test_explodiu.png' });
}
