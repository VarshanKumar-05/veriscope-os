@echo off
title Veriscope OS Launcher
echo =========================================
echo  Launching Veriscope OS Workspace
echo =========================================

echo [1/2] Starting Backend Server (Port 5000)...
start powershell -NoExit -Command "cd server; npm run dev"

echo [2/2] Starting Frontend Client (Port 5173)...
start powershell -NoExit -Command "cd client; npm run dev"

echo -----------------------------------------
echo Both processes launched.
echo Access Frontend at: http://localhost:5173
echo Access Backend API at: http://localhost:5000
echo =========================================
pause
