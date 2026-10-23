// Dr. Reflex (teste no próprio personagem, preso, martelo da clínica), Cloudy Copter e The Test
export default async function (p, out) {
  await p.evaluate(() => { Jogo.spoop(); const G = Jogo.G; for (const k of ['baldi', 'diretor', 'playtime', 'sweep', 'prize', 'bully', 'crafters']) if (G.npcs[k]) { G.npcs[k].ativo = false; if (G.npcs[k].spr) G.npcs[k].spr.visible = false; } });
  const poe = () => p.evaluate(() => { const G = Jogo.G, r = G.npcs.reflex; G.p.x = 5; G.p.z = -20; G.p.yaw = 0; r.x = 5; r.z = -40; r.dir = 0; r.vx = r.vz = 0; r.cool = 0; r.estado = 'anda'; r.cam = []; r.spr.material.color.setRGB(1, 1, 1); G.npcs.test.x = 500; G.npcs.cloudy.x = 500; G.npcs.cloudy.sopra = 0; });
  await poe();
  await p.waitForFunction(() => Jogo.G.npcs.reflex.estado == 'teste', null, { timeout: 10000 }).catch(() => {});
  console.log('reflex estado:', await p.evaluate(() => Jogo.G.npcs.reflex.estado));
  await p.waitForFunction(() => Jogo.testeReflexo.fase == 'espera', null, { timeout: 8000 }).catch(() => {});
  await p.screenshot({ path: out + '/reflexo.png' });
  // toca na mão certa, no próprio sprite
  const alvo = await p.evaluate(() => {
    const t = Jogo.testeReflexo, s = t.dr.spr, v = new THREE.Vector3(t.lado ? 0.3 : -0.3, 0.15, 0).applyMatrix4(s.matrixWorld).project(Jogo.camera);
    return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight];
  });
  await p.evaluate(([x, y]) => Jogo.toqueMundo(x, y, Jogo.camera), alvo);
  await p.waitForTimeout(300);
  console.log('depois do toque:', await p.evaluate(() => [Jogo.G.npcs.reflex.estado, Jogo.testeReflexo.erros]));
  // puxado para fora do teste: ele busca o martelo na clínica
  await poe();
  await p.waitForFunction(() => Jogo.G.npcs.reflex.estado == 'teste', null, { timeout: 10000 }).catch(() => {});
  // sai andando do teste
  await p.evaluate(() => { Jogo.G.p.yaw = 0; Jogo.ent.mz = -1; }); await p.waitForTimeout(1800); await p.evaluate(() => (Jogo.ent.mz = 0));
  console.log('saiu andando:', await p.evaluate(() => [Jogo.G.npcs.reflex.estado, Jogo.G.p.z.toFixed(1), JSON.stringify(Jogo.G.npcs.reflex.casa)]));
  await p.evaluate(() => { const r = Jogo.G.npcs.reflex; r.x = r.casa[0] + 1; r.z = r.casa[1]; r.cam = []; });
  await p.waitForFunction(() => Jogo.G.npcs.reflex.estado == 'martelo', null, { timeout: 8000 }).catch(() => {});
  console.log('na clínica:', await p.evaluate(() => Jogo.G.npcs.reflex.estado));
  await p.evaluate(() => { const r = Jogo.G.npcs.reflex, G = Jogo.G; r.x = G.p.x; r.z = G.p.z - 15; r.cam = []; });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/martelo.png' });
  await p.waitForFunction(() => Jogo.G.p.esmagado > 0, null, { timeout: 15000 }).catch(() => {});
  console.log('esmagado:', await p.evaluate(() => [Jogo.G.npcs.reflex.estado, +(Jogo.G.p.esmagado || 0).toFixed(1)]));
  // vento: andando contra volta, correndo contra avança devagar
  await p.evaluate(() => { const G = Jogo.G, c = G.npcs.cloudy; G.npcs.reflex.ativo = false; G.npcs.reflex.spr.visible = false; G.p.esmagado = 0; c.x = 5; c.z = -10; c.cam = []; c.sopra = 0; c.prox = 0; G.p.x = 5; G.p.z = -30; G.p.yaw = Math.PI; G.p.est = 100; });
  await p.waitForTimeout(400);
  const v0 = await p.evaluate(() => Jogo.G.p.z); await p.evaluate(() => (Jogo.ent.mz = 1)); await p.waitForTimeout(1000);
  const v1 = await p.evaluate(() => Jogo.G.p.z); await p.evaluate(() => (Jogo.ent.corre = true)); await p.waitForTimeout(1000);
  const v2 = await p.evaluate(() => Jogo.G.p.z); await p.evaluate(() => { Jogo.ent.mz = 0; Jogo.ent.corre = false; });
  console.log('vento: andando contra', (v1 - v0).toFixed(1), 'correndo contra', (v2 - v1).toFixed(1));
  await p.screenshot({ path: out + '/vento.png' });
  // The Test
  await p.evaluate(() => { const G = Jogo.G, t = G.npcs.test; G.npcs.cloudy.sopra = 0.01; G.p.x = 5; G.p.z = -20; G.p.yaw = 0; t.x = 5; t.z = -45; });
  await p.waitForTimeout(2500); await p.screenshot({ path: out + '/test.png' });
  console.log('test olhando:', await p.evaluate(() => [Jogo.G.escala.toFixed(2), Jogo.G.npcs.test.olhado.toFixed(1)]));
}
