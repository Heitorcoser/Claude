// Orelhão e toca-fitas existem e funcionam (moeda no orelhão / fita no toca-fitas deixam o Baldi surdo)
export default async function (p) {
  const r = await p.evaluate(async () => {
    const G = Jogo.G; Jogo.spoop();
    const fone = G.objs.find((o) => o.tipo == 'telefone'), toca = G.objs.find((o) => o.tipo == 'fita');
    const usa = async (o, id) => { G.p.x = o.x; G.p.z = o.z + 4; G.p.yaw = 0; Jogo.mundo.resolve(G.p, 1.7); G.p.yaw = Math.atan2(-(o.x - G.p.x), -(o.z - G.p.z)); G.item = [id, 0, 0]; G.sel = 0; G.npcs.baldi.surdo = 0; document.getElementById('bUsa').dispatchEvent(new Event('pointerdown')); await new Promise((r) => setTimeout(r, 200)); return G.npcs.baldi.surdo > 0; };
    return { fone: !!fone, toca: !!toca, foneFunciona: fone ? await usa(fone, 5) : null, tocaFunciona: toca ? await usa(toca, 6) : null };
  });
  console.log('fone:', JSON.stringify(r));
}
