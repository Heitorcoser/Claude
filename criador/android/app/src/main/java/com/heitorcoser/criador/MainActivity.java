package com.heitorcoser.criador;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

// O Criador de Batalhas roda dentro de um WebView (pasta www).
// Aqui ficam só as coisas que o navegador sozinho não faz no Android:
// escolher foto da galeria, copiar e compartilhar o código da batalha.
public class MainActivity extends Activity {
    private static final int PEDIR_FOTO = 7;
    private WebView web;
    private ValueCallback<Uri[]> fotoCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // batalhas salvas (localStorage)
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fotoCallback != null) fotoCallback.onReceiveValue(null);
                fotoCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("image/*");
                try { startActivityForResult(Intent.createChooser(i, "Escolha uma foto"), PEDIR_FOTO); }
                catch (Exception e) { fotoCallback = null; return false; }
                return true;
            }
        });
        web.addJavascriptInterface(new Ponte(), "CriadorNativo");
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req != PEDIR_FOTO || fotoCallback == null) return;
        Uri u = (res == RESULT_OK && data != null) ? data.getData() : null;
        fotoCallback.onReceiveValue(u != null ? new Uri[]{u} : null);
        fotoCallback = null;
    }

    class Ponte {
        @JavascriptInterface
        public void copiar(String texto) {
            runOnUiThread(() -> {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                cm.setPrimaryClip(ClipData.newPlainText("batalha", texto));
                Toast.makeText(MainActivity.this, "Código copiado!", Toast.LENGTH_SHORT).show();
            });
        }

        @JavascriptInterface
        public void compartilhar(String texto, String titulo) {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_TEXT, texto);
                startActivity(Intent.createChooser(i, "Mandar batalha: " + titulo));
            });
        }
    }

    // Botão "voltar": no jogo funciona como o B; fora do jogo, volta pra lista.
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(function(){if(document.body.classList.contains('play')){Input.press('b');setTimeout(function(){Input.release('b')},60);return 'j'}if(App._modal){App.closeModal();return 'm'}if(!document.getElementById('editor').hidden){App.saveNow();App.home();return 'e'}return 'h'})()",
            r -> { if ("\"h\"".equals(r)) finish(); });
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.evaluateJavascript("Sfx.stopMusic && Sfx.stopMusic(); App.saveNow && App.b && App.saveNow();", null);
        web.onPause();
    }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onSaveInstanceState(Bundle outState) { super.onSaveInstanceState(outState); web.saveState(outState); }
}
