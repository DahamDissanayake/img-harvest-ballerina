@echo off
cd /d "%~dp0.."

echo ==========================================
echo Starting Development Servers
echo ==========================================

echo Starting Backend Server (Ballerina)...
start "Backend" cmd /k "cd backend\image_service && bal run"

echo Starting Frontend Server (Next.js)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting in new windows.
