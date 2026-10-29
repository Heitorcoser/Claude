// Multiplayer com dois "celulares" no mesmo navegador (BroadcastChannel no lugar da internet): node test/mp.mjs <pasta fotos> [modo] [FEAT json]
import { chromium, devices } from '/home/user/fabrica/test/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFileSync } from 'fs'; import { join, extname } from 'path';
const app = new URL('../app/', import.meta.url).pathname, [out = '/tmp', modo = 'historia', feat = ''] = process.argv.slice(2);
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg' };
const srv = createServer((q, r) => { try { const f = join(app, decodeURIComponent(q.url.split('?')[0]) == '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0])); const d = readFileSync(f); r.writeHead(200, { 'content-type': tipos[extname(f)] || 'application/octet-stream' }); r.end(d); } catch (e) { r.writeHead(404); r.end(); } }).listen(8791);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ ...devices['Pixel 7'], viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
const errs = [];
const abre = async (n) => {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(n + ': ' + (e.stack || e.message).split('\n').slice(0, 3).join(' <- '))); p.on('console', (m) => m.type() == 'error' && !/versao|404/.test(m.text()) && errs.push(n + ': ' + m.text()));
  await p.route('**/versao.json*', (r) => r.fulfill({ contentType: 'application/json', body: '{"versao":"0"}' }));
  await p.goto('http://localhost:8791/?mp=local'); await p.waitForTimeout(400); await p.tap('#titulo'); await p.waitForTimeout(200);
  return p;
};
const A = await abre('anfitrião'), B = await abre('convidado');
// anfitrião cria a sala
await A.tap('#jMulti'); await A.fill('#mpNome', 'Ana'); await A.tap('#mpCriar'); await A.waitForTimeout(300);
const codigo = await A.evaluate(() => document.getElementById('mpCodigo').textContent);
// convidado entra com o código
await B.tap('#jMulti'); await B.fill('#mpNome', 'Beto'); await B.fill('#mpCodigoIn', codigo); await B.tap('#mpEntrar'); await B.waitForTimeout(600);
console.log('sala', codigo, '| lista no anfitrião:', await A.evaluate(() => document.getElementById('mpLista').textContent), '| no convidado:', await B.evaluate(() => document.getElementById('mpLista').textContent));
await A.screenshot({ path: out + '/mp_sala.png' });
// anfitrião escolhe o modo e começa
if (feat) await A.evaluate(([f, m]) => Object.assign(m == 'beta' ? Jogo.betaFeat : Jogo.histFeat, JSON.parse(f)), [feat, modo]);
await A.evaluate((m) => Jogo.comeca(m), modo);
for (const p of [A, B]) await p.waitForFunction(() => Jogo.G && document.getElementById('carregando').hidden, null, { timeout: 180000 });
await A.waitForTimeout(2500);
const mapa = (p) => p.evaluate(() => [Jogo.G.modo, Jogo.E.gerado ? 'aleatório' : 'original', Jogo.G.objs.length, Jogo.G.portas.length, Jogo.G.objs.filter((o) => o.tipo == 'caderno').map((o) => o.x.toFixed(0) + ',' + o.z.toFixed(0)).join(' ')]);
const ma = await mapa(A), mb = await mapa(B);
console.log('mesma escola?', JSON.stringify(ma) === JSON.stringify(mb), JSON.stringify(ma).slice(0, 120));
const tA = await A.evaluate(() => Jogo.G.t), tB = await B.evaluate(() => Jogo.G.t); await A.waitForTimeout(1000);
console.log('tempo andando: anfitrião', (await A.evaluate(() => Jogo.G.t) - tA).toFixed(2), '| convidado', (await B.evaluate(() => Jogo.G.t) - tB).toFixed(2), '| visível:', await A.evaluate(() => document.visibilityState), await B.evaluate(() => document.visibilityState));
// o convidado anda: o anfitrião vê o boneco dele
await B.evaluate(() => { window.__tp = 0; const o = Jogo.mp; (Jogo.ent.mz = 1); });
for (let k = 0; k < 4; k++) { await B.waitForTimeout(500); console.log('  convidado:', await B.evaluate(() => [Jogo.G.p.x.toFixed(1), Jogo.G.p.z.toFixed(1), Jogo.G.pausado, Jogo.G.aprendendo, Jogo.G.fim, Jogo.ent.mz, Jogo.G.t.toFixed(1)].join(' '))); }
await B.evaluate(() => (Jogo.ent.mz = 0)); await B.waitForTimeout(500);
const posB = await B.evaluate(() => [Jogo.G.p.x, Jogo.G.p.z]);
const vistoA = await A.evaluate(() => { const r = Object.values(Jogo.mp.remotos)[0]; return r ? [r.x, r.z] : null; });
console.log('convidado em', posB.map((v) => v.toFixed(1)).join(','), '| anfitrião vê em', vistoA && vistoA.map((v) => v.toFixed(1)).join(','), '| boneco:', await A.evaluate(() => Object.keys(Jogo.mp.avatares).length));
await A.evaluate(([x, z]) => { const G = Jogo.G; G.p.x = x; G.p.z = z + 8; G.p.yaw = 0; }, posB); await A.waitForTimeout(600);
await A.screenshot({ path: out + '/mp_ve_convidado.png' });
// o convidado pega um caderno: some no anfitrião e conta para a equipe
const i = await B.evaluate(() => { const G = Jogo.G, o = G.objs.find((o) => o.tipo == 'caderno' && o.ativo); Jogo.pegaCaderno(o); return G.objs.indexOf(o); });
await B.waitForTimeout(800);
console.log('caderno', i, '| anfitrião: ativo?', await A.evaluate((i) => Jogo.G.objs[i].ativo, i), 'cadernos', await A.evaluate(() => Jogo.G.cadernos), '| convidado cadernos', await B.evaluate(() => Jogo.G.cadernos));
// erra a conta: o Baldi acorda nos dois
await B.evaluate(() => { for (let k = 0; k < 3; k++) document.querySelector('#teclado button[data-k="OK"]').dispatchEvent(new PointerEvent('pointerdown')); });
await B.waitForFunction(() => !Jogo.G.aprendendo, null, { timeout: 20000 });
await A.waitForTimeout(800);
console.log('Baldi ativo: anfitrião', await A.evaluate(() => Jogo.G.npcs.baldi.ativo), '| convidado', await B.evaluate(() => Jogo.G.npcs.baldi.ativo));
// o Baldi vai atrás do convidado (o anfitrião fica longe, escondido)
await A.evaluate(() => { const G = Jogo.G, b = G.npcs.baldi; for (const n of Object.values(G.npcs)) if (n !== b) { n.ativo = false; if (n.spr) n.spr.visible = false; } G.p.x = -9999; G.p.z = -9999; Jogo.invencivel = true; });
const bx = await A.evaluate(() => { const b = Jogo.G.npcs.baldi; return [b.x, b.z]; });
const dir = await A.evaluate(([x, z]) => { for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (Jogo.mundo.raio(x, z, dx, dz, 30) > 16) return [dx, dz]; return [1, 0]; }, bx);
await B.evaluate(([x, z, dx, dz]) => { const G = Jogo.G; G.p.x = x + dx * 12; G.p.z = z + dz * 12; }, [...bx, ...dir]);
let perto = 999;
for (let k = 0; k < 40 && perto > 3; k++) { await B.waitForTimeout(1000); perto = await B.evaluate(() => { const G = Jogo.G, b = G.npcs.baldi; return Math.hypot(b.x - G.p.x, b.z - G.p.z); }); }
await B.screenshot({ path: out + '/mp_baldi_convidado.png' });
console.log('Baldi chegou perto do convidado:', perto.toFixed(1), '| convidado pego?', await B.evaluate(() => Jogo.mp.pegoEu), '| anfitrião sabe?', await A.evaluate(() => Object.values(Jogo.mp.remotos)[0].pego));
// o anfitrião também foi pego: acabou para os dois
await A.evaluate(() => { Jogo.invencivel = false; const G = Jogo.G; Jogo.mp.pegoEu = false; const b = G.npcs.baldi; G.p.x = b.x; G.p.z = b.z; });
await A.waitForTimeout(3500);
console.log('fim: anfitrião', await A.evaluate(() => [Jogo.G.fim, document.getElementById('fimTxt').textContent]), '| convidado', await B.evaluate(() => [Jogo.G.fim, document.getElementById('fimTxt').textContent, document.getElementById('denovo').hidden]));
console.log(errs.length ? 'ERROS: ' + errs.slice(0, 8).join(' | ') : 'SEM ERROS'); await b.close(); srv.close();
