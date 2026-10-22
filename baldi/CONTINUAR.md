# Baldi Beta Tester: como continuar em outro chat

Cole esta pasta (ou o zip) no chat novo e diga: "leia CONTINUAR.md e continue o Baldi Beta Tester".

## O que é
Porte para a web (Three.js) do **Baldi's Basics Classic 1.4.3**, feito a partir do projeto aberto (decompile)
da release "Baldis" do repositório GitHub `Heitorcoser/Claude`. Vira APK com um WebView e um mini servidor
interno (o Unity não é usado). Código também em `Heitorcoser/Claude`, pasta `baldi/`, branch `claude/graphify-repo-setup-d9dotq`.

## Pastas
| Caminho | O que tem |
|---|---|
| `app/index.html` | Telas e estilos: título, menu (ícone + texto, como o original), HUD, controles de toque, tela das contas (posições tiradas do prefab MathGame, base 800x600), pausa, fim. Fonte Comic Neue embutida. |
| `app/motor.js` | Monta a escola a partir do `escola.json` (junta os quads por material), colisão 2D (paredes = segmentos, móveis = caixas), navegação em grade com A* (no lugar do NavMesh), som (WebAudio, volume pela distância). |
| `app/jogo.js` | Regras portadas dos scripts C#: jogador (andar 10, correr 16, energia), portas e portas vai-e-vem, cadernos e contas (conta impossível no 3º problema), itens 1 a 11, Baldi (tapa, raiva, ouvir), Diretor (culpa e detenção 15-99 s), Playtime (pular corda), Gotta Sweep, Arts and Crafters, 1st Prize (16 sprites de ângulo), Bully, modo final com as saídas, modo infinito. Tem ganchos `Jogo.ganchos.monta/inicia/tique/caderno`. |
| `app/beta.js` | Modo Beta Tester: ala nova (planta em texto `PLANTA`, portas em `PORTAS`, 10 cadernos), Robô Inspetor, Fantasma do Apagão e eventos (`EVENTOS`: apagao, incendio, chuva, lanche, recreio). |
| `app/escola.json` | Mapa gerado pelos scripts de `tools/` a partir da cena `School.unity`. |
| `app/assets/` | Texturas e sons do jogo (convertidos), `beta/` com material novo (domínio público/CC0, ver `CREDITOS.md`), `fonts/`, `ui/`. |
| `tools/` | `extrai.py` (lê a cena YAML do Unity), `malhas.py` (modelos .asset), `compacta.py` (gera `app/escola.json`), `assets.sh` (copia texturas e converte sons). |
| `test/` | `ver.mjs` abre o jogo num celular simulado (Playwright); `jogar.mjs` testa caderno, contas e o Baldi; `beta.mjs` testa a ala e os eventos. Uso: `EXTRA=$PWD/test/beta.mjs node test/ver.mjs beta /tmp`. |
| `android/` + `build.sh` | Gera `BaldiBetaTester.apk` sem Gradle (aapt2, javac, d8, zipalign, apksigner do SDK em `/opt/android/sdk`). |
| `graphify-out/` | Grafo do código (`graph.html`, `GRAPH_REPORT.md`, `graph.json`). |

## Regenerar tudo
```bash
# mapa e recursos (precisa da pasta Assets do decompile)
python3 tools/extrai.py <Assets> <Assets>/Scene/School.unity escola.json
python3 tools/malhas.py <Assets> escola.json app/malhas.json
python3 tools/compacta.py escola.json app/escola.json
tools/assets.sh <Assets>
# APK
./build.sh
```
A chave `android/baldi.keystore` (senha `baldibeta`, alias `baldi`) só está no zip, não no GitHub. Use sempre a mesma para o APK novo instalar por cima do antigo.

## Decisões e cuidados
- O APK original é IL2CPP (código nativo): não dá para editar. O projeto aberto só compila no Unity, que exige licença ativada num PC. Por isso o porte para a web.
- Visual: sem emojis; usar imagens do próprio jogo. Material novo vem de sites com licença livre (OpenGameArt/OpenClipart, CC0/domínio público) e entra em `CREDITOS.md`.
- A câmera tem um desvio de 0,0001 rad no giro: alinhada exatamente às paredes, alguns renderizadores desenhavam as paredes cinza.
- Materiais só com a frente (como no Unity). Malhas com escala negativa têm a ordem dos triângulos invertida em `M.monta`. Paredes novas (`beta.js`) usam `quadV` virado para dentro da área; parede entre duas áreas leva dois quads.
- Navegação: `Nav.muro` marca passagens entre células cortadas por parede fina; o A* e o alisamento não atravessam paredes (`test/paredes.mjs`, `test/ronda.mjs`).
- Dificuldade: tela `#telaDif` depois de escolher o modo (`DIF` em `jogo.js`, guardada em localStorage): raiva e espera do Baldi, detenções (índices de 15/30/45/60/99 s, para a voz do Diretor bater), gasto de energia, tempo do Diretor para notar, intervalo do Robô.
- Sons: `Motor.tocando` guarda tudo que toca; `menu()` e `comeca()` chamam `M.paraTudo()` (`test/menu.mjs`).
- Empurrões (1st Prize, Gotta Sweep) movem o jogador em passos de 0,5 com colisão a cada passo (`test/dificuldade.mjs`).
- Os nomes das texturas das portas trocam por convenção (`Door_0` fechada, `Door_80` aberta; `SwingDoor0`, `SwingDoor60`, `SwingDoor0_Locked`).

## Ideias para as próximas versões do Beta Tester
- Mais personagens e eventos (estrutura pronta em `beta.js`).
- 1st Prize, Arts and Crafters e Playtime mais fiéis ao original.
- Salvar recorde do modo infinito; opções (sensibilidade, tamanho dos botões).
