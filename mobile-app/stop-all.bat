@echo off
echo ============================================
echo   AquaVision - Stop All Services
echo ============================================
echo.

echo Stopping Ngrok...
powershell -Command "Stop-Process -Name 'ngrok' -Force -ErrorAction SilentlyContinue"

echo Stopping Python Backend...
:: This will find the python process running main.py and kill it safely
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'python' -and $_.CommandLine -match 'main\.py' } | Invoke-CimMethod -MethodName Terminate | Out-Null"

echo.
echo All background services have been stopped!
pause
