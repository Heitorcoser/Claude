package com.heitor.baldibeta;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.webkit.JavascriptInterface;

// Ponte JS -> Android: o jogo só pergunta se as notificações estão ligadas (nunca pede a permissão)
// e pode fechar o app (o "crash" quando o Null pega o jogador)
public class Ponte implements Runnable {
    private final Activity act;

    public Ponte(Activity act) { this.act = act; }

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
    public void fecha() { act.runOnUiThread(this); }

    @Override
    public void run() {
        act.finishAndRemoveTask();
        android.os.Process.killProcess(android.os.Process.myPid());
    }
}
