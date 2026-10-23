# PERDIDO — fangame de Undertale (mobile)

Jogo 2D estilo Undertale para Android. Feito em HTML5 Canvas, empacotado em APK (WebView).

## Baixar e instalar

1. Baixe [`apk/Perdido-fase1.apk`](apk/Perdido-fase1.apk) no celular.
2. Abra o arquivo e permita "instalar apps desconhecidos".
3. Jogue na horizontal.

Também dá para jogar no navegador: abra `www/index.html`.

## Controles

| Ação | Toque | Teclado |
|---|---|---|
| Andar / mover menus | Direcional (esquerda) | Setas / WASD |
| Confirmar / falar | **A** ou tocar na tela | Z / Enter |
| Cancelar / menu | **B** ou "voltar" do Android | X / Esc |
| Mover a ALMA na batalha | Arrastar o dedo na tela | Setas |

## Fase 1 — O Labirinto

- **Cutscene**: você passeia pela floresta, se perde e cai num buraco.
- **Instrutor**: velho mago-monstro que te acolhe, ensina a lutar e entra no seu grupo.
- **Tutorial**: batalha contra o Boneco (LUTAR, AGIR, ITEM, POUPAR e desviar).
- **Labirinto gerado**: corredores com musgo e encontros aleatórios.
- **Monstros**: Musgolho e Fantasminha. Dá para matar ou poupar.
- **Ajuda do Instrutor** (AGIR): `Instr: Magia` (dano) e `Instr: Acalmar` (piedade). Ele cura você se o HP ficar baixo.
- **Estrela de salvamento**, Torta de Canela, item secreto e porta da saída.
- Final da fase mostra a rota (Pacifista / Neutra / Genocida).

Fase 2 (primeira boss fight): em breve.

## Personagens

| Instrutor | Jogador |
|---|---|
| ![Instrutor](arte/instrutor.png) | ![Jogador](arte/jogador.png) |

| Musgolho | Fantasminha | Boneco |
|---|---|---|
| ![](arte/musgolho.png) | ![](arte/fantasminha.png) | ![](arte/boneco.png) |

Toda a arte é pixel art original, desenhada em código (`www/js/sprites.js`).

## Estrutura

```
www/            jogo (HTML5)
  js/sprites.js   pixel art e tiles
  js/audio.js     sons e músicas (WebAudio)
  js/engine.js    entrada, texto, diálogo, save
  js/battle.js    sistema de batalha e ataques
  js/world.js     mapa, labirinto e roteiros
  js/main.js      título, cutscene, game over, final
android/        projeto Android (WebView) que gera o APK
apk/            APK pronto
```

## Compilar o APK

```bash
cd android
./gradlew assembleRelease
# saída: app/build/outputs/apk/release/app-release.apk
```

O GitHub Actions (`.github/workflows/perdido-apk.yml`) também gera o APK a cada push.

Fontes: VT323 e Press Start 2P (SIL Open Font License).
Undertale pertence a Toby Fox. Este é um projeto de fã, sem fins comerciais.
