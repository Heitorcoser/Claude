// Tamanhos: jato de BSODA, Dr. Reflex e The Test no chão, sala de aula na altura nova
export default async function (p, out) {
  await p.evaluate(() => { Jogo.spoop(); const G = Jogo.G; for (const k in G.npcs) if (!['reflex', 'test', 'baldi'].includes(k)) G.npcs[k].ativo = false; });
  const foto = async (n, f) => { await p.evaluate(f); await p.waitForTimeout(500); await p.screenshot({ path: out + '/t_' + n + '.png' }); };
  await foto('bsoda', () => { const G = Jogo.G; G.npcs.reflex.x = 500; G.npcs.test.x = 600; G.npcs.baldi.x = 700; G.npcs.baldi.cam = []; G.p.x = 5; G.p.z = -20; G.p.yaw = 0; G.item = [4, 0, 0]; G.sel = 0; Jogo.usaItem ? Jogo.usaItem() : document.getElementById('bUsa').dispatchEvent(new Event('pointerdown')); });
  await foto('reflex', () => { const G = Jogo.G, r = G.npcs.reflex; r.x = 5; r.z = -32; r.cam = []; r.estado = 'pega'; r.pausa = -99; G.p.x = 5; G.p.z = -15; G.p.yaw = 0; });
  await foto('test', () => { const G = Jogo.G, t = G.npcs.test; G.npcs.reflex.x = 500; t.x = 5; t.z = -32; t.olhado = 0; G.p.x = 5; G.p.z = -15; G.p.yaw = 0; });
  await foto('baldi', () => { const G = Jogo.G, b = G.npcs.baldi; G.npcs.test.x = 600; b.x = 5; b.z = -32; b.cam = []; b.mover = 99; G.p.x = 5; G.p.z = -15; G.p.yaw = 0; });
}
