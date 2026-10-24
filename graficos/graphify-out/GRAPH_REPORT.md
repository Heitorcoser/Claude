# Graph Report - graficos  (2026-10-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1070 nodes · 1378 edges · 62 communities (44 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3319152a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 37
- Community 38
- Community 39
- Community 40
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 61

## God Nodes (most connected - your core abstractions)
1. `Battle` - 43 edges
2. `Battle` - 43 edges
3. `MasterBattle` - 23 edges
4. `with` - 14 edges
5. `Updater` - 12 edges
6. `Updater` - 12 edges
7. `MainActivity` - 11 edges
8. `MainActivity` - 11 edges
9. `ApkProvider` - 9 edges
10. `ApkProvider` - 9 edges

## Surprising Connections (you probably didn't know these)
- `MainActivity` --references--> `Updater`  [EXTRACTED]
  android/app/src/main/java/com/heitorcoser/perdido/MainActivity.java → android/app/src/main/java/com/heitorcoser/perdido/Updater.java
- `MainActivity` --references--> `Updater`  [EXTRACTED]
  android/app/src/main/java/com/heitorcoser/bossbattles/MainActivity.java → android/app/src/main/java/com/heitorcoser/bossbattles/Updater.java

## Import Cycles
- None detected.

## Communities (62 total, 18 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (17): Battle, BATTLE_CLASSES, BOX_FULL, BTN, BULLET_DRAW, DRAGON_EVO, dragonBonus(), DRAGONS (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (20): Config, ctx, cv, Dialog, Fade, G, Input, ITEMS (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (40): runs-on, steps, run, jobs, android, lancar, windows, needs (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (16): BLASTER, BLASTER_OPEN, boss9Sprites(), bt9(), drawBlaster(), M9_COLORS, M9_FLAVOR, M9_PHASES (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): checkUpdate(), createWindow(), download(), getJSON(), request(), author, build, appId (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (27): buildSprites(), buildTiles(), composePlayer(), DUMMY, FANTASMINHA, I_BASE, I_BLINK, I_WALK (+19 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (26): concurrency, cancel-in-progress, group, name, url, jobs, publicar, name (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (14): BLOCK_START, Cine3, ents(), LAKE_ROCKS, musicAt(), P3, penguinNpc(), Phone (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (9): Cine5, ents(), guardEnt(), gummyNpc(), musicAt(), P5, ROLL_SPOT, sprNpc() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (10): ents(), ghostEnt(), lampEnt(), layer(), musicAt(), npcDragon(), P2, STATUE_ORDER (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (9): Cine4, DOORS4, ents(), kidNpc(), musicAt(), P4, robotNpc(), TOUR (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (18): buildPartySets(), buildSprites9(), buildTiles9(), CARMIM, CARMIM_PAL, DRESS, KAI, KAI_PAL (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (6): Cine8, GEYSER_ROWS, musicAt(), P8, STONES8, update()

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (3): musicAt(), P13, update()

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (6): DOORS9, dragonEnt9(), ents(), musicAt(), P9, update()

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (6): Cine6, critter(), ents(), musicAt(), P6, update()

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (4): DOORS12, musicAt(), P12, update()

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (4): DOORS14, musicAt(), P14, update()

### Community 22 - "Community 22"
Cohesion: 0.14
Nodes (4): DOORS7, musicAt(), P7, update()

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (14): BRASA_PAL, BRASINHA, buildCityTiles(), buildSprites2(), DRAGON, DRAGON_FLAP, DRAGON_PALS, FIRE_PAL (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (4): build(), genMaze(), mazePath(), P1

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (10): ⬇️ Baixar e instalar, 🕹️ Controles, 🛠️ Desenvolvimento, 📖 História — Capítulo 1, 👥 Multiplayer cooperativo, 🧑‍🤝‍🧑 Personagens, 🔥 Quanto mais jogadores, mais difícil, ⚖️ Rotas (+2 more)

### Community 27 - "Community 27"
Cohesion: 0.20
Nodes (10): buildIslandTiles(), buildSprites5(), CHOCO, CHOCO_PAL, GUARD_PAL, GUMMY, GUMMY_PALS, MACARON (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (10): buildSprites7(), buildVolcanoTiles(), DRACO, DRACO_PAL, drawDragonAura(), drawRider(), FANT_LAVA, FANT_LAVA_PAL (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (9): buildSnowTiles(), buildSprites3(), CAPUZ_PAL, ENCAPUZADO, NEVE_PAL, NEVOSO, PING_PAL, PINGUIM (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (8): Chapter, ConfigMenu, Credits, End, Game, GameOver, Intro, Title

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (8): buildFutureTiles(), buildSprites4(), BULLY_DOWN, KID_PALS, ROBOT, ROBOT_PALS, ROBOT_SAD, ROBOT_WHEEL

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (8): ARANHA, ARANHA_PALS, buildDeepTiles(), buildSprites6(), ESQ_PALS, ESQUELETO, KITSUNE, KITSUNE_PAL

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (3): frameWaiters, MAPS, World

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (4): Coop, COOP_COLORS, COOP_ICE, CoopUI

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (4): buildArenaTiles(), buildSprites8(), LEAO, LEAO_PAL

### Community 44 - "Community 44"
Cohesion: 0.05
Nodes (20): Config, ctx, cv, Dialog, Fade, G, Input, ITEMS (+12 more)

### Community 46 - "Community 46"
Cohesion: 0.07
Nodes (17): Battle, BATTLE_CLASSES, BOX_FULL, BTN, BULLET_DRAW, DRAGON_EVO, dragonBonus(), DRAGONS (+9 more)

### Community 47 - "Community 47"
Cohesion: 0.07
Nodes (12): BossBattle, BOSSES, bx0(), drawShikigami(), FUSHI, FUSHI_PAL, MODS, NOOB (+4 more)

### Community 48 - "Community 48"
Cohesion: 0.08
Nodes (18): addXp(), Coop, Dex, fillMissions(), Game, Hub, HUB_BTNS, loadProgress() (+10 more)

### Community 49 - "Community 49"
Cohesion: 0.08
Nodes (27): buildSprites(), buildTiles(), composePlayer(), DUMMY, FANTASMINHA, I_BASE, I_BLINK, I_WALK (+19 more)

### Community 51 - "Community 51"
Cohesion: 0.12
Nodes (18): buildPartySets(), buildSprites9(), buildTiles9(), CARMIM, CARMIM_PAL, DRESS, KAI, KAI_PAL (+10 more)

### Community 53 - "Community 53"
Cohesion: 0.15
Nodes (14): BRASA_PAL, BRASINHA, buildCityTiles(), buildSprites2(), DRAGON, DRAGON_FLAP, DRAGON_PALS, FIRE_PAL (+6 more)

### Community 54 - "Community 54"
Cohesion: 0.20
Nodes (10): buildIslandTiles(), buildSprites5(), CHOCO, CHOCO_PAL, GUARD_PAL, GUMMY, GUMMY_PALS, MACARON (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (10): buildSprites7(), buildVolcanoTiles(), DRACO, DRACO_PAL, drawDragonAura(), drawRider(), FANT_LAVA, FANT_LAVA_PAL (+2 more)

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (9): buildSnowTiles(), buildSprites3(), CAPUZ_PAL, ENCAPUZADO, NEVE_PAL, NEVOSO, PING_PAL, PINGUIM (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (8): buildFutureTiles(), buildSprites4(), BULLY_DOWN, KID_PALS, ROBOT, ROBOT_PALS, ROBOT_SAD, ROBOT_WHEEL

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (8): ARANHA, ARANHA_PALS, buildDeepTiles(), buildSprites6(), ESQ_PALS, ESQUELETO, KITSUNE, KITSUNE_PAL

### Community 59 - "Community 59"
Cohesion: 0.50
Nodes (4): buildArenaTiles(), buildSprites8(), LEAO, LEAO_PAL

## Knowledge Gaps
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Updater` connect `Community 45` to `Community 15`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07175141242937853 - nodes in this community are weakly interconnected._
- **Why does `MainActivity` connect `Community 2` to `Community 45`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04625346901017576 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05975609756097561 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.08048780487804878 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.05391120507399577 - nodes in this community are weakly interconnected._