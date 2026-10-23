package com.heitor.baldibeta;

import android.app.NotificationManager;
import android.content.Context;
import android.webkit.JavascriptInterface;

// Ponte JS -> Android: o jogo só pergunta se as notificações estão ligadas (nunca pede a permissão)
public class Ponte {
    private final Context ctx;

    public Ponte(Context ctx) { this.ctx = ctx; }

    @JavascriptInterface
    public boolean notificacoes() {
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            return nm != null && nm.areNotificationsEnabled();
        } catch (Exception e) {
            return false;
        }
    }
}
