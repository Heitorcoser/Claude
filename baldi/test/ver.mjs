// Abre o jogo num celular simulado, entra no modo e tira fotos: node test/ver.mjs <modo> <pasta fotos>
import { chromium, devices } from '/home/user/fabrica/test/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFileSync } from 'fs'; import { join, extname } from 'path';
const app = new URL('../app/', import.meta.url).pathname, [modo = 'historia', out = '/tmp'] = process.argv.slice(2);
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg' };
const srv = createServer((q, r) => { try { const f = join(app, decodeURIComponent(q.url.split('?')[0]) == '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0])); const d = readFileSync(f); r.writeHead(200, { 'content-type': tipos[extname(f)] || 'application/octet-stream' }); r.end(d); } catch (e) { r.writeHead(404); r.end(); } }).listen(8790);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ ...devices['Pixel 7'], viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const errs = []; p.on('response', (r) => r.status() >= 400 && errs.push('404 ' + r.url())); p.on('pageerror', (e) => errs.push((e.stack || e.message).split('\n').slice(0, 3).join(' <- '))); p.on('console', (m) => m.type() == 'error' && errs.push(m.text()));
await p.goto('http://localhost:8790/'); await p.waitForTimeout(500); await p.click('#titulo'); await p.waitForTimeout(300);
await p.screenshot({ path: out + '/b_menu.png' });
if (process.env.FEAT) await p.evaluate((f) => (Jogo.betaFeat = JSON.parse(f)), process.env.FEAT);
if (process.env.JS) await p.evaluate(process.env.JS);
await p.evaluate((m) => Jogo.comeca(m), modo);
await p.waitForFunction(() => Jogo.G && document.getElementById('carregando').hidden, null, { timeout: 120000 });
await p.waitForTimeout(2500);
await p.screenshot({ path: out + '/b_inicio.png' });
const info = await p.evaluate(() => { const G = Jogo.G; return { p: [G.p.x, G.p.z], objs: G.objs.length, portas: G.portas.length, nav: Jogo.nav.livre.reduce((a, b) => a + b, 0) + '/' + Jogo.nav.livre.length }; });
console.log(JSON.stringify(info));
// anda para a frente 2 s
await p.evaluate(() => (Jogo.ent.mz = 1)); await p.waitForTimeout(2000); await p.evaluate(() => (Jogo.ent.mz = 0));
await p.screenshot({ path: out + '/b_andou.png' });
console.log('pos depois de andar:', await p.evaluate(() => [Jogo.G.p.x.toFixed(1), Jogo.G.p.z.toFixed(1)]));
if (process.env.EXTRA) await (await import(process.env.EXTRA)).default(p, out);
console.log(errs.length ? 'ERROS: ' + errs.slice(0, 8).join(' | ') : 'SEM ERROS'); await b.close(); srv.close();
