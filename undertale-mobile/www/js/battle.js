// Sistema de batalha estilo Undertale: LUTAR / AGIR / ITEM / POUPAR + fase de desvio da ALMA.
'use strict';

const ENEMIES = {
  dummy: {
    name: 'Boneco', spr: 'dummy', scale: 6, hp: 15, atk: 0, def: 0, xp: 0, gold: 0, voice: 'narr',
    intro: '* O Boneco de treino bloqueia o caminho!',
    check: '* BONECO - ATK 0 DEF 0\n* Um boneco de pano. Paciência infinita.',
    acts: {
      'Conversar': { text: ['* Você conversa com o Boneco.', '* Ele não responde... mas parece feliz.'], mercy: 100 },
    },
    flavor: ['* O Boneco te encara sem olhos.', '* O Boneco está parado. Muito parado.', '* Cheira a pano velho.'],
    talk: ['...'], patterns: [],
  },
  musgolho: {
    name: 'Musgolho', spr: 'musgolho', scale: 6, hp: 24, atk: 3, def: 1, xp: 8, gold: 5, voice: 'musg',
    intro: '* Musgolho rola até você!',
    check: '* MUSGOLHO - ATK 3 DEF 1\n* Um olho que mora no musgo.\n* Só quer ser notado.',
    acts: {
      'Elogiar': { text: ['* Você elogia o olhar de Musgolho.', '* Musgolho pisca, envergonhado.'], mercy: 50 },
      'Regar': { text: ['* Você joga um pouco de água em Musgolho.', '* Ele fica mais verdinho e feliz!'], mercy: 60 },
      'Encarar': { text: ['* Você encara Musgolho.', '* Ele encara de volta. Ninguém pisca.', '* ...Musgolho ficou irritado!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* Musgolho está de olho em você.', '* Cheira a chuva e terra molhada.', '* Musgolho tenta parecer assustador.'],
    talk: ['Glub glub.', 'Tô de olho em você!', '*pisca*', 'Musgo é vida.'],
    spareTalk: 'Valeu... glub!',
    patterns: ['spores', 'vines'],
  },
  fantasminha: {
    name: 'Fantasminha', spr: 'fantasminha', scale: 6, hp: 20, atk: 2, def: 0, xp: 7, gold: 6, voice: 'ghost',
    intro: '* Fantasminha aparece... chorando?',
    check: '* FANTASMINHA - ATK 2 DEF 0\n* Um fantasma tímido.\n* Chora quando fica nervoso.',
    acts: {
      'Consolar': { text: ['* Você diz que vai ficar tudo bem.', '* Fantasminha funga... e sorri um pouquinho.'], mercy: 50 },
      'Piada': { text: ['* Você conta uma piada sobre lençóis.', '* Fantasminha ri tanto que fica transparente!'], mercy: 60 },
      'Assustar': { text: ['* Você faz "BUU!"', '* Fantasminha chora mais forte!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* Fantasminha flutua tristemente.', '* Um frio passa pelas suas costas.', '* Fantasminha enxuga as lágrimas.'],
    talk: ['snif... snif...', 'Não olha pra mim!', 'buu... hu hu.', 'Eu sou assustador?'],
    spareTalk: 'Você é legal... snif.',
    patterns: ['tears', 'orbs'],
  },
};

Object.assign(ENEMIES, {
  brasinha: {
    name: 'Brasinha', spr: 'brasinha', scale: 7, hp: 24, atk: 3, def: 1, xp: 12, gold: 9, voice: 'fire',
    intro: '* Brasinha estala na sua frente!',
    check: '* BRASINHA - ATK 3 DEF 1\n* Uma faísca que fugiu da lareira.\n* Morre de medo de vento forte.',
    acts: {
      'Aquecer mãos': { text: ['* Você aquece as mãos perto de Brasinha.', '* Ela se sente MUITO útil!'], mercy: 60 },
      'Elogiar brilho': { text: ['* Você diz que o brilho dela é lindo.', '* Brasinha fica mais quentinha.'], mercy: 50 },
      'Jogar água': { text: ['* Você joga água em Brasinha.', '* TSSSS! Ela ficou furiosa!'], mercy: -40, atkUp: 1 },
    },
    flavor: ['* Brasinha crepita alegremente.', '* Cheira a churrasco.', '* Brasinha dança no ritmo das chamas.'],
    talk: ['Tsss!', 'Fogo! Fogo!', 'Tô brilhando?', 'Não sopra, por favor.'],
    spareTalk: 'Que quentinho!',
    patterns: ['embers', 'fireRain'],
  },
  gelinho: {
    name: 'Gelinho', spr: 'gelinho', scale: 7, hp: 26, atk: 3, def: 2, xp: 12, gold: 9, voice: 'ice',
    intro: '* Gelinho escorrega até você!',
    check: '* GELINHO - ATK 3 DEF 2\n* Espião do IceGhost.\n* Péssimo em guardar segredos.',
    acts: {
      'Abraçar': { text: ['* Você abraça Gelinho.', '* Ele derrete um pouquinho... de felicidade.'], mercy: 55 },
      'Perguntar': { text: ['* Você pergunta sobre o IceGhost.', "* Gelinho: 'Ele coleciona humanos... CONGELADOS!'", "* Gelinho: 'Ops. Era segredo.'"], mercy: 50 },
      'Lamber': { text: ['* Você lambe Gelinho.', '* Sua língua grudou! Ele ficou ofendido.'], mercy: -40, atkUp: 1 },
    },
    flavor: ['* Gelinho está com frio. Óbvio.', '* Uma brisa gelada passa por você.', '* Gelinho finge que não está espionando.'],
    talk: ['Brrr...', 'Sou um espião. Shh.', 'O chefe vai saber!', 'Tá calor aqui, né?'],
    spareTalk: 'Não conto pro chefe!',
    patterns: ['snow', 'icicles'],
  },
  fireghost: {
    name: 'FireGhost', spr: 'fireghost', scale: 6, hp: 160, atk: 4, def: 2, xp: 60, gold: 60, voice: 'fire',
    boss: true, music: 'boss', turnLen: 7, bubbleW: 230,
    intro: '* FireGhost bloqueia o caminho!\n* Ele está rindo da própria piada.',
    check: '* FIREGHOST - ATK 4 DEF 2\n* Fantasma travesso, irmão do IceGhost.\n* Suas piadas queimam mais que fogo.',
    acts: {
      'Rir': { text: ['* Você ri da piada... com MUITO esforço.', '* FireGhost fica vermelho de alegria!'], mercy: 25 },
      'Contar piada': { text: ["* Você conta: 'Por que o fogo nunca perde? Porque ele sempre ARDE!'", "* FireGhost: 'ESSA FOI HORRÍVEL! ...Eu AMEI!'"], mercy: 35 },
      'Vaiar': { text: ['* Você vaia a piada.', '* FireGhost ficou FURIOSO! As chamas aumentam!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* FireGhost gargalha sozinho.', '* O ar está quente como um forno.', '* FireGhost ensaia uma piada nova.', '* Cheira a marshmallow queimado.'],
    talk: [
      'Por que o fantasma não mente? Porque dá pra ver através dele! HAHAHA!',
      "O que o fogo disse pro outro fogo? 'Tô em chamas por você!' HAHA!",
      'Qual o doce favorito do fantasma? BOO-lo! ...entendeu? BOOlo!',
      'Eu ia contar uma piada de fogo... mas ela é muito QUENTE pra você!',
      'Por que o dragão não joga cartas? Porque sempre QUEIMA a mão! HAHA!',
      'Você tá suando? Deve ser o meu CHARME ardente!',
      'Sabe o que o fantasma toma? Assombra-sorvete! HAHAHA!',
    ],
    spareTalk: 'Você... riu das minhas piadas? NINGUÉM ri!',
    patterns: ['fireRain', 'jokeWords', 'fireRing', 'skulls', 'walls', 'jokeWords', 'fireRing'],
    finale: ['finale', 'fireRing', 'finale', 'walls'],
  },
});

Object.assign(ENEMIES, {
  pinguim: {
    name: 'Pinguim Bravo', spr: 'pinguim', scale: 7, hp: 32, atk: 4, def: 2, xp: 18, gold: 12, voice: 'peng',
    intro: '* Pinguim Bravo desliza de barriga até você!',
    check: '* PINGUIM BRAVO - ATK 4 DEF 2\n* Guarda das armadilhas do IceGhost.\n* Ama peixe. Odeia ser ignorado.',
    acts: {
      'Imitar': { text: ['* Você imita o andar do pinguim.', '* Ele fica impressionado! Que talento!'], mercy: 50 },
      'Dar peixe': { text: ['* Você finge jogar um peixe.', '* Pinguim Bravo pula pra pegar... e fica feliz igual.'], mercy: 55 },
      'Ignorar': { text: ['* Você ignora o pinguim.', '* Ele fica MUITO ofendido!'], mercy: -40, atkUp: 1 },
    },
    flavor: ['* Pinguim Bravo bate as asinhas.', '* Cheira a peixe congelado.', '* Pinguim Bravo ajeita o smoking.'],
    talk: ['Quá!', 'Ninguém passa!', 'Ordens do chefe!', 'Tem peixe aí?'],
    spareTalk: 'Quá quá! Valeu!',
    patterns: ['slide', 'fish'],
  },
  nevoso: {
    name: 'Nevoso', spr: 'nevoso', scale: 6, hp: 36, atk: 4, def: 3, xp: 20, gold: 14, voice: 'narr',
    intro: '* Nevoso surge da neve!',
    check: '* NEVOSO - ATK 4 DEF 3\n* Um boneco de neve muito vaidoso.\n* Seu nariz vive caindo.',
    acts: {
      'Ajeitar nariz': { text: ['* Você ajeita a cenoura de Nevoso.', '* Ele se olha num lago congelado. Perfeito!'], mercy: 60 },
      'Dar cachecol': { text: ['* Você empresta seu cachecol imaginário.', '* Nevoso agradece muito, todo elegante.'], mercy: 50 },
      'Derreter': { text: ['* Você bafeja ar quente em Nevoso.', '* Ele ficou com MUITA raiva!'], mercy: -40, atkUp: 1 },
    },
    flavor: ['* Nevoso posa para uma foto invisível.', '* Um vento gelado sopra.', '* O nariz de Nevoso caiu. Ele finge que não.'],
    talk: ['Que frio gostoso.', 'Não me derrete!', 'Sou o mais bonito.', 'Brrrilhante!'],
    spareTalk: 'Você tem estilo!',
    patterns: ['snowballs', 'snow'],
  },
});

const INSULTS = ['LATA VELHA', 'ROBÔ!', 'NERD', 'ENFERRUJADO', 'BIP BOP', 'PARAFUSO', 'TORRADEIRA'];
Object.assign(ENEMIES, {
  ze: {
    name: 'Zé Marreta', spr: 'ze', scale: 6, hp: 30, atk: 4, def: 1, xp: 15, gold: 10, voice: 'bully', nonlethal: true, words: INSULTS,
    intro: '* Zé Marreta estala os dedos!',
    check: '* ZÉ MARRETA - ATK 4 DEF 1\n* Valentão de boné. Caiu aqui faz um ano.\n* Fala grosso, mas tem medo de escuro.',
    acts: {
      'Defender Bit': { text: ['* Você fica na frente do Bit.', '* Zé hesita. Não esperava isso.'], mercy: 40 },
      'Elogiar boné': { text: ['* Você elogia o boné do Zé.', '* Ele ajeita o boné, todo orgulhoso.'], mercy: 50 },
      'Mostrar língua': { text: ['* Você mostra a língua.', '* Zé ficou BRAVO!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* Zé Marreta estala os dedos de novo.', '* Cheira a lanche roubado.', '* Zé olha pros amigos esperando aprovação.'],
    talk: ['Sai da frente!', 'Lata velha!', 'Vou te amassar!', 'Hehehe!'],
    spareTalk: 'Tá... foi mal aí.',
    patterns: ['paperBalls', 'insults'],
  },
  teca: {
    name: 'Teca', spr: 'teca', scale: 6, hp: 30, atk: 4, def: 1, xp: 15, gold: 10, voice: 'bully', nonlethal: true, words: INSULTS,
    intro: '* Teca cruza os braços e bloqueia o caminho!',
    check: '* TECA - ATK 4 DEF 1\n* Joga borracha melhor que ninguém.\n* Na verdade queria um robô de estimação.',
    acts: {
      'Defender Bit': { text: ['* Você fica na frente do Bit.', '* Teca revira os olhos... mas para.'], mercy: 40 },
      'Perguntar': { text: ['* Você pergunta por que ela implica com o Bit.', "* Teca: 'Sei lá... todo mundo implica.'", '* Ela parece pensar nisso.'], mercy: 50 },
      'Puxar chiquinha': { text: ['* Você puxa a maria-chiquinha dela.', '* PÉSSIMA ideia. Ela ficou furiosa!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* Teca gira uma borracha no dedo.', '* Teca finge que não está olhando pro Bit.', '* Cheiro de apontador.'],
    talk: ['Robô nerd!', 'Toma borracha!', 'Que foi?!', 'Hunf.'],
    spareTalk: 'Hunf... tá bom.',
    patterns: ['erasers', 'rulers'],
  },
  drone: {
    name: 'Dronezinho', spr: 'drone', scale: 6, hp: 30, atk: 4, def: 2, xp: 16, gold: 12, voice: 'robot',
    intro: '* Dronezinho zumbe na sua cara!',
    check: '* DRONEZINHO - ATK 4 DEF 2\n* Câmera de segurança voadora.\n* Coleciona fotos de todo mundo.',
    acts: {
      'Fazer pose': { text: ['* Você faz uma pose incrível.', '* Dronezinho tira uma foto! FLASH! Ele amou.'], mercy: 60 },
      'Acenar': { text: ['* Você acena pra câmera.', '* Dronezinho acena de volta com a hélice.'], mercy: 45 },
      'Tapar câmera': { text: ['* Você tapa a câmera dele.', '* BZZT! Dronezinho ficou irritado!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* Dronezinho zumbe.', '* Uma luz vermelha pisca: GRAVANDO.', '* Dronezinho dá zoom no seu nariz.'],
    talk: ['BZZZ.', 'Sorria!', 'Registrando...', 'Clique!'],
    spareTalk: 'Foto salva! :)',
    patterns: ['lasers', 'dustballs'],
  },
  aspirabo: {
    name: 'Aspirabô', spr: 'aspirabo', scale: 6, hp: 34, atk: 4, def: 2, xp: 18, gold: 12, voice: 'robot',
    intro: '* Aspirabô quer aspirar VOCÊ!',
    check: '* ASPIRABÔ - ATK 4 DEF 2\n* Robô aspirador obcecado por limpeza.\n* Acha que tudo é sujeira.',
    acts: {
      'Jogar migalhas': { text: ['* Você espalha migalhas no chão.', '* Aspirabô fica FELIZ aspirando tudo!'], mercy: 60 },
      'Elogiar limpeza': { text: ['* Você diz que a rua está brilhando.', '* Aspirabô vibra de orgulho.'], mercy: 50 },
      'Pisar na sujeira': { text: ['* Você pisa num chiclete e espalha.', '* Aspirabô entrou em MODO TURBO!'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* Aspirabô faz VRRRRRR.', '* Tem um meio sanduíche preso nele.', '* Aspirabô bate na sua canela. De novo.'],
    talk: ['VRRRR!', 'Sujeira detectada.', 'Limpar! Limpar!', 'Bip... poeira.'],
    spareTalk: 'Tudo limpinho!',
    patterns: ['dustballs', 'erasers'],
  },
  valentoes: {
    name: 'Valentões', spr: 'brutao', scale: 6, hp: 190, atk: 5, def: 2, xp: 70, gold: 40, voice: 'bully',
    boss: true, group: true, nonlethal: true, music: 'valentoes', turnLen: 7, bubbleW: 230, words: INSULTS,
    intro: '* A GANGUE DOS VALENTÕES cerca o Bit!\n* Brutão, Teca e Zé atacam juntos!',
    check: '* VALENTÕES - ATK 5 DEF 2\n* Brutão, Teca e Zé Marreta.\n* Juntos parecem fortes. Separados, só crianças assustadas.',
    acts: {
      'Defender Bit': { text: ['* Você fica na frente do Bit.', '* Os valentões hesitam por um segundo.'], mercy: 20 },
      'Conversar': { text: B => B.e.mercy < 34
          ? ['* Você conversa com o Zé.', "* Zé: '...Ninguém nunca perguntou o que eu acho.'"]
          : B.e.mercy < 67 ? ['* Você conversa com a Teca.', "* Teca: 'A gente implica porque... ele é diferente. Sei lá.'"]
          : ['* Você conversa com o Brutão.', "* Brutão: '...Eu também caí aqui sozinho. Fiquei com medo de tudo.'"], mercy: 25 },
      'Mostrar amizade': { text: ['* Você e o Bit fazem um TOCA AQUI!', '* Os valentões ficam sem graça...'], mercy: 30 },
      'Zoar': { text: ['* Você zoa os valentões.', '* Péssima ideia. Eles ficaram FURIOSOS!'], mercy: -25, atkUp: 1 },
    },
    flavor: ['* Os valentões cercam o Bit.', '* Brutão estala o pescoço.', '* Teca e Zé cochicham.', '* Cheiro de recreio e confusão.'],
    talk: ['BRUTÃO: Pega ele!', 'TECA: Lata velha!', 'ZÉ: Hehehe, toma!', 'BRUTÃO: Ninguém gosta de robô!', 'TECA: Volta pro ferro-velho!', 'ZÉ: Mochilada!'],
    spareTalk: 'BRUTÃO: ...Desculpa, Bit.',
    patterns: ['paperBalls', 'protect', 'erasers', 'insults', 'backpacks', 'protect', 'rulers'],
    finale: ['protect', 'backpacks', 'insults', 'protect', 'rulers'],
  },
});

const PROPAGANDA = ['ORDEM', 'OBEDEÇA', 'SUPERIOR', 'SILÊNCIO', 'TRABALHE', 'INFERIOR', 'NÚMERO'];
Object.assign(ENEMIES, {
  pirulito: {
    name: 'Capataz Pirulito', spr: 'pirulito', scale: 6, hp: 56, atk: 5, def: 2, xp: 25, gold: 0, voice: 'harsh', nonlethal: true, words: PROPAGANDA,
    intro: '* O Capataz Pirulito apita na sua cara!',
    check: '* CAPATAZ PIRULITO - ATK 5 DEF 2\n* Repete as regras sem pensar.\n* Tem mais medo do Diretor do que de qualquer um.',
    acts: {
      'Defender Ferrugem': { text: ['* Você fica na frente do Ferrugem.', '* Pirulito não esperava que um número reagisse.'], mercy: 35 },
      'Perguntar': { text: ['* Você pergunta: "Por que você faz isso?"', "* Pirulito: '...São as ordens. Eu só cumpro as ordens.'", '* Ele mesmo parece não acreditar.'], mercy: 35 },
      'Encarar': { text: ['* Você encara o Capataz sem abaixar a cabeça.', '* Ele desvia o olhar primeiro.'], mercy: 30 },
    },
    flavor: ['* Pirulito apita sem motivo.', '* "Regra número 1: obedecer."', '* O apito dele treme um pouco.'],
    talk: ['TRABALHE!', 'Números não falam!', 'ORDEM!', 'Volta pra fila!'],
    spareTalk: '...Volta pro trabalho.',
    patterns: ['march', 'propaganda', 'cubes'],
  },
  chocolate: {
    name: 'Chocolate', spr: 'choco', scale: 6, hp: 44, atk: 4, def: 2, xp: 20, gold: 0, voice: 'narr', nonlethal: true, words: PROPAGANDA,
    intro: '* Chocolate aponta a lanterna pra você.\n* As mãos dele estão tremendo.',
    check: '* CHOCOLATE - ATK 4 DEF 2\n* Guarda jovem. Entrou no exército porque mandaram.\n* Não dorme direito faz semanas.',
    acts: {
      'Lembrar do pão': { text: ['* Você lembra do pão que ele te deu escondido.', "* Chocolate: '...Eu não devia ter feito aquilo. Ou devia?'"], mercy: 40 },
      'Mostrar o número': { text: ['* Você mostra o número no seu peito.', '* "Eu tenho um NOME. Assim como você."', '* Chocolate abaixa a lanterna.'], mercy: 35 },
      'Perguntar por quê': { text: ['* Você pergunta por que ele faz isso.', "* Chocolate: 'Me disseram que era o certo... que vocês eram perigosos.'", "* 'Mas você não parece perigoso.'"], mercy: 35 },
    },
    flavor: ['* Chocolate olha para os lados, nervoso.', '* A lanterna pisca.', '* Chocolate está derretendo de suor.'],
    talk: ['P-para!', 'Volta pro barracão!', 'Eu... eu tenho ordens!', 'Não me olha assim...'],
    spareTalk: 'Vai. Antes que eu mude de ideia.',
    patterns: ['spotlight', 'march'],
  },
  macaron: {
    name: 'Diretor Macaron', spr: 'macaron', scale: 6, hp: 330, atk: 6, def: 8, xp: 120, gold: 0, voice: 'posh',
    boss: true, nonlethal: true, noSpare: true, music: 'macaron', turnLen: 7.5, bubbleW: 240, words: PROPAGANDA,
    intro: '* O DIRETOR MACARON DOURADO se levanta do trono.\n* "Vocês não passam de NÚMEROS."',
    check: '* DIRETOR MACARON - ATK 6 DEF 8\n* O doce mais caro da ilha. Comanda o campo.\n* A defesa dele vem do medo dos outros.',
    acts: {
      'Recusar obedecer': { text: ['* Você se recusa a obedecer.', '* Pela primeira vez, ninguém abaixa a cabeça.', '* A DEFESA de Macaron caiu!'], mercy: 0, defDown: 2 },
      'Lembrar vítimas': { text: ['* Você lembra de cada número... e de cada NOME por trás deles.', '* Os prisioneiros lá fora gritam seus nomes.', '* A DEFESA de Macaron caiu!'], mercy: 0, defDown: 2 },
      'Rasgar cartaz': { text: ['* Você rasga um cartaz de propaganda.', '* "DOCES SÃO SUPERIORES" vira papel picado.', '* O ATAQUE de Macaron caiu!'], mercy: 0, atkDown: 1 },
    },
    flavor: ['* Macaron ajeita o monóculo.', '* O salão cheira a açúcar e medo.', '* Os guardas lá fora largaram as armas.', '* Macaron grita ordens. Ninguém obedece mais.'],
    talk: [
      'Vocês nasceram para SERVIR.',
      'Os doces são SUPERIORES. Sempre foram.',
      'Um número não tem nome, não tem voz.',
      'Eu construí esta ilha com ORDEM!',
      'Ninguém vai lembrar de vocês.',
      'Por que... por que ninguém me obedece?!',
    ],
    defeatText: ['* Macaron cai de joelhos. O monóculo rola pelo chão.', "* 'Isso... não pode acontecer... eu sou SUPERIOR...'", '* Ninguém é superior a ninguém.'],
    patterns: ['propaganda', 'march', 'cubes', 'coins', 'spotlight', 'propaganda', 'march'],
    finale: ['macaronFinale', 'coins', 'macaronFinale', 'spotlight'],
  },
});

Object.assign(ENEMIES, {
  aranhaSold: {
    name: 'Aranha Soldado', spr: 'aranhaSold', scale: 6, hp: 40, atk: 5, def: 3, xp: 22, gold: 10, voice: 'spider',
    intro: '* Uma Aranha Soldado desce do teto!',
    check: '* ARANHA SOLDADO - ATK 5 DEF 3\n* Acredita que os esqueletos roubaram os ovos da colônia.\n* Quem contou isso foram os fantasmas.',
    acts: {
      'Falar dos filhos': { text: ['* Você pergunta se ela tem filhos.', "* 'Três... Eu nem sei onde eles estão agora.'", '* Ela abaixa as patas.'], mercy: 45 },
      'Contar a verdade': { text: ['* Você conta que foram os FANTASMAS que inventaram tudo.', '* A Aranha Soldado hesita.'], mercy: 45 },
      'Ameaçar': { text: ['* Você ameaça a aranha.', '* Ela fica com MAIS medo... e mais perigosa.'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* A Aranha Soldado tece em silêncio.', '* Ao longe, alguém chama um nome.', '* Cheiro de fumaça e seda queimada.'],
    talk: ['Pelos ovos!', 'Saia da frente!', 'Vocês começaram!', '...Cadê meus filhos?'],
    spareTalk: 'Eu só quero ir pra casa.',
    patterns: ['webs', 'spiderlings'],
  },
  esqSold: {
    name: 'Esqueleto Soldado', spr: 'esqSold', scale: 6, hp: 42, atk: 5, def: 3, xp: 22, gold: 10, voice: 'bones',
    intro: '* Um Esqueleto Soldado chacoalha a lança!',
    check: '* ESQUELETO SOLDADO - ATK 5 DEF 3\n* Acredita que as aranhas querem os ossos da cidade.\n* Quem contou isso foram os fantasmas.',
    acts: {
      'Perguntar da família': { text: ['* Você pergunta da família dele.', "* 'Minha filha... ficou do outro lado da ponte quando tudo começou.'"], mercy: 45 },
      'Contar a verdade': { text: ['* Você conta que foram os FANTASMAS que inventaram tudo.', '* O esqueleto abaixa a lança devagar.'], mercy: 45 },
      'Ameaçar': { text: ['* Você ameaça o esqueleto.', '* Os ossos dele tremem de raiva.'], mercy: -30, atkUp: 1 },
    },
    flavor: ['* O Esqueleto Soldado range os dentes.', '* Os ossos dele estalam de cansaço.', '* Uma ponte desaba lá longe.'],
    talk: ['Pela cidade!', 'Aranhas traidoras!', 'Volte pro buraco!', 'Eu... não sei mais.'],
    spareTalk: 'Chega. Eu cansei.',
    patterns: ['bones', 'boneThrow'],
  },
  irmaos: {
    name: 'Irmãos Fantasmas', spr: 'iceghost', scale: 5, hp: 400, atk: 6, def: 4, xp: 150, gold: 0, voice: 'ice',
    boss: true, nonlethal: true, brothers: true, music: 'irmaos', turnLen: 7.5, bubbleW: 240,
    intro: '* FireGhost e IceGhost atacam JUNTOS!',
    check: '* IRMÃOS FANTASMAS - ATK 6 DEF 4\n* Fogo e gelo. Começaram uma guerra inteira\n* só para te atingir.',
    acts: {
      'Mostrar a guerra': { text: ['* Você fala das mães e dos filhos separados pela guerra.', '* Os irmãos ficam em silêncio por um momento.'], mercy: 25 },
      'Separar os dois': { text: ['* Você se coloca entre fogo e gelo.', '* Os ataques deles se atrapalham!', '* A DEFESA deles caiu!'], mercy: 15, defDown: 1 },
      'Lembrar o passado': { text: ['* Você lembra do escorregador, das piadas, da casinha do rio...', '* FireGhost olha pro irmão, confuso.'], mercy: 25 },
    },
    flavor: ['* Fogo e gelo giram em volta de você.', '* O chão de cristal treme.', '* IceGhost não tira os olhos de você.', '* FireGhost não conta nenhuma piada.'],
    talk: [
      'G: Como você AINDA está vivo?!',
      'F: Era pra ser só uma brincadeira... virou guerra!',
      'G: Tudo isso é culpa SUA, humano.',
      'F: Irmão... a gente exagerou?',
      'G: Uma nova era de CAOS!',
      'F: ...Eu não acho mais graça.',
    ],
    spareTalk: 'G: ...Chega. A gente para.',
    defeatText: ['* Os Irmãos Fantasmas caem, exaustos.', '* As chamas e o gelo quase se apagam.'],
    patterns: ['fireRain', 'icicles', 'fireRing', 'snow', 'jokeWords', 'frostfire', 'skulls'],
    finale: ['frostfire', 'fireRing', 'frostfire', 'icicles'],
  },
  kitsune: {
    name: 'Guardiã Kitsune', spr: 'kitsune', scale: 6, hp: 120, atk: 5, def: 3, xp: 60, gold: 0, voice: 'fox', nonlethal: true, boss: true, music: 'sakura',
    intro: '* A GUARDIÃ KITSUNE protege o portão de Neo-Sakura!',
    check: '* GUARDIÃ KITSUNE - ATK 5 DEF 3\n* Protege a cidade há 300 anos.\n* Tem medo de que a guerra venha junto com vocês.',
    acts: {
      'Mostrar as aranhinhas': { text: ['* Você mostra as aranhas bebês, tremendo de frio.', '* As caudas da Kitsune abaixam um pouco.'], mercy: 35 },
      'Prometer': { text: ['* Você promete que ninguém vai trazer guerra para a cidade.', "* 'Promessas são fáceis, humano.'"], mercy: 25 },
      'Contar a história': { text: ['* Você conta tudo: os fantasmas, a guerra, as famílias sem casa.', "* 'Então vocês também fogem da dor...'"], mercy: 40 },
    },
    flavor: ['* Pétalas de cerejeira caem devagar.', '* A Kitsune balança as nove... três caudas.', '* Lanternas vermelhas balançam no vento.'],
    talk: ['Esta cidade é nossa paz.', 'A guerra segue vocês.', 'Provem que são dignos.', '...Eles são só crianças.'],
    spareTalk: 'Entrem. Mas cuidem desta paz.',
    patterns: ['foxfire', 'petals', 'foxfire'],
  },
  guerra: {
    name: 'A Guerra', spr: 'esqSold', scale: 5, hp: 9999, atk: 6, def: 99, xp: 0, gold: 0, voice: 'narr',
    boss: true, nonlethal: true, endless: true, noSpare: true, music: 'guerra', turnLen: 6, war: true,
    intro: '* A GUERRA chegou a Neo-Sakura.\n* Soldados de todos os lados invadem as ruas.',
    check: '* A GUERRA - ATK ? DEF ?\n* Não tem rosto. Não tem fim.\n* Ninguém lembra mais por que ela começou.',
    acts: {
      'Gritar PAREM': { text: ['* Você grita: "PAREM! POR FAVOR!"', '* Ninguém escuta. O barulho é alto demais.'], mercy: 0 },
      'Proteger civis': { text: ['* Você ajuda uma família a fugir.', '* Mas outras dez ainda precisam de ajuda.'], mercy: 0 },
    },
    flavor: ['* Prédios caem ao longe.', '* Sirenes. Gritos. Fumaça.', '* Mais soldados chegam. E mais. E mais.'],
    talk: ['...', 'AVANÇAR!', 'Pela colônia!', 'Pela cidade!'],
    patterns: ['march', 'bones', 'webs'],
  },
});

Object.assign(ENEMIES, {
  golemLava: {
    name: 'Golem de Lava', spr: 'golemLava', scale: 7, hp: 70, atk: 6, def: 3, xp: 40, gold: 18, voice: 'bones',
    intro: '* Um GOLEM DE LAVA se levanta da rocha!',
    check: '* GOLEM DE LAVA - ATK 6 DEF 3\n* Pesado e lento. Por dentro, é quentinho.\n* Só quer proteger a montanha.',
    acts: {
      'Esfriar com água': { text: ['* Você joga água no Golem.', '* Ele chia: TSSSSS!', '* ...Ele parece aliviado.'], mercy: 45 },
      'Elogiar as rochas': { text: ['* Você diz que as rochas dele são muito bonitas.', '* As rachaduras brilham de vergonha.'], mercy: 35 },
      'Dar um abraço': { text: ['* Você abraça o Golem. AI! QUENTE!', '* (-3 HP) Mas ele ficou muito feliz.'], mercy: 50, hurt: 3 },
    },
    flavor: ['* O chão treme a cada passo.', '* Cheiro de enxofre.', '* O Golem range como uma pedra velha.'],
    talk: ['GRRRMMM.', 'MONTANHA... DORME.', 'NÃO... ACORDE... ELA.', '...QUENTE.'],
    spareTalk: 'GRRM... AMIGO.',
    patterns: ['magmaRocks', 'lavaPillars'],
  },
  fantLava: {
    name: 'Fantasma de Lava', spr: 'fantLava', scale: 6, hp: 45, atk: 5, def: 2, xp: 30, gold: 14, voice: 'fire',
    intro: '* Um FANTASMA DE LAVA borbulha na sua frente!',
    check: '* FANTASMA DE LAVA - ATK 5 DEF 2\n* Primo distante do FireGhost.\n* Também conta piadas. Piores.',
    acts: {
      'Rir da piada': { text: ['* Ele conta: "Por que o vulcão foi ao médico? Tava com ERUPÇÃO!"', '* Você ri. Ele borbulha de alegria.'], mercy: 50 },
      'Falar do FireGhost': { text: ['* Você conta que conheceu o FireGhost.', '* "O PRIMÃO?! Ele ainda conta a do sorvete?"'], mercy: 40 },
      'Soprar': { text: ['* Você sopra o Fantasma.', '* Ele esfria um pouquinho e fica tímido.'], mercy: 25 },
    },
    flavor: ['* Bolhas de lava estouram no ar.', '* O Fantasma derrete e se refaz.', '* Está ficando quente aqui.'],
    talk: ['Blub blub!', 'Quer ouvir uma piada?', 'Tô FERVENDO de rir!', 'Hehe... magma.'],
    spareTalk: 'Blub! Você é legal!',
    patterns: ['embers', 'lavaBalls'],
  },
  anciao: {
    name: 'Dragão Ancião', spr: 'dragaoAnciao', scale: 6, hp: 260, atk: 6, def: 3, xp: 120, gold: 0, voice: 'dragon',
    boss: true, nonlethal: true, trainDragon: true, music: 'draco', turnLen: 6.5,
    intro: '* PROVA FINAL: o DRAGÃO ANCIÃO do Mestre Draco!\n* Mostre tudo o que você e seu dragão aprenderam.',
    check: '* DRAGÃO ANCIÃO - ATK 6 DEF 3\n* Tem 500 anos. Já treinou cem dragões.\n* Use seu DRAGÃO para impressioná-lo.',
    acts: {
      'Mostrar respeito': { text: ['* Você se curva diante do Ancião.', '* Ele solta uma fumacinha pelo nariz. Aprovação.'], mercy: 25 },
      'Rugir junto': { text: ['* Você e seu dragão rugem ao mesmo tempo: ROOOAR!', '* O Ancião sorri com os dentes todos.'], mercy: 25 },
      'Voar em círculos': { text: ['* Seu dragão voa em círculos em volta do Ancião.', '* "Asas fortes. Mas ainda falta coragem."'], mercy: 20 },
    },
    flavor: ['* O Ancião observa cada movimento.', '* O chão da arena está pegando fogo.', '* Mestre Draco grita instruções lá de fora.'],
    talk: ['Mostre suas asas.', 'Mais forte!', 'Um dragão protege. Não destrói.', 'Hm. Nada mal.'],
    spareTalk: 'Você está pronto.',
    patterns: ['embers', 'magmaRocks', 'wingGust', 'lavaBalls'],
    finale: ['lavaPillars', 'wingGust', 'lavaPillars'],
  },
});

const DRAGONS = {
  preto: { name: 'Dragão Preto', act: 'Dragão: Investida', desc: 'FORTE. +3 de ATAQUE e golpes devastadores.' },
  branco: { name: 'Dragão Branco', act: 'Dragão: Ventania', desc: 'RÁPIDO. Sua ALMA fica mais veloz e ele encurta os ataques.' },
  laranja: { name: 'Dragão Laranja', act: 'Dragão: Sopro', desc: 'SOLTA FOGO. Queima o inimigo por vários turnos.' },
  // formas evoluídas (Fase 8, com o Coração do Vulcão)
  lava: { name: 'Dragão de Lava', act: 'Dragão: Magma', base: 'laranja', desc: 'MAGMA. Muito mais dano e queima por mais tempo.' },
  neve: { name: 'Dragão de Neve', act: 'Dragão: Congelar', base: 'branco', desc: 'MUITO RÁPIDO. Congela o inimigo por 1 ataque.' },
  trevas: { name: 'Dragão das Trevas', act: 'Dragão: Trevas', base: 'preto', desc: 'TREVAS. Um golpe com dano altíssimo.' },
};
const DRAGON_EVO = { laranja: 'lava', branco: 'neve', preto: 'trevas' };
const isFireDragon = k => k === 'laranja' || k === 'lava';
// Bônus de dano do treino com o Mestre Draco (Fase 8)
const dragonBonus = () => (G.dragonLv || 0) * 4;

const BTN = [
  { label: 'LUTAR', x: 22, icon: 'fight' },
  { label: 'AGIR', x: 177, icon: 'act' },
  { label: 'ITEM', x: 332, icon: 'item' },
  { label: 'POUPAR', x: 487, icon: 'mercy' },
];
const BTN_Y = 422, BTN_W = 131, BTN_H = 46;
const BOX_FULL = { x: 32, y: 250, w: 576, h: 140 };

class Battle {
  constructor(key, opts = {}) {
    const def = ENEMIES[key];
    this.key = key;
    this.e = { ...def, hpNow: def.hp, mercy: 0, atkNow: def.atk, shake: 0, alpha: 1 };
    this.opts = opts; // {tutorial, withInstr, onEnd}
    this.state = 'start';
    this.btn = 0; this.sel = 0;
    this.box = { ...BOX_FULL }; this.boxTarget = { ...BOX_FULL };
    this.typer = null; this.textQueue = []; this.textDone = null;
    this.bullets = []; this.soul = { x: 320, y: 320, inv: 0 };
    this.t = 0; this.turn = 0; this.dmgPop = null; this.particles = [];
    this.bubble = null; this.instrCast = null; this.instrHealUsed = false;
    this.practiceDone = false; this.magicCd = 0;
    this.dragon = opts.dragon || null; this.dragonCd = 0; this.burn = 0; this.burnDmg = 5; this.frozen = 0; this.haste = 0; this.dragonFx = null;
    this.robot = !!opts.robot; this.robotCd = 0; this.musicFx = null;
    if (this.robot && def.group) this.robotBat = 100;
    this.flavorTyper = new Typer(def.intro, 'narr', 520, 32);
    Sfx.playMusic(def.music || 'battle');
    this.introT = 0;
  }

  // ---------- utilidades ----------
  say(items, then) {
    this.textQueue = items.map(it => typeof it === 'string' ? { t: it } : it);
    this.textDone = then; this.state = 'text'; this.nextText();
  }
  nextText() {
    let it = this.textQueue.shift();
    if (!it) { this.typer = null; const d = this.textDone; this.textDone = null; d && d(); return; }
    const maxW = it.who === 'instr' ? 420 : 530;
    const pages = paginate(it.t, maxW, 32, 3);
    if (pages.length > 1) { this.textQueue.unshift(...pages.slice(1).map(t => ({ ...it, t }))); it = { ...it, t: pages[0] }; }
    this.typerWho = it.who;
    this.typer = new Typer(it.t, it.who === 'instr' ? 'instr' : 'narr', maxW + 4, 32);
  }
  toMenu() {
    this.state = 'menu';
    this.boxTarget = { ...BOX_FULL };
    const fl = this.e.mercy >= 100 ? `* ${this.e.name} não quer mais lutar.` : this.e.flavor[(Math.random() * this.e.flavor.length) | 0];
    this.flavorTyper = new Typer(fl, 'narr', 520, 32);
  }
  get spareable() { return this.e.mercy >= 100; }

  actList() {
    const list = [{ name: 'Checar', kind: 'check' }];
    for (const n of Object.keys(this.e.acts)) list.push({ name: n, kind: 'act' });
    if (this.opts.withInstr) {
      list.push({ name: 'Instr: Magia', kind: 'magic', disabled: this.magicCd > 0 });
      if (!this.opts.instrNoCalm) list.push({ name: 'Instr: Acalmar', kind: 'calm' });
    }
    if (this.dragon) list.push({ name: DRAGONS[this.dragon].act, kind: 'dragon', disabled: this.dragonCd > 0 });
    if (this.robot) list.push({ name: 'Bit: Música', kind: 'robot', disabled: this.robotCd > 0 || this.robotBat <= 0 });
    return list;
  }

  // ---------- atualização ----------
  update(dt) {
    this.t += dt;
    const lerp = (a, b) => a + (b - a) * Math.min(1, dt * 10);
    for (const k of ['x', 'y', 'w', 'h']) this.box[k] = lerp(this.box[k], this.boxTarget[k]);
    if (this.e.shake > 0) this.e.shake -= dt;
    if (this.dmgPop) { this.dmgPop.t += dt; }
    this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 20 * dt; p.life -= dt; });
    this.particles = this.particles.filter(p => p.life > 0);
    if (this.instrCast) {
      this.instrCast.t += dt;
    }
    const fn = this['st_' + this.state];
    fn && fn.call(this, dt);
  }

  st_start(dt) {
    this.introT += dt;
    if (this.introT > 0.4) {
      if (this.opts.tutorial) {
        this.say([
          { who: 'instr', t: 'Esta é uma BATALHA. Não tenha medo!' },
          { who: 'instr', t: 'LUTAR ataca. AGIR interage. ITEM usa itens. POUPAR tem piedade.' },
          { who: 'instr', t: 'Toque num botão ou use as setas e o botão A. Tente!' },
        ], () => this.toMenu());
      } else if (this.opts.withInstr && !G.flags.instrBattleTip) {
        G.flags.instrBattleTip = true;
        this.say([
          { who: 'instr', t: 'Estou com você! Em AGIR você pode me chamar.' },
          { who: 'instr', t: 'Eu solto MAGIA para atacar, ou ACALMO o monstro para você poupar.' },
        ], () => this.toMenu());
      } else if (this.dragon && !G.flags.dragonBattleTip) {
        G.flags.dragonBattleTip = true;
        this.say([`* Seu ${DRAGONS[this.dragon].name.toUpperCase()} surgiu para lutar ao seu lado!`, `* (Use AGIR → ${DRAGONS[this.dragon].act})`], () => this.toMenu());
      } else this.toMenu();
    }
  }

  st_text(dt) {
    if (!this.typer) return;
    this.typer.update(dt);
    if (Input.isPressed('a') || Input.tap) {
      if (this.typer.done) { Sfx.move(); this.nextText(); } else this.typer.skip();
    } else if (Input.isPressed('b')) this.typer.skip();
  }

  st_menu(dt) {
    this.flavorTyper.update(dt);
    if (this.burnPending) {
      this.burnPending = false;
      Sfx.fire();
      this.dealDamage(this.burnDmg, () => this.say([`* ${this.e.name} está queimando! (-${this.burnDmg})`], () => this.toMenu()), true);
      return;
    }
    // ajuda do Instrutor quando o HP está baixo
    if (this.opts.withInstr && !this.instrHealUsed && G.hp <= Math.ceil(G.maxhp * 0.3)) {
      this.instrHealUsed = true;
      G.hp = Math.min(G.maxhp, G.hp + 10); Sfx.heal();
      this.say([{ who: 'instr', t: 'Você está ferido! Deixa eu ajudar...' }, '* O Instrutor te curou 10 HP.'], () => this.toMenu());
      return;
    }
    if (Input.isPressed('left')) { this.btn = (this.btn + 3) % 4; Sfx.move(); }
    if (Input.isPressed('right')) { this.btn = (this.btn + 1) % 4; Sfx.move(); }
    let choose = Input.isPressed('a');
    if (Input.tap) {
      const i = BTN.findIndex(b => hit(Input.tap, b.x, BTN_Y, BTN_W, BTN_H));
      if (i >= 0) { this.btn = i; choose = true; }
    }
    if (!choose) return;
    Sfx.select(); this.sel = 0;
    if (this.btn === 0) this.startFight();
    else if (this.btn === 1) this.state = 'actMenu';
    else if (this.btn === 2) {
      if (!G.items.length) { Sfx.back(); return; }
      this.state = 'itemMenu';
    } else this.state = 'mercyMenu';
  }

  // Lista de opções genérica na caixa (2 colunas)
  listInput(n, cols = 2) {
    if (Input.isPressed('b')) { Sfx.back(); this.state = 'menu'; return -2; }
    const s = this.sel;
    if (Input.isPressed('right') && s % cols < cols - 1 && s + 1 < n) this.sel++;
    if (Input.isPressed('left') && s % cols > 0) this.sel--;
    if (Input.isPressed('down') && s + cols < n) this.sel += cols;
    if (Input.isPressed('up') && s - cols >= 0) this.sel -= cols;
    if (s !== this.sel) Sfx.move();
    if (Input.tap) {
      const per = cols * 3, pg = Math.floor(this.sel / per), pages = Math.ceil(n / per);
      if (pages > 1 && hit(Input.tap, 520, 366, 90, 26)) { this.sel = Math.min(n - 1, ((pg + 1) % pages) * per); Sfx.move(); return -1; }
      for (let i = pg * per; i < Math.min(n, pg * per + per); i++) {
        const r = this.optRect(i, cols);
        if (hit(Input.tap, r.x, r.y, r.w, r.h)) { this.sel = i; return i; }
      }
      const b = BTN.findIndex(bb => hit(Input.tap, bb.x, BTN_Y, BTN_W, BTN_H));
      if (b >= 0 && b !== this.btn) { Sfx.back(); this.btn = b; this.state = 'menu'; return -2; }
    }
    if (Input.isPressed('a')) return this.sel;
    return -1;
  }
  optRect(i, cols = 2) {
    // 3 linhas por página: o resto vai para as páginas seguintes
    const cw = cols === 1 ? 520 : 270, k = i % (cols * 3);
    return { x: 60 + (k % cols) * cw, y: 268 + Math.floor(k / cols) * 36, w: cw - 10, h: 34 };
  }

  st_actMenu() {
    const list = this.actList();
    const i = this.listInput(list.length);
    if (i < 0) return;
    const a = list[i];
    if (a.disabled) { Sfx.back(); return; }
    Sfx.select();
    if (a.kind === 'check') this.say([this.e.check], () => this.afterPlayer());
    else if (a.kind === 'act') {
      const act = this.e.acts[a.name];
      this.e.mercy = Math.max(0, Math.min(100, this.e.mercy + act.mercy));
      if (act.atkUp) this.e.atkNow += act.atkUp;
      if (act.atkDown) this.e.atkNow = Math.max(2, this.e.atkNow - act.atkDown);
      if (act.defDown) this.e.def = Math.max(0, this.e.def - act.defDown);
      if (act.hurt) { G.hp = Math.max(1, G.hp - act.hurt); Sfx.hurt(); }
      const t = (typeof act.text === 'function' ? act.text(this) : act.text).slice();
      if (this.spareable) t.push(`* ${this.e.name} não quer mais lutar.`);
      this.say(t, () => this.afterPlayer());
    } else if (a.kind === 'magic') {
      this.magicCd = 2;
      this.instrCast = { t: 0 };
      Sfx.magic();
      this.say([{ who: 'instr', t: 'Lá vai! ESTRELA ARCANA!' }], () => {
        const dmg = 9 + ((Math.random() * 5) | 0);
        this.instrCast = null;
        this.dealDamage(dmg, () => this.afterPlayer());
      });
    } else if (a.kind === 'robot') {
      this.robotCd = 2;
      const before = G.hp;
      G.hp = Math.min(G.maxhp, G.hp + 6 + 4 * G.lv);
      Sfx.robotSong(); this.musicFx = { t: 0 };
      this.say(['* BIT toca uma música animada!', `* A melodia te enche de energia! (+${G.hp - before} HP)`], () => { this.musicFx = null; this.afterPlayer(); });
    } else if (a.kind === 'dragon') {
      this.dragonCd = 2;
      this.useDragon();
    } else if (a.kind === 'calm') {
      this.e.mercy = Math.min(100, this.e.mercy + 50);
      Sfx.spare();
      const t = [{ who: 'instr', t: 'Calma, calma... ninguém precisa se machucar.' }, `* O Instrutor acalmou ${this.e.name}.`];
      if (this.spareable) t.push(`* ${this.e.name} não quer mais lutar.`);
      this.say(t, () => this.afterPlayer());
    }
  }

  st_itemMenu() {
    const i = this.listInput(G.items.length);
    if (i < 0) return;
    Sfx.select();
    const msg = useItem(i);
    this.say([msg], () => this.afterPlayer());
  }

  st_mercyMenu() {
    const opts = (this.opts.tutorial || this.e.boss) ? ['Poupar'] : ['Poupar', 'Fugir'];
    const i = this.listInput(opts.length, 1);
    if (i < 0) return;
    Sfx.select();
    if (i === 0) {
      if (this.e.noSpare) { return this.say(['* Macaron ri com desprezo.', "* 'Piedade? Eu nunca tive piedade de ninguém.'", '* (Ele precisa ser DETIDO.)'], () => this.afterPlayer()); }
      if (this.spareable) return this.doSpare();
      this.say([`* Você tentou poupar ${this.e.name}...`, '* Mas ele ainda quer lutar.'], () => this.afterPlayer());
    } else {
      if (Math.random() < 0.6) {
        this.say(['* Você fugiu... com as pernas tremendo.'], () => this.end('fled'));
      } else this.say(['* Você tentou fugir, mas tropeçou!'], () => this.afterPlayer());
    }
  }

  doSpare() {
    Sfx.spare();
    this.e.alpha = 0.45; this.spared = true;
    G.spares++;
    const gold = this.e.gold; G.gold += gold;
    const items = [];
    if (this.e.spareTalk) { this.bubble = { t: this.e.spareTalk, life: 99 }; }
    items.push(`* VOCÊ VENCEU!\n* Você ganhou 0 EXP e ${gold} OURO.`);
    this.say(items, () => this.end('spared'));
  }

  // ---------- LUTAR: barra de mira ----------
  startFight() {
    this.state = 'fightBar';
    this.bar = { x: 40, speed: 560, stopped: false, t: 0 };
  }
  st_fightBar(dt) {
    const b = this.bar;
    if (b.stopped) {
      b.t += dt;
      if (b.t > 0.55 && !b.dealt) {
        b.dealt = true;
        this.dealDamage(b.dmg, () => this.afterPlayer());
      }
      return;
    }
    b.x += b.speed * dt;
    if (Input.isPressed('a') || Input.tap) {
      b.stopped = true;
      const dist = Math.abs(b.x - 320) / 280;
      const mult = dist < 0.04 ? 2.2 : Math.max(0.3, 2 * (1 - dist));
      b.dmg = Math.max(1, Math.round((playerAtk() - this.e.def) * mult * (0.9 + Math.random() * 0.2)));
      Sfx.slash();
      this.slash = { t: 0 };
    } else if (b.x > 610) {
      b.stopped = true; b.dmg = 0; b.dealt = true; this.bar = null;
      this.say(['* ERROU!'], () => this.afterPlayer());
    }
  }

  dealDamage(dmg, then, quiet) {
    this.state = 'damage';
    if (!quiet && isFireDragon(this.dragon) && this.bar) dmg += this.dragon === 'lava' ? 4 : 2;
    this.e.hpNow = Math.max(0, this.e.hpNow - dmg);
    this.e.shake = 0.5; Sfx.hit();
    this.dmgPop = { v: dmg, t: 0 };
    this.afterDamage = then;
    this.damageT = 0;
  }
  st_damage(dt) {
    this.damageT += dt;
    if (this.damageT < 1.1) return;
    this.dmgPop = null; this.slash = null; this.bar = null;
    if (this.e.hpNow <= 0) return this.doKill();
    const t = this.afterDamage; this.afterDamage = null; t && t();
  }

  doKill() {
    this.state = 'dying';
    this.dyingT = 0;
    if (this.e.nonlethal) { Sfx.whoosh(); this.fleeing = true; return; }
    Sfx.dust();
    this.makeDust();
    this.e.alpha = 0;
  }
  st_dying(dt) {
    this.dyingT += dt;
    if (this.fleeing) this.e.alpha = Math.max(0, 1 - this.dyingT);
    if (this.dyingT < 1.3) return;
    if (this.e.nonlethal) {
      const xp = this.e.xp, gold = this.e.gold;
      G.gold += gold;
      const up = addXp(xp);
      const t = (this.e.defeatText || [`* ${this.e.name} fugiu correndo!\n* 'Vou contar pra diretora!'`]).concat([`* VOCÊ VENCEU!\n* Você ganhou ${xp} EXP${gold ? ` e ${gold} OURO` : ''}.`]);
      if (up) { Sfx.levelUp(); t.push('* Seu LV aumentou.'); }
      return this.say(t, () => this.end('defeated'));
    }
    G.kills++;
    const xp = this.e.xp, gold = this.e.gold;
    G.gold += gold;
    const up = addXp(xp);
    const t = [`* VOCÊ VENCEU!\n* Você ganhou ${xp} EXP e ${gold} OURO.`];
    if (up) { Sfx.levelUp(); t.push('* Seu LV aumentou.'); }
    this.say(t, () => this.end('killed'));
  }

  makeDust() {
    const img = SPR[this.e.spr]; const g = img.getContext('2d');
    const d = g.getImageData(0, 0, img.width, img.height).data;
    const sc = this.e.scale, ox = 320 - img.width * sc / 2, oy = this.enemyY();
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      if (d[(y * img.width + x) * 4 + 3] < 10) continue;
      if ((x + y) % 2) continue;
      this.particles.push({
        x: ox + x * sc, y: oy + y * sc, vx: (Math.random() - 0.3) * 40, vy: -20 - Math.random() * 40,
        life: 0.4 + y / img.height * 1.0 + Math.random() * 0.3, c: `rgb(${d[(y * img.width + x) * 4]},${d[(y * img.width + x) * 4 + 1]},${d[(y * img.width + x) * 4 + 2]})`,
      });
    }
  }

  useDragon() {
    const k = this.dragon, bonus = dragonBonus();
    if (this.e.trainDragon) this.e.mercy = Math.min(100, this.e.mercy + 30);
    this.dragonFx = { kind: k, t: 0 };
    const done = () => { this.dragonFx = null; this.afterPlayer(); };
    if (k === 'preto') {
      Sfx.roar();
      this.say(['* O DRAGÃO PRETO avança com toda a força!'], () => {
        this.dragonFx = { kind: k, t: 0, hit: true }; Sfx.hit();
        this.dealDamage(14 + G.lv * 2 + bonus + ((Math.random() * 5) | 0), done);
      });
    } else if (k === 'trevas') {
      Sfx.roar(); Sfx.boo();
      this.say(['* O DRAGÃO DAS TREVAS some nas sombras...', '* ...e ataca de TODOS os lados ao mesmo tempo!'], () => {
        this.dragonFx = { kind: k, t: 0, hit: true }; Sfx.hit();
        this.dealDamage(32 + G.lv * 3 + bonus + ((Math.random() * 8) | 0), done);
      });
    } else if (k === 'branco') {
      Sfx.wind();
      this.haste = 1;
      this.say(['* O DRAGÃO BRANCO bate as asas: VENTANIA!', '* Você ficou super rápido! O próximo ataque vai ser mais curto.'], () => {
        this.dealDamage(6 + G.lv + bonus, done);
      });
    } else if (k === 'neve') {
      Sfx.wind(); Sfx.freeze();
      this.frozen = 1;
      this.say(['* O DRAGÃO DE NEVE sopra uma NEVASCA!', `* ${this.e.name} ficou CONGELADO! Não vai conseguir atacar.`], () => {
        this.dealDamage(10 + G.lv + bonus, done);
      });
    } else if (k === 'lava') {
      Sfx.fire(); Sfx.roar();
      this.burn = 5; this.burnDmg = 9;
      this.say(['* O DRAGÃO DE LAVA cospe um rio de MAGMA!', `* ${this.e.name} está queimando MUITO!`], () => {
        this.dealDamage(18 + G.lv * 2 + bonus, done);
      });
    } else {
      Sfx.fire();
      this.burn = 3; this.burnDmg = 5;
      this.say(['* O DRAGÃO LARANJA solta um SOPRO DE FOGO!', `* ${this.e.name} começou a queimar!`], () => {
        this.dealDamage(10 + G.lv * 2 + bonus, done);
      });
    }
  }

  afterPlayer() {
    if (this.e.endless) {
      this.e.hpNow = this.e.hp;
      if (this.turn >= 2) {
        return this.say(['* Você para um soldado. Chegam outros cinco.', '* Não importa o que você faça...', '* ...você não consegue parar uma guerra sozinho.'], () => this.end('impossible'));
      }
    }
    if (this.magicCd > 0) this.magicCd--;
    if (this.dragonCd > 0) this.dragonCd--;
    if (this.robotCd > 0) this.robotCd--;
    if (this.robotBat !== undefined) this.robotBat = Math.min(100, this.robotBat + 15);
    this.turn++;
    if (this.opts.tutorial && !this.practiceDone) {
      this.practiceDone = true;
      this.say([
        { who: 'instr', t: 'Muito bem! Agora a parte importante: DESVIAR.' },
        { who: 'instr', t: 'Vou jogar estrelas bem fraquinhas. Arraste o dedo na tela para mover sua ALMA!' },
      ], () => this.startEnemyTurn('stars'));
      return;
    }
    if (this.burn > 0 && this.e.hpNow > 0) { this.burn--; this.burnPending = true; }
    if (!this.e.patterns.length) {
      this.say([this.opts.tutorial ? { who: 'instr', t: 'O Boneco não ataca. Termine: LUTE ou POUPE.' } : '* Nada acontece.'], () => this.toMenu());
      return;
    }
    if (this.frozen > 0 && !this.e.endless) {
      this.frozen--;
      Sfx.freeze();
      this.say([`* ${this.e.name} está CONGELADO!`, '* Não consegue atacar neste turno.'], () => this.toMenu());
      return;
    }
    const list = (this.e.finale && this.e.hpNow < this.e.hp * 0.35) ? this.e.finale : this.e.patterns;
    const p = list[this.turn % list.length];
    this.startEnemyTurn(p);
  }

  // ---------- TURNO DO INIMIGO ----------
  startEnemyTurn(pattern) {
    this.state = 'enemyTurn';
    this.boxTarget = { x: 320 - 105, y: 236, w: 210, h: 160 };
    this.soul.x = 320; this.soul.y = 316; this.soul.inv = 0;
    this.bullets = [];
    this.pattern = PATTERNS[pattern];
    this.pt = 0; this.spawnT = 0; this.patternName = pattern;
    this.turnLen = pattern === 'stars' ? 6 : (this.e.turnLen || 5.5);
    if (this.haste) { this.turnLen *= 0.55; }
    this.soulSpeed = 150 * (this.dragon === 'neve' ? 1.5 : this.dragon === 'branco' ? 1.25 : 1) * (this.haste ? 1.5 : 1);
    this.haste = 0;
    let talk = null;
    if (pattern !== 'stars') {
      if (this.e.boss) { this.talkIdx = (this.talkIdx ?? -1) + 1; talk = this.e.talk[this.talkIdx % this.e.talk.length]; }
      else talk = this.e.talk[(Math.random() * this.e.talk.length) | 0];
    }
    if (this.e.mercy >= 100 && this.e.spareTalk) talk = this.e.boss ? 'Hehe... tô cansado de rir.' : talk;
    this.bubble = talk ? { t: talk, life: this.e.boss ? 3.2 : 1.6 } : null;
    this.pState = {};
  }
  st_enemyTurn(dt) {
    if (this.bubble) { this.bubble.life -= dt; if (this.bubble.life <= 0) this.bubble = null; }
    // movimento da alma
    const s = this.soul, sp = this.soulSpeed || 150;
    const mv = moveVector();
    s.x += mv.x * sp * dt; s.y += mv.y * sp * dt;
    if (Input.drag.active) { s.x += Input.drag.dx * 1.1; s.y += Input.drag.dy * 1.1; }
    const bx = this.box;
    s.x = Math.max(bx.x + 13, Math.min(bx.x + bx.w - 13, s.x));
    s.y = Math.max(bx.y + 12, Math.min(bx.y + bx.h - 12, s.y));
    if (s.inv > 0) s.inv -= dt;

    if (this.bubble && this.pt === 0 && this.bubble.life > 0.9) { // deixa a fala aparecer
      if ((Input.isPressed('a') || Input.tap) && this.bubble.life < (this.e.boss ? 2.6 : 1.3)) this.bubble.life = 0.9;
      return;
    }
    this.pt += dt;
    if (this.pt < this.turnLen - 0.6) this.pattern.update(this, dt);
    for (const b of this.bullets) {
      b.t = (b.t || 0) + dt;
      if (b.home) {
        if (b.t < b.home) {
          const a = Math.atan2(s.y - b.y, s.x - b.x);
          b.vx += Math.cos(a) * 160 * dt; b.vy += Math.sin(a) * 160 * dt;
          const v = Math.hypot(b.vx, b.vy), mx = 90;
          if (v > mx) { b.vx *= mx / v; b.vy *= mx / v; }
        }
      }
      if (b.g) b.vy += b.g * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.sway) b.x += Math.sin(b.t * 5 + b.ph) * b.sway * dt;
      if (b.bounce) {
        const bx = this.box;
        if ((b.x < bx.x + 12 && b.vx < 0) || (b.x > bx.x + bx.w - 12 && b.vx > 0)) b.vx *= -1;
        if ((b.y < bx.y + 10 && b.vy < 0) || (b.y > bx.y + bx.h - 10 && b.vy > 0)) b.vy *= -1;
      }
      let hitIt = b.w ? (Math.abs(b.x - s.x) < b.w / 2 + 4 && Math.abs(b.y - s.y) < b.h / 2 + 4) : Math.hypot(b.x - s.x, b.y - s.y) < b.r + 5;
      if (b.warn && b.t < b.warn) hitIt = false;
      if (b.shield && hitIt) { b.dead = true; Sfx.toggle(); this.particles.push({ x: b.x, y: b.y, vx: 0, vy: -30, life: 0.4, c: '#5ff8ff' }); continue; }
      if (b.toRobot && Math.hypot(b.x - b.tx, b.y - b.ty) < 14) {
        b.dead = true; Sfx.hurt(); this.robotHitT = 0.3;
        this.robotBat = Math.max(0, this.robotBat - 12);
        continue;
      }
      if (s.inv <= 0 && hitIt) {
        this.hurt(b.dmg ?? this.e.atkNow);
        if (b.pop) b.dead = true;
      }
      if (b.y > 520 || b.y < -60 || b.x < -120 || b.x > 760 || (b.life && b.t > b.life)) b.dead = true;
    }
    this.bullets = this.bullets.filter(b => !b.dead);
    if (this.pt >= this.turnLen) {
      this.bullets = [];
      if (G.hp <= 0) return;
      if (this.patternName === 'stars') {
        this.say([{ who: 'instr', t: 'Ótimo! Você é rápido!' }, { who: 'instr', t: 'Agora termine com o Boneco: LUTE ou POUPE.' }], () => this.toMenu());
      } else if (this.dragon && !G.flags.dragonBattleTip) {
        G.flags.dragonBattleTip = true;
        this.say([`* Seu ${DRAGONS[this.dragon].name.toUpperCase()} surgiu para lutar ao seu lado!`, `* (Use AGIR → ${DRAGONS[this.dragon].act})`], () => this.toMenu());
      } else this.toMenu();
    }
  }
  hurt(dmg) {
    dmg = Math.max(1, dmg - playerDef());
    if (this.opts.tutorial) G.hp = Math.max(1, G.hp - dmg);
    else G.hp = Math.max(0, G.hp - dmg);
    this.soul.inv = 1.2; Sfx.hurt();
    this.hurtFlash = 0.15;
    if (G.hp <= 0) this.end('dead');
  }

  end(result) {
    if (this.ended) return;
    this.ended = true;
    this.state = 'over';
    if (G.hp <= 0) Sfx.breakHeart();
    this.opts.onEnd && this.opts.onEnd(result, this);
  }

  enemyY() { return 128 - SPR[this.e.spr].height * this.e.scale / 2 + 10; }

  // ---------- DESENHO ----------
  draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // grade de fundo
    ctx.strokeStyle = '#123a1e'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) ctx.strokeRect(14 + i * 210, 14, 196, 200);

    // inimigo
    const img = SPR[this.e.spr], sc = this.e.scale;
    let ex = 320 - img.width * sc / 2, ey = this.enemyY();
    if (this.e.spr === 'fantasminha') ey += Math.sin(this.t * 2) * 6;
    if (this.e.spr === 'musgolho') ey += Math.abs(Math.sin(this.t * 3)) * -6;
    if (this.e.shake > 0) ex += Math.sin(this.e.shake * 60) * 10 * this.e.shake;
    if (this.e.spr === 'fireghost' || this.e.spr === 'brasinha') ey += Math.sin(this.t * 2.4) * 5;
    if (this.e.spr === 'gelinho') ex += Math.sin(this.t * 1.5) * 8;
    if (this.fleeing) ex += this.dyingT * 300;
    if (this.e.alpha > 0) {
      if (this.e.group) this.drawGroup(ey);
      else if (this.e.brothers) { drawGhost('fire', 200, ey + 10 + Math.sin(this.t * 3) * 6, 4.5, this.t, this.e.alpha); drawGhost('ice', 330, ey - 4 + Math.sin(this.t * 2) * 6, 5, this.t, this.e.alpha, true); }
      else if (this.e.war) { for (let i = 0; i < 5; i++) { const im = i % 2 ? SPR.aranhaSold : SPR.esqSold; ctx.globalAlpha = 0.5 + i * 0.1; ctx.drawImage(im, 180 + i * 56, ey + 30 + (i % 2) * 20 + Math.sin(this.t * 4 + i) * 3, im.width * 4, im.height * 4); } ctx.globalAlpha = 1; }
      else if (this.e.spr === 'fireghost') drawGhost('fire', ex, ey, sc, this.t, this.e.alpha);
      else {
        ctx.globalAlpha = this.e.alpha * (this.e.spr === 'fantasminha' ? 0.9 : 1);
        ctx.drawImage(img, ex, ey, img.width * sc, img.height * sc);
        ctx.globalAlpha = 1;
      }
      if (this.burn > 0) for (let i = 0; i < 3; i++) drawFlame(ex + img.width * sc * (0.25 + i * 0.25), ey + img.height * sc * 0.9, this.burnDmg > 5 ? 20 : 14, this.t * 10 + i);
      if (this.frozen > 0) {
        const fw = Math.min(260, img.width * sc + 20), fh = Math.min(190, img.height * sc + 20), fx = 320 - fw / 2, fy = ey - 10;
        ctx.fillStyle = 'rgba(160,220,255,0.35)'; ctx.fillRect(fx, fy, fw, fh);
        ctx.strokeStyle = '#d8f4ff'; ctx.lineWidth = 3; ctx.strokeRect(fx, fy, fw, fh);
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(fx + 10, fy + 8, 6, fh * 0.5); ctx.fillRect(fx + 22, fy + 8, 3, fh * 0.3);
      }
    }
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, sc, sc);
    }
    ctx.globalAlpha = 1;

    // Instrutor ao lado
    if (this.opts.withInstr || this.opts.tutorial) {
      const both = !!this.dragon, ix = both ? 22 : 60, iy = (both ? 100 : 70) + Math.sin(this.t * 1.5) * 3;
      drawSpr(SPR.instr.right[0], ix, iy, both ? 3 : 4);
      if (this.instrCast) {
        const k = Math.min(1, this.instrCast.t / 0.8);
        const sx = ix + 80 + (320 - ix - 80) * k, sy = iy + 20 + (ey + 60 - iy - 20) * k - Math.sin(k * Math.PI) * 60;
        drawStar(sx, sy, 14, this.t * 8, '#ffe680');
      }
    }

    if (this.dragon) this.drawDragon(ex, ey, img, sc);
    if (this.robot) this.drawRobot();

    // golpe
    if (this.slash && this.slash.t !== undefined) {
      this.slash.t += 1 / 60;
      const k = Math.min(1, this.slash.t / 0.35);
      ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(250, ey + 10); ctx.lineTo(250 + 140 * k, ey + 10 + 140 * k); ctx.stroke();
    }
    // dano
    if (this.dmgPop) {
      const k = this.dmgPop.t;
      const y = ey - 10 - Math.max(0, Math.sin(Math.min(k, 0.5) * Math.PI * 2) * 20);
      text(String(this.dmgPop.v), 320, y, 28, '#ff3b3b', 'center', FONT_TITLE);
      // barra de vida do inimigo
      const bw = 200, fr = this.e.hpNow / this.e.hp;
      ctx.fillStyle = '#404040'; ctx.fillRect(220, ey + img.height * sc + 6, bw, 14);
      ctx.fillStyle = '#3ce64b'; ctx.fillRect(220, ey + img.height * sc + 6, bw * fr, 14);
    }
    // balão de fala
    if (this.bubble && this.e.alpha > 0.1) {
      const bx = Math.min(320 + img.width * sc / 2 + 10, 636 - (this.e.bubbleW || 160)), by = ey + 10;
      const bw = this.e.bubbleW || 160;
      const lines = wrapText(this.bubble.t, bw - 20, 26);
      const bh = 16 + lines.length * 26;
      ctx.fillStyle = '#fff'; ctx.fillRect(bx, by, bw, bh);
      ctx.beginPath(); ctx.moveTo(bx, by + 18); ctx.lineTo(bx - 14, by + 26); ctx.lineTo(bx, by + 32); ctx.fill();
      lines.forEach((l, i) => text(l, bx + 10, by + 8 + i * 26, 26, '#000'));
    }

    // caixa
    const b = this.box;
    frameBox(b.x, b.y, b.w, b.h, 5);

    ctx.save();
    ctx.beginPath(); ctx.rect(b.x + 5, b.y + 5, b.w - 10, b.h - 10); ctx.clip();
    this.drawBoxContent();
    ctx.restore();

    // status
    this.drawStats();
    // botões
    BTN.forEach((bt, i) => {
      const on = i === this.btn && ['menu', 'actMenu', 'itemMenu', 'mercyMenu'].includes(this.state);
      const c = on ? '#ffff40' : '#ff7f27';
      ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.strokeRect(bt.x + 2, BTN_Y + 2, BTN_W - 4, BTN_H - 4);
      if (on) drawSpr(SPR.soul, bt.x + 10, BTN_Y + 16, 1);
      else drawBtnIcon(bt.icon, bt.x + 12, BTN_Y + 13, c);
      text(bt.label, bt.x + 76, BTN_Y + 7, 32, c, 'center');
    });

    if (this.hurtFlash > 0) { this.hurtFlash -= 1 / 60; ctx.fillStyle = 'rgba(255,0,0,0.12)'; ctx.fillRect(0, 0, W, H); }
  }

  drawGroup(ey) {
    const m = this.e.mercy, a = this.e.alpha;
    const mem = [['ze', 228, m >= 34], ['teca', 438, m >= 67], ['brutao', 330, m >= 100]];
    for (const [k, cx, gave] of mem) {
      const img = SPR[k], sc = k === 'brutao' ? 7 : 5;
      const bob = gave ? 24 : Math.sin(this.t * 4 + cx) * 3;
      ctx.globalAlpha = a * (gave ? 0.35 : 1);
      ctx.drawImage(img, cx - img.width * sc / 2, ey + (k === 'brutao' ? -10 : 30) + bob, img.width * sc, img.height * sc);
    }
    ctx.globalAlpha = 1;
  }

  drawRobot() {
    const set = SPR.robot.bit, x = 548, y = 84 + Math.sin(this.t * 4) * 3;
    const sad = this.robotBat !== undefined && (this.robotBat <= 0 || this.robotHitT > 0);
    if (this.robotHitT > 0) this.robotHitT -= 1 / 60;
    drawSpr(sad ? set.sad : set.left[Math.floor(this.t * 4) % 2], x + (this.robotHitT > 0 ? Math.sin(this.t * 80) * 4 : 0), y, 4);
    if (this.musicFx) {
      this.musicFx.t += 1 / 60;
      for (let i = 0; i < 6; i++) {
        const k = (this.musicFx.t * 0.8 + i / 6) % 1;
        const nx = x + 10 - k * 220 + Math.sin(k * 12 + i) * 20, ny = y + 20 + k * 300;
        ctx.fillStyle = ['#5ff8ff', '#ffe680', '#ff5ac8'][i % 3];
        ctx.fillRect(nx, ny, 8, 6); ctx.fillRect(nx + 6, ny - 14, 2, 14); ctx.fillRect(nx + 6, ny - 14, 6, 3);
      }
    }
  }

  drawDragon(ex, ey, img, sc) {
    const k = this.dragon, set = SPR.dragon[k];
    let x = this.opts.withInstr ? 84 : 40, y = (this.opts.withInstr ? 52 : 66) + Math.sin(this.t * 3) * 6;
    const fx = this.dragonFx;
    if (fx) fx.t += 1 / 60;
    if (fx && (fx.kind === 'preto' || fx.kind === 'trevas') && fx.hit) { const q = Math.min(1, fx.t / 0.25); x += (ex - 140) * Math.sin(q * Math.PI); }
    const fr = Math.floor(this.t * 6) % 2;
    drawDragonAura(k, x, y, 5, this.t);
    drawSpr(set.right[fr], x, y, 5);
    if (isFireDragon(k)) drawFlame(x + 10, y + 70, k === 'lava' ? 18 : 12, this.t * 10);
    if (fx && isFireDragon(fx.kind)) {
      const n = fx.kind === 'lava' ? 22 : 14;
      for (let i = 0; i < n; i++) {
        const q = ((fx.t * 2 + i / n) % 1);
        const px = x + 120 + (ex + img.width * sc / 2 - x - 120) * q, py = y + 30 + Math.sin(i * 7) * 14 * q + (ey + 60 - y - 30) * q;
        if (fx.kind === 'lava') { ctx.fillStyle = i % 2 ? '#ff3a0a' : '#ffb21a'; ctx.beginPath(); ctx.arc(px, py, 10 * (1 - q * 0.3), 0, Math.PI * 2); ctx.fill(); }
        drawFlame(px, py, 16 * (1 - q * 0.4), this.t * 10 + i);
      }
    }
    if (fx && (fx.kind === 'branco' || fx.kind === 'neve')) {
      ctx.strokeStyle = 'rgba(220,240,255,0.8)'; ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const q = (fx.t * 1.5 + i / 6) % 1, yy = 40 + i * 28;
        ctx.beginPath(); ctx.moveTo(120 + q * 380, yy); ctx.lineTo(180 + q * 380, yy + Math.sin(i) * 6); ctx.stroke();
      }
      if (fx.kind === 'neve') { ctx.fillStyle = '#fff'; for (let i = 0; i < 30; i++) ctx.fillRect(140 + ((i * 53 + fx.t * 300) % 360), 20 + (i * 37) % 180, 3, 3); }
    }
    if (fx && fx.kind === 'trevas') {
      ctx.fillStyle = `rgba(30,0,50,${Math.min(0.6, fx.t)})`; ctx.fillRect(0, 0, W, 230);
      ctx.strokeStyle = '#b05aff'; ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) { const a = i * 1.26 + fx.t * 4; ctx.beginPath(); ctx.moveTo(320 + Math.cos(a) * 160, 120 + Math.sin(a) * 100); ctx.lineTo(320 + Math.cos(a) * 20, 120 + Math.sin(a) * 15); ctx.stroke(); }
    }
  }


  drawBoxContent() {
    const st = this.state;
    if (st === 'menu') this.flavorTyper.draw(56, 268);
    else if (st === 'text' && this.typer) {
      let tx = 56;
      if (this.typerWho === 'instr') {
        ctx.drawImage(SPR.instr.right[0], 0, 0, 17, 19, 48, 266, 17 * 4.6, 19 * 4.6);
        tx = 150;
      }
      this.typer.draw(tx, 268);
    } else if (st === 'actMenu') this.drawList(this.actList().map(a => ({ t: a.name, c: a.disabled ? '#777' : '#fff' })));
    else if (st === 'itemMenu') this.drawList(G.items.map(n => ({ t: n })));
    else if (st === 'mercyMenu') {
      const o = [{ t: 'Poupar', c: this.spareable ? '#ffff40' : '#fff' }];
      if (!this.opts.tutorial && !this.e.boss) o.push({ t: 'Fugir' });
      this.drawList(o, 1);
    } else if (st === 'fightBar' || (st === 'damage' && this.bar)) {
      this.drawTarget();
    } else if (st === 'enemyTurn') {
      if (this.patternName === 'protect') {
        const bx = this.box;
        drawSpr(SPR.robot.bit.right[Math.floor(this.t * 4) % 2], bx.x + bx.w / 2 - 12, bx.y + bx.h - 40, 1.5);
      }
      for (const bl of this.bullets) BULLET_DRAW[bl.kind](bl, this.t);
      const s = this.soul;
      if (s.inv <= 0 || Math.floor(s.inv * 12) % 2) drawSpr(SPR.soul, s.x - 8, s.y - 7, 1);
    }
  }

  drawList(items, cols = 2) {
    const per = cols * 3, pg = Math.floor(this.sel / per), pages = Math.ceil(items.length / per);
    items.forEach((it, i) => {
      if (Math.floor(i / per) !== pg) return;
      const r = this.optRect(i, cols);
      if (i === this.sel) drawSpr(SPR.soul, r.x - 4, r.y + 9, 1);
      text('* ' + it.t, r.x + 20, r.y, 32, it.c || '#fff');
    });
    if (pages > 1) text(`${pg + 1}/${pages} >>`, 600, 370, 20, '#ffe680', 'right');
  }

  drawTarget() {
    const b = BOX_FULL;
    // alvo em forma de olho
    ctx.fillStyle = '#0a1a0a'; ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
    ctx.strokeStyle = '#1f7a2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(320, b.y + 70, 270, 58, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#3cbf4a';
    ctx.beginPath(); ctx.ellipse(320, b.y + 70, 150, 46, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#3cbf4a';
    ctx.beginPath(); ctx.ellipse(320, b.y + 70, 40, 28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(316, b.y + 12, 8, b.h - 24);
    if (this.bar) {
      const flash = this.bar.stopped && Math.floor(this.bar.t * 20) % 2;
      ctx.fillStyle = flash ? '#000' : '#fff';
      ctx.fillRect(this.bar.x - 7, b.y + 8, 14, b.h - 16);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(this.bar.x - 4, b.y + 12, 8, b.h - 24);
    }
  }

  drawStats() {
    const y = 394;
    text(displayName(), 32, y, 30);
    text('LV ' + G.lv, 160, y, 30);
    text('HP', 250, y, 24);
    const w = G.maxhp * 2.4;
    ctx.fillStyle = '#c00000'; ctx.fillRect(286, y + 4, w, 20);
    ctx.fillStyle = '#ffff00'; ctx.fillRect(286, y + 4, w * Math.max(0, G.hp) / G.maxhp, 20);
    text(`${Math.max(0, G.hp)} / ${G.maxhp}`, 300 + w, y, 30);
    if (this.robotBat !== undefined) {
      text('BIT', 520, y, 24, '#5ff8ff');
      ctx.fillStyle = '#333'; ctx.fillRect(556, y + 6, 60, 16);
      ctx.fillStyle = this.robotBat > 30 ? '#7fff9f' : '#ff5a5a'; ctx.fillRect(556, y + 6, 60 * this.robotBat / 100, 16);
    }
  }
}

function hit(p, x, y, w, h) { return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h; }

function drawStar(x, y, r, rot, color) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r, a = rot + i * Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}

function drawFlame(x, y, size, ph) {
  const lay = [['#ff4a1a', 1], ['#ffa21a', 0.66], ['#ffe680', 0.33]];
  for (const [c, k] of lay) {
    const w = size * 0.5 * k, h = size * k * (1 + 0.15 * Math.sin(ph * 1.7));
    ctx.fillStyle = c; ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x - w, y - h * 0.6, x + Math.sin(ph) * w * 0.4, y - h);
    ctx.quadraticCurveTo(x + w, y - h * 0.6, x + w, y);
    ctx.arc(x, y, w, 0, Math.PI);
    ctx.fill();
  }
}

function drawBtnIcon(kind, x, y, c) {
  ctx.fillStyle = c;
  if (kind === 'fight') { ctx.fillRect(x + 8, y, 4, 14); ctx.fillRect(x + 3, y + 13, 14, 3); ctx.fillRect(x + 8, y + 16, 4, 5); }
  else if (kind === 'act') { ctx.beginPath(); ctx.arc(x + 10, y + 10, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(x + 5, y + 6, 3, 3); ctx.fillRect(x + 12, y + 6, 3, 3); ctx.fillRect(x + 6, y + 13, 8, 2); }
  else if (kind === 'item') { ctx.fillRect(x + 3, y + 5, 15, 14); ctx.fillStyle = '#000'; ctx.fillRect(x + 6, y + 8, 9, 2); ctx.fillStyle = c; ctx.fillRect(x + 7, y + 1, 7, 4); }
  else { ctx.fillRect(x + 2, y + 9, 17, 4); ctx.fillRect(x + 9, y + 2, 4, 18); }
}

// ---------- PADRÕES DE ATAQUE ----------
const PATTERNS = {
  stars: { // treino do Instrutor
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.9;
        const bx = B.box, gap = bx.y + 30 + Math.random() * (bx.h - 60);
        for (let y = bx.y + 15; y < bx.y + bx.h - 10; y += 26) {
          if (Math.abs(y - gap) < 32) continue;
          B.bullets.push({ kind: 'star', x: bx.x + bx.w + 10, y, vx: -95, vy: 0, r: 7, dmg: 1 });
        }
      }
    },
  },
  spores: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.32;
        const bx = B.box;
        B.bullets.push({ kind: 'spore', x: bx.x + 10 + Math.random() * (bx.w - 20), y: bx.y - 6, vx: 0, vy: 85 + Math.random() * 50, r: 6, sway: 60, ph: Math.random() * 6 });
      }
    },
  },
  vines: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.0;
        const bx = B.box, left = Math.random() < 0.5;
        const y = B.soul.y + (Math.random() - 0.5) * 40;
        for (let i = 0; i < 3; i++) {
          B.bullets.push({ kind: 'vine', x: left ? bx.x - 10 - i * 14 : bx.x + bx.w + 10 + i * 14, y, vx: left ? 150 : -150, vy: 0, r: 7 });
        }
      }
    },
  },
  tears: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.7;
        const bx = B.box, x = bx.x + Math.random() * bx.w;
        for (let i = -1; i <= 1; i++) B.bullets.push({ kind: 'tear', x, y: bx.y - 6, vx: i * 55, vy: 130, r: 6 });
      }
    },
  },
  insults: { update(B, dt) { PATTERNS.jokeWords.update(B, dt); } },
  webs: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.0;
        const bx = B.box, horiz = Math.random() < 0.5;
        if (horiz) { const y = bx.y + 15 + Math.random() * (bx.h - 30), l = Math.random() < 0.5; B.bullets.push({ kind: 'web', x: l ? bx.x - 40 : bx.x + bx.w + 40, y, vx: l ? 120 : -120, vy: 0, w: 70, h: 6 }); }
        else { const x = bx.x + 15 + Math.random() * (bx.w - 30); B.bullets.push({ kind: 'web', x, y: bx.y - 40, vx: 0, vy: 120, w: 6, h: 70 }); }
      }
    },
  },
  spiderlings: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.7;
        const bx = B.box;
        B.bullets.push({ kind: 'spiderling', x: bx.x + 10 + Math.random() * (bx.w - 20), y: bx.y + 6, vx: 0, vy: 0, r: 6, home: 1.6, pop: true, life: 4 });
      }
    },
  },
  bones: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.42;
        const bx = B.box, h = 20 + Math.random() * (bx.h * 0.5), left = (B.pState.n = (B.pState.n || 0) + 1) % 2;
        B.bullets.push({ kind: 'bone', x: left ? bx.x - 8 : bx.x + bx.w + 8, y: bx.y + bx.h - h / 2 - 4, vx: left ? 130 : -130, vy: 0, w: 8, h });
      }
    },
  },
  boneThrow: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.5;
        const bx = B.box, left = Math.random() < 0.5;
        B.bullets.push({ kind: 'boneH', x: left ? bx.x - 14 : bx.x + bx.w + 14, y: B.soul.y + (Math.random() - 0.5) * 40, vx: left ? 160 : -160, vy: 0, w: 26, h: 8 });
      }
    },
  },
  foxfire: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.75;
        const bx = B.box, a = Math.random() * Math.PI * 2;
        B.bullets.push({ kind: 'foxfire', x: B.soul.x + Math.cos(a) * 110, y: B.soul.y + Math.sin(a) * 90, vx: 0, vy: 0, r: 7, home: 1.2, pop: true, life: 3.5 });
      }
    },
  },
  petals: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.2;
        const bx = B.box;
        B.bullets.push({ kind: 'petal', x: bx.x - 10 + Math.random() * (bx.w + 40), y: bx.y - 8, vx: -30, vy: 70 + Math.random() * 40, r: 5, sway: 60, ph: Math.random() * 6 });
      }
    },
  },
  frostfire: {
    update(B, dt) {
      PATTERNS.fireRain.update(B, dt);
      B.pState.f = (B.pState.f || 0) - dt;
      if (B.pState.f <= 0) { B.pState.f = 0.8; const t = B.spawnT; B.spawnT = 0; PATTERNS.icicles.update(B, 0); B.spawnT = t; }
    },
  },
  propaganda: { update(B, dt) { PATTERNS.jokeWords.update(B, dt); } },
  march: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.25;
        const bx = B.box, gap = bx.y + 28 + Math.random() * (bx.h - 56), left = (B.pState.n = (B.pState.n || 0) + 1) % 2;
        for (let y = bx.y + 12; y < bx.y + bx.h - 4; y += 22) {
          if (Math.abs(y - gap) < 24) continue;
          B.bullets.push({ kind: 'soldier', x: left ? bx.x - 12 : bx.x + bx.w + 12, y, vx: left ? 95 : -95, vy: 0, w: 14, h: 18 });
        }
      }
    },
  },
  magmaRocks: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.42;
        const bx = B.box;
        B.bullets.push({ kind: 'magmaRock', x: bx.x + 12 + Math.random() * (bx.w - 24), y: bx.y - 10, vx: (Math.random() - 0.5) * 40, vy: 20, g: 260, r: 8, life: 3 });
      }
    },
  },
  lavaPillars: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.85;
        const bx = B.box, x = Math.random() < 0.5 ? B.soul.x : bx.x + 16 + Math.random() * (bx.w - 32);
        B.bullets.push({ kind: 'lavaPillar', x, y: bx.y + bx.h / 2, vx: 0, vy: 0, w: 22, h: bx.h, warn: 0.7, life: 1.3 });
      }
    },
  },
  embers: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.18;
        const bx = B.box;
        B.bullets.push({ kind: 'ember', x: bx.x + 6 + Math.random() * (bx.w - 12), y: bx.y + bx.h + 6, vx: 0, vy: -(80 + Math.random() * 60), r: 4, sway: 50, ph: Math.random() * 6, life: 4 });
      }
    },
  },
  lavaBalls: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.65;
        const bx = B.box, left = Math.random() < 0.5;
        B.bullets.push({ kind: 'magmaRock', x: left ? bx.x + 6 : bx.x + bx.w - 6, y: bx.y + bx.h - 6, vx: (left ? 1 : -1) * (50 + Math.random() * 80), vy: -230 - Math.random() * 60, g: 300, r: 8, life: 3 });
      }
    },
  },
  wingGust: {
    update(B, dt) {
      const left = (B.pState.dir ??= Math.random() < 0.5 ? -1 : 1);
      const bx = B.box;
      B.soul.x = Math.max(bx.x + 8, Math.min(bx.x + bx.w - 8, B.soul.x + left * 55 * dt));
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.38;
        B.bullets.push({ kind: 'ember', x: left > 0 ? bx.x + bx.w + 8 : bx.x - 8, y: bx.y + 10 + Math.random() * (bx.h - 20), vx: -left * 150, vy: 0, r: 5, ph: 0, life: 3 });
      }
    },
  },
  cubes: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.24;
        const bx = B.box;
        B.bullets.push({ kind: 'cube', x: bx.x + 8 + Math.random() * (bx.w - 16), y: bx.y - 8, vx: 0, vy: 110 + Math.random() * 80, w: 10, h: 10 });
      }
    },
  },
  coins: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = B.pState.n ? 1.2 : 0.1;
        B.pState.n = (B.pState.n || 0) + 1;
        const bx = B.box;
        B.bullets.push({ kind: 'coin', x: bx.x + 20 + Math.random() * (bx.w - 40), y: bx.y + 16, vx: (Math.random() < 0.5 ? -1 : 1) * (110 + Math.random() * 40), vy: 100 + Math.random() * 40, r: 7, bounce: true, life: 6 });
      }
    },
  },
  spotlight: { update(B, dt) { PATTERNS.lasers.update(B, dt); } },
  macaronFinale: {
    update(B, dt) {
      PATTERNS.cubes.update(B, dt);
      B.pState.m = (B.pState.m || 0) - dt;
      if (B.pState.m <= 0) { B.pState.m = 1.6; const t = B.spawnT; B.spawnT = 0; PATTERNS.march.update(B, 0); B.spawnT = t; }
    },
  },
  paperBalls: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.32;
        const bx = B.box, left = Math.random() < 0.5;
        B.bullets.push({ kind: 'paper', x: left ? bx.x + 4 : bx.x + bx.w - 4, y: bx.y + 10 + Math.random() * 30, vx: (left ? 1 : -1) * (60 + Math.random() * 90), vy: -40, g: 200, r: 6, life: 3 });
      }
    },
  },
  erasers: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = B.pState.n ? 1.6 : 0.1;
        B.pState.n = (B.pState.n || 0) + 1;
        const bx = B.box;
        B.bullets.push({ kind: 'eraser', x: bx.x + 20 + Math.random() * (bx.w - 40), y: bx.y + 16, vx: (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 40), vy: 80 + Math.random() * 40, w: 16, h: 10, bounce: true, life: 6 });
      }
    },
  },
  backpacks: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.1;
        const bx = B.box, left = (B.pState.n = (B.pState.n || 0) + 1) % 2;
        B.bullets.push({ kind: 'backpack', x: left ? bx.x - 20 : bx.x + bx.w + 20, y: B.soul.y, vx: left ? 125 : -125, vy: 0, w: 30, h: 30 });
      }
    },
  },
  protect: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.55;
        const bx = B.box, tx = bx.x + bx.w / 2, ty = bx.y + bx.h - 24;
        const x = bx.x + 10 + Math.random() * (bx.w - 20), y = bx.y - 6;
        const a = Math.atan2(ty - y, tx - x);
        B.bullets.push({ kind: 'spit', x, y, vx: Math.cos(a) * 95, vy: Math.sin(a) * 95, r: 6, shield: true, toRobot: true, tx, ty });
      }
    },
  },
  rulers: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.9;
        const bx = B.box, top = (B.pState.n = (B.pState.n || 0) + 1) % 2, h = bx.h * 0.58, left = Math.random() < 0.5;
        B.bullets.push({ kind: 'ruler', x: left ? bx.x - 10 : bx.x + bx.w + 10, y: top ? bx.y + h / 2 : bx.y + bx.h - h / 2, vx: left ? 130 : -130, vy: 0, w: 8, h });
      }
    },
  },
  lasers: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.0;
        const bx = B.box, horiz = Math.random() < 0.6;
        if (horiz) B.bullets.push({ kind: 'laser', x: bx.x + bx.w / 2, y: B.soul.y, vx: 0, vy: 0, w: bx.w, h: 8, warn: 0.6, life: 1.0 });
        else B.bullets.push({ kind: 'laser', x: B.soul.x, y: bx.y + bx.h / 2, vx: 0, vy: 0, w: 8, h: bx.h, warn: 0.6, life: 1.0 });
      }
    },
  },
  dustballs: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.75;
        const bx = B.box, side = (Math.random() * 4) | 0;
        const x = side === 0 ? bx.x + 10 : side === 1 ? bx.x + bx.w - 10 : bx.x + Math.random() * bx.w;
        const y = side === 2 ? bx.y + 10 : side === 3 ? bx.y + bx.h - 10 : bx.y + Math.random() * bx.h;
        B.bullets.push({ kind: 'dust', x, y, vx: 0, vy: 0, r: 6, home: 1.4, pop: true, life: 3.5 });
      }
    },
  },
  slide: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.95;
        const bx = B.box, left = Math.random() < 0.5, y = bx.y + 18 + Math.random() * (bx.h - 36);
        B.bullets.push({ kind: 'peng', x: left ? bx.x - 20 : bx.x + bx.w + 20, y, vx: left ? 170 : -170, vy: 0, w: 22, h: 12, left });
      }
    },
  },
  fish: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.45;
        const bx = B.box, fromLeft = Math.random() < 0.5;
        B.bullets.push({ kind: 'fish', x: fromLeft ? bx.x + 6 : bx.x + bx.w - 6, y: bx.y + bx.h - 4, vx: (fromLeft ? 1 : -1) * (40 + Math.random() * 70), vy: -260 - Math.random() * 60, g: 300, r: 6, life: 3 });
      }
    },
  },
  snowballs: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.8;
        const bx = B.box, x = bx.x + 15 + Math.random() * (bx.w - 30);
        B.bullets.push({ kind: 'snowball', x, y: bx.y - 10, vx: (Math.random() - 0.5) * 60, vy: 60, g: 140, r: 10, life: 4 });
      }
    },
  },
  embers: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.3;
        const bx = B.box;
        B.bullets.push({ kind: 'ember', x: bx.x + 10 + Math.random() * (bx.w - 20), y: bx.y + bx.h + 6, vx: 0, vy: -(80 + Math.random() * 50), r: 6, sway: 70, ph: Math.random() * 6 });
      }
    },
  },
  fireRain: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = B.e.boss ? 0.2 : 0.3;
        const bx = B.box;
        B.bullets.push({ kind: 'fireball', x: bx.x + 8 + Math.random() * (bx.w - 16), y: bx.y - 8, vx: (Math.random() - 0.5) * 30, vy: 120 + Math.random() * 70, r: 6 });
      }
    },
  },
  snow: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.28;
        const bx = B.box;
        B.bullets.push({ kind: 'flake', x: bx.x - 10 + Math.random() * (bx.w + 40), y: bx.y - 8, vx: -35, vy: 75 + Math.random() * 40, r: 6, sway: 50, ph: Math.random() * 6 });
      }
    },
  },
  icicles: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.85;
        const bx = B.box, left = Math.random() < 0.5, y = B.soul.y + (Math.random() - 0.5) * 30;
        B.bullets.push({ kind: 'icicle', x: left ? bx.x - 20 : bx.x + bx.w + 20, y, vx: left ? 190 : -190, vy: 0, w: 26, h: 8, left });
      }
    },
  },
  jokeWords: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.75;
        const bx = B.box, left = Math.random() < 0.5;
        const words = B.e.words || ['HA', 'HAHA', 'KKKK', 'PIADA', 'HUEHUE', 'RIA!', 'BUU', 'HIHI'];
        const t = words[(Math.random() * words.length) | 0];
        ctx.font = `28px ${FONT}`;
        const w = ctx.measureText(t).width;
        B.bullets.push({ kind: 'word', text: t, x: left ? bx.x - w : bx.x + bx.w + w, y: bx.y + 16 + Math.random() * (bx.h - 32), vx: left ? 130 : -130, vy: 0, w: w * 0.9, h: 16 });
      }
    },
  },
  fireRing: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.9;
        const n = 18, gap = (Math.random() * n) | 0, cx = B.soul.x, cy = B.soul.y, R = 150;
        for (let i = 0; i < n; i++) {
          if (Math.abs(i - gap) <= 1 || Math.abs(i - gap) >= n - 1) continue;
          const a = i / n * Math.PI * 2;
          B.bullets.push({ kind: 'fireball', x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, vx: -Math.cos(a) * 85, vy: -Math.sin(a) * 85, r: 6, life: 3.4 });
        }
      }
    },
  },
  skulls: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 0.9;
        const bx = B.box, side = (Math.random() * 4) | 0;
        const x = side === 0 ? bx.x + 10 : side === 1 ? bx.x + bx.w - 10 : bx.x + Math.random() * bx.w;
        const y = side === 2 ? bx.y + 10 : side === 3 ? bx.y + bx.h - 10 : bx.y + Math.random() * bx.h;
        B.bullets.push({ kind: 'skull', x, y, vx: 0, vy: 0, r: 7, home: 1.3, pop: true, life: 4 });
      }
    },
  },
  walls: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.15;
        const bx = B.box, gap = bx.y + 30 + Math.random() * (bx.h - 60), left = (B.pState.n = (B.pState.n || 0) + 1) % 2;
        for (let y = bx.y + 8; y < bx.y + bx.h; y += 16) {
          if (Math.abs(y - gap) < 26) continue;
          B.bullets.push({ kind: 'fireball', x: left ? bx.x - 10 : bx.x + bx.w + 10, y, vx: left ? 120 : -120, vy: 0, r: 6 });
        }
      }
    },
  },
  finale: {
    update(B, dt) {
      PATTERNS.fireRain.update(B, dt);
      B.pState.w = (B.pState.w || 0) - dt;
      if (B.pState.w <= 0) { B.pState.w = 1.3; const t = B.spawnT; B.spawnT = 0; PATTERNS.jokeWords.update(B, 0); B.spawnT = t; }
    },
  },
  orbs: {
    update(B, dt) {
      B.spawnT -= dt;
      if (B.spawnT <= 0) {
        B.spawnT = 1.4;
        const bx = B.box;
        const pts = [[bx.x + 14, bx.y + 14], [bx.x + bx.w - 14, bx.y + 14], [bx.x + 14, bx.y + bx.h - 14], [bx.x + bx.w - 14, bx.y + bx.h - 14]];
        const p = pts[(Math.random() * 4) | 0];
        B.bullets.push({ kind: 'orb', x: p[0], y: p[1], vx: 0, vy: 0, r: 8, home: 1.6, pop: true });
      }
    },
  },
};

const BULLET_DRAW = {
  magmaRock(b, t) {
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a3a36'; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff7a1a'; ctx.fillRect(b.x - 4, b.y - 1, 5, 2); ctx.fillRect(b.x + 1, b.y + 2, 3, 2); ctx.fillRect(b.x - 1, b.y - 5, 2, 3);
  },
  lavaPillar(b, t) {
    const active = b.t >= b.warn;
    if (!active) { ctx.fillStyle = `rgba(255,90,20,${0.25 + Math.sin(t * 30) * 0.1})`; ctx.fillRect(b.x - b.w / 2, b.y + b.h / 2 - 12, b.w, 12); return; }
    const k = Math.min(1, (b.t - b.warn) / 0.12), h = b.h * k;
    ctx.fillStyle = '#ff3a0a'; ctx.fillRect(b.x - b.w / 2, b.y + b.h / 2 - h, b.w, h);
    ctx.fillStyle = '#ffb21a'; ctx.fillRect(b.x - b.w / 4, b.y + b.h / 2 - h, b.w / 2, h);
    ctx.fillStyle = '#ffe680'; ctx.fillRect(b.x - 2, b.y + b.h / 2 - h, 4, h);
  },
  ember(b, t) {
    ctx.fillStyle = 'rgba(255,120,20,0.4)'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = Math.floor(t * 12 + b.ph * 3) % 2 ? '#ffb21a' : '#ff5a1a'; ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
    ctx.fillStyle = '#ffe680'; ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
  },
  web(b) {
    ctx.strokeStyle = 'rgba(240,240,255,0.9)'; ctx.lineWidth = 2;
    const hw = b.w / 2, hh = b.h / 2;
    ctx.beginPath(); ctx.moveTo(b.x - hw, b.y - hh); ctx.lineTo(b.x + hw, b.y + hh); ctx.moveTo(b.x + hw, b.y - hh); ctx.lineTo(b.x - hw, b.y + hh); ctx.stroke();
    ctx.strokeRect(b.x - hw, b.y - hh, b.w, b.h);
  },
  spiderling(b, t) {
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a2a2a'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { const a = i * 0.5 - 0.75 + Math.sin(t * 20) * 0.2; ctx.beginPath(); ctx.moveTo(b.x - 4, b.y); ctx.lineTo(b.x - 9, b.y + Math.sin(a) * 7); ctx.moveTo(b.x + 4, b.y); ctx.lineTo(b.x + 9, b.y + Math.sin(a) * 7); ctx.stroke(); }
    ctx.fillStyle = '#ffd23a'; ctx.fillRect(b.x - 2, b.y - 2, 1, 1); ctx.fillRect(b.x + 1, b.y - 2, 1, 1);
  },
  bone(b) {
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 4, b.y - b.h / 2, 8, b.h);
    ctx.fillStyle = '#f0ece0'; ctx.fillRect(b.x - 3, b.y - b.h / 2 + 1, 6, b.h - 2);
    ctx.fillRect(b.x - 5, b.y - b.h / 2, 10, 4); ctx.fillRect(b.x - 5, b.y + b.h / 2 - 4, 10, 4);
  },
  boneH(b) {
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 13, b.y - 4, 26, 8);
    ctx.fillStyle = '#f0ece0'; ctx.fillRect(b.x - 12, b.y - 3, 24, 6); ctx.fillRect(b.x - 14, b.y - 5, 4, 10); ctx.fillRect(b.x + 10, b.y - 5, 4, 10);
  },
  foxfire(b, t) {
    ctx.fillStyle = 'rgba(95,200,255,0.4)'; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5fc8ff'; ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8f8ff'; ctx.beginPath(); ctx.arc(b.x, b.y - 2 + Math.sin(t * 10), 3, 0, Math.PI * 2); ctx.fill();
  },
  petal(b, t) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(t * 3 + b.ph);
    ctx.fillStyle = '#f8a8c8'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd8e8'; ctx.fillRect(-2, -1, 3, 1); ctx.restore();
  },
  soldier(b, t) {
    const img = SPR.guard; ctx.drawImage(img, b.x - 8, b.y - 9 + (Math.floor(t * 8) % 2), 16, 17);
  },
  cube(b) {
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 6, b.y - 6, 12, 12);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x - 5, b.y - 5, 10, 10); ctx.fillStyle = '#d8dce8'; ctx.fillRect(b.x - 5, b.y + 2, 10, 3);
  },
  coin(b, t) {
    const w = Math.abs(Math.cos(t * 6)) * 7 + 1;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(b.x, b.y, w + 1, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.ellipse(b.x, b.y, w, 7, 0, 0, Math.PI * 2); ctx.fill();
  },
  paper(b, t) {
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4f4f0'; ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9aa'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.x - 4, b.y - 1); ctx.lineTo(b.x + 3, b.y + 2); ctx.stroke();
  },
  eraser(b) {
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 9, b.y - 6, 18, 12);
    ctx.fillStyle = '#ff8ab0'; ctx.fillRect(b.x - 8, b.y - 5, 10, 10); ctx.fillStyle = '#5a8ad8'; ctx.fillRect(b.x + 2, b.y - 5, 6, 10);
  },
  backpack(b) {
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 16, b.y - 16, 32, 32);
    ctx.fillStyle = '#d8443a'; ctx.fillRect(b.x - 14, b.y - 14, 28, 28);
    ctx.fillStyle = '#9a2a20'; ctx.fillRect(b.x - 10, b.y, 20, 10); ctx.fillStyle = '#ffd23a'; ctx.fillRect(b.x - 2, b.y + 2, 4, 3);
  },
  spit(b) {
    ctx.fillStyle = '#9adf8a'; ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8ffd0'; ctx.fillRect(b.x - 2, b.y - 3, 2, 2);
  },
  ruler(b) {
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 5, b.y - b.h / 2, 10, b.h);
    ctx.fillStyle = '#ffd23a'; ctx.fillRect(b.x - 4, b.y - b.h / 2 + 1, 8, b.h - 2);
    ctx.fillStyle = '#000'; for (let y = 4; y < b.h; y += 6) ctx.fillRect(b.x - 4, b.y - b.h / 2 + y, 3, 1);
  },
  laser(b) {
    const active = b.t >= b.warn;
    ctx.fillStyle = active ? '#ff3b3b' : 'rgba(255,59,59,0.35)';
    if (active) ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    else { for (let i = -b.w / 2; i < b.w / 2; i += 10) if (b.w > b.h) ctx.fillRect(b.x + i, b.y - 1, 6, 2); for (let i = -b.h / 2; i < b.h / 2; i += 10) if (b.h > b.w) ctx.fillRect(b.x - 1, b.y + i, 2, 6); }
    if (active) { ctx.fillStyle = '#fff'; if (b.w > b.h) ctx.fillRect(b.x - b.w / 2, b.y - 1, b.w, 2); else ctx.fillRect(b.x - 1, b.y - b.h / 2, 2, b.h); }
  },
  dust(b, t) {
    ctx.fillStyle = '#8a8a9a'; for (let i = 0; i < 4; i++) { const a = t * 6 + i * 1.6; ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * 3, b.y + Math.sin(a) * 3, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#c8c8d4'; ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
  },
  peng(b) {
    const img = SPR.pinguim; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.left ? Math.PI / 2 : -Math.PI / 2);
    ctx.drawImage(img, -12, -12, 24, 24); ctx.restore();
  },
  fish(b, t) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx));
    ctx.fillStyle = '#8ab4d8'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-13, -5); ctx.lineTo(-13, 5); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(4, -2, 2, 2); ctx.restore();
  },
  snowball(b) {
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4f8ff'; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c8d8ec'; ctx.beginPath(); ctx.arc(b.x + 3, b.y + 3, 5, 0, Math.PI * 2); ctx.fill();
  },
  ember(b, t) { drawFlame(b.x, b.y + 5, 13, t * 10 + b.ph); },
  fireball(b, t) {
    ctx.fillStyle = 'rgba(255,90,20,0.5)'; ctx.beginPath(); ctx.arc(b.x - b.vx * 0.04, b.y - b.vy * 0.04, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff7a1a'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2); ctx.fill();
  },
  flake(b, t) {
    ctx.strokeStyle = '#e8f8ff'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const a = t * 2 + i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(b.x - Math.cos(a) * 7, b.y - Math.sin(a) * 7); ctx.lineTo(b.x + Math.cos(a) * 7, b.y + Math.sin(a) * 7); ctx.stroke(); }
  },
  icicle(b) {
    ctx.fillStyle = '#9fe4ff'; ctx.beginPath();
    const d = b.left ? 1 : -1;
    ctx.moveTo(b.x - d * 13, b.y - 5); ctx.lineTo(b.x + d * 13, b.y); ctx.lineTo(b.x - d * 13, b.y + 5); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(b.x - 8, b.y - 1, 10, 2);
  },
  word(b) {
    ctx.font = `28px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff9a3a'; ctx.fillText(b.text, b.x + 2, b.y + 2);
    ctx.fillStyle = '#fff'; ctx.fillText(b.text, b.x, b.y);
  },
  skull(b, t) {
    drawFlame(b.x, b.y - 2, 12, t * 12);
    ctx.fillStyle = '#ffe0c2'; ctx.beginPath(); ctx.arc(b.x, b.y + 2, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 4, b.y, 2, 2); ctx.fillRect(b.x + 2, b.y, 2, 2);
  },
  star(b, t) { drawStar(b.x, b.y, 8, t * 4, '#fff7a0'); },
  spore(b) { ctx.fillStyle = '#9fe07a'; ctx.fillRect(b.x - 5, b.y - 5, 10, 10); ctx.fillStyle = '#2f6e30'; ctx.fillRect(b.x - 2, b.y - 2, 4, 4); },
  vine(b) { ctx.fillStyle = '#4fa64a'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2f6e30'; ctx.fillRect(b.x - 2, b.y - 7, 4, 3); },
  tear(b) {
    ctx.fillStyle = '#7fd9ff'; ctx.beginPath(); ctx.arc(b.x, b.y + 2, 6, 0, Math.PI); ctx.lineTo(b.x, b.y - 9); ctx.closePath(); ctx.fill();
  },
  orb(b, t) {
    ctx.globalAlpha = 0.6 + Math.sin(t * 10) * 0.2; ctx.fillStyle = '#e9eefa';
    ctx.beginPath(); ctx.arc(b.x, b.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#2a2440'; ctx.fillRect(b.x - 4, b.y - 2, 2, 3); ctx.fillRect(b.x + 2, b.y - 2, 2, 3);
  },
};
