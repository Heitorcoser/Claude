package com.heitor.baldibeta;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends Activity {
    private WebView web;
    private Servidor servidor;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.addJavascriptInterface(new Ponte(this, web), "Android");
        setContentView(web);
        telaCheia();
        try {
            servidor = new Servidor(getAssets());
            servidor.start();
            web.loadUrl("http://127.0.0.1:" + servidor.porta() + "/index.html");
        } catch (Exception e) {
            web.loadData("Erro ao iniciar: " + e, "text/plain", "utf-8");
        }
    }

    private void telaCheia() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean foco) {
        super.onWindowFocusChanged(foco);
        if (foco) telaCheia();
    }

    @Override
    public void onBackPressed() {
        // o botão voltar pausa o jogo em vez de fechar o app
        web.evaluateJavascript("window.Jogo && Jogo.G && !Jogo.G.fim ? (document.getElementById('bPausa').dispatchEvent(new PointerEvent('pointerdown')), 1) : 0", null);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        web.evaluateJavascript("window.Jogo && Jogo.atualizaTitulo && !Jogo.G && Jogo.atualizaTitulo()", null);
    }
}
