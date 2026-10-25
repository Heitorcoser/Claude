# Criador de Batalhas

Crie batalhas no estilo Undertale pro seu fangame, sem programar:

- **Inimigo:** foto (da galeria), nome, vida, dano, defesa, música, falas, texto do CHECAR.
- **Você:** nome, vida, força e KARMA (opcional).
- **AGIR:** ações próprias que enchem a misericórdia para poupar.
- **Itens:** comidas que curam.
- **Ataques:** 11 tipos (chuva, dos lados, paredes com buraco, perseguem você, anel que fecha, canhão, cortes, espiral, alma azul, esmagar, quicando). Cada um com projétil (osso, estrela, faca, fogo, coração, bola, **qualquer emoji** ou **sua foto**), cor (normal, azul, laranja), velocidade, quantidade, duração e tamanho da caixa.
- **2ª fase:** quando a vida cai até uma % ou quando ele "morre" (volta com vida nova), com ataques, foto, música e falas novas — e pode quebrar o POUPAR.
- **Testar:** joga a batalha inteira ou só um ataque.
- **Compartilhar:** gera um código (`BTL1:...`) pra mandar pros amigos jogarem.

```
www/          o app (HTML5 Canvas + WebAudio)
  js/batalha.js   motor de batalha e os 11 tipos de ataque
  js/editor.js    lista de batalhas, editor e telas
  js/dados.js     batalha de exemplo, salvar e código de compartilhar
  js/engine.js    texto, controles (do PERDIDO)
  js/audio.js     efeitos e músicas (do PERDIDO)
android/      app Android (WebView, com galeria de fotos e compartilhar)
apk/          CriadorDeBatalhas.apk
```
