#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Auto-detect JDK 21 if not already in JAVA_HOME
if [ -z "${JAVA_HOME:-}" ] && [ -d "/opt/jdk21" ]; then
  export JAVA_HOME="/opt/jdk21"
fi

# Auto-detect Android SDK if not already in ANDROID_HOME / ANDROID_SDK_ROOT
if [ -z "${ANDROID_HOME:-}" ]; then
  if [ -n "${ANDROID_SDK_ROOT:-}" ]; then
    export ANDROID_HOME="$ANDROID_SDK_ROOT"
  elif [ -d "/opt/android-sdk" ]; then
    export ANDROID_HOME="/opt/android-sdk"
  elif [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
  elif [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  fi
fi

if [ -n "${JAVA_HOME:-}" ]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi
if [ -n "${ANDROID_HOME:-}" ]; then
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
fi

# Ensure production Cloud Run backend URL is baked in as public API origin (never exposes GEMINI_API_KEY)
export APP_URL="${APP_URL:-https://ais-pre-a7pwyloaohkzv3vmswlqbs-776144599923.asia-northeast1.run.app}"

echo "==> [1/5] Building UtkalSarathi production web bundle..."
npm run build

echo "==> [2/5] Syncing web bundle & Capacitor v8 plugins to Android project..."
npx cap sync android

if [ -n "${ANDROID_HOME:-}" ]; then
  printf "sdk.dir=%s\n" "$ANDROID_HOME" > "$ROOT_DIR/android/local.properties"
fi

KEYSTORE_PATH="$ROOT_DIR/android/app/utkalsarathi-release.keystore"
if [ ! -f "$KEYSTORE_PATH" ]; then
  echo "==> [3/5] Generating release signing keystore (gitignored)..."
  keytool -genkeypair -v \
    -keystore "$KEYSTORE_PATH" \
    -alias "${UTKALSARATHI_KEY_ALIAS:-utkalsarathi}" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "${UTKALSARATHI_KS_PASS:-utkalsarathi2026}" \
    -keypass "${UTKALSARATHI_KEY_PASS:-utkalsarathi2026}" \
    -dname "CN=UtkalSarathi Odisha Tourism, OU=Mobile Engineering, O=UtkalSarathi, L=Bhubaneswar, ST=Odisha, C=IN"
else
  echo "==> [3/5] Using existing release signing keystore..."
fi

echo "==> [4/5] Compiling signed Android Release & Debug APKs with Gradle..."
chmod +x "$ROOT_DIR/android/gradlew"
(
  cd "$ROOT_DIR/android"
  ./gradlew assembleRelease assembleDebug --no-daemon
)

RELEASE_APK="$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"
mkdir -p "$ROOT_DIR/releases"
cp "$RELEASE_APK" "$ROOT_DIR/releases/UtkalSarathi.apk"
cp "$RELEASE_APK" "$ROOT_DIR/android/app/build/outputs/apk/release/UtkalSarathi.apk"

echo "==> [5/5] Verifying signed APK..."
APKSIGNER_BIN=""
if [ -n "${ANDROID_HOME:-}" ] && [ -d "$ANDROID_HOME/build-tools" ]; then
  APKSIGNER_BIN="$(find "$ANDROID_HOME/build-tools" -name apksigner | sort -V | tail -n 1 || true)"
fi

if [ -n "$APKSIGNER_BIN" ]; then
  "$APKSIGNER_BIN" verify --verbose "$ROOT_DIR/releases/UtkalSarathi.apk" | head -n 12
fi

ls -lh "$ROOT_DIR/releases/UtkalSarathi.apk"
echo "SUCCESS: Installable APK ready at releases/UtkalSarathi.apk (and served at /downloads/UtkalSarathi.apk)"
