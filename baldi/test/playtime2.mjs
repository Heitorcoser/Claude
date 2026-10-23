// Playtime: depois da corda, espera 20 s antes de pegar de novo
export default async function (p) {
  const r = await p.evaluate(async () => {
    const G = Jogo.G, dorme = (ms) => new Promise((r) => setTimeout(r, ms)); Jogo.spoop(); for (const k in G.npcs) if (k != 'playtime') G.npcs[k].ativo = false;
    const pt = G.npcs.playtime, junto = () => { pt.x = G.p.x; pt.z = G.p.z - 2.5; pt.cam = []; };
    junto(); await dorme(400); const pegou1 = G.p.corda;
    G.p.x += 3; await dorme(300); const saiu = !G.p.corda;            // sai andando (fim da corda)
    const t0 = G.t; let repegou = null;
    while (G.t - t0 < 24) { junto(); await dorme(250); if (G.p.corda) { repegou = +(G.t - t0).toFixed(1); break; } }
    return { pegou1, saiu, triste: pt.triste > 0, repegouDepois: repegou };
  });
  console.log('playtime2:', JSON.stringify(r));
}
