package com.floppa.hello;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private int clicks = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        final TextView text = new TextView(this);
        text.setText("Olá do Floppa!");
        text.setTextSize(24);
        Button button = new Button(this);
        button.setText("Clique");
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                text.setText("Cliques: " + (++clicks));
            }
        });
        layout.addView(text);
        layout.addView(button);
        setContentView(layout);
    }
}
