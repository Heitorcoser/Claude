// NPC anda pelo meio do corredor: caminho do começo do corredor principal até longe
export default async function (p) {
  console.log('meio:', await p.evaluate(() => {
    const N = Jogo.nav;
    const c = N.caminho(5, 0, 5, -150), c2 = N.caminho(2, -20, 60, -60);
    return { reto: JSON.stringify(c.map((q) => q.map((v) => +v.toFixed(2)))), outro: JSON.stringify(c2.map((q) => q.map((v) => +v.toFixed(2)))) };
  }));
}
