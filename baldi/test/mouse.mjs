// Mouse preso: no caderno ele continua preso e usa um cursor desenhado; e as janelas com a vista de fora
export default async function (p, out) {
  // finge o app Android (captura nativa)
  await p.evaluate(() => { let cap = false; window.Android = { capturaMouse: (on) => (cap = on), mouseCapturado: () => cap }; });
  await p.evaluate(() => Jogo.mouseCap(0, 0, 0, 0)); // mouse ligado: modo teclado
  await p.mouse.click(400, 300); await p.waitForTimeout(200);
  console.log('preso depois do clique:', await p.evaluate(() => window.Android.mouseCapturado()));
  await p.evaluate(() => { const o = Jogo.G.objs.find((o) => o.tipo == 'caderno' && o.ativo); Jogo.pegaCaderno(o); });
  await p.waitForTimeout(400);
  console.log('no caderno, continua preso:', await p.evaluate(() => [window.Android.mouseCapturado(), !document.getElementById('cursorMat').hidden]));
  // leva o cursor até a tecla 7 e clica
  const alvo = await p.evaluate(() => { const r = document.querySelector('#teclado button[data-k="7"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const cur = await p.evaluate(() => [innerWidth / 2, innerHeight * 0.6]);
  await p.evaluate(([dx, dy]) => Jogo.mouseCap(dx, dy, 0, 0), [alvo[0] - cur[0] - 2, alvo[1] - cur[1] - 2]);
  await p.evaluate(() => Jogo.mouseCap(0, 0, 1, 0));
  await p.waitForTimeout(200); await p.screenshot({ path: out + '/cursor_caderno.png' });
  console.log('digitou com o cursor:', await p.evaluate(() => document.getElementById('resp').textContent));
  // pausa solta, continuar prende de novo
  await p.evaluate(() => { for (let k = 0; k < 3; k++) document.querySelector('#teclado button[data-k="OK"]').dispatchEvent(new PointerEvent('pointerdown')); });
  await p.waitForFunction(() => !Jogo.G.aprendendo, null, { timeout: 20000 });
  await p.evaluate(() => Jogo.pausa(true));
  console.log('pausado, preso?', await p.evaluate(() => window.Android.mouseCapturado()));
  await p.evaluate(() => Jogo.pausa(false));
  console.log('continuou, preso?', await p.evaluate(() => window.Android.mouseCapturado()));
  // janela do mapa aleatório
  const j = await p.evaluate(() => { const E = Jogo.E, k = E.mats.findIndex((m) => m.n == 'JanelaFora'); const o = E.objs.find((o) => o.mat && o.mat[0] == k); if (!o) return null; const M = o.M, G = Jogo.G; G.p.x = M[12] + M[8] * 7; G.p.z = M[14] + M[10] * 7; Jogo.mundo.resolve(G.p, 1.7); G.p.yaw = Math.atan2(M[8], M[10]); return [M[12], M[14]]; });
  console.log('janela:', JSON.stringify(j));
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/janela.png' });
}
