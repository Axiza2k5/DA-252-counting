@echo off
echo ============================================
echo   AquaVision - Hidden Runner
echo ============================================
echo.

:: Step 1: Start Backend (Hidden)
echo [1/3] Starting Backend Server in background...
powershell -Command "Start-Process -FilePath 'python' -ArgumentList 'main.py' -WorkingDirectory 'c:\counting\backend' -WindowStyle Hidden"
timeout /t 3 /nobreak >nul

:: Step 2: Start Ngrok (Hidden)
echo [2/3] Starting Ngrok Tunnel in background...
powershell -Command "Start-Process -FilePath 'ngrok' -ArgumentList 'http 8000' -WindowStyle Hidden"
timeout /t 5 /nobreak >nul

:: Step 3: Get Ngrok URL and update .env
echo [3/3] Fetching Ngrok URL...
powershell -Command "$r = Invoke-RestMethod -Uri 'http://127.0.0.1:4040/api/tunnels'; $url = ($r.tunnels | Where-Object { $_.proto -eq 'https' } | Select-Object -First 1).public_url; if($url) { Set-Content -Path '.env' -Value ('EXPO_PUBLIC_API_URL=' + $url); Set-Content -Path '..\frontend\.env' -Value ('VITE_API_URL=' + $url); Write-Host ''; Write-Host '  Ngrok URL: ' $url -ForegroundColor Green; Write-Host '  .env updated for both Mobile and Frontend!' -ForegroundColor Green } else { Write-Host '  Could not get Ngrok URL' -ForegroundColor Red }"

echo.
echo ============================================
echo   All services are running silently!
echo   Run 'stop-all.bat' when you want to stop them.
echo ============================================
echo.
pause
