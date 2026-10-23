package com.heitor.baldibeta;

import android.view.MotionEvent;
import android.view.View;
import android.webkit.WebView;

// Mouse ligado no celular: com a captura ligada, o movimento chega aqui (relativo) e vai para o jogo
public class Mouse implements View.OnCapturedPointerListener, Runnable {
    private final WebView web;
    private float dx, dy;
    private int botao, roda;
    private boolean pendente;

    public Mouse(WebView web) {
        this.web = web;
        web.setOnCapturedPointerListener(this);
    }

    @Override
    public boolean onCapturedPointer(View v, MotionEvent e) {
        synchronized (this) {
            int a = e.getActionMasked();
            if (a == MotionEvent.ACTION_MOVE) {
                for (int h = 0; h < e.getHistorySize(); h++) { dx += e.getHistoricalX(h); dy += e.getHistoricalY(h); }
                dx += e.getX(); dy += e.getY();
            } else if (a == MotionEvent.ACTION_BUTTON_PRESS) {
                int b = e.getActionButton();
                if (b == MotionEvent.BUTTON_PRIMARY) botao = 1;
                else if (b == MotionEvent.BUTTON_SECONDARY) botao = 2;
            } else if (a == MotionEvent.ACTION_SCROLL) {
                roda += e.getAxisValue(MotionEvent.AXIS_VSCROLL) > 0 ? -1 : 1;
            }
            if (!pendente) { pendente = true; web.postDelayed(this, 8); }
        }
        return true;
    }

    @Override
    public void run() {
        float x, y; int b, r;
        synchronized (this) { x = dx; y = dy; b = botao; r = roda; dx = 0; dy = 0; botao = 0; roda = 0; pendente = false; }
        web.evaluateJavascript("window.Jogo&&Jogo.mouseCap&&Jogo.mouseCap(" + x + "," + y + "," + b + "," + r + ")", null);
    }
}
