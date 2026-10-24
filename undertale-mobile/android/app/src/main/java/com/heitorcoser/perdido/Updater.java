package com.heitorcoser.perdido;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

// Atualização automática: procura a versão mais nova nos lançamentos (Releases) do
// GitHub. Cada lançamento tem a tag "v<versionCode>" e o arquivo Perdido.apk.
// Se houver uma versão maior que a instalada, o jogo pergunta se quer atualizar,
// baixa o APK e abre o instalador do Android.
public class Updater {
    static final String REPO = "heitorcoser/losters";
    static final String API = "https://api.github.com/repos/" + REPO + "/releases/latest";

    private final Activity act;
    private String apkUrl;
    private boolean waitingPermission;

    Updater(Activity act) { this.act = act; }

    void check() {
        new Thread(() -> {
            try {
                JSONObject rel = new JSONObject(get(API));
                int latest = Integer.parseInt(rel.getString("tag_name").replaceAll("[^0-9]", ""));
                if (latest <= currentVersion()) return;
                JSONArray assets = rel.getJSONArray("assets");
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject a = assets.getJSONObject(i);
                    if (a.getString("name").endsWith(".apk")) apkUrl = a.getString("browser_download_url");
                }
                if (apkUrl == null) return;
                String name = rel.optString("name", "nova versão");
                String notes = rel.optString("body", "").trim();
                act.runOnUiThread(() -> ask(name, notes));
            } catch (Exception ignored) {
                // sem internet ou sem lançamento: o jogo continua normalmente
            }
        }).start();
    }

    private void ask(String name, String notes) {
        if (act.isFinishing()) return;
        String msg = "Tem uma versão nova do jogo: " + name + "\n\n" + (notes.length() > 600 ? notes.substring(0, 600) + "..." : notes);
        new AlertDialog.Builder(act)
            .setTitle("Atualização disponível!")
            .setMessage(msg)
            .setPositiveButton("Atualizar agora", (d, w) -> startInstall())
            .setNegativeButton("Depois", null)
            .show();
    }

    private void startInstall() {
        if (Build.VERSION.SDK_INT >= 26 && !act.getPackageManager().canRequestPackageInstalls()) {
            waitingPermission = true;
            new AlertDialog.Builder(act)
                .setTitle("Permissão necessária")
                .setMessage("Para instalar a atualização, permita que o Perdido instale apps. Depois é só voltar para o jogo.")
                .setPositiveButton("Abrir configurações", (d, w) -> act.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + act.getPackageName()))))
                .setNegativeButton("Cancelar", (d, w) -> waitingPermission = false)
                .show();
            return;
        }
        download();
    }

    // Chamado no onResume: se o jogador acabou de dar a permissão, continua a atualização.
    void onResume() {
        if (waitingPermission && Build.VERSION.SDK_INT >= 26 && act.getPackageManager().canRequestPackageInstalls()) {
            waitingPermission = false;
            download();
        }
    }

    @SuppressWarnings("deprecation")
    private void download() {
        ProgressDialog pd = new ProgressDialog(act);
        pd.setTitle("Baixando atualização...");
        pd.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
        pd.setMax(100);
        pd.setCancelable(false);
        pd.show();
        new Thread(() -> {
            try {
                File out = new File(act.getCacheDir(), "Perdido-update.apk");
                HttpURLConnection c = (HttpURLConnection) new URL(apkUrl).openConnection();
                c.setInstanceFollowRedirects(true);
                c.setRequestProperty("User-Agent", "Perdido-Android");
                int total = c.getContentLength();
                try (InputStream in = c.getInputStream(); FileOutputStream fo = new FileOutputStream(out)) {
                    byte[] buf = new byte[16384];
                    int n, done = 0;
                    while ((n = in.read(buf)) > 0) {
                        fo.write(buf, 0, n);
                        done += n;
                        if (total > 0) { final int pct = (int) (done * 100L / total); act.runOnUiThread(() -> pd.setProgress(pct)); }
                    }
                }
                act.runOnUiThread(() -> { pd.dismiss(); install(); });
            } catch (Exception e) {
                act.runOnUiThread(() -> {
                    pd.dismiss();
                    new AlertDialog.Builder(act).setTitle("Não deu certo").setMessage("Não foi possível baixar a atualização agora. Tente mais tarde.").setPositiveButton("OK", null).show();
                });
            }
        }).start();
    }

    private void install() {
        Intent i = new Intent(Intent.ACTION_VIEW);
        i.setDataAndType(Uri.parse("content://" + ApkProvider.AUTHORITY + "/Perdido-update.apk"), "application/vnd.android.package-archive");
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        act.startActivity(i);
    }

    @SuppressWarnings("deprecation")
    private long currentVersion() throws Exception {
        PackageInfo pi = act.getPackageManager().getPackageInfo(act.getPackageName(), 0);
        return Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
    }

    private static String get(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestProperty("User-Agent", "Perdido-Android");
        c.setRequestProperty("Accept", "application/vnd.github+json");
        c.setConnectTimeout(8000);
        c.setReadTimeout(8000);
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return b.toString("UTF-8");
        }
    }
}
