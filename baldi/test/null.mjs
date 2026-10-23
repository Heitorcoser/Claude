// Luta do Null (atalho boss do tester) + moeda do 1º caderno. Uso: JS='Jogo.testeNull="boss"' FEAT='{"mapa":true}'
export default async function (p, out) {
  const tecla = (k) => p.evaluate((k) => document.querySelector(`#teclado button[data-k="${k}"]`).dispatchEvent(new PointerEvent('pointerdown')), k);
  const digita = async (txt) => { for (const k of txt) await tecla(k); await tecla('OK'); await p.waitForTimeout(150); };
  const cad = () => p.evaluate(() => { const o = Jogo.G.objs.find((o) => o.tipo == 'caderno' && o.ativo); Jogo.pegaCaderno(o); });
  // 1º caderno: tudo certo (ganha a moeda do lado do Baldi)
  await cad(); await p.waitForTimeout(300);
  for (let k = 0; k < 3; k++) { const sol = await p.evaluate(() => Jogo.contaSol()); await digita(String(sol)); }
  await p.waitForFunction(() => !Jogo.G.aprendendo, null, { timeout: 15000 });
  console.log('moeda:', await p.evaluate(() => { const q = Jogo.G.objs.find((o) => o.tipo == 'item' && o.id == 5 && o.usado); const t = Jogo.G.tutor; return q ? [+q.x.toFixed(1), +q.z.toFixed(1), 'tutor', +t.position.x.toFixed(1), +t.position.z.toFixed(1)] : 'sem moeda'; }));
  await p.waitForTimeout(800);
  console.log('null:', await p.evaluate(() => [!!Jogo.G.null, Jogo.G.null && Jogo.G.null.fase, Object.values(Jogo.G.npcs).filter((n) => n.ativo).map((n) => n.nome).join(',')]));
  await p.evaluate(() => { const B = Jogo.G.null, n = B.nul, G = Jogo.G; G.p.x = n.x; G.p.z = n.z + 12; G.p.yaw = 0; });
  await p.waitForTimeout(600); await p.screenshot({ path: out + '/null_intro.png' });
  // joga 10 objetos nele (põe um objeto na mão, mira e joga)
  for (let k = 0; k < 10; k++) {
    await p.evaluate(() => { const G = Jogo.G, B = G.null, n = B.nul; B.segurando = 'Texture2D/SchoolHouse/Billboards/Placements/Banana.png'; n.tonto = 0; G.p.x = n.x; G.p.z = n.z + 9; G.p.yaw = 0; if (!Jogo.mundo.ve(G.p.x, G.p.z, n.x, n.z)) { G.p.z = n.z - 9; G.p.yaw = Math.PI; } if (!Jogo.mundo.ve(G.p.x, G.p.z, n.x, n.z)) { G.p.z = n.z; G.p.x = n.x + 9; G.p.yaw = -Math.PI / 2; } if (!Jogo.mundo.ve(G.p.x, G.p.z, n.x, n.z)) { G.p.x = n.x - 9; G.p.yaw = Math.PI / 2; } G.p.yaw = Math.atan2(-(n.x - G.p.x), -(n.z - G.p.z)); Jogo.toqueMundo(undefined, undefined, Jogo.camera); });
    await p.waitForTimeout(500);
    if (k == 3) await p.screenshot({ path: out + '/null_luta.png' });
  }
  console.log('acertos:', await p.evaluate(() => [Jogo.G.null.nul.acertos, Jogo.G.null.fase, Jogo.G.null.objs.length, Jogo.G.null.barreiras.length]));
  await p.waitForTimeout(7000);
  console.log('fim:', await p.evaluate(() => [Jogo.G.fim, document.getElementById('fimTxt').textContent]));
  await p.screenshot({ path: out + '/null_fim.png' });
}
