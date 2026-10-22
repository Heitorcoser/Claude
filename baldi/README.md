# Baldi's Basics: Beta Tester (fã-jogo)

Porte do **Baldi's Basics Classic 1.4.3** para a web (Three.js), feito a partir do projeto aberto (decompile) da release "Baldis". Roda no celular como APK (WebView com um mini servidor interno), sem precisar do Unity.

## Modos
- **História**: o jogo original. Mapa, texturas, sons, cadernos e personagens vêm da cena `School.unity`; a lógica foi reescrita dos scripts C#.
- **Infinito**: os cadernos voltam e o Baldi fica bravo com o tempo.
- **Beta Tester**: ala nova da escola (corredores, 2 salas de teste, biblioteca, depósito e laboratório; 10 cadernos), **Robô Inspetor** (vê você e avisa o Baldi), **Fantasma do Apagão** e eventos aleatórios (Apagão, Simulado de Incêndio, Chuva de Cadernos, Hora do Lanche, Sinal do Recreio).

## Arquivos
- `app/`: o jogo (`index.html`, `motor.js`, `jogo.js`, `beta.js`, `escola.json`, `malhas.json`, `assets/`).
- `tools/`: `extrai.py` lê a cena do Unity, `malhas.py` converte os modelos, `compacta.py` gera `app/escola.json`, `assets.sh` copia texturas e converte sons.
- `android/` + `build.sh`: gera `BaldiBetaTester.apk` (a chave de assinatura não vai para o repositório).
- `test/`: testes no navegador (Playwright).
- `CREDITOS.md`: origem e licença de tudo que é novo (imagens e sons em domínio público/CC0).

Baldi's Basics é de Basically Games (mystman12). Projeto de fã, sem fins lucrativos.
