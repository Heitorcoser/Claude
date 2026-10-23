package com.heitor.baldibeta;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

// Ponte JS -> Android:
// - notificações ligadas? (o jogo nunca pede a permissão)
// - fecha o app (o "crash" quando o Null pega o jogador)
// - captura do mouse (mouse ligado no celular) e versão/atualização do app
public class Ponte implements Runnable {
    private final Activity act;
    private final WebView web;
    private final Mouse mouse;
    private final Atualiza atualiza;
    private int acao;

    public Ponte(Activity act, WebView web) {
        this.act = act;
        this.web = web;
        this.mouse = new Mouse(web);
        this.atualiza = new Atualiza(act);
    }

    @JavascriptInterface
    public boolean notificacoes() {
        try {
            NotificationManager nm = (NotificationManager) act.getSystemService(Context.NOTIFICATION_SERVICE);
            return nm != null && nm.areNotificationsEnabled();
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public void fecha() { pede(0); }

    @JavascriptInterface
    public void capturaMouse(boolean on) { pede(on ? 1 : 2); }

    @JavascriptInterface
    public boolean mouseCapturado() { try { return web.hasPointerCapture(); } catch (Exception e) { return false; } }

    @JavascriptInterface
    public String versao() {
        try {
            PackageInfo pi = act.getPackageManager().getPackageInfo(act.getPackageName(), 0);
            return pi.versionName;
        } catch (Exception e) {
            return "";
        }
    }

    @JavascriptInterface
    public String pacote() { return act.getPackageName(); }

    @JavascriptInterface
    public void atualiza(String url) { atualiza.baixa(url); }

    private void pede(int a) {
        synchronized (this) { acao = a; }
        act.runOnUiThread(this);
    }

    @Override
    public void run() {
        int a;
        synchronized (this) { a = acao; }
        if (a == 0) {
            act.finishAndRemoveTask();
            android.os.Process.killProcess(android.os.Process.myPid());
        } else if (a == 1) {
            web.requestFocus();
            web.requestPointerCapture();
        } else {
            web.releasePointerCapture();
        }
    }
}
