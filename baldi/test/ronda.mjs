// Todos os pontos de ronda têm caminho a partir do Baldi
export default async function (p) {
  console.log('ronda:', await p.evaluate(() => {
    const E = Jogo.E || {}, b = Jogo.G.npcs.baldi, l = (Jogo.E ? E.ronda.concat(E.rondaCorr || [], E.rondaSala || []) : []);
    const sem = l.filter((r) => !Jogo.nav.caminho(b.x, b.z, r[0], r[1]).length);
    return l.length + ' pontos, sem caminho: ' + JSON.stringify(sem);
  }));
}
