# Graph Report - boss-battles  (2026-10-24)

## Corpus Check
- 21 files · ~52,350 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 2, .xml 2, .properties 2)

## Summary
- 354 nodes · 477 edges · 20 communities (13 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3f386d46`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- engine.js
- Updater.java
- Battle
- bosses.js
- game.js
- sprites.js
- battle.js
- sprites9.js
- ApkProvider
- sprites2.js
- sprites5.js
- sprites7.js
- sprites3.js
- sprites4.js
- sprites6.js
- sprites8.js
- audio.js

## God Nodes (most connected - your core abstractions)
1. `Battle` - 43 edges
2. `Updater` - 12 edges
3. `MainActivity` - 11 edges
4. `ApkProvider` - 9 edges
5. `BossBattle` - 8 edges
6. `Typer` - 6 edges
7. `newMission()` - 4 edges
8. `buildSprites()` - 4 edges
9. `buildTiles()` - 4 edges
10. `isFireDragon()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `MainActivity` --references--> `Updater`  [EXTRACTED]
  android/app/src/main/java/com/heitorcoser/bossbattles/MainActivity.java → android/app/src/main/java/com/heitorcoser/bossbattles/Updater.java

## Import Cycles
- None detected.

## Communities (20 total, 7 thin omitted)

### Community 0 - "engine.js"
Cohesion: 0.05
Nodes (20): Config, ctx, cv, Dialog, Fade, G, Input, ITEMS (+12 more)

### Community 3 - "bosses.js"
Cohesion: 0.07
Nodes (12): BossBattle, BOSSES, bx0(), drawShikigami(), FUSHI, FUSHI_PAL, MODS, NOOB (+4 more)

### Community 4 - "game.js"
Cohesion: 0.08
Nodes (18): addXp(), Coop, Dex, fillMissions(), Game, Hub, HUB_BTNS, loadProgress() (+10 more)

### Community 5 - "sprites.js"
Cohesion: 0.08
Nodes (27): buildSprites(), buildTiles(), composePlayer(), DUMMY, FANTASMINHA, I_BASE, I_BLINK, I_WALK (+19 more)

### Community 6 - "battle.js"
Cohesion: 0.11
Nodes (15): BATTLE_CLASSES, BOX_FULL, BTN, BULLET_DRAW, DRAGON_EVO, dragonBonus(), DRAGONS, drawBtnIcon() (+7 more)

### Community 7 - "sprites9.js"
Cohesion: 0.12
Nodes (18): buildPartySets(), buildSprites9(), buildTiles9(), CARMIM, CARMIM_PAL, DRESS, KAI, KAI_PAL (+10 more)

### Community 9 - "sprites2.js"
Cohesion: 0.15
Nodes (14): BRASA_PAL, BRASINHA, buildCityTiles(), buildSprites2(), DRAGON, DRAGON_FLAP, DRAGON_PALS, FIRE_PAL (+6 more)

### Community 10 - "sprites5.js"
Cohesion: 0.20
Nodes (10): buildIslandTiles(), buildSprites5(), CHOCO, CHOCO_PAL, GUARD_PAL, GUMMY, GUMMY_PALS, MACARON (+2 more)

### Community 11 - "sprites7.js"
Cohesion: 0.22
Nodes (10): buildSprites7(), buildVolcanoTiles(), DRACO, DRACO_PAL, drawDragonAura(), drawRider(), FANT_LAVA, FANT_LAVA_PAL (+2 more)

### Community 12 - "sprites3.js"
Cohesion: 0.22
Nodes (9): buildSnowTiles(), buildSprites3(), CAPUZ_PAL, ENCAPUZADO, NEVE_PAL, NEVOSO, PING_PAL, PINGUIM (+1 more)

### Community 13 - "sprites4.js"
Cohesion: 0.25
Nodes (8): buildFutureTiles(), buildSprites4(), BULLY_DOWN, KID_PALS, ROBOT, ROBOT_PALS, ROBOT_SAD, ROBOT_WHEEL

### Community 14 - "sprites6.js"
Cohesion: 0.25
Nodes (8): ARANHA, ARANHA_PALS, buildDeepTiles(), buildSprites6(), ESQ_PALS, ESQUELETO, KITSUNE, KITSUNE_PAL

### Community 15 - "sprites8.js"
Cohesion: 0.50
Nodes (4): buildArenaTiles(), buildSprites8(), LEAO, LEAO_PAL

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Battle` connect `Battle` to `battle.js`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `engine.js` be split into smaller, more focused modules?**
  _Cohesion score 0.04625346901017576 - nodes in this community are weakly interconnected._
- **Should `Updater.java` be split into smaller, more focused modules?**
  _Cohesion score 0.06868686868686869 - nodes in this community are weakly interconnected._
- **Should `Battle` be split into smaller, more focused modules?**
  _Cohesion score 0.12660028449502134 - nodes in this community are weakly interconnected._
- **Should `bosses.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07056451612903226 - nodes in this community are weakly interconnected._
- **Should `game.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08465608465608465 - nodes in this community are weakly interconnected._
- **Should `sprites.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08465608465608465 - nodes in this community are weakly interconnected._