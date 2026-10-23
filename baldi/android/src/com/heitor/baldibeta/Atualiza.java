package com.heitor.baldibeta;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;

// Atualização: baixa o APK novo (o Android mostra o progresso nas notificações) e abre o instalador
public class Atualiza extends BroadcastReceiver {
    private final Activity act;
    private long id = -1;

    public Atualiza(Activity act) { this.act = act; }

    public void baixa(String url) {
        try {
            DownloadManager dm = (DownloadManager) act.getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
            r.setTitle("Baldi's Modded: nova versão");
            r.setMimeType("application/vnd.android.package-archive");
            r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationInExternalFilesDir(act, Environment.DIRECTORY_DOWNLOADS, "BaldiModded-" + System.currentTimeMillis() + ".apk");
            IntentFilter f = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
            if (Build.VERSION.SDK_INT >= 33) act.registerReceiver(this, f, Context.RECEIVER_EXPORTED);
            else act.registerReceiver(this, f);
            id = dm.enqueue(r);
        } catch (Exception e) {
            // sem o gerenciador de downloads: abre o link no navegador
            act.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        }
    }

    @Override
    public void onReceive(Context c, Intent i) {
        if (i.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -2) != id) return;
        try { act.unregisterReceiver(this); } catch (Exception e) { }
        DownloadManager dm = (DownloadManager) act.getSystemService(Context.DOWNLOAD_SERVICE);
        Uri apk = dm.getUriForDownloadedFile(id);
        if (apk == null) return;
        Intent inst = new Intent(Intent.ACTION_VIEW);
        inst.setDataAndType(apk, "application/vnd.android.package-archive");
        inst.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        act.startActivity(inst);
    }
}
