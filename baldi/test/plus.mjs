// Novidades do Beta (Baldi's Basics Plus): salas, porta de 1 direção, pontos, loja, Beans, Chalkles, Mrs. Pomp
export default async function (p, out) {
  const info = await p.evaluate(() => {
    const G = Jogo.G;
    return { salas: G.salas.length, aulas: G.salas.filter((s) => s.aula).length, umaDir: G.portas.filter((d) => d.umaDir).length, mais: G.objs.filter((o) => o.tipo == 'mais').length,
      loja: !!(G.loja && G.loja.fora), itensLoja: G.objs.filter((o) => o.tipo == 'loja').length, beans: !!G.npcs.beans, pomp: !!G.npcs.pomp, chalkles: !!(G.chalkles && G.chalkles.sala), pontos: document.getElementById('pontos').textContent };
  });
  console.log('info:', JSON.stringify(info));
  // ativa todo mundo (como depois do primeiro erro)
  await p.evaluate(() => { Jogo.spoop(); for (const n of Object.values(Jogo.G.npcs)) if (n.nome != 'Beans' && n.nome != 'Mrs. Pomp') { n.ativo = false; if (n.spr) n.spr.visible = false; } Jogo.invencivel = true; });
  // pontos: pega um símbolo de mais
  const r1 = await p.evaluate(() => { const G = Jogo.G, o = G.objs.find((o) => o.tipo == 'mais'); G.p.x = o.x; G.p.z = o.z; return o.valor; });
  await p.waitForTimeout(300);
  console.log('mais de', r1, '->', await p.evaluate(() => Jogo.G.pontos));
  await p.evaluate(() => Jogo.ganhaPontos(400, 'teste'));
  // entra na loja pela porta do corredor
  await p.evaluate(() => { const G = Jogo.G, f = G.loja.fora; G.p.x = f.sai[0]; G.p.z = f.sai[1]; G.p.yaw = f.yaw + Math.PI; });
  await p.waitForTimeout(400); await p.screenshot({ path: out + '/loja_porta.png' });
  await p.evaluate(() => { const G = Jogo.G, f = G.loja.fora; G.p.x = f.sai[0] + (f.sai[0] - f.x) * 3; G.p.z = f.sai[1] + (f.sai[1] - f.z) * 3; });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const G = Jogo.G, f = G.loja.fora; G.p.x = f.x; G.p.z = f.z; });
  await p.waitForTimeout(1000);
  console.log('dentro da loja:', await p.evaluate(() => Jogo.G.loja.dentro));
  await p.evaluate(() => { Jogo.G.p.yaw = 0; }); await p.waitForTimeout(300); await p.screenshot({ path: out + '/loja.png' });
  // compra o produto da mesa da esquerda
  const compra = await p.evaluate(() => { const G = Jogo.G, o = G.objs.find((o) => o.tipo == 'loja'); G.p.x = o.x + 6; G.p.z = o.z; G.p.yaw = Math.PI / 2; const antes = G.pontos; Jogo.compra(o); return [Jogo.ITEM[o.id], o.preco, antes, G.pontos, G.item.join(',')]; });
  console.log('compra:', JSON.stringify(compra));
  await p.waitForTimeout(300); await p.screenshot({ path: out + '/loja_mesa.png' });
  // sai da loja
  await p.evaluate(() => { const L = Jogo.E.loja, G = Jogo.G; G.p.x = L.saida[0]; G.p.z = L.saida[1] - 8; });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const L = Jogo.E.loja, G = Jogo.G; G.p.x = L.saida[0]; G.p.z = L.saida[1] - 1.8; });
  await p.waitForTimeout(500);
  console.log('saiu da loja:', await p.evaluate(() => !Jogo.G.loja.dentro && Math.hypot(Jogo.G.p.x - Jogo.G.loja.fora.sai[0], Jogo.G.p.z - Jogo.G.loja.fora.sai[1]) < 1));
  // porta de 1 direção: do lado errado não passa
  const ud = await p.evaluate(() => {
    const G = Jogo.G, d = G.portas.find((d) => d.umaDir); if (!d) return 'sem porta';
    G.cadernos = Math.max(G.cadernos, 2); // as amarelas destrancam com 2 cadernos
    G.p.x = d.x + d.umaDir[0] * 4; G.p.z = d.z + d.umaDir[1] * 4; G.p.yaw = Math.atan2(d.umaDir[0], d.umaDir[1]); // do lado vermelho, olhando para a porta
    return [d.x, d.z, d.umaDir];
  });
  await p.waitForTimeout(300); await p.screenshot({ path: out + '/porta_errado.png' });
  await p.evaluate(() => (Jogo.ent.mz = 1)); await p.waitForTimeout(1500); await p.evaluate(() => (Jogo.ent.mz = 0));
  const lado1 = await p.evaluate(() => { const G = Jogo.G, d = G.portas.find((d) => d.umaDir); return +((G.p.x - d.x) * d.umaDir[0] + (G.p.z - d.z) * d.umaDir[1]).toFixed(1); });
  await p.evaluate(() => { const G = Jogo.G, d = G.portas.find((d) => d.umaDir); G.p.x = d.x - d.umaDir[0] * 4; G.p.z = d.z - d.umaDir[1] * 4; G.p.yaw = Math.atan2(-d.umaDir[0], -d.umaDir[1]); });
  await p.waitForTimeout(300); await p.screenshot({ path: out + '/porta_certo.png' });
  await p.evaluate(() => (Jogo.ent.mz = 1)); await p.waitForTimeout(1500); await p.evaluate(() => (Jogo.ent.mz = 0));
  const lado2 = await p.evaluate(() => { const G = Jogo.G, d = G.portas.find((d) => d.umaDir); return +((G.p.x - d.x) * d.umaDir[0] + (G.p.z - d.z) * d.umaDir[1]).toFixed(1); });
  console.log('porta 1 direção', JSON.stringify(ud), 'lado vermelho -> depois de andar (positivo = não passou):', lado1, '| lado verde -> depois (positivo = passou):', lado2);
  // Beans cospe no jogador
  const bn = await p.evaluate(() => { const G = Jogo.G, b = G.npcs.beans, c = Jogo.E.ronda[0]; G.p.x = c[0]; G.p.z = c[1]; b.ativa(); b.x = c[0] + 0.01; b.z = c[1]; b.cool = 0; b.estado = 'anda'; return [b.x, b.z]; });
  // coloca o Beans a 15 no corredor, com visão
  await p.evaluate(() => { const G = Jogo.G, b = G.npcs.beans; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (Jogo.mundo.raio(G.p.x, G.p.z, dx, dz, 30) > 20) { b.x = G.p.x + dx * 18; b.z = G.p.z + dz * 18; b.cam = []; G.p.yaw = Math.atan2(-dx, -dz); return; } } });
  await p.waitForTimeout(1000); await p.screenshot({ path: out + '/beans.png' });
  await p.waitForTimeout(2500);
  console.log('chiclete:', await p.evaluate(() => [Jogo.G.npcs.beans.estado, +(Jogo.G.p.chiclete || 0).toFixed(1), !document.getElementById('chicleteTela').hidden]));
  await p.screenshot({ path: out + '/chiclete.png' });
  await p.evaluate(() => { Jogo.G.p.chiclete = 0; Jogo.G.npcs.beans.ativo = false; Jogo.G.npcs.beans.spr.visible = false; });
  // Chalkles: fica 15 s na sala dele
  await p.evaluate(() => { const G = Jogo.G, C = G.chalkles, [cx, cz] = C.sala.centro; G.p.x = cx; G.p.z = cz; Jogo.mundo.resolve(G.p, 1.7); C.carga = 13; const q = C.quadro.position; G.p.yaw = Math.atan2(-(q.x - G.p.x), -(q.z - G.p.z)); });
  await p.waitForTimeout(800); await p.screenshot({ path: out + '/chalkles_quadro.png' });
  await p.waitForTimeout(1800);
  console.log('chalkles:', await p.evaluate(() => [Jogo.G.chalkles.fase, Jogo.G.chalkles.sala.portas.map((d) => +d.trava.toFixed(0)).join(',')]));
  await p.screenshot({ path: out + '/chalkles_solto.png' });
  // Mrs. Pomp: convida e você chega a tempo
  await p.evaluate(() => { const G = Jogo.G, P2 = G.npcs.pomp, c = Jogo.E.ronda[0]; G.p.x = c[0]; G.p.z = c[1]; P2.ativa(); P2.x = c[0]; P2.z = c[1]; P2.cool = 0; P2.convida(); });
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/pomp_convite.png' });
  console.log('pomp:', await p.evaluate(() => [Jogo.G.npcs.pomp.estado, document.getElementById('pompT').textContent]));
  const antes = await p.evaluate(() => Jogo.G.pontos);
  await p.evaluate(() => { const G = Jogo.G, [cx, cz] = G.pomp.sala.centro; G.p.x = cx; G.p.z = cz; Jogo.mundo.resolve(G.p, 1.7); });
  await p.waitForTimeout(400);
  console.log('chegou a tempo: pontos', antes, '->', await p.evaluate(() => [Jogo.G.pontos, !!Jogo.G.pomp]));
  // atrasado: ela te arrasta
  await p.evaluate(() => { const G = Jogo.G, P2 = G.npcs.pomp, c = Jogo.E.ronda[0]; G.p.x = c[0]; G.p.z = c[1]; P2.x = c[0] + 3; P2.z = c[1]; P2.convida(); G.pomp.t = 0.1; });
  await p.waitForTimeout(1500);
  console.log('atrasado:', await p.evaluate(() => [Jogo.G.npcs.pomp.estado, document.getElementById('pompT').textContent]));
  for (let k = 0; k < 20; k++) { await p.waitForTimeout(1000); const e = await p.evaluate(() => Jogo.G.npcs.pomp.estado); if (e == 'licao') break; }
  console.log('arrastado:', await p.evaluate(() => [Jogo.G.npcs.pomp.estado, Jogo.G.pomp && Jogo.G.pomp.sala.tem(Jogo.G.p.x, Jogo.G.p.z), document.getElementById('pompT').textContent]));
}
