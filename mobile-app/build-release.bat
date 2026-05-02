@echo off
echo ============================================
echo   AquaVision - Clean Build Script
echo ============================================

set NODE_OPTIONS=--max-old-space-size=8192

echo.
echo [1/7] Cleaning prebuild...
call npx expo prebuild --clean

echo.
echo [2/7] Restoring local.properties (Android SDK)...
(echo sdk.dir=C:/Users/Admin/AppData/Local/Android/Sdk) > android\local.properties

echo.
echo [3/7] Patching gradle.properties (JDK 17 + ARM only)...
powershell -Command "(Get-Content android\gradle.properties) -replace '^org\.gradle\.jvmargs=.*','org.gradle.jvmargs=-Xmx6144m -XX:MaxMetaspaceSize=1024m' | Set-Content android\gradle.properties"
powershell -Command "$f='android\gradle.properties'; $c=Get-Content $f; $out=@(); foreach($line in $c){ $out+=$line; if($line -match '^org\.gradle\.jvmargs='){ $out+='org.gradle.java.home=C:/Program Files/Microsoft/jdk-17.0.18.8-hotspot' }}; $out | Set-Content $f"
powershell -Command "(Get-Content android\gradle.properties) -replace 'reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64','reactNativeArchitectures=armeabi-v7a,arm64-v8a' | Set-Content android\gradle.properties"

echo.
echo [4/7] Copying ONNX model and WebView HTML into android assets...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
copy /Y "assets\best.onnx" "android\app\src\main\assets\best.onnx"
copy /Y "assets\webview.html" "android\app\src\main\assets\webview.html"

echo.
echo [5/7] Stopping old Gradle daemons...
call android\gradlew.bat --stop 2>nul

echo.
echo [6/7] Building release APK...
call npx expo run:android --variant release

echo.
echo ============================================
echo   Build complete!
echo   APK: android\app\build\outputs\apk\release\app-release.apk
echo ============================================
pause
