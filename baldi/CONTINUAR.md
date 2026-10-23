# Baldi's Basics Modded: como continuar em outro chat

Cole esta pasta (ou o zip) no chat novo e diga: "leia CONTINUAR.md e continue o Baldi's Basics Modded".

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
| `app/beta.js` | Modo Beta: tela de Beta Features (`J.betaFeat`), ala nova (`PLANTA`, `PORTAS`, `decora()`), `kit(E)` com as peças de montar mapa, personagens do Baldi's Basics Plus (Dr. Reflex com o teste de reflexo, Cloudy Copter com vento, The Test que mexe no tempo `G.escala`) e eventos (`EVENTOS`). |
| `app/mapa.js` | Mapa aleatório por **chunks prontos** (`CHUNKS`: desenhos 9x9 feitos à mão, com saídas de corredor no meio dos lados). Os chunks são girados/espelhados e escolhidos para bater com uma grade de ligações (árvore + laços). Letras: c corredor, p praça, a/A/e/E aula, s/S especiais (diretoria, professores, clínica do Dr. Reflex, depósito), k cantina, b biblioteca. Cada sala do desenho precisa encostar num corredor. O jogo gera, confere com a navegação (`valida`) e tenta de novo se algo ficar sem caminho. Testes: `test/planta.mjs` (planta vista de cima), `test/muitos.mjs` (40 mapas). |
| `app/escola.json` | Mapa gerado pelos scripts de `tools/` a partir da cena `School.unity`. |
| `app/assets/` | Texturas e sons do jogo (convertidos), `beta/` com material novo (domínio público/CC0, ver `CREDITOS.md`), `fonts/`, `ui/`. |
| `tools/` | `extrai.py` (lê a cena YAML do Unity), `malhas.py` (modelos .asset), `compacta.py` (gera `app/escola.json`), `assets.sh` (copia texturas e converte sons). |
| `test/` | `ver.mjs` abre o jogo num celular simulado (Playwright); `jogar.mjs` testa caderno, contas e o Baldi; `beta.mjs` testa a ala e os eventos. Uso: `EXTRA=$PWD/test/beta.mjs node test/ver.mjs beta /tmp`. |
| `android/` + `build.sh` | Gera `BaldiModded.apk` sem Gradle (aapt2, javac, d8, zipalign, apksigner do SDK em `/opt/android/sdk`). |
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
- Navegação: `Nav.muro` marca passagens entre células cortadas por parede fina. A* em 4 direções com custo de curva e de beirada (`Nav.meio`); o caminho sai em linhas retas no centro do vão mais estreito (meio do corredor e da porta). Nada de diagonal (`test/paredes.mjs` conta tortos, `test/meio.mjs`).
- Dificuldade: tela `#telaDif` depois de escolher o modo (`DIF` em `jogo.js`, guardada em localStorage): raiva e espera do Baldi, detenções (índices de 15/30/45/60/99 s, para a voz do Diretor bater), gasto de energia, tempo do Diretor para notar, intervalo do Robô.
- Sons: `Motor.tocando` guarda tudo que toca; `menu()` e `comeca()` chamam `M.paraTudo()` (`test/menu.mjs`).
- 1st Prize: acelera até 40 (12/s), vira 1 rad/s vendo o jogador; solta quando a velocidade cai abaixo de 4 e espera 2 s (`test/prize.mjs`).
- Empurrões (1st Prize, Gotta Sweep) movem o jogador em passos de 0,5 com colisão a cada passo (`test/dificuldade.mjs`).
- Ala Beta decorada em `decora()` (`beta.js`): móveis do jogo (`MOVEL`: carteira, cadeira, mesa do professor, mesa comprida, armário), estantes e caixotes (cubos de madeira), máquinas BSODA/Zesty que funcionam, quadros, cartazes, janelas e enfeites em sprite. Cada peça leva caixa de colisão. `test/ala.mjs` tira fotos e confere caminhos.
- O HUD fica acima dos controles de toque (z-index 7) para os espaços de item receberem o toque.
- Dr. Reflex: nasce na clínica (`E.clinica`: laboratório da ala, sala especial do mapa aleatório). Teste de reflexo no próprio sprite (toque/raycast na mão com o círculo, `J.toqueMundo`). O jogador fica livre; se sair do teste ele vai buscar o martelo na clínica e volta para esmagar.
- Cloudy Copter: vento de 14,5 (andando contra você volta, correndo contra avança devagar).
- Jogador criança: `ALTURA` 3,6 (olhos) e `RAIO` 1,5 em `jogo.js`.
- Playtime: fala com intervalo (`diz`), contagem "3, 2, 1, PULE!" antes da corda; 1st Prize e Dr. Reflex ignoram o jogador enquanto ele pula corda (`test/playtime.mjs`).
- Mapa aleatório: móveis só entram se couberem inteiros na sala (`cabe`/`poe` em `mobilia`); cadernos ficam em cima de uma carteira (`s.mesas`).
- Mapa aleatório: só têm porta as salas com caderno, diretoria, professores, clínica e o armário do Gotta Sweep; cantina e biblioteca ficam abertas; as outras salas viram parede (`s.fechada`). Porta por tipo: aula `Door_0` (99), diretoria `PrincipalDoor_0`, professores `FacultyDoor_0`, clínica `DoctorDoor_0`, armário `SuppliesDoor_0` (o `kit.mi` cria o material). Na escola original a porta da diretoria também vira "Principal".
- Os nomes das texturas das portas trocam por convenção (`Door_0` fechada, `Door_80` aberta; `SwingDoor0`, `SwingDoor60`, `SwingDoor0_Locked`).

## Ideias para as próximas versões
- Testes por modo: `FEAT='{"mapa":true}' EXTRA=$PWD/test/planta.mjs node test/ver.mjs beta /tmp` (mapa), `test/plus.mjs` (personagens novos), `test/betamenu.mjs`.
- Mais personagens e eventos (estrutura pronta em `beta.js`).
- 1st Prize, Arts and Crafters e Playtime mais fiéis ao original.
- Salvar recorde do modo infinito; opções (sensibilidade, tamanho dos botões).
