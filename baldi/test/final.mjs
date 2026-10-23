// Final no mapa aleatório: pega todos os cadernos (acertando), passa por 3 saídas e sai pela 4ª
export default async function (p, out) {
  const tecla = (k) => p.evaluate((k) => document.querySelector(`#teclado button[data-k="${k}"]`).dispatchEvent(new PointerEvent('pointerdown')), k);
  await p.evaluate(() => { for (const n of Object.values(Jogo.G.npcs)) n.ativo = false; Jogo.invencivel = true; });
  const total = await p.evaluate(() => Jogo.G.totalCadernos);
  for (let c = 0; c < total; c++) {
    await p.evaluate(() => { const o = Jogo.G.objs.find((o) => o.tipo == 'caderno' && o.ativo); Jogo.pegaCaderno(o); });
    await p.waitForTimeout(200);
    for (let k = 0; k < 3; k++) { const sol = await p.evaluate(() => Jogo.contaSol()); for (const ch of String(sol)) await tecla(ch); await tecla('OK'); await p.waitForTimeout(120); }
    await p.waitForFunction(() => !Jogo.G.aprendendo, null, { timeout: 20000 });
    await p.evaluate(() => { for (const n of Object.values(Jogo.G.npcs)) n.ativo = false; });
  }
  console.log('final:', await p.evaluate(() => [Jogo.G.cadernos, Jogo.G.final]));
  const saidas = await p.evaluate(() => Jogo.E.esp.filter((e) => e.s == 'EntranceScript').map((e) => e.pos));
  for (let k = 0; k < saidas.length; k++) {
    const [x, , z] = saidas[k];
    await p.evaluate(([x, z]) => { const G = Jogo.G; G.p.x = x; G.p.z = z; Jogo.mundo.resolve(G.p, 1.7); }, [x, z]);
    await p.waitForTimeout(400);
    if (k == 3) {
      // a última: entra no vestíbulo até o gatilho de saída
      const g = await p.evaluate(([x, z]) => { const t = Jogo.E.gat.filter((g) => g.n == 'ExitTrigger').reduce((a, b) => (Math.hypot(b.c[0] - x, b.c[2] - z) < Math.hypot(a.c[0] - x, a.c[2] - z) ? b : a)); return t.c; }, [x, z]);
      await p.evaluate(([x, z]) => { const G = Jogo.G; G.p.x = x + (x - G.p.x) * 0; G.p.z = z; }, [g[0], g[2]]);
      await p.waitForTimeout(600);
    }
    console.log('saida', k + 1, await p.evaluate(() => [Jogo.G.saidas, Jogo.G.fim]));
  }
  await p.waitForTimeout(800);
  console.log('venceu:', await p.evaluate(() => [Jogo.G.fim, document.getElementById('fimTxt').textContent]));
}
