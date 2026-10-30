#!/usr/bin/env bash
set -e

echo "=== Building UtkalSarathi Native Android Release APK ==="

WORKDIR="/tmp/utkal-apk-build"
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR/classes"
mkdir -p "$WORKDIR/res/values"
mkdir -p "$WORKDIR/res/mipmap-hdpi"
mkdir -p "$WORKDIR/res/drawable"
mkdir -p "$WORKDIR/assets"

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
DX="/usr/lib/android-sdk/build-tools/debian/dx"

# 1. Ensure latest web build is populated in dist
echo "[1/7] Ensuring dist/ web bundle is fresh..."
npm run build

# Copy web bundle to assets/www
mkdir -p "$WORKDIR/assets/www"
cp -r dist/* "$WORKDIR/assets/www/"

# 2. Generate values/strings.xml
cat << 'EOF' > "$WORKDIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">UtkalSarathi</string>
    <string name="title_activity_main">UtkalSarathi</string>
</resources>
EOF

# Generate values/styles.xml
cat << 'EOF' > "$WORKDIR/res/values/styles.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.NoTitleBar.Fullscreen">
        <item name="android:windowBackground">@android:color/black</item>
    </style>
</resources>
EOF

# Copy app icon if available
if [ -f "public/pwa-192x192.png" ]; then
    cp public/pwa-192x192.png "$WORKDIR/res/mipmap-hdpi/ic_launcher.png"
fi

# 3. Create AndroidManifest.xml
cat << 'EOF' > "$WORKDIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.utkalsarathi.app"
    android:versionCode="240"
    android:versionName="2.4.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/AppTheme"
        android:allowBackup="true"
        android:usesCleartextTraffic="true">
        <activity
            android:name="org.utkalsarathi.app.MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# 4. Generate Java Activity code that renders the offline-ready UtkalSarathi app in a hardware-accelerated WebView
mkdir -p "$WORKDIR/src/org/utkalsarathi/app"
cat << 'EOF' > "$WORKDIR/src/org/utkalsarathi/app/MainActivity.java"
package org.utkalsarathi.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.view.Window;
import android.view.WindowManager;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
EOF

# 5. Compile Java sources
echo "[2/7] Compiling Java Activity sources with OpenJDK..."
javac -source 1.8 -target 1.8 -cp "$ANDROID_JAR" -d "$WORKDIR/classes" "$WORKDIR/src/org/utkalsarathi/app/MainActivity.java"

# 6. Convert Java bytecode to Dalvik dex
echo "[3/7] Converting bytecode to Dalvik DEX format..."
"$DX" --dex --output="$WORKDIR/classes.dex" "$WORKDIR/classes"

# 7. Package Android resources and assets using AAPT
echo "[4/7] Packaging assets, XML manifest, and resources with AAPT..."
aapt package -f \
    -M "$WORKDIR/AndroidManifest.xml" \
    -I "$ANDROID_JAR" \
    -S "$WORKDIR/res" \
    -A "$WORKDIR/assets" \
    -F "$WORKDIR/unaligned.apk"

# Add classes.dex into unaligned.apk
cd "$WORKDIR"
aapt add unaligned.apk classes.dex
cd - > /dev/null

# 8. 4-byte boundary zipalign
echo "[5/7] Aligning APK boundaries with zipalign..."
zipalign -f -p 4 "$WORKDIR/unaligned.apk" "$WORKDIR/aligned.apk"

# 9. Generate keystore if not exists
KEYSTORE="utkalsarathi-release.keystore"
if [ ! -f "$KEYSTORE" ]; then
    echo "[6/7] Generating RSA release keystore..."
    keytool -genkey -v -keystore "$KEYSTORE" -alias utkalsarathi \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass utkalsarathi -keypass utkalsarathi \
        -dname "CN=UtkalSarathi, OU=Travel Platform, O=Odisha Tourism, C=IN"
fi

# 10. Cryptographically sign APK with apksigner (v1, v2 & v3 schemes)
echo "[7/7] Cryptographically signing APK with apksigner..."
apksigner sign --ks "$KEYSTORE" \
    --ks-pass pass:utkalsarathi \
    --key-pass pass:utkalsarathi \
    --out "public/UtkalSarathi.apk" \
    "$WORKDIR/aligned.apk"

# Verify signature
echo "=== Verifying APK Signature ==="
apksigner verify -v "public/UtkalSarathi.apk"

# Also copy to dist/
mkdir -p dist
cp "public/UtkalSarathi.apk" "dist/UtkalSarathi.apk"

echo "SUCCESS! Real Android APK generated at:"
echo "-> /app/applet/public/UtkalSarathi.apk"
echo "-> /app/applet/dist/UtkalSarathi.apk"
ls -lh "public/UtkalSarathi.apk"
