package com.utkalsarathi.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Android 12+ / AndroidX Core Splashscreen must be initialized BEFORE super.onCreate()
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.setBackgroundColor(Color.parseColor("#0c0a09"));

            WebSettings settings = webView.getSettings();
            // Allow seamless Odia/Hindi neural TTS playback & multi-segment Utkal Katha narration
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setDomStorageEnabled(true);
            settings.setGeolocationEnabled(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(false);
            // Respect system font scaling up to 115% without breaking compact phone navigation bars
            if (settings.getTextZoom() > 115) {
                settings.setTextZoom(115);
            }
        }
    }
}
