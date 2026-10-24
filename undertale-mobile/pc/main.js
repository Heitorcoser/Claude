// PERDIDO para PC (Windows 10/11). Abre o jogo (pasta www) numa janela e,
// ao abrir, procura uma versão nova nos lançamentos do GitHub para se atualizar.
const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const { spawn } = require('child_process');

const REPO = 'heitorcoser/losters';
const VERSION_CODE = require('./package.json').perdido.versionCode;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 960, minWidth: 640, minHeight: 480,
    backgroundColor: '#000000', autoHideMenuBar: true, title: 'Perdido',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, backgroundThrottling: false },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'www', 'index.html'));
  // F11: tela cheia
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  setTimeout(checkUpdate, 3000);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

function request(url, onRes) {
  return https.get(url, { headers: { 'User-Agent': 'Perdido-PC', Accept: 'application/vnd.github+json' } }, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); return request(res.headers.location, onRes); }
    onRes(res);
  });
}
function getJSON(url) {
  return new Promise((ok, fail) => {
    request(url, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => { try { ok(JSON.parse(data)); } catch (e) { fail(e); } });
    }).on('error', fail);
  });
}
function download(url, dest, onProgress) {
  return new Promise((ok, fail) => {
    request(url, res => {
      if (res.statusCode !== 200) return fail(new Error('HTTP ' + res.statusCode));
      const total = +res.headers['content-length'] || 0;
      let done = 0;
      const out = fs.createWriteStream(dest);
      res.on('data', c => { done += c.length; if (total) onProgress(done / total); });
      res.pipe(out);
      out.on('finish', () => out.close(ok));
      out.on('error', fail);
    }).on('error', fail);
  });
}

async function checkUpdate() {
  try {
    const rel = await getJSON(`https://api.github.com/repos/${REPO}/releases/latest`);
    const latest = parseInt(String(rel.tag_name).replace(/\D/g, ''), 10);
    if (!(latest > VERSION_CODE)) return;
    const asset = (rel.assets || []).find(a => /\.exe$/i.test(a.name));
    if (!asset) return;
    const r = await dialog.showMessageBox(win, {
      type: 'info', buttons: ['Atualizar agora', 'Depois'], defaultId: 0, cancelId: 1,
      title: 'Atualização disponível!', message: `Tem uma versão nova do Perdido: ${rel.name}`,
      detail: String(rel.body || '').slice(0, 600),
    });
    if (r.response !== 0) return;
    const dest = path.join(os.tmpdir(), 'Perdido-Setup.exe');
    win.setProgressBar(0.01);
    await download(asset.browser_download_url, dest, p => win.setProgressBar(p));
    win.setProgressBar(-1);
    spawn(dest, [], { detached: true, stdio: 'ignore' }).unref();
    app.quit();
  } catch (e) {
    // sem internet ou sem lançamento: o jogo continua normalmente
    if (win) win.setProgressBar(-1);
  }
}
