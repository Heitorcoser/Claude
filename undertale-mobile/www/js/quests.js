// Missões: o objetivo atual de cada fase (texto + lugar para onde a seta aponta).
// Cada função recebe o World e devolve { t: texto, x, y } (x/y em tiles, opcionais).
'use strict';

const QUESTS = {
  labirinto(W) {
    const F = G.flags, px = W.player.x / TS, py = W.player.y / TS;
    if (!F.met) return { t: 'Você caiu num lugar estranho. Siga para a DIREITA.', x: 18, y: 6 };
    if (!F.tutorialDone) return { t: 'Fale com o BONECO de treino na sala de baixo (aperte A perto dele).', x: 23, y: 16 };
    if (py < 24 && px < 34) return { t: 'Entre no LABIRINTO pelo portão aberto, à direita da sala do Instrutor.', x: 32, y: 4 };
    if (py < 24 || px >= 30) return { t: 'Atravesse o LABIRINTO. A saída fica embaixo, do lado esquerdo.', x: 33, y: 30 };
    return { t: 'Salve na ESTRELA e entre pela PORTA de saída, lá em cima.', x: 21, y: 24 };
  },

  dragoncity(W) {
    const F = G.flags;
    if (!F.dragonChosen) return { t: 'Fale com os 3 dragões do NINHO (norte da praça) e escolha seu parceiro.', x: 30, y: 13 };
    if (!F.ghostScene) return { t: 'Siga para o LESTE, passando pelo MERCADO.', x: 56, y: 21 };
    if (!F.bridge) return { t: 'No Bosque das Cinzas, leia a PLACA e acenda os braseiros das estátuas na ORDEM certa.', x: 76, y: 22 };
    if (!F.bossDone) return { t: 'Atravesse a ponte sobre a lava e bata na porta da CASINHA.', x: 91, y: 14 };
    return null;
  },

  gelo(W) {
    const F = G.flags;
    if (!F.phone) return { t: 'Siga pelo caminho de neve.', x: 13, y: 19 };
    if (!F.p3g1) return { t: 'Sala das PLACAS: pise em todo X uma vez só para virar O. Errou? Use a alavanca.', x: 63, y: 18 };
    if (!F.p3lake) return { t: 'LAGO DE GELO: escorregue até a saída, no canto de CIMA à direita. Comece pela parte de baixo da margem.', x: 95, y: 12 };
    if (!F.p3field) return { t: 'Atravesse o corredor desviando das SOMBRAS das estalactites.', x: 130, y: 16 };
    if (!F.p3g3) return { t: 'Empurre os 2 BLOCOS DE GELO até os BOTÕES vermelhos. Travou? Alavanca.', x: 156, y: 26 };
    if (!F.p3joke) return { t: 'Responda a PORTA DAS PIADAS (as piadas do FireGhost!).', x: 175, y: 26 };
    if (!F.p3bridge) return { t: 'Atravesse a PONTE pisando só nas placas com PEGADAS de pinguim.', x: 200, y: 26 };
    return { t: 'Salve na estrela e bata na porta da CASA DE GELO.', x: 211, y: 22 };
  },

  futuro(W) {
    const F = G.flags;
    if (!F.p4met) return { t: 'Saia do túnel e vá até a PRAÇA, à direita.', x: 14, y: 32 };
    if ((F.p4tour || 0) < 4) return { t: `Tour com o BIT: vá até o ${TOUR[F.p4tour || 0].name} (siga a setinha).` };
    if (!F.p4day2) {
      if (W.player.y > 50 * TS) return { t: 'Deite na CAMA para dormir.', x: 35, y: 59 };
      return { t: 'Durma na casa do Bit: a porta AZUL no alto da praça.', x: 52, y: 18 };
    }
    if (!F.p4bully) {
      if (W.player.y > 50 * TS) return { t: 'Saia da casa e vá para a ESCOLA.', x: 40, y: 63 };
      return { t: 'Vá para a ESCOLA, no fim da avenida, à direita.', x: 104, y: 32 };
    }
    if (!F.p4class) return { t: 'Entre na ESCOLA pela porta de cima.', x: 115, y: 18 };
    if (!F.p4boss) return { t: 'Recreio! Saia da sala pela porta de baixo.', x: 67, y: 65 };
    return null;
  },

  ilha(W) {
    const F = G.flags, p = W.player;
    if (!F.p5camp) return null;
    if (P5.roll) return { t: 'CHAMADA! Corra até o X no PÁTIO!', x: ROLL_SPOT.x, y: ROLL_SPOT.y };
    if (!F.p5task1) {
      const n = G.p5bricks || 0;
      return p.carry
        ? { t: `OBRA: leve o bloco até a construção (${n}/${BRICKS_NEEDED}).`, x: 58, y: 49 }
        : { t: `OBRA: pegue um bloco de açúcar na PILHA (${n}/${BRICKS_NEEDED}).`, x: 49, y: 45 };
    }
    if (F.p5soupTime) return { t: 'Vá ao REFEITÓRIO (no norte) e pegue a SOPA na panela.', x: 70, y: 9 };
    if (F.p5night1 && !F.p5day2) return { t: 'Durma no seu BELICHE: barracão, à esquerda.', x: 49, y: 14 };
    if (!F.p5task2) return { t: 'Vá à FÁBRICA (sul do pátio) e use a ESTEIRA.', x: 82, y: 45 };
    if (!F.p5fight1) return { t: 'Volte para o PÁTIO.', x: 76, y: 33 };
    if (!F.p5cell) return null;
    if (!F.p5alicate && !F.p5map) return { t: 'No barracão: fale com o FERRUGEM (alicate) e a VOVÓ FANTASMA (rotas).', x: 58, y: 13 };
    if (!F.p5alicate) return { t: 'No barracão: fale com o FERRUGEM para pegar o ALICATE.', x: 58, y: 13 };
    if (!F.p5map) return { t: 'No barracão: fale com a VOVÓ FANTASMA para saber as rotas.', x: 55, y: 10 };
    if (!F.p5cut) return { t: 'FUJA! Fique FORA da luz das lanternas e vá até a cerca no SUL (meio). Aperte A nela para cortar.', x: 80, y: 66 };
    if (!F.p5out) return { t: 'Passe pelo buraco na cerca!', x: 80, y: 68 };
    if (!F.p5free) return { t: 'Salve na estrela e fale com o TREINADOR quando estiver pronto.' };
    if (!F.p5boss) return { t: 'Vá até a TORRE DOURADA (canto de cima, à direita) e entre.', x: 98, y: 22 };
    return null;
  },
};

// Painel de missão + seta
const QuestHUD = {
  get(W) { const f = QUESTS[W.mapId]; return f ? f(W) : null; },
  draw(W, sx, sy) {
    if (!Config.quest) return;
    const q = this.get(W);
    if (!q) return;
    const lines = wrapText('MISSÃO: ' + q.t, 268, 22).slice(0, 4);
    const w = 290, h = 12 + lines.length * 22;
    const x = 640 - w - 8, y = 8;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#ffe680'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    lines.forEach((l, i) => text(l, x + 10, y + 5 + i * 22, 22, i === 0 ? '#ffe680' : '#fff'));
    if (q.x === undefined) return;
    // seta para o objetivo
    const tx = sx(tx2x(q.x)), ty = sy(ty2y(q.y) - 20), bob = Math.sin(W.t * 5) * 5;
    if (tx > 20 && tx < 620 && ty > 40 && ty < 460) {
      ctx.fillStyle = '#ffe680'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx - 10, ty - 30 + bob); ctx.lineTo(tx + 10, ty - 30 + bob); ctx.lineTo(tx, ty - 14 + bob); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      const a = Math.atan2(ty - 240, tx - 320);
      const ex = Math.max(28, Math.min(612, 320 + Math.cos(a) * 400)), ey = Math.max(h + 28, Math.min(452, 240 + Math.sin(a) * 400));
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(a);
      ctx.fillStyle = '#ffe680'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(16 + bob * 0.4, 0); ctx.lineTo(-8, -11); ctx.lineTo(-8, 11); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  },
};
