# Baldi's Basics Modded (fã-jogo)

Porte do **Baldi's Basics Classic 1.4.3** para a web (Three.js), feito a partir do projeto aberto (decompile) da release "Baldis". Roda no celular como APK (WebView com um mini servidor interno), sem precisar do Unity.

## Modos
- **História**: o jogo original. Mapa, texturas, sons, cadernos e personagens vêm da cena `School.unity`; a lógica foi reescrita dos scripts C#.
- **Infinito**: os cadernos voltam e o Baldi fica bravo com o tempo.
- **Beta**: o mesmo jogo, com uma tela de **Beta Features** para ligar e desligar o que está em teste:
  - **Mapa aleatório**: uma escola nova a cada partida (corredores, salas de aula, professores, diretoria, cantina, biblioteca, depósito, 4 saídas);
  - **Dr. Reflex**: corre até você e faz o teste de reflexo (toque na mão com o círculo); se você fugir, volta com o martelo;
  - **Cloudy Copter**: sopra vento nos corredores;
  - **The Test**: olhar para ele deixa o tempo lento; olhar demais e ele explode;
  - **Eventos** aleatórios e a **ala nova** da escola (com móveis e enfeites);
  - **Porão** (só com o mapa aleatório): labirinto escuro embaixo da escola. Às vezes tem uma sala secreta... e um segredo do **NULL**.

Dificuldade (Fácil, Normal, Difícil) em todos os modos. Os personagens andam só para frente, trás e para os lados, pelo meio dos corredores.

## Arquivos
- `app/`: o jogo (`index.html`, `motor.js`, `jogo.js`, `beta.js`, `mapa.js`, `null.js`, `porao.js`, `tester.js`, `escola.json`, `malhas.json`, `assets/`).
- `tools/`: `extrai.py` lê a cena do Unity, `malhas.py` converte os modelos, `compacta.py` gera `app/escola.json`, `assets.sh` copia texturas e converte sons.
- `android/` + `build.sh`: gera `BaldiModded.apk`; `TESTER=1 ./build.sh` gera `BaldiNullTester.apk`, com atalhos para testar o NULL (a chave de assinatura não vai para o repositório).
- `test/`: testes no navegador (Playwright).
- `CREDITOS.md`: origem de tudo que é novo.

Baldi's Basics é de Basically Games (mystman12). Projeto de fã, sem fins lucrativos.
