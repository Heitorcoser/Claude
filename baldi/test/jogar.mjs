// Joga um pouco: pega um caderno, erra a conta, vê o Baldi vir. Usado com EXTRA=... node test/ver.mjs
export default async function (p, out) {
  const r = await p.evaluate(async () => {
    const G = Jogo.G, c = G.objs.find((o) => o.tipo == 'caderno');
    // fica de frente para o caderno, a 5 unidades
    const ang = Math.atan2(-(c.x - G.p.x), -(c.z - G.p.z));
    G.p.x = c.x + 0; G.p.z = c.z + 5; G.p.yaw = 0;
    document.getElementById('bToca').dispatchEvent(new PointerEvent('pointerdown'));
    await new Promise((r) => setTimeout(r, 600));
    return { aprendendo: G.aprendendo, cadernos: G.cadernos, pergunta: document.getElementById('pergunta').textContent };
  });
  console.log('caderno:', JSON.stringify(r));
  await p.screenshot({ path: out + '/b_conta.png' });
  // erra as 3 contas
  for (let k = 0; k < 3; k++) { await p.evaluate(() => { document.querySelector('#teclado img[alt="9"]').parentElement.dispatchEvent(new PointerEvent('pointerdown')); document.querySelector('#teclado img[alt="9"]').parentElement.dispatchEvent(new PointerEvent('pointerdown')); document.querySelector('#teclado img[alt="OK"]').parentElement.dispatchEvent(new PointerEvent('pointerdown')); }); await p.waitForTimeout(300); }
  await p.screenshot({ path: out + '/b_conta2.png' });
  await p.waitForTimeout(5500);
  const s = await p.evaluate(() => ({ aprendendo: Jogo.G.aprendendo, spoop: Jogo.G.spoop, baldi: [Jogo.G.npcs.baldi.x, Jogo.G.npcs.baldi.z, Jogo.G.npcs.baldi.ativo, Jogo.G.npcs.baldi.espera], npcs: Object.values(Jogo.G.npcs).map((n) => n.nome + ':' + n.ativo).join(',') }));
  console.log('depois:', JSON.stringify(s));
  // espera o Baldi vir (põe o jogador no corredor perto dele)
  await p.evaluate(() => { const b = Jogo.G.npcs.baldi; Jogo.G.p.x = b.x; Jogo.G.p.z = b.z + 40; Jogo.G.p.yaw = 0; });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out + '/b_baldi.png' });
  for (let k = 0; k < 6; k++) { await p.waitForTimeout(2000); const e = await p.evaluate(() => ({ d: Math.hypot(Jogo.G.npcs.baldi.x - Jogo.G.p.x, Jogo.G.npcs.baldi.z - Jogo.G.p.z).toFixed(1), fim: Jogo.G.fim, cam: Jogo.G.npcs.baldi.cam.length })); console.log('baldi', JSON.stringify(e)); if (e.fim) break; }
  await p.waitForTimeout(2500);
  await p.screenshot({ path: out + '/b_fim.png' });
}
