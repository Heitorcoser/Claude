package com.heitor.baldibeta;

import android.content.res.AssetManager;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;

// Servidor HTTP mínimo que entrega os arquivos do jogo (pasta assets do APK) só para o próprio celular.
// Assim o jogo roda no WebView igual a um site: texturas, sons e dados carregam sem bloqueio de file://.
public class Servidor extends Thread {
    private final AssetManager assets;
    private final ServerSocket socket;

    public Servidor(AssetManager assets) throws Exception {
        this.assets = assets;
        this.socket = new ServerSocket(0, 50, InetAddress.getByName("127.0.0.1"));
        setDaemon(true);
    }

    public int porta() {
        return socket.getLocalPort();
    }

    @Override
    public void run() {
        while (!socket.isClosed()) {
            try {
                new Atendente(this, socket.accept()).start();
            } catch (Exception e) {
                return;
            }
        }
    }

    private static String tipo(String p) {
        if (p.endsWith(".html")) return "text/html; charset=utf-8";
        if (p.endsWith(".js")) return "text/javascript; charset=utf-8";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".mp3")) return "audio/mpeg";
        if (p.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    // uma linha de execução por pedido (classe com nome: o d8 desta versão quebra com classe anônima)
    static class Atendente extends Thread {
        private final Servidor s;
        private final Socket c;

        Atendente(Servidor s, Socket c) {
            this.s = s;
            this.c = c;
        }

        @Override
        public void run() {
            s.atende(c);
        }
    }

    void atende(Socket c) {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(c.getInputStream()));
            String linha = in.readLine();
            OutputStream out = c.getOutputStream();
            if (linha == null) { c.close(); return; }
            String[] partes = linha.split(" ");
            String caminho = partes.length > 1 ? partes[1] : "/";
            int q = caminho.indexOf('?');
            if (q >= 0) caminho = caminho.substring(0, q);
            caminho = URLDecoder.decode(caminho, "UTF-8");
            if (caminho.equals("/")) caminho = "/index.html";
            if (caminho.contains("..")) caminho = "/index.html";
            try {
                InputStream a = assets.open("jogo" + caminho);
                java.io.ByteArrayOutputStream buf = new java.io.ByteArrayOutputStream();
                byte[] b = new byte[16384];
                int n;
                while ((n = a.read(b)) > 0) buf.write(b, 0, n);
                a.close();
                byte[] dados = buf.toByteArray();
                String cab = "HTTP/1.1 200 OK\r\nContent-Type: " + tipo(caminho) + "\r\nContent-Length: " + dados.length
                        + "\r\nCache-Control: max-age=3600\r\nConnection: close\r\n\r\n";
                out.write(cab.getBytes("UTF-8"));
                out.write(dados);
            } catch (Exception e) {
                out.write("HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n".getBytes("UTF-8"));
            }
            out.flush();
            c.close();
        } catch (Exception e) {
            try { c.close(); } catch (Exception x) { }
        }
    }
}
