// 1st Prize: vira devagar, solta o jogador quando para
export default async function (p) {
  const r = await p.evaluate(async () => {
    const G = Jogo.G, pr = G.npcs.prize; Jogo.spoop();
    for (const n of Object.values(G.npcs)) if (n !== pr) n.ativo = false;
    G.p.x = 5; G.p.z = -60; pr.x = 5; pr.z = -30; pr.dir = Math.PI / 2; pr.ativo = true; pr.viu = false;
    const t0 = performance.now(); let virou = null, abracou = null, soltou = null;
    while (performance.now() - t0 < 15000) {
      await new Promise((r) => setTimeout(r, 50));
      const t = (performance.now() - t0) / 1000;
      if (virou == null && Math.abs(Math.atan2(Math.sin(pr.dir - Math.PI), Math.cos(pr.dir - Math.PI))) < 0.1) virou = t.toFixed(1);
      if (abracou == null && G.p.abracando > 0) abracou = t.toFixed(1);
      if (abracou != null && soltou == null && G.p.abracando <= 0) soltou = t.toFixed(1);
    }
    return { virou, abracou, soltou, vel: pr.vAtual.toFixed(1) };
  });
  console.log('prize:', JSON.stringify(r));
}
