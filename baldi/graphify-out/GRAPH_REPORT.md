# Graph Report - corpus  (2026-10-22)

## Corpus Check
- Corpus is ~16,812 words - fits in a single context window. You may not need a graph.

## Summary
- 183 nodes · 300 edges · 17 communities (11 shown, 6 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Telas e créditos do jogo
- Extração da cena Unity
- Servidor HTTP do APK
- Núcleo do jogo (jogo.js)
- Atividade Android
- Material livre e eventos beta
- Modo Beta Tester (beta.js)
- Cadernos, contas e itens
- Movimento, culpa e fim
- Teste no celular simulado
- Modo final e spoop
- Portas
- Sprites e animação
- Conversão de recursos

## God Nodes (most connected - your core abstractions)
1. `index.html (game shell page)` - 13 edges
2. `usaItem()` - 12 edges
3. `Servidor` - 11 edges
4. `MainActivity` - 10 edges
5. `passo()` - 8 edges
6. `Baldi's Basics: Beta Tester (fan game)` - 8 edges
7. `novoJogo()` - 7 edges
8. `W()` - 6 edges
9. `gatilhos()` - 6 edges
10. `Beta Tester new material (public domain / CC0)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `#menu mode selection (História, Infinito, Beta Tester, Como jogar)` --references--> `Modo Infinito (Endless mode)`  [INFERRED]
  index.html → README.md
- `#menu mode selection (História, Infinito, Beta Tester, Como jogar)` --references--> `Modo Beta Tester`  [INFERRED]
  index.html → README.md
- `test/ browser tests (Playwright)` --references--> `index.html (game shell page)`  [INFERRED]
  README.md → index.html
- `MainActivity` --references--> `Servidor`  [EXTRACTED]
  MainActivity.java → Servidor.java
- `Baldi's Basics: Beta Tester (fan game)` --references--> `Baldi's Basics Classic 1.4.3 open decompile project`  [EXTRACTED]
  README.md → CREDITOS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Game modes (História, Infinito, Beta Tester) selected from the menu** — readme_modo_historia, readme_modo_infinito, readme_modo_beta_tester, index_menu [INFERRED 0.85]
- **Beta Tester mode content (new wing, Robô Inspetor, Fantasma do Apagão, random events, CC0 assets)** — readme_modo_beta_tester, readme_nova_ala_escola, readme_robo_inspetor, readme_fantasma_do_apagao, readme_eventos_aleatorios, creditos_beta_tester_new_material [INFERRED 0.85]
- **Unity-to-web build pipeline (School.unity -> tools -> escola.json -> app -> APK)** — readme_school_unity, readme_tools_pipeline, readme_escola_json, readme_app_dir, readme_android_build [INFERRED 0.85]

## Communities (17 total, 6 thin omitted)

### Community 0 - "Telas e créditos do jogo"
Cohesion: 0.11
Nodes (26): Baldi's Basics Classic 1.4.3 open decompile project, Basically Games (mystman12), Créditos (CREDITOS.md), #carregando loading screen, #como How-to-play screen, #corda jump-rope screen (Playtime), #fim end screen and #susto jumpscare, index.html (game shell page) (+18 more)

### Community 1 - "Extração da cena Unity"
Cohesion: 0.14
Nodes (13): entrada(), porta_de(), ativo(), caminho(), comps(), conv(), mat_trs(), material() (+5 more)

### Community 3 - "Núcleo do jogo (jogo.js)"
Cohesion: 0.20
Nodes (13): Agente(), ajusta(), comeca(), criaNPCs(), despertador(), evento(), menu(), montaCena() (+5 more)

### Community 5 - "Material livre e eventos beta"
Cohesion: 0.16
Nodes (15): Beta sounds (alarme, apagao, fantasma, fantasma_respira, bipe, robo_*) from OpenGameArt, Beta Tester new material (public domain / CC0), CC0 / Public Domain license, Comic Neue font (Fontsource, SIL OFL 1.1), beta/img/fantasma.png (openclipart, jbruce), openclipart.org, opengameart.org, beta/img/robo.png (openclipart, Pippi2011) (+7 more)

### Community 6 - "Modo Beta Tester (beta.js)"
Cohesion: 0.26
Nodes (8): ativa(), diz(), fixo(), ini(), some(), surge(), tique(), vagar()

### Community 7 - "Cadernos, contas e itens"
Cohesion: 0.23
Nodes (12): abreConta(), alvo(), atualizaHud(), aviso(), interage(), novoProblema(), pegaCaderno(), pegaItem() (+4 more)

### Community 8 - "Movimento, culpa e fim"
Cohesion: 0.27
Nodes (10): acabaCorda(), culpa(), dentro(), fim(), gameOver(), gatilhos(), movimenta(), passo() (+2 more)

### Community 9 - "Teste no celular simulado"
Cohesion: 0.22
Nodes (4): errs, [modo = 'historia', out = '/tmp'], srv, tipos

### Community 10 - "Modo final e spoop"
Cohesion: 0.33
Nodes (6): abaixaEntradas(), chegouSaida(), fechaConta(), modoFinal(), spoop(), tiqueConta()

### Community 11 - "Portas"
Cohesion: 0.67
Nodes (4): abrePorta(), mostraPorta(), portas(), trancaNav()

### Community 12 - "Sprites e animação"
Cohesion: 0.50
Nodes (4): desenha(), fita(), quadro(), troca()

## Knowledge Gaps
- **10 isolated node(s):** `opengameart.org`, `CC0 / Public Domain license`, `New school wing (2 test rooms, library, storage, lab; 10 notebooks)`, `android/ + build.sh (BaldiBetaTester.apk)`, `test/ browser tests (Playwright)` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 43 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `index.html (game shell page)` connect `Telas e créditos do jogo` to `Material livre e eventos beta`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `opengameart.org`, `CC0 / Public Domain license`, `New school wing (2 test rooms, library, storage, lab; 10 notebooks)` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Telas e créditos do jogo` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
- **Why does `Servidor` connect `Servidor HTTP do APK` to `Atividade Android`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `Extração da cena Unity` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Why does `MainActivity` connect `Atividade Android` to `Servidor HTTP do APK`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._