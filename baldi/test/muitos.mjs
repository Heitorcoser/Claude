// Gera muitos mapas e confere se tudo é alcançável a partir do jogador (sem portas trancadas)
export default async function (p, out) {
  const r = await p.evaluate(() => {
    const res = { mapas: 0, ruins: 0, exemplos: [] , chunks: {} };
    for (let k = 0; k < 40; k++) {
      const E = Jogo.geraMapa(Jogo.Ebase, 7);
      if (!E) { res.falhou = (res.falhou || 0) + 1; continue; }
      res.mapas++;
      const mu = new Motor.Mundo(E);
      let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
      for (const s of E.segs) { x0 = Math.min(x0, s.a[0], s.b[0]); x1 = Math.max(x1, s.a[0], s.b[0]); z0 = Math.min(z0, s.a[1], s.b[1]); z1 = Math.max(z1, s.a[1], s.b[1]); }
      const N = new Motor.Nav(mu, [x0 - 5, z0 - 5, x1 + 5, z1 + 5]);
      const pl = E.esp.find((e) => e.s == 'PlayerScript').pos;
      const alvos = E.ronda.concat(E.rondaCorr || []).map((r) => [r[0], r[1], 'ronda']);
      for (const s of E.spr) if ((s.n == '_nbSprite' && /Notebooks\//.test(s.pai)) || /Pickup_/.test(s.pai)) alvos.push([s.M[12], s.M[14], s.n == '_nbSprite' ? 'caderno' : 'item']);
      for (const e of E.esp.filter((e) => e.s == 'EntranceScript')) alvos.push([e.pos[0], e.pos[2], 'saida']);
      const sem = alvos.filter((a) => !N.caminho(pl[0], pl[2], a[0], a[1]).length);
      if (sem.length) { res.ruins++; if (res.exemplos.length < 4) res.exemplos.push(sem.map((a) => { const i = Math.floor(a[0] / 10), j = Math.floor(-a[1] / 10), d = E.debug, v = d.id[j][i], s = d.lista[v]; return a[2] + ' cel ' + i + ',' + j + (s ? ' sala ' + s.tipo + ' (' + s.chunk + '/' + s.letra + ') area ' + s.area + ' porta ' + JSON.stringify(s.porta) : ' c=' + d.c[j][i]); }).join(' | ')); if (!Jogo.ruim) Jogo.ruim = { E, sem }; }
    }
    return res;
  });
  console.log('muitos:', JSON.stringify(r, null, 1));
}
