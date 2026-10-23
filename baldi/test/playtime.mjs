// Playtime: contagem antes da corda e sem falar sem parar
export default async function (p, out) {
  const r = await p.evaluate(async () => {
    const G = Jogo.G; Jogo.spoop(); for (const k in G.npcs) if (k != 'playtime') G.npcs[k].ativo = false;
    const pt = G.npcs.playtime; let falas = 0; const orig = Motor.som;
    Motor.som = (n, o) => { if (/Playtime/.test(n)) falas++; return orig(n, o); };
    // anda perto dela por 12 s sem ser pego (fica pulando a vista)
    pt.x = G.p.x; pt.z = G.p.z - 40;
    for (let k = 0; k < 24; k++) { pt.jogaCool = 1; await new Promise((r) => setTimeout(r, 500)); }
    const falas12 = falas;
    pt.jogaCool = 0; pt.x = G.p.x; pt.z = G.p.z - 2.5;
    await new Promise((r) => setTimeout(r, 400));
    const textos = [];
    for (let k = 0; k < 8; k++) { textos.push(document.getElementById('cordaConta').textContent); await new Promise((r) => setTimeout(r, 450)); }
    Motor.som = orig;
    return { falasEm12s: falas12, corda: G.p.corda, contagem: [...new Set(textos)].join(' > ') };
  });
  console.log('playtime:', JSON.stringify(r));
  await p.screenshot({ path: out + '/corda.png' });
}
