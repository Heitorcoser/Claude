// Detenção no mapa aleatório: o jogador vai para dentro da diretoria e a porta trancada é a "Principal"
export default async function (p, out) {
  const r = await p.evaluate(async () => {
    const G = Jogo.G; Jogo.spoop(); G.npcs.diretor.detencao();
    await new Promise((r) => setTimeout(r, 500));
    const d = G.diretoria;
    return { naSala: !!Jogo.dentro('Office Trigger', G.p.x, G.p.z), porta: d.tex.f.split('/').pop(), trava: +d.trava.toFixed(0), travada: d.travada };
  });
  console.log('detencao:', JSON.stringify(r));
  await p.screenshot({ path: out + '/detencao_mapa.png' });
}
