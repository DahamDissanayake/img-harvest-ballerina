@echo off
cd /d "%~dp0.."

echo ==========================================
echo Restarting Backend Server (Ballerina)
echo ==========================================

echo Stopping existing backend server on port 9090...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr \:9090') DO (
  if not "%%T"=="0" (
    echo Killing process %%T
    TaskKill /F /PID %%T >NUL 2>&1
  )
)

timeout /t 2 >NUL

echo Starting Backend Server...
start "Backend" cmd /k "cd backend\image_service && bal run"
