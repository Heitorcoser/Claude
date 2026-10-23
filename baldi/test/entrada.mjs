// Teclado e mouse (controles de toque somem), mouse capturado no Android e aviso de versão nova
export default async function (p, out) {
  const toque = () => p.evaluate(() => document.getElementById('toque').hidden);
  console.log('início, toque escondido?', await toque());
  await p.keyboard.down('KeyW'); await p.waitForTimeout(600); await p.keyboard.up('KeyW');
  console.log('depois do W: toque escondido?', await toque(), 'andou:', await p.evaluate(() => Jogo.G.p.z.toFixed(1)));
  await p.touchscreen.tap(400, 300); await p.waitForTimeout(200);
  console.log('depois de tocar: toque escondido?', await toque());
  const y0 = await p.evaluate(() => Jogo.G.p.yaw);
  await p.evaluate(() => Jogo.mouseCap(200, 0, 0, 1)); await p.waitForTimeout(200);
  console.log('mouse nativo: giro', (await p.evaluate(() => Jogo.G.p.yaw) - y0).toFixed(2), 'slot', await p.evaluate(() => Jogo.G.sel), 'toque escondido?', await toque());
  // versão nova no GitHub (simulada)
  await p.route('**/versao.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ versao: '9.9', novidades: 'Teste', apk: 'BaldiModded.apk' }) }));
  await p.evaluate(() => { Jogo.menu(); return Jogo.confereAtualizacao(true); });
  await p.waitForTimeout(800);
  console.log('aviso de atualização:', await p.evaluate(() => [!document.getElementById('atualiza').hidden, document.getElementById('atualiza').textContent, document.getElementById('versaoTxt').textContent]));
  await p.screenshot({ path: out + '/menu_atualiza.png' });
  await p.route('**/versao.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ versao: '1.14', apk: 'BaldiModded.apk' }) }));
}
