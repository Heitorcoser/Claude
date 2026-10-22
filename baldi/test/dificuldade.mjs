// Detenção com tempo na tela, empurrão do 1st Prize contra a parede e dificuldade
export default async function (p, out) {
  await p.evaluate(() => { Jogo.spoop(); Jogo.G.npcs.diretor.detencao(); });
  await p.waitForTimeout(1500); await p.screenshot({ path: out + '/detencao.png' });
  console.log('detenção:', await p.evaluate(() => [document.getElementById('detencao').hidden, document.getElementById('detencao').textContent]));
  // 1st Prize abraça e empurra o jogador contra uma parede do corredor (paredes em x = 0 e x = 10 no início)
  const r = await p.evaluate(async () => {
    const G = Jogo.G, pr = G.npcs.prize, ruins = [];
    for (const [x, z, vx, vz] of [[5, -20, -60, 0], [5, -20, 60, 0], [5, -60, -40, 25]]) {
      G.p.x = x; G.p.z = z; G.p.abracando = 1; G.p.abraco = pr; G.p.botas = 0;
      pr.x = x + vx / 60; pr.z = z; pr.vx = vx; pr.vz = vz; pr.dir = Math.atan2(vx, vz); pr.cam = [];
      const a = [G.p.x, G.p.z];
      for (let k = 0; k < 40; k++) { pr.x += vx / 60; pr.z += vz / 60; G.p.abracando = 1; await new Promise((r) => setTimeout(r, 16)); }
      if (!Jogo.mundo.ve(a[0], a[1], G.p.x, G.p.z, true)) ruins.push([a, [G.p.x.toFixed(1), G.p.z.toFixed(1)]]);
    }
    return ruins;
  });
  console.log('atravessou parede:', JSON.stringify(r));
  console.log('dificuldade:', await p.evaluate(() => Jogo.G.dif.nome));
}
