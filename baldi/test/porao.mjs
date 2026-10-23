// Porão: escada leva ao porão, sala secreta com a fita verde, fita no toca-fitas, 1º discurso do Null
export default async function (p, out) {
  const info = await p.evaluate(() => ({ porao: !!Jogo.E.porao, sala: !!(Jogo.E.porao && Jogo.E.porao.sala) }));
  console.log('porao:', JSON.stringify(info));
  // desce pela escada
  await p.evaluate(() => { const G = Jogo.G, [x, z] = Jogo.E.porao.escada; for (const n of Object.values(G.npcs)) n.ativo = false; G.p.x = x + 6; G.p.z = z; });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const G = Jogo.G, [x, z] = Jogo.E.porao.escada; G.p.x = x; G.p.z = z; });
  await p.waitForTimeout(500);
  console.log('desceu:', await p.evaluate(() => { const G = Jogo.G, [bx, bz] = Jogo.E.porao.entrada; return [+Math.hypot(G.p.x - bx, G.p.z - bz).toFixed(1), !!Jogo.cena.fog]; }));
  await p.evaluate(() => { const G = Jogo.G; G.p.yaw = Math.PI; }); await p.waitForTimeout(400); await p.screenshot({ path: out + '/porao.png' });
  // vai até a porta misteriosa e entra na sala
  const porta = await p.evaluate(() => { const d = Jogo.G.portas.find((d) => d.tex.f.includes('MysteryDoor')); return [d.x, d.z]; });
  await p.evaluate(([x, z]) => { const G = Jogo.G; G.p.x = x - 8; G.p.z = z; G.p.yaw = -Math.PI / 2; }, porta);
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/porta_misteriosa.png' });
  await p.evaluate(() => document.getElementById('bToca').dispatchEvent(new Event('pointerdown'))); // abre a porta
  await p.waitForTimeout(300);
  // pega a fita verde (na mesa)
  await p.evaluate(() => { const G = Jogo.G, [sx, sz] = Jogo.E.porao.sala; G.p.x = sx - 6; G.p.z = sz; G.p.yaw = -Math.PI / 2; });
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/sala_secreta.png' });
  await p.evaluate(() => document.getElementById('bToca').dispatchEvent(new Event('pointerdown')));
  await p.waitForTimeout(300);
  console.log('pegou fita:', await p.evaluate(() => [Jogo.G.item.join(','), document.getElementById('nomeItem').textContent]));
  // volta para a escola e usa no toca-fitas
  const toca = await p.evaluate(() => { const o = Jogo.G.objs.find((o) => o.tipo == 'fita'); return [o.x, o.z]; });
  await p.evaluate(([x, z]) => { const G = Jogo.G; G.p.x = x; G.p.z = z + 5; Jogo.mundo.resolve(G.p, 1.7); G.p.yaw = Math.atan2(-(x - G.p.x), -(z - G.p.z)); G.sel = G.item.indexOf(12); Jogo.atualizaHud(); document.getElementById('bUsa').dispatchEvent(new Event('pointerdown')); }, toca);
  await p.waitForTimeout(400);
  console.log('fita tocando:', await p.evaluate(() => !!Jogo.G.fitaNull));
  // volta na sala secreta: 1º discurso
  await p.evaluate(() => { const G = Jogo.G, [sx, sz] = Jogo.E.porao.sala; G.p.x = sx - 2; G.p.z = sz; G.p.yaw = -Math.PI / 2; });
  await p.waitForTimeout(2500); await p.screenshot({ path: out + '/discurso1.png' });
  console.log('discurso1:', await p.evaluate(() => [Jogo.G.discurso1, document.getElementById('aviso').textContent]));
  // pula o fim do discurso (para a fala) e espera o jogo "travar" e recarregar
  await p.evaluate(() => Motor.paraTudo());
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => window.Jogo && document.getElementById('titulo') && !Jogo.G, null, { timeout: 30000 }).catch(() => {});
  console.log('depois de recarregar:', await p.evaluate(() => localStorage.getItem('baldiNull')));
  // com as notificações (simuladas) a tela inicial muda
  await p.evaluate(() => { Jogo.forcaNotif = true; Jogo.atualizaTitulo(); });
  await p.waitForTimeout(800); await p.screenshot({ path: out + '/titulo_null.png' });
  console.log('tela null:', await p.evaluate(() => document.body.classList.contains('telaNull')));
}
