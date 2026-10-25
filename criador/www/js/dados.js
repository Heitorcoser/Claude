// Dados do Criador: batalha padrão, salvar no aparelho, fotos e código de compartilhar.
'use strict';

const LS_KEY = 'criador_batalhas_v1';
const uid = () => Math.random().toString(36).slice(2, 9);

const MUSICAS = {
  boss: 'Chefe', battle: 'Batalha', mestre: 'Mestre', mestre2: 'Mestre (fase 2)', carmim: 'Carmim', final2: 'Final épico', fuga7: 'Fuga',
  ghosts: 'Fantasmas', icetheme: 'Gelo', vulcao: 'Vulcão', draco: 'Dragão', guerra: 'Guerra', macaron: 'Vilão chique', surf: 'Rock rápido',
  treino2: 'Treino', encontro: 'Tenso', tristeza: 'Triste', carmino: 'Memória', esperanca: 'Esperança', title: 'Calmo', doce: 'Docinho', festival: 'Festa',
};
const PROJETEIS = { osso: '🦴 Osso', estrela: '⭐ Estrela', faca: '🔪 Faca', fogo: '🔥 Fogo', coracao: '❤️ Coração', bola: '⚪ Bola', emoji: '😀 Emoji (qualquer um)', foto: '🖼️ Minha foto' };
const CORES = { normal: 'Normal', azul: 'Azul (não se mexa)', laranja: 'Laranja (se mexa)' };
const CAIXAS = { p: 'Pequena', m: 'Média', g: 'Grande' };

function novoAtaque(tipo = 'chuva', projetil = 'bola') {
  return { id: uid(), tipo, projetil, emoji: '🍔', foto: null, cor: 'normal', velocidade: 3, quantidade: 3, duracao: 7, caixa: 'm' };
}

function novaBatalha() {
  return {
    id: uid(), versao: 1, criado: Date.now(),
    inimigo: {
      nome: 'Bolinha Brava', foto: null, pixel: true, vida: 120, ataque: 3, defesa: 1, musica: 'boss',
      entrada: '* Bolinha Brava bloqueia o caminho!',
      checar: '* BOLINHA BRAVA - ATK 3 DEF 1\n* Está brava porque ninguém brinca com ela.',
      falas: 'Sai da frente!\nEu sou muito forte!\nNinguém brinca comigo...\nPara de desviar!',
      flavor: ['* A Bolinha Brava pula sem parar.', '* Cheiro de chiclete no ar.'],
    },
    jogador: { nome: 'HUMANO', vida: 30, forca: 12 },
    acoes: [
      { nome: 'Brincar', texto: '* Você joga a bolinha pra cima.\n* Ela adora!', misericordia: 40 },
      { nome: 'Elogiar', texto: '* Você diz que ela é a bolinha mais bonita do mundo.', misericordia: 30 },
      { nome: 'Encarar', texto: '* Você encara a bolinha.\n* Ela fica com mais raiva.', misericordia: -10 },
    ],
    itens: [{ nome: 'Torta', cura: 99 }, { nome: 'Doce', cura: 15 }, { nome: 'Doce', cura: 15 }],
    podePoupar: true, karma: false, fundo: '#123a1e',
    ataques: [novoAtaque('chuva', 'estrela'), novoAtaque('paredes', 'osso'), { ...novoAtaque('perseguir', 'emoji'), emoji: '😡' }],
    fase2: { ativa: false, modo: 'porcentagem', porcentagem: 50, vida: 150, ataqueExtra: 1, quebrarPoupar: true, foto: null, musica: 'final2',
      falas: '* A Bolinha Brava fica VERMELHA de raiva!\n* ...Ela não vai mais pegar leve.', falasLuta: 'AGORA É SÉRIO!\nVOCÊ VAI VER!',
      ataques: [{ ...novoAtaque('anel', 'faca'), velocidade: 4 }, { ...novoAtaque('canhao', 'emoji'), emoji: '💀' }] },
    textoVitoria: '* A Bolinha Brava virou pó...', textoPoupar: '* A Bolinha Brava sorri pra você.\n* Ela só queria um amigo.',
  };
}

const Store = {
  all() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; } },
  saveAll(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); return true; }
    catch (e) { alert('A memória do aparelho encheu. Apague alguma batalha ou use fotos menores.'); return false; }
  },
  get(id) { return this.all().find(b => b.id === id); },
  put(b) { const l = this.all(), i = l.findIndex(x => x.id === b.id); if (i >= 0) l[i] = b; else l.unshift(b); return this.saveAll(l); },
  del(id) { this.saveAll(this.all().filter(b => b.id !== id)); },
};

// Foto -> imagem pequena (pra caber no aparelho e no código de compartilhar)
function lerFoto(file, max) {
  return new Promise((ok, fail) => {
    const r = new FileReader();
    r.onerror = fail;
    r.onload = () => {
      const img = new Image();
      img.onerror = fail;
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
        const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(img, 0, 0, c.width, c.height);
        let url = c.toDataURL('image/webp', 0.85);
        if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/png');
        ok(url);
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

// ---------- código de compartilhar ----------
const b64 = buf => { let s = ''; const a = new Uint8Array(buf); for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = str => { const s = atob(str), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; };
async function pipe(data, stream) { return new Response(new Blob([data]).stream().pipeThrough(stream)).arrayBuffer(); }
async function gerarCodigo(b) {
  const json = JSON.stringify({ ...b, id: undefined });
  if (typeof CompressionStream !== 'undefined') return 'BTL1:' + b64(await pipe(new TextEncoder().encode(json), new CompressionStream('deflate')));
  return 'BTL0:' + b64(new TextEncoder().encode(json));
}
async function lerCodigo(code) {
  code = (code || '').trim().replace(/\s+/g, '');
  const m = /^(BTL[01]):(.+)$/.exec(code);
  if (!m) throw new Error('Esse não é um código de batalha.');
  let bytes = unb64(m[2]);
  if (m[1] === 'BTL1') bytes = new Uint8Array(await pipe(bytes, new DecompressionStream('deflate')));
  const b = JSON.parse(new TextDecoder().decode(bytes));
  if (!b.inimigo || !b.ataques) throw new Error('Código incompleto.');
  // completa campos que faltarem (códigos de versões antigas)
  const base = novaBatalha();
  return { ...base, ...b, inimigo: { ...base.inimigo, ...b.inimigo }, jogador: { ...base.jogador, ...b.jogador }, fase2: { ...base.fase2, ...(b.fase2 || {}) }, id: uid(), criado: Date.now() };
}

// Compartilhar / copiar (no app Android usa a ponte nativa)
const Nativo = window.CriadorNativo || null;
async function compartilhar(text, titulo) {
  if (Nativo && Nativo.compartilhar) return Nativo.compartilhar(text, titulo || 'Batalha');
  if (navigator.share) { try { await navigator.share({ title: titulo, text }); return; } catch (e) { } }
  return copiar(text);
}
async function copiar(text) {
  if (Nativo && Nativo.copiar) { Nativo.copiar(text); return true; }
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e2) { } t.remove(); return true; }
}
