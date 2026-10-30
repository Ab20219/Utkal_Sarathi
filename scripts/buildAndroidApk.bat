@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   UtkalSarathi Android Build Tool (Capacitor + Gradle)
echo ========================================================

set "BUILD_TARGET=%~1"
if "%BUILD_TARGET%"=="" set "BUILD_TARGET=all"

if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot" (
        set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot"
    )
)
if "%ANDROID_HOME%"=="" (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    )
)

set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [*] Target Mode : %BUILD_TARGET%
echo [*] JAVA_HOME   : %JAVA_HOME%
echo [*] ANDROID_HOME: %ANDROID_HOME%

echo.
echo [1/4] Building latest web bundle via Vite...
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Web build failed.
    exit /b %errorlevel%
)

echo.
echo [2/4] Syncing web bundle to Android native Capacitor assets...
call npx.cmd cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed.
    exit /b %errorlevel%
)

cd android

if /i "%BUILD_TARGET%"=="debug" (
    echo.
    echo [3/4] Compiling Debug APK via Gradle...
    call gradlew.bat assembleDebug
) else if /i "%BUILD_TARGET%"=="release" (
    echo.
    echo [3/4] Compiling Signed Release APK & Google Play App Bundle...
    call gradlew.bat assembleRelease bundleRelease
) else (
    echo.
    echo [3/4] Compiling Debug APK, Signed Release APK, & Google Play App Bundle...
    call gradlew.bat assembleDebug assembleRelease bundleRelease
)

if %errorlevel% neq 0 (
    echo [ERROR] Gradle build failed.
    cd ..
    exit /b %errorlevel%
)
cd ..

echo.
echo [4/4] Copying build artifacts to root distribution folders...

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "UtkalSarathi-debug.apk" >nul
    copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "public\UtkalSarathi-debug.apk" >nul
    copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "dist\UtkalSarathi-debug.apk" >nul
    copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "..\UtkalSarathi-debug.apk" >nul
    echo  - UtkalSarathi-debug.apk (Ready for Android phone installation)
)

if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy /y "android\app\build\outputs\apk\release\app-release.apk" "UtkalSarathi-release.apk" >nul
    copy /y "android\app\build\outputs\apk\release\app-release.apk" "public\UtkalSarathi-release.apk" >nul
    copy /y "android\app\build\outputs\apk\release\app-release.apk" "dist\UtkalSarathi-release.apk" >nul
    copy /y "android\app\build\outputs\apk\release\app-release.apk" "..\UtkalSarathi-release.apk" >nul
    echo  - UtkalSarathi-release.apk (Cryptographically signed release APK)
)

if exist "android\app\build\outputs\bundle\release\app-release.aab" (
    copy /y "android\app\build\outputs\bundle\release\app-release.aab" "UtkalSarathi-release.aab" >nul
    copy /y "android\app\build\outputs\bundle\release\app-release.aab" "..\UtkalSarathi-release.aab" >nul
    echo  - UtkalSarathi-release.aab (Google Play Console publishing bundle)
)

echo.
echo ========================================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo ========================================================
