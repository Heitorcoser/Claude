// Usa cada item (1 a 11) no corredor e confere que nada quebra e que o item é gasto quando deve
export default async function (p) {
  const NOMES = [null, 'Zesty', 'Trava', 'Chave', 'BSODA', 'Moeda', 'Fita', 'Despertador', 'WD-NoSquee', 'Tesoura', 'Botas', 'Teletransporte'];
  const r = [];
  for (let id = 1; id <= 11; id++) {
    const res = await p.evaluate(async (id) => {
      const G = Jogo.G; Jogo.spoop(); G.p.x = 5; G.p.z = -20; G.p.yaw = 0; G.p.est = 20; G.item = [id, 0, 0]; G.sel = 0;
      try { document.getElementById('bUsa').dispatchEvent(new Event('pointerdown')); } catch (e) { return 'ERRO ' + e.message; }
      await new Promise((r) => setTimeout(r, 400));
      return { gastou: G.item[0] == 0, est: Math.round(G.p.est), botas: G.p.botas > 0 };
    }, id);
    r.push(NOMES[id] + ':' + JSON.stringify(res));
  }
  console.log('itens:\n ' + r.join('\n '));
}
