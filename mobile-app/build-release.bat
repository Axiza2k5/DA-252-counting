@echo off
echo ============================================
echo   AquaVision - Clean Build Script
echo ============================================

echo.
echo [1/5] Cleaning prebuild...
call npx expo prebuild --clean

echo.
echo [2/5] Restoring local.properties (Android SDK)...
(echo sdk.dir=C\:\Users\Admin\AppData\Local\Android\Sdk) > android\local.properties

echo.
echo [3/5] Patching gradle.properties (JDK 17 + ARM only)...
REM Add JDK 17 path on a new line after jvmargs
powershell -Command "$f='android\gradle.properties'; $c=Get-Content $f; $out=@(); foreach($line in $c){ $out+=$line; if($line -match '^org\.gradle\.jvmargs='){ $out+='org.gradle.java.home=C:/Program Files/Android/Android Studio/jbr' }}; $out | Set-Content $f"
REM Limit to ARM architectures only
powershell -Command "(Get-Content android\gradle.properties) -replace 'reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64','reactNativeArchitectures=armeabi-v7a,arm64-v8a' | Set-Content android\gradle.properties"

echo.
echo [4/5] Stopping old Gradle daemons...
call android\gradlew.bat --stop 2>nul

echo.
echo [5/5] Building release APK...
call npx expo run:android --variant release

echo.
echo ============================================
echo   Build complete!
echo   APK: android\app\build\outputs\apk\release\app-release.apk
echo ============================================
pause
